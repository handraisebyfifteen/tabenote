/**
 * 画面の文字列(日英)。データ側の術語の変換は terms.ts に分離。
 *
 * 文は言語ごとに丸ごと書く(語順が違うため、キーの穴埋めでは自然にならない)。
 * 効能・症状・点数に踏み込まない制約(指示書 2章・9章)は両言語に適用する。
 */
import type { Cat5 } from '../data/foods';
import type { FiveFlavor } from '../logic/flavors';
import type { FiveSeason } from '../logic/season';
import { cat5Label, fiveFlavorLabel, organLabel, seasonNatureText, type Lang } from './terms';

export interface Strings {
  tabs: { home: string; combine: string; notebook: string; settings: string };

  home: {
    dateLabel(d: Date): string;
    nextTermIn(nextKanji: string, nextEnglish: string, days: number): string;
    nowSeasonTitle: string;
    seasonSentence(organJa: string, flavors: FiveFlavor[]): string;
    natureLine(season: FiveSeason): string;
    seeSeasonFoods: string;
  };

  combine: {
    searchPlaceholder: string;
    quickTab: string;
    allTab: string;
    quickEmpty: string;
    decide(count: number): string;
  };

  advice: {
    screenTitle: string;
    flavorsTitle: string;
    flavorFact(dominant: FiveFlavor[], missing: FiveFlavor[]): string;
    categoriesTitle: string;
    categoryFact(missing: Cat5[]): string;
    seasonTitle: string;
    seasonFact(seasonLabel: string, flavors: FiveFlavor[]): string;
    balanceTitle: string;
    oppositeFact(a: string, b: string): string;
    fillTitle: string;
    fillFlavorLabel(flavor: FiveFlavor): string;
    fillCatLabel(cat: Cat5): string;
    fillNote: string;
    cookingTitle: string;
    cookingCool: string;
    cookingWarm: string;
    cookingBalanced: string;
    save: string;
    savedDone: string;
    close: string;
    defaultComboName(month: number, day: number): string;
  };

  notebook: {
    segCombos: string;
    segZukan: string;
    segGuide: string;
    empty: string;
    namePlaceholder: string;
    memoPlaceholder: string;
    openInCombine: string;
    viewComposition: string;
    deleteAction: string;
    deleteTitle: string;
    deleteMessage(name: string): string;
    deleteCancel: string;
    deleteConfirm: string;
    zukanPlaceholder(count: number): string;
  };

  guide: {
    fivePhasesTitle: string;
    fivePhasesTable: string[][];
    meridianNote: string;
    flavorWorksTitle: string;
    flavorNotes: [string, string][];
    flavorCaveat: string;
    organsTitle: string;
    organsBody: string;
    seasonsTitle: string;
    seasonsBody1: string;
    seasonsBody2: string;
    conventionsTitle: string;
    conventionsBody: string;
    positionTitle: string;
    positionBody: string;
    referencesLine: string;
  };

  food: {
    notFound: string;
    referenceOnly(note: string): string;
    natureLabel: string;
    flavorLabel: string;
    meridiansLabel: string;
    categoryLabel: string;
    noteLabel: string;
    source(page: string): string;
    memoTitle: string;
    memoPlaceholder: string;
    memoHint: string;
    emptyValue: string;
  };

  settings: {
    billing: string;
    billingNote: string;
    language: string;
    languageNote: string;
    references: string;
    referencesBody: string;
    disclaimer: string;
    disclaimerBody: string;
    exportTitle: string;
    exportNote: string;
    exportShareTitle: string;
    exportFailTitle: string;
    exportFailBody: string;
  };
}

const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** 'sour, pungent, and sweet' 形式の列挙 */
function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function flavorsEn(flavors: FiveFlavor[]): string {
  return listEn(flavors.map((f) => fiveFlavorLabel(f, 'en').toLowerCase()));
}

const ja: Strings = {
  tabs: { home: 'ホーム', combine: '組み合わせ', notebook: '手帳', settings: '設定' },

  home: {
    dateLabel: (d) =>
      `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS_JA[d.getDay()]})`,
    nextTermIn: (kanji, _english, days) => `次の節気「${kanji}」まで あと${days}日`,
    nowSeasonTitle: 'いまの五季',
    seasonSentence: (organ, flavors) =>
      `${organ}を養う季節。${flavors.join('味・')}味が推奨されます。`,
    natureLine: (season) => `性は ${seasonNatureText(season, 'ja')}`,
    seeSeasonFoods: 'この季節の食材を見る',
  },

  combine: {
    searchPlaceholder: '食材をさがす',
    quickTab: '★ よく使う',
    allTab: 'すべて',
    quickEmpty: '★を付けた食材と、「決定」した食材がここに並びます。',
    decide: (count) => (count > 0 ? `決定(${count}品)` : '決定'),
  },

  advice: {
    screenTitle: 'アドバイス',
    flavorsTitle: '五味',
    flavorFact: (dominant, missing) =>
      dominant.length === 0
        ? ''
        : `${dominant.join('味・')}味に寄った構成です。` +
          (missing.length > 0
            ? `${missing.join('味・')}味が入っていません。`
            : '五味すべてが入っています。'),
    categoriesTitle: '5つの分類',
    categoryFact: (missing) =>
      missing.length === 0
        ? '5つの分類すべてから選ばれています。'
        : `5つの分類のうち${5 - missing.length}つから選ばれています。` +
          `${missing.map((k) => cat5Label(k, 'ja')).join('、')}が入っていません。`,
    seasonTitle: '季節との関係',
    seasonFact: (label, flavors) =>
      `いまは${label}。${flavors.join('味・')}味が推奨される季節です。点線は季節の推奨の形です。`,
    balanceTitle: '釣り合い',
    oppositeFact: (a, b) =>
      `「${a}」と「${b}」は性が正反対なので、同じ皿には向きません。`,
    fillTitle: '補うなら',
    fillFlavorLabel: (f) => `${f}味`,
    fillCatLabel: (c) => cat5Label(c, 'ja'),
    fillNote:
      '候補は ★お気に入り・よく使う食材・季節の推奨(性)を優先しています。タップで図鑑が開きます。',
    cookingTitle: '調理の方向性',
    cookingCool:
      '涼しい側に寄った構成です。冷製より、炒める・煮込むといった温める調理のほうが釣り合います。',
    cookingWarm:
      '温かい側に寄った構成です。長い煮込みより、冷製やさっと仕上げる調理のほうが釣り合います。',
    cookingBalanced: '寒熱の偏りが小さい構成です。調理法は自由に選べます。',
    save: '手帳に保存',
    savedDone: '手帳に保存しました ✓',
    close: '閉じる',
    defaultComboName: (m, d) => `${m}/${d}の組み合わせ`,
  },

  notebook: {
    segCombos: '組み合わせ',
    segZukan: '図鑑',
    segGuide: '解説',
    empty:
      'まだ何も保存されていません。\n組み合わせタブで食材を選んで「決定」→「手帳に保存」すると、ここに並びます。',
    namePlaceholder: '名前',
    memoPlaceholder: 'この組み合わせのメモ。入力を終えると自動で保存されます。',
    openInCombine: '組み合わせで開く',
    viewComposition: 'この構成を見る',
    deleteAction: '削除',
    deleteTitle: '削除',
    deleteMessage: (name) => `「${name}」を手帳から削除しますか?`,
    deleteCancel: 'やめる',
    deleteConfirm: '削除する',
    zukanPlaceholder: (count) => `図鑑をさがす(全${count}品目)`,
  },

  guide: {
    fivePhasesTitle: '五行の体系',
    fivePhasesTable: [
      ['五行', '季節', '色', '五臓', '五味'],
      ['木', '春', '青', '肝', '酸'],
      ['火', '夏', '赤', '心', '苦'],
      ['土', '長夏', '黄', '脾', '甘'],
      ['金', '秋', '白', '肺', '辛'],
      ['水', '冬', '黒', '腎', '鹹'],
    ],
    meridianNote:
      '帰経は五味と対応します(酸→肝経、苦→心経、甘→脾経、辛→肺経、鹹→腎経)。本アプリでは帰経は表示のみで、判定には使いません。',
    flavorWorksTitle: '五味のはたらき',
    flavorNotes: [
      ['酸', '引き締めて、漏れ出るのを抑える(収斂)'],
      ['苦', '余分な熱や湿を下ろして出す(清熱・燥湿)'],
      ['甘', '気血を補い、脾胃を整え、ゆるめる(補益・緩急)'],
      ['辛', '散らして、気血を巡らせる(発散・行気)'],
      ['鹹', 'かたいものを軟らかくして通す(軟堅)'],
    ],
    flavorCaveat: '五味は味覚だけを指す言葉ではありません。',
    organsTitle: '五臓六腑について(必ずお読みください)',
    organsBody:
      '中医学での五臓六腑は、臓器を指したものではありません。それぞれの生理機能の名称としてあるものです。',
    seasonsTitle: '節気と五季',
    seasonsBody1:
      '節気は四季の暦(立春・立夏・立秋・立冬で4等分)、五行の季節は五つ。もともと別の体系です。本アプリは立春・立夏・立秋・立冬の直前18日間(土用)を長夏=脾の季節として扱います。年4回、計72日。',
    seasonsBody2:
      'そのため、大暑の日に「いまは長夏(夏土用)」と表示されるのは矛盾ではなく、二つの暦が重なって流れていることの現れです。',
    conventionsTitle: '本アプリ独自の整理',
    conventionsBody:
      '・淡は甘に、渋は酸に属するものとして 0.5 に数える\n・「微」の付く味も 0.5 に数える\n・性は 寒-2 〜 熱+2 の5段階にして平均し、色で表す\n・長夏は土用方式(四立の直前18日間)で判定する',
    positionTitle: '立ち位置と参考文献',
    positionBody:
      '本アプリは、中医学で伝統的に用いられてきた食材の分類(性・味・帰経)を、一般に知られる内容の範囲で整理して示すものです。効能や治療について述べるものではありません。',
    referencesLine:
      '参考文献:『薬膳食典 食物性味表(第2版)』『増補新版 薬膳・漢方 食材&食べ合わせ手帖』『新版 毎日使える薬膳&漢方の食材事典』『実用中医薬膳学』ほか(詳細は 設定 > 参考文献)',
  },

  food: {
    notFound: '食材が見つかりません。',
    referenceOnly: (note) => `この項目は参照のみです。${note !== '' ? `(${note})` : ''}`,
    natureLabel: '性',
    flavorLabel: '味',
    meridiansLabel: '帰経',
    categoryLabel: '分類',
    noteLabel: '備考',
    source: (page) => `参考資料 p.${page}`,
    memoTitle: '自分のメモ',
    memoPlaceholder: '調べたこと・体感・自分の解釈など、自由に。',
    memoHint: '書くのは持ち主。入力を終えると自動で保存されます。',
    emptyValue: '—',
  },

  settings: {
    billing: '課金 / 復元',
    billingNote: 'フェーズ8(RevenueCat)で実装予定',
    language: '言語',
    languageNote: '食材名は現在日本語のみです',
    references: '参考文献',
    referencesBody:
      '本アプリの性・味・帰経・分類のデータは、中医学で一般に知られている内容を、以下の資料を参考に整理したものです。\n\n・『薬膳食典 食物性味表 ―食養生の知恵―(第2版)』一般社団法人 日本中医食養学会 編著/日本中医学院 監修\n・『増補新版 薬膳・漢方 食材&食べ合わせ手帖』喩静・植木もも子 監修(西東社)\n・『新版 毎日使える薬膳&漢方の食材事典』阪口珠未(ナツメ社)\n・『実用中医薬膳学』辰巳洋(東洋学術出版社)ほか同著者の著作\n\n解説文はアプリ側で独自に書き起こしており、特定の書籍の解説や体系をそのまま再現するものではありません。',
    disclaimer: '免責',
    disclaimerBody:
      'tabenote は、中医学で伝統的に用いられてきた食材の分類(性・味・帰経)を情報として示すアプリです。\n\n効能を約束したり、症状の改善を示唆したりするものではなく、医師の診断・治療の代わりにはなりません。体調に不安があるときは医療機関にご相談ください。\n\n食物アレルギーや体質に関わる判断は、必ずご自身で行ってください。',
    exportTitle: 'データのエクスポート',
    exportNote: 'お気に入り・メモ・保存した組み合わせを書き出します',
    exportShareTitle: 'tabenote データ',
    exportFailTitle: 'エクスポート',
    exportFailBody: 'データの書き出しに失敗しました。',
  },
};

const en: Strings = {
  tabs: { home: 'Home', combine: 'Combine', notebook: 'Notebook', settings: 'Settings' },

  home: {
    dateLabel: (d) =>
      `${WEEKDAYS_EN[d.getDay()]}, ${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    nextTermIn: (kanji, english, days) =>
      days === 1
        ? `1 day until the next term, ${english} (${kanji})`
        : `${days} days until the next term, ${english} (${kanji})`,
    nowSeasonTitle: 'The season now',
    seasonSentence: (organ, flavors) =>
      `A season that nourishes the ${organLabel(organ, 'en')}. ` +
      `${capitalize(flavorsEn(flavors))} flavors are favored.`,
    natureLine: (season) => `Nature: ${seasonNatureText(season, 'en')}`,
    seeSeasonFoods: "See this season's ingredients",
  },

  combine: {
    searchPlaceholder: 'Search ingredients',
    quickTab: '★ Frequent',
    allTab: 'All',
    quickEmpty: 'Ingredients you star, or pick and “Decide” with, will appear here.',
    decide: (count) => (count > 0 ? `Decide (${count})` : 'Decide'),
  },

  advice: {
    screenTitle: 'Advice',
    flavorsTitle: 'Five flavors',
    flavorFact: (dominant, missing) =>
      dominant.length === 0
        ? ''
        : `This combination leans ${flavorsEn(dominant)}. ` +
          (missing.length > 0
            ? `No ${flavorsEn(missing)} yet.`
            : 'All five flavors are present.'),
    categoriesTitle: 'Five groups',
    categoryFact: (missing) =>
      missing.length === 0
        ? 'Drawn from all five groups.'
        : `Drawn from ${5 - missing.length} of the five groups — ` +
          `${listEn(missing.map((k) => cat5Label(k, 'en')))} not yet included.`,
    seasonTitle: 'The season',
    seasonFact: (label, flavors) =>
      `It is now ${label}. ${capitalize(flavorsEn(flavors))} flavors are favored this season — ` +
      'the dotted line shows that shape.',
    balanceTitle: 'Balance',
    oppositeFact: (a, b) =>
      `“${a}” and “${b}” have opposite natures, so they don't sit well on the same plate.`,
    fillTitle: 'To fill the gaps',
    fillFlavorLabel: (f) => fiveFlavorLabel(f, 'en'),
    fillCatLabel: (c) => cat5Label(c, 'en'),
    fillNote:
      "Candidates favor your ★ favorites, frequently used ingredients, and the season's recommended nature. Tap to open the encyclopedia.",
    cookingTitle: 'Cooking direction',
    cookingCool:
      'This combination leans cool. Warming preparations — stir-frying, simmering — balance it better than cold dishes.',
    cookingWarm:
      'This combination leans warm. Chilled or quickly finished preparations balance it better than long simmering.',
    cookingBalanced: 'Hot and cold sit evenly here. Any cooking method works.',
    save: 'Save to notebook',
    savedDone: 'Saved to notebook ✓',
    close: 'Close',
    defaultComboName: (m, d) => `Combination of ${m}/${d}`,
  },

  notebook: {
    segCombos: 'Combinations',
    segZukan: 'Encyclopedia',
    segGuide: 'Guide',
    empty:
      'Nothing saved yet.\nPick ingredients in the Combine tab, tap “Decide”, then “Save to notebook” — they will appear here.',
    namePlaceholder: 'Name',
    memoPlaceholder: 'Notes for this combination. Saved automatically when you finish.',
    openInCombine: 'Open in Combine',
    viewComposition: 'View composition',
    deleteAction: 'Delete',
    deleteTitle: 'Delete',
    deleteMessage: (name) => `Remove “${name}” from your notebook?`,
    deleteCancel: 'Cancel',
    deleteConfirm: 'Delete',
    zukanPlaceholder: (count) => `Search the encyclopedia (${count} entries)`,
  },

  guide: {
    fivePhasesTitle: 'The Five Phases',
    fivePhasesTable: [
      ['Phase', 'Season', 'Color', 'Organ', 'Flavor'],
      ['Wood', 'Spring', 'Blue-green', 'Liver', 'Sour'],
      ['Fire', 'Summer', 'Red', 'Heart', 'Bitter'],
      ['Earth', 'Long summer', 'Yellow', 'Spleen', 'Sweet'],
      ['Metal', 'Autumn', 'White', 'Lung', 'Pungent'],
      ['Water', 'Winter', 'Black', 'Kidney', 'Salty'],
    ],
    meridianNote:
      'Meridians pair with the flavors (sour→Liver, bitter→Heart, sweet→Spleen, pungent→Lung, salty→Kidney). This app shows meridians for reference only; they play no part in the analysis.',
    flavorWorksTitle: 'What the five flavors do',
    flavorNotes: [
      ['Sour', 'draws in and holds — keeps things from leaking away'],
      ['Bitter', 'sends excess heat and damp down and out'],
      ['Sweet', 'replenishes, settles the digestion, and relaxes'],
      ['Pungent', 'disperses, and gets qi and blood moving'],
      ['Salty', 'softens what is hard and helps it pass'],
    ],
    flavorCaveat: 'The five flavors are about more than taste.',
    organsTitle: 'About the organs (please read)',
    organsBody:
      'In Chinese medicine, the five zang and six fu do not refer to anatomical organs. They are names for physiological functions.',
    seasonsTitle: 'Solar terms and the five seasons',
    seasonsBody1:
      'The solar terms follow a four-season calendar, divided by the Beginnings of Spring, Summer, Autumn, and Winter. The Five Phases ask for five seasons. They are separate systems. This app treats the eighteen days before each Beginning — the doyō — as the long summer, the season of the Spleen: four times a year, 72 days in all.',
    seasonsBody2:
      'So when Major Heat shows “long summer (summer doyō)”, that is not a contradiction — two calendars are flowing at once.',
    conventionsTitle: 'Conventions of this app',
    conventionsBody:
      '• Bland counts toward sweet at 0.5; astringent toward sour at 0.5\n• Flavors marked “slightly” also count 0.5\n• Nature is averaged on a five-step scale (cold −2 to hot +2) and shown as color\n• The long summer is determined by the doyō method (the eighteen days before each Beginning)',
    positionTitle: 'Position and references',
    positionBody:
      'This app organizes the classifications traditionally used in Chinese dietary theory — nature, flavor, meridians — within what is commonly known. It makes no claims about effects or treatment.',
    referencesLine:
      'References: Yakuzen Shokuten: Shokumotsu Seimihyō (2nd ed.); Yakuzen–Kanpō Shokuzai & Tabeawase Techō (expanded ed.); Mainichi Tsukaeru Yakuzen & Kanpō no Shokuzai Jiten (new ed.); Jitsuyō Chūi Yakuzengaku — see Settings > References for details.',
  },

  food: {
    notFound: 'Ingredient not found.',
    referenceOnly: (note) =>
      `This entry is a reference only.${note !== '' ? ` (${note})` : ''}`,
    natureLabel: 'Nature',
    flavorLabel: 'Flavor',
    meridiansLabel: 'Meridians',
    categoryLabel: 'Category',
    noteLabel: 'Notes',
    source: (page) => `Reference p.${page}`,
    memoTitle: 'My notes',
    memoPlaceholder: 'Anything you learn, feel, or interpret — in your own words.',
    memoHint: 'This page is yours to write. Saved automatically when you finish.',
    emptyValue: '—',
  },

  settings: {
    billing: 'Subscription / Restore',
    billingNote: 'Planned for phase 8 (RevenueCat)',
    language: 'Language',
    languageNote: 'Ingredient names are currently Japanese only',
    references: 'References',
    referencesBody:
      'The nature, flavor, meridian, and category data in this app organizes what is commonly known in Chinese dietary theory, consulting the following sources:\n\n• Yakuzen Shokuten: Shokumotsu Seimihyō — Shokuyōjō no Chie, 2nd ed. (薬膳食典 食物性味表), compiled by the Nihon Chūi Shokuyō Gakkai, supervised by Nihon Chūi Gakuin\n• Zōho Shinpan: Yakuzen–Kanpō Shokuzai & Tabeawase Techō (増補新版 薬膳・漢方 食材&食べ合わせ手帖), supervised by Yu Jing and Momoko Ueki (Seitosha)\n• Shinpan: Mainichi Tsukaeru Yakuzen & Kanpō no Shokuzai Jiten (新版 毎日使える薬膳&漢方の食材事典), by Tamami Sakaguchi (Natsumesha)\n• Jitsuyō Chūi Yakuzengaku (実用中医薬膳学), by Nami Tatsumi (Tōyō Gakujutsu Shuppansha), and other works by the same author\n\nAll explanatory text is written independently for this app; it does not reproduce any single book’s commentary or structure.',
    disclaimer: 'Disclaimer',
    disclaimerBody:
      'tabenote presents the traditional classifications of ingredients used in Chinese medicine — nature, flavor, meridians — as information.\n\nIt makes no promises about effects, does not suggest that symptoms will improve, and is no substitute for diagnosis or treatment by a physician. If you have health concerns, please consult a medical professional.\n\nDecisions involving food allergies or your own constitution are always yours to make.',
    exportTitle: 'Export data',
    exportNote: 'Writes out your favorites, notes, and saved combinations',
    exportShareTitle: 'tabenote data',
    exportFailTitle: 'Export',
    exportFailBody: 'Could not export your data.',
  },
};

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

const STRINGS: Record<Lang, Strings> = { ja, en };

export function getStrings(lang: Lang): Strings {
  return STRINGS[lang];
}
