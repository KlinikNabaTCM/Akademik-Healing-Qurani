import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Printer,
  Download,
  CheckCircle,
  Calendar,
  Lock
} from 'lucide-react';

export const Silabus: React.FC = () => {
  const {
    currentProgress,
    setSelectedDay,
    setCurrentNav,
    isDayUnlocked,
    resolvedSyllabus,
    resolvedSubjects
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const hasExtraDays = resolvedSyllabus.some((r) => r.day > 90);

  const filteredSyllabus = useMemo(() => {
    return resolvedSyllabus.filter((row) => {
      // Subject filter
      if (selectedSubject !== 'all' && row.subjectId !== selectedSubject) {
        return false;
      }

      // Month filter
      if (selectedMonth !== 'all') {
        const m = parseInt(selectedMonth, 10);
        if (m === 1 && (row.day < 1 || row.day > 30)) return false;
        if (m === 2 && (row.day < 31 || row.day > 60)) return false;
        if (m === 3 && (row.day < 61 || row.day > 90)) return false;
        if (m === 4 && row.day <= 90) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const subj = resolvedSubjects.find((s) => s.id === row.subjectId);
        const matchTopic = row.topic.toLowerCase().includes(q);
        const matchIndicator = row.indicator.toLowerCase().includes(q);
        const matchCompetence = row.competence.toLowerCase().includes(q);
        const matchNotes = row.notes.toLowerCase().includes(q);
        const matchSubj = subj ? subj.name.toLowerCase().includes(q) : false;
        const matchDay = `hari ${row.day}`.includes(q) || `${row.day}` === q;

        return matchTopic || matchIndicator || matchCompetence || matchNotes || matchSubj || matchDay;
      }

      return true;
    });
  }, [searchQuery, selectedSubject, selectedMonth, resolvedSyllabus, resolvedSubjects]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Hari',
      'Mata Pelajaran',
      'Topik Materi',
      'Indikator Pembelajaran',
      'Capaian Kompetensi',
      'Keterangan & Rujukan'
    ];
    const rows = filteredSyllabus.map((r) => {
      const subj = resolvedSubjects.find((s) => s.id === r.subjectId);
      return [
        r.no,
        r.day,
        `"${subj?.name || r.subjectId}"`,
        `"${r.topic}"`,
        `"${r.indicator}"`,
        `"${r.competence}"`,
        `"${r.notes}"`
      ].join(',');
    });
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `silabus_akademik_healing_qurani_90hari_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRowClick = (day: number) => {
    setSelectedDay(day);
    setCurrentNav('materi');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Print Control */}
      <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <Calendar className="w-3.5 h-3.5" />
              <span>Silabus Pembelajaran 90 Hari</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Silabus Akademik Healing Qur’ani
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Matriks pemetaan materi 90 hari, indikator capaian, kompetensi terukur, dan rujukan ilmiah muktabar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari topik, indikator, hari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="all">Semua Mata Pelajaran ({resolvedSubjects.length} Mapel)</option>
              {resolvedSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="all">Semua Periode (Bulan 1–3)</option>
              <option value="1">Bulan 1: Hari 1–30 (Fondasi)</option>
              <option value="2">Bulan 2: Hari 31–60 (Pendalaman)</option>
              <option value="3">Bulan 3: Hari 61–90 (Penerapan)</option>
              {hasExtraDays && <option value="4">Materi Lanjutan (Hari &gt; 90)</option>}
            </select>
          </div>

          {/* Result Count and Reset */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Menampilkan <strong className="text-slate-800">{filteredSyllabus.length}</strong> dari {resolvedSyllabus.length} baris
            </span>
            {(searchQuery || selectedSubject !== 'all' || selectedMonth !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('all');
                  setSelectedMonth('all');
                }}
                className="text-emerald-700 hover:underline font-medium text-xs cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Printable Document Header (visible on print only) */}
      <div className="hidden print-only mb-6 text-center border-b-2 border-emerald-900 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
          SILABUS PROGRAM BIMBINGAN BELAJAR ISLAM 90 HARI
        </h2>
        <div className="text-sm font-semibold text-emerald-800">AKADEMIK HEALING QUR’ANI</div>
        <div className="text-xs text-slate-600 mt-1">
          "Belajar Ilmu Syar'i, Menata Hati, Mengamalkan Ilmu" · Dokumen Resmi Kurikulum
        </div>
      </div>

      {/* Silabus Data Table */}
      <div className="bg-white rounded-xl border border-emerald-900/15 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th scope="col" className="px-3.5 py-3 w-16 text-center">
                  Hari
                </th>
                <th scope="col" className="px-3.5 py-3 w-36">
                  Mata Pelajaran
                </th>
                <th scope="col" className="px-4 py-3 min-w-[200px]">
                  Materi Pokok
                </th>
                <th scope="col" className="px-4 py-3 min-w-[220px]">
                  Indikator Pembelajaran
                </th>
                <th scope="col" className="px-4 py-3 min-w-[220px]">
                  Capaian Kompetensi
                </th>
                <th scope="col" className="px-3.5 py-3 min-w-[180px]">
                  Keterangan & Rujukan
                </th>
                <th scope="col" className="px-3 py-3 w-20 text-center no-print">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSyllabus.map((row) => {
                const subject =
                  resolvedSubjects.find((s) => s.id === row.subjectId) || resolvedSubjects[0];
                const isCompleted = currentProgress.completedDays.includes(row.day);
                const month = row.day <= 30 ? 1 : row.day <= 60 ? 2 : 3;

                return (
                  <tr
                    key={row.day}
                    onClick={() => handleRowClick(row.day)}
                    className="hover:bg-emerald-50/50 transition-colors cursor-pointer group"
                  >
                    {/* No. Hari */}
                    <td className="px-3.5 py-3 text-center font-mono font-bold text-slate-900">
                      <div className="w-7 h-7 rounded-md bg-slate-100 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center mx-auto transition-colors text-xs">
                        {row.day}
                      </div>
                    </td>

                    {/* Mata Pelajaran */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 block">{subject.name}</span>
                      <span className="text-[10px] text-slate-400">Bulan {month}</span>
                    </td>

                    {/* Materi */}
                    <td className="px-4 py-3 font-medium text-slate-900 group-hover:text-emerald-900">
                      <div className="line-clamp-2">{row.topic}</div>
                    </td>

                    {/* Indikator */}
                    <td className="px-4 py-3 text-slate-600">
                      <div className="line-clamp-2">{row.indicator}</div>
                    </td>

                    {/* Capaian Kompetensi */}
                    <td className="px-4 py-3 text-slate-600">
                      <div className="line-clamp-2">{row.competence}</div>
                    </td>

                    {/* Keterangan */}
                    <td className="px-3.5 py-3 text-slate-500 text-[11px]">
                      <div className="line-clamp-2">{row.notes}</div>
                    </td>

                    {/* Status Centang (Peserta) */}
                    <td className="px-3 py-3 text-center no-print">
                      {isCompleted ? (
                        <span className="inline-flex items-center text-emerald-700 font-bold text-xs" title="Tuntas">
                          <CheckCircle className="w-4 h-4" />
                        </span>
                      ) : !isDayUnlocked(row.day) ? (
                        <span className="inline-flex items-center text-slate-400 text-xs" title="Terkunci hingga jadwal 00.00 WIB">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-emerald-600 text-[11px] font-semibold">Terbuka</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSyllabus.length === 0 && (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="font-semibold text-sm">Tidak ada materi silabus yang cocok dengan kata kunci pencarian.</p>
            <p className="text-xs">Coba ubah kata kunci atau bersihkan pilihan filter mata pelajaran.</p>
          </div>
        )}
      </div>
    </div>
  );
};
