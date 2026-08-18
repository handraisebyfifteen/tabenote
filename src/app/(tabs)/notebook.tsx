/**
 * 手帳 — ライブラリー(指示書 6-3)。落ち着いたトーン。記録と閲覧。
 *
 *   組み合わせ: 保存した組み合わせ + そのメモ(編集・呼び出し・削除)
 *   図鑑: 全品目の一覧(参照のみ項目を含む)と食材詳細への入口
 *   解説: 五行の体系・五味のはたらき・必須の注記
 */
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';

import { natureColor } from '@/components/FlavorPentagon';
import FoodThumb from '@/components/FoodThumb';
import { getFoodEmoji } from '@/data/foodEmoji';
import PageHead from '@/components/PageHead';
import { Text, TextInput } from '@/components/Type';
import { Colors } from '@/constants/theme';
import {
  VISIBLE_FOODS,
  getFood,
  isReferenceOnly,
  searchFoods,
  toHiragana,
} from '@/data/foods';
import { FOOD_NAMES_EN } from '@/data/foodNamesEn';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCombineFeedback } from '@/hooks/use-combine-feedback';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import { cat15Label, foodName, natureLabel } from '@/i18n/terms';
import { natureValue } from '@/logic/nature';
import {
  EMPTY_USER_DATA,
  deleteSavedCombo,
  loadUserData,
  toggleFavorite,
  updateSavedCombo,
  type SavedCombo,
  type UserData,
} from '@/lib/storage';

type Segment = 'combos' | 'zukan' | 'guide';

/**
 * カードのダブルタップ判定(ms)。組み合わせ画面の「2タップ目で決定」の手帳版。
 * 1タップの開閉は残したいので、こちらは素早い2タップ目だけを拾う(点灯の演出はなし)
 */
const DOUBLE_TAP_MS = 350;

/** 保存した組み合わせの日付 'YYYY-MM-DD' を Date にする(見出しの整形用) */
function parseYmd(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (m === null) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/**
 * 組み合わせ1件を検索対象の文字列にする。
 *
 * 探すときに手がかりになるのは、自分で付けた名前とメモ、それに「何が入っていたか」。
 * 食材名は保存されていない(ID だけ)ので、ここで引き直す。日本語名・別名・英語名を
 * すべて含めるので、表示中の言語と違う言葉で打っても引ける。日付('2026-08-17')も
 * 入れて、月で絞る使いかたに応えておく。
 *
 * 一覧から外した食材でも、その人が保存した記録には残る。名前で引けなくなるほうが
 * 不便なので、ここでは分け隔てなく対象にする。
 */
function comboHaystack(combo: SavedCombo): string {
  const foods = combo.foodIds.map((id) => {
    const food = getFood(id);
    if (food === undefined) return '';
    return `${food.name} ${food.note ?? ''} ${FOOD_NAMES_EN[food.id] ?? ''}`;
  });
  return toHiragana(
    `${combo.name} ${combo.memo} ${combo.date} ${foods.join(' ')}`.toLowerCase(),
  );
}

export default function NotebookScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const [segment, setSegment] = useState<Segment>('combos');
  const [data, setData] = useState<UserData>(EMPTY_USER_DATA);
  const feedback = useCombineFeedback();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadUserData().then((d) => {
        if (active) setData(d);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const segments: { key: Segment; label: string }[] = [
    { key: 'combos', label: t.notebook.segCombos },
    { key: 'zukan', label: t.notebook.segZukan },
    { key: 'guide', label: t.notebook.segGuide },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <PageHead {...t.meta.notebook} path="/notebook" />

      <View style={styles.segmentRow}>
        {segments.map((s) => (
          <Pressable
            key={s.key}
            style={[
              styles.segment,
              {
                backgroundColor:
                  segment === s.key ? c.backgroundSelected : c.backgroundElement,
              },
            ]}
            onPress={() => {
              // 表示を切り替えるだけのタブ。組み合わせ画面の道具ボタンと同じ「キ」
              feedback.ki();
              setSegment(s.key);
            }}
          >
            <Text
              style={{
                color: segment === s.key ? c.text : c.textSecondary,
                fontSize: 13,
                fontWeight: segment === s.key ? '600' : '400',
              }}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {segment === 'combos' && (
        <CombosSection combos={data.savedCombos} onChange={setData} />
      )}
      {segment === 'zukan' && (
        <ZukanSection
          favorites={data.favorites}
          notes={data.notes}
          onChange={setData}
        />
      )}
      {segment === 'guide' && <GuideSection />}
    </View>
  );
}

/* ---------------- 組み合わせ ---------------- */

function CombosSection({
  combos,
  onChange,
}: {
  combos: SavedCombo[];
  onChange: (data: UserData) => void;
}) {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const feedback = useCombineFeedback();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [memoDraft, setMemoDraftUi] = useState('');
  const [nameDraft, setNameDraftUi] = useState('');
  // blur を経ずに閉じても編集が消えないよう、最新値と保存済み値を ref に持つ
  const emptyDraft = {
    comboId: null as string | null,
    name: '',
    memo: '',
    persistedName: '',
    persistedMemo: '',
  };
  const draftState = useRef({ ...emptyDraft });

  const setMemoDraft = (text: string) => {
    draftState.current.memo = text;
    setMemoDraftUi(text);
  };

  const setNameDraft = (text: string) => {
    draftState.current.name = text;
    setNameDraftUi(text);
  };

  /** 未保存の編集を書き込む。updateUi=false はアンマウント時用(親の再描画をしない) */
  const persistDraft = useCallback(
    (updateUi: boolean) => {
      const s = draftState.current;
      if (s.comboId === null) return;
      // 空の名前では保存しない(元の名前に戻す)
      const name = s.name.trim() === '' ? s.persistedName : s.name;
      if (name === s.persistedName && s.memo === s.persistedMemo) return;
      s.persistedName = name;
      s.persistedMemo = s.memo;
      const write = updateSavedCombo(s.comboId, { name, memo: s.memo });
      if (updateUi) write.then(onChange);
    },
    [onChange],
  );

  // タブ切り替え等でセクションごと消えるときも書き込む
  useEffect(() => () => persistDraft(false), [persistDraft]);

  /** 直近にタップしたカード。素早い2タップ目 = 組成を見る(/advice) */
  const lastTap = useRef<{ id: string; at: number }>({ id: '', at: 0 });

  const onCardPress = (combo: SavedCombo) => {
    const now = new Date().getTime();
    const isDouble =
      lastTap.current.id === combo.id && now - lastTap.current.at < DOUBLE_TAP_MS;
    lastTap.current = { id: combo.id, at: now };
    if (isDouble) {
      persistDraft(true);
      router.push({
        pathname: '/advice',
        params: { ids: combo.foodIds.join(',') },
      });
      return;
    }
    toggleExpand(combo);
  };

  const toggleExpand = (combo: SavedCombo) => {
    persistDraft(true);
    if (expandedId === combo.id) {
      setExpandedId(null);
      draftState.current = { ...emptyDraft };
    } else {
      setExpandedId(combo.id);
      draftState.current = {
        comboId: combo.id,
        name: combo.name,
        memo: combo.memo,
        persistedName: combo.name,
        persistedMemo: combo.memo,
      };
      setNameDraftUi(combo.name);
      setMemoDraftUi(combo.memo);
    }
  };

  const remove = (combo: SavedCombo) => {
    Alert.alert(t.notebook.deleteTitle, t.notebook.deleteMessage(combo.name), [
      { text: t.notebook.deleteCancel, style: 'cancel' },
      {
        text: t.notebook.deleteConfirm,
        style: 'destructive',
        onPress: async () => {
          if (expandedId === combo.id) {
            setExpandedId(null);
            draftState.current = { ...emptyDraft };
          }
          const d = await deleteSavedCombo(combo.id);
          onChange(d);
        },
      },
    ]);
  };

  /**
   * 検索で絞る前に、開いているカードの編集を書き込んでから閉じる。
   * 絞り込みでカードごと消えると blur を経ずに消えてしまい、書きかけが宙に浮く。
   */
  const onQueryChange = (text: string) => {
    if (expandedId !== null) {
      persistDraft(true);
      setExpandedId(null);
      draftState.current = { ...emptyDraft };
    }
    setQuery(text);
  };

  const matched = useMemo(() => {
    const q = toHiragana(query.trim().toLowerCase());
    if (q === '') return combos;
    return combos.filter((combo) => comboHaystack(combo).includes(q));
  }, [combos, query]);

  // 手帳らしく日付ごとの見出しでまとめる(新しい日付が上、同じ日の中も新しいものが上)
  const sections = useMemo(() => {
    const byDate = new Map<string, SavedCombo[]>();
    for (const combo of matched) {
      const arr = byDate.get(combo.date) ?? [];
      arr.unshift(combo);
      byDate.set(combo.date, arr);
    }
    return [...byDate.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, data]) => ({ date, data }));
  }, [matched]);

  if (combos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: c.textSecondary }]}>
          {t.notebook.empty}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.combos}>
      {/*
        名前・メモ・食材名・日付で絞る。保存が増えるほど日付をたどるのが辛くなるので、
        図鑑と同じ形の検索窓を同じ位置に置く(手帳の中で探しかたを揃える)
      */}
      <TextInput
        style={[styles.search, { backgroundColor: c.backgroundElement, color: c.text }]}
        placeholder={t.notebook.combosPlaceholder(combos.length)}
        placeholderTextColor={c.textSecondary}
        value={query}
        onChangeText={onQueryChange}
        // 探しはじめの合図。組み合わせ画面の検索窓と同じ「カチッ」
        onFocus={() => feedback.search()}
      />
      <SectionList
        sections={sections}
        keyExtractor={(combo) => combo.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.emptyText, styles.filterEmpty, { color: c.textSecondary }]}>
            {t.notebook.combosSearchEmpty}
          </Text>
        }
        renderSectionHeader={({ section }) => {
          const d = parseYmd(section.date);
          return (
            <Text style={[styles.dateHeading, { color: c.textSecondary }]}>
              {d !== null ? t.notebook.dateHeading(d) : section.date}
            </Text>
          );
        }}
        renderItem={({ item }) => {
          const expanded = expandedId === item.id;
          return (
            <Pressable
              style={[styles.card, { backgroundColor: c.backgroundElement }]}
              onPress={() => onCardPress(item)}
            >
              {expanded ? (
                <TextInput
                  style={[styles.comboNameInput, { color: c.text, borderColor: c.backgroundSelected }]}
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  onBlur={() => persistDraft(true)}
                  placeholder={t.notebook.namePlaceholder}
                  placeholderTextColor={c.textSecondary}
                />
              ) : (
                <Text style={[styles.comboName, { color: c.text }]}>{item.name}</Text>
              )}
              <Text style={[styles.comboFoods, { color: c.text }]}>
                {item.foodIds
                  .map((id) => {
                    const food = getFood(id);
                    if (food === undefined) return undefined;
                    return `${getFoodEmoji(food.name) ?? ''}${foodName(food, lang)}`;
                  })
                  .filter(Boolean)
                  .join(lang === 'ja' ? '・' : ', ')}
              </Text>
              {!expanded && item.memo !== '' && (
                <Text style={[styles.comboMemoPreview, { color: c.textSecondary }]} numberOfLines={2}>
                  {item.memo}
                </Text>
              )}
              {expanded && (
                <View style={styles.comboDetail}>
                  <TextInput
                    style={[styles.comboMemoInput, { color: c.text, borderColor: c.backgroundSelected }]}
                    multiline
                    value={memoDraft}
                    onChangeText={setMemoDraft}
                    onBlur={() => persistDraft(true)}
                    placeholder={t.notebook.memoPlaceholder}
                    placeholderTextColor={c.textSecondary}
                  />
                  <View style={styles.comboActions}>
                    <Pressable
                      style={[styles.comboAction, { backgroundColor: c.backgroundSelected }]}
                      onPress={() => {
                        persistDraft(true);
                        router.push({
                          pathname: '/(tabs)/combine',
                          params: { ids: item.foodIds.join(',') },
                        });
                      }}
                    >
                      <Text style={{ color: c.text, fontSize: 13 }}>
                        {t.notebook.openInCombine}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.comboAction, { backgroundColor: c.backgroundSelected }]}
                      onPress={() =>
                        router.push({
                          pathname: '/advice',
                          params: { ids: item.foodIds.join(',') },
                        })
                      }
                    >
                      <Text style={{ color: c.text, fontSize: 13 }}>
                        {t.notebook.viewComposition}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.comboAction, { backgroundColor: c.backgroundSelected }]}
                      onPress={() => remove(item)}
                    >
                      <Text style={{ color: '#C9563D', fontSize: 13 }}>
                        {t.notebook.deleteAction}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

/* ---------------- 図鑑 ---------------- */

type ZukanFilter = 'all' | 'starred' | 'memo';

function ZukanSection({
  favorites,
  notes,
  onChange,
}: {
  favorites: string[];
  notes: Record<string, string>;
  onChange: (data: UserData) => void;
}) {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const feedback = useCombineFeedback();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ZukanFilter>('all');

  const foods = useMemo(() => {
    const base = query.trim() === '' ? VISIBLE_FOODS : searchFoods(query);
    if (filter === 'starred') return base.filter((f) => favorites.includes(f.id));
    if (filter === 'memo') return base.filter((f) => (notes[f.id] ?? '').trim() !== '');
    return base;
  }, [query, filter, favorites, notes]);

  // 英語は語が長い(Slightly warming / Vegetables)。1行に名前と並べると窮屈なので、
  // 名前の下にまとめて置く。日本語は2文字で収まるので右端に列で出したままにする。
  const stackMeta = lang === 'en';

  const filters: { key: ZukanFilter; label: string }[] = [
    { key: 'all', label: t.notebook.filterAll },
    { key: 'starred', label: t.notebook.filterStarred },
    { key: 'memo', label: t.notebook.filterMemo },
  ];

  return (
    <View style={styles.zukan}>
      <TextInput
        style={[styles.search, { backgroundColor: c.backgroundElement, color: c.text }]}
        placeholder={t.notebook.zukanPlaceholder(VISIBLE_FOODS.length)}
        placeholderTextColor={c.textSecondary}
        value={query}
        onChangeText={setQuery}
        onFocus={() => feedback.search()}
      />
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filter === f.key ? '#8FAF8B' : c.backgroundElement,
              },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={{ color: filter === f.key ? '#fff' : c.text, fontSize: 13 }}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={foods}
        keyExtractor={(f) => f.id}
        ListEmptyComponent={
          filter !== 'all' && query.trim() === '' ? (
            <Text style={[styles.emptyText, styles.filterEmpty, { color: c.textSecondary }]}>
              {t.notebook.filterEmpty}
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const refOnly = isReferenceOnly(item);
          const memo = (notes[item.id] ?? '').trim();
          const meta = [
            item.nature !== '' ? natureLabel(item.nature, lang) : '',
            cat15Label(item.cat15, lang),
          ].filter((part) => part !== '');
          return (
            <Pressable
              style={styles.zukanRow}
              onPress={() => router.push(`/food/${item.id}`)}
              onLongPress={() => toggleFavorite(item.id).then(onChange)}
            >
              <FoodThumb
                name={foodName(item, lang)}
                icon={item.icon}
                catIcon={item.catIcon}
                color={natureColor(refOnly ? null : natureValue(item))}
              />
              <View style={styles.zukanName}>
                <Text style={{ color: refOnly ? c.textSecondary : c.text, fontSize: 15 }}>
                  {favorites.includes(item.id) ? '★ ' : ''}
                  {foodName(item, lang)}
                  {memo !== '' ? ' ✎' : ''}
                </Text>
                {stackMeta && meta.length > 0 && (
                  <Text
                    style={[styles.zukanMeta, { color: c.textSecondary }]}
                    numberOfLines={1}
                  >
                    {meta.join(' · ')}
                  </Text>
                )}
                {filter === 'memo' && memo !== '' && (
                  <Text
                    style={[styles.zukanMemo, { color: c.textSecondary }]}
                    numberOfLines={1}
                  >
                    {memo}
                  </Text>
                )}
              </View>
              {!stackMeta && item.nature !== '' && (
                <Text style={[styles.zukanNature, { color: c.textSecondary }]}>
                  {natureLabel(item.nature, lang)}
                </Text>
              )}
              {!stackMeta && (
                <Text style={[styles.zukanCat, { color: c.textSecondary }]}>
                  {cat15Label(item.cat15, lang)}
                </Text>
              )}
              <Text style={{ color: c.textSecondary }}>›</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

/* ---------------- 解説 ---------------- */

function GuideSection() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const g = getStrings(lang).guide;

  return (
    <ScrollView contentContainerStyle={styles.guide}>
      <GuideCard title={g.fivePhasesTitle} color={c}>
        <View style={styles.table}>
          {g.fivePhasesTable.map((row, ri) => (
            <View key={ri} style={styles.tableRow}>
              {row.map((cell, ci) => (
                <Text
                  key={ci}
                  style={[
                    styles.tableCell,
                    // 英語は Blue-green / Long summer が入るので一段細かく
                    lang === 'en' && styles.tableCellEn,
                    { color: ri === 0 ? c.textSecondary : c.text },
                    ri === 0 && styles.tableHeader,
                  ]}
                >
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
        <Text style={[styles.guideText, { color: c.textSecondary }]}>
          {g.meridianNote}
        </Text>
      </GuideCard>

      <GuideCard title={g.flavorWorksTitle} color={c}>
        {g.flavorNotes.map(([flavor, note]) => (
          <View key={flavor} style={styles.flavorRow}>
            <Text
              style={[
                styles.flavorLabel,
                { color: c.text, width: lang === 'ja' ? 20 : 64 },
              ]}
            >
              {flavor}
            </Text>
            <Text style={[styles.flavorNote, { color: c.text }]}>{note}</Text>
          </View>
        ))}
        <Text style={[styles.guideText, { color: c.textSecondary }]}>
          {g.flavorCaveat}
        </Text>
      </GuideCard>

      <GuideCard title={g.organsTitle} color={c}>
        <Text style={[styles.guideText, { color: c.text }]}>{g.organsBody}</Text>
      </GuideCard>

      <GuideCard title={g.seasonsTitle} color={c}>
        <Text style={[styles.guideText, { color: c.text }]}>{g.seasonsBody1}</Text>
        <Text style={[styles.guideText, { color: c.textSecondary }]}>{g.seasonsBody2}</Text>
      </GuideCard>

      <GuideCard title={g.conventionsTitle} color={c}>
        <Text style={[styles.guideText, { color: c.text }]}>{g.conventionsBody}</Text>
      </GuideCard>

      <GuideCard title={g.positionTitle} color={c}>
        <Text style={[styles.guideText, { color: c.text }]}>{g.positionBody}</Text>
      </GuideCard>
    </ScrollView>
  );
}

function GuideCard({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: { text: string; textSecondary: string; backgroundElement: string };
}) {
  return (
    <View style={[styles.card, { backgroundColor: color.backgroundElement }]}>
      <Text style={[styles.guideTitle, { color: color.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  segment: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  empty: { flex: 1, justifyContent: 'center', padding: 32 },
  emptyText: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  list: { padding: 16, gap: 12 },
  dateHeading: { fontSize: 12, marginTop: 8, marginBottom: 2 },
  card: { borderRadius: 12, padding: 16, gap: 4, marginBottom: 10 },
  // userSelect: Webのダブルタップで文字が範囲選択されるのを防ぐ(ネイティブでは無視される)
  comboName: { fontSize: 16, fontWeight: '600', userSelect: 'none' },
  comboNameInput: {
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  comboActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  comboFoods: { fontSize: 14, marginTop: 4, lineHeight: 20, userSelect: 'none' },
  comboMemoPreview: { fontSize: 13, marginTop: 6, lineHeight: 19, userSelect: 'none' },
  comboDetail: { marginTop: 10, gap: 10 },
  comboMemoInput: {
    fontSize: 14,
    lineHeight: 21,
    minHeight: 72,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  comboAction: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  combos: { flex: 1 },
  zukan: { flex: 1 },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterEmpty: { paddingHorizontal: 32, paddingTop: 32 },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  zukanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  zukanName: { flex: 1, gap: 2 },
  zukanMeta: { fontSize: 12 },
  zukanMemo: { fontSize: 12 },
  zukanNature: { fontSize: 12 },
  zukanCat: { fontSize: 11 },
  guide: { padding: 16, gap: 12 },
  guideTitle: { fontSize: 12, marginBottom: 4 },
  guideText: { fontSize: 14, lineHeight: 22 },
  table: { gap: 2, marginBottom: 8 },
  tableRow: { flexDirection: 'row' },
  tableCell: { flex: 1, textAlign: 'center', fontSize: 14, lineHeight: 24 },
  tableCellEn: { fontSize: 12, lineHeight: 18, paddingHorizontal: 2 },
  tableHeader: { fontSize: 11 },
  flavorRow: { flexDirection: 'row', gap: 12, marginBottom: 2 },
  flavorLabel: { fontSize: 14, lineHeight: 21, fontWeight: '600' },
  flavorNote: { fontSize: 14, flex: 1, lineHeight: 21 },
});
