/**
 * 音の設定(設定画面「音」)。効果音の音量だけを持つ。
 *
 *   'off'(消音)/ 'low'(小)/ 'mid'(中・既定)/ 'high'(大)
 *
 * つまみ(スライダー)ではなく4段にしてある。効果音は 0.5 秒鳴って消えるので、
 * 連続の値を耳で追い込むのが難しく、押し直すたびに鳴らして比べられる段のほうが決めやすい。
 *
 * AsyncStorage に永続化する。実際に鳴らすのは useSelectSound(@/hooks/use-select-sound)。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { primeSfx } from '@/lib/sfx';

export type SfxVolume = 'off' | 'low' | 'mid' | 'high';

const VOLUME_KEY = 'tabenote/sfxVolume/v1';

const VOLUME_ORDER: SfxVolume[] = ['off', 'low', 'mid', 'high'];

/**
 * 段ごとの実際の音量。耳は音の大きさを対数で感じるので、
 * 0.33 / 0.66 / 1.0 と等間隔に割らず、下を詰める。
 */
const VOLUME_GAIN: Record<SfxVolume, number> = {
  off: 0,
  low: 0.2,
  mid: 0.5,
  high: 1,
};

const DEFAULT_VOLUME: SfxVolume = 'mid';

function isVolume(value: unknown): value is SfxVolume {
  return VOLUME_ORDER.includes(value as SfxVolume);
}

type SoundValue = {
  volume: SfxVolume;
  setVolume: (volume: SfxVolume) => void;
  /** volume を実際の音量(0〜1)にしたもの。0 なら鳴らさない */
  gain: number;
};

const SoundContext = createContext<SoundValue>({
  volume: DEFAULT_VOLUME,
  setVolume: () => {},
  gain: VOLUME_GAIN[DEFAULT_VOLUME],
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [volume, setVolumeState] = useState<SfxVolume>(DEFAULT_VOLUME);

  useEffect(() => {
    // 最初の1回から鳴るよう、起動時に読み込んでおく
    primeSfx();
    AsyncStorage.getItem(VOLUME_KEY).then((value) => {
      if (isVolume(value)) setVolumeState(value);
    });
  }, []);

  const setVolume = (next: SfxVolume) => {
    setVolumeState(next);
    AsyncStorage.setItem(VOLUME_KEY, next);
  };

  return (
    <SoundContext.Provider value={{ volume, setVolume, gain: VOLUME_GAIN[volume] }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}

/**
 * 段に対応する実際の音量。設定画面が「選んだ段で試しに鳴らす」ために使う。
 * 選んだ直後は Context の gain がまだ古いので、値から直に引ける口が要る。
 */
export function sfxGain(volume: SfxVolume): number {
  return VOLUME_GAIN[volume];
}

export { VOLUME_ORDER };
