import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuthModal } from './AuthModal';
import {
  BookOpen,
  Home,
  FileText,
  Calendar,
  CheckSquare,
  Award,
  GraduationCap,
  User,
  HelpCircle,
  Shield,
  Menu,
  X,
  LogIn,
  LogOut,
  UserPlus,
  Clock,
  Cloud
} from 'lucide-react';
import { getDatabaseStatus } from '../lib/supabase';

export const Navbar: React.FC = () => {
  const { currentUser, currentNav, setCurrentNav, systemSettings, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'admin_setup'>('login');

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'kurikulum', label: 'Kurikulum', icon: BookOpen },
    { id: 'silabus', label: 'Silabus', icon: Calendar },
    { id: 'materi', label: 'Materi 90 Hari', icon: FileText },
    { id: 'evaluasi', label: 'Evaluasi', icon: CheckSquare },
    { id: 'transkrip', label: 'Transkrip Nilai', icon: GraduationCap },
    { id: 'sertifikat', label: 'Sertifikat', icon: Award },
    { id: 'profil', label: 'Profil', icon: User },
    { id: 'bantuan', label: 'Pusat Bantuan', icon: HelpCircle }
  ];

  if (currentUser.role === 'admin' || currentUser.role === 'pengajar') {
    navItems.push({ id: 'admin', label: 'Kelola Akademik', icon: Shield });
  }

  const handleOpenLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode('register');
    setAuthModalOpen(true);
  };

  const dbStatus = getDatabaseStatus();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/15 shadow-xs no-print">
        {/* Top Banner Notice: Schedule & Account Status */}
        <div className="bg-[#064E3B] text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Jadwal Harian Otomatis: Buka Pukul {systemSettings.unlockTimeWIB || '00.00'} WIB</span>
            </span>
            <span className="text-emerald-300 hidden md:inline">·</span>
            <span className="text-emerald-100 hidden md:inline">
              Materi mendatang terkunci teratur untuk menjaga istiqamah belajar
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {dbStatus.isConfigured && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-200 bg-emerald-900/70 px-2 py-0.5 rounded border border-emerald-700/60">
                <Cloud className="w-3 h-3 text-emerald-300" />
                <span>Sinkronisasi Cloud Aktif</span>
              </span>
            )}

            {currentUser.isGuest ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-100/90 hidden sm:inline">
                  Mode Tamu · Daftar agar progres tersimpan permanen
                </span>
                <button
                  onClick={handleOpenLogin}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-semibold border border-emerald-600/60 cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={handleOpenRegister}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Daftar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCurrentNav('profil')}
                  className="flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-800 text-white px-2.5 py-0.5 rounded text-xs font-medium transition-colors border border-emerald-600/70 cursor-pointer"
                >
                  <span className="max-w-[140px] truncate">{currentUser.name}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.2 bg-emerald-700 rounded text-amber-200 font-bold">
                    {currentUser.role}
                  </span>
                </button>
                <button
                  onClick={() => void logout()}
                  className="inline-flex items-center gap-1 text-emerald-100 hover:text-amber-300 font-medium cursor-pointer"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title */}
            <div
              onClick={() => setCurrentNav('beranda')}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
              {systemSettings.logoUrl ? (
                <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center shadow-xs border border-emerald-900/15 shrink-0">
                  <img
                    src={systemSettings.logoUrl}
                    alt="Logo Akademik Healing Qur’ani"
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-arabic text-xl font-bold shadow-xs group-hover:bg-emerald-800 transition-colors border border-emerald-600/40 shrink-0">
                  ح
                </div>
              )}
              <div>
                <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>Akademik Healing Qur’ani</span>
                  <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    90 Hari
                  </span>
                </div>
                <div className="hidden md:block text-[11px] text-slate-500 font-normal">
                  Belajar Ilmu Syar'i, Menata Hati, Mengamalkan Ilmu
                </div>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentNav(item.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Tablet Nav Secondary */}
            <div className="hidden lg:flex xl:hidden items-center gap-1">
              {navItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const isActive = currentNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentNav(item.id)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                      isActive ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="px-2.5 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-100 rounded-md cursor-pointer"
              >
                Lainnya...
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex xl:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded-lg focus:outline-none cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <div className="pb-2 mb-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
              <span>Menu Navigasi</span>
              {currentUser.isGuest ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenLogin();
                  }}
                  className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Masuk / Daftar
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void logout();
                  }}
                  className="text-xs text-red-700 font-bold hover:underline cursor-pointer"
                >
                  Keluar ({currentUser.name.split(' ')[0]})
                </button>
              )}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentNav(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
};
