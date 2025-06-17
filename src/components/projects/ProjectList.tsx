'use client'

import { useState, useEffect } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { Plus, Edit, Trash2, FolderOpen, Clock } from 'lucide-react'
import AddProjectModal from './AddProjectModal'
import EditProjectModal from './EditProjectModal'
import { timerLogger } from '@/lib/logger'

export default function ProjectList() {
  const { projects, deleteProject } = useProjects()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)

  // Log project count changes
  useEffect(() => {
    timerLogger.info('ProjectList projects updated', { count: projects.length, projects })
  }, [projects])

  // Mock data for project statistics
  const getProjectStats = (projectId: string) => {
    // In a real app, this would fetch actual statistics
    return {
      totalTime: Math.floor(Math.random() * 40) + 'h ' + Math.floor(Math.random() * 60) + 'm',
      entriesCount: Math.floor(Math.random() * 50) + 1,
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')
    }
  }

  const handleEdit = (project: any) => {
    setEditingProject(project)
    setShowEditModal(true)
  }

  const handleDelete = async (projectId: string) => {
    if (confirm('このプロジェクトを削除しますか？関連する時間エントリも削除されます。')) {
      try {
        timerLogger.info('Deleting project', { projectId })
        await deleteProject(projectId)
        timerLogger.info('Project deleted successfully', { projectId })
      } catch (error) {
        timerLogger.error('Failed to delete project', error as Error, { projectId })
        alert('プロジェクトの削除に失敗しました')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FolderOpen className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                プロジェクト管理
              </h1>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              新しいプロジェクト
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">総プロジェクト数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">アクティブプロジェクト</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-semibold text-sm">Σ</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">総記録時間</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(Math.random() * 200) + 50}h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-12 text-center">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                プロジェクトがありません
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                最初のプロジェクトを作成して時間の記録を始めましょう
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                プロジェクトを作成
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const stats = getProjectStats(project.id)
              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow group"
                >
                  <div className="p-6">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="編集"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Project Statistics */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">総時間</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {stats.totalTime}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">エントリ数</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stats.entriesCount}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">最終活動</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {stats.lastActivity}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar (Mock) */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">今週の進捗</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: project.color,
                            width: `${Math.floor(Math.random() * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      
      <EditProjectModal
        project={editingProject}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingProject(null)
        }}
      />
    </div>
  )
}