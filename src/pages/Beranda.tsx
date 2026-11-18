import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuthModal } from '../components/AuthModal';
import { WhatsappReminderCard } from '../components/WhatsappReminderCard';
import {
  BookOpen,
  CheckCircle2,
  Award,
  ArrowRight,
  Sparkles,
  Calendar,
  TrendingUp,
  GraduationCap,
  Megaphone,
  UserPlus,
  LogIn
} from 'lucide-react';

export const Beranda: React.FC = () => {
  const {
    currentUser,
    currentProgress,
    calculateStudentGrades,
    systemSettings,
    setCurrentNav,
    setSelectedDay,
    getMaxUnlockedDay,
    resolvedModules
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const grades = calculateStudentGrades();
  const totalModuleCount = resolvedModules.length > 0 ? resolvedModules.length : 90;
  const completedCount = currentProgress.completedDays.length;
  const remainingCount = Math.max(0, totalModuleCount - completedCount);
  const lastDay = currentProgress.lastAccessedDay || 1;
  const maxUnlocked = getMaxUnlockedDay();

  // Pick first uncompleted unlocked day, otherwise latest unlocked day
  let nextDay = maxUnlocked;
  for (let d = 1; d <= maxUnlocked; d++) {
    if (!currentProgress.completedDays.includes(d)) {
      nextDay = d;
      break;
    }
  }

  const handleStartFirstDay = () => {
    setSelectedDay(1);
    setCurrentNav('materi');
  };

  const handleContinueLearning = () => {
    setSelectedDay(nextDay);
    setCurrentNav('materi');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#F5FAF7] to-[#FFFDF6] text-black shadow-sm border border-emerald-900/20 border-t-4 border-t-emerald-800">
        <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-emerald-100 text-black text-xs sm:text-sm font-bold border border-emerald-800/25">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-black">Program Bimbingan Belajar Islam Terstruktur 90 Hari</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-black font-sans">
                Selamat Datang di Akademik Healing Qur’ani
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-black leading-relaxed">
                Selamat belajar,{' '}
                <span className="font-bold text-black underline decoration-emerald-700/50 underline-offset-4">
                  {currentUser.isGuest ? 'Sahabat Penuntut Ilmu' : currentUser.name}
                </span>
                . Mari menuntut ilmu berdasarkan Al-Qur'an dan Sunnah, memperbaiki pemahaman agama, menata hati, serta mengamalkan ilmu dalam kehidupan sehari-hari.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs sm:text-sm text-black border-t border-emerald-900/15">
              <div>
                <span className="text-black/75 font-medium block text-xs">Mulai Belajar:</span>
                <span className="font-bold text-black">{currentUser.registrationDate}</span>
              </div>
              <div>
                <span className="text-black/75 font-medium block text-xs">Target 90 Hari:</span>
                <span className="font-bold text-black">{currentUser.targetDate}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-black/75 font-medium block text-xs">Nomor Peserta:</span>
                <span className="font-bold text-black font-mono">{currentUser.studentNumber}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleContinueLearning}
                className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition-all shadow-xs hover:shadow flex items-center gap-2 border border-amber-500/60 cursor-pointer"
              >
                <span>Lanjutkan Hari ke-{nextDay}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleStartFirstDay}
                className="px-4 py-2.5 rounded-lg bg-white hover:bg-emerald-50 text-black font-semibold text-sm transition-colors border border-emerald-900/25 cursor-pointer"
              >
                Mulai dari Hari Pertama
              </button>
              {currentUser.isGuest && systemSettings.allowSelfRegistration && (
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Peserta Resmi</span>
                </button>
              )}
            </div>
          </div>

          {/* User Profile Thumbnail & Quick Status Card */}
          <div className="w-full lg:w-72 shrink-0 bg-[#ECF4F0] rounded-xl p-5 border border-emerald-900/20 text-black shadow-2xs">
            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-emerald-900/15">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-700 bg-white shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-black line-clamp-1">{currentUser.name}</div>
                <div className="text-xs text-black/80 font-medium capitalize">
                  {currentUser.city || 'Indonesia'} · {currentUser.isGuest ? 'Tamu' : currentUser.role}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-black font-medium">Progres Keseluruhan:</span>
                <span className="font-bold text-black font-mono text-sm">
                  {grades.completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-emerald-900/20">
                <div
                  className="bg-emerald-700 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${grades.completionPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-black font-semibold">
                <span>{completedCount} Selesai</span>
                <span>{remainingCount} Belum Selesai</span>
              </div>

              {currentUser.isGuest && (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="w-full mt-2 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-emerald-900/20 text-xs font-bold text-emerald-900 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk ke Akun Terdaftar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quote Banner */}
      <div className="bg-[#FFFDF7] rounded-2xl p-5 border border-amber-700/20 border-l-4 border-l-amber-600 flex items-start gap-3.5 shadow-xs">
        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 font-arabic text-lg font-bold border border-amber-200">
          ﷽
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Pesan Motivasi Belajar Islam
          </div>
          <p className="text-sm sm:text-[15px] font-medium text-slate-900 italic leading-relaxed">
            "{systemSettings.motivationQuote.text}"
          </p>
          <div className="text-xs font-medium text-amber-900">
            — {systemSettings.motivationQuote.source}
          </div>
        </div>
      </div>

      {/* Papan Pengumuman Resmi Akademik */}
      {systemSettings.announcements && systemSettings.announcements.some((a) => a.isActive) && (
        <div className="bg-white rounded-2xl border border-emerald-900/15 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Megaphone className="w-4 h-4 text-emerald-700" />
              <span>Papan Pengumuman Resmi Akademik</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {systemSettings.announcements.filter((a) => a.isActive).length} Pengumuman Aktif
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {systemSettings.announcements
              .filter((a) => a.isActive)
              .map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl bg-[#F6FBF8] border border-emerald-900/15 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      {ann.category}
                    </span>
                    <span className="text-[11px] text-slate-600 font-mono">{ann.publishedAt}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">{ann.title}</div>
                  <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Section B: Dashboard Progres (Stat Cards Grid) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <span>Dashboard Progres Belajar</span>
          </h2>
          <span className="text-xs text-slate-500">Target Kurikulum: {totalModuleCount} Modul Harian</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white rounded-xl p-4 border border-emerald-900/15 shadow-xs">
            <span className="text-xs text-slate-600 font-medium block">Total Materi</span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{totalModuleCount}</div>
            <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
              Hari Pembelajaran
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-900/15 shadow-xs">
            <span className="text-xs text-slate-600 font-medium block">Materi Selesai</span>
            <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
              {completedCount}
            </div>
            <span className="text-[11px] text-slate-600 mt-1 block">Telah Dicentang</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-900/15 shadow-xs">
            <span className="text-xs text-slate-600 font-medium block">Belum Selesai</span>
            <div className="text-2xl font-bold text-amber-700 font-mono mt-1">
              {remainingCount}
            </div>
            <span className="text-[11px] text-slate-600 mt-1 block">Hari Tersisa</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-900/15 shadow-xs">
            <span className="text-xs text-slate-600 font-medium block">Penyelesaian</span>
            <div className="text-2xl font-bold text-emerald-800 font-mono mt-1">
              {grades.completionPercentage}%
            </div>
            <span className="text-[11px] text-slate-600 mt-1 block">Dari Target Program</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-900/15 shadow-xs">
            <span className="text-xs text-slate-600 font-medium block">Rata-rata Harian</span>
            <div className="text-2xl font-bold text-teal-800 font-mono mt-1">
              {grades.dailyAverage !== null ? `${grades.dailyAverage}%` : '—'}
            </div>
            <span className="text-[11px] text-slate-600 mt-1 block">
              Pekanan: {grades.weeklyCount}/13
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-900/15 shadow-xs">
            <span className="text-xs text-slate-600 font-medium block">Status Sertifikat</span>
            <div className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
              {grades.certificateStatus}
            </div>
            <span className="text-[11px] text-slate-600 mt-1 block">
              Batas Min: {systemSettings.passingGrade}%
            </span>
          </div>
        </div>
      </div>

      {/* Section C: Aktivitas Pembelajaran & Quick Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-emerald-900/15 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <span>Aktivitas Pembelajaran Peserta</span>
              <span className="text-xs font-normal text-emerald-700">
                Terbuka sampai Hari ke-{maxUnlocked}
              </span>
            </h3>

            <div className="space-y-3">
              {/* Materi Terakhir Dibuka */}
              <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-mono font-bold text-xs">
                    {lastDay}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Materi Terakhir Diakses
                    </span>
                    <div className="text-sm font-bold text-slate-900">Hari ke-{lastDay}</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Bulan{' '}
                      {lastDay <= 30
                        ? '1 (Fondasi)'
                        : lastDay <= 60
                        ? '2 (Pendalaman)'
                        : '3 (Penerapan)'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDay(lastDay);
                    setCurrentNav('materi');
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  Buka
                </button>
              </div>

              {/* Evaluasi Berikutnya */}
              <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-teal-50/60 border border-teal-200/60">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-teal-800 block">
                      Jadwal Evaluasi Berikutnya
                    </span>
                    <div className="text-sm font-bold text-slate-900">
                      {completedCount < 30
                        ? 'Evaluasi Pekanan & Bulan 1 (Hari 1–30)'
                        : completedCount < 60
                        ? 'Evaluasi Pekanan & Bulan 2 (Hari 31–60)'
                        : 'Evaluasi Bulan 3 & Evaluasi Akhir'}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Benar = 2 Poin · Salah = 1 Poin. Batas lulus: {systemSettings.passingGrade}%.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentNav('evaluasi')}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-teal-700 hover:bg-teal-800 text-white transition-colors cursor-pointer shrink-0"
                >
                  Lihat Evaluasi
                </button>
              </div>

              {/* Pencapaian Belajar */}
              <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-950">
                      {completedCount >= totalModuleCount
                        ? `Alhamdulillah! Seluruh ${totalModuleCount} Hari Materi Telah Tuntas`
                        : `${completedCount} dari ${totalModuleCount} Hari Materi Berhasil Dikuasai`}
                    </div>
                    <div className="text-xs text-emerald-800">
                      {completedCount >= totalModuleCount
                        ? 'Silakan pastikan seluruh evaluasi bulanan dan akhir telah dikerjakan.'
                        : 'Pertahankan istiqamah membaca satu modul setiap hari.'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentNav('silabus')}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline shrink-0 cursor-pointer"
                >
                  Cek Silabus
                </button>
              </div>
            </div>
          </div>

          <WhatsappReminderCard variant="compact" day={nextDay} />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-emerald-900/15 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
              Menu Aksi Cepat
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setCurrentNav('kurikulum')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                      Buka Kurikulum 7 Mapel
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Al-Qur’an, Hadis, Fikih, Sirah, dll.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
              </button>

              <button
                onClick={() => setCurrentNav('transkrip')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                      Lihat Transkrip Nilai
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Kalkulasi nilai harian, bulanan, & akhir
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
              </button>

              <button
                onClick={() => setCurrentNav('sertifikat')}
                className="w-full p-3 rounded-lg border border-amber-200/80 bg-amber-50/30 hover:bg-amber-50 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                      Status & Dokumen Sertifikat
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Verifikasi kode & unduh PDF kelulusan
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700" />
              </button>

              <button
                onClick={() => setCurrentNav('bantuan')}
                className="w-full p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-left transition-colors text-xs font-medium text-slate-600 flex items-center justify-between cursor-pointer"
              >
                <span>Panduan Belajar & Pusat Bantuan</span>
                <span className="text-slate-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};
