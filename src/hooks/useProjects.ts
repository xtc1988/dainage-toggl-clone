'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useSupabase } from '@/lib/supabase/provider'
import type { Project } from '@/types'

export function useProjects() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    if (!user?.id) {
      // Provide dummy projects for testing when no user
      setProjects([
        {
          id: 'dummy-1',
          name: 'サンプルプロジェクト',
          description: 'デモ用プロジェクト',
          color: '#3B82F6',
          user_id: 'test-user',
          team_id: undefined,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'dummy-2',
          name: 'ウェブサイト開発',
          description: 'フロントエンド開発',
          color: '#10B981',
          user_id: 'test-user',
          team_id: undefined,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Try to fetch from database, but provide fallback dummy data
      try {
        if (!supabase) {
          throw new Error('Supabase client not initialized')
        }
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        setProjects((data || []) as unknown as Project[])
      } catch (dbError) {
        console.warn('Projects table may not exist, using dummy data:', dbError)
        // Provide dummy projects for testing
        setProjects([
          {
            id: 'dummy-1',
            name: 'サンプルプロジェクト',
            description: 'デモ用プロジェクト',
            color: '#3B82F6',
            user_id: user.id,
            team_id: undefined,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
      }
      
      setError(null)
    } catch (err) {
      console.error('Error in fetchProjects:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [user?.id])

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id || !supabase) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            ...projectData,
            user_id: user.id,
          }
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      setProjects(prev => [data as unknown as Project, ...prev])
      return data as unknown as Project
    } catch (err) {
      console.error('Error creating project:', err)
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
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  }
}