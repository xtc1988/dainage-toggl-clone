'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTimer } from '@/hooks/useTimer'
import TimerCard from '@/components/Timer/TimerCard'
import { Clock, Calendar, BarChart3, Users } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { formattedTime, isRunning } = useTimer()
  const [todayTotal, setTodayTotal] = useState('0:00')
  const [weekTotal, setWeekTotal] = useState('0:00')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                DAINAGE
              </h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                Beta
              </span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  こんにちは、{user.user_metadata?.full_name || user.email}
                </div>
                <img
                  src={user.user_metadata?.avatar_url || '/default-avatar.png'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </header>

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

            {/* Recent Entries */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                最近のエントリ
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    まだエントリがありません。タイマーを開始して時間の記録を始めましょう。
                  </div>
                </div>
              </div>
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
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-start px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <BarChart3 className="h-4 w-4 mr-3" />
                    レポートを見る
                  </button>
                  <button className="w-full flex items-center justify-start px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Users className="h-4 w-4 mr-3" />
                    プロジェクト管理
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}