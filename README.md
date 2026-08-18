# tabenote

モバイル薬膳手帳 × 格闘ゲーム感覚で選ぶUX。

食材を選ぶと、その組み合わせが中医学的にどういう構成なのか(五味・性・分類・季節との関係)を図と言葉で示す。効能はアプリが書かず、持ち主が書く。詳細は [docs/design_doc_rev4.md](docs/design_doc_rev4.md) を参照。

## 技術構成

- [Expo](https://expo.dev) SDK 57 / expo-router(4タブ + モーダル)。iOS が主、Web は公開サイトを兼ねる
- データ: 参照データは `src/data/tabenote_foods.json`(読み取り専用)、ユーザーデータは AsyncStorage
- 課金: RevenueCat(`react-native-purchases`)。**月額プラン1本の全機能有料**(未購読の間は
  オンボーディング→購読案内がタブを覆う)。UI文言に「プレミアム/PRO/アップグレード」は使わない
- 表示言語: 日本語 / 英語(`src/i18n`)。既定は日本語で、選択は AsyncStorage に残す。
  ただし参照データの食材名は日本語のみ(英語名は `src/data/foodNamesEn.ts` の別立て)
- 手応え: 効果音(expo-audio)と触覚(expo-haptics)。どちらも設定画面から強さを変えられる
- AI献立提案: アプリはAPIキーを持たず、`workers/ai-proxy`(Cloudflare Worker)を経由する
- テスト: Vitest(ロジック層・ストレージ層)

## コマンド

```bash
npm install        # 依存のインストール
npx expo start     # 開発サーバー
npm test           # テスト(TZ=Asia/Tokyo で実行される。節気の期待値がJST前提のため)
npm run lint       # ESLint
npm run build:web  # 公開サイトの静的書き出し(dist)。postbuild-web.js が検証と sitemap まで行う
npx tsc --noEmit   # 型チェック
```

## 課金(RevenueCat)

公開APIキーとAI中継サーバーのURLを `.env.local` に置く(`.env.example` を参照)。
キー未設定の間は課金機能が丸ごと無効になり、起動時の購読ゲートも掛からない(開発中はこれで
全画面を確認できる)。Web でも同じく無効。

実際の購入には開発ビルドが必要。Expo Go では SDK が Preview API Mode(ネイティブ呼び出しを
JSのモックに差し替える)で動くため、画面遷移までは確認できるが購入はできない。

```bash
npx expo run:ios                          # ローカルの開発ビルド
eas build --profile development -p ios    # EAS の開発ビルド
```

ダッシュボード側で必要なもの: entitlement `pro`(内部識別子。UIには出さない)、
月額商品 `tabenote.premium.monthly` を紐付けた Offering(`current` に設定)。
識別子は `src/lib/billing.ts` の `ENTITLEMENT_ID` と対応する。

## 公開サイト(tabenote.app)

法務ページ(サポート / プライバシーポリシー / 利用規約 / 特商法表記)は `public/` の
静的HTMLで、`npm run build:web` で `dist` の直下に出て `tabenote.app` から配信される。
購読ゲートの外に置くため、あえて expo-router の画面にしていない。
URLの定義は `src/constants/site.ts` の1箇所。

紹介ページ(`/about`)だけは expo-router の画面で、ランディングと App Store Connect の
マーケティングURLを兼ねる。ネイティブでは設定画面から開ける。

## 効果音

`assets/sfx/*.wav` は手書きの波形で、`scripts/gen-sfx.js` が生成する。差し替えるときは
スクリプトを直して作り直す(音の設計と対応は `src/lib/sfx.ts` の冒頭にある)。

```bash
node ./scripts/gen-sfx.js            # 採用中のものを assets/sfx/ へ
```

## リリース前に

提出のたびに [docs/release-checklist.md](docs/release-checklist.md) を上から確認する。
特に **AI中継サーバーの `REVENUECAT_API_KEY`** は、未設定だと購読チェックが丸ごと
スキップされ、エンドポイントが誰でも叩ける状態のまま出てしまう。

App Store Connect に入れる説明文・キーワードのドラフトは
[docs/asc-metadata.md](docs/asc-metadata.md) にある。

## ディレクトリ

```
src/
  app/            画面(expo-router)
    (tabs)/       ホーム / 組み合わせ / 手帳 / 設定
    advice.tsx    アドバイス(モーダル)
    paywall.tsx   購読案内(モーダル)
    about.tsx     紹介ページ(公開サイトのランディングを兼ねる)
    food/[id].tsx 食材の詳細(図鑑の個票)
  components/     五角形チャート・節気の背景・食材タイルなど
  constants/      配色とサイズ・公開サイトのURL
  data/           参照データと読み込み層・節気テキスト
  hooks/          配色と文字サイズの参照・組み合わせ画面の手応え
  i18n/           日英の文言と用語(参照データの訳語を含む)
  logic/          判定ロジック(五味・性・節気・五季・網羅性・候補提案)
  lib/            ユーザーデータの保存層・課金(RevenueCat)・効果音・触覚・AI中継の呼び出し
assets/           アイコンと効果音(ここに置くのはアプリが実際に使うものだけ)
public/           法務ページの静的HTMLと og.png(dist の直下に配られる)
scripts/          効果音の生成・web書き出しの後始末
workers/ai-proxy/ AI献立提案の中継(Cloudflare Worker)
docs/             設計書・節気テキストの原本・申請用の素材
```

## 守っていること(設計書 2章・9章)

- 効能・症状・病名を扱わない。点数も出さない
- アプリが表示するのは性・味・帰経・分類の事実データまで。解釈はユーザーが書く
- 参照データにアプリから書き込まない。ユーザーデータと完全に分離する
- `docs/master/` のマスターデータは許諾待ちの凍結保管。アプリに再同梱しない
