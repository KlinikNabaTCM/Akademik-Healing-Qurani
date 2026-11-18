import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { verifyCertificateInSupabase } from '../lib/supabaseSync';
import { verifyCertificateViaServer } from '../lib/portalApi';
import { isSupabaseConfigured } from '../lib/supabase';
import { CertificateRecord } from '../types';
import {
  Award,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Search,
  ChevronRight,
  Circle,
  Lock
} from 'lucide-react';

export const Sertifikat: React.FC = () => {
  const {
    currentUser,
    currentProgress,
    calculateStudentGrades,
    certificates,
    issueCertificate,
    systemSettings,
    resolvedModules
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sertifikat' | 'verifikasi'>('sertifikat');
  const [verifyInput, setVerifyInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<CertificateRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const grades = calculateStudentGrades();
  const currentCert = certificates[currentUser.id];
  const hasPublishedCert = !!currentCert && currentCert.status === 'Sertifikat Diterbitkan';

  const handlePrint = () => {
    window.print();
  };

  const handleClaimOrIssue = () => {
    if (currentUser.isGuest) return;
    issueCertificate(currentUser.id);
  };

  const handleVerifyLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setVerifying(true);
    const code = verifyInput.trim().toUpperCase();

    const localMatch = Object.values(certificates).find(
      (c) =>
        c.certificateNumber.toUpperCase() === code ||
        c.verifiedCode.toUpperCase() === code ||
        c.studentNumber.toUpperCase() === code
    );

    if (localMatch) {
      setVerificationResult(localMatch);
      setVerifying(false);
      return;
    }

    const serverMatch = await verifyCertificateViaServer(verifyInput);
    if (serverMatch) {
      setVerificationResult(serverMatch);
      setVerifying(false);
      return;
    }

    if (isSupabaseConfigured()) {
      const cloudMatch = await verifyCertificateInSupabase(verifyInput);
      setVerificationResult(cloudMatch);
      setVerifying(false);
      return;
    }

    setVerificationResult(null);
    setVerifying(false);
  };

  const monthlyDoneCount = Object.keys(currentProgress.monthlyResults || {}).length;
  const hasFinalExam = !!currentProgress.finalResult;
  const minCompletionOk = grades.completionPercentage >= systemSettings.minCompletionRate;
  const passingOk = grades.finalGrade !== null && grades.finalGrade >= systemSettings.passingGrade;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Tab Controls (Hidden on print) */}
      <div className="bg-white rounded-xl border border-emerald-900/15 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              Sertifikat Digital & Verifikasi Keaslian
            </h1>
            <p className="text-xs text-slate-500">
              Diterbitkan secara resmi setelah menuntaskan kurikulum 90 hari dan memenuhi standar kelulusan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100 rounded-lg text-xs font-semibold flex items-center">
            <button
              onClick={() => setActiveTab('sertifikat')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'sertifikat'
                  ? 'bg-white text-emerald-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sertifikat Saya
            </button>
            <button
              onClick={() => setActiveTab('verifikasi')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'verifikasi'
                  ? 'bg-white text-emerald-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cek Keaslian (Kode)
            </button>
          </div>

          {hasPublishedCert && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'sertifikat' && (
        <div className="space-y-6">
          {/* Status & Eligibility Banner */}
          <div className="no-print">
            {!hasPublishedCert ? (
              <div className="bg-white rounded-2xl p-6 border border-emerald-900/15 shadow-xs space-y-5 max-w-3xl mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Status Sertifikat: {grades.certificateStatus}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Dokumen Sertifikat Resmi akan terbuka dan siap dicetak setelah Anda terdaftar sebagai peserta serta memenuhi seluruh syarat kelulusan akademik di bawah ini.
                    </p>
                  </div>
                </div>

                {/* Real Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                      !currentUser.isGuest
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {!currentUser.isGuest ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">1. Akun Peserta Terdaftar</div>
                      <div className="text-[11px] opacity-80">
                        {!currentUser.isGuest
                          ? `Terdaftar a.n. ${currentUser.name}`
                          : 'Masuk atau daftar akun peserta terlebih dahulu.'}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                      minCompletionOk
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {minCompletionOk ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">
                        2. Penyelesaian Modul (≥ {systemSettings.minCompletionRate}%)
                      </div>
                      <div className="text-[11px] opacity-80">
                        Saat ini: {currentProgress.completedDays.length}/{resolvedModules.length} Hari ({grades.completionPercentage}%)
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                      monthlyDoneCount >= 3 && hasFinalExam
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {monthlyDoneCount >= 3 && hasFinalExam ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">3. Evaluasi Bulanan & Akhir</div>
                      <div className="text-[11px] opacity-80">
                        Bulanan: {monthlyDoneCount}/3 · Akhir: {hasFinalExam ? 'Selesai' : 'Belum'}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                      passingOk
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {passingOk ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">
                        4. Nilai Akhir ≥ {systemSettings.passingGrade}
                      </div>
                      <div className="text-[11px] opacity-80">
                        {grades.finalGrade !== null
                          ? `Nilai Kumulatif: ${grades.finalGrade} (${grades.predicate})`
                          : 'Menunggu penyelesaian seluruh komponen nilai.'}
                      </div>
                    </div>
                  </div>
                </div>

                {currentCert?.revocationReason && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>Sertifikat Sebelumnya Sedang Dicabut / Ditangguhkan</span>
                    </div>
                    <p>Alasan: {currentCert.revocationReason}</p>
                  </div>
                )}

                {!currentUser.isGuest &&
                  grades.certificateStatus === 'Memenuhi Syarat, Menunggu Pengesahan' && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-emerald-900 font-semibold">
                        Alhamdulillah! Seluruh persyaratan kelulusan telah terpenuhi.
                      </span>
                      <button
                        onClick={handleClaimOrIssue}
                        className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
                      >
                        Terbitkan Sertifikat Saya Sekarang
                      </button>
                    </div>
                  )}
              </div>
            ) : (
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-emerald-950">
                    Sertifikat Resmi Telah Diterbitkan · Nomor: {currentCert.certificateNumber}
                  </span>
                </div>
                <span className="text-emerald-800 font-mono text-[11px]">
                  Kode Verifikasi: {currentCert.verifiedCode}
                </span>
              </div>
            )}
          </div>

          {/* Render Official Certificate Document ONLY if legitimately issued */}
          {hasPublishedCert && currentCert && (
            <div className="print-container max-w-4xl mx-auto">
              <div className="relative bg-[#FFFDF8] rounded-3xl p-8 sm:p-14 border-[10px] border-[#D4AF37]/50 shadow-xl overflow-hidden print-break-inside-avoid">
                <div className="absolute inset-4 sm:inset-6 border-2 border-[#B8860B]/40 rounded-2xl pointer-events-none" />
                <div className="absolute inset-5 sm:inset-7 border border-[#B8860B]/20 rounded-xl pointer-events-none" />

                <div className="absolute top-7 left-7 text-[#B8860B]/60 font-arabic text-xl select-none">
                  ۞
                </div>
                <div className="absolute top-7 right-7 text-[#B8860B]/60 font-arabic text-xl select-none">
                  ۞
                </div>
                <div className="absolute bottom-7 left-7 text-[#B8860B]/60 font-arabic text-xl select-none">
                  ۞
                </div>
                <div className="absolute bottom-7 right-7 text-[#B8860B]/60 font-arabic text-xl select-none">
                  ۞
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                  <div className="w-96 h-96 rounded-full bg-emerald-950 font-arabic text-9xl flex items-center justify-center">
                    ح
                  </div>
                </div>

                <div className="relative z-10 text-center space-y-6">
                  <div className="font-arabic text-2xl sm:text-3xl text-emerald-950 font-bold">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>

                  <div className="space-y-1">
                    {systemSettings.logoUrl ? (
                      <div className="w-16 h-16 rounded-full bg-white overflow-hidden flex items-center justify-center mx-auto shadow-xs border-2 border-amber-400 p-1">
                        <img
                          src={systemSettings.logoUrl}
                          alt="Logo Resmi Akademik"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-emerald-800 text-amber-300 font-arabic text-2xl font-bold flex items-center justify-center mx-auto shadow-xs border-2 border-amber-400">
                        ح
                      </div>
                    )}
                    <div className="text-xs font-bold tracking-widest text-[#B8860B] uppercase font-sans">
                      AKADEMIK HEALING QUR’ANI
                    </div>
                    <div className="text-[11px] text-slate-500 italic">
                      {systemSettings.institutionName}
                    </div>
                  </div>

                  <div className="pt-2">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide text-slate-900 font-serif uppercase">
                      SERTIFIKAT PENYELESAIAN PEMBELAJARAN
                    </h2>
                    <div className="text-xs font-mono text-slate-500 tracking-wider mt-1">
                      Nomor Registrasi: {currentCert.certificateNumber}
                    </div>
                  </div>

                  <div className="max-w-xl mx-auto space-y-2 pt-2">
                    <div className="text-xs sm:text-sm text-slate-600">
                      Sertifikat ini dengan penuh hormat dan kesyukuran dianugerahkan kepada:
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-950 font-serif border-b-2 border-emerald-900/30 pb-2 inline-block px-8">
                      {currentCert.participantName}
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      Nomor Peserta: {currentCert.studentNumber}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed">
                    Telah dinyatakan menyelesaikan dengan baik seluruh rangkaian kurikulum, modul materi harian, dan evaluasi terstruktur dalam program:
                  </p>

                  <div className="py-2">
                    <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight uppercase">
                      {currentCert.programName}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Mencakup 7 Mata Pelajaran: Al-Qur'an, Hadis, Fikih, Sirah, Tafsir, Muamalah, dan Tazkiyatun Nafs
                    </div>
                  </div>

                  <div className="max-w-md mx-auto bg-amber-50/60 rounded-xl p-3 border border-amber-200/80 flex items-center justify-around text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Nilai Akhir:</span>
                      <span className="text-lg font-bold font-mono text-emerald-900">
                        {currentCert.finalGrade} / 100
                      </span>
                    </div>
                    <div className="h-8 w-px bg-amber-200" />
                    <div>
                      <span className="text-slate-500 block text-[11px]">Predikat Kelulusan:</span>
                      <span className="text-xs font-bold text-amber-950">{currentCert.predicate}</span>
                    </div>
                  </div>

                  <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end text-xs text-slate-700">
                    <div className="text-left space-y-1">
                      <div className="w-20 h-20 bg-white p-1.5 rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center">
                        <QrCode className="w-full h-full text-emerald-950" />
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono">
                        {currentCert.verifiedCode}
                      </div>
                      <div className="text-[9px] text-slate-600">
                        Kode verifikasi keaslian resmi
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-2 border-amber-500 text-amber-600 flex items-center justify-center font-arabic text-xl font-bold opacity-85 rotate-12">
                        مقبول
                      </div>
                      <span className="text-[10px] text-slate-600 mt-1">Stempel Digital Resmi</span>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-[11px] text-slate-500">
                        Diterbitkan pada: {currentCert.issuedAt || currentCert.completionDate}
                      </div>
                      <div className="font-semibold text-slate-800 pt-1">
                        {systemSettings.signatoryTitle}
                      </div>
                      <div className="h-12 flex items-end justify-end">
                        <div className="font-certificate text-emerald-900 text-sm italic font-bold">
                          {systemSettings.signatoryName}
                        </div>
                      </div>
                      <div className="font-bold text-slate-900">{systemSettings.signatoryName}</div>
                      <div className="text-[10px] text-slate-500">
                        {systemSettings.signatoryTitle}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB B: VERIFIKASI KEASLIAN SERTIFIKAT */}
      {activeTab === 'verifikasi' && (
        <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Verifikasi Keaslian Dokumen Sertifikat
            </h2>
            <p className="text-xs text-slate-600">
              Masukkan Nomor Registrasi Sertifikat, Nomor Peserta, atau Kode Verifikasi untuk memeriksa validitas dokumen lulusan Akademik Healing Qur’ani.
            </p>
          </div>

          <form onSubmit={handleVerifyLookup} className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Masukkan Nomor Sertifikat atau Kode Verifikasi..."
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>
            <button
              type="submit"
              disabled={verifying}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {verifying ? 'Memeriksa Database...' : 'Cek Validitas Sertifikat'}
            </button>
          </form>

          {hasSearched && !verifying && (
            <div className="pt-4 border-t border-slate-200">
              {verificationResult ? (
                verificationResult.status !== 'Sertifikat Diterbitkan' ||
                verificationResult.revocationReason ? (
                  <div className="p-5 rounded-xl bg-red-50 border-2 border-red-300 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <span>PERINGATAN: STATUS SERTIFIKAT TELAH DICABUT / TIDAK BERLAKU</span>
                    </div>

                    <p className="text-red-800 leading-relaxed font-medium">
                      Dokumen nomor{' '}
                      <strong className="font-mono">{verificationResult.certificateNumber}</strong>{' '}
                      atas nama <strong>{verificationResult.participantName}</strong> telah dicabut
                      keabsahannya oleh Akademik Healing Qur’ani dan dinyatakan tidak berlaku.
                    </p>

                    <div className="p-3 bg-white rounded-lg border border-red-200 space-y-1.5 text-slate-700">
                      <div>
                        <span className="text-[11px] font-semibold text-red-800 uppercase block">
                          Alasan Pencabutan Resmi:
                        </span>
                        <p className="italic text-slate-900 font-semibold">
                          "{verificationResult.revocationReason || 'Penyesuaian administratif akademik'}"
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>
                          Tanggal Pencabutan: {verificationResult.revokedAt || 'Tercatat dalam log'}
                        </span>
                        <span>Otoritas: {verificationResult.revokedBy || 'Mudir Akademik'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>DOKUMEN VALID & TERVERIFIKASI RESMI</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                        Keabsahan Aktif
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Nama Penerima:</span>
                        <strong className="text-slate-900 font-semibold">
                          {verificationResult.participantName}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Nomor Dokumen:</span>
                        <span className="font-mono text-emerald-800 font-bold">
                          {verificationResult.certificateNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Program:</span>
                        <span>{verificationResult.programName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Predikat Capaian:</span>
                        <span className="font-semibold text-emerald-900">
                          {verificationResult.predicate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Nilai Akhir:</span>
                        <span className="font-bold text-emerald-900 font-mono">
                          {verificationResult.finalGrade} / 100
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Tanggal Terbit:</span>
                        <span>{verificationResult.issuedAt}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-800 font-mono">
                        Kode Verifikasi: {verificationResult.verifiedCode}
                      </span>
                      {verificationResult.participantId === currentUser.id && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('sertifikat')}
                          className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>Lihat Dokumen</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="p-5 rounded-xl bg-red-50 border border-red-200 text-center space-y-1 text-xs">
                  <span className="font-bold text-red-900 text-sm block">
                    Sertifikat Tidak Ditemukan
                  </span>
                  <p className="text-red-700">
                    Nomor dokumen yang Anda masukkan belum terdaftar dalam sistem atau belum diterbitkan oleh pengelola akademik.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
