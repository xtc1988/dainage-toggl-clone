// Check actual table structure
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg4ODY0OCwiZXhwIjoyMDY1NDY0NjQ4fQ.0APoQxJKCq1U5FmRxQj_tAaAHN-RTmbLqLAO61ofGLY'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function checkTableStructure() {
  console.log('🔍 Checking table structure...')
  
  // Check projects table structure
  const { data: projectsStructure, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .limit(1)
  
  if (projectsError) {
    console.error('❌ Error checking projects table:', projectsError)
    return
  }
  
  console.log('📋 Projects table sample data:')
  console.log(projectsStructure)
  
  // Try to get table schema using raw SQL
  const { data: schema, error: schemaError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'projects')
    .eq('table_schema', 'public')
  
  if (!schemaError && schema) {
    console.log('\n📋 Projects table schema:')
    schema.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
  } else {
    console.log('⚠️ Could not fetch schema info:', schemaError?.message)
  }
  
  // Check users table structure
  const { data: usersStructure, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1)
  
  if (!usersError && usersStructure) {
    console.log('\n📋 Users table sample data:')
    console.log(usersStructure)
  }
  
  // Check time_entries table structure  
  const { data: timeEntriesStructure, error: timeEntriesError } = await supabase
    .from('time_entries')
    .select('*')
    .limit(1)
  
  if (!timeEntriesError && timeEntriesStructure) {
    console.log('\n📋 Time entries table sample data:')
    console.log(timeEntriesStructure)
  }
}

checkTableStructure().then(() => {
  console.log('\n✅ Table structure check complete')
  process.exit(0)
}).catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})