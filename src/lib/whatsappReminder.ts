import {
  DailyWisdomEntry,
  getDailyWisdomForDay,
  buildUnlockedMaterialMessage,
  buildDailyWisdomMessage
} from '../data/dailyWisdom';

export {
  type DailyWisdomEntry,
  getDailyWisdomForDay,
  buildUnlockedMaterialMessage,
  buildDailyWisdomMessage
};

export interface WhatsappGatewayStatus {
  configured: boolean;
  provider: string | null;
}

export interface SendWhatsappResponse {
  success: boolean;
  configured?: boolean;
  sentVia?: 'gateway' | 'wa_me_fallback' | 'gateway_error';
  provider?: string;
  normalizedPhone?: string;
  waMeUrl?: string;
  message?: string;
  error?: string;
}

export interface BroadcastWhatsappResponse {
  success: boolean;
  configured: boolean;
  provider?: string;
  sentCount: number;
  failedCount: number;
  error?: string;
}

export interface WhatsappAutomationLog {
  id: string;
  timestampWIB: string;
  dateWIB: string;
  timeHHMM: string;
  type: 'unlock_materi' | 'kata_hikmah_0800' | 'manual';
  userId: string;
  participantName: string;
  normalizedPhone: string;
  day: number;
  status: 'terkirim_gateway' | 'antrean_wa_fallback' | 'gagal';
  provider: string | null;
  detail: string;
  preview: string;
  waMeUrl: string;
}

export interface WhatsappAutomationLogsResponse {
  configured: boolean;
  provider: string | null;
  subscriberCount: number;
  lastCheckAtWIB: string | null;
  unlockTimeWIB: string;
  wisdomTimeWIB: string;
  logs: WhatsappAutomationLog[];
  subscribers: Array<{
    userId: string;
    name: string;
    normalizedPhone: string;
    registrationDate: string;
    currentDay: number;
    autoSendOnUnlock: boolean;
    wisdomReminderEnabled: boolean;
    lastUnlockSentDay?: number;
    lastUnlockSentDateWIB?: string;
    lastWisdomSentDay?: number;
    lastWisdomSentDateWIB?: string;
  }>;
}

export interface WhatsappSubscriberSyncPayload {
  subscribers: Array<{
    userId: string;
    name: string;
    phone: string;
    role: string;
    registrationDate: string;
    autoSendOnUnlock?: boolean;
    wisdomReminderEnabled?: boolean;
    preferredTimeWIB?: string;
    wisdomTimeWIB?: string;
    remindEvaluationDue?: boolean;
  }>;
  moduleMetaByDay?: Record<
    number,
    {
      title: string;
      subjectName: string;
      learningGoal: string;
      quranRef?: string;
    }
  >;
  customDailyWisdoms?: Record<number, { quote: string; source: string; practice: string }>;
  unlockTimeWIB?: string;
  dailyUnlockScheduleEnabled?: boolean;
  appUrl?: string;
}

export function normalizeWhatsappPhone(rawPhone: string): string {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('8')) {
    return `62${digits}`;
  }
  return digits;
}

export function isValidWhatsappPhone(rawPhone: string): boolean {
  const normalized = normalizeWhatsappPhone(rawPhone);
  return /^\d{10,15}$/.test(normalized);
}

export function formatWhatsappDisplay(rawPhone: string): string {
  const norm = normalizeWhatsappPhone(rawPhone);
  if (!norm) return 'Belum diatur';
  return `+${norm}`;
}

export function getWibTimeHHMM(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
    .format(new Date())
    .replace(/^24:/, '00:');
}

export function buildMaterialReminderMessage(params: {
  participantName: string;
  day: number;
  moduleTitle: string;
  subjectName: string;
  learningGoal: string;
  quranRef?: string;
  includeEvaluationNote?: boolean;
  isLockedFutureDay?: boolean;
  appUrl?: string;
}): string {
  const {
    participantName,
    day,
    moduleTitle,
    subjectName,
    learningGoal,
    quranRef,
    includeEvaluationNote,
    isLockedFutureDay,
    appUrl
  } = params;

  const targetUrl =
    appUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  if (!isLockedFutureDay) {
    return buildUnlockedMaterialMessage({
      participantName,
      day,
      moduleTitle,
      subjectName,
      learningGoal,
      quranRef,
      includeEvaluationNote,
      appUrl: targetUrl
    });
  }

  const lines = [
    `*Assalamu'alaikum warahmatullahi wabarakatuh,*`,
    `Sahabat penuntut ilmu *${participantName}*,`,
    '',
    `📅 *Jadwal Materi Akan Datang — Akademik Healing Qur'ani*`,
    `• *Hari ke-${day} / 90* (${subjectName})`,
    `• *Judul:* ${moduleTitle}`,
    quranRef ? `• *Ayat Rujukan:* ${quranRef}` : '',
    `• *Tujuan Belajar:* ${learningGoal}`,
    includeEvaluationNote
      ? `• *Evaluasi:* Jangan lupa tuntaskan kuis harian (Benar = 2 poin, Salah = 1 poin) & tulis refleksi diri.`
      : '',
    '',
    targetUrl ? `Akses materi belajar di sini:\n${targetUrl}` : '',
    '',
    `_Semoga Allah memudahkan langkah kita dalam menuntut ilmu dan melembutkan hati dengan Al-Qur'an._`
  ];

  return lines
    .filter((line, idx, arr) => {
      if (line !== '') return true;
      return idx > 0 && arr[idx - 1] !== '';
    })
    .join('\n');
}

export function buildWhatsappWaMeLink(phone: string, message: string): string {
  const norm = normalizeWhatsappPhone(phone);
  if (!norm) return `https://wa.me/?text=${encodeURIComponent(message)}`;
  return `https://wa.me/${norm}?text=${encodeURIComponent(message)}`;
}

export async function fetchWhatsappGatewayStatus(): Promise<WhatsappGatewayStatus> {
  try {
    const res = await fetch('/api/whatsapp/status');
    if (!res.ok) return { configured: false, provider: null };
    return (await res.json()) as WhatsappGatewayStatus;
  } catch {
    return { configured: false, provider: null };
  }
}

export async function sendWhatsappNotification(payload: {
  phone: string;
  message: string;
  participantName?: string;
  day?: number;
  type?: 'unlock_materi' | 'kata_hikmah_0800' | 'manual';
  userId?: string;
}): Promise<SendWhatsappResponse> {
  try {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = (await res.json()) as SendWhatsappResponse;
    return data;
  } catch {
    const waMeUrl = buildWhatsappWaMeLink(payload.phone, payload.message);
    return {
      success: true,
      configured: false,
      sentVia: 'wa_me_fallback',
      normalizedPhone: normalizeWhatsappPhone(payload.phone),
      waMeUrl
    };
  }
}

export async function broadcastWhatsappReminders(
  recipients: Array<{
    phone: string;
    message: string;
    participantName?: string;
    day?: number;
  }>
): Promise<BroadcastWhatsappResponse> {
  try {
    const res = await fetch('/api/whatsapp/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients })
    });
    return (await res.json()) as BroadcastWhatsappResponse;
  } catch {
    return {
      success: false,
      configured: false,
      sentCount: 0,
      failedCount: recipients.length,
      error: 'Gagal menghubungi server pengingat WhatsApp.'
    };
  }
}

export async function syncWhatsappSubscribersToServer(
  payload: WhatsappSubscriberSyncPayload
): Promise<boolean> {
  try {
    const res = await fetch('/api/whatsapp/subscribers/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchWhatsappAutomationLogs(): Promise<WhatsappAutomationLogsResponse | null> {
  try {
    const res = await fetch('/api/whatsapp/logs');
    if (!res.ok) return null;
    return (await res.json()) as WhatsappAutomationLogsResponse;
  } catch {
    return null;
  }
}

export async function runWhatsappSchedulerNow(): Promise<{
  ok: boolean;
  dispatchedCount: number;
  checkedSubscribers: number;
} | null> {
  try {
    const res = await fetch('/api/whatsapp/scheduler/run', { method: 'POST' });
    if (!res.ok) return null;
    return (await res.json()) as {
      ok: boolean;
      dispatchedCount: number;
      checkedSubscribers: number;
    };
  } catch {
    return null;
  }
}
