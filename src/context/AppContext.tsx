import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  UserProfile,
  UserRole,
  UserProgress,
  SystemSettings,
  CertificateRecord,
  CertificateAuditLog,
  RemedialRequest,
  DailyQuizResult,
  SubjectId,
  SubjectInfo,
  SyllabusRow,
  ComprehensiveAssessment,
  LearningModule,
  AcademicAnnouncement,
  WhatsAppReminderSettings
} from '../types';
import { getAllModules } from '../data/modules';
import { SUBJECTS_DATA } from '../data/subjects';
import { SYLLABUS_DATA } from '../data/syllabus';
import {
  WEEKLY_ASSESSMENTS,
  MONTHLY_ASSESSMENTS,
  FINAL_ASSESSMENT
} from '../data/evaluations';
import {
  WhatsappGatewayStatus,
  SendWhatsappResponse,
  DailyWisdomEntry,
  fetchWhatsappGatewayStatus,
  sendWhatsappNotification,
  buildMaterialReminderMessage,
  buildUnlockedMaterialMessage,
  buildDailyWisdomMessage,
  getDailyWisdomForDay,
  buildWhatsappWaMeLink,
  getWibTimeHHMM,
  isValidWhatsappPhone,
  syncWhatsappSubscribersToServer
} from '../lib/whatsappReminder';
import {
  supabase,
  isSupabaseConfigured,
  SUPABASE_CONFIG_CHANGED_EVENT
} from '../lib/supabase';
import {
  fetchOrCreateSupabaseProfile,
  fetchLearningProgressFromSupabase,
  syncProfileToSupabase,
  syncLearningProgressToSupabase,
  syncRemedialRequestToSupabase,
  updateRemedialStatusInSupabase,
  syncCertificateAndAuditToSupabase,
  fetchCmsFromSupabase,
  saveCmsToSupabase,
  fetchProgressSnapshotFromSupabase,
  saveProgressSnapshotToSupabase,
  fetchAllStaffDataFromSupabase
} from '../lib/supabaseSync';
import {
  fetchPortalBootstrap,
  setupAdminViaServer,
  registerUserViaServer,
  loginUserViaServer,
  changePasswordViaServer,
  syncUserProfileToServer,
  syncUserProgressToServer,
  upsertCertificateToServer,
  syncCmsToServer,
  manageUserViaServer,
  syncEssayGradeToServer,
  syncRemedialStatusToServer,
  restoreBackupToServer
} from '../lib/portalApi';

export const DEFAULT_WHATSAPP_REMINDER: WhatsAppReminderSettings = {
  enabled: true,
  autoSendOnUnlock: true,
  wisdomReminderEnabled: true,
  preferredTimeWIB: '00:00',
  wisdomTimeWIB: '08:00',
  remindUnreadOnly: false,
  remindEvaluationDue: true,
  browserNotificationEnabled: false
};

export interface DueWhatsappReminderNotice {
  type: 'unlock_materi' | 'kata_hikmah_0800';
  day: number;
  moduleTitle: string;
  subjectName: string;
  waMeUrl: string;
  sentAutomatically: boolean;
  message: string;
  dateWib: string;
  wisdom?: DailyWisdomEntry;
}

export const getWibDateString = (offsetDays = 0): string => {
  const targetMs = Date.now() + offsetDays * 24 * 60 * 60 * 1000;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(targetMs));
};

export const createGuestUser = (): UserProfile => ({
  id: 'usr_guest',
  name: 'Peserta Tamu',
  email: '',
  studentNumber: 'TAMU-AHQ',
  avatar:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  role: 'peserta',
  registrationDate: getWibDateString(0),
  targetDate: getWibDateString(90),
  phone: '',
  city: 'Indonesia',
  isGuest: true
});

const EMPTY_PROGRESS = (day = 1): UserProgress => ({
  completedDays: [],
  lastAccessedDay: day,
  dailyResults: {},
  weeklyResults: {},
  monthlyResults: {},
  remedialRequests: []
});

// Deterministic lightweight credential digest for offline/local-persistence mode
function hashCredential(email: string, password: string): string {
  const normalized = `${email.trim().toLowerCase()}::ahq_salt_2026::${password}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16)}_${(h1 >>> 0).toString(16)}`;
}

// One-time cleanup of legacy preview/demo seeded records if present in browser storage
function cleanupLegacyDemoStorageOnce() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('ahq_prod_clean_v1') === 'true') return;

  try {
    const savedUsersRaw = localStorage.getItem('ahq_all_users');
    if (savedUsersRaw) {
      const savedUsers: UserProfile[] = JSON.parse(savedUsersRaw);
      const demoIds = new Set(['usr_student_1', 'usr_student_2', 'usr_admin_1', 'usr_teacher_1']);
      const isOnlyLegacyDemo =
        Array.isArray(savedUsers) &&
        savedUsers.length > 0 &&
        savedUsers.every((u) => demoIds.has(u.id));

      if (isOnlyLegacyDemo) {
        localStorage.removeItem('ahq_current_user');
        localStorage.removeItem('ahq_all_users');
        localStorage.removeItem('ahq_progress');
        localStorage.removeItem('ahq_certificates');
        localStorage.removeItem('ahq_cert_audit_logs');
      } else {
        const curRaw = localStorage.getItem('ahq_current_user');
        if (curRaw) {
          const cur: UserProfile = JSON.parse(curRaw);
          if (demoIds.has(cur.id)) {
            localStorage.removeItem('ahq_current_user');
          }
        }
      }
    }
  } catch {
    // Ignore malformed legacy storage
  }

  localStorage.setItem('ahq_prod_clean_v1', 'true');
}

cleanupLegacyDemoStorageOnce();

export const INITIAL_SETTINGS: SystemSettings = {
  weights: {
    daily: 30,
    monthly: 30,
    final: 40
  },
  passingGrade: 75,
  minCompletionRate: 85,
  allowSelfRegistration: true,
  dailyUnlockScheduleEnabled: true,
  unlockTimeWIB: '00:00',
  allowTeacherPreviewAllDays: true,
  academyWhatsappNumber: '6281234567890',
  contactEmail: 'akademik@healingqurani.id',
  motivationQuote: {
    text: 'Barang siapa yang menempuh jalan untuk mencari ilmu, maka Allah akan mudahkan baginya jalan menuju Surga.',
    source: 'HR. Muslim no. 2699 dari Abu Hurairah radhiyallahu ‘anhu'
  },
  signatoryName: 'Ustadz Dr. H. Abdurrahman Al-Fatih, M.Ag.',
  signatoryTitle: 'Mudir Akademik Healing Qur’ani',
  institutionName: 'Pusat Bimbingan Belajar Islam Terpadu & Terapi Spiritual Qur’ani',
  logoUrl: '',
  announcements: [
    {
      id: 'ann_1',
      title: 'Pembukaan Akses Materi Harian Otomatis Pukul 00.00 WIB',
      content:
        'Materi pembelajaran baru terbuka secara bertahap setiap hari pukul 00.00 WIB sesuai tanggal pendaftaran peserta agar proses tadabur dan pengamalan berjalan teratur.',
      category: 'Jadwal',
      publishedAt: getWibDateString(0),
      author: 'Pengelola Akademik',
      isActive: true
    },
    {
      id: 'ann_2',
      title: 'Ketentuan Penilaian Evaluasi & Refleksi Jiwa',
      content:
        'Setiap butir soal evaluasi (Harian, Pekanan, Bulanan, dan Akhir) bernilai 2 poin untuk jawaban benar dan 1 poin untuk jawaban salah. Pastikan menuliskan muhasabah diri pada setiap akhir modul.',
      category: 'Evaluasi',
      publishedAt: getWibDateString(0),
      author: 'Dewan Pengajar',
      isActive: true
    }
  ]
};

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  setCurrentUser: (user: UserProfile) => void;
  currentNav: string;
  setCurrentNav: (nav: string) => void;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  userProgress: Record<string, UserProgress>;
  currentProgress: UserProgress;
  markDayComplete: (day: number) => void;
  submitDailyQuiz: (
    day: number,
    score: number,
    answers: Record<string, any>,
    earnedPoints?: number,
    maxPoints?: number
  ) => void;
  submitWeeklyAssessment: (
    week: number,
    score: number,
    earnedPoints?: number,
    maxPoints?: number
  ) => void;
  submitMonthlyAssessment: (
    month: 1 | 2 | 3,
    score: number,
    earnedPoints?: number,
    maxPoints?: number
  ) => void;
  submitFinalAssessment: (
    score: number,
    subjectScores: Record<SubjectId, number>,
    earnedPoints?: number,
    maxPoints?: number
  ) => void;
  submitRemedialRequest: (
    assessmentType: 'harian' | 'pekanan' | 'bulanan' | 'akhir',
    targetLabel: string,
    reason: string
  ) => void;
  updateRemedialStatus: (
    requestId: string,
    status: RemedialRequest['status'],
    adminNotes?: string
  ) => void;
  moduleCustomizations: Record<number, Partial<LearningModule>>;
  extraModules: LearningModule[];
  resolvedModules: LearningModule[];
  updateModuleContent: (day: number, updatedFields: Partial<LearningModule>) => void;
  resetModuleContent: (day: number) => void;
  addExtraModule: (module: LearningModule) => void;
  deleteExtraModule: (day: number) => void;
  resolvedSubjects: SubjectInfo[];
  upsertSubject: (subject: SubjectInfo) => void;
  deleteSubject: (subjectId: string) => void;
  resetSubjectsToDefault: () => void;
  resolvedSyllabus: SyllabusRow[];
  updateSyllabusRow: (day: number, updatedFields: Partial<SyllabusRow>) => void;
  addSyllabusRow: (row: SyllabusRow) => void;
  deleteExtraSyllabusRow: (day: number) => void;
  resolvedWeeklyAssessments: Record<number, ComprehensiveAssessment>;
  resolvedMonthlyAssessments: Record<number, ComprehensiveAssessment>;
  resolvedFinalAssessment: ComprehensiveAssessment;
  upsertAssessment: (assessment: ComprehensiveAssessment) => void;
  deleteAssessment: (id: string) => void;
  resetAssessment: (id: string) => void;
  submitReflectionEssay: (day: number, essayText: string) => void;
  gradeReflectionEssay: (userId: string, day: number, score: number, feedback: string) => void;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  certificates: Record<string, CertificateRecord>;
  certificateAuditLogs: CertificateAuditLog[];
  issueCertificate: (participantId: string) => void;
  revokeCertificate: (participantId: string, reason: string) => void;
  restoreCertificate: (participantId: string) => void;
  registerNewUser: (
    name: string,
    email: string,
    phone: string,
    city: string,
    password?: string
  ) => Promise<UserProfile>;
  verifyLocalLogin: (email: string, password: string) => Promise<UserProfile>;
  hasAnyAdmin: () => boolean;
  setupInitialAdmin: (
    name: string,
    email: string,
    phone: string,
    city: string,
    password: string
  ) => Promise<UserProfile>;
  changeLocalPassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
  updateCurrentUserProfile: (
    updates: Partial<
      Pick<UserProfile, 'name' | 'phone' | 'city' | 'avatar' | 'whatsappReminder'>
    >
  ) => void;
  whatsappGatewayStatus: WhatsappGatewayStatus;
  updateWhatsappReminderSettings: (settings: Partial<WhatsAppReminderSettings>) => void;
  dueWhatsappReminder: DueWhatsappReminderNotice | null;
  dismissDueWhatsappReminder: () => void;
  triggerWhatsappReminderNow: (day?: number) => Promise<SendWhatsappResponse>;
  triggerDailyWisdomNow: (day?: number) => Promise<SendWhatsappResponse>;
  logout: () => Promise<void>;
  addUserByAdmin: (
    name: string,
    email: string,
    phone: string,
    city: string,
    role: UserRole,
    initialPassword?: string
  ) => Promise<UserProfile>;
  editUserByAdmin: (
    userId: string,
    updates: Partial<Pick<UserProfile, 'name' | 'email' | 'phone' | 'city' | 'role'>>,
    newPassword?: string
  ) => void;
  deleteUserByAdmin: (userId: string) => boolean;
  hydrateSupabaseSessionUser: (
    profile: UserProfile,
    completedDaysFromCloud?: number[] | null
  ) => void;
  addAnnouncement: (
    title: string,
    content: string,
    category: AcademicAnnouncement['category']
  ) => void;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  restoreFromBackup: (backup: any) => boolean;
  getBackupPayload: () => Record<string, any>;
  adminBypassSchedule: boolean;
  setAdminBypassSchedule: (bypass: boolean) => void;
  getMaxUnlockedDay: (userId?: string) => number;
  isDayUnlocked: (day: number, userId?: string) => boolean;
  getNextUnlockCountdown: (targetDay?: number) => {
    hoursLeft: number;
    minutesLeft: number;
    secondsLeft: number;
    targetDateFormatted: string;
    isLocked: boolean;
  };
  calculateStudentGrades: (participantId?: string) => {
    dailyAverage: number | null;
    monthlyAverage: number | null;
    finalScore: number | null;
    finalGrade: number | null;
    weeklyCount: number;
    weeklyAverage: number | null;
    predicate: string;
    completionPercentage: number;
    isComplete: boolean;
    isPassing: boolean;
    certificateStatus: CertificateRecord['status'];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadCredentialsMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem('ahq_local_credentials');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCredentialHash(email: string, password: string) {
  const map = loadCredentialsMap();
  map[email.trim().toLowerCase()] = hashCredential(email, password);
  localStorage.setItem('ahq_local_credentials', JSON.stringify(map));
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('ahq_current_user');
      if (saved) {
        const parsed: UserProfile = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch {
      // Fallback to clean guest user
    }
    return createGuestUser();
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('ahq_all_users');
      if (saved) {
        const parsed: UserProfile[] = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Empty list until real registrations occur
    }
    return [];
  });

  const [serverHasAdmin, setServerHasAdmin] = useState<boolean>(false);
  const portalBootstrappedRef = useRef<boolean>(false);
  const lastSyncedCmsJsonRef = useRef<string>('');
  const lastSyncedProgressJsonRef = useRef<string>('');

  const [currentNav, setCurrentNav] = useState<string>('beranda');
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>(() => {
    try {
      const saved = localStorage.getItem('ahq_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // Empty progress map
    }
    return {};
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('ahq_settings');
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [adminBypassSchedule, setAdminBypassSchedule] = useState<boolean>(() => {
    return localStorage.getItem('ahq_admin_bypass_schedule') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('ahq_admin_bypass_schedule', adminBypassSchedule ? 'true' : 'false');
  }, [adminBypassSchedule]);

  const [certificates, setCertificates] = useState<Record<string, CertificateRecord>>(() => {
    try {
      const saved = localStorage.getItem('ahq_certificates');
      if (saved) return JSON.parse(saved);
    } catch {
      // Empty
    }
    return {};
  });

  const [certificateAuditLogs, setCertificateAuditLogs] = useState<CertificateAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('ahq_cert_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // Empty
    }
    return [];
  });

  const [moduleCustomizations, setModuleCustomizations] = useState<
    Record<number, Partial<LearningModule>>
  >(() => {
    try {
      const saved = localStorage.getItem('ahq_modules_custom');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [extraModules, setExtraModules] = useState<LearningModule[]>(() => {
    try {
      const saved = localStorage.getItem('ahq_modules_extra');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [subjectCustomizations, setSubjectCustomizations] = useState<
    Record<string, Partial<SubjectInfo>>
  >(() => {
    try {
      const saved = localStorage.getItem('ahq_subjects_custom');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customSubjects, setCustomSubjects] = useState<SubjectInfo[]>(() => {
    try {
      const saved = localStorage.getItem('ahq_subjects_extra');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deletedSubjectIds, setDeletedSubjectIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ahq_subjects_deleted');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [syllabusCustomizations, setSyllabusCustomizations] = useState<
    Record<number, Partial<SyllabusRow>>
  >(() => {
    try {
      const saved = localStorage.getItem('ahq_syllabus_custom');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [extraSyllabusRows, setExtraSyllabusRows] = useState<SyllabusRow[]>(() => {
    try {
      const saved = localStorage.getItem('ahq_syllabus_extra');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [assessmentCustomizations, setAssessmentCustomizations] = useState<
    Record<string, ComprehensiveAssessment>
  >(() => {
    try {
      const saved = localStorage.getItem('ahq_assessments_custom');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [deletedAssessmentIds, setDeletedAssessmentIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ahq_assessments_deleted');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ahq_modules_custom', JSON.stringify(moduleCustomizations));
  }, [moduleCustomizations]);

  useEffect(() => {
    localStorage.setItem('ahq_modules_extra', JSON.stringify(extraModules));
  }, [extraModules]);

  useEffect(() => {
    localStorage.setItem('ahq_subjects_custom', JSON.stringify(subjectCustomizations));
  }, [subjectCustomizations]);

  useEffect(() => {
    localStorage.setItem('ahq_subjects_extra', JSON.stringify(customSubjects));
  }, [customSubjects]);

  useEffect(() => {
    localStorage.setItem('ahq_subjects_deleted', JSON.stringify(deletedSubjectIds));
  }, [deletedSubjectIds]);

  useEffect(() => {
    localStorage.setItem('ahq_syllabus_custom', JSON.stringify(syllabusCustomizations));
  }, [syllabusCustomizations]);

  useEffect(() => {
    localStorage.setItem('ahq_syllabus_extra', JSON.stringify(extraSyllabusRows));
  }, [extraSyllabusRows]);

  useEffect(() => {
    localStorage.setItem('ahq_assessments_custom', JSON.stringify(assessmentCustomizations));
  }, [assessmentCustomizations]);

  useEffect(() => {
    localStorage.setItem('ahq_assessments_deleted', JSON.stringify(deletedAssessmentIds));
  }, [deletedAssessmentIds]);

  useEffect(() => {
    localStorage.setItem('ahq_cert_audit_logs', JSON.stringify(certificateAuditLogs));
  }, [certificateAuditLogs]);

  useEffect(() => {
    localStorage.setItem('ahq_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ahq_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('ahq_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    localStorage.setItem('ahq_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('ahq_certificates', JSON.stringify(certificates));
  }, [certificates]);

  const hydrateSupabaseSessionUser = useCallback(
    (profile: UserProfile, completedDaysFromCloud?: number[] | null) => {
      const normalizedProfile: UserProfile = {
        ...profile,
        isGuest: false,
        whatsappReminder: {
          ...DEFAULT_WHATSAPP_REMINDER,
          ...(profile.whatsappReminder || {})
        }
      };

      setAllUsers((prev) => {
        const exists = prev.some(
          (u) => u.id === profile.id || u.email.toLowerCase() === profile.email.toLowerCase()
        );
        if (exists) {
          return prev.map((u) =>
            u.id === profile.id || u.email.toLowerCase() === profile.email.toLowerCase()
              ? {
                  ...u,
                  ...normalizedProfile,
                  whatsappReminder: {
                    ...DEFAULT_WHATSAPP_REMINDER,
                    ...(u.whatsappReminder || {}),
                    ...(profile.whatsappReminder || {})
                  },
                  isGuest: false
                }
              : u
          );
        }
        return [...prev, normalizedProfile];
      });

      if (completedDaysFromCloud && completedDaysFromCloud.length > 0) {
        setUserProgress((prev) => {
          const current = prev[profile.id] || EMPTY_PROGRESS(1);
          const merged = Array.from(
            new Set([...current.completedDays, ...completedDaysFromCloud])
          ).sort((a, b) => a - b);
          return {
            ...prev,
            [profile.id]: {
              ...current,
              completedDays: merged,
              lastAccessedDay: Math.max(current.lastAccessedDay, merged[merged.length - 1] || 1)
            }
          };
        });
      }

      setCurrentUser(normalizedProfile);

      void (async () => {
        const snapshot = await fetchProgressSnapshotFromSupabase(profile.id);
        if (snapshot) {
          lastSyncedProgressJsonRef.current = JSON.stringify(snapshot);
          setUserProgress((prev) => {
            const current = prev[profile.id] || EMPTY_PROGRESS(1);
            const mergedDays = Array.from(
              new Set([...(current.completedDays || []), ...(snapshot.completedDays || [])])
            ).sort((a, b) => a - b);
            return {
              ...prev,
              [profile.id]: {
                ...current,
                ...snapshot,
                completedDays: mergedDays
              }
            };
          });
        }

        if (normalizedProfile.role === 'admin' || normalizedProfile.role === 'pengajar') {
          const staffData = await fetchAllStaffDataFromSupabase();
          if (staffData) {
            if (staffData.users.length > 0) setAllUsers(staffData.users);
            setUserProgress((prev) => ({ ...prev, ...staffData.progressByUser }));
            setCertificates((prev) => ({ ...prev, ...staffData.certificates }));
          }
        }
      })();
    },
    []
  );

  // Hydrate active Supabase Auth session + shared CMS on mount and when Supabase credentials change
  useEffect(() => {
    let activeSubscription: { unsubscribe: () => void } | null = null;

    const syncActiveAuthSession = async () => {
      if (!isSupabaseConfigured()) return;

      try {
        const cloudCms = await fetchCmsFromSupabase();
        if (cloudCms) {
          const mergedSettings =
            cloudCms.systemSettings && Object.keys(cloudCms.systemSettings).length > 0
              ? { ...INITIAL_SETTINGS, ...cloudCms.systemSettings }
              : systemSettings;
          lastSyncedCmsJsonRef.current = JSON.stringify({
            systemSettings: mergedSettings,
            moduleCustomizations: cloudCms.moduleCustomizations || {},
            extraModules: cloudCms.extraModules || [],
            subjectCustomizations: cloudCms.subjectCustomizations || {},
            customSubjects: cloudCms.customSubjects || [],
            deletedSubjectIds: cloudCms.deletedSubjectIds || [],
            syllabusCustomizations: cloudCms.syllabusCustomizations || {},
            extraSyllabusRows: cloudCms.extraSyllabusRows || [],
            assessmentCustomizations: cloudCms.assessmentCustomizations || {},
            deletedAssessmentIds: cloudCms.deletedAssessmentIds || []
          });
          if (cloudCms.systemSettings && Object.keys(cloudCms.systemSettings).length > 0) {
            setSystemSettings(mergedSettings);
          }
          if (cloudCms.moduleCustomizations) setModuleCustomizations(cloudCms.moduleCustomizations);
          if (cloudCms.extraModules) setExtraModules(cloudCms.extraModules);
          if (cloudCms.subjectCustomizations) setSubjectCustomizations(cloudCms.subjectCustomizations);
          if (cloudCms.customSubjects) setCustomSubjects(cloudCms.customSubjects);
          if (cloudCms.deletedSubjectIds) setDeletedSubjectIds(cloudCms.deletedSubjectIds);
          if (cloudCms.syllabusCustomizations) setSyllabusCustomizations(cloudCms.syllabusCustomizations);
          if (cloudCms.extraSyllabusRows) setExtraSyllabusRows(cloudCms.extraSyllabusRows);
          if (cloudCms.assessmentCustomizations) setAssessmentCustomizations(cloudCms.assessmentCustomizations);
          if (cloudCms.deletedAssessmentIds) setDeletedAssessmentIds(cloudCms.deletedAssessmentIds);
        }

        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const u = data.session.user;
          const profile = await fetchOrCreateSupabaseProfile(
            u.id,
            u.email || '',
            u.user_metadata
          );
          const cloudProgress = await fetchLearningProgressFromSupabase(u.id);
          if (profile) {
            hydrateSupabaseSessionUser(profile, cloudProgress);
          }
        }

        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const u = session.user;
            const profile = await fetchOrCreateSupabaseProfile(
              u.id,
              u.email || '',
              u.user_metadata
            );
            const cloudProgress = await fetchLearningProgressFromSupabase(u.id);
            if (profile) {
              hydrateSupabaseSessionUser(profile, cloudProgress);
            }
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(createGuestUser());
          }
        });
        activeSubscription = listener.subscription;
      } catch {
        // Silent fallback if Supabase auth is temporarily unreachable
      }
    };

    void syncActiveAuthSession();

    const handleConfigChange = () => {
      activeSubscription?.unsubscribe();
      activeSubscription = null;
      void syncActiveAuthSession();
    };

    window.addEventListener(SUPABASE_CONFIG_CHANGED_EVENT, handleConfigChange);
    return () => {
      activeSubscription?.unsubscribe();
      window.removeEventListener(SUPABASE_CONFIG_CHANGED_EVENT, handleConfigChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrateSupabaseSessionUser]);

  const currentProgress: UserProgress =
    userProgress[currentUser.id] || EMPTY_PROGRESS(1);

  const markDayComplete = (day: number) => {
    setUserProgress((prev) => {
      const current = prev[currentUser.id] || EMPTY_PROGRESS(day);
      const newCompleted = current.completedDays.includes(day)
        ? current.completedDays
        : [...current.completedDays, day].sort((a, b) => a - b);

      return {
        ...prev,
        [currentUser.id]: {
          ...current,
          completedDays: newCompleted,
          lastAccessedDay: day
        }
      };
    });

    void syncLearningProgressToSupabase(currentUser.id, day, true);
  };

  const submitDailyQuiz = (
    day: number,
    score: number,
    answers: Record<string, any>,
    earnedPoints?: number,
    maxPoints?: number
  ) => {
    setUserProgress((prev) => {
      const current = prev[currentUser.id] || EMPTY_PROGRESS(day);
      const existingDaily = current.dailyResults[day];
      const newCompleted = current.completedDays.includes(day)
        ? current.completedDays
        : [...current.completedDays, day].sort((a, b) => a - b);

      return {
        ...prev,
        [currentUser.id]: {
          ...current,
          completedDays: newCompleted,
          lastAccessedDay: day,
          dailyResults: {
            ...current.dailyResults,
            [day]: {
              ...existingDaily,
              score,
              earnedPoints,
              maxPoints,
              completedAt: getWibDateString(0),
              answers
            }
          }
        }
      };
    });

    void syncLearningProgressToSupabase(currentUser.id, day, true);
  };

  const submitWeeklyAssessment = (
    week: number,
    score: number,
    earnedPoints?: number,
    maxPoints?: number
  ) => {
    setUserProgress((prev) => {
      const current = prev[currentUser.id] || EMPTY_PROGRESS(1);
      return {
        ...prev,
        [currentUser.id]: {
          ...current,
          weeklyResults: {
            ...(current.weeklyResults || {}),
            [week]: {
              week,
              score,
              earnedPoints: earnedPoints ?? score,
              maxPoints: maxPoints ?? 10,
              passed: score >= systemSettings.passingGrade,
              submittedAt: getWibDateString(0)
            }
          }
        }
      };
    });
  };

  const submitMonthlyAssessment = (
    month: 1 | 2 | 3,
    score: number,
    earnedPoints?: number,
    maxPoints?: number
  ) => {
    setUserProgress((prev) => {
      const current = prev[currentUser.id] || EMPTY_PROGRESS(1);
      return {
        ...prev,
        [currentUser.id]: {
          ...current,
          monthlyResults: {
            ...current.monthlyResults,
            [month]: {
              month,
              score,
              earnedPoints,
              maxPoints,
              passed: score >= systemSettings.passingGrade,
              submittedAt: getWibDateString(0)
            }
          }
        }
      };
    });
  };

  const submitFinalAssessment = (
    score: number,
    subjectScores: Record<SubjectId, number>,
    earnedPoints?: number,
    maxPoints?: number
  ) => {
    setUserProgress((prev) => {
      const current = prev[currentUser.id] || EMPTY_PROGRESS(1);
      return {
        ...prev,
        [currentUser.id]: {
          ...current,
          finalResult: {
            score,
            earnedPoints,
            maxPoints,
            passed: score >= systemSettings.passingGrade,
            submittedAt: getWibDateString(0),
            subjectScores
          }
        }
      };
    });
  };

  const submitRemedialRequest = (
    assessmentType: 'harian' | 'pekanan' | 'bulanan' | 'akhir',
    targetLabel: string,
    reason: string
  ) => {
    const newReq: RemedialRequest = {
      id: `rem_${Date.now()}`,
      participantId: currentUser.id,
      participantName: currentUser.name,
      assessmentType,
      targetLabel,
      reason,
      submittedAt: getWibDateString(0),
      status: 'Menunggu Persetujuan'
    };

    setUserProgress((prev) => {
      const current = prev[currentUser.id] || EMPTY_PROGRESS(1);
      return {
        ...prev,
        [currentUser.id]: {
          ...current,
          remedialRequests: [...(current.remedialRequests || []), newReq]
        }
      };
    });

    void syncRemedialRequestToSupabase(newReq);
  };

  const updateRemedialStatus = (
    requestId: string,
    status: RemedialRequest['status'],
    adminNotes?: string
  ) => {
    let matchedParticipantId = '';
    let matchedTargetLabel = '';

    setUserProgress((prev) => {
      const updated: Record<string, UserProgress> = {};
      Object.keys(prev).forEach((uid) => {
        const uProg = prev[uid];
        if (uProg.remedialRequests && uProg.remedialRequests.some((r) => r.id === requestId)) {
          updated[uid] = {
            ...uProg,
            remedialRequests: uProg.remedialRequests.map((req) => {
              if (req.id === requestId) {
                matchedParticipantId = uid;
                matchedTargetLabel = req.targetLabel;
                return { ...req, status, adminNotes: adminNotes || req.adminNotes };
              }
              return req;
            })
          };
        } else {
          updated[uid] = uProg;
        }
      });
      return updated;
    });

    if (matchedParticipantId && matchedTargetLabel) {
      void syncRemedialStatusToServer({
        actorId: currentUser.id,
        requestId,
        status,
        adminNotes
      });
      void updateRemedialStatusInSupabase(
        matchedParticipantId,
        matchedTargetLabel,
        status,
        adminNotes
      );
    }
  };

  const updateModuleContent = (day: number, updatedFields: Partial<LearningModule>) => {
    setModuleCustomizations((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ...updatedFields,
        lastModifiedBy: currentUser.name
      }
    }));
  };

  const submitReflectionEssay = (day: number, essayText: string) => {
    setUserProgress((prev) => {
      const current = prev[currentUser.id] || EMPTY_PROGRESS(day);
      const existingDaily: DailyQuizResult = current.dailyResults[day] || {
        score: 0,
        completedAt: getWibDateString(0),
        answers: {}
      };

      return {
        ...prev,
        [currentUser.id]: {
          ...current,
          dailyResults: {
            ...current.dailyResults,
            [day]: {
              ...existingDaily,
              reflectionSubmission: essayText
            }
          }
        }
      };
    });
  };

  const gradeReflectionEssay = (userId: string, day: number, score: number, feedback: string) => {
    setUserProgress((prev) => {
      const userProg = prev[userId] || EMPTY_PROGRESS(day);
      const dailyRes = userProg.dailyResults[day] || {
        score,
        completedAt: getWibDateString(0),
        answers: {}
      };

      return {
        ...prev,
        [userId]: {
          ...userProg,
          dailyResults: {
            ...userProg.dailyResults,
            [day]: {
              ...dailyRes,
              essayReview: {
                score,
                feedback,
                reviewedBy: currentUser.name,
                reviewedAt: getWibDateString(0)
              }
            }
          }
        }
      };
    });

    void syncEssayGradeToServer({
      actorId: currentUser.id,
      studentId: userId,
      day,
      score,
      feedback,
      reviewedBy: currentUser.name
    });

    if (isSupabaseConfigured()) {
      const targetProg = userProgress[userId] || EMPTY_PROGRESS(day);
      const targetDaily = targetProg.dailyResults[day] || {
        score,
        completedAt: getWibDateString(0),
        answers: {}
      };
      void saveProgressSnapshotToSupabase(userId, {
        ...targetProg,
        dailyResults: {
          ...targetProg.dailyResults,
          [day]: {
            ...targetDaily,
            essayReview: {
              score,
              feedback,
              reviewedBy: currentUser.name,
              reviewedAt: getWibDateString(0)
            }
          }
        }
      });
    }
  };

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const calculateStudentGrades = (participantId?: string) => {
    const targetId = participantId || currentUser.id;
    const prog = userProgress[targetId];

    if (!prog) {
      return {
        dailyAverage: null,
        monthlyAverage: null,
        finalScore: null,
        finalGrade: null,
        weeklyCount: 0,
        weeklyAverage: null,
        predicate: 'Belum Ada Nilai',
        completionPercentage: 0,
        isComplete: false,
        isPassing: false,
        certificateStatus: 'Belum Memenuhi Syarat' as const
      };
    }

    const totalModulesCount = extraModules.length + 90;
    const completionPercentage = Math.min(
      100,
      Math.round((prog.completedDays.length / totalModulesCount) * 100)
    );

    // Daily quiz average
    const dailyEntries = Object.values(prog.dailyResults || {}).filter(
      (r) => Object.keys(r.answers || {}).length > 0 || r.score > 0
    );
    const dailyAverage =
      dailyEntries.length > 0
        ? Math.round(
            (dailyEntries.reduce((a, b) => a + b.score, 0) / dailyEntries.length) * 10
          ) / 10
        : null;

    // Weekly assessments
    const weeklyList = Object.values(prog.weeklyResults || {});
    const weeklyCount = weeklyList.length;
    const weeklyAverage =
      weeklyCount > 0
        ? Math.round((weeklyList.reduce((a, b) => a + b.score, 0) / weeklyCount) * 10) / 10
        : null;

    // Monthly assessments (requires all 3 months)
    const monthlyList = Object.values(prog.monthlyResults || {});
    const monthlyAverage =
      monthlyList.length >= 3
        ? Math.round((monthlyList.reduce((a, b) => a + b.score, 0) / 3) * 10) / 10
        : null;

    // Final exam
    const finalScore = prog.finalResult ? prog.finalResult.score : null;

    const hasAllComponents =
      dailyAverage !== null && monthlyAverage !== null && finalScore !== null;

    let finalGrade: number | null = null;
    let predicate = 'Belum Lengkap';
    let isPassing = false;

    if (hasAllComponents) {
      const wDaily = systemSettings.weights.daily / 100;
      const wMonthly = systemSettings.weights.monthly / 100;
      const wFinal = systemSettings.weights.final / 100;

      finalGrade =
        Math.round(
          (dailyAverage * wDaily + monthlyAverage * wMonthly + finalScore * wFinal) * 10
        ) / 10;

      isPassing = finalGrade >= systemSettings.passingGrade;

      if (finalGrade >= 90) {
        predicate = 'Mumtaz (Istimewa / Dengan Pujian)';
      } else if (finalGrade >= 80) {
        predicate = 'Jayyid Jiddan (Sangat Baik)';
      } else if (finalGrade >= 75) {
        predicate = 'Jayyid (Baik)';
      } else {
        predicate = 'Perlu Remedial / Perbaikan';
      }
    }

    let certificateStatus: CertificateRecord['status'] = 'Belum Memenuhi Syarat';
    const cert = certificates[targetId];

    if (cert && cert.status === 'Sertifikat Diterbitkan') {
      certificateStatus = 'Sertifikat Diterbitkan';
    } else if (
      hasAllComponents &&
      isPassing &&
      completionPercentage >= systemSettings.minCompletionRate
    ) {
      certificateStatus = 'Memenuhi Syarat, Menunggu Pengesahan';
    }

    return {
      dailyAverage,
      monthlyAverage,
      finalScore,
      finalGrade,
      weeklyCount,
      weeklyAverage,
      predicate,
      completionPercentage,
      isComplete: hasAllComponents,
      isPassing,
      certificateStatus
    };
  };

  const issueCertificate = (participantId: string) => {
    const student = allUsers.find((u) => u.id === participantId);
    if (!student) return;

    const grades = calculateStudentGrades(participantId);
    if (!grades.finalGrade) return;

    const yearStr = new Date().getFullYear();
    const certNumber = `AHQ-${yearStr}-${
      student.studentNumber.replace(/^AHQ-\d{4}-/, '') || '0100'
    }`;
    const todayWib = getWibDateString(0);

    const newCert: CertificateRecord = {
      id: `cert_${Date.now()}`,
      certificateNumber: certNumber,
      participantId: student.id,
      participantName: student.name,
      studentNumber: student.studentNumber,
      programName: 'Bimbingan Belajar Islam Terstruktur 90 Hari',
      duration: '90 Hari (3 Bulan Terpadu)',
      completionDate: todayWib,
      finalGrade: grades.finalGrade,
      predicate: grades.predicate,
      status: 'Sertifikat Diterbitkan',
      verifiedCode: `VRF-AHQ-${Math.floor(10000 + Math.random() * 90000)}-VALID`,
      issuedAt: todayWib
    };

    setCertificates((prev) => ({
      ...prev,
      [participantId]: newCert
    }));

    const auditEntry: CertificateAuditLog = {
      id: `aud_${Date.now()}`,
      action: 'TERBIT',
      certificateNumber: certNumber,
      participantId: student.id,
      participantName: student.name,
      reason: `Penerbitan resmi dengan Nilai Akhir ${grades.finalGrade} dan Predikat ${grades.predicate}.`,
      executedBy: currentUser.name,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setCertificateAuditLogs((prev) => [auditEntry, ...prev]);
    void upsertCertificateToServer(currentUser.id, newCert, auditEntry);
    void syncCertificateAndAuditToSupabase(newCert, auditEntry);
  };

  const revokeCertificate = (participantId: string, reason: string) => {
    const existing = certificates[participantId];
    if (!existing) return;

    const revokedTime = getWibDateString(0);

    const updatedCert: CertificateRecord = {
      ...existing,
      status: 'Belum Memenuhi Syarat',
      revocationReason: reason,
      revokedAt: revokedTime,
      revokedBy: currentUser.name
    };

    setCertificates((prev) => ({
      ...prev,
      [participantId]: updatedCert
    }));

    const auditEntry: CertificateAuditLog = {
      id: `aud_${Date.now()}`,
      action: 'CABUT',
      certificateNumber: existing.certificateNumber,
      participantId: existing.participantId,
      participantName: existing.participantName,
      reason,
      executedBy: currentUser.name,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setCertificateAuditLogs((prev) => [auditEntry, ...prev]);
    void upsertCertificateToServer(currentUser.id, updatedCert, auditEntry);
    void syncCertificateAndAuditToSupabase(updatedCert, auditEntry);
  };

  const restoreCertificate = (participantId: string) => {
    const existing = certificates[participantId];
    if (!existing) return;

    const updatedCert: CertificateRecord = {
      ...existing,
      status: 'Sertifikat Diterbitkan',
      revocationReason: undefined,
      revokedAt: undefined,
      revokedBy: undefined
    };

    setCertificates((prev) => ({
      ...prev,
      [participantId]: updatedCert
    }));

    const auditEntry: CertificateAuditLog = {
      id: `aud_${Date.now()}`,
      action: 'PULIHKAN',
      certificateNumber: existing.certificateNumber,
      participantId: existing.participantId,
      participantName: existing.participantName,
      reason: 'Pemulihan keabsahan sertifikat setelah verifikasi administratif ulang.',
      executedBy: currentUser.name,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setCertificateAuditLogs((prev) => [auditEntry, ...prev]);
    void upsertCertificateToServer(currentUser.id, updatedCert, auditEntry);
    void syncCertificateAndAuditToSupabase(updatedCert, auditEntry);
  };

  const registerNewUser = async (
    name: string,
    email: string,
    phone: string,
    city: string,
    password?: string
  ): Promise<UserProfile> => {
    const res = await registerUserViaServer({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      city: city || 'Indonesia',
      password: password || ''
    });

    if (!res.success || !res.user) {
      throw new Error(res.error || 'Pendaftaran gagal. Silakan periksa data Anda.');
    }

    const createdUser: UserProfile = {
      ...res.user,
      isGuest: false,
      whatsappReminder: {
        ...DEFAULT_WHATSAPP_REMINDER,
        ...(res.user.whatsappReminder || {})
      }
    };

    if (password) {
      saveCredentialHash(createdUser.email, password);
    }

    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === createdUser.id);
      return exists ? prev : [...prev, createdUser];
    });

    const guestProg = currentUser.isGuest ? userProgress['usr_guest'] : undefined;
    const initialProgress =
      guestProg &&
      (guestProg.completedDays.length > 0 ||
        Object.keys(guestProg.dailyResults || {}).length > 0 ||
        Object.keys(guestProg.weeklyResults || {}).length > 0)
        ? { ...guestProg }
        : res.progress || EMPTY_PROGRESS(1);

    lastSyncedProgressJsonRef.current = '';
    setUserProgress((prev) => ({
      ...prev,
      [createdUser.id]: initialProgress
    }));

    setCurrentUser(createdUser);
    return createdUser;
  };

  const verifyLocalLogin = async (email: string, password: string): Promise<UserProfile> => {
    const res = await loginUserViaServer({
      email: email.trim().toLowerCase(),
      password
    });

    if (!res.success || !res.user) {
      throw new Error(res.error || 'Email atau kata sandi salah.');
    }

    const activeUser: UserProfile = {
      ...res.user,
      isGuest: false,
      whatsappReminder: {
        ...DEFAULT_WHATSAPP_REMINDER,
        ...(res.user.whatsappReminder || {})
      }
    };

    if (res.allUsers && Array.isArray(res.allUsers)) {
      setAllUsers(res.allUsers);
    } else {
      setAllUsers((prev) => {
        const exists = prev.some((u) => u.id === activeUser.id);
        return exists
          ? prev.map((u) => (u.id === activeUser.id ? activeUser : u))
          : [...prev, activeUser];
      });
    }

    if (res.allProgress) {
      lastSyncedProgressJsonRef.current = JSON.stringify(
        res.allProgress[activeUser.id] || res.progress || EMPTY_PROGRESS(1)
      );
      setUserProgress((prev) => ({ ...prev, ...res.allProgress }));
    } else if (res.progress) {
      lastSyncedProgressJsonRef.current = JSON.stringify(res.progress);
      setUserProgress((prev) => ({
        ...prev,
        [activeUser.id]: res.progress!
      }));
    }

    if (res.certificateAuditLogs) {
      setCertificateAuditLogs(res.certificateAuditLogs);
    }

    setCurrentUser(activeUser);
    return activeUser;
  };

  const hasAnyAdmin = () => serverHasAdmin || allUsers.some((u) => u.role === 'admin');

  const setupInitialAdmin = async (
    name: string,
    email: string,
    phone: string,
    city: string,
    password: string
  ): Promise<UserProfile> => {
    const res = await setupAdminViaServer({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '+62 811-0000-0000',
      city: city || 'Indonesia',
      password
    });

    if (!res.success || !res.user) {
      throw new Error(res.error || 'Gagal menyiapkan akun Administrator.');
    }

    const adminUser: UserProfile = {
      ...res.user,
      isGuest: false,
      whatsappReminder: {
        ...DEFAULT_WHATSAPP_REMINDER,
        ...(res.user.whatsappReminder || {})
      }
    };

    saveCredentialHash(adminUser.email, password);
    setServerHasAdmin(true);
    setAllUsers(res.allUsers && Array.isArray(res.allUsers) ? res.allUsers : [adminUser]);
    if (res.allProgress) {
      lastSyncedProgressJsonRef.current = JSON.stringify(res.allProgress[adminUser.id] || EMPTY_PROGRESS(1));
      setUserProgress(res.allProgress);
    } else {
      lastSyncedProgressJsonRef.current = JSON.stringify(res.progress || EMPTY_PROGRESS(1));
      setUserProgress((prev) => ({
        ...prev,
        [adminUser.id]: res.progress || EMPTY_PROGRESS(1)
      }));
    }
    setCurrentUser(adminUser);
    return adminUser;
  };

  const changeLocalPassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    if (currentUser.isGuest || !currentUser.email) {
      return { success: false, message: 'Silakan masuk terlebih dahulu untuk mengubah kata sandi.' };
    }
    if (newPassword.length < 6) {
      return { success: false, message: 'Kata sandi baru minimal 6 karakter.' };
    }

    const res = await changePasswordViaServer({
      userId: currentUser.id,
      oldPassword,
      newPassword
    });
    if (res.success) {
      saveCredentialHash(currentUser.email.toLowerCase(), newPassword);
    }
    return res;
  };

  const updateCurrentUserProfile = useCallback(
    (
      updates: Partial<
        Pick<UserProfile, 'name' | 'phone' | 'city' | 'avatar' | 'whatsappReminder'>
      >
    ) => {
      setCurrentUser((prev) => {
        const updatedUser: UserProfile = {
          ...prev,
          ...updates
        };

        if (!updatedUser.isGuest) {
          setAllUsers((users) =>
            users.map((u) => (u.id === updatedUser.id ? { ...u, ...updates } : u))
          );
          void syncUserProfileToServer(updatedUser.id, updates);
          void syncProfileToSupabase(updatedUser);
        }

        return updatedUser;
      });
    },
    []
  );

  const [whatsappGatewayStatus, setWhatsappGatewayStatus] = useState<WhatsappGatewayStatus>({
    configured: false,
    provider: null
  });
  const [dueWhatsappReminder, setDueWhatsappReminder] =
    useState<DueWhatsappReminderNotice | null>(null);

  useEffect(() => {
    void fetchWhatsappGatewayStatus().then(setWhatsappGatewayStatus);
  }, []);

  const updateWhatsappReminderSettings = useCallback(
    (partial: Partial<WhatsAppReminderSettings>) => {
      setCurrentUser((prev) => {
        const merged: WhatsAppReminderSettings = {
          ...DEFAULT_WHATSAPP_REMINDER,
          ...(prev.whatsappReminder || {}),
          ...partial
        };
        const updatedUser: UserProfile = {
          ...prev,
          whatsappReminder: merged
        };
        if (!updatedUser.isGuest) {
          setAllUsers((users) =>
            users.map((u) => (u.id === updatedUser.id ? { ...u, whatsappReminder: merged } : u))
          );
          void syncUserProfileToServer(updatedUser.id, { whatsappReminder: merged });
          void syncProfileToSupabase(updatedUser);
        }
        return updatedUser;
      });
    },
    []
  );

  const dismissDueWhatsappReminder = useCallback(() => {
    setDueWhatsappReminder(null);
  }, []);

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Proceed with local sign-out
      }
    }
    setCurrentUser(createGuestUser());
    setCurrentNav('beranda');
  };

  const addUserByAdmin = async (
    name: string,
    email: string,
    phone: string,
    city: string,
    role: UserRole,
    initialPassword?: string
  ): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await manageUserViaServer({
      actorId: currentUser.id,
      action: 'create',
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      city: city || 'Indonesia',
      role,
      password: initialPassword
    });

    if (!res.ok || !res.user) {
      throw new Error(res.error || 'Gagal menambahkan akun.');
    }

    const newUser: UserProfile = {
      ...res.user,
      isGuest: false,
      whatsappReminder: {
        ...DEFAULT_WHATSAPP_REMINDER,
        ...(res.user.whatsappReminder || {})
      }
    };

    if (initialPassword) {
      saveCredentialHash(cleanEmail, initialPassword);
    }

    setAllUsers((prev) => [...prev, newUser]);
    setUserProgress((prev) => ({
      ...prev,
      [newUser.id]: EMPTY_PROGRESS(1)
    }));

    return newUser;
  };

  const editUserByAdmin = (
    userId: string,
    updates: Partial<Pick<UserProfile, 'name' | 'email' | 'phone' | 'city' | 'role'>>,
    newPassword?: string
  ) => {
    let updatedEmail = '';
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const cleanEmail = updates.email ? updates.email.trim().toLowerCase() : u.email;
        updatedEmail = cleanEmail;
        return {
          ...u,
          ...updates,
          email: cleanEmail
        };
      })
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({
        ...prev,
        ...updates,
        email: updates.email ? updates.email.trim().toLowerCase() : prev.email
      }));
    }

    if (newPassword && newPassword.trim().length >= 6 && updatedEmail) {
      saveCredentialHash(updatedEmail, newPassword.trim());
    }

    void manageUserViaServer({
      actorId: currentUser.id,
      action: 'update',
      userId,
      ...updates,
      password: newPassword
    });
  };

  const deleteUserByAdmin = (userId: string): boolean => {
    if (userId === currentUser.id) return false;
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    void manageUserViaServer({
      actorId: currentUser.id,
      action: 'delete',
      userId
    });
    return true;
  };

  const resetModuleContent = (day: number) => {
    setModuleCustomizations((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  };

  const addExtraModule = (mod: LearningModule) => {
    setExtraModules((prev) => {
      const filtered = prev.filter((m) => m.day !== mod.day);
      return [...filtered, mod].sort((a, b) => a.day - b.day);
    });
    // Ensure a syllabus row exists for the added day
    setExtraSyllabusRows((prev) => {
      const existsInBase = SYLLABUS_DATA.some((r) => r.day === mod.day);
      if (existsInBase) return prev;
      const filtered = prev.filter((r) => r.day !== mod.day);
      return [
        ...filtered,
        {
          no: mod.day,
          day: mod.day,
          subjectId: mod.subjectId,
          topic: mod.title,
          indicator: mod.indicators[0] || mod.learningGoal,
          competence: mod.competence,
          notes: mod.references[0] || 'Materi Tambahan Pengelola'
        }
      ].sort((a, b) => a.day - b.day);
    });
  };

  const deleteExtraModule = (day: number) => {
    setExtraModules((prev) => prev.filter((m) => m.day !== day));
    setExtraSyllabusRows((prev) => prev.filter((r) => r.day !== day));
  };

  const resolvedModules = useMemo<LearningModule[]>(() => {
    const base = getAllModules().map((m) => ({
      ...m,
      ...(moduleCustomizations[m.day] || {})
    }));
    const mergedExtras = extraModules.map((m) => ({
      ...m,
      ...(moduleCustomizations[m.day] || {})
    }));
    const map = new Map<number, LearningModule>();
    base.forEach((m) => map.set(m.day, m));
    mergedExtras.forEach((m) => map.set(m.day, m));
    return Array.from(map.values()).sort((a, b) => a.day - b.day);
  }, [moduleCustomizations, extraModules]);

  const resolvedSubjects = useMemo<SubjectInfo[]>(() => {
    const delSet = new Set(deletedSubjectIds);
    const baseMerged = SUBJECTS_DATA.filter((s) => !delSet.has(s.id)).map((s) => ({
      ...s,
      ...(subjectCustomizations[s.id] || {})
    }));
    const customMerged = customSubjects
      .filter((s) => !delSet.has(s.id))
      .map((s) => ({
        ...s,
        ...(subjectCustomizations[s.id] || {})
      }));
    return [...baseMerged, ...customMerged];
  }, [subjectCustomizations, customSubjects, deletedSubjectIds]);

  const upsertSubject = (subject: SubjectInfo) => {
    const isBase = SUBJECTS_DATA.some((s) => s.id === subject.id);
    setDeletedSubjectIds((prev) => prev.filter((id) => id !== subject.id));
    if (isBase) {
      setSubjectCustomizations((prev) => ({
        ...prev,
        [subject.id]: subject
      }));
    } else {
      setCustomSubjects((prev) => {
        const exists = prev.some((s) => s.id === subject.id);
        if (exists) {
          return prev.map((s) => (s.id === subject.id ? subject : s));
        }
        return [...prev, subject];
      });
    }
  };

  const deleteSubject = (subjectId: string) => {
    const isBase = SUBJECTS_DATA.some((s) => s.id === subjectId);
    if (isBase) {
      setDeletedSubjectIds((prev) => (prev.includes(subjectId) ? prev : [...prev, subjectId]));
    } else {
      setCustomSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    }
  };

  const resetSubjectsToDefault = () => {
    setSubjectCustomizations({});
    setCustomSubjects([]);
    setDeletedSubjectIds([]);
  };

  const resolvedSyllabus = useMemo<SyllabusRow[]>(() => {
    const map = new Map<number, SyllabusRow>();
    SYLLABUS_DATA.forEach((row) => {
      const modCust = moduleCustomizations[row.day];
      const sylCust = syllabusCustomizations[row.day];
      map.set(row.day, {
        ...row,
        ...(modCust?.title ? { topic: modCust.title } : {}),
        ...(modCust?.subjectId ? { subjectId: modCust.subjectId } : {}),
        ...(sylCust || {})
      });
    });
    extraSyllabusRows.forEach((row) => {
      const sylCust = syllabusCustomizations[row.day];
      map.set(row.day, {
        ...row,
        ...(sylCust || {})
      });
    });
    return Array.from(map.values()).sort((a, b) => a.day - b.day);
  }, [moduleCustomizations, syllabusCustomizations, extraSyllabusRows]);

  const updateSyllabusRow = (day: number, updatedFields: Partial<SyllabusRow>) => {
    setSyllabusCustomizations((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        ...updatedFields
      }
    }));
  };

  const addSyllabusRow = (row: SyllabusRow) => {
    const existsInBase = SYLLABUS_DATA.some((r) => r.day === row.day);
    if (existsInBase) {
      updateSyllabusRow(row.day, row);
    } else {
      setExtraSyllabusRows((prev) => {
        const filtered = prev.filter((r) => r.day !== row.day);
        return [...filtered, row].sort((a, b) => a.day - b.day);
      });
    }
  };

  const deleteExtraSyllabusRow = (day: number) => {
    setExtraSyllabusRows((prev) => prev.filter((r) => r.day !== day));
    setSyllabusCustomizations((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  };

  const resolvedWeeklyAssessments = useMemo<Record<number, ComprehensiveAssessment>>(() => {
    const delSet = new Set(deletedAssessmentIds);
    const result: Record<number, ComprehensiveAssessment> = {};
    Object.values(WEEKLY_ASSESSMENTS).forEach((w) => {
      if (!delSet.has(w.id) && w.week) {
        result[w.week] = assessmentCustomizations[w.id] || w;
      }
    });
    Object.values(assessmentCustomizations).forEach((custom) => {
      if (custom.type === 'pekanan' && custom.week && !delSet.has(custom.id)) {
        result[custom.week] = custom;
      }
    });
    return result;
  }, [assessmentCustomizations, deletedAssessmentIds]);

  const resolvedMonthlyAssessments = useMemo<Record<number, ComprehensiveAssessment>>(() => {
    const result: Record<number, ComprehensiveAssessment> = {};
    ([1, 2, 3] as const).forEach((m) => {
      const base = MONTHLY_ASSESSMENTS[m];
      result[m] = assessmentCustomizations[base.id] || base;
    });
    return result;
  }, [assessmentCustomizations]);

  const resolvedFinalAssessment = useMemo<ComprehensiveAssessment>(() => {
    return assessmentCustomizations[FINAL_ASSESSMENT.id] || FINAL_ASSESSMENT;
  }, [assessmentCustomizations]);

  const upsertAssessment = (assessment: ComprehensiveAssessment) => {
    setDeletedAssessmentIds((prev) => prev.filter((id) => id !== assessment.id));
    setAssessmentCustomizations((prev) => ({
      ...prev,
      [assessment.id]: assessment
    }));
  };

  const deleteAssessment = (id: string) => {
    setDeletedAssessmentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setAssessmentCustomizations((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const resetAssessment = (id: string) => {
    setDeletedAssessmentIds((prev) => prev.filter((d) => d !== id));
    setAssessmentCustomizations((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const addAnnouncement = (
    title: string,
    content: string,
    category: AcademicAnnouncement['category']
  ) => {
    const newAnn: AcademicAnnouncement = {
      id: `ann_${Date.now()}`,
      title,
      content,
      category,
      publishedAt: getWibDateString(0),
      author: currentUser.name,
      isActive: true
    };
    setSystemSettings((prev) => ({
      ...prev,
      announcements: [newAnn, ...(prev.announcements || [])]
    }));
  };

  const toggleAnnouncement = (id: string) => {
    setSystemSettings((prev) => ({
      ...prev,
      announcements: (prev.announcements || []).map((a) =>
        a.id === id ? { ...a, isActive: !a.isActive } : a
      )
    }));
  };

  const deleteAnnouncement = (id: string) => {
    setSystemSettings((prev) => ({
      ...prev,
      announcements: (prev.announcements || []).filter((a) => a.id !== id)
    }));
  };

  const restoreFromBackup = (backup: any): boolean => {
    try {
      if (!backup || typeof backup !== 'object') return false;
      if (Array.isArray(backup.users)) {
        setAllUsers(backup.users);
      }
      if (backup.progress && typeof backup.progress === 'object') {
        setUserProgress(backup.progress);
      }
      if (backup.certificates && typeof backup.certificates === 'object') {
        setCertificates(backup.certificates);
      }
      if (backup.settings && typeof backup.settings === 'object') {
        setSystemSettings((prev) => ({ ...prev, ...backup.settings }));
      }
      if (backup.moduleCustomizations && typeof backup.moduleCustomizations === 'object') {
        setModuleCustomizations(backup.moduleCustomizations);
      }
      if (Array.isArray(backup.extraModules)) {
        setExtraModules(backup.extraModules);
      }
      if (backup.subjectCustomizations && typeof backup.subjectCustomizations === 'object') {
        setSubjectCustomizations(backup.subjectCustomizations);
      }
      if (Array.isArray(backup.customSubjects)) {
        setCustomSubjects(backup.customSubjects);
      }
      if (Array.isArray(backup.deletedSubjectIds)) {
        setDeletedSubjectIds(backup.deletedSubjectIds);
      }
      if (backup.syllabusCustomizations && typeof backup.syllabusCustomizations === 'object') {
        setSyllabusCustomizations(backup.syllabusCustomizations);
      }
      if (Array.isArray(backup.extraSyllabusRows)) {
        setExtraSyllabusRows(backup.extraSyllabusRows);
      }
      if (backup.assessmentCustomizations && typeof backup.assessmentCustomizations === 'object') {
        setAssessmentCustomizations(backup.assessmentCustomizations);
      }
      if (Array.isArray(backup.deletedAssessmentIds)) {
        setDeletedAssessmentIds(backup.deletedAssessmentIds);
      }
      void restoreBackupToServer(currentUser.id, backup);
      return true;
    } catch {
      return false;
    }
  };

  const getBackupPayload = (): Record<string, any> => ({
    version: '5.0-full-cms',
    exportedAt: new Date().toISOString(),
    users: allUsers,
    progress: userProgress,
    certificates,
    settings: systemSettings,
    moduleCustomizations,
    extraModules,
    subjectCustomizations,
    customSubjects,
    deletedSubjectIds,
    syllabusCustomizations,
    extraSyllabusRows,
    assessmentCustomizations,
    deletedAssessmentIds
  });

  const getMaxUnlockedDay = (userId?: string): number => {
    const maxProgramDay = resolvedModules.length > 0
      ? Math.max(90, ...resolvedModules.map((m) => m.day))
      : 90;

    if (systemSettings.dailyUnlockScheduleEnabled === false) {
      return maxProgramDay;
    }

    const targetUser = userId
      ? allUsers.find((u) => u.id === userId) || currentUser
      : currentUser;

    if (
      (targetUser.role === 'admin' || targetUser.role === 'pengajar') &&
      (adminBypassSchedule || systemSettings.allowTeacherPreviewAllDays !== false)
    ) {
      return maxProgramDay;
    }

    const regDateStr = targetUser.registrationDate || getWibDateString(0);
    const [y, m, d] = regDateStr.split('-').map(Number);
    const startWIBMidnightMs = Date.UTC(y, (m || 1) - 1, d || 1, 0, 0, 0) - 7 * 3600000;
    const nowMs = Date.now();
    const diffMs = nowMs - startWIBMidnightMs;
    const daysElapsed = Math.floor(diffMs / (24 * 3600000));
    const scheduleUnlockedDay = Math.max(1, daysElapsed + 1);

    return Math.min(maxProgramDay, scheduleUnlockedDay);
  };

  const isDayUnlocked = (day: number, userId?: string): boolean => {
    const targetUser = userId
      ? allUsers.find((u) => u.id === userId) || currentUser
      : currentUser;
    if (systemSettings.dailyUnlockScheduleEnabled === false) return true;
    if (
      (targetUser.role === 'admin' || targetUser.role === 'pengajar') &&
      (adminBypassSchedule || systemSettings.allowTeacherPreviewAllDays !== false)
    ) {
      return true;
    }

    const progress = userProgress[targetUser.id];
    if (progress?.completedDays?.includes(day)) return true;

    return day <= getMaxUnlockedDay(targetUser.id);
  };

  const getNextUnlockCountdown = (targetDay?: number) => {
    const maxUnlocked = getMaxUnlockedDay();
    const dayToUnlock = targetDay !== undefined ? targetDay : maxUnlocked + 1;

    if (dayToUnlock > 90) {
      return {
        hoursLeft: 0,
        minutesLeft: 0,
        secondsLeft: 0,
        targetDateFormatted: 'Seluruh materi 90 hari telah terbuka.',
        isLocked: false
      };
    }

    const regDateStr = currentUser.registrationDate || getWibDateString(0);
    const [y, m, d] = regDateStr.split('-').map(Number);
    const startWIBMidnightMs = Date.UTC(y, (m || 1) - 1, d || 1, 0, 0, 0) - 7 * 3600000;

    const unlockTimeMs = startWIBMidnightMs + (dayToUnlock - 1) * 24 * 3600000;
    const nowMs = Date.now();
    const diffMs = Math.max(0, unlockTimeMs - nowMs);

    const unlockDate = new Date(unlockTimeMs);
    const dateFormatted =
      new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
      }).format(unlockDate) + ' pukul 00.00 WIB';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return {
      hoursLeft: hours,
      minutesLeft: minutes,
      secondsLeft: seconds,
      targetDateFormatted: dateFormatted,
      isLocked: diffMs > 0
    };
  };

  const buildReminderPayloadForDay = useCallback(
    (targetDay: number) => {
      const activeMod = resolvedModules.find((m) => m.day === targetDay) || resolvedModules[0];
      const subj =
        resolvedSubjects.find((s) => s.id === activeMod.subjectId) ||
        resolvedSubjects[0] ||
        SUBJECTS_DATA[0];
      const quranRef = activeMod.quranVerse
        ? `QS. ${activeMod.quranVerse.surah}: ${activeMod.quranVerse.ayah}`
        : undefined;
      const unlocked = isDayUnlocked(activeMod.day);

      const message = buildMaterialReminderMessage({
        participantName: currentUser.isGuest ? 'Sahabat Penuntut Ilmu' : currentUser.name,
        day: activeMod.day,
        moduleTitle: activeMod.title,
        subjectName: subj.name,
        learningGoal: activeMod.learningGoal,
        quranRef,
        includeEvaluationNote: currentUser.whatsappReminder?.remindEvaluationDue !== false,
        isLockedFutureDay: !unlocked
      });

      return {
        day: activeMod.day,
        moduleTitle: activeMod.title,
        subjectName: subj.name,
        message,
        waMeUrl: buildWhatsappWaMeLink(currentUser.phone, message)
      };
    },
    [currentUser, resolvedModules, resolvedSubjects, systemSettings, userProgress, adminBypassSchedule, allUsers]
  );

  const triggerWhatsappReminderNow = useCallback(
    async (explicitDay?: number): Promise<SendWhatsappResponse> => {
      const maxUnlocked = getMaxUnlockedDay();
      let targetDay = explicitDay ?? maxUnlocked;
      if (explicitDay === undefined) {
        for (let d = 1; d <= maxUnlocked; d++) {
          if (!currentProgress.completedDays.includes(d)) {
            targetDay = d;
            break;
          }
        }
      }

      const payload = buildReminderPayloadForDay(targetDay);
      const res = await sendWhatsappNotification({
        phone: currentUser.phone,
        message: payload.message,
        participantName: currentUser.name,
        day: targetDay,
        type: 'unlock_materi',
        userId: currentUser.id
      });

      const todayWib = getWibDateString(0);
      if (res.success && res.sentVia === 'gateway') {
        updateWhatsappReminderSettings({
          lastSentDateWIB: todayWib,
          lastSentDay: targetDay,
          lastUnlockSentDateWIB: todayWib,
          lastUnlockSentDay: targetDay,
          lastStatus: 'terkirim_gateway',
          lastAttemptAt: new Date().toISOString()
        });
      } else if (res.sentVia === 'wa_me_fallback') {
        updateWhatsappReminderSettings({
          lastSentDateWIB: todayWib,
          lastSentDay: targetDay,
          lastStatus: 'dibuka_wa',
          lastAttemptAt: new Date().toISOString()
        });
      } else {
        updateWhatsappReminderSettings({
          lastStatus: 'gagal',
          lastAttemptAt: new Date().toISOString()
        });
      }

      return res;
    },
    [
      buildReminderPayloadForDay,
      currentProgress.completedDays,
      currentUser.id,
      currentUser.name,
      currentUser.phone,
      getMaxUnlockedDay,
      updateWhatsappReminderSettings
    ]
  );

  const triggerDailyWisdomNow = useCallback(
    async (explicitDay?: number): Promise<SendWhatsappResponse> => {
      const targetDay = Math.min(90, Math.max(1, explicitDay ?? getMaxUnlockedDay()));
      const wisdom = getDailyWisdomForDay(targetDay, systemSettings.customDailyWisdoms);
      const activeMod = resolvedModules.find((m) => m.day === targetDay) || resolvedModules[0];
      const message = buildDailyWisdomMessage({
        participantName: currentUser.isGuest ? 'Sahabat Penuntut Ilmu' : currentUser.name,
        day: targetDay,
        wisdom,
        moduleTitle: activeMod?.title,
        appUrl: typeof window !== 'undefined' ? window.location.origin : ''
      });

      const res = await sendWhatsappNotification({
        phone: currentUser.phone,
        message,
        participantName: currentUser.name,
        day: targetDay,
        type: 'kata_hikmah_0800',
        userId: currentUser.id
      });

      const todayWib = getWibDateString(0);
      if (res.success && res.sentVia === 'gateway') {
        updateWhatsappReminderSettings({
          lastWisdomSentDateWIB: todayWib,
          lastWisdomSentDay: targetDay,
          lastStatus: 'terkirim_gateway',
          lastAttemptAt: new Date().toISOString()
        });
      }

      return res;
    },
    [
      currentUser.id,
      currentUser.isGuest,
      currentUser.name,
      currentUser.phone,
      getMaxUnlockedDay,
      resolvedModules,
      systemSettings.customDailyWisdoms,
      updateWhatsappReminderSettings
    ]
  );

  // Sync registered participants + module metadata + custom Kata Hikmah to Express background scheduler
  useEffect(() => {
    const syncTimeout = setTimeout(() => {
      const moduleMetaByDay: Record<
        number,
        { title: string; subjectName: string; learningGoal: string; quranRef?: string }
      > = {};

      for (const mod of resolvedModules) {
        const subj =
          resolvedSubjects.find((s) => s.id === mod.subjectId) ||
          resolvedSubjects[0] ||
          SUBJECTS_DATA[0];
        moduleMetaByDay[mod.day] = {
          title: mod.title,
          subjectName: subj.name,
          learningGoal: mod.learningGoal,
          quranRef: mod.quranVerse ? `QS. ${mod.quranVerse.surah}: ${mod.quranVerse.ayah}` : undefined
        };
      }

      const subscribers = allUsers
        .filter((u) => !u.isGuest && isValidWhatsappPhone(u.phone))
        .map((u) => {
          const rem = { ...DEFAULT_WHATSAPP_REMINDER, ...(u.whatsappReminder || {}) };
          return {
            userId: u.id,
            name: u.name,
            phone: u.phone,
            role: u.role,
            registrationDate: u.registrationDate,
            autoSendOnUnlock: rem.autoSendOnUnlock !== false && rem.enabled !== false,
            wisdomReminderEnabled: rem.wisdomReminderEnabled !== false && rem.enabled !== false,
            preferredTimeWIB: rem.preferredTimeWIB || systemSettings.unlockTimeWIB || '00:00',
            wisdomTimeWIB: rem.wisdomTimeWIB || '08:00',
            remindEvaluationDue: rem.remindEvaluationDue !== false
          };
        });

      void syncWhatsappSubscribersToServer({
        subscribers,
        moduleMetaByDay,
        customDailyWisdoms: systemSettings.customDailyWisdoms,
        unlockTimeWIB: systemSettings.unlockTimeWIB || '00:00',
        dailyUnlockScheduleEnabled: systemSettings.dailyUnlockScheduleEnabled !== false,
        appUrl: typeof window !== 'undefined' ? window.location.origin : ''
      });
    }, 500);

    return () => clearTimeout(syncTimeout);
  }, [
    allUsers,
    resolvedModules,
    resolvedSubjects,
    systemSettings.customDailyWisdoms,
    systemSettings.dailyUnlockScheduleEnabled,
    systemSettings.unlockTimeWIB
  ]);

  // Dual Automated WIB Scheduler (00.00 WIB Unlock Materi + 08.00 WIB Kata Hikmah "Pengingat hari ini" 90 hari)
  useEffect(() => {
    const checkDualWhatsappSchedule = async () => {
      const reminder = {
        ...DEFAULT_WHATSAPP_REMINDER,
        ...(currentUser.whatsappReminder || {})
      };
      if (!reminder.enabled) return;

      const hasPhone = isValidWhatsappPhone(currentUser.phone);
      if (currentUser.isGuest && !hasPhone) return;

      const todayWib = getWibDateString(0);
      const nowHHMM = getWibTimeHHMM();
      const maxUnlocked = getMaxUnlockedDay();
      const unlockCutoffHHMM = systemSettings.unlockTimeWIB || '00:00';
      const wisdomCutoffHHMM = reminder.wisdomTimeWIB || '08:00';

      // 1. Trigger Materi Baru Terbuka (00.00 WIB atau berbarengan terbukanya hari yang terkunci)
      const shouldSendUnlock =
        reminder.autoSendOnUnlock !== false &&
        nowHHMM >= unlockCutoffHHMM &&
        maxUnlocked > (reminder.lastUnlockSentDay || 0) &&
        reminder.lastUnlockSentDateWIB !== todayWib;

      if (shouldSendUnlock) {
        const targetDay = maxUnlocked;
        const activeMod = resolvedModules.find((m) => m.day === targetDay) || resolvedModules[0];
        const subj =
          resolvedSubjects.find((s) => s.id === activeMod.subjectId) ||
          resolvedSubjects[0] ||
          SUBJECTS_DATA[0];
        const quranRef = activeMod.quranVerse
          ? `QS. ${activeMod.quranVerse.surah}: ${activeMod.quranVerse.ayah}`
          : undefined;

        const message = buildUnlockedMaterialMessage({
          participantName: currentUser.isGuest ? 'Sahabat Penuntut Ilmu' : currentUser.name,
          day: activeMod.day,
          moduleTitle: activeMod.title,
          subjectName: subj.name,
          learningGoal: activeMod.learningGoal,
          quranRef,
          includeEvaluationNote: reminder.remindEvaluationDue !== false,
          appUrl: typeof window !== 'undefined' ? window.location.origin : ''
        });
        const waMeUrl = buildWhatsappWaMeLink(currentUser.phone, message);

        let sentAuto = false;
        if (whatsappGatewayStatus.configured && hasPhone) {
          const res = await sendWhatsappNotification({
            phone: currentUser.phone,
            message,
            participantName: currentUser.name,
            day: targetDay,
            type: 'unlock_materi',
            userId: currentUser.id
          });
          sentAuto = Boolean(res.success && res.sentVia === 'gateway');
        }

        updateWhatsappReminderSettings({
          lastUnlockSentDateWIB: todayWib,
          lastUnlockSentDay: targetDay,
          lastSentDateWIB: todayWib,
          lastSentDay: targetDay,
          lastStatus: sentAuto ? 'terkirim_gateway' : 'dibuka_wa',
          lastAttemptAt: new Date().toISOString()
        });

        setDueWhatsappReminder({
          type: 'unlock_materi',
          day: targetDay,
          moduleTitle: activeMod.title,
          subjectName: subj.name,
          waMeUrl,
          sentAutomatically: sentAuto,
          message,
          dateWib: todayWib
        });

        if (
          reminder.browserNotificationEnabled &&
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          try {
            new Notification(
              `Materi Hari ke-${targetDay} Terbuka Otomatis — Akademik Healing Qur’ani`,
              {
                body: `${activeMod.title} (${subj.name}) telah terbuka dan siap dipelajari.`
              }
            );
          } catch {
            // Ignore restricted iframe notification error
          }
        }
        return;
      }

      // 2. Trigger Kata Hikmah "Pengingat hari ini" setiap pukul 08.00 WIB (selama 90 hari)
      const shouldSendWisdom =
        reminder.wisdomReminderEnabled !== false &&
        nowHHMM >= wisdomCutoffHHMM &&
        maxUnlocked >= 1 &&
        maxUnlocked <= 90 &&
        reminder.lastWisdomSentDateWIB !== todayWib;

      if (shouldSendWisdom) {
        const targetDay = maxUnlocked;
        const activeMod = resolvedModules.find((m) => m.day === targetDay) || resolvedModules[0];
        const subj =
          resolvedSubjects.find((s) => s.id === activeMod.subjectId) ||
          resolvedSubjects[0] ||
          SUBJECTS_DATA[0];
        const wisdom = getDailyWisdomForDay(targetDay, systemSettings.customDailyWisdoms);
        const message = buildDailyWisdomMessage({
          participantName: currentUser.isGuest ? 'Sahabat Penuntut Ilmu' : currentUser.name,
          day: targetDay,
          wisdom,
          moduleTitle: activeMod.title,
          appUrl: typeof window !== 'undefined' ? window.location.origin : ''
        });
        const waMeUrl = buildWhatsappWaMeLink(currentUser.phone, message);

        let sentAuto = false;
        if (whatsappGatewayStatus.configured && hasPhone) {
          const res = await sendWhatsappNotification({
            phone: currentUser.phone,
            message,
            participantName: currentUser.name,
            day: targetDay,
            type: 'kata_hikmah_0800',
            userId: currentUser.id
          });
          sentAuto = Boolean(res.success && res.sentVia === 'gateway');
        }

        updateWhatsappReminderSettings({
          lastWisdomSentDateWIB: todayWib,
          lastWisdomSentDay: targetDay,
          lastStatus: sentAuto ? 'terkirim_gateway' : 'dibuka_wa',
          lastAttemptAt: new Date().toISOString()
        });

        setDueWhatsappReminder({
          type: 'kata_hikmah_0800',
          day: targetDay,
          moduleTitle: activeMod.title,
          subjectName: subj.name,
          waMeUrl,
          sentAutomatically: sentAuto,
          message,
          dateWib: todayWib,
          wisdom
        });

        if (
          reminder.browserNotificationEnabled &&
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          try {
            new Notification(
              `Pengingat hari ini — Kata Hikmah Hari ke-${targetDay}/90 (08.00 WIB)`,
              {
                body: `"${wisdom.quote}"`
              }
            );
          } catch {
            // Ignore restricted iframe notification error
          }
        }
      }
    };

    void checkDualWhatsappSchedule();
    const timer = setInterval(() => {
      void checkDualWhatsappSchedule();
    }, 30000);

    return () => clearInterval(timer);
  }, [
    currentUser.id,
    currentUser.isGuest,
    currentUser.name,
    currentUser.phone,
    currentUser.whatsappReminder,
    getMaxUnlockedDay,
    resolvedModules,
    resolvedSubjects,
    systemSettings.customDailyWisdoms,
    systemSettings.unlockTimeWIB,
    updateWhatsappReminderSettings,
    whatsappGatewayStatus.configured
  ]);

  // Bootstrap shared multi-user database from Express server (/api/portal/bootstrap)
  useEffect(() => {
    let cancelled = false;
    const bootstrapPortal = async () => {
      const reqUserId = currentUser.isGuest ? undefined : currentUser.id;
      const data = await fetchPortalBootstrap(reqUserId);
      if (cancelled || !data) {
        portalBootstrappedRef.current = true;
        return;
      }

      setServerHasAdmin(Boolean(data.hasAnyAdmin));

      const nextSettings =
        data.cms.systemSettings && Object.keys(data.cms.systemSettings).length > 0
          ? { ...INITIAL_SETTINGS, ...data.cms.systemSettings }
          : systemSettings;

      const hydratedCms = {
        systemSettings: nextSettings,
        moduleCustomizations: data.cms.moduleCustomizations || {},
        extraModules: data.cms.extraModules || [],
        subjectCustomizations: data.cms.subjectCustomizations || {},
        customSubjects: data.cms.customSubjects || [],
        deletedSubjectIds: data.cms.deletedSubjectIds || [],
        syllabusCustomizations: data.cms.syllabusCustomizations || {},
        extraSyllabusRows: data.cms.extraSyllabusRows || [],
        assessmentCustomizations: data.cms.assessmentCustomizations || {},
        deletedAssessmentIds: data.cms.deletedAssessmentIds || []
      };

      lastSyncedCmsJsonRef.current = JSON.stringify(hydratedCms);

      if (data.cms.systemSettings && Object.keys(data.cms.systemSettings).length > 0) {
        setSystemSettings(nextSettings);
      }
      setModuleCustomizations(hydratedCms.moduleCustomizations);
      setExtraModules(hydratedCms.extraModules);
      setSubjectCustomizations(hydratedCms.subjectCustomizations);
      setCustomSubjects(hydratedCms.customSubjects);
      setDeletedSubjectIds(hydratedCms.deletedSubjectIds);
      setSyllabusCustomizations(hydratedCms.syllabusCustomizations);
      setExtraSyllabusRows(hydratedCms.extraSyllabusRows);
      setAssessmentCustomizations(hydratedCms.assessmentCustomizations);
      setDeletedAssessmentIds(hydratedCms.deletedAssessmentIds);

      if (data.certificates) {
        setCertificates(data.certificates);
      }

      if (data.sessionUser) {
        const normalizedSession: UserProfile = {
          ...data.sessionUser,
          isGuest: false,
          whatsappReminder: {
            ...DEFAULT_WHATSAPP_REMINDER,
            ...(data.sessionUser.whatsappReminder || {})
          }
        };
        if (data.sessionProgress) {
          lastSyncedProgressJsonRef.current = JSON.stringify(data.sessionProgress);
        }
        setCurrentUser(normalizedSession);

        if (data.adminData) {
          setAllUsers(data.adminData.users || []);
          setUserProgress((prev) => ({
            ...prev,
            ...(data.adminData?.progressByUser || {})
          }));
          setCertificateAuditLogs(data.adminData.certificateAuditLogs || []);
        } else if (data.sessionProgress) {
          setUserProgress((prev) => ({
            ...prev,
            [normalizedSession.id]: data.sessionProgress!
          }));
        }
      } else if (!currentUser.isGuest && !isSupabaseConfigured()) {
        // Clear stale non-server session so public/multi-device state remains clean
        setCurrentUser(createGuestUser());
      }

      portalBootstrappedRef.current = true;
    };

    void bootstrapPortal();
    return () => {
      cancelled = true;
    };
    // Run once on initial mount to hydrate shared server state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatically sync active user's progress changes to server database
  const activeUserProgress = userProgress[currentUser.id];
  useEffect(() => {
    if (!portalBootstrappedRef.current || currentUser.isGuest || !activeUserProgress) return;
    const serialized = JSON.stringify(activeUserProgress);
    if (serialized === lastSyncedProgressJsonRef.current) return;

    const timer = setTimeout(() => {
      lastSyncedProgressJsonRef.current = serialized;
      void syncUserProgressToServer(currentUser.id, activeUserProgress);
      if (isSupabaseConfigured()) {
        void saveProgressSnapshotToSupabase(currentUser.id, activeUserProgress);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [activeUserProgress, currentUser.id, currentUser.isGuest]);

  // Automatically sync staff CMS customizations (modul, kurikulum, silabus, bank soal, pengaturan) to server & Supabase
  useEffect(() => {
    if (
      !portalBootstrappedRef.current ||
      currentUser.isGuest ||
      (currentUser.role !== 'admin' && currentUser.role !== 'pengajar')
    ) {
      return;
    }

    const cmsPayload = {
      systemSettings,
      moduleCustomizations,
      extraModules,
      subjectCustomizations,
      customSubjects,
      deletedSubjectIds,
      syllabusCustomizations,
      extraSyllabusRows,
      assessmentCustomizations,
      deletedAssessmentIds
    };

    const serialized = JSON.stringify(cmsPayload);
    if (serialized === lastSyncedCmsJsonRef.current) return;

    const timer = setTimeout(() => {
      lastSyncedCmsJsonRef.current = serialized;
      void syncCmsToServer({
        actorId: currentUser.id,
        ...cmsPayload
      });
      if (isSupabaseConfigured()) {
        void saveCmsToSupabase(cmsPayload);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [
    assessmentCustomizations,
    currentUser.id,
    currentUser.isGuest,
    currentUser.role,
    customSubjects,
    deletedAssessmentIds,
    deletedSubjectIds,
    extraModules,
    extraSyllabusRows,
    moduleCustomizations,
    subjectCustomizations,
    syllabusCustomizations,
    systemSettings
  ]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser,
        currentNav,
        setCurrentNav,
        selectedDay,
        setSelectedDay,
        userProgress,
        currentProgress,
        markDayComplete,
        submitDailyQuiz,
        submitWeeklyAssessment,
        submitMonthlyAssessment,
        submitFinalAssessment,
        submitRemedialRequest,
        updateRemedialStatus,
        moduleCustomizations,
        extraModules,
        resolvedModules,
        updateModuleContent,
        resetModuleContent,
        addExtraModule,
        deleteExtraModule,
        resolvedSubjects,
        upsertSubject,
        deleteSubject,
        resetSubjectsToDefault,
        resolvedSyllabus,
        updateSyllabusRow,
        addSyllabusRow,
        deleteExtraSyllabusRow,
        resolvedWeeklyAssessments,
        resolvedMonthlyAssessments,
        resolvedFinalAssessment,
        upsertAssessment,
        deleteAssessment,
        resetAssessment,
        submitReflectionEssay,
        gradeReflectionEssay,
        systemSettings,
        updateSystemSettings,
        certificates,
        certificateAuditLogs,
        issueCertificate,
        revokeCertificate,
        restoreCertificate,
        registerNewUser,
        verifyLocalLogin,
        hasAnyAdmin,
        setupInitialAdmin,
        changeLocalPassword,
        updateCurrentUserProfile,
        whatsappGatewayStatus,
        updateWhatsappReminderSettings,
        dueWhatsappReminder,
        dismissDueWhatsappReminder,
        triggerWhatsappReminderNow,
        triggerDailyWisdomNow,
        logout,
        addUserByAdmin,
        editUserByAdmin,
        deleteUserByAdmin,
        hydrateSupabaseSessionUser,
        addAnnouncement,
        toggleAnnouncement,
        deleteAnnouncement,
        restoreFromBackup,
        getBackupPayload,
        adminBypassSchedule,
        setAdminBypassSchedule,
        getMaxUnlockedDay,
        isDayUnlocked,
        getNextUnlockCountdown,
        calculateStudentGrades
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
