#!/usr/bin/env node
/**
 * 静的書き出しの後始末(公開サイト tabenote.app 用)。
 *
 * Web版アプリは提供せず、ルートのモバイル版案内と法務ページだけを公開する。
 *
 *   1. 配信したくない書き出しを削る
 *   2. 残ったHTMLを検証する
 *   3. 公開されるJSに図鑑データが混ざっていないか検査する
 *   4. sitemap.xml を作る
 *
 * URL はファイルパスからではなく、各HTMLの <link rel="canonical"> から取る。
 * パスから組み立てると除外ルールを何種類も抱え込むことになり、
 * expo の出力命名が変わったときに黙って壊れる。canonical を唯一の出所にする。
 *
 * 検証に1つでも失敗したら sitemap.xml を書かずに落とす。
 * 取りこぼした sitemap を黙って公開するほうが、ビルドが落ちるより悪いため。
 *
 * expo export は出力先を毎回まるごと消してから書く(exportAsync.js の removeAsync)。
 * よって古い sitemap がここに残ることは原理的にない。
 *
 * 使い方: node ./scripts/postbuild-web.js <出力ディレクトリ>
 */
const fs = require('fs');
const path = require('path');

/** sitemap 1ファイルあたりの上限(sitemaps.org) */
const MAX_URLS = 50000;

/**
 * Expo Router はネイティブ用画面もHTMLに書き出すが、Webではアプリ本体を
 * 提供しないため、ルート以外のアプリ画面をすべて削除する。
 * public/ の法務ページはこの一覧に含めず、そのまま公開する。
 */
const PRUNE = [
  '(tabs)',
  'food',
  '+not-found.html',
  'about.html',
  'advice.html',
  'combine.html',
  'licenses.html',
  'notebook.html',
  'paywall.html',
  'settings.html',
];

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(ROOT, process.argv[2] ?? 'dist');

/** サイトURLの定義元は src/constants/site.ts の1箇所だけ。読めなければ落とす */
function readSiteUrl() {
  const file = path.join(ROOT, 'src/constants/site.ts');
  const m = fs.readFileSync(file, 'utf8').match(/export const SITE_URL = '([^']+)'/);
  if (m === null) {
    throw new Error(`SITE_URL を ${file} から読めなかった(定義の書式が変わった?)`);
  }
  return m[1].replace(/\/$/, '');
}

function htmlFiles(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...htmlFiles(full));
    else if (entry.name.endsWith('.html')) found.push(full);
  }
  return found;
}

/** 出力ディレクトリ上のファイル → 実際に配信されるURLのパス */
function servedPath(file) {
  const rel = path
    .relative(OUT_DIR, file)
    .split(path.sep)
    .join('/')
    .replace(/\.html$/, '');
  return rel === 'index' ? '/' : `/${rel}`;
}

function canonicalOf(html) {
  const m = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
  return m === null ? null : m[1];
}

/**
 * 公開サイトのJSに入っていてはいけないもの。
 * Web ではアプリ本体を src/screens の .web.tsx で差し替えて外している。誰かが
 * RootLayout.web.tsx や DownloadScreen から src/data を import すると、画面には
 * 出ないまま図鑑の全件が誰でも落とせるJSに入る。見た目では気づけないのでここで止める。
 *
 * 'meridians' は図鑑JSONのフィールド名、食材名は実データの一例。
 * Metro は非ASCIIを \uXXXX に落とすことがあるので、戻してから探す。
 */
const FORBIDDEN_IN_JS = ['meridians', 'ほうれんそう'];

function jsFiles(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...jsFiles(full));
    else if (entry.name.endsWith('.js')) found.push(full);
  }
  return found;
}

function leakedData() {
  const leaks = [];
  for (const file of jsFiles(OUT_DIR)) {
    const text = fs
      .readFileSync(file, 'utf8')
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    const hits = FORBIDDEN_IN_JS.filter((needle) => text.includes(needle));
    if (hits.length > 0) leaks.push(`${path.relative(OUT_DIR, file)}(${hits.join(', ')})`);
  }
  return leaks;
}

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    throw new Error(`出力ディレクトリが無い: ${OUT_DIR}(先に expo export を走らせること)`);
  }
  const siteUrl = readSiteUrl();

  // 1. 間引き。将来 expo が出さなくなっても落ちないよう force で消す
  const pruned = [];
  for (const rel of PRUNE) {
    const target = path.join(OUT_DIR, rel);
    if (!fs.existsSync(target)) continue;
    fs.rmSync(target, { recursive: true, force: true });
    pruned.push(rel);
  }

  // 2. 検証。canonical が無い、または自分以外を指すページが残っていたら落とす。
  //    新しい画面が PageHead を付け忘れたらここで気づける
  const urls = new Set();
  const noCanonical = [];
  const mismatched = [];
  for (const file of htmlFiles(OUT_DIR)) {
    const rel = path.relative(OUT_DIR, file);
    const canonical = canonicalOf(fs.readFileSync(file, 'utf8'));
    if (canonical === null) {
      noCanonical.push(rel);
      continue;
    }
    const own = siteUrl + servedPath(file);
    if (canonical !== own) {
      mismatched.push(`${rel}(canonical=${canonical} / 配信=${own})`);
      continue;
    }
    urls.add(canonical);
  }
  if (noCanonical.length > 0) {
    throw new Error(
      `canonical の無いHTMLが残っている: ${noCanonical.join(', ')}\n` +
        'PageHead を付けるか、上の PRUNE に足すこと',
    );
  }
  if (mismatched.length > 0) {
    throw new Error(`canonical が自分の配信URLと食い違う: ${mismatched.join(' / ')}`);
  }

  const leaks = leakedData();
  if (leaks.length > 0) {
    throw new Error(
      `公開されるJSに図鑑データが入っている: ${leaks.join(' / ')}\n` +
        'Web用の入口(src/screens の .web.tsx と DownloadScreen。src/screens/README.md)から src/data に届く import を外すこと',
    );
  }

  const list = [...urls].sort();
  if (list.length > MAX_URLS) {
    throw new Error(`URLが ${list.length} 件で上限 ${MAX_URLS} を超えた(分割が必要)`);
  }

  // 4. 生成。lastmod / changefreq / priority は入れない。
  //    changefreq と priority は Google が無視する。lastmod に一律のビルド日を入れると
  //    「全ページが毎回更新された」と嘘をつくことになり、信用されないだけ得が無い。
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    list.map((u) => `  <url><loc>${escapeXml(u)}</loc></url>`).join('\n') +
    '\n</urlset>\n';
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), xml);

  console.log(`間引き: ${pruned.length > 0 ? pruned.join(', ') : 'なし'}`);
  console.log(`sitemap.xml: ${list.length} URL(モバイル版案内と法務ページのみ)`);
}

main();
