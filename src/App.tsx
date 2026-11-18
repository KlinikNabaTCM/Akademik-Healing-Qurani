/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Beranda } from './pages/Beranda';
import { Kurikulum } from './pages/Kurikulum';
import { Silabus } from './pages/Silabus';
import { Materi } from './pages/Materi';
import { Evaluasi } from './pages/Evaluasi';
import { Transkrip } from './pages/Transkrip';
import { Sertifikat } from './pages/Sertifikat';
import { Profil } from './pages/Profil';
import { PusatBantuan } from './pages/PusatBantuan';
import { AdminDashboard } from './pages/AdminDashboard';
import { Bell, MessageCircle, BookOpen, X, ExternalLink } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    currentNav,
    setCurrentNav,
    setSelectedDay,
    dueWhatsappReminder,
    dismissDueWhatsappReminder
  } = useApp();

  const renderPage = () => {
    switch (currentNav) {
      case 'beranda':
        return <Beranda />;
      case 'kurikulum':
        return <Kurikulum />;
      case 'silabus':
        return <Silabus />;
      case 'materi':
        return <Materi />;
      case 'evaluasi':
        return <Evaluasi />;
      case 'transkrip':
        return <Transkrip />;
      case 'sertifikat':
        return <Sertifikat />;
      case 'profil':
        return <Profil />;
      case 'bantuan':
        return <PusatBantuan />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Beranda />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col academic-canvas text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      <Navbar />
      {dueWhatsappReminder && (
        <div
          className={`${
            dueWhatsappReminder.type === 'kata_hikmah_0800'
              ? 'bg-amber-950 border-amber-700/60'
              : 'bg-emerald-900 border-emerald-700/60'
          } text-white border-b shadow-sm no-print`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-amber-200">
                  {dueWhatsappReminder.type === 'kata_hikmah_0800'
                    ? dueWhatsappReminder.sentAutomatically
                      ? `Pengingat hari ini (08.00 WIB) — Kata Hikmah Hari ke-${dueWhatsappReminder.day}/90 Terkirim ke WhatsApp`
                      : `Pengingat hari ini (08.00 WIB) — Kata Hikmah Hari ke-${dueWhatsappReminder.day}/90`
                    : dueWhatsappReminder.sentAutomatically
                    ? `Materi Hari ke-${dueWhatsappReminder.day} Baru Terbuka & Terkirim Otomatis ke WhatsApp`
                    : `Materi Hari ke-${dueWhatsappReminder.day} Telah Terbuka! Waktunya Belajar`}
                </div>
                {dueWhatsappReminder.type === 'kata_hikmah_0800' && dueWhatsappReminder.wisdom ? (
                  <div className="text-amber-50 leading-relaxed">
                    <span className="italic">&quot;{dueWhatsappReminder.wisdom.quote}&quot;</span>{' '}
                    <span className="text-amber-200/90">— {dueWhatsappReminder.wisdom.source}</span>
                  </div>
                ) : (
                  <div className="text-emerald-50">
                    {dueWhatsappReminder.moduleTitle} ({dueWhatsappReminder.subjectName})
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedDay(dueWhatsappReminder.day);
                  setCurrentNav('materi');
                  dismissDueWhatsappReminder();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Buka Materi Hari ke-{dueWhatsappReminder.day}</span>
              </button>
              <a
                href={dueWhatsappReminder.waMeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Kirim ke WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={dismissDueWhatsappReminder}
                className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-100 cursor-pointer"
                aria-label="Tutup pengingat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
