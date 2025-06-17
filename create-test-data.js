// Create test data for timer functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg4ODY0OCwiZXhwIjoyMDY1NDY0NjQ4fQ.0APoQxJKCq1U5FmRxQj_tAaAHN-RTmbLqLAO61ofGLY'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createTestUser() {
  console.log('👤 Creating test user...')
  
  const testUserId = '3b5bbb6c-e875-4d67-8a67-3404ee1cbc88'
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User'
    })
    .select()
  
  if (error) {
    console.log('User creation error (might already exist):', error.message)
  } else {
    console.log('✅ Test user created:', data)
  }
  
  return testUserId
}

async function createTestProject(userId) {
  console.log('📁 Creating test project...')
  
  const { data, error } = await supabase
    .from('projects')
    .upsert({
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Project',
      color: '#3B82F6',
      user_id: userId
    })
    .select()
  
  if (error) {
    console.log('Project creation error (might already exist):', error.message)
  } else {
    console.log('✅ Test project created:', data)
  }
  
  return '550e8400-e29b-41d4-a716-446655440001'
}

async function testTimerFlow(userId, projectId) {
  console.log('⏰ Testing timer flow...')
  
  try {
    // Create time entry
    const { data: timeEntry, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: userId,
        project_id: projectId,
        description: 'Test timer entry',
        start_time: new Date().toISOString(),
        is_running: true
      })
      .select(`
        *,
        projects(name, color)
      `)
      .single()
    
    if (error) {
      console.error('❌ Timer creation error:', error)
      return false
    }
    
    console.log('✅ Timer created successfully:', timeEntry)
    
    // Stop the timer
    const { data: stoppedEntry, error: stopError } = await supabase
      .from('time_entries')
      .update({
        end_time: new Date().toISOString(),
        is_running: false
      })
      .eq('id', timeEntry.id)
      .select()
      .single()
    
    if (stopError) {
      console.error('❌ Timer stop error:', stopError)
      return false
    }
    
    console.log('✅ Timer stopped successfully:', stoppedEntry)
    return true
    
  } catch (err) {
    console.error('❌ Timer test failed:', err)
    return false
  }
}

async function main() {
  console.log('🎯 CREATING TEST DATA FOR TIMER\n')
  
  const userId = await createTestUser()
  const projectId = await createTestProject(userId)
  const success = await testTimerFlow(userId, projectId)
  
  console.log(`\n🏁 RESULT: ${success ? 'SUCCESS - Timer should work now!' : 'FAILED'}`)
  
  return success
}

main().then(result => {
  process.exit(result ? 0 : 1)
})