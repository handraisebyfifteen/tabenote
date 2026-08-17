/**
 * 組み合わせ画面のキャラ選択の手応え(音 + バイブ)。
 *
 *   cursor  1タップ目。カーソルが乗った合図「キコ」+ 軽い振動
 *   decide  2タップ目。決定「キコーン」+ 重い振動
 *
 * どちらも画面の点灯(FoodTile の flash・FoodPortrait の点灯)と同じ瞬間に呼ぶ。
 * 音量とバイブの入切は設定画面に従う(@/lib/SoundContext)。
 *
 * 引数に音量(0〜1)を渡すと設定より優先する。設定画面の試し鳴らし用で、
 * ふだんは引数なしで呼ぶ。
 */
import { useMemo } from 'react';

import { cursorHaptic, decideHaptic } from '@/lib/haptics';
import { playSfx } from '@/lib/sfx';
import { useSound } from '@/lib/SoundContext';

export function useCombineFeedback(): {
  cursor: (overrideGain?: number) => void;
  decide: (overrideGain?: number) => void;
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
    }),
    [gain, haptics],
  );
}
