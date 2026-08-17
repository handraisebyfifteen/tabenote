/**
 * 五季の判定(土用方式、指示書 5-5 / solar_terms.md)。
 *
 *   土用 = 立春・立夏・立秋・立冬の直前18日間(年4回)
 *   それ以外は直近の四立で 春/夏/秋/冬 を決める
 *
 * 判定は暦日ベース。節気(表示)と五季(判定)は別の体系として扱う。
 */
import type { FiveFlavor } from './flavors';
import {
  SOLAR_TERMS,
  calendarDayNumber,
  termInstant,
  toCalendarDate,
  type CalendarDate,
} from './solarTerms';

export type FourSeason = 'spring' | 'summer' | 'autumn' | 'winter';
export type FiveSeason = FourSeason | 'doyo';

export interface SeasonRecommendation {
  /** 推奨される味(判定ロジックと必ず一致させる) */
  flavors: FiveFlavor[];
  /** 推奨される性(-2〜+2 のレベル) */
  natureLevels: number[];
  /** 推奨される性の言葉(表示用) */
  natureText: string;
  /** 養う対象(表示用。五臓は生理機能の名称であり臓器ではない) */
  organ: string;
}

/** 季節ごとの推奨(設計書 3-4 の表のとおり) */
export const SEASON_RECOMMENDATIONS: Record<FiveSeason, SeasonRecommendation> = {
  spring: {
    flavors: ['酸', '辛', '甘'],
    natureLevels: [1, -1],
    natureText: '温性・涼性',
    organ: '肝',
  },
  summer: {
    flavors: ['苦', '酸', '甘'],
    natureLevels: [-2, -1],
    natureText: '寒性・涼性',
    organ: '心',
  },
  doyo: {
    flavors: ['甘', '苦'],
    natureLevels: [0, 1, -1],
    natureText: '平性・温性・涼性',
    organ: '脾',
  },
  autumn: {
    flavors: ['辛', '甘'],
    natureLevels: [1, -1],
    natureText: '温燥・涼燥により選択',
    organ: '肺',
  },
  winter: {
    flavors: ['辛', '鹹'],
    natureLevels: [1, 2],
    natureText: '温性・熱性',
    organ: '腎',
  },
};

const DOYO_DAYS = 18;

/** 四立(立春・立夏・立秋・立冬)と、それが開く季節・その前の土用の名前 */
const CROSS_QUARTERS: {
  termIndex: number;
  opens: FourSeason;
  doyoParent: FourSeason;
}[] = [
  { termIndex: 0, opens: 'spring', doyoParent: 'winter' }, // 立春(冬土用が直前)
  { termIndex: 6, opens: 'summer', doyoParent: 'spring' }, // 立夏(春土用が直前)
  { termIndex: 12, opens: 'autumn', doyoParent: 'summer' }, // 立秋(夏土用が直前)
  { termIndex: 18, opens: 'winter', doyoParent: 'autumn' }, // 立冬(秋土用が直前)
];

export interface FiveSeasonInfo {
  season: FiveSeason;
  /** 土用のとき、どの季節の土用か(春土用なら 'spring') */
  doyoParent?: FourSeason;
  recommendation: SeasonRecommendation;
}

const FOUR_SEASON_LABELS: Record<FourSeason, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
};

export function fiveSeasonLabel(info: FiveSeasonInfo): string {
  if (info.season === 'doyo') {
    // doyoParent がない場合(手動で季節を選んだときなど)は総称で返す
    return info.doyoParent
      ? `長夏(${FOUR_SEASON_LABELS[info.doyoParent]}土用)`
      : '長夏(土用)';
  }
  return FOUR_SEASON_LABELS[info.season as FourSeason];
}

/**
 * 今日の五季を判定する。
 * 立X の暦日を dX とすると、dX の18日前〜前日が土用、dX からが新しい季節。
 */
export function getFiveSeason(today: Date): FiveSeasonInfo {
  const todayNum = calendarDayNumber(toCalendarDate(today));

  // 前年・当年・翌年の四立を集め、時系列に並べる
  const quarters: {
    dayNum: number;
    opens: FourSeason;
    doyoParent: FourSeason;
  }[] = [];
  for (const y of [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1]) {
    for (const cq of CROSS_QUARTERS) {
      const instant = termInstant(y, SOLAR_TERMS[cq.termIndex]);
      quarters.push({
        dayNum: calendarDayNumber(toCalendarDate(instant)),
        opens: cq.opens,
        doyoParent: cq.doyoParent,
      });
    }
  }
  quarters.sort((a, b) => a.dayNum - b.dayNum);

  // 今日以降で最初に来る四立を探す(今日が四立当日ならその四立は「過ぎた」扱い)
  const upcoming = quarters.find((q) => q.dayNum > todayNum);
  const last = [...quarters].reverse().find((q) => q.dayNum <= todayNum);
  if (!upcoming || !last) throw new Error('五季の判定に失敗しました');

  if (todayNum >= upcoming.dayNum - DOYO_DAYS) {
    return {
      season: 'doyo',
      doyoParent: upcoming.doyoParent,
      recommendation: SEASON_RECOMMENDATIONS.doyo,
    };
  }
  return {
    season: last.opens,
    recommendation: SEASON_RECOMMENDATIONS[last.opens],
  };
}

export type { CalendarDate };
