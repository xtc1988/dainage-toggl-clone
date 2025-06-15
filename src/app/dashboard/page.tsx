'use client'

import { useAuth } from '@/hooks/useAuth'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/Dashboard/Dashboard'

export default function DashboardPage() {
  const { user, loading } = useAuth()

  console.log('🔥 DASHBOARD PAGE RENDER:')
  console.log('  Has User:', !!user)
  console.log('  User ID:', user?.id || 'null')
  console.log('  User Email:', user?.email || 'null')
  console.log('  Loading:', loading)
  console.log('  Current Path:', typeof window !== 'undefined' ? window.location.pathname : 'server')

  if (loading) {
    console.log('🔥 DashboardPage: Still loading, showing spinner')
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    console.log('🔥 DashboardPage: No user, redirecting to /')
    redirect('/')
  }

  console.log('🔥 DashboardPage: User found, rendering dashboard')
  return <Dashboard />
}