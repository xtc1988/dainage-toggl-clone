// Simple table existence check
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  try {
    console.log('🔍 Checking if tables exist by querying them directly...')
    
    const results = {
      users: false,
      projects: false,
      time_entries: false
    }
    
    // Try to select from users table
    try {
      const { error: usersError } = await supabase.from('users').select('id').limit(1)
      results.users = !usersError
      console.log(`${results.users ? '✅' : '❌'} users: ${results.users ? 'EXISTS' : 'MISSING'}`)
      if (usersError) console.log(`   Error: ${usersError.message}`)
    } catch (err) {
      console.log(`❌ users: MISSING (${err.message})`)
    }
    
    // Try to select from projects table
    try {
      const { error: projectsError } = await supabase.from('projects').select('id').limit(1)
      results.projects = !projectsError
      console.log(`${results.projects ? '✅' : '❌'} projects: ${results.projects ? 'EXISTS' : 'MISSING'}`)
      if (projectsError) console.log(`   Error: ${projectsError.message}`)
    } catch (err) {
      console.log(`❌ projects: MISSING (${err.message})`)
    }
    
    // Try to select from time_entries table
    try {
      const { error: timeEntriesError } = await supabase.from('time_entries').select('id').limit(1)
      results.time_entries = !timeEntriesError
      console.log(`${results.time_entries ? '✅' : '❌'} time_entries: ${results.time_entries ? 'EXISTS' : 'MISSING'}`)
      if (timeEntriesError) console.log(`   Error: ${timeEntriesError.message}`)
    } catch (err) {
      console.log(`❌ time_entries: MISSING (${err.message})`)
    }
    
    const allTablesExist = results.users && results.projects && results.time_entries
    console.log(`\n${allTablesExist ? '🎉 ALL TABLES EXIST!' : '⚠️  SOME TABLES ARE MISSING'}`)
    
    return allTablesExist
    
  } catch (err) {
    console.error('💥 Failed to check tables:', err.message)
    return false
  }
}

checkTables().then(result => {
  console.log(`\nFinal Result: ${result ? 'YES' : 'NO'}`)
  process.exit(0)
})