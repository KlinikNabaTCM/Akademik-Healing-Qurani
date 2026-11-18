export type UserRole = 'peserta' | 'admin' | 'pengajar';

export type SubjectId =
  | 'alquran'
  | 'hadis'
  | 'fikih'
  | 'sirah'
  | 'tafsir'
  | 'muamalah'
  | 'tazkiyatun_nafs'
  | (string & {});

export interface WhatsAppReminderSettings {
  enabled: boolean;
  autoSendOnUnlock?: boolean;
  wisdomReminderEnabled?: boolean;
  preferredTimeWIB: string;
  wisdomTimeWIB?: string;
  remindUnreadOnly: boolean;
  remindEvaluationDue: boolean;
  browserNotificationEnabled?: boolean;
  lastSentDateWIB?: string;
  lastSentDay?: number;
  lastUnlockSentDateWIB?: string;
  lastUnlockSentDay?: number;
  lastWisdomSentDateWIB?: string;
  lastWisdomSentDay?: number;
  lastStatus?: 'terkirim_gateway' | 'dibuka_wa' | 'gagal';
  lastAttemptAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
  avatar: string;
  role: UserRole;
  registrationDate: string;
  targetDate: string;
  phone: string;
  city: string;
  isGuest?: boolean;
  whatsappReminder?: WhatsAppReminderSettings;
}

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  arabicName: string;
  tagline: string;
  description: string;
  totalDays: number;
  goals: string[];
  competencies: string[];
  references: string[];
  colorTheme: {
    bg: string;
    text: string;
    border: string;
    badge: string;
  };
}

export interface LearningModule {
  day: number;
  title: string;
  subjectId: SubjectId;
  month: 1 | 2 | 3;
  learningGoal: string;
  indicators: string[];
  competence: string;
  introduction: string;
  contentSections: {
    heading: string;
    body: string;
  }[];
  quranVerse?: {
    arabic: string;
    latin?: string;
    translation: string;
    surah: string;
    ayah: string;
  };
  hadith?: {
    arabic?: string;
    translation: string;
    narrator: string;
    source: string;
    status: string;
  };
  scholarNote?: {
    scholar: string;
    quote: string;
    book: string;
  };
  lifeApplication: string[];
  keyTakeaways: string[];
  reflectionExercise: string;
  summary: string;
  references: string[];
  quiz: QuizQuestion[];
  videoLectureUrl?: string;
  audioRecitationUrl?: string;
  pdfResourceTitle?: string;
  isPublished?: boolean;
  lastModifiedBy?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false' | 'short_essay';
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  points?: number;
}

export interface SyllabusRow {
  no: number;
  day: number;
  subjectId: SubjectId;
  topic: string;
  indicator: string;
  competence: string;
  notes: string;
}

export interface DailyQuizResult {
  score: number;
  earnedPoints?: number;
  maxPoints?: number;
  completedAt: string;
  answers: Record<string, any>;
  reflectionSubmission?: string;
  essayReview?: {
    score: number;
    feedback: string;
    reviewedBy: string;
    reviewedAt?: string;
  };
}

export interface WeeklyAssessmentResult {
  week: number;
  score: number;
  earnedPoints?: number;
  maxPoints?: number;
  passed: boolean;
  submittedAt: string;
}

export interface MonthlyAssessmentResult {
  month: 1 | 2 | 3;
  score: number;
  earnedPoints?: number;
  maxPoints?: number;
  passed: boolean;
  submittedAt: string;
}

export interface FinalAssessmentResult {
  score: number;
  earnedPoints?: number;
  maxPoints?: number;
  passed: boolean;
  submittedAt: string;
  subjectScores: Record<SubjectId, number>;
}

export interface RemedialRequest {
  id: string;
  participantId: string;
  participantName: string;
  assessmentType: 'harian' | 'pekanan' | 'bulanan' | 'akhir';
  targetLabel: string;
  reason: string;
  submittedAt: string;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Selesai';
  adminNotes?: string;
  scheduleDate?: string;
}

export interface UserProgress {
  completedDays: number[];
  lastAccessedDay: number;
  dailyResults: Record<number, DailyQuizResult>;
  weeklyResults?: Record<number, WeeklyAssessmentResult>;
  monthlyResults: Record<number, MonthlyAssessmentResult>;
  finalResult?: FinalAssessmentResult;
  remedialRequests: RemedialRequest[];
}

export interface AcademicAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'Jadwal' | 'Evaluasi' | 'Kajian' | 'Umum';
  publishedAt: string;
  author: string;
  isActive: boolean;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface ComprehensiveAssessment {
  id: string;
  title: string;
  type: 'pekanan' | 'bulanan' | 'akhir';
  week?: number;
  month?: 1 | 2 | 3;
  dayRange?: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  questions: (QuizQuestion & { subjectId?: SubjectId })[];
}

export interface SystemSettings {
  weights: {
    daily: number;
    monthly: number;
    final: number;
  };
  passingGrade: number;
  minCompletionRate: number;
  allowSelfRegistration: boolean;
  motivationQuote: {
    text: string;
    source: string;
  };
  signatoryName: string;
  signatoryTitle: string;
  institutionName: string;
  logoUrl?: string;
  dailyUnlockScheduleEnabled?: boolean;
  unlockTimeWIB?: string;
  allowTeacherPreviewAllDays?: boolean;
  academyWhatsappNumber?: string;
  contactEmail?: string;
  customFaqs?: FaqItem[];
  customDailyWisdoms?: Record<number, { quote: string; source: string; practice: string }>;
  announcements?: AcademicAnnouncement[];
}

export interface CertificateAuditLog {
  id: string;
  action: 'TERBIT' | 'CABUT' | 'PULIHKAN';
  certificateNumber: string;
  participantId: string;
  participantName: string;
  reason?: string;
  executedBy: string;
  timestamp: string;
}

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  participantId: string;
  participantName: string;
  studentNumber: string;
  programName: string;
  duration: string;
  completionDate: string;
  finalGrade: number;
  predicate: string;
  status: 'Belum Memenuhi Syarat' | 'Memenuhi Syarat, Menunggu Pengesahan' | 'Sertifikat Diterbitkan';
  verifiedCode: string;
  issuedAt?: string;
  revocationReason?: string;
  revokedAt?: string;
  revokedBy?: string;
}
