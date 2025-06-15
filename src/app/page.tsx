'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  console.log('🔥 HOME PAGE RENDER:')
  console.log('  Has User:', !!user)
  console.log('  User ID:', user?.id || 'null')
  console.log('  User Email:', user?.email || 'null')
  console.log('  Loading:', loading)
  console.log('  Current Path:', typeof window !== 'undefined' ? window.location.pathname : 'server')

  if (loading) {
    console.log('🔥 HomePage: Still loading, showing spinner')
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    console.log('🔥 HomePage: User found, attempting redirect to dashboard')
    console.log('🔥 Router push called with:', '/dashboard')
    router.push('/dashboard')
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">ダッシュボードにリダイレクト中...</p>
      </div>
    )
  }

  console.log('🔥 HomePage: No user, showing landing page')


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="z-10 max-w-5xl w-full items-center justify-between">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            DAINAGE
          </h1>
          <h2 className="text-2xl font-medium text-gray-600 dark:text-gray-300 mb-8">
            開発チーム特化の時間管理ツール
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            スプリント管理、Git連携、ベロシティ計算など、開発チームのための機能を備えた
            次世代の時間追跡システム
          </p>
          
          <div className="flex justify-center mb-12">
            <button
              onClick={() => router.push('/auth')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              Google でログイン
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                スプリント管理
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                スプリント別の工数集計とベロシティ計算で開発効率を可視化
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Git連携
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                GitHubやGitLabと連携してブランチやコミットと時間を紐付け
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                開発メトリクス
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                コードレビュー時間やバグ修正時間などの開発特化メトリクス
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}