/**
 * 画面の文字列(日英)。データ側の術語の変換は terms.ts に分離。
 *
 * 文は言語ごとに丸ごと書く(語順が違うため、キーの穴埋めでは自然にならない)。
 * 効能・症状・点数に踏み込まない制約(指示書 2章・9章)は両言語に適用する。
 */
import type { Cat5 } from '../data/foods';
import type { FiveFlavor } from '../logic/flavors';
import type { FiveSeason } from '../logic/season';
import type { Store } from '../constants/site';
import { cat5Label, fiveFlavorLabel, organLabel, seasonNatureText, type Lang } from './terms';

export interface Strings {
  tabs: { home: string; combine: string; notebook: string; settings: string };

  home: {
    dateLabel(d: Date): string;
    nextTermIn(nextKanji: string, nextEnglish: string, days: number): string;
    /** 節気の進み具合(elapsed は1日目から数える) */
    termDay(elapsed: number, total: number): string;
    nowSeasonTitle: string;
    seasonSentence(organJa: string, flavors: FiveFlavor[]): string;
    natureLine(season: FiveSeason): string;
    seeSeasonFoods: string;
    /** 「いまの季節に合う食材」の見出しと、タップの案内 */
    seasonFoodsTitle: string;
    seasonFoodsHint: string;
    /** 節気の説明の折りたたみ見出し */
    aboutTermTitle: string;
  };

  combine: {
    searchPlaceholder: string;
    quickTab: string;
    /** ★よく使うタブの中の見出し。季節の食材の組と、よく使うの組を分ける */
    quickSeasonTitle(season: string): string;
    allTab: string;
    quickEmpty: string;
    decide(count: number): string;
    /** 何もカーソルが乗っていないときのグリッド操作ヒント */
    gridHint: string;
    /** 1タップ目(カーソル)のあとに出す決定ヒント */
    focusHint: string;
    /** 季節ボタン・季節モーダルの見出し */
    seasonLabel: string;
    /** 今日の季節のチップに付ける印 */
    seasonToday: string;
    /** 季節モーダルの補足(今日を選ぶと自動追従に戻る) */
    seasonModalNote: string;
    /** ？ボタンで開く五行解説の見出し */
    helpTitle: string;
    /** 解説: 塗りの五角形(五味の合計) */
    helpPentagon: string;
    /** 解説: 点線(選んだ季節のおすすめの味) */
    helpDashed: string;
    /** 解説: 相生・相克図の読みかた(赤=相生、青=相克) */
    helpCycle: string;
    /** 解説: タイルの枠色 = 性 */
    helpNature: string;
    /** モーダルを閉じる */
    close: string;
  };

  advice: {
    screenTitle: string;
    flavorsTitle: string;
    flavorFact(dominant: FiveFlavor[], missing: FiveFlavor[]): string;
    categoriesTitle: string;
    /** missing は調味料・飲み物を除いた主な4分類の不足(coverage.adviceMissingCats) */
    categoryFact(missing: Cat5[]): string;
    seasonTitle: string;
    seasonFact(seasonLabel: string, flavors: FiveFlavor[]): string;
    balanceTitle: string;
    oppositeFact(a: string, b: string): string;
    fillTitle: string;
    fillFlavorLabel(flavor: FiveFlavor): string;
    fillCatLabel(cat: Cat5): string;
    /** 候補を次の窓に入れ替えるボタン */
    fillMore: string;
    fillNote: string;
    cookingTitle: string;
    cookingCool: string;
    cookingWarm: string;
    cookingBalanced: string;
    /** AI献立提案(フェーズ9)。表現の制約(効能・症状・点数を出さない)はサーバー側で強制 */
    aiTitle: string;
    aiButton: string;
    aiRetryButton: string;
    aiLoading: string;
    aiError: string;
    /** 短時間に使いすぎたとき(サーバーが429を返す) */
    aiRateLimited: string;
    aiNote: string;
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
    /** 組み合わせの検索窓と、1件も当たらなかったとき */
    combosPlaceholder(count: number): string;
    combosSearchEmpty: string;
    zukanPlaceholder(count: number): string;
    /** 組み合わせタイムラインの日付見出し */
    dateHeading(d: Date): string;
    /** 週ストリップ: 月ラベル・曜日の頭文字(月曜はじまり)・今日の週へ戻る */
    weekMonthLabel(d: Date): string;
    weekDayInitials: string[];
    weekToday: string;
    /** 図鑑のフィルタ: すべて / ★お気に入り / メモあり */
    filterAll: string;
    filterStarred: string;
    filterMemo: string;
    /** ★・メモありフィルタで1件もないとき */
    filterEmpty: string;
  };

  /**
   * 検索が1件も当たらなかったときのAIの案内(組み合わせ画面・図鑑で共通)。
   * 出すのは「図鑑の中の近い食材」だけで、図鑑に無い食材の性・味は示さない。
   */
  aiSimilar: {
    notFound(query: string): string;
    askButton: string;
    retryButton: string;
    loading: string;
    error: string;
    /** 短時間に使いすぎたとき(サーバーが429を返す) */
    rateLimited: string;
    /** 購読が要るとき(サーバーが402を返す) */
    subscriptionRequired: string;
    subscribeButton: string;
    /** 近いものが挙がらなかったとき */
    emptyResult: string;
    note: string;
    /** 組み合わせ画面: 行をタップするとどうなるか */
    addHint: string;
    /** 組み合わせ画面: すでに選んである食材の印 */
    addedMark: string;
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
  };

  food: {
    notFound: string;
    referenceOnly(note: string): string;
    natureLabel: string;
    flavorLabel: string;
    meridiansLabel: string;
    categoryLabel: string;
    noteLabel: string;
    /** 食品安全上の注意(ふぐ・ぎんなん等)。別名とは別の行で出す */
    safetyLabel: string;
    memoTitle: string;
    memoPlaceholder: string;
    memoHint: string;
    emptyValue: string;
  };

  settings: {
    billing: string;
    /** 未購読のときの説明 */
    billingNote: string;
    /** 購読中のときの説明 */
    billingActiveNote: string;
    restore: string;
    restoreNote: string;
    restoreDoneTitle: string;
    restoreDoneBody: string;
    restoreNoneBody: string;
    restoreFailBody: string;
    manageSubscription: string;
    /** 解約の案内。決済元(Apple / Google Play)で文言が変わる */
    manageSubscriptionNote(store: Store): string;
    terms: string;
    privacy: string;
    contact: string;
    contactNote: string;
    version: string;
    language: string;
    languageNote: string;
    /** 表示(配色・文字サイズ) */
    darkMode: string;
    /** 端末の配色に追随しているとき */
    darkModeSystemNote: string;
    /** ライト/ダークをこの端末で固定したとき */
    darkModeFixedNote: string;
    /** 固定を解いて端末の設定へ戻す操作 */
    followSystem: string;
    largeText: string;
    largeTextNote: string;
    /** 効果音の音量(組み合わせのカーソル・決定) */
    sound: string;
    soundNote: string;
    soundOff: string;
    soundLow: string;
    soundMid: string;
    soundHigh: string;
    /** バイブ(触覚のフィードバック) */
    haptics: string;
    hapticsNote: string;
    references: string;
    referencesBody: string;
    disclaimer: string;
    disclaimerBody: string;
    exportTitle: string;
    exportNote: string;
    exportShareTitle: string;
    exportFailTitle: string;
    exportFailBody: string;
    about: string;
    aboutNote: string;
    licenses: string;
    licensesNote: string;
  };

  /**
   * オープンソースライセンス(app/licenses.tsx)。
   * 同梱している書体(Lexend)の OFL 表示。文面と全文は constants/licenses.ts。
   */
  licenses: {
    screenTitle: string;
    lede: string;
    /** 全文の開閉。読み上げでは名前と組んで読ませる */
    showFullText: string;
    hideFullText: string;
    /** 配布元を開くリンクの読み上げ */
    openSource: string;
  };

  /** ペイウォール(指示書 7章「課金設計」) */
  /**
   * 購読案内(申請準備指示書 2章)。プランは「tabenote 月額プラン」1本のみ。
   * 「プレミアム」「PRO」「アップグレード」「アンロック」は使わない(指示書の禁止事項)。
   * 請求される総額(priceString)が画面で最も目立つこと(Apple の要件)。
   */
  paywall: {
    screenTitle: string;
    /** プラン名。サブスクの表示名(App Store Connect)と揃える */
    planName: string;
    lead: string;
    includedTitle: string;
    /** できることの列挙。\n 区切りで箇条書きにする */
    includedBody: string;
    /** 価格の直下に置く期間の説明 */
    periodNote: string;
    subscribe: string;
    /** 自動更新・解約方法の説明(ボタンの下) */
    /** 自動更新と解約方法の説明。決済元(Apple / Google Play)で文言が変わる */
    renewalNote(store: Store): string;
    restore: string;
    loading: string;
    unavailable: string;
    retry: string;
    alreadySubscribed: string;
    failTitle: string;
    failBody: string;
    restoreDoneTitle: string;
    restoreDoneBody: string;
    restoreNoneBody: string;
    restoreFailBody: string;
    terms: string;
    privacy: string;
    /** 購読が切れた人が保存データを持ち出すための書き出し(初回ゲートの画面だけに出す) */
    exportSaved: string;
  };

  /** 初回起動のオンボーディング(3枚)→ 購読案内(Guideline 4.2 対策) */
  onboarding: {
    pages: { title: string; body: string }[];
    next: string;
    skip: string;
  };

  /**
   * 紹介ページ(/about)。公開サイトのランディングを兼ねる(指示書外)。
   * 文面は App Store の説明文(docs/asc-metadata.md)と揃える。
   * 効能・症状・点数に踏み込まない制約は本文と同じく適用する(指示書 2章・9章)。
   */
  about: {
    screenTitle: string;
    /** App Store のサブタイトルと同じもの */
    tagline: string;
    lead: string;
    sections: { title: string; body: string }[];
    /** 「効能は書かない」方針。このアプリの立場なので独立した枠で示す */
    policyTitle: string;
    policyBody: string;
    /** webだけに出すCTA(ネイティブでは既に使っているので出さない) */
    tryWeb: string;
    appStore: string;
    /** APP_STORE_URL が未定の間の表示 */
    appStoreSoon: string;
  };

  /** Web 初回訪問の歓迎カード(ネイティブの初回は onboarding が受け持つ) */
  welcome: {
    title: string;
    body: string;
    about: string;
    start: string;
  };

  /**
   * 公開サイト(tabenote.app)の <head>。
   * 効能・症状・点数に踏み込まない制約は本文と同じく適用する(指示書 2章・9章)。
   */
  meta: {
    home: PageMeta;
    combine: PageMeta;
    notebook: PageMeta;
    advice: PageMeta;
    settings: PageMeta;
    about: PageMeta;
    licenses: PageMeta;
    food(name: string, attrs: FoodMetaAttrs): PageMeta;
  };
}

/** ページ1枚分の <title> と meta description */
export interface PageMeta {
  title: string;
  description: string;
}

/** 食材ページの説明文に入れる事実。参照のみ項目では nature が空文字で来る */
export interface FoodMetaAttrs {
  nature: string;
  flavors: string;
  meridians: string;
  category: string;
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
    termDay: (elapsed, total) => `${elapsed} / ${total}日目`,
    nowSeasonTitle: 'いまの五季',
    seasonSentence: (organ, flavors) =>
      `${organ}を養う季節。${flavors.join('味・')}味が推奨されます。`,
    natureLine: (season) => `性は ${seasonNatureText(season, 'ja')}`,
    seeSeasonFoods: 'この季節の食材を見る',
    seasonFoodsTitle: 'いまの季節に合う食材',
    seasonFoodsHint: 'タップすると、その食材から組み合わせを始めます',
    aboutTermTitle: 'この節気について',
  },

  combine: {
    searchPlaceholder: '食材をさがす',
    quickTab: '★ よく使う',
    quickSeasonTitle: (season) => `${season}に合う食材`,
    allTab: 'すべて',
    quickEmpty: '★を付けた食材と、「決定」した食材がここに並びます。',
    decide: (count) => (count > 0 ? `決定(${count}品)` : '決定'),
    gridHint: 'タップでえらぶ・もう一度で決定・長押しで★',
    focusHint: 'もう一度タップで決定',
    seasonLabel: '季節',
    seasonToday: '今日',
    seasonModalNote: '「今日」の付いた季節を選ぶと、日付に合わせて自動で切り替わります。',
    helpTitle: '五角形の見かた',
    helpPentagon:
      '五角形の5つの角は五味(酸・苦・甘・辛・鹹)です。選んだ食材の味を足し合わせた形が、緑の塗りで描かれます。',
    helpDashed:
      '点線は、いま選んでいる季節にすすめられる味の形です。薬膳では五味を五行(木・火・土・金・水)に対応させ、季節(春・夏・土用・秋・冬)ごとに合う味を考えます。',
    helpCycle:
      '外側の赤い矢印は相生(そうせい)といい、となりの行を生み育てる流れを表します。内側の青い矢印は相克(そうこく)といい、行きすぎないようたがいにおさえ合う関係を表します。',
    helpNature: '食材タイルの枠の色は性(体を温める・冷やす方向)を表します。',
    close: '閉じる',
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
        ? '主な4つの分類(穀類・豆、野菜、果実、肉・魚)がすべて入っています。'
        : `${missing.map((k) => cat5Label(k, 'ja')).join('、')}が入っていません。`,
    seasonTitle: '季節との関係',
    seasonFact: (label, flavors) =>
      `いまは${label}。${flavors.join('味・')}味が推奨される季節です。点線は季節の推奨の形です。`,
    balanceTitle: '釣り合い',
    oppositeFact: (a, b) =>
      `「${a}」と「${b}」は性が正反対なので、同じ皿には向きません。`,
    fillTitle: '補うなら',
    fillFlavorLabel: (f) => `${f}味`,
    fillCatLabel: (c) => cat5Label(c, 'ja'),
    fillMore: '↻ ほかの候補',
    fillNote:
      '候補は ★お気に入り・よく使う食材・季節の推奨(性)を優先しています。タップで図鑑が開きます。',
    cookingTitle: '調理の方向性',
    cookingCool:
      '涼しい側に寄った構成です。冷製より、炒める・煮込むといった温める調理のほうが釣り合います。',
    cookingWarm:
      '温かい側に寄った構成です。長い煮込みより、冷製やさっと仕上げる調理のほうが釣り合います。',
    cookingBalanced: '寒熱の偏りが小さい構成です。調理法は自由に選べます。',
    aiTitle: 'AIの献立アイデア',
    aiButton: 'この組み合わせで献立のアイデアを聞く',
    aiRetryButton: 'ほかのアイデアを聞く',
    aiLoading: '考えています…',
    aiError: '提案を取得できませんでした。通信環境を確認して、もう一度お試しください。',
    aiRateLimited: '続けてお使いいただいたため、少しお待ちいただいています。1分ほどしてから、もう一度お試しください。',
    aiNote: 'AIによる提案は、料理名と方向性のアイデアです。分量や厳密な手順は示しません。',
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
    combosPlaceholder: (count) => `組み合わせをさがす(全${count}件)`,
    combosSearchEmpty: '見つかりませんでした。名前・メモ・食材の名前・日付で探せます。',
    zukanPlaceholder: (count) => `図鑑をさがす(全${count}品目)`,
    dateHeading: (d) =>
      `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS_JA[d.getDay()]})`,
    weekMonthLabel: (d) => `${d.getFullYear()}年${d.getMonth() + 1}月`,
    weekDayInitials: ['月', '火', '水', '木', '金', '土', '日'],
    weekToday: '今日',
    filterAll: 'すべて',
    filterStarred: '★ お気に入り',
    filterMemo: 'メモあり',
    filterEmpty: '★を付けた食材や、メモを書いた食材がここに並びます。',
  },

  aiSimilar: {
    notFound: (query) => `「${query}」は図鑑にありません。`,
    askButton: 'AIに近い食材を聞く',
    retryButton: 'もう一度聞く',
    loading: '探しています…',
    error: '近い食材を取得できませんでした。通信環境を確認して、もう一度お試しください。',
    rateLimited: '続けてお使いいただいたため、少しお待ちいただいています。1分ほどしてから、もう一度お試しください。',
    subscriptionRequired: 'AIの案内は有料機能です。',
    subscribeButton: '詳しく見る',
    emptyResult: '近いとされる食材は挙がりませんでした。',
    note: 'AIの案内です。図鑑に無い食材の性・味は示しません。図鑑の中で近いとされる食材を挙げるだけです。',
    addHint: 'タップで組み合わせに追加',
    addedMark: '追加済み',
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
    positionTitle: '立ち位置',
    positionBody:
      '本アプリは、中医学で伝統的に用いられてきた食材の分類(性・味・帰経)を、一般に知られる内容の範囲で整理して示すものです。効能や治療について述べるものではありません。',
  },

  food: {
    notFound: '食材が見つかりません。',
    referenceOnly: (note) => `この項目は参照のみです。${note !== '' ? `(${note})` : ''}`,
    natureLabel: '性',
    flavorLabel: '味',
    meridiansLabel: '帰経',
    categoryLabel: '分類',
    noteLabel: '別名',
    safetyLabel: '安全上の注意',
    memoTitle: '自分のメモ',
    memoPlaceholder: '調べたこと・体感・自分の解釈など、自由に。',
    memoHint: '書くのは持ち主。入力を終えると自動で保存されます。',
    emptyValue: '—',
  },

  settings: {
    billing: '月額プラン',
    billingNote: 'ご利用には月額プランのご登録が必要です',
    billingActiveNote: 'ご登録中です。プランの内容を確認できます',
    restore: '購入を復元',
    restoreNote: '機種変更などで購読が引き継がれていないとき',
    restoreDoneTitle: '購入の復元',
    restoreDoneBody: '購読を復元しました。',
    restoreNoneBody: '復元できる購読が見つかりませんでした。',
    restoreFailBody: '復元に失敗しました。通信環境を確認してください。',
    manageSubscription: 'サブスクリプションの管理',
    manageSubscriptionNote: (store) =>
      store === 'apple'
        ? '解約もこちらから(Apple の管理画面が開きます)'
        : '解約もこちらから(Google Play の管理画面が開きます)',
    terms: '利用規約',
    privacy: 'プライバシーポリシー',
    contact: 'お問い合わせ',
    contactNote: 'よくある質問とサポートページを開きます',
    version: 'バージョン',
    language: '言語',
    languageNote: '食材名は現在日本語のみです',
    darkMode: 'ダークモード',
    darkModeSystemNote: '端末の設定に合わせています',
    darkModeFixedNote: 'この端末での表示を固定しています',
    followSystem: '端末の設定に戻す',
    largeText: '大きく表示',
    largeTextNote: '文字を大きくし、組み合わせのマスを3列から2列にします',
    sound: '効果音',
    soundNote: '組み合わせで食材を選んだとき・決めたときの音です。段を選ぶと試しに鳴ります',
    soundOff: '消音',
    soundLow: '小',
    soundMid: '中',
    soundHigh: '大',
    haptics: 'バイブ',
    hapticsNote: '組み合わせで食材を選んだとき・決めたときに短く振動します。音とは別に切れます',
    references: '参考文献',
    referencesBody:
      '本アプリの性・味・帰経・分類は、中医学で広く共有されている伝統的な分類を、複数の一般的な資料にあたって事実データとして整理したものです。特定の書籍の解説・構成・文章を再現したものではありません。\n\n別名・漢字名は、生物学上・言語上の一般知識に基づきます。\n\n本アプリは効能・適応(症状への応用)を扱いません。解説文はすべてアプリ側で独自に書き起こしています。',
    disclaimer: '免責',
    disclaimerBody:
      'tabenote は、中医学で伝統的に用いられてきた食材の分類(性・味・帰経)を情報として示すアプリです。\n\n効能を約束したり、症状の改善を示唆したりするものではなく、医師の診断・治療の代わりにはなりません。体調に不安があるときは医療機関にご相談ください。\n\n食物アレルギーや体質に関わる判断は、必ずご自身で行ってください。',
    about: 'tabenoteについて',
    aboutNote: 'アプリの紹介ページを開きます',
    licenses: 'オープンソースライセンス',
    licensesNote: '同梱しているソフトウェアの著作権表示とライセンス',
    exportTitle: 'データのエクスポート',
    exportNote: 'お気に入り・メモ・保存した組み合わせなどを書き出します',
    exportShareTitle: 'tabenote データ',
    exportFailTitle: 'エクスポート',
    exportFailBody: 'データの書き出しに失敗しました。',
  },

  licenses: {
    screenTitle: 'オープンソースライセンス',
    lede: 'このアプリは以下のソフトウェアを利用しています。',
    showFullText: '全文',
    hideFullText: '閉じる',
    openSource: '配布元を開く',
  },

  paywall: {
    screenTitle: '月額プラン',
    planName: 'tabenote 月額プラン',
    lead: 'tabenote のご利用には月額プランのご登録が必要です。',
    includedTitle: 'プランでできること',
    includedBody:
      '選んだ食材の組み合わせを五味・性の五角形で確かめる\n435品目の食材の図鑑(五味・性・帰経・分類)\n二十四節気と五季、いまの季節に合う味の表示\n食材に★とメモ、組み合わせを手帳に保存\n選んだ食材と季節から、AIが献立のアイデアを提案',
    periodNote: '1か月ごとの自動更新',
    subscribe: '登録する',
    renewalNote: (store) =>
      store === 'apple'
        ? '期間終了の24時間前までに解約しない限り、自動的に更新されます。お支払いは Apple アカウントに請求されます。解約は、iPhoneの「設定」→ Apple アカウント →「サブスクリプション」からいつでも行えます。'
        : '期間終了の24時間前までに解約しない限り、自動的に更新されます。お支払いは Google Play アカウントに請求されます。解約は、Google Play の「お支払いと定期購入」→「定期購入」からいつでも行えます。',
    restore: '購入を復元',
    loading: 'プランを読み込んでいます…',
    unavailable: 'いまプランを取得できませんでした。通信環境を確認して、もう一度お試しください。',
    retry: 'もう一度読み込む',
    alreadySubscribed: 'ご登録中です。すべての機能をご利用いただけます。',
    failTitle: '月額プラン',
    failBody: '手続きを完了できませんでした。しばらくしてからお試しください。',
    restoreDoneTitle: '購入の復元',
    restoreDoneBody: '購読を復元しました。',
    restoreNoneBody: '復元できる購読が見つかりませんでした。',
    restoreFailBody: '復元に失敗しました。通信環境を確認してください。',
    terms: '利用規約',
    privacy: 'プライバシーポリシー',
    exportSaved: '保存したデータを書き出す',
  },

  onboarding: {
    pages: [
      {
        title: '食材を、図で確かめる',
        body: '食材を選ぶと、その組み合わせの五味(酸・苦・甘・辛・鹹)の構成と性(寒熱)の傾向が、ひとつの五角形になります。中医学で伝統的に用いられてきた分類を、事実として示します。',
      },
      {
        title: '手帳に、自分の言葉で',
        body: '気に入った組み合わせは手帳に保存。435品目の図鑑には★とメモが付けられます。効能はアプリが書きません。書くのは、持ち主です。',
      },
      {
        title: '季節と、AIの献立案',
        body: '二十四節気と五季に合わせて、いまの季節にすすめられる味を表示。選んだ食材からは、AIが料理の方向性までのアイデアを提案します。',
      },
    ],
    next: '次へ',
    skip: 'スキップ',
  },

  about: {
    screenTitle: 'tabenoteについて',
    tagline: '食材選びの手帳。書くのは、あなた',
    lead: 'tabenote(タベノート)は、経験を積んだ料理人がするように、季節と味の釣り合いで食材を選ぶための手帳です。土台には、東アジアの台所で長く受け継がれてきた伝統的な食材の分類があります。',
    sections: [
      {
        title: '選んだ食材が、ひとつの図形になる',
        body: '食材を選ぶと、その組み合わせの五味(酸・苦・甘・辛・鹹)の構成と、性(寒熱)の傾向が、ひとつの五角形として表示されます。何が多くて何が足りないのか、形で分かります。',
      },
      {
        title: '435品目の図鑑',
        body: '収録した食材それぞれについて、五味・性・帰経・分類を掲載。★を付けたり、自分の言葉でメモを残したりできます。',
      },
      {
        title: '二十四節気と、五季',
        body: 'いまがどの節気にあたるか、五季(春・夏・長夏・秋・冬)のどこにいるかを表示し、その季節にすすめられる味をお知らせします。',
      },
      {
        title: 'AIによる献立のアイデア',
        body: '選んだ食材といまの季節から、料理の方向性までのアイデアを提案します。',
      },
    ],
    policyTitle: '効能は、アプリが書きません',
    policyBody:
      'tabenote が表示するのは、五味・性・帰経・分類という事実データまでです。「効く」「治る」といった効能や、症状・病名は扱いません。点数も付けません。解釈と記録は、持ち主であるあなたが自分の言葉で書きます。本アプリは医師の診断・治療の代わりにはなりません。',
    tryWeb: 'ブラウザでこのまま使ってみる',
    appStore: 'App Store で入手',
    appStoreSoon: 'iOS版は App Store で準備中です',
  },

  welcome: {
    title: 'tabenoteへようこそ',
    body: '料理人の食材選びの手帳です。食材を選ぶと、五味と性がひとつの五角形になります。二十四節気に合わせて、いまの季節にすすめられる味も。',
    about: 'tabenoteについて',
    start: 'このまま使ってみる',
  },

  meta: {
    home: {
      title: 'tabenote — 料理人の食材手帳',
      description:
        '二十四節気と五季を表示し、選んだ食材の組み合わせを五味・性・帰経・分類の事実として示す食材手帳。効能はアプリが書かず、持ち主が書きます。',
    },
    combine: {
      title: '組み合わせ | tabenote',
      description:
        '食材を選ぶと、その組み合わせの五味の構成・性の偏り・5つの分類の網羅を五角形の図で示します。',
    },
    notebook: {
      title: '手帳 | tabenote',
      description:
        '保存した組み合わせ、★を付けた食材の図鑑、五行と五味・五臓・節気の見取り図をまとめる手帳。',
    },
    advice: {
      title: 'アドバイス | tabenote',
      description:
        '選んだ食材の五味の過不足、5つの分類の網羅、季節との関係、性の釣り合い、調理の方向性を事実として示します。',
    },
    settings: {
      title: '設定 | tabenote',
      description: '表示言語の切り替え、参考文献、データの書き出し、免責事項。',
    },
    about: {
      title: 'tabenoteについて | tabenote',
      description:
        '料理人が食材を選ぶように、季節と味の釣り合いで組み合わせを考える食材手帳。五角形の図、435品目の図鑑、二十四節気と五季、AIの献立案。効能はアプリが書きません。',
    },
    licenses: {
      title: 'オープンソースライセンス | tabenote',
      description:
        'tabenote が利用しているオープンソースソフトウェアの著作権表示とライセンス全文。',
    },
    food: (name, a) => {
      const facts = [
        a.nature !== '' ? `性は${a.nature}` : '',
        a.flavors !== '' ? `味は${a.flavors}` : '',
        a.meridians !== '' ? `帰経は${a.meridians}` : '',
      ]
        .filter((s) => s !== '')
        .join('、');
      return {
        title: `${name} | tabenote`,
        description:
          facts !== ''
            ? `${name}(${a.category})の性・味・帰経。${facts}。tabenote の食材図鑑。`
            : `${name}(${a.category})を tabenote の食材図鑑で見る。`,
      };
    },
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
    termDay: (elapsed, total) => `Day ${elapsed} of ${total}`,
    nowSeasonTitle: 'The season now',
    seasonSentence: (organ, flavors) =>
      `A season that nourishes the ${organLabel(organ, 'en')}. ` +
      `${capitalize(flavorsEn(flavors))} flavors are favored.`,
    natureLine: (season) => `Nature: ${seasonNatureText(season, 'en')}`,
    seeSeasonFoods: "See this season's ingredients",
    seasonFoodsTitle: 'Ingredients for this season',
    seasonFoodsHint: 'Tap one to start a combination with it',
    aboutTermTitle: 'About this solar term',
  },

  combine: {
    searchPlaceholder: 'Search ingredients',
    quickTab: '★ Frequent',
    quickSeasonTitle: (season) => `Good for ${season}`,
    allTab: 'All',
    quickEmpty: 'Ingredients you star, or pick and “Decide” with, will appear here.',
    decide: (count) => (count > 0 ? `Decide (${count})` : 'Decide'),
    gridHint: 'Tap to preview · tap again to add · hold to ★',
    focusHint: 'Tap again to add',
    seasonLabel: 'Season',
    seasonToday: 'today',
    seasonModalNote:
      'Pick the season marked “today” to follow the calendar automatically.',
    helpTitle: 'Reading the pentagon',
    helpPentagon:
      'The five corners are the five flavors (sour, bitter, sweet, pungent, salty). The green shape adds up the flavors of the foods you picked.',
    helpDashed:
      'The dashed line is the flavor shape suggested for the selected season. Yakuzen maps the five flavors to the five elements (wood, fire, earth, metal, water) and pairs each season with its flavors.',
    helpCycle:
      'The red outer arrows are the generating cycle (shēng): each element nurtures the next. The blue inner arrows are the overcoming cycle (kè): each element keeps another in check.',
    helpNature:
      'The border color of each food tile shows its nature (warming vs. cooling direction).',
    close: 'Close',
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
        ? 'All four main groups (grains & beans, vegetables, fruits, meat & fish) are present.'
        : `${capitalize(listEn(missing.map((k) => cat5Label(k, 'en').toLowerCase())))} not yet included.`,
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
    fillMore: '↻ More ideas',
    fillNote:
      "Candidates favor your ★ favorites, frequently used ingredients, and the season's recommended nature. Tap to open the encyclopedia.",
    cookingTitle: 'Cooking direction',
    cookingCool:
      'This combination leans cool. Warming preparations — stir-frying, simmering — balance it better than cold dishes.',
    cookingWarm:
      'This combination leans warm. Chilled or quickly finished preparations balance it better than long simmering.',
    cookingBalanced: 'Hot and cold sit evenly here. Any cooking method works.',
    aiTitle: 'AI menu ideas',
    aiButton: 'Ask for menu ideas with this combination',
    aiRetryButton: 'Ask for other ideas',
    aiLoading: 'Thinking…',
    aiError: 'Could not get a suggestion. Please check your connection and try again.',
    aiRateLimited: 'You have made several requests in a row. Please wait about a minute and try again.',
    aiNote: 'AI suggestions are dish names and directions only — no amounts or strict recipes.',
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
    combosPlaceholder: (count) => `Search your combinations (${count} saved)`,
    combosSearchEmpty:
      'Nothing matched. You can search by name, notes, ingredient names, or date.',
    zukanPlaceholder: (count) => `Search the encyclopedia (${count} entries)`,
    dateHeading: (d) =>
      `${WEEKDAYS_EN[d.getDay()]}, ${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    weekMonthLabel: (d) => `${MONTHS_EN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`,
    weekDayInitials: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    weekToday: 'Today',
    filterAll: 'All',
    filterStarred: '★ Favorites',
    filterMemo: 'With memos',
    filterEmpty: 'Foods you star or write memos on will collect here.',
  },

  aiSimilar: {
    notFound: (query) => `“${query}” is not in the encyclopedia.`,
    askButton: 'Ask AI for close foods',
    retryButton: 'Ask again',
    loading: 'Looking…',
    error: 'Could not get close foods. Please check your connection and try again.',
    rateLimited: 'You have made several requests in a row. Please wait about a minute and try again.',
    subscriptionRequired: 'AI guidance is a paid feature.',
    subscribeButton: 'Learn more',
    emptyResult: 'No close foods came up.',
    note: 'An AI suggestion. It does not state the nature or flavors of a food outside the encyclopedia — it only names foods within it that are said to be close.',
    addHint: 'Tap to add to your combination',
    addedMark: 'Added',
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
    positionTitle: 'Position',
    positionBody:
      'This app organizes the classifications traditionally used in Chinese dietary theory — nature, flavor, meridians — within what is commonly known. It makes no claims about effects or treatment.',
  },

  food: {
    notFound: 'Ingredient not found.',
    referenceOnly: (note) =>
      `This entry is a reference only.${note !== '' ? ` (${note})` : ''}`,
    natureLabel: 'Nature',
    flavorLabel: 'Flavor',
    meridiansLabel: 'Meridians',
    categoryLabel: 'Category',
    noteLabel: 'Also known as',
    safetyLabel: 'Safety note',
    memoTitle: 'My notes',
    memoPlaceholder: 'Anything you learn, feel, or interpret — in your own words.',
    memoHint: 'This page is yours to write. Saved automatically when you finish.',
    emptyValue: '—',
  },

  settings: {
    billing: 'Monthly Plan',
    billingNote: 'A monthly plan is required to use tabenote',
    billingActiveNote: 'You are subscribed. View the plan details here.',
    restore: 'Restore purchases',
    restoreNote: 'If your subscription did not carry over to a new device',
    restoreDoneTitle: 'Restore purchases',
    restoreDoneBody: 'Your subscription has been restored.',
    restoreNoneBody: 'No subscription was found to restore.',
    restoreFailBody: 'Could not restore. Please check your connection.',
    manageSubscription: 'Manage subscription',
    manageSubscriptionNote: (store) =>
      store === 'apple'
        ? 'Cancel here too (opens Apple’s management page)'
        : 'Cancel here too (opens Google Play’s subscription page)',
    terms: 'Terms of Use',
    privacy: 'Privacy Policy',
    contact: 'Contact us',
    contactNote: 'Opens the FAQ and support page',
    version: 'Version',
    language: 'Language',
    languageNote: 'Ingredient names are currently Japanese only',
    darkMode: 'Dark mode',
    darkModeSystemNote: 'Following your device setting',
    darkModeFixedNote: 'Set manually on this device',
    followSystem: 'Follow device setting',
    largeText: 'Larger display',
    largeTextNote: 'Enlarges the text and drops the ingredient grid from three columns to two',
    sound: 'Sound effect',
    soundNote:
      'Plays when you move the cursor and when you pick an ingredient in Combine. Tap a level to hear it',
    soundOff: 'Off',
    soundLow: 'Low',
    soundMid: 'Medium',
    soundHigh: 'High',
    haptics: 'Vibration',
    hapticsNote:
      'A short buzz when you move the cursor and when you pick an ingredient in Combine. Independent of the sound',
    references: 'References',
    referencesBody:
      'The nature, flavor, meridian, and category data in this app organizes the traditional classifications widely shared in Chinese dietary theory, compiled as factual data from a range of general sources. It does not reproduce the commentary, structure, or text of any particular book.\n\nAlternate names and kanji names are based on common biological and linguistic knowledge.\n\nThis app does not cover efficacy or indications. All explanatory text is written independently for this app.',
    disclaimer: 'Disclaimer',
    disclaimerBody:
      'tabenote presents the traditional classifications of ingredients used in Chinese medicine — nature, flavor, meridians — as information.\n\nIt makes no promises about effects, does not suggest that symptoms will improve, and is no substitute for diagnosis or treatment by a physician. If you have health concerns, please consult a medical professional.\n\nDecisions involving food allergies or your own constitution are always yours to make.',
    about: 'About tabenote',
    aboutNote: 'Opens the introduction page',
    licenses: 'Open source licenses',
    licensesNote: 'Copyright notices and licenses for the bundled software',
    exportTitle: 'Export data',
    exportNote: 'Writes out your favorites, notes, saved combinations, and more',
    exportShareTitle: 'tabenote data',
    exportFailTitle: 'Export',
    exportFailBody: 'Could not export your data.',
  },

  licenses: {
    screenTitle: 'Open source licenses',
    lede: 'This app uses the following software.',
    showFullText: 'Full text',
    hideFullText: 'Close',
    openSource: 'Open the source page',
  },

  paywall: {
    screenTitle: 'Monthly Plan',
    planName: 'tabenote Monthly Plan',
    lead: 'A monthly plan is required to use tabenote.',
    includedTitle: 'What you can do',
    includedBody:
      'See any combination of ingredients as a pentagon of the five flavors and nature\nAn encyclopedia of 435 ingredients (flavor, nature, meridians, category)\nThe 24 solar terms, the five seasons, and the flavors favored right now\nStar ingredients, write notes, save combinations to your notebook\nAI menu ideas from the ingredients you picked and the season',
    periodNote: 'Renews automatically every month',
    subscribe: 'Subscribe',
    renewalNote: (store) =>
      store === 'apple'
        ? 'Renews automatically unless cancelled at least 24 hours before the end of the current period. Payment is charged to your Apple Account. Cancel any time in Settings → Apple Account → Subscriptions on your iPhone.'
        : 'Renews automatically unless cancelled at least 24 hours before the end of the current period. Payment is charged to your Google Play account. Cancel any time in Google Play → Payments & subscriptions → Subscriptions.',
    restore: 'Restore purchases',
    loading: 'Loading the plan…',
    unavailable: 'Could not load the plan. Please check your connection and try again.',
    retry: 'Try again',
    alreadySubscribed: 'You are subscribed. Every feature is available.',
    failTitle: 'Monthly Plan',
    failBody: 'The purchase could not be completed. Please try again later.',
    restoreDoneTitle: 'Restore purchases',
    restoreDoneBody: 'Your subscription has been restored.',
    restoreNoneBody: 'No subscription was found to restore.',
    restoreFailBody: 'Could not restore. Please check your connection.',
    terms: 'Terms of Use',
    privacy: 'Privacy Policy',
    exportSaved: 'Export your saved data',
  },

  onboarding: {
    pages: [
      {
        title: 'See your ingredients as a shape',
        body: 'Pick ingredients, and their combined five flavors (sour, bitter, sweet, pungent, salty) and thermal nature become one pentagon. The traditional classifications of Chinese dietary theory, shown as facts.',
      },
      {
        title: 'A notebook, in your own words',
        body: 'Save the combinations you like. Star any of the 435 ingredients and write your own notes. The app never writes effects — the owner does.',
      },
      {
        title: 'Seasons, and AI menu ideas',
        body: 'The 24 solar terms and five seasons show which flavors are favored right now. From your chosen ingredients, AI suggests dish ideas and directions.',
      },
    ],
    next: 'Next',
    skip: 'Skip',
  },

  about: {
    screenTitle: 'About tabenote',
    tagline: 'A chef’s eye for ingredients. You write the rest.',
    lead:
      'tabenote is a notebook for choosing ingredients the way a seasoned chef does — by season and the balance of flavors. Underneath sits a classification of ingredients refined over centuries in East Asian kitchens, shown in shapes and words.',
    sections: [
      {
        title: 'Your ingredients become one shape',
        body: 'Pick ingredients, and the combination’s five flavors (sour, bitter, sweet, pungent, salty) and thermal nature are drawn as a single pentagon. What is abundant and what is missing — the shape tells you.',
      },
      {
        title: 'An index of 435 ingredients',
        body: 'Each ingredient lists its five flavors, nature, meridians, and category. Star the ones you like and keep notes in your own words.',
      },
      {
        title: 'The 24 solar terms, and five seasons',
        body: 'See which solar term today falls in, where you are among the five seasons (spring, summer, late summer, autumn, winter), and which flavors are favored right now.',
      },
      {
        title: 'AI menu ideas',
        body: 'From the ingredients you picked and the current season, AI suggests directions a dish could take.',
      },
    ],
    policyTitle: 'The app never writes effects',
    policyBody:
      'What tabenote shows stops at factual data — five flavors, nature, meridians, category. It does not speak of curing or healing, and it handles no symptoms or conditions. No scores, either. The interpretation and the record are yours to write, in your own words. This app is no substitute for diagnosis or treatment by a physician.',
    tryWeb: 'Try it right here in your browser',
    appStore: 'Get it on the App Store',
    appStoreSoon: 'The iOS app is on its way to the App Store',
  },

  welcome: {
    title: 'Welcome to tabenote',
    body: 'A chef’s-eye notebook for ingredients. Pick ingredients and their five flavors and nature become one pentagon — with the flavors favored by the current solar term.',
    about: 'About tabenote',
    start: 'Start using it',
  },

  meta: {
    home: {
      title: 'tabenote — a chef’s eye for ingredients',
      description:
        'Shows the current solar term and season, and describes what a set of ingredients is made of — five flavors, nature, meridians, category. The app states the facts; you write the rest.',
    },
    combine: {
      title: 'Combine | tabenote',
      description:
        'Pick ingredients and see the flavor makeup, the warm–cool balance, and which of the five categories are covered, drawn as a pentagon.',
    },
    notebook: {
      title: 'Notebook | tabenote',
      description:
        'Your saved combinations, the ingredients you starred, and a guide to the five phases, flavors, organs, and solar terms.',
    },
    advice: {
      title: 'Advice | tabenote',
      description:
        'What the chosen ingredients over- and under-cover across the five flavors and five categories, how they sit against the season, and which way the cooking leans.',
    },
    settings: {
      title: 'Settings | tabenote',
      description: 'Display language, references, data export, and the disclaimer.',
    },
    about: {
      title: 'About | tabenote',
      description:
        'A food notebook with a chef’s eye: the traditional classifications of ingredients — five flavors, nature, meridians, category — as shapes and words. A pentagon chart, an index of 435 ingredients, the 24 solar terms and five seasons, and AI menu ideas. The app never writes effects.',
    },
    licenses: {
      title: 'Open source licenses | tabenote',
      description:
        'Copyright notices and full license texts for the open source software used in tabenote.',
    },
    food: (name, a) => {
      const facts = [
        a.nature !== '' ? `nature ${a.nature}` : '',
        a.flavors !== '' ? `flavor ${a.flavors}` : '',
        a.meridians !== '' ? `meridians ${a.meridians}` : '',
      ]
        .filter((s) => s !== '')
        .join(', ');
      return {
        title: `${name} | tabenote`,
        description:
          facts !== ''
            ? `${name} (${a.category}) — ${capitalize(facts)}. From the ingredient index in tabenote.`
            : `${name} (${a.category}) in the tabenote ingredient index.`,
      };
    },
  },
};

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

const STRINGS: Record<Lang, Strings> = { ja, en };

export function getStrings(lang: Lang): Strings {
  return STRINGS[lang];
}
