import { SubjectInfo } from '../types';

export const SUBJECTS_DATA: SubjectInfo[] = [
  {
    id: 'alquran',
    name: "Al-Qur'an",
    arabicName: 'القرآن الكريم',
    tagline: 'Kalamullah sebagai Pedoman Hidup dan Syifa bagi Jiwa',
    description:
      'Mempelajari kedudukan Al-Qur’an dalam kehidupan Muslim, adab mulia tilawah dan tadabur, mengenali peta tematik kalamullah, serta menghadirkan petunjuk ayat dalam menata hati dan tindakan keseharian.',
    totalDays: 13,
    goals: [
      'Menumbuhkan kecintaan dan keagungan terhadap Al-Qur’an sebagai kalamullah',
      'Menguasai adab lahiriah dan batiniah saat berinteraksi dengan mushaf',
      'Memahami kaidah tadabur ayat untuk penyembuhan jiwa (syifa)',
      'Mengintegrasikan petunjuk Al-Qur’an ke dalam keputusan dan akhlak harian'
    ],
    competencies: [
      'Mampu menjelaskan kedudukan Al-Qur’an sebagai mukjizat abadi dan sumber hukum primer',
      'Menerapkan adab membaca, mendengarkan, dan mentadaburi ayat sesuai sunnah',
      'Mampu melakukan muhasabah dan refleksi batin berbasis ayat-ayat pilihan',
      'Menyusun rencana aksi pengamalan ayat dalam kehidupan berkeluarga dan bermasyarakat'
    ],
    references: [
      'At-Tibyan fi Adabi Hamalatil Qur’an - Imam An-Nawawi',
      'Qawa’id at-Tadabbur al-Amtsal - Prof. Dr. Umar al-Muqbil',
      'Tafsir Ibnu Katsir (Muqaddimah)',
      'Al-Burhan fi ‘Ulumil Qur’an - Imam Az-Zarkasyi'
    ],
    colorTheme: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      badge: 'bg-emerald-700 text-white'
    }
  },
  {
    id: 'hadis',
    name: 'Hadis Nabawi',
    arabicName: 'الحديث النبوي',
    tagline: 'Sunnah Rasulullah ﷺ sebagai Penjelas Risalah dan Keteladanan Amal',
    description:
      'Memahami kedudukan Sunnah nabawiyah sebagai wahyu ghairu matluw, mengenal klasifikasi hadis sahih, hasan, dan daif, memahami adab tholabul ilmi, serta meneladani hadis-hadis akhlak dan pengamalan ibadah.',
    totalDays: 13,
    goals: [
      'Memahami posisi Sunnah sebagai penjelas dan penguat hukum Al-Qur’an',
      'Mengenal urgensi sanad, matan, dan metodologi kritik para muhadditsin',
      'Menumbuhkan sikap selektif dan kritis hanya bersandar pada dalil mu’tabar',
      'Menjadikan hadis akhlak sebagai kompas tata laku dan ketenangan batin'
    ],
    competencies: [
      'Membedakan tingkatan hadis sahih, hasan, da’if, dan mewaspadai hadis maudhu’ (palsu)',
      'Menjelaskan hikmah pensyariatan amalan berdasarkan hadis sahih',
      'Mengamalkan adab penuntut ilmu syar’i dalam menjaga ketulusan niat',
      'Mengidentifikasi takhrij dan sumber rujukan hadis kutubus sittah'
    ],
    references: [
      'Al-Arba’un An-Nawawiyyah - Imam An-Nawawi',
      'Riyadhus Shalihin - Imam An-Nawawi',
      'Taisir Musthalah al-Hadits - Dr. Mahmud Thahhan',
      'Muqaddimah Ibnu ash-Shalah'
    ],
    colorTheme: {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      badge: 'bg-teal-700 text-white'
    }
  },
  {
    id: 'fikih',
    name: 'Fikih Ibadah',
    arabicName: 'الفقه الإسلامي',
    tagline: 'Panduan Praktis Menjalankan Syariat dengan Benar dan Khusyuk',
    description:
      'Mengkaji hukum-hukum syar’i amaliah yang bersumber dari dalil terperinci: thaharah (bersuci lahir batin), wudu, tayamum, salat fardu dan sunnah, puasa, zakat, serta membangun kedewasaan menyikapi ikhtilaf ulama.',
    totalDays: 14,
    goals: [
      'Menyempurnakan tata cara ibadah fardu agar sah rukun dan syaratnya',
      'Menyelami hikmah dan rahasia spiritual (asrarul ibadah) di balik syariat',
      'Memahami rukhshah (keringanan syariat) saat safar, sakit, dan kondisi darurat',
      'Menumbuhkan sikap lapang dada dan adab dalam memandang perbedaan ijtihad'
    ],
    competencies: [
      'Mempraktikkan wudu, mandi wajib, tayamum, dan salat sesuai dalil sunnah',
      'Mengetahui pembatal ibadah serta cara menambal kekurangan (seperti sujud sahwi)',
      'Menghitung kewajiban zakat mal, fitrah, dan sedekah dengan tepat',
      'Menjelaskan kaidah dasar fiqhiyyah dalam kehidupan sehari-hari'
    ],
    references: [
      'Fathul Qarib al-Mujib - Ibnu Qasim al-Ghazzi',
      'Bidayatul Mujtahid wa Nihayatul Muqtashid - Ibnu Rusyd',
      'Al-Fiqh al-Manhaji ‘ala Madzhabil Imam asy-Syafi’i',
      'Bulughul Maram min Adillatil Ahkam - Al-Hafizh Ibnu Hajar'
    ],
    colorTheme: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200',
      badge: 'bg-green-700 text-white'
    }
  },
  {
    id: 'sirah',
    name: 'Sirah Nabawiyah',
    arabicName: 'السيرة النبوية',
    tagline: 'Menelusuri Jejak Perjuangan, Kemenangan Moral, dan Kasih Sayang Rasulullah ﷺ',
    description:
      'Mempelajari jejak rekam sejarah dakwah Rasulullah ﷺ mulai pra-Islam, fase Makkah (pembinaan akidah dan ketabahan), hijrah, pembentukan tatanan masyarakat Madinah, kepemimpinan, hingga ibrah dan keteladanan agung.',
    totalDays: 12,
    goals: [
      'Menumbuhkan mahabbah (cinta mendalam) kepada Nabi Muhammad ﷺ',
      'Mengambil pelajaran strategis dari tahapan dakwah Makkah dan Madinah',
      'Mempelajari seni kepemimpinan, diplomasi, dan resolusi konflik kenabian',
      'Meneladani akhlak Rasulullah ﷺ dalam keluarga, sahabat, dan masyarakat majemuk'
    ],
    competencies: [
      'Menjelaskan kronologi peristiwa tonggak dalam kehidupan Nabi ﷺ',
      'Menganalisis faktor keberhasilan pembinaan sahabat di Darul Arqam',
      'Menguraikan Piagam Madinah sebagai landasan harmoni bermasyarakat',
      'Mengaitkan keteladanan sirah dalam menghadapi krisis mental dan ujian zaman kini'
    ],
    references: [
      'Ar-Rahiq al-Makhtum - Syaikh Shafiyyurrahman al-Mubarakfuri',
      'Sirah Nabawiyyah - Ibnu Hisyam',
      'Fiqh as-Sirah - Syaikh Muhammad Sa’id Ramadhan al-Buthi',
      'Zadul Ma’ad fi Hadyi Khairil ‘Ibad - Ibnu Qayyim al-Jauziyyah'
    ],
    colorTheme: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      badge: 'bg-amber-700 text-white'
    }
  },
  {
    id: 'tafsir',
    name: 'Tafsir Ayat Pilihan',
    arabicName: 'تفسير الآيات',
    tagline: 'Menyelami Makna dan Hikmah Kalamullah Melalui Penjelasan Muktabar',
    description:
      'Pengenalan metodologi tafsir bil ma’tsur dan bil ra’yi yang sahih, mentafsirkan surah-surah pilihan (Al-Fatihah, Ayat Kursi, Al-Hujurat, ayat-ayat tauhid, sakinah keluarga, dan penawar duka) bersumber dari kitab mu’tabar.',
    totalDays: 13,
    goals: [
      'Mengenal kaidah dasar penafsiran Al-Qur’an oleh salafus shalih',
      'Memahami asbabun nuzul dan konteks turunnya surah-surah utama',
      'Menyelami kedalaman pesan tauhid, tazkiyah, dan adab sosial dalam surah pilihan',
      'Membedakan interpretasi otoritatif ulama dengan opini spekulatif'
    ],
    competencies: [
      'Menjelaskan makna kosakata kunci dan korelasi (munasabah) antar-ayat',
      'Menguraikan tafsir Surah Al-Fatihah sebagai Ummul Kitab dan doa penyembuh',
      'Menganalisis etika komunikasi Qur’ani dalam Surah Al-Hujurat',
      'Menerapkan tadabbur tafsir untuk mengobati kecemasan batin'
    ],
    references: [
      'Tafsir Al-Qur’an al-’Azhim - Al-Hafizh Ibnu Katsir',
      'Taisir al-Karim ar-Rahman fi Tafsir Kalam al-Mannan - As-Sa’di',
      'Al-Jami’ li Ahkam al-Qur’an - Al-Qurthubi',
      'Safwatut Tafasir - Syaikh Muhammad Ali Ash-Shabuni'
    ],
    colorTheme: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-300',
      badge: 'bg-emerald-800 text-white'
    }
  },
  {
    id: 'muamalah',
    name: 'Muamalah Maliyah',
    arabicName: 'المعاملات المالية',
    tagline: 'Mencari Rezeki Berkah, Bersih dari Riba, Gharar, dan Kedzaliman',
    description:
      'Mempelajari prinsip etika harta dalam Islam, hukum akad jual beli, larangan riba, gharar, dan maysir, etika utang-piutang, adab amanah kerja, serta tinjauan syariah terhadap transaksi keuangan modern (e-wallet, paylater, dropship).',
    totalDays: 12,
    goals: [
      'Menanamkan kesadaran bahwa rezeki halal adalah syarat mustajabnya doa',
      'Memahami rukun akad perniagaan dan batasan transaksi yang diharamkan',
      'Menguasai adab utang piutang, pencatatan saksi, dan pelunasan tepat waktu',
      'Memiliki panduan syar’i dalam menghadapi instrumen ekonomi digital'
    ],
    competencies: [
      'Mengidentifikasi jenis riba (fadhl dan nasi’ah) serta cara menjauhinya',
      'Membedakan transaksi jual beli yang sah dengan yang mengandung spekulasi batil',
      'Menerapkan klausul akad syirkah, mudharabah, dan murabahah secara sederhana',
      'Mengevaluasi legalitas dan kehalalan transaksi fintech kontemporer'
    ],
    references: [
      'Al-Fiqh al-Islami wa Adillatuh - Prof. Dr. Wahbah az-Zuhaili',
      'Fiqh al-Mu’amalat al-Maliyyah al-Mu’ashirah - Dr. Ali as-Salus',
      'Bughyatul Mustarsyidin - Sayyid Abdurrahman bin Muhammad',
      'Fatwa Dewan Syariah Nasional MUI'
    ],
    colorTheme: {
      bg: 'bg-stone-50',
      text: 'text-stone-800',
      border: 'border-stone-300',
      badge: 'bg-stone-700 text-white'
    }
  },
  {
    id: 'tazkiyatun_nafs',
    name: 'Tazkiyatun Nafs',
    arabicName: 'تزكية النفس',
    tagline: 'Penyucian Jiwa, Menata Hati, dan Meraih Ketenangan Spiritual (Thuma’ninah)',
    description:
      'Mendalami ilmu tentang penyakit hati (riya, dengki, ujub, amarah), tahapan taubat nasuha, hakikat ikhlas, pilar sabar, syukur, tawakal, muhasabah harian, menjaga lisan, dan seni healing batin bersumberkan Al-Qur’an dan Sunnah.',
    totalDays: 13,
    goals: [
      'Mengenal diagnosis penyakit hati yang mengikis ketentraman hidup',
      'Membangun ketahanan mental melalui konsep sabar, syukur, dan rida atas takdir',
      'Mengasah kepekaan qalbun salim (hati yang bersih dan selamat)',
      'Mempraktikkan dzikrullah dan wirid doa sebagai terapi kegelisahan jiwa'
    ],
    competencies: [
      'Melakukan muhasabah diri harian secara terstruktur',
      'Meredam luapan amarah dan emosi negatif sesuai anjuran nabawi',
      'Menjaga lisan dari ghibah, namimah, dan fitnah digital',
      'Meraih ketenangan jiwa (thuma’ninah) saat menghadapi cobaan berat'
    ],
    references: [
      'Ihya’ ‘Ulumiddin - Imam Abu Hamid Al-Ghazali',
      'Madarijus Salikin baina Manazil Iyyaka Na’budu wa Iyyaka Nasta’in - Ibnu Qayyim',
      'Mukhtashar Minhajil Qashidin - Ibnu Qudamah al-Maqdisi',
      'Al-Jawab al-Kafi liman Sa’ala ‘anid Dawa’ asy-Syafi - Ibnu Qayyim'
    ],
    colorTheme: {
      bg: 'bg-teal-50',
      text: 'text-teal-900',
      border: 'border-teal-200',
      badge: 'bg-teal-800 text-white'
    }
  }
];
