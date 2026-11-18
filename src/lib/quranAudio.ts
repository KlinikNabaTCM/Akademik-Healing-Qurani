export interface QariProfile {
  id: string;
  name: string;
  arabicName: string;
  style: string;
  everyAyahFolder: string;
}

export const QARI_LIST: QariProfile[] = [
  {
    id: 'alafasy',
    name: 'Syaikh Mishary Rashid Alafasy',
    arabicName: 'مشاري راشد العفاسي',
    style: 'Murattal Tartil · Kuwait',
    everyAyahFolder: 'Alafasy_128kbps'
  },
  {
    id: 'ghamidi',
    name: 'Syaikh Sa’ad Al-Ghamidi',
    arabicName: 'سعد الغامدي',
    style: 'Murattal Sejuk · Arab Saudi',
    everyAyahFolder: 'Ghamadi_40kbps'
  },
  {
    id: 'sudais',
    name: 'Syaikh Abdurrahman As-Sudais',
    arabicName: 'عبد الرحمن السديس',
    style: 'Imam Masjidil Haram · Makkah',
    everyAyahFolder: 'Abdurrahmaan_As-Sudais_192kbps'
  },
  {
    id: 'muaiqly',
    name: 'Syaikh Maher Al-Muaiqly',
    arabicName: 'ماهر المعيقلي',
    style: 'Imam Masjidil Haram · Makkah',
    everyAyahFolder: 'MaherAlMuaiqly128kbps'
  }
];

const SURAH_MAP: Record<string, number> = {
  'al-fatihah': 1,
  'al-baqarah': 2,
  'ali-imran': 3,
  "ali 'imran": 3,
  'an-nisa': 4,
  "an-nisa'": 4,
  'al-maidah': 5,
  "al-ma'idah": 5,
  'al-anam': 6,
  "al-an'am": 6,
  'al-araf': 7,
  "al-a'raf": 7,
  'al-anfal': 8,
  'at-taubah': 9,
  'yunus': 10,
  'hud': 11,
  'yusuf': 12,
  'ar-rad': 13,
  "ar-ra'd": 13,
  'ibrahim': 14,
  'al-hijr': 15,
  'an-nahl': 16,
  'al-isra': 17,
  "al-isra'": 17,
  'al-kahfi': 18,
  'al-kahf': 18,
  'maryam': 19,
  'taha': 20,
  'thaha': 20,
  'al-anbiya': 21,
  'al-hajj': 22,
  'al-muminun': 23,
  "al-mu'minun": 23,
  'an-nur': 24,
  'al-furqan': 25,
  'asy-syuara': 26,
  "asy-syu'ara": 26,
  'an-naml': 27,
  'al-qasas': 28,
  'al-qashash': 28,
  'al-ankabut': 29,
  'ar-rum': 30,
  'luqman': 31,
  'as-sajdah': 32,
  'al-ahzab': 33,
  'saba': 34,
  'fatir': 35,
  'fathir': 35,
  'yasin': 36,
  'as-saffat': 37,
  'ash-shaffat': 37,
  'sad': 38,
  'shad': 38,
  'az-zumar': 39,
  'ghafir': 40,
  'fussilat': 41,
  'asy-syura': 42,
  'az-zukhruf': 43,
  'ad-dukhan': 44,
  'al-jasiyah': 45,
  'al-ahqaf': 46,
  'muhammad': 47,
  'al-fath': 48,
  'al-hujurat': 49,
  'qaf': 50,
  'adz-dzariyat': 51,
  'at-tur': 52,
  'ath-thur': 52,
  'an-najm': 53,
  'al-qamar': 54,
  'ar-rahman': 55,
  'al-waqiah': 56,
  "al-waqi'ah": 56,
  'al-hadid': 57,
  'al-mujadilah': 58,
  'al-hasyr': 59,
  'al-mumtahanah': 60,
  'as-saff': 61,
  'ash-shaff': 61,
  'al-jumuah': 62,
  "al-jumu'ah": 62,
  'al-munafiqun': 63,
  'at-taghabun': 64,
  'at-talaq': 65,
  'ath-thalaq': 65,
  'at-tahrim': 66,
  'al-mulk': 67,
  'al-qalam': 68,
  'al-haqqah': 69,
  'al-maarij': 70,
  "al-ma'arij": 70,
  'nuh': 71,
  'al-jinn': 72,
  'al-jin': 72,
  'al-muzzammil': 73,
  'al-muddassir': 74,
  'al-qiyamah': 75,
  'al-insan': 76,
  'al-mursalat': 77,
  'an-naba': 78,
  "an-naba'": 78,
  'an-naziat': 79,
  "an-nazi'at": 79,
  'abasa': 80,
  "'abasa": 80,
  'at-takwir': 81,
  'al-infitar': 82,
  'al-infithar': 82,
  'al-mutaffifin': 83,
  'al-muthaffifin': 83,
  'al-insyiqaq': 84,
  'al-buruj': 85,
  'at-tariq': 86,
  'ath-thariq': 86,
  'al-ala': 87,
  "al-a'la": 87,
  'al-ghasyiyah': 88,
  'al-fajr': 89,
  'al-balad': 90,
  'asy-syams': 91,
  'al-lail': 92,
  'ad-duha': 93,
  'adh-dhuha': 93,
  'asy-syarh': 94,
  'al-insyirah': 94,
  'at-tin': 95,
  'al-alaq': 96,
  "al-'alaq": 96,
  'al-qadr': 97,
  'al-bayyinah': 98,
  'az-zalzalah': 99,
  'al-adiyat': 100,
  "al-'adiyat": 100,
  'al-qariah': 101,
  "al-qari'ah": 101,
  'at-takasur': 102,
  'at-takatsur': 102,
  'al-asr': 103,
  "al-'ashr": 103,
  'al-humazah': 104,
  'al-fil': 105,
  'quraisy': 106,
  'al-maun': 107,
  "al-ma'un": 107,
  'al-kausar': 108,
  'al-kautsar': 108,
  'al-kafirun': 109,
  'an-nasr': 110,
  'an-nashr': 110,
  'al-lahab': 111,
  'al-masad': 111,
  'al-ikhlas': 112,
  'al-ikhlash': 112,
  'al-falaq': 113,
  'an-nas': 114
};

function normalizeSurahName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, ' ');
}

export function getSurahNumber(surahName: string): number {
  const norm = normalizeSurahName(surahName);
  if (SURAH_MAP[norm]) return SURAH_MAP[norm];
  const noQuotes = norm.replace(/'/g, '');
  if (SURAH_MAP[noQuotes]) return SURAH_MAP[noQuotes];
  // Fallback to Al-Fatihah if unrecognized
  return 1;
}

export function parseAyahNumbers(ayahStr: string): number[] {
  const clean = ayahStr.trim();
  if (clean.includes('-')) {
    const [startStr, endStr] = clean.split('-').map((s) => s.trim());
    const start = Math.max(1, parseInt(startStr, 10) || 1);
    const end = Math.max(start, parseInt(endStr, 10) || start);
    const result: number[] = [];
    for (let a = start; a <= Math.min(end, start + 10); a++) {
      result.push(a);
    }
    return result;
  }
  const single = Math.max(1, parseInt(clean, 10) || 1);
  return [single];
}

export function buildQuranAudioPlaylist(
  surahName: string,
  ayahStr: string,
  qariId: string
): string[] {
  const qari = QARI_LIST.find((q) => q.id === qariId) || QARI_LIST[0];
  const surahNum = getSurahNumber(surahName);
  const ayahs = parseAyahNumbers(ayahStr);
  const sss = String(surahNum).padStart(3, '0');

  return ayahs.map((ayah) => {
    const aaa = String(ayah).padStart(3, '0');
    return `https://everyayah.com/data/${qari.everyAyahFolder}/${sss}${aaa}.mp3`;
  });
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
