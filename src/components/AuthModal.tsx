import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  fetchOrCreateSupabaseProfile,
  fetchLearningProgressFromSupabase
} from '../lib/supabaseSync';
import { isValidWhatsappPhone, normalizeWhatsappPhone } from '../lib/whatsappReminder';
import { forgotPasswordLookupViaServer } from '../lib/portalApi';
import {
  Lock,
  Mail,
  User,
  X,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus,
  Shield
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'forgot' | 'admin_setup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login'
}) => {
  const {
    systemSettings,
    registerNewUser,
    verifyLocalLogin,
    hasAnyAdmin,
    setupInitialAdmin,
    hydrateSupabaseSessionUser
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'admin_setup'>(defaultMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  const canSetupAdminOffline = !hasAnyAdmin() && !isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          const profile = await fetchOrCreateSupabaseProfile(
            data.user.id,
            data.user.email || email,
            data.user.user_metadata
          );
          const cloudProgress = await fetchLearningProgressFromSupabase(data.user.id);
          if (profile) {
            hydrateSupabaseSessionUser(profile, cloudProgress);
            setSuccessMsg(`Berhasil masuk! Selamat datang, ${profile.name}.`);
          } else {
            setSuccessMsg('Berhasil masuk ke portal Akademik Healing Qur’ani.');
          }
          setTimeout(() => {
            onClose();
          }, 800);
        }
      } else {
        const loggedUser = await verifyLocalLogin(email, password);
        setSuccessMsg(`Selamat datang kembali, ${loggedUser.name}!`);
        setTimeout(() => {
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!systemSettings.allowSelfRegistration) {
      setErrorMsg('Pendaftaran mandiri saat ini sedang dinonaktifkan oleh Administrator.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    if (!isValidWhatsappPhone(phone)) {
      setErrorMsg(
        'Nomor WhatsApp aktif wajib diisi minimal 10 digit (contoh: 0812xxxx atau +62812xxxx) untuk menerima pengingat materi & Kata Hikmah harian.'
      );
      return;
    }

    const formattedPhone = `+${normalizeWhatsappPhone(phone)}`;
    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone: formattedPhone,
              city,
              role: 'peserta'
            }
          }
        });
        if (error) throw error;
        if (data.user && data.session) {
          const profile = await fetchOrCreateSupabaseProfile(data.user.id, email, {
            name,
            phone: formattedPhone,
            city,
            role: 'peserta'
          });
          if (profile) {
            hydrateSupabaseSessionUser(profile, []);
          }
          setSuccessMsg(
            `Pendaftaran berhasil! Nomor Peserta Anda: ${profile?.studentNumber || 'AHQ'}. Pengingat WhatsApp otomatis aktif ke ${formattedPhone}.`
          );
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setSuccessMsg(
            'Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk konfirmasi akun.'
          );
        }
      } else {
        const created = await registerNewUser(name, email, formattedPhone, city, password);
        setSuccessMsg(
          `Pendaftaran berhasil! Nomor Peserta Anda: ${created.studentNumber}. Notifikasi WhatsApp otomatis terhubung ke ${formattedPhone}.`
        );
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Pendaftaran gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi Administrator minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const admin = await setupInitialAdmin(name, email, phone, city, password);
      setSuccessMsg(
        `Akun Administrator perdana (${admin.name}) berhasil dibuat! Anda kini masuk sebagai pengelola.`
      );
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyiapkan akun Administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Masukkan alamat email yang terdaftar.');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        setSuccessMsg(
          'Tautan pengaturan ulang kata sandi telah dikirim ke email Anda melalui sistem cloud.'
        );
      } else {
        const res = await forgotPasswordLookupViaServer(email.trim());
        if (!res.success) {
          throw new Error(res.error || 'Email tersebut tidak ditemukan di daftar akun portal.');
        }
        setSuccessMsg(
          res.message ||
            'Akun Anda terdaftar di portal. Silakan hubungi Administrator Akademik melalui Pusat Bantuan untuk pengaturan ulang kata sandi.'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses permintaan pemulihan sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-800 text-amber-300 font-arabic text-2xl font-bold flex items-center justify-center mx-auto border-2 border-amber-400">
            ح
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Akademik Healing Qur’ani
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Masuk ke portal bimbingan belajar 90 hari Anda'
              : mode === 'register'
              ? 'Daftar sebagai peserta program bimbingan belajar 90 hari'
              : mode === 'admin_setup'
              ? 'Registrasi Administrator Perdana Pengelola Akademik'
              : 'Pemulihan akses kata sandi'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'admin_setup' && mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-md transition-colors cursor-pointer ${
                mode === 'login' ? 'bg-white text-emerald-900 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-md transition-colors cursor-pointer ${
                mode === 'register' ? 'bg-white text-emerald-900 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>
        )}

        {/* Error and Success Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Alamat Email:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Kata Sandi:</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-emerald-700 hover:underline text-[11px] cursor-pointer"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Memproses...' : 'Masuk Sekarang'}</span>
            </button>

            {canSetupAdminOffline && (
              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('admin_setup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[11px] text-emerald-800 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Belum ada Administrator? Siapkan Akun Pengelola Perdana</span>
                </button>
              </div>
            )}
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap sesuai identitas sertifikat"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  WhatsApp Aktif (+62...):
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxx / +62812xxxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kota Domisili:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: Jakarta"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
            </div>
            <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/70 rounded-lg px-2.5 py-1.5 leading-relaxed">
              Nomor WhatsApp ini otomatis menerima pengingat materi saat modul terbuka (00.00 WIB) &amp; Kata Hikmah &quot;Pengingat hari ini&quot; setiap pukul 08.00 WIB selama 90 hari.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kata Sandi:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 karakter"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Konfirmasi Sandi:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi sandi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Mendaftarkan...' : 'Daftar Sebagai Peserta'}</span>
            </button>
          </form>
        )}

        {/* INITIAL ADMIN SETUP (Only available if no local admin exists & Supabase not configured) */}
        {mode === 'admin_setup' && (
          <form onSubmit={handleAdminSetup} className="space-y-3 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
              Buat akun <strong>Administrator Perdana</strong> untuk mengelola peserta, nilai, sertifikat, dan pengaturan integrasi cloud Supabase.
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Pengelola / Mudir:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap pengelola"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Pengelola:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lembaga.id"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">WhatsApp:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 8..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kota:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Jakarta"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kata Sandi:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 karakter"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Konfirmasi:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi sandi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-1/3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Buat Akun Administrator'}</span>
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Masukkan alamat email Anda yang terdaftar untuk memulihkan akses kata sandi akun Anda.
            </p>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Alamat Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
              >
                Kembali ke Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer"
              >
                {loading ? 'Mengirim...' : 'Pulihkan Sandi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
