# Play ストア掲載情報 — English (en-US) 完成版

デフォルト言語（en-US）の「メインのストアの掲載情報」にそのまま貼る確定テキスト。
手順の全体は [play-release.md](./play-release.md) Step 3、日本語ローカライズも同 Step 3 を参照。
iOS 版（素材A）との違い: **Apple / EULA の記述を Google Play 版に差し替え済み**。

## アプリ名（27 / 30）

```
tabenote — Ingredient Notes
```

## 簡単な説明（68 / 80）

```
Pair ingredients by flavor and season, the way a seasoned chef does.
```

## 詳しい説明（2110 / 4000）

```
tabenote is a journal for choosing ingredients the way a seasoned chef does — by season, by the balance of flavors, by the character of each food — and for writing down what you notice, in your own words.

Choose ingredients and the app shows you the composition of the combination: the five flavors on a pentagon chart, thermal nature, categories, and how it relates to the current season. The classifications come from a system refined over centuries in East Asian kitchens. The app never shows efficacy or symptoms. It presents traditional classification data as fact — the interpretation belongs to you.

FEATURES
- Food encyclopedia (435 items): thermal nature (hot / warm / neutral / cool / cold), five flavors, meridian tropism, and category
- Combine: pick ingredients and watch the five-flavor balance take shape on a pentagon chart
- Solar terms: a note on the current term of the traditional calendar, and the flavor profile each season favors
- Advice: a factual reading of what your combination contains and what it lacks
- AI meal ideas: directions for a menu based on your chosen ingredients and the season
- Journal: save combinations, keep notes on each ingredient, star your favorites
- Japanese / English, dark mode

WHAT WE CARE ABOUT
- No efficacy claims, no symptoms, no diagnoses, no scores
- The app states classifications; the interpretation and the notes are yours
- No account needed — your journal lives entirely on your device

SUBSCRIPTION
All features require the "tabenote Monthly Plan", an auto-renewable monthly subscription.
- Price: $9.99/month (the price in your local currency is shown on the purchase screen)
- Payment is charged to your Google Play account. The subscription renews automatically unless cancelled at least 24 hours before the end of the current period
- You can manage or cancel anytime in Google Play → Payments & subscriptions → Subscriptions

Terms of Use: https://tabenote.app/terms
Privacy Policy: https://tabenote.app/privacy

This app does not promise medical or health benefits. If you have health concerns, please consult a medical professional.
```

## そのほかの欄

| 欄 | 入力値 |
|---|---|
| アプリのカテゴリ | フード&ドリンク |
| タグ（最大5個） | 任意。付けるなら Cooking / Recipes 系 |
| メールアドレス（必須） | 開発者連絡先メール |
| ウェブサイト | `https://tabenote.app` |
| 電話番号 | 任意（空欄可） |
| 外部マーケティング | 「アプリの外部でマーケティングを行わない」でよい |

## グラフィック

| 素材 | 仕様 | 用意したもの |
|---|---|---|
| アプリアイコン | 512×512 PNG（32bit・角丸なし） | `docs/play-assets/icon-512.png` |
| フィーチャー グラフィック | 1024×500 PNG | `docs/play-assets/feature-graphic-light-1024x500.png`（**推奨**・アイコンと同じクリーム系）<br>`docs/play-assets/feature-graphic-1024x500.png`（ダーク版・og.png 寄り） |
| スマホのスクリーンショット | 2〜8枚 / 各辺 320〜3840px | **未作成**（下記） |

アイコンは `assets/images/icon.png`(1024²)からの縮小。フィーチャーグラフィックは同ディレクトリの
`.svg` が原本（書体は node_modules の Lexend。アプリ本体と同じ書体）。文言・色を直したら再書き出し:

```sh
# Lexend を fontconfig に見せるための設定を一度だけ作る
mkdir -p ~/.local/share/fonts && cp node_modules/@expo-google-fonts/lexend/{400Regular/Lexend_400Regular,500Medium/Lexend_500Medium,700Bold/Lexend_700Bold}.ttf ~/.local/share/fonts/
cat > /tmp/fonts.conf <<'XML'
<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>
<dir>/usr/share/fonts</dir><dir>$HOME/.local/share/fonts</dir><cachedir>$HOME/.cache/fontconfig</cachedir>
</fontconfig>
XML

# rsvg-convert が PATH に無い環境では nix store の実体を直接呼ぶ
FONTCONFIG_FILE=/tmp/fonts.conf rsvg-convert -w 1024 -h 500 \
  -o docs/play-assets/feature-graphic-light-1024x500.png docs/play-assets/feature-graphic-light.svg
```

**スクリーンショットは英語UIでの撮影が必要（必須項目・最低2枚）。**
`design-review/en-*.png` は 780×1688 の Web キャプチャで下半分が余白のためストア用には向かない。
iOS 用に撮る 6.9インチ（1320×2868）セットをそのまま流用するのが早い。
候補の5画面: Home / Combine（五角形が出た状態）/ Food detail / Advice / Notebook。

## リリースノート（en-US）

Play Console のリリースノートは **1言語 500文字まで**（`<en-US>` タグは字数に含まない）。
Play Console 上で貼るときはタグ不要（言語ごとの入力欄がある）。EAS submit の
`--metadata` や `whatsnew/` を使う場合のみ `whatsnew-en-US` ファイルに本文だけを入れる。

### クローズドテスト用（[play-release.md](./play-release.md) Step 6-3）（176 / 500）

```
Initial closed test build. Everything is here: the food encyclopedia, pairing, solar terms, AI meal ideas, and the journal. Please tell us anything that reads oddly in English.
```

### 本番 1.0.0 用（[play-release.md](./play-release.md) Step 11）（473 / 500）

```
First release.

Choose ingredients the way a seasoned chef does — by season, and by the balance of flavors.

- 435 foods: thermal nature, five flavors, meridian tropism, category
- Combine ingredients and watch the balance take shape on a pentagon chart
- A note on the current solar term, and the flavors each season favors
- AI meal ideas from your ingredients and the season
- Save combinations, write your own notes, star what you keep
- Japanese / English, dark mode
```

効能・症状に触れない・スコアを出さないという掲載情報の方針をリリースノートでも守ること
（「helps with」「good for」「boosts」等は使わない）。

App Store Connect の「このバージョンの新機能」は **1.0.0 では入力欄が出ない**（初回リリースのため）。
1.0.1 以降で必要になったら、上の本文をそのまま流用できる（ASC は4000文字まで）。
