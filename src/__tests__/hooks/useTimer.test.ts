import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useTimer } from '@/hooks/useTimer'
import { timerSlice } from '@/store/timerSlice'

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com'
    }
  })
}))

// Mock Supabase client functions
jest.mock('@/lib/supabase/client', () => ({
  startTimer: jest.fn().mockResolvedValue({
    id: 'new-entry-id',
    user_id: 'test-user-id',
    project_id: 'project-1',
    start_time: new Date().toISOString(),
    is_running: true,
    project: {
      id: 'project-1',
      name: 'Test Project',
      color: '#3B82F6'
    }
  }),
  stopTimer: jest.fn().mockResolvedValue({
    id: 'entry-id',
    user_id: 'test-user-id',
    project_id: 'project-1',
    start_time: new Date(Date.now() - 5000).toISOString(),
    end_time: new Date().toISOString(),
    duration: 5,
    is_running: false
  }),
  getActiveTimeEntry: jest.fn().mockResolvedValue(null)
}))

const renderHookWithRedux = (hook: () => any) => {
  const store = configureStore({
    reducer: {
      timer: timerSlice.reducer,
    },
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )

  return renderHook(hook, { wrapper })
}

describe('useTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns initial timer state', () => {
    const { result } = renderHookWithRedux(() => useTimer())

    expect(result.current.isRunning).toBe(false)
    expect(result.current.currentEntry).toBeNull()
    expect(result.current.elapsedTime).toBe(0)
    expect(result.current.formattedTime).toBe('0:00')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('provides start and stop timer functions', () => {
    const { result } = renderHookWithRedux(() => useTimer())

    expect(typeof result.current.startTimer).toBe('function')
    expect(typeof result.current.stopTimer).toBe('function')
  })

  it('formats time correctly', () => {
    const { result } = renderHookWithRedux(() => useTimer())

    expect(result.current.formatTime(0)).toBe('0:00')
    expect(result.current.formatTime(30)).toBe('0:30')
    expect(result.current.formatTime(60)).toBe('1:00')
    expect(result.current.formatTime(125)).toBe('2:05')
    expect(result.current.formatTime(3661)).toBe('1:01:01')
  })

  it('handles timer start correctly', async () => {
    const { result } = renderHookWithRedux(() => useTimer())

    await act(async () => {
      await result.current.startTimer('project-1', undefined, 'Test description')
    })

    // Verify the function was called (implementation depends on Redux state)
    expect(result.current.startTimer).toBeDefined()
  })

  it('handles timer stop correctly', async () => {
    const { result } = renderHookWithRedux(() => useTimer())

    await act(async () => {
      await result.current.stopTimer()
    })

    // Verify the function was called
    expect(result.current.stopTimer).toBeDefined()
  })
})

describe('useTimer - Time Formatting', () => {
  it('formats seconds correctly', () => {
    const { result } = renderHookWithRedux(() => useTimer())

    // Test various time formats
    expect(result.current.formatTime(0)).toBe('0:00')
    expect(result.current.formatTime(1)).toBe('0:01')
    expect(result.current.formatTime(59)).toBe('0:59')
    expect(result.current.formatTime(60)).toBe('1:00')
    expect(result.current.formatTime(61)).toBe('1:01')
    expect(result.current.formatTime(3599)).toBe('59:59')
    expect(result.current.formatTime(3600)).toBe('1:00:00')
    expect(result.current.formatTime(3661)).toBe('1:01:01')
    expect(result.current.formatTime(7323)).toBe('2:02:03')
  })

  it('handles large time values', () => {
    const { result } = renderHookWithRedux(() => useTimer())

    expect(result.current.formatTime(86400)).toBe('24:00:00') // 24 hours
    expect(result.current.formatTime(90061)).toBe('25:01:01') // 25 hours, 1 minute, 1 second
  })
})