/**
 * デモモードの操作 UI(DEMO_MODE のときだけ root にマウントされる)。
 *
 *   ▶ 開始: カウントイン(4拍のインジケータ)→ 台本を実行
 *   ■ 停止: すべてのタイマーを止め、初期状態に戻す(アプリ再起動なしで撮り直せる)
 *   ⇣ 手帳・図鑑・解説を1段階スクロール(撮影時に手で押す用)
 *
 * カウントインのインジケータは左上。▶を押した瞬間に1拍目が点き、
 * 1拍ごとに進み、4拍目の直後(= 楽曲の 0:00.00)に消える。
 * 編集時はこの4拍を頭から切り落とす。
 */
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FOOD_AJI, SCROLL_STEP_MS, SCROLL_STEP_PX } from './config';
import { runDemo } from './driver';
import { demoCall } from './registry';
import { buildDemoActions } from './script';
import { BEAT_MS } from './timing';

type Phase = 'idle' | 'countin' | 'running';

export default function DemoOverlay() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [beatIdx, setBeatIdx] = useState(0);
  const stopDemo = useRef<(() => void) | null>(null);
  const beatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearBeat = () => {
    if (beatTimer.current !== null) {
      clearInterval(beatTimer.current);
      beatTimer.current = null;
    }
  };

  useEffect(
    () => () => {
      stopDemo.current?.();
      clearBeat();
    },
    [],
  );

  const start = () => {
    if (phase !== 'idle') return;
    setPhase('countin');
    setBeatIdx(0);
    let b = 0;
    beatTimer.current = setInterval(() => {
      b += 1;
      if (b >= 4) {
        clearBeat();
        setPhase('running'); // 4拍目の直後 = 0:00.00。インジケータを消す
      } else {
        setBeatIdx(b);
      }
    }, BEAT_MS);
    stopDemo.current = runDemo(buildDemoActions(), (s) => console.log('[demo]', s));
  };

  const stop = () => {
    stopDemo.current?.();
    stopDemo.current = null;
    clearBeat();
    demoCall('root.hideSplash');
    if (router.canGoBack()) router.back(); // アドバイスが開いていたら閉じる
    demoCall('combine.reset', [FOOD_AJI]);
    demoCall('notebookScroll.toTop'); // 手帳のままだと再マウントされず位置が残る
    demoCall('notebook.reset');
    router.navigate('/');
    setPhase('idle');
  };

  return (
    <View style={styles.layer} pointerEvents="box-none">
      {phase === 'countin' && (
        <View style={styles.countIn} pointerEvents="none">
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.beatDot, i <= beatIdx && styles.beatDotOn]}
            />
          ))}
        </View>
      )}
      <View style={styles.buttons} pointerEvents="box-none">
        {phase === 'idle' ? (
          <Pressable style={styles.button} onPress={start}>
            <Text style={styles.buttonText}>▶</Text>
          </Pressable>
        ) : (
          <>
            <Pressable style={styles.button} onPress={stop}>
              <Text style={styles.buttonText}>■</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={() => demoCall('notebookScroll.by', SCROLL_STEP_PX, SCROLL_STEP_MS)}
            >
              <Text style={styles.buttonText}>⇣</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  countIn: {
    position: 'absolute',
    top: 64,
    left: 16,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  beatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  beatDotOn: { backgroundColor: '#fff' },
  buttons: {
    position: 'absolute',
    right: 8,
    bottom: 96,
    gap: 8,
    alignItems: 'center',
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 14 },
});
