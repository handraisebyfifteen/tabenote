/**
 * キャラ選択まわりの手応え(音 + バイブ)。組み合わせ画面が主で、
 * 手帳のタブ・検索窓も同じ楽器の音を借りる。
 *
 *   cursor   1タップ目。カーソルが乗った合図「キコ」+ 軽い振動
 *   decide   2タップ目。決定「キコーン」+ 重い振動
 *   confirm  3クリック目。決定ボタン「キコーン↑」+ いちばん重い振動
 *   remove   チップで食材を外す。下がる「キロ」+ カーソルと同じ軽い振動
 *   ki       季節・五行・分類チップ・手帳タブ。立ち上がりだけの「キ」+ 軽い振動
 *   search   検索欄にフォーカス。留め金の「カチッ」+ 軽い振動
 *
 * どれも画面の点灯(FoodTile の flash・FoodPortrait の点灯・決定ボタンの点灯)と同じ瞬間に呼ぶ。
 * 音量とバイブの入切は設定画面に従う(@/lib/SoundContext)。
 *
 * 引数に音量(0〜1)を渡すと設定より優先する。設定画面の試し鳴らし用で、
 * ふだんは引数なしで呼ぶ。
 */
import { useMemo } from 'react';

import { confirmHaptic, cursorHaptic, decideHaptic } from '@/lib/haptics';
import { playSfx } from '@/lib/sfx';
import { useSound } from '@/lib/SoundContext';

export function useCombineFeedback(): {
  cursor: (overrideGain?: number) => void;
  decide: (overrideGain?: number) => void;
  confirm: (overrideGain?: number) => void;
  remove: (overrideGain?: number) => void;
  ki: (overrideGain?: number) => void;
  search: (overrideGain?: number) => void;
} {
  const { gain, haptics } = useSound();
  return useMemo(
    () => ({
      cursor: (overrideGain?: number) => {
        playSfx('cursor', overrideGain ?? gain);
        if (haptics) cursorHaptic();
      },
      decide: (overrideGain?: number) => {
        playSfx('select', overrideGain ?? gain);
        if (haptics) decideHaptic();
      },
      confirm: (overrideGain?: number) => {
        playSfx('confirm', overrideGain ?? gain);
        if (haptics) confirmHaptic();
      },
      remove: (overrideGain?: number) => {
        playSfx('remove', overrideGain ?? gain);
        // 外すのは静かな操作なので、手ざわりもいちばん軽いカーソルと同じにする
        if (haptics) cursorHaptic();
      },
      ki: (overrideGain?: number) => {
        playSfx('ki', overrideGain ?? gain);
        // 表示を切り替えるだけのボタン。手ざわりもいちばん軽いものにする
        if (haptics) cursorHaptic();
      },
      search: (overrideGain?: number) => {
        playSfx('search', overrideGain ?? gain);
        if (haptics) cursorHaptic();
      },
    }),
    [gain, haptics],
  );
}
