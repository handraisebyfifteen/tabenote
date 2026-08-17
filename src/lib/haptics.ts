/**
 * 手ざわりの合図(設定画面「バイブ」)。
 *
 * 音と同じ瞬間に、同じ強弱で入れる。カーソルは軽く、決定はひと突き重く。
 * 音を消している人・鳴らせない場所でも、選んだ手応えだけは残るようにするのが役目。
 *
 * iOS では Taptic Engine、Android では短い振動、Web では navigator.vibrate
 * (対応していない端末では何も起きない)。鳴らないこと自体は画面の用を損なわないので、
 * 失敗は黙って捨てる。
 */
import * as Haptics from 'expo-haptics';

/** 1タップ目・カーソルが乗ったとき。いちばん軽い「コツッ」 */
export function cursorHaptic(): void {
  Haptics.selectionAsync().catch(() => {});
}

/** 2タップ目・決定したとき。カーソルより一段重く突く */
export function decideHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/**
 * 3クリック目・決定ボタンを押したとき。いちばん重く突く。
 * 画面が助言へ変わる合図なので、選ぶ最中の2つとは別の手ざわりにする。
 */
export function confirmHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
}
