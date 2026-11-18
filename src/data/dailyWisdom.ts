export interface DailyWisdomEntry {
  day: number;
  quote: string;
  source: string;
  practice: string;
}

const CURATED_WISDOM_ENTRIES: Array<{
  quote: string;
  source: string;
  practice: string;
}> = [
  {
    quote: 'Ilmu yang bermanfaat bukan sekadar yang banyak dihafal, melainkan yang menumbuhkan rasa takut kepada Allah dan ketenangan dalam jiwa.',
    source: 'Imam Malik bin Anas rahimahullah',
    practice: 'Bacalah Al-Qur’an minimal 1 halaman hari ini dengan menghadirkan niat mencari ketenangan dari Allah.'
  },
  {
    quote: 'Sesungguhnya Allah tidak melihat kepada rupa dan harta kalian, tetapi Dia melihat kepada hati dan amal kalian.',
    source: 'HR. Muslim no. 2564',
    practice: 'Periksa kembali niat seluruh aktivitas hari ini agar semata-mata mengharap ridha Allah.'
  },
  {
    quote: 'Barang siapa memperbaiki hubungannya dengan Allah, maka Allah akan memperbaiki hubungannya dengan sesama manusia.',
    source: 'Sufyan bin Uyainah rahimahullah',
    practice: 'Jaga shalat tepat waktu di awal waktu dan doakan kebaikan bagi orang tua serta saudara seiman.'
  },
  {
    quote: 'Al-Qur’an adalah penyembuh paling sempurna bagi luka batin; tidaklah hati yang jujur berobat dengannya melainkan akan lapang.',
    source: 'Imam Ibnu Qayyim al-Jauziyyah — Zadul Ma’ad',
    practice: 'Luangkan 10 menit setelah subuh atau maghrib untuk membaca terjemahan ayat materi hari ini.'
  },
  {
    quote: 'Kesabaran itu bukan sekadar menahan keluh kesah, tetapi meyakini bahwa pilihan Allah selalu lebih baik dari dugaan kita.',
    source: 'Umar bin Khattab radhiyallahu ‘anhu',
    practice: 'Latih lisan untuk mengucapkan Alhamdulillah ‘ala kulli hal ketika menghadapi hal yang kurang disukai.'
  },
  {
    quote: 'Dua nikmat yang sering dilalaikan manusia adalah nikmat sehat dan waktu luang.',
    source: 'HR. Al-Bukhari no. 6412',
    practice: 'Manfaatkan 20 menit waktu luang hari ini untuk menuntaskan modul dan mencatat refleksi jiwa.'
  },
  {
    quote: 'Amal yang paling dicintai oleh Allah adalah amal yang dikerjakan secara konsisten (istiqamah) meskipun sedikit.',
    source: 'HR. Al-Bukhari no. 6464 & Muslim no. 783',
    practice: 'Tetapkan satu amalan ringan harian yang tidak boleh terlewat selama 90 hari program.'
  },
  {
    quote: 'Jika dunia terasa sempit oleh kecemasan, luaskanlah ia dengan istighfar dan sujud yang panjang.',
    source: 'Imam Hasan Al-Bashri rahimahullah',
    practice: 'Perbanyak istighfar 100 kali sepanjang hari ini dengan hati yang merendah.'
  },
  {
    quote: 'Hati yang paling jauh dari Allah adalah hati yang keras karena jarang tersentuh dzikir dan ayat-ayat-Nya.',
    source: 'Fudhail bin Iyadh rahimahullah',
    practice: 'Dengarkan tilawah murottal dengan penuh penghayatan selama 10 menit sebelum tidur.'
  },
  {
    quote: 'Sungguh menakjubkan urusan seorang mukmin: seluruh urusannya baik baginya — jika mendapat nikmat ia bersyukur, jika ditimpa ujian ia bersabar.',
    source: 'HR. Muslim no. 2999',
    practice: 'Tuliskan 3 nikmat Allah yang Anda rasakan sejak bangun tidur pagi ini.'
  },
  {
    quote: 'Barang siapa yang memudahkan urusan orang lain yang sedang kesulitan, Allah akan memudahkan urusannya di dunia dan akhirat.',
    source: 'HR. Muslim no. 2699',
    practice: 'Cari satu kesempatan hari ini untuk membantu keluarga, rekan, atau tetangga tanpa menunggu diminta.'
  },
  {
    quote: 'Rasa syukur menjaga nikmat yang sudah ada dan mengikat datangnya nikmat yang belum diraih.',
    source: 'Umar bin Abdul Aziz rahimahullah',
    practice: 'Ucapkan terima kasih kepada orang yang berbuat baik kepada Anda hari ini sebagai wujud syukur kepada Allah.'
  },
  {
    quote: 'Lidah yang terbiasa berdzikir akan melembutkan ucapan dan mencegah luka pada hati sesama muslim.',
    source: 'Imam An-Nawawi — Al-Adzkar',
    practice: 'Tahan diri dari ucapan yang sia-sia atau mengkritik; ganti dengan kalimat thayyibah.'
  },
  {
    quote: 'Ketenangan jiwa berawal dari menerima takdir yang telah berlalu dan bersungguh-sungguh memperbaiki hari ini.',
    source: 'Syaikh Abdurrahman As-Sa’di rahimahullah',
    practice: 'Lepaskan penyesalan masa lalu dengan doa: Hasbunallahu wa ni’mal wakil.'
  },
  {
    quote: 'Tidaklah seorang hamba berdoa dengan hati yang hadir dan yakin dikabulkan melainkan Allah membukakan baginya pintu rahmat.',
    source: 'HR. At-Tirmidzi no. 3479',
    practice: 'Luangkan waktu antara adzan dan iqamah untuk memanjatkan doa terbaik bagi keluarga dan ketenangan hati.'
  },
  {
    quote: 'Sebagaimana tubuh membutuhkan asupan setiap hari, ruh juga membutuhkan siraman wahyu agar tidak layu oleh kesibukan dunia.',
    source: 'Imam Al-Ghazali — Ihya Ulumiddin',
    practice: 'Jangan buka media sosial sebelum membaca minimal 5 ayat Al-Qur’an beserta artinya.'
  },
  {
    quote: 'Memaafkan adalah tanda kelapangan dada dan jalan tercepat menuju ketenangan batin yang sejati.',
    source: 'Inspirasi QS. Asy-Syura: 40',
    practice: 'Maafkan satu kesalahan orang lain di dalam hati agar tidur malam ini terasa lebih ringan.'
  },
  {
    quote: 'Jangan remehkan kebaikan sekecil apa pun, walaupun hanya menyambut saudaramu dengan wajah yang ramah dan berseri.',
    source: 'HR. Muslim no. 2626',
    practice: 'Berikan senyuman tulus dan salam hangat kepada keluarga maupun orang yang Anda temui hari ini.'
  },
  {
    quote: 'Orang yang kuat bukanlah yang pandai bergulat, melainkan orang yang mampu mengendalikan dirinya saat marah.',
    source: 'HR. Al-Bukhari no. 6114',
    practice: 'Saat emosi mulai naik hari ini, diamlah sejenak, baca Ta’awudz, lalu ubah posisi atau berwudhu.'
  },
  {
    quote: 'Waktu adalah modal utama seorang penuntut ilmu; setiap hari yang terlewati tanpa tambahan iman adalah kerugian yang nyata.',
    source: 'Imam Ibnul Jauzi — Shaidul Khatir',
    practice: 'Pastikan satu pelajaran harian tuntas hari ini sebelum malam berakhir.'
  },
  {
    quote: 'Keikhlasan adalah rahasia antara seorang hamba dengan Rabb-nya; semakin tersembunyi amalmu, semakin bersih nilainya.',
    source: 'Imam Asy-Syafi’i rahimahullah',
    practice: 'Lakukan satu sedekah atau kebaikan hari ini yang tidak diketahui seorang pun kecuali Allah.'
  },
  {
    quote: 'Di balik setiap kesulitan selalu Allah sertakan dua kemudahan; jangan pernah berputus asa dari rahmat-Nya.',
    source: 'Inspirasi QS. Al-Insyirah: 5–6',
    practice: 'Bacalah Surat Al-Insyirah saat dada terasa sesak dan renungi janji kemudahan dari Allah.'
  },
  {
    quote: 'Kebersihan hati dari hasad dan dendam adalah sebab utama seseorang dianugerahi ketenteraman hidup sebelum surga.',
    source: 'Imam Ibnu Rajab al-Hanbali rahimahullah',
    practice: 'Doakan kebaikan dan keberkahan rezeki bagi orang yang pernah membuat hati Anda iri.'
  },
  {
    quote: 'Tawakal bukan berarti berhenti berusaha, melainkan menyerahkan hasil setelah ikhtiar terbaik dilakukan.',
    source: 'HR. At-Tirmidzi no. 2344',
    practice: 'Kerjakan tugas hari ini dengan maksimal, lalu serahkan hasilnya sepenuhnya kepada Allah.'
  },
  {
    quote: 'Kedekatan kepada Allah tidak diukur oleh cepatnya langkah, melainkan oleh ketulusan untuk terus melangkah dan kembali kepada-Nya.',
    source: 'Imam Ahmad bin Hanbal rahimahullah',
    practice: 'Evaluasi shalat sunnah rawatib hari ini dan usahakan menambah 2 rakaat Dhuha.'
  },
  {
    quote: 'Setiap ayat yang dibaca dengan tadabur adalah benih cahaya yang akan menerangi akal ketika mengambil keputusan.',
    source: 'Syaikh Muhammad bin Shalih Al-Utsaimin rahimahullah',
    practice: 'Catat satu poin hikmah paling mengena dari modul hari ini pada jurnal refleksi Anda.'
  },
  {
    quote: 'Kesederhanaan dan sifat qana’ah (merasa cukup) adalah kekayaan batin yang tidak pernah habis.',
    source: 'HR. Al-Bukhari no. 6446 & Muslim no. 1054',
    practice: 'Hindari membandingkan nikmat diri dengan orang lain; fokuslah mensyukuri kecukupan hari ini.'
  },
  {
    quote: 'Jangan menunda taubat dan amal shalih hingga esok, karena kita tidak pernah tahu apakah esok masih menjadi milik kita.',
    source: 'Abdullah bin Umar radhiyallahu ‘anhuma',
    practice: 'Tunaikan hak orang lain atau minta maaf lebih dahulu jika ada janji yang tertunda.'
  },
  {
    quote: 'Shalat malam adalah kemuliaan seorang mukmin sekaligus sumber kekuatan ruhani menghadapi beratnya amanah siang hari.',
    source: 'HR. Ath-Thabrani (Shahih)',
    practice: 'Niatkan sebelum tidur untuk bangun 15 menit lebih awal sebelum subuh demi dua rakaat tahajud.'
  },
  {
    quote: 'Tiga puluh hari pertama mengajarkan kita fondasi ilmu; menjaga konsistensi pada pekan-pekan berikutnya akan membentuk karakter sejati.',
    source: 'Hikmah Tarbiyah Akademik Healing Qur’ani',
    practice: 'Rayakan konsistensi belajar Anda dengan menuntaskan refleksi harian dan evaluasi pekanan dengan jujur.'
  },
  {
    quote: 'Akhlak mulia adalah buah dari ilmu yang benar; bila ilmu tidak melembutkan perangai, periksalah kembali niat belajar kita.',
    source: 'Imam Ibnul Mubarak rahimahullah',
    practice: 'Berbicaralah dengan nada paling santun kepada pasangan, anak, atau orang tua hari ini.'
  },
  {
    quote: 'Barang siapa memperbanyak shalawat kepada Nabi ﷺ, Allah akan mencukupi kegelisahannya dan mengampuni dosanya.',
    source: 'HR. At-Tirmidzi no. 2457',
    practice: 'Ucapkan shalawat Nabi minimal 50 kali di sela-sela aktivitas pagi hingga sore.'
  },
  {
    quote: 'Lingkungan yang baik dan sahabat yang shalih adalah penolong terkuat bagi seseorang untuk tetap berada di jalan ketaatan.',
    source: 'HR. Abu Dawud no. 4833',
    practice: 'Sapa seorang teman atau saudara seiman dan saling berbagi satu faedah ilmu hari ini.'
  },
  {
    quote: 'Sesungguhnya bersama rasa lapar, lelah, atau sedih seorang mukmin, Allah sedang menggugurkan dosa-dosanya jika ia bersabar.',
    source: 'HR. Al-Bukhari no. 5641',
    practice: 'Ubah keluhan menjadi dzikir La haula wa la quwwata illa billah.'
  },
  {
    quote: 'Menuntut ilmu syar’i adalah ibadah sepanjang hayat; ia memuliakan pemiliknya di dunia dan mengangkat derajatnya di akhirat.',
    source: 'Mu’adz bin Jabal radhiyallahu ‘anhu',
    practice: 'Sampaikan satu pelajaran bermanfaat yang Anda pelajari hari ini kepada anggota keluarga.'
  },
  {
    quote: 'Kualitas hati seorang hamba tampak pada keadaannya saat sendirian; perbanyaklah rasa muraqabah (merasa diawasi Allah).',
    source: 'Imam Ibnu Katsir — Tafsir Al-Qur’an al-’Azhim',
    practice: 'Jaga pandangan dan jemari dari konten yang melalaikan ketika sedang sendirian.'
  },
  {
    quote: 'Jangan bosan berdoa meski jawaban terasa lambat; boleh jadi Allah sedang menyiapkan kekuatan hati agar kamu siap menerimanya.',
    source: 'Ibnu Atha’illah As-Sakandari — Al-Hikam',
    practice: 'Perpanjang sujud terakhir dalam shalat fardhu dengan satu doa khusus yang paling Anda harapkan.'
  },
  {
    quote: 'Rezeki yang paling utama bukanlah harta yang melimpah, melainkan hati yang lapang, iman yang kokoh, dan keluarga yang sakinah.',
    source: 'Mutiara Hikmah Salafus Shalih',
    practice: 'Doakan kebaikan dan kelembutan hati bagi seluruh anggota keluarga Anda.'
  },
  {
    quote: 'Siapa yang menjaga dzikir pagi dan petang, Allah akan menjaganya dari keburukan makhluk serta menenangkan hatinya sepanjang hari.',
    source: 'Imam Ibnul Qayyim — Al-Wabilush Shayyib',
    practice: 'Amalkan dzikir pagi (minimal Ayat Kursi dan Al-Mu’awwidzat) tepat setelah membaca pesan ini.'
  },
  {
    quote: 'Kesuksesan sejati dalam belajar Qur’ani bukan hanya nilai sempurna di transkrip, melainkan berubahnya cara kita merespons ujian hidup.',
    source: 'Hikmah Tarbiyah Akademik Healing Qur’ani',
    practice: 'Review kembali catatan refleksi jiwa Anda pada bulan pertama untuk melihat perubahan batin Anda.'
  },
  {
    quote: 'Kejujuran membawa kepada kebaikan, dan kebaikan menuntun seorang hamba menuju ketenteraman hati dan surga.',
    source: 'HR. Al-Bukhari no. 6094 & Muslim no. 2607',
    practice: 'Jaga amanah pekerjaan dan janji lisan Anda secara penuh hari ini.'
  },
  {
    quote: 'Jika engkau ingin hatimu lembut dan urusanmu mudah, usaplah kepala anak yatim dan beri makan orang yang membutuhkan.',
    source: 'HR. Ahmad (Hasan)',
    practice: 'Sisihkan sebagian rezeki hari ini untuk berbagi kepada kerabat atau kaum dhuafa.'
  },
  {
    quote: 'Kerendahan hati (tawadhu) tidak pernah mengurangi martabat seorang pun; Allah justru meninggikan orang yang merendahkan diri karena-Nya.',
    source: 'HR. Muslim no. 2588',
    practice: 'Dengarkan pendapat orang lain dengan penuh perhatian tanpa memotong pembicaraan.'
  },
  {
    quote: 'Menangislah karena takut kepada Allah walau sejenak, karena tetesan air mata taubat mampu memadamkan panasnya gelisah.',
    source: 'HR. At-Tirmidzi no. 1639',
    practice: 'Renungi dosa-dosa kecil yang sering dianggap ringan, lalu mohon ampun dengan tulus.'
  },
  {
    quote: 'Pertengahan perjalanan adalah ujian kejenuhan; orang-orang besar bertahan bukan karena selalu bersemangat, tetapi karena mereka setia pada tujuan.',
    source: 'Hikmah Penuntut Ilmu',
    practice: 'Ingat kembali tujuan awal Anda mendaftar program 90 hari dan teruskan langkah hari ini.'
  }
];

/**
 * Menghasilkan Kata Hikmah unik dan otentik untuk setiap hari (Hari ke-1 s.d. Hari ke-90+),
 * dengan dukungan penyesuaian oleh Pengelola dari Dashboard.
 */
export function getDailyWisdomForDay(
  day: number,
  overrides?: Record<number, Partial<DailyWisdomEntry>>
): DailyWisdomEntry {
  const safeDay = Math.max(1, Math.floor(day));
  const override = overrides?.[safeDay];

  const baseIdx = (safeDay - 1) % CURATED_WISDOM_ENTRIES.length;
  const cycle = Math.floor((safeDay - 1) / CURATED_WISDOM_ENTRIES.length);
  const base = CURATED_WISDOM_ENTRIES[baseIdx];

  // Untuk siklus hari 46-90, beri penekanan kontekstual agar setiap hari tetap unik dan relevan
  const stageSuffix =
    cycle === 1
      ? ' (Penguatan Jiwa Fase Pertengahan–Pemantapan 90 Hari)'
      : cycle >= 2
      ? ' (Penyempurnaan Istiqamah Program)'
      : '';

  return {
    day: safeDay,
    quote: override?.quote?.trim() || base.quote,
    source:
      override?.source?.trim() ||
      (stageSuffix && !base.source.includes('Akademik Healing')
        ? `${base.source}${stageSuffix}`
        : base.source),
    practice: override?.practice?.trim() || base.practice
  };
}

export function buildUnlockedMaterialMessage(params: {
  participantName: string;
  day: number;
  moduleTitle: string;
  subjectName: string;
  learningGoal: string;
  quranRef?: string;
  includeEvaluationNote?: boolean;
  appUrl?: string;
}): string {
  const {
    participantName,
    day,
    moduleTitle,
    subjectName,
    learningGoal,
    quranRef,
    includeEvaluationNote = true,
    appUrl
  } = params;

  const lines = [
    `*Assalamu'alaikum warahmatullahi wabarakatuh,*`,
    `Sahabat penuntut ilmu *${participantName}*,`,
    '',
    `🔓 *Materi Terkunci Baru Saja Terbuka! — Hari ke-${day} / 90*`,
    `• *Mata Pelajaran:* ${subjectName}`,
    `• *Judul Materi:* ${moduleTitle}`,
    quranRef ? `• *Ayat Rujukan:* ${quranRef}` : '',
    `• *Tujuan Belajar:* ${learningGoal}`,
    includeEvaluationNote
      ? `• *Evaluasi:* Jangan lupa tuntaskan kuis harian (Benar = 2 poin, Salah = 1 poin) & tulis refleksi diri.`
      : '',
    '',
    appUrl ? `Buka materi Hari ke-${day} sekarang:\n${appUrl}` : '',
    '',
    `_Pesan ini terkirim otomatis berbarengan terbukanya materi harian Anda. Semoga Allah memberkahi waktu belajar Anda._`
  ];

  return lines
    .filter((line, idx, arr) => {
      if (line !== '') return true;
      return idx > 0 && arr[idx - 1] !== '';
    })
    .join('\n');
}

export function buildDailyWisdomMessage(params: {
  participantName: string;
  day: number;
  wisdom: DailyWisdomEntry;
  moduleTitle?: string;
  appUrl?: string;
}): string {
  const { participantName, day, wisdom, moduleTitle, appUrl } = params;

  const lines = [
    `*Assalamu'alaikum warahmatullahi wabarakatuh,*`,
    `Sahabat penuntut ilmu *${participantName}*,`,
    '',
    `🌿 *Pengingat hari ini — Kata Hikmah (Hari ke-${day} / 90)*`,
    `_"${wisdom.quote}"_`,
    `— ${wisdom.source}`,
    '',
    `✨ *Amalan Praktis Hari Ini:*`,
    `${wisdom.practice}`,
    moduleTitle ? `• *Materi Hari Ini:* ${moduleTitle}` : '',
    '',
    appUrl ? `Lanjutkan pembelajaran & refleksi Anda:\n${appUrl}` : '',
    '',
    `_Pengingat Kata Hikmah otomatis pukul 08.00 WIB · Akademik Healing Qur'ani._`
  ];

  return lines
    .filter((line, idx, arr) => {
      if (line !== '') return true;
      return idx > 0 && arr[idx - 1] !== '';
    })
    .join('\n');
}
