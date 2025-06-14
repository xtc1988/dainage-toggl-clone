'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase/client'
import type { Project } from '@/types'

export function useProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    if (!user?.id) {
      setProjects([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setProjects(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [user?.id])

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return

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

      setProjects(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating project:', err)
      throw err
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setProjects(prev => 
        prev.map(project => 
          project.id === id ? { ...project, ...data } : project
        )
      )
      return data
    } catch (err) {
      console.error('Error updating project:', err)
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

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