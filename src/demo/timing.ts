/** 楽曲の拍の定義。BPM 123・4/4(デモ仕様書 v2 §2) */
export const BPM = 123;
export const BEAT_MS = 60000 / BPM; // 487.8049
export const BAR_MS = BEAT_MS * 4; // 1951.2195

/** 小節 n の頭(1-indexed)のミリ秒 */
export const bar = (n: number): number => Math.round(BAR_MS * (n - 1));

/** 小節 b の n 拍目(ともに 1-indexed) */
export const beat = (b: number, n: number): number =>
  Math.round(BAR_MS * (b - 1) + BEAT_MS * (n - 1));
