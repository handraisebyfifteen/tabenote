# tabenote

モバイル薬膳手帳 × 格闘ゲーム感覚で選ぶUX。

食材を選ぶと、その組み合わせが中医学的にどういう構成なのか(五味・性・分類・季節との関係)を図と言葉で示す。効能はアプリが書かず、持ち主が書く。詳細は [docs/design_doc_rev4.md](docs/design_doc_rev4.md) を参照。

## 技術構成

- [Expo](https://expo.dev) SDK 57 / expo-router(4タブ + モーダル)
- データ: 参照データは `src/data/tabenote_foods.json`(読み取り専用)、ユーザーデータは AsyncStorage
- 課金: RevenueCat(`react-native-purchases`)。**月額プラン1本の全機能有料**(未購読の間は
  オンボーディング→購読案内がタブを覆う)。UI文言に「プレミアム/PRO/アップグレード」は使わない
- テスト: Vitest(ロジック層・ストレージ層)

## コマンド

```bash
npm install        # 依存のインストール
npx expo start     # 開発サーバー
npm test           # テスト(TZ=Asia/Tokyo で実行される。節気の期待値がJST前提のため)
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
法務ページのURLは `src/constants/site.ts` の1箇所にまとまっている(tabenote-legal リポジトリ)。

## ディレクトリ

```
src/
  app/            画面(expo-router)
    (tabs)/       ホーム / 組み合わせ / 手帳 / 設定
    advice.tsx    アドバイス(モーダル)
    food/[id].tsx 食材の詳細(図鑑の個票)
  components/     五角形チャートなど
  data/           参照データと読み込み層・節気テキスト
  logic/          判定ロジック(五味・性・節気・五季・網羅性・候補提案)
  lib/            ユーザーデータの保存層・課金(RevenueCat)・AI中継の呼び出し
docs/             設計書・節気テキストの原本
```

## 守っていること(設計書 2章・9章)

- 効能・症状・病名を扱わない。点数も出さない
- アプリが表示するのは性・味・帰経・分類の事実データまで。解釈はユーザーが書く
- 参照データにアプリから書き込まない。ユーザーデータと完全に分離する
