-- ========================================================================
-- AKADEMIK HEALING QUR’ANI: POSTGRESQL & SUPABASE DATABASE SCHEMA
-- Tahap 2: Database, Relasi, Autentikasi, dan Kebijakan Row Level Security (RLS)
-- ========================================================================

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------
-- 1. TABEL: profiles
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    student_number TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('peserta', 'pengajar', 'admin')) DEFAULT 'peserta',
    phone TEXT,
    city TEXT,
    avatar_url TEXT,
    whatsapp_reminder JSONB NOT NULL DEFAULT '{"enabled":true,"autoSendOnUnlock":true,"wisdomReminderEnabled":true,"preferredTimeWIB":"00:00","wisdomTimeWIB":"08:00","remindEvaluationDue":true,"browserNotificationEnabled":false}'::jsonb,
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '90 days'),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS whatsapp_reminder JSONB NOT NULL DEFAULT '{"enabled":true,"autoSendOnUnlock":true,"wisdomReminderEnabled":true,"preferredTimeWIB":"00:00","wisdomTimeWIB":"08:00","remindEvaluationDue":true,"browserNotificationEnabled":false}'::jsonb;

-- ------------------------------------------------------------------------
-- 2. TABEL: subjects (7 Mata Pelajaran Utama)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    arabic_name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    total_days INT NOT NULL CHECK (total_days > 0),
    sort_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 3. TABEL: curriculum (Tujuan dan Capaian Kompetensi Kurikulum)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.curriculum (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('tujuan', 'kompetensi', 'adab')),
    description TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 4. TABEL: syllabus (90 Baris Silabus)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.syllabus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_number INT UNIQUE NOT NULL CHECK (day_number BETWEEN 1 AND 90),
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    topic TEXT NOT NULL,
    indicator TEXT NOT NULL,
    competence TEXT NOT NULL,
    notes TEXT,
    month_period INT NOT NULL CHECK (month_period IN (1, 2, 3)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 5. TABEL: learning_modules (Modul Pembelajaran 90 Hari)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_number INT UNIQUE NOT NULL REFERENCES public.syllabus(day_number) ON DELETE RESTRICT,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    learning_goal TEXT NOT NULL,
    introduction TEXT NOT NULL,
    content_body JSONB NOT NULL DEFAULT '[]'::jsonb,
    quran_arabic TEXT,
    quran_translation TEXT,
    quran_surah TEXT,
    quran_ayah TEXT,
    hadith_arabic TEXT,
    hadith_translation TEXT,
    hadith_narrator TEXT,
    hadith_source TEXT,
    hadith_status TEXT,
    scholar_name TEXT,
    scholar_quote TEXT,
    scholar_book TEXT,
    life_application JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_takeaways JSONB NOT NULL DEFAULT '[]'::jsonb,
    reflection_exercise TEXT,
    summary TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 6. TABEL: module_references (Daftar Kitab dan Rujukan Ilmiah)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.module_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_day INT NOT NULL REFERENCES public.learning_modules(day_number) ON DELETE CASCADE,
    book_title TEXT NOT NULL,
    author TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 7. TABEL: enrollments (Pendaftaran Program Peserta)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    program_name TEXT NOT NULL DEFAULT 'Bimbingan Belajar Islam Terstruktur 90 Hari',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT NOT NULL CHECK (status IN ('aktif', 'lulus', 'cuti', 'nonaktif')) DEFAULT 'aktif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 8. TABEL: learning_progress (Progres Harian Peserta)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 90),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    CONSTRAINT unique_user_day_progress UNIQUE (user_id, day_number)
);

-- ------------------------------------------------------------------------
-- 9. TABEL: assessments (Daftar Evaluasi Harian, Bulanan, Akhir)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('harian', 'bulanan', 'akhir')),
    target_day_or_month INT,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    passing_score NUMERIC(5,2) NOT NULL DEFAULT 75.00,
    weight_percentage NUMERIC(5,2) NOT NULL DEFAULT 30.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 10. TABEL: questions (Bank Soal)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false', 'short_essay')),
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 11. TABEL: answer_options (Pilihan Jawaban Soal Pilihan Ganda)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.answer_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_index INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false
);

-- ------------------------------------------------------------------------
-- 12. TABEL: assessment_attempts (Riwayat Pengerjaan Evaluasi Peserta)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL DEFAULT 1,
    score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    is_passed BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 13. TABEL: student_answers (Detail Jawaban Peserta Per Soal)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    submitted_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    score_earned NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 14. TABEL: grades (Nilai Akhir Terkalkulasi Peserta)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    daily_average NUMERIC(5,2),
    monthly_average NUMERIC(5,2),
    final_exam_score NUMERIC(5,2),
    final_grade NUMERIC(5,2),
    predicate TEXT,
    is_passed BOOLEAN NOT NULL DEFAULT false,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 15. TABEL: remedial_requests (Pengajuan Evaluasi Susulan/Remedial)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.remedial_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('harian', 'bulanan', 'akhir')),
    target_label TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Selesai')) DEFAULT 'Menunggu Persetujuan',
    admin_notes TEXT,
    schedule_date DATE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 16. TABEL: transcripts (Data Transkrip Resmi yang Diterbitkan)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_number TEXT UNIQUE NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subject_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    overall_average NUMERIC(5,2) NOT NULL,
    completion_rate NUMERIC(5,2) NOT NULL,
    pass_status TEXT NOT NULL,
    signatory_name TEXT NOT NULL,
    signatory_title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 17. TABEL: certificates (Data Sertifikat Kelulusan Resmi)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    verified_code TEXT UNIQUE,
    verification_code TEXT UNIQUE,
    participant_name TEXT,
    student_name TEXT,
    student_number TEXT,
    program_name TEXT NOT NULL DEFAULT 'Bimbingan Belajar Islam Terstruktur 90 Hari',
    duration TEXT NOT NULL DEFAULT '90 Hari (3 Bulan Intensif)',
    completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    final_grade NUMERIC(5,2) NOT NULL,
    predicate TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Belum Memenuhi Syarat', 'Memenuhi Syarat, Menunggu Pengesahan', 'Sertifikat Diterbitkan')) DEFAULT 'Belum Memenuhi Syarat',
    issued_at TIMESTAMPTZ,
    revocation_reason TEXT,
    revoked_at TIMESTAMPTZ,
    revoked_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS verified_code TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS participant_name TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS student_number TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS revoked_by TEXT;

-- ------------------------------------------------------------------------
-- 18. TABEL: certificate_verifications (Log Verifikasi Publik Sertifikat)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificate_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number TEXT NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    is_valid BOOLEAN NOT NULL
);

-- ------------------------------------------------------------------------
-- 19. TABEL: announcements (Pengumuman & Pesan Motivasi)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Umum',
    is_active BOOLEAN NOT NULL DEFAULT true,
    source_reference TEXT,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Umum';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ------------------------------------------------------------------------
-- 20. TABEL: audit_logs (Pencatatan Perubahan Sensitif Nilai & Sertifikat)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT,
    action_type TEXT DEFAULT 'CERTIFICATE_AUDIT',
    entity_type TEXT DEFAULT 'certificates',
    entity_id TEXT,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'certificates';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_id TEXT;

-- ------------------------------------------------------------------------
-- 21. TABEL: portal_cms_state (Sinkronisasi CMS Kurikulum, Modul, Soal, Pengaturan)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_cms_state (
    id TEXT PRIMARY KEY DEFAULT 'default',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 22. TABEL: student_progress_snapshots (Progres, Evaluasi, Esai & Susulan Lengkap)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_progress_snapshots (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- KEBIJAKAN ROW LEVEL SECURITY (RLS)
-- ========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remedial_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_cms_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy helper: Is Administrator?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy helper: Is Teacher or Admin?
CREATE OR REPLACE FUNCTION public.is_teacher_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'pengajar')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles RLS
DROP POLICY IF EXISTS "Peserta dapat melihat profil miliknya sendiri" ON public.profiles;
CREATE POLICY "Peserta dapat melihat profil miliknya sendiri"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_teacher_or_admin());

DROP POLICY IF EXISTS "Peserta membuat profil miliknya saat daftar" ON public.profiles;
CREATE POLICY "Peserta membuat profil miliknya saat daftar"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Peserta memperbarui profil miliknya sendiri" ON public.profiles;
CREATE POLICY "Peserta memperbarui profil miliknya sendiri"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admin dapat mengelola seluruh profil" ON public.profiles;
CREATE POLICY "Admin dapat mengelola seluruh profil"
    ON public.profiles FOR DELETE
    USING (public.is_admin());

-- 2. Master Kurikulum & CMS State RLS
DROP POLICY IF EXISTS "Publik membaca subjects" ON public.subjects;
CREATE POLICY "Publik membaca subjects" ON public.subjects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pengelola mengelola subjects" ON public.subjects;
CREATE POLICY "Pengelola mengelola subjects" ON public.subjects FOR ALL USING (public.is_teacher_or_admin());

DROP POLICY IF EXISTS "Publik membaca syllabus" ON public.syllabus;
CREATE POLICY "Publik membaca syllabus" ON public.syllabus FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pengelola mengelola syllabus" ON public.syllabus;
CREATE POLICY "Pengelola mengelola syllabus" ON public.syllabus FOR ALL USING (public.is_teacher_or_admin());

DROP POLICY IF EXISTS "Publik membaca modules" ON public.learning_modules;
CREATE POLICY "Publik membaca modules" ON public.learning_modules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pengelola mengelola modules" ON public.learning_modules;
CREATE POLICY "Pengelola mengelola modules" ON public.learning_modules FOR ALL USING (public.is_teacher_or_admin());

DROP POLICY IF EXISTS "Publik membaca announcements" ON public.announcements;
CREATE POLICY "Publik membaca announcements" ON public.announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pengelola mengelola announcements" ON public.announcements;
CREATE POLICY "Pengelola mengelola announcements" ON public.announcements FOR ALL USING (public.is_teacher_or_admin());

DROP POLICY IF EXISTS "Publik membaca portal_cms_state" ON public.portal_cms_state;
CREATE POLICY "Publik membaca portal_cms_state" ON public.portal_cms_state FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pengelola memperbarui portal_cms_state" ON public.portal_cms_state;
CREATE POLICY "Pengelola memperbarui portal_cms_state" ON public.portal_cms_state FOR ALL USING (public.is_teacher_or_admin());

-- 3. Learning Progress & Snapshots RLS
DROP POLICY IF EXISTS "Peserta hanya dapat melihat dan memperbarui progresnya sendiri" ON public.learning_progress;
CREATE POLICY "Peserta hanya dapat melihat dan memperbarui progresnya sendiri"
    ON public.learning_progress FOR ALL
    USING (auth.uid() = user_id OR public.is_teacher_or_admin());

DROP POLICY IF EXISTS "Peserta mengelola snapshot progres miliknya" ON public.student_progress_snapshots;
CREATE POLICY "Peserta mengelola snapshot progres miliknya"
    ON public.student_progress_snapshots FOR ALL
    USING (auth.uid() = user_id OR public.is_teacher_or_admin());

-- 4. Assessment Attempts & Student Answers RLS
DROP POLICY IF EXISTS "Peserta hanya melihat hasil evaluasi miliknya" ON public.assessment_attempts;
CREATE POLICY "Peserta hanya melihat hasil evaluasi miliknya"
    ON public.assessment_attempts FOR SELECT
    USING (auth.uid() = user_id OR public.is_teacher_or_admin());

DROP POLICY IF EXISTS "Peserta memasukkan jawaban miliknya" ON public.assessment_attempts;
CREATE POLICY "Peserta memasukkan jawaban miliknya"
    ON public.assessment_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pengajar dan Admin dapat menilai jawaban" ON public.assessment_attempts;
CREATE POLICY "Pengajar dan Admin dapat menilai jawaban"
    ON public.assessment_attempts FOR UPDATE
    USING (public.is_teacher_or_admin());

-- 5. Remedial Requests RLS
DROP POLICY IF EXISTS "Peserta melihat permohonan susulan miliknya" ON public.remedial_requests;
CREATE POLICY "Peserta melihat permohonan susulan miliknya"
    ON public.remedial_requests FOR SELECT
    USING (auth.uid() = user_id OR public.is_teacher_or_admin());

DROP POLICY IF EXISTS "Peserta mengajukan permohonan susulan" ON public.remedial_requests;
CREATE POLICY "Peserta mengajukan permohonan susulan"
    ON public.remedial_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin menyetujui atau menolak susulan" ON public.remedial_requests;
CREATE POLICY "Admin menyetujui atau menolak susulan"
    ON public.remedial_requests FOR UPDATE
    USING (public.is_teacher_or_admin());

-- 6. Grades RLS
DROP POLICY IF EXISTS "Peserta melihat transkrip dan nilai miliknya" ON public.grades;
CREATE POLICY "Peserta melihat transkrip dan nilai miliknya"
    ON public.grades FOR SELECT
    USING (auth.uid() = user_id OR public.is_teacher_or_admin());

DROP POLICY IF EXISTS "Hanya Admin yang dapat mengkalkulasi atau mengoreksi nilai" ON public.grades;
CREATE POLICY "Hanya Admin yang dapat mengkalkulasi atau mengoreksi nilai"
    ON public.grades FOR ALL
    USING (public.is_admin());

-- 7. Certificates RLS
DROP POLICY IF EXISTS "Sertifikat publik dapat diverifikasi oleh siapa saja berdasarkan kode" ON public.certificates;
CREATE POLICY "Sertifikat publik dapat diverifikasi oleh siapa saja berdasarkan kode"
    ON public.certificates FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Peserta atau pengelola dapat menerbitkan sertifikat" ON public.certificates;
DROP POLICY IF EXISTS "Hanya Admin yang dapat menerbitkan atau mencabut sertifikat" ON public.certificates;
CREATE POLICY "Peserta atau pengelola dapat menerbitkan sertifikat"
    ON public.certificates FOR ALL
    USING (auth.uid() = user_id OR public.is_teacher_or_admin());

-- 8. Audit Logs RLS
DROP POLICY IF EXISTS "Hanya Admin yang dapat mengakses audit log" ON public.audit_logs;
CREATE POLICY "Hanya Admin yang dapat mengakses audit log"
    ON public.audit_logs FOR SELECT
    USING (public.is_teacher_or_admin());

DROP POLICY IF EXISTS "Pengguna terautentikasi mencatat audit log" ON public.audit_logs;
CREATE POLICY "Pengguna terautentikasi mencatat audit log"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- CATATAN PENTING SETELAH MENJALANKAN SQL INI:
-- Untuk menjadikan akun Anda sebagai Administrator Perdana setelah mendaftar di website,
-- jalankan perintah berikut di SQL Editor dengan email Anda:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'email_admin_anda@gmail.com';

-- Selesai Skrip Skema Database
