'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTimer } from '@/hooks/useTimer'
import { Clock, Edit, Trash2, Play } from 'lucide-react'
import EditTimeEntryModal from './EditTimeEntryModal'
import AddTimeEntryModal from './AddTimeEntryModal'

interface TimeEntry {
  id: string
  project_name: string
  project_color: string
  description?: string
  start_time: string
  end_time?: string
  duration: number
}

export default function TimeEntryList() {
  const { user } = useAuth()
  const { startTimer } = useTimer()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // Mock data for testing
  useEffect(() => {
    const mockEntries: TimeEntry[] = [
      {
        id: '1',
        project_name: 'サンプルプロジェクト',
        project_color: '#3B82F6',
        description: 'UI コンポーネントの実装',
        start_time: '2024-12-15T09:00:00',
        end_time: '2024-12-15T11:30:00',
        duration: 9000 // 2.5時間（秒）
      },
      {
        id: '2',
        project_name: 'ウェブサイト開発',
        project_color: '#10B981',
        description: 'データベース設計',
        start_time: '2024-12-15T13:00:00',
        end_time: '2024-12-15T15:45:00',
        duration: 9900 // 2時間45分（秒）
      },
      {
        id: '3',
        project_name: 'サンプルプロジェクト',
        project_color: '#3B82F6',
        description: 'バグ修正とテスト',
        start_time: '2024-12-15T16:00:00',
        end_time: '2024-12-15T17:20:00',
        duration: 4800 // 1時間20分（秒）
      }
    ]
    
    setEntries(mockEntries)
    setLoading(false)
  }, [selectedDate])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime)
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getTotalDuration = (): string => {
    const total = entries.reduce((sum, entry) => sum + entry.duration, 0)
    return formatTime(total)
  }

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setShowEditModal(true)
  }

  const handleSaveEntry = (updatedEntry: TimeEntry) => {
    setEntries(entries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ))
  }

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('この時間エントリを削除しますか？')) {
      setEntries(entries.filter(entry => entry.id !== entryId))
    }
  }

  const handleContinueEntry = async (entry: TimeEntry) => {
    // Extract project ID from entry - in a real app this would be stored
    // For now, we'll use the project name to find the project
    const projectId = entry.id // Simplified for demo
    await startTimer(projectId, undefined, entry.description)
  }

  const handleAddEntry = (newEntry: Omit<TimeEntry, 'id'>) => {
    const entry: TimeEntry = {
      ...newEntry,
      id: Date.now().toString() // Simple ID generation for demo
    }
    setEntries([...entries, entry])
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              時間エントリ
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            合計: <span className="font-mono font-semibold text-lg">{getTotalDuration()}</span>
          </div>
        </div>

        {/* Entries List */}
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            この日の時間エントリはありません
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                {/* Project Color Indicator */}
                <div
                  className="w-4 h-4 rounded-full mr-4 flex-shrink-0"
                  style={{ backgroundColor: entry.project_color }}
                />

                {/* Entry Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {entry.project_name}
                    </h3>
                    {entry.description && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        - {entry.description}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDateTime(entry.start_time)} - {entry.end_time ? formatDateTime(entry.end_time) : '実行中'}
                  </div>
                </div>

                {/* Duration */}
                <div className="text-right mr-4">
                  <div className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                    {formatTime(entry.duration)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleContinueEntry(entry)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="続行"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditEntry(entry)}
                    className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                    title="編集"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Manual Entry Button */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Clock className="h-5 w-5 mr-2" />
            手動で時間エントリを追加
          </button>
        </div>
      </div>

      {/* Modals */}
      <EditTimeEntryModal
        entry={editingEntry}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingEntry(null)
        }}
        onSave={handleSaveEntry}
      />
      
      <AddTimeEntryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddEntry}
      />
    </div>
  )
}