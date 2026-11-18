import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuthModal } from './AuthModal';
import { isSupabaseConfigured } from '../lib/supabase';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { currentUser, setCurrentNav, systemSettings, hasAnyAdmin } = useApp();
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);

  const handleOpenAdminPortal = () => {
    if (currentUser.role === 'admin' || currentUser.role === 'pengajar') {
      setCurrentNav('admin');
      return;
    }
    setAdminAuthOpen(true);
  };

  const defaultAdminModalMode =
    !hasAnyAdmin() && !isSupabaseConfigured() ? 'admin_setup' : 'login';

  return (
    <>
      <footer className="bg-[#053B2E] text-emerald-100/90 text-xs border-t border-emerald-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Info */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5 text-white">
                {systemSettings.logoUrl ? (
                  <div className="w-8 h-8 rounded-lg bg-white overflow-hidden flex items-center justify-center border border-emerald-600/50 shrink-0">
                    <img
                      src={systemSettings.logoUrl}
                      alt="Logo Resmi"
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-amber-300 flex items-center justify-center font-arabic text-lg font-bold border border-emerald-600/50 shrink-0">
                    ح
                  </div>
                )}
                <span className="text-base font-bold tracking-tight">Akademik Healing Qur’ani</span>
              </div>
              <p className="text-emerald-100/90 text-xs leading-relaxed max-w-sm">
                {systemSettings.institutionName}. Platform bimbingan belajar Islam terstruktur selama 90 hari berdasarkan Al-Qur'an dan Sunnah.
              </p>
              <div className="text-[11px] text-amber-300 font-semibold">
                Program Kurikulum Terstruktur 90 Hari
              </div>
            </div>

            {/* Nav Links */}
            <div className="space-y-2">
              <div className="text-white font-semibold text-xs uppercase tracking-wider">
                Kurikulum & Silabus
              </div>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button
                    onClick={() => setCurrentNav('kurikulum')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    7 Mata Pelajaran Utama
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentNav('silabus')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Silabus Lengkap 90 Hari
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentNav('materi')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Modul Pembelajaran Harian
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentNav('evaluasi')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Pusat Evaluasi & Ujian
                  </button>
                </li>
              </ul>
            </div>

            {/* Academic Documents */}
            <div className="space-y-2">
              <div className="text-white font-semibold text-xs uppercase tracking-wider">
                Kelulusan & Bantuan
              </div>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button
                    onClick={() => setCurrentNav('transkrip')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Transkrip Nilai Akademik
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentNav('sertifikat')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Sertifikat Kelulusan & Verifikasi
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentNav('profil')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Profil & Perkembangan Belajar
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentNav('bantuan')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Pusat Bantuan & Konsultasi
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-emerald-200/90">
            <div>
              © {new Date().getFullYear()} Akademik Healing Qur’ani. Seluruh hak cipta dilindungi.
            </div>
            <div className="flex items-center gap-4">
              <span>Didedikasikan untuk pendidikan umat & tazkiyatun nafs</span>
              <button
                onClick={handleOpenAdminPortal}
                className="inline-flex items-center gap-1 text-emerald-200/80 hover:text-amber-300 transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                <Shield className="w-3 h-3" />
                <span>Portal Pengelola</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={adminAuthOpen}
        onClose={() => setAdminAuthOpen(false)}
        defaultMode={defaultAdminModalMode}
      />
    </>
  );
};
