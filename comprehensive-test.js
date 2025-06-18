// Comprehensive test to reproduce the "Unknown Project" issue
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'

const supabase = createClient(supabaseUrl, supabaseKey)

const DEMO_USER_ID = 'a2e49074-96ff-490e-8e9d-ccac47707f83'
const PROJECT_ID = '94b9f83b-f9ca-4623-9002-936439b7d639' // ウェブサイト開発

async function comprehensiveTest() {
  try {
    console.log('🧪 Starting comprehensive test to reproduce "Unknown Project" issue...')
    
    // Test 1: Simulate the exact useTimeEntries flow
    console.log('\n1. Testing useTimeEntries flow:')
    
    // Clean up first
    await supabase
      .from('time_entries')
      .update({ end_time: new Date().toISOString(), is_running: false })
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
    
    // Start a timer using startTimer function flow
    const { data: startData, error: startError } = await supabase
      .from('time_entries')
      .insert({
        user_id: DEMO_USER_ID,
        project_id: PROJECT_ID,
        description: 'Comprehensive test timer',
        start_time: new Date().toISOString(),
        is_running: true
      })
      .select(`
        *,
        projects(name, color)
      `)
      .single()
    
    if (startError) {
      console.error('❌ Error starting timer:', startError)
      return
    }
    
    console.log('✅ Timer started. Project data:', startData.projects)
    
    // Test 2: Simulate useTimeEntries query (with date filter)
    console.log('\n2. Testing useTimeEntries query with date filter:')
    const today = new Date().toISOString().split('T')[0]
    const startOfDay = `${today}T00:00:00.000Z`
    const endOfDay = `${today}T23:59:59.999Z`
    
    const { data: timeEntriesData, error: timeEntriesError } = await supabase
      .from('time_entries')
      .select(`
        *,
        projects(name, color)
      `)
      .eq('user_id', DEMO_USER_ID)
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .order('start_time', { ascending: false })
    
    if (timeEntriesError) {
      console.error('❌ Error fetching time entries:', timeEntriesError)
    } else {
      console.log('✅ Time entries fetched:', timeEntriesData.length)
      timeEntriesData.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.is_running ? 'RUNNING' : 'STOPPED'}: projects = ${JSON.stringify(entry.projects)}`)
      })
    }
    
    // Test 3: Test fetchActiveTimer flow 
    console.log('\n3. Testing fetchActiveTimer flow:')
    const { data: activeData, error: activeError } = await supabase
      .from('time_entries')
      .select(`
        *,
        projects(name, color)
      `)
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
      .maybeSingle()
    
    if (activeError) {
      console.error('❌ Error fetching active timer:', activeError)
    } else if (activeData) {
      console.log('✅ Active timer found. Project data:', activeData.projects)
    } else {
      console.log('⚠️  No active timer found')
    }
    
    // Test 4: Test multiple concurrent queries (race condition?)
    console.log('\n4. Testing concurrent queries (potential race condition):')
    const promises = Array(5).fill().map(async (_, i) => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          projects(name, color)
        `)
        .eq('user_id', DEMO_USER_ID)
        .eq('is_running', true)
        .maybeSingle()
      
      return { index: i, data, error }
    })
    
    const results = await Promise.all(promises)
    results.forEach(({ index, data, error }) => {
      if (error) {
        console.log(`   Query ${index}: ERROR - ${error.message}`)
      } else if (data) {
        console.log(`   Query ${index}: SUCCESS - projects = ${JSON.stringify(data.projects)}`)
      } else {
        console.log(`   Query ${index}: NO DATA`)
      }
    })
    
    // Test 5: Test after a delay (timing issue?)
    console.log('\n5. Testing after 2 second delay:')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const { data: delayedData, error: delayedError } = await supabase
      .from('time_entries')
      .select(`
        *,
        projects(name, color)
      `)
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
      .maybeSingle()
    
    if (delayedError) {
      console.error('❌ Error after delay:', delayedError)
    } else if (delayedData) {
      console.log('✅ After delay. Project data:', delayedData.projects)
    } else {
      console.log('⚠️  No active timer after delay')
    }
    
    // Test 6: Test project existence directly
    console.log('\n6. Testing direct project query:')
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', PROJECT_ID)
      .single()
    
    if (projectError) {
      console.error('❌ Project query error:', projectError)
    } else {
      console.log('✅ Project exists:', projectData.name, projectData.color)
    }
    
    // Test 7: Test without join, then manual join
    console.log('\n7. Testing manual join approach:')
    const { data: entryOnly, error: entryError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
      .maybeSingle()
    
    if (entryError) {
      console.error('❌ Entry-only query error:', entryError)
    } else if (entryOnly) {
      console.log('✅ Entry found without join. project_id:', entryOnly.project_id)
      
      const { data: manualProject, error: manualError } = await supabase
        .from('projects')
        .select('name, color')
        .eq('id', entryOnly.project_id)
        .single()
      
      if (manualError) {
        console.error('❌ Manual project query error:', manualError)
      } else {
        console.log('✅ Manual project query success:', manualProject)
      }
    }
    
  } catch (err) {
    console.error('💥 Comprehensive test failed:', err.message)
  }
}

comprehensiveTest().then(() => {
  console.log('\n🏁 Comprehensive test completed')
  process.exit(0)
})