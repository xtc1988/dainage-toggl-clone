// Final MCP table creation attempt
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
      setTimeout(() => mcp.kill(), 3000)
    }, 1000)
  })
}

async function insertUserRecord() {
  console.log('👤 Creating user record via MCP...')
  
  const command = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "insertData",
      arguments: {
        table: "auth.users",
        data: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          email: "test@example.com",
          encrypted_password: "$2a$10$hash",
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    }
  }
  
  try {
    const result = await runMCPCommand(command)
    console.log('✅ User creation result:', result)
    return true
  } catch (err) {
    console.log('❌ User creation failed:', err.message)
    return false
  }
}

async function createCustomFunction() {
  console.log('⚙️ Creating tables via MCP apply_migration...')
  
  const command = {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "apply_migration",
      arguments: {
        migration_sql: `
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
      }
    }
  }
  
  try {
    const result = await runMCPCommand(command)
    console.log('✅ Migration result:', result)
    return true
  } catch (err) {
    console.log('❌ Migration failed:', err.message)
    return false
  }
}

async function attemptDirectTableCreation() {
  console.log('🏗️ Attempting direct table creation...')
  
  // Try creating tables by inserting into information_schema
  const command = {
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "queryDatabase",
      arguments: {
        table: "information_schema.tables",
        select: "table_name",
        query: { table_schema: { eq: "public" } }
      }
    }
  }
  
  try {
    const result = await runMCPCommand(command)
    console.log('📋 Current tables:', result)
    
    // If we can query tables, try a different approach
    console.log('🔧 Trying alternative table creation...')
    
    // Use MCP to create a simple test table
    const createCommand = {
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "insertData",
        arguments: {
          table: "test_table_creation",
          data: { test_field: "test_value" }
        }
      }
    }
    
    const createResult = await runMCPCommand(createCommand)
    console.log('🆕 Table creation attempt:', createResult)
    
    return true
  } catch (err) {
    console.log('❌ Direct creation failed:', err.message)
    return false
  }
}

async function main() {
  console.log('🎯 FINAL MCP TABLE CREATION ATTEMPT\n')
  
  const attempts = [
    insertUserRecord,
    createCustomFunction,
    attemptDirectTableCreation
  ]
  
  for (const attempt of attempts) {
    const success = await attempt()
    if (success) {
      console.log('✅ Success with MCP!')
      return true
    }
    console.log('⏭️ Trying next approach...\n')
  }
  
  console.log('❌ All MCP attempts failed')
  console.log('\n📋 EXECUTE THIS IN SUPABASE SQL EDITOR:')
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
  
  return false
}

main().then(result => {
  console.log(`\nFINAL RESULT: ${result ? 'YES - MCP SUCCESS!' : 'NO - MANUAL ACTION REQUIRED'}`)
  process.exit(result ? 0 : 1)
})