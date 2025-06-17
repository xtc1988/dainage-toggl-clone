# デモユーザー設定手順

## 1. Supabase Dashboardでデモユーザーを作成

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. 左側メニューから「Authentication」→「Users」を選択
4. 「Add user」→「Create new user」をクリック
5. 以下の情報を入力：
   - Email: `demo@dainage.app`
   - Password: `DemoUser2024!`
6. 「Create user」をクリック

## 2. デモデータのセットアップ

1. 左側メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. `src/scripts/setup-demo-user.sql` の内容をコピー＆ペースト
4. 「Run」をクリックして実行

## 3. 環境変数の確認

`.env.local` に以下が設定されていることを確認：

```env
NEXT_PUBLIC_DEMO_USER_EMAIL=demo@dainage.app
NEXT_PUBLIC_DEMO_USER_PASSWORD=DemoUser2024!
```

## 4. Vercelへのデプロイ

環境変数をVercelにも設定：

1. [Vercel Dashboard](https://vercel.com) にログイン
2. プロジェクトの「Settings」→「Environment Variables」
3. 以下を追加：
   - `NEXT_PUBLIC_DEMO_USER_EMAIL`: `demo@dainage.app`
   - `NEXT_PUBLIC_DEMO_USER_PASSWORD`: `DemoUser2024!`

## デモユーザーの機能

デモユーザーでログインすると以下のサンプルデータが利用可能：

- 4つのサンプルプロジェクト
- 過去7日分の時間エントリ
- 各プロジェクトに関連するタスクの説明

## セキュリティ注意事項

- デモユーザーのパスワードは定期的に変更してください
- 本番環境では別のデモユーザーを使用することを推奨
- デモユーザーのデータは定期的にリセットすることを推奨