/**
 * 図鑑データの照合用一覧を生成する。
 *
 *   node scripts/foods-review.mjs  →  docs/foods-review.md
 *
 * src/data/tabenote_foods.json(アプリ同梱の本番データ)を、出典書籍の掲載順
 * (page 昇順 = データの並び順)のまま分類ごとの表にする。本を開きながら
 * 上から順に照合するためのもの。データを直したら再生成する。
 *
 * 画面に出さない caution も載せる(出典との対応を確認する用途なので)。
 * アプリには同梱されない docs/ 配下にのみ出力する。
 */
import { readFileSync, writeFileSync } from 'node:fs';

const foods = JSON.parse(readFileSync('src/data/tabenote_foods.json', 'utf8'));

const CAT15_LABELS = {
  kokurui: '穀類', mame: '豆', imo: 'いも', shujitsu: '種実', yasai: '野菜',
  kajitsu: '果実', gyokai: '魚介', niku: '肉', tamago: '卵', nyuu: '乳',
  yushi: '油脂', satou: '砂糖', choumi: '調味料', inryou: '飲料', alcohol: '酒',
};
const CAT5_LABELS = {
  grain: '穀類・豆', veg: '野菜', fruit: '果実', protein: '肉・魚', season: '調味料・飲み物',
};

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const cell = (s) => (s ? esc(s) : '');

/* ---- 集計(目視で引っかかりやすい箇所を先頭にまとめる) ---- */
const count = (arr) => arr.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map());
const natureCount = count(foods.map((f) => f.nature || '(空)'));
const flavorCount = count(foods.flatMap((f) => f.flavors));
const nameCount = count(foods.map((f) => f.name));

const referenceOnly = foods.filter((f) => f.nature === '');
const hidden = foods.filter((f) => f.visible === false);
const dupNames = [...nameCount].filter(([, c]) => c > 1).map(([n]) => n);
// 参照のみ以外で味・帰経が欠けているもの(あれば入力漏れ)
const noFlavor = foods.filter((f) => f.nature !== '' && f.flavors.length === 0);
const noMeridian = foods.filter((f) => f.nature !== '' && !f.meridians);
const multiFlavor = foods.filter((f) => f.flavors.length >= 3);
const hot = foods.filter((f) => f.nature === '熱');
// 全体で3件以下しか使われていない値。表記ゆれ・入力ミスを疑う
const rareNature = [...natureCount].filter(([k, c]) => k !== '(空)' && c <= 3);
const rareFlavor = [...flavorCount].filter(([, c]) => c <= 3);

const fmtList = (xs) =>
  xs.length === 0 ? 'なし' : xs.map((f) => `${f.name}(p.${f.page})`).join('、');
const withValue = (pairs, pick) =>
  pairs.length === 0
    ? 'なし'
    : pairs.map(([k]) => `**${k}**: ${fmtList(foods.filter((f) => pick(f).includes(k)))}`).join('<br>');

let out = `# 図鑑データ 照合一覧

出典書籍の掲載順(頁の昇順)で、分類ごとに並べています。本を開きながら上から順に照合してください。
生成元は \`src/data/tabenote_foods.json\`(アプリで実際に使うデータ)。直したら \`node scripts/foods-review.mjs\` で再生成します。

- 全 ${foods.length} 件、頁 ${Math.min(...foods.map((f) => +f.page))}〜${Math.max(...foods.map((f) => +f.page))}
- **備考** 列はアプリの画面には出しません(出典との対応を確認する用途でのみ載せています)
- **✓** 列は照合済みの印に使ってください(空欄のまま生成されます)

## まず見るところ

| 項目 | 内容 |
|---|---|
| 参照のみ(性・味・帰経が空、選択不可) ${referenceOnly.length}件 | ${fmtList(referenceOnly)} |
| 非表示(一覧・検索から除外) ${hidden.length}件 | ${fmtList(hidden)} |
| 同名が2件ある | ${dupNames.length ? dupNames.map((n) => `${n}(${foods.filter((f) => f.name === n).map((f) => `${CAT15_LABELS[f.cat15]} p.${f.page}`).join(' / ')})`).join('、') : 'なし'} |
| 参照のみ以外で味が空 | ${fmtList(noFlavor)} |
| 参照のみ以外で帰経が空 | ${fmtList(noMeridian)} |
| 3件以下しかない性(表記ゆれの可能性) | ${withValue(rareNature, (f) => [f.nature])} |
| 3件以下しかない味(表記ゆれの可能性) | ${withValue(rareFlavor, (f) => f.flavors)} |
| 熱 ${hot.length}件 | ${fmtList(hot)} |
| 味が3つ以上 ${multiFlavor.length}件 | ${fmtList(multiFlavor)} |

### 性の内訳

| 性 | 件数 |
|---|---|
${['熱', '温', '微温', '平', '涼', '微涼', '寒', '微寒', '(空)'].map((k) => `| ${k} | ${natureCount.get(k) ?? 0} |`).join('\n')}

### 味の内訳(のべ)

| 味 | 件数 |
|---|---|
${[...flavorCount].sort((a, b) => b[1] - a[1]).map(([k, c]) => `| ${k} | ${c} |`).join('\n')}

### 分類の内訳

| 分類(15) | 5分類 | 件数 | 頁 |
|---|---|---|---|
${Object.keys(CAT15_LABELS).map((c) => {
  const xs = foods.filter((f) => f.cat15 === c);
  const pages = xs.map((f) => +f.page);
  return `| ${CAT15_LABELS[c]} | ${CAT5_LABELS[xs[0]?.cat5] ?? ''} | ${xs.length} | p.${Math.min(...pages)}〜${Math.max(...pages)} |`;
}).join('\n')}

---
`;

/* ---- 本体: 分類ごとの表(データの並び順 = 掲載順) ---- */
let n = 0;
for (const cat of Object.keys(CAT15_LABELS)) {
  const xs = foods.filter((f) => f.cat15 === cat);
  if (xs.length === 0) continue;
  out += `\n## ${CAT15_LABELS[cat]}(${xs.length}件、p.${xs[0].page}〜${xs[xs.length - 1].page})\n\n`;
  out += '| # | 頁 | 名前 | 別名・漢字 | 性 | 味 | 帰経 | 安全上の注意 | 備考(非表示) | ✓ |\n';
  out += '|---:|---:|---|---|:-:|---|---|---|---|:-:|\n';
  for (const f of xs) {
    n += 1;
    const flags = [];
    if (f.visible === false) flags.push('非表示');
    if (f.nature === '') flags.push('参照のみ');
    const name = flags.length ? `${esc(f.name)} *(${flags.join('・')})*` : esc(f.name);
    out += `| ${n} | ${f.page} | ${name} | ${cell(f.note)} | ${f.nature || '—'} | ${f.flavors.join('・') || '—'} | ${cell(f.meridians) || '—'} | ${cell(f.safety)} | ${cell(f.caution)} |  |\n`;
  }
}

writeFileSync('docs/foods-review.md', out);
console.log(`docs/foods-review.md: ${n} 件`);
