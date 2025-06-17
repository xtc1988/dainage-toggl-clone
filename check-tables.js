// Check if tables exist using Supabase client
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  try {
    console.log('🔍 Checking if tables exist...')
    
    // Check what tables exist
    const { data, error } = await supabase.rpc('sql', {
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    })
    
    if (error) {
      console.error('❌ Error checking tables:', error)
      return
    }
    
    console.log('📋 Existing tables:', data)
    
    // Check specifically for our needed tables
    const requiredTables = ['users', 'projects', 'time_entries']
    const existingTables = data.map(row => row.table_name)
    
    console.log('\n🎯 Required tables status:')
    requiredTables.forEach(table => {
      const exists = existingTables.includes(table)
      console.log(`  ${exists ? '✅' : '❌'} ${table}: ${exists ? 'EXISTS' : 'MISSING'}`)
    })
    
    const allTablesExist = requiredTables.every(table => existingTables.includes(table))
    console.log(`\n${allTablesExist ? '🎉 ALL TABLES EXIST!' : '⚠️  SOME TABLES ARE MISSING'}`)
    
    return allTablesExist
    
  } catch (err) {
    console.error('💥 Failed to check tables:', err.message)
    return false
  }
}

checkTables().then(result => {
  console.log(`\nResult: ${result ? 'YES' : 'NO'}`)
  process.exit(0)
})