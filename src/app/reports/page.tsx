'use client'

import { useAuth } from '@/hooks/useAuth'
import { redirect } from 'next/navigation'
import ReportsDashboard from '@/components/reports/ReportsDashboard'

export default function ReportsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect('/')
  }

  return <ReportsDashboard />
}