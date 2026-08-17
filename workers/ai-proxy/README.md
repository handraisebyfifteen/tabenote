# tabenote AI 中継サーバー(フェーズ9)

アプリに API キーを載せずに AI 献立提案を提供するための Cloudflare Worker。
モデルは Claude Sonnet 5、表現の制約(設計書9章: 効能・症状・病名・点数を出さない)はシステムプロンプトで強制する。

## デプロイ手順

1. [Cloudflare アカウント](https://dash.cloudflare.com/sign-up)を作成(無料枠で十分)
2. このディレクトリで:

   ```bash
   npm install
   npx wrangler login
   npx wrangler secret put ANTHROPIC_API_KEY   # console.anthropic.com で発行したキー
   npx wrangler deploy
   ```

3. 表示された URL(`https://tabenote-ai.<account>.workers.dev`)を
   アプリ側の `src/lib/ai.ts` の `AI_PROXY_URL` に設定する

## 課金ゲート(フェーズ8完了後)

`REVENUECAT_API_KEY` シークレットを登録すると、リクエストの
`Authorization: Bearer <RevenueCatのapp_user_id>` を使って購読状態を確認し、
未購読なら 402 を返す。未登録の間は確認をスキップする(開発用)。

```bash
npx wrangler secret put REVENUECAT_API_KEY
```

## API

`POST /suggest`

```json
{
  "foods": ["ほうれんそう", "ぶたにく", "しょうが"],
  "season": "長夏(夏土用)",
  "recommendedFlavors": ["甘", "苦"],
  "missingFlavors": ["酸"],
  "lang": "ja"
}
```

→ `{ "suggestion": "..." }`

## 今後の拡張

- `/estimate` — 未収録食材のAI推定(設計書11章)。推定値はDBに保存せず
  ユーザーのメモ扱い+「⚠ 推定値」と免責を必ず添える。
