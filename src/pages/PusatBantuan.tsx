import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { normalizeWhatsappPhone } from '../lib/whatsappReminder';
import { HelpCircle, BookOpen, MessageCircle, ChevronDown, Mail, ExternalLink } from 'lucide-react';

export const PusatBantuan: React.FC = () => {
  const { systemSettings } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const defaultFaqs = [
    {
      id: 'faq_1',
      q: 'Apa itu Akademik Healing Qur’ani dan bagaimana metode belajarnya?',
      a: 'Akademik Healing Qur’ani adalah platform bimbingan belajar Islam terstruktur selama 90 hari. Menggabungkan kajian keilmuan syar’i (Al-Qur’an, Hadis, Fikih, Sirah, Tafsir, Muamalah, Tazkiyatun Nafs) dengan pembinaan hati agar setiap ilmu yang dipelajari bermuara pada ketenangan jiwa dan pengamalan nyata.'
    },
    {
      id: 'faq_2',
      q: 'Bagaimana jadwal pembukaan materi harian pukul 00.00 WIB bekerja?',
      a: `Setiap hari pembelajaran baru dibuka secara otomatis pada pukul ${systemSettings.unlockTimeWIB || '00.00'} WIB sesuai tanggal mulai belajar peserta. Materi hari mendatang tetap terkunci sebelum waktunya agar peserta mempelajari modul secara bertahap dan istiqamah.`
    },
    {
      id: 'faq_3',
      q: 'Bagaimana sistem evaluasi dan aturan poin setiap soal (Harian, Pekanan, Bulanan, Akhir)?',
      a: `Terdapat 4 tingkat evaluasi: Evaluasi Harian (${systemSettings.weights.daily}%), Evaluasi Pekanan (13 pekan pemantapan), Evaluasi Bulanan (${systemSettings.weights.monthly}%), dan Evaluasi Akhir (${systemSettings.weights.final}%). Setiap soal pilihan ganda (A, B, C, D) memiliki aturan: Jawaban Benar bernilai 2 poin dan Jawaban Salah bernilai 1 poin. Batas kelulusan minimal adalah ${systemSettings.passingGrade}%.`
    },
    {
      id: 'faq_4',
      q: 'Kapan sertifikat penyelesaian dapat diterbitkan?',
      a: `Sertifikat resmi dapat diterbitkan apabila peserta telah terdaftar resmi, menuntaskan minimal ${systemSettings.minCompletionRate}% dari 90 materi harian, menyelesaikan Evaluasi Bulanan (1–3) dan Evaluasi Akhir, serta meraih nilai akhir minimal ${systemSettings.passingGrade}%.`
    },
    {
      id: 'faq_5',
      q: 'Apa yang harus dilakukan jika berhalangan mengikuti evaluasi tepat waktu?',
      a: 'Peserta dapat mengajukan Evaluasi Susulan melalui menu Evaluasi > Evaluasi Susulan dengan menyertakan alasan yang jelas. Pengelola akademik akan meninjau dan memproses persetujuan permohonan Anda.'
    }
  ];

  const faqs =
    systemSettings.customFaqs && systemSettings.customFaqs.length > 0
      ? systemSettings.customFaqs
      : defaultFaqs;

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Pusat Bantuan & Panduan Belajar
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Temukan jawaban atas pertanyaan umum seputar program pembelajaran 90 hari, ketentuan evaluasi poin, jadwal 00.00 WIB, dan layanan pendampingan peserta.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-2xl border border-emerald-900/15 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Pertanyaan Sering Diajukan (FAQ)</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-900 hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200/60">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact & Support Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-emerald-900/15 p-5 shadow-2xs space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <MessageCircle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Konsultasi Belajar & Bimbingan</h3>
          <p className="text-xs text-slate-600">
            Hubungi asisten akademik dan tim pengajar untuk konsultasi pemahaman materi atau kendala belajar.
          </p>
          <a
            href={`https://wa.me/${normalizeWhatsappPhone(systemSettings.academyWhatsappNumber || '6281234567890')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors"
          >
            <span>Hubungi WhatsApp Akademik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-white rounded-xl border border-emerald-900/15 p-5 shadow-2xs space-y-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Mail className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Sekretariat Akademik</h3>
          <p className="text-xs text-slate-600">
            Pertanyaan seputar legalitas transkrip, sertifikat kelulusan, dan administrasi pendaftaran.
          </p>
          <a
            href={`mailto:${systemSettings.contactEmail || 'akademik@healingqurani.id'}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors"
          >
            <span>Kirim Email ke Sekretariat</span>
            <Mail className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
