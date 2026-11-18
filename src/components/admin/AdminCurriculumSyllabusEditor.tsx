import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectInfo, SyllabusRow } from '../../types';
import {
  BookMarked,
  Layers,
  Plus,
  Trash2,
  Save,
  Check,
  RotateCcw,
  Search,
  AlertTriangle
} from 'lucide-react';

const SUBJECT_COLOR_THEMES = [
  {
    label: 'Zamrud (Emerald)',
    value: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800'
    }
  },
  {
    label: 'Emas Hangat (Amber)',
    value: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800'
    }
  },
  {
    label: 'Toska (Teal)',
    value: {
      bg: 'bg-teal-50',
      text: 'text-teal-900',
      border: 'border-teal-200',
      badge: 'bg-teal-100 text-teal-800'
    }
  },
  {
    label: 'Biru Langit (Sky)',
    value: {
      bg: 'bg-sky-50',
      text: 'text-sky-900',
      border: 'border-sky-200',
      badge: 'bg-sky-100 text-sky-800'
    }
  },
  {
    label: 'Indigo Malam (Indigo)',
    value: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-900',
      border: 'border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800'
    }
  }
];

export const AdminCurriculumSyllabusEditor: React.FC = () => {
  const {
    resolvedSubjects,
    upsertSubject,
    deleteSubject,
    resetSubjectsToDefault,
    resolvedSyllabus,
    updateSyllabusRow,
    addSyllabusRow,
    deleteExtraSyllabusRow
  } = useApp();

  const [mode, setMode] = useState<'subjects' | 'syllabus'>('subjects');
  const [notice, setNotice] = useState<{ type: 'ok' | 'info' | 'err'; text: string } | null>(null);

  // Subject CMS state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(resolvedSubjects[0]?.id || 'alquran');
  const [isCreatingNewSubject, setIsCreatingNewSubject] = useState(false);
  const [confirmSubjectAction, setConfirmSubjectAction] = useState<'delete' | 'reset' | null>(null);

  const selectedSubject = resolvedSubjects.find((s) => s.id === selectedSubjectId) || resolvedSubjects[0];
  const [subDraft, setSubDraft] = useState<SubjectInfo>(
    selectedSubject || {
      id: 'mapel_baru',
      name: '',
      arabicName: '',
      tagline: '',
      description: '',
      totalDays: 10,
      goals: [''],
      competencies: [''],
      references: [''],
      colorTheme: SUBJECT_COLOR_THEMES[0].value
    }
  );

  useEffect(() => {
    if (!isCreatingNewSubject && selectedSubject) {
      setSubDraft({
        ...selectedSubject,
        goals: [...(selectedSubject.goals || [])],
        competencies: [...(selectedSubject.competencies || [])],
        references: [...(selectedSubject.references || [])]
      });
      setConfirmSubjectAction(null);
    }
  }, [selectedSubjectId, selectedSubject, isCreatingNewSubject]);

  // Syllabus CMS state
  const [syllabusSearch, setSyllabusSearch] = useState('');
  const [editingDay, setEditingDay] = useState<number>(resolvedSyllabus[0]?.day || 1);
  const [showNewRowForm, setShowNewRowForm] = useState(false);
  const [newRowDay, setNewRowDay] = useState<number>(() => {
    const mx = resolvedSyllabus.reduce((m, r) => Math.max(m, r.day), 90);
    return mx + 1;
  });
  const [newRowTopic, setNewRowTopic] = useState('');
  const [newRowSubject, setNewRowSubject] = useState(resolvedSubjects[0]?.id || 'alquran');
  const [confirmDeleteSyllabus, setConfirmDeleteSyllabus] = useState<number | null>(null);

  const currentSylRow = resolvedSyllabus.find((r) => r.day === editingDay) || resolvedSyllabus[0];
  const [sylDraft, setSylDraft] = useState<SyllabusRow>(currentSylRow);

  useEffect(() => {
    if (currentSylRow) {
      setSylDraft({ ...currentSylRow });
    }
  }, [editingDay, currentSylRow]);

  const showTempNotice = (type: 'ok' | 'info' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  // Subject Handlers
  const handleStartNewSubject = () => {
    setIsCreatingNewSubject(true);
    setSubDraft({
      id: `mapel_${Date.now().toString().slice(-4)}`,
      name: '',
      arabicName: 'العِلْمُ النَّافِعُ',
      tagline: '',
      description: '',
      totalDays: 10,
      goals: ['Memahami landasan syar’i secara sahih.'],
      competencies: ['Mampu mengamalkan nilai-nilai inti dalam kehidupan sehari-hari.'],
      references: ['Al-Qur’anul Karim & Hadits Shahih'],
      colorTheme: SUBJECT_COLOR_THEMES[0].value
    });
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = subDraft.id
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');
    if (!cleanId || !subDraft.name.trim()) {
      showTempNotice('err', 'ID dan Nama Mata Pelajaran wajib diisi.');
      return;
    }

    const finalSubject: SubjectInfo = {
      ...subDraft,
      id: cleanId,
      name: subDraft.name.trim(),
      totalDays: Number(subDraft.totalDays) || 10,
      goals: subDraft.goals.filter((x) => x.trim() !== ''),
      competencies: subDraft.competencies.filter((x) => x.trim() !== ''),
      references: subDraft.references.filter((x) => x.trim() !== '')
    };

    upsertSubject(finalSubject);
    setIsCreatingNewSubject(false);
    setSelectedSubjectId(cleanId);
    showTempNotice('ok', `Mata Pelajaran "${finalSubject.name}" berhasil disimpan dan aktif di Kurikulum.`);
  };

  const updateSubList = (field: 'goals' | 'competencies' | 'references', idx: number, val: string) => {
    setSubDraft((prev) => {
      const next = [...prev[field]];
      next[idx] = val;
      return { ...prev, [field]: next };
    });
  };

  // Syllabus Handlers
  const handleSaveSyllabusRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sylDraft) return;
    if (sylDraft.day > 90) {
      addSyllabusRow(sylDraft);
    } else {
      updateSyllabusRow(sylDraft.day, sylDraft);
    }
    showTempNotice('ok', `Baris Silabus Hari ke-${sylDraft.day} berhasil diperbarui!`);
  };

  const handleCreateSyllabusRow = (e: React.FormEvent) => {
    e.preventDefault();
    const dInt = Math.max(1, Math.floor(Number(newRowDay)));
    if (resolvedSyllabus.some((r) => r.day === dInt)) {
      showTempNotice('err', `Silabus Hari ke-${dInt} sudah ada.`);
      return;
    }
    if (!newRowTopic.trim()) return;
    const row: SyllabusRow = {
      no: dInt,
      day: dInt,
      subjectId: newRowSubject,
      topic: newRowTopic.trim(),
      indicator: `Peserta memahami dan mengamalkan ${newRowTopic.trim()}.`,
      competence: 'Pemahaman syar’i & aplikasi nyata',
      notes: 'Tambahan Pengelola'
    };
    addSyllabusRow(row);
    setEditingDay(dInt);
    setShowNewRowForm(false);
    setNewRowTopic('');
    setNewRowDay(dInt + 1);
    showTempNotice('ok', `Baris silabus Hari ke-${dInt} berhasil ditambahkan!`);
  };

  const filteredSyllabusList = resolvedSyllabus.filter((r) => {
    if (!syllabusSearch.trim()) return true;
    const q = syllabusSearch.toLowerCase();
    return (
      r.topic.toLowerCase().includes(q) ||
      r.indicator.toLowerCase().includes(q) ||
      String(r.day) === q
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Manajemen Kurikulum & Matriks Silabus
          </h3>
          <p className="text-xs text-slate-600">
            Tambah, ubah, atau hapus Mata Pelajaran Kurikulum beserta seluruh baris topik Silabus Harian.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('subjects')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer ${
              mode === 'subjects' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-600'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Mata Pelajaran ({resolvedSubjects.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('syllabus')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer ${
              mode === 'syllabus' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Silabus ({resolvedSyllabus.length} Baris)</span>
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

      {/* MODE A: MATA PELAJARAN KURIKULUM */}
      {mode === 'subjects' && (
        <div className="space-y-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700">Pilih Mata Pelajaran:</span>
              <select
                value={isCreatingNewSubject ? '__new__' : selectedSubjectId}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    handleStartNewSubject();
                  } else {
                    setIsCreatingNewSubject(false);
                    setSelectedSubjectId(e.target.value);
                  }
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-emerald-900"
              >
                {resolvedSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.totalDays} hari)
                  </option>
                ))}
                {isCreatingNewSubject && <option value="__new__">+ Mata Pelajaran Baru</option>}
              </select>

              <button
                type="button"
                onClick={handleStartNewSubject}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Mapel Baru</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {!isCreatingNewSubject && resolvedSubjects.length > 1 && (
                confirmSubjectAction === 'delete' ? (
                  <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                    <span className="text-red-800 font-semibold">Hapus mapel ini?</span>
                    <button
                      type="button"
                      onClick={() => {
                        deleteSubject(selectedSubjectId);
                        const nextFirst = resolvedSubjects.find((s) => s.id !== selectedSubjectId);
                        if (nextFirst) setSelectedSubjectId(nextFirst.id);
                        setConfirmSubjectAction(null);
                        showTempNotice('info', 'Mata pelajaran berhasil dihapus.');
                      }}
                      className="px-2 py-0.5 bg-red-700 text-white rounded font-bold cursor-pointer"
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmSubjectAction(null)}
                      className="px-2 py-0.5 bg-white border rounded cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmSubjectAction('delete')}
                    className="px-2.5 py-1.5 text-red-700 hover:bg-red-50 border border-red-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Mapel</span>
                  </button>
                )
              )}

              {confirmSubjectAction === 'reset' ? (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  <span className="text-amber-900 font-semibold">Reset semua mapel?</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetSubjectsToDefault();
                      setIsCreatingNewSubject(false);
                      setSelectedSubjectId('alquran');
                      setConfirmSubjectAction(null);
                      showTempNotice('info', 'Seluruh mata pelajaran dikembalikan ke 7 pilar bawaan.');
                    }}
                    className="px-2 py-0.5 bg-amber-700 text-white rounded font-bold cursor-pointer"
                  >
                    Ya
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmSubjectAction(null)}
                    className="px-2 py-0.5 bg-white border rounded cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmSubjectAction('reset')}
                  className="px-2.5 py-1.5 text-amber-800 hover:bg-amber-50 border border-amber-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset 7 Pilar Bawaan</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveSubject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Kode ID Mapel {isCreatingNewSubject ? '(huruf kecil/underscore)' : '(Terkunci)'}:
                </label>
                <input
                  type="text"
                  value={subDraft.id}
                  disabled={!isCreatingNewSubject}
                  onChange={(e) => setSubDraft({ ...subDraft, id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono disabled:opacity-70"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Mata Pelajaran:</label>
                <input
                  type="text"
                  value={subDraft.name}
                  onChange={(e) => setSubDraft({ ...subDraft, name: e.target.value })}
                  placeholder="Contoh: Aqidah Ahlussunnah"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Arab (Kaligrafi):</label>
                <input
                  type="text"
                  dir="rtl"
                  value={subDraft.arabicName}
                  onChange={(e) => setSubDraft({ ...subDraft, arabicName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-arabic text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Tagline Singkat:</label>
                <input
                  type="text"
                  value={subDraft.tagline}
                  onChange={(e) => setSubDraft({ ...subDraft, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alokasi Hari Pembelajaran:</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={subDraft.totalDays}
                  onChange={(e) => setSubDraft({ ...subDraft, totalDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Deskripsi Lengkap Bidang Kajian:</label>
              <textarea
                rows={3}
                value={subDraft.description}
                onChange={(e) => setSubDraft({ ...subDraft, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(
                [
                  { key: 'goals', title: 'Tujuan Kurikulum' },
                  { key: 'competencies', title: 'Standar Kompetensi' },
                  { key: 'references', title: 'Kitab Rujukan' }
                ] as const
              ).map(({ key, title }) => (
                <div key={key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{title}</span>
                    <button
                      type="button"
                      onClick={() => setSubDraft((prev) => ({ ...prev, [key]: [...prev[key], ''] }))}
                      className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-800 rounded font-semibold cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>
                  {subDraft[key].map((val, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => updateSubList(key, idx, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSubDraft((prev) => ({
                            ...prev,
                            [key]: prev[key].filter((_, i) => i !== idx)
                          }))
                        }
                        className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Mata Pelajaran</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODE B: SILABUS HARIAN */}
      {mode === 'syllabus' && (
        <div className="space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari hari atau topik silabus..."
                value={syllabusSearch}
                onChange={(e) => setSyllabusSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowNewRowForm(!showNewRowForm)}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris Silabus</span>
            </button>
          </div>

          {showNewRowForm && (
            <form
              onSubmit={handleCreateSyllabusRow}
              className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hari ke:</label>
                <input
                  type="number"
                  min={1}
                  value={newRowDay}
                  onChange={(e) => setNewRowDay(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Topik / Pokok Bahasan:</label>
                <input
                  type="text"
                  value={newRowTopic}
                  onChange={(e) => setNewRowTopic(e.target.value)}
                  placeholder="Topik pembelajaran..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={newRowSubject}
                  onChange={(e) => setNewRowSubject(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold"
                >
                  {resolvedSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-800 text-white font-bold rounded-lg cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* List */}
            <div className="lg:col-span-2 border border-slate-200 rounded-xl overflow-hidden max-h-[420px] overflow-y-auto divide-y divide-slate-100">
              {filteredSyllabusList.map((row) => (
                <button
                  key={row.day}
                  type="button"
                  onClick={() => setEditingDay(row.day)}
                  className={`w-full text-left px-3.5 py-2.5 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                    editingDay === row.day ? 'bg-emerald-50 font-bold text-emerald-950' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-mono text-emerald-800 mr-2">H{row.day}</span>
                    <span>{row.topic}</span>
                  </div>
                  {row.day > 90 && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] shrink-0">
                      Ekstra
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Detail Editor */}
            {sylDraft && (
              <form
                onSubmit={handleSaveSyllabusRow}
                className="lg:col-span-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-sm text-emerald-950">
                    Edit Baris Silabus Hari ke-{sylDraft.day}
                  </span>
                  {sylDraft.day > 90 &&
                    (confirmDeleteSyllabus === sylDraft.day ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            deleteExtraSyllabusRow(sylDraft.day);
                            setEditingDay(1);
                            setConfirmDeleteSyllabus(null);
                            showTempNotice('info', `Baris silabus Hari ke-${sylDraft.day} dihapus.`);
                          }}
                          className="px-2 py-0.5 bg-red-700 text-white rounded font-bold cursor-pointer"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteSyllabus(null)}
                          className="px-2 py-0.5 bg-white border rounded cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteSyllabus(sylDraft.day)}
                        className="px-2.5 py-1 text-red-700 hover:bg-red-50 rounded font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus Baris
                      </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Topik Utama:</label>
                    <input
                      type="text"
                      value={sylDraft.topic}
                      onChange={(e) => setSylDraft({ ...sylDraft, topic: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mata Pelajaran:</label>
                    <select
                      value={sylDraft.subjectId}
                      onChange={(e) => setSylDraft({ ...sylDraft, subjectId: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold"
                    >
                      {resolvedSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Indikator Pencapaian:</label>
                  <textarea
                    rows={2}
                    value={sylDraft.indicator}
                    onChange={(e) => setSylDraft({ ...sylDraft, indicator: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kompetensi Inti:</label>
                  <input
                    type="text"
                    value={sylDraft.competence}
                    onChange={(e) => setSylDraft({ ...sylDraft, competence: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Catatan Rujukan / Kitab:</label>
                  <input
                    type="text"
                    value={sylDraft.notes}
                    onChange={(e) => setSylDraft({ ...sylDraft, notes: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Baris Silabus</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
