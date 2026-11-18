import { QuizQuestion, SubjectId, ComprehensiveAssessment } from '../types';
export type { ComprehensiveAssessment };

export const WEEKLY_ASSESSMENTS: Record<number, ComprehensiveAssessment> = {
  1: {
    id: 'eval_w1',
    title: 'Evaluasi Pekanan 1: Fondasi Kalamullah, Niat, Thaharah & Sirah Awal',
    type: 'pekanan',
    week: 1,
    month: 1,
    dayRange: 'Hari 1–7',
    description: 'Menguji pemahaman pekan pertama: Al-Qur’an sebagai Asy-Syifa, keikhlasan niat, fungsi As-Sunnah, thaharah air, sirah kelahiran Nabi ﷺ, Tafsir Al-Fatihah, dan filosofi harta.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew1_1',
        subjectId: 'alquran',
        question: 'Empat sifat Al-Qur’an yang Allah tegaskan dalam Surah Yunus ayat 57 adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Mau’izhah (pelajaran), Syifa’ (penyembuh dada), Huda (petunjuk), dan Rahmah',
          'Kisah dongeng, syair arab, ramalan bintang, dan hukum dagang',
          'Hanya kitab sejarah bangsa Arab dan hukum pidana',
          'Mantra pengobatan fisik tanpa nilai ibadah'
        ],
        correctAnswer: 0,
        explanation: 'Surah Yunus ayat 57 menegaskan Al-Qur’an sebagai pelajaran, obat penawar penyakit dada, petunjuk, dan rahmat bagi orang beriman.'
      },
      {
        id: 'ew1_2',
        subjectId: 'tazkiyatun_nafs',
        question: 'Menurut hadis Umar bin Khattab “Innamal a’malu bin niyyat”, penentu sah dan bernilainya suatu amal adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Besarnya biaya materi yang dikeluarkan',
          'Kemurnian niat di dalam hati semata karena Allah Ta’ala',
          'Banyaknya orang yang memuji dan menyaksikan ibadah tersebut',
          'Lamanya durasi pelaksanaan tanpa memperhatikan syariat'
        ],
        correctAnswer: 1,
        explanation: 'Niat membedakan adat dari ibadah serta menentukan apakah amal diterima oleh Allah atau tertolak karena riya.'
      },
      {
        id: 'ew1_3',
        subjectId: 'hadis',
        question: 'Dalam memahami Al-Qur’an, kedudukan As-Sunnah Nabawiyah berperan sebagai...',
        type: 'mcq',
        points: 2,
        options: [
          'Penjelas (bayan tafsir), penguat hukum (ta’kid), dan penetap hukum syar’i yang selaras wahyu',
          'Bacaan tambahan yang tidak wajib diikuti oleh umat Islam',
          'Pengganti seluruh ayat Al-Qur’an di zaman modern',
          'Sekadar catatan tradisi adat suku Quraisy'
        ],
        correctAnswer: 0,
        explanation: 'As-Sunnah berfungsi memerinci perintah global Al-Qur’an (seperti tata cara salat dan zakat) serta menguatkan pesan wahyu.'
      },
      {
        id: 'ew1_4',
        subjectId: 'fikih',
        question: 'Air yang berstatus thahir muthahhir (suci lagi mensucikan) untuk berwudu dan mandi wajib adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Air teh manis dan air kelapa kemasan',
          'Air yang telah berubah bau dan warnanya karena bercampur najis',
          'Air mutlak seperti air hujan, sumur, sungai, dan mata air yang tidak berubah sifatnya',
          'Air bekas cucian sabun yang pekat'
        ],
        correctAnswer: 2,
        explanation: 'Hanya air mutlak yang sah dipakai untuk mengangkat hadas kecil maupun hadas besar.'
      },
      {
        id: 'ew1_5',
        subjectId: 'muamalah',
        question: 'Prinsip dasar kepemilikan harta dalam pandangan syariat Islam adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Harta mutlak milik manusia sehingga bebas diperoleh dengan cara apa saja',
          'Harta merupakan amanah dan titipan Allah yang wajib dicari dari sumber halal serta dipertanggungjawabkan',
          'Orang beriman dilarang keras memiliki harta kekayaan dan berdagang',
          'Pertanggungjawaban harta hanya berlaku bagi pemimpin negara'
        ],
        correctAnswer: 1,
        explanation: 'Semua harta hakikatnya milik Allah; manusia diberi hak kelola yang akan diaudit dari mana diperoleh dan ke mana dibelanjakan.'
      }
    ]
  },
  2: {
    id: 'eval_w2',
    title: 'Evaluasi Pekanan 2: Adab Tilawah, Taubat, Wudu & Ayat Kursi',
    type: 'pekanan',
    week: 2,
    month: 1,
    dayRange: 'Hari 8–14',
    description: 'Menguji materi Hari 8–14: Adab tilawah, tiga pilar taubat nasuha, klasifikasi hadis, tata cara wudu sunnah, masa muda Al-Amin, Tafsir Ayat Kursi, dan rukun jual beli.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew2_1',
        subjectId: 'alquran',
        question: 'Membaca Al-Qur’an dengan perlahan, menjaga makhraj huruf dan hukum tajwid disertai perenungan disebut...',
        type: 'mcq',
        points: 2,
        options: ['Tartil', 'Tergesa-gesa (hadzramah)', 'Taghanni tanpa makna', 'Hafalan lisan semata'],
        correctAnswer: 0,
        explanation: 'Allah memerintahkan dalam QS. Al-Muzzammil: 4: "Wa rattilil Qur’ana tartila" (bacalah Al-Qur’an dengan tartil).'
      },
      {
        id: 'ew2_2',
        subjectId: 'tazkiyatun_nafs',
        question: 'Tiga syarat utama taubat nasuha atas dosa yang berkaitan dengan hak Allah Ta’ala adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Menyesali dosa, segera meninggalkannya, dan bertekad kuat tidak mengulanginya lagi',
          'Cukup membaca istighfar lisan walaupun masih terus bermaksiat',
          'Menyumbang harta hasil maksiat tanpa rasa penyesalan',
          'Menunggu hingga hari tua baru berhenti dari dosa'
        ],
        correctAnswer: 0,
        explanation: 'An-Nadam (penyesalan), Al-Iqli’ (berhenti seketika), dan Al-‘Azm (tekad tidak mengulang) adalah tiga rukun taubat nasuha.'
      },
      {
        id: 'ew2_3',
        subjectId: 'hadis',
        question: 'Lima syarat hadis sahih menurut ulama musthalah al-hadits meliputi sanad bersambung, perawi adil, dhabith, serta selamat dari...',
        type: 'mcq',
        points: 2,
        options: [
          'Syudzudz (kejanggalan) dan ‘illah (cacat tersembunyi)',
          'Kefasihan bahasa Arab dan panjangnya matan',
          'Riwayat dari sahabat senior',
          'Penulisan dalam kitab musnad'
        ],
        correctAnswer: 0,
        explanation: 'Hadis sahih harus memenuhi 5 syarat: ittishalus sanad, ‘adalah, dhabth, ‘adamus syudzudz, dan ‘adamul ‘illah.'
      },
      {
        id: 'ew2_4',
        subjectId: 'tafsir',
        question: 'Dua nama agung Allah pada pembuka Ayat Kursi (QS. Al-Baqarah: 255) yang menegaskan kesempurnaan hidup dan pemeliharaan makhluk adalah...',
        type: 'mcq',
        points: 2,
        options: ['Al-Hayyu Al-Qayyum', 'Al-Muntaqim Al-Jabbar', 'Al-Qabidh Al-Khafidh', 'Adh-Dharr Al-Mani’'],
        correctAnswer: 0,
        explanation: 'Al-Hayyu (Yang Maha Hidup kekal) dan Al-Qayyum (Yang terus-menerus mengurus makhluk-Nya) adalah poros keagungan Ayat Kursi.'
      },
      {
        id: 'ew2_5',
        subjectId: 'muamalah',
        question: 'Asas kerelaan dua belah pihak dalam transaksi jual beli sesuai QS. An-Nisa: 29 disebut...',
        type: 'mcq',
        points: 2,
        options: ['‘An Taradhin (saling rida tanpa paksaan atau penipuan)', 'Ihtikar (penimbunan)', 'Najasy (rekayasa harga)', 'Tadlis (penyembunyian cacat)'],
        correctAnswer: 0,
        explanation: 'Jual beli sah apabila ditegakkan di atas saling rida (‘an taradhin) tanpa unsur paksaan atau penipuan.'
      }
    ]
  },
  3: {
    id: 'eval_w3',
    title: 'Evaluasi Pekanan 3: Tadabur, Tiga Tipe Hati, Hadis Jibril & Riba',
    type: 'pekanan',
    week: 3,
    month: 1,
    dayRange: 'Hari 15–21',
    description: 'Menguji materi Hari 15–21: Kaidah tadabur, tiga tipe hati, Hadis Jibril, rukhshah tayamum, wahyu pertama di Gua Hira, Al-Mu’awwidzat, dan bahaya riba.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew3_1',
        subjectId: 'tazkiyatun_nafs',
        question: 'Tiga kategori kondisi hati manusia menurut Al-Imam Ibnu Qayyim al-Jauziyyah adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Qalbun Salim (hati selamat), Qalbun Mayyit (hati mati), dan Qalbun Maridh (hati sakit)',
          'Hati tenang, hati kaya, dan hati populer',
          'Hati keras, hati dermawan, dan hati cerdas',
          'Hati lahiriah, hati batiniah, dan hati sementara'
        ],
        correctAnswer: 0,
        explanation: 'Ibnu Qayyim membagi hati menjadi Qalbun Salim (sehat), Qalbun Mayyit (mati tak menerima kebenaran), dan Qalbun Maridh (terombang-ambing).'
      },
      {
        id: 'ew3_2',
        subjectId: 'hadis',
        question: 'Tingkatan tertinggi dalam Hadis Jibril ‘alaihissalam di mana seorang hamba beribadah seakan-akan melihat Allah disebut...',
        type: 'mcq',
        points: 2,
        options: ['Islam', 'Iman', 'Ihsan', 'Qana’ah'],
        correctAnswer: 2,
        explanation: 'Ihsan adalah engkau beribadah kepada Allah seolah-olah melihat-Nya, dan jika tidak melihat-Nya maka yakin Allah melihatmu.'
      },
      {
        id: 'ew3_3',
        subjectId: 'fikih',
        question: 'Rukhshah (keringanan) bersuci menggunakan debu suci pada wajah dan kedua telapak tangan ketika tidak ada air atau sakit disebut...',
        type: 'mcq',
        points: 2,
        options: ['Tayamum', 'Istijmar', 'Mashul khuffain', 'Ghusl'],
        correctAnswer: 0,
        explanation: 'Tayamum adalah pengganti wudu atau mandi wajib dengan tanah/debu suci saat udzur syar’i.'
      },
      {
        id: 'ew3_4',
        subjectId: 'tafsir',
        question: 'Surah Al-Ikhlas, Al-Falaq, dan An-Nas yang dianjurkan dibaca rutin pagi, petang, dan sebelum tidur dikenal dengan sebutan...',
        type: 'mcq',
        points: 2,
        options: ['Al-Mu’awwidzat (surah-surah perlindungan)', 'As-Sab’ul Thiwal', 'Al-Hawamim', 'Al-Musabbihat'],
        correctAnswer: 0,
        explanation: 'Ketiga surah ini melindungi seorang mukmin dari syirik, kejahatan makhluk, sihir, dan penyakit hasad.'
      },
      {
        id: 'ew3_5',
        subjectId: 'muamalah',
        question: 'Tambahan yang dipersyaratkan pada pokok pinjaman karena adanya penundaan waktu pembayaran disebut...',
        type: 'mcq',
        points: 2,
        options: ['Riba Nasi’ah', 'Mudharabah', 'Qardhul Hasan', 'Wakalah'],
        correctAnswer: 0,
        explanation: 'Riba nasi’ah terjadi ketika pemberi pinjaman mensyaratkan tambahan bunga atau denda atas tempo waktu pelunasan.'
      }
    ]
  },
  4: {
    id: 'eval_w4',
    title: 'Evaluasi Pekanan 4: Makkiyah-Madaniyah, Sabar, Salat & Gharar',
    type: 'pekanan',
    week: 4,
    month: 1,
    dayRange: 'Hari 22–28',
    description: 'Menguji materi Hari 22–28: Ayat Makkiyah-Madaniyah, tiga pilar sabar, adab penuntut ilmu, rukun salat, Darul Arqam, Tafsir Adh-Dhuha, dan larangan gharar/maysir.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew4_1',
        subjectId: 'alquran',
        question: 'Ciri tema utama ayat-ayat Makkiyah yang turun sebelum hijrah Nabi ﷺ ke Madinah adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Penguatan akidah tauhid, hari kiamat, kisah para nabi, dan ketabahan iman',
          'Rincian hukum waris, hudud, dan aturan perjanjian kenegaraan',
          'Tata cara pembagian harta rampasan perang secara terperinci',
          'Aturan transaksi perbankan internasional'
        ],
        correctAnswer: 0,
        explanation: 'Fase Makkiyah memfokuskan pembinaan pondasi tauhid dan penyucian akhlak sebelum rincian hukum syariat di Madinah.'
      },
      {
        id: 'ew4_2',
        subjectId: 'tazkiyatun_nafs',
        question: 'Tiga pilar kesabaran yang disepakati para ulama tazkiyatun nafs adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Sabar dalam ketaatan, sabar menjauhi maksiat, dan sabar menerima takdir ujian Allah',
          'Sabar menunggu pujian, sabar membalas dendam, dan sabar mengeluh',
          'Diam saat melihat kemungkaran tanpa kepedulian',
          'Menahan diri hanya ketika lapang harta'
        ],
        correctAnswer: 0,
        explanation: 'Ketiga pilar tersebut merangkum seluruh perjalanan hidup seorang mukmin dalam menjalankan perintah, menjauhi larangan, dan rida atas takdir.'
      },
      {
        id: 'ew4_3',
        subjectId: 'fikih',
        question: 'Apabila seseorang meninggalkan salah satu rukun salat (seperti membaca Al-Fatihah atau rukuk), maka hukum salatnya adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Tidak sah hingga rukun tersebut dikerjakan sesuai ketentuannya',
          'Tetap sah sempurna tanpa perlu perbaikan apa pun',
          'Cukup diganti dengan beristighfar setelah keluar masjid',
          'Dimakruhkan namun pahalanya tetap utuh'
        ],
        correctAnswer: 0,
        explanation: 'Rukun adalah bagian inti penyusun salat; tertinggalnya rukun menyebabkan salat tidak sah jika tidak disusulkan.'
      },
      {
        id: 'ew4_4',
        subjectId: 'tafsir',
        question: 'Pesan utama Surah Al-Insyirah “Fa inna ma’al ‘usri yusra” memberi penguatan batin bahwa...',
        type: 'mcq',
        points: 2,
        options: [
          'Setiap satu kesulitan pasti disertai oleh dua kemudahan dan jalan keluar dari Allah',
          'Kesulitan hidup akan berlangsung abadi tanpa harapan',
          'Manusia tidak perlu berikhtiar ketika ditimpa masalah',
          'Kemudahan hanya diberikan kepada penduduk Makkah'
        ],
        correctAnswer: 0,
        explanation: 'Kata al-‘usri berbentuk ma’rifat (satu kesulitan) sedangkan yusra berbentuk nakirah berulang (banyak kemudahan).'
      },
      {
        id: 'ew4_5',
        subjectId: 'muamalah',
        question: 'Skema transaksi yang menggantungkan keuntungan secara untung-untungan tanpa aset atau usaha riil (spekulasi judi) disebut...',
        type: 'mcq',
        points: 2,
        options: ['Maysir', 'Salam', 'Istishna’', 'Ijarah'],
        correctAnswer: 0,
        explanation: 'Maysir (perjudian/spekulasi zero-sum) diharamkan dalam QS. Al-Maidah: 90.'
      }
    ]
  },
  5: {
    id: 'eval_w5',
    title: 'Evaluasi Pekanan 5: Syukur, Sujud Sahwi, Ujub, Amarah & Wasiat Luqman',
    type: 'pekanan',
    week: 5,
    month: 2,
    dayRange: 'Hari 29–35',
    description: 'Menguji materi transisi Bulan 1–2 (Hari 29–35): Hakikat syukur, tumakninah & sujud sahwi, riya/ujub, hadis La Taghdhab, dakwah jahriyah, dan wasiat Luqman.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew5_1',
        subjectId: 'tazkiyatun_nafs',
        question: 'Tiga dimensi syukur yang sempurna menurut para ulama adalah mengakui nikmat dengan hati, memuji dengan lisan, dan...',
        type: 'mcq',
        points: 2,
        options: [
          'Menggunakan nikmat tersebut untuk taat kepada Allah Ta’ala',
          'Memamerkan kekayaan agar disegani masyarakat',
          'Menyimpannya rapat-rapat tanpa sedekah sedikit pun',
          'Membanggakan usaha pribadi semata'
        ],
        correctAnswer: 0,
        explanation: 'Syukur bil arkan (dengan anggota badan) adalah memanfaatkan setiap anugerah Allah pada jalan yang diridai-Nya.'
      },
      {
        id: 'ew5_2',
        subjectId: 'fikih',
        question: 'Sujud sebanyak dua kali yang dilakukan sebelum atau sesudah salam karena lupa jumlah rakaat atau sunnah ab’adh disebut...',
        type: 'mcq',
        points: 2,
        options: ['Sujud Sahwi', 'Sujud Tilawah', 'Sujud Syukur', 'Tahiyyatul Masjid'],
        correctAnswer: 0,
        explanation: 'Sujud sahwi disyariatkan untuk menambal kekurangan atau keraguan karena lupa di dalam salat.'
      },
      {
        id: 'ew5_3',
        subjectId: 'hadis',
        question: 'Nasihat singkat Rasulullah ﷺ yang diulang tiga kali kepada seorang sahabat agar mampu mengendalikan gejolak emosi adalah...',
        type: 'mcq',
        points: 2,
        options: [
          '“La taghdhab” (Jangan engkau marah)',
          '“Perbanyaklah tidur siang”',
          '“Tinggalkan kampung halamanmu”',
          '“Jangan berbicara selama sebulan”'
        ],
        correctAnswer: 0,
        explanation: 'Hadis Bukhari menekankan penguasaan amarah sebagai ciri kekuatan jiwa seorang mukmin sejati.'
      },
      {
        id: 'ew5_4',
        subjectId: 'sirah',
        question: 'Keteguhan keluarga Yasir dan Bilal bin Rabah saat disiksa kaum musyrikin Quraisy menunjukkan teladan berupa...',
        type: 'mcq',
        points: 2,
        options: [
          'Ketahanan iman yang tak tergoyahkan oleh ancaman fisik maupun tekanan sosial',
          'Kemewahan hidup para bangsawan Makkah',
          'Kompromi akidah demi keselamatan sementara',
          'Menyerah pada tekanan lingkungan'
        ],
        correctAnswer: 0,
        explanation: 'Ucapannya yang abadi “Ahad! Ahad!” menjadi lambang tauhid murni yang mengalahkan siksaan.'
      },
      {
        id: 'ew5_5',
        subjectId: 'tafsir',
        question: 'Nasihat pertama Luqman al-Hakim kepada anaknya dalam QS. Luqman ayat 13 adalah larangan berbuat...',
        type: 'mcq',
        points: 2,
        options: [
          'Syirik (menyekutukan Allah) karena syirik adalah kezaliman yang paling besar',
          'Berdagang lintas negeri',
          'Menuntut ilmu keduniaan',
          'Mempelajari bahasa asing'
        ],
        correctAnswer: 0,
        explanation: 'Pondasi utama pendidikan anak dalam Al-Qur’an adalah pemurnian tauhid sebelum adab lainnya.'
      }
    ]
  },
  6: {
    id: 'eval_w6',
    title: 'Evaluasi Pekanan 6: Utang-Piutang, Kisah Nabi, Hasad, Lisan & Isra Mi’raj',
    type: 'pekanan',
    week: 6,
    month: 2,
    dayRange: 'Hari 36–42',
    description: 'Menguji materi Hari 36–42: Dokumentasi utang (Al-Baqarah: 282), tadabur kisah nabi, terapi hasad, adab lisan, salat berjamaah, Isra Mi’raj, dan etika Surah Al-Hujurat.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew6_1',
        subjectId: 'muamalah',
        question: 'Ayat terpanjang dalam Al-Qur’an (QS. Al-Baqarah: 282) mewajibkan adab utama dalam transaksi utang tidak tunai yaitu...',
        type: 'mcq',
        points: 2,
        options: [
          'Mencatatnya secara tertulis secara adil dan menghadirkan saksi yang sah',
          'Mengandalkan ingatan lisan tanpa bukti agar terlihat saling percaya',
          'Membebankan bunga tambahan atas penundaan pembayaran',
          'Merahasiakan utang dari ahli waris selamanya'
        ],
        correctAnswer: 0,
        explanation: 'Pencatatan utang melindungi hak kedua belah pihak dan mencegah sengketa di kemudian hari.'
      },
      {
        id: 'ew6_2',
        subjectId: 'tazkiyatun_nafs',
        question: 'Sikap iri positif berupa keinginan meraih kebaikan serupa tanpa berharap nikmat orang lain hilang disebut...',
        type: 'mcq',
        points: 2,
        options: ['Ghibthah', 'Hasad', 'Dendam', 'Sum’ah'],
        correctAnswer: 0,
        explanation: 'Berbeda dengan hasad yang memakan amal kebaikan, ghibthah dalam menuntut ilmu dan berinfak justru dianjurkan.'
      },
      {
        id: 'ew6_3',
        subjectId: 'hadis',
        question: 'Sabda Rasulullah ﷺ: “Barang siapa beriman kepada Allah dan Hari Akhir, hendaklah ia berkata baik atau...”',
        type: 'mcq',
        points: 2,
        options: [
          'Hendaklah ia diam (au liyashmut)',
          'Boleh menyebarkan rumor tanpa tabayyun',
          'Membantah semua orang dengan suara keras',
          'Mencari-cari kesalahan saudaranya'
        ],
        correctAnswer: 0,
        explanation: 'Menjaga lisan dan jari dari ucapan menyakitkan atau hoaks adalah bukti nyata keimanan.'
      },
      {
        id: 'ew6_4',
        subjectId: 'sirah',
        question: 'Ibadah agung yang dijemput langsung oleh Rasulullah ﷺ pada malam Isra Mi’raj setelah peristiwa ‘Amul Huzni adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Salat lima waktu sehari semalam',
          'Zakat fitrah bulan Ramadhan',
          'Puasa Daud dua hari sekali',
          'Haji ke Baitul Maqdis'
        ],
        correctAnswer: 0,
        explanation: 'Salat menjadi pelipur lara tertinggi dan mi’raj ruhani harian bagi setiap orang beriman.'
      },
      {
        id: 'ew6_5',
        subjectId: 'tafsir',
        question: 'Sikap memverifikasi kejelasan suatu berita dari orang fasik sebelum menyebarluaskan atau bertindak (QS. Al-Hujurat: 6) disebut...',
        type: 'mcq',
        points: 2,
        options: ['Tabayyun', 'Tajassus', 'Su’udzan', 'Istihza’'],
        correctAnswer: 0,
        explanation: 'Tabayyun mencegah fitnah, kesalahpahaman sosial, dan penyesalan akibat tergesa-gesa menghakimi.'
      }
    ]
  },
  7: {
    id: 'eval_w7',
    title: 'Evaluasi Pekanan 7: Itqan, Tawakal, Persaudaraan, Hijrah & Al-Kahfi I',
    type: 'pekanan',
    week: 7,
    month: 2,
    dayRange: 'Hari 43–49',
    description: 'Menguji materi Hari 43–49: Profesionalisme kerja (itqan), Al-Qur’an penyembuh jiwa, tawakal, cinta persaudaraan, salat sunnah, Hijrah ke Madinah, dan Ashabul Kahfi.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew7_1',
        subjectId: 'muamalah',
        question: 'Bekerja secara tekun, rapi, teliti, dan penuh tanggung jawab sesuai hadis riwayat Al-Baihaqi disebut...',
        type: 'mcq',
        points: 2,
        options: ['Itqan', 'Taswif (menunda-nunda)', 'Ghasab', 'Israf'],
        correctAnswer: 0,
        explanation: 'Allah Ta’ala mencintai seorang mukmin yang apabila melaksanakan pekerjaan melakukannya dengan itqan (profesional).'
      },
      {
        id: 'ew7_2',
        subjectId: 'tazkiyatun_nafs',
        question: 'Dalam hadis perumpamaan burung yang keluar pagi lapar dan pulang sore kenyang, Rasulullah ﷺ menekankan bahwa tawakal menuntut...',
        type: 'mcq',
        points: 2,
        options: [
          'Keseimbangan antara ikhtiar usaha maksimal dan penyandaran hati sepenuhnya kepada Allah',
          'Berhenti bekerja total sambil menunggu keajaiban jatuh dari langit',
          'Bergantung sepenuhnya pada kecerdasan sendiri tanpa berdoa',
          'Menolak sebab-sebab pengobatan dan pencarian nafkah'
        ],
        correctAnswer: 0,
        explanation: 'Burung tetap terbang mencari rezeki (ikhtiar) sambil hatinya berserah pada jaminan rezeki dari Allah.'
      },
      {
        id: 'ew7_3',
        subjectId: 'hadis',
        question: 'Kesempurnaan iman seseorang menurut hadis Bukhari-Muslim terwujud ketika ia mencintai kebaikan untuk saudaranya sebagaimana...',
        type: 'mcq',
        points: 2,
        options: [
          'Ia mencintai kebaikan itu terwujud bagi dirinya sendiri',
          'Ia menginginkan pujian balik lebih banyak',
          'Ia hanya menolong kerabat sedarah saja',
          'Ia menunggu saudaranya meminta bantuan terlebih dahulu'
        ],
        correctAnswer: 0,
        explanation: 'Empati imani menumbuhkan ukhuwah yang tulus dan menyingkirkan sifat egois.'
      },
      {
        id: 'ew7_4',
        subjectId: 'fikih',
        question: 'Jumlah rakaat salat sunnah Rawatib Mu’akkadah yang menjanjikan rumah di surga bagi siapa yang menjaganya setiap hari adalah...',
        type: 'mcq',
        points: 2,
        options: ['12 rakaat sehari semalam', '2 rakaat sebulan sekali', '40 rakaat setiap pagi', '6 rakaat khusus hari Jumat'],
        correctAnswer: 0,
        explanation: '12 rakaat tersebut ialah 4 sebelum Zuhur, 2 sesudah Zuhur, 2 sesudah Maghrib, 2 sesudah Isya, dan 2 sebelum Subuh.'
      },
      {
        id: 'ew7_5',
        subjectId: 'sirah',
        question: 'Sikap Rasulullah ﷺ saat berada di Gua Tsur dalam perjalanan Hijrah yang penuh kepungan menunjukkan teladan...',
        type: 'mcq',
        points: 2,
        options: [
          'Perencanaan strategis matang berpadu dengan keyakinan mutlak: “La tahzan innallaha ma’ana”',
          'Pergi mendadak tanpa penunjuk jalan atau perbekalan',
          'Menyerah kepada pengejar Quraisy',
          'Putus asa melihat musuh di mulut gua'
        ],
        correctAnswer: 0,
        explanation: 'Hijrah memadukan ikhtiar terencana (Ali tidur di ranjang, Abdullah bin Uraiqith sebagai pemandu) dengan tawakal puncak.'
      }
    ]
  },
  8: {
    id: 'eval_w8',
    title: 'Evaluasi Pekanan 8: Syariah Bisnis, Muhasabah, Syubhat & Piagam Madinah',
    type: 'pekanan',
    week: 8,
    month: 2,
    dayRange: 'Hari 50–56',
    description: 'Menguji materi Hari 50–56: Akad mudharabah/musyarakah, sumpah waktu, muhasabah harian, hadis halal-haram-syubhat, fikih puasa, Piagam Madinah, dan 4 fitnah Al-Kahfi.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew8_1',
        subjectId: 'muamalah',
        question: 'Kaidah keadilan bisnis syariah dalam akad kerjasama bagi hasil (mudharabah dan musyarakah) menyatakan...',
        type: 'mcq',
        points: 2,
        options: [
          'Al-Ghunmu bil Ghurmi (keuntungan sebanding dengan keberanian menanggung risiko bersama)',
          'Pemodal berhak mendapat untung tetap meskipun usaha merugi total',
          'Pengelola wajib menanggung seluruh kerugian walaupun bukan karena kelalaian',
          'Pembagian hasil ditetapkan lewat undian berbayar'
        ],
        correctAnswer: 0,
        explanation: 'Keadilan syariah menolak riba yang hanya membebankan risiko pada satu pihak.'
      },
      {
        id: 'ew8_2',
        subjectId: 'tazkiyatun_nafs',
        question: 'Pesan agung Umar bin Khattab radhiyallahu ‘anhu “Hasibu anfusakum qabla an tuhasabu” mengajarkan kebiasaan...',
        type: 'mcq',
        points: 2,
        options: [
          'Mengevaluasi amal dan niat diri sendiri sebelum kelak dihisab di akhirat',
          'Menghitung kekayaan tetangga setiap akhir bulan',
          'Menunda introspeksi hingga tutup usia',
          'Hanya memeriksa kesalahan orang lain'
        ],
        correctAnswer: 0,
        explanation: 'Muhasabah harian menjaga hati tetap sadar arah dan cepat memperbaiki kekeliruan.'
      },
      {
        id: 'ew8_3',
        subjectId: 'hadis',
        question: 'Sikap seorang mukmin yang menjaga kehormatan diri dan agamanya terhadap perkara syubhat (samar antara halal dan haram) adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Meninggalkan perkara syubhat sebagai bentuk kehati-hatian (wara’)',
          'Mengambilnya sepuas hati selama tidak ada yang melarang',
          'Menganggap semua perkara syubhat pasti halal',
          'Memaksakan orang lain mengonsumsinya'
        ],
        correctAnswer: 0,
        explanation: 'Dalam Hadis Arba’in No. 6 ditegaskan siapa yang menjauhi syubhat maka ia telah menjaga agama dan kehormatannya.'
      },
      {
        id: 'ew8_4',
        subjectId: 'sirah',
        question: 'Langkah pertama Rasulullah ﷺ setibanya di Madinah untuk mempersatukan Muhajirin, Anshar, dan komunitas lintas suku adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Membangun masjid, mempersaudarakan Muhajirin-Anshar, dan menyusun Piagam Madinah',
          'Membangun istana megah bertembok tinggi',
          'Mengusir seluruh pedagang pasar',
          'Membubarkan aktivitas keilmuan'
        ],
        correctAnswer: 0,
        explanation: 'Masjid menjadi pusat ruhani dan Piagam Madinah menegakkan keadilan hukum bersama.'
      },
      {
        id: 'ew8_5',
        subjectId: 'tafsir',
        question: 'Keempat kisah utama dalam Surah Al-Kahfi (Ashabul Kahfi, Pemilik Dua Kebun, Musa-Khidir, dan Dzulkarnain) secara berurutan menguji manusia terhadap...',
        type: 'mcq',
        points: 2,
        options: [
          'Fitnah agama/akidah, fitnah harta, fitnah ilmu, dan fitnah kekuasaan',
          'Hukum salat, zakat, puasa, dan haji saja',
          'Tata cara bercocok tanam dan arsitektur istana',
          'Strategi pelayaran laut semata'
        ],
        correctAnswer: 0,
        explanation: 'Membaca dan merenungi Al-Kahfi membentengi mukmin dari empat fitnah terbesar kehidupan.'
      }
    ]
  },
  9: {
    id: 'eval_w9',
    title: 'Evaluasi Pekanan 9: Fintech Syariah, Ibadurrahman, Zakat & Birrul Walidain',
    type: 'pekanan',
    week: 9,
    month: 3,
    dayRange: 'Hari 57–63',
    description: 'Menguji materi Hari 57–63: Muamalah era digital, sifat Ibadurrahman, menjaga pandangan, rekap bulan 2, zakat mal/fitrah, adab takdir, dan birrul walidain.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew9_1',
        subjectId: 'muamalah',
        question: 'Layanan paylater atau pinjaman daring yang mengenakan denda berlipat atas keterlambatan pelunasan utang termasuk kategori...',
        type: 'mcq',
        points: 2,
        options: ['Riba nasi’ah yang diharamkan syariat', 'Hibah yang dianjurkan', 'Sedekah jariyah', 'Akad bagi hasil murni'],
        correctAnswer: 0,
        explanation: 'Setiap kelebihan atau denda berbunga yang masuk ke kantong pemberi pinjaman karena telat bayar adalah riba.'
      },
      {
        id: 'ew9_2',
        subjectId: 'alquran',
        question: 'Karakter “Ibadurrahman” dalam QS. Al-Furqan ayat 63 ketika disapa orang jahil dengan kata-kata buruk adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Berjalan rendah hati dan mengucapkan kalimat keselamatan yang lembut (“Salama”)',
          'Membalas cacian lebih kasar agar tidak diremehkan',
          'Menyebarkan aib orang tersebut ke seluruh kota',
          'Menyimpan dendam kesumat seumur hidup'
        ],
        correctAnswer: 0,
        explanation: 'Ketenangan hati hamba Allah Yang Maha Pengasih memancar dalam sikap santun dan tidak terpancing provokasi.'
      },
      {
        id: 'ew9_3',
        subjectId: 'fikih',
        question: 'Batas minimal harta simpanan emas wajib zakat (nishab) yang telah mencapai satu tahun hijriah (haul) adalah...',
        type: 'mcq',
        points: 2,
        options: ['85 gram emas murni dengan kadar zakat 2,5%', '5 gram emas dengan kadar 10%', '100 gram perak dengan kadar 20%', '1 kilogram emas murni'],
        correctAnswer: 0,
        explanation: 'Nishab emas adalah 20 dinar (setara 85 gram emas murni) dengan kadar wajib zakat 2,5%.'
      },
      {
        id: 'ew9_4',
        subjectId: 'tazkiyatun_nafs',
        question: 'Kalimat syar’i yang diajarkan Nabi ﷺ saat seseorang menghadapi musibah agar tidak membuka pintu setan dengan kata “seandainya” adalah...',
        type: 'mcq',
        points: 2,
        options: [
          '“Qadarullahu wa ma sya-a fa’al” (Allah telah menakdirkan dan apa yang Dia kehendaki pasti terjadi)',
          '“Seandainya kemarin aku tidak keluar rumah”',
          '“Takdir ini sangat tidak adil bagiku”',
          '“Aku menyerah dan berhenti berdoa”'
        ],
        correctAnswer: 0,
        explanation: 'Hadis Sahih Muslim melarang kata “law” (andai) saat menyesali takdir yang sudah terjadi karena ia membuka pintu bisikan setan.'
      },
      {
        id: 'ew9_5',
        subjectId: 'hadis',
        question: 'Menurut hadis Sahih Tirmidzi dari Abdullah bin ‘Amr, keridhaan Allah Ta’ala terhadap seorang anak sangat bergantung pada...',
        type: 'mcq',
        points: 2,
        options: [
          'Keridhaan kedua orang tuanya (Birrul Walidain)',
          'Banyaknya gelar akademik semata',
          'Popularitas di lingkungan teman sebaya',
          'Kemewahan rumah tinggal'
        ],
        correctAnswer: 0,
        explanation: 'Ridhallahi fi ridhal walidain; bakti tulus kepada ayah dan ibu merupakan pintu surga paling mulia.'
      }
    ]
  },
  10: {
    id: 'eval_w10',
    title: 'Evaluasi Pekanan 10: Badar, Sakinah, Sulh, Dzikir Pagi-Petang & Silaturahmi',
    type: 'pekanan',
    week: 10,
    month: 3,
    dayRange: 'Hari 64–70',
    description: 'Menguji materi Hari 64–70: Hikmah Perang Badar, keluarga sakinah, penyelesaian sengketa (sulh), tadabur ayat kauniyah, dzikir pagi petang, silaturahmi, dan adab harian.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew10_1',
        subjectId: 'sirah',
        question: 'Pelajaran ruhani paling menonjol dari kemenangan kaum muslimin pada Perang Badar meski kalah jumlah adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Kemenangan sejati lahir dari ketulusan doa, ketaatan, dan pertolongan Allah semata',
          'Jumlah pasukan sedikit pasti selalu menang tanpa persiapan',
          'Boleh meremehkan musuh dan melanggar komando pemimpin',
          'Harta rampasan lebih utama daripada keselamatan nyawa'
        ],
        correctAnswer: 0,
        explanation: 'Rasulullah ﷺ bermunajat sangat khusyuk semalaman hingga Allah menurunkan ribuan malaikat menolong kaum beriman.'
      },
      {
        id: 'ew10_2',
        subjectId: 'tafsir',
        question: 'Dua pilar utama ketenangan rumah tangga yang Allah sebutkan dalam Surah Ar-Rum ayat 21 adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Mawaddah (cinta kasih) dan Rahmah (kasih sayang penuh pengertian)',
          'Kemewahan perhiasan dan pesta megah',
          'Saling mendominasi dan menyembunyikan masalah',
          'Persaingan mencari pujian tetangga'
        ],
        correctAnswer: 0,
        explanation: 'Mawaddah dan rahmah menjaga kehangatan pernikahan tetap utuh saat muda hingga menua.'
      },
      {
        id: 'ew10_3',
        subjectId: 'muamalah',
        question: 'Mekanisme penyelesaian perselisihan bisnis secara damai dan adil atas dasar musyawarah yang sangat dianjurkan Islam disebut...',
        type: 'mcq',
        points: 2,
        options: ['Ash-Shulh (perdamaian)', 'Boikot sepihak', 'Denda sepihak tanpa dialog', 'Menghindari pertemuan selamanya'],
        correctAnswer: 0,
        explanation: 'Allah menegaskan “Wash-shulhu khair” (perdamaian itu lebih baik) selama tidak menghalalkan yang haram.'
      },
      {
        id: 'ew10_4',
        subjectId: 'tazkiyatun_nafs',
        question: 'Salah satu fungsi utama merutinkan bacaan dzikir pagi dan petang yang diajarkan Nabi ﷺ (Al-Ma’tsurat / Hisnul Muslim) adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Menjadi benteng ketenangan jiwa serta perlindungan dari kecemasan dan gangguan keburukan',
          'Menggantikan kewajiban mencari nafkah halal',
          'Membuat seseorang bebas meninggalkan salat wajib',
          'Sekadar tradisi daerah tanpa dalil hadis'
        ],
        correctAnswer: 0,
        explanation: 'Dzikir pagi-petang mengikat kesadaran hamba kepada penjagaan Allah sejak terbit fajar hingga malam tiba.'
      },
      {
        id: 'ew10_5',
        subjectId: 'hadis',
        question: 'Hakikat penyambung silaturahmi sejati (Al-Washil) menurut hadis Sahih Bukhari adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Orang yang tetap berinisiatif menyambung persaudaraan meskipun kerabatnya pernah memutuskan',
          'Orang yang hanya mengunjungi kerabat yang kaya dan dermawan saja',
          'Orang yang memutus hubungan jika tidak dibalas undangannya',
          'Sekadar memberi tanda suka di media sosial'
        ],
        correctAnswer: 0,
        explanation: 'Nabi ﷺ bersabda: “Laisal washilu bil mukafi’” — penyambung silaturahmi bukanlah yang sekadar membalas kebaikan, melainkan yang menyambung saat diputus.'
      }
    ]
  },
  11: {
    id: 'eval_w11',
    title: 'Evaluasi Pekanan 11: Uhud, Al-Hasyr, Wakaf, Muraja’ah & Adab Ikhtilaf',
    type: 'pekanan',
    week: 11,
    month: 3,
    dayRange: 'Hari 71–77',
    description: 'Menguji materi Hari 71–77: Ibrah Uhud-Khandaq, Tafsir Al-Hasyr: 18, wakaf produktif, menjaga hafalan Al-Qur’an, khauf-raja’, tolong-menolong, dan adab ikhtilaf mazhab.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew11_1',
        subjectId: 'sirah',
        question: 'Faktor utama berbaliknya situasi pasukan pemanah kaum muslimin pada Perang Uhud adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Sebagian pasukan pemanah meninggalkan pos bukit Rumat sebelum ada izin dari Rasulullah ﷺ',
          'Kekurangan jumlah pedang dan perisai',
          'Serangan badai salju yang melumpuhkan medan tempur',
          'Rasulullah ﷺ tidak memimpin langsung di lapangan'
        ],
        correctAnswer: 0,
        explanation: 'Kepatuhan terhadap instruksi pemimpin dan keteguhan disiplin adalah pelajaran mahal dari peristiwa Bukit Rumat di Uhud.'
      },
      {
        id: 'ew11_2',
        subjectId: 'muamalah',
        question: 'Keistimewaan instrumen wakaf produktif dibanding sedekah konsumtif biasa adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Pokok asetnya ditahan agar tetap utuh sementara manfaat/hasilnya terus mengalirkan pahala jariyah',
          'Barang wakaf boleh langsung dijual untuk keperluan pribadi pewakaf',
          'Pahala wakaf berhenti ketika pewakaf masih hidup',
          'Wakaf hanya boleh berbentuk uang tunai kertas'
        ],
        correctAnswer: 0,
        explanation: 'Hadis tanah Khaibar Umar bin Khattab menetapkan prinsip: “Tahan pokoknya dan sedekahkan hasilnya.”'
      },
      {
        id: 'ew11_3',
        subjectId: 'tazkiyatun_nafs',
        question: 'Dua sayap keseimbangan iman yang menjaga mukmin dari rasa putus asa maupun rasa aman berlebihan dari azab Allah adalah...',
        type: 'mcq',
        points: 2,
        options: ['Khauf (takut) dan Raja’ (berharap penuh pada rahmat Allah)', 'Ghadhab dan Hasad', 'Ujub dan Riya', 'Kibr dan Tamak'],
        correctAnswer: 0,
        explanation: 'Khauf mencegah maksiat saat sehat dan kuat, sedangkan raja’ menguatkan optimisme akan ampunan dan rahmat Allah.'
      },
      {
        id: 'ew11_4',
        subjectId: 'hadis',
        question: 'Janji Allah dalam hadis Sahih Muslim No. 2699 bagi orang yang membantu meringankan kesulitan saudaranya di dunia adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Allah akan selalu menolongnya dan melapangkan kesulitannya pada Hari Kiamat',
          'Pahalanya hanya dibalas dalam bentuk pujian warga',
          'Ia dibebaskan dari kewajiban salat dan puasa',
          'Urutan hisabnya ditunda tanpa kepastian'
        ],
        correctAnswer: 0,
        explanation: 'Wallahu fi ‘aunil ‘abdi ma kana al-‘abdu fi ‘auni akhihi — pertolongan Allah datang berbanding lurus dengan kepedulian kita menolong sesama.'
      },
      {
        id: 'ew11_5',
        subjectId: 'fikih',
        question: 'Sikap bijak seorang penuntut ilmu menghadapi perbedaan pendapat fikih cabang (ikhtilaf furu’iyyah) antar-mazhab mu’tabar adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Berlapang dada, menghormati ijtihad ulama yang memiliki dalil, dan tetap menjaga ukhuwah Islamiyah',
          'Langsung memvonis sesat kelompok lain yang berbeda qunut atau letak tangan salat',
          'Meninggalkan semua mazhab dan enggan belajar fikih',
          'Membuat perpecahan di masjid lingkungan sekitar'
        ],
        correctAnswer: 0,
        explanation: 'Ikhtilaf tanawwu’ (keragaman cara ibadah yang sama-sama memiliki sandaran sahih) adalah keluasan rahmat dalam syariat.'
      }
    ]
  },
  12: {
    id: 'eval_w12',
    title: 'Evaluasi Pekanan 12: Hudaibiyah, An-Nasr, Ruqyah Syar’i, Zuhud & Jenazah',
    type: 'pekanan',
    week: 12,
    month: 3,
    dayRange: 'Hari 78–84',
    description: 'Menguji materi Hari 78–84: Diplomasi Hudaibiyah-Fathu Makkah, Tafsir An-Nasr, hak upah pekerja, ruqyah mandiri syar’i, zuhud-qana’ah, dzikrul maut, dan fikih jenazah.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew12_1',
        subjectId: 'sirah',
        question: 'Keputusan agung Rasulullah ﷺ terhadap kaum Quraisy ketika berhasil menaklukkan Kota Makkah (Fathu Makkah) tanpa pertumpahan darah adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Memberikan amnesti dan pengampunan massal: “Pergilah kalian, sesungguhnya kalian bebas”',
          'Membalas dendam atas pengusiran 21 tahun silam',
          'Menyita seluruh rumah penduduk Makkah',
          'Menutup Ka’bah selama sepuluh tahun'
        ],
        correctAnswer: 0,
        explanation: 'Kasih sayang universal Islam terlihat paling gemilang saat berada di puncak kemenangan.'
      },
      {
        id: 'ew12_2',
        subjectId: 'tafsir',
        question: 'Menurut pemahaman sahabat Ibnu Abbas, Surah An-Nasr yang memerintahkan bertasbih dan beristighfar merupakan isyarat tentang...',
        type: 'mcq',
        points: 2,
        options: [
          'Telah sempurnanya tugas dakwah serta dekatnya ajal Rasulullah ﷺ',
          'Perintah untuk membuka kerajaan baru di Eropa',
          'Larangan melaksanakan ibadah haji dan umrah',
          'Kewajiban menimbun harta pasca kemenangan'
        ],
        correctAnswer: 0,
        explanation: 'Surah An-Nasr mengajarkan tawadhu’ puncak: menutup puncak kesuksesan dengan tasbih dan istighfar.'
      },
      {
        id: 'ew12_3',
        subjectId: 'alquran',
        question: 'Tiga syarat mutlak diperbolehkannya ruqyah syar’iyyah menurut kesepakatan para ulama Ahlussunnah adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Menggunakan ayat Al-Qur’an/doa ma’tsur, bahasa jelas dipahami, dan meyakini kesembuhan hanya dari Allah',
          'Menggunakan jimat rajah, sesajen, dan memanggil khadam',
          'Harus dilakukan di ruangan gelap bersama dukun',
          'Meyakini bacaan mantra memiliki kekuatan gaib terpisah dari Allah'
        ],
        correctAnswer: 0,
        explanation: 'Ruqyah syar’i membebaskan umat dari syirik perdukunan dan menuntun pasien bergantung murni kepada Allah.'
      },
      {
        id: 'ew12_4',
        subjectId: 'tazkiyatun_nafs',
        question: 'Hakikat sifat zuhud menurut ulama salaf bukanlah menolak dunia secara lahiriah, melainkan...',
        type: 'mcq',
        points: 2,
        options: [
          'Meletakkan dunia di genggaman tangan untuk amal saleh tanpa membiarkannya menguasai hati',
          'Tidak mau bekerja dan membiarkan keluarga kelaparan',
          'Membenci seluruh orang kaya meskipun bertakwa',
          'Mengenakan pakaian compang-camping agar dikasihani'
        ],
        correctAnswer: 0,
        explanation: 'Banyak sahabat Nabi yang kaya raya (seperti Utsman dan Abdurrahman bin Auf) tetapi paling zuhud hatinya terhadap dunia.'
      },
      {
        id: 'ew12_5',
        subjectId: 'fikih',
        question: 'Tata cara salat jenazah yang benar sesuai tuntunan sunnah Nabi Muhammad ﷺ adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Berdiri menghadap kiblat dengan empat kali takbir tanpa disertai rukuk dan sujud',
          'Salat dua rakaat disertai dua sujud panjang di awal rakaat',
          'Cukup berdiri diam tanpa takbir dan tanpa membaca Al-Fatihah',
          'Dikerjakan sambil duduk membelakangi kiblat'
        ],
        correctAnswer: 0,
        explanation: 'Empat takbir salat jenazah berisi: Al-Fatihah (takbir 1), shalawat Nabi (takbir 2), doa khusus mayit (takbir 3), doa penutup & salam (takbir 4).'
      }
    ]
  },
  13: {
    id: 'eval_w13',
    title: 'Evaluasi Pekanan 13 (Pekan Penutup): Haji Wada’, Waris, Istiqamah & Aksi Seumur Hidup',
    type: 'pekanan',
    week: 13,
    month: 3,
    dayRange: 'Hari 85–90',
    description: 'Menguji materi pekan terakhir (Hari 85–90): Wasiat Haji Wada’, Tafsir Nafsul Muthma’innah, wasiat & faraidh, karomah istiqamah, rencana amal, dan komitmen husnul khatimah.',
    durationMinutes: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ew13_1',
        subjectId: 'sirah',
        question: 'Salah satu pesan abadi dalam khotbah perpisahan Rasulullah ﷺ saat Haji Wada’ di Padang Arafah adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Kehormatan jiwa, harta, penghapusan riba jahiliyah, dan perintah berpegang teguh pada Al-Qur’an & Sunnah',
          'Keunggulan ras suku Quraisy di atas seluruh bangsa lain',
          'Kewajiban membalas dendam darah antarsuku',
          'Pembatalan seluruh hukum waris Islam'
        ],
        correctAnswer: 0,
        explanation: 'Khotbah Haji Wada’ menetapkan prinsip persamaan manusia berdasar ketakwaan dan kemuliaan hak asasi.'
      },
      {
        id: 'ew13_2',
        subjectId: 'tafsir',
        question: 'Tingkatan jiwa tertinggi yang diseru oleh Allah “Irji’i ila rabbiki radhiyatan mardhiyyah” dalam QS. Al-Fajr: 27-30 adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Nafsul Muthma’innah (jiwa yang tenang dan tenteram dalam iman)',
          'Nafsul Lawwamah yang terus terpuruk',
          'Nafsul Ammarah bis-Su’',
          'Jiwa yang dipenuhi syubhat dan keraguan'
        ],
        correctAnswer: 0,
        explanation: 'Nafsul Muthma’innah adalah puncak keberhasilan tazkiyatun nafs menuju husnul khatimah.'
      },
      {
        id: 'ew13_3',
        subjectId: 'muamalah',
        question: 'Ketentuan syariat tentang pembuatan wasiat harta sebelum wafat adalah maksimal sebesar...',
        type: 'mcq',
        points: 2,
        options: [
          'Sepertiga (1/3) harta dan hanya diperuntukkan bagi non-ahli waris',
          'Seluruh (100%) harta boleh diberikan kepada satu anak kesayangan saja',
          'Setengah (50%) harta untuk menggugurkan bagian waris anak perempuan',
          'Tidak perlu aturan karena pembagian tergantung selera pribadi'
        ],
        correctAnswer: 0,
        explanation: 'Wasiat maksimal 1/3 harta agar hak para ahli waris dalam ilmu faraidh tetap terjaga adil.'
      },
      {
        id: 'ew13_4',
        subjectId: 'tazkiyatun_nafs',
        question: 'Amalan yang paling dicintai oleh Allah Ta’ala sebagaimana sabda Rasulullah ﷺ dalam Sahih Bukhari dan Muslim adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Amalan yang dilaksanakan secara istikamah (konsisten berkesinambungan) meskipun sedikit',
          'Amalan yang berat sekaligus namun hanya dikerjakan setahun sekali',
          'Amalan yang hanya dilakukan ketika dilihat guru pembimbing',
          'Amalan tanpa dasar ilmu dan niat yang lurus'
        ],
        correctAnswer: 0,
        explanation: 'Adwamuha wa in qalla — konsistensi menjaga kebaikan harian selama 90 hari merupakan modal menuju istiqamah seumur hidup.'
      },
      {
        id: 'ew13_5',
        subjectId: 'alquran',
        question: 'Setelah menuntaskan kurikulum 90 hari Akademik Healing Qur’ani, langkah terbaik seorang penuntut ilmu adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Menjalankan rencana aksi amal harian seumur hidup, terus muraja’ah Al-Qur’an, dan mengamalkannya dengan tawadhu’',
          'Berhenti membaca Al-Qur’an karena merasa sudah lulus seluruh modul',
          'Merasa lebih suci daripada orang lain yang belum belajar',
          'Mengabaikan muhasabah batin dan salat berjamaah'
        ],
        correctAnswer: 0,
        explanation: 'Akhir program belajar bukanlah berhentinya ibadah, melainkan awal komitmen istikamah mengamalkan ilmu hingga husnul khatimah.'
      }
    ]
  }
};

export const MONTHLY_ASSESSMENTS: Record<number, ComprehensiveAssessment> = {
  1: {
    id: 'eval_m1',
    title: 'Evaluasi Komprehensif Bulan 1: Fondasi Pengetahuan dan Pemahaman (Hari 1–30)',
    type: 'bulanan',
    month: 1,
    dayRange: 'Hari 1–30',
    description: 'Mengukur pemahaman dasar terhadap materi Al-Qur’an, thaharah, wudu, sirah pra-Islam, Al-Fatihah, tauhid, dan penyucian niat.',
    durationMinutes: 45,
    passingScore: 75,
    questions: [
      {
        id: 'em1_1',
        subjectId: 'alquran',
        question: 'Menurut Surat Yunus ayat 57, kedudukan Al-Qur’an bagi orang beriman adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Mau’izhah (pelajaran), Syifa’ (penyembuh), Huda (petunjuk), dan Rahmah',
          'Sekadar karya sastra terbaik zaman jahiliyah',
          'Kitab ramalan nasib dan mantra tolak bala',
          'Hanya kumpulan aturan hukum pidana'
        ],
        correctAnswer: 0,
        explanation: 'Surat Yunus: 57 menegaskan Al-Qur’an sebagai Mau’izhah, Syifa bagi penyakit dada, Huda, dan Rahmah.'
      },
      {
        id: 'em1_2',
        subjectId: 'tazkiyatun_nafs',
        question: 'Riya dikategorikan oleh Rasulullah ﷺ sebagai syirik ashghar karena...',
        type: 'mcq',
        points: 2,
        options: [
          'Menyembah patung berhala secara terang-terangan',
          'Menyertakan keinginan dipuji makhluk dalam amalan yang seharusnya murni karena Allah',
          'Meninggalkan salat fardhu secara sengaja',
          'Mengambil riba dalam perniagaan'
        ],
        correctAnswer: 1,
        explanation: 'Riya adalah menyekutukan niat ibadah dengan mengharapkan pujian manusia.'
      },
      {
        id: 'em1_3',
        subjectId: 'fikih',
        question: 'Air suci mensucikan (thahir muthahhir) yang boleh dipakai berwudu menurut fikih adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Air mutanajjis yang terkena najis dan berubah warna',
          'Air mutlak (air hujan, sumur, sungai, laut) yang tidak berubah sifatnya',
          'Air kopi dan teh manis yang harum baunya',
          'Air musta’mal dalam jumlah sedikit yang sudah dipakai thaharah wajib'
        ],
        correctAnswer: 1,
        explanation: 'Hanya air mutlak yang memiliki sifat thahir muthahhir (suci dan mensucikan).'
      },
      {
        id: 'em1_4',
        subjectId: 'sirah',
        question: 'Gelar kehormatan yang disematkan penduduk Makkah kepada Nabi Muhammad ﷺ sebelum masa kenabian karena kejujurannya adalah...',
        type: 'mcq',
        points: 2,
        options: ['As-Siddiq', 'Al-Amin', 'Al-Faruq', 'Saifullah'],
        correctAnswer: 1,
        explanation: 'Rasulullah ﷺ dikenal sebagai Al-Amin (orang yang terpercaya) sejak masa muda.'
      },
      {
        id: 'em1_5',
        subjectId: 'tafsir',
        question: 'Ayat kelima dalam Surah Al-Fatihah, “Iyyaka na’budu wa iyyaka nasta’in”, mengajarkan dua prinsip utama yaitu...',
        type: 'mcq',
        points: 2,
        options: [
          'Keadilan dan musyawarah',
          'Pemurnian ibadah hanya kepada Allah dan penyandaran pertolongan mutlak kepada-Nya',
          'Hukum qishash dan diyat',
          'Tata cara pembagian warisan'
        ],
        correctAnswer: 1,
        explanation: 'Ayat ini adalah poros tauhid uluhiyah dan kepasrahan istianah.'
      },
      {
        id: 'em1_6',
        subjectId: 'muamalah',
        question: 'Unsur apakah yang membatalkan akad jual beli akibat adanya ketidakpastian atau spekulasi yang merugikan salah satu pihak?',
        type: 'mcq',
        points: 2,
        options: ['Taradhin (saling rida)', 'Gharar fahisy', 'Kuitansi pembayaran', 'Adanya saksi'],
        correctAnswer: 1,
        explanation: 'Gharar fahisy (ketidakjelasan berat) diharamkan oleh syariat karena memicu penipuan dan perselisihan.'
      },
      {
        id: 'em1_7',
        subjectId: 'hadis',
        question: 'Manakah kelima syarat hadis sahih yang dirumuskan oleh para ulama ahli hadis (muhadditsin)?',
        type: 'mcq',
        points: 2,
        options: [
          'Sanad bersambung, perawi adil, perawi dhabith, selamat dari syudzudz, dan selamat dari ‘illah',
          'Perawi kaya raya, berasal dari satu suku, hafal syair, dan matan pendek',
          'Hanya diriwayatkan oleh satu sahabat tanpa perlu penelitian sanad',
          'Dikenal luas di media sosial walaupun tanpa sanad tertulis'
        ],
        correctAnswer: 0,
        explanation: 'Lima syarat mutlak hadis sahih meliputi ittishalus sanad, ‘adalah, dhabth, tidak syadz, dan tidak mu’allal.'
      },
      {
        id: 'em1_8',
        subjectId: 'tazkiyatun_nafs',
        question: 'Bagaimana pembagian tiga pilar utama sabar dalam khazanah ilmu tazkiyatun nafs?',
        type: 'mcq',
        points: 2,
        options: [
          'Sabar dalam ketaatan, sabar menjauhi maksiat, dan sabar menghadapi ketentuan takdir Allah',
          'Sabar menunggu pujian, sabar berdebat, dan sabar mengumpulkan harta',
          'Diam seribu bahasa saat sakit tanpa berobat maupun berdoa',
          'Hanya menahan lapar selama siang hari bulan Ramadhan'
        ],
        correctAnswer: 0,
        explanation: 'Para ulama sepakat membagi sabar ke dalam tiga pilar tersebut agar hidup mukmin selalu terkendali.'
      }
    ]
  },

  2: {
    id: 'eval_m2',
    title: 'Evaluasi Komprehensif Bulan 2: Pendalaman dan Penguatan Pemahaman (Hari 31–60)',
    type: 'bulanan',
    month: 2,
    dayRange: 'Hari 31–60',
    description: 'Mengukur pemahaman terhadap salat sunnah, sujud sahwi, adab lisan, kisah hijrah, Piagam Madinah, Surah Luqman, utang-piutang, dan fintech syariah.',
    durationMinutes: 45,
    passingScore: 75,
    questions: [
      {
        id: 'em2_1',
        subjectId: 'fikih',
        question: 'Jika seorang imam ragu apakah ia sudah mengerjakan 3 atau 4 rakaat dalam salat Isya, maka tindakan yang disunnahkan adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Langsung membatalkan salat dan mulai dari awal',
          'Mengambil jumlah yang paling yakin (3 rakaat), menambah satu rakaat, lalu sujud sahwi sebelum salam',
          'Mengambil jumlah terbanyak (4 rakaat) lalu langsung salam',
          'Bertanya secara lisan kepada makmum'
        ],
        correctAnswer: 1,
        explanation: 'Kaidah fikih: "Al-yaqinu la yuzalu bisy-syakk" (keyakinan tidak gugur dengan keraguan). Ambil jumlah minimal yang yakin lalu lakukan sujud sahwi.'
      },
      {
        id: 'em2_2',
        subjectId: 'hadis',
        question: 'Pesan wasiat Rasulullah ﷺ yang diulang tiga kali kepada sahabat yang meminta nasihat singkat adalah...',
        type: 'mcq',
        points: 2,
        options: ['“Perbanyaklah berdagang”', '“La taghdhab” (Jangan kamu marah)', '“Pergilah safar”', '“Jangan tidur larut malam”'],
        correctAnswer: 1,
        explanation: 'Hadis Sahih Bukhari menegaskan Rasulullah ﷺ bersabda berulang: "La taghdhab" (Jangan marah).'
      },
      {
        id: 'em2_3',
        subjectId: 'sirah',
        question: 'Piagam Madinah yang disusun oleh Rasulullah ﷺ menjadi tonggak sejarah peradaban karena...',
        type: 'mcq',
        points: 2,
        options: [
          'Menegakkan tatanan hukum berkeadilan dan persaudaraan lintas kelompok yang menjamin keamanan kaum muslimin dan non-muslim',
          'Mengusir seluruh suku selain Quraisy dari Madinah',
          'Menghapuskan kewajiban membayar zakat',
          'Mewajibkan semua penduduk memeluk agama Islam seketika'
        ],
        correctAnswer: 0,
        explanation: 'Piagam Madinah menjamin kebebasan beragama, keadilan hukum, dan persatuan pertahanan bagi seluruh warga Madinah.'
      },
      {
        id: 'em2_4',
        subjectId: 'tafsir',
        question: 'Dalam Surah Luqman ayat 13, Luqman menasihati anaknya bahwa dosa terbesar yang merupakan kezaliman besar adalah...',
        type: 'mcq',
        points: 2,
        options: ['Durhaka kepada kedua orang tua', 'Syirik (menyekutukan Allah)', 'Mencuri harta orang lain', 'Memutus tali silaturahmi'],
        correctAnswer: 1,
        explanation: 'QS. Luqman: 13: "Innasysyirka lazhulmun ‘azhim" (Sesungguhnya syirik itu benar-benar kezaliman yang besar).'
      },
      {
        id: 'em2_5',
        subjectId: 'muamalah',
        question: 'Hukum menunda pelunasan utang bagi orang yang sudah mampu membayarnya (matlul ghaniyi) menurut hadis sahih adalah...',
        type: 'mcq',
        points: 2,
        options: ['Mubah', 'Zhulmun (kezaliman yang diharamkan)', 'Makruh tanzih', 'Sunnah'],
        correctAnswer: 1,
        explanation: 'Rasulullah ﷺ bersabda: "Matlul ghaniyi zhulmun" (Menunda pembayaran utang bagi orang yang mampu adalah kezaliman).'
      },
      {
        id: 'em2_6',
        subjectId: 'tazkiyatun_nafs',
        question: 'Hakikat tawakal sejati menurut syariat Islam adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Pasrah tanpa usaha apa pun sejak awal',
          'Menggabungkan ikhtiar maksimal sesuai syariat lalu menyerahkan hasilnya secara total kepada kehendak Allah',
          'Hanya mengandalkan kehebatan strategi pribadi tanpa berdoa',
          'Menolak berobat ketika sakit'
        ],
        correctAnswer: 1,
        explanation: 'Tawakal adalah perpaduan ikhtiar fisik anggota badan dengan penyerahan hati penuh kepada Allah.'
      },
      {
        id: 'em2_7',
        subjectId: 'muamalah',
        question: 'Mengapa layanan paylater atau pinjaman daring yang menetapkan denda keterlambatan berbunga diharamkan dalam fikih muamalah?',
        type: 'mcq',
        points: 2,
        options: [
          'Karena tambahan persentase atau denda finansial atas pokok utang tersebut termasuk kategori riba nasi’ah',
          'Karena transaksi tersebut menggunakan aplikasi ponsel pintar',
          'Karena akad tersebut hanya boleh dilakukan secara tunai di pasar tradisional',
          'Karena tidak menggunakan mata uang dinar dan dirham'
        ],
        correctAnswer: 0,
        explanation: 'Setiap tambahan atas pokok utang yang dipersyaratkan di awal atau karena penundaan tempo pembayaran adalah riba nasi’ah.'
      },
      {
        id: 'em2_8',
        subjectId: 'alquran',
        question: 'Bagaimanakah gambaran kepribadian "Ibadurrahman" dalam Surah Al-Furqan ayat 63–64?',
        type: 'mcq',
        points: 2,
        options: [
          'Berjalan rendah hati di muka bumi, menyapa dengan damai, dan menghidupkan malam dengan sujud serta qiyam',
          'Membanggakan nasab keluarga di hadapan penduduk kota',
          'Menolak bekerja untuk mencari nafkah keluarga',
          'Beribadah hanya ketika diliput khalayak ramai'
        ],
        correctAnswer: 0,
        explanation: 'QS. Al-Furqan: 63-64 menggambarkan sifat mulia hamba Allah Yang Maha Pengasih dalam keseharian dan keheningan malam.'
      }
    ]
  },

  3: {
    id: 'eval_m3',
    title: 'Evaluasi Komprehensif Bulan 3: Penerapan, Pembiasaan, dan Integrasi Ilmu (Hari 61–90)',
    type: 'bulanan',
    month: 3,
    dayRange: 'Hari 61–90',
    description: 'Mengukur penguasaan zakat, etika musyawarah, peristiwa Fathu Makkah, ruqyah mandiri syar’i, istiqamah, dan rencana aksi amal seumur hidup.',
    durationMinutes: 45,
    passingScore: 75,
    questions: [
      {
        id: 'em3_1',
        subjectId: 'fikih',
        question: 'Nishab zakat harta simpanan (emas) yang telah mencapai haul satu tahun hijriah adalah setara dengan...',
        type: 'mcq',
        points: 2,
        options: ['85 gram emas murni', '20 gram emas murni', '500 gram perak', '10 gram emas murni'],
        correctAnswer: 0,
        explanation: 'Nishab zakat emas adalah 20 dinar yang setara dengan 85 gram emas murni dengan kadar zakat 2,5%.'
      },
      {
        id: 'em3_2',
        subjectId: 'sirah',
        question: 'Sikap keteladanan yang ditunjukkan Rasulullah ﷺ kepada kaum kafir Quraisy saat peristiwa Fathu Makkah (Penaklukan Makkah) adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Membalas dendam atas penindasan masa lalu',
          'Memaafkan secara menyeluruh dengan kalimat: “Pergilah kalian, sesungguhnya kalian adalah orang-orang yang bebas”',
          'Menyita seluruh rumah dan aset penduduk Makkah',
          'Menjadikan mereka tawanan perang seumur hidup'
        ],
        correctAnswer: 1,
        explanation: 'Rasulullah ﷺ memaafkan mereka tanpa dendam sebagaimana Nabi Yusuf memaafkan saudara-saudaranya.'
      },
      {
        id: 'em3_3',
        subjectId: 'alquran',
        question: 'Ruqyah syar’iyyah yang diperbolehkan dalam Islam harus memenuhi tiga syarat utama, yaitu...',
        type: 'mcq',
        points: 2,
        options: [
          'Menggunakan ayat Al-Qur’an/doa ma’tsur, dengan bahasa yang dipahami, dan meyakini bahwa kesembuhan semata-mata dari Allah',
          'Menggunakan rajah mantra kuno dan dupa wewangian',
          'Menyembelih binatang khusus sebagai tebusan makhluk gaib',
          'Hanya boleh dilakukan oleh dukun bergelar spiritual'
        ],
        correctAnswer: 0,
        explanation: 'Konsensus ulama menetapkan tiga syarat sah ruqyah: dengan kalamullah/asma-Nya, bahasa Arab/dipahami, dan keyakinan mutlak kesembuhan dari Allah.'
      },
      {
        id: 'em3_4',
        subjectId: 'tazkiyatun_nafs',
        question: 'Sikap batin ketika seorang muslim menerima takdir yang telah terjadi tanpa menyalahkan keadaan atau berandai-andai dengan kata "seandainya" disebut...',
        type: 'mcq',
        points: 2,
        options: ['Keluh kesah', 'Rida dan mengucap “Qadarullahu wa ma sya-a fa’al”', 'Putus asa', 'Ghibah'],
        correctAnswer: 1,
        explanation: 'Nabi ﷺ mengajarkan apabila terjadi sesuatu di luar harapan untuk berucap: "Qadarullahu wa ma sya-a fa’al" dan tidak membuka pintu setan dengan kata "law" (seandainya).'
      },
      {
        id: 'em3_5',
        subjectId: 'muamalah',
        question: 'Wasiat harta dalam syariat Islam memiliki batasan maksimal sebesar...',
        type: 'mcq',
        points: 2,
        options: ['100% dari seluruh kekayaan', 'Maksimal 1/3 (sepertiga) harta bagi non-ahli waris', '50% dari total harta warisan', 'Tidak ada batasan'],
        correctAnswer: 1,
        explanation: 'Hadis Sa’ad bin Abi Waqqas: "Ats-tsulutsu wats-tsulutsu katsir" (Sepertiga, dan sepertiga itu sudah banyak) serta tidak boleh diwasiatkan kepada ahli waris yang berhak menerima faraidh.'
      },
      {
        id: 'em3_6',
        subjectId: 'hadis',
        question: 'Amalan yang paling dicintai oleh Allah Ta’ala menurut hadis Sahih Bukhari dan Muslim adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Amalan yang dikerjakan sekali seumur hidup secara besar-besaran',
          'Amalan yang dikerjakan secara berkesinambungan (istiqamah) meskipun sedikit',
          'Amalan yang disiarkan di depan orang banyak',
          'Amalan yang hanya dikerjakan saat merasa bahagia'
        ],
        correctAnswer: 1,
        explanation: 'Rasulullah ﷺ bersabda: "Adwamuha wa in qalla" (Amalan yang paling dicintai Allah adalah yang paling konsisten/istiqamah meskipun sedikit).'
      },
      {
        id: 'em3_7',
        subjectId: 'fikih',
        question: 'Bagaimana sikap syar’i terbaik terhadap perbedaan ijtihad fikih cabang (furu’iyyah) di antara empat mazhab mu’tabar?',
        type: 'mcq',
        points: 2,
        options: [
          'Menjadikannya kelapangan rahmat, menghormati pendapat yang bersandar dalil, dan tetap menjaga persatuan ukhuwah',
          'Mewajibkan seluruh muslim mengikuti hanya satu kebiasaan kampung halaman',
          'Memutus silaturahmi masjid apabila terjadi perbedaan tata cara ibadah sunnah',
          'Menolak seluruh kitab fikih karya ulama salaf'
        ],
        correctAnswer: 0,
        explanation: 'Adab ikhtilaf mengajarkan kelapangan dada dan penghormatan terhadap ijtihad muktabar para ulama.'
      },
      {
        id: 'em3_8',
        subjectId: 'tazkiyatun_nafs',
        question: 'Apakah ciri utama tingkatan jiwa Nafsul Muthma’innah yang mendapat panggilan cinta Allah dalam QS. Al-Fajr: 27–30?',
        type: 'mcq',
        points: 2,
        options: [
          'Jiwa yang tenang, tenteram dalam keimanan, rida kepada Allah, dan diridai untuk kembali ke surga-Nya',
          'Jiwa yang selalu gelisah dan gemar mengejar sanjungan manusia',
          'Jiwa yang menuruti seluruh dorongan hawa nafsu sesaat',
          'Jiwa yang meragukan janji kebangkitan hari akhir'
        ],
        correctAnswer: 0,
        explanation: 'QS. Al-Fajr: 27-30: "Ya ayyatuhan nafsul muthma’innah, irji’i ila rabbiki radhiyatan mardhiyyah".'
      }
    ]
  }
};

export const FINAL_ASSESSMENT: ComprehensiveAssessment = {
  id: 'eval_akhir',
  title: 'Evaluasi Akhir Pembelajaran Terintegrasi (Hari 1–90)',
  type: 'akhir',
  dayRange: 'Hari 1–90',
  description: 'Ujian komprehensif menguji penguasaan seluruh 7 mata pelajaran: Al-Qur’an, Hadis, Fikih, Sirah, Tafsir, Muamalah, dan Tazkiyatun Nafs.',
  durationMinutes: 75,
  passingScore: 75,
  questions: [
    {
      id: 'fa_1',
      subjectId: 'alquran',
      question: 'Apa makna Al-Qur’an sebagai “Asy-Syifa” bagi orang yang beriman?',
      type: 'mcq',
      points: 2,
      options: [
        'Hanya menyembuhkan penyakit demam',
        'Penawar dan obat yang menyembuhkan penyakit keraguan, kegelisahan batin, kotoran hati, dan kelapangan dada',
        'Kitab jimat yang digantung di dinding rumah',
        'Obat kimia buatan manusia'
      ],
      correctAnswer: 1,
      explanation: 'Al-Qur’an menyembuhkan penyakit akidah, syubhat, syahwat, dan menghadirkan kedamaian rohani.'
    },
    {
      id: 'fa_2',
      subjectId: 'hadis',
      question: 'Hadis Jibril ‘alaihissalam mengajarkan tingkatan rukun agama yang mencakup tiga tingkatan berturut-turut yaitu...',
      type: 'mcq',
      points: 2,
      options: [
        'Islam, Iman, dan Ihsan',
        'Syariat, Tarekat, dan Hakikat',
        'Fikih, Usul Fikih, dan Mantiq',
        'Akidah, Muamalah, dan Jinayah'
      ],
      correctAnswer: 0,
      explanation: 'Tiga tingkatan dinul Islam dalam Hadis Sahih Muslim adalah Islam (amalan lahir), Iman (keyakinan batin), dan Ihsan (kesadaran muraqabah).'
    },
    {
      id: 'fa_3',
      subjectId: 'fikih',
      question: 'Tumakninah dalam rukun salat (rukuk, iktidal, sujud, duduk di antara dua sujud) hukumnya adalah...',
      type: 'mcq',
      points: 2,
      options: [
        'Sunnah hai’at yang boleh ditinggalkan tanpa membatalkan salat',
        'Rukun wajib yang jika ditinggalkan secara sengaja maka salat tidak sah',
        'Makruh',
        'Mubah'
      ],
      correctAnswer: 1,
      explanation: 'Tumakninah (berdiam sejenak seukuran membaca tasbih) adalah rukun sahnya salat sebagaimana hadis al-musi’u shalatah.'
    },
    {
      id: 'fa_4',
      subjectId: 'sirah',
      question: 'Khotbah terakhir Rasulullah ﷺ pada peristiwa Haji Wada’ di Padang Arafah menekankan nilai abadi berupa...',
      type: 'mcq',
      points: 2,
      options: [
        'Kesucian darah, harta, kehormatan manusia, pemuliaan kaum wanita, dan penghapusan riba',
        'Kewajiban menaklukkan seluruh kerajaan dunia dengan senjata',
        'Kewajiban menghapus perbedaan bahasa di seluruh dunia',
        'Pemberian privilese khusus bagi bangsawan Quraisy'
      ],
      correctAnswer: 0,
      explanation: 'Khotbah Haji Wada’ adalah piagam hak asasi manusia universal yang menghapuskan tradisi zalim jahiliyah.'
    },
    {
      id: 'fa_5',
      subjectId: 'tafsir',
      question: 'Surah Al-Hujurat memuat etika sosial Qur’ani. Di antaranya adalah larangan “tajassus” yang bermakna...',
      type: 'mcq',
      points: 2,
      options: [
        'Mencari-cari dan memata-matai aib serta kesalahan orang lain',
        'Berbuat zalim dalam takaran timbangan',
        'Memotong pohon di saat perang',
        'Menimbun bahan pokok'
      ],
      correctAnswer: 0,
      explanation: 'QS. Al-Hujurat: 12: "Wa la tajassasu" melarang memata-matai kesalahan saudara sesama muslim.'
    },
    {
      id: 'fa_6',
      subjectId: 'muamalah',
      question: 'Kaidah dasar muamalah menyatakan bahwa pada dasarnya segala bentuk transaksi perniagaan adalah mubah (boleh) kecuali...',
      type: 'mcq',
      points: 2,
      options: [
        'Jika dilakukan dengan menggunakan teknologi gawai',
        'Ada dalil syar’i sahih yang mengharamkannya (mengandung riba, gharar, maysir, atau kezaliman)',
        'Jika pedagangnya berasal dari suku yang berbeda',
        'Jika menggunakan mata uang selain dinar dan dirham'
      ],
      correctAnswer: 1,
      explanation: 'Kaidah fikih: "Al-ashlu fil mu’amalati al-ibahah hatta yadulla ad-dalilu ‘ala tahrimiha".'
    },
    {
      id: 'fa_7',
      subjectId: 'tazkiyatun_nafs',
      question: 'Tiga pilar taubat nasuha yang berkaitan dengan dosa terhadap hak Allah Ta’ala adalah...',
      type: 'mcq',
      points: 2,
      options: [
        'Menyesal sungguh-sungguh, seketika mencabut diri dari dosa, dan bertekad kuat tidak mengulanginya',
        'Membayar denda materi kepada penguasa dan berpuasa sehari',
        'Cukup mengucapkan istighfar di bibir tanpa mengubah perbuatan',
        'Menunggu hingga usia tua baru bertaubat'
      ],
      correctAnswer: 0,
      explanation: 'Tiga syarat taubat adalah an-nadam (penyesalan), al-iqli’ (meninggalkan dosa), dan al-’azm ‘ala alla ya’ud (bertekad tidak mengulangi).'
    },
    {
      id: 'fa_8',
      subjectId: 'tazkiyatun_nafs',
      question: 'Dalam Al-Qur’an Surah Asy-Syu’ara ayat 88–89, siapakah golongan yang paling beruntung saat menghadap Allah di Hari Kiamat?',
      type: 'mcq',
      points: 2,
      options: [
        'Orang yang datang membawa Qalbun Salim (hati yang bersih dari syirik, riya, dan hasad serta tunduk pada syariat)',
        'Orang yang datang mengandalkan banyaknya harta benda dan keturunan semata',
        'Orang yang gemar berdebat tanpa pernah mengamalkan ilmunya',
        'Orang yang hanya mengejar kehormatan duniawi'
      ],
      correctAnswer: 0,
      explanation: 'QS. Asy-Syu’ara: 88-89 menjelaskan hanya orang yang datang kepada Allah dengan hati yang selamat (qalbun salim) yang beruntung di akhirat.'
    },
    {
      id: 'fa_9',
      subjectId: 'fikih',
      question: 'Dua hikmah utama disyariatkannya zakat fitrah menjelang Idul Fitri menurut hadis Ibnu Abbas adalah...',
      type: 'mcq',
      points: 2,
      options: [
        'Membersihkan jiwa orang berpuasa dari kata sia-sia dan memberi kecukupan pangan bagi kaum miskin',
        'Mengganti seluruh salat wajib yang ditinggalkan selama setahun',
        'Meningkatkan gengsi keluarga di lingkungan tempat tinggal',
        'Sekadar sumbangan sukarela tanpa batas waktu maupun takaran'
      ],
      correctAnswer: 0,
      explanation: 'Hadis Ibnu Abbas menerangkan fungsi zakat fitrah sebagai thuhratan lish-sha’im dan thu’matan lil masakin.'
    },
    {
      id: 'fa_10',
      subjectId: 'alquran',
      question: 'Mengapa para ulama salaf menegaskan kalimat “Al-istiqamatu a’zhamul karamah” (Istikamah adalah karomah teragung)?',
      type: 'mcq',
      points: 2,
      options: [
        'Karena konsistensi menuntut ilmu, menjaga tauhid, dan mengamalkan ketaatan sepanjang hayat adalah anugerah tertinggi bagi mukmin',
        'Karena karomah hanya dimiliki oleh orang yang bisa terbang di udara',
        'Karena setelah tamat belajar 90 hari, seorang peserta tidak wajib lagi menuntut ilmu',
        'Karena amal sekali seumur hidup lebih utama dibanding pembiasaan harian'
      ],
      correctAnswer: 0,
      explanation: 'Para ulama menegaskan bahwa keteguhan istikamah dalam ketaatan dan pengamalan ilmu merupakan puncak karomah seorang hamba.'
    }
  ]
};
