// Test script to start a timer and check the project join issue
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'

const supabase = createClient(supabaseUrl, supabaseKey)

const DEMO_USER_ID = 'a2e49074-96ff-490e-8e9d-ccac47707f83'
const PROJECT_ID = '94b9f83b-f9ca-4623-9002-936439b7d639' // ウェブサイト開発

async function testStartTimer() {
  try {
    console.log('🚀 Testing timer start and project join...')
    
    // Step 1: Stop all running timers first
    console.log('\n1. Stopping all running timers...')
    const { error: stopError } = await supabase
      .from('time_entries')
      .update({
        end_time: new Date().toISOString(),
        is_running: false
      })
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
    
    if (stopError) {
      console.error('❌ Error stopping timers:', stopError)
    } else {
      console.log('✅ Stopped all running timers')
    }
    
    // Step 2: Start a new timer
    console.log('\n2. Starting new timer...')
    const { data: newEntry, error: insertError } = await supabase
      .from('time_entries')
      .insert({
        user_id: DEMO_USER_ID,
        project_id: PROJECT_ID,
        description: 'Test timer for debugging project join',
        start_time: new Date().toISOString(),
        is_running: true
      })
      .select(`
        *,
        projects(name, color)
      `)
      .single()
    
    if (insertError) {
      console.error('❌ Error starting timer:', insertError)
      return
    }
    
    console.log('✅ Timer started successfully!')
    console.log('New entry:', JSON.stringify(newEntry, null, 2))
    
    // Step 3: Test the getActiveTimeEntry function (similar to the one in client.ts)
    console.log('\n3. Testing getActiveTimeEntry function...')
    const { data: activeEntry, error: activeError } = await supabase
      .from('time_entries')
      .select(`
        *,
        projects(name, color)
      `)
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
      .maybeSingle()
    
    if (activeError) {
      console.error('❌ Error getting active entry:', activeError)
    } else if (activeEntry) {
      console.log('✅ Active entry retrieved:')
      console.log(JSON.stringify(activeEntry, null, 2))
      
      // Check how the project data is structured
      console.log('\n4. Analyzing project data structure:')
      console.log('activeEntry.projects:', activeEntry.projects)
      console.log('activeEntry.project:', activeEntry.project)
      console.log('Project name from projects field:', activeEntry.projects?.name)
      console.log('Project color from projects field:', activeEntry.projects?.color)
      
      // Test the TimerCard display logic
      const displayName = activeEntry.projects?.name || activeEntry.project?.name || 'Unknown Project'
      const displayColor = activeEntry.projects?.color || activeEntry.project?.color || '#3B82F6'
      
      console.log('\n5. Display logic results:')
      console.log('Display name:', displayName)
      console.log('Display color:', displayColor)
      
    } else {
      console.log('⚠️  No active entry found')
    }
    
  } catch (err) {
    console.error('💥 Test failed:', err.message)
  }
}

testStartTimer().then(() => {
  console.log('\n🏁 Test completed')
  process.exit(0)
})