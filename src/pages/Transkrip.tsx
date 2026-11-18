import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download, GraduationCap, CheckCircle2 } from 'lucide-react';

export const Transkrip: React.FC = () => {
  const {
    currentUser,
    calculateStudentGrades,
    currentProgress,
    systemSettings,
    resolvedSubjects,
    resolvedSyllabus,
    resolvedModules
  } = useApp();

  const grades = calculateStudentGrades();
  const completedCount = currentProgress.completedDays.length;

  const wDailyPct = systemSettings.weights.daily;
  const wMonthlyPct = systemSettings.weights.monthly;
  const wFinalPct = systemSettings.weights.final;

  const handlePrint = () => {
    window.print();
  };

  // Build subject breakdown rows based purely on real recorded evaluation data
  const subjectsBreakdown = resolvedSubjects.map((subject, idx) => {
    const subjectModules = resolvedSyllabus.filter((r) => r.subjectId === subject.id);
    const subjectDailyScores = subjectModules
      .map((r) => {
        const res = currentProgress.dailyResults[r.day];
        if (!res) return undefined;
        if (Object.keys(res.answers || {}).length === 0 && res.score === 0) return undefined;
        return res.score;
      })
      .filter((s): s is number => s !== undefined);

    const dailyScore: number | null =
      subjectDailyScores.length > 0
        ? Math.round(
            (subjectDailyScores.reduce((a, b) => a + b, 0) / subjectDailyScores.length) * 10
          ) / 10
        : grades.dailyAverage;

    const monthlyScore: number | null = grades.monthlyAverage;

    const finalExamScore: number | null =
      currentProgress.finalResult?.subjectScores?.[subject.id] ??
      (currentProgress.finalResult ? currentProgress.finalResult.score : null);

    let subjectFinal: number | null = null;
    let keterangan = 'Belum Lengkap';

    if (dailyScore !== null && monthlyScore !== null && finalExamScore !== null) {
      subjectFinal =
        Math.round(
          (dailyScore * (wDailyPct / 100) +
            monthlyScore * (wMonthlyPct / 100) +
            finalExamScore * (wFinalPct / 100)) *
            10
        ) / 10;

      keterangan =
        subjectFinal >= 90
          ? 'Mumtaz (Istimewa)'
          : subjectFinal >= 80
          ? 'Jayyid Jiddan (Sangat Baik)'
          : subjectFinal >= systemSettings.passingGrade
          ? 'Jayyid (Baik)'
          : 'Perlu Remedial';
    }

    return {
      no: idx + 1,
      subjectName: subject.name,
      arabicName: subject.arabicName,
      dailyScore,
      monthlyScore,
      finalExamScore,
      subjectFinal,
      keterangan
    };
  });

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Mata Pelajaran',
      'Nama Arab',
      `Nilai Harian (${wDailyPct}%)`,
      `Nilai Bulanan (${wMonthlyPct}%)`,
      `Evaluasi Akhir (${wFinalPct}%)`,
      'Nilai Akhir Mapel',
      'Predikat'
    ];
    const rows = subjectsBreakdown.map((s) =>
      [
        s.no,
        `"${s.subjectName}"`,
        `"${s.arabicName}"`,
        s.dailyScore ?? 'Belum Ada',
        s.monthlyScore ?? 'Belum Ada',
        s.finalExamScore ?? 'Belum Ada',
        s.subjectFinal ?? 'Belum Lengkap',
        `"${s.keterangan}"`
      ].join(',')
    );
    const summary = [
      '',
      '',
      `"RATA-RATA AKADEMIK: ${grades.finalGrade ?? grades.dailyAverage ?? 'Belum Lengkap'}"`,
      `"PREDIKAT KELULUSAN: ${grades.predicate}"`,
      `"PERSENTASE PENYELESAIAN: ${grades.completionPercentage}%"`,
      `"EVALUASI PEKANAN: ${grades.weeklyCount}/13 Pekan"`
    ].join(',');
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows, '', summary].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `transkrip_nilai_${currentUser.studentNumber}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const docYear = new Date().getFullYear();

  return (
    <div className="space-y-6 pb-16">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="bg-white rounded-xl border border-emerald-900/15 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              Transkrip Nilai Akademik Resmi
            </h1>
            <p className="text-xs text-slate-500">
              Dokumen transkrip dihitung langsung dari perolehan evaluasi nyata peserta (Benar +2 poin, Salah +1 poin).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF Transkrip</span>
          </button>
        </div>
      </div>

      {/* Official Transcript Sheet (Print optimized) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 sm:p-12 print-container max-w-4xl mx-auto space-y-8 font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-emerald-900/80 pb-6 text-center space-y-2">
          <div className="font-arabic text-2xl text-emerald-900 font-bold mb-1">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
          {systemSettings.logoUrl ? (
            <div className="w-16 h-16 rounded-full bg-white overflow-hidden flex items-center justify-center mx-auto shadow-2xs border-2 border-amber-400 p-1">
              <img
                src={systemSettings.logoUrl}
                alt="Logo Resmi Akademik"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-emerald-800 text-amber-300 font-arabic text-2xl font-bold flex items-center justify-center mx-auto shadow-2xs border-2 border-amber-400">
              ح
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-wide uppercase">
            TRANSKRIP NILAI PEMBELAJARAN
          </h2>
          <div className="text-sm sm:text-base font-bold text-emerald-800 tracking-wider">
            AKADEMIK HEALING QUR’ANI
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {systemSettings.institutionName} · Program Bimbingan Belajar Islam Terstruktur 90 Hari
          </p>
          <div className="text-[11px] font-mono text-slate-500">
            No. Dokumen: TR-AHQ/{docYear}/{currentUser.studentNumber}
          </div>
        </div>

        {/* Identitas Peserta */}
        <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/70 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 pb-2 border-b border-slate-200">
            Identitas Peserta Pembelajaran
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Lengkap:</span>
              <strong className="text-slate-900 font-semibold">{currentUser.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nomor Peserta:</span>
              <span className="font-mono font-bold text-emerald-800">{currentUser.studentNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Periode Belajar:</span>
              <span className="text-slate-800">90 Hari (3 Bulan Terpadu)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal Mulai:</span>
              <span className="text-slate-800">{currentUser.registrationDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Evaluasi Pekanan:</span>
              <span className="font-mono font-semibold text-slate-800">
                {grades.weeklyCount} / 13 Pekan{grades.weeklyAverage !== null ? ` (Rata-rata ${grades.weeklyAverage}%)` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status Pembelajaran:</span>
              <span
                className={`font-semibold ${
                  completedCount >= 90 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {completedCount >= resolvedModules.length
                  ? `Menyelesaikan Program ${resolvedModules.length} Hari`
                  : `Aktif Belajar (${completedCount}/${resolvedModules.length} Hari)`}
              </span>
            </div>
          </div>
        </div>

        {/* Tabel Transkrip */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Daftar Capaian Nilai Per Mata Pelajaran
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-emerald-900 text-white font-semibold text-[11px]">
                <tr>
                  <th scope="col" className="px-3 py-2.5 text-center w-10">
                    No.
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Mata Pelajaran
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Nilai Harian ({wDailyPct}%)
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Nilai Bulanan ({wMonthlyPct}%)
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Evaluasi Akhir ({wFinalPct}%)
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-bold bg-emerald-950">
                    Nilai Akhir Mapel
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-left">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjectsBreakdown.map((row) => (
                  <tr key={row.no} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 text-center font-mono font-medium text-slate-600">
                      {row.no}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900">{row.subjectName}</div>
                      <div className="text-[10px] text-slate-500 font-arabic">{row.arabicName}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                      {row.dailyScore !== null ? row.dailyScore : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                      {row.monthlyScore !== null ? row.monthlyScore : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                      {row.finalExamScore !== null ? row.finalExamScore : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-900 bg-emerald-50/50">
                      {row.subjectFinal !== null ? row.subjectFinal : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 font-medium">{row.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ringkasan Nilai Akhir & Kelulusan */}
        <div className="bg-emerald-50/60 rounded-xl p-5 border border-emerald-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Nilai Kumulatif Akhir:</span>
            <div className="text-xl font-bold font-mono text-emerald-900 mt-0.5">
              {grades.finalGrade !== null
                ? grades.finalGrade
                : grades.dailyAverage !== null
                ? grades.dailyAverage
                : '—'}
            </div>
            <span className="text-[10px] text-slate-500">
              {grades.finalGrade !== null ? 'Gabungan 3 Komponen' : 'Sementara (Harian)'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Penyelesaian Modul:</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {grades.completionPercentage}%
            </div>
            <span className="text-[10px] text-slate-500">
              {completedCount} dari {resolvedModules.length} Hari
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Predikat Capaian:</span>
            <div className="text-sm font-bold text-emerald-950 mt-1">{grades.predicate}</div>
          </div>

          <div>
            <span className="text-slate-500 block">Status Kelulusan:</span>
            <div className="text-sm font-bold text-emerald-800 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {grades.isComplete && grades.isPassing ? 'LULUS PROGRAM' : 'Dalam Proses Belajar'}
              </span>
            </div>
          </div>
        </div>

        {/* Signature & Endorsement */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-700 print-break-inside-avoid">
          <div>
            <div className="font-semibold text-slate-900">Catatan Akademik:</div>
            <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
              Transkrip ini diterbitkan secara sah oleh sistem evaluasi digital Akademik Healing Qur’ani berdasarkan riwayat pengerjaan evaluasi harian, pekanan, bulanan, dan evaluasi akhir yang tersimpan pada akun peserta.
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="text-slate-500">
              {currentUser.city || 'Indonesia'},{' '}
              {new Date().toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="font-semibold text-slate-900 pt-1">{systemSettings.signatoryTitle}</div>
            <div className="h-14 flex items-end justify-end">
              <div className="font-certificate text-emerald-900 text-sm italic font-bold">
                {systemSettings.signatoryName}
              </div>
            </div>
            <div className="font-bold text-slate-900">{systemSettings.signatoryName}</div>
            <div className="text-[11px] text-slate-500">{systemSettings.signatoryTitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
