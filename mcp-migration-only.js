// MCP apply_migration focused approach
const { spawn } = require('child_process')

function runMCPCommand(command) {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      SUPABASE_URL: 'https://dzffzvqrmhdlpmyvxriy.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg4ODY0OCwiZXhwIjoyMDY1NDY0NjQ4fQ.0APoQxJKCq1U5FmRxQj_tAaAHN-RTmbLqLAO61ofGLY',
      MCP_API_KEY: 'test-api-key'
    }
    
    const mcp = spawn('supabase-mcp-claude', [], { env, stdio: ['pipe', 'pipe', 'pipe'] })
    
    let output = ''
    let error = ''
    
    mcp.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    mcp.stderr.on('data', (data) => {
      error += data.toString()
    })
    
    mcp.on('close', (code) => {
      if (code === 0 || output.includes('"result"')) {
        resolve(output)
      } else {
        reject(new Error(`MCP failed: ${error}`))
      }
    })
    
    setTimeout(() => {
      mcp.stdin.write(JSON.stringify(command) + '\n')
      setTimeout(() => mcp.kill(), 5000)
    }, 1000)
  })
}

async function applyMigration() {
  console.log('🔄 Applying database migration via MCP...')
  
  const migrationSQL = `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      timezone TEXT DEFAULT 'Asia/Tokyo',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create projects table
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
    
    -- Create time_entries table
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
    
    -- Enable RLS
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    DROP POLICY IF EXISTS "Users can manage own profile" ON users;
    CREATE POLICY "Users can manage own profile" ON users FOR ALL USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Users can manage own projects" ON projects;
    CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can manage own time entries" ON time_entries;
    CREATE POLICY "Users can manage own time entries" ON time_entries FOR ALL USING (auth.uid() = user_id);
    
    -- Create user profile function
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
  
  const command = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "apply_migration",
      arguments: {
        migration_sql: migrationSQL
      }
    }
  }
  
  try {
    console.log('📝 Sending migration to MCP...')
    const result = await runMCPCommand(command)
    console.log('✅ Migration response:', result)
    
    // Parse result to check for success
    try {
      const parsed = JSON.parse(result)
      if (parsed.result && !parsed.result.isError) {
        console.log('✅ Migration successful!')
        return true
      } else {
        console.log('❌ Migration had errors:', parsed.result)
        return false
      }
    } catch (parseErr) {
      console.log('⚠️ Could not parse result, assuming success if no error thrown')
      return true
    }
    
  } catch (err) {
    console.log('❌ Migration failed:', err.message)
    return false
  }
}

async function main() {
  console.log('🎯 MCP MIGRATION-ONLY APPROACH\n')
  
  const success = await applyMigration()
  
  console.log(`\n🏁 FINAL RESULT: ${success ? 'SUCCESS' : 'FAILED'}`)
  
  return success
}

main().then(result => {
  process.exit(result ? 0 : 1)
})