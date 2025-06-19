'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTimer } from '@/hooks/useTimer'
import { useTestTimer } from '@/hooks/useTestTimer'
import { useProjects } from '@/hooks/useProjects'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { Play, Pause, Square, ChevronDown } from 'lucide-react'
import { timerLogger } from '@/lib/logger'

export default function TimerCard() {
  const { user } = useAuth()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  
  // Use test timer when no user is logged in
  const realTimer = useTimer()
  const testTimer = useTestTimer()
  
  const timer = user ? realTimer : testTimer
  
  const { 
    isRunning, 
    formattedTime, 
    currentEntry, 
    startTimer, 
    stopTimer,
    loading 
  } = timer
  
  const { projects, initialLoadComplete } = useProjects()
  const { refetch: refetchTimeEntries } = useTimeEntries()
  
  timerLogger.info('TimerCard: Available projects', { 
    count: projects.length, 
    projects: projects.map(p => ({ id: p.id, name: p.name })),
    hasUser: !!user,
    userId: user?.id,
    initialLoadComplete
  })
  
  timerLogger.info('TimerCard: Timer state', {
    isRunning,
    hasCurrentEntry: !!currentEntry,
    currentEntryId: currentEntry?.id,
    currentEntryProjectId: currentEntry?.project_id,
    currentEntryProjects: currentEntry?.projects,
    currentEntryProject: currentEntry?.project,
    loading
  })
  
  // プロジェクト読み込み完了まで待機
  if (!initialLoadComplete) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">プロジェクトを読み込み中...</span>
        </div>
      </div>
    )
  }

  const handleStartTimer = async () => {
    console.log('🚀 START BUTTON CLICKED! v0.1.6')
    timerLogger.info('handleStartTimer called (v0.1.6)', {
      selectedProjectId,
      hasUser: !!user,
      userId: user?.id,
      description
    })
    
    // 選択されたプロジェクトIDをそのまま使用
    const projectId = selectedProjectId
    
    console.log('✅ About to call startTimer with:', { projectId, description })
    
    try {
      timerLogger.info('Calling startTimer', { projectId, description })
      await startTimer(projectId, undefined, description)
      console.log('✅ Timer started successfully!')
      timerLogger.info('startTimer completed successfully')
      // Refresh time entries list after starting timer
      await refetchTimeEntries()
      timerLogger.info('Timer started and time entries refreshed')
    } catch (error) {
      console.error('❌ Timer start failed:', error)
      timerLogger.error('Error starting timer', error as Error, { projectId, description })
    }
  }

  const handleStopTimer = async () => {
    try {
      await stopTimer()
      // Refresh time entries list after stopping timer
      await refetchTimeEntries()
      timerLogger.info('Timer stopped and time entries refreshed')
    } catch (error) {
      timerLogger.error('Error stopping timer', error as Error)
    }
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700" data-testid="timer-card">
      <div className="p-6">
        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2">
            {formattedTime}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400" data-running={isRunning}>
            {isRunning ? 'タイマー実行中' : 'タイマー停止中'}
          </div>
        </div>

        {/* Project Selection */}
        {!isRunning && (
          <div className="mb-4">
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="flex items-center">
                  {selectedProject ? (
                    <>
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: selectedProject.color }}
                      />
                      {selectedProject.name}
                    </>
                  ) : (
                    'プロジェクトを選択'
                  )}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showProjectDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setSelectedProjectId(project.id)
                        setShowProjectDropdown(false)
                      }}
                      className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-gray-900 dark:text-white">{project.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Running Project */}
        {isRunning && currentEntry && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: currentEntry.projects?.color || currentEntry.project?.color || '#3B82F6' }}
              />
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {(() => {
                  const projectName = currentEntry.projects?.name || currentEntry.project?.name || 'Unknown Project'
                  // Enhanced logging for debugging Unknown Project issue
                  if (projectName === 'Unknown Project') {
                    timerLogger.warn('Unknown Project detected', {
                      currentEntry: {
                        id: currentEntry.id,
                        project_id: currentEntry.project_id,
                        projects: currentEntry.projects,
                        project: currentEntry.project,
                        user_id: currentEntry.user_id,
                        is_running: currentEntry.is_running
                      }
                    })
                  } else {
                    timerLogger.info('Project name resolved successfully', {
                      projectName,
                      hasProjects: !!currentEntry.projects,
                      hasProject: !!currentEntry.project
                    })
                  }
                  return projectName
                })()}
              </span>
            </div>
            {currentEntry.description && (
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {currentEntry.description}
              </p>
            )}
          </div>
        )}

        {/* Description Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="何をしていますか？（任意）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isRunning}
          />
        </div>

        {/* Timer Controls */}
        <div className="flex gap-3">
          {!isRunning ? (
            <button
              onClick={handleStartTimer}
              disabled={!selectedProjectId || loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              <Play className="h-4 w-4" />
              開始
            </button>
          ) : (
            <button
              onClick={handleStopTimer}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              <Square className="h-4 w-4" />
              停止
            </button>
          )}
        </div>

        {/* Quick Actions */}
        {isRunning && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              開始時刻: {currentEntry?.start_time ? new Date(currentEntry.start_time).toLocaleTimeString('ja-JP') : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}