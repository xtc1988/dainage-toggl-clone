// Test the browser authentication and client creation flow
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'

const DEMO_USER_ID = 'a2e49074-96ff-490e-8e9d-ccac47707f83'
const PROJECT_ID = '94b9f83b-f9ca-4623-9002-936439b7d639'

// Simulate the browser flow
async function testBrowserFlow() {
  try {
    console.log('🌐 Testing browser authentication and client flow...')
    
    // Step 1: Simulate the initial supabase client creation (like in browser)
    console.log('\n1. Creating supabase client (like createClientComponentClient):')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Step 2: Simulate demo user authentication
    console.log('\n2. Simulating demo user authentication:')
    
    // Check if demo user exists (like signInAsDemo does)
    const { data: demoUser, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', DEMO_USER_ID)
      .single()
    
    if (userError) {
      console.error('❌ Demo user not found:', userError)
      return
    }
    
    console.log('✅ Demo user found:', demoUser)
    
    // Step 3: Simulate timer start flow (like startTimerAsync)
    console.log('\n3. Simulating timer start flow:')
    
    // Stop running timers first
    await supabase
      .from('time_entries')
      .update({ end_time: new Date().toISOString(), is_running: false })
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
    
    // Start new timer
    const { data: startResult, error: startError } = await supabase
      .from('time_entries')
      .insert({
        user_id: DEMO_USER_ID,
        project_id: PROJECT_ID,
        description: 'Browser flow test',
        start_time: new Date().toISOString(),
        is_running: true
      })
      .select(`
        *,
        projects(name, color)
      `)
      .single()
    
    if (startError) {
      console.error('❌ Timer start error:', startError)
      return
    }
    
    console.log('✅ Timer started successfully')
    console.log('   Start result projects field:', startResult.projects)
    
    // Step 4: Simulate Redux store (serialize/deserialize)
    console.log('\n4. Simulating Redux store serialization:')
    
    // This is what Redux does - it serializes the state
    const serialized = JSON.stringify(startResult)
    const deserialized = JSON.parse(serialized)
    
    console.log('   Original projects field:', startResult.projects)
    console.log('   After serialize/deserialize:', deserialized.projects)
    console.log('   Are they equal?', JSON.stringify(startResult.projects) === JSON.stringify(deserialized.projects))
    
    // Step 5: Simulate fetchActiveTimer
    console.log('\n5. Simulating fetchActiveTimer:')
    
    const { data: activeResult, error: activeError } = await supabase
      .from('time_entries')
      .select(`
        *,
        projects(name, color)
      `)
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
      .maybeSingle()
    
    if (activeError) {
      console.error('❌ Fetch active timer error:', activeError)
      return
    }
    
    console.log('✅ Active timer fetched')
    console.log('   Active result projects field:', activeResult?.projects)
    
    // Step 6: Simulate Redux store update with active timer
    console.log('\n6. Simulating Redux store with active timer:')
    
    const activeSerialized = JSON.stringify(activeResult)
    const activeDeserialized = JSON.parse(activeSerialized)
    
    console.log('   Original active projects field:', activeResult?.projects)
    console.log('   After serialize/deserialize:', activeDeserialized?.projects)
    
    // Step 7: Simulate TimerCard display logic
    console.log('\n7. Simulating TimerCard display logic:')
    
    const currentEntry = activeDeserialized
    const projectName = currentEntry?.projects?.name || currentEntry?.project?.name || 'Unknown Project'
    const projectColor = currentEntry?.projects?.color || currentEntry?.project?.color || '#3B82F6'
    
    console.log('   Display name:', projectName)
    console.log('   Display color:', projectColor)
    console.log('   Would show "Unknown Project"?', projectName === 'Unknown Project')
    
    // Step 8: Check for any subtle data type issues
    console.log('\n8. Checking data types and structure:')
    console.log('   typeof currentEntry:', typeof currentEntry)
    console.log('   typeof currentEntry.projects:', typeof currentEntry?.projects)
    console.log('   currentEntry.projects is null:', currentEntry?.projects === null)
    console.log('   currentEntry.projects is undefined:', currentEntry?.projects === undefined)
    console.log('   currentEntry.projects keys:', currentEntry?.projects ? Object.keys(currentEntry.projects) : 'N/A')
    
  } catch (err) {
    console.error('💥 Browser flow test failed:', err.message)
  }
}

testBrowserFlow().then(() => {
  console.log('\n🏁 Browser flow test completed')
  process.exit(0)
})