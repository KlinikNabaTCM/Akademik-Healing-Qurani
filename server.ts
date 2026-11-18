import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getDailyWisdomForDay,
  buildUnlockedMaterialMessage,
  buildDailyWisdomMessage
} from './src/data/dailyWisdom';
import type {
  UserProfile,
  UserRole,
  UserProgress,
  SystemSettings,
  CertificateRecord,
  CertificateAuditLog,
  LearningModule,
  SubjectInfo,
  SyllabusRow,
  ComprehensiveAssessment,
  WhatsAppReminderSettings
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type GatewayProvider = 'fonnte' | 'wablas' | 'meta_cloud' | 'webhook';

interface SendWhatsappBody {
  phone?: string;
  message?: string;
  participantName?: string;
  day?: number;
  type?: 'unlock_materi' | 'kata_hikmah_0800' | 'manual';
  userId?: string;
}

interface BroadcastWhatsappBody {
  recipients?: SendWhatsappBody[];
}

interface StoredSubscriber {
  userId: string;
  name: string;
  phone: string;
  normalizedPhone: string;
  role: string;
  registrationDate: string;
  autoSendOnUnlock: boolean;
  wisdomReminderEnabled: boolean;
  preferredTimeWIB: string;
  wisdomTimeWIB: string;
  remindEvaluationDue: boolean;
  lastUnlockSentDay?: number;
  lastUnlockSentDateWIB?: string;
  lastWisdomSentDay?: number;
  lastWisdomSentDateWIB?: string;
  updatedAt: string;
}

interface StoredModuleMeta {
  title: string;
  subjectName: string;
  learningGoal: string;
  quranRef?: string;
}

interface SchedulerDispatchLog {
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

interface SchedulerStore {
  subscribers: StoredSubscriber[];
  moduleMetaByDay: Record<number, StoredModuleMeta>;
  customDailyWisdoms: Record<number, { quote: string; source: string; practice: string }>;
  unlockTimeWIB: string;
  wisdomTimeWIB: string;
  dailyUnlockScheduleEnabled: boolean;
  appUrl: string;
  lastCheckAtWIB: string | null;
  logs: SchedulerDispatchLog[];
}

interface StoredPortalUser extends UserProfile {
  passwordHash?: string;
}

interface PortalDatabase {
  users: StoredPortalUser[];
  progressByUser: Record<string, UserProgress>;
  certificates: Record<string, CertificateRecord>;
  certificateAuditLogs: CertificateAuditLog[];
  systemSettings: Partial<SystemSettings> | null;
  moduleCustomizations: Record<number, Partial<LearningModule>>;
  extraModules: LearningModule[];
  subjectCustomizations: Record<string, Partial<SubjectInfo>>;
  customSubjects: SubjectInfo[];
  deletedSubjectIds: string[];
  syllabusCustomizations: Record<number, Partial<SyllabusRow>>;
  extraSyllabusRows: SyllabusRow[];
  assessmentCustomizations: Record<string, ComprehensiveAssessment>;
  deletedAssessmentIds: string[];
  updatedAt: string;
}

function resolveDataDir(): string {
  const localDir = path.join(__dirname, '.ahq_data');
  try {
    fs.mkdirSync(localDir, { recursive: true });
    return localDir;
  } catch {
    return os.tmpdir();
  }
}

const DATA_DIR = resolveDataDir();
const STORE_FILE_PATH = path.join(DATA_DIR, 'ahq_whatsapp_scheduler_v1.json');
const PORTAL_DB_PATH = path.join(DATA_DIR, 'ahq_portal_database_v1.json');

const DEFAULT_WA_REMINDER: WhatsAppReminderSettings = {
  enabled: true,
  autoSendOnUnlock: true,
  wisdomReminderEnabled: true,
  preferredTimeWIB: '00:00',
  wisdomTimeWIB: '08:00',
  remindUnreadOnly: false,
  remindEvaluationDue: true,
  browserNotificationEnabled: false
};

function createEmptyProgress(day = 1): UserProgress {
  return {
    completedDays: [],
    lastAccessedDay: day,
    dailyResults: {},
    weeklyResults: {},
    monthlyResults: {},
    remedialRequests: []
  };
}

function hashPasswordScrypt(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPasswordScrypt(password: string, storedHash?: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derivedBuf.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derivedBuf, keyBuf);
}

function sanitizeUser(user: StoredPortalUser): UserProfile {
  const { passwordHash: _omit, ...safe } = user;
  return {
    ...safe,
    isGuest: false,
    whatsappReminder: {
      ...DEFAULT_WA_REMINDER,
      ...(safe.whatsappReminder || {})
    }
  };
}

function getWibDateString(offsetDays = 0): string {
  const targetMs = Date.now() + offsetDays * 24 * 60 * 60 * 1000;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(targetMs));
}

function getWibTimeHHMM(): string {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());
  return formatted.replace(/^24:/, '00:');
}

function getWibTimestampString(): string {
  const datePart = getWibDateString(0);
  const timePart = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
    .format(new Date())
    .replace(/^24:/, '00:');
  return `${datePart} ${timePart} WIB`;
}

function normalizeWhatsappPhone(rawPhone: string): string {
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

function isValidWhatsappPhone(normalized: string): boolean {
  return /^\d{10,15}$/.test(normalized);
}

function calculateParticipantStudyDay(registrationDate: string): number {
  const fallback = getWibDateString(0);
  const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(registrationDate || '') ? registrationDate : fallback;
  const [y, m, d] = dateStr.split('-').map(Number);
  const startWIBMidnightMs = Date.UTC(y, (m || 1) - 1, d || 1, 0, 0, 0) - 7 * 3600000;
  const diffMs = Date.now() - startWIBMidnightMs;
  const daysElapsed = Math.floor(diffMs / (24 * 3600000));
  return Math.max(1, daysElapsed + 1);
}

function loadStore(): SchedulerStore {
  const emptyStore: SchedulerStore = {
    subscribers: [],
    moduleMetaByDay: {},
    customDailyWisdoms: {},
    unlockTimeWIB: '00:00',
    wisdomTimeWIB: '08:00',
    dailyUnlockScheduleEnabled: true,
    appUrl: '',
    lastCheckAtWIB: null,
    logs: []
  };

  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const raw = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<SchedulerStore>;
      return {
        ...emptyStore,
        ...parsed,
        subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
        moduleMetaByDay: parsed.moduleMetaByDay || {},
        customDailyWisdoms: parsed.customDailyWisdoms || {},
        logs: Array.isArray(parsed.logs) ? parsed.logs.slice(0, 200) : []
      };
    }
  } catch {
    // Fallback to clean store if unreadable
  }
  return emptyStore;
}

function loadPortalDb(): PortalDatabase {
  const emptyDb: PortalDatabase = {
    users: [],
    progressByUser: {},
    certificates: {},
    certificateAuditLogs: [],
    systemSettings: null,
    moduleCustomizations: {},
    extraModules: [],
    subjectCustomizations: {},
    customSubjects: [],
    deletedSubjectIds: [],
    syllabusCustomizations: {},
    extraSyllabusRows: [],
    assessmentCustomizations: {},
    deletedAssessmentIds: [],
    updatedAt: new Date().toISOString()
  };

  try {
    if (fs.existsSync(PORTAL_DB_PATH)) {
      const raw = fs.readFileSync(PORTAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<PortalDatabase>;
      return {
        ...emptyDb,
        ...parsed,
        users: Array.isArray(parsed.users) ? parsed.users : [],
        progressByUser: parsed.progressByUser || {},
        certificates: parsed.certificates || {},
        certificateAuditLogs: Array.isArray(parsed.certificateAuditLogs)
          ? parsed.certificateAuditLogs
          : [],
        moduleCustomizations: parsed.moduleCustomizations || {},
        extraModules: Array.isArray(parsed.extraModules) ? parsed.extraModules : [],
        subjectCustomizations: parsed.subjectCustomizations || {},
        customSubjects: Array.isArray(parsed.customSubjects) ? parsed.customSubjects : [],
        deletedSubjectIds: Array.isArray(parsed.deletedSubjectIds) ? parsed.deletedSubjectIds : [],
        syllabusCustomizations: parsed.syllabusCustomizations || {},
        extraSyllabusRows: Array.isArray(parsed.extraSyllabusRows) ? parsed.extraSyllabusRows : [],
        assessmentCustomizations: parsed.assessmentCustomizations || {},
        deletedAssessmentIds: Array.isArray(parsed.deletedAssessmentIds)
          ? parsed.deletedAssessmentIds
          : []
      };
    }
  } catch {
    // Fallback to clean DB
  }
  return emptyDb;
}

let schedulerStore: SchedulerStore = loadStore();
let portalDb: PortalDatabase = loadPortalDb();

function persistStore() {
  try {
    schedulerStore.logs = schedulerStore.logs.slice(0, 200);
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(schedulerStore), 'utf-8');
  } catch {
    // Non-fatal in read-only environments
  }
}

function persistPortalDb() {
  try {
    portalDb.updatedAt = new Date().toISOString();
    fs.writeFileSync(PORTAL_DB_PATH, JSON.stringify(portalDb), 'utf-8');
  } catch {
    // Non-fatal in read-only environments
  }
}

function syncPortalUsersToWhatsappScheduler() {
  const existingById = new Map(schedulerStore.subscribers.map((s) => [s.userId, s]));
  const nextSubs: StoredSubscriber[] = [];

  for (const u of portalDb.users) {
    const normalizedPhone = normalizeWhatsappPhone(u.phone || '');
    if (!isValidWhatsappPhone(normalizedPhone)) continue;
    const rem = { ...DEFAULT_WA_REMINDER, ...(u.whatsappReminder || {}) };
    const prev = existingById.get(u.id);
    nextSubs.push({
      userId: u.id,
      name: u.name,
      phone: u.phone,
      normalizedPhone,
      role: u.role,
      registrationDate: u.registrationDate || getWibDateString(0),
      autoSendOnUnlock: rem.autoSendOnUnlock !== false && rem.enabled !== false,
      wisdomReminderEnabled: rem.wisdomReminderEnabled !== false && rem.enabled !== false,
      preferredTimeWIB: rem.preferredTimeWIB || portalDb.systemSettings?.unlockTimeWIB || '00:00',
      wisdomTimeWIB: rem.wisdomTimeWIB || '08:00',
      remindEvaluationDue: rem.remindEvaluationDue !== false,
      lastUnlockSentDay: prev?.lastUnlockSentDay,
      lastUnlockSentDateWIB: prev?.lastUnlockSentDateWIB,
      lastWisdomSentDay: prev?.lastWisdomSentDay,
      lastWisdomSentDateWIB: prev?.lastWisdomSentDateWIB,
      updatedAt: new Date().toISOString()
    });
  }

  if (nextSubs.length > 0 || portalDb.users.length > 0) {
    // Merge preserving any extra non-portal synced entries if portalDb has users
    const portalIds = new Set(portalDb.users.map((u) => u.id));
    const extras = schedulerStore.subscribers.filter((s) => !portalIds.has(s.userId));
    schedulerStore.subscribers = [...nextSubs, ...extras].slice(0, 1000);
  }

  if (portalDb.systemSettings?.customDailyWisdoms) {
    schedulerStore.customDailyWisdoms = portalDb.systemSettings.customDailyWisdoms;
  }
  if (portalDb.systemSettings?.unlockTimeWIB) {
    schedulerStore.unlockTimeWIB = portalDb.systemSettings.unlockTimeWIB;
  }
  persistStore();
}

function appendLog(entry: Omit<SchedulerDispatchLog, 'id'>) {
  const full: SchedulerDispatchLog = {
    id: `wa_log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...entry
  };
  schedulerStore.logs = [full, ...schedulerStore.logs].slice(0, 200);
}

function getGatewayConfig() {
  const url = (process.env.WHATSAPP_GATEWAY_URL || '').trim();
  const token = (process.env.WHATSAPP_GATEWAY_TOKEN || '').trim();
  const rawProvider = (process.env.WHATSAPP_GATEWAY_PROVIDER || 'fonnte').trim().toLowerCase();
  const provider: GatewayProvider =
    rawProvider === 'wablas' || rawProvider === 'meta_cloud' || rawProvider === 'webhook'
      ? rawProvider
      : 'fonnte';
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();

  const isMetaConfigured = provider === 'meta_cloud' && Boolean(token && (url || phoneNumberId));
  const configured = Boolean((url && token) || isMetaConfigured);

  return {
    configured,
    provider,
    url:
      url ||
      (provider === 'meta_cloud' && phoneNumberId
        ? `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`
        : ''),
    token
  };
}

async function dispatchToGateway(
  normalizedPhone: string,
  message: string,
  meta?: { participantName?: string; day?: number }
): Promise<{ ok: boolean; error?: string; provider: GatewayProvider }> {
  const cfg = getGatewayConfig();

  if (!cfg.configured || !cfg.url) {
    return {
      ok: false,
      error: 'Gateway WhatsApp server belum dikonfigurasi.',
      provider: cfg.provider
    };
  }

  try {
    let response: globalThis.Response;

    if (cfg.provider === 'fonnte') {
      const formBody = new URLSearchParams();
      formBody.append('target', normalizedPhone);
      formBody.append('message', message);
      formBody.append('countryCode', '62');

      response = await fetch(cfg.url, {
        method: 'POST',
        headers: {
          Authorization: cfg.token
        },
        body: formBody
      });
    } else if (cfg.provider === 'wablas') {
      response = await fetch(cfg.url, {
        method: 'POST',
        headers: {
          Authorization: cfg.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          message
        })
      });
    } else if (cfg.provider === 'meta_cloud') {
      response = await fetch(cfg.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'text',
          text: { body: message }
        })
      });
    } else {
      response = await fetch(cfg.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          message,
          participantName: meta?.participantName,
          day: meta?.day
        })
      });
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        ok: false,
        provider: cfg.provider,
        error: `Gateway mengembalikan status ${response.status}${errText ? `: ${errText.slice(0, 120)}` : ''}`
      };
    }

    return { ok: true, provider: cfg.provider };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Gagal menghubungi server gateway WhatsApp.';
    return { ok: false, provider: cfg.provider, error: msg };
  }
}

let schedulerCycleRunning = false;

async function runWhatsappAutomationCycle(): Promise<{
  dispatchedCount: number;
  checkedSubscribers: number;
}> {
  if (schedulerCycleRunning) {
    return { dispatchedCount: 0, checkedSubscribers: schedulerStore.subscribers.length };
  }
  schedulerCycleRunning = true;

  try {
    const todayWIB = getWibDateString(0);
    const nowHHMM = getWibTimeHHMM();
    const timestampWIB = getWibTimestampString();
    schedulerStore.lastCheckAtWIB = timestampWIB;

    const cfg = getGatewayConfig();
    const unlockThresholdHHMM = schedulerStore.unlockTimeWIB || '00:00';
    const wisdomThresholdHHMM = schedulerStore.wisdomTimeWIB || '08:00';

    let dispatchedCount = 0;

    for (const sub of schedulerStore.subscribers) {
      if (sub.role !== 'peserta' || !isValidWhatsappPhone(sub.normalizedPhone)) {
        continue;
      }

      const studyDay = calculateParticipantStudyDay(sub.registrationDate);
      if (studyDay < 1 || studyDay > 90) continue;

      const modMeta = schedulerStore.moduleMetaByDay[studyDay] || {
        title: `Materi Pembelajaran Hari ke-${studyDay}`,
        subjectName: 'Kurikulum Akademik Healing Qur’ani',
        learningGoal: 'Memahami dan mengamalkan ilmu syar’i serta tadabur Al-Qur’an hari ini.'
      };

      const unlockDue =
        sub.autoSendOnUnlock !== false &&
        nowHHMM >= unlockThresholdHHMM &&
        studyDay > (sub.lastUnlockSentDay || 0) &&
        sub.lastUnlockSentDateWIB !== todayWIB;

      if (unlockDue) {
        const msg = buildUnlockedMaterialMessage({
          participantName: sub.name,
          day: studyDay,
          moduleTitle: modMeta.title,
          subjectName: modMeta.subjectName,
          learningGoal: modMeta.learningGoal,
          quranRef: modMeta.quranRef,
          includeEvaluationNote: sub.remindEvaluationDue !== false,
          appUrl: schedulerStore.appUrl || undefined
        });

        const waMeUrl = `https://wa.me/${sub.normalizedPhone}?text=${encodeURIComponent(msg)}`;

        if (cfg.configured) {
          const result = await dispatchToGateway(sub.normalizedPhone, msg, {
            participantName: sub.name,
            day: studyDay
          });
          appendLog({
            timestampWIB,
            dateWIB: todayWIB,
            timeHHMM: nowHHMM,
            type: 'unlock_materi',
            userId: sub.userId,
            participantName: sub.name,
            normalizedPhone: sub.normalizedPhone,
            day: studyDay,
            status: result.ok ? 'terkirim_gateway' : 'gagal',
            provider: result.provider,
            detail: result.ok
              ? `Pengingat materi terbuka Hari ke-${studyDay} terkirim otomatis via ${result.provider}.`
              : result.error || 'Pengiriman gateway gagal.',
            preview: msg.slice(0, 200),
            waMeUrl
          });
        } else {
          appendLog({
            timestampWIB,
            dateWIB: todayWIB,
            timeHHMM: nowHHMM,
            type: 'unlock_materi',
            userId: sub.userId,
            participantName: sub.name,
            normalizedPhone: sub.normalizedPhone,
            day: studyDay,
            status: 'antrean_wa_fallback',
            provider: null,
            detail: `Materi Hari ke-${studyDay} terbuka (${unlockThresholdHHMM} WIB). Siap dikirim ke +${sub.normalizedPhone}.`,
            preview: msg.slice(0, 200),
            waMeUrl
          });
        }

        sub.lastUnlockSentDay = studyDay;
        sub.lastUnlockSentDateWIB = todayWIB;
        dispatchedCount += 1;
      }

      const wisdomTimeTarget = sub.wisdomTimeWIB || wisdomThresholdHHMM;
      const wisdomDue =
        sub.wisdomReminderEnabled !== false &&
        nowHHMM >= wisdomTimeTarget &&
        sub.lastWisdomSentDateWIB !== todayWIB;

      if (wisdomDue) {
        const wisdom = getDailyWisdomForDay(studyDay, schedulerStore.customDailyWisdoms);
        const msg = buildDailyWisdomMessage({
          participantName: sub.name,
          day: studyDay,
          wisdom,
          moduleTitle: modMeta.title,
          appUrl: schedulerStore.appUrl || undefined
        });

        const waMeUrl = `https://wa.me/${sub.normalizedPhone}?text=${encodeURIComponent(msg)}`;

        if (cfg.configured) {
          const result = await dispatchToGateway(sub.normalizedPhone, msg, {
            participantName: sub.name,
            day: studyDay
          });
          appendLog({
            timestampWIB,
            dateWIB: todayWIB,
            timeHHMM: nowHHMM,
            type: 'kata_hikmah_0800',
            userId: sub.userId,
            participantName: sub.name,
            normalizedPhone: sub.normalizedPhone,
            day: studyDay,
            status: result.ok ? 'terkirim_gateway' : 'gagal',
            provider: result.provider,
            detail: result.ok
              ? `Kata Hikmah "Pengingat hari ini" Hari ke-${studyDay} (08.00 WIB) terkirim via ${result.provider}.`
              : result.error || 'Pengiriman gateway gagal.',
            preview: msg.slice(0, 200),
            waMeUrl
          });
        } else {
          appendLog({
            timestampWIB,
            dateWIB: todayWIB,
            timeHHMM: nowHHMM,
            type: 'kata_hikmah_0800',
            userId: sub.userId,
            participantName: sub.name,
            normalizedPhone: sub.normalizedPhone,
            day: studyDay,
            status: 'antrean_wa_fallback',
            provider: null,
            detail: `Kata Hikmah "Pengingat hari ini" Hari ke-${studyDay} siap dikirim pukul 08.00 WIB ke +${sub.normalizedPhone}.`,
            preview: msg.slice(0, 200),
            waMeUrl
          });
        }

        sub.lastWisdomSentDay = studyDay;
        sub.lastWisdomSentDateWIB = todayWIB;
        dispatchedCount += 1;
      }
    }

    persistStore();
    return {
      dispatchedCount,
      checkedSubscribers: schedulerStore.subscribers.length
    };
  } finally {
    schedulerCycleRunning = false;
  }
}

function getActorUser(actorId?: string): StoredPortalUser | undefined {
  if (!actorId) return undefined;
  return portalDb.users.find((u) => u.id === actorId);
}

function isStaffActor(actorId?: string): boolean {
  const actor = getActorUser(actorId);
  return Boolean(actor && (actor.role === 'admin' || actor.role === 'pengajar'));
}

export function createApiApp() {
  const app = express();

  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'akademik-healing-qurani' });
  });

  // =========================================================================
  // SHARED MULTI-USER PORTAL API (/api/portal/*)
  // =========================================================================

  app.get('/api/portal/bootstrap', (req: Request, res: Response) => {
    const userId = typeof req.query.userId === 'string' ? req.query.userId.trim() : '';
    const hasAnyAdmin = portalDb.users.some((u) => u.role === 'admin');
    const foundUser = userId
      ? portalDb.users.find((u) => u.id === userId)
      : undefined;
    const isStaff = Boolean(
      foundUser && (foundUser.role === 'admin' || foundUser.role === 'pengajar')
    );

    res.json({
      ok: true,
      hasAnyAdmin,
      updatedAt: portalDb.updatedAt,
      cms: {
        systemSettings: portalDb.systemSettings,
        moduleCustomizations: portalDb.moduleCustomizations,
        extraModules: portalDb.extraModules,
        subjectCustomizations: portalDb.subjectCustomizations,
        customSubjects: portalDb.customSubjects,
        deletedSubjectIds: portalDb.deletedSubjectIds,
        syllabusCustomizations: portalDb.syllabusCustomizations,
        extraSyllabusRows: portalDb.extraSyllabusRows,
        assessmentCustomizations: portalDb.assessmentCustomizations,
        deletedAssessmentIds: portalDb.deletedAssessmentIds
      },
      certificates: portalDb.certificates,
      sessionUser: foundUser ? sanitizeUser(foundUser) : null,
      sessionProgress: foundUser
        ? portalDb.progressByUser[foundUser.id] || createEmptyProgress(1)
        : null,
      adminData: isStaff
        ? {
            users: portalDb.users.map(sanitizeUser),
            progressByUser: portalDb.progressByUser,
            certificateAuditLogs: portalDb.certificateAuditLogs
          }
        : null
    });
  });

  app.post('/api/portal/auth/setup-admin', (req: Request, res: Response) => {
    if (portalDb.users.some((u) => u.role === 'admin')) {
      res.status(403).json({
        success: false,
        error: 'Akun Administrator sudah terdaftar. Silakan masuk menggunakan akun Administrator.'
      });
      return;
    }

    const { name, email, phone, city, password } = (req.body || {}) as {
      name?: string;
      email?: string;
      phone?: string;
      city?: string;
      password?: string;
    };

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();
    const rawPw = String(password || '');

    if (!cleanName || !cleanEmail || rawPw.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Nama, email, dan kata sandi minimal 6 karakter wajib diisi.'
      });
      return;
    }

    const adminUser: StoredPortalUser = {
      id: `usr_admin_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      studentNumber: 'ADM-AHQ-001',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      role: 'admin',
      registrationDate: getWibDateString(0),
      targetDate: getWibDateString(365),
      phone: String(phone || '').trim(),
      city: String(city || 'Indonesia').trim(),
      isGuest: false,
      whatsappReminder: { ...DEFAULT_WA_REMINDER },
      passwordHash: hashPasswordScrypt(rawPw)
    };

    portalDb.users.push(adminUser);
    portalDb.progressByUser[adminUser.id] = createEmptyProgress(1);
    persistPortalDb();
    syncPortalUsersToWhatsappScheduler();

    res.json({
      success: true,
      user: sanitizeUser(adminUser),
      progress: portalDb.progressByUser[adminUser.id],
      allUsers: portalDb.users.map(sanitizeUser),
      allProgress: portalDb.progressByUser,
      certificateAuditLogs: portalDb.certificateAuditLogs
    });
  });

  app.post('/api/portal/auth/register', async (req: Request, res: Response) => {
    if (portalDb.systemSettings?.allowSelfRegistration === false) {
      res.status(403).json({
        success: false,
        error: 'Pendaftaran mandiri saat ini sedang dinonaktifkan oleh Administrator.'
      });
      return;
    }

    const { name, email, phone, city, password } = (req.body || {}) as {
      name?: string;
      email?: string;
      phone?: string;
      city?: string;
      password?: string;
    };

    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();
    const normPhone = normalizeWhatsappPhone(cleanPhone);
    const rawPw = String(password || '');

    if (!cleanName || !cleanEmail || rawPw.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Nama lengkap, email, dan kata sandi minimal 6 karakter wajib diisi.'
      });
      return;
    }

    if (!isValidWhatsappPhone(normPhone)) {
      res.status(400).json({
        success: false,
        error: 'Nomor WhatsApp aktif wajib diisi minimal 10 digit.'
      });
      return;
    }

    if (portalDb.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      res.status(409).json({
        success: false,
        error: 'Email ini sudah terdaftar. Silakan gunakan menu Masuk.'
      });
      return;
    }

    const yearStr = new Date().getFullYear();
    const seq = portalDb.users.filter((u) => u.role === 'peserta').length + 1;
    const newStudentNumber = `AHQ-${yearStr}-${String(seq).padStart(4, '0')}`;

    const newUser: StoredPortalUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      studentNumber: newStudentNumber,
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      role: 'peserta',
      registrationDate: getWibDateString(0),
      targetDate: getWibDateString(90),
      phone: `+${normPhone}`,
      city: String(city || 'Indonesia').trim(),
      isGuest: false,
      whatsappReminder: { ...DEFAULT_WA_REMINDER },
      passwordHash: hashPasswordScrypt(rawPw)
    };

    portalDb.users.push(newUser);
    portalDb.progressByUser[newUser.id] = createEmptyProgress(1);
    persistPortalDb();
    syncPortalUsersToWhatsappScheduler();
    void runWhatsappAutomationCycle();

    res.json({
      success: true,
      user: sanitizeUser(newUser),
      progress: portalDb.progressByUser[newUser.id]
    });
  });

  app.post('/api/portal/auth/login', (req: Request, res: Response) => {
    const { email, password } = (req.body || {}) as {
      email?: string;
      password?: string;
    };
    const cleanEmail = String(email || '').trim().toLowerCase();
    const rawPw = String(password || '');

    const found = portalDb.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      res.status(401).json({
        success: false,
        error: 'Alamat email belum terdaftar. Silakan periksa kembali atau daftar akun baru.'
      });
      return;
    }

    if (!found.passwordHash) {
      if (rawPw.length < 6) {
        res.status(400).json({ success: false, error: 'Kata sandi minimal 6 karakter.' });
        return;
      }
      found.passwordHash = hashPasswordScrypt(rawPw);
      persistPortalDb();
    } else if (!verifyPasswordScrypt(rawPw, found.passwordHash)) {
      res.status(401).json({
        success: false,
        error: 'Kata sandi yang Anda masukkan salah. Silakan periksa kembali.'
      });
      return;
    }

    const isStaff = found.role === 'admin' || found.role === 'pengajar';
    res.json({
      success: true,
      user: sanitizeUser(found),
      progress: portalDb.progressByUser[found.id] || createEmptyProgress(1),
      allUsers: isStaff ? portalDb.users.map(sanitizeUser) : null,
      allProgress: isStaff ? portalDb.progressByUser : null,
      certificateAuditLogs: isStaff ? portalDb.certificateAuditLogs : null
    });
  });

  app.post('/api/portal/auth/change-password', (req: Request, res: Response) => {
    const { userId, oldPassword, newPassword } = (req.body || {}) as {
      userId?: string;
      oldPassword?: string;
      newPassword?: string;
    };

    const user = portalDb.users.find((u) => u.id === userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Akun tidak ditemukan.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }
    if (user.passwordHash && !verifyPasswordScrypt(oldPassword || '', user.passwordHash)) {
      res.status(401).json({ success: false, message: 'Kata sandi lama tidak sesuai.' });
      return;
    }

    user.passwordHash = hashPasswordScrypt(newPassword);
    persistPortalDb();
    res.json({ success: true, message: 'Kata sandi berhasil diperbarui.' });
  });

  app.post('/api/portal/auth/forgot', (req: Request, res: Response) => {
    const { email } = (req.body || {}) as { email?: string };
    const cleanEmail = String(email || '').trim().toLowerCase();
    const exists = portalDb.users.some((u) => u.email.toLowerCase() === cleanEmail);

    if (!exists) {
      res.status(404).json({
        success: false,
        error: 'Alamat email tersebut belum terdaftar di portal.'
      });
      return;
    }

    res.json({
      success: true,
      message:
        'Akun Anda terdaftar di portal. Silakan hubungi Administrator / Sekretariat Akademik melalui Pusat Bantuan (WhatsApp atau Email resmi) untuk pengaturan ulang kata sandi.'
    });
  });

  app.post('/api/portal/profile', (req: Request, res: Response) => {
    const { userId, updates } = (req.body || {}) as {
      userId?: string;
      updates?: Partial<
        Pick<UserProfile, 'name' | 'phone' | 'city' | 'avatar' | 'whatsappReminder'>
      >;
    };

    const user = portalDb.users.find((u) => u.id === userId);
    if (!user || !updates) {
      res.json({ ok: true });
      return;
    }

    if (typeof updates.name === 'string' && updates.name.trim()) {
      user.name = updates.name.trim();
    }
    if (typeof updates.phone === 'string') {
      const norm = normalizeWhatsappPhone(updates.phone);
      user.phone = norm ? `+${norm}` : updates.phone.trim();
    }
    if (typeof updates.city === 'string') {
      user.city = updates.city.trim();
    }
    if (typeof updates.avatar === 'string' && updates.avatar.trim()) {
      user.avatar = updates.avatar.trim();
    }
    if (updates.whatsappReminder) {
      user.whatsappReminder = {
        ...DEFAULT_WA_REMINDER,
        ...(user.whatsappReminder || {}),
        ...updates.whatsappReminder
      };
    }

    persistPortalDb();
    syncPortalUsersToWhatsappScheduler();
    res.json({ ok: true, user: sanitizeUser(user) });
  });

  app.post('/api/portal/progress', (req: Request, res: Response) => {
    const { userId, progress } = (req.body || {}) as {
      userId?: string;
      progress?: UserProgress;
    };

    if (!userId || !progress) {
      res.status(400).json({ ok: false });
      return;
    }

    const userExists = portalDb.users.some((u) => u.id === userId);
    if (!userExists) {
      res.json({ ok: true });
      return;
    }

    const existing = portalDb.progressByUser[userId] || createEmptyProgress(1);
    // Preserve staff-graded essayReview if incoming dailyResults didn't overwrite it with review
    const mergedDaily = { ...existing.dailyResults, ...(progress.dailyResults || {}) };
    for (const dayKey of Object.keys(mergedDaily)) {
      const dNum = Number(dayKey);
      const prevReview = existing.dailyResults?.[dNum]?.essayReview;
      if (prevReview && !mergedDaily[dNum]?.essayReview) {
        mergedDaily[dNum] = { ...mergedDaily[dNum], essayReview: prevReview };
      }
    }

    // Preserve admin-updated remedial status if newer on server
    const serverRemedialById = new Map(
      (existing.remedialRequests || []).map((r) => [r.id, r])
    );
    const mergedRemedials = (progress.remedialRequests || []).map((r) => {
      const srv = serverRemedialById.get(r.id);
      if (srv && srv.status !== 'Menunggu Persetujuan' && r.status === 'Menunggu Persetujuan') {
        return srv;
      }
      return r;
    });

    portalDb.progressByUser[userId] = {
      ...existing,
      ...progress,
      dailyResults: mergedDaily,
      remedialRequests: mergedRemedials
    };

    persistPortalDb();
    res.json({ ok: true, progress: portalDb.progressByUser[userId] });
  });

  app.post('/api/portal/certificates/upsert', (req: Request, res: Response) => {
    const { actorId, certificate, auditEntry } = (req.body || {}) as {
      actorId?: string;
      certificate?: CertificateRecord;
      auditEntry?: CertificateAuditLog;
    };

    if (!certificate || !certificate.participantId) {
      res.status(400).json({ ok: false });
      return;
    }

    // Allow either the participant claiming their own certificate OR admin/pengajar issuing/revoking
    const isSelf = actorId === certificate.participantId;
    if (!isSelf && !isStaffActor(actorId)) {
      res.status(403).json({ ok: false, error: 'Akses ditolak.' });
      return;
    }

    portalDb.certificates[certificate.participantId] = certificate;
    if (auditEntry) {
      portalDb.certificateAuditLogs = [auditEntry, ...portalDb.certificateAuditLogs].slice(0, 500);
    }
    persistPortalDb();
    res.json({ ok: true });
  });

  app.get('/api/portal/certificates/verify', (req: Request, res: Response) => {
    const rawCode = typeof req.query.code === 'string' ? req.query.code.trim().toUpperCase() : '';
    if (!rawCode) {
      res.json({ found: false, certificate: null });
      return;
    }

    const match = Object.values(portalDb.certificates).find(
      (c) =>
        c.certificateNumber.toUpperCase() === rawCode ||
        c.verifiedCode.toUpperCase() === rawCode ||
        c.studentNumber.toUpperCase() === rawCode
    );

    res.json({ found: Boolean(match), certificate: match || null });
  });

  app.get('/api/portal/admin/overview', (req: Request, res: Response) => {
    const actorId = typeof req.query.actorId === 'string' ? req.query.actorId : '';
    if (!isStaffActor(actorId)) {
      res.status(403).json({ ok: false, error: 'Hanya Pengelola atau Pengajar.' });
      return;
    }

    res.json({
      ok: true,
      users: portalDb.users.map(sanitizeUser),
      progressByUser: portalDb.progressByUser,
      certificates: portalDb.certificates,
      certificateAuditLogs: portalDb.certificateAuditLogs
    });
  });

  app.post('/api/portal/admin/cms', (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      actorId?: string;
      systemSettings?: Partial<SystemSettings>;
      moduleCustomizations?: Record<number, Partial<LearningModule>>;
      extraModules?: LearningModule[];
      subjectCustomizations?: Record<string, Partial<SubjectInfo>>;
      customSubjects?: SubjectInfo[];
      deletedSubjectIds?: string[];
      syllabusCustomizations?: Record<number, Partial<SyllabusRow>>;
      extraSyllabusRows?: SyllabusRow[];
      assessmentCustomizations?: Record<string, ComprehensiveAssessment>;
      deletedAssessmentIds?: string[];
    };

    if (!isStaffActor(body.actorId)) {
      res.status(403).json({ ok: false, error: 'Hanya Pengelola atau Pengajar yang dapat mengubah konten.' });
      return;
    }

    if (body.systemSettings !== undefined) portalDb.systemSettings = body.systemSettings;
    if (body.moduleCustomizations !== undefined) portalDb.moduleCustomizations = body.moduleCustomizations;
    if (body.extraModules !== undefined) portalDb.extraModules = body.extraModules;
    if (body.subjectCustomizations !== undefined) portalDb.subjectCustomizations = body.subjectCustomizations;
    if (body.customSubjects !== undefined) portalDb.customSubjects = body.customSubjects;
    if (body.deletedSubjectIds !== undefined) portalDb.deletedSubjectIds = body.deletedSubjectIds;
    if (body.syllabusCustomizations !== undefined) portalDb.syllabusCustomizations = body.syllabusCustomizations;
    if (body.extraSyllabusRows !== undefined) portalDb.extraSyllabusRows = body.extraSyllabusRows;
    if (body.assessmentCustomizations !== undefined) portalDb.assessmentCustomizations = body.assessmentCustomizations;
    if (body.deletedAssessmentIds !== undefined) portalDb.deletedAssessmentIds = body.deletedAssessmentIds;

    persistPortalDb();
    syncPortalUsersToWhatsappScheduler();
    res.json({ ok: true, updatedAt: portalDb.updatedAt });
  });

  app.post('/api/portal/admin/users', (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      actorId?: string;
      action?: 'create' | 'update' | 'delete';
      userId?: string;
      name?: string;
      email?: string;
      phone?: string;
      city?: string;
      role?: UserRole;
      password?: string;
    };

    if (!isStaffActor(body.actorId)) {
      res.status(403).json({ ok: false, error: 'Akses ditolak.' });
      return;
    }

    if (body.action === 'create') {
      const cleanEmail = String(body.email || '').trim().toLowerCase();
      if (!cleanEmail || !body.name?.trim()) {
        res.status(400).json({ ok: false, error: 'Nama dan email wajib diisi.' });
        return;
      }
      if (portalDb.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        res.status(409).json({ ok: false, error: 'Email sudah terdaftar.' });
        return;
      }
      const role: UserRole = body.role || 'peserta';
      const yearStr = new Date().getFullYear();
      const prefix = role === 'admin' ? 'ADM' : role === 'pengajar' ? 'TCH' : `AHQ-${yearStr}`;
      const newStudentNumber = `${prefix}-0${Math.floor(100 + Math.random() * 900)}`;
      const normPhone = normalizeWhatsappPhone(body.phone || '');

      const created: StoredPortalUser = {
        id: `usr_${role}_${Date.now()}`,
        name: body.name.trim(),
        email: cleanEmail,
        studentNumber: newStudentNumber,
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        role,
        registrationDate: getWibDateString(0),
        targetDate: getWibDateString(90),
        phone: normPhone ? `+${normPhone}` : String(body.phone || '').trim(),
        city: String(body.city || 'Indonesia').trim(),
        isGuest: false,
        whatsappReminder: { ...DEFAULT_WA_REMINDER },
        passwordHash:
          body.password && body.password.length >= 6
            ? hashPasswordScrypt(body.password)
            : undefined
      };
      portalDb.users.push(created);
      portalDb.progressByUser[created.id] = createEmptyProgress(1);
      persistPortalDb();
      syncPortalUsersToWhatsappScheduler();
      res.json({ ok: true, user: sanitizeUser(created) });
      return;
    }

    if (body.action === 'update' && body.userId) {
      const target = portalDb.users.find((u) => u.id === body.userId);
      if (!target) {
        res.status(404).json({ ok: false, error: 'Pengguna tidak ditemukan.' });
        return;
      }
      if (body.name) target.name = body.name.trim();
      if (body.email) target.email = body.email.trim().toLowerCase();
      if (typeof body.phone === 'string') {
        const norm = normalizeWhatsappPhone(body.phone);
        target.phone = norm ? `+${norm}` : body.phone.trim();
      }
      if (typeof body.city === 'string') target.city = body.city.trim();
      if (body.role) target.role = body.role;
      if (body.password && body.password.trim().length >= 6) {
        target.passwordHash = hashPasswordScrypt(body.password.trim());
      }
      persistPortalDb();
      syncPortalUsersToWhatsappScheduler();
      res.json({ ok: true, user: sanitizeUser(target) });
      return;
    }

    if (body.action === 'delete' && body.userId) {
      if (body.userId === body.actorId) {
        res.status(400).json({ ok: false, error: 'Tidak dapat menghapus akun sendiri.' });
        return;
      }
      portalDb.users = portalDb.users.filter((u) => u.id !== body.userId);
      persistPortalDb();
      syncPortalUsersToWhatsappScheduler();
      res.json({ ok: true });
      return;
    }

    res.status(400).json({ ok: false });
  });

  app.post('/api/portal/admin/grade-essay', (req: Request, res: Response) => {
    const { actorId, studentId, day, score, feedback, reviewedBy } = (req.body || {}) as {
      actorId?: string;
      studentId?: string;
      day?: number;
      score?: number;
      feedback?: string;
      reviewedBy?: string;
    };

    if (!isStaffActor(actorId) || !studentId || !day) {
      res.status(403).json({ ok: false });
      return;
    }

    const prog = portalDb.progressByUser[studentId] || createEmptyProgress(day);
    const existingDaily = prog.dailyResults[day] || {
      score: 0,
      completedAt: getWibDateString(0),
      answers: {}
    };

    prog.dailyResults[day] = {
      ...existingDaily,
      essayReview: {
        score: Number(score) || 0,
        feedback: String(feedback || ''),
        reviewedBy: reviewedBy || 'Pengajar Akademik',
        reviewedAt: getWibDateString(0)
      }
    };
    portalDb.progressByUser[studentId] = prog;
    persistPortalDb();
    res.json({ ok: true });
  });

  app.post('/api/portal/admin/remedial-status', (req: Request, res: Response) => {
    const { actorId, requestId, status, adminNotes } = (req.body || {}) as {
      actorId?: string;
      requestId?: string;
      status?: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Selesai';
      adminNotes?: string;
    };

    if (!isStaffActor(actorId) || !requestId || !status) {
      res.status(403).json({ ok: false });
      return;
    }

    for (const uid of Object.keys(portalDb.progressByUser)) {
      const prog = portalDb.progressByUser[uid];
      if (!prog?.remedialRequests) continue;
      let changed = false;
      prog.remedialRequests = prog.remedialRequests.map((r) => {
        if (r.id === requestId) {
          changed = true;
          return { ...r, status, adminNotes: adminNotes ?? r.adminNotes };
        }
        return r;
      });
      if (changed) break;
    }

    persistPortalDb();
    res.json({ ok: true });
  });

  app.post('/api/portal/admin/restore-backup', (req: Request, res: Response) => {
    const { actorId, backup } = (req.body || {}) as {
      actorId?: string;
      backup?: any;
    };

    if (!isStaffActor(actorId) || !backup || typeof backup !== 'object') {
      res.status(403).json({ ok: false });
      return;
    }

    if (backup.settings) portalDb.systemSettings = backup.settings;
    if (backup.certificates) portalDb.certificates = backup.certificates;
    if (backup.moduleCustomizations) portalDb.moduleCustomizations = backup.moduleCustomizations;
    if (Array.isArray(backup.extraModules)) portalDb.extraModules = backup.extraModules;
    if (backup.subjectCustomizations) portalDb.subjectCustomizations = backup.subjectCustomizations;
    if (Array.isArray(backup.customSubjects)) portalDb.customSubjects = backup.customSubjects;
    if (Array.isArray(backup.deletedSubjectIds)) portalDb.deletedSubjectIds = backup.deletedSubjectIds;
    if (backup.syllabusCustomizations) portalDb.syllabusCustomizations = backup.syllabusCustomizations;
    if (Array.isArray(backup.extraSyllabusRows)) portalDb.extraSyllabusRows = backup.extraSyllabusRows;
    if (backup.assessmentCustomizations) portalDb.assessmentCustomizations = backup.assessmentCustomizations;
    if (Array.isArray(backup.deletedAssessmentIds)) portalDb.deletedAssessmentIds = backup.deletedAssessmentIds;

    persistPortalDb();
    syncPortalUsersToWhatsappScheduler();
    res.json({ ok: true });
  });

  // =========================================================================
  // WHATSAPP AUTOMATION API (/api/whatsapp/*)
  // =========================================================================

  app.get('/api/whatsapp/status', (_req: Request, res: Response) => {
    const cfg = getGatewayConfig();
    res.json({
      configured: cfg.configured,
      provider: cfg.configured ? cfg.provider : null
    });
  });

  app.post('/api/whatsapp/subscribers/sync', async (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      subscribers?: Array<{
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
      moduleMetaByDay?: Record<number, StoredModuleMeta>;
      customDailyWisdoms?: Record<number, { quote: string; source: string; practice: string }>;
      unlockTimeWIB?: string;
      dailyUnlockScheduleEnabled?: boolean;
      appUrl?: string;
    };

    if (body.moduleMetaByDay && typeof body.moduleMetaByDay === 'object') {
      schedulerStore.moduleMetaByDay = {
        ...schedulerStore.moduleMetaByDay,
        ...body.moduleMetaByDay
      };
    }

    if (body.customDailyWisdoms && typeof body.customDailyWisdoms === 'object') {
      schedulerStore.customDailyWisdoms = body.customDailyWisdoms;
    }

    if (body.unlockTimeWIB) {
      schedulerStore.unlockTimeWIB = body.unlockTimeWIB;
    }

    if (typeof body.dailyUnlockScheduleEnabled === 'boolean') {
      schedulerStore.dailyUnlockScheduleEnabled = body.dailyUnlockScheduleEnabled;
    }

    if (body.appUrl) {
      schedulerStore.appUrl = body.appUrl;
    }

    if (Array.isArray(body.subscribers)) {
      const existingById = new Map(
        schedulerStore.subscribers.map((s) => [s.userId, s])
      );

      // Merge portalDb users + client subscribers without wiping server users
      const incomingMap = new Map(body.subscribers.map((s) => [s.userId, s]));
      for (const pu of portalDb.users) {
        if (!incomingMap.has(pu.id) && isValidWhatsappPhone(normalizeWhatsappPhone(pu.phone))) {
          const rem = { ...DEFAULT_WA_REMINDER, ...(pu.whatsappReminder || {}) };
          incomingMap.set(pu.id, {
            userId: pu.id,
            name: pu.name,
            phone: pu.phone,
            role: pu.role,
            registrationDate: pu.registrationDate,
            autoSendOnUnlock: rem.autoSendOnUnlock !== false && rem.enabled !== false,
            wisdomReminderEnabled: rem.wisdomReminderEnabled !== false && rem.enabled !== false,
            preferredTimeWIB: rem.preferredTimeWIB || '00:00',
            wisdomTimeWIB: rem.wisdomTimeWIB || '08:00',
            remindEvaluationDue: rem.remindEvaluationDue !== false
          });
        }
      }

      const syncedList: StoredSubscriber[] = [];
      for (const incoming of Array.from(incomingMap.values()).slice(0, 1000)) {
        const normalizedPhone = normalizeWhatsappPhone(incoming.phone || '');
        const prev = existingById.get(incoming.userId);
        syncedList.push({
          userId: incoming.userId,
          name: String(incoming.name || 'Peserta').trim(),
          phone: incoming.phone || '',
          normalizedPhone,
          role: incoming.role || 'peserta',
          registrationDate: incoming.registrationDate || getWibDateString(0),
          autoSendOnUnlock: incoming.autoSendOnUnlock !== false,
          wisdomReminderEnabled: incoming.wisdomReminderEnabled !== false,
          preferredTimeWIB: incoming.preferredTimeWIB || '00:00',
          wisdomTimeWIB: incoming.wisdomTimeWIB || '08:00',
          remindEvaluationDue: incoming.remindEvaluationDue !== false,
          lastUnlockSentDay: prev?.lastUnlockSentDay,
          lastUnlockSentDateWIB: prev?.lastUnlockSentDateWIB,
          lastWisdomSentDay: prev?.lastWisdomSentDay,
          lastWisdomSentDateWIB: prev?.lastWisdomSentDateWIB,
          updatedAt: new Date().toISOString()
        });
      }

      schedulerStore.subscribers = syncedList;
    }

    persistStore();
    const cycleResult = await runWhatsappAutomationCycle();

    res.json({
      ok: true,
      subscriberCount: schedulerStore.subscribers.length,
      ...cycleResult
    });
  });

  app.get('/api/whatsapp/logs', (_req: Request, res: Response) => {
    const cfg = getGatewayConfig();
    res.json({
      configured: cfg.configured,
      provider: cfg.configured ? cfg.provider : null,
      subscriberCount: schedulerStore.subscribers.filter(
        (s) => s.role === 'peserta' && isValidWhatsappPhone(s.normalizedPhone)
      ).length,
      lastCheckAtWIB: schedulerStore.lastCheckAtWIB,
      unlockTimeWIB: schedulerStore.unlockTimeWIB,
      wisdomTimeWIB: schedulerStore.wisdomTimeWIB,
      logs: schedulerStore.logs,
      subscribers: schedulerStore.subscribers
        .filter((s) => s.role === 'peserta' && isValidWhatsappPhone(s.normalizedPhone))
        .map((s) => ({
          userId: s.userId,
          name: s.name,
          normalizedPhone: s.normalizedPhone,
          registrationDate: s.registrationDate,
          currentDay: Math.min(90, calculateParticipantStudyDay(s.registrationDate)),
          autoSendOnUnlock: s.autoSendOnUnlock,
          wisdomReminderEnabled: s.wisdomReminderEnabled,
          lastUnlockSentDay: s.lastUnlockSentDay,
          lastUnlockSentDateWIB: s.lastUnlockSentDateWIB,
          lastWisdomSentDay: s.lastWisdomSentDay,
          lastWisdomSentDateWIB: s.lastWisdomSentDateWIB
        }))
    });
  });

  app.post('/api/whatsapp/scheduler/run', async (_req: Request, res: Response) => {
    const result = await runWhatsappAutomationCycle();
    res.json({
      ok: true,
      ...result,
      lastCheckAtWIB: schedulerStore.lastCheckAtWIB
    });
  });

  app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
    const body = (req.body || {}) as SendWhatsappBody;
    const normalizedPhone = normalizeWhatsappPhone(body.phone || '');
    const message = String(body.message || '').trim();
    const notifType = body.type || 'manual';
    const dayNum = Number(body.day) || 1;

    if (!isValidWhatsappPhone(normalizedPhone)) {
      res.status(400).json({
        success: false,
        error:
          'Nomor WhatsApp tidak valid. Gunakan format Indonesia aktif, misalnya +62 812-xxxx-xxxx.'
      });
      return;
    }

    if (!message || message.length > 2500) {
      res.status(400).json({
        success: false,
        error: 'Pesan pengingat tidak boleh kosong dan maksimal 2.500 karakter.'
      });
      return;
    }

    const waMeUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
    const cfg = getGatewayConfig();
    const todayWIB = getWibDateString(0);
    const nowHHMM = getWibTimeHHMM();
    const timestampWIB = getWibTimestampString();

    if (!cfg.configured) {
      res.json({
        success: true,
        configured: false,
        sentVia: 'wa_me_fallback',
        normalizedPhone,
        waMeUrl,
        message: 'Gateway server belum diatur; tautan WhatsApp langsung siap digunakan.'
      });
      return;
    }

    const result = await dispatchToGateway(normalizedPhone, message, {
      participantName: body.participantName,
      day: dayNum
    });

    appendLog({
      timestampWIB,
      dateWIB: todayWIB,
      timeHHMM: nowHHMM,
      type: notifType,
      userId: body.userId || normalizedPhone,
      participantName: body.participantName || 'Peserta',
      normalizedPhone,
      day: dayNum,
      status: result.ok ? 'terkirim_gateway' : 'gagal',
      provider: result.provider,
      detail: result.ok
        ? `Terkirim via ${result.provider}.`
        : result.error || 'Pengiriman gateway gagal.',
      preview: message.slice(0, 200),
      waMeUrl
    });

    if (result.ok && (notifType === 'unlock_materi' || notifType === 'kata_hikmah_0800')) {
      const targetSub = schedulerStore.subscribers.find(
        (s) => s.userId === body.userId || s.normalizedPhone === normalizedPhone
      );
      if (targetSub) {
        if (notifType === 'unlock_materi') {
          targetSub.lastUnlockSentDay = Math.max(targetSub.lastUnlockSentDay || 0, dayNum);
          targetSub.lastUnlockSentDateWIB = todayWIB;
        } else if (notifType === 'kata_hikmah_0800') {
          targetSub.lastWisdomSentDay = dayNum;
          targetSub.lastWisdomSentDateWIB = todayWIB;
        }
      }
    }
    persistStore();

    if (result.ok) {
      res.json({
        success: true,
        configured: true,
        sentVia: 'gateway',
        provider: result.provider,
        normalizedPhone,
        waMeUrl,
        message: `Notifikasi WhatsApp berhasil dikirim via ${result.provider}.`
      });
      return;
    }

    res.status(502).json({
      success: false,
      configured: true,
      sentVia: 'gateway_error',
      provider: result.provider,
      normalizedPhone,
      waMeUrl,
      error: result.error || 'Pengiriman via gateway WhatsApp gagal.'
    });
  });

  app.post('/api/whatsapp/broadcast', async (req: Request, res: Response) => {
    const body = (req.body || {}) as BroadcastWhatsappBody;
    const recipients = Array.isArray(body.recipients) ? body.recipients.slice(0, 100) : [];
    const cfg = getGatewayConfig();

    if (!cfg.configured) {
      res.json({
        success: false,
        configured: false,
        sentCount: 0,
        failedCount: 0,
        error:
          'Gateway WhatsApp server (WHATSAPP_GATEWAY_URL / WHATSAPP_GATEWAY_TOKEN) belum dikonfigurasi di environment server.'
      });
      return;
    }

    let sentCount = 0;
    let failedCount = 0;
    const details: Array<{ phone: string; ok: boolean; error?: string }> = [];

    for (const item of recipients) {
      const normalized = normalizeWhatsappPhone(item.phone || '');
      const msg = String(item.message || '').trim();
      if (!isValidWhatsappPhone(normalized) || !msg) {
        failedCount += 1;
        details.push({ phone: item.phone || '', ok: false, error: 'Nomor atau pesan tidak valid' });
        continue;
      }

      const dispatchRes = await dispatchToGateway(normalized, msg, {
        participantName: item.participantName,
        day: item.day
      });
      if (dispatchRes.ok) {
        sentCount += 1;
        details.push({ phone: normalized, ok: true });
      } else {
        failedCount += 1;
        details.push({ phone: normalized, ok: false, error: dispatchRes.error });
      }
    }

    res.json({
      success: sentCount > 0,
      configured: true,
      provider: cfg.provider,
      sentCount,
      failedCount,
      details
    });
  });

  return app;
}

async function startServer() {
  const app = createApiApp();
  const httpServer = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    process.env.DISABLE_HMR = process.env.DISABLE_HMR || 'true';
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null
      },
      appType: 'spa'
    });

    if (process.env.DISABLE_HMR === 'true') {
      app.get('/@vite/client', (_req: Request, res: Response) => {
        res.type('application/javascript').send(`
const sheetsMap = new Map();
const linkSheetsMap = new Map();
if ("document" in globalThis) {
  document.querySelectorAll("style[data-vite-dev-id]").forEach((el) => {
    sheetsMap.set(el.getAttribute("data-vite-dev-id"), el);
  });
  document.querySelectorAll('link[rel="stylesheet"][data-vite-dev-id]').forEach((el) => {
    linkSheetsMap.set(el.getAttribute("data-vite-dev-id"), el);
  });
}
let lastInsertedStyle;
export function updateStyle(id, content) {
  if (linkSheetsMap.has(id)) return;
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("data-vite-dev-id", id);
    style.textContent = content;
    if (!lastInsertedStyle) {
      document.head.appendChild(style);
      setTimeout(() => { lastInsertedStyle = undefined; }, 0);
    } else {
      lastInsertedStyle.insertAdjacentElement("afterend", style);
    }
    lastInsertedStyle = style;
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
  sheetsMap.set(id, style);
}
export function removeStyle(id) {
  if (linkSheetsMap.has(id)) {
    document.querySelectorAll('link[rel="stylesheet"][data-vite-dev-id="' + CSS.escape(id) + '"]').forEach((el) => el.remove());
    linkSheetsMap.delete(id);
  }
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
    sheetsMap.delete(id);
  }
}
export function createHotContext() {
  const data = {};
  return {
    get data() { return data; },
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {}
  };
}
export function injectQuery(url, queryToInject) {
  if (url[0] !== "." && url[0] !== "/") return url;
  const pathname = url.replace(/[?#].*$/, "");
  const { search, hash } = new URL(url, "http://vite.dev");
  return pathname + "?" + queryToInject + (search ? "&" + search.slice(1) : "") + (hash || "");
}
export class ErrorOverlay extends HTMLElement {}
`);
      });
    }

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Sync portal users into WhatsApp scheduler at startup & schedule periodic checks
  syncPortalUsersToWhatsappScheduler();
  setTimeout(() => {
    void runWhatsappAutomationCycle();
  }, 4000);

  setInterval(() => {
    void runWhatsappAutomationCycle();
  }, 30000);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  void startServer();
}
