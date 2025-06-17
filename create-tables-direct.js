// Direct table creation using Service Role Key with REST API
import fetch from 'node-fetch'

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg4ODY0OCwiZXhwIjoyMDY1NDY0NjQ4fQ.0APoQxJKCq1U5FmRxQj_tAaAHN-RTmbLqLAO61ofGLY'

async function executeSQLDirect(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey
    },
    body: JSON.stringify({ sql })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HTTP ${response.status}: ${error}`)
  }
  
  return await response.json()
}

async function createTablesViaSQL() {
  console.log('🚀 Creating tables via direct SQL execution...')
  
  const createTablesSQL = `
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
  `
  
  try {
    console.log('📝 Executing SQL...')
    const result = await executeSQLDirect(createTablesSQL)
    console.log('✅ SQL executed successfully:', result)
    return true
  } catch (err) {
    console.error('❌ SQL execution failed:', err.message)
    return false
  }
}

// Alternative: Use MCP insertData to test if we can write to auth schema
async function testMCPAccess() {
  console.log('🧪 Testing MCP access...')
  
  try {
    // Test if we can create a simple table using MCP
    const response = await fetch('http://localhost:3001/v1/tools/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer test-api-key`
      },
      body: JSON.stringify({
        name: 'queryDatabase',
        arguments: {
          table: 'auth.users',
          select: 'id',
          query: {}
        }
      })
    })
    
    const result = await response.json()
    console.log('MCP Response:', result)
    return true
    
  } catch (err) {
    console.error('MCP Test failed:', err.message)
    return false
  }
}

async function main() {
  console.log('🎯 DIRECT TABLE CREATION ATTEMPT\n')
  
  const sqlResult = await createTablesViaSQL()
  
  if (!sqlResult) {
    console.log('\n🔄 Trying alternative MCP approach...')
    await testMCPAccess()
  }
  
  console.log('\n📋 MANUAL FALLBACK:')
  console.log('If automatic creation failed, execute this in Supabase SQL Editor:')
  console.log(`
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE time_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  is_running BOOLEAN DEFAULT FALSE
);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own time entries" ON time_entries FOR ALL USING (auth.uid() = user_id);
  `)
  
  return sqlResult
}

main().then(result => {
  console.log(`\nResult: ${result ? 'SUCCESS' : 'FAILED - MANUAL ACTION REQUIRED'}`)
  process.exit(result ? 0 : 1)
})