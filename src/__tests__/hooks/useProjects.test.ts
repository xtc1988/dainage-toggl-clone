import { renderHook, act, waitFor } from '@testing-library/react'
import { useProjects } from '@/hooks/useProjects'

// Mock useAuth hook
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
}

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser
  })
}))

// Mock useSupabase hook
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }))
}

jest.mock('@/lib/supabase/provider', () => ({
  useSupabase: () => ({
    supabase: mockSupabase
  })
}))

describe('useProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns initial state', () => {
    const { result } = renderHook(() => useProjects())

    expect(result.current.loading).toBe(true)
    expect(result.current.projects).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('provides CRUD functions', () => {
    const { result } = renderHook(() => useProjects())

    expect(typeof result.current.createProject).toBe('function')
    expect(typeof result.current.updateProject).toBe('function')
    expect(typeof result.current.deleteProject).toBe('function')
    expect(typeof result.current.refetch).toBe('function')
  })

  it('fetches projects on mount', async () => {
    const mockProjects = [
      {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test description',
        color: '#3B82F6',
        user_id: 'test-user-id',
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    mockSupabase.from().single.mockResolvedValueOnce({
      data: mockProjects,
      error: null
    })

    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('handles database errors gracefully', async () => {
    const mockError = new Error('Database connection failed')
    mockSupabase.from().single.mockRejectedValueOnce(mockError)

    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should fallback to dummy data when database fails
    expect(result.current.projects).toHaveLength(1)
    expect(result.current.projects[0].name).toBe('サンプルプロジェクト')
  })

  it('provides dummy projects when no user is logged in', async () => {
    // Mock no user scenario
    jest.mock('@/hooks/useAuth', () => ({
      useAuth: () => ({
        user: null
      })
    }))

    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.projects).toHaveLength(2)
    expect(result.current.projects[0].name).toBe('サンプルプロジェクト')
    expect(result.current.projects[1].name).toBe('ウェブサイト開発')
  })

  it('creates new project', async () => {
    const newProject = {
      name: 'New Project',
      description: 'New project description',
      color: '#10B981',
      is_archived: false
    }

    const createdProject = {
      id: 'new-project-id',
      ...newProject,
      user_id: 'test-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockSupabase.from().single.mockResolvedValueOnce({
      data: createdProject,
      error: null
    })

    const { result } = renderHook(() => useProjects())

    await act(async () => {
      const result_project = await result.current.createProject(newProject)
      expect(result_project).toEqual(createdProject)
    })
  })

  it('updates existing project', async () => {
    const projectId = 'project-1'
    const updates = {
      name: 'Updated Project Name',
      color: '#EF4444'
    }

    const updatedProject = {
      id: projectId,
      name: 'Updated Project Name',
      description: 'Original description',
      color: '#EF4444',
      user_id: 'test-user-id',
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockSupabase.from().single.mockResolvedValueOnce({
      data: updatedProject,
      error: null
    })

    const { result } = renderHook(() => useProjects())

    await act(async () => {
      const result_project = await result.current.updateProject(projectId, updates)
      expect(result_project).toEqual(updatedProject)
    })
  })

  it('deletes project', async () => {
    const projectId = 'project-1'

    mockSupabase.from().delete.mockResolvedValueOnce({
      error: null
    })

    const { result } = renderHook(() => useProjects())

    await act(async () => {
      await result.current.deleteProject(projectId)
    })

    expect(mockSupabase.from().delete).toHaveBeenCalled()
  })

  it('handles create project error', async () => {
    const newProject = {
      name: 'New Project',
      description: 'New project description',
      color: '#10B981',
      is_archived: false
    }

    const mockError = new Error('Failed to create project')
    mockSupabase.from().single.mockRejectedValueOnce(mockError)

    const { result } = renderHook(() => useProjects())

    await act(async () => {
      try {
        await result.current.createProject(newProject)
      } catch (error) {
        expect(error).toEqual(mockError)
      }
    })
  })
})