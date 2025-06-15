'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import NavBar from '@/components/Navigation/NavBar'
import { 
  GitBranch, 
  Github, 
  GitCommit, 
  Clock, 
  Code, 
  FileText, 
  Plus,
  Link,
  Settings,
  Activity,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

// Mock Git data
const mockGitData = {
  repositories: [
    {
      id: '1',
      name: 'dainage-frontend',
      url: 'https://github.com/team/dainage-frontend',
      connected: true,
      lastSync: '2024-01-30T10:30:00Z',
      branches: [
        {
          name: 'feature/user-auth',
          commits: 12,
          lastCommit: '2024-01-30T09:15:00Z',
          author: '田中太郎',
          timeSpent: 25.5
        },
        {
          name: 'feature/dashboard-ui',
          commits: 8,
          lastCommit: '2024-01-29T16:20:00Z',
          author: '佐藤花子',
          timeSpent: 18.0
        },
        {
          name: 'bugfix/timer-issue',
          commits: 3,
          lastCommit: '2024-01-29T11:45:00Z',
          author: '山田次郎',
          timeSpent: 6.5
        }
      ]
    },
    {
      id: '2',
      name: 'dainage-backend',
      url: 'https://github.com/team/dainage-backend',
      connected: true,
      lastSync: '2024-01-30T10:25:00Z',
      branches: [
        {
          name: 'feature/api-endpoints',
          commits: 15,
          lastCommit: '2024-01-30T08:30:00Z',
          author: '鈴木一郎',
          timeSpent: 32.0
        },
        {
          name: 'feature/database-migration',
          commits: 6,
          lastCommit: '2024-01-29T14:10:00Z',
          author: '高橋美咲',
          timeSpent: 12.5
        }
      ]
    }
  ],
  recentCommits: [
    {
      id: '1',
      hash: 'a1b2c3d',
      message: 'Add Google OAuth integration',
      author: '田中太郎',
      repository: 'dainage-frontend',
      branch: 'feature/user-auth',
      timestamp: '2024-01-30T09:15:00Z',
      timeSpent: 4.5,
      files: 8
    },
    {
      id: '2',
      hash: 'e4f5g6h',
      message: 'Update dashboard UI components',
      author: '佐藤花子',
      repository: 'dainage-frontend',
      branch: 'feature/dashboard-ui',
      timestamp: '2024-01-29T16:20:00Z',
      timeSpent: 3.2,
      files: 5
    },
    {
      id: '3',
      hash: 'i7j8k9l',
      message: 'Fix timer synchronization issue',
      author: '山田次郎',
      repository: 'dainage-frontend',
      branch: 'bugfix/timer-issue',
      timestamp: '2024-01-29T11:45:00Z',
      timeSpent: 2.1,
      files: 3
    },
    {
      id: '4',
      hash: 'm0n1o2p',
      message: 'Implement user authentication API',
      author: '鈴木一郎',
      repository: 'dainage-backend',
      branch: 'feature/api-endpoints',
      timestamp: '2024-01-30T08:30:00Z',
      timeSpent: 5.8,
      files: 12
    }
  ],
  commitStats: {
    thisWeek: {
      commits: 44,
      timeSpent: 94.6,
      contributors: 4
    },
    lastWeek: {
      commits: 38,
      timeSpent: 82.3,
      contributors: 4
    }
  }
}

const mockIntegrations = [
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    connected: true,
    description: 'コミット・ブランチとの時間紐付け',
    repositories: 2
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    icon: GitBranch,
    connected: false,
    description: 'GitLabリポジトリとの連携',
    repositories: 0
  }
]

export default function GitIntegration() {
  const { user } = useAuth()
  const [selectedRepo, setSelectedRepo] = useState<string>(mockGitData.repositories[0]?.id || '')
  const [showConnectRepo, setShowConnectRepo] = useState(false)

  const currentRepo = selectedRepo 
    ? mockGitData.repositories.find(r => r.id === selectedRepo) 
    : null

  const weeklyGrowth = useMemo(() => {
    const current = mockGitData.commitStats.thisWeek
    const previous = mockGitData.commitStats.lastWeek
    
    return {
      commits: ((current.commits - previous.commits) / previous.commits * 100).toFixed(1),
      timeSpent: ((current.timeSpent - previous.timeSpent) / previous.timeSpent * 100).toFixed(1)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <GitBranch className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Git連携
              </h1>
            </div>
            
            <button
              onClick={() => setShowConnectRepo(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              リポジトリ追加
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Integration Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {mockIntegrations.map((integration) => {
            const Icon = integration.icon
            return (
              <div
                key={integration.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="h-8 w-8 text-gray-700 dark:text-gray-300 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {integration.connected ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-green-600">接続済み</span>
                      </div>
                    ) : (
                      <button className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                        <Link className="h-4 w-4 mr-1" />
                        接続
                      </button>
                    )}
                  </div>
                </div>
                
                {integration.connected && (
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    {integration.repositories}個のリポジトリが接続されています
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <GitCommit className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">今週のコミット</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockGitData.commitStats.thisWeek.commits}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{weeklyGrowth.commits}% 先週比
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">開発時間</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockGitData.commitStats.thisWeek.timeSpent}h
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{weeklyGrowth.timeSpent}% 先週比
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">アクティブ開発者</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockGitData.commitStats.thisWeek.contributors}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">平均時間/コミット</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(mockGitData.commitStats.thisWeek.timeSpent / mockGitData.commitStats.thisWeek.commits).toFixed(1)}h
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Repository List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  リポジトリ
                </h2>
                
                <div className="space-y-3">
                  {mockGitData.repositories.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedRepo === repo.id
                          ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {repo.name}
                        </span>
                        {repo.connected ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {repo.branches.length}個のブランチ
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        最終同期: {new Date(repo.lastSync).toLocaleDateString('ja-JP')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Repository Details */}
          <div className="lg:col-span-2">
            {currentRepo ? (
              <div className="space-y-6">
                {/* Repository Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {currentRepo.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {currentRepo.url}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        接続済み
                      </span>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    最終同期: {new Date(currentRepo.lastSync).toLocaleString('ja-JP')}
                  </div>
                </div>

                {/* Branches */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    アクティブブランチ
                  </h3>
                  
                  <div className="space-y-4">
                    {currentRepo.branches.map((branch, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <GitBranch className="h-5 w-5 text-gray-500" />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {branch.name}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>{branch.commits} コミット</span>
                              <span>{branch.timeSpent}h 作業時間</span>
                              <span>by {branch.author}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(branch.lastCommit).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <GitBranch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  リポジトリを選択してください
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  左側からリポジトリを選択してブランチ情報を表示します
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Commits */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            最近のコミット
          </h3>
          
          <div className="space-y-4">
            {mockGitData.recentCommits.map((commit) => (
              <div
                key={commit.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <code className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-gray-900 dark:text-white">
                        {commit.hash}
                      </code>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {commit.message}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{commit.author}</span>
                      <span>{commit.repository}/{commit.branch}</span>
                      <span>{commit.files} ファイル変更</span>
                      <span>{commit.timeSpent}h 作業時間</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(commit.timestamp).toLocaleString('ja-JP')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Connect Repository Modal */}
      {showConnectRepo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                リポジトリを追加
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Git プロバイダー
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="github">GitHub</option>
                    <option value="gitlab">GitLab</option>
                    <option value="bitbucket">Bitbucket</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    リポジトリURL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://github.com/user/repository"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    アクセストークン
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    リポジトリへの読み取り権限が必要です
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowConnectRepo(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => setShowConnectRepo(false)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Link className="h-4 w-4 mr-2" />
                  接続
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}