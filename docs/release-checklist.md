# リリースチェックリスト(App Store 提出前)

提出のたびに上から順に確認する。**「⚠️」が付いた項目は、忘れると事故になる。**

## 1. AI中継サーバー(workers/ai-proxy)

- [ ] **⚠️ `REVENUECAT_API_KEY` が Worker に設定されている**

      `workers/ai-proxy/src/index.ts` の購読確認は、このシークレットが**未設定だと
      チェックをスキップして全員を通す**(開発中に課金なしで動かすための仕様)。
      本番でこれを忘れると、URLを知っている誰もが `ANTHROPIC_API_KEY` 経由で
      Claude を叩ける状態になる。課金はこちら持ち。

      ```sh
      cd workers/ai-proxy
      npx wrangler secret list        # ANTHROPIC_API_KEY と REVENUECAT_API_KEY の2つが出ること
      ```

      設定するとき(RevenueCat → API keys → **+ New secret API key**、**権限を絞らない**もの。
      権限制限付きのキーは v2 API 専用で、Worker が使う v1 には 401 で弾かれる):

      ```sh
      npx wrangler secret put REVENUECAT_API_KEY
      ```

- [ ] **⚠️ ゲートが実際に効いていることを確認する**(設定しただけで満足しない)

      ```sh
      # 認証なし → 402 subscription_required が返ること
      curl -s -o /dev/null -w '%{http_code}\n' -X POST \
        https://tabenote-ai.hiro-miyaji.workers.dev/suggest \
        -H 'content-type: application/json' \
        -d '{"foods":["しょうが"],"season":"夏"}'
      ```

      402 以外(特に 200)が返ったら、そのまま出さない。
      通る側の確認は、RevenueCat の customer に promotional entitlement `pro` を
      「A day」で付与し、その app_user_id を `Authorization: Bearer <id>` で送って 200 になること。

- [ ] `ANTHROPIC_API_KEY` の有効期限が切れていない
      (Anthropic Console で期限付きにしていると、その日から全員 502 になる)
- [ ] Anthropic Console の Workspace に**支出上限**を設定してある
- [ ] `wrangler.toml` に `compatibility_flags = ["nodejs_compat"]` がある
      (`@anthropic-ai/sdk` が `node:fs` / `node:path` を参照するため。無いと実行時に落ちる)
- [ ] `npx wrangler deploy` 済みで、最新のコードが乗っている

## 2. アプリの環境変数

`.env.local` はローカル開発用。**ビルドする環境(EAS / Replit)には別途設定が要る。**

- [ ] `EXPO_PUBLIC_AI_PROXY_URL` = `https://tabenote-ai.hiro-miyaji.workers.dev`
      未設定だとアドバイス画面にAI欄が出ない。サブスクで解放される機能なので、
      無いまま提出すると審査で問題になる
- [ ] `EXPO_PUBLIC_RC_IOS_KEY`(RevenueCat の **Public** app-specific API key)
      未設定だと課金機能が丸ごと無効になり、購読ゲートも出ない
- [ ] Web版を公開する場合、Replit 側の環境変数にも同じ値を入れてある
      (Expo の `EXPO_PUBLIC_*` は**ビルド時**に埋め込まれる。後から差し替えられない)

## 3. RevenueCat ダッシュボード

- [ ] entitlement `pro` がある(識別子。UIには出さない)
- [ ] 月額商品 `tabenote.premium.monthly` が `pro` に紐付いている
- [ ] その商品を含む Offering が **current** になっている
- [ ] App Store Connect との連携(App-Specific Shared Secret)が設定済み
- [ ] テスト用に付けた promotional entitlement を消した
      (「A day」で付けたものは24時間で自動的に切れるので、通常は放置でよい)

## 4. 法務ページ(public/ の静的HTML → tabenote.app)

実体は `public/support.html` `privacy.html` `terms.html` `tokusho.html` と `legal.css`。
`npm run build:web` で `dist` の直下に配られ、公開サイトの一部として出る。
購読ゲートの外に置くため、expo-router の画面ではなく素のHTMLにしてある。

- [ ] **⚠️ `{{OPERATOR_NAME}}` / `{{CONTACT_EMAIL}}` / `{{OPERATOR_ADDRESS}}` /
      `{{OPERATOR_PHONE}}` を置換した**

      ```sh
      grep -rn '{{' public/*.html    # 0件になること
      ```

      住所・電話を公開したくない場合は「ご請求があった場合、遅滞なく開示いたします。
      <メールアドレス> までご連絡ください。」に置き換える運用が使われている
      (完全に伏せることはできない)

- [ ] デプロイ後、**4つのURLが実際に開ける**(iPhone のブラウザでも確認)
      - `https://tabenote.app/support`
      - `https://tabenote.app/privacy`
      - `https://tabenote.app/terms`
      - `https://tabenote.app/tokusho`
- [ ] `src/constants/site.ts` の `SUPPORT_URL` / `TERMS_URL` / `PRIVACY_URL` が上と一致
      (404のまま App Store Connect に入れると、その時点で審査に落ちる)
- [ ] アプリ内(ペイウォールの「利用規約」「プライバシーポリシー」)のリンクが
      実機で正しく開く

> 静的HTMLの `<link rel="canonical">` は手書き。`SITE_URL` を変えたらこちらも直す。
> 食い違ったまま `npm run build:web` すると `scripts/postbuild-web.js` が検知して落ちる。
>
> 特商法表記(`/tokusho`)は、日本の App Store では Apple が販売事業者として決済するため
> 法律上の必須ではない。サポートページからリンクしておくだけでよく、
> App Store Connect の入力欄に入れる必要はない。
>
> 旧 `tabenote-legal/` は GitHub Pages で配信する前提の初期案で、**もう使っていない**。

## 5. App Store Connect

- [ ] 説明文に**購読が必要である旨**と、価格・期間・自動更新の説明がある
- [ ] 説明文の末尾に**利用規約(EULA)とプライバシーポリシーのURL**がある
      (自動更新サブスクリプションでは Apple の必須要件)
- [ ] サポートURL / プライバシーポリシーURL を入力した
- [ ] スクリーンショット(6.9インチ・6.5インチ)を登録した

      **撮りかた**: 購読ゲートがあるので、そのままではシミュレータで中の画面を撮れない
      (シミュレータの StoreKit はプランを返さず、ペイウォールが「取得できませんでした」で止まる)。
      `.env.local` に `EXPO_PUBLIC_SKIP_PAYWALL=1` を足して Metro を再起動すると、
      課金機能ごと無効になってゲートが外れる(`src/lib/billing.ts`。`__DEV__` 限定なので
      本番ビルドには効かない)。撮り終えたら消すこと。

      ただし**AI献立提案の画面だけは撮れない**。Worker が `appUserId` で購読を確認するため、
      課金を無効にすると弾かれる。

      AI画面まで一度に撮るなら、`SKIP_PAYWALL` の代わりにこちら:
      RevenueCat → Customers で適当な App User ID(例 `test_user`)に
      promotional entitlement `pro` を付け、その ID を `.env.local` の
      `EXPO_PUBLIC_DEV_APP_USER_ID` に書く。課金機能を生かしたまま購読者として起動するので、
      ゲートも開くし中継サーバーの購読確認も通る。付与は期限付き(A day なら24時間)なので、
      切れたら付け直す。

      なお、上の2つはどちらも `__DEV__` 限定なので、**EAS の simulator ビルドでは効かない**
      (`developmentClient` を付けていないリリースビルドで `__DEV__` が false になる)。
      EAS のビルドを撮影に使うなら次項のプロファイルを使うか、ローカルで Metro を動かすこと。
- [ ] **App内課金の審査用スクリーンショット**を各サブスクリプション商品に添付した

      App Store Connect のサブスクリプション商品ページ →「App 審査情報」にある添付欄。
      未添付だと商品を審査に提出できない。審査担当者が課金の提示場所を確認するためのもので、
      価格の出たペイウォールを撮る。

      実機であれば、商品が「提出準備完了」になっていて RevenueCat の Offering が
      設定済みなら実価格が取れるので、そちらで撮るのが本筋。

      シミュレータで撮るなら `EXPO_PUBLIC_MOCK_PLAN_PRICE` にダミー価格を渡す
      (`src/lib/billing.ts`)。EAS では `screenshot` プロファイルがそれを渡す:

      ```
      npx eas-cli build -p ios --profile screenshot
      ```

      `eas.json` の値は App Store Connect の実価格に合わせて更新すること。画面にそのまま出る。
      このモードでは RevenueCat を一切呼ばないので購入も復元も動かない。撮影専用。
- [ ] 審査メモに、購読しないと中身が見えないアプリである旨と、
      確認用のサンドボックスアカウント(または動作の説明)を書いた
- [ ] 文面は `docs/asc-metadata.md` のドラフトを使う

## 6. アプリ本体

- [ ] `npx tsc --noEmit` が通る
- [ ] `npm test` が通る
- [ ] `app.json` の `version` を上げた
- [ ] 実機の開発ビルドで購入 → AI提案までを通しで確認した
      (Expo Go は Preview API Mode で購入できないため、確認にならない)
- [ ] 「購入を復元」が動く
- [ ] 効能・症状・病名・点数の表現が入っていない(設計書 2章・9章)
