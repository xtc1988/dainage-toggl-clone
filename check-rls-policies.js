// Check RLS policies that might affect project joins
const { createClient } = require('@supabase/supabase-js')

// Use service role key to check policies
const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'

const supabase = createClient(supabaseUrl, serviceRoleKey)

const DEMO_USER_ID = 'a2e49074-96ff-490e-8e9d-ccac47707f83'

async function checkRLSIssues() {
  try {
    console.log('🔍 Checking for RLS policy issues...')
    
    // Test 1: Try query with anon key (what the app uses)
    console.log('\n1. Testing with anon key (normal app access):')
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg')
    
    const { data: anonData, error: anonError } = await anonSupabase
      .from('time_entries')
      .select(`
        *,
        projects(name, color)
      `)
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
      .maybeSingle()
    
    if (anonError) {
      console.error('❌ Anon query error:', anonError)
    } else {
      console.log('✅ Anon query success:', anonData ? 'found active entry' : 'no active entry')
      if (anonData) {
        console.log('   Projects field:', anonData.projects)
      }
    }
    
    // Test 2: Start a timer with anon access and check immediately
    console.log('\n2. Testing timer start and immediate check with anon access:')
    
    // Stop any running timers first
    await anonSupabase
      .from('time_entries')
      .update({ end_time: new Date().toISOString(), is_running: false })
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
    
    // Start new timer
    const { data: startData, error: startError } = await anonSupabase
      .from('time_entries')
      .insert({
        user_id: DEMO_USER_ID,
        project_id: '94b9f83b-f9ca-4623-9002-936439b7d639',
        description: 'RLS test timer',
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
    } else {
      console.log('✅ Timer started with projects field:', startData.projects)
    }
    
    // Immediately check active timer
    const { data: checkData, error: checkError } = await anonSupabase
      .from('time_entries')
      .select(`
        *,
        projects(name, color)
      `)
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
      .maybeSingle()
    
    if (checkError) {
      console.error('❌ Immediate check error:', checkError)
    } else {
      console.log('✅ Immediate check projects field:', checkData?.projects)
    }
    
    // Test 3: Check if there's a timing issue (wait a moment)
    console.log('\n3. Testing after 1 second delay...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const { data: delayedData, error: delayedError } = await anonSupabase
      .from('time_entries')
      .select(`
        *,
        projects(name, color)
      `)
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
      .maybeSingle()
    
    if (delayedError) {
      console.error('❌ Delayed check error:', delayedError)
    } else {
      console.log('✅ Delayed check projects field:', delayedData?.projects)
    }
    
  } catch (err) {
    console.error('💥 RLS check failed:', err.message)
  }
}

checkRLSIssues().then(() => {
  console.log('\n🏁 RLS check completed')
  process.exit(0)
})