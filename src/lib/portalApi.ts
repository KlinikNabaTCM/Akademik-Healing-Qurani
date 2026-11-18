import {
  UserProfile,
  UserRole,
  UserProgress,
  SystemSettings,
  CertificateRecord,
  CertificateAuditLog,
  LearningModule,
  SubjectInfo,
  SyllabusRow,
  ComprehensiveAssessment
} from '../types';

export interface PortalBootstrapResponse {
  ok: boolean;
  hasAnyAdmin: boolean;
  updatedAt: string;
  cms: {
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
  };
  certificates: Record<string, CertificateRecord>;
  sessionUser: UserProfile | null;
  sessionProgress: UserProgress | null;
  adminData: {
    users: UserProfile[];
    progressByUser: Record<string, UserProgress>;
    certificateAuditLogs: CertificateAuditLog[];
  } | null;
}

export interface PortalAuthResponse {
  success: boolean;
  error?: string;
  user?: UserProfile;
  progress?: UserProgress;
  allUsers?: UserProfile[] | null;
  allProgress?: Record<string, UserProgress> | null;
  certificateAuditLogs?: CertificateAuditLog[] | null;
}

export async function fetchPortalBootstrap(
  userId?: string
): Promise<PortalBootstrapResponse | null> {
  try {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`/api/portal/bootstrap${query}`);
    if (!res.ok) return null;
    return (await res.json()) as PortalBootstrapResponse;
  } catch {
    return null;
  }
}

export async function setupAdminViaServer(payload: {
  name: string;
  email: string;
  phone: string;
  city: string;
  password: string;
}): Promise<PortalAuthResponse> {
  try {
    const res = await fetch('/api/portal/auth/setup-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return (await res.json()) as PortalAuthResponse;
  } catch {
    return {
      success: false,
      error: 'Gagal menghubungi server portal. Periksa koneksi Anda lalu coba lagi.'
    };
  }
}

export async function registerUserViaServer(payload: {
  name: string;
  email: string;
  phone: string;
  city: string;
  password: string;
}): Promise<PortalAuthResponse> {
  try {
    const res = await fetch('/api/portal/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return (await res.json()) as PortalAuthResponse;
  } catch {
    return {
      success: false,
      error: 'Gagal menghubungi server portal. Periksa koneksi Anda lalu coba lagi.'
    };
  }
}

export async function loginUserViaServer(payload: {
  email: string;
  password: string;
}): Promise<PortalAuthResponse> {
  try {
    const res = await fetch('/api/portal/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return (await res.json()) as PortalAuthResponse;
  } catch {
    return {
      success: false,
      error: 'Gagal menghubungi server portal. Periksa koneksi Anda lalu coba lagi.'
    };
  }
}

export async function changePasswordViaServer(payload: {
  userId: string;
  oldPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/portal/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return (await res.json()) as { success: boolean; message: string };
  } catch {
    return { success: false, message: 'Gagal menghubungi server.' };
  }
}

export async function forgotPasswordLookupViaServer(
  email: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/portal/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return (await res.json()) as { success: boolean; message?: string; error?: string };
  } catch {
    return { success: false, error: 'Gagal menghubungi server portal.' };
  }
}

export async function syncUserProfileToServer(
  userId: string,
  updates: Partial<Pick<UserProfile, 'name' | 'phone' | 'city' | 'avatar' | 'whatsappReminder'>>
): Promise<void> {
  try {
    await fetch('/api/portal/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates })
    });
  } catch {
    // Non-blocking sync
  }
}

export async function syncUserProgressToServer(
  userId: string,
  progress: UserProgress
): Promise<void> {
  try {
    await fetch('/api/portal/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, progress })
    });
  } catch {
    // Non-blocking sync
  }
}

export async function upsertCertificateToServer(
  actorId: string,
  certificate: CertificateRecord,
  auditEntry?: CertificateAuditLog
): Promise<void> {
  try {
    await fetch('/api/portal/certificates/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorId, certificate, auditEntry })
    });
  } catch {
    // Non-blocking sync
  }
}

export async function verifyCertificateViaServer(
  code: string
): Promise<CertificateRecord | null> {
  try {
    const res = await fetch(
      `/api/portal/certificates/verify?code=${encodeURIComponent(code.trim())}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      found: boolean;
      certificate: CertificateRecord | null;
    };
    return data.found ? data.certificate : null;
  } catch {
    return null;
  }
}

export async function syncCmsToServer(payload: {
  actorId: string;
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
}): Promise<void> {
  try {
    await fetch('/api/portal/admin/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    // Non-blocking sync
  }
}

export async function manageUserViaServer(payload: {
  actorId: string;
  action: 'create' | 'update' | 'delete';
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  role?: UserRole;
  password?: string;
}): Promise<{ ok: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/portal/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return (await res.json()) as { ok: boolean; user?: UserProfile; error?: string };
  } catch {
    return { ok: false, error: 'Gagal menghubungi server.' };
  }
}

export async function syncEssayGradeToServer(payload: {
  actorId: string;
  studentId: string;
  day: number;
  score: number;
  feedback: string;
  reviewedBy: string;
}): Promise<void> {
  try {
    await fetch('/api/portal/admin/grade-essay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    // Non-blocking sync
  }
}

export async function syncRemedialStatusToServer(payload: {
  actorId: string;
  requestId: string;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Selesai';
  adminNotes?: string;
}): Promise<void> {
  try {
    await fetch('/api/portal/admin/remedial-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    // Non-blocking sync
  }
}

export async function restoreBackupToServer(
  actorId: string,
  backup: any
): Promise<void> {
  try {
    await fetch('/api/portal/admin/restore-backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorId, backup })
    });
  } catch {
    // Non-blocking sync
  }
}
