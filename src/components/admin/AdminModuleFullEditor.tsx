import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LearningModule, QuizQuestion } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Save,
  Eye,
  RotateCcw,
  Check,
  FileText,
  Sparkles,
  Video,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export const AdminModuleFullEditor: React.FC = () => {
  const {
    resolvedModules,
    resolvedSubjects,
    moduleCustomizations,
    extraModules,
    updateModuleContent,
    resetModuleContent,
    addExtraModule,
    deleteExtraModule,
    setSelectedDay,
    setCurrentNav
  } = useApp();

  const [selectedDayNum, setSelectedDayNum] = useState<number>(resolvedModules[0]?.day || 1);
  const [editorSubTab, setEditorSubTab] = useState<'identitas' | 'materi' | 'aplikasi' | 'kuis'>('identitas');
  const [notice, setNotice] = useState<{ type: 'ok' | 'info' | 'err'; text: string } | null>(null);

  // Add new extra module form
  const [showNewModuleForm, setShowNewModuleForm] = useState(false);
  const [newModDay, setNewModDay] = useState<number>(() => {
    const maxDay = resolvedModules.reduce((mx, m) => Math.max(mx, m.day), 90);
    return maxDay + 1;
  });
  const [newModTitle, setNewModTitle] = useState('');
  const [newModSubjectId, setNewModSubjectId] = useState<string>(resolvedSubjects[0]?.id || 'alquran');

  // Inline confirm for reset/delete
  const [confirmAction, setConfirmAction] = useState<'reset' | 'delete' | null>(null);

  const activeModule =
    resolvedModules.find((m) => m.day === selectedDayNum) || resolvedModules[0];
  const isExtraDay = extraModules.some((m) => m.day === activeModule?.day);
  const isCustomized = Boolean(moduleCustomizations[activeModule?.day || 0]);

  // Form Draft matching all 18 module components
  const [draft, setDraft] = useState<LearningModule>(activeModule);

  useEffect(() => {
    if (activeModule) {
      setDraft({
        ...activeModule,
        indicators: [...(activeModule.indicators || [])],
        contentSections: (activeModule.contentSections || []).map((s) => ({ ...s })),
        lifeApplication: [...(activeModule.lifeApplication || [])],
        keyTakeaways: [...(activeModule.keyTakeaways || [])],
        references: [...(activeModule.references || [])],
        quiz: (activeModule.quiz || []).map((q) => ({
          ...q,
          options: q.options ? [...q.options] : ['', '', '', '']
        })),
        quranVerse: activeModule.quranVerse
          ? { ...activeModule.quranVerse }
          : { arabic: '', latin: '', translation: '', surah: '', ayah: '' },
        hadith: activeModule.hadith
          ? { ...activeModule.hadith }
          : { arabic: '', translation: '', narrator: '', source: '', status: 'Shahih' },
        scholarNote: activeModule.scholarNote
          ? { ...activeModule.scholarNote }
          : { scholar: '', book: '', quote: '' }
      });
      setConfirmAction(null);
    }
  }, [selectedDayNum, activeModule]);

  const showTempNotice = (type: 'ok' | 'info' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSaveFullModule = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!draft) return;

    const cleanedQuran =
      draft.quranVerse && (draft.quranVerse.arabic.trim() || draft.quranVerse.translation.trim())
        ? draft.quranVerse
        : undefined;
    const cleanedHadith =
      draft.hadith && draft.hadith.translation.trim() ? draft.hadith : undefined;
    const cleanedScholar =
      draft.scholarNote && draft.scholarNote.quote.trim() ? draft.scholarNote : undefined;

    const payload: Partial<LearningModule> = {
      title: draft.title.trim() || activeModule.title,
      subjectId: draft.subjectId,
      month: draft.month,
      isPublished: draft.isPublished !== false,
      learningGoal: draft.learningGoal,
      competence: draft.competence,
      indicators: draft.indicators.filter((x) => x.trim() !== ''),
      introduction: draft.introduction,
      contentSections: draft.contentSections.filter(
        (s) => s.heading.trim() !== '' || s.body.trim() !== ''
      ),
      quranVerse: cleanedQuran,
      hadith: cleanedHadith,
      scholarNote: cleanedScholar,
      lifeApplication: draft.lifeApplication.filter((x) => x.trim() !== ''),
      keyTakeaways: draft.keyTakeaways.filter((x) => x.trim() !== ''),
      references: draft.references.filter((x) => x.trim() !== ''),
      reflectionExercise: draft.reflectionExercise,
      summary: draft.summary,
      videoLectureUrl: draft.videoLectureUrl?.trim() || '',
      audioRecitationUrl: draft.audioRecitationUrl?.trim() || '',
      quiz: draft.quiz
    };

    if (isExtraDay) {
      addExtraModule({
        ...activeModule,
        ...payload
      });
    } else {
      updateModuleContent(activeModule.day, payload);
    }

    showTempNotice(
      'ok',
      `Seluruh komponen modul Hari ke-${activeModule.day} berhasil disimpan dan langsung aktif di halaman Materi!`
    );
  };

  const handleCreateExtraModule = (e: React.FormEvent) => {
    e.preventDefault();
    const dayInt = Math.max(1, Math.floor(Number(newModDay)));
    if (resolvedModules.some((m) => m.day === dayInt)) {
      showTempNotice('err', `Hari ke-${dayInt} sudah ada. Pilih nomor hari lain yang belum terpakai.`);
      return;
    }
    if (!newModTitle.trim()) return;

    const created: LearningModule = {
      day: dayInt,
      title: newModTitle.trim(),
      subjectId: newModSubjectId || resolvedSubjects[0]?.id || 'alquran',
      month: dayInt <= 30 ? 1 : dayInt <= 60 ? 2 : 3,
      learningGoal: `Peserta memahami dan mengamalkan pokok bahasan ${newModTitle.trim()} secara terstruktur.`,
      indicators: [
        'Memahami dalil utama dan kaidah inti pembahasan.',
        'Menerapkan langkah amaliyah dalam keseharian.'
      ],
      competence: 'Pemahaman komprehensif & pengamalan adab Islami',
      introduction: `Bismillahirrahmanirrahim. Pada pembelajaran Hari ke-${dayInt} ini kita mengkaji tema "${newModTitle.trim()}" sebagai bekal tazkiyatun nafs dan penguatan iman.`,
      contentSections: [
        {
          heading: '1. Landasan Dalil & Makna Pokok',
          body: 'Uraikan poin-poin utama kajian secara sistematis, merujuk kepada Al-Qur’an, Sunnah Shahihah, dan penjelasan para ulama salaf.'
        }
      ],
      lifeApplication: ['Mengamalkan zikir, tilawah, dan muhasabah harian sesuai tema modul ini.'],
      keyTakeaways: ['Keikhlasan niat dan ittiba’ adalah kunci diterimanya setiap amal ibadah.'],
      reflectionExercise:
        'Tuliskan muhasabah singkat Anda terkait penerapan nilai-nilai materi hari ini dalam keluarga dan aktivitas harian.',
      summary: `Intisari Hari ke-${dayInt}: ${newModTitle.trim()} menuntun hati menuju ketenangan dan ketaatan kepada Allah Ta’ala.`,
      references: ['Kitab Al-Adzkar — Imam An-Nawawi', 'Tafsir Al-Qur’an Al-‘Azhim — Ibnu Katsir'],
      quiz: [
        {
          id: `q_d${dayInt}_1`,
          question: `Apa tujuan utama mempelajari topik "${newModTitle.trim()}" dalam bingkai Healing Qur’ani?`,
          type: 'mcq',
          options: [
            'Meluruskan niat, menenangkan hati, dan mengamalkan sunnah dengan ilmu yang benar',
            'Sekadar menambah wawasan teori tanpa pengamalan',
            'Mencari perdebatan di tengah masyarakat',
            'Menggantikan kewajiban fardhu ain dengan amalan sunnah'
          ],
          correctAnswer: 0,
          explanation:
            'Ilmu syar’i dituntut untuk diamalkan, meluruskan niat ikhlas karena Allah, dan menumbuhkan ketenangan hati (thuma’ninah).',
          points: 2
        }
      ],
      isPublished: true
    };

    addExtraModule(created);
    setSelectedDayNum(dayInt);
    setShowNewModuleForm(false);
    setNewModTitle('');
    setNewModDay(dayInt + 1);
    showTempNotice('ok', `Modul baru Hari ke-${dayInt} ("${created.title}") berhasil dibuat!`);
  };

  // List helpers
  const updateListItem = (
    field: 'indicators' | 'lifeApplication' | 'keyTakeaways' | 'references',
    index: number,
    value: string
  ) => {
    setDraft((prev) => {
      const copy = [...prev[field]];
      copy[index] = value;
      return { ...prev, [field]: copy };
    });
  };

  const addListItem = (field: 'indicators' | 'lifeApplication' | 'keyTakeaways' | 'references') => {
    setDraft((prev) => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeListItem = (
    field: 'indicators' | 'lifeApplication' | 'keyTakeaways' | 'references',
    index: number
  ) => {
    setDraft((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Content sections helpers
  const updateSection = (idx: number, key: 'heading' | 'body', val: string) => {
    setDraft((prev) => {
      const next = prev.contentSections.map((sec, i) =>
        i === idx ? { ...sec, [key]: val } : sec
      );
      return { ...prev, contentSections: next };
    });
  };

  const addSection = () => {
    setDraft((prev) => ({
      ...prev,
      contentSections: [
        ...prev.contentSections,
        { heading: `${prev.contentSections.length + 1}. Sub-Pembahasan Baru`, body: '' }
      ]
    }));
  };

  const removeSection = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      contentSections: prev.contentSections.filter((_, i) => i !== idx)
    }));
  };

  // Quiz question helpers (Daily A-D quiz)
  const addQuizQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_d${draft.day}_${Date.now()}`,
      question: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 2
    };
    setDraft((prev) => ({
      ...prev,
      quiz: [...prev.quiz, newQ]
    }));
  };

  const updateQuizQuestion = (qIdx: number, partial: Partial<QuizQuestion>) => {
    setDraft((prev) => ({
      ...prev,
      quiz: prev.quiz.map((q, i) => (i === qIdx ? { ...q, ...partial } : q))
    }));
  };

  const updateQuizOption = (qIdx: number, optIdx: number, val: string) => {
    setDraft((prev) => ({
      ...prev,
      quiz: prev.quiz.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...(q.options || ['', '', '', ''])];
        while (opts.length < 4) opts.push('');
        opts[optIdx] = val;
        return { ...q, options: opts };
      })
    }));
  };

  const removeQuizQuestion = (qIdx: number) => {
    setDraft((prev) => ({
      ...prev,
      quiz: prev.quiz.filter((_, i) => i !== qIdx)
    }));
  };

  if (!draft) return null;

  return (
    <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>CMS Lengkap 18 Komponen Modul & Bank Kuis Harian</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Editor Seluruh Modul Pembelajaran ({resolvedModules.length} Hari)
          </h3>
          <p className="text-xs text-slate-600">
            Ubah materi pokok, dalil Al-Qur’an & Hadits, penjelasan ulama, media video/audio, latihan refleksi, hingga butir soal A–D kuis harian atau tambah modul hari baru.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDayNum}
            onChange={(e) => setSelectedDayNum(Number(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 max-w-[260px]"
          >
            {resolvedModules.map((m) => (
              <option key={m.day} value={m.day}>
                Hari ke-{m.day} — {m.title.slice(0, 32)}
                {m.title.length > 32 ? '…' : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              const maxDay = resolvedModules.reduce((mx, m) => Math.max(mx, m.day), 90);
              setNewModDay(maxDay + 1);
              setShowNewModuleForm(!showNewModuleForm);
            }}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Modul Baru</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedDay(selectedDayNum);
              setCurrentNav('materi');
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau</span>
          </button>
        </div>
      </div>

      {/* Create Extra Module Drawer */}
      {showNewModuleForm && (
        <form
          onSubmit={handleCreateExtraModule}
          className="p-4 sm:p-5 rounded-xl bg-amber-50/60 border border-amber-300 space-y-3 text-xs"
        >
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-amber-700" />
            <span>Buat Modul Pembelajaran Hari Baru (Ekstra / Lanjutan)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor Hari:</label>
              <input
                type="number"
                min={1}
                value={newModDay}
                onChange={(e) => setNewModDay(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Judul Modul Baru:</label>
              <input
                type="text"
                placeholder="Contoh: Pendalaman Adab Penuntut Ilmu"
                value={newModTitle}
                onChange={(e) => setNewModTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mata Pelajaran:</label>
              <select
                value={newModSubjectId}
                onChange={(e) => setNewModSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold"
              >
                {resolvedSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewModuleForm(false)}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg cursor-pointer"
            >
              Buat & Edit Modul Ini
            </button>
          </div>
        </form>
      )}

      {/* Feedback Banner */}
      {notice && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            notice.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : notice.type === 'err'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          {notice.type === 'ok' ? (
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Sub-Tabs for 18 Components */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {[
            { id: 'identitas', label: '1. Identitas & Capaian', icon: FileText },
            { id: 'materi', label: '2. Uraian Materi & Dalil', icon: BookOpen },
            { id: 'aplikasi', label: '3. Aplikasi, Refleksi & Media', icon: Video },
            { id: 'kuis', label: `4. Bank Soal Kuis (${draft.quiz.length})`, icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setEditorSubTab(tab.id as typeof editorSubTab)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                  editorSubTab === tab.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {isExtraDay ? (
            confirmAction === 'delete' ? (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                <span className="text-red-800 font-semibold">Hapus Hari {draft.day}?</span>
                <button
                  type="button"
                  onClick={() => {
                    deleteExtraModule(draft.day);
                    setSelectedDayNum(1);
                    setConfirmAction(null);
                    showTempNotice('info', `Modul tambahan Hari ke-${draft.day} dihapus.`);
                  }}
                  className="px-2 py-0.5 bg-red-700 text-white rounded font-bold cursor-pointer"
                >
                  Ya
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-2 py-0.5 bg-white text-slate-600 border rounded cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmAction('delete')}
                className="px-2.5 py-1.5 text-red-700 hover:bg-red-50 border border-red-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Modul Tambahan</span>
              </button>
            )
          ) : (
            isCustomized &&
            (confirmAction === 'reset' ? (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                <span className="text-amber-900 font-semibold">Reset Hari {draft.day}?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetModuleContent(draft.day);
                    setConfirmAction(null);
                    showTempNotice('info', `Modul Hari ke-${draft.day} dikembalikan ke isi bawaan.`);
                  }}
                  className="px-2 py-0.5 bg-amber-700 text-white rounded font-bold cursor-pointer"
                >
                  Ya, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-2 py-0.5 bg-white text-slate-600 border rounded cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmAction('reset')}
                className="px-2.5 py-1.5 text-amber-800 hover:bg-amber-50 border border-amber-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Bawaan</span>
              </button>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleSaveFullModule} className="space-y-5 text-xs">
        {/* SUBTAB 1: IDENTITAS & CAPAIAN */}
        {editorSubTab === 'identitas' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Judul Modul Pembelajaran:</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mata Pelajaran:</label>
                <select
                  value={draft.subjectId}
                  onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                >
                  {resolvedSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kelompok Bulan:</label>
                <select
                  value={draft.month}
                  onChange={(e) => setDraft({ ...draft, month: Number(e.target.value) as 1 | 2 | 3 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                >
                  <option value={1}>Bulan 1 (Fondasi)</option>
                  <option value={2}>Bulan 2 (Pembinaan)</option>
                  <option value={3}>Bulan 3 (Pematangan)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tujuan Pembelajaran Khusus:</label>
                <textarea
                  rows={3}
                  value={draft.learningGoal}
                  onChange={(e) => setDraft({ ...draft, learningGoal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kompetensi Inti Lulusan:</label>
                <textarea
                  rows={3}
                  value={draft.competence}
                  onChange={(e) => setDraft({ ...draft, competence: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Indicators list */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">Indikator Pencapaian ({draft.indicators.length})</label>
                <button
                  type="button"
                  onClick={() => addListItem('indicators')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Tambah Indikator
                </button>
              </div>
              {draft.indicators.map((ind, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    value={ind}
                    onChange={(e) => updateListItem('indicators', idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem('indicators', idx)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/80 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.isPublished !== false}
                onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })}
                className="rounded text-emerald-800 focus:ring-emerald-700"
              />
              <div>
                <div className="font-bold text-slate-900">
                  Status Terbit Modul: {draft.isPublished !== false ? 'Aktif (Tersedia untuk Peserta)' : 'Draft (Disembunyikan)'}
                </div>
                <span className="text-[11px] text-slate-600">
                  Nonaktifkan sementara jika modul sedang direvisi oleh tim kurikulum.
                </span>
              </div>
            </label>
          </div>
        )}

        {/* SUBTAB 2: URAIAN MATERI & DALIL */}
        {editorSubTab === 'materi' && (
          <div className="space-y-5">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pendahuluan / Muqaddimah Materi:</label>
              <textarea
                rows={3}
                value={draft.introduction}
                onChange={(e) => setDraft({ ...draft, introduction: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {/* Content Sections */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Sub-Bab Uraian Materi ({draft.contentSections.length} Bagian)
                </span>
                <button
                  type="button"
                  onClick={addSection}
                  className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Sub-Bagian
                </button>
              </div>
              {draft.contentSections.map((sec, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sec.heading}
                      onChange={(e) => updateSection(idx, 'heading', e.target.value)}
                      placeholder="Judul Sub-Bagian..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Hapus sub-bagian"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={sec.body}
                    onChange={(e) => updateSection(idx, 'body', e.target.value)}
                    placeholder="Isi penjelasan lengkap..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              ))}
            </div>

            {/* Quran Verse */}
            <div className="p-4 rounded-xl bg-[#F6FBF8] border border-emerald-900/15 space-y-3">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" /> Dalil Ayat Al-Qur’an (Opsional — kosongkan jika tidak ada)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Nama Surah (contoh: Al-Baqarah)"
                  value={draft.quranVerse?.surah || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      quranVerse: { ...(draft.quranVerse || { arabic: '', translation: '', surah: '', ayah: '' }), surah: e.target.value }
                    })
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Nomor Ayat (contoh: 152)"
                  value={draft.quranVerse?.ayah || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      quranVerse: { ...(draft.quranVerse || { arabic: '', translation: '', surah: '', ayah: '' }), ayah: e.target.value }
                    })
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <textarea
                rows={2}
                dir="rtl"
                placeholder="Teks Arab Ayat..."
                value={draft.quranVerse?.arabic || ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    quranVerse: { ...(draft.quranVerse || { arabic: '', translation: '', surah: '', ayah: '' }), arabic: e.target.value }
                  })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-arabic text-base"
              />
              <input
                type="text"
                placeholder="Transliterasi Latin (opsional)..."
                value={draft.quranVerse?.latin || ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    quranVerse: { ...(draft.quranVerse || { arabic: '', translation: '', surah: '', ayah: '' }), latin: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg italic"
              />
              <textarea
                rows={2}
                placeholder="Terjemah Bahasa Indonesia..."
                value={draft.quranVerse?.translation || ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    quranVerse: { ...(draft.quranVerse || { arabic: '', translation: '', surah: '', ayah: '' }), translation: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>

            {/* Hadith */}
            <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-2.5">
              <span className="font-bold text-amber-950 block">Dalil Hadits Nabawi (Opsional)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Perawi (contoh: Abu Hurairah)"
                  value={draft.hadith?.narrator || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      hadith: { ...(draft.hadith || { translation: '', narrator: '', source: '', status: 'Shahih' }), narrator: e.target.value }
                    })
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Sumber Kitab (contoh: HR. Muslim)"
                  value={draft.hadith?.source || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      hadith: { ...(draft.hadith || { translation: '', narrator: '', source: '', status: 'Shahih' }), source: e.target.value }
                    })
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Derajat (contoh: Shahih)"
                  value={draft.hadith?.status || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      hadith: { ...(draft.hadith || { translation: '', narrator: '', source: '', status: 'Shahih' }), status: e.target.value }
                    })
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <textarea
                rows={2}
                dir="rtl"
                placeholder="Matan Arab Hadits (opsional)..."
                value={draft.hadith?.arabic || ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    hadith: { ...(draft.hadith || { translation: '', narrator: '', source: '', status: 'Shahih' }), arabic: e.target.value }
                  })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-arabic text-base"
              />
              <textarea
                rows={2}
                placeholder="Terjemah Hadits..."
                value={draft.hadith?.translation || ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    hadith: { ...(draft.hadith || { translation: '', narrator: '', source: '', status: 'Shahih' }), translation: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>

            {/* Scholar Note */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="font-bold text-slate-900 block">Mutiara Hikmah / Penjelasan Ulama Salaf (Opsional)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Nama Ulama (contoh: Imam Ibnul Qayyim)"
                  value={draft.scholarNote?.scholar || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      scholarNote: { ...(draft.scholarNote || { scholar: '', book: '', quote: '' }), scholar: e.target.value }
                    })
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Judul Kitab (contoh: Madarijus Salikin)"
                  value={draft.scholarNote?.book || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      scholarNote: { ...(draft.scholarNote || { scholar: '', book: '', quote: '' }), book: e.target.value }
                    })
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Kutipan nasihat ulama..."
                value={draft.scholarNote?.quote || ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    scholarNote: { ...(draft.scholarNote || { scholar: '', book: '', quote: '' }), quote: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* SUBTAB 3: APLIKASI, REFLEKSI & MEDIA */}
        {editorSubTab === 'aplikasi' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Life Application */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Langkah Pengamalan Nyata</span>
                  <button
                    type="button"
                    onClick={() => addListItem('lifeApplication')}
                    className="px-2 py-1 bg-white border border-emerald-200 text-emerald-800 rounded font-semibold cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
                {draft.lifeApplication.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateListItem('lifeApplication', idx, e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem('lifeApplication', idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Key Takeaways */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Poin Inti (Key Takeaways)</span>
                  <button
                    type="button"
                    onClick={() => addListItem('keyTakeaways')}
                    className="px-2 py-1 bg-white border border-emerald-200 text-emerald-800 rounded font-semibold cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
                {draft.keyTakeaways.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateListItem('keyTakeaways', idx, e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem('keyTakeaways', idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* References */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Daftar Referensi & Kitab Rujukan</span>
                <button
                  type="button"
                  onClick={() => addListItem('references')}
                  className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 rounded font-semibold cursor-pointer"
                >
                  + Tambah Referensi
                </button>
              </div>
              {draft.references.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateListItem('references', idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem('references', idx)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Instruksi Latihan / Refleksi Jiwa (Muhasabah):
              </label>
              <textarea
                rows={3}
                value={draft.reflectionExercise}
                onChange={(e) => setDraft({ ...draft, reflectionExercise: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Ringkasan Inti Modul (Kesimpulan Pembelajaran):
              </label>
              <textarea
                rows={2}
                value={draft.summary}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tautan Video Kajian Pendalaman (YouTube / MP4):
                </label>
                <input
                  type="text"
                  value={draft.videoLectureUrl || ''}
                  onChange={(e) => setDraft({ ...draft, videoLectureUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tautan Audio Tilawah Kustom (MP3 — Opsional Override Qori):
                </label>
                <input
                  type="text"
                  value={draft.audioRecitationUrl || ''}
                  onChange={(e) => setDraft({ ...draft, audioRecitationUrl: e.target.value })}
                  placeholder="https://everyayah.com/data/...mp3"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: BANK SOAL KUIS HARIAN (A-D) */}
        {editorSubTab === 'kuis' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div>
                <div className="font-bold text-emerald-950">
                  Bank Soal Kuis Harian Hari ke-{draft.day} (Skema Pilihan A, B, C, D)
                </div>
                <div className="text-[11px] text-emerald-800">
                  Aturan penilaian aktif: <strong>2 Poin</strong> untuk jawaban benar dan <strong>1 Poin</strong> untuk jawaban salah.
                </div>
              </div>
              <button
                type="button"
                onClick={addQuizQuestion}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Soal Kuis</span>
              </button>
            </div>

            {draft.quiz.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl text-slate-500">
                Belum ada soal kuis pada modul ini. Klik "Tambah Soal Kuis" di atas untuk menambahkan.
              </div>
            ) : (
              draft.quiz.map((q, qIdx) => {
                const opts = q.options && q.options.length > 0 ? q.options : ['', '', '', ''];
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded">
                        Soal #{qIdx + 1} · (Benar: +2 Poin / Salah: +1 Poin)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeQuizQuestion(qIdx)}
                        className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Pertanyaan:</label>
                      <textarea
                        rows={2}
                        value={q.question}
                        onChange={(e) => updateQuizQuestion(qIdx, { question: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                        const isCorrect = Number(q.correctAnswer) === optIdx;
                        return (
                          <div
                            key={letter}
                            className={`flex items-center gap-2 p-2 rounded-lg border ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-400'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={isCorrect}
                              onChange={() => updateQuizQuestion(qIdx, { correctAnswer: optIdx })}
                              className="text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                              title={`Tandai pilihan ${letter} sebagai kunci jawaban benar`}
                            />
                            <span className="font-bold text-slate-700 w-4">{letter}.</span>
                            <input
                              type="text"
                              value={opts[optIdx] || ''}
                              onChange={(e) => updateQuizOption(qIdx, optIdx, e.target.value)}
                              placeholder={`Pilihan ${letter}...`}
                              className="flex-1 px-2 py-1 bg-transparent border-b border-slate-200 focus:outline-none focus:border-emerald-700"
                              required
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Penjelasan Kunci Jawaban (Ditampilkan setelah peserta menjawab):
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => updateQuizQuestion(qIdx, { explanation: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Save Bar */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] text-slate-600">
            Menyimpan perubahan Hari ke-{draft.day} akan langsung memperbarui Materi, Silabus, dan Evaluasi Harian bagi seluruh peserta.
          </span>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Seluruh Perubahan Hari ke-{draft.day}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
