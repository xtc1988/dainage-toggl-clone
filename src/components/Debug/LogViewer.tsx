'use client'

import { useState, useEffect } from 'react'
import { logger, LogLevel } from '@/lib/logger'

export default function LogViewer() {
  const [logs, setLogs] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [filterLevel, setFilterLevel] = useState<LogLevel>(LogLevel.DEBUG)

  const refreshLogs = () => {
    const filteredLogs = logger.getLogsByLevel(filterLevel)
    const formatted = filteredLogs
      .map(log => {
        const level = LogLevel[log.level]
        const data = log.data ? ` | Data: ${JSON.stringify(log.data)}` : ''
        const error = log.error ? ` | Error: ${log.error.message}` : ''
        return `${log.timestamp} [${level}] ${log.category}: ${log.message}${data}${error}`
      })
      .join('\n')
    setLogs(formatted)
  }

  useEffect(() => {
    refreshLogs()
    const interval = setInterval(refreshLogs, 1000)
    return () => clearInterval(interval)
  }, [filterLevel])

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700"
        >
          📋 Logs
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-gray-900 text-green-400 text-xs font-mono rounded-lg shadow-2xl z-50">
      <div className="flex items-center justify-between p-2 bg-gray-800 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span>📋 System Logs</span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(Number(e.target.value) as LogLevel)}
            className="bg-gray-700 text-white text-xs rounded px-1"
          >
            <option value={LogLevel.DEBUG}>DEBUG+</option>
            <option value={LogLevel.INFO}>INFO+</option>
            <option value={LogLevel.WARN}>WARN+</option>
            <option value={LogLevel.ERROR}>ERROR</option>
          </select>
        </div>
        <div className="flex gap-1">
          <button
            onClick={refreshLogs}
            className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-500"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              logger.clearLogs()
              setLogs('')
            }}
            className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-500"
          >
            Clear
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs bg-gray-600 px-2 py-1 rounded hover:bg-gray-500"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="p-2 h-80 overflow-y-auto">
        <pre className="text-xs whitespace-pre-wrap break-words">
          {logs || 'No logs available'}
        </pre>
      </div>
    </div>
  )
}