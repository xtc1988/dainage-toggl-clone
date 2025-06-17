import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { timerLogger } from '../logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a function to get fresh supabase client
export const getSupabaseClient = () => {
  return createClientComponentClient<Database>()
}

// Use auth helpers client for authentication-aware operations
export const supabase = getSupabaseClient()

// Fallback client for non-auth operations
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role key (only for server operations)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)


// Type-safe query helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error) throw error
  return data
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getProjects = async (userId: string) => {
  // デモユーザーの場合はAPIエンドポイントを使用
  if (userId === 'a2e49074-96ff-490e-8e9d-ccac47707f83') {
    console.log('🎯 Using demo API for projects')
    const response = await fetch('/api/demo/projects')
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result.data
  }
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    
  if (error) throw error
  return data
}

export const getTimeEntries = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      projects(name, color)
    `)
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(limit)
    
  if (error) throw error
  return data
}

export const getActiveTimeEntry = async (userId: string) => {
  const supabaseClient = getSupabaseClient()
  
  console.log('🔥 getActiveTimeEntry for user:', userId)
  
  // デモユーザーの場合はAPIエンドポイントを使用
  if (userId === 'a2e49074-96ff-490e-8e9d-ccac47707f83') {
    console.log('🎯 Using demo API for active timer')
    const response = await fetch('/api/demo/timer')
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    console.log('🔥 Demo active time entry result:', result.data)
    return result.data
  }
  
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

export const startTimer = async (userId: string, projectId: string, taskId?: string, description?: string) => {
  timerLogger.info('startTimer client function called', { userId, projectId, taskId, description })
  
  // デモユーザーの場合はAPIエンドポイントを使用
  if (userId === 'a2e49074-96ff-490e-8e9d-ccac47707f83') {
    timerLogger.info('Using demo API for start timer')
    try {
      const response = await fetch('/api/demo/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          projectId,
          description
        })
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error)
      }
      
      timerLogger.info('Demo timer started successfully', result.data)
      return result.data
    } catch (error) {
      timerLogger.error('Demo API failed', error as Error)
      throw error
    }
  }
  
  try {
    // Get fresh supabase client
    const supabaseClient = getSupabaseClient()
    
    // First, stop any running timers
    console.log('🔥 Stopping all running timers for user:', userId)
    await stopAllRunningTimers(userId)
    
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
      console.error('🔥 Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Enhanced error message
      const enhancedError = new Error(`Supabase Error: ${error.message} (Code: ${error.code})`)
      enhancedError.name = 'SupabaseError'
      throw enhancedError
    }
    
    console.log('🔥 Successfully created time entry:', data)
    return data
  } catch (error) {
    console.error('🔥 startTimer error:', error)
    throw error
  }
}

export const stopTimer = async (entryId: string) => {
  // デモユーザーの場合はAPIエンドポイントを使用（entryIdでデモユーザーかどうか判定は困難なので、別の方法を使用）
  const response = await fetch('/api/demo/timer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'stop',
      timerId: entryId
    })
  })
  
  if (response.ok) {
    const result = await response.json()
    if (result.success) {
      console.log('🎯 Demo timer stopped via API')
      return result.data
    }
  }
  
  // 通常のユーザーの場合
  const { data, error } = await supabase
    .from('time_entries')
    .update({
      end_time: new Date().toISOString(),
      is_running: false
    })
    .eq('id', entryId)
    .select(`
      *,
      projects(name, color)
    `)
    .single()
    
  if (error) throw error
  return data
}

export const stopAllRunningTimers = async (userId: string) => {
  const supabaseClient = getSupabaseClient()
  
  console.log('🔥 stopAllRunningTimers for user:', userId)
  const { error } = await supabaseClient
    .from('time_entries')
    .update({
      end_time: new Date().toISOString(),
      is_running: false
    })
    .eq('user_id', userId)
    .eq('is_running', true)
    
  if (error) {
    console.error('🔥 Error stopping running timers:', error)
    throw error
  }
  console.log('🔥 Successfully stopped all running timers')
}

export const createProject = async (userId: string, projectData: {
  name: string
  description?: string
  color: string
  team_id?: string
}) => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      ...projectData
    })
    .select()
    .single()
    
  if (error) throw error
  return data
}

export const updateProject = async (projectId: string, updates: {
  name?: string
  description?: string
  color?: string
}) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()
    
  if (error) throw error
  return data
}

export const deleteProject = async (projectId: string) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    
  if (error) throw error
}

export const createTask = async (taskData: {
  project_id: string
  name: string
  description?: string
  task_type: string
  estimated_hours?: number
  git_branch?: string
  external_ticket_id?: string
  external_ticket_url?: string
}) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single()
    
  if (error) throw error
  return data
}

export const getTasks = async (projectId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    
  if (error) throw error
  return data
}

export const updateTimeEntry = async (entryId: string, updates: {
  project_id?: string
  task_id?: string
  description?: string
  start_time?: string
  end_time?: string
  tags?: string[]
}) => {
  const { data, error } = await supabase
    .from('time_entries')
    .update(updates)
    .eq('id', entryId)
    .select(`
      *,
      projects(name, color)
    `)
    .single()
    
  if (error) throw error
  return data
}

export const deleteTimeEntry = async (entryId: string) => {
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId)
    
  if (error) throw error
}

// Team-related functions
export const getUserTeams = async (userId: string) => {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      teams(*)
    `)
    .eq('user_id', userId)
    
  if (error) throw error
  return data
}

export const getTeamProjects = async (teamId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      time_entries(count)
    `)
    .eq('team_id', teamId)
    
  if (error) throw error
  return data
}

// Reporting functions
export const getTimeReportData = async (
  userId: string,
  startDate: string,
  endDate: string,
  projectIds?: string[]
) => {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      projects(name, color)
    `)
    .eq('user_id', userId)
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .not('duration', 'is', null)
    
  if (projectIds && projectIds.length > 0) {
    query = query.in('project_id', projectIds)
  }
  
  const { data, error } = await query.order('start_time', { ascending: false })
  
  if (error) throw error
  return data
}

export const getDailyTimeStats = async (userId: string, date: string) => {
  const startOfDay = `${date}T00:00:00.000Z`
  const endOfDay = `${date}T23:59:59.999Z`
  
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      duration,
      projects(name, color)
    `)
    .eq('user_id', userId)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .not('duration', 'is', null)
    
  if (error) throw error
  return data
}

// Real-time subscriptions
export const subscribeToTimeEntries = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('time_entries')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'time_entries',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToProjects = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('projects')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// Utility functions
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

export const parseDuration = (duration: string): number => {
  const parts = duration.split(':').map(Number)
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return 0
}