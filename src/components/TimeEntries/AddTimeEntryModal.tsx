'use client'

import { useState } from 'react'
import { X, Plus, ChevronDown } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'

interface TimeEntry {
  id: string
  project_name: string
  project_color: string
  description?: string
  start_time: string
  end_time?: string
  duration: number
}

interface AddTimeEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (newEntry: Omit<TimeEntry, 'id'>) => void
}

export default function AddTimeEntryModal({ isOpen, onClose, onAdd }: AddTimeEntryModalProps) {
  const { projects } = useProjects()
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [formData, setFormData] = useState({
    project_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:00'
  })

  const selectedProject = projects.find(p => p.id === formData.project_id)

  const handleAdd = () => {
    if (!selectedProject) return

    const startDateTime = new Date(`${formData.date}T${formData.start_time}`)
    const endDateTime = new Date(`${formData.date}T${formData.end_time}`)
    
    // Calculate duration in seconds
    const duration = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000)

    const newEntry: Omit<TimeEntry, 'id'> = {
      project_name: selectedProject.name,
      project_color: selectedProject.color,
      description: formData.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration: duration
    }

    onAdd(newEntry)
    
    // Reset form
    setFormData({
      project_id: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '10:00'
    })
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            手動で時間エントリを追加
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
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              プロジェクト *
            </label>
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="flex items-center">
                  {selectedProject ? (
                    <>
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: selectedProject.color }}
                      />
                      {selectedProject.name}
                    </>
                  ) : (
                    'プロジェクトを選択'
                  )}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showProjectDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setFormData({ ...formData, project_id: project.id })
                        setShowProjectDropdown(false)
                      }}
                      className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-gray-900 dark:text-white">{project.name}</span>
                    </button>
                  ))}
                </div>
              )}
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
              日付 *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                開始時刻 *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                終了時刻 *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Duration Display */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              総時間: {(() => {
                const start = new Date(`2000-01-01T${formData.start_time}`)
                const end = new Date(`2000-01-01T${formData.end_time}`)
                const diffMs = end.getTime() - start.getTime()
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                return `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`
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
            onClick={handleAdd}
            disabled={!formData.project_id}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            追加
          </button>
        </div>
      </div>
    </div>
  )
}