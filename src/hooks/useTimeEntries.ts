'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useSupabase } from '@/lib/supabase/provider'
import { timerLogger } from '@/lib/logger'

export interface TimeEntry {
  id: string
  user_id: string
  project_id: string
  description?: string
  start_time: string
  end_time?: string
  duration?: number
  is_running: boolean
  projects?: {
    name: string
    color: string
  }
}

export function useTimeEntries(selectedDate?: string) {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeEntries = async () => {
    if (!user?.id || !supabase) {
      timerLogger.warn('Cannot fetch time entries: missing user or supabase', {
        hasUser: !!user?.id,
        hasSupabase: !!supabase
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      timerLogger.info('Fetching time entries from database', { 
        userId: user.id, 
        selectedDate 
      })

      let query = supabase
        .from('time_entries')
        .select(`
          *,
          projects(name, color)
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })

      // Filter by date if provided
      if (selectedDate) {
        const startOfDay = `${selectedDate}T00:00:00.000Z`
        const endOfDay = `${selectedDate}T23:59:59.999Z`
        query = query
          .gte('start_time', startOfDay)
          .lte('start_time', endOfDay)
      }

      const { data, error } = await query

      if (error) {
        timerLogger.error('Database query error for time entries', error)
        throw error
      }

      timerLogger.info('Successfully fetched time entries from database', { 
        count: data?.length || 0, 
        entries: data,
        userId: user.id 
      })

      setEntries((data || []) as TimeEntry[])
      setError(null)
    } catch (err) {
      console.error('Error in fetchTimeEntries:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch time entries')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    timerLogger.info('useTimeEntries useEffect triggered', { 
      hasSupabase: !!supabase, 
      hasUser: !!user,
      userId: user?.id || 'NO USER ID',
      selectedDate
    })
    
    if (supabase && user?.id) {
      fetchTimeEntries()
    } else {
      timerLogger.warn('Cannot fetch time entries yet', {
        supabaseReady: !!supabase,
        userReady: !!user?.id
      })
    }
  }, [supabase, user?.id, selectedDate])

  const deleteTimeEntry = async (entryId: string) => {
    if (!user?.id || !supabase) return

    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setEntries(prev => prev.filter(entry => entry.id !== entryId))
      timerLogger.info('Time entry deleted', { entryId })
    } catch (err) {
      timerLogger.error('Error deleting time entry', err as Error, { entryId })
      throw err
    }
  }

  const updateTimeEntry = async (entryId: string, updates: Partial<TimeEntry>) => {
    if (!user?.id || !supabase) return

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', entryId)
        .eq('user_id', user.id)
        .select(`
          *,
          projects(name, color)
        `)
        .single()

      if (error) {
        throw error
      }

      setEntries(prev => 
        prev.map(entry => 
          entry.id === entryId ? { ...entry, ...(data as TimeEntry) } : entry
        )
      )

      timerLogger.info('Time entry updated', { entryId, updates })
      return data as TimeEntry
    } catch (err) {
      timerLogger.error('Error updating time entry', err as Error, { entryId, updates })
      throw err
    }
  }

  const getTotalDuration = (): number => {
    return entries.reduce((sum, entry) => {
      if (entry.is_running) {
        // Calculate current duration for running entries
        const start = new Date(entry.start_time)
        const now = new Date()
        return sum + Math.floor((now.getTime() - start.getTime()) / 1000)
      }
      return sum + (entry.duration || 0)
    }, 0)
  }

  return {
    entries,
    loading,
    error,
    deleteTimeEntry,
    updateTimeEntry,
    getTotalDuration,
    refetch: fetchTimeEntries,
  }
}