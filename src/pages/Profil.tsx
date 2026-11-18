import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AuthModal } from '../components/AuthModal';
import { WhatsappReminderCard } from '../components/WhatsappReminderCard';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  Mail,
  Phone,
  MapPin,
  Save,
  Lock,
  LogOut,
  UserPlus,
  LogIn
} from 'lucide-react';

export const Profil: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserProfile,
    currentProgress,
    calculateStudentGrades,
    changeLocalPassword,
    resolvedModules,
    logout
  } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [city, setCity] = useState(currentUser.city);
  const [savedNotice, setSavedNotice] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwNotice, setPwNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Auth modal for guest visitors
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  useEffect(() => {
    setName(currentUser.name);
    setPhone(currentUser.phone);
    setCity(currentUser.city);
  }, [currentUser]);

  const grades = calculateStudentGrades();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim()
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwNotice(null);

    if (newPassword !== confirmNewPassword) {
      setPwNotice({ type: 'err', text: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    if (newPassword.length < 6) {
      setPwNotice({ type: 'err', text: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPwNotice({ type: 'err', text: error.message });
      } else {
        setPwNotice({ type: 'ok', text: 'Kata sandi cloud Anda berhasil diperbarui.' });
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
      return;
    }

    const res = await changeLocalPassword(oldPassword, newPassword);
    setPwNotice({ type: res.success ? 'ok' : 'err', text: res.message });
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Guest Notice Banner */}
      {currentUser.isGuest && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-amber-950 text-sm">
              Anda Sedang Mengakses Sebagai Peserta Tamu
            </div>
            <p className="text-amber-900">
              Daftarkan akun pribadi Anda agar progres 90 hari, riwayat nilai evaluasi, dan sertifikat kelulusan tercatat permanen atas nama Anda.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthOpen(true);
              }}
              className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-950 font-bold rounded-lg border border-amber-300 flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-100 shadow-xs shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{currentUser.name}</h1>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {currentUser.isGuest ? 'Tamu' : currentUser.role}
            </span>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Nomor Peserta: <strong className="text-slate-800">{currentUser.studentNumber}</strong> ·
            Terdaftar: {currentUser.registrationDate}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 pt-1">
            {currentUser.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
              </span>
            )}
            {currentUser.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.phone}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.city || 'Indonesia'}</span>
            </span>
          </div>
        </div>

        {!currentUser.isGuest && (
          <button
            onClick={() => void logout()}
            className="px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        )}
      </div>

      {/* Progress & Academic Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-emerald-900/15 shadow-2xs">
          <span className="text-xs text-slate-500 block">Modul Tuntas</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
            {currentProgress.completedDays.length}
          </div>
          <span className="text-[11px] text-slate-600">Dari {resolvedModules.length} Hari</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-900/15 shadow-2xs">
          <span className="text-xs text-slate-500 block">Persentase</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {grades.completionPercentage}%
          </div>
          <span className="text-[11px] text-slate-600">Target Kurikulum</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-900/15 shadow-2xs">
          <span className="text-xs text-slate-500 block">Rata-rata Harian</span>
          <div className="text-2xl font-bold font-mono text-teal-700 mt-1">
            {grades.dailyAverage !== null ? `${grades.dailyAverage}%` : '—'}
          </div>
          <span className="text-[11px] text-slate-600">Pekanan: {grades.weeklyCount}/13</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-900/15 shadow-2xs">
          <span className="text-xs text-slate-500 block">Status Sertifikat</span>
          <div className="text-xs font-bold text-slate-800 mt-2 line-clamp-2">
            {grades.certificateStatus}
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Perbarui Informasi Akun Peserta</span>
          <span className="text-xs text-slate-600 font-normal">Sinkronisasi Otomatis</span>
        </h3>

        {savedNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
            Profil Anda berhasil diperbarui!
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nama Lengkap (Termasuk Gelar):
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
              <span className="text-[10px] text-slate-600 mt-0.5 block">
                Nama ini akan dicetak pada Sertifikat & Transkrip resmi.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nomor WhatsApp / Kontak:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 8..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kota Domisili:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Alamat Email:</label>
              <input
                type="email"
                value={currentUser.email || 'Belum terdaftar (Mode Tamu)'}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </button>
          </div>
        </form>
      </div>

      {/* WhatsApp Material Reminder Preferences */}
      <WhatsappReminderCard variant="full" />

      {/* Password Security Section for Registered Users */}
      {!currentUser.isGuest && (
        <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700" />
            <span>Keamanan & Kata Sandi Akun</span>
          </h3>

          {pwNotice && (
            <div
              className={`p-3 rounded-lg border text-xs font-medium ${
                pwNotice.type === 'ok'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {pwNotice.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {!isSupabaseConfigured() && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kata Sandi Lama:</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>
            )}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kata Sandi Baru:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 karakter"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Konfirmasi Sandi Baru:
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Ulangi sandi baru"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                required
              />
            </div>
            <div className="sm:col-span-3 flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
              >
                Perbarui Kata Sandi
              </button>
            </div>
          </form>
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode={authMode} />
    </div>
  );
};
