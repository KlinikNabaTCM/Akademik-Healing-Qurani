import React, { useState, useMemo, useEffect } from 'react';
import { useApp, DEFAULT_WHATSAPP_REMINDER, getWibDateString } from '../context/AppContext';
import {
  buildMaterialReminderMessage,
  buildDailyWisdomMessage,
  getDailyWisdomForDay,
  buildWhatsappWaMeLink,
  formatWhatsappDisplay,
  isValidWhatsappPhone
} from '../lib/whatsappReminder';
import {
  MessageCircle,
  Bell,
  Clock,
  CheckCircle2,
  Send,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Server,
  LockOpen,
  Sun
} from 'lucide-react';

interface WhatsappReminderCardProps {
  day?: number;
  variant?: 'compact' | 'full';
}

export const WhatsappReminderCard: React.FC<WhatsappReminderCardProps> = ({
  day,
  variant = 'compact'
}) => {
  const {
    currentUser,
    currentProgress,
    resolvedModules,
    resolvedSubjects,
    systemSettings,
    updateCurrentUserProfile,
    updateWhatsappReminderSettings,
    whatsappGatewayStatus,
    triggerWhatsappReminderNow,
    triggerDailyWisdomNow,
    getMaxUnlockedDay,
    isDayUnlocked
  } = useApp();

  const reminder = {
    ...DEFAULT_WHATSAPP_REMINDER,
    ...(currentUser.whatsappReminder || {})
  };

  const [phoneInput, setPhoneInput] = useState(currentUser.phone || '');
  const [phoneSavedMsg, setPhoneSavedMsg] = useState<string | null>(null);
  const [sendingUnlock, setSendingUnlock] = useState(false);
  const [sendingWisdom, setSendingWisdom] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<{
    type: 'ok' | 'err' | 'info';
    text: string;
  } | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [showPreview, setShowPreview] = useState(variant === 'full');
  const [previewTab, setPreviewTab] = useState<'unlock' | 'hikmah'>('unlock');

  useEffect(() => {
    setPhoneInput(currentUser.phone || '');
  }, [currentUser.phone]);

  const maxUnlocked = getMaxUnlockedDay();
  const targetDay = useMemo(() => {
    if (day !== undefined) return day;
    for (let d = 1; d <= maxUnlocked; d++) {
      if (!currentProgress.completedDays.includes(d)) {
        return d;
      }
    }
    return maxUnlocked;
  }, [day, maxUnlocked, currentProgress.completedDays]);

  const activeModule =
    resolvedModules.find((m) => m.day === targetDay) || resolvedModules[0];
  const activeSubject =
    resolvedSubjects.find((s) => s.id === activeModule.subjectId) || resolvedSubjects[0];
  const isTargetUnlocked = isDayUnlocked(targetDay);

  const effectivePhone = phoneInput.trim() || currentUser.phone || '';
  const hasValidPhone = isValidWhatsappPhone(effectivePhone);

  const unlockReminderMessage = useMemo(() => {
    const quranRef = activeModule.quranVerse
      ? `QS. ${activeModule.quranVerse.surah}: ${activeModule.quranVerse.ayah}`
      : undefined;

    return buildMaterialReminderMessage({
      participantName: currentUser.isGuest ? 'Sahabat Penuntut Ilmu' : currentUser.name,
      day: activeModule.day,
      moduleTitle: activeModule.title,
      subjectName: activeSubject.name,
      learningGoal: activeModule.learningGoal,
      quranRef,
      includeEvaluationNote: reminder.remindEvaluationDue,
      isLockedFutureDay: !isTargetUnlocked
    });
  }, [
    activeModule.day,
    activeModule.learningGoal,
    activeModule.quranVerse,
    activeModule.title,
    activeSubject.name,
    currentUser.isGuest,
    currentUser.name,
    isTargetUnlocked,
    reminder.remindEvaluationDue
  ]);

  const todayWisdom = useMemo(
    () => getDailyWisdomForDay(targetDay, systemSettings.customDailyWisdoms),
    [systemSettings.customDailyWisdoms, targetDay]
  );

  const wisdomMessage = useMemo(
    () =>
      buildDailyWisdomMessage({
        participantName: currentUser.isGuest ? 'Sahabat Penuntut Ilmu' : currentUser.name,
        day: activeModule.day,
        wisdom: todayWisdom,
        moduleTitle: activeModule.title,
        appUrl: typeof window !== 'undefined' ? window.location.origin : ''
      }),
    [activeModule.day, activeModule.title, currentUser.isGuest, currentUser.name, todayWisdom]
  );

  const activePreviewMessage =
    previewTab === 'unlock' ? unlockReminderMessage : wisdomMessage;

  const waMeUnlockHref = useMemo(
    () => buildWhatsappWaMeLink(effectivePhone, unlockReminderMessage),
    [effectivePhone, unlockReminderMessage]
  );

  const waMeWisdomHref = useMemo(
    () => buildWhatsappWaMeLink(effectivePhone, wisdomMessage),
    [effectivePhone, wisdomMessage]
  );

  const handleToggleEnabled = () => {
    const nextEnabled = !reminder.enabled;
    if (phoneInput.trim() && phoneInput.trim() !== currentUser.phone) {
      updateCurrentUserProfile({ phone: phoneInput.trim() });
    }
    updateWhatsappReminderSettings({
      enabled: nextEnabled,
      autoSendOnUnlock: nextEnabled ? reminder.autoSendOnUnlock !== false : false,
      wisdomReminderEnabled: nextEnabled ? reminder.wisdomReminderEnabled !== false : false
    });
    if (nextEnabled && !hasValidPhone) {
      setSendFeedback({
        type: 'info',
        text: 'Masukkan nomor WhatsApp aktif Anda (contoh: 0812xxxx) lalu klik Simpan.'
      });
    } else {
      setSendFeedback(null);
    }
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phoneInput.trim();
    if (!isValidWhatsappPhone(trimmed)) {
      setPhoneSavedMsg('Format nomor tidak valid. Gunakan minimal 10 digit (contoh: +62812xxxx).');
      return;
    }
    updateCurrentUserProfile({ phone: trimmed });
    setPhoneSavedMsg(
      `Nomor WhatsApp tersimpan (${formatWhatsappDisplay(trimmed)}) dan disinkronkan ke jadwal otomatis.`
    );
    setTimeout(() => setPhoneSavedMsg(null), 3500);
  };

  const handleToggleBrowserNotif = async () => {
    if (reminder.browserNotificationEnabled) {
      updateWhatsappReminderSettings({ browserNotificationEnabled: false });
      return;
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          updateWhatsappReminderSettings({ browserNotificationEnabled: true });
          setSendFeedback({
            type: 'ok',
            text: 'Notifikasi peramban aktif! Anda juga akan menerima pengingat materi terbuka & Kata Hikmah 08.00 WIB.'
          });
        } else {
          setSendFeedback({
            type: 'err',
            text: 'Izin notifikasi peramban ditolak. Pengiriman otomatis ke WhatsApp tetap berjalan di server.'
          });
        }
      } catch {
        setSendFeedback({
          type: 'err',
          text: 'Peramban tidak mendukung izin notifikasi di jendela ini.'
        });
      }
    }
  };

  const handleSendUnlockViaGateway = async () => {
    setSendFeedback(null);
    const trimmed = phoneInput.trim();
    if (!isValidWhatsappPhone(trimmed)) {
      setSendFeedback({
        type: 'err',
        text: 'Masukkan nomor WhatsApp aktif Anda terlebih dahulu (contoh: +6281234567890).'
      });
      return;
    }
    if (trimmed !== currentUser.phone) {
      updateCurrentUserProfile({ phone: trimmed });
    }

    setSendingUnlock(true);
    const res = await triggerWhatsappReminderNow(targetDay);
    setSendingUnlock(false);

    if (res.success && res.sentVia === 'gateway') {
      setSendFeedback({
        type: 'ok',
        text: `Pengingat Materi Hari ke-${targetDay} berhasil dikirim ke WhatsApp ${formatWhatsappDisplay(trimmed)}.`
      });
    } else if (res.sentVia === 'wa_me_fallback') {
      setSendFeedback({
        type: 'info',
        text: 'Server gateway WhatsApp belum aktif di host; gunakan tombol "Kirim Materi via WhatsApp" atau simpan nomor Anda untuk sinkronisasi otomatis saat gateway aktif.'
      });
    } else {
      setSendFeedback({
        type: 'err',
        text: res.error || 'Gagal mengirim pesan melalui gateway.'
      });
    }
  };

  const handleSendWisdomViaGateway = async () => {
    setSendFeedback(null);
    const trimmed = phoneInput.trim();
    if (!isValidWhatsappPhone(trimmed)) {
      setSendFeedback({
        type: 'err',
        text: 'Masukkan nomor WhatsApp aktif Anda terlebih dahulu (contoh: +6281234567890).'
      });
      return;
    }
    if (trimmed !== currentUser.phone) {
      updateCurrentUserProfile({ phone: trimmed });
    }

    setSendingWisdom(true);
    const res = await triggerDailyWisdomNow(targetDay);
    setSendingWisdom(false);

    if (res.success && res.sentVia === 'gateway') {
      setSendFeedback({
        type: 'ok',
        text: `Kata Hikmah "Pengingat hari ini" Hari ke-${targetDay} berhasil dikirim ke WhatsApp ${formatWhatsappDisplay(trimmed)}.`
      });
    } else if (res.sentVia === 'wa_me_fallback') {
      setSendFeedback({
        type: 'info',
        text: 'Server gateway otomatis belum aktif di host; klik tombol "Kirim Kata Hikmah via WA" untuk pratinjau langsung ke chat WhatsApp Anda.'
      });
    } else {
      setSendFeedback({
        type: 'err',
        text: res.error || 'Gagal mengirim Kata Hikmah via gateway.'
      });
    }
  };

  const handleMarkWaClicked = (kind: 'unlock' | 'hikmah') => {
    if (phoneInput.trim() && phoneInput.trim() !== currentUser.phone && hasValidPhone) {
      updateCurrentUserProfile({ phone: phoneInput.trim() });
    }
    const today = getWibDateString(0);
    if (kind === 'unlock') {
      updateWhatsappReminderSettings({
        lastSentDateWIB: today,
        lastSentDay: targetDay,
        lastUnlockSentDateWIB: today,
        lastUnlockSentDay: targetDay,
        lastStatus: 'dibuka_wa',
        lastAttemptAt: new Date().toISOString()
      });
    } else {
      updateWhatsappReminderSettings({
        lastWisdomSentDateWIB: today,
        lastWisdomSentDay: targetDay,
        lastStatus: 'dibuka_wa',
        lastAttemptAt: new Date().toISOString()
      });
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(activePreviewMessage);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
    } catch {
      // Ignore clipboard restriction
    }
  };

  const unlockTimeLabel = systemSettings.unlockTimeWIB || '00:00';

  return (
    <div className="bg-white rounded-2xl border border-emerald-900/15 border-l-4 border-l-emerald-700 p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Otomatisasi WhatsApp: Materi Terbuka &amp; Kata Hikmah 90 Hari
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  reminder.enabled
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {reminder.enabled ? 'Terhubung Otomatis' : 'Nonaktif'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Menggunakan nomor WhatsApp yang tersimpan di akun peserta ({hasValidPhone ? formatWhatsappDisplay(effectivePhone) : 'belum diatur'}).
            </p>
          </div>
        </div>

        {/* Master Switch Toggle */}
        <button
          type="button"
          onClick={handleToggleEnabled}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
            reminder.enabled
              ? 'bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-900 shadow-2xs'
              : 'bg-[#F3F8F5] hover:bg-emerald-100 text-emerald-950 border-emerald-800/25'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{reminder.enabled ? 'Otomatisasi Aktif' : 'Aktifkan Notifikasi WA'}</span>
        </button>
      </div>

      {/* Dual Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-[#F6FBF8] border border-emerald-900/15 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <LockOpen className="w-4 h-4 text-emerald-700" />
              <span>1. Saat Materi Terkunci Terbuka</span>
            </span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-900">
              <input
                type="checkbox"
                checked={reminder.enabled && reminder.autoSendOnUnlock !== false}
                onChange={(e) =>
                  updateWhatsappReminderSettings({
                    enabled: true,
                    autoSendOnUnlock: e.target.checked
                  })
                }
                className="rounded text-emerald-700 focus:ring-emerald-700"
              />
              <span>Aktif</span>
            </label>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Pengingat materi otomatis dikirim berbarengan terbukanya modul terkunci (pukul{' '}
            <strong className="font-mono text-emerald-900">{unlockTimeLabel} WIB</strong>) ke WhatsApp terdaftar.
          </p>
          {reminder.lastUnlockSentDateWIB && (
            <div className="text-[10px] font-mono text-emerald-800">
              Terakhir terbuka &amp; terkirim: Hari ke-{reminder.lastUnlockSentDay || targetDay} ({reminder.lastUnlockSentDateWIB})
            </div>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300/60 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-amber-950 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-700" />
              <span>2. Kata Hikmah &quot;Pengingat hari ini&quot;</span>
            </span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-amber-950">
              <input
                type="checkbox"
                checked={reminder.enabled && reminder.wisdomReminderEnabled !== false}
                onChange={(e) =>
                  updateWhatsappReminderSettings({
                    enabled: true,
                    wisdomReminderEnabled: e.target.checked,
                    wisdomTimeWIB: '08:00'
                  })
                }
                className="rounded text-amber-700 focus:ring-amber-700"
              />
              <span>Aktif</span>
            </label>
          </div>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            Terkirim otomatis setiap pukul <strong className="font-mono">08.00 WIB</strong> selama{' '}
            <strong>90 hari pembelajaran</strong> berisi mutiara hikmah &amp; amalan harian.
          </p>
          {reminder.lastWisdomSentDateWIB && (
            <div className="text-[10px] font-mono text-amber-900">
              Terakhir terkirim: Hari ke-{reminder.lastWisdomSentDay || targetDay} ({reminder.lastWisdomSentDateWIB})
            </div>
          )}
        </div>
      </div>

      {/* Feedback Box */}
      {sendFeedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
            sendFeedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : sendFeedback.type === 'err'
              ? 'bg-red-50 border-red-300 text-red-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          {sendFeedback.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          )}
          <span>{sendFeedback.text}</span>
        </div>
      )}

      {/* Registered Phone + Server Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <form onSubmit={handleSavePhone} className="space-y-1.5">
          <label className="font-bold text-slate-800 block">
            Nomor WhatsApp Terdaftar (Sinkron Profil Peserta):
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+62 812-3456-7890"
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer shrink-0"
            >
              Simpan
            </button>
          </div>
          {phoneSavedMsg ? (
            <span className="text-[11px] font-semibold text-emerald-800 block">
              {phoneSavedMsg}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 block">
              Nomor tujuan:{' '}
              <strong className={hasValidPhone ? 'text-emerald-800' : 'text-amber-800'}>
                {hasValidPhone ? formatWhatsappDisplay(effectivePhone) : 'Belum diisi / belum valid'}
              </strong>
            </span>
          )}
        </form>

        <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-700" />
              <span>Status Mesin Otomatis WIB:</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                whatsappGatewayStatus.configured
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {whatsappGatewayStatus.configured
                ? `Gateway Aktif (${whatsappGatewayStatus.provider})`
                : 'Mode Siap + Direct WA'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-700 pt-0.5">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={reminder.remindEvaluationDue}
                onChange={(e) =>
                  updateWhatsappReminderSettings({ remindEvaluationDue: e.target.checked })
                }
                className="rounded text-emerald-700 focus:ring-emerald-700"
              />
              <span>Sertakan pengingat kuis &amp; refleksi</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(reminder.browserNotificationEnabled)}
                onChange={() => void handleToggleBrowserNotif()}
                className="rounded text-emerald-700 focus:ring-emerald-700"
              />
              <span>Alarm peramban</span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview Box with Tab Switcher (Materi 00.00 vs Kata Hikmah 08.00) */}
      <div className="bg-[#F6FBF8] rounded-xl border border-emerald-900/15 p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setPreviewTab('unlock');
                setShowPreview(true);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                previewTab === 'unlock'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Pesan Materi Terbuka ({unlockTimeLabel} WIB)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewTab('hikmah');
                setShowPreview(true);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                previewTab === 'hikmah'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Kata Hikmah &quot;Pengingat hari ini&quot; (08.00 WIB)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
          >
            {showPreview ? 'Sembunyikan' : 'Lihat Pratinjau'}
          </button>
        </div>

        {showPreview && (
          <pre className="whitespace-pre-wrap font-sans text-[11px] sm:text-xs text-slate-800 bg-white p-3 rounded-lg border border-emerald-900/10 leading-relaxed max-h-52 overflow-y-auto">
            {activePreviewMessage}
          </pre>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {whatsappGatewayStatus.configured && (
            <>
              <button
                type="button"
                onClick={() => void handleSendUnlockViaGateway()}
                disabled={sendingUnlock}
                className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {sendingUnlock ? 'Mengirim...' : 'Uji Kirim Pengingat Materi'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => void handleSendWisdomViaGateway()}
                disabled={sendingWisdom}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {sendingWisdom ? 'Mengirim...' : 'Uji Kirim Kata Hikmah 08.00'}
                </span>
              </button>
            </>
          )}

          <a
            href={previewTab === 'unlock' ? waMeUnlockHref : waMeWisdomHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleMarkWaClicked(previewTab)}
            className={`px-4 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs ${
              whatsappGatewayStatus.configured
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>
              {previewTab === 'unlock'
                ? 'Kirim Pengingat Materi via WhatsApp'
                : 'Kirim Kata Hikmah via WhatsApp'}
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => void handleCopyMessage()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copiedMsg ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
