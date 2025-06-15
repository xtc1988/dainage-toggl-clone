'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import NavBar from '@/components/Navigation/NavBar'
import { 
  TrendingUp, 
  Code, 
  GitCommit, 
  Bug, 
  Clock, 
  Target,
  Award,
  Activity,
  Calendar,
  User,
  Users,
  BarChart3,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

// Mock metrics data
const mockMetrics = {
  personal: {
    velocityTrend: [
      { week: '2024-W1', velocity: 28, planned: 30 },
      { week: '2024-W2', velocity: 32, planned: 30 },
      { week: '2024-W3', velocity: 35, planned: 32 },
      { week: '2024-W4', velocity: 31, planned: 32 }
    ],
    codeMetrics: {
      linesWritten: 2847,
      commitsThisWeek: 23,
      codeReviewsCompleted: 12,
      bugsFixed: 8,
      featuresDelivered: 5,
      testCoverage: 87
    },
    timeDistribution: {
      coding: 65,
      codeReview: 15,
      debugging: 12,
      planning: 8
    },
    productivity: {
      focusTime: 6.2,
      interruptionRate: 0.3,
      completionRate: 92,
      estimationAccuracy: 89
    }
  },
  team: {
    members: [
      {
        name: '田中太郎',
        role: 'Tech Lead',
        velocity: 35,
        commits: 28,
        codeReviews: 15,
        bugs: 3,
        efficiency: 94
      },
      {
        name: '佐藤花子',
        role: 'Senior Engineer',
        velocity: 32,
        commits: 22,
        codeReviews: 10,
        bugs: 2,
        efficiency: 91
      },
      {
        name: '山田次郎',
        role: 'Engineer',
        velocity: 28,
        commits: 18,
        codeReviews: 8,
        bugs: 5,
        efficiency: 87
      }
    ],
    teamStats: {
      avgVelocity: 31.7,
      totalCommits: 68,
      totalCodeReviews: 33,
      totalBugs: 10,
      teamEfficiency: 91
    }
  },
  goals: [
    {
      id: '1',
      title: 'コードレビュー時間短縮',
      target: '平均2時間以内',
      current: '2.3時間',
      progress: 85,
      status: 'on-track'
    },
    {
      id: '2',
      title: 'バグ修正時間改善',
      target: '平均1日以内',
      current: '1.2日',
      progress: 75,
      status: 'at-risk'
    },
    {
      id: '3',
      title: 'テストカバレッジ向上',
      target: '90%以上',
      current: '87%',
      progress: 97,
      status: 'on-track'
    },
    {
      id: '4',
      title: 'デプロイ頻度向上',
      target: '週3回以上',
      current: '週2.5回',
      progress: 83,
      status: 'on-track'
    }
  ]
}

const metricCategories = [
  {
    id: 'overview',
    name: '概要',
    icon: BarChart3
  },
  {
    id: 'personal',
    name: '個人メトリクス',
    icon: User
  },
  {
    id: 'team',
    name: 'チームメトリクス',
    icon: Users
  },
  {
    id: 'goals',
    name: '目標管理',
    icon: Target
  }
]

const statusColors = {
  'on-track': 'text-green-600 bg-green-100',
  'at-risk': 'text-orange-600 bg-orange-100',
  'behind': 'text-red-600 bg-red-100'
}

const statusLabels = {
  'on-track': '順調',
  'at-risk': '要注意',
  'behind': '遅れ'
}

export default function DeveloperMetrics() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('overview')
  const [timeRange, setTimeRange] = useState('week') // week, month, quarter

  const overviewStats = useMemo(() => {
    const currentVelocity = mockMetrics.personal.velocityTrend[mockMetrics.personal.velocityTrend.length - 1]?.velocity || 0
    const avgVelocity = mockMetrics.personal.velocityTrend.reduce((sum, item) => sum + item.velocity, 0) / mockMetrics.personal.velocityTrend.length
    const velocityTrend = ((currentVelocity - avgVelocity) / avgVelocity * 100).toFixed(1)
    
    return {
      currentVelocity,
      velocityTrend: parseFloat(velocityTrend),
      totalGoals: mockMetrics.goals.length,
      onTrackGoals: mockMetrics.goals.filter(g => g.status === 'on-track').length,
      teamEfficiency: mockMetrics.team.teamStats.teamEfficiency
    }
  }, [])

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">現在のベロシティ</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {overviewStats.currentVelocity}
                    </p>
                    <p className={`text-xs mt-1 ${
                      overviewStats.velocityTrend >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {overviewStats.velocityTrend >= 0 ? '+' : ''}{overviewStats.velocityTrend}% 平均比
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">目標達成率</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {Math.round((overviewStats.onTrackGoals / overviewStats.totalGoals) * 100)}%
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {overviewStats.onTrackGoals}/{overviewStats.totalGoals} 目標
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">チーム効率</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {overviewStats.teamEfficiency}%
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      平均パフォーマンス
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <Code className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">今週のコミット</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {mockMetrics.personal.codeMetrics.commitsThisWeek}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      +15% 先週比
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Velocity Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                ベロシティトレンド
              </h3>
              
              <div className="space-y-4">
                {mockMetrics.personal.velocityTrend.map((item, index) => {
                  const achievementRate = (item.velocity / item.planned) * 100
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
                          {item.week}
                        </span>
                        <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-4">
                          <div
                            className={`h-3 rounded-full ${
                              achievementRate >= 100 ? 'bg-green-500' :
                              achievementRate >= 80 ? 'bg-blue-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${Math.min(100, achievementRate)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.velocity}/{item.planned}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {achievementRate.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'personal':
        return (
          <div className="space-y-6">
            {/* Personal Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'コード行数', value: mockMetrics.personal.codeMetrics.linesWritten.toLocaleString(), icon: Code, color: 'blue' },
                { label: 'コードレビュー', value: mockMetrics.personal.codeMetrics.codeReviewsCompleted, icon: CheckCircle, color: 'green' },
                { label: 'バグ修正', value: mockMetrics.personal.codeMetrics.bugsFixed, icon: Bug, color: 'red' },
                { label: '機能配信', value: mockMetrics.personal.codeMetrics.featuresDelivered, icon: Award, color: 'purple' },
                { label: 'テストカバレッジ', value: `${mockMetrics.personal.codeMetrics.testCoverage}%`, icon: Target, color: 'orange' },
                { label: '集中時間', value: `${mockMetrics.personal.productivity.focusTime}h/日`, icon: Clock, color: 'teal' }
              ].map((metric, index) => {
                const Icon = metric.icon
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <Icon className={`h-8 w-8 text-${metric.color}-600 mr-3`} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.value}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Time Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                時間配分
              </h3>
              
              <div className="space-y-4">
                {Object.entries(mockMetrics.personal.timeDistribution).map(([activity, percentage]) => (
                  <div key={activity} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {activity === 'coding' ? 'コーディング' :
                       activity === 'codeReview' ? 'コードレビュー' :
                       activity === 'debugging' ? 'デバッグ' : '計画'}
                    </span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-10">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'team':
        return (
          <div className="space-y-6">
            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">平均ベロシティ</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {mockMetrics.team.teamStats.avgVelocity}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <GitCommit className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">総コミット数</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {mockMetrics.team.teamStats.totalCommits}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">コードレビュー</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {mockMetrics.team.teamStats.totalCodeReviews}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                <div className="flex items-center">
                  <Bug className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">バグ修正</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {mockMetrics.team.teamStats.totalBugs}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                チームメンバーパフォーマンス
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">メンバー</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">ベロシティ</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">コミット</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">レビュー</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">バグ修正</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">効率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMetrics.team.members.map((member, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{member.role}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-white">
                          {member.velocity}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                          {member.commits}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                          {member.codeReviews}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                          {member.bugs}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            member.efficiency >= 90 ? 'bg-green-100 text-green-700' :
                            member.efficiency >= 85 ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {member.efficiency}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'goals':
        return (
          <div className="space-y-6">
            {/* Goals List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockMetrics.goals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {goal.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      statusColors[goal.status as keyof typeof statusColors]
                    }`}>
                      {statusLabels[goal.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">目標:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{goal.target}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">現在:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{goal.current}</span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">進捗</span>
                        <span className="font-medium text-gray-900 dark:text-white">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            goal.status === 'on-track' ? 'bg-green-500' :
                            goal.status === 'at-risk' ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                開発メトリクス
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="week">今週</option>
                <option value="month">今月</option>
                <option value="quarter">四半期</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  メトリクスカテゴリ
                </h2>
                
                <nav className="space-y-2">
                  {metricCategories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activeCategory === category.id
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 mr-3" />
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Metrics Content */}
          <div className="lg:col-span-3">
            {renderCategoryContent()}
          </div>
        </div>
      </main>
    </div>
  )
}