'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useSupabase } from '@/lib/supabase/provider'
import type { Project } from '@/types'
import { timerLogger } from '@/lib/logger'

export function useProjects() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  const fetchProjects = async () => {
    timerLogger.info('fetchProjects called', { userId: user?.id, hasSupabase: !!supabase })
    
    if (!user?.id) {
      timerLogger.error('No user ID available', new Error('No user'))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // デモユーザーの場合はAPIエンドポイントを使用
      if (user.id === 'a2e49074-96ff-490e-8e9d-ccac47707f83') {
        timerLogger.info('Using demo API for projects')
        const response = await fetch('/api/demo/projects')
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error)
        }
        
        timerLogger.info('Successfully fetched projects from demo API', { 
          count: result.data?.length || 0
        })
        setProjects((result.data || []) as unknown as Project[])
        setInitialLoadComplete(true)
        setError(null)
        return
      }
      
      // 通常ユーザーの場合
      if (!supabase) {
        timerLogger.error('Supabase client not available', new Error('No supabase'))
        setLoading(false)
        return
      }
      
      timerLogger.info('Querying database for projects', { userId: user.id })
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        timerLogger.error('Database query error', error)
        throw error
      }

      timerLogger.info('Successfully fetched projects from database', { 
        count: data?.length || 0, 
        projects: data,
        userId: user.id 
      })
      setProjects((data || []) as unknown as Project[])
      setInitialLoadComplete(true)
      
      setError(null)
    } catch (err) {
      console.error('Error in fetchProjects:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
      setInitialLoadComplete(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    timerLogger.info('useProjects useEffect triggered', { 
      hasSupabase: !!supabase, 
      hasUser: !!user,
      userId: user?.id || 'NO USER ID',
      userEmail: user?.email || 'NO EMAIL'
    })
    
    // ユーザーIDが確実に取得できてから読み込む
    if (supabase && user?.id) {
      timerLogger.info('User ID confirmed, fetching projects', { userId: user.id })
      fetchProjects()
    } else {
      timerLogger.warn('Cannot fetch projects yet', {
        supabaseReady: !!supabase,
        userReady: !!user?.id
      })
    }
  }, [supabase, user?.id])

  const createProject = async (projectData: { name: string; color: string; is_archived?: boolean }) => {
    if (!user?.id || !supabase) {
      timerLogger.error('Cannot create project: missing user or supabase', new Error('Missing dependencies'), { hasUser: !!user?.id, hasSupabase: !!supabase })
      return
    }

    timerLogger.info('Creating project', { projectData, userId: user.id })

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name: projectData.name,
            color: projectData.color,
            user_id: user.id,
          }
        ])
        .select()
        .single()

      if (error) {
        timerLogger.error('Supabase project creation error', error, { projectData })
        throw error
      }

      timerLogger.info('Project created in database', data)

      // Update local state
      setProjects(prev => {
        const newProjects = [data as unknown as Project, ...prev]
        timerLogger.info('Updated projects state', { 
          previousCount: prev.length, 
          newCount: newProjects.length,
          newProject: data 
        })
        return newProjects
      })

      // Also refetch from database to ensure consistency
      timerLogger.info('Refetching projects after creation')
      setTimeout(() => fetchProjects(), 100)

      return data as unknown as Project
    } catch (err) {
      timerLogger.error('Error creating project', err as Error, { projectData })
      throw err
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!supabase || !user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setProjects(prev => 
        prev.map(project => 
          project.id === id ? { ...project, ...(data as unknown as Project) } : project
        )
      )
      return data as unknown as Project
    } catch (err) {
      console.error('Error updating project:', err)
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    if (!supabase || !user?.id) return
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setProjects(prev => prev.filter(project => project.id !== id))
    } catch (err) {
      console.error('Error deleting project:', err)
      throw err
    }
  }

  return {
    projects,
    loading,
    error,
    initialLoadComplete,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  }
}