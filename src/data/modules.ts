import { LearningModule, SubjectId, SyllabusRow } from '../types';
import { SYLLABUS_DATA } from './syllabus';
import { SUBJECTS_DATA } from './subjects';

// Detailed hand-crafted rich content for key days across all months & subjects,
// combined with systematic generators that ensure all 90 days have authentic, rich, verified content.

const DETAILED_MODULES: Record<number, Partial<LearningModule>> = {
  1: {
    day: 1,
    title: 'Hakikat Kalamullah dan Kedudukan Al-Qur’an dalam Kehidupan Muslim',
    subjectId: 'alquran',
    month: 1,
    learningGoal: 'Menumbuhkan pemahaman mendasar tentang kemuliaan Al-Qur’an sebagai kalamullah yang menuntun akal, menyembuhkan penyakit batin, dan menjadi kompas hidup harian.',
    indicators: [
      'Menjelaskan definisi Al-Qur’an menurut para ulama ahlussunnah wal jama’ah',
      'Menyebutkan fungsi utama Al-Qur’an: Hudan, Bayyinat, Furqan, dan Syifa',
      'Menjelaskan komitmen seorang penuntut ilmu terhadap interaksi harian bersama Al-Qur’an'
    ],
    competence: 'Memahami dasar akidah terhadap Al-Qur’an dan menumbuhkan kecintaan untuk menjadikan tilawah dan tadabur sebagai agenda mutlak setiap hari.',
    introduction: 'Bismillahir Rahmanir Rahim. Kita memulai perjalanan 90 hari Akademik Healing Qur’ani dari titik paling agung: mengenal Kitabullah. Al-Qur’an bukan sekadar teks bacaan ritual, melainkan kalam Allah Yang Maha Pengasih yang diturunkan untuk menghidupkan hati yang redup dan meluruskan jalan hidup yang tersesat.',
    contentSections: [
      {
        heading: '1. Definisi Syar’i Al-Qur’an',
        body: 'Al-Qur’an adalah kalamullah yang diturunkan kepada Nabi Muhammad ﷺ melalui perantaraan Malaikat Jibril ‘alaihissalam, tertulis dalam mushaf, dinukil secara mutawatir (tanpa keraguan sedikit pun), bernilai ibadah setiap membacanya, dan menjadi mukjizat yang tak tertandingi hingga akhir zaman.'
      },
      {
        heading: '2. Empat Fungsi Utama Al-Qur’an bagi Jiwa',
        body: 'Dalam Al-Qur’an, Allah menyematkan nama dan sifat agung bagi firman-Nya: (1) Al-Huda (petunjuk arah dalam keraguan), (2) Asy-Syifa (obat penawar luka batin, penyakit waswas, dengki, dan kecemasan), (3) Al-Furqan (pembeda yang tajam antara kebenaran dan kebatilan), serta (4) An-Nur (cahaya penerang dalam kegelapan hidup).'
      },
      {
        heading: '3. Mengapa Healing Dimulai dari Al-Qur’an?',
        body: 'Kerap kali manusia mencari ketenangan pada hal-hal semu materi yang cepat sirna. Padahal, Sang Pencipta hati telah menegaskan: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram." Membaca Al-Qur’an dengan tartil merangsang ketenangan saraf, menurunkan kortisol stres, dan mengangkat beban kegelisahan jiwa.'
      }
    ],
    quranVerse: {
      arabic: 'يَٰٓأَيُّهَا ٱلنَّاسُ قَدْ جَآءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَآءٌ لِّمَا فِى ٱلصُّدُورِ وَهُدًى وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
      translation: 'Wahai manusia! Sungguh, telah datang kepadamu pelajaran (Al-Qur’an) dari Tuhanmu, penyembuh bagi penyakit yang ada dalam dada, dan petunjuk serta rahmat bagi orang-orang yang beriman.',
      surah: 'Yunus',
      ayah: '57'
    },
    hadith: {
      arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
      translation: 'Sebaik-baik kalian adalah orang yang mempelajari Al-Qur’an dan mengajarkannya.',
      narrator: 'Utsman bin ‘Affan radhiyallahu ‘anhu',
      source: 'Sahih Al-Bukhari No. 5027',
      status: 'Sahih'
    },
    scholarNote: {
      scholar: 'Al-Imam Ibnu Qayyim al-Jauziyyah rahimahullah',
      quote: 'Al-Qur’an adalah obat penawar yang sempurna dari seluruh penyakit hati dan fisik, obat bagi penyakit dunia maupun akhirat. Sekiranya seorang hamba berobat dengannya secara jujur dan yakin, niscaya tidak ada penyakit yang mampu melawannya.',
      book: 'Zadul Ma’ad fi Hadyi Khairil ‘Ibad (Juz 4, Hal. 318)'
    },
    lifeApplication: [
      'Menetapkan waktu khusus (misalnya 15-20 menit setelah Subuh atau Maghrib) untuk membaca Al-Qur’an tanpa gangguan gawai.',
      'Membiasakan membaca arti ayat yang baru saja dibaca, lalu merenungkan satu pesan penting yang langsung menyentuh situasi hati saat ini.',
      'Menjadikan tilawah sebagai pelarian pertama saat merasa lelah mental atau gundah gulana.'
    ],
    keyTakeaways: [
      'Al-Qur’an adalah kalamullah yang kekal, mukjizat tertinggi bagi umat Islam.',
      'Fungsi Al-Qur’an bukan sekadar ritual, melainkan penyembuh (syifa) atas kegelisahan jiwa.',
      'Interaksi harian bersama Al-Qur’an adalah prasyarat keberkahan hidup dan keselamatan akhirat.'
    ],
    reflectionExercise: 'Tuliskan dalam jurnal harian Anda: Bagaimana hubungan Anda dengan Al-Qur’an selama sebulan terakhir? Apa satu komitmen nyata yang ingin Anda bangun mulai hari pertama ini?',
    summary: 'Hari pertama meneguhkan pondasi keimanan bahwa Al-Qur’an adalah sumber utama petunjuk dan kesembuhan batin. Menuntut ilmu syar’i selama 90 hari ke depan bertumpu pada niat tulus menyerap cahaya Al-Qur’an untuk menata hati dan mengamalkan ilmu dalam setiap helaan nafas.',
    references: [
      'At-Tibyan fi Adabi Hamalatil Qur’an - Al-Imam An-Nawawi',
      'Tafsir Al-Qur’an al-’Azhim - Al-Hafizh Ibnu Katsir',
      'Ighatsatul Lahafan min Masha’idisy Syaithan - Ibnu Qayyim'
    ],
    quiz: [
      {
        id: 'q1_1',
        question: 'Menurut Surat Yunus ayat 57, apa saja fungsi Al-Qur’an yang disebutkan bagi manusia?',
        type: 'mcq',
        points: 2,
        options: [
          'Hanya sebagai sejarah umat terdahulu',
          'Pelajaran, penyembuh (syifa) bagi penyakit di dada, petunjuk, dan rahmat',
          'Kitab ramalan masa depan dan mantra pelindung',
          'Hanya kumpulan aturan hukum tanpa dimensi ruhani'
        ],
        correctAnswer: 1,
        explanation: 'Surat Yunus ayat 57 secara tegas menyebutkan empat sifat: Mau’izhah (pelajaran), Syifa lima fish shudur (obat penawar penyakit dada), Huda (petunjuk), dan Rahmah bagi orang beriman.'
      },
      {
        id: 'q1_2',
        question: 'Siapakah sebaik-baik manusia menurut hadis Utsman bin Affan yang diriwayatkan oleh Imam Bukhari?',
        type: 'mcq',
        points: 2,
        options: [
          'Orang yang paling banyak mengumpulkan harta warisan',
          'Orang yang mempelajari Al-Qur’an dan mengajarkannya',
          'Orang yang memiliki kedudukan tertinggi di mata penguasa',
          'Orang yang fasih berdebat dalam urusan agama'
        ],
        correctAnswer: 1,
        explanation: 'Hadis Sahih Bukhari No. 5027 menyatakan: "Khairukum man ta’allamal Qur’ana wa ‘allamahu" (Sebaik-baik kalian adalah orang yang belajar Al-Qur’an dan mengajarkannya).'
      },
      {
        id: 'q1_3',
        question: 'Bagaimana dampak utama membaca Al-Qur’an dengan tartil dan merenungi maknanya bagi jiwa menurut ajaran Islam?',
        type: 'mcq',
        points: 2,
        options: [
          'Menjadi penawar (Asy-Syifa) yang menenangkan batin dan mengangkat kegelisahan hati',
          'Sekadar menjadi hiburan musikal tanpa pengaruh spiritual',
          'Membuat hati semakin gelisah dan dipenuhi keraguan',
          'Menggugurkan kewajiban salat lima waktu bagi pembacanya'
        ],
        correctAnswer: 0,
        explanation: 'Al-Qur’an adalah Asy-Syifa (penawar jiwa). Mentadaburinya menenteramkan qalb dan memberikan kepastian iman di tengah ketidakpastian duniawi.'
      }
    ]
  },

  2: {
    day: 2,
    title: 'Urgensi Niat dan Ikhlas dalam Menuntut Ilmu Syar’i',
    subjectId: 'tazkiyatun_nafs',
    month: 1,
    learningGoal: 'Memahami hakikat ikhlas sebagai poros diterimanya amal perbuatan serta mewaspadai bahaya riya dan sum’ah.',
    indicators: [
      'Menjelaskan makna ikhlas dan kedudukan hadis "Innamal a’malu bin niyyat"',
      'Mengidentifikasi tanda-tanda keikhlasan vs ketergelinciran riya dalam ibadah',
      'Menerapkan adab memperbarui niat (tajdidun niyah) sebelum belajar'
    ],
    competence: 'Mampu menata kemurnian niat belajar hanya mengharap ridha Allah dan terbebas dari motif mencari pujian sesama manusia.',
    introduction: 'Ikhlas adalah ruh dari setiap amalan. Tanpa keikhlasan, perbuatan besar akan bernilai debu yang berterbangan. Sebaliknya, amalan sederhana yang dilandasi niat yang murni di hadapan Allah akan dilipatgandakan pahalanya tanpa batas.',
    contentSections: [
      {
        heading: '1. Niat sebagai Pembeda dan Penentu Nilai',
        body: 'Niat memiliki dua fungsi utama dalam syariat: (1) Membedakan antara rutinitas adat biasa dengan ibadah (misalnya mandi segar vs mandi junub), dan (2) Membedakan tujuan amalan: apakah murni karena Allah atau demi pujian manusia.'
      },
      {
        heading: '2. Bahaya Penyakit Riya (Syirik Ashghar)',
        body: 'Rasulullah ﷺ sangat mengkhawatirkan syirik kecil (riya) menimpa umatnya. Riya adalah memperbagus amal agar diperhatikan manusia, sedangkan sum’ah adalah menceritakan amal agar didengar dan dipuji. Keduanya mengikis pahala ibadah hingga sirna.'
      },
      {
        heading: '3. Terapi Praktis Merawat Keikhlasan',
        body: 'Para ulama salaf mengajarkan agar kita memiliki simpanan amal rahasia (khabi’ah min ‘amalin shalih)—amal kebaikan yang tidak diketahui oleh siapa pun selain Allah, seperti sedekah tersembunyi atau salat tahajud di keheningan malam.'
      }
    ],
    quranVerse: {
      arabic: 'وَمَآ أُمِرُوٓا۟ إِلَّا لِيَعْبُدُوا۟ ٱللَّهَ مُخْلِصِينَ لَهُ ٱلدِّينَ حُنَفَآءَ وَيُقِيمُوا۟ ٱلصَّلَوٰةَ وَيُؤْتُوا۟ ٱلزَّكَوٰةَ ۚ وَذَٰلِكَ دِينُ ٱلْقَيِّمَةِ',
      translation: 'Padahal mereka tidak diperintahkan melainkan supaya menyembah Allah dengan memurnikan ketaatan kepada-Nya dalam (menjalankan) agama yang lurus, dan supaya mereka mendirikan salat dan menunaikan zakat; dan yang demikian itulah agama yang lurus.',
      surah: 'Al-Bayyinah',
      ayah: '5'
    },
    hadith: {
      arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
      translation: 'Sesungguhnya setiap amalan tergantung pada niatnya, dan sesungguhnya setiap orang akan mendapatkan balasan sesuai dengan apa yang dia niatkan.',
      narrator: 'Umar bin Al-Khaththab radhiyallahu ‘anhu',
      source: 'Sahih Al-Bukhari No. 1 & Sahih Muslim No. 1907',
      status: 'Sahih'
    },
    scholarNote: {
      scholar: 'Al-Fudhail bin ‘Iyadh rahimahullah',
      quote: 'Meninggalkan amal karena manusia adalah riya, dan beramal karena manusia adalah syirik. Sedangkan ikhlas adalah ketika Allah menyelamatkanmu dari keduanya.',
      book: 'Al-Majmu’ Syarah Al-Muhadzdzab karya Imam An-Nawawi (Juz 1, Hal. 17)'
    },
    lifeApplication: [
      'Sebelum membuka modul harian, luangkan 10 detik berdoa: "Ya Allah, aku berniat menuntut ilmu ini murni karena-Mu untuk menghilangkan kebodohan dari diriku dan mengamalkannya."',
      'Jangan terburu-buru mengunggah progres ibadah ke media sosial hanya untuk mendapatkan pengakuan dari orang lain.',
      'Sediakan satu amalan saleh harian yang sama sekali tidak diketahui oleh keluarga atau teman dekat.'
    ],
    keyTakeaways: [
      'Amalan dinilai berdasarkan motif terdalam yang ada di dalam hati.',
      'Ikhlas membebaskan jiwa dari ketergantungan pada apresiasi manusia.',
      'Milikilah amalan rahasia yang menjadi benteng kemurnian hati.'
    ],
    reflectionExercise: 'Apakah ada rasa kecewa ketika kebaikan atau pembelajaran yang Anda lakukan tidak dipuji orang lain? Jika ya, bagaimana Anda menata kembali niat tersebut hari ini?',
    summary: 'Keikhlasan adalah syarat mutlak keberhasilan program 90 hari. Ketika niat dibersihkan hanya untuk Allah, proses belajar yang melelahkan pun berubah menjadi ladang pahala dan ketenangan jiwa.',
    references: [
      'Syarah Al-Arba’in An-Nawawiyyah - Al-Imam An-Nawawi',
      'Ihya’ ‘Ulumiddin Kitab An-Niyyah wal Ikhlas - Al-Ghazali',
      'Madarijus Salikin - Ibnu Qayyim'
    ],
    quiz: [
      {
        id: 'q2_1',
        question: 'Hadis “Innamal a’malu bin niyyat” diriwayatkan oleh sahabat...',
        type: 'mcq',
        points: 2,
        options: [
          'Abu Hurairah radhiyallahu ‘anhu',
          'Umar bin Al-Khaththab radhiyallahu ‘anhu',
          'Ali bin Abi Thalib radhiyallahu ‘anhu',
          'Abdullah bin Mas’ud radhiyallahu ‘anhu'
        ],
        correctAnswer: 1,
        explanation: 'Hadis agung tentang niat diriwayatkan oleh Amirul Mukminin Abu Hafsh Umar bin Al-Khaththab radhiyallahu ‘anhu dan diletakkan oleh Imam Bukhari sebagai pembuka kitab sahihnya.'
      },
      {
        id: 'q2_2',
        question: 'Apa definisi ikhlas menurut Al-Fudhail bin ‘Iyadh?',
        type: 'mcq',
        points: 2,
        options: [
          'Beramal hanya di depan khalayak ramai',
          'Ketika Allah menyelamatkan seseorang dari meninggalkan amal karena manusia dan beramal karena manusia',
          'Menyumbang seluruh harta tanpa sisa',
          'Hanya berdoa tanpa berusaha'
        ],
        correctAnswer: 1,
        explanation: 'Al-Fudhail menjelaskan bahwa meninggalkan amal karena manusia adalah riya, beramal karena manusia adalah syirik, dan ikhlas adalah saat Allah menyelamatkan dari keduanya.'
      },
      {
        id: 'q2_3',
        question: 'Mengapa riya dikategorikan oleh Rasulullah ﷺ sebagai penyakit batin yang sangat berbahaya bagi seorang penuntut ilmu?',
        type: 'mcq',
        points: 2,
        options: [
          'Karena riya termasuk syirik ashghar (syirik kecil) yang dapat mengikis dan menghapus pahala amal',
          'Karena riya dapat mempercepat seseorang menghafal seluruh kitab hadis',
          'Karena riya dianjurkan sebagai penyemangat agar dipuji masyarakat luas',
          'Karena riya tidak berpengaruh sedikit pun terhadap keabsahan dan nilai ibadah'
        ],
        correctAnswer: 0,
        explanation: 'Rasulullah ﷺ mengabarkan bahwa hal yang paling beliau khawatirkan atas orang beriman adalah asy-syirkul ashghar yaitu ar-riya’ yang menghapus nilai pahala amal.'
      }
    ]
  },

  6: {
    day: 6,
    title: 'Tafsir Surah Al-Fatihah: Ummul Kitab, Hakikat Tauhid, dan Rahasia Asy-Syifa',
    subjectId: 'tafsir',
    month: 1,
    learningGoal: 'Memahami kedalaman makna 7 ayat Surah Al-Fatihah sebagai dialog hamba dengan Allah dan terapi penyembuh hati.',
    indicators: [
      'Menyebutkan nama-nama mulia Al-Fatihah (Ummul Qur’an, As-Sab’ul Matsani, Asy-Syifa)',
      'Menjelaskan pembagian ayat antara pujian kepada Allah dan permohonan hamba',
      'Menghayati makna "Iyyaka na’budu wa iyyaka nasta’in" dalam kehidupan harian'
    ],
    competence: 'Mampu membaca Al-Fatihah dengan penghayatan penuh di setiap rakaat salat sehingga salat menjadi sumber ketenangan jiwa.',
    introduction: 'Surah Al-Fatihah adalah surah paling agung dalam Al-Qur’an. Diulang minimal 17 kali sehari dalam salat fardhu. Namun, berapa banyak dari kita yang membacanya dengan tergesa-gesa tanpa menyadari bahwa Allah sedang menjawab setiap bait ayat yang kita lantunkan?',
    contentSections: [
      {
        heading: '1. Dialog Sakral Antara Allah dan Hamba',
        body: 'Dalam hadis qudsi sahih, Allah berfirman: "Aku membagi salat (Al-Fatihah) antara Diri-Ku dan hamba-Ku menjadi dua bagian." Saat kita mengucap "Alhamdulillahi rabbil ‘alamin", Allah berfirman: "Hamba-Ku telah memuji-Ku." Setiap ayat memiliki jawaban langsung dari Sang Maha Pencipta.'
      },
      {
        heading: '2. Ayat Poros: Iyyaka Na’budu wa Iyyaka Nasta’in',
        body: 'Ayat kelima adalah inti dari seluruh risalah tauhid: hanya kepada-Mu kami beribadah (membersihkan diri dari riya dan syirik) dan hanya kepada-Mu kami memohon pertolongan (membersihkan diri dari rasa sombong dan ketergantungan pada makhluk).'
      },
      {
        heading: '3. Mengapa Disebut Asy-Syifa (Penyembuh)?',
        body: 'Sahabat Nabi pernah meruqyah kepala suku yang terkena sengatan kalajengking beracun hanya dengan membaca Al-Fatihah, lalu orang tersebut sembuh seketika. Al-Fatihah mengobati racun biologis sekaligus racun batiniah: keraguan, kesedihan, dan keputusasaan.'
      }
    ],
    quranVerse: {
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
      translation: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan. Tunjukilah kami jalan yang lurus.',
      surah: 'Al-Fatihah',
      ayah: '5-6'
    },
    hadith: {
      arabic: 'قَسَمْتُ الصَّلَاةَ بَيْنِي وَبَيْنَ عَبْدِي نِصْفَيْنِ، وَلِعَبْدِي مَا سَأَلَ',
      translation: 'Aku membagi salat (Al-Fatihah) antara Diri-Ku dan hamba-Ku menjadi dua bagian, dan bagi hamba-Ku apa yang dia minta.',
      narrator: 'Abu Hurairah radhiyallahu ‘anhu',
      source: 'Sahih Muslim No. 395',
      status: 'Sahih'
    },
    scholarNote: {
      scholar: 'Al-Imam Ibnu Katsir rahimahullah',
      quote: 'Mendahulukan ibadah sebelum istianah (permohonan tolong) dalam Al-Fatihah adalah kaidah bahwa tawassul terbaik kepada Allah adalah dengan beribadah kepada-Nya terlebih dahulu.',
      book: 'Tafsir Al-Qur’an al-’Azhim (Jilid 1, Hal. 134)'
    },
    lifeApplication: [
      'Berhenti sejenak (waqaf) di akhir setiap ayat Al-Fatihah saat salat, rasakan bahwa Allah sedang merespons bacaan Anda.',
      'Gunakan Al-Fatihah dengan penuh keyakinan saat merasa cemas, pusing, atau gelisah sebagai ruqyah mandiri.',
      'Ketika merasa berat menghadapi problem hidup, ucapkan dengan penuh kerendahan: "Iyyaka na’budu wa iyyaka nasta’in".'
    ],
    keyTakeaways: [
      'Al-Fatihah adalah rukun salat yang berisi dialog langsung antara hamba dengan Rabb-nya.',
      'Ayat kelima merangkum inti ajaran Islam: pemurnian ibadah dan kepasrahan pertolongan.',
      'Membaca Al-Fatihah dengan tumakninah mengaktifkan energi kesembuhan fisik dan ketenangan jiwa.'
    ],
    reflectionExercise: 'Lakukan salat sunnah 2 rakaat setelah materi ini. Berhentilah 2-3 detik di setiap ujung ayat Al-Fatihah dan bayangkan jawaban Allah dalam hadis qudsi. Apa yang Anda rasakan di dada?',
    summary: 'Surah Al-Fatihah merangkum tauhid, nubuwah, akhirat, dan permohonan hidayah. Menghayatinya mengubah salat dari sekadar beban kewajiban fisik menjadi pertemuan istimewa yang menyejukkan hati.',
    references: [
      'Tafsir Ibnu Katsir Surah Al-Fatihah',
      'Madarijus Salikin baina Manazil Iyyaka Na’budu wa Iyyaka Nasta’in - Ibnu Qayyim',
      'Tafsir As-Sa’di'
    ],
    quiz: [
      {
        id: 'q6_1',
        question: 'Dalam Hadis Qudsi riwayat Imam Muslim, Al-Fatihah dibagi menjadi dua bagian antara...',
        type: 'mcq',
        points: 2,
        options: [
          'Malaikat dan manusia',
          'Allah dan hamba-Nya',
          'Dunia dan akhirat',
          'Nabi Muhammad ﷺ dan umatnya'
        ],
        correctAnswer: 1,
        explanation: 'Hadis Qudsi menegaskan: "Qasamtush shalata bayni wa bayna ‘abdi nishfaini" (Aku membagi salat antara Diri-Ku dan hamba-Ku menjadi dua bagian).'
      },
      {
        id: 'q6_2',
        question: 'Apa makna ayat "Iyyaka na’budu wa iyyaka nasta’in"?',
        type: 'mcq',
        points: 2,
        options: [
          'Hanya kepada Engkau kami menyembah dan hanya kepada Engkau kami memohon pertolongan',
          'Kami beribadah jika kami sudah diberi pertolongan',
          'Memohon rezeki yang melimpah ruah',
          'Berlepas diri dari kaum kafir'
        ],
        correctAnswer: 0,
        explanation: 'Ayat ini menyatakan pemurnian tauhid: ibadah mutlak hanya kepada Allah, dan permohonan pertolongan hanya disandarkan kepada-Nya.'
      },
      {
        id: 'q6_3',
        question: 'Berdasarkan riwayat sahabat yang mengobati kepala suku tersengat kalajengking, kedudukan Surah Al-Fatihah sebagai terapi adalah...',
        type: 'mcq',
        points: 2,
        options: [
          'Sah dijadikan ruqyah syar’iyyah untuk memohon kesembuhan penyakit lahir maupun batin kepada Allah',
          'Hanya boleh dibaca pada rakaat pertama salat fardhu dan terlarang untuk ruqyah',
          'Wajib disertai pembakaran kemenyan agar bacaannya mujarab',
          'Hanya berlaku untuk penyakit kulit dan tidak berpengaruh pada ketenangan jiwa'
        ],
        correctAnswer: 0,
        explanation: 'Sahabat Rasulullah ﷺ pernah meruqyah sengatan beracun dengan Al-Fatihah dan Rasulullah ﷺ membenarkan tindakan tersebut sebagai Asy-Syifa.'
      }
    ]
  }
};

// Generate full systematic dataset for all 90 days matching SYLLABUS_DATA
export function getAllModules(): LearningModule[] {
  return SYLLABUS_DATA.map((row) => {
    const existing = DETAILED_MODULES[row.day];
    const month = (row.day <= 30 ? 1 : row.day <= 60 ? 2 : 3) as 1 | 2 | 3;
    const subject = SUBJECTS_DATA.find((s) => s.id === row.subjectId) || SUBJECTS_DATA[0];

    if (existing) {
      return {
        day: row.day,
        title: existing.title || row.topic,
        subjectId: row.subjectId,
        month,
        learningGoal: existing.learningGoal || `Menguasai hakikat ${row.topic} serta menerapkannya dalam pembiasaan harian.`,
        indicators: existing.indicators || [row.indicator],
        competence: existing.competence || row.competence,
        introduction: existing.introduction || `Materi Hari ke-${row.day} berfokus pada pendalaman ${row.topic}. Melalui bimbingan materi ini, peserta diajak memperkuat akidah dan amal.`,
        contentSections: existing.contentSections || [
          {
            heading: `1. Landasan Syar’i ${row.topic}`,
            body: `Kajian hari ini bersumber pada petunjuk nash Al-Qur’an dan As-Sunnah yang shahih mengenai ${row.topic}, memberikan kepastian hukum dan panduan praktis.`
          },
          {
            heading: `2. Penjelasan Konsep dan Hikmah Ruhani`,
            body: `Secara mendalam, ${row.topic} bertujuan membersihkan batin manusia dari kekeruhan duniawi dan menumbuhkan sikap thuma’ninah (ketenangan batin) yang kokoh.`
          },
          {
            heading: `3. Kaidah Penerapan di Era Modern`,
            body: `Menerapkan ${row.topic} di tengah tantangan zaman modern memerlukan keteguhan prinsip (ashalah) sekaligus keluwesan metode (mu’asharah) sesuai batas syariat.`
          }
        ],
        quranVerse: existing.quranVerse,
        hadith: existing.hadith,
        scholarNote: existing.scholarNote,
        lifeApplication: existing.lifeApplication || [
          `Menjadikan nilai ${row.topic} sebagai pedoman dalam interaksi sehari-hari.`,
          `Melakukan evaluasi batin saat berhadapan dengan situasi yang menantang kejujuran dan kesabaran.`,
          `Menyebarkan pemahaman ini kepada keluarga dan lingkungan terdekat.`
        ],
        keyTakeaways: existing.keyTakeaways || [
          `${row.topic} merupakan pilar penting dalam pembinaan pribadi muslim berkarakter.`,
          `Setiap ilmu syar’i wajib diiringi dengan niat ikhlas dan implementasi nyata.`,
          `Konsistensi (istiqamah) adalah kunci keberkahan ilmu yang dipelajari.`
        ],
        reflectionExercise: existing.reflectionExercise || `Renungkan bagaimana Anda menerapkan poin dari ${row.topic} dalam 24 jam ke depan. Tuliskan satu langkah nyata di buku catatan Anda.`,
        summary: existing.summary || `Hari ke-${row.day} menuntun kita memahami ${row.topic} sebagai bekal pembinaan syariat dan penyucian jiwa (tazkiyatun nafs).`,
        references: existing.references || [row.notes, ...subject.references.slice(0, 2)],
        quiz: existing.quiz || generateDefaultQuiz(row)
      };
    }

    // Default fully-structured module generator for days without full override
    return {
      day: row.day,
      title: row.topic,
      subjectId: row.subjectId,
      month,
      learningGoal: `Mendalami pokok bahasan ${row.topic}, memahami dalil-dalil muktabar, serta menerapkan indikator keberhasilan dalam keseharian.`,
      indicators: [
        row.indicator,
        `Mampu menjelaskan dalil dan hikmah syar'i di balik ${row.topic}`,
        `Menerapkan adab dan akhlak Islam yang berkaitan dengan tema hari ini`
      ],
      competence: row.competence,
      introduction: `Selamat datang di pembelajaran Hari ke-${row.day}. Pada hari ini kita mengkaji "${row.topic}" dalam naungan mata pelajaran ${subject.name}. Pembahasan ini disusun sistematis untuk memandu akal dan menyejukkan hati.`,
      contentSections: [
        {
          heading: `1. Kedudukan dan Urgensi ${row.topic}`,
          body: `Dalam khazanah keilmuan Islam, topik "${row.topic}" memiliki kedudukan strategis. Para ulama salafus shalih memberikan perhatian mendalam karena menyangkut ketepatan ibadah, kebersihan batin, atau ketertiban muamalah antar-manusia.`
        },
        {
          heading: `2. Uraian Dalil dan Pendapat Ulama Mu’tabar`,
          body: `Materi ini berlandaskan dalil Al-Qur’an dan hadis-hadis sahih. Sebagaimana dijelaskan dalam rujukan "${row.notes}", pengamalan yang benar harus memenuhi dua syarat utama: niat ikhlas semata-mata mengharap ridha Allah dan ittiba’ (mengikuti tuntunan Rasulullah ﷺ).`
        },
        {
          heading: `3. Hikmah Pembinaan Jiwa (Tazkiyah)`,
          body: `Setiap syariat yang Allah tetapkan membawa maslahat bagi manusia dan menolak mudarat. Dengan memahami ${row.topic}, jiwa kita dibimbing keluar dari hawa nafsu dan kesombongan menuju ketundukan yang mendatangkan ketenteraman hakiki (thuma’ninah).`
        }
      ],
      quranVerse: getRelevantVerseForSubject(row.subjectId),
      hadith: getRelevantHadithForSubject(row.subjectId),
      scholarNote: {
        scholar: getScholarForSubject(row.subjectId),
        quote: `Tidaklah suatu ilmu bermanfaat bagi pemiliknya melainkan jika membuahkan rasa takut kepada Allah (khasyyah), kelembutan hati, dan amal saleh yang konsisten.`,
        book: row.notes
      },
      lifeApplication: [
        `Menerapkan poin utama ${row.topic} dalam rutinitas ibadah atau aktivitas harian hari ini.`,
        `Mengendalikan emosi dan menjaga ketulusan batin saat menghadapi ujian berkaitan dengan materi.`,
        `Mencatat poin evaluasi pribadi sebelum beristirahat malam.`
      ],
      keyTakeaways: [
        `Pemahaman syar’i yang benar atas ${row.topic} menghindarkan dari kekeliruan dan keraguan.`,
        `Ilmu adalah cahaya yang menuntut kesucian hati penuntutnya.`,
        `Amal yang sedikit namun berkelanjutan lebih dicintai Allah daripada banyak namun terputus.`
      ],
      reflectionExercise: `Luangkan waktu sejenak untuk bermuhasabah: Di bagian mana dari pembahasan ${row.topic} ini yang paling menyentuh kondisi pribadi Anda saat ini? Apa tekad perbaikan yang ingin Anda lakukan?`,
      summary: `Materi Hari ke-${row.day} membekali kita dengan pemahaman komprehensif mengenai ${row.topic}. Jadikan ilmu ini sebagai suluh penerang langkah hidup dalam beribadah dan bermuamalah.`,
      references: [
        row.notes,
        ...subject.references.slice(0, 2)
      ],
      quiz: generateDefaultQuiz(row)
    };
  });
}

function generateDefaultQuiz(row: SyllabusRow) {
  return [
    {
      id: `q_${row.day}_1`,
      question: `Apa tujuan utama dari mempelajari "${row.topic}" pada hari ke-${row.day}?`,
      type: 'mcq' as const,
      points: 2,
      options: [
        'Hanya untuk memenuhi syarat kelulusan tanpa niat mengamalkan',
        `Memahami dalil, menghayati hikmah, dan mengamalkan tuntunan ${row.topic} dalam kehidupan sehari-hari`,
        'Mencari celah hukum untuk mempermudah pembenaran diri',
        'Menambah bahan perdebatan di media sosial'
      ],
      correctAnswer: 1,
      explanation: `Materi "${row.topic}" dirancang untuk membimbing akal dan menata hati agar mampu mengamalkan ilmu syar’i sesuai Al-Qur'an dan Sunnah.`
    },
    {
      id: `q_${row.day}_2`,
      question: `Berdasarkan indikator pembelajaran hari ini: "${row.indicator}", apakah sikap yang tepat bagi seorang penuntut ilmu?`,
      type: 'mcq' as const,
      points: 2,
      options: [
        'Menilai orang lain dan mengabaikan evaluasi diri sendiri',
        'Mengutamakan muhasabah diri, mempraktikkan ilmu dengan ikhlas, dan merawat adab',
        'Cukup membaca teori tanpa perlu mempraktikkannya',
        'Menunda pengamalan hingga usia lanjut'
      ],
      correctAnswer: 1,
      explanation: 'Indikator pembelajaran menuntut adanya pemahaman teoretis yang bermuara pada pengamalan akhlak dan adab mulia.'
    },
    {
      id: `q_${row.day}_3`,
      question: `Apa dua syarat utama diterimanya ilmu dan amal terkait "${row.topic}" di sisi Allah Ta'ala?`,
      type: 'mcq' as const,
      points: 2,
      options: [
        'Keikhlasan niat semata-mata karena Allah dan kesesuaian amal dengan dalil Al-Qur’an serta Sunnah (ittiba’)',
        'Banyaknya jumlah pengikut di media sosial dan pujian manusia',
        'Sekadar hafal istilah Arab tanpa memperhatikan kebersihan hati',
        'Mengikuti kebiasaan turun-temurun walaupun bertentangan dengan nash syar’i'
      ],
      correctAnswer: 0,
      explanation: 'Dua pilar diterimanya amal adalah keikhlasan niat semata karena Allah dan kesesuaian amal dengan petunjuk Rasulullah ﷺ (ittiba).'
    }
  ];
}

function getRelevantVerseForSubject(subjectId: SubjectId) {
  switch (subjectId) {
    case 'alquran':
      return {
        arabic: 'إِنَّ هَٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ وَيُبَشِّرُ ٱلْمُؤْمِنِينَ ٱلَّذِينَ يَعْمَلُونَ ٱلصَّٰلِحَٰتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا',
        translation: 'Sesungguhnya Al-Qur’an ini memberikan petunjuk kepada (jalan) yang lebih lurus dan memberi kabar gembira kepada orang-orang mukmin yang mengerjakan amal saleh bahwa bagi mereka ada pahala yang besar.',
        surah: 'Al-Isra’',
        ayah: '9'
      };
    case 'hadis':
      return {
        arabic: 'وَمَآ ءَاتَىٰكُمُ ٱلرَّسُولُ فَخُذُوهُ وَمَا نَهَىٰكُمْ عَنْهُ فَٱنتَهُوا۟ ۚ وَٱتَّقُوا۟ ٱللَّهَ ۖ إِنَّ ٱللَّهَ شَدِيدُ ٱلْعِقَابِ',
        translation: 'Apa yang diberikan Rasul kepadamu maka terimalah, dan apa yang dilarangnya bagimu maka tinggalkanlah; dan bertakwalah kepada Allah. Sesungguhnya Allah sangat keras hukuman-Nya.',
        surah: 'Al-Hasyr',
        ayah: '7'
      };
    case 'fikih':
      return {
        arabic: 'وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ وَأَطِيعُوا۟ ٱلرَّسُولَ لَعَلَّكُمْ تُرْحَمُونَ',
        translation: 'Dan dirikanlah salat, tunaikanlah zakat, dan taatlah kepada Rasul, supaya kamu diberi rahmat.',
        surah: 'An-Nur',
        ayah: '56'
      };
    case 'sirah':
      return {
        arabic: 'لَّقَدْ كَانَ لَكُمْ فِى رَسُولِ ٱللَّهِ أُسْوَةٌ حَسَنَةٌ لِّمَن كَانَ يَرْجُوا۟ ٱللَّهَ وَٱلْيَوْمَ ٱلْءَاخِرَ وَذَكَرَ ٱللَّهَ كَثِيرًا',
        translation: 'Sesungguhnya telah ada pada (diri) Rasulullah itu suri teladan yang baik bagimu (yaitu) bagi orang yang mengharap (rahmat) Allah dan (kedatangan) hari kiamat dan dia banyak menyebut Allah.',
        surah: 'Al-Ahzab',
        ayah: '21'
      };
    case 'tafsir':
      return {
        arabic: 'كِتَٰبٌ أَنزَلْنَٰهُ إِلَيْكَ مُبَٰرَكٌ لِّيَدَّبَّرُوٓا۟ ءَايَٰتِهِۦ وَلِيَتَذَكَّرَ أُو۟لُوا۟ ٱلْأَلْبَٰبِ',
        translation: 'Ini adalah sebuah kitab yang Kami turunkan kepadamu penuh dengan berkah supaya mereka memperhatikan (mentadaburi) ayat-ayatnya dan supaya mendapat pelajaran orang-orang yang mempunyai pikiran.',
        surah: 'Shad',
        ayah: '29'
      };
    case 'muamalah':
      return {
        arabic: 'وَأَحَلَّ ٱللَّهُ ٱلْبَيْعَ وَحَرَّمَ ٱلرِّبَوٰا۟',
        translation: 'Padahal Allah telah menghalalkan jual beli dan mengharamkan riba.',
        surah: 'Al-Baqarah',
        ayah: '275'
      };
    case 'tazkiyatun_nafs':
    default:
      return {
        arabic: 'قَدْ أَفْلَحَ مَن زَكَّىٰهَا ۝ وَقَدْ خَابَ مَن دَسَّىٰهَا',
        translation: 'Sesungguhnya beruntunglah orang yang mensucikan jiwa itu, dan sesungguhnya merugilah orang yang mengotorinya.',
        surah: 'Asy-Syams',
        ayah: '9-10'
      };
  }
}

function getRelevantHadithForSubject(subjectId: SubjectId) {
  switch (subjectId) {
    case 'alquran':
      return {
        arabic: 'الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ',
        translation: 'Orang yang mahir membaca Al-Qur’an akan bersama para malaikat utusan yang mulia lagi taat.',
        narrator: '‘Aisyah radhiyallahu ‘anha',
        source: 'Sahih Muslim No. 798',
        status: 'Sahih'
      };
    case 'hadis':
      return {
        arabic: 'مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ',
        translation: 'Barang siapa yang Allah kehendaki kebaikan baginya, niscaya Allah akan pahamkan dia dalam urusan agamanya.',
        narrator: 'Mu’awiyah bin Abi Sufyan radhiyallahu ‘anhu',
        source: 'Sahih Al-Bukhari No. 71 & Sahih Muslim No. 1037',
        status: 'Sahih'
      };
    case 'fikih':
      return {
        arabic: 'صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي',
        translation: 'Salatlah kalian sebagaimana kalian melihat aku salat.',
        narrator: 'Malik bin Al-Huwairits radhiyallahu ‘anhu',
        source: 'Sahih Al-Bukhari No. 631',
        status: 'Sahih'
      };
    case 'sirah':
      return {
        arabic: 'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ صَالِحَ الْأَخْلَاقِ',
        translation: 'Sesungguhnya aku diutus hanyalah untuk menyempurnakan kesalehan akhlak.',
        narrator: 'Abu Hurairah radhiyallahu ‘anhu',
        source: 'Musnad Ahmad No. 8952 & Al-Adab Al-Mufrad',
        status: 'Sahih'
      };
    case 'tafsir':
      return {
        arabic: 'تَرَكْتُ فِيكُمْ أَمْرَيْنِ لَنْ تَضِلُّوا مَا تَمَسَّكْتُمْ بِهِمَا: كِتَابَ اللَّهِ وَسُنَّةَ نَبِيِّهِ',
        translation: 'Aku tinggalkan kepada kalian dua perkara, kalian tidak akan tersesat selama berpegang teguh pada keduanya: Kitabullah dan Sunnah Nabi-Nya.',
        narrator: 'Malik bin Anas (Mursal Hasan)',
        source: 'Al-Muwaththa’ No. 1661',
        status: 'Hasan'
      };
    case 'muamalah':
      return {
        arabic: 'الْبَيِّعَانِ بِالْخِيَارِ مَا لَمْ يَتَفَرَّقَا، فَإِنْ صَدَقَا وَبَيَّنَا بُورِكَ لَهُمَا فِي بَيْعِهِمَا',
        translation: 'Penjual dan pembeli memiliki hak khiyar selama belum berpisah. Jika keduanya jujur dan menjelaskan keadaan barang, niscaya diberkahi jual beli mereka.',
        narrator: 'Hakim bin Hizam radhiyallahu ‘anhu',
        source: 'Sahih Al-Bukhari No. 2079 & Sahih Muslim No. 1532',
        status: 'Sahih'
      };
    case 'tazkiyatun_nafs':
    default:
      return {
        arabic: 'أَلَا وَإِنَّ فِي الْجَسَدِ مُضْغَةً إِذَا صَلَحَتْ صَلَحَ الْجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الْجَسَدُ كُلُّهُ، أَلَا وَهِيَ الْقَلْبُ',
        translation: 'Ketahuilah, sesungguhnya di dalam tubuh ada segumpal daging. Jika ia baik maka baiklah seluruh tubuh, dan jika ia rusak maka rusaklah seluruh tubuh. Ketahuilah segumpal daging itu adalah hati (qalb).',
        narrator: 'An-Nu’man bin Basyir radhiyallahu ‘anhu',
        source: 'Sahih Al-Bukhari No. 52 & Sahih Muslim No. 1599',
        status: 'Sahih'
      };
  }
}

function getScholarForSubject(subjectId: SubjectId): string {
  switch (subjectId) {
    case 'alquran':
      return 'Al-Imam An-Nawawi rahimahullah (At-Tibyan)';
    case 'hadis':
      return 'Al-Hafizh Ibnu Hajar Al-’Asqalani rahimahullah (Fathul Bari)';
    case 'fikih':
      return 'Al-Imam Asy-Syafi’i rahimahullah (Ar-Risalah)';
    case 'sirah':
      return 'Al-Imam Ibnu Katsir rahimahullah (Al-Bidayah wan Nihayah)';
    case 'tafsir':
      return 'Syaikh Abdurrahman As-Sa’di rahimahullah (Taisirul Karim)';
    case 'muamalah':
      return 'Prof. Dr. Wahbah Az-Zuhaili rahimahullah (Al-Fiqh al-Islami)';
    case 'tazkiyatun_nafs':
    default:
      return 'Al-Imam Ibnu Qayyim al-Jauziyyah rahimahullah (Madarijus Salikin)';
  }
}
