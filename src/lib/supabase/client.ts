import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a single client instance
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

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
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      tasks(count),
      time_entries(count)
    `)
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    
  if (error) throw error
  return data
}

export const getTimeEntries = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      projects(name, color),
      tasks(name, task_type)
    `)
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(limit)
    
  if (error) throw error
  return data
}

export const getActiveTimeEntry = async (userId: string) => {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      projects(name, color),
      tasks(name, task_type)
    `)
    .eq('user_id', userId)
    .eq('is_running', true)
    .maybeSingle()
    
  if (error) throw error
  return data
}

export const startTimer = async (userId: string, projectId: string, taskId?: string, description?: string) => {
  // First, stop any running timers
  await stopAllRunningTimers(userId)
  
  const { data, error } = await supabase
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
      projects(name, color),
      tasks(name, task_type)
    `)
    .single()
    
  if (error) throw error
  return data
}

export const stopTimer = async (entryId: string) => {
  const { data, error } = await supabase
    .from('time_entries')
    .update({
      end_time: new Date().toISOString(),
      is_running: false
    })
    .eq('id', entryId)
    .select(`
      *,
      projects(name, color),
      tasks(name, task_type)
    `)
    .single()
    
  if (error) throw error
  return data
}

export const stopAllRunningTimers = async (userId: string) => {
  const { error } = await supabase
    .from('time_entries')
    .update({
      end_time: new Date().toISOString(),
      is_running: false
    })
    .eq('user_id', userId)
    .eq('is_running', true)
    
  if (error) throw error
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
    .order('created_at', { ascending: false })
    
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
      projects(name, color),
      tasks(name, task_type)
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
      tasks(count),
      time_entries(count)
    `)
    .eq('team_id', teamId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    
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
      projects(name, color),
      tasks(name, task_type)
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