'use client'

import { useState, useEffect } from 'react'

export function useTestTimer() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [selectedProject, setSelectedProject] = useState<string>('')

  // Update elapsed time every second when timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning])

  const startTimer = (projectId: string, taskId?: string, description?: string) => {
    console.log('Test timer started for project:', projectId)
    setSelectedProject(projectId)
    setIsRunning(true)
  }

  const stopTimer = () => {
    console.log('Test timer stopped')
    setIsRunning(false)
    setElapsedTime(0)
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
    isRunning,
    elapsedTime,
    selectedProject,
    startTimer,
    stopTimer,
    formatTime,
    formattedTime: formatTime(elapsedTime),
    loading: false,
    error: null,
    currentEntry: null,
  }
}