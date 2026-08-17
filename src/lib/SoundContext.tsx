/**
 * 音とバイブの設定(設定画面)。効果音の音量と、バイブの入切を持つ。
 *
 *   音量: 'off'(消音)/ 'low'(小)/ 'mid'(中・既定)/ 'high'(大)
 *   バイブ: 入(既定)/ 切
 *
 * 音量をつまみ(スライダー)ではなく4段にしてあるのは、効果音が 0.5 秒鳴って消えるため。
 * 連続の値を耳で追い込むのが難しく、押し直すたびに鳴らして比べられる段のほうが決めやすい。
 *
 * 音とバイブを別に切れるようにしてあるのは、消したい理由が別だから
 * (人前では音だけ切りたい・振動が苦手など)。
 *
 * どちらも AsyncStorage に永続化する。
 * 実際に鳴らす・震わせるのは useCombineFeedback(@/hooks/use-combine-feedback)。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { primeSfx } from '@/lib/sfx';

export type SfxVolume = 'off' | 'low' | 'mid' | 'high';

const VOLUME_KEY = 'tabenote/sfxVolume/v1';
const HAPTICS_KEY = 'tabenote/haptics/v1';

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
const DEFAULT_HAPTICS = true;

function isVolume(value: unknown): value is SfxVolume {
  return VOLUME_ORDER.includes(value as SfxVolume);
}

type SoundValue = {
  volume: SfxVolume;
  setVolume: (volume: SfxVolume) => void;
  /** volume を実際の音量(0〜1)にしたもの。0 なら鳴らさない */
  gain: number;
  haptics: boolean;
  setHaptics: (on: boolean) => void;
};

const SoundContext = createContext<SoundValue>({
  volume: DEFAULT_VOLUME,
  setVolume: () => {},
  gain: VOLUME_GAIN[DEFAULT_VOLUME],
  haptics: DEFAULT_HAPTICS,
  setHaptics: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [volume, setVolumeState] = useState<SfxVolume>(DEFAULT_VOLUME);
  const [haptics, setHapticsState] = useState(DEFAULT_HAPTICS);

  useEffect(() => {
    // 最初の1回から鳴るよう、起動時に読み込んでおく
    primeSfx();
    AsyncStorage.multiGet([VOLUME_KEY, HAPTICS_KEY]).then((entries) => {
      for (const [key, value] of entries) {
        if (key === VOLUME_KEY && isVolume(value)) setVolumeState(value);
        // 保存がなければ既定(入)のまま。'off' と書いてあるときだけ切る
        if (key === HAPTICS_KEY && value !== null) setHapticsState(value === 'on');
      }
    });
  }, []);

  const setVolume = (next: SfxVolume) => {
    setVolumeState(next);
    AsyncStorage.setItem(VOLUME_KEY, next);
  };

  const setHaptics = (on: boolean) => {
    setHapticsState(on);
    AsyncStorage.setItem(HAPTICS_KEY, on ? 'on' : 'off');
  };

  return (
    <SoundContext.Provider
      value={{ volume, setVolume, gain: VOLUME_GAIN[volume], haptics, setHaptics }}
    >
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
