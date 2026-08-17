/** 色のちいさな共通処理。FoodTile / FoodThumb など、性(寒熱)の色を扱う場所で使う。 */

/** #RRGGBB を白に寄せて明るくする(ratio 0〜1)。暗い配色で線画や枠を見やすくするため */
export function brighten(hex: string, ratio: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * ratio);
  const r = mix((n >> 16) & 0xff);
  const g = mix((n >> 8) & 0xff);
  const b = mix(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
