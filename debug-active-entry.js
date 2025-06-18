// Debug script to check active time entry and project join
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'

const supabase = createClient(supabaseUrl, supabaseKey)

const DEMO_USER_ID = 'a2e49074-96ff-490e-8e9d-ccac47707f83'

async function debugActiveEntry() {
  try {
    console.log('🔍 Debugging active time entry for demo user...')
    console.log('Demo User ID:', DEMO_USER_ID)
    
    // First, check what projects exist for the demo user
    console.log('\n1. Checking projects for demo user:')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
    } else {
      console.log('✅ Projects found:', projects.length)
      projects.forEach(p => console.log(`   - ${p.id}: ${p.name} (${p.color})`))
    }
    
    // Check all time entries for the demo user
    console.log('\n2. Checking all time entries for demo user:')
    const { data: allEntries, error: allEntriesError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .order('start_time', { ascending: false })
    
    if (allEntriesError) {
      console.error('❌ Error fetching time entries:', allEntriesError)
    } else {
      console.log('✅ Time entries found:', allEntries.length)
      allEntries.forEach(entry => {
        console.log(`   - ${entry.id}: project_id=${entry.project_id}, is_running=${entry.is_running}, start_time=${entry.start_time}`)
      })
    }
    
    // Check active time entry WITHOUT project join
    console.log('\n3. Checking active time entry WITHOUT project join:')
    const { data: activeEntry, error: activeError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
      .maybeSingle()
    
    if (activeError) {
      console.error('❌ Error fetching active entry:', activeError)
    } else if (activeEntry) {
      console.log('✅ Active entry found (no join):')
      console.log(JSON.stringify(activeEntry, null, 2))
    } else {
      console.log('⚠️  No active entry found')
    }
    
    // Check active time entry WITH project join
    console.log('\n4. Checking active time entry WITH project join:')
    const { data: activeEntryWithProject, error: activeProjectError } = await supabase
      .from('time_entries')
      .select(`
        *,
        projects(name, color)
      `)
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
      .maybeSingle()
    
    if (activeProjectError) {
      console.error('❌ Error fetching active entry with project:', activeProjectError)
    } else if (activeEntryWithProject) {
      console.log('✅ Active entry found (with project join):')
      console.log(JSON.stringify(activeEntryWithProject, null, 2))
    } else {
      console.log('⚠️  No active entry found with project join')
    }
    
    // Check if there's a project with the project_id from the active entry
    if (activeEntry && activeEntry.project_id) {
      console.log('\n5. Manually checking project for active entry:')
      const { data: manualProject, error: manualProjectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', activeEntry.project_id)
        .single()
      
      if (manualProjectError) {
        console.error('❌ Error fetching project manually:', manualProjectError)
      } else {
        console.log('✅ Project found manually:')
        console.log(JSON.stringify(manualProject, null, 2))
      }
    }
    
  } catch (err) {
    console.error('💥 Debug failed:', err.message)
  }
}

debugActiveEntry().then(() => {
  console.log('\n🏁 Debug completed')
  process.exit(0)
})