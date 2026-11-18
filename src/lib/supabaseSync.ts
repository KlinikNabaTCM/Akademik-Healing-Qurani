import { supabase, isSupabaseConfigured } from './supabase';
import {
  UserProfile,
  UserProgress,
  SystemSettings,
  SubjectInfo,
  SyllabusRow,
  LearningModule,
  ComprehensiveAssessment,
  CertificateRecord,
  CertificateAuditLog,
  RemedialRequest,
  AcademicAnnouncement
} from '../types';

const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export interface SyncSeedResult {
  success: boolean;
  message: string;
  details: {
    subjectsSynced: number;
    syllabusSynced: number;
    modulesSynced: number;
    announcementsSynced: number;
  };
}

/**
 * Fetch or provision a UserProfile in public.profiles after Supabase Auth sign-in/sign-up
 */
export async function fetchOrCreateSupabaseProfile(
  authUserId: string,
  email: string,
  metadata?: Record<string, any>
): Promise<UserProfile | null> {
  if (!isSupabaseConfigured() || !isUuid(authUserId)) return null;

  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (!fetchErr && existing) {
      return {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        studentNumber: existing.student_number,
        avatar:
          existing.avatar_url ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        role: (existing.role as UserProfile['role']) || 'peserta',
        registrationDate: existing.registration_date || new Date().toISOString().split('T')[0],
        targetDate:
          existing.target_date ||
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        phone: existing.phone || '',
        city: existing.city || 'Indonesia',
        whatsappReminder: existing.whatsapp_reminder || undefined
      };
    }

    // Create new profile record if not yet created in public.profiles
    const today = new Date().toISOString().split('T')[0];
    const target = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const generatedNumber = `AHQ-${new Date().getFullYear()}-0${Math.floor(100 + Math.random() * 900)}`;

    const newRow = {
      id: authUserId,
      email,
      name: metadata?.name || email.split('@')[0] || 'Peserta Baru',
      student_number: generatedNumber,
      role: 'peserta',
      phone: metadata?.phone || '',
      city: metadata?.city || 'Indonesia',
      avatar_url:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      registration_date: today,
      target_date: target,
      is_active: true
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('profiles')
      .upsert(newRow, { onConflict: 'id' })
      .select()
      .single();

    if (insertErr || !inserted) {
      return {
        id: authUserId,
        name: newRow.name,
        email: newRow.email,
        studentNumber: newRow.student_number,
        avatar: newRow.avatar_url,
        role: newRow.role as UserProfile['role'],
        registrationDate: today,
        targetDate: target,
        phone: newRow.phone,
        city: newRow.city
      };
    }

    return {
      id: inserted.id,
      name: inserted.name,
      email: inserted.email,
      studentNumber: inserted.student_number,
      avatar: inserted.avatar_url || newRow.avatar_url,
      role: inserted.role as UserProfile['role'],
      registrationDate: inserted.registration_date,
      targetDate: inserted.target_date,
      phone: inserted.phone || '',
      city: inserted.city || '',
      whatsappReminder: inserted.whatsapp_reminder || undefined
    };
  } catch {
    return null;
  }
}

/**
 * Update existing participant profile in Supabase public.profiles
 */
export async function syncProfileToSupabase(profile: UserProfile): Promise<void> {
  if (!isSupabaseConfigured() || !isUuid(profile.id)) return;

  try {
    await supabase
      .from('profiles')
      .update({
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
        avatar_url: profile.avatar,
        ...(profile.whatsappReminder ? { whatsapp_reminder: profile.whatsappReminder } : {}),
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);
  } catch {
    // Graceful fallback when offline
  }
}

/**
 * Sync completed day progress to Supabase learning_progress table (non-blocking)
 */
export async function syncLearningProgressToSupabase(
  userId: string,
  dayNumber: number,
  isCompleted: boolean
): Promise<void> {
  if (!isSupabaseConfigured() || !isUuid(userId)) return;

  try {
    await supabase.from('learning_progress').upsert(
      {
        user_id: userId,
        day_number: dayNumber,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        last_read_at: new Date().toISOString()
      },
      { onConflict: 'user_id,day_number' }
    );
  } catch {
    // Graceful silent fallback; local persistence remains primary source of truth offline
  }
}

/**
 * Pull completed days for a Supabase-authenticated user
 */
export async function fetchLearningProgressFromSupabase(userId: string): Promise<number[] | null> {
  if (!isSupabaseConfigured() || !isUuid(userId)) return null;

  try {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('day_number, is_completed')
      .eq('user_id', userId)
      .eq('is_completed', true);

    if (error || !data) return null;
    return data.map((row: any) => Number(row.day_number)).sort((a: number, b: number) => a - b);
  } catch {
    return null;
  }
}

/**
 * Sync Remedial Request to Supabase
 */
export async function syncRemedialRequestToSupabase(req: RemedialRequest): Promise<void> {
  if (!isSupabaseConfigured() || !isUuid(req.participantId)) return;

  try {
    await supabase.from('remedial_requests').insert({
      user_id: req.participantId,
      assessment_type: req.assessmentType,
      target_label: req.targetLabel,
      reason: req.reason,
      status: req.status,
      admin_notes: req.adminNotes || null
    });
  } catch {
    // Silent fallback
  }
}

/**
 * Update Remedial Request status in Supabase when approved/rejected by academic admin
 */
export async function updateRemedialStatusInSupabase(
  participantId: string,
  targetLabel: string,
  status: RemedialRequest['status'],
  adminNotes?: string
): Promise<void> {
  if (!isSupabaseConfigured() || !isUuid(participantId)) return;

  try {
    await supabase
      .from('remedial_requests')
      .update({
        status,
        admin_notes: adminNotes || null
      })
      .eq('user_id', participantId)
      .eq('target_label', targetLabel);
  } catch {
    // Silent fallback
  }
}

/**
 * Verify a certificate code against Supabase certificates table
 */
export async function verifyCertificateInSupabase(
  queryCode: string
): Promise<CertificateRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const trimmed = queryCode.trim();
  if (!trimmed) return null;

  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .or(`certificate_number.ilike.${trimmed},verified_code.ilike.${trimmed}`)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id || `cert_${data.certificate_number}`,
      certificateNumber: data.certificate_number,
      participantId: data.user_id,
      participantName: data.participant_name || data.student_name || '',
      studentNumber: data.student_number || '',
      programName: data.program_name || 'Bimbingan Belajar Islam Terstruktur 90 Hari',
      duration: data.duration || '90 Hari (3 Bulan Terpadu)',
      completionDate: data.issued_at || new Date().toISOString().split('T')[0],
      finalGrade: Number(data.final_grade) || 0,
      predicate: data.predicate || 'Lulus',
      status: (data.status as CertificateRecord['status']) || 'Sertifikat Diterbitkan',
      verifiedCode: data.verified_code || data.verification_code || '',
      issuedAt: data.issued_at || undefined,
      revocationReason: data.revocation_reason || undefined,
      revokedAt: data.revoked_at || undefined,
      revokedBy: data.revoked_by || undefined
    };
  } catch {
    return null;
  }
}

/**
 * Sync Certificate issuance/revocation/restoration and Audit Log to Supabase
 */
export async function syncCertificateAndAuditToSupabase(
  cert: CertificateRecord,
  audit: CertificateAuditLog
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    if (isUuid(cert.participantId)) {
      await supabase.from('certificates').upsert(
        {
          user_id: cert.participantId,
          certificate_number: cert.certificateNumber,
          participant_name: cert.participantName,
          student_name: cert.participantName,
          student_number: cert.studentNumber,
          program_name: cert.programName,
          final_grade: cert.finalGrade,
          predicate: cert.predicate,
          status: cert.status,
          verified_code: cert.verifiedCode,
          verification_code: cert.verifiedCode,
          issued_at: cert.issuedAt || null,
          revocation_reason: cert.revocationReason || null,
          revoked_at: cert.revokedAt || null,
          revoked_by: cert.revokedBy || null
        },
        { onConflict: 'certificate_number' }
      );
    }

    await supabase.from('audit_logs').insert({
      action: audit.action,
      action_type: audit.action,
      entity_type: 'certificates',
      entity_id: audit.certificateNumber,
      details: {
        participantName: audit.participantName,
        reason: audit.reason || '',
        executedBy: audit.executedBy,
        timestamp: audit.timestamp
      }
    });
  } catch {
    // Silent fallback
  }
}

/**
 * Push master curriculum data (7 subjects, 90 syllabus rows, 90 modules, announcements) to Supabase
 */
export async function pushCurriculumSeedToSupabase(params: {
  subjects: SubjectInfo[];
  syllabus: SyllabusRow[];
  modules: LearningModule[];
  announcements: AcademicAnnouncement[];
}): Promise<SyncSeedResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Kredensial Supabase belum terhubung. Harap terapkan URL & Anon Key terlebih dahulu.',
      details: { subjectsSynced: 0, syllabusSynced: 0, modulesSynced: 0, announcementsSynced: 0 }
    };
  }

  try {
    // 1. Upsert 7 Subjects
    const subjectPayload = params.subjects.map((s, idx) => ({
      id: s.id,
      name: s.name,
      arabic_name: s.arabicName,
      tagline: s.tagline,
      description: s.description,
      total_days: s.totalDays,
      sort_order: idx + 1,
      is_active: true
    }));

    const { error: subjErr } = await supabase
      .from('subjects')
      .upsert(subjectPayload, { onConflict: 'id' });

    if (subjErr) {
      throw new Error(`Tabel subjects gagal disinkronkan: ${subjErr.message}`);
    }

    // 2. Upsert 90 Syllabus rows
    const syllabusPayload = params.syllabus.map((row) => ({
      day_number: row.day,
      subject_id: row.subjectId,
      topic: row.topic,
      indicator: row.indicator,
      competence: row.competence,
      notes: row.notes,
      month_period: row.day <= 30 ? 1 : row.day <= 60 ? 2 : 3
    }));

    const { error: sylErr } = await supabase
      .from('syllabus')
      .upsert(syllabusPayload, { onConflict: 'day_number' });

    if (sylErr) {
      throw new Error(`Tabel syllabus gagal disinkronkan: ${sylErr.message}`);
    }

    // 3. Upsert 90 Learning Modules (in chunks of 30)
    const modulePayload = params.modules.map((m) => ({
      day_number: m.day,
      subject_id: m.subjectId,
      title: m.title,
      learning_goal: m.learningGoal,
      introduction: m.introduction,
      content_body: m.contentSections,
      quran_arabic: m.quranVerse?.arabic || null,
      quran_translation: m.quranVerse?.translation || null,
      quran_surah: m.quranVerse?.surah || null,
      quran_ayah: m.quranVerse?.ayah || null,
      hadith_arabic: m.hadith?.arabic || null,
      hadith_translation: m.hadith?.translation || null,
      hadith_narrator: m.hadith?.narrator || null,
      hadith_source: m.hadith?.source || null,
      hadith_status: m.hadith?.status || null,
      scholar_name: m.scholarNote?.scholar || null,
      scholar_quote: m.scholarNote?.quote || null,
      scholar_book: m.scholarNote?.book || null,
      life_application: m.lifeApplication,
      key_takeaways: m.keyTakeaways,
      reflection_exercise: m.reflectionExercise,
      summary: m.summary,
      is_published: m.isPublished !== false
    }));

    for (let i = 0; i < modulePayload.length; i += 30) {
      const chunk = modulePayload.slice(i, i + 30);
      const { error: modErr } = await supabase
        .from('learning_modules')
        .upsert(chunk, { onConflict: 'day_number' });
      if (modErr) {
        throw new Error(`Tabel learning_modules (batch ${i / 30 + 1}) gagal: ${modErr.message}`);
      }
    }

    // 4. Sync Announcements
    let annCount = 0;
    if (params.announcements.length > 0) {
      const annPayload = params.announcements.map((a) => ({
        title: a.title,
        content: a.content,
        category: a.category,
        is_active: a.isActive
      }));
      const { error: annErr } = await supabase.from('announcements').insert(annPayload);
      if (!annErr) {
        annCount = annPayload.length;
      }
    }

    return {
      success: true,
      message:
        'Sinkronisasi cloud berhasil! Seluruh 7 Mata Pelajaran, 90 Silabus, dan 90 Modul Harian telah tersimpan di PostgreSQL Supabase.',
      details: {
        subjectsSynced: subjectPayload.length,
        syllabusSynced: syllabusPayload.length,
        modulesSynced: modulePayload.length,
        announcementsSynced: annCount
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Terjadi kendala saat menyinkronkan data ke Supabase. Pastikan schema.sql sudah dijalankan di SQL Editor Supabase.',
      details: { subjectsSynced: 0, syllabusSynced: 0, modulesSynced: 0, announcementsSynced: 0 }
    };
  }
}

export interface SupabaseCmsPayload {
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
}

export async function fetchCmsFromSupabase(): Promise<SupabaseCmsPayload | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('portal_cms_state')
      .select('payload')
      .eq('id', 'default')
      .maybeSingle();
    if (error || !data?.payload) return null;
    return data.payload as SupabaseCmsPayload;
  } catch {
    return null;
  }
}

export async function saveCmsToSupabase(payload: SupabaseCmsPayload): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('portal_cms_state').upsert(
      {
        id: 'default',
        payload,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );
  } catch {
    // Non-blocking sync
  }
}

export async function fetchProgressSnapshotFromSupabase(
  userId: string
): Promise<UserProgress | null> {
  if (!isSupabaseConfigured() || !isUuid(userId)) return null;
  try {
    const { data, error } = await supabase
      .from('student_progress_snapshots')
      .select('payload')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data?.payload) return null;
    return data.payload as UserProgress;
  } catch {
    return null;
  }
}

export async function saveProgressSnapshotToSupabase(
  userId: string,
  progress: UserProgress
): Promise<void> {
  if (!isSupabaseConfigured() || !isUuid(userId)) return;
  try {
    await supabase.from('student_progress_snapshots').upsert(
      {
        user_id: userId,
        payload: progress,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    );
  } catch {
    // Non-blocking sync
  }
}

export async function fetchAllStaffDataFromSupabase(): Promise<{
  users: UserProfile[];
  progressByUser: Record<string, UserProgress>;
  certificates: Record<string, CertificateRecord>;
} | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const [profilesRes, snapshotsRes, certsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('student_progress_snapshots').select('user_id, payload'),
      supabase.from('certificates').select('*')
    ]);

    const users: UserProfile[] = (profilesRes.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      studentNumber: p.student_number,
      avatar:
        p.avatar_url ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      role: (p.role as UserProfile['role']) || 'peserta',
      registrationDate: p.registration_date || new Date().toISOString().split('T')[0],
      targetDate: p.target_date || new Date().toISOString().split('T')[0],
      phone: p.phone || '',
      city: p.city || 'Indonesia',
      isGuest: false,
      whatsappReminder: p.whatsapp_reminder || undefined
    }));

    const progressByUser: Record<string, UserProgress> = {};
    for (const row of snapshotsRes.data || []) {
      if (row.user_id && row.payload) {
        progressByUser[row.user_id] = row.payload as UserProgress;
      }
    }

    const certificates: Record<string, CertificateRecord> = {};
    for (const c of certsRes.data || []) {
      if (!c.user_id) continue;
      certificates[c.user_id] = {
        id: c.id || `cert_${c.certificate_number}`,
        certificateNumber: c.certificate_number,
        participantId: c.user_id,
        participantName: c.participant_name || c.student_name || '',
        studentNumber: c.student_number || '',
        programName: c.program_name || 'Bimbingan Belajar Islam Terstruktur 90 Hari',
        duration: c.duration || '90 Hari (3 Bulan Terpadu)',
        completionDate: c.issued_at || new Date().toISOString().split('T')[0],
        finalGrade: Number(c.final_grade) || 0,
        predicate: c.predicate || 'Lulus',
        status: (c.status as CertificateRecord['status']) || 'Sertifikat Diterbitkan',
        verifiedCode: c.verified_code || c.verification_code || '',
        issuedAt: c.issued_at || undefined,
        revocationReason: c.revocation_reason || undefined,
        revokedAt: c.revoked_at || undefined,
        revokedBy: c.revoked_by || undefined
      };
    }

    return { users, progressByUser, certificates };
  } catch {
    return null;
  }
}
