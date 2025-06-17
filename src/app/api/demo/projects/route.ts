import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const DEMO_USER_ID = 'a2e49074-96ff-490e-8e9d-ccac47707f83'

export async function GET() {
  try {
    console.log('Demo projects API called')
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...')
    console.log('SUPABASE_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const supabase = createClient(
      'https://dzffzvqrmhdlpmyvxriy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'
    )

    console.log('Querying projects for demo user:', DEMO_USER_ID)
    
    // Get projects for demo user
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .order('name')

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Projects fetched successfully:', projects?.length)
    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    console.error('Demo projects API error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}