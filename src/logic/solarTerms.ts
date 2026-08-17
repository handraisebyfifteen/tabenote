/**
 * 二十四節気の日付計算。
 *
 * solar_terms.md の指定どおり、固定日付表ではなく太陽黄経から算出する。
 * (節気 = 太陽の見かけの黄経が 15° の倍数に達する瞬間)
 *
 * 太陽位置は Meeus の簡易式(Astronomical Algorithms)を使用。
 * 精度は角度で約0.001° ≒ 時刻で1〜2分。日付の判定には十分。
 */

export interface SolarTerm {
  /** 立春を0とする通し番号(0〜23) */
  index: number;
  /** 太陽黄経(度) */
  longitude: number;
  kanji: string;
  english: string;
  /** おおよその月(探索の初期値に使う) */
  approxMonth: number;
  /** おおよその日(探索の初期値に使う) */
  approxDay: number;
}

export const SOLAR_TERMS: SolarTerm[] = [
  { index: 0, longitude: 315, kanji: '立春', english: 'Beginning of Spring', approxMonth: 2, approxDay: 4 },
  { index: 1, longitude: 330, kanji: '雨水', english: 'Rain Water', approxMonth: 2, approxDay: 19 },
  { index: 2, longitude: 345, kanji: '啓蟄', english: 'Awakening of Insects', approxMonth: 3, approxDay: 5 },
  { index: 3, longitude: 0, kanji: '春分', english: 'Spring Equinox', approxMonth: 3, approxDay: 20 },
  { index: 4, longitude: 15, kanji: '清明', english: 'Pure Brightness', approxMonth: 4, approxDay: 4 },
  { index: 5, longitude: 30, kanji: '穀雨', english: 'Grain Rain', approxMonth: 4, approxDay: 20 },
  { index: 6, longitude: 45, kanji: '立夏', english: 'Beginning of Summer', approxMonth: 5, approxDay: 5 },
  { index: 7, longitude: 60, kanji: '小満', english: 'Grain Buds', approxMonth: 5, approxDay: 21 },
  { index: 8, longitude: 75, kanji: '芒種', english: 'Grain in Ear', approxMonth: 6, approxDay: 5 },
  { index: 9, longitude: 90, kanji: '夏至', english: 'Summer Solstice', approxMonth: 6, approxDay: 21 },
  { index: 10, longitude: 105, kanji: '小暑', english: 'Minor Heat', approxMonth: 7, approxDay: 7 },
  { index: 11, longitude: 120, kanji: '大暑', english: 'Major Heat', approxMonth: 7, approxDay: 23 },
  { index: 12, longitude: 135, kanji: '立秋', english: 'Beginning of Autumn', approxMonth: 8, approxDay: 7 },
  { index: 13, longitude: 150, kanji: '処暑', english: 'End of Heat', approxMonth: 8, approxDay: 23 },
  { index: 14, longitude: 165, kanji: '白露', english: 'White Dew', approxMonth: 9, approxDay: 7 },
  { index: 15, longitude: 180, kanji: '秋分', english: 'Autumn Equinox', approxMonth: 9, approxDay: 23 },
  { index: 16, longitude: 195, kanji: '寒露', english: 'Cold Dew', approxMonth: 10, approxDay: 8 },
  { index: 17, longitude: 210, kanji: '霜降', english: 'Frost Descent', approxMonth: 10, approxDay: 23 },
  { index: 18, longitude: 225, kanji: '立冬', english: 'Beginning of Winter', approxMonth: 11, approxDay: 7 },
  { index: 19, longitude: 240, kanji: '小雪', english: 'Minor Snow', approxMonth: 11, approxDay: 22 },
  { index: 20, longitude: 255, kanji: '大雪', english: 'Major Snow', approxMonth: 12, approxDay: 7 },
  { index: 21, longitude: 270, kanji: '冬至', english: 'Winter Solstice', approxMonth: 12, approxDay: 21 },
  { index: 22, longitude: 285, kanji: '小寒', english: 'Minor Cold', approxMonth: 1, approxDay: 5 },
  { index: 23, longitude: 300, kanji: '大寒', english: 'Major Cold', approxMonth: 1, approxDay: 20 },
];

const DEG = Math.PI / 180;

/** 太陽の見かけの黄経(度、0〜360) */
export function apparentSolarLongitude(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const t = (jd - 2451545.0) / 36525; // J2000からのユリウス世紀

  const L0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const M = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const C =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M * DEG) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * M * DEG) +
    0.000289 * Math.sin(3 * M * DEG);
  const trueLongitude = L0 + C;
  const omega = 125.04 - 1934.136 * t;
  const apparent = trueLongitude - 0.00569 - 0.00478 * Math.sin(omega * DEG);

  return ((apparent % 360) + 360) % 360;
}

/** 目標角までの符号付き差(-180〜+180) */
function signedAngleDiff(current: number, target: number): number {
  return ((current - target + 540) % 360) - 180;
}

/**
 * その年に太陽黄経が目標角に達する瞬間(UTC)。
 * 小寒・大寒は1月なので、例えば termInstant(2026, 小寒) は 2026年1月の瞬間を返す。
 */
export function termInstant(year: number, term: SolarTerm): Date {
  // おおよその日付を初期値に、前後8日の範囲を二分探索する
  const guess = Date.UTC(year, term.approxMonth - 1, term.approxDay, 12, 0, 0);
  let lo = guess - 8 * 86400000;
  let hi = guess + 8 * 86400000;
  // この範囲では黄経は単調増加(約1°/日)なので二分探索できる
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    const diff = signedAngleDiff(
      apparentSolarLongitude(new Date(mid)),
      term.longitude,
    );
    if (diff < 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return new Date((lo + hi) / 2);
}

/** 端末のタイムゾーンでの暦日(時刻を落とした年月日) */
export interface CalendarDate {
  year: number;
  month: number; // 1〜12
  day: number; // 1〜31
}

export function toCalendarDate(date: Date): CalendarDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

/** 暦日を比較しやすい通し番号にする(その日の正午を基準にすることでDSTの影響を避ける) */
export function calendarDayNumber(d: CalendarDate): number {
  return Math.round(new Date(d.year, d.month - 1, d.day, 12).getTime() / 86400000);
}

export interface TermOccurrence {
  term: SolarTerm;
  /** 節気に入る瞬間(UTC) */
  instant: Date;
  /** 端末タイムゾーンでの暦日 */
  date: CalendarDate;
}

/** 指定した年の前後を含む節気の一覧(時刻順) */
export function termOccurrencesAround(year: number): TermOccurrence[] {
  const result: TermOccurrence[] = [];
  for (const y of [year - 1, year, year + 1]) {
    for (const term of SOLAR_TERMS) {
      const instant = termInstant(y, term);
      result.push({ term, instant, date: toCalendarDate(instant) });
    }
  }
  result.sort((a, b) => a.instant.getTime() - b.instant.getTime());
  return result;
}

export interface CurrentTermInfo {
  /** 現在の節気 */
  current: TermOccurrence;
  /** 次の節気 */
  next: TermOccurrence;
  /** 次の節気まであと何日(暦日ベース) */
  daysUntilNext: number;
}

/**
 * 今日がどの節気の期間かを暦日ベースで判定する。
 * (節気に入る瞬間が何時であっても、その暦日から新しい節気として扱う)
 */
export function getCurrentTerm(today: Date): CurrentTermInfo {
  const todayNum = calendarDayNumber(toCalendarDate(today));
  const occurrences = termOccurrencesAround(today.getFullYear());
  for (let i = occurrences.length - 1; i >= 0; i--) {
    const startNum = calendarDayNumber(occurrences[i].date);
    if (startNum <= todayNum) {
      const next = occurrences[i + 1];
      return {
        current: occurrences[i],
        next,
        daysUntilNext: calendarDayNumber(next.date) - todayNum,
      };
    }
  }
  throw new Error('節気の判定に失敗しました');
}
