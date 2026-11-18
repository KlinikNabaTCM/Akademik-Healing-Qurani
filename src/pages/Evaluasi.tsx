import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubjectId, QuizQuestion } from '../types';
import {
  CheckSquare,
  CheckCircle,
  Send,
  X,
  Lock,
  PlayCircle
} from 'lucide-react';

interface ActiveExamPayload {
  id: string;
  title: string;
  type: 'harian' | 'pekanan' | 'bulanan' | 'akhir';
  day?: number;
  week?: number;
  month?: 1 | 2 | 3;
  dayRange?: string;
  durationMinutes: number;
  passingScore: number;
  questions: (QuizQuestion & { subjectId?: SubjectId })[];
}

export const Evaluasi: React.FC = () => {
  const {
    currentUser,
    currentProgress,
    systemSettings,
    isDayUnlocked,
    submitDailyQuiz,
    submitWeeklyAssessment,
    submitMonthlyAssessment,
    submitFinalAssessment,
    submitRemedialRequest,
    updateRemedialStatus,
    resolvedModules,
    resolvedSubjects,
    resolvedWeeklyAssessments,
    resolvedMonthlyAssessments,
    resolvedFinalAssessment
  } = useApp();

  const [activeTab, setActiveTab] = useState<'harian' | 'pekanan' | 'bulanan' | 'akhir' | 'susulan'>('pekanan');
  const [weeklyMonthFilter, setWeeklyMonthFilter] = useState<0 | 1 | 2 | 3>(0);

  // Interactive Exam Modal state (shared for Harian, Pekanan, Bulanan, Akhir)
  const [activeExam, setActiveExam] = useState<ActiveExamPayload | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [examScore, setExamScore] = useState<number | null>(null);
  const [examEarnedPoints, setExamEarnedPoints] = useState<number>(0);
  const [examMaxPoints, setExamMaxPoints] = useState<number>(0);

  // Remedial Request Form state
  const [remType, setRemType] = useState<'harian' | 'pekanan' | 'bulanan' | 'akhir'>('pekanan');
  const [remTarget, setRemTarget] = useState('Evaluasi Pekan 1');
  const [remReason, setRemReason] = useState('');
  const [remNotice, setRemNotice] = useState<string | null>(null);

  // Standard 2-point rule: Benar = 2 poin, Salah = 1 poin, Tidak dijawab = 0 poin
  const getQuestionMaxPoints = (q: QuizQuestion) => q.points ?? 2;

  const startExam = (exam: ActiveExamPayload, prefilledAnswers?: Record<string, number>) => {
    const maxPts = exam.questions.reduce((sum, q) => sum + getQuestionMaxPoints(q), 0);
    setActiveExam(exam);
    setExamMaxPoints(maxPts);
    setExamAnswers(prefilledAnswers || {});
    setExamSubmitted(false);
    setExamScore(null);
    setExamEarnedPoints(0);
  };

  const handleOpenDailyExam = (day: number) => {
    if (!isDayUnlocked(day)) return;
    const mod = resolvedModules.find((m) => m.day === day);
    if (!mod) return;

    const existing = currentProgress.dailyResults[day];
    const examPayload: ActiveExamPayload = {
      id: `eval_d_${day}`,
      title: `Evaluasi Harian Hari ke-${day}: ${mod.title}`,
      type: 'harian',
      day,
      dayRange: `Hari ke-${day}`,
      durationMinutes: 15,
      passingScore: systemSettings.passingGrade,
      questions: mod.quiz
    };

    if (existing) {
      const maxPts = examPayload.questions.reduce(
        (sum, q) => sum + getQuestionMaxPoints(q),
        0
      );
      let earned = existing.earnedPoints;
      if (earned === undefined) {
        earned = 0;
        examPayload.questions.forEach((q) => {
          const ans = existing.answers?.[q.id];
          if (ans !== undefined) {
            earned! += ans === q.correctAnswer ? getQuestionMaxPoints(q) : 1;
          }
        });
        if (Object.keys(existing.answers || {}).length === 0 && existing.score > 0 && maxPts > 0) {
          earned = Math.round((existing.score / 100) * maxPts);
        }
      }
      setActiveExam(examPayload);
      setExamMaxPoints(existing.maxPoints ?? maxPts);
      setExamAnswers(existing.answers || {});
      setExamScore(existing.score);
      setExamEarnedPoints(earned ?? 0);
      setExamSubmitted(true);
    } else {
      startExam(examPayload);
    }
  };

  const handleSelectOption = (qId: string, optIndex: number) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleFinishExam = () => {
    if (!activeExam) return;

    let earnedPts = 0;
    let totalMaxPts = 0;
    const subjectPointsMap: Record<string, { earned: number; max: number }> = {};

    activeExam.questions.forEach((q) => {
      const qMax = getQuestionMaxPoints(q);
      totalMaxPts += qMax;
      const userAns = examAnswers[q.id];
      const hasAns = userAns !== undefined;
      const isRight = hasAns && userAns === q.correctAnswer;
      const pts = !hasAns ? 0 : isRight ? qMax : 1;
      earnedPts += pts;

      if (q.subjectId) {
        if (!subjectPointsMap[q.subjectId]) {
          subjectPointsMap[q.subjectId] = { earned: 0, max: 0 };
        }
        subjectPointsMap[q.subjectId].max += qMax;
        subjectPointsMap[q.subjectId].earned += pts;
      }
    });

    const calculatedScore = totalMaxPts > 0 ? Math.round((earnedPts / totalMaxPts) * 100) : 0;
    setExamEarnedPoints(earnedPts);
    setExamMaxPoints(totalMaxPts);
    setExamScore(calculatedScore);
    setExamSubmitted(true);

    if (activeExam.type === 'harian' && activeExam.day) {
      submitDailyQuiz(activeExam.day, calculatedScore, examAnswers, earnedPts, totalMaxPts);
    } else if (activeExam.type === 'pekanan' && activeExam.week) {
      submitWeeklyAssessment(activeExam.week, calculatedScore, earnedPts, totalMaxPts);
    } else if (activeExam.type === 'bulanan' && activeExam.month) {
      submitMonthlyAssessment(activeExam.month, calculatedScore, earnedPts, totalMaxPts);
    } else if (activeExam.type === 'akhir') {
      const subjectScores: Partial<Record<SubjectId, number>> = {};
      Object.keys(subjectPointsMap).forEach((sId) => {
        const item = subjectPointsMap[sId];
        subjectScores[sId as SubjectId] =
          item.max > 0 ? Math.round((item.earned / item.max) * 100) : 0;
      });

      submitFinalAssessment(
        calculatedScore,
        subjectScores as Record<SubjectId, number>,
        earnedPts,
        totalMaxPts
      );
    }
  };

  const handleRetakeCurrentExam = () => {
    setExamAnswers({});
    setExamSubmitted(false);
    setExamScore(null);
    setExamEarnedPoints(0);
  };

  const handleRemTypeChange = (nextType: 'harian' | 'pekanan' | 'bulanan' | 'akhir') => {
    setRemType(nextType);
    if (nextType === 'harian') setRemTarget('Evaluasi Harian Hari ke-1');
    else if (nextType === 'pekanan') setRemTarget('Evaluasi Pekan 1');
    else if (nextType === 'bulanan') setRemTarget('Evaluasi Bulan 1');
    else setRemTarget('Evaluasi Akhir Pembelajaran');
  };

  const handleSubmitRemedial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remReason.trim()) return;

    submitRemedialRequest(remType, remTarget, remReason);
    setRemNotice('Pengajuan evaluasi susulan berhasil dikirim. Menunggu persetujuan pengelola.');
    setRemReason('');
    setTimeout(() => setRemNotice(null), 5000);
  };

  const dailyKeys = Object.keys(currentProgress.dailyResults || {}).map(Number);
  const weeklyResults = currentProgress.weeklyResults || {};
  const weeklyCompletedCount = Object.keys(weeklyResults).length;
  const allWeeklyPackages = Object.values(resolvedWeeklyAssessments).sort(
    (a, b) => (a.week || 0) - (b.week || 0)
  );
  const weeklyList = allWeeklyPackages.filter((w) => {
    if (weeklyMonthFilter === 0) return true;
    const wk = w.week || 1;
    const m = w.month || (wk <= 4 ? 1 : wk <= 8 ? 2 : 3);
    return m === weeklyMonthFilter;
  });

  const finalMaxPts = resolvedFinalAssessment.questions.reduce(
    (sum, q) => sum + getQuestionMaxPoints(q),
    0
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Sistem Penilaian Pilihan A, B, C, D · Benar +2 Poin · Salah +1 Poin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Pusat Evaluasi Pembelajaran
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Seluruh soal evaluasi (Harian, Pekanan 13 Pekan, Bulanan, dan Akhir) menggunakan pilihan ganda A, B, C, D dengan ketentuan: <strong>Benar = 2 Poin</strong> dan <strong>Salah = 1 Poin</strong>.
            </p>
          </div>

          {/* Quick Grade Summary Badge */}
          <div className="bg-slate-50 border border-emerald-900/15 p-3 rounded-xl flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Batas Lulus:</span>
              <span className="font-bold text-slate-900">≥ {systemSettings.passingGrade}%</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 block">Peserta Aktif:</span>
              <span className="font-bold text-emerald-800">{currentUser.name}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('harian')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'harian'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-emerald-900/15'
            }`}
          >
            Evaluasi Harian ({dailyKeys.length}/{resolvedModules.length})
          </button>
          <button
            onClick={() => setActiveTab('pekanan')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pekanan'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-emerald-900/15'
            }`}
          >
            Evaluasi Pekanan ({weeklyCompletedCount}/{allWeeklyPackages.length})
          </button>
          <button
            onClick={() => setActiveTab('bulanan')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'bulanan'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-emerald-900/15'
            }`}
          >
            Evaluasi Bulanan (1, 2, 3)
          </button>
          <button
            onClick={() => setActiveTab('akhir')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'akhir'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-emerald-900/15'
            }`}
          >
            Evaluasi Akhir Pembelajaran
          </button>
          <button
            onClick={() => setActiveTab('susulan')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'susulan'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-emerald-900/15'
            }`}
          >
            Evaluasi Susulan
          </button>
        </div>
      </div>

      {/* TAB: EVALUASI HARIAN INTERAKTIF */}
      {activeTab === 'harian' && (
        <div className="bg-white rounded-xl border border-emerald-900/15 p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Rekap & Kuis Evaluasi Harian Peserta ({resolvedModules.length} Hari)
              </h3>
              <p className="text-xs text-slate-600">
                Telah menyelesaikan {dailyKeys.length} dari {resolvedModules.length} evaluasi harian · Benar +2 Poin, Salah +1 Poin.
              </p>
            </div>
            <div className="text-xs font-mono font-semibold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              Skor Dinamis: Benar +2 / Salah +1 Poin
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
            {resolvedModules.map((mod) => {
              const day = mod.day;
              const res = currentProgress.dailyResults[day];
              const unlocked = isDayUnlocked(day);
              const qMaxPts = mod.quiz.reduce((acc, q) => acc + getQuestionMaxPoints(q), 0) || 6;
              const earned = res?.earnedPoints ?? (res ? Math.round((res.score / 100) * qMaxPts) : 0);
              const maxPts = res?.maxPoints ?? qMaxPts;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => handleOpenDailyExam(day)}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    !unlocked
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : res
                      ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950 cursor-pointer'
                      : 'bg-white hover:bg-emerald-50/70 border-emerald-700/30 text-slate-800 cursor-pointer shadow-2xs'
                  }`}
                  title={
                    !unlocked
                      ? `Hari ${day} terkunci hingga pukul 00.00 WIB`
                      : res
                      ? `Hari ${day}: ${earned}/${maxPts} Poin (${res.score}%)`
                      : `Kerjakan Evaluasi Hari ke-${day}`
                  }
                >
                  <div className="text-[11px] font-mono font-bold flex items-center justify-center gap-1">
                    {!unlocked && <Lock className="w-3 h-3 text-slate-400" />}
                    <span>Hari {day}</span>
                  </div>
                  <div className="text-xs font-mono font-bold mt-0.5">
                    {res ? (
                      <span className="text-emerald-800">
                        {earned}/{maxPts} Poin
                      </span>
                    ) : unlocked ? (
                      <span className="text-emerald-700 inline-flex items-center gap-0.5 text-[11px]">
                        <PlayCircle className="w-3 h-3" /> Mulai
                      </span>
                    ) : (
                      'Terkunci'
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: EVALUASI PEKANAN (MINGGUAN 1–13) */}
      {activeTab === 'pekanan' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-emerald-900/15 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Evaluasi Pekanan (Pekan 1 – Pekan 13)
              </h3>
              <p className="text-xs text-slate-600">
                Setiap evaluasi pekanan terdiri dari 5 soal pilihan ganda (A, B, C, D) · Benar = 2 Poin, Salah = 1 Poin (Maks 10 Poin).
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {[
                { val: 0 as const, label: 'Semua (13 Pekan)' },
                { val: 1 as const, label: 'Bulan 1 (Pekan 1–4)' },
                { val: 2 as const, label: 'Bulan 2 (Pekan 5–8)' },
                { val: 3 as const, label: 'Bulan 3 (Pekan 9–13)' }
              ].map((f) => (
                <button
                  key={f.val}
                  onClick={() => setWeeklyMonthFilter(f.val)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    weeklyMonthFilter === f.val
                      ? 'bg-emerald-800 text-white border-emerald-900'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {weeklyList.map((assessment) => {
              const weekNum = assessment.week || 1;
              const result = weeklyResults[weekNum];
              const isCompleted = !!result;
              const totalPoints = assessment.questions.reduce(
                (acc, q) => acc + getQuestionMaxPoints(q),
                0
              );

              return (
                <div
                  key={assessment.id}
                  className="bg-white rounded-xl border border-emerald-900/15 p-5 shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold font-mono text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        Pekan {weekNum} · {assessment.dayRange}
                      </span>
                      <span className="text-xs text-slate-600 font-mono font-semibold">
                        {assessment.questions.length} Soal · {totalPoints} Poin
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {assessment.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {assessment.description}
                    </p>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Durasi & Format:</span>
                        <span className="font-semibold text-slate-900">
                          {assessment.durationMinutes} Menit · Pilihan A–D
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Skema Poin:</span>
                        <span className="font-semibold text-slate-900 font-mono">
                          Benar +2 · Salah +1
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Syarat Lulus:</span>
                        <span className="font-semibold text-emerald-800 font-mono">
                          ≥ {systemSettings.passingGrade}% ({Math.ceil((systemSettings.passingGrade / 100) * totalPoints)}/{totalPoints} Poin)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    {isCompleted ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Perolehan Poin:</span>
                          <span
                            className={`font-mono font-bold text-sm ${
                              result.passed ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {result.earnedPoints ?? Math.round((result.score / 100) * totalPoints)} / {result.maxPoints ?? totalPoints} Poin ({result.score}%)
                          </span>
                        </div>
                        <button
                          onClick={() => startExam(assessment)}
                          className="w-full py-2 rounded-lg border border-emerald-800/25 hover:bg-emerald-50 text-xs font-semibold text-emerald-900 transition-colors cursor-pointer"
                        >
                          Ulangi Evaluasi Pekan {weekNum}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startExam(assessment)}
                        className="w-full py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        Mulai Evaluasi Pekan {weekNum}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: EVALUASI BULANAN */}
      {activeTab === 'bulanan' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((monthNum) => {
            const assessment = resolvedMonthlyAssessments[monthNum];
            if (!assessment) return null;
            const result = currentProgress.monthlyResults[monthNum];
            const isCompleted = !!result;
            const totalPoints = assessment.questions.reduce(
              (acc, q) => acc + getQuestionMaxPoints(q),
              0
            );
            const earnedPts =
              result?.earnedPoints ??
              (result ? Math.round((result.score / 100) * totalPoints) : 0);

            return (
              <div
                key={monthNum}
                className="bg-white rounded-xl border border-emerald-900/15 p-6 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold font-mono text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      Bulan {monthNum}
                    </span>
                    <span className="text-xs text-slate-600 font-mono font-semibold">
                      {assessment.questions.length} Soal · {totalPoints} Poin
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {assessment.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {assessment.description}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cakupan Materi:</span>
                      <span className="font-semibold text-slate-800">
                        {monthNum === 1 ? 'Hari 1–30' : monthNum === 2 ? 'Hari 31–60' : 'Hari 61–90'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Durasi & Format:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {assessment.durationMinutes} Menit (A, B, C, D)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Skema Poin:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        Benar +2 · Salah +1
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Syarat Lulus:</span>
                      <span className="font-semibold text-emerald-700 font-mono">
                        ≥ {systemSettings.passingGrade}% ({Math.ceil((systemSettings.passingGrade / 100) * totalPoints)}/{totalPoints} Poin)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {isCompleted ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Perolehan Poin:</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            result.passed ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {earnedPts} / {result.maxPoints ?? totalPoints} Poin ({result.score}%)
                        </span>
                      </div>
                      <button
                        onClick={() => startExam(assessment)}
                        className="w-full py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                      >
                        Ulangi Ujian Bulan {monthNum}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startExam(assessment)}
                      className="w-full py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      Mulai Kerjakan Evaluasi
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: EVALUASI AKHIR KOMPREHENSIF */}
      {activeTab === 'akhir' && (
        <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md">
                  Bobot Penilaian {systemSettings.weights.final}% dari Nilai Akhir
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {resolvedFinalAssessment.questions.length} Soal A–D · Maks {finalMaxPts} Poin (Benar +2, Salah +1)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {resolvedFinalAssessment.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {resolvedFinalAssessment.description}
              </p>
            </div>

            <div className="shrink-0">
              {currentProgress.finalResult ? (
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-center space-y-1">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                    Perolehan Evaluasi Akhir
                  </span>
                  <div className="text-3xl font-bold font-mono text-emerald-900">
                    {currentProgress.finalResult.earnedPoints ??
                      Math.round((currentProgress.finalResult.score / 100) * finalMaxPts)}{' '}
                    / {currentProgress.finalResult.maxPoints ?? finalMaxPts} Poin
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-700">
                    Nilai Konversi: {currentProgress.finalResult.score}%
                  </div>
                  <span className="text-xs font-bold text-emerald-700 block pt-0.5">
                    {currentProgress.finalResult.passed ? '✓ Memenuhi Syarat Kelulusan' : 'Perlu Remedial'}
                  </span>
                  <button
                    onClick={() => startExam(resolvedFinalAssessment)}
                    className="mt-2 text-xs text-emerald-800 underline font-semibold cursor-pointer"
                  >
                    Ulangi Evaluasi Akhir
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startExam(resolvedFinalAssessment)}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Mulai Evaluasi Akhir Sekarang
                </button>
              )}
            </div>
          </div>

          {/* Breakdown Per Mata Pelajaran (If final exam completed) */}
          {currentProgress.finalResult && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Capaian Nilai Per Mata Pelajaran (Evaluasi Akhir)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {resolvedSubjects.map((s) => {
                  const score = currentProgress.finalResult?.subjectScores[s.id];
                  return (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center"
                    >
                      <span className="text-[11px] font-semibold text-slate-700 block line-clamp-1">
                        {s.name}
                      </span>
                      <div className="text-lg font-bold font-mono text-emerald-800 mt-1">
                        {score !== undefined ? `${score}%` : '—'}
                      </div>
                      <span className="text-[10px] text-slate-600">
                        {score !== undefined ? 'Capaian Bidang' : 'Belum Diuji'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: PENGAJUAN EVALUASI SUSULAN */}
      {activeTab === 'susulan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-emerald-900/15 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">
              Formulir Permohonan Evaluasi Susulan
            </h3>

            {remNotice && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                {remNotice}
              </div>
            )}

            <form onSubmit={handleSubmitRemedial} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Jenis Evaluasi:
                </label>
                <select
                  value={remType}
                  onChange={(e) => handleRemTypeChange(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="harian">Evaluasi Harian</option>
                  <option value="pekanan">Evaluasi Pekanan</option>
                  <option value="bulanan">Evaluasi Bulanan</option>
                  <option value="akhir">Evaluasi Akhir Pembelajaran</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Target Materi / Evaluasi:
                </label>
                <input
                  type="text"
                  value={remTarget}
                  onChange={(e) => setRemTarget(e.target.value)}
                  placeholder="Contoh: Evaluasi Pekan 4 atau Evaluasi Bulan 1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Alasan Permohonan Susulan:
                </label>
                <textarea
                  rows={4}
                  value={remReason}
                  onChange={(e) => setRemReason(e.target.value)}
                  placeholder="Jelaskan alasan berhalangan (sakit, tugas darurat, kendala teknis)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Permohonan Susulan</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white rounded-xl border border-emerald-900/15 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Riwayat Pengajuan Evaluasi Susulan</span>
              <span className="text-xs text-slate-600 font-normal">Verifikasi Pengelola</span>
            </h3>

            {!currentProgress.remedialRequests || currentProgress.remedialRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Belum ada pengajuan evaluasi susulan yang tercatat.
              </div>
            ) : (
              <div className="space-y-3">
                {currentProgress.remedialRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{req.targetLabel}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
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
                    <p className="text-slate-600">Alasan: {req.reason}</p>
                    <div className="text-[11px] text-slate-600">
                      Diajukan: {req.submittedAt} · Peserta: {req.participantName}
                    </div>

                    {currentUser.role === 'admin' && req.status === 'Menunggu Persetujuan' && (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateRemedialStatus(req.id, 'Disetujui', 'Disetujui oleh Administrator')
                          }
                          className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Setujui Permohonan
                        </button>
                        <button
                          onClick={() =>
                            updateRemedialStatus(req.id, 'Ditolak', 'Tidak memenuhi kriteria')
                          }
                          className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INTERACTIVE EXAM MODAL / OVERLAY (HARIAN, PEKANAN, BULANAN, AKHIR) */}
      {activeExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between gap-4 z-10">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    {activeExam.type === 'harian'
                      ? `Evaluasi Harian · Hari ke-${activeExam.day}`
                      : activeExam.type === 'pekanan'
                      ? `Evaluasi Pekanan · Pekan ${activeExam.week} (${activeExam.dayRange})`
                      : activeExam.type === 'bulanan'
                      ? `Evaluasi Bulanan · Bulan ${activeExam.month}`
                      : 'Evaluasi Akhir Pembelajaran'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 font-mono text-[11px] font-bold text-emerald-900">
                    Maks: {examMaxPoints} Poin (Benar +2 · Salah +1)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{activeExam.title}</h3>
              </div>
              <button
                onClick={() => setActiveExam(null)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {examSubmitted && examScore !== null && (
                <div
                  className={`p-4 rounded-xl border text-center space-y-1.5 ${
                    examScore >= systemSettings.passingGrade
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <span className="font-bold text-sm">Hasil Evaluasi Selesai:</span>
                  <div className="text-2xl sm:text-3xl font-mono font-bold mt-1">
                    {examEarnedPoints} / {examMaxPoints} Poin ({examScore}%)
                  </div>
                  <span className="text-xs font-semibold block">
                    {examScore >= systemSettings.passingGrade
                      ? 'Alhamdulillah, Anda Dinyatakan LULUS Evaluasi Ini!'
                      : 'Nilai di bawah batas kelulusan. Anda dapat mengulang atau mengajukan susulan.'}
                  </span>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {activeExam.questions.map((q, idx) => {
                  const userAns = examAnswers[q.id];
                  const hasAns = userAns !== undefined;
                  const isRight = hasAns && userAns === q.correctAnswer;
                  const qMax = getQuestionMaxPoints(q);
                  const qEarned = !hasAns ? 0 : isRight ? qMax : 1;
                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <div
                      key={q.id}
                      className="p-4 sm:p-5 rounded-xl border border-emerald-900/15 bg-[#F7FAF8] space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="font-bold text-slate-900 text-sm flex-1">
                          Soal {idx + 1}. {q.question}
                        </div>
                        <span
                          className={`shrink-0 px-2.5 py-1 rounded-lg font-mono text-xs font-bold border ${
                            examSubmitted
                              ? isRight
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : hasAns
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-white text-emerald-900 border-emerald-800/20'
                          }`}
                        >
                          {examSubmitted
                            ? isRight
                              ? `+${qEarned} Poin (Benar)`
                              : hasAns
                              ? `+${qEarned} Poin (Salah)`
                              : `0 Poin (Kosong)`
                            : `Benar +${qMax} · Salah +1 Poin`}
                        </span>
                      </div>

                      {/* Options A, B, C, D with Point Indicators */}
                      <div className="space-y-2">
                        {q.options?.map((opt: string, optIdx: number) => {
                          const letter = optionLetters[optIdx] || String.fromCharCode(65 + optIdx);
                          const isChosen = userAns === optIdx;
                          const isRightOption = optIdx === q.correctAnswer;
                          let style =
                            'bg-white border-slate-300/80 text-slate-800 hover:bg-emerald-50/70 hover:border-emerald-400';
                          let letterBadgeStyle = 'bg-slate-100 text-slate-800 border-slate-300';

                          if (examSubmitted) {
                            if (isRightOption) {
                              style = 'bg-emerald-100 border-emerald-600 text-emerald-950 font-semibold';
                              letterBadgeStyle = 'bg-emerald-700 text-white border-emerald-800';
                            } else if (isChosen && !isRight) {
                              style = 'bg-amber-50 border-amber-400 text-amber-950';
                              letterBadgeStyle = 'bg-amber-600 text-white border-amber-700';
                            } else {
                              style = 'bg-white border-slate-200 text-slate-500';
                              letterBadgeStyle = 'bg-slate-100 text-slate-500 border-slate-200';
                            }
                          } else if (isChosen) {
                            style = 'bg-emerald-50 border-emerald-700 text-emerald-950 font-semibold shadow-2xs';
                            letterBadgeStyle = 'bg-emerald-800 text-white border-emerald-900';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={examSubmitted}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${style}`}
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
                                {examSubmitted ? (
                                  isRightOption ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-700 text-white font-mono text-[11px] font-bold">
                                      <CheckCircle className="w-3 h-3" />+{qMax} Poin
                                    </span>
                                  ) : isChosen ? (
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold">
                                      +1 Poin
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-mono text-slate-400">
                                      +1 Poin (Salah)
                                    </span>
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

                      {examSubmitted && (
                        <div className="p-3 bg-white rounded-lg border border-emerald-200 text-xs text-slate-700 space-y-1">
                          <strong className="text-emerald-900 block">Kunci Jawaban & Pembahasan:</strong>
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-medium">
                Terjawab: <strong>{Object.keys(examAnswers).length}</strong> dari {activeExam.questions.length} soal · Maks: <strong>{examMaxPoints} Poin</strong> (Benar +2, Salah +1)
              </span>

              {!examSubmitted ? (
                <button
                  onClick={handleFinishExam}
                  disabled={Object.keys(examAnswers).length === 0}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Selesaikan & Kumpulkan Jawaban
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetakeCurrentExam}
                    className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Ulangi Evaluasi
                  </button>
                  <button
                    onClick={() => setActiveExam(null)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Tutup & Simpan Nilai
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
