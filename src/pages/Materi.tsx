import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { LearningModule } from '../types';
import { WhatsappReminderCard } from '../components/WhatsappReminderCard';
import {
  QARI_LIST,
  buildQuranAudioPlaylist,
  formatAudioTime
} from '../lib/quranAudio';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Sparkles,
  Bookmark,
  Award,
  Calendar,
  Layers,
  Share2,
  ChevronRight,
  Check,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Video,
  Download,
  Printer,
  Send,
  MessageSquare,
  FileText,
  Lock,
  Clock,
  ShieldAlert,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw,
  MessageCircle
} from 'lucide-react';

export const Materi: React.FC = () => {
  const {
    currentUser,
    selectedDay,
    setSelectedDay,
    currentProgress,
    markDayComplete,
    submitDailyQuiz,
    resolvedModules,
    resolvedSubjects,
    submitReflectionEssay,
    isDayUnlocked,
    getMaxUnlockedDay,
    getNextUnlockCountdown,
    adminBypassSchedule,
    setAdminBypassSchedule
  } = useApp();

  const maxDay = resolvedModules.length > 0 ? Math.max(90, ...resolvedModules.map((m) => m.day)) : 90;
  const hasExtraDays = resolvedModules.some((m) => m.day > 90);

  const activeModule: LearningModule =
    resolvedModules.find((m) => m.day === selectedDay) || resolvedModules[0];

  const currentSubject =
    resolvedSubjects.find((s) => s.id === activeModule.subjectId) || resolvedSubjects[0];

  const isCompleted = currentProgress.completedDays.includes(activeModule.day);
  const isUnlocked = isDayUnlocked(activeModule.day);
  const maxUnlockedDay = getMaxUnlockedDay();

  // Live countdown state ticking every second
  const [countdown, setCountdown] = useState(() => getNextUnlockCountdown(activeModule.day));

  useEffect(() => {
    setCountdown(getNextUnlockCountdown(activeModule.day));
    const timer = setInterval(() => {
      setCountdown(getNextUnlockCountdown(activeModule.day));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModule.day, getNextUnlockCountdown]);

  // Month navigation tab (1, 2, 3, or 4 for extra >90)
  const [activeMonthTab, setActiveMonthTab] = useState<1 | 2 | 3 | 4>(
    activeModule.day > 90 ? 4 : activeModule.day <= 30 ? 1 : activeModule.day <= 60 ? 2 : 3
  );

  // Quiz state (2 poin benar, 1 poin salah)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizEarnedPoints, setQuizEarnedPoints] = useState<number>(0);
  const [quizMaxPoints, setQuizMaxPoints] = useState<number>(0);

  // Audio Player State (Real Qari Tilawah MP3)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedQari, setSelectedQari] = useState<string>(() => {
    return localStorage.getItem('ahq_selected_qari') || 'alafasy';
  });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioPlaylist = useMemo(() => {
    if (activeModule.audioRecitationUrl) {
      return [activeModule.audioRecitationUrl];
    }
    if (!activeModule.quranVerse) return [];
    return buildQuranAudioPlaylist(
      activeModule.quranVerse.surah,
      activeModule.quranVerse.ayah,
      selectedQari
    );
  }, [activeModule.audioRecitationUrl, activeModule.quranVerse, selectedQari]);

  const currentQariObj = QARI_LIST.find((q) => q.id === selectedQari) || QARI_LIST[0];

  // Video Lecture Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // WhatsApp Reminder Panel toggle
  const [showWaReminder, setShowWaReminder] = useState(false);

  // Student Reflection Essay State
  const [reflectionInput, setReflectionInput] = useState('');
  const [reflectionSavedNotice, setReflectionSavedNotice] = useState(false);

  const existingDailyResult = currentProgress.dailyResults[activeModule.day];

  // Sync quiz, essay, and reset audio when activeModule changes
  useEffect(() => {
    const qList = activeModule.quiz || [];
    const maxPts = qList.reduce((acc, q) => acc + (q.points ?? 2), 0);

    if (existingDailyResult) {
      let earned = existingDailyResult.earnedPoints;
      if (earned === undefined) {
        earned = 0;
        qList.forEach((q) => {
          const ans = existingDailyResult.answers?.[q.id];
          if (ans !== undefined) {
            earned! += ans === q.correctAnswer ? (q.points ?? 2) : 1;
          }
        });
        if (Object.keys(existingDailyResult.answers || {}).length === 0 && existingDailyResult.score > 0 && maxPts > 0) {
          earned = Math.round((existingDailyResult.score / 100) * maxPts);
        }
      }
      setQuizSubmitted(true);
      setQuizScore(existingDailyResult.score);
      setQuizEarnedPoints(earned ?? 0);
      setQuizMaxPoints(existingDailyResult.maxPoints ?? maxPts);
      setSelectedAnswers(existingDailyResult.answers || {});
      setReflectionInput(existingDailyResult.reflectionSubmission || '');
    } else {
      setQuizSubmitted(false);
      setQuizScore(null);
      setQuizEarnedPoints(0);
      setQuizMaxPoints(maxPts);
      setSelectedAnswers({});
      setReflectionInput('');
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setAudioLoading(false);
    setAudioProgress(0);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setCurrentTrackIndex(0);
    setAudioError(null);
  }, [activeModule.day, activeModule.quiz, existingDailyResult]);

  // Persist selected Qari & reset track when switching Qari
  const handleSelectQari = (qariId: string) => {
    const wasPlaying = isPlayingAudio;
    setSelectedQari(qariId);
    localStorage.setItem('ahq_selected_qari', qariId);
    setCurrentTrackIndex(0);
    setAudioProgress(0);
    setAudioCurrentTime(0);
    setAudioError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      if (wasPlaying) {
        setTimeout(() => {
          audioRef.current?.play().catch(() => {
            setIsPlayingAudio(false);
          });
        }, 120);
      }
    }
  };

  const handleToggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio || audioPlaylist.length === 0) return;

    setAudioError(null);
    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      try {
        setAudioLoading(true);
        await audio.play();
        setIsPlayingAudio(true);
        setAudioLoading(false);
      } catch {
        setAudioLoading(false);
        setIsPlayingAudio(false);
        setAudioError(
          'Tidak dapat memutar audio tilawah. Pastikan koneksi internet aktif atau periksa izin suara peramban Anda.'
        );
      }
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const m: 1 | 2 | 3 | 4 = day > 90 ? 4 : day <= 30 ? 1 : day <= 60 ? 2 : 3;
    setActiveMonthTab(m);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextDay = () => {
    if (activeModule.day < maxDay) {
      handleSelectDay(activeModule.day + 1);
    }
  };

  const handlePrevDay = () => {
    if (activeModule.day > 1) {
      handleSelectDay(activeModule.day - 1);
    }
  };

  const handleMarkComplete = () => {
    if (!isUnlocked) return;
    markDayComplete(activeModule.day);
  };

  const handleSelectQuizOption = (qId: string, optIndex: number) => {
    if (quizSubmitted || !isUnlocked) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!isUnlocked || !activeModule.quiz || activeModule.quiz.length === 0) return;

    let earnedPoints = 0;
    let totalMaxPoints = 0;

    activeModule.quiz.forEach((q) => {
      const qMax = q.points ?? 2;
      totalMaxPoints += qMax;
      const userAns = selectedAnswers[q.id];
      if (userAns !== undefined) {
        earnedPoints += userAns === q.correctAnswer ? qMax : 1;
      }
    });

    const calculatedScore = totalMaxPoints > 0 ? Math.round((earnedPoints / totalMaxPoints) * 100) : 0;
    setQuizEarnedPoints(earnedPoints);
    setQuizMaxPoints(totalMaxPoints);
    setQuizScore(calculatedScore);
    setQuizSubmitted(true);

    // Save to context with both earnedPoints/maxPoints and normalized percentage
    submitDailyQuiz(activeModule.day, calculatedScore, selectedAnswers, earnedPoints, totalMaxPoints);
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionInput.trim()) return;

    submitReflectionEssay(activeModule.day, reflectionInput.trim());
    setReflectionSavedNotice(true);
    setTimeout(() => setReflectionSavedNotice(false), 4000);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const monthModules = resolvedModules.filter((m) => {
    if (activeMonthTab === 1) return m.day <= 30;
    if (activeMonthTab === 2) return m.day >= 31 && m.day <= 60;
    if (activeMonthTab === 3) return m.day >= 61 && m.day <= 90;
    return m.day > 90;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Day Selector Navigation (No-Print) */}
      <div className="bg-white rounded-2xl border border-emerald-900/15 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        {/* Month Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EBF2EE] rounded-xl text-xs font-semibold border border-emerald-900/10">
          <button
            onClick={() => setActiveMonthTab(1)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeMonthTab === 1 ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan 1: Hari 1–30
          </button>
          <button
            onClick={() => setActiveMonthTab(2)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeMonthTab === 2 ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan 2: Hari 31–60
          </button>
          <button
            onClick={() => setActiveMonthTab(3)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeMonthTab === 3 ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan 3: Hari 61–90
          </button>
          {hasExtraDays && (
            <button
              onClick={() => setActiveMonthTab(4)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeMonthTab === 4 ? 'bg-white text-amber-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lanjutan (&gt;90)
            </button>
          )}
        </div>

        {/* Schedule & Teacher Mode Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          {!isUnlocked ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Hari {activeModule.day} Terkunci · Buka 00.00 WIB</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Jadwal Harian Otomatis (00.00 WIB)</span>
            </div>
          )}

          {(currentUser.role === 'admin' || currentUser.role === 'pengajar') && (
            <button
              onClick={() => setAdminBypassSchedule(!adminBypassSchedule)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                adminBypassSchedule
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title="Aktifkan atau nonaktifkan pembatasan jadwal 00.00 WIB untuk pengajar/admin"
            >
              {adminBypassSchedule ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Bypass Jadwal: Aktif</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Mode Peserta (Sesuai Jadwal)</span>
                </>
              )}
            </button>
          )}

          {/* Prev / Next Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              disabled={activeModule.day <= 1}
              className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Hari Sebelumnya</span>
            </button>

            <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200">
              Hari {activeModule.day} / {maxDay}
            </span>

            <button
              onClick={handleNextDay}
              disabled={activeModule.day >= maxDay}
              className="px-3 py-1.5 rounded-md bg-emerald-800 text-xs font-medium text-white hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>Hari Berikutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowWaReminder(!showWaReminder)}
              className={`px-3 py-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                showWaReminder || currentUser.whatsappReminder?.enabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
              title="Atur pengingat materi via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pengingat WA</span>
            </button>

            <button
              onClick={handlePrintSummary}
              className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Cetak Rangkuman Hari Ini"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Quick Day Strip, Right Module Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Day Selector Sidebar (3 cols on lg, hidden on print) */}
        <div className="lg:col-span-3 space-y-3 no-print">
          <div className="bg-white rounded-2xl border border-emerald-900/15 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-emerald-900/10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                Pilih Modul Hari
              </span>
              <span className="text-[11px] text-emerald-800 font-semibold font-mono bg-emerald-50 px-2 py-0.5 rounded">
                Bulan {activeMonthTab}
              </span>
            </div>

            <div className="max-h-[640px] overflow-y-auto space-y-1.5 pr-1 text-xs">
              {monthModules.map((m) => {
                const isCurrent = m.day === activeModule.day;
                const isDone = currentProgress.completedDays.includes(m.day);
                const mUnlocked = isDayUnlocked(m.day);
                const isTodayActive = m.day === maxUnlockedDay;
                const subj = resolvedSubjects.find((s) => s.id === m.subjectId);

                return (
                  <button
                    key={m.day}
                    onClick={() => handleSelectDay(m.day)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#065F46] text-white font-semibold shadow-sm ring-2 ring-emerald-700/20'
                        : !mUnlocked
                        ? 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100/80 border border-emerald-200/80'
                        : 'hover:bg-emerald-50/60 text-slate-800 border border-transparent hover:border-emerald-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                          isCurrent
                            ? 'bg-emerald-900 text-amber-300'
                            : !mUnlocked
                            ? 'bg-slate-200 text-slate-600'
                            : isDone
                            ? 'bg-emerald-700 text-white'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {m.day}
                      </span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className={`truncate text-xs ${isCurrent ? 'text-white' : !mUnlocked ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                            {m.title}
                          </span>
                          {isTodayActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-400 text-emerald-950 rounded shrink-0">
                              Hari Ini
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[11px] ${
                            isCurrent ? 'text-emerald-100' : 'text-slate-600'
                          }`}
                        >
                          {subj?.name}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {!mUnlocked ? (
                        <span className="text-slate-400" title="Terkunci hingga pukul 00.00 WIB">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      ) : isDone ? (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            isCurrent ? 'text-amber-300' : 'text-emerald-600'
                          }`}
                        />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content Area (9 cols on lg): The 18 Mandatory Items */}
        <div className="lg:col-span-9 space-y-6 print-container">
          {!isUnlocked ? (
            /* ================= LOCKED MODULE BANNER ================= */
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-md p-6 sm:p-10 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-amber-100/40 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-emerald-100/30 blur-2xl pointer-events-none" />

                <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Materi Terkunci Sesuai Jadwal Harian</span>
                  </div>

                  <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-600/20 border-2 border-amber-300 flex items-center justify-center text-amber-800 shadow-inner">
                    <Lock className="w-10 h-10 text-amber-700" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Materi Hari ke-{activeModule.day} Belum Terbuka
                    </h2>
                    <p className="text-base font-semibold text-emerald-900">
                      "{activeModule.title}"
                    </p>
                    <p className="text-xs text-slate-500">
                      Mata Pelajaran: <span className="font-semibold text-slate-700">{currentSubject.name}</span> · Bulan {activeModule.month}
                    </p>
                  </div>

                  {/* Countdown Card Box */}
                  <div className="bg-gradient-to-br from-[#F2F8F5] via-white to-[#FDF9EE] rounded-2xl p-6 text-slate-900 shadow-sm border-2 border-emerald-800/20 space-y-4">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-900">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>JADWAL BUKA OTOMATIS: 00.00 WIB</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto pt-1">
                      <div className="bg-[#064E3B] rounded-xl p-3.5 border border-emerald-900 shadow-xs">
                        <div className="text-2xl sm:text-3xl font-mono font-black text-amber-300">
                          {String(countdown.hoursLeft).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider mt-1">
                          Jam
                        </div>
                      </div>

                      <div className="bg-[#064E3B] rounded-xl p-3.5 border border-emerald-900 shadow-xs">
                        <div className="text-2xl sm:text-3xl font-mono font-black text-amber-300">
                          {String(countdown.minutesLeft).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider mt-1">
                          Menit
                        </div>
                      </div>

                      <div className="bg-[#064E3B] rounded-xl p-3.5 border border-emerald-900 shadow-xs">
                        <div className="text-2xl sm:text-3xl font-mono font-black text-amber-300">
                          {String(countdown.secondsLeft).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider mt-1">
                          Detik
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 pt-1">
                      Target Pembukaan: <span className="text-emerald-900 font-bold">{countdown.targetDateFormatted}</span>
                    </div>
                  </div>

                  {/* Islamic Pedagogical Reason / Hikmah */}
                  <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/80 text-left space-y-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>Hikmah Pembelajaran Bertahap (Tadarruj & Istiqamah)</span>
                    </div>
                    <p className="leading-relaxed">
                      Sesuai pedoman akademik kurikulum 90 hari, materi pembelajaran dibuka bertahap 1 modul per hari setiap pukul 00.00 WIB. Ini bertujuan agar peserta menuntut ilmu syar'i secara tartil, tenang, dan teratur, tanpa melompati materi sebelum waktunya.
                    </p>
                    <p className="leading-relaxed text-emerald-950 font-medium">
                      Silakan manfaatkan waktu hari ini untuk menyelesaikan materi yang telah dibuka, memperdalam tadabur ayat, menuntaskan kuis evaluasi harian, menulis refleksi jiwa (tazkiyatun nafs), serta mengamalkannya dalam kehidupan nyata.
                    </p>
                  </div>

                  {/* Action Recommendations */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => handleSelectDay(maxUnlockedDay)}
                      className="w-full sm:w-auto px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Buka Materi Hari Ini (Hari ke-{maxUnlockedDay})</span>
                    </button>

                    {activeModule.day > 1 && (
                      <button
                        onClick={() => handleSelectDay(Math.max(1, activeModule.day - 1))}
                        className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Muraja'ah Hari ke-{Math.max(1, activeModule.day - 1)}</span>
                      </button>
                    )}
                  </div>

                  {/* Teacher / Admin Bypass Notice */}
                  {(currentUser.role === 'admin' || currentUser.role === 'pengajar') && (
                    <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-2 text-left">
                        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          <strong>Peran Pengajar/Admin:</strong> Anda dapat membuka pratinjau materi ini sekarang untuk kurasi silabus atau penyiapan evaluasi.
                        </span>
                      </div>
                      <button
                        onClick={() => setAdminBypassSchedule(true)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer shadow-2xs"
                      >
                        Buka Pratinjau Sekarang
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <WhatsappReminderCard variant="compact" day={activeModule.day} />
            </div>
          ) : activeModule.isPublished === false && currentUser.role === 'peserta' ? (
            <div className="bg-white rounded-3xl border border-emerald-900/15 p-8 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Modul Hari ke-{activeModule.day} Sedang Dalam Pembaruan
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Materi "{activeModule.title}" sementara dinonaktifkan oleh pengajar/administrator untuk penyesuaian kurikulum. Silakan buka modul hari lain atau hubungi pengajar pembimbing.
              </p>
              <button
                onClick={() => handleSelectDay(Math.max(1, activeModule.day - 1))}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Kembali ke Hari Sebelumnya
              </button>
            </div>
          ) : (
            <>
              {showWaReminder && (
                <div className="no-print">
                  <WhatsappReminderCard variant="compact" day={activeModule.day} />
                </div>
              )}
              {activeModule.isPublished === false && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Mode Pratinjau Pengajar: Modul hari ini sedang berstatus Draft (Dinonaktifkan untuk peserta).
                  </span>
                </div>
              )}

              {/* Item 1, 2, 3: Header Banner with Day, Title, and Subject */}
              <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-900/10">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200">
                      Hari ke-{activeModule.day}
                    </span>
                <span className="text-slate-400">·</span>
                <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {currentSubject.name}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600 font-medium">
                  Bulan {activeModule.month} (
                  {activeModule.month === 1
                    ? 'Fondasi'
                    : activeModule.month === 2
                    ? 'Pendalaman'
                    : 'Penerapan'}
                  )
                </span>
              </div>

              {/* Status & Media Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer no-print"
                >
                  <Video className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Kajian Video</span>
                </button>

                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Selesai Dipelajari</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                    <span>Sedang Dipelajari</span>
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                {activeModule.title}
              </h1>
              <p className="mt-2 text-sm text-emerald-800 font-medium">
                {currentSubject.tagline}
              </p>
            </div>

            {/* Item 4 & 5: Tujuan Pembelajaran & Indikator Keberhasilan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-emerald-900/10">
              <div className="bg-[#F4FAF7] rounded-xl p-4 border border-emerald-800/15 space-y-1.5">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                  Tujuan Pembelajaran
                </span>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {activeModule.learningGoal}
                </p>
              </div>

              <div className="bg-[#F4F9F9] rounded-xl p-4 border border-teal-800/15 space-y-1.5">
                <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block">
                  Indikator Keberhasilan & Capaian
                </span>
                <ul className="text-sm text-slate-800 space-y-1">
                  {activeModule.indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-700 font-bold">·</span>
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Item 6: Pengantar Materi */}
          <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pengantar Materi</span>
            </h3>
            <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed italic bg-[#F7FAF8] p-4 rounded-xl border border-emerald-900/10">
              "{activeModule.introduction}"
            </p>
          </div>

          {/* Item 7: Uraian Materi Sistematis */}
          <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-emerald-900/10 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Uraian Materi Pembelajaran</span>
            </h3>

            <div className="space-y-6 text-sm sm:text-[15px] text-slate-800 leading-relaxed">
              {activeModule.contentSections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                    {sec.heading}
                  </h4>
                  <p className="text-slate-800 leading-relaxed">{sec.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Item 8: Dalil Al-Qur'an (Arabic & Translation) & Audio Recitation Player */}
          {activeModule.quranVerse && (
            <div className="bg-gradient-to-br from-[#F4FAF7] via-[#FFFFFF] to-[#FDF9EE] text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 border border-emerald-800/20 border-t-4 border-t-emerald-800">
              <div className="flex items-center justify-between text-xs text-emerald-900 border-b border-emerald-800/15 pb-3">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Dalil Al-Qur’an Al-Karim</span>
                </span>
                <span className="font-mono font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200">
                  QS. {activeModule.quranVerse.surah}: {activeModule.quranVerse.ayah}
                </span>
              </div>

              {/* Arabic text with crisp emerald manuscript ink */}
              <div
                className="font-arabic text-2xl sm:text-3xl leading-[2.2] text-[#064E3B] text-right py-2"
                dir="rtl"
              >
                {activeModule.quranVerse.arabic}
              </div>

              {/* Translation */}
              <div className="text-sm text-slate-800 leading-relaxed bg-[#F2F8F5] p-4 rounded-xl border-l-4 border-emerald-700">
                <strong className="text-emerald-950 block mb-1 text-xs uppercase tracking-wider">Artinya:</strong>
                "{activeModule.quranVerse.translation}"
              </div>

              {/* Real Audio Recitation Toolbar (EveryAyah Qari MP3 + Tadabbur Voice) */}
              <div className="bg-emerald-50/90 rounded-xl p-4 border border-emerald-200 space-y-3 text-xs no-print">
                <audio
                  ref={audioRef}
                  src={audioPlaylist[currentTrackIndex] || ''}
                  muted={isMuted}
                  preload="metadata"
                  onLoadStart={() => {
                    if (isPlayingAudio) setAudioLoading(true);
                  }}
                  onCanPlay={() => setAudioLoading(false)}
                  onLoadedMetadata={(e) => {
                    const dur = e.currentTarget.duration;
                    if (Number.isFinite(dur)) setAudioDuration(dur);
                  }}
                  onTimeUpdate={(e) => {
                    const cur = e.currentTarget.currentTime;
                    const dur = e.currentTarget.duration;
                    setAudioCurrentTime(cur);
                    if (Number.isFinite(dur) && dur > 0) {
                      setAudioDuration(dur);
                      setAudioProgress((cur / dur) * 100);
                    }
                  }}
                  onEnded={() => {
                    if (currentTrackIndex + 1 < audioPlaylist.length) {
                      const nextIdx = currentTrackIndex + 1;
                      setCurrentTrackIndex(nextIdx);
                      setAudioProgress(0);
                      setTimeout(() => {
                        audioRef.current?.play().catch(() => setIsPlayingAudio(false));
                      }, 80);
                    } else {
                      setIsPlayingAudio(false);
                      setCurrentTrackIndex(0);
                      setAudioProgress(0);
                      setAudioCurrentTime(0);
                    }
                  }}
                  onError={() => {
                    setAudioLoading(false);
                    setIsPlayingAudio(false);
                    setAudioError(
                      'Gagal memuat rekaman audio Qori. Periksa koneksi internet Anda atau coba pilih Qori lainnya.'
                    );
                  }}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleAudio}
                      className="w-10 h-10 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center font-bold cursor-pointer transition-colors shadow-xs shrink-0"
                      title={isPlayingAudio ? 'Jeda Tilawah' : 'Putar Tilawah Qori'}
                    >
                      {audioLoading ? (
                        <RotateCcw className="w-4 h-4 animate-spin" />
                      ) : isPlayingAudio ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <div>
                      <span className="font-bold text-emerald-950 block text-xs sm:text-sm">
                        {isPlayingAudio
                          ? `Memutar Tilawah · ${currentQariObj.name}`
                          : 'Dengarkan Tilawah Al-Qur’an'}
                      </span>
                      <span className="text-[11px] text-emerald-800 block">
                        Qori: <strong>{currentQariObj.name}</strong> ({currentQariObj.style})
                        {audioPlaylist.length > 1 && (
                          <span> · Ayat {currentTrackIndex + 1}/{audioPlaylist.length}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Qari Selector & Mute Control */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedQari}
                      onChange={(e) => handleSelectQari(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-emerald-800/25 rounded-lg text-xs font-semibold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                      aria-label="Pilih Qori Tilawah"
                    >
                      {QARI_LIST.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-800/25 cursor-pointer"
                      title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Seekable Progress Bar & Timestamp */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-semibold text-emerald-950 w-10">
                    {formatAudioTime(audioCurrentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={audioProgress}
                    onChange={(e) => {
                      const pct = Number(e.target.value);
                      setAudioProgress(pct);
                      if (audioRef.current && audioDuration > 0) {
                        audioRef.current.currentTime = (pct / 100) * audioDuration;
                      }
                    }}
                    className="flex-1 accent-emerald-800 cursor-pointer h-1.5"
                    aria-label="Progres audio tilawah"
                  />
                  <span className="font-mono text-[11px] font-semibold text-emerald-950 w-10 text-right">
                    {formatAudioTime(audioDuration)}
                  </span>
                </div>

                {audioError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px] font-medium">
                    {audioError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Item 9: Hadis Nabawi Terverifikasi */}
          {activeModule.hadith && (
            <div className="bg-[#F6FBF9] rounded-2xl border border-emerald-800/20 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-900 border-b border-emerald-800/15 pb-2.5">
                <span className="font-bold uppercase tracking-wider">Hadis Nabawi Terverifikasi</span>
                <span className="font-bold text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-200">
                  Status: {activeModule.hadith.status}
                </span>
              </div>

              {activeModule.hadith.arabic && (
                <div
                  className="font-arabic text-xl sm:text-2xl text-[#064E3B] text-right leading-loose py-1"
                  dir="rtl"
                >
                  {activeModule.hadith.arabic}
                </div>
              )}

              <p className="text-sm text-slate-800 leading-relaxed italic">
                "{activeModule.hadith.translation}"
              </p>

              <div className="text-xs text-emerald-900 pt-1 flex flex-wrap gap-2">
                <span>Perawi: <strong>{activeModule.hadith.narrator}</strong></span>
                <span>·</span>
                <span>Sumber: <strong>{activeModule.hadith.source}</strong></span>
              </div>
            </div>
          )}

          {/* Item 10: Penjelasan Ulama / Referensi Ilmiah */}
          {activeModule.scholarNote && (
            <div className="bg-[#FFFDF5] rounded-2xl border border-amber-700/25 border-l-4 border-l-amber-600 p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                Penjelasan Ulama Mu’tabar
              </span>
              <p className="text-sm text-slate-900 leading-relaxed italic">
                "{activeModule.scholarNote.quote}"
              </p>
              <div className="text-xs text-amber-900 font-medium pt-1 flex flex-wrap items-center justify-between gap-2">
                <span>— {activeModule.scholarNote.scholar}</span>
                <span className="font-mono text-[11px] bg-amber-100/80 px-2 py-0.5 rounded">{activeModule.scholarNote.book}</span>
              </div>
            </div>
          )}

          {/* Item 11 & 12: Contoh Penerapan Nyata & Poin Penting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item 11: Penerapan Nyata */}
            <div className="bg-white rounded-2xl border border-emerald-900/15 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Penerapan dalam Kehidupan Nyata</span>
              </h4>
              <ul className="space-y-2 text-sm text-slate-800">
                {activeModule.lifeApplication.map((app, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Item 12: Poin-Poin Penting */}
            <div className="bg-white rounded-2xl border border-emerald-900/15 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-700" />
                <span>Poin-Poin Inti Pembelajaran</span>
              </h4>
              <ul className="space-y-2 text-sm text-slate-800">
                {activeModule.keyTakeaways.map((key, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-700 font-bold">★</span>
                    <span>{key}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Item 13: Latihan / Refleksi Jiwa dengan Form Pengiriman Uraian & Feedback Pengajar */}
          <div className="bg-[#F4FAF7] rounded-2xl border border-emerald-800/20 p-6 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                Item 13. Latihan Refleksi Batin (Muhasabah & Jawaban Uraian)
              </span>
              <p className="text-sm text-slate-900 leading-relaxed mt-1.5">
                {activeModule.reflectionExercise}
              </p>
            </div>

            {reflectionSavedNotice && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-xs text-emerald-950 font-medium">
                Alhamdulillah! Refleksi harian Anda telah tersimpan dan siap diperiksa oleh Ustadz/Ustadzah pembimbing.
              </div>
            )}

            {/* Submission Form */}
            <form onSubmit={handleSaveReflection} className="space-y-3 no-print">
              <label className="text-xs font-semibold text-slate-800 block">
                Tuliskan Refleksi & Komitmen Aksi Pribadi Anda:
              </label>
              <textarea
                rows={3}
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
                placeholder="Bagikan pengalaman batin, muhasabah pribadi, atau target aksi nyata berdasarkan materi hari ini..."
                className="w-full p-3.5 bg-white border border-emerald-900/20 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs text-slate-600">
                  Refleksi ini akan dicatat dalam portofolio bimbingan belajar Anda.
                </span>
                <button
                  type="submit"
                  disabled={!reflectionInput.trim()}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Jawaban Refleksi</span>
                </button>
              </div>
            </form>

            {/* Feedback Pengajar Display */}
            {existingDailyResult?.essayReview && (
              <div className="mt-4 p-4 rounded-xl bg-white border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-slate-900">
                      Umpan Balik Pengajar: {existingDailyResult.essayReview.reviewedBy}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Nilai Refleksi: {existingDailyResult.essayReview.score}/100
                  </span>
                </div>
                <p className="text-slate-800 italic text-sm">
                  "{existingDailyResult.essayReview.feedback}"
                </p>
                <div className="text-[11px] text-slate-600">
                  Ditinjau pada: {existingDailyResult.essayReview.reviewedAt || 'Terverifikasi'}
                </div>
              </div>
            )}
          </div>

          {/* Item 14: Rangkuman */}
          <div className="bg-white rounded-2xl border border-emerald-900/15 p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
              Item 14. Rangkuman Modul Hari ke-{activeModule.day}
            </span>
            <p className="text-sm text-slate-800 leading-relaxed">
              {activeModule.summary}
            </p>
          </div>

          {/* Item 15: Kuis Harian Interaktif */}
          <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-900/10">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-700" />
                  <span>Item 15. Evaluasi Harian (Pilihan A, B, C, D)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Aturan Poin: <strong>Benar = +2 Poin · Salah = +1 Poin</strong> · Total Maksimal{' '}
                  {activeModule.quiz.reduce((acc, q) => acc + (q.points ?? 2), 0)} Poin ({activeModule.quiz.length} Soal).
                </p>
              </div>

              {quizSubmitted && quizScore !== null ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-600 block">Perolehan Poin Anda:</span>
                    <span
                      className={`text-lg font-bold font-mono ${
                        quizScore >= 75 ? 'text-emerald-800' : 'text-amber-700'
                      }`}
                    >
                      {quizEarnedPoints} / {quizMaxPoints} Poin ({quizScore}%)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800">
                  Maksimal: {activeModule.quiz.reduce((acc, q) => acc + (q.points ?? 2), 0)} Poin
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {activeModule.quiz.map((q, idx) => {
                const userSelected = selectedAnswers[q.id];
                const hasAnswered = userSelected !== undefined;
                const isCorrect = hasAnswered && userSelected === q.correctAnswer;
                const qPoints = q.points ?? 2;
                const qEarned = !hasAnswered ? 0 : isCorrect ? qPoints : 1;
                const optionLetters = ['A', 'B', 'C', 'D'];

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-xl border border-emerald-900/15 bg-[#F7FAF8] space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="text-sm font-bold text-slate-900 flex-1">
                        Soal {idx + 1}. {q.question}
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-lg font-mono text-xs font-bold border ${
                          quizSubmitted
                            ? isCorrect
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : hasAnswered
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-white text-emerald-900 border-emerald-800/20'
                        }`}
                      >
                        {quizSubmitted
                          ? isCorrect
                            ? `+${qEarned} Poin (Benar)`
                            : hasAnswered
                            ? `+${qEarned} Poin (Salah)`
                            : `0 Poin (Kosong)`
                          : `Benar +${qPoints} · Salah +1 Poin`}
                      </span>
                    </div>

                    {/* Options A, B, C, D */}
                    <div className="space-y-2">
                      {q.options?.map((opt, optIdx) => {
                        const letter = optionLetters[optIdx] || String.fromCharCode(65 + optIdx);
                        const isChosen = userSelected === optIdx;
                        const isRightOption = optIdx === q.correctAnswer;
                        let optionStyle =
                          'bg-white border-slate-300/80 text-slate-800 hover:bg-emerald-50/70 hover:border-emerald-400';
                        let letterBadgeStyle = 'bg-slate-100 text-slate-800 border-slate-300';

                        if (quizSubmitted) {
                          if (isRightOption) {
                            optionStyle = 'bg-emerald-100 border-emerald-600 text-emerald-950 font-semibold';
                            letterBadgeStyle = 'bg-emerald-700 text-white border-emerald-800';
                          } else if (isChosen && !isCorrect) {
                            optionStyle = 'bg-amber-50 border-amber-400 text-amber-950';
                            letterBadgeStyle = 'bg-amber-600 text-white border-amber-700';
                          } else {
                            optionStyle = 'bg-white border-slate-200 text-slate-500';
                            letterBadgeStyle = 'bg-slate-100 text-slate-500 border-slate-200';
                          }
                        } else if (isChosen) {
                          optionStyle = 'bg-emerald-50 border-emerald-700 text-emerald-950 font-semibold shadow-2xs';
                          letterBadgeStyle = 'bg-emerald-800 text-white border-emerald-900';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => handleSelectQuizOption(q.id, optIdx)}
                            className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${optionStyle}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-7 h-7 rounded-md border font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${letterBadgeStyle}`}
                              >
                                {letter}
                              </span>
                              <span>{opt}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {quizSubmitted ? (
                                isRightOption ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-700 text-white font-mono text-[11px] font-bold">
                                    <Check className="w-3 h-3" />+{qPoints} Poin
                                  </span>
                                ) : isChosen ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold">
                                    +1 Poin
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-mono text-slate-400">+1 Poin (Salah)</span>
                                )
                              ) : (
                                <span
                                  className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold border ${
                                    isChosen
                                      ? 'bg-emerald-800 text-white border-emerald-900'
                                      : 'bg-slate-50 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  +2 / +1 Poin
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation if submitted */}
                    {quizSubmitted && (
                      <div className="pt-2 text-xs sm:text-sm text-slate-800 bg-white p-3.5 rounded-lg border border-emerald-200 space-y-1">
                        <strong className="text-emerald-900 block">Pembahasan:</strong>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Submit Button / Retake */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
              <span className="text-xs text-slate-600">
                {quizSubmitted
                  ? 'Jawaban Anda telah tersimpan ke dalam progres belajar.'
                  : 'Pilih opsi A, B, C, atau D (Benar +2 poin, Salah +1 poin), lalu klik Kirim Jawaban.'}
              </span>

              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-5 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Kirim Jawaban Kuis
                </button>
              ) : (
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizScore(null);
                    setQuizEarnedPoints(0);
                    setSelectedAnswers({});
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 font-medium text-xs transition-colors cursor-pointer"
                >
                  Ulangi Kuis Hari Ini
                </button>
              )}
            </div>
          </div>

          {/* Item 16: Daftar Referensi */}
          <div className="bg-white rounded-2xl border border-emerald-900/15 p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Item 16. Daftar Referensi & Rujukan Muktabar
            </span>
            <ul className="text-xs sm:text-sm text-slate-700 space-y-1.5">
              {activeModule.references.map((ref, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">·</span>
                  <span>{ref}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Item 17 & 18: Tombol Tandai Selesai & Materi Berikutnya */}
          <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
            <button
              onClick={handleMarkComplete}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isCompleted ? 'Item 17: Materi Sudah Selesai' : 'Item 17: Tandai Selesai'}</span>
            </button>

            <button
              onClick={handleNextDay}
              disabled={activeModule.day >= maxDay}
              className="px-5 py-2.5 rounded-lg bg-[#064E3B] hover:bg-emerald-950 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Item 18: Lanjut Hari ke-{Math.min(maxDay, activeModule.day + 1)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
            </>
          )}
        </div>
      </div>

      {/* VIDEO LECTURE MODAL */}
      {videoModalOpen && (() => {
        const rawUrl = (activeModule.videoLectureUrl || '').trim();
        let youtubeEmbedUrl: string | null = null;
        if (rawUrl) {
          const ytMatch = rawUrl.match(
            /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
          );
          if (ytMatch && ytMatch[1]) {
            youtubeEmbedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
          }
        }
        const isDirectVideoFile = /\.(mp4|webm|ogg)(\?.*)?$/i.test(rawUrl);

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Kajian Video Pembelajaran
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Hari ke-{activeModule.day}: {activeModule.title}
                  </h3>
                </div>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              {/* Real Video Player / Configured Stream */}
              <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center text-white">
                {youtubeEmbedUrl ? (
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`Video Kajian Hari ke-${activeModule.day}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isDirectVideoFile && rawUrl ? (
                  <video src={rawUrl} controls className="w-full h-full object-contain" />
                ) : rawUrl ? (
                  <div className="text-center space-y-3 p-6">
                    <Video className="w-10 h-10 text-emerald-400 mx-auto" />
                    <div className="text-sm font-bold">Tautan Video Kajian Tersedia</div>
                    <a
                      href={rawUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xs font-bold text-white"
                    >
                      <Play className="w-4 h-4" />
                      <span>Buka Video Kajian</span>
                    </a>
                  </div>
                ) : (
                  <div className="text-center space-y-2.5 p-6 max-w-md">
                    <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mx-auto border border-slate-700">
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-white">
                      Belum Ada Video Kajian untuk Hari ke-{activeModule.day}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Pengajar dapat menambahkan tautan YouTube atau file video pembelajaran melalui panel Kelola Akademik &gt; Editor Konten Materi. Sementara itu, silakan manfaatkan audio Tilawah Qori dan naskah uraian di atas.
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Kajian ini membahas dalil-dalil pokok, penjelasan ulama, serta panduan praktis pengamalan materi Hari ke-{activeModule.day}.
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
