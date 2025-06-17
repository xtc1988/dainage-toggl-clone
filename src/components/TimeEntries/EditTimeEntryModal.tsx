'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

import { TimeEntry } from '@/hooks/useTimeEntries'

interface EditTimeEntryModalProps {
  entry: TimeEntry | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedEntry: TimeEntry) => void
}

export default function EditTimeEntryModal({ entry, isOpen, onClose, onSave }: EditTimeEntryModalProps) {
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    start_time: '',
    end_time: '',
    start_date: '',
    start_time_only: '',
    end_time_only: ''
  })

  useEffect(() => {
    if (entry) {
      const startDate = new Date(entry.start_time)
      const endDate = entry.end_time ? new Date(entry.end_time) : new Date()
      
      setFormData({
        project_name: entry.projects?.name || '',
        description: entry.description || '',
        start_time: entry.start_time,
        end_time: entry.end_time || '',
        start_date: startDate.toISOString().split('T')[0],
        start_time_only: startDate.toTimeString().slice(0, 5),
        end_time_only: endDate.toTimeString().slice(0, 5)
      })
    }
  }, [entry])

  const handleSave = () => {
    if (!entry) return

    const startDateTime = new Date(`${formData.start_date}T${formData.start_time_only}`)
    const endDateTime = new Date(`${formData.start_date}T${formData.end_time_only}`)
    
    // Calculate duration in seconds
    const duration = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000)

    const updatedEntry: TimeEntry = {
      ...entry,
      description: formData.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration: duration,
      is_running: false
    }

    onSave(updatedEntry)
    onClose()
  }

  if (!isOpen || !entry) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            時間エントリを編集
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              プロジェクト
            </label>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: entry.projects?.color || '#3B82F6' }}
              />
              <span className="text-gray-900 dark:text-white">{entry.projects?.name || 'Unknown Project'}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              説明
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="何をしていましたか？"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              日付
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                開始時刻
              </label>
              <input
                type="time"
                value={formData.start_time_only}
                onChange={(e) => setFormData({ ...formData, start_time_only: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                終了時刻
              </label>
              <input
                type="time"
                value={formData.end_time_only}
                onChange={(e) => setFormData({ ...formData, end_time_only: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Duration Display */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              総時間: {(() => {
                if (formData.start_time_only && formData.end_time_only) {
                  const start = new Date(`2000-01-01T${formData.start_time_only}`)
                  const end = new Date(`2000-01-01T${formData.end_time_only}`)
                  const diffMs = end.getTime() - start.getTime()
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                  return `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`
                }
                return '0:00'
              })()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </button>
        </div>
      </div>
    </div>
  )
}