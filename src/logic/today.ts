/**
 * 今日ぶんの節気・五季。
 *
 * 節気の判定は太陽黄経の二分探索(72回ぶん)で軽くないが、結果は暦日が
 * 変わるまで一定なので、暦日をキーに使い回す。
 * 画面側は毎回呼んでよい(同じ日なら同じオブジェクトが返る)。
 */
import { getFiveSeason, type FiveSeasonInfo } from './season';
import {
  calendarDayNumber,
  getCurrentTerm,
  toCalendarDate,
  type CurrentTermInfo,
} from './solarTerms';

export interface TodayInfo {
  /** 暦日の通し番号 */
  dayNum: number;
  termInfo: CurrentTermInfo;
  seasonInfo: FiveSeasonInfo;
}

let cached: TodayInfo | null = null;

export function getToday(now: Date = new Date()): TodayInfo {
  const dayNum = calendarDayNumber(toCalendarDate(now));
  if (cached === null || cached.dayNum !== dayNum) {
    cached = {
      dayNum,
      termInfo: getCurrentTerm(now),
      seasonInfo: getFiveSeason(now),
    };
  }
  return cached;
}
