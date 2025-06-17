import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg4ODY0OCwiZXhwIjoyMDY1NDY0NjQ4fQ.0APoQxJKCq1U5FmRxQj_tAaAHN-RTmbLqLAO61ofGLY'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testDatabaseRead() {
  console.log('🔍 Testing database read...')
  
  // Get the user ID from the users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email')
    .limit(1)
  
  if (usersError) {
    console.error('❌ Error fetching users:', usersError)
    return
  }
  
  if (!users || users.length === 0) {
    console.log('⚠️ No users found in database')
    return
  }
  
  const userId = users[0].id
  console.log('👤 Using user ID:', userId)
  console.log('📧 User email:', users[0].email)
  
  // First, check what columns exist in projects table
  const { data: sampleProject, error: sampleError } = await supabase
    .from('projects')
    .select('*')
    .limit(1)
  
  if (!sampleError && sampleProject && sampleProject.length > 0) {
    console.log('\n📊 Projects table columns:', Object.keys(sampleProject[0]))
  }
  
  // Fetch projects for this user
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
  
  if (projectsError) {
    console.error('❌ Error fetching projects:', projectsError)
    return
  }
  
  console.log('\n📋 Projects found:', projects?.length || 0)
  
  if (projects && projects.length > 0) {
    console.log('\n🗂️ Project details:')
    projects.forEach((project, index) => {
      console.log(`\n${index + 1}. ${project.name}`)
      console.log(`   ID: ${project.id}`)
      console.log(`   Color: ${project.color}`)
      console.log(`   Created: ${project.created_at}`)
    })
  } else {
    console.log('⚠️ No projects found for this user')
  }
}

testDatabaseRead().then(() => {
  console.log('\n✅ Database read test complete')
  process.exit(0)
}).catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})