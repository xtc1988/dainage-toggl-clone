'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import NavBar from '@/components/Navigation/NavBar'
import { 
  Calendar, 
  Plus, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Target,
  TrendingUp,
  Users,
  AlertCircle,
  BarChart3,
  Edit,
  Trash2
} from 'lucide-react'

// Mock sprint data
const mockSprints = [
  {
    id: '1',
    name: 'Sprint 2024-Q1-1',
    description: 'ユーザー認証機能とダッシュボード改善',
    status: 'completed',
    startDate: '2024-01-15',
    endDate: '2024-01-29',
    plannedHours: 160,
    actualHours: 152,
    team: 'フロントエンドチーム',
    velocity: 32,
    storyPoints: 34,
    completedStoryPoints: 32,
    tasks: [
      { id: '1', title: 'Google OAuth実装', status: 'completed', hours: 24, storyPoints: 8 },
      { id: '2', title: 'ダッシュボードUI改善', status: 'completed', hours: 16, storyPoints: 5 },
      { id: '3', title: 'ユーザープロフィール機能', status: 'completed', hours: 20, storyPoints: 8 },
      { id: '4', title: 'レスポンシブ対応', status: 'completed', hours: 18, storyPoints: 5 },
      { id: '5', title: 'テスト自動化', status: 'completed', hours: 28, storyPoints: 8 },
      { id: '6', title: 'パフォーマンス最適化', status: 'in_progress', hours: 12, storyPoints: 3 }
    ]
  },
  {
    id: '2', 
    name: 'Sprint 2024-Q1-2',
    description: 'レポート機能とデータエクスポート',
    status: 'active',
    startDate: '2024-01-30',
    endDate: '2024-02-13',
    plannedHours: 180,
    actualHours: 89,
    team: 'フルスタックチーム',
    velocity: 0, // Still in progress
    storyPoints: 42,
    completedStoryPoints: 18,
    tasks: [
      { id: '7', title: 'レポートダッシュボード設計', status: 'completed', hours: 16, storyPoints: 5 },
      { id: '8', title: 'CSVエクスポート機能', status: 'completed', hours: 20, storyPoints: 8 },
      { id: '9', title: 'チャート表示機能', status: 'in_progress', hours: 24, storyPoints: 13 },
      { id: '10', title: 'フィルター機能', status: 'todo', hours: 0, storyPoints: 8 },
      { id: '11', title: 'PDFエクスポート', status: 'todo', hours: 0, storyPoints: 8 }
    ]
  },
  {
    id: '3',
    name: 'Sprint 2024-Q1-3',
    description: 'チーム機能とコラボレーション',
    status: 'planned',
    startDate: '2024-02-14',
    endDate: '2024-02-28',
    plannedHours: 200,
    actualHours: 0,
    team: 'フルスタックチーム',
    velocity: 0,
    storyPoints: 55,
    completedStoryPoints: 0,
    tasks: [
      { id: '12', title: 'チーム作成機能', status: 'todo', hours: 0, storyPoints: 13 },
      { id: '13', title: 'メンバー招待システム', status: 'todo', hours: 0, storyPoints: 21 },
      { id: '14', title: '権限管理', status: 'todo', hours: 0, storyPoints: 13 },
      { id: '15', title: 'チームダッシュボード', status: 'todo', hours: 0, storyPoints: 8 }
    ]
  }
]

const statusLabels = {
  planned: '計画済み',
  active: '実行中', 
  completed: '完了',
  cancelled: 'キャンセル'
}

const statusColors = {
  planned: 'text-gray-600 bg-gray-100',
  active: 'text-blue-600 bg-blue-100',
  completed: 'text-green-600 bg-green-100',
  cancelled: 'text-red-600 bg-red-100'
}

const taskStatusLabels = {
  todo: '未着手',
  in_progress: '進行中',
  completed: '完了'
}

export default function SprintManagement() {
  const { user } = useAuth()
  const [selectedSprint, setSelectedSprint] = useState<string>(mockSprints[1]?.id || '')
  const [showCreateSprint, setShowCreateSprint] = useState(false)
  
  const currentSprint = selectedSprint ? mockSprints.find(s => s.id === selectedSprint) : null

  const sprintStats = useMemo(() => {
    if (!currentSprint) return null

    const progressPercentage = currentSprint.storyPoints > 0 
      ? Math.round((currentSprint.completedStoryPoints / currentSprint.storyPoints) * 100)
      : 0
      
    const timeProgressPercentage = currentSprint.plannedHours > 0
      ? Math.round((currentSprint.actualHours / currentSprint.plannedHours) * 100)
      : 0

    const daysRemaining = currentSprint.status === 'active' 
      ? Math.max(0, Math.ceil((new Date(currentSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : 0

    const averageVelocity = mockSprints
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.velocity, 0) / mockSprints.filter(s => s.status === 'completed').length || 0

    return {
      progressPercentage,
      timeProgressPercentage, 
      daysRemaining,
      averageVelocity,
      isOnTrack: progressPercentage >= timeProgressPercentage
    }
  }, [currentSprint])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                スプリント管理
              </h1>
            </div>
            
            <button
              onClick={() => setShowCreateSprint(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              新しいスプリント
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sprints Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  スプリント一覧
                </h2>
                
                <div className="space-y-3">
                  {mockSprints.map((sprint) => (
                    <button
                      key={sprint.id}
                      onClick={() => setSelectedSprint(sprint.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSprint === sprint.id
                          ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {sprint.name}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          statusColors[sprint.status as keyof typeof statusColors]
                        }`}>
                          {statusLabels[sprint.status as keyof typeof statusLabels]}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(sprint.startDate).toLocaleDateString('ja-JP')} - {new Date(sprint.endDate).toLocaleDateString('ja-JP')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {sprint.completedStoryPoints}/{sprint.storyPoints} ポイント
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sprint Details */}
          <div className="lg:col-span-3">
            {currentSprint && sprintStats ? (
              <div className="space-y-6">
                {/* Sprint Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currentSprint.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {currentSprint.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        statusColors[currentSprint.status as keyof typeof statusColors]
                      }`}>
                        {statusLabels[currentSprint.status as keyof typeof statusLabels]}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          ストーリーポイント進捗
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {currentSprint.completedStoryPoints}/{currentSprint.storyPoints}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${sprintStats.progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {sprintStats.progressPercentage}% 完了
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          時間進捗
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {currentSprint.actualHours}/{currentSprint.plannedHours}h
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            sprintStats.isOnTrack ? 'bg-green-600' : 'bg-orange-600'
                          }`}
                          style={{ width: `${Math.min(100, sprintStats.timeProgressPercentage)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {sprintStats.timeProgressPercentage}% 消化
                      </div>
                    </div>
                  </div>

                  {/* Sprint Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Target className="h-6 w-6 text-blue-600 mr-2" />
                        <div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">ベロシティ</div>
                          <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                            {currentSprint.velocity || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                        <div>
                          <div className="text-sm text-green-600 dark:text-green-400">平均ベロシティ</div>
                          <div className="text-xl font-bold text-green-900 dark:text-green-100">
                            {Math.round(sprintStats.averageVelocity)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-6 w-6 text-orange-600 mr-2" />
                        <div>
                          <div className="text-sm text-orange-600 dark:text-orange-400">残り日数</div>
                          <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                            {sprintStats.daysRemaining}日
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-6 w-6 text-purple-600 mr-2" />
                        <div>
                          <div className="text-sm text-purple-600 dark:text-purple-400">チーム</div>
                          <div className="text-sm font-bold text-purple-900 dark:text-purple-100">
                            {currentSprint.team}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Alert */}
                  {currentSprint.status === 'active' && !sprintStats.isOnTrack && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-700 dark:text-yellow-300">
                          スケジュールより遅れています。進捗を確認してください。
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tasks List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    タスク一覧
                  </h3>
                  
                  <div className="space-y-3">
                    {currentSprint.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            task.status === 'completed' 
                              ? 'bg-green-500' 
                              : task.status === 'in_progress'
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }`} />
                          
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>{taskStatusLabels[task.status as keyof typeof taskStatusLabels]}</span>
                              <span>{task.storyPoints} ポイント</span>
                              <span>{task.hours}h</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {task.status === 'completed' && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {task.status === 'in_progress' && (
                            <Play className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Burndown Chart Placeholder */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    バーンダウンチャート
                  </h3>
                  
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        バーンダウンチャートは開発中です
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  スプリントを選択してください
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  左側からスプリントを選択して詳細を表示します
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Sprint Modal */}
      {showCreateSprint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                新しいスプリントを作成
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    スプリント名
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="例: Sprint 2024-Q1-4"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    説明
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="スプリントの目標や内容を入力"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      開始日
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      終了日
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      予定時間 (h)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="160"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ストーリーポイント
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="40"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateSprint(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => setShowCreateSprint(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  作成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}