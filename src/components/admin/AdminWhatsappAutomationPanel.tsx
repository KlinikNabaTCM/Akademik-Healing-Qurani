import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WhatsappAutomationLogsResponse,
  fetchWhatsappAutomationLogs,
  runWhatsappSchedulerNow,
  getDailyWisdomForDay,
  buildDailyWisdomMessage,
  buildUnlockedMaterialMessage,
  isValidWhatsappPhone
} from '../../lib/whatsappReminder';
import {
  MessageCircle,
  RefreshCw,
  Play,
  Sun,
  LockOpen,
  Server,
  Users,
  Save,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  Clock
} from 'lucide-react';

export const AdminWhatsappAutomationPanel: React.FC = () => {
  const {
    allUsers,
    resolvedModules,
    resolvedSubjects,
    systemSettings,
    updateSystemSettings,
    whatsappGatewayStatus
  } = useApp();

  const [serverData, setServerData] = useState<WhatsappAutomationLogsResponse | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [runningCycle, setRunningCycle] = useState(false);
  const [cycleNotice, setCycleNotice] = useState<string | null>(null);

  // Editor Kata Hikmah 90 Hari
  const [selectedWisdomDay, setSelectedWisdomDay] = useState<number>(1);
  const resolvedWisdom = useMemo(
    () => getDailyWisdomForDay(selectedWisdomDay, systemSettings.customDailyWisdoms),
    [selectedWisdomDay, systemSettings.customDailyWisdoms]
  );

  const [quoteInput, setQuoteInput] = useState(resolvedWisdom.quote);
  const [sourceInput, setSourceInput] = useState(resolvedWisdom.source);
  const [practiceInput, setPracticeInput] = useState(resolvedWisdom.practice);
  const [wisdomSavedNotice, setWisdomSavedNotice] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'semua' | 'unlock_materi' | 'kata_hikmah_0800'>('semua');

  useEffect(() => {
    setQuoteInput(resolvedWisdom.quote);
    setSourceInput(resolvedWisdom.source);
    setPracticeInput(resolvedWisdom.practice);
  }, [resolvedWisdom.practice, resolvedWisdom.quote, resolvedWisdom.source, selectedWisdomDay]);

  const loadAutomationLogs = useCallback(async () => {
    setLoadingLogs(true);
    const data = await fetchWhatsappAutomationLogs();
    if (data) setServerData(data);
    setLoadingLogs(false);
  }, []);

  useEffect(() => {
    void loadAutomationLogs();
  }, [loadAutomationLogs]);

  const handleRunSchedulerNow = async () => {
    setRunningCycle(true);
    setCycleNotice(null);
    const res = await runWhatsappSchedulerNow();
    setRunningCycle(false);
    await loadAutomationLogs();
    if (res?.ok) {
      setCycleNotice(
        `Pemeriksaan jadwal WIB selesai: ${res.checkedSubscribers} peserta terhubung, ${res.dispatchedCount} notifikasi baru diproses.`
      );
    } else {
      setCycleNotice('Gagal menjalankan pengecekan jadwal di server.');
    }
  };

  const handleSaveWisdomDay = (e: React.FormEvent) => {
    e.preventDefault();
    const currentMap = systemSettings.customDailyWisdoms || {};
    updateSystemSettings({
      customDailyWisdoms: {
        ...currentMap,
        [selectedWisdomDay]: {
          quote: quoteInput.trim(),
          source: sourceInput.trim(),
          practice: practiceInput.trim()
        }
      }
    });
    setWisdomSavedNotice(
      `Kata Hikmah Hari ke-${selectedWisdomDay} berhasil disimpan dan disinkronkan untuk jadwal 08.00 WIB.`
    );
    setTimeout(() => setWisdomSavedNotice(null), 3500);
  };

  const handleResetWisdomDay = () => {
    const currentMap = { ...(systemSettings.customDailyWisdoms || {}) };
    delete currentMap[selectedWisdomDay];
    updateSystemSettings({
      customDailyWisdoms: Object.keys(currentMap).length > 0 ? currentMap : undefined
    });
    setWisdomSavedNotice(`Kata Hikmah Hari ke-${selectedWisdomDay} dikembalikan ke naskah bawaan.`);
    setTimeout(() => setWisdomSavedNotice(null), 3000);
  };

  const registeredParticipants = useMemo(
    () => allUsers.filter((u) => !u.isGuest && u.role === 'peserta' && isValidWhatsappPhone(u.phone)),
    [allUsers]
  );

  const selectedModule =
    resolvedModules.find((m) => m.day === selectedWisdomDay) || resolvedModules[0];
  const selectedSubject =
    resolvedSubjects.find((s) => s.id === selectedModule?.subjectId) || resolvedSubjects[0];

  const previewUnlockText = useMemo(
    () =>
      buildUnlockedMaterialMessage({
        participantName: 'Peserta Terdaftar',
        day: selectedWisdomDay,
        moduleTitle: selectedModule?.title || `Materi Hari ke-${selectedWisdomDay}`,
        subjectName: selectedSubject?.name || 'Akademik Healing Qur’ani',
        learningGoal: selectedModule?.learningGoal || '',
        quranRef: selectedModule?.quranVerse
          ? `QS. ${selectedModule.quranVerse.surah}: ${selectedModule.quranVerse.ayah}`
          : undefined,
        includeEvaluationNote: true,
        appUrl: typeof window !== 'undefined' ? window.location.origin : ''
      }),
    [selectedModule, selectedSubject, selectedWisdomDay]
  );

  const previewWisdomText = useMemo(
    () =>
      buildDailyWisdomMessage({
        participantName: 'Peserta Terdaftar',
        day: selectedWisdomDay,
        wisdom: {
          day: selectedWisdomDay,
          quote: quoteInput,
          source: sourceInput,
          practice: practiceInput
        },
        moduleTitle: selectedModule?.title,
        appUrl: typeof window !== 'undefined' ? window.location.origin : ''
      }),
    [practiceInput, quoteInput, selectedModule?.title, selectedWisdomDay, sourceInput]
  );

  const filteredLogs = useMemo(() => {
    const list = serverData?.logs || [];
    if (logFilter === 'semua') return list;
    return list.filter((l) => l.type === logFilter);
  }, [logFilter, serverData?.logs]);

  return (
    <div className="space-y-6">
      {/* Summary Header Card */}
      <div className="bg-white rounded-xl border border-emerald-900/15 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-700" />
              <span>Otomatisasi Notifikasi WhatsApp Terjadwal (00.00 WIB &amp; 08.00 WIB)</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Server secara otomatis memantau setiap 30 detik (zona waktu WIB) untuk mengirimkan pesan ke nomor WhatsApp yang didaftarkan masing-masing peserta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void handleRunSchedulerNow()}
              disabled={runningCycle}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{runningCycle ? 'Memeriksa...' : 'Jalankan Cek Jadwal Sekarang'}</span>
            </button>
            <button
              type="button"
              onClick={() => void loadAutomationLogs()}
              disabled={loadingLogs}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>Muat Ulang</span>
            </button>
          </div>
        </div>

        {cycleNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{cycleNotice}</span>
          </div>
        )}

        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F6FBF8] border border-emerald-900/15 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-emerald-700" />
              <span>Status Gateway Server</span>
            </div>
            <div className="font-bold text-slate-900">
              {whatsappGatewayStatus.configured
                ? `Terhubung (${whatsappGatewayStatus.provider})`
                : 'Belum Diatur di Env Server'}
            </div>
            <p className="text-[10px] text-slate-500">
              {whatsappGatewayStatus.configured
                ? 'Pesan terkirim otomatis tanpa interaksi admin.'
                : 'Atur WHATSAPP_GATEWAY_URL & TOKEN di environment server untuk pengiriman otomatis background.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F6FBF8] border border-emerald-900/15 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <LockOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Jadwal Materi Terbuka</span>
            </div>
            <div className="font-bold font-mono text-emerald-900 text-sm">
              {systemSettings.unlockTimeWIB || '00:00'} WIB
            </div>
            <p className="text-[10px] text-slate-500">
              Terkirim otomatis berbarengan saat modul hari terkunci terbuka.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300/60 space-y-1">
            <div className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-700" />
              <span>Kata Hikmah &quot;Pengingat hari ini&quot;</span>
            </div>
            <div className="font-bold font-mono text-amber-950 text-sm">
              08:00 WIB (Hari 1–90)
            </div>
            <p className="text-[10px] text-amber-900">
              Dikirim setiap pagi selama 90 hari masa belajar peserta.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>Peserta WhatsApp Aktif</span>
            </div>
            <div className="font-bold font-mono text-slate-900 text-sm">
              {registeredParticipants.length} Peserta
            </div>
            <p className="text-[10px] text-slate-500">
              Cek terakhir server: {serverData?.lastCheckAtWIB || 'Baru aktif'}
            </p>
          </div>
        </div>
      </div>

      {/* Editor Kata Hikmah 90 Hari */}
      <div className="bg-white rounded-xl border border-emerald-900/15 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Kelola Konten Kata Hikmah &quot;Pengingat hari ini&quot; (90 Hari · 08.00 WIB)</span>
            </h4>
            <p className="text-xs text-slate-500">
              Setiap hari (Hari ke-1 sampai Hari ke-90) memiliki Kata Hikmah dan amalan praktis yang dapat disesuaikan Pengelola.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="font-bold text-slate-700">Pilih Hari:</label>
            <select
              value={selectedWisdomDay}
              onChange={(e) => setSelectedWisdomDay(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-emerald-900"
            >
              {Array.from({ length: 90 }, (_, idx) => idx + 1).map((d) => (
                <option key={d} value={d}>
                  Hari ke-{d}
                  {systemSettings.customDailyWisdoms?.[d] ? ' (Diedit)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {wisdomSavedNotice && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
            {wisdomSavedNotice}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
          <form onSubmit={handleSaveWisdomDay} className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Kutipan Kata Hikmah Hari ke-{selectedWisdomDay}:
              </label>
              <textarea
                rows={3}
                value={quoteInput}
                onChange={(e) => setQuoteInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Sumber / Ulama / Rujukan Hadis:
              </label>
              <input
                type="text"
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ajakan Amalan Praktis Hari Ini:
              </label>
              <textarea
                rows={2}
                value={practiceInput}
                onChange={(e) => setPracticeInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {systemSettings.customDailyWisdoms?.[selectedWisdomDay] ? (
                <button
                  type="button"
                  onClick={handleResetWisdomDay}
                  className="px-3 py-1.5 text-amber-800 hover:bg-amber-50 border border-amber-200 rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Hari ke-{selectedWisdomDay}</span>
                </button>
              ) : (
                <span />
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Kata Hikmah Hari ke-{selectedWisdomDay}</span>
              </button>
            </div>
          </form>

          {/* Side-by-side preview of both auto messages for selected day */}
          <div className="space-y-3">
            <div>
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>Pratinjau WA 08.00 WIB — &quot;Pengingat hari ini&quot;:</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-[11px] bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-slate-800 max-h-40 overflow-y-auto">
                {previewWisdomText}
              </pre>
            </div>
            <div>
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pratinjau WA 00.00 WIB — Materi Terkunci Terbuka:</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-[11px] bg-[#F6FBF8] border border-emerald-200 rounded-lg p-3 text-slate-800 max-h-40 overflow-y-auto">
                {previewUnlockText}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Log Pengiriman Otomatis */}
      <div className="bg-white rounded-xl border border-emerald-900/15 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Riwayat &amp; Antrean Pengiriman Otomatis WhatsApp ({filteredLogs.length})
            </h4>
            <p className="text-xs text-slate-500">
              Catatan otomatis setiap kali materi baru terbuka (00.00 WIB) dan Kata Hikmah harian (08.00 WIB) dipicu.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {(
              [
                { id: 'semua', label: 'Semua' },
                { id: 'unlock_materi', label: 'Materi Terbuka (00.00 WIB)' },
                { id: 'kata_hikmah_0800', label: 'Kata Hikmah (08.00 WIB)' }
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLogFilter(opt.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                  logFilter === opt.id
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            Belum ada log pengiriman otomatis untuk kategori ini. Klik &quot;Jalankan Cek Jadwal Sekarang&quot; atau tunggu jadwal WIB tiba.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Waktu WIB</th>
                  <th className="py-2.5 px-3">Peserta &amp; Nomor WA</th>
                  <th className="py-2.5 px-3">Jenis Notifikasi</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.slice(0, 40).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {log.timestampWIB}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{log.participantName}</div>
                      <div className="font-mono text-[11px] text-emerald-800">
                        +{log.normalizedPhone}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                          log.type === 'kata_hikmah_0800'
                            ? 'bg-amber-100 text-amber-900'
                            : log.type === 'unlock_materi'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.type === 'kata_hikmah_0800'
                          ? `Kata Hikmah 08.00 · Hari ${log.day}`
                          : log.type === 'unlock_materi'
                          ? `Materi Terbuka · Hari ${log.day}`
                          : `Manual · Hari ${log.day}`}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {log.detail}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'terkirim_gateway'
                            ? 'bg-emerald-100 text-emerald-900'
                            : log.status === 'antrean_wa_fallback'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status === 'terkirim_gateway'
                          ? 'Terkirim Otomatis'
                          : log.status === 'antrean_wa_fallback'
                          ? 'Siap Kirim WA'
                          : 'Gagal Gateway'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <a
                        href={log.waMeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold text-[11px]"
                      >
                        <span>Buka WA</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
