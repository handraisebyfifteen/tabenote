/**
 * 二十四節気の「動く風景」(ホームのヒーロー)。
 *
 * 節気ごとに1枚、約10秒でひと回りするループの見た目を定義する。
 * 絵は画像素材ではなく、空のグラデーション + 稜線 + 粒子で描く
 * (権利がクリーンで、24枚ぶんの容量も増えない。指示書 8-5 と同じ考え方)。
 *
 * 文字は白でヒーローの下側に重なるため、どの節気でも
 * 下端(sky[2] と稜線)は文字が読める暗さに保つこと。
 */

/** 粒子の見た目。形は最小限にして、色と速度で節気を描き分ける */
export type ParticleShape = 'round' | 'petal' | 'leaf' | 'line' | 'band';

/**
 * 粒子ひと群れ。
 *   fall    上から下へ。左右に揺れ、必要なら回る(花びら・葉・雪・穂)
 *   rain    上から下へ速く、斜めに(雨)
 *   rise    下から上へ。ゆらぎながら(芽吹き・陽炎・虫・冷気)
 *   twinkle その場で明滅する(露・霜・星・氷)
 *   drift   横に流れる帯(靄・雲・陽炎)
 */
export interface ParticleLayer {
  kind: 'fall' | 'rain' | 'rise' | 'twinkle' | 'drift';
  shape: ParticleShape;
  color: string;
  count: number;
  /** 基準の大きさ(px)。粒ごとに ±40% ばらつく */
  size: number;
  /** ひと巡りの秒数。粒ごとに ±25% ばらつく */
  duration: number;
  opacity: number;
  /** fall のとき、ひと巡りで何度回るか(0 なら回らない) */
  spin?: number;
}

/** 稜線1枚(正弦波で描く) */
export interface Ridge {
  color: string;
  /** 稜線の基準の高さ(0=上端, 1=下端) */
  y: number;
  /** 起伏の大きさ(px) */
  amp: number;
  /** 波の数 */
  freq: number;
  /** 位相(ずらすと形が変わる) */
  phase: number;
}

export interface TermScene {
  /** 空のグラデーション(上・中・下) */
  sky: [string, string, string];
  /** 太陽・月。曇天の節気は null */
  orb: { color: string; glow: string; x: number; y: number; r: number } | null;
  /** 奥から手前の順 */
  ridges: Ridge[];
  layers: ParticleLayer[];
  /** ボタン・進行バーに使う色(白文字が乗るので中〜濃いめ) */
  accent: string;
}

/** SOLAR_TERMS と同じ並び(0 = 立春 … 23 = 大寒) */
export const TERM_SCENES: TermScene[] = [
  // 0 立春 — 残雪の上に、最初の光が差す
  {
    sky: ['#6E86B4', '#A9BBD4', '#DCD9C8'],
    orb: { color: '#F6E7BE', glow: '#F2D89C', x: 0.74, y: 0.34, r: 0.1 },
    ridges: [
      { color: '#A8B3C0', y: 0.74, amp: 18, freq: 2, phase: 0.4 },
      { color: '#6D7885', y: 0.88, amp: 12, freq: 3, phase: 2.2 },
    ],
    layers: [
      { kind: 'rise', shape: 'round', color: '#F8ECC8', count: 12, size: 5, duration: 11, opacity: 0.85 },
      { kind: 'fall', shape: 'round', color: '#FFFFFF', count: 8, size: 5, duration: 13, opacity: 0.6 },
    ],
    accent: '#6F82B0',
  },
  // 1 雨水 — 雪が雨に変わる、鈍色の空
  {
    sky: ['#5A6A7E', '#8290A2', '#B4BBC0'],
    orb: null,
    ridges: [
      { color: '#8D96A0', y: 0.76, amp: 14, freq: 2, phase: 1.1 },
      { color: '#575F69', y: 0.89, amp: 10, freq: 3, phase: 3.0 },
    ],
    layers: [
      { kind: 'rain', shape: 'line', color: '#D9E3EC', count: 26, size: 16, duration: 3.2, opacity: 0.5 },
      { kind: 'drift', shape: 'band', color: '#C6CFD8', count: 3, size: 26, duration: 14, opacity: 0.25 },
    ],
    accent: '#5B7690',
  },
  // 2 啓蟄 — 土がゆるみ、地面から動きだす
  {
    sky: ['#8AA3C2', '#BCCBD6', '#DFDCC4'],
    orb: { color: '#FBF0D2', glow: '#EEDDAE', x: 0.22, y: 0.28, r: 0.09 },
    ridges: [
      { color: '#83915F', y: 0.72, amp: 16, freq: 2, phase: 0.8 },
      { color: '#4E5738', y: 0.86, amp: 12, freq: 3, phase: 2.6 },
    ],
    layers: [
      { kind: 'rise', shape: 'round', color: '#C9D98C', count: 14, size: 6, duration: 9, opacity: 0.8 },
      { kind: 'drift', shape: 'band', color: '#E4DFC2', count: 2, size: 22, duration: 15, opacity: 0.2 },
    ],
    accent: '#6C8146',
  },
  // 3 春分 — 桜が散る、昼と夜が同じ長さの日
  {
    sky: ['#8CB4DB', '#C7D7E3', '#EBD5D9'],
    orb: { color: '#FFF6E2', glow: '#F7DCC8', x: 0.78, y: 0.24, r: 0.09 },
    ridges: [
      { color: '#9AAC7C', y: 0.75, amp: 16, freq: 2, phase: 1.4 },
      { color: '#5C6B4A', y: 0.89, amp: 11, freq: 3, phase: 3.4 },
    ],
    layers: [
      { kind: 'fall', shape: 'petal', color: '#F7C9D4', count: 20, size: 9, duration: 10, opacity: 0.9, spin: 420 },
      { kind: 'fall', shape: 'petal', color: '#FFFFFF', count: 8, size: 7, duration: 12, opacity: 0.7, spin: 300 },
    ],
    accent: '#C97F97',
  },
  // 4 清明 — すべてが澄んで明るい
  {
    sky: ['#3E7FC0', '#7FB0DA', '#CFDFE8'],
    orb: { color: '#FFFAE8', glow: '#FFE9B4', x: 0.7, y: 0.2, r: 0.1 },
    ridges: [
      { color: '#7B9C5C', y: 0.74, amp: 18, freq: 2, phase: 0.2 },
      { color: '#41603C', y: 0.88, amp: 12, freq: 3, phase: 2.0 },
    ],
    layers: [
      { kind: 'rise', shape: 'round', color: '#FFF3CE', count: 14, size: 5, duration: 10, opacity: 0.75 },
      { kind: 'fall', shape: 'petal', color: '#FFFFFF', count: 10, size: 8, duration: 12, opacity: 0.65, spin: 360 },
    ],
    accent: '#3D82B4',
  },
  // 5 穀雨 — 穀物を潤す、濃い緑の雨
  {
    sky: ['#4E6A70', '#78918D', '#B2BCAE'],
    orb: null,
    ridges: [
      { color: '#5E7A52', y: 0.72, amp: 16, freq: 2, phase: 1.9 },
      { color: '#31432D', y: 0.87, amp: 12, freq: 3, phase: 0.6 },
    ],
    layers: [
      { kind: 'rain', shape: 'line', color: '#D5E4DE', count: 30, size: 20, duration: 2.6, opacity: 0.45 },
      { kind: 'fall', shape: 'leaf', color: '#93B06F', count: 8, size: 10, duration: 11, opacity: 0.75, spin: 300 },
    ],
    accent: '#4E7A5A',
  },
  // 6 立夏 — 新緑を風が渡る
  {
    sky: ['#2E7FC8', '#79B6DF', '#CFE4E0'],
    orb: { color: '#FFFCEE', glow: '#FFE7A8', x: 0.24, y: 0.18, r: 0.1 },
    ridges: [
      { color: '#68A45C', y: 0.73, amp: 18, freq: 2, phase: 2.4 },
      { color: '#2E6438', y: 0.88, amp: 12, freq: 3, phase: 0.9 },
    ],
    layers: [
      { kind: 'fall', shape: 'leaf', color: '#A8D48C', count: 14, size: 10, duration: 9, opacity: 0.85, spin: 480 },
      { kind: 'rise', shape: 'round', color: '#F2FBD8', count: 10, size: 5, duration: 11, opacity: 0.6 },
    ],
    accent: '#3B8F55',
  },
  // 7 小満 — 草木が満ちる
  {
    sky: ['#2C86C4', '#7CBBD8', '#D6E4CC'],
    orb: { color: '#FFFBEA', glow: '#FFE6A2', x: 0.76, y: 0.2, r: 0.1 },
    ridges: [
      { color: '#5EA152', y: 0.71, amp: 17, freq: 2, phase: 0.5 },
      { color: '#2D6135', y: 0.86, amp: 13, freq: 3, phase: 2.8 },
    ],
    layers: [
      { kind: 'rise', shape: 'round', color: '#EDF6C0', count: 16, size: 6, duration: 10, opacity: 0.8 },
      { kind: 'fall', shape: 'leaf', color: '#BFD98C', count: 9, size: 9, duration: 12, opacity: 0.7, spin: 360 },
    ],
    accent: '#5B9C42',
  },
  // 8 芒種 — 穂が出て、梅雨が近い
  {
    sky: ['#57708A', '#8B9CA6', '#C4C4AE'],
    orb: null,
    ridges: [
      { color: '#8A9455', y: 0.7, amp: 15, freq: 3, phase: 1.6 },
      { color: '#4D5638', y: 0.86, amp: 11, freq: 2, phase: 3.2 },
    ],
    layers: [
      { kind: 'fall', shape: 'leaf', color: '#E0CE8A', count: 14, size: 11, duration: 10, opacity: 0.85, spin: 240 },
      { kind: 'rain', shape: 'line', color: '#D3DCE2', count: 14, size: 14, duration: 3.6, opacity: 0.3 },
    ],
    accent: '#87783E',
  },
  // 9 夏至 — 一年で昼が最も長い
  {
    sky: ['#1E76C8', '#5FA8DC', '#EBDDB6'],
    orb: { color: '#FFFDF0', glow: '#FFD98C', x: 0.5, y: 0.16, r: 0.13 },
    ridges: [
      { color: '#3F8A5E', y: 0.75, amp: 16, freq: 2, phase: 2.1 },
      { color: '#1F4F38', y: 0.89, amp: 11, freq: 3, phase: 0.3 },
    ],
    layers: [
      { kind: 'rise', shape: 'round', color: '#FFEFC0', count: 18, size: 6, duration: 8, opacity: 0.8 },
      { kind: 'twinkle', shape: 'round', color: '#FFFFFF', count: 10, size: 5, duration: 6, opacity: 0.7 },
    ],
    accent: '#D99B39',
  },
  // 10 小暑 — 白っぽい空、暑さが始まる
  {
    sky: ['#5FA6D2', '#AFCFE0', '#E2DCC6'],
    orb: { color: '#FFFDF4', glow: '#FFEBBE', x: 0.68, y: 0.22, r: 0.12 },
    ridges: [
      { color: '#5D8E62', y: 0.74, amp: 15, freq: 2, phase: 1.2 },
      { color: '#2F5540', y: 0.88, amp: 11, freq: 3, phase: 3.6 },
    ],
    layers: [
      { kind: 'drift', shape: 'band', color: '#FFF4D8', count: 4, size: 20, duration: 13, opacity: 0.3 },
      { kind: 'rise', shape: 'round', color: '#FFF0CC', count: 12, size: 7, duration: 9, opacity: 0.6 },
    ],
    accent: '#C98545',
  },
  // 11 大暑 — 陽炎が立つ、一年で最も暑いころ
  {
    sky: ['#7FB3D8', '#D3CFB6', '#DFCF9E'],
    orb: { color: '#FFFFF6', glow: '#FFDFA0', x: 0.32, y: 0.2, r: 0.14 },
    ridges: [
      { color: '#6E7F4E', y: 0.73, amp: 14, freq: 3, phase: 0.7 },
      { color: '#3B4A32', y: 0.87, amp: 10, freq: 2, phase: 2.4 },
    ],
    layers: [
      { kind: 'drift', shape: 'band', color: '#FFE9BE', count: 5, size: 16, duration: 10, opacity: 0.35 },
      { kind: 'rise', shape: 'round', color: '#FFF6DE', count: 16, size: 8, duration: 7, opacity: 0.55 },
    ],
    accent: '#C6583B',
  },
  // 12 立秋 — 暦の上の秋。夕焼けとうろこ雲
  {
    sky: ['#3C5F92', '#B0776F', '#E0B183'],
    orb: { color: '#FFE3B4', glow: '#F2A768', x: 0.24, y: 0.5, r: 0.11 },
    ridges: [
      { color: '#5D5A55', y: 0.76, amp: 16, freq: 2, phase: 2.9 },
      { color: '#31302D', y: 0.9, amp: 11, freq: 3, phase: 1.0 },
    ],
    layers: [
      { kind: 'drift', shape: 'band', color: '#F7CFA6', count: 5, size: 12, duration: 16, opacity: 0.4 },
      { kind: 'fall', shape: 'leaf', color: '#D8A26A', count: 8, size: 10, duration: 12, opacity: 0.75, spin: 420 },
    ],
    accent: '#BB6C3D',
  },
  // 13 処暑 — 暑さが収まる、暮れかけの空
  {
    sky: ['#48598A', '#9A6E86', '#D8AA86'],
    orb: { color: '#FFDCB2', glow: '#E89A72', x: 0.76, y: 0.55, r: 0.1 },
    ridges: [
      { color: '#57543F', y: 0.75, amp: 15, freq: 2, phase: 0.9 },
      { color: '#2C2A22', y: 0.89, amp: 11, freq: 3, phase: 2.7 },
    ],
    layers: [
      { kind: 'rise', shape: 'round', color: '#F4C79A', count: 12, size: 5, duration: 10, opacity: 0.7 },
      { kind: 'drift', shape: 'band', color: '#E8B490', count: 3, size: 14, duration: 15, opacity: 0.3 },
    ],
    accent: '#AC6048',
  },
  // 14 白露 — 草に露が白く結ぶ、朝の靄
  {
    sky: ['#8AA2B0', '#BFC9C4', '#D8D6C6'],
    orb: { color: '#FFF8E4', glow: '#F0E2BE', x: 0.2, y: 0.32, r: 0.09 },
    ridges: [
      { color: '#7E8A6A', y: 0.72, amp: 14, freq: 2, phase: 1.8 },
      { color: '#484F3E', y: 0.87, amp: 11, freq: 3, phase: 3.3 },
    ],
    layers: [
      { kind: 'twinkle', shape: 'round', color: '#FFFFFF', count: 18, size: 5, duration: 7, opacity: 0.85 },
      { kind: 'drift', shape: 'band', color: '#E6E9E0', count: 4, size: 22, duration: 17, opacity: 0.3 },
    ],
    accent: '#78907F',
  },
  // 15 秋分 — 澄んだ空、色づいた葉が落ちる
  {
    sky: ['#3B78BC', '#8FB6D6', '#D8CFB2'],
    orb: { color: '#FFF6DC', glow: '#F5DCA4', x: 0.74, y: 0.26, r: 0.1 },
    ridges: [
      { color: '#8A8148', y: 0.73, amp: 17, freq: 2, phase: 0.3 },
      { color: '#4C482B', y: 0.88, amp: 12, freq: 3, phase: 2.2 },
    ],
    layers: [
      { kind: 'fall', shape: 'leaf', color: '#D8A048', count: 14, size: 11, duration: 10, opacity: 0.85, spin: 480 },
      { kind: 'fall', shape: 'leaf', color: '#C2603C', count: 8, size: 9, duration: 13, opacity: 0.75, spin: 360 },
    ],
    accent: '#B8853C',
  },
  // 16 寒露 — 露が冷たくなる、深い青
  {
    sky: ['#2B4A78', '#5C7C9E', '#A9ADA4'],
    orb: { color: '#EDEFE2', glow: '#C8D2C8', x: 0.26, y: 0.3, r: 0.08 },
    ridges: [
      { color: '#6B6540', y: 0.74, amp: 15, freq: 2, phase: 2.6 },
      { color: '#383626', y: 0.89, amp: 11, freq: 3, phase: 0.8 },
    ],
    layers: [
      { kind: 'twinkle', shape: 'round', color: '#DCEAF2', count: 16, size: 5, duration: 8, opacity: 0.8 },
      { kind: 'fall', shape: 'leaf', color: '#B08A50', count: 6, size: 9, duration: 13, opacity: 0.6, spin: 360 },
    ],
    accent: '#4A7090',
  },
  // 17 霜降 — 霜が降りる朝
  {
    sky: ['#6B7B94', '#A5B0BA', '#CFCFC6'],
    orb: null,
    ridges: [
      { color: '#7A7462', y: 0.73, amp: 14, freq: 3, phase: 1.5 },
      { color: '#403E2E', y: 0.88, amp: 11, freq: 2, phase: 3.1 },
    ],
    layers: [
      { kind: 'twinkle', shape: 'round', color: '#FFFFFF', count: 22, size: 4, duration: 6, opacity: 0.9 },
      { kind: 'fall', shape: 'leaf', color: '#9C7B4E', count: 6, size: 9, duration: 14, opacity: 0.55, spin: 300 },
    ],
    accent: '#7E8C9C',
  },
  // 18 立冬 — 枯野に冬が入る
  {
    sky: ['#4E5E76', '#87909C', '#C0BDB2'],
    orb: { color: '#EDE6D2', glow: '#C9C4B2', x: 0.72, y: 0.36, r: 0.08 },
    ridges: [
      { color: '#6E6553', y: 0.74, amp: 15, freq: 2, phase: 0.6 },
      { color: '#38352B', y: 0.89, amp: 11, freq: 3, phase: 2.5 },
    ],
    layers: [
      { kind: 'fall', shape: 'leaf', color: '#A98D66', count: 10, size: 10, duration: 11, opacity: 0.7, spin: 420 },
      { kind: 'drift', shape: 'band', color: '#D3D0C4', count: 3, size: 20, duration: 16, opacity: 0.25 },
    ],
    accent: '#786854',
  },
  // 19 小雪 — わずかに雪が舞う
  {
    sky: ['#586A85', '#8F9DAE', '#C6CBD2'],
    orb: null,
    ridges: [
      { color: '#7A8290', y: 0.75, amp: 14, freq: 2, phase: 2.0 },
      { color: '#434A55', y: 0.89, amp: 11, freq: 3, phase: 0.4 },
    ],
    layers: [
      { kind: 'fall', shape: 'round', color: '#FFFFFF', count: 14, size: 6, duration: 12, opacity: 0.8 },
      { kind: 'drift', shape: 'band', color: '#D8DEE6', count: 3, size: 18, duration: 15, opacity: 0.25 },
    ],
    accent: '#6B83A3',
  },
  // 20 大雪 — 本降りの雪
  {
    sky: ['#3E4E68', '#6C7C94', '#B4BEC8'],
    orb: null,
    ridges: [
      { color: '#8C98A6', y: 0.74, amp: 16, freq: 2, phase: 1.3 },
      { color: '#586270', y: 0.88, amp: 12, freq: 3, phase: 3.5 },
    ],
    layers: [
      { kind: 'fall', shape: 'round', color: '#FFFFFF', count: 30, size: 7, duration: 8, opacity: 0.9 },
      { kind: 'fall', shape: 'round', color: '#E6EDF4', count: 14, size: 4, duration: 12, opacity: 0.6 },
    ],
    accent: '#4D6286',
  },
  // 21 冬至 — 一年で夜が最も長い
  {
    sky: ['#101C38', '#22345C', '#4E6182'],
    orb: { color: '#F4F1E2', glow: '#B9C6DE', x: 0.72, y: 0.24, r: 0.08 },
    ridges: [
      { color: '#2C3850', y: 0.76, amp: 16, freq: 2, phase: 2.8 },
      { color: '#141C2C', y: 0.9, amp: 11, freq: 3, phase: 1.1 },
    ],
    layers: [
      { kind: 'twinkle', shape: 'round', color: '#FFFFFF', count: 26, size: 4, duration: 5, opacity: 0.9 },
      { kind: 'fall', shape: 'round', color: '#E8EEF8', count: 6, size: 4, duration: 14, opacity: 0.5 },
    ],
    accent: '#5C74A6',
  },
  // 22 小寒 — 寒の入り、凍てつく朝
  {
    sky: ['#2E4468', '#68809E', '#BEC7CE'],
    orb: { color: '#FFF2D8', glow: '#E2C8A8', x: 0.24, y: 0.42, r: 0.08 },
    ridges: [
      { color: '#6B7684', y: 0.75, amp: 15, freq: 2, phase: 0.2 },
      { color: '#373F4C', y: 0.89, amp: 11, freq: 3, phase: 2.9 },
    ],
    layers: [
      { kind: 'twinkle', shape: 'round', color: '#E4F0F8', count: 20, size: 5, duration: 7, opacity: 0.85 },
      { kind: 'rise', shape: 'round', color: '#D6E4F0', count: 10, size: 5, duration: 12, opacity: 0.5 },
    ],
    accent: '#4C6C94',
  },
  // 23 大寒 — 一年で最も寒いころ、青い夜明け
  {
    sky: ['#1E3050', '#4C6890', '#AFC0CE'],
    orb: { color: '#FFF6E0', glow: '#D8BE9E', x: 0.76, y: 0.46, r: 0.09 },
    ridges: [
      { color: '#5E6C7C', y: 0.76, amp: 15, freq: 2, phase: 1.7 },
      { color: '#2A3340', y: 0.9, amp: 11, freq: 3, phase: 3.8 },
    ],
    layers: [
      { kind: 'twinkle', shape: 'round', color: '#EAF4FA', count: 24, size: 4, duration: 6, opacity: 0.9 },
      { kind: 'fall', shape: 'round', color: '#FFFFFF', count: 10, size: 4, duration: 13, opacity: 0.55 },
    ],
    accent: '#3E5E8C',
  },
];

/** 節気の通し番号(0〜23)から風景を引く */
export function getTermScene(index: number): TermScene {
  return TERM_SCENES[((index % 24) + 24) % 24];
}
