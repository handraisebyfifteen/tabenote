# tabenote

モバイル薬膳手帳 × 格闘ゲーム感覚で選ぶUX。

食材を選ぶと、その組み合わせが中医学的にどういう構成なのか(五味・性・分類・季節との関係)を図と言葉で示す。効能はアプリが書かず、持ち主が書く。詳細は [docs/design_doc_rev4.md](docs/design_doc_rev4.md) を参照。

## 技術構成

- [Expo](https://expo.dev) SDK 57 / expo-router(4タブ + モーダル)
- データ: 参照データは `src/data/tabenote_foods.json`(読み取り専用)、ユーザーデータは AsyncStorage
- テスト: Vitest(ロジック層・ストレージ層)

## コマンド

```bash
npm install        # 依存のインストール
npx expo start     # 開発サーバー
npm test           # テスト(TZ=Asia/Tokyo で実行される。節気の期待値がJST前提のため)
npx tsc --noEmit   # 型チェック
```

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
  lib/            ユーザーデータの保存層
docs/             設計書・節気テキストの原本
```

## 守っていること(設計書 2章・9章)

- 効能・症状・病名を扱わない。点数も出さない
- アプリが表示するのは性・味・帰経・分類の事実データまで。解釈はユーザーが書く
- 参照データにアプリから書き込まない。ユーザーデータと完全に分離する
