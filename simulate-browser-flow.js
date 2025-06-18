// Simulate the exact browser flow to reproduce the "Unknown Project" issue
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'

const supabase = createClient(supabaseUrl, supabaseKey)

const DEMO_USER_ID = 'a2e49074-96ff-490e-8e9d-ccac47707f83'
const PROJECT_ID = '94b9f83b-f9ca-4623-9002-936439b7d639' // ウェブサイト開発

// Simulate the exact functions from client.ts
const getSupabaseClient = () => supabase

const startTimer = async (userId, projectId, taskId, description) => {
  console.log('🔥 startTimer client function called', { userId, projectId, taskId, description })
  
  try {
    // Get fresh supabase client
    const supabaseClient = getSupabaseClient()
    
    // First, stop any running timers
    console.log('🔥 Stopping all running timers for user:', userId)
    const { error: stopError } = await supabaseClient
      .from('time_entries')
      .update({
        end_time: new Date().toISOString(),
        is_running: false
      })
      .eq('user_id', userId)
      .eq('is_running', true)
    
    if (stopError) {
      console.error('🔥 Error stopping running timers:', stopError)
      throw stopError
    }
    console.log('🔥 Successfully stopped all running timers')

    console.log('🔥 Creating new time entry...')
    const { data, error } = await supabaseClient
      .from('time_entries')
      .insert({
        user_id: userId,
        project_id: projectId,
        task_id: taskId,
        description,
        start_time: new Date().toISOString(),
        is_running: true
      })
      .select(`
        *,
        projects(name, color)
      `)
      .single()
      
    if (error) {
      console.error('🔥 Error inserting time entry:', error)
      throw error
    }
    
    console.log('🔥 Successfully created time entry:', data)
    return data
  } catch (error) {
    console.error('🔥 startTimer error:', error)
    throw error
  }
}

const getActiveTimeEntry = async (userId) => {
  const supabaseClient = getSupabaseClient()
  
  console.log('🔥 getActiveTimeEntry for user:', userId)
  
  const { data, error } = await supabaseClient
    .from('time_entries')
    .select(`
      *,
      projects(name, color)
    `)
    .eq('user_id', userId)
    .eq('is_running', true)
    .maybeSingle()
    
  if (error) {
    console.error('🔥 Error getting active time entry:', error)
    throw error
  }
  
  console.log('🔥 Active time entry result:', data)
  return data
}

async function simulateBrowserFlow() {
  try {
    console.log('🌐 Simulating exact browser flow...')
    
    // Step 1: Start timer (like clicking start button)
    console.log('\n1. Starting timer (startTimerAsync)...')
    const startResult = await startTimer(DEMO_USER_ID, PROJECT_ID, undefined, 'Browser simulation test')
    
    console.log('\n1.1 Start result:')
    console.log('  - Project data in result:', startResult.projects)
    console.log('  - Will Redux store this correctly?')
    
    // Step 2: Fetch active timer (like fetchActiveTimer)
    console.log('\n2. Fetching active timer (fetchActiveTimer)...')
    const activeResult = await getActiveTimeEntry(DEMO_USER_ID)
    
    console.log('\n2.1 Active result:')
    console.log('  - Project data in result:', activeResult?.projects)
    
    // Step 3: Simulate TimerCard display logic
    console.log('\n3. Simulating TimerCard display logic...')
    if (activeResult) {
      const projectName = activeResult.projects?.name || activeResult.project?.name || 'Unknown Project'
      const projectColor = activeResult.projects?.color || activeResult.project?.color || '#3B82F6'
      
      console.log('  - Display name:', projectName)
      console.log('  - Display color:', projectColor)
      console.log('  - Would show "Unknown Project"?', projectName === 'Unknown Project')
    }
    
    // Step 4: Check for any data structure issues
    console.log('\n4. Data structure analysis:')
    console.log('  - activeResult type:', typeof activeResult)
    console.log('  - activeResult is null:', activeResult === null)
    console.log('  - activeResult.projects exists:', !!activeResult?.projects)
    console.log('  - activeResult.projects structure:')
    console.log('    ', JSON.stringify(activeResult?.projects, null, 4))
    
  } catch (err) {
    console.error('💥 Simulation failed:', err.message)
  }
}

simulateBrowserFlow().then(() => {
  console.log('\n🏁 Simulation completed')
  process.exit(0)
})