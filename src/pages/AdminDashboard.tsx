import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AdminModuleFullEditor } from '../components/admin/AdminModuleFullEditor';
import { AdminCurriculumSyllabusEditor } from '../components/admin/AdminCurriculumSyllabusEditor';
import { AdminEvaluationEditor } from '../components/admin/AdminEvaluationEditor';
import { AdminWhatsappAutomationPanel } from '../components/admin/AdminWhatsappAutomationPanel';
import { AcademicAnnouncement, UserRole, FaqItem, UserProfile } from '../types';
import {
  getDatabaseStatus,
  getActiveSupabaseConfig,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_CONFIG_CHANGED_EVENT
} from '../lib/supabase';
import { pushCurriculumSeedToSupabase, SyncSeedResult } from '../lib/supabaseSync';
import {
  broadcastWhatsappReminders,
  buildMaterialReminderMessage,
  buildWhatsappWaMeLink,
  isValidWhatsappPhone
} from '../lib/whatsappReminder';
import {
  Shield,
  Award,
  CheckCircle,
  Save,
  Check,
  RefreshCw,
  Plus,
  Database,
  Download,
  Server,
  Edit,
  MessageSquare,
  MessageCircle,
  Send,
  Eye,
  EyeOff,
  Search,
  AlertTriangle,
  Key,
  Globe,
  Lock,
  Megaphone,
  Upload,
  Trash2,
  CloudUpload,
  UserPlus,
  BookMarked,
  ClipboardCheck,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

const DEFAULT_FAQ_TEMPLATES: FaqItem[] = [
  {
    id: 'faq_1',
    q: 'Apa itu Akademik Healing Qur’ani dan bagaimana metode belajarnya?',
    a: 'Akademik Healing Qur’ani adalah platform bimbingan belajar Islam terstruktur selama 90 hari. Menggabungkan kajian keilmuan syar’i (Al-Qur’an, Hadis, Fikih, Sirah, Tafsir, Muamalah, Tazkiyatun Nafs) dengan pembinaan hati agar setiap ilmu yang dipelajari bermuara pada ketenangan jiwa dan pengamalan nyata.'
  },
  {
    id: 'faq_2',
    q: 'Bagaimana jadwal pembukaan materi harian pukul 00.00 WIB bekerja?',
    a: 'Setiap hari pembelajaran baru dibuka secara otomatis pada pukul 00.00 WIB sesuai tanggal mulai belajar peserta. Materi hari mendatang tetap terkunci sebelum waktunya agar peserta mempelajari modul secara bertahap dan istiqamah.'
  },
  {
    id: 'faq_3',
    q: 'Bagaimana sistem evaluasi dan aturan poin setiap soal (Harian, Pekanan, Bulanan, Akhir)?',
    a: 'Terdapat 4 tingkat evaluasi: Evaluasi Harian, Evaluasi Pekanan, Evaluasi Bulanan, dan Evaluasi Akhir. Setiap soal pilihan ganda (A, B, C, D) memiliki aturan: Jawaban Benar bernilai 2 poin dan Jawaban Salah bernilai 1 poin.'
  },
  {
    id: 'faq_4',
    q: 'Kapan sertifikat penyelesaian dapat diterbitkan?',
    a: 'Sertifikat resmi dapat diterbitkan apabila peserta telah terdaftar resmi, menuntaskan minimal 85% materi harian, menyelesaikan Evaluasi Bulanan (1–3) dan Evaluasi Akhir, serta meraih nilai akhir minimal 75%.'
  },
  {
    id: 'faq_5',
    q: 'Apa yang harus dilakukan jika berhalangan mengikuti evaluasi tepat waktu?',
    a: 'Peserta dapat mengajukan Evaluasi Susulan melalui menu Evaluasi > Evaluasi Susulan dengan menyertakan alasan yang jelas. Pengelola akademik akan meninjau dan memproses persetujuan permohonan Anda.'
  }
];

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    allUsers,
    userProgress,
    certificates,
    certificateAuditLogs,
    issueCertificate,
    revokeCertificate,
    restoreCertificate,
    systemSettings,
    updateSystemSettings,
    updateRemedialStatus,
    calculateStudentGrades,
    setCurrentNav,
    resolvedModules,
    resolvedSubjects,
    resolvedSyllabus,
    gradeReflectionEssay,
    addUserByAdmin,
    editUserByAdmin,
    deleteUserByAdmin,
    addAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    restoreFromBackup,
    getBackupPayload,
    whatsappGatewayStatus,
    getMaxUnlockedDay
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'peserta'
    | 'editor_materi'
    | 'kurikulum_silabus'
    | 'bank_soal'
    | 'koreksi_esai'
    | 'remedial'
    | 'sertifikat'
    | 'whatsapp_auto'
    | 'pengaturan'
    | 'database'
  >('peserta');

  // User Role Filter, Edit & Delete State
  const [userRoleFilter, setUserRoleFilter] = useState<'semua' | 'peserta' | 'pengelola'>('semua');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserCity, setEditUserCity] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('peserta');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  // Essay Grading State & Controlled Drafts
  const [essayDrafts, setEssayDrafts] = useState<Record<string, { score?: number; feedback?: string }>>({});
  const [gradingSuccessNotice, setGradingSuccessNotice] = useState(false);

  // Student Detail Inspection Modal
  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null);

  // Settings & Identity edit form
  const [dailyWeight, setDailyWeight] = useState(systemSettings.weights.daily);
  const [monthlyWeight, setMonthlyWeight] = useState(systemSettings.weights.monthly);
  const [finalWeight, setFinalWeight] = useState(systemSettings.weights.final);
  const [passingScore, setPassingScore] = useState(systemSettings.passingGrade);
  const [quoteText, setQuoteText] = useState(systemSettings.motivationQuote.text);
  const [quoteSource, setQuoteSource] = useState(systemSettings.motivationQuote.source);
  const [institutionNameInput, setInstitutionNameInput] = useState(systemSettings.institutionName);
  const [signatoryNameInput, setSignatoryNameInput] = useState(systemSettings.signatoryName);
  const [signatoryTitleInput, setSignatoryTitleInput] = useState(systemSettings.signatoryTitle);
  const [logoUrlInput, setLogoUrlInput] = useState(systemSettings.logoUrl || '');
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [dailyUnlockEnabled, setDailyUnlockEnabled] = useState(
    systemSettings.dailyUnlockScheduleEnabled !== false
  );
  const [teacherPreviewEnabled, setTeacherPreviewEnabled] = useState(
    systemSettings.allowTeacherPreviewAllDays !== false
  );
  const [academyWhatsappInput, setAcademyWhatsappInput] = useState(
    systemSettings.academyWhatsappNumber || '6281234567890'
  );
  const [contactEmailInput, setContactEmailInput] = useState(
    systemSettings.contactEmail || 'akademik@healingqurani.id'
  );
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // FAQ CMS State
  const [faqQInput, setFaqQInput] = useState('');
  const [faqAInput, setFaqAInput] = useState('');
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  // Sync settings form when systemSettings updates
  React.useEffect(() => {
    setDailyWeight(systemSettings.weights.daily);
    setMonthlyWeight(systemSettings.weights.monthly);
    setFinalWeight(systemSettings.weights.final);
    setPassingScore(systemSettings.passingGrade);
    setQuoteText(systemSettings.motivationQuote.text);
    setQuoteSource(systemSettings.motivationQuote.source);
    setInstitutionNameInput(systemSettings.institutionName);
    setSignatoryNameInput(systemSettings.signatoryName);
    setSignatoryTitleInput(systemSettings.signatoryTitle);
    setLogoUrlInput(systemSettings.logoUrl || '');
    setDailyUnlockEnabled(systemSettings.dailyUnlockScheduleEnabled !== false);
    setTeacherPreviewEnabled(systemSettings.allowTeacherPreviewAllDays !== false);
    setAcademyWhatsappInput(systemSettings.academyWhatsappNumber || '6281234567890');
    setContactEmailInput(systemSettings.contactEmail || 'akademik@healingqurani.id');
  }, [systemSettings]);

  // WhatsApp broadcast reminder state
  const [broadcastingWa, setBroadcastingWa] = useState(false);
  const [broadcastNotice, setBroadcastNotice] = useState<{
    type: 'ok' | 'err' | 'info';
    text: string;
  } | null>(null);

  // Announcement creation state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<AcademicAnnouncement['category']>('Umum');

  // Add Participant state
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCity, setNewUserCity] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('peserta');
  const [addedUserNotice, setAddedUserNotice] = useState<string | null>(null);
  const [addedUserError, setAddedUserError] = useState<string | null>(null);

  // Cloud Seed Sync & Backup Restore state
  const [seedSyncing, setSeedSyncing] = useState(false);
  const [seedSyncResult, setSeedSyncResult] = useState<SyncSeedResult | null>(null);
  const [restoreNotice, setRestoreNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // In-App Supabase Configuration State
  const [currentDbStatus, setCurrentDbStatus] = useState(() => getDatabaseStatus());
  const activeCfg = getActiveSupabaseConfig();
  const [supabaseInputUrl, setSupabaseInputUrl] = useState(activeCfg.url);
  const [supabaseInputKey, setSupabaseInputKey] = useState(activeCfg.anonKey);
  const [showAnonKeyText, setShowAnonKeyText] = useState(false);
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseStatusNotice, setSupabaseStatusNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    latencyMs?: number;
  } | null>(null);

  React.useEffect(() => {
    const handleDbChange = () => {
      setCurrentDbStatus(getDatabaseStatus());
      const cfg = getActiveSupabaseConfig();
      setSupabaseInputUrl(cfg.url);
      setSupabaseInputKey(cfg.anonKey);
    };
    window.addEventListener(SUPABASE_CONFIG_CHANGED_EVENT, handleDbChange);
    return () => window.removeEventListener(SUPABASE_CONFIG_CHANGED_EVENT, handleDbChange);
  }, []);

  const handleApplySupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseTesting(true);
    setSupabaseStatusNotice(null);

    const res = await saveCustomSupabaseConfig(supabaseInputUrl, supabaseInputKey);
    setSupabaseTesting(false);
    setCurrentDbStatus(getDatabaseStatus());

    if (res.success) {
      setSupabaseStatusNotice({
        type: 'success',
        message: res.message,
        latencyMs: res.latencyMs
      });
    } else {
      setSupabaseStatusNotice({
        type: 'error',
        message: res.message
      });
    }
  };

  const handleTestSupabaseLive = async () => {
    setSupabaseTesting(true);
    setSupabaseStatusNotice(null);

    const res = await testSupabaseConnection(supabaseInputUrl, supabaseInputKey);
    setSupabaseTesting(false);

    setSupabaseStatusNotice({
      type: res.success ? 'success' : 'error',
      message: res.message,
      latencyMs: res.latencyMs
    });
  };

  const handleClearSupabaseConfig = () => {
    clearCustomSupabaseConfig();
    setSupabaseInputUrl('');
    setSupabaseInputKey('');
    setCurrentDbStatus(getDatabaseStatus());
    setSupabaseStatusNotice({
      type: 'info',
      message: 'Kredensial Supabase kustom telah dihapus. Sistem beralih ke penyimpanan lokal browser yang aman.'
    });
  };

  // Revoke modal state
  const [revokeModalUser, setRevokeModalUser] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const participants = allUsers.filter((u) => u.role === 'peserta');
  const issuedCertsCount = Object.values(certificates).filter(
    (c) => c.status === 'Sertifikat Diterbitkan'
  ).length;

  // Aggregate all remedial requests
  const allRemedials = Object.values(userProgress).flatMap(
    (p) => p.remedialRequests || []
  );

  // Collect all student reflection essays across users
  const studentReflectionList = useMemo(() => {
    const list: {
      userId: string;
      userName: string;
      day: number;
      submission: string;
      review?: { score: number; feedback: string; reviewedBy: string; reviewedAt?: string };
    }[] = [];

    participants.forEach((user) => {
      const prog = userProgress[user.id];
      if (prog && prog.dailyResults) {
        Object.entries(prog.dailyResults).forEach(([dayStr, res]) => {
          if (res.reflectionSubmission) {
            list.push({
              userId: user.id,
              userName: user.name,
              day: Number(dayStr),
              submission: res.reflectionSubmission,
              review: res.essayReview
            });
          }
        });
      }
    });

    return list;
  }, [participants, userProgress]);

  // Filtering & Search states
  const [participantSearch, setParticipantSearch] = useState('');
  const [essayFilter, setEssayFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [essaySearch, setEssaySearch] = useState('');
  const [auditLogSearch, setAuditLogSearch] = useState('');

  const QUICK_FEEDBACKS = [
    "Masya Allah, tadabur yang sangat mendalam dan relevan dengan pengamalan sehari-hari.",
    "Alhamdulillah, pemahaman syar'i telah tepat. Terus istiqamah dalam muraqabatullah.",
    "Nasihat: Perkuat niat ikhlas lillahi ta'ala dan istiqamahkan wirid zikir pagi-petang.",
    "Refleksi yang menyentuh hati. Semoga Allah karuniakan kelapangan dada dan keteguhan amal shalih."
  ];

  const handleExportStudentsCSV = () => {
    const headers = [
      'No',
      'Nama Peserta',
      'Nomor Peserta',
      'Email',
      'Domisili',
      'Kontak',
      'Selesai Modul',
      'Persentase',
      'Rata Harian',
      'Rata Bulanan',
      'Nilai Akhir',
      'Predikat',
      'Status Sertifikat'
    ];
    const rows = participants.map((p, idx) => {
      const g = calculateStudentGrades(p.id);
      const prog = userProgress[p.id];
      const completed = prog ? prog.completedDays.length : 0;
      return [
        idx + 1,
        `"${p.name}"`,
        p.studentNumber,
        p.email,
        `"${p.city}"`,
        `"${p.phone}"`,
        completed,
        `${g.completionPercentage}%`,
        g.dailyAverage ?? '—',
        g.monthlyAverage ?? '—',
        g.finalGrade ?? '—',
        `"${g.predicate}"`,
        `"${g.certificateStatus}"`
      ].join(',');
    });
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `rekap_nilai_peserta_ahq_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCertAuditCSV = () => {
    const headers = [
      'ID Audit',
      'Aksi',
      'No Sertifikat',
      'ID Peserta',
      'Nama Peserta',
      'Alasan / Catatan',
      'Petugas / Otoritas',
      'Waktu Pencatatan'
    ];
    const rows = certificateAuditLogs.map((log) =>
      [
        log.id,
        log.action,
        log.certificateNumber,
        log.participantId,
        `"${log.participantName}"`,
        `"${log.reason || ''}"`,
        `"${log.executedBy}"`,
        log.timestamp
      ].join(',')
    );
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `audit_trail_sertifikat_ahq_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered accounts (peserta / pengelola / semua)
  const filteredAccounts = useMemo(() => {
    const baseList =
      userRoleFilter === 'peserta'
        ? allUsers.filter((u) => u.role === 'peserta')
        : userRoleFilter === 'pengelola'
        ? allUsers.filter((u) => u.role === 'admin' || u.role === 'pengajar')
        : allUsers;

    if (!participantSearch.trim()) return baseList;
    const q = participantSearch.toLowerCase();
    return baseList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.studentNumber.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
    );
  }, [allUsers, userRoleFilter, participantSearch]);

  // Filtered essays
  const filteredEssays = useMemo(() => {
    return studentReflectionList.filter((item) => {
      if (essayFilter === 'pending' && item.review) return false;
      if (essayFilter === 'graded' && !item.review) return false;
      if (essaySearch.trim()) {
        const q = essaySearch.toLowerCase();
        const matchName = item.userName.toLowerCase().includes(q);
        const matchDay = `hari ${item.day}`.includes(q) || `${item.day}` === q;
        const matchSubm = item.submission.toLowerCase().includes(q);
        return matchName || matchDay || matchSubm;
      }
      return true;
    });
  }, [studentReflectionList, essayFilter, essaySearch]);

  const handleOpenEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserPhone(user.phone);
    setEditUserCity(user.city);
    setEditUserRole(user.role);
    setEditUserPassword('');
  };

  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editUserName.trim() || !editUserEmail.trim()) return;
    editUserByAdmin(
      editingUser.id,
      {
        name: editUserName.trim(),
        email: editUserEmail.trim(),
        phone: editUserPhone.trim(),
        city: editUserCity.trim(),
        role: editUserRole
      },
      editUserPassword.trim() || undefined
    );
    setAddedUserNotice(`Data akun "${editUserName.trim()}" berhasil diperbarui.`);
    setEditingUser(null);
    setTimeout(() => setAddedUserNotice(null), 4000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    const totalW = Number(dailyWeight) + Number(monthlyWeight) + Number(finalWeight);
    if (totalW !== 100) {
      setSettingsError(`Total bobot penilaian harus tepat 100% (saat ini ${totalW}%).`);
      return;
    }

    updateSystemSettings({
      weights: {
        daily: Number(dailyWeight),
        monthly: Number(monthlyWeight),
        final: Number(finalWeight)
      },
      passingGrade: Number(passingScore),
      motivationQuote: {
        text: quoteText,
        source: quoteSource
      },
      institutionName: institutionNameInput,
      signatoryName: signatoryNameInput,
      signatoryTitle: signatoryTitleInput,
      logoUrl: logoUrlInput.trim(),
      dailyUnlockScheduleEnabled: dailyUnlockEnabled,
      allowTeacherPreviewAllDays: teacherPreviewEnabled,
      academyWhatsappNumber: academyWhatsappInput.trim() || '6281234567890',
      contactEmail: contactEmailInput.trim() || 'akademik@healingqurani.id'
    });
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  const activeFaqList: FaqItem[] = systemSettings.customFaqs || DEFAULT_FAQ_TEMPLATES;

  const handleSaveFaqItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQInput.trim() || !faqAInput.trim()) return;
    const baseList = systemSettings.customFaqs ? [...systemSettings.customFaqs] : [...DEFAULT_FAQ_TEMPLATES];
    if (editingFaqId) {
      const updated = baseList.map((f) =>
        f.id === editingFaqId ? { ...f, q: faqQInput.trim(), a: faqAInput.trim() } : f
      );
      updateSystemSettings({ customFaqs: updated });
      setEditingFaqId(null);
    } else {
      const newItem: FaqItem = {
        id: `faq_${Date.now()}`,
        q: faqQInput.trim(),
        a: faqAInput.trim()
      };
      updateSystemSettings({ customFaqs: [...baseList, newItem] });
    }
    setFaqQInput('');
    setFaqAInput('');
  };

  const handleDeleteFaqItem = (faqId: string) => {
    const baseList = systemSettings.customFaqs ? [...systemSettings.customFaqs] : [...DEFAULT_FAQ_TEMPLATES];
    updateSystemSettings({ customFaqs: baseList.filter((f) => f.id !== faqId) });
    if (editingFaqId === faqId) {
      setEditingFaqId(null);
      setFaqQInput('');
      setFaqAInput('');
    }
  };

  const getParticipantNextModuleInfo = (studentId: string) => {
    const maxUnlocked = getMaxUnlockedDay(studentId);
    const prog = userProgress[studentId];
    const completed = prog?.completedDays || [];
    let targetDay = maxUnlocked;
    for (let d = 1; d <= maxUnlocked; d++) {
      if (!completed.includes(d)) {
        targetDay = d;
        break;
      }
    }
    const activeMod = resolvedModules.find((m) => m.day === targetDay) || resolvedModules[0];
    const subj = resolvedSubjects.find((s) => s.id === activeMod.subjectId) || resolvedSubjects[0];
    return { targetDay, activeMod, subj };
  };

  const handleBroadcastWhatsappReminders = async () => {
    setBroadcastNotice(null);
    const recipients = participants
      .filter((p) => isValidWhatsappPhone(p.phone))
      .map((p) => {
        const { targetDay, activeMod, subj } = getParticipantNextModuleInfo(p.id);
        const quranRef = activeMod.quranVerse
          ? `QS. ${activeMod.quranVerse.surah}: ${activeMod.quranVerse.ayah}`
          : undefined;
        const message = buildMaterialReminderMessage({
          participantName: p.name,
          day: targetDay,
          moduleTitle: activeMod.title,
          subjectName: subj.name,
          learningGoal: activeMod.learningGoal,
          quranRef,
          includeEvaluationNote: true
        });
        return {
          phone: p.phone,
          message,
          participantName: p.name,
          day: targetDay
        };
      });

    if (recipients.length === 0) {
      setBroadcastNotice({
        type: 'info',
        text: 'Belum ada peserta dengan nomor WhatsApp valid untuk dikirimi pengingat.'
      });
      return;
    }

    setBroadcastingWa(true);
    const res = await broadcastWhatsappReminders(recipients);
    setBroadcastingWa(false);

    if (!res.configured) {
      setBroadcastNotice({
        type: 'info',
        text: 'Gateway WhatsApp server belum aktif. Pengelola tetap dapat mengirim pengingat satu per satu melalui tombol "WA" di tabel peserta.'
      });
    } else if (res.success) {
      setBroadcastNotice({
        type: 'ok',
        text: `Berhasil mengirim ${res.sentCount} pengingat WhatsApp peserta${res.failedCount > 0 ? ` (${res.failedCount} gagal)` : ''}.`
      });
    } else {
      setBroadcastNotice({
        type: 'err',
        text: res.error || 'Gagal mengirim pengingat massal melalui gateway WhatsApp.'
      });
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setLogoUploadError('Ukuran berkas logo maksimal 1 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrlInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    addAnnouncement(annTitle.trim(), annContent.trim(), annCategory);
    setAnnTitle('');
    setAnnContent('');
  };

  const handleCreateUserByAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    setAddedUserError(null);
    setAddedUserNotice(null);
    try {
      const created = await addUserByAdmin(
        newUserName.trim(),
        newUserEmail.trim(),
        newUserPhone.trim(),
        newUserCity.trim(),
        newUserRole,
        newUserPassword.trim() || undefined
      );
      setAddedUserNotice(`Akun ${created.name} (${created.studentNumber}) berhasil ditambahkan.`);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserCity('');
      setNewUserPassword('');
      setShowAddUserForm(false);
      setTimeout(() => setAddedUserNotice(null), 4000);
    } catch (err: any) {
      setAddedUserError(err?.message || 'Gagal menambahkan akun baru.');
    }
  };

  const handlePushSeedToSupabase = async () => {
    setSeedSyncing(true);
    setSeedSyncResult(null);
    const res = await pushCurriculumSeedToSupabase({
      subjects: resolvedSubjects,
      syllabus: resolvedSyllabus,
      modules: resolvedModules,
      announcements: systemSettings.announcements || []
    });
    setSeedSyncResult(res);
    setSeedSyncing(false);
  };

  const handleRestoreBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        const ok = restoreFromBackup(parsed);
        if (ok) {
          setRestoreNotice({
            type: 'success',
            message: 'Data cadangan (backup JSON) berhasil dipulihkan ke sistem!'
          });
        } else {
          setRestoreNotice({
            type: 'error',
            message: 'Format file JSON cadangan tidak valid.'
          });
        }
      } catch {
        setRestoreNotice({
          type: 'error',
          message: 'Gagal membaca file JSON. Pastikan berkas tidak rusak.'
        });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRevoke = () => {
    if (!revokeModalUser || !revokeReason.trim()) return;
    revokeCertificate(revokeModalUser, revokeReason);
    setRevokeModalUser(null);
    setRevokeReason('');
  };

  if (currentUser.role !== 'admin' && currentUser.role !== 'pengajar') {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white rounded-2xl border border-red-200 p-8 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Akses Terbatas Pengelola</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Halaman Kelola Akademik hanya dapat diakses oleh Administrator atau Pengajar yang telah masuk menggunakan akun resmi pengelola.
        </p>
        <button
          onClick={() => setCurrentNav('beranda')}
          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Admin Header */}
      <div className="bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#046C4E] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-700/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-400/30">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>Panel Manajemen Pembelajaran Digital (LMS Syar'i)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Dashboard Administrator & Pengajar Akademik
            </h1>
            <p className="text-xs sm:text-sm text-emerald-50">
              Kelola 90 modul kurikulum, pemeriksaan esai refleksi, persetujuan evaluasi susulan, verifikasi sertifikat, dan pengaturan bobot.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-100">Pengguna Aktif:</span>
            <span className="text-xs font-bold bg-emerald-950/65 px-3 py-1.5 rounded-lg border border-emerald-400/30 capitalize">
              {currentUser.name} ({currentUser.role})
            </span>
          </div>
        </div>

        {/* Global KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-500/30 text-xs">
          <div className="bg-emerald-950/55 p-3 rounded-xl border border-emerald-400/25">
            <span className="text-emerald-100 block text-[11px]">Total Peserta Aktif</span>
            <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
              {participants.length}
            </div>
          </div>

          <div className="bg-emerald-950/55 p-3 rounded-xl border border-emerald-400/25">
            <span className="text-emerald-100 block text-[11px]">Refleksi Esai Masuk</span>
            <div className="text-xl font-bold font-mono text-emerald-200 mt-0.5">
              {studentReflectionList.length} Jawaban
            </div>
          </div>

          <div className="bg-emerald-950/55 p-3 rounded-xl border border-emerald-400/25">
            <span className="text-emerald-100 block text-[11px]">Sertifikat Diterbitkan</span>
            <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
              {issuedCertsCount}
            </div>
          </div>

          <div className="bg-emerald-950/55 p-3 rounded-xl border border-emerald-400/25">
            <span className="text-emerald-100 block text-[11px]">Permohonan Susulan</span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {allRemedials.filter((r) => r.status === 'Menunggu Persetujuan').length} Pending
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tab Selector */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveAdminTab('peserta')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeAdminTab === 'peserta'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Akun & Peserta ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('editor_materi')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeAdminTab === 'editor_materi'
              ? 'bg-emerald-800 text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Editor Modul ({resolvedModules.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('kurikulum_silabus')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeAdminTab === 'kurikulum_silabus'
              ? 'bg-emerald-800 text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>Kurikulum & Silabus</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('bank_soal')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeAdminTab === 'bank_soal'
              ? 'bg-emerald-800 text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Bank Soal Evaluasi</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('koreksi_esai')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeAdminTab === 'koreksi_esai'
              ? 'bg-emerald-800 text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Koreksi Refleksi ({studentReflectionList.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('remedial')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeAdminTab === 'remedial'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Susulan
        </button>
        <button
          onClick={() => setActiveAdminTab('sertifikat')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeAdminTab === 'sertifikat'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sertifikat
        </button>
        <button
          onClick={() => setActiveAdminTab('whatsapp_auto')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeAdminTab === 'whatsapp_auto'
              ? 'bg-emerald-800 text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Otomatisasi WhatsApp</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('pengaturan')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeAdminTab === 'pengaturan'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pengaturan, Pengumuman & FAQ
        </button>
        <button
          onClick={() => setActiveAdminTab('database')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeAdminTab === 'database'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          <span>Cloud & Cadangan</span>
        </button>
      </div>

      {/* TAB 1: MANAJEMEN PESERTA */}
      {activeAdminTab === 'peserta' && (
        <div className="bg-white rounded-xl border border-emerald-900/15 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Peserta Program Bimbingan Belajar Islam 90 Hari
              </h3>
              <p className="text-xs text-slate-500">
                Pilih peserta untuk memeriksa perkembangan belajar, transkrip, atau beralih tampilan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddUserForm(!showAddUserForm)}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-800/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Peserta / Pengajar</span>
              </button>
              <button
                type="button"
                onClick={handleExportStudentsCSV}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Rekap Nilai (CSV)</span>
              </button>
            </div>
          </div>

          {addedUserNotice && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              <span>{addedUserNotice}</span>
            </div>
          )}

          {addedUserError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-700" />
              <span>{addedUserError}</span>
            </div>
          )}

          {showAddUserForm && (
            <form
              onSubmit={handleCreateUserByAdmin}
              className="p-4 rounded-xl bg-[#F6FBF8] border border-emerald-900/20 space-y-3 text-xs"
            >
              <div className="font-bold text-slate-900">Tambah Akun Peserta / Staf Pengajar Baru</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
                <input
                  type="text"
                  placeholder="WhatsApp (+62...)"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <input
                  type="text"
                  placeholder="Kota Domisili"
                  value={newUserCity}
                  onChange={(e) => setNewUserCity(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <input
                  type="password"
                  placeholder="Kata Sandi Awal (min 6 karakter)"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-semibold"
                >
                  <option value="peserta">Peserta</option>
                  <option value="pengajar">Pengajar</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserForm(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg cursor-pointer"
                >
                  Simpan Akun Baru
                </button>
              </div>
            </form>
          )}

          {/* WhatsApp Participant Reminder Dispatch Strip */}
          <div className="p-4 rounded-xl bg-[#F3F8F5] border border-emerald-900/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span>Pengingat Materi Harian Peserta via WhatsApp</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800">
                  {whatsappGatewayStatus.configured
                    ? `Gateway Otomatis: ${whatsappGatewayStatus.provider}`
                    : 'Kirim Langsung via WA Web / wa.me'}
                </span>
              </div>
              <p className="text-slate-600">
                {participants.filter((p) => isValidWhatsappPhone(p.phone)).length} dari {participants.length} peserta memiliki nomor WhatsApp aktif. Gunakan tombol WA pada setiap baris untuk pengingat pribadi atau kirim massal bila gateway server aktif.
              </p>
              {broadcastNotice && (
                <div
                  className={`mt-2 px-3 py-2 rounded-lg border font-medium ${
                    broadcastNotice.type === 'ok'
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                      : broadcastNotice.type === 'err'
                      ? 'bg-red-100 border-red-300 text-red-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  {broadcastNotice.text}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => void handleBroadcastWhatsappReminders()}
              disabled={broadcastingWa || participants.length === 0}
              className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 disabled:opacity-45 text-white font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {broadcastingWa ? 'Mengirim Pengingat...' : 'Kirim Pengingat Massal (Gateway)'}
              </span>
            </button>
          </div>

          {/* Search & Role Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, no. akun, email, kota..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="inline-flex p-1 rounded-lg bg-slate-100 text-xs font-semibold">
              {[
                { id: 'semua', label: `Semua (${allUsers.length})` },
                { id: 'peserta', label: `Peserta (${participants.length})` },
                {
                  id: 'pengelola',
                  label: `Admin/Pengajar (${allUsers.filter((u) => u.role !== 'peserta').length})`
                }
              ].map((rf) => (
                <button
                  key={rf.id}
                  type="button"
                  onClick={() => setUserRoleFilter(rf.id as typeof userRoleFilter)}
                  className={`px-3 py-1 rounded-md cursor-pointer ${
                    userRoleFilter === rf.id ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama, Peran & No. Akun</th>
                  <th className="px-3 py-3">Domisili & Kontak</th>
                  <th className="px-3 py-3 text-center">Progres Modul</th>
                  <th className="px-3 py-3 text-right">Rata Nilai</th>
                  <th className="px-3 py-3">Status Sertifikat</th>
                  <th className="px-4 py-3 text-right">Aksi Pengelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">
                      Tidak ada akun yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((student) => {
                    const studentGrades = calculateStudentGrades(student.id);
                    const prog = userProgress[student.id];
                    const completedDays = prog ? prog.completedDays.length : 0;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{student.name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize ${
                                student.role === 'admin'
                                  ? 'bg-amber-100 text-amber-900'
                                  : student.role === 'pengajar'
                                  ? 'bg-teal-100 text-teal-900'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {student.role}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-emerald-800">
                            {student.studentNumber} · {student.email}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-slate-600">
                          <div>{student.city}</div>
                          <div className="text-[11px] text-slate-600">{student.phone}</div>
                        </td>
                        <td className="px-3 py-3.5 text-center font-mono">
                          <span className="font-bold text-slate-900">{completedDays}</span>
                          <span className="text-slate-600">/{resolvedModules.length} ({studentGrades.completionPercentage}%)</span>
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono font-bold text-emerald-900">
                          {studentGrades.finalGrade !== null
                            ? studentGrades.finalGrade
                            : (studentGrades.dailyAverage || '—')}
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              studentGrades.certificateStatus === 'Sertifikat Diterbitkan'
                                ? 'bg-emerald-100 text-emerald-800'
                                : studentGrades.certificateStatus === 'Memenuhi Syarat, Menunggu Pengesahan'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {studentGrades.certificateStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                            {isValidWhatsappPhone(student.phone) && (() => {
                              const { targetDay, activeMod, subj } = getParticipantNextModuleInfo(student.id);
                              const waMsg = buildMaterialReminderMessage({
                                participantName: student.name,
                                day: targetDay,
                                moduleTitle: activeMod.title,
                                subjectName: subj.name,
                                learningGoal: activeMod.learningGoal,
                                includeEvaluationNote: true
                              });
                              return (
                                <a
                                  href={buildWhatsappWaMeLink(student.phone, waMsg)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded inline-flex items-center gap-1"
                                  title={`Kirim pengingat materi Hari ke-${targetDay} via WhatsApp`}
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WA</span>
                                </a>
                              );
                            })()}
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(student)}
                              className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 cursor-pointer"
                              title="Edit profil / peran / kata sandi akun"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewStudentId(student.id)}
                              className="px-2 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer"
                            >
                              Detail
                            </button>
                            {student.id !== currentUser.id && (
                              confirmDeleteUserId === student.id ? (
                                <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteUserByAdmin(student.id);
                                      setConfirmDeleteUserId(null);
                                      setAddedUserNotice(`Akun "${student.name}" berhasil dihapus.`);
                                      setTimeout(() => setAddedUserNotice(null), 3500);
                                    }}
                                    className="px-1.5 py-0.5 bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteUserId(null)}
                                    className="px-1.5 py-0.5 bg-white text-slate-600 border rounded text-[10px] cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteUserId(student.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                  title="Hapus akun ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EDITOR LENGKAP 18 KOMPONEN MODUL & KUIS */}
      {activeAdminTab === 'editor_materi' && <AdminModuleFullEditor />}

      {/* TAB 2B: MANAJEMEN KURIKULUM & SILABUS */}
      {activeAdminTab === 'kurikulum_silabus' && <AdminCurriculumSyllabusEditor />}

      {/* TAB 2C: MANAJEMEN BANK SOAL EVALUASI */}
      {activeAdminTab === 'bank_soal' && <AdminEvaluationEditor />}

      {/* TAB 3: MEJA PEMERIKSAAN ESAI & REFLEKSI PESERTA (Tahap 3 & 4) */}
      {activeAdminTab === 'koreksi_esai' && (
        <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Meja Pemeriksaan & Umpan Balik Refleksi Harian Peserta
            </h3>
            <p className="text-xs text-slate-500">
              Sesuai ketentuan Bagian 13, Pengajar/Pemeriksa dapat memeriksa jawaban uraian, memberikan skor refleksi, dan masukan bimbingan ruhani.
            </p>
          </div>

          {gradingSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Nilai dan umpan balik pengajar berhasil disimpan ke profil peserta!</span>
            </div>
          )}

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Filter Status:</span>
              <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setEssayFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    essayFilter === 'all'
                      ? 'bg-emerald-800 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({studentReflectionList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEssayFilter('pending')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    essayFilter === 'pending'
                      ? 'bg-emerald-800 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum Dinilai ({studentReflectionList.filter((e) => !e.review).length})
                </button>
                <button
                  type="button"
                  onClick={() => setEssayFilter('graded')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    essayFilter === 'graded'
                      ? 'bg-emerald-800 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sudah Dinilai ({studentReflectionList.filter((e) => !!e.review).length})
                </button>
              </div>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari peserta, hari, atau kata kunci..."
                value={essaySearch}
                onChange={(e) => setEssaySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          {filteredEssays.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
              Tidak ada jawaban refleksi yang sesuai dengan kriteria filter saat ini.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEssays.map((item, idx) => (
                <div
                  key={`${item.userId}_${item.day}_${idx}`}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                    <div>
                      <strong className="text-slate-900 text-sm font-bold">{item.userName}</strong>
                      <span className="text-slate-400 mx-1.5">·</span>
                      <span className="font-semibold text-emerald-800">
                        Refleksi Hari ke-{item.day}
                      </span>
                    </div>

                    <div>
                      {item.review ? (
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                          Nilai: {item.review.score}/100 · Oleh {item.review.reviewedBy}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                          Menunggu Penilaian Pengajar
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submission Text */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-600 block uppercase">
                      Jawaban Refleksi & Muhasabah Jiwa:
                    </span>
                    <p className="text-slate-800 italic leading-relaxed">
                      "{item.submission}"
                    </p>
                  </div>

                  {/* Quick Advice Chips & Controlled Review Form */}
                  {(() => {
                    const draftKey = `${item.userId}_${item.day}`;
                    const currentDraft = essayDrafts[draftKey] || {};
                    const scoreVal = currentDraft.score ?? item.review?.score ?? 92;
                    const feedbackVal = currentDraft.feedback ?? item.review?.feedback ?? '';

                    return (
                      <>
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                            Templat Masukan Cepat Pengajar:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {QUICK_FEEDBACKS.map((qf, qfIdx) => (
                              <button
                                key={qfIdx}
                                type="button"
                                onClick={() =>
                                  setEssayDrafts((prev) => ({
                                    ...prev,
                                    [draftKey]: { ...prev[draftKey], feedback: qf }
                                  }))
                                }
                                className="px-2 py-0.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-900 text-[10px] rounded transition-colors text-left cursor-pointer"
                              >
                                "{qf.substring(0, 48)}..."
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-end">
                          <div className="w-full sm:w-28">
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                              Skor (0-100):
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={scoreVal}
                              onChange={(e) =>
                                setEssayDrafts((prev) => ({
                                  ...prev,
                                  [draftKey]: { ...prev[draftKey], score: Number(e.target.value) }
                                }))
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-center"
                            />
                          </div>

                          <div className="flex-1 w-full">
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                              Masukan / Nasihat Pengajar:
                            </label>
                            <input
                              type="text"
                              value={feedbackVal}
                              onChange={(e) =>
                                setEssayDrafts((prev) => ({
                                  ...prev,
                                  [draftKey]: { ...prev[draftKey], feedback: e.target.value }
                                }))
                              }
                              placeholder="Tulis nasihat bimbingan jiwa atau klik templat di atas..."
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              gradeReflectionEssay(
                                item.userId,
                                item.day,
                                Number(scoreVal),
                                feedbackVal.trim() || 'Masya Allah, refleksi yang sangat baik.'
                              );
                              setGradingSuccessNotice(true);
                              setTimeout(() => setGradingSuccessNotice(false), 3000);
                            }}
                            className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
                          >
                            Simpan Penilaian
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PERSETUJUAN EVALUASI SUSULAN */}
      {activeAdminTab === 'remedial' && (
        <div className="bg-white rounded-xl border border-emerald-900/15 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Persetujuan dan Jadwal Evaluasi Susulan
              </h3>
              <p className="text-xs text-slate-500">
                Verifikasi alasan peserta yang mengajukan evaluasi susulan karena kendala syar'i atau teknis.
              </p>
            </div>
          </div>

          {allRemedials.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Tidak ada permohonan evaluasi susulan saat ini.
            </div>
          ) : (
            <div className="space-y-3">
              {allRemedials.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-emerald-900/15 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 font-bold">{req.participantName}</strong>
                      <span className="text-slate-400">·</span>
                      <span className="text-emerald-800 font-semibold">{req.targetLabel}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Ditolak'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-slate-600">Alasan: "{req.reason}"</p>
                    <div className="text-[11px] text-slate-600">
                      Diajukan tanggal: {req.submittedAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'Menunggu Persetujuan' ? (
                      <>
                        <button
                          onClick={() => updateRemedialStatus(req.id, 'Disetujui', 'Disetujui oleh Mudir Akademik')}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => updateRemedialStatus(req.id, 'Ditolak', 'Alasan belum memenuhi syarat')}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                        >
                          Tolak
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">
                        {req.adminNotes || 'Diproses'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MANAJEMEN PENERBITAN SERTIFIKAT */}
      {activeAdminTab === 'sertifikat' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-emerald-900/15 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Penerbitan dan Pencabutan Sertifikat Kelulusan
                </h3>
                <p className="text-xs text-slate-500">
                  Sertifikat hanya dapat diterbitkan bagi peserta yang telah memenuhi seluruh syarat kelulusan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCertAuditCSV}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor Log Audit Sertifikat (CSV)</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {participants.map((student) => {
                const studentGrades = calculateStudentGrades(student.id);
                const cert = certificates[student.id];
                const isIssued = cert && cert.status === 'Sertifikat Diterbitkan';
                const isRevoked = cert && !!cert.revocationReason;

                return (
                  <div
                    key={student.id}
                    className="p-4 rounded-xl border border-emerald-900/15 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-bold text-sm">{student.name}</strong>
                        <span className="font-mono text-slate-500">({student.studentNumber})</span>
                        {isRevoked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            Dicabut ({cert.revokedAt || 'Tercatat'})
                          </span>
                        ) : isIssued ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Aktif & Terbit
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                            Belum Diterbitkan
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600">
                        Nilai Akhir: <strong className="font-mono">{studentGrades.finalGrade || studentGrades.dailyAverage || '—'}</strong> · Predikat: {studentGrades.predicate} · Progres: {studentGrades.completionPercentage}%
                      </div>
                      {isIssued && (
                        <div className="text-[11px] text-emerald-800 font-mono">
                          No. Sertifikat: {cert.certificateNumber} · Verifikasi: {cert.verifiedCode}
                        </div>
                      )}
                      {isRevoked && (
                        <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded border border-red-200">
                          <strong>Alasan Pencabutan:</strong> "{cert.revocationReason}" (Oleh: {cert.revokedBy || 'Mudir'})
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isRevoked ? (
                        <>
                          <button
                            type="button"
                            onClick={() => restoreCertificate(student.id)}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Pulihkan Keabsahan</span>
                          </button>
                        </>
                      ) : !isIssued ? (
                        <button
                          onClick={() => issueCertificate(student.id)}
                          className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs cursor-pointer shadow-2xs"
                        >
                          Terbitkan Sertifikat Resmi
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setPreviewStudentId(student.id)}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Rincian Data
                          </button>
                          <button
                            onClick={() => setRevokeModalUser(student.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold cursor-pointer border border-red-200"
                          >
                            Cabut Sertifikat
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AUDIT TRAIL TABLE (Bagian 12 & 14) */}
          <div className="bg-white rounded-xl border border-emerald-900/15 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Rekam Jejak Audit Sertifikat (Audit Trail Syar'i & Legal)
                </h3>
                <p className="text-xs text-slate-500">
                  Log historis setiap aksi penerbitan, pencabutan, dan pemulihan sertifikat sesuai regulasi Bagian 12.
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari no. sertifikat, nama, alasan..."
                  value={auditLogSearch}
                  onChange={(e) => setAuditLogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Waktu Pencatatan</th>
                    <th className="px-3 py-2.5">Aksi Sistem</th>
                    <th className="px-3 py-2.5">No. Sertifikat</th>
                    <th className="px-3 py-2.5">Nama Peserta</th>
                    <th className="px-4 py-2.5">Alasan / Catatan Akademik</th>
                    <th className="px-3 py-2.5">Otoritas Pelaksana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {certificateAuditLogs
                    .filter((log) => {
                      if (!auditLogSearch.trim()) return true;
                      const q = auditLogSearch.toLowerCase();
                      return (
                        log.certificateNumber.toLowerCase().includes(q) ||
                        log.participantName.toLowerCase().includes(q) ||
                        (log.reason && log.reason.toLowerCase().includes(q)) ||
                        log.executedBy.toLowerCase().includes(q)
                      );
                    })
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              log.action === 'TERBIT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.action === 'CABUT'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-900 font-bold whitespace-nowrap">
                          {log.certificateNumber}
                        </td>
                        <td className="px-3 py-2.5 font-sans font-semibold text-slate-900 whitespace-nowrap">
                          {log.participantName}
                        </td>
                        <td className="px-4 py-2.5 font-sans text-slate-600 max-w-xs break-words">
                          {log.reason || '—'}
                        </td>
                        <td className="px-3 py-2.5 font-sans text-slate-500 whitespace-nowrap">
                          {log.executedBy}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PENGATURAN BOBOT NILAI */}
      {activeAdminTab === 'pengaturan' && (
        <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Pengaturan Bobot Penilaian & Konten Sistem
            </h3>
            <p className="text-xs text-slate-500">
              Sesuai formula Bagian 9: Nilai Akhir = (Harian × % ) + (Bulanan × %) + (Akhir × %). Total bobot harus 100%.
            </p>
          </div>

          {savedSettingsNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Pengaturan sistem berhasil disimpan!</span>
            </div>
          )}

          {settingsError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{settingsError}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Bobot Evaluasi Harian (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={dailyWeight}
                  onChange={(e) => setDailyWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Bobot Evaluasi Bulanan (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={monthlyWeight}
                  onChange={(e) => setMonthlyWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Bobot Evaluasi Akhir (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={finalWeight}
                  onChange={(e) => setFinalWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <span>Total Bobot: </span>
              <strong
                className={`font-mono ${
                  Number(dailyWeight) + Number(monthlyWeight) + Number(finalWeight) === 100
                    ? 'text-emerald-700'
                    : 'text-red-600'
                }`}
              >
                {Number(dailyWeight) + Number(monthlyWeight) + Number(finalWeight)}%
              </strong>
              {Number(dailyWeight) + Number(monthlyWeight) + Number(finalWeight) !== 100 && (
                <span className="text-red-500 font-semibold">(Wajib bernilai 100%)</span>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Batas Nilai Minimal Kelulusan (Passing Grade 0–100):
              </label>
              <input
                type="number"
                min="50"
                max="90"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Teks Pesan Motivasi Beranda:
              </label>
              <textarea
                rows={2}
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Sumber Rujukan Pesan Motivasi:
              </label>
              <input
                type="text"
                value={quoteSource}
                onChange={(e) => setQuoteSource(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>

            {/* Identitas & Logo Resmi Lembaga */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                Identitas Lembaga, Penandatangan Sertifikat & Logo Resmi
              </span>

              <div className="p-4 rounded-xl border border-emerald-900/15 bg-[#F6FBF8] space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white border border-emerald-900/20 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {logoUrlInput ? (
                      <img
                        src={logoUrlInput}
                        alt="Pratinjau Logo Resmi"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-800 text-amber-300 font-arabic text-2xl font-bold flex items-center justify-center">
                        ح
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-[220px] space-y-2">
                    <label className="font-semibold text-slate-800 block">
                      Unggah Gambar Logo Resmi (PNG / JPG / SVG, maks 1 MB) atau Tempel URL:
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-800/30 rounded-lg font-semibold cursor-pointer inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Berkas Logo</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>
                      {logoUrlInput && (
                        <button
                          type="button"
                          onClick={() => setLogoUrlInput('')}
                          className="px-3 py-1.5 text-red-700 hover:bg-red-50 rounded-lg font-semibold cursor-pointer border border-red-200"
                        >
                          Reset ke Kaligrafi Default (ح)
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      placeholder="https://... (opsional URL gambar logo resmi)"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    {logoUploadError && (
                      <div className="text-[11px] text-red-700 font-semibold">{logoUploadError}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nama Penandatangan Sertifikat & Transkrip:
                    </label>
                    <input
                      type="text"
                      value={signatoryNameInput}
                      onChange={(e) => setSignatoryNameInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Jabatan Penandatangan (Mudir / Pimpinan):
                    </label>
                    <input
                      type="text"
                      value={signatoryTitleInput}
                      onChange={(e) => setSignatoryTitleInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Deskripsi Sub-Lembaga (Footer & Profil Akademik):
                  </label>
                  <input
                    type="text"
                    value={institutionNameInput}
                    onChange={(e) => setInstitutionNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nomor WhatsApp Resmi Sekretariat:
                    </label>
                    <input
                      type="tel"
                      value={academyWhatsappInput}
                      onChange={(e) => setAcademyWhatsappInput(e.target.value)}
                      placeholder="6281234567890"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Email Resmi Sekretariat / Pusat Bantuan:
                    </label>
                    <input
                      type="email"
                      value={contactEmailInput}
                      onChange={(e) => setContactEmailInput(e.target.value)}
                      placeholder="akademik@healingqurani.id"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Kebijakan Kunci Jadwal Harian Otomatis */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                Kebijakan Jadwal Harian & Akses Modul (00.00 WIB)
              </span>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={dailyUnlockEnabled}
                  onChange={(e) => setDailyUnlockEnabled(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700"
                />
                <div>
                  <div className="font-bold text-slate-800">
                    Kunci Jadwal Harian Otomatis (Dibuka Setiap Hari Pukul 00.00 WIB)
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    Ketika aktif, peserta hanya dapat membuka materi sesuai hari ke-X yang telah tiba (buka pukul 00.00 WIB). Materi hari-hari mendatang akan terkunci dan menampilkan hitung mundur waktu (countdown).
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={teacherPreviewEnabled}
                  onChange={(e) => setTeacherPreviewEnabled(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700"
                />
                <div>
                  <div className="font-bold text-slate-800">
                    Izinkan Pengajar & Admin Meninjau Seluruh 90 Hari Materi (Bypass Kunci)
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    Memudahkan staf pengajar, evaluator, dan admin untuk meninjau materi, mengedit konten, memeriksa soal evaluasi, atau simulasi kurikulum tanpa terhalang kunci harian.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Akademik</span>
              </button>
            </div>
          </form>

          {/* Manajemen Papan Pengumuman Resmi */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-emerald-800" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Manajemen Papan Pengumuman Beranda
              </h4>
            </div>

            <form onSubmit={handleAddAnnouncement} className="p-4 rounded-xl bg-[#F6FBF8] border border-emerald-900/15 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Judul Pengumuman..."
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as AcademicAnnouncement['category'])}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-semibold"
                >
                  <option value="Umum">Kategori: Umum</option>
                  <option value="Jadwal">Kategori: Jadwal</option>
                  <option value="Evaluasi">Kategori: Evaluasi</option>
                  <option value="Kajian">Kategori: Kajian</option>
                </select>
              </div>
              <textarea
                rows={2}
                placeholder="Isi pengumuman untuk peserta di halaman Beranda..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Terbitkan Pengumuman</span>
                </button>
              </div>
            </form>

            <div className="space-y-2 text-xs">
              {(systemSettings.announcements || []).map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-xl border border-emerald-900/15 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                        {ann.category}
                      </span>
                      <span className="font-bold text-slate-900">{ann.title}</span>
                    </div>
                    <p className="text-slate-600">{ann.content}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleAnnouncement(ann.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                        ann.isActive
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ann.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Hapus pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manajemen FAQ Pusat Bantuan */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-800" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Manajemen Daftar Tanya Jawab (FAQ Pusat Bantuan)
                </h4>
              </div>
              {systemSettings.customFaqs && (
                <button
                  type="button"
                  onClick={() => updateSystemSettings({ customFaqs: undefined })}
                  className="px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset FAQ Bawaan
                </button>
              )}
            </div>

            <form
              onSubmit={handleSaveFaqItem}
              className="p-4 rounded-xl bg-[#F6FBF8] border border-emerald-900/15 space-y-3 text-xs"
            >
              <input
                type="text"
                placeholder="Pertanyaan FAQ..."
                value={faqQInput}
                onChange={(e) => setFaqQInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
              <textarea
                rows={2}
                placeholder="Jawaban lengkap untuk ditampilkan kepada peserta di Pusat Bantuan..."
                value={faqAInput}
                onChange={(e) => setFaqAInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
              <div className="flex justify-end gap-2">
                {editingFaqId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaqId(null);
                      setFaqQInput('');
                      setFaqAInput('');
                    }}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingFaqId ? 'Perbarui FAQ' : 'Tambah Item FAQ'}</span>
                </button>
              </div>
            </form>

            <div className="space-y-2 text-xs">
              {activeFaqList.map((faq) => (
                <div
                  key={faq.id}
                  className="p-3 rounded-xl border border-emerald-900/15 bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">{faq.q}</div>
                    <p className="text-slate-600">{faq.a}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFaqId(faq.id);
                        setFaqQInput(faq.q);
                        setFaqAInput(faq.a);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaqItem(faq.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Hapus FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB WHATSAPP OTOMATIS (00.00 WIB & KATA HIKMAH 08.00 WIB) */}
      {activeAdminTab === 'whatsapp_auto' && <AdminWhatsappAutomationPanel />}

      {/* TAB 7: KONEKSI SUPABASE & SKEMA 20 TABEL POSTGRESQL */}
      {activeAdminTab === 'database' && (
        <div className="space-y-6">
          {/* IN-APP SUPABASE CREDENTIALS SETUP CARD (SOLUSI JIKA .ENV TIDAK BISA DI-APPLY) */}
          <div className="bg-white rounded-2xl border-2 border-emerald-800/30 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Database className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Konfigurasi Kredensial Supabase Mandiri (In-App Setup)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Masukkan URL dan Anon Key jika variabel environment <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono">VITE_SUPABASE_URL</code> dan <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono">VITE_SUPABASE_ANON_KEY</code> tidak dapat diterapkan di server hosting Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-semibold text-slate-500">Sumber Kredensial:</span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                  currentDbStatus.source === 'localStorage'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : currentDbStatus.source === 'env'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentDbStatus.source === 'localStorage'
                    ? 'In-App Storage (Browser)'
                    : currentDbStatus.source === 'env'
                    ? 'File .env'
                    : 'Lokal Offline'}
                </span>
              </div>
            </div>

            {/* Live Feedback Alert */}
            {supabaseStatusNotice && (
              <div
                className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
                  supabaseStatusNotice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : supabaseStatusNotice.type === 'error'
                    ? 'bg-red-50 text-red-900 border-red-300'
                    : 'bg-blue-50 text-blue-900 border-blue-300'
                }`}
              >
                {supabaseStatusNotice.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                ) : supabaseStatusNotice.type === 'error' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <Server className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold">
                    {supabaseStatusNotice.type === 'success'
                      ? 'Koneksi Berhasil!'
                      : supabaseStatusNotice.type === 'error'
                      ? 'Peringatan Koneksi'
                      : 'Informasi'}
                  </div>
                  <div>{supabaseStatusNotice.message}</div>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleApplySupabaseConfig} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    <span>Supabase Project URL</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-600">
                    Contoh: https://xyzprojectref.supabase.co
                  </span>
                </label>
                <input
                  type="url"
                  value={supabaseInputUrl}
                  onChange={(e) => setSupabaseInputUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
                  required
                />
                <span className="text-[11px] text-slate-600 block mt-1">
                  Ditemukan di Supabase Dashboard → Project Settings → API → Project URL.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-800 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-emerald-700" />
                    <span>Supabase Anon / Public API Key</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAnonKeyText(!showAnonKeyText)}
                    className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer flex items-center gap-1"
                  >
                    {showAnonKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showAnonKeyText ? 'Sembunyikan' : 'Tampilkan'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showAnonKeyText ? 'text' : 'password'}
                    value={supabaseInputKey}
                    onChange={(e) => setSupabaseInputKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-600 block mt-1">
                  Ditemukan di Supabase Dashboard → Project Settings → API → Project API Keys → <strong className="text-slate-600">anon</strong> (public).
                </span>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    disabled={supabaseTesting || !supabaseInputUrl.trim() || !supabaseInputKey.trim()}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    {supabaseTesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menguji & Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Terapkan & Uji Koneksi Langsung</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleTestSupabaseLive}
                    disabled={supabaseTesting || !supabaseInputUrl.trim() || !supabaseInputKey.trim()}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${supabaseTesting ? 'animate-spin' : ''}`} />
                    <span>Uji Ulang Koneksi</span>
                  </button>
                </div>

                {currentDbStatus.source === 'localStorage' && (
                  <button
                    type="button"
                    onClick={handleClearSupabaseConfig}
                    className="px-3.5 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Hapus Kredensial In-App
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Status Box */}
          <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Status Koneksi Database & Supabase Backend
                  </h3>
                  <p className="text-xs text-slate-500">
                    Arsitektur backend PostgreSQL dengan Row Level Security (RLS) dan Supabase Auth.
                  </p>
                </div>
              </div>

              <div>
                {getDatabaseStatus().isConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>Supabase Cloud Terhubung</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Database className="w-4 h-4 text-amber-700" />
                    <span>Mode Database Lokal (Offline-Safe)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-emerald-900/15 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">URL Endpoint Database:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {getDatabaseStatus().url || 'Tersimpan lokal di browser (localStorage & memory store)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lokasi Skrip SQL Migrasi:</span>
                <span className="font-mono text-emerald-800 font-bold">
                  /supabase/schema.sql (20 Tabel Lengkap)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Kebijakan Keamanan (RLS):</span>
                <span className="text-emerald-700 font-semibold">
                  Tersedia untuk Peserta, Pengajar, dan Administrator
                </span>
              </div>
            </div>

            {/* Quick Action Buttons: Cloud Sync + Backup + Restore */}
            <div className="space-y-3 pt-2">
              {seedSyncResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs border ${
                    seedSyncResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  <div className="font-bold">{seedSyncResult.message}</div>
                  {seedSyncResult.success && (
                    <div className="text-[11px] mt-1 font-mono">
                      Disinkronkan: {seedSyncResult.details.subjectsSynced} Mapel · {seedSyncResult.details.syllabusSynced} Silabus · {seedSyncResult.details.modulesSynced} Modul · {seedSyncResult.details.announcementsSynced} Pengumuman
                    </div>
                  )}
                </div>
              )}

              {restoreNotice && (
                <div
                  className={`p-3.5 rounded-xl text-xs border ${
                    restoreNotice.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  {restoreNotice.message}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePushSeedToSupabase}
                  disabled={seedSyncing || !getDatabaseStatus().isConfigured}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-45 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <CloudUpload className={`w-4 h-4 ${seedSyncing ? 'animate-pulse' : ''}`} />
                  <span>
                    {seedSyncing
                      ? 'Menyinkronkan ke Supabase...'
                      : 'Sinkronkan 7 Mapel & 90 Modul ke Supabase'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    const backupData = getBackupPayload();
                    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
                      type: 'application/json'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backup_akademik_healing_qurani_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Cadangan (Backup JSON)</span>
                </button>

                <label className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-800/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs">
                  <Upload className="w-4 h-4" />
                  <span>Pulihkan Cadangan (Restore JSON)</span>
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={handleRestoreBackupFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 20 Tables Checklist and Definition */}
          <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Struktur 20 Tabel Database PostgreSQL
              </h3>
              <p className="text-xs text-slate-500">
                Seluruh 20 tabel yang dipersyaratkan pada Bagian 14 telah didefinisikan lengkap dengan constraint dan relasi foreign key.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                { no: 1, name: 'profiles', desc: 'Identitas, peran, nomor peserta & target 90 hari' },
                { no: 2, name: 'subjects', desc: '7 Pilar mata pelajaran syar’i utama' },
                { no: 3, name: 'curriculum', desc: 'Tujuan, indikator, dan capaian kompetensi' },
                { no: 4, name: 'syllabus', desc: '90 baris silabus terstruktur berurutan' },
                { no: 5, name: 'learning_modules', desc: '18 komponen modul harian lengkap' },
                { no: 6, name: 'module_references', desc: 'Daftar kitab muktabar & referensi ilmiah' },
                { no: 7, name: 'enrollments', desc: 'Status pendaftaran program peserta' },
                { no: 8, name: 'learning_progress', desc: 'Pencatatan centang tuntas modul harian' },
                { no: 9, name: 'assessments', desc: 'Konfigurasi evaluasi harian, bulanan & akhir' },
                { no: 10, name: 'questions', desc: 'Bank soal pilihan ganda & esai' },
                { no: 11, name: 'answer_options', desc: 'Pilihan opsi jawaban soal' },
                { no: 12, name: 'assessment_attempts', desc: 'Riwayat pengerjaan ujian dan skor' },
                { no: 13, name: 'student_answers', desc: 'Jawaban detail per butir soal' },
                { no: 14, name: 'grades', desc: 'Kalkulasi nilai akhir (30% + 30% + 40%)' },
                { no: 15, name: 'remedial_requests', desc: 'Permohonan evaluasi susulan dan jadwal' },
                { no: 16, name: 'transcripts', desc: 'Dokumen transkrip resmi siap cetak' },
                { no: 17, name: 'certificates', desc: 'Sertifikat kelulusan & nomor unik' },
                { no: 18, name: 'certificate_verifications', desc: 'Catatan log audit pemindaian QR Code' },
                { no: 19, name: 'announcements', desc: 'Pesan motivasi dan pengumuman' },
                { no: 20, name: 'audit_logs', desc: 'Audit trail pengubahan nilai & sertifikat' }
              ].map((tbl) => (
                <div
                  key={tbl.no}
                  className="p-3 rounded-xl border border-emerald-900/15 bg-slate-50/60 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-900 text-xs">
                      {tbl.no}. {tbl.name}
                    </span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{tbl.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT INSPECTION MODAL */}
      {previewStudentId && (() => {
        const student = allUsers.find((u) => u.id === previewStudentId);
        if (!student) return null;
        const sProg = userProgress[student.id];
        const sGrades = calculateStudentGrades(student.id);
        const sCert = certificates[student.id];
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                    Rincian Capaian Peserta
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
                </div>
                <button
                  onClick={() => setPreviewStudentId(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-500 block">Nomor Peserta:</span>
                  <strong className="font-mono text-emerald-900">{student.studentNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Domisili & Kontak:</span>
                  <strong>{student.city || '—'} · {student.phone || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Modul Tuntas:</span>
                  <strong className="font-mono">{sProg?.completedDays?.length || 0} / 90 ({sGrades.completionPercentage}%)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Evaluasi Pekanan:</span>
                  <strong className="font-mono">{sGrades.weeklyCount} / 13 Pekan</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Rata-rata Harian / Akhir:</span>
                  <strong className="font-mono">
                    {sGrades.dailyAverage ?? '—'}% / {sGrades.finalGrade ?? '—'}%
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Status Sertifikat:</span>
                  <strong className="text-emerald-900">{sCert?.certificateNumber || sGrades.certificateStatus}</strong>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditedUser}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                  Edit Data Akun
                </span>
                <h3 className="text-base font-bold text-slate-900">{editingUser.studentNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alamat Email:</label>
                <input
                  type="email"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp:</label>
                  <input
                    type="text"
                    value={editUserPhone}
                    onChange={(e) => setEditUserPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kota Domisili:</label>
                  <input
                    type="text"
                    value={editUserCity}
                    onChange={(e) => setEditUserCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Peran Akun:</label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                    disabled={editingUser.id === currentUser.id}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold disabled:opacity-60"
                  >
                    <option value="peserta">Peserta</option>
                    <option value="pengajar">Pengajar</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Reset Sandi (Opsional):
                  </label>
                  <input
                    type="password"
                    value={editUserPassword}
                    onChange={(e) => setEditUserPassword(e.target.value)}
                    placeholder="Min 6 karakter"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REVOKE CERTIFICATE MODAL */}
      {revokeModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              Konfirmasi Pencabutan Sertifikat
            </h3>
            <p className="text-slate-600">
              Sesuai ketentuan Bagian 12, pencabutan sertifikat harus disertai alasan yang jelas dan akan dicatat dalam audit log sistem.
            </p>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Alasan Pencabutan Sertifikat:
              </label>
              <textarea
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Contoh: Ditemukan ketidaksesuaian data evaluasi atau permintaan peserta..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRevokeModalUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={!revokeReason.trim()}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white font-bold rounded-lg cursor-pointer"
              >
                Cabut Sertifikat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
