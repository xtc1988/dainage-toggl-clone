-- デモユーザー作成用のSQLスクリプト
-- このスクリプトをSupabase SQL Editorで実行してください

-- 1. Auth.users にデモユーザーを作成
-- 注意: この部分はSupabase Dashboardから手動で作成する必要があります
-- Email: demo@dainage.app
-- Password: DemoUser2024!

-- 2. デモユーザーのIDを取得 (認証作成後に実行)
-- デモユーザーのUUIDをここに記入してください
-- 例: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
DO $$
DECLARE
  demo_user_id UUID := (SELECT id FROM auth.users WHERE email = 'demo@dainage.app' LIMIT 1);
BEGIN
  -- デモユーザーが存在する場合のみ実行
  IF demo_user_id IS NOT NULL THEN
    
    -- 3. プロファイル作成（avatar_urlカラムが存在しない場合に対応）
    -- まず、カラムの存在を確認
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'avatar_url'
    ) THEN
      -- avatar_urlカラムが存在する場合
      INSERT INTO public.users (id, email, name, avatar_url, timezone)
      VALUES (
        demo_user_id,
        'demo@dainage.app',
        'デモユーザー',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        'Asia/Tokyo'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url;
    ELSE
      -- avatar_urlカラムが存在しない場合
      INSERT INTO public.users (id, email, name, timezone)
      VALUES (
        demo_user_id,
        'demo@dainage.app',
        'デモユーザー',
        'Asia/Tokyo'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name;
    END IF;

    -- 4. サンプルプロジェクトを作成
    INSERT INTO public.projects (id, user_id, name, color, is_archived)
    VALUES 
      (gen_random_uuid(), demo_user_id, 'ウェブサイト開発', '#3B82F6', false),
      (gen_random_uuid(), demo_user_id, 'モバイルアプリ開発', '#10B981', false),
      (gen_random_uuid(), demo_user_id, 'データ分析', '#F59E0B', false),
      (gen_random_uuid(), demo_user_id, '社内ミーティング', '#8B5CF6', false)
    ON CONFLICT DO NOTHING;

    -- 5. サンプル時間エントリを作成（過去7日分）
    WITH project_ids AS (
      SELECT id, name FROM public.projects WHERE user_id = demo_user_id
    )
    INSERT INTO public.time_entries (
      user_id, project_id, description, start_time, end_time, duration, is_running
    )
    SELECT 
      demo_user_id,
      p.id,
      CASE 
        WHEN p.name = 'ウェブサイト開発' THEN 
          (ARRAY['UIコンポーネント実装', 'APIエンドポイント開発', 'テスト作成', 'バグ修正'])[floor(random() * 4 + 1)::int]
        WHEN p.name = 'モバイルアプリ開発' THEN 
          (ARRAY['画面レイアウト調整', 'プッシュ通知実装', 'パフォーマンス改善', 'リリース準備'])[floor(random() * 4 + 1)::int]
        WHEN p.name = 'データ分析' THEN 
          (ARRAY['データ収集', 'レポート作成', 'ダッシュボード更新', 'KPI分析'])[floor(random() * 4 + 1)::int]
        ELSE 
          (ARRAY['定例会議', 'プロジェクト進捗確認', '1on1', 'チーム振り返り'])[floor(random() * 4 + 1)::int]
      END,
      (CURRENT_DATE - INTERVAL '1 day' * day_offset + TIME '09:00:00' + INTERVAL '1 hour' * hour_offset)::timestamptz,
      (CURRENT_DATE - INTERVAL '1 day' * day_offset + TIME '09:00:00' + INTERVAL '1 hour' * hour_offset + INTERVAL '1 hour' * (1 + random() * 3))::timestamptz,
      3600 * (1 + random() * 3),
      false
    FROM 
      project_ids p,
      generate_series(0, 6) AS day_offset,
      generate_series(0, 2) AS hour_offset
    WHERE 
      random() > 0.3 -- 30%の確率でエントリをスキップ（現実的なデータ）
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'デモユーザーとサンプルデータの作成が完了しました。';
  ELSE
    RAISE NOTICE 'デモユーザーが見つかりません。先にSupabase Authでユーザーを作成してください。';
  END IF;
END $$;