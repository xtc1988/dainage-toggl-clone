'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import NavBar from '@/components/Navigation/NavBar'
import { 
  Users, 
  Plus, 
  Crown, 
  Mail, 
  Edit, 
  Trash2, 
  UserPlus,
  Shield,
  Clock,
  TrendingUp,
  Code,
  GitBranch
} from 'lucide-react'

// Mock data for demonstration
const mockTeams = [
  {
    id: '1',
    name: 'フロントエンドチーム',
    description: 'React/Next.js開発チーム',
    createdAt: '2024-01-15',
    members: [
      {
        id: '1',
        name: '田中太郎',
        email: 'tanaka@example.com',
        role: 'tech_lead',
        avatar: '/avatars/tanaka.png',
        totalHours: 120,
        thisWeekHours: 35,
        skills: ['React', 'TypeScript', 'Next.js']
      },
      {
        id: '2', 
        name: '佐藤花子',
        email: 'sato@example.com',
        role: 'senior_engineer',
        avatar: '/avatars/sato.png',
        totalHours: 95,
        thisWeekHours: 28,
        skills: ['Vue.js', 'JavaScript', 'CSS']
      },
      {
        id: '3',
        name: '山田次郎',
        email: 'yamada@example.com', 
        role: 'engineer',
        avatar: '/avatars/yamada.png',
        totalHours: 80,
        thisWeekHours: 32,
        skills: ['React', 'Node.js', 'GraphQL']
      }
    ]
  },
  {
    id: '2',
    name: 'バックエンドチーム',
    description: 'API・サーバーサイド開発チーム',
    createdAt: '2024-01-20',
    members: [
      {
        id: '4',
        name: '鈴木一郎',
        email: 'suzuki@example.com',
        role: 'tech_lead',
        avatar: '/avatars/suzuki.png',
        totalHours: 140,
        thisWeekHours: 40,
        skills: ['Node.js', 'Python', 'PostgreSQL']
      },
      {
        id: '5',
        name: '高橋美咲',
        email: 'takahashi@example.com',
        role: 'engineer',
        avatar: '/avatars/takahashi.png',
        totalHours: 75,
        thisWeekHours: 25,
        skills: ['Go', 'Docker', 'AWS']
      }
    ]
  }
]

const roleLabels = {
  tech_lead: 'テックリード',
  senior_engineer: 'シニアエンジニア',
  engineer: 'エンジニア',
  junior_engineer: 'ジュニアエンジニア',
  intern: 'インターン'
}

const roleIcons = {
  tech_lead: Crown,
  senior_engineer: Shield,
  engineer: Code,
  junior_engineer: GitBranch,
  intern: Users
}

export default function TeamsManagement() {
  const { user } = useAuth()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(mockTeams[0]?.id || null)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showInviteMember, setShowInviteMember] = useState(false)

  const currentTeam = selectedTeam ? mockTeams.find(t => t.id === selectedTeam) : null

  const teamStats = useMemo(() => {
    if (!currentTeam) return null
    
    const totalMembers = currentTeam.members.length
    const totalHours = currentTeam.members.reduce((sum, member) => sum + member.totalHours, 0)
    const thisWeekHours = currentTeam.members.reduce((sum, member) => sum + member.thisWeekHours, 0)
    const avgHoursPerMember = totalMembers > 0 ? Math.round(thisWeekHours / totalMembers) : 0
    
    return {
      totalMembers,
      totalHours,
      thisWeekHours,
      avgHoursPerMember
    }
  }, [currentTeam])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                チーム管理
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowInviteMember(true)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                メンバー招待
              </button>
              <button
                onClick={() => setShowCreateTeam(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                チーム作成
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Teams Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  チーム一覧
                </h2>
                
                <div className="space-y-2">
                  {mockTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedTeam === team.id
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {team.members.length}名のメンバー
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Details */}
          <div className="lg:col-span-3">
            {currentTeam ? (
              <div className="space-y-6">
                {/* Team Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currentTeam.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {currentTeam.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Team Stats */}
                  {teamStats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Users className="h-6 w-6 text-blue-600 mr-2" />
                          <div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">メンバー数</div>
                            <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                              {teamStats.totalMembers}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Clock className="h-6 w-6 text-green-600 mr-2" />
                          <div>
                            <div className="text-sm text-green-600 dark:text-green-400">今週の時間</div>
                            <div className="text-xl font-bold text-green-900 dark:text-green-100">
                              {teamStats.thisWeekHours}h
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="h-6 w-6 text-orange-600 mr-2" />
                          <div>
                            <div className="text-sm text-orange-600 dark:text-orange-400">平均時間/人</div>
                            <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                              {teamStats.avgHoursPerMember}h
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Code className="h-6 w-6 text-purple-600 mr-2" />
                          <div>
                            <div className="text-sm text-purple-600 dark:text-purple-400">累計時間</div>
                            <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                              {teamStats.totalHours}h
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Members */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    チームメンバー
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentTeam.members.map((member) => {
                      const RoleIcon = roleIcons[member.role as keyof typeof roleIcons]
                      
                      return (
                        <div
                          key={member.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {member.name.slice(0, 2)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                  {member.name}
                                </h4>
                                <RoleIcon className="h-4 w-4 text-gray-500" />
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {roleLabels[member.role as keyof typeof roleLabels]}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                <span>今週: {member.thisWeekHours}h</span>
                                <span>累計: {member.totalHours}h</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {member.skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {member.skills.length > 3 && (
                                  <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded">
                                    +{member.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  チームを選択してください
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  左側からチームを選択してメンバーと詳細を表示します
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                新しいチームを作成
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    チーム名
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="例: フロントエンドチーム"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    説明
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="チームの役割や目的を入力"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateTeam(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => setShowCreateTeam(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  作成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                メンバーを招待
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    役割
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="engineer">エンジニア</option>
                    <option value="senior_engineer">シニアエンジニア</option>
                    <option value="tech_lead">テックリード</option>
                    <option value="junior_engineer">ジュニアエンジニア</option>
                    <option value="intern">インターン</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowInviteMember(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => setShowInviteMember(false)}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  招待送信
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}