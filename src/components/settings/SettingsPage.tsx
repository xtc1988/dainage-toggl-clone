'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import NavBar from '@/components/Navigation/NavBar'
import { 
  Settings, 
  User, 
  Clock, 
  Bell, 
  Shield, 
  Globe, 
  Palette,
  Download,
  Trash2,
  Save,
  Moon,
  Sun,
  Monitor,
  Github,
  Mail,
  Key,
  Database
} from 'lucide-react'

const settingsCategories = [
  {
    id: 'profile',
    name: 'プロフィール',
    icon: User,
    description: 'ユーザー情報とアカウント設定'
  },
  {
    id: 'time-tracking',
    name: '時間追跡',
    icon: Clock,
    description: 'タイマーとトラッキング設定'
  },
  {
    id: 'notifications',
    name: '通知',
    icon: Bell,
    description: '通知設定と配信オプション'
  },
  {
    id: 'integrations',
    name: '連携',
    icon: Github,
    description: '外部サービスとの連携設定'
  },
  {
    id: 'appearance',
    name: '外観',
    icon: Palette,
    description: 'テーマとUI設定'
  },
  {
    id: 'privacy',
    name: 'プライバシー',
    icon: Shield,
    description: 'セキュリティとプライバシー設定'
  },
  {
    id: 'data',
    name: 'データ',
    icon: Database,
    description: 'データエクスポートと削除'
  }
]

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [activeCategory, setActiveCategory] = useState('profile')
  const [settings, setSettings] = useState({
    profile: {
      displayName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      timezone: 'Asia/Tokyo',
      language: 'ja',
      avatar: user?.user_metadata?.avatar_url || ''
    },
    timeTracking: {
      autoStart: false,
      reminderInterval: 30,
      defaultProject: '',
      roundingMinutes: 15,
      weekStartDay: 1, // Monday
      dailyGoal: 8
    },
    notifications: {
      email: true,
      desktop: true,
      dailyReport: true,
      weeklyReport: true,
      idleReminder: true,
      idleThreshold: 10
    },
    integrations: {
      github: { connected: true, username: 'user123' },
      gitlab: { connected: false, username: '' },
      jira: { connected: false, server: '', username: '' },
      slack: { connected: false, workspace: '' }
    },
    appearance: {
      theme: 'system', // light, dark, system
      language: 'ja',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h'
    },
    privacy: {
      publicProfile: false,
      shareStats: false,
      analyticsOptOut: false,
      twoFactorAuth: false
    }
  })

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                基本情報
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    表示名
                  </label>
                  <input
                    type="text"
                    value={settings.profile.displayName}
                    onChange={(e) => updateSetting('profile', 'displayName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    メールアドレスはGoogle認証で設定されています
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    タイムゾーン
                  </label>
                  <select
                    value={settings.profile.timezone}
                    onChange={(e) => updateSetting('profile', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    言語
                  </label>
                  <select
                    value={settings.profile.language}
                    onChange={(e) => updateSetting('profile', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'time-tracking':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                タイマー設定
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      自動タイマー開始
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ログイン時に自動的にタイマーを開始
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('timeTracking', 'autoStart', !settings.timeTracking.autoStart)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.timeTracking.autoStart ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        settings.timeTracking.autoStart ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    時間の丸め（分）
                  </label>
                  <select
                    value={settings.timeTracking.roundingMinutes}
                    onChange={(e) => updateSetting('timeTracking', 'roundingMinutes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={1}>丸めなし</option>
                    <option value={5}>5分</option>
                    <option value={15}>15分</option>
                    <option value={30}>30分</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    一日の目標時間（時間）
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={settings.timeTracking.dailyGoal}
                    onChange={(e) => updateSetting('timeTracking', 'dailyGoal', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                通知設定
              </h3>
              
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'メール通知', desc: 'レポートやアップデートをメールで受信' },
                  { key: 'desktop', label: 'デスクトップ通知', desc: 'ブラウザのプッシュ通知を有効化' },
                  { key: 'dailyReport', label: '日次レポート', desc: '毎日の作業時間サマリーを送信' },
                  { key: 'weeklyReport', label: '週次レポート', desc: '週間の作業分析レポートを送信' },
                  { key: 'idleReminder', label: 'アイドル通知', desc: '一定時間非アクティブ時に通知' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        {label}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {desc}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', key, !settings.notifications[key as keyof typeof settings.notifications])}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.notifications[key as keyof typeof settings.notifications] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                          settings.notifications[key as keyof typeof settings.notifications] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                テーマ設定
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { value: 'light', label: 'ライト', icon: Sun },
                  { value: 'dark', label: 'ダーク', icon: Moon },
                  { value: 'system', label: 'システム', icon: Monitor }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => updateSetting('appearance', 'theme', value)}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      settings.appearance.theme === value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {label}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    日付形式
                  </label>
                  <select
                    value={settings.appearance.dateFormat}
                    onChange={(e) => updateSetting('appearance', 'dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="YYYY-MM-DD">2024-01-30</option>
                    <option value="DD/MM/YYYY">30/01/2024</option>
                    <option value="MM/DD/YYYY">01/30/2024</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    時刻形式
                  </label>
                  <select
                    value={settings.appearance.timeFormat}
                    onChange={(e) => updateSetting('appearance', 'timeFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="24h">24時間 (14:30)</option>
                    <option value="12h">12時間 (2:30 PM)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                データ管理
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Download className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      データエクスポート
                    </h4>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    すべての時間記録データをCSVまたはJSON形式でエクスポートできます
                  </p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                      CSV出力
                    </button>
                    <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                      JSON出力
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Trash2 className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-900 dark:text-red-100">
                      アカウント削除
                    </h4>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    アカウントとすべてのデータを完全に削除します。この操作は取り消せません。
                  </p>
                  <button className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                    アカウントを削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              カテゴリを選択してください
            </p>
          </div>
        )
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
              <Settings className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                設定
              </h1>
            </div>
            
            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Save className="h-4 w-4 mr-2" />
              保存
            </button>
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
                  設定カテゴリ
                </h2>
                
                <nav className="space-y-2">
                  {settingsCategories.map((category) => {
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
                          <div>
                            <div className="font-medium text-sm">{category.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {category.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              {renderCategoryContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}