-- デモユーザー用のRLSポリシーを追加
-- デモユーザーID: a2e49074-96ff-490e-8e9d-ccac47707f83

-- time_entriesテーブルのRLSポリシー
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- デモユーザー用の読み取りポリシー
CREATE POLICY "Demo user can read own time entries" ON time_entries
  FOR SELECT 
  TO authenticated
  USING (user_id = 'a2e49074-96ff-490e-8e9d-ccac47707f83'::uuid);

-- デモユーザー用の作成ポリシー
CREATE POLICY "Demo user can create time entries" ON time_entries
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = 'a2e49074-96ff-490e-8e9d-ccac47707f83'::uuid);

-- デモユーザー用の更新ポリシー
CREATE POLICY "Demo user can update own time entries" ON time_entries
  FOR UPDATE 
  TO authenticated
  USING (user_id = 'a2e49074-96ff-490e-8e9d-ccac47707f83'::uuid)
  WITH CHECK (user_id = 'a2e49074-96ff-490e-8e9d-ccac47707f83'::uuid);

-- デモユーザー用の削除ポリシー
CREATE POLICY "Demo user can delete own time entries" ON time_entries
  FOR DELETE 
  TO authenticated
  USING (user_id = 'a2e49074-96ff-490e-8e9d-ccac47707f83'::uuid);

-- anonロールでもデモユーザーのデータにアクセスできるようにする
CREATE POLICY "Anon can manage demo user time entries" ON time_entries
  FOR ALL 
  TO anon
  USING (user_id = 'a2e49074-96ff-490e-8e9d-ccac47707f83'::uuid)
  WITH CHECK (user_id = 'a2e49074-96ff-490e-8e9d-ccac47707f83'::uuid);

-- projectsテーブルのRLSポリシー
CREATE POLICY "Anon can read demo user projects" ON projects
  FOR SELECT 
  TO anon
  USING (user_id = 'a2e49074-96ff-490e-8e9d-ccac47707f83'::uuid);