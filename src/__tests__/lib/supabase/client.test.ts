import {
  startTimer,
  stopTimer,
  getActiveTimeEntry,
  createProject,
  updateProject,
  deleteProject,
  formatDuration,
  parseDuration
} from '@/lib/supabase/client'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  })),
  auth: {
    getUser: jest.fn()
  }
}

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => mockSupabaseClient
}))

describe('Supabase Client Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Timer Functions', () => {
    it('starts timer correctly', async () => {
      const mockTimeEntry = {
        id: 'entry-1',
        user_id: 'user-1',
        project_id: 'project-1',
        start_time: new Date().toISOString(),
        is_running: true,
        projects: { name: 'Test Project', color: '#3B82F6' }
      }

      mockSupabaseClient.from().single.mockResolvedValueOnce({
        data: mockTimeEntry,
        error: null
      })

      const result = await startTimer('user-1', 'project-1', undefined, 'Test description')

      expect(result).toEqual(mockTimeEntry)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('time_entries')
    })

    it('stops timer correctly', async () => {
      const mockTimeEntry = {
        id: 'entry-1',
        user_id: 'user-1',
        project_id: 'project-1',
        start_time: new Date(Date.now() - 5000).toISOString(),
        end_time: new Date().toISOString(),
        is_running: false,
        duration: 5
      }

      mockSupabaseClient.from().single.mockResolvedValueOnce({
        data: mockTimeEntry,
        error: null
      })

      const result = await stopTimer('entry-1')

      expect(result).toEqual(mockTimeEntry)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('time_entries')
    })

    it('gets active time entry', async () => {
      const mockActiveEntry = {
        id: 'entry-1',
        user_id: 'user-1',
        project_id: 'project-1',
        start_time: new Date().toISOString(),
        is_running: true,
        projects: { name: 'Test Project', color: '#3B82F6' }
      }

      mockSupabaseClient.from().maybeSingle.mockResolvedValueOnce({
        data: mockActiveEntry,
        error: null
      })

      const result = await getActiveTimeEntry('user-1')

      expect(result).toEqual(mockActiveEntry)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('time_entries')
    })

    it('returns null when no active timer', async () => {
      mockSupabaseClient.from().maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      })

      const result = await getActiveTimeEntry('user-1')

      expect(result).toBeNull()
    })
  })

  describe('Project Functions', () => {
    it('creates project correctly', async () => {
      const projectData = {
        name: 'New Project',
        description: 'Project description',
        color: '#3B82F6'
      }

      const mockProject = {
        id: 'project-1',
        user_id: 'user-1',
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabaseClient.from().single.mockResolvedValueOnce({
        data: mockProject,
        error: null
      })

      const result = await createProject('user-1', projectData)

      expect(result).toEqual(mockProject)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects')
    })

    it('updates project correctly', async () => {
      const updates = {
        name: 'Updated Project',
        color: '#10B981'
      }

      const mockUpdatedProject = {
        id: 'project-1',
        user_id: 'user-1',
        name: 'Updated Project',
        description: 'Original description',
        color: '#10B981',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabaseClient.from().single.mockResolvedValueOnce({
        data: mockUpdatedProject,
        error: null
      })

      const result = await updateProject('project-1', updates)

      expect(result).toEqual(mockUpdatedProject)
    })

    it('deletes project correctly', async () => {
      mockSupabaseClient.from().delete.mockResolvedValueOnce({
        error: null
      })

      await deleteProject('project-1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects')
    })
  })

  describe('Utility Functions', () => {
    it('formats duration correctly', () => {
      expect(formatDuration(0)).toBe('0:00')
      expect(formatDuration(30)).toBe('0:30')
      expect(formatDuration(60)).toBe('1:00')
      expect(formatDuration(125)).toBe('2:05')
      expect(formatDuration(3661)).toBe('1:01:01')
      expect(formatDuration(7323)).toBe('2:02:03')
    })

    it('parses duration correctly', () => {
      expect(parseDuration('0:00')).toBe(0)
      expect(parseDuration('0:30')).toBe(30)
      expect(parseDuration('1:00')).toBe(60)
      expect(parseDuration('2:05')).toBe(125)
      expect(parseDuration('1:01:01')).toBe(3661)
      expect(parseDuration('2:02:03')).toBe(7323)
    })

    it('handles invalid duration strings', () => {
      expect(parseDuration('')).toBe(0)
      expect(parseDuration('invalid')).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('throws error when start timer fails', async () => {
      const mockError = new Error('Database error')
      mockSupabaseClient.from().single.mockResolvedValueOnce({
        data: null,
        error: mockError
      })

      await expect(startTimer('user-1', 'project-1')).rejects.toThrow('Database error')
    })

    it('throws error when stop timer fails', async () => {
      const mockError = new Error('Database error')
      mockSupabaseClient.from().single.mockResolvedValueOnce({
        data: null,
        error: mockError
      })

      await expect(stopTimer('entry-1')).rejects.toThrow('Database error')
    })

    it('throws error when create project fails', async () => {
      const mockError = new Error('Database error')
      mockSupabaseClient.from().single.mockResolvedValueOnce({
        data: null,
        error: mockError
      })

      const projectData = {
        name: 'New Project',
        color: '#3B82F6'
      }

      await expect(createProject('user-1', projectData)).rejects.toThrow('Database error')
    })
  })
})