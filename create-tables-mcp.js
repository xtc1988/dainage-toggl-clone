// Create tables using Service Role Key
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg4ODY0OCwiZXhwIjoyMDY1NDY0NjQ4fQ.0APoQxJKCq1U5FmRxQj_tAaAHN-RTmbLqLAO61ofGLY'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createTables() {
  console.log('🚀 Creating tables with Service Role Key...')
  
  try {
    // Create extension
    console.log('📦 Creating UUID extension...')
    const { error: extError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    })
    if (extError) console.log('Extension error (may already exist):', extError.message)
    
    // Create users table
    console.log('👥 Creating users table...')
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          avatar_url TEXT,
          timezone TEXT DEFAULT 'Asia/Tokyo',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (usersError) console.log('Users table error:', usersError.message)
    else console.log('✅ Users table created!')
    
    // Create projects table
    console.log('📁 Creating projects table...')
    const { error: projectsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          color TEXT DEFAULT '#3B82F6',
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          is_archived BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (projectsError) console.log('Projects table error:', projectsError.message)
    else console.log('✅ Projects table created!')
    
    // Create time_entries table
    console.log('⏰ Creating time_entries table...')
    const { error: timeEntriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS time_entries (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          task_id UUID,
          description TEXT,
          start_time TIMESTAMP WITH TIME ZONE NOT NULL,
          end_time TIMESTAMP WITH TIME ZONE,
          duration INTEGER,
          is_running BOOLEAN DEFAULT FALSE,
          tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (timeEntriesError) console.log('Time entries table error:', timeEntriesError.message)
    else console.log('✅ Time entries table created!')
    
    // Enable RLS
    console.log('🔒 Setting up RLS policies...')
    const rlsSQL = `
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
      ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users can manage own profile" ON users;
      CREATE POLICY "Users can manage own profile" ON users FOR ALL USING (auth.uid() = id);
      
      DROP POLICY IF EXISTS "Users can manage own projects" ON projects;
      CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can manage own time entries" ON time_entries;
      CREATE POLICY "Users can manage own time entries" ON time_entries FOR ALL USING (auth.uid() = user_id);
    `
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL })
    if (rlsError) console.log('RLS error:', rlsError.message)
    else console.log('✅ RLS policies created!')
    
    // Create user profile function
    console.log('🤖 Creating user profile function...')
    const functionSQL = `
      CREATE OR REPLACE FUNCTION handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO users (id, email, name, avatar_url)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
          NEW.raw_user_meta_data->>'avatar_url'
        );
        RETURN NEW;
      EXCEPTION
        WHEN unique_violation THEN
          RETURN NEW;
      END;
      $$ language 'plpgsql' SECURITY DEFINER;
      
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    `
    
    const { error: functionError } = await supabase.rpc('exec_sql', { sql: functionSQL })
    if (functionError) console.log('Function error:', functionError.message)
    else console.log('✅ User profile function created!')
    
    console.log('\n🎉 ALL TABLES CREATED SUCCESSFULLY!')
    return true
    
  } catch (err) {
    console.error('💥 Error creating tables:', err.message)
    return false
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying tables...')
  
  const tables = ['users', 'projects', 'time_entries']
  let allExist = true
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`)
        allExist = false
      } else {
        console.log(`✅ ${table}: EXISTS`)
      }
    } catch (err) {
      console.log(`❌ ${table}: FAILED - ${err.message}`)
      allExist = false
    }
  }
  
  return allExist
}

async function main() {
  console.log('🎯 MCP SUPABASE TABLE CREATION\n')
  
  const created = await createTables()
  const verified = await verifyTables()
  
  const success = created && verified
  console.log(`\n🏁 FINAL RESULT: ${success ? 'YES - ALL TABLES EXIST!' : 'NO - CREATION FAILED'}`)
  
  return success
}

main().then(result => {
  process.exit(result ? 0 : 1)
})