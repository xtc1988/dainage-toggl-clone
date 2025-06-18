// Stop the test timer we created
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'

const supabase = createClient(supabaseUrl, supabaseKey)
const DEMO_USER_ID = 'a2e49074-96ff-490e-8e9d-ccac47707f83'

async function stopTestTimer() {
  console.log('🛑 Stopping test timer...')
  
  const { error } = await supabase
    .from('time_entries')
    .update({
      end_time: new Date().toISOString(),
      is_running: false
    })
    .eq('user_id', DEMO_USER_ID)
    .eq('is_running', true)
  
  if (error) {
    console.error('❌ Error stopping timer:', error)
  } else {
    console.log('✅ Test timer stopped')
  }
}

stopTestTimer().then(() => process.exit(0))