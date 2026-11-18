import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubjectId } from '../types';
import {
  BookOpen,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Award,
  Layers,
  Lock
} from 'lucide-react';

export const Kurikulum: React.FC = () => {
  const {
    currentProgress,
    setSelectedDay,
    setCurrentNav,
    isDayUnlocked,
    resolvedSubjects,
    resolvedSyllabus
  } = useApp();
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>(
    resolvedSubjects[0]?.id || 'alquran'
  );

  const activeSubject =
    resolvedSubjects.find((s) => s.id === selectedSubjectId) || resolvedSubjects[0];

  const subjectModules = resolvedSyllabus.filter(
    (row) => row.subjectId === activeSubject?.id
  );

  const completedForThisSubject = subjectModules.filter((row) =>
    currentProgress.completedDays.includes(row.day)
  ).length;

  const subjectProgressPercent =
    subjectModules.length > 0
      ? Math.round((completedForThisSubject / subjectModules.length) * 100)
      : 0;

  if (!activeSubject) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-900/15 p-8 text-center text-sm text-slate-600">
        Belum ada data mata pelajaran yang tersedia.
      </div>
    );
  }

  const handleOpenDay = (day: number) => {
    setSelectedDay(day);
    setCurrentNav('materi');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Struktur Kurikulum Akademik</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Tujuh Pilar Mata Pelajaran Islam Terpadu
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Kurikulum 90 hari dirancang berjenjang dari pemahaman dasar (Bulan 1), pendalaman kaidah (Bulan 2), hingga pembiasaan dan pengamalan nyata (Bulan 3). Setiap mata pelajaran berpijak teguh pada dalil Al-Qur'an, Sunnah sahih, dan penjelasan para ulama mu’tabar.
          </p>
        </div>

        {/* Subject Tab Selector */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          {resolvedSubjects.map((subj) => {
            const isSelected = subj.id === activeSubject?.id;
            const countCompleted = resolvedSyllabus.filter(
              (r) => r.subjectId === subj.id && currentProgress.completedDays.includes(r.day)
            ).length;
            const total = resolvedSyllabus.filter((r) => r.subjectId === subj.id).length;

            return (
              <button
                key={subj.id}
                onClick={() => setSelectedSubjectId(subj.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-emerald-900/15'
                }`}
              >
                <span>{subj.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-emerald-950/60 text-amber-300' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {countCompleted}/{total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject Detailed Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & Details (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-emerald-900/15 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Identitas Mata Pelajaran
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {subjectModules.length} Modul Harian
              </span>
            </div>

            <div>
              <div className="font-arabic text-2xl text-emerald-900 font-bold text-right" dir="rtl">
                {activeSubject.arabicName}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{activeSubject.name}</h2>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">{activeSubject.tagline}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              {activeSubject.description}
            </p>

            {/* Subject Progress */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700">Progres Pembelajaran:</span>
                <span className="font-bold text-emerald-800 font-mono">
                  {completedForThisSubject} / {subjectModules.length} ({subjectProgressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-700 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${subjectProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* References Card */}
          <div className="bg-white rounded-xl border border-emerald-900/15 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
              <span>Sumber Rujukan Muktabar</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {activeSubject.references.map((ref, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-200/60">
                  <span className="text-emerald-700 font-bold">·</span>
                  <span>{ref}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Goals, Competencies, and Module List (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Goals and Competencies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Goals */}
            <div className="bg-white rounded-xl border border-emerald-900/15 p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Tujuan Pembelajaran</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {activeSubject.goals.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Competencies */}
            <div className="bg-white rounded-xl border border-emerald-900/15 p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
                <Layers className="w-4 h-4 text-teal-700" />
                <span>Capaian Kompetensi</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {activeSubject.competencies.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">★</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Module List within this Subject */}
          <div className="bg-white rounded-xl border border-emerald-900/15 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Daftar {subjectModules.length} Modul Hari Pembelajaran {activeSubject.name}
              </h3>
              <span className="text-xs text-slate-500">Klik baris untuk langsung membaca materi</span>
            </div>

            <div className="divide-y divide-slate-100">
              {subjectModules.map((mod) => {
                const isDone = currentProgress.completedDays.includes(mod.day);
                const unlocked = isDayUnlocked(mod.day);
                const month = mod.day <= 30 ? 1 : mod.day <= 60 ? 2 : 3;

                return (
                  <div
                    key={mod.day}
                    onClick={() => handleOpenDay(mod.day)}
                    className="py-3 px-2 rounded-lg hover:bg-emerald-50/60 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                          isDone
                            ? 'bg-emerald-700 text-white'
                            : unlocked
                            ? 'bg-slate-100 text-slate-700 group-hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {mod.day}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-500">
                          Bulan {month} · Hari ke-{mod.day}
                        </div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-900">
                          {mod.topic}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          Indikator: {mod.indicator}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isDone ? (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Selesai</span>
                        </span>
                      ) : !unlocked ? (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200">
                          <Lock className="w-3 h-3" />
                          <span>Terkunci</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 group-hover:text-emerald-700 flex items-center gap-1">
                          <span>Buka</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
