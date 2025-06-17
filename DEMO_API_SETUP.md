# デモAPIセットアップガイド

## 概要
デモユーザーのタイマーデータをデータベースに保存するために、APIエンドポイントがRLS（Row Level Security）を回避する必要があります。

## 必要な環境変数

Vercelの環境変数に以下を追加してください：

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Service Role Keyの取得方法

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. Settings → API セクションに移動
4. "Service role key (secret)" をコピー

**重要**: Service Role Keyは秘密情報です。フロントエンドコードには絶対に含めないでください。

## 現在の実装

### APIエンドポイント使用（推奨）
- `/api/demo/timer` - デモユーザーのタイマー操作
- Service Role Keyを使用してRLSを回避
- データベースに実際にデータを保存

### LocalStorageフォールバック
- APIが失敗した場合の代替手段
- ブラウザのlocalStorageにデータを保存
- ページリロード後も維持されるが、デバイス間で共有されない

## セットアップ手順

1. Vercelダッシュボードで環境変数を追加
2. デプロイをトリガー（自動的に再デプロイされます）
3. デモユーザーでテスト

## トラブルシューティング

### API 500エラーが続く場合
- Service Role Keyが正しく設定されているか確認
- Vercelの環境変数が反映されているか確認（再デプロイが必要な場合があります）

### データが保存されない場合
- ブラウザのコンソールでエラーを確認
- LocalStorageフォールバックが動作しているか確認