// Test MCP Supabase connection and check tables
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Set environment variables
process.env.SUPABASE_URL = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
process.env.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'
process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function listTables() {
  try {
    console.log('🔍 Checking tables using direct Supabase client...')
    
    // Try to list tables using information_schema (if accessible)
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    })
    
    if (error) {
      console.log('❌ RPC failed, trying direct table queries...')
      
      // Test each table individually
      const tables = ['users', 'projects', 'time_entries']
      const results = {}
      
      for (const table of tables) {
        try {
          const { error: tableError } = await supabase.from(table).select('*').limit(1)
          results[table] = !tableError
          console.log(`${results[table] ? '✅' : '❌'} ${table}: ${results[table] ? 'EXISTS' : 'MISSING'}`)
          if (tableError) console.log(`   Error: ${tableError.message}`)
        } catch (err) {
          results[table] = false
          console.log(`❌ ${table}: MISSING (${err.message})`)
        }
      }
      
      const allExist = Object.values(results).every(exists => exists)
      console.log(`\n${allExist ? '🎉 ALL TABLES EXIST!' : '⚠️  SOME TABLES ARE MISSING'}`)
      
      return allExist
    }
    
    console.log('✅ Tables found:', data)
    return true
    
  } catch (err) {
    console.error('💥 Error:', err.message)
    return false
  }
}

async function createTablesViaMCP() {
  try {
    console.log('\n🚀 Creating tables via MCP...')
    
    // Use MCP to create tables
    const createUsersSQL = `
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
    
    const createProjectsSQL = `
      CREATE TABLE IF NOT EXISTS projects (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#3B82F6',
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        is_archived BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    const createTimeEntriesSQL = `
      CREATE TABLE IF NOT EXISTS time_entries (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    
    const enableRLSSQL = `
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
      ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can manage own profile" ON users FOR ALL USING (auth.uid() = id);
      CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
      CREATE POLICY "Users can manage own time entries" ON time_entries FOR ALL USING (auth.uid() = user_id);
    `
    
    // Execute via raw SQL if possible
    console.log('Attempting to create tables directly...')
    
    // Try direct execution
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: createUsersSQL })
    const { error: error2 } = await supabase.rpc('exec_sql', { sql: createProjectsSQL })
    const { error: error3 } = await supabase.rpc('exec_sql', { sql: createTimeEntriesSQL })
    const { error: error4 } = await supabase.rpc('exec_sql', { sql: enableRLSSQL })
    
    if (error1 || error2 || error3 || error4) {
      console.log('❌ SQL execution failed, manual creation needed')
      return false
    }
    
    console.log('✅ Tables created successfully!')
    return true
    
  } catch (err) {
    console.error('💥 Error creating tables:', err.message)
    return false
  }
}

async function main() {
  console.log('🎯 MCP SUPABASE TABLE CHECK\n')
  
  const tablesExist = await listTables()
  
  if (!tablesExist) {
    console.log('\n📝 Tables missing, attempting creation...')
    const created = await createTablesViaMCP()
    
    if (created) {
      console.log('\n🔄 Rechecking tables...')
      const recheckResult = await listTables()
      console.log(`\nFinal Result: ${recheckResult ? 'YES' : 'NO'}`)
      return recheckResult
    } else {
      console.log('\n❌ Could not create tables via MCP')
      console.log('\n📋 MANUAL ACTION REQUIRED:')
      console.log('Please execute this SQL in Supabase Dashboard > SQL Editor:')
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
  }
  
  console.log(`\nFinal Result: ${tablesExist ? 'YES' : 'NO'}`)
  return tablesExist
}

main().then(result => {
  process.exit(result ? 0 : 1)
})