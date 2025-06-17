// Production-ready logging system
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  category: string
  message: string
  data?: any
  error?: Error
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private minLevel = LogLevel.DEBUG

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private addLog(level: LogLevel, category: string, message: string, data?: any, error?: Error) {
    const logEntry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      category,
      message,
      data,
      error
    }

    this.logs.push(logEntry)
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Also output to console in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const levelName = LogLevel[level]
      const prefix = `[${levelName}] ${category}:`
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, data)
          break
        case LogLevel.INFO:
          console.log(prefix, message, data)
          break
        case LogLevel.WARN:
          console.warn(prefix, message, data)
          break
        case LogLevel.ERROR:
          console.error(prefix, message, data, error)
          break
      }
    }

    // In production, you would send critical logs to a service like Sentry, LogRocket, etc.
    if (level >= LogLevel.ERROR && typeof window !== 'undefined') {
      // Example: send to monitoring service
      // Sentry.captureException(error || new Error(message))
    }
  }

  debug(category: string, message: string, data?: any) {
    if (this.minLevel <= LogLevel.DEBUG) {
      this.addLog(LogLevel.DEBUG, category, message, data)
    }
  }

  info(category: string, message: string, data?: any) {
    if (this.minLevel <= LogLevel.INFO) {
      this.addLog(LogLevel.INFO, category, message, data)
    }
  }

  warn(category: string, message: string, data?: any) {
    if (this.minLevel <= LogLevel.WARN) {
      this.addLog(LogLevel.WARN, category, message, data)
    }
  }

  error(category: string, message: string, error?: Error, data?: any) {
    this.addLog(LogLevel.ERROR, category, message, data, error)
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level >= level)
  }

  // Get logs by category
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category)
  }

  // Clear logs
  clearLogs() {
    this.logs = []
  }

  // Get formatted logs for display
  getFormattedLogs(): string {
    return this.logs
      .map(log => {
        const level = LogLevel[log.level]
        const data = log.data ? ` | Data: ${JSON.stringify(log.data)}` : ''
        const error = log.error ? ` | Error: ${log.error.message}` : ''
        return `${log.timestamp} [${level}] ${log.category}: ${log.message}${data}${error}`
      })
      .join('\n')
  }
}

// Global logger instance
export const logger = new Logger()

// Helper functions for common categories
export const timerLogger = {
  debug: (message: string, data?: any) => logger.debug('TIMER', message, data),
  info: (message: string, data?: any) => logger.info('TIMER', message, data),
  warn: (message: string, data?: any) => logger.warn('TIMER', message, data),
  error: (message: string, error?: Error, data?: any) => logger.error('TIMER', message, error, data)
}

export const authLogger = {
  debug: (message: string, data?: any) => logger.debug('AUTH', message, data),
  info: (message: string, data?: any) => logger.info('AUTH', message, data),
  warn: (message: string, data?: any) => logger.warn('AUTH', message, data),
  error: (message: string, error?: Error, data?: any) => logger.error('AUTH', message, error, data)
}

export const apiLogger = {
  debug: (message: string, data?: any) => logger.debug('API', message, data),
  info: (message: string, data?: any) => logger.info('API', message, data),
  warn: (message: string, data?: any) => logger.warn('API', message, data),
  error: (message: string, error?: Error, data?: any) => logger.error('API', message, error, data)
}