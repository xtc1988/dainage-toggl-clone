'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTimer } from '@/hooks/useTimer'
import { useRouter } from 'next/navigation'
import TimerCard from '@/components/timer/TimerCard'
import TimeEntryList from '@/components/TimeEntries/TimeEntryList'
import NavBar from '@/components/Navigation/NavBar'
import LogViewer from '@/components/Debug/LogViewer'
import TimerDebug from '@/components/Debug/TimerDebug'
import { Clock, Calendar, BarChart3, Users } from 'lucide-react'
import { timerLogger } from '@/lib/logger'

export default function Dashboard() {
  const { user } = useAuth()
  const { formattedTime, isRunning } = useTimer()
  const router = useRouter()
  const [todayTotal, setTodayTotal] = useState('0:00')
  const [weekTotal, setWeekTotal] = useState('0:00')
  const [showLogs, setShowLogs] = useState(false)

  useEffect(() => {
    if (user?.id) {
      timerLogger.info('Dashboard opened with user', { 
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString()
      })
    }
  }, [user?.id])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                タイマー
              </h2>
              <TimerCard />
            </div>

            {/* Time Entries */}
            <div>
              <TimeEntryList />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  今日の集計
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">総時間</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {todayTotal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">現在のセッション</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {isRunning ? formattedTime : '0:00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  今週の集計
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">総時間</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {weekTotal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">平均/日</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      0:00
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  クイックアクション
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => router.push('/reports')}
                    className="flex items-center justify-start px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <BarChart3 className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">レポート</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">時間分析と統計</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => router.push('/projects')}
                    className="flex items-center justify-start px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 rounded-lg transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-800"
                  >
                    <Users className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">プロジェクト管理</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">プロジェクトの作成・編集</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => setShowLogs(!showLogs)}
                    className="flex items-center justify-start px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                  >
                    <span className="text-lg mr-3">🔍</span>
                    <div>
                      <div className="font-medium">システムログ</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">デバッグ情報を{showLogs ? '隠す' : '表示'}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Timer Debug Component */}
      <TimerDebug />
      
      {/* Log Viewer Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                システムログ (User ID: {user?.id || 'Not logged in'})
              </h3>
              <button
                onClick={() => setShowLogs(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
              <LogViewer />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}