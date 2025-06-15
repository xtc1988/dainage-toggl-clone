'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import NavBar from '@/components/Navigation/NavBar'
import { 
  Calendar, 
  Clock, 
  BarChart3, 
  Download, 
  Filter,
  TrendingUp,
  Users,
  Target
} from 'lucide-react'

// Mock data for demonstration
const generateMockTimeEntries = () => {
  const projects = ['ウェブサイト開発', 'モバイルアプリ', 'API開発', 'バグ修正']
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
  const entries = []
  
  // Generate entries for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Random number of entries per day (0-4)
    const entryCount = Math.floor(Math.random() * 5)
    
    for (let j = 0; j < entryCount; j++) {
      const projectIndex = Math.floor(Math.random() * projects.length)
      const duration = Math.floor(Math.random() * 8 * 3600) + 1800 // 30min to 8h
      
      entries.push({
        id: `${i}-${j}`,
        date: date.toISOString().split('T')[0],
        project: projects[projectIndex],
        projectColor: colors[projectIndex],
        duration: duration,
        description: `タスク ${j + 1}`
      })
    }
  }
  
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function ReportsDashboard() {
  const { user } = useAuth()
  const { projects } = useProjects()
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const timeEntries = useMemo(() => generateMockTimeEntries(), [])

  // Filter entries by date range
  const filteredEntries = useMemo(() => {
    return timeEntries.filter(entry => 
      entry.date >= dateRange.startDate && entry.date <= dateRange.endDate
    )
  }, [timeEntries, dateRange])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSeconds = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const totalHours = Math.floor(totalSeconds / 3600)
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60)
    
    // Group by project
    const projectTotals = filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.project]) {
        acc[entry.project] = {
          duration: 0,
          color: entry.projectColor,
          count: 0
        }
      }
      acc[entry.project].duration += entry.duration
      acc[entry.project].count += 1
      return acc
    }, {} as Record<string, { duration: number; color: string; count: number }>)

    // Group by date for trend
    const dailyTotals = filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = 0
      }
      acc[entry.date] += entry.duration
      return acc
    }, {} as Record<string, number>)

    const averageDaily = Object.values(dailyTotals).length > 0 
      ? Object.values(dailyTotals).reduce((sum, duration) => sum + duration, 0) / Object.values(dailyTotals).length
      : 0

    return {
      totalTime: `${totalHours}h ${totalMinutes}m`,
      totalSeconds,
      averageDaily: Math.floor(averageDaily / 3600) + 'h ' + Math.floor((averageDaily % 3600) / 60) + 'm',
      projectTotals,
      dailyTotals,
      entryCount: filteredEntries.length,
      activeDays: Object.keys(dailyTotals).length
    }
  }, [filteredEntries])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  const exportToCsv = () => {
    const headers = ['日付', 'プロジェクト', '説明', '時間(分)']
    const csvData = filteredEntries.map(entry => [
      entry.date,
      entry.project,
      entry.description,
      Math.floor(entry.duration / 60)
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `time-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                レポート
              </h1>
            </div>
            
            <button
              onClick={exportToCsv}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV出力
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              期間設定
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                開始日
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                終了日
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">総時間</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTime}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">平均/日</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageDaily}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">総エントリ数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.entryCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">アクティブ日数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeDays}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              プロジェクト別時間配分
            </h3>
            
            <div className="space-y-4">
              {Object.entries(stats.projectTotals).map(([project, data]) => {
                const percentage = stats.totalSeconds > 0 ? (data.duration / stats.totalSeconds) * 100 : 0
                
                return (
                  <div key={project}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {project}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatTime(data.duration)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: data.color,
                          width: `${percentage}%`
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              日別アクティビティ
            </h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {Object.entries(stats.dailyTotals)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .slice(0, 14)
                .map(([date, duration]) => {
                  const maxDuration = Math.max(...Object.values(stats.dailyTotals))
                  const percentage = maxDuration > 0 ? (duration / maxDuration) * 100 : 0
                  const dateObj = new Date(date)
                  const isToday = date === new Date().toISOString().split('T')[0]
                  
                  return (
                    <div key={date} className={`p-3 rounded-lg ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {dateObj.toLocaleDateString('ja-JP', { 
                            month: 'short', 
                            day: 'numeric',
                            weekday: 'short'
                          })}
                          {isToday && <span className="ml-2 text-xs text-blue-600">今日</span>}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatTime(duration)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            最近のエントリ
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">日付</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">プロジェクト</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">説明</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">時間</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.slice(0, 10).map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {new Date(entry.date).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: entry.projectColor }}
                        />
                        <span className="text-gray-900 dark:text-white">{entry.project}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {entry.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900 dark:text-white">
                      {formatTime(entry.duration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}