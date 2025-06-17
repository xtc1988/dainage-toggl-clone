import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { startTimer, stopTimer, getActiveTimeEntry } from '@/lib/supabase/client'
import type { TimeEntry } from '@/types'
import { timerLogger } from '@/lib/logger'

interface TimerState {
  currentEntry: TimeEntry | null
  isRunning: boolean
  elapsedTime: number
  loading: boolean
  error: string | null
}

const initialState: TimerState = {
  currentEntry: null,
  isRunning: false,
  elapsedTime: 0,
  loading: false,
  error: null,
}

// Async thunks
export const fetchActiveTimer = createAsyncThunk(
  'timer/fetchActive',
  async (userId: string) => {
    const entry = await getActiveTimeEntry(userId)
    return entry
  }
)

export const startTimerAsync = createAsyncThunk(
  'timer/start',
  async ({
    userId,
    projectId,
    taskId,
    description,
  }: {
    userId: string
    projectId: string
    taskId?: string
    description?: string
  }) => {
    timerLogger.info('startTimerAsync called', { userId, projectId, taskId, description })
    try {
      const entry = await startTimer(userId, projectId, taskId, description)
      timerLogger.info('startTimer returned', entry)
      return entry
    } catch (error) {
      timerLogger.error('startTimer failed', error as Error, { userId, projectId, taskId, description })
      throw error
    }
  }
)

export const stopTimerAsync = createAsyncThunk(
  'timer/stop',
  async (entryId: string) => {
    const entry = await stopTimer(entryId)
    return entry
  }
)

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    updateElapsedTime: (state, action: PayloadAction<number>) => {
      state.elapsedTime = action.payload
    },
    resetTimer: (state) => {
      state.currentEntry = null
      state.isRunning = false
      state.elapsedTime = 0
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active timer
      .addCase(fetchActiveTimer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActiveTimer.fulfilled, (state, action) => {
        state.loading = false
        state.currentEntry = action.payload
        state.isRunning = !!action.payload?.is_running
        
        // Calculate elapsed time if timer is running
        if (action.payload?.is_running && action.payload.start_time) {
          const startTime = new Date(action.payload.start_time).getTime()
          const now = Date.now()
          state.elapsedTime = Math.floor((now - startTime) / 1000)
        } else {
          state.elapsedTime = action.payload?.duration || 0
        }
      })
      .addCase(fetchActiveTimer.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch active timer'
      })
      
      // Start timer
      .addCase(startTimerAsync.pending, (state) => {
        console.log('🔥 startTimerAsync.pending')
        state.loading = true
        state.error = null
      })
      .addCase(startTimerAsync.fulfilled, (state, action) => {
        console.log('🔥 startTimerAsync.fulfilled with payload:', action.payload)
        state.loading = false
        state.currentEntry = action.payload
        state.isRunning = true
        state.elapsedTime = 0
      })
      .addCase(startTimerAsync.rejected, (state, action) => {
        timerLogger.error('startTimerAsync rejected', new Error(action.error.message || 'Unknown error'), {
          errorCode: action.error.code,
          errorName: action.error.name,
          errorMessage: action.error.message
        })
        state.loading = false
        state.error = action.error.message || 'Failed to start timer'
      })
      
      // Stop timer
      .addCase(stopTimerAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(stopTimerAsync.fulfilled, (state, action) => {
        state.loading = false
        state.currentEntry = action.payload
        state.isRunning = false
        state.elapsedTime = action.payload.duration || state.elapsedTime
      })
      .addCase(stopTimerAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to stop timer'
      })
  },
})

export const { updateElapsedTime, resetTimer, clearError } = timerSlice.actions
export { timerSlice }