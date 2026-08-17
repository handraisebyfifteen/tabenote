/**
 * 組み合わせ画面の「決定」の音(キコーン)を鳴らす関数を返す。
 *
 * 音はキャラ選択の手応えの一部なので、決定の点灯(FoodTile の flash・
 * FoodPortrait の点灯)と同じ瞬間に鳴らす。
 * 音量は設定画面の「効果音」に従う(@/lib/SoundContext)。
 * 実際の再生は @/lib/sfx。
 *
 * 引数に音量(0〜1)を渡すと設定より優先する。設定画面が、選んだ直後の段で
 * 試し鳴らしするためのもので、ふだんは引数なしで呼ぶ。
 */
import { useCallback } from 'react';

import { playSelectSfx } from '@/lib/sfx';
import { useSound } from '@/lib/SoundContext';

export function useSelectSound(): (overrideGain?: number) => void {
  const { gain } = useSound();
  return useCallback(
    (overrideGain?: number) => playSelectSfx(overrideGain ?? gain),
    [gain],
  );
}
