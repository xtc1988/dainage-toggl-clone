'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { useTimer } from '@/hooks/useTimer'
import { useEffect, useState } from 'react'

export default function TimerDebug() {
  const timerState = useSelector((state: RootState) => state.timer)
  const { currentEntry, isRunning, elapsedTime } = useTimer()
  const [refreshCount, setRefreshCount] = useState(0)

  // Force re-render every second to show real-time state
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-20 right-4 w-96 bg-black/90 text-white p-4 rounded-lg shadow-2xl text-xs font-mono z-[9999]">
      <div className="mb-2 text-yellow-400 font-bold">TIMER DEBUG (refresh: {refreshCount})</div>
      
      <div className="space-y-2">
        <div>
          <span className="text-blue-400">isRunning:</span> {String(isRunning)}
        </div>
        
        <div>
          <span className="text-blue-400">elapsedTime:</span> {elapsedTime}s
        </div>
        
        <div>
          <span className="text-blue-400">currentEntry:</span>
          {currentEntry ? (
            <div className="ml-4 text-xs">
              <div>id: {currentEntry.id}</div>
              <div>project_id: {currentEntry.project_id}</div>
              <div>start_time: {new Date(currentEntry.start_time).toLocaleTimeString()}</div>
              <div>is_running: {String(currentEntry.is_running)}</div>
              <div className="text-yellow-400">
                projects: {currentEntry.projects ? `${currentEntry.projects.name} (${currentEntry.projects.color})` : 'null'}
              </div>
              <div className="text-yellow-400">
                project: {currentEntry.project ? `${currentEntry.project.name} (${currentEntry.project.color})` : 'null'}
              </div>
            </div>
          ) : (
            ' null'
          )}
        </div>

        <div className="border-t border-gray-600 pt-2 mt-2">
          <div className="text-green-400">Redux State:</div>
          <div className="ml-4 text-xs">
            <div>loading: {String(timerState.loading)}</div>
            <div>error: {timerState.error || 'null'}</div>
            <div>currentEntry: {timerState.currentEntry ? 'exists' : 'null'}</div>
            <div>isRunning: {String(timerState.isRunning)}</div>
            <div>elapsedTime: {timerState.elapsedTime}</div>
          </div>
        </div>
      </div>
    </div>
  )
}