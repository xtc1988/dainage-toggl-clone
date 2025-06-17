# Supabase デモユーザー作成 詳細手順

## 1. Supabase Dashboardにアクセス

1. ブラウザで [https://app.supabase.com](https://app.supabase.com) を開く
2. Supabaseアカウントでログイン

## 2. プロジェクトを選択

1. ダッシュボードから「dainage-toggl-clone」プロジェクトをクリック
   - プロジェクトURL: `https://app.supabase.com/project/dzffzvqrmhdlpmyvxriy`

## 3. Authentication（認証）セクションへ移動

1. 左側のサイドバーから「Authentication」アイコンをクリック
   - 人型のアイコンです
   - または「認証」と表示されている場合もあります

## 4. Users（ユーザー）タブを選択

1. Authenticationページ内の上部タブから「Users」をクリック
   - デフォルトで選択されている場合もあります

## 5. 新規ユーザーを作成

1. 右上の「Add user」ボタンをクリック
2. ドロップダウンから「Create new user」を選択

## 6. ユーザー情報を入力

以下の情報を正確に入力してください：

```
Email address: demo@dainage.app
Password: DemoUser2024!
```

**重要な注意事項:**
- Email欄: `demo@dainage.app` （小文字で入力）
- Password欄: `DemoUser2024!` （大文字小文字、数字、記号を正確に）
- 「Auto Confirm User?」は**チェックを入れる**（デフォルトでONのはず）
- 「Send user an invitation email?」は**チェックを外す**

## 7. ユーザーを作成

1. 「Create user」ボタンをクリック
2. 成功すると、ユーザーリストに新しいユーザーが表示されます

## 8. ユーザーIDを確認

1. 作成されたユーザーの行をクリック
2. 詳細画面で「User UID」をコピー
   - 例: `12345678-1234-1234-1234-123456789012`
   - このIDは後で使用します

## 9. 確認事項

作成後、以下を確認してください：

- Status: `Active` または `Confirmed`
- Email: `demo@dainage.app`
- Provider: `email`

## トラブルシューティング

### エラー: "User already exists"
- すでにデモユーザーが作成されています
- Users一覧から既存のユーザーを確認してください

### エラー: "Invalid email or password"
- パスワードが弱すぎる可能性があります
- Supabaseのパスワードポリシーを確認してください

### ログインできない場合
1. 「Email Confirmed At」が設定されているか確認
2. されていない場合は、ユーザーの「...」メニューから「Confirm email」を選択

## 次のステップ

ユーザー作成後、SQLスクリプトを実行してサンプルデータを作成します：

1. 左側メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. `/src/scripts/setup-demo-user.sql`の内容をコピー＆ペースト
4. 「Run」をクリック

これでデモユーザーの設定が完了です！