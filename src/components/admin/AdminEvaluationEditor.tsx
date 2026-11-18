import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ComprehensiveAssessment, QuizQuestion } from '../../types';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Save,
  Check,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export const AdminEvaluationEditor: React.FC = () => {
  const {
    resolvedWeeklyAssessments,
    resolvedMonthlyAssessments,
    resolvedFinalAssessment,
    resolvedSubjects,
    upsertAssessment,
    deleteAssessment,
    resetAssessment
  } = useApp();

  const [category, setCategory] = useState<'pekanan' | 'bulanan' | 'akhir'>('pekanan');
  const [selectedId, setSelectedId] = useState<string>(
    Object.values(resolvedWeeklyAssessments)[0]?.id || 'weekly_1'
  );
  const [notice, setNotice] = useState<{ type: 'ok' | 'info' | 'err'; text: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<'reset' | 'delete' | null>(null);

  const weeklyList = Object.values(resolvedWeeklyAssessments).sort(
    (a, b) => (a.week || 0) - (b.week || 0)
  );
  const monthlyList = Object.values(resolvedMonthlyAssessments).sort(
    (a, b) => (a.month || 0) - (b.month || 0)
  );

  const currentList: ComprehensiveAssessment[] =
    category === 'pekanan'
      ? weeklyList
      : category === 'bulanan'
      ? monthlyList
      : [resolvedFinalAssessment];

  const activeAssessment =
    currentList.find((a) => a.id === selectedId) || currentList[0];

  const [draft, setDraft] = useState<ComprehensiveAssessment | undefined>(activeAssessment);

  // Sync selectedId when category shifts
  useEffect(() => {
    if (category === 'pekanan' && weeklyList[0]) {
      setSelectedId(weeklyList[0].id);
    } else if (category === 'bulanan' && monthlyList[0]) {
      setSelectedId(monthlyList[0].id);
    } else if (category === 'akhir') {
      setSelectedId(resolvedFinalAssessment.id);
    }
  }, [category]);

  useEffect(() => {
    if (activeAssessment) {
      setDraft({
        ...activeAssessment,
        questions: activeAssessment.questions.map((q) => ({
          ...q,
          options: q.options ? [...q.options] : ['', '', '', '']
        }))
      });
      setConfirmAction(null);
    }
  }, [activeAssessment?.id, resolvedWeeklyAssessments, resolvedMonthlyAssessments, resolvedFinalAssessment]);

  const showTempNotice = (type: 'ok' | 'info' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddWeeklyPackage = () => {
    const nextWeekNum =
      weeklyList.reduce((mx, w) => Math.max(mx, w.week || 0), 0) + 1;
    const startDay = (nextWeekNum - 1) * 7 + 1;
    const endDay = nextWeekNum * 7;
    const newPkg: ComprehensiveAssessment = {
      id: `weekly_${nextWeekNum}_${Date.now().toString().slice(-4)}`,
      title: `Evaluasi Pekanan ke-${nextWeekNum} (Tambahan)`,
      type: 'pekanan',
      week: nextWeekNum,
      dayRange: `Hari ${startDay}–${endDay}`,
      description: `Paket evaluasi pekanan tambahan ke-${nextWeekNum} yang dibuat oleh Pengelola.`,
      durationMinutes: 20,
      passingScore: 75,
      questions: [
        {
          id: `q_w${nextWeekNum}_1`,
          subjectId: resolvedSubjects[0]?.id || 'alquran',
          question: 'Manakah prinsip utama dalam menuntut ilmu syar’i menurut ulama salaf?',
          type: 'mcq',
          options: [
            'Mengikhlaskan niat karena Allah Ta’ala dan mengamalkan ilmu yang dipelajari',
            'Menghafal tanpa memahami maknanya',
            'Memperbanyak debat untuk menang',
            'Menunda amal hingga merasa sempurna'
          ],
          correctAnswer: 0,
          explanation: 'Keikhlasan niat serta pengamalan ilmu adalah ruh keberkahan ilmu syar’i.',
          points: 2
        }
      ]
    };
    upsertAssessment(newPkg);
    setSelectedId(newPkg.id);
    showTempNotice('ok', `Paket ${newPkg.title} berhasil ditambahkan!`);
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    upsertAssessment({
      ...draft,
      durationMinutes: Number(draft.durationMinutes) || 20,
      passingScore: Number(draft.passingScore) || 75
    });
    showTempNotice('ok', `Perubahan pada "${draft.title}" berhasil disimpan!`);
  };

  const addQuestion = () => {
    if (!draft) return;
    const q: QuizQuestion & { subjectId?: string } = {
      id: `q_${draft.id}_${Date.now()}`,
      subjectId: resolvedSubjects[0]?.id || 'alquran',
      question: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 2
    };
    setDraft({
      ...draft,
      questions: [...draft.questions, q]
    });
  };

  const updateQuestion = (
    idx: number,
    partial: Partial<QuizQuestion & { subjectId?: string }>
  ) => {
    if (!draft) return;
    setDraft({
      ...draft,
      questions: draft.questions.map((q, i) => (i === idx ? { ...q, ...partial } : q))
    });
  };

  const updateOption = (qIdx: number, optIdx: number, val: string) => {
    if (!draft) return;
    setDraft({
      ...draft,
      questions: draft.questions.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...(q.options || ['', '', '', ''])];
        while (opts.length < 4) opts.push('');
        opts[optIdx] = val;
        return { ...q, options: opts };
      })
    });
  };

  const removeQuestion = (idx: number) => {
    if (!draft) return;
    setDraft({
      ...draft,
      questions: draft.questions.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 mb-1">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Bank Soal Pilihan Ganda A–D (Benar: 2 Poin, Salah: 1 Poin)</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Manajemen Soal Evaluasi Pekanan, Bulanan & Akhir
          </h3>
          <p className="text-xs text-slate-600">
            Edit judul paket ujian, durasi, deskripsi, serta tambah, ubah, atau hapus butir soal A–D beserta kunci jawaban dan pembahasannya.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setCategory('pekanan')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${
              category === 'pekanan' ? 'bg-emerald-800 text-white' : 'text-slate-600'
            }`}
          >
            Pekanan ({weeklyList.length})
          </button>
          <button
            type="button"
            onClick={() => setCategory('bulanan')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${
              category === 'bulanan' ? 'bg-emerald-800 text-white' : 'text-slate-600'
            }`}
          >
            Bulanan ({monthlyList.length})
          </button>
          <button
            type="button"
            onClick={() => setCategory('akhir')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${
              category === 'akhir' ? 'bg-emerald-800 text-white' : 'text-slate-600'
            }`}
          >
            Evaluasi Akhir
          </button>
        </div>
      </div>

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

      {/* Package Selector Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700">Paket Evaluasi:</span>
          <select
            value={activeAssessment?.id || ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-emerald-900"
          >
            {currentList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.questions.length} soal)
              </option>
            ))}
          </select>

          {category === 'pekanan' && (
            <button
              type="button"
              onClick={handleAddWeeklyPackage}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Paket Pekanan Baru</span>
            </button>
          )}
        </div>

        {draft && (
          <div className="flex items-center gap-2">
            {category === 'pekanan' && currentList.length > 1 && (
              confirmAction === 'delete' ? (
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                  <span className="text-red-800 font-semibold">Hapus paket ini?</span>
                  <button
                    type="button"
                    onClick={() => {
                      deleteAssessment(draft.id);
                      const fallback = currentList.find((c) => c.id !== draft.id);
                      if (fallback) setSelectedId(fallback.id);
                      setConfirmAction(null);
                      showTempNotice('info', 'Paket evaluasi pekanan berhasil dihapus.');
                    }}
                    className="px-2 py-0.5 bg-red-700 text-white rounded font-bold cursor-pointer"
                  >
                    Ya
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="px-2 py-0.5 bg-white border rounded cursor-pointer"
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
                  <span>Hapus Paket</span>
                </button>
              )
            )}

            {confirmAction === 'reset' ? (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                <span className="text-amber-900 font-semibold">Reset paket ini?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetAssessment(draft.id);
                    setConfirmAction(null);
                    showTempNotice('info', 'Paket evaluasi dikembalikan ke soal bawaan.');
                  }}
                  className="px-2 py-0.5 bg-amber-700 text-white rounded font-bold cursor-pointer"
                >
                  Ya
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-2 py-0.5 bg-white border rounded cursor-pointer"
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
                <span>Reset Soal Bawaan</span>
              </button>
            )}
          </div>
        )}
      </div>

      {draft && (
        <form onSubmit={handleSaveAssessment} className="space-y-5 text-xs">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-[#F6FBF8] border border-emerald-900/15">
            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Judul Paket Evaluasi:</label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Cakupan Hari:</label>
              <input
                type="text"
                value={draft.dayRange || ''}
                onChange={(e) => setDraft({ ...draft, dayRange: e.target.value })}
                placeholder="Contoh: Hari 1–7"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Durasi (Menit):</label>
              <input
                type="number"
                min={5}
                max={180}
                value={draft.durationMinutes}
                onChange={(e) => setDraft({ ...draft, durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div className="md:col-span-4">
              <label className="font-semibold text-slate-700 block mb-1">Deskripsi / Petunjuk Ujian:</label>
              <input
                type="text"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">
                Daftar Butir Soal ({draft.questions.length} Soal)
              </span>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Soal A–D</span>
              </button>
            </div>

            {draft.questions.map((q, qIdx) => {
              const opts = q.options && q.options.length > 0 ? q.options : ['', '', '', ''];
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded">
                        Soal #{qIdx + 1} · (+2 / +1 Poin)
                      </span>
                      <select
                        value={q.subjectId || resolvedSubjects[0]?.id || 'alquran'}
                        onChange={(e) => updateQuestion(qIdx, { subjectId: e.target.value })}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700"
                      >
                        {resolvedSubjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            Mapel: {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Soal</span>
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Tulis pertanyaan evaluasi..."
                    value={q.question}
                    onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                            name={`eval_${draft.id}_${q.id}`}
                            checked={isCorrect}
                            onChange={() => updateQuestion(qIdx, { correctAnswer: optIdx })}
                            className="text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                          />
                          <span className="font-bold text-slate-700 w-4">{letter}.</span>
                          <input
                            type="text"
                            value={opts[optIdx] || ''}
                            onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                            placeholder={`Pilihan ${letter}...`}
                            className="flex-1 px-2 py-1 bg-transparent border-b border-slate-200 focus:outline-none focus:border-emerald-700"
                            required
                          />
                        </div>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    placeholder="Pembahasan / dalil kunci jawaban..."
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Bank Soal "{draft.title}"</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
