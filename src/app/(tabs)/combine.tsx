/**
 * 組み合わせ — 食材を選ぶ画面(指示書 6-2)。
 *
 * キャラ選択グリッド(参考: マリオカートのキャラ選択):
 *   タイルの枠と地の色 = 性(温=暖色、寒=寒色)。術語は見せない。
 *   1タップ = カーソル(プレビュー)、もう一度タップ = 決定、長押し = ★よく使う。
 *
 * 探し方は3層(指示書 6-2):
 *   ★よく使う(お気に入りの手動登録 + 選択履歴からの自動昇格)/ 15分類タブ / 検索。
 * タイルの絵は絵文字/頭文字の仮置き。権利がクリーンなイラストが
 * 用意でき次第差し替える(指示書 8-5)。
 */
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Svg, { Polygon as SvgPolygon, Text as SvgText } from 'react-native-svg';

import FiveElementsChart from '@/components/FiveElementsChart';
import FlavorPentagon, { natureColor } from '@/components/FlavorPentagon';
import FoodThumb from '@/components/FoodThumb';
import FoodTile from '@/components/FoodTile';
import NatureScale from '@/components/NatureScale';
import PageHead from '@/components/PageHead';
import { Colors } from '@/constants/theme';
import { getFoodEmoji } from '@/data/foodEmoji';
import {
  ALL_CAT15,
  SELECTABLE_FOODS,
  getFood,
  searchFoods,
  type Cat15,
  type Food,
} from '@/data/foods';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import {
  cat15Label,
  fiveFlavorAxisLabels,
  fiveSeasonChipLabel,
  foodName,
  natureLabel,
} from '@/i18n/terms';
import { FIVE_FLAVORS, aggregateFlavors } from '@/logic/flavors';
import { averageNatureLevel, natureValue } from '@/logic/nature';
import {
  SEASON_RECOMMENDATIONS,
  getFiveSeason,
  type FiveSeason,
} from '@/logic/season';
import { complementOrder } from '@/logic/suggest';
import { loadUserData, recordSelections, toggleFavorite } from '@/lib/storage';

/** よく使う層に自動で上がる件数の上限(お気に入りを除く) */
const AUTO_QUICK_LIMIT = 20;

/**
 * 同じタイルへの2連続タップ(400ms以内)を判定する。
 * モジュールスコープに置くのは React Compiler の純粋性検査を満たすため
 * (レンダー内で Date.now() を呼べない)。画面は1つなので共有で問題ない。
 */
const isSecondTap = (() => {
  let lastId = '';
  let lastTime = 0;
  return (id: string): boolean => {
    const now = Date.now();
    const double = lastId === id && now - lastTime < 400;
    lastId = double ? '' : id;
    lastTime = double ? 0 : now;
    return double;
  };
})();

/** 「★よく使う」を表すタブ値(15分類と排他) */
type CatTab = Cat15 | 'quick' | null;

/** 季節モーダルのチップ順(暦順) */
const SEASON_ORDER: FiveSeason[] = ['spring', 'summer', 'doyo', 'autumn', 'winter'];

/** ？解説に出す性の凡例(寒色→暖色の順) */
const NATURE_LEGEND = [
  { level: -2, nature: '寒' },
  { level: -1, nature: '涼' },
  { level: 0, nature: '平' },
  { level: 1, nature: '温' },
  { level: 2, nature: '熱' },
] as const;

/** 右上ボタンの五角形アイコンの頂点(22x22、中心11、半径9) */
const PENTAGON_ICON_POINTS = '11,2 19.56,8.22 16.29,18.28 5.71,18.28 2.44,8.22';

/**
 * 主味(いちばん強い味)の軸の角度(FlavorPentagon と同じ「酸が真上、時計回り」)。
 * ポートレートが五行のその方向から飛び出してくる演出に使う。
 */
function dominantAxisAngle(food: Food): number {
  const own = aggregateFlavors([food]);
  let best = 0;
  FIVE_FLAVORS.forEach((f, i) => {
    if (own[f] > own[FIVE_FLAVORS[best]]) best = i;
  });
  return -90 + best * 72;
}

/** 選択中の食材の顔(キャラ選択のポートレート)。主味の軸の方向からポップして現れる */
function FoodPortrait({
  id,
  name,
  emoji,
  color,
  nameColor,
  fromAngleDeg,
}: {
  id: string;
  name: string;
  emoji: string | null;
  color: string;
  nameColor: string;
  fromAngleDeg: number;
}) {
  const anim = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      friction: 6,
      tension: 140,
      useNativeDriver: false,
    }).start();
    // 表示する食材が替わるたびに演出をやり直す
  }, [id, anim]);
  const rad = (fromAngleDeg * Math.PI) / 180;
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.cos(rad) * 44, 0],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.sin(rad) * 44, 0],
  });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  return (
    <Animated.View
      style={{
        alignItems: 'center',
        gap: 6,
        opacity: anim,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    >
      <FoodThumb name={name} emoji={emoji} color={color} size={96} />
      <Text
        style={{ color: nameColor, fontSize: 13, fontWeight: '600' }}
        numberOfLines={1}
      >
        {name}
      </Text>
    </Animated.View>
  );
}

export default function CombineScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<CatTab>(null);
  /** カーソルが乗っている食材(1タップ目)。2タップ目で決定 */
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<Record<string, number>>({});
  // 初回だけ「★よく使う」を既定タブにする(空のときは「すべて」のまま)
  const quickInitialized = useRef(false);

  // 手帳からの呼び出し(指示書 6-3「呼び出して再編集」)。同じ組み合わせを二度適用しない
  const { ids: presetIds } = useLocalSearchParams<{ ids?: string }>();
  const appliedPreset = useRef<string | null>(null);
  useEffect(() => {
    if (typeof presetIds !== 'string' || presetIds === '') return;
    if (appliedPreset.current === presetIds) return;
    appliedPreset.current = presetIds;
    const valid = presetIds
      .split(',')
      .filter((id) => {
        const f = getFood(id);
        return f !== undefined && f.nature !== '';
      });
    setSelectedIds(valid);
  }, [presetIds]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadUserData().then((d) => {
        if (!active) return;
        setFavorites(d.favorites);
        setHistory(d.selectionHistory);
        if (!quickInitialized.current) {
          quickInitialized.current = true;
          if (d.favorites.length > 0 || Object.keys(d.selectionHistory).length > 0) {
            setCat('quick');
          }
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  /** お気に入り(登録順)+ 選択回数の多い順(自動昇格) */
  const quickFoods = useMemo(() => {
    const favSet = new Set(favorites);
    const favs = favorites
      .map((id) => getFood(id))
      .filter((f): f is Food => f !== undefined && f.nature !== '');
    const often = SELECTABLE_FOODS.filter(
      (f) => !favSet.has(f.id) && (history[f.id] ?? 0) > 0,
    )
      .sort((a, b) => (history[b.id] ?? 0) - (history[a.id] ?? 0))
      .slice(0, AUTO_QUICK_LIMIT);
    return [...favs, ...often];
  }, [favorites, history]);

  const todaySeason = useMemo(() => getFiveSeason(new Date()).season, []);
  /** 季節ボタンでの手動選択。null なら今日の季節に追従 */
  const [seasonOverride, setSeasonOverride] = useState<FiveSeason | null>(null);
  const season = seasonOverride ?? todaySeason;
  const seasonRec = SEASON_RECOMMENDATIONS[season];
  const [seasonModal, setSeasonModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);

  const selectedFoods = useMemo(
    () =>
      selectedIds
        .map((id) => SELECTABLE_FOODS.find((f) => f.id === id))
        .filter((f): f is Food => f !== undefined),
    [selectedIds],
  );

  const totals = useMemo(() => aggregateFlavors(selectedFoods), [selectedFoods]);
  const natureLevel = useMemo(() => averageNatureLevel(selectedFoods), [selectedFoods]);

  const listFoods = useMemo(() => {
    // 選択済みはグリッドから外す(上のパーティ枠に居る)
    const picked = new Set(selectedIds);
    if (query.trim() !== '') {
      // 別名(note)・英語名にもヒットさせる。参照のみ項目はこの画面では選べないので除く
      return searchFoods(query).filter((f) => f.nature !== '' && !picked.has(f.id));
    }
    if (cat === 'quick') {
      return quickFoods.filter((f) => !picked.has(f.id));
    }
    if (cat !== null) {
      return SELECTABLE_FOODS.filter((f) => f.cat15 === cat && !picked.has(f.id));
    }
    // 「すべて」: 選択のたびにリフレッシュ。
    // まだ入っていない分類・味を埋める食材が前に出る(選んだ穀類の仲間は沈む)
    return complementOrder(selectedFoods, {
      favorites,
      selectionHistory: history,
      seasonNatureLevels: seasonRec.natureLevels,
    });
  }, [query, cat, quickFoods, selectedIds, selectedFoods, favorites, history, seasonRec]);

  const toggle = (id: string) => {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  };

  /** 1タップ = カーソル、同じタイルの2タップ目 = 決定(選択のトグル) */
  const onTile = (id: string) => {
    if (isSecondTap(id)) {
      toggle(id);
      // 決定したタイルはグリッドから抜けるので、カーソルも外す
      setFocusedId(null);
    } else {
      setFocusedId(id);
    }
  };

  const toggleStar = async (id: string) => {
    const d = await toggleFavorite(id);
    setFavorites(d.favorites);
  };

  const focusedFood = focusedId !== null ? getFood(focusedId) : undefined;
  /** 左のポートレートに出す食材: カーソル中のもの、なければ最後に決定したもの */
  const portraitFood =
    focusedFood ??
    (selectedFoods.length > 0 ? selectedFoods[selectedFoods.length - 1] : undefined);

  const decide = async () => {
    if (selectedIds.length === 0) return;
    await recordSelections(selectedIds);
    router.push({
      pathname: '/advice',
      params: { ids: selectedIds.join(','), season },
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <PageHead {...t.meta.combine} path="/combine" />

      <View style={styles.pentagonArea}>
        {/* 五角形は右へ寄せ、左は選択中の食材のポートレート置き場 */}
        <View style={styles.portraitSlot}>
          {portraitFood !== undefined && (
            <FoodPortrait
              id={portraitFood.id}
              name={foodName(portraitFood, lang)}
              emoji={getFoodEmoji(portraitFood.name)}
              color={natureColor(natureValue(portraitFood))}
              nameColor={c.text}
              fromAngleDeg={dominantAxisAngle(portraitFood)}
            />
          )}
        </View>
        <FlavorPentagon
          totals={totals}
          natureLevel={natureLevel}
          seasonFlavors={seasonRec.flavors}
          axisLabels={fiveFlavorAxisLabels(lang)}
          size={180}
        />
        {/* 五角形の横に性(寒熱)のスケール。タイルと五角形の色の意味の凡例 */}
        <NatureScale
          natureLevel={natureLevel}
          labels={
            [...NATURE_LEGEND]
              .reverse()
              .map((item) => natureLabel(item.nature, lang)) as [
              string,
              string,
              string,
              string,
              string,
            ]
          }
          height={140}
          markerColor={c.text}
          labelColor={c.textSecondary}
        />
        {/* 左上: 季節の設定。点線の推奨形とリフレッシュ並びが従う。既定は今日 */}
        <Pressable
          style={[
            styles.cornerButton,
            styles.cornerLeft,
            { backgroundColor: seasonOverride !== null ? '#8FAF8B' : c.backgroundElement },
          ]}
          onPress={() => setSeasonModal(true)}
        >
          <Text
            style={{
              color: seasonOverride !== null ? '#fff' : c.text,
              fontSize: 13,
            }}
          >
            {t.combine.seasonLabel}
            {lang === 'ja' ? '：' : ': '}
            {fiveSeasonChipLabel(season, lang)}
          </Text>
        </Pressable>
        {/* 右上: 五角形ボタン → 五行相生・相克図と見かたの解説 */}
        <Pressable
          style={[
            styles.cornerButton,
            styles.cornerRight,
            { backgroundColor: c.backgroundElement },
          ]}
          accessibilityLabel={t.combine.helpTitle}
          onPress={() => setHelpModal(true)}
        >
          <Svg width={22} height={22}>
            <SvgPolygon
              points={PENTAGON_ICON_POINTS}
              fill="none"
              stroke={c.text}
              strokeWidth={1.6}
            />
            <SvgText
              x={11}
              y={14.5}
              fontSize={9}
              fontWeight="bold"
              fill={c.text}
              textAnchor="middle"
            >
              ?
            </SvgText>
          </Svg>
        </Pressable>
      </View>

      <Modal
        transparent
        visible={seasonModal}
        animationType="fade"
        onRequestClose={() => setSeasonModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSeasonModal(false)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: c.background }]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: c.text }]}>
              {t.combine.seasonLabel}
            </Text>
            <View style={styles.seasonChips}>
              {SEASON_ORDER.map((s) => {
                const active = season === s;
                const label =
                  fiveSeasonChipLabel(s, lang) +
                  (s === todaySeason ? `(${t.combine.seasonToday})` : '');
                return (
                  <Pressable
                    key={s}
                    style={[
                      styles.seasonChip,
                      { backgroundColor: active ? '#8FAF8B' : c.backgroundElement },
                    ]}
                    onPress={() => {
                      setSeasonOverride(s === todaySeason ? null : s);
                      setSeasonModal(false);
                    }}
                  >
                    <Text style={{ color: active ? '#fff' : c.text, fontSize: 14 }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[styles.modalNote, { color: c.textSecondary }]}>
              {t.combine.seasonModalNote}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={helpModal}
        animationType="fade"
        onRequestClose={() => setHelpModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setHelpModal(false)}>
          <Pressable
            style={[styles.modalCard, styles.helpCard, { backgroundColor: c.background }]}
            onPress={() => {}}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.helpScroll}
            >
              <Text style={[styles.modalTitle, { color: c.text }]}>
                {t.combine.helpTitle}
              </Text>
              <Text style={[styles.helpBody, { color: c.text }]}>
                {t.combine.helpPentagon}
              </Text>
              <Text style={[styles.helpBody, { color: c.text }]}>
                {t.combine.helpDashed}
              </Text>
              <View style={styles.chartArea}>
                <FiveElementsChart
                  lang={lang}
                  labelColor={c.textSecondary}
                  bgColor={c.background}
                />
              </View>
              <Text style={[styles.helpBody, { color: c.textSecondary }]}>
                {t.combine.helpCycle}
              </Text>
              <Text style={[styles.helpBody, { color: c.text }]}>
                {t.combine.helpNature}
              </Text>
              <View style={styles.legendRow}>
                {NATURE_LEGEND.map((item) => (
                  <View key={item.nature} style={styles.legendItem}>
                    <View
                      style={[styles.dot, { backgroundColor: natureColor(item.level) }]}
                    />
                    <Text style={{ color: c.text, fontSize: 12 }}>
                      {natureLabel(item.nature, lang)}
                    </Text>
                  </View>
                ))}
              </View>
              <Pressable style={styles.closeButton} onPress={() => setHelpModal(false)}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                  {t.combine.close}
                </Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {selectedFoods.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
          contentContainerStyle={styles.chipsContent}
        >
          {selectedFoods.map((f) => (
            <Pressable
              key={f.id}
              style={[styles.chip, { backgroundColor: c.backgroundSelected }]}
              onPress={() => toggle(f.id)}
            >
              <Text style={{ color: c.text }}>
                {getFoodEmoji(f.name) ?? ''}
                {foodName(f, lang)} ✕
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <TextInput
        style={[
          styles.search,
          { backgroundColor: c.backgroundElement, color: c.text },
        ]}
        placeholder={t.combine.searchPlaceholder}
        placeholderTextColor={c.textSecondary}
        value={query}
        onChangeText={setQuery}
      />

      {query.trim() === '' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
          contentContainerStyle={styles.chipsContent}
        >
          <Pressable
            style={[
              styles.chip,
              { backgroundColor: cat === 'quick' ? '#8FAF8B' : c.backgroundElement },
            ]}
            onPress={() => setCat(cat === 'quick' ? null : 'quick')}
          >
            <Text style={{ color: cat === 'quick' ? '#fff' : c.text }}>
              {t.combine.quickTab}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.chip,
              { backgroundColor: cat === null ? '#8FAF8B' : c.backgroundElement },
            ]}
            onPress={() => setCat(null)}
          >
            <Text style={{ color: cat === null ? '#fff' : c.text }}>
              {t.combine.allTab}
            </Text>
          </Pressable>
          {ALL_CAT15.map((k) => (
            <Pressable
              key={k}
              style={[
                styles.chip,
                { backgroundColor: cat === k ? '#8FAF8B' : c.backgroundElement },
              ]}
              onPress={() => setCat(cat === k ? null : k)}
            >
              <Text style={{ color: cat === k ? '#fff' : c.text }}>
                {cat15Label(k, lang)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={styles.focusRow}>
        {(() => {
          if (focusedFood === undefined) {
            return (
              <Text style={[styles.focusHint, { color: c.textSecondary }]}>
                {t.combine.gridHint}
              </Text>
            );
          }
          return (
            <>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: natureColor(natureValue(focusedFood)) },
                ]}
              />
              <Text style={[styles.focusName, { color: c.text }]} numberOfLines={1}>
                {foodName(focusedFood, lang)}
              </Text>
              <Text style={[styles.focusHint, { color: c.textSecondary }]}>
                {t.combine.focusHint}
              </Text>
            </>
          );
        })()}
      </View>

      <FlatList
        style={styles.list}
        data={listFoods}
        keyExtractor={(f) => f.id}
        numColumns={4}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={
          cat === 'quick' && query.trim() === '' ? (
            <Text style={[styles.quickEmpty, { color: c.textSecondary }]}>
              {t.combine.quickEmpty}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <FoodTile
            name={foodName(item, lang)}
            emoji={getFoodEmoji(item.name)}
            color={natureColor(natureValue(item))}
            selected={selectedIds.includes(item.id)}
            focused={focusedId === item.id}
            starred={favorites.includes(item.id)}
            nameColor={c.text}
            onPress={() => onTile(item.id)}
            onLongPress={() => toggleStar(item.id)}
          />
        )}
      />

      <Pressable
        style={[styles.decideButton, selectedIds.length === 0 && styles.decideDisabled]}
        onPress={decide}
        disabled={selectedIds.length === 0}
      >
        <Text style={styles.decideText}>{t.combine.decide(selectedIds.length)}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  pentagonArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingRight: 12,
  },
  portraitSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
  cornerButton: {
    position: 'absolute',
    top: 10,
    borderRadius: 16,
    paddingHorizontal: 12,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerLeft: { left: 12 },
  cornerRight: { right: 12, width: 30, paddingHorizontal: 0 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: '600' },
  modalNote: { fontSize: 12, lineHeight: 18 },
  seasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seasonChip: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  helpCard: { maxHeight: '88%' },
  helpScroll: { gap: 12 },
  chartArea: { alignItems: 'center' },
  helpBody: { fontSize: 13, lineHeight: 20 },
  legendRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    paddingVertical: 2,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  closeButton: {
    backgroundColor: '#8FAF8B',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  chipsRow: { flexGrow: 0 },
  chipsContent: { paddingHorizontal: 12, gap: 8, paddingVertical: 4 },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  search: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  list: { flex: 1 },
  gridContent: { paddingHorizontal: 8, paddingBottom: 8 },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 24,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  focusName: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
  focusHint: { fontSize: 12 },
  quickEmpty: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  decideButton: {
    backgroundColor: '#8FAF8B',
    margin: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  decideDisabled: { opacity: 0.4 },
  decideText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
