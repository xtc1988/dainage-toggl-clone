'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { updateElapsedTime, fetchActiveTimer, startTimerAsync, stopTimerAsync } from '@/store/timerSlice'
import { useAuth } from './useAuth'
import { timerLogger } from '@/lib/logger'

export function useTimer() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { currentEntry, isRunning, elapsedTime, loading, error } = useSelector(
    (state: RootState) => state.timer
  )

  // Update elapsed time every second when timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && currentEntry) {
      interval = setInterval(() => {
        const startTime = new Date(currentEntry.start_time).getTime()
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000)
        dispatch(updateElapsedTime(elapsed))
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, currentEntry, dispatch])

  // Fetch active timer on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchActiveTimer(user.id) as any)
    }
  }, [user?.id, dispatch])

  const startTimer = async (projectId: string, taskId?: string, description?: string) => {
    timerLogger.info('useTimer.startTimer called', { 
      projectId, 
      taskId, 
      description, 
      userId: user?.id,
      hasUser: !!user 
    })
    
    if (!user?.id) {
      timerLogger.warn('No user ID, cannot start timer', { projectId })
      throw new Error('User authentication required to start timer')
    }
    
    timerLogger.debug('Dispatching startTimerAsync')
    try {
      const result = await dispatch(
        startTimerAsync({
          userId: user.id,
          projectId,
          taskId,
          description,
        }) as any
      )
      timerLogger.info('startTimerAsync completed', { result: result?.type })
    } catch (error) {
      timerLogger.error('startTimerAsync failed', error as Error, { projectId, userId: user.id })
      throw error
    }
  }

  const stopTimer = async () => {
    if (!currentEntry?.id) return
    
    await dispatch(stopTimerAsync(currentEntry.id) as any)
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }

  return {
    currentEntry,
    isRunning,
    elapsedTime,
    loading,
    error,
    startTimer,
    stopTimer,
    formatTime,
    formattedTime: formatTime(elapsedTime),
  }
}