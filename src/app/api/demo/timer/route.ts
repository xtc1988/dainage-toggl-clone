import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const DEMO_USER_ID = 'a2e49074-96ff-490e-8e9d-ccac47707f83'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, ...data } = body

    // Create Supabase admin client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    switch (action) {
      case 'start': {
        const { projectId, description } = data
        
        // Stop any running timers for demo user
        await supabase
          .from('time_entries')
          .update({ 
            is_running: false,
            end_time: new Date().toISOString(),
            duration: 0 // Will be calculated by trigger
          })
          .eq('user_id', DEMO_USER_ID)
          .eq('is_running', true)

        // Start new timer
        const { data: newTimer, error } = await supabase
          .from('time_entries')
          .insert({
            user_id: DEMO_USER_ID,
            project_id: projectId,
            description: description || 'Working...',
            start_time: new Date().toISOString(),
            is_running: true
          })
          .select('*')
          .single()

        if (error) throw error

        return NextResponse.json({ success: true, data: newTimer })
      }

      case 'stop': {
        const { timerId } = data

        const { data: stoppedTimer, error } = await supabase
          .from('time_entries')
          .update({
            is_running: false,
            end_time: new Date().toISOString()
          })
          .eq('id', timerId)
          .eq('user_id', DEMO_USER_ID)
          .select('*')
          .single()

        if (error) throw error

        return NextResponse.json({ success: true, data: stoppedTimer })
      }

      case 'get_running': {
        const { data: runningTimer, error } = await supabase
          .from('time_entries')
          .select(`
            *,
            project:projects(id, name, color)
          `)
          .eq('user_id', DEMO_USER_ID)
          .eq('is_running', true)
          .maybeSingle()

        if (error) throw error

        return NextResponse.json({ success: true, data: runningTimer })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Demo timer API error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current running timer for demo user
    const { data: runningTimer, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        project:projects(id, name, color)
      `)
      .eq('user_id', DEMO_USER_ID)
      .eq('is_running', true)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({ success: true, data: runningTimer })
  } catch (error) {
    console.error('Demo timer API error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}