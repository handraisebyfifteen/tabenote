/**
 * 食材タイル — キャラ選択グリッドの1マス(指示書 6-2 の視覚化)。
 *
 * 参考はレースゲーム/格闘ゲームのキャラ選択画面:
 *   枠と地の色 = 性(寒熱)。術語は出さず色だけで伝える。
 *   1タップ = カーソル(プレビュー)、2タップ目 = 決定、長押し = ★よく使う。
 *   絵はマスいっぱいに大きく、名前は右下に小さく重ねる(絵に少し被ってよい)。
 *   絵だけを絶対配置にして、名前は通常フローのまま下端に置く。
 *   逆(名前を絶対配置)にすると英語名がマスから溢れて切り詰められなかった。
 *   絵の中心はマスの中心よりわずかに上 — 下端の名前のぶん、視覚的な重心を合わせる。
 *   標準は 3×3 の9マス(4列は小さすぎて見分けづらかった)。
 *   設定の「大きく表示」では 2 列になり、絵と名前もマスに合わせて大きくなる。
 *
 * 絵は自前の線画アイコン(src/components/icons/icons.ts)。食材ごとの icon を引き、
 * 無ければ catIcon(カテゴリ)、それも無ければ頭文字のモノグラムに落とす。
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useReducedMotion,
  type CSSAnimationKeyframes,
} from 'react-native-reanimated';

import { TabenoteIcon, hasIcon } from '@/components/icons/TabenoteIcon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { brighten } from '@/lib/color';

/** 決定(2タップ目)の瞬間だけ焚く点灯。パッと光ってすぐ消える */
const FLASH_FRAMES: CSSAnimationKeyframes = {
  '0%': { opacity: 0.8 },
  '100%': { opacity: 0 },
};

/**
 * 決定されたタイルの退場。前半は点灯(FLASH_FRAMES)を見せるため留まり、
 * 後半で縮みながら消える。この長さは combine 側の凍結(450ms)と合わせること
 */
const DEPART_FRAMES: CSSAnimationKeyframes = {
  '0%': { opacity: 1, transform: [{ scale: 1 }] },
  '55%': { opacity: 1, transform: [{ scale: 1 }] },
  '100%': { opacity: 0, transform: [{ scale: 0.85 }] },
};

/**
 * 列数ごとの中身の寸法。マスの幅(iPhone で 3列≈117px / 2列≈175px)に釣り合わせる。
 * 「大きく表示」の文字倍率はここには掛けない — マスに対する比率で決まっているため。
 */
const METRICS = {
  standard: { icon: 72, monogram: 34, name: 14, star: 13, badge: 19, badgeText: 12 },
  large: { icon: 108, monogram: 50, name: 20, star: 17, badge: 26, badgeText: 15 },
} as const;

interface Props {
  /** グリッドの列数(3=標準 / 2=大きく表示)。マスの幅と中身の寸法が変わる */
  columns: number;
  /** 表示名(言語解決済み) */
  name: string;
  /** 食材のアイコンキー(Food.icon) */
  icon: string;
  /** カテゴリのアイコンキー(Food.catIcon)。icon が引けない時に使う */
  catIcon: string;
  /** 性の色(FlavorPentagon.natureColor) */
  color: string;
  selected: boolean;
  /** カーソルが乗っている(1タップ目)状態 */
  focused: boolean;
  starred: boolean;
  /** 決定されて退場中(グリッドから抜ける直前)。点灯 → 縮んで消える */
  departing?: boolean;
  nameColor: string;
  onPress: () => void;
  onLongPress: () => void;
}

export default function FoodTile({
  columns,
  name,
  icon,
  catIcon,
  color,
  selected,
  focused,
  starred,
  departing = false,
  nameColor,
  onPress,
  onLongPress,
}: Props) {
  const m = columns <= 2 ? METRICS.large : METRICS.standard;
  // 線画は性の色で描く。暗い配色ではマスの地(色の薄敷き)に沈むので白に寄せる
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const drawColor = dark ? brighten(color, 0.4) : color;
  // 暗い配色でだけネオン管のように光らせる。枠の発光(boxShadow)と同じ条件で強める
  const glow = dark ? (focused || selected ? 1 : 0.55) : 0;
  const lit = focused || selected;

  // 決定の点灯は false→true の遷移の瞬間だけ。選択済みタイルが
  // スクロールで再マウントされたときや、手帳からの呼び出しで最初から
  // 選択されているときは光らせない
  const reduced = useReducedMotion();
  const wasSelected = React.useRef(selected);
  const [flash, setFlash] = React.useState(0);
  React.useEffect(() => {
    if (selected && !wasSelected.current && !reduced) setFlash((n) => n + 1);
    wasSelected.current = selected;
  }, [selected, reduced]);
  return (
    <Animated.View
      style={[
        styles.cell,
        { width: `${100 / columns}%` },
        departing && !reduced && {
          animationName: DEPART_FRAMES,
          animationDuration: '450ms',
          animationTimingFunction: 'ease-in',
          // 消えた姿(0%・scale 0.85)のまま凍結解除を待つ
          animationFillMode: 'forwards',
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.tile,
          {
            // カーソル/選択中は枠を白寄りに明るくして「点灯」を分からせる
            borderColor: lit ? brighten(color, 0.45) : color,
            backgroundColor: color + (lit && selected ? '38' : lit ? '2A' : '16'),
            // 普通(1.25)だと性の色が判別しづらいため、ボールド(3)手前の 2 を既定にする
            borderWidth: lit && selected ? 3.5 : lit ? 3 : 2,
          },
          // 発光。boxShadow は New Architecture 前提(Expo 57 の既定)
          lit && { boxShadow: `0 0 12px 2px ${color}` },
          pressed && { transform: [{ scale: 0.94 }] },
        ]}
      >
        {starred && <Text style={[styles.star, { fontSize: m.star }]}>★</Text>}
        {selected && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: color,
                width: m.badge,
                height: m.badge,
                borderRadius: m.badge / 2,
              },
            ]}
          >
            <Text style={[styles.badgeText, { fontSize: m.badgeText }]}>✓</Text>
          </View>
        )}
        {/* 名前のぶん(m.name)だけ下を詰めて、絵の中心を少し上に寄せる */}
        <View style={[styles.visual, { bottom: m.name }]}>
          {hasIcon(icon) || hasIcon(catIcon) ? (
            <TabenoteIcon
              name={icon}
              fallback={catIcon}
              size={m.icon}
              color={drawColor}
              glow={glow}
            />
          ) : (
            <Text style={[styles.monogram, { color, fontSize: m.monogram }]}>
              {name.slice(0, 1)}
            </Text>
          )}
        </View>
        {/* 名前は素の Text。マス由来の寸法(m.name)で決めるので文字サイズ設定は掛けない */}
        {/* 長い英語名は 75% まで字を縮めてから切り詰める(Web は非対応でそのまま切り詰め) */}
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          style={[styles.name, { color: nameColor, fontSize: m.name }]}
        >
          {name}
        </Text>
        {/* 決定の点灯。key で毎回マウントし直して、決定のたびに焚き直す */}
        {flash > 0 && (
          <Animated.View
            key={flash}
            pointerEvents="none"
            style={[
              styles.flash,
              {
                backgroundColor: brighten(color, 0.55),
                animationName: FLASH_FRAMES,
                animationDuration: '400ms',
                animationTimingFunction: 'ease-out',
              },
            ]}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cell: { padding: 5 },
  tile: {
    aspectRatio: 1,
    borderRadius: 18,
    overflow: 'hidden',
    // 唯一の通常フローの子(名前)を下端に置く。絵は absolute で重ねる
    justifyContent: 'flex-end',
  },
  visual: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // userSelect: Webのダブルタップで文字が範囲選択されるのを防ぐ(ネイティブでは無視される)
  monogram: { fontWeight: '700', userSelect: 'none' },
  name: {
    textAlign: 'right',
    paddingHorizontal: 8,
    paddingBottom: 6,
    userSelect: 'none',
  },
  star: {
    position: 'absolute',
    top: 4,
    left: 8,
    color: '#D9A441',
    zIndex: 1,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  badgeText: { color: '#fff', fontWeight: '700' },
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // 点灯が終わったあとの静止値。アニメーションは 0.8 から始まってここへ戻る
    opacity: 0,
    zIndex: 2,
  },
});
