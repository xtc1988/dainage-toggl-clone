import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getTimeEntries, updateTimeEntry, deleteTimeEntry } from '@/lib/supabase/client'
import type { TimeEntry } from '@/types'

interface TimeEntriesState {
  entries: TimeEntry[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    hasMore: boolean
  }
}

const initialState: TimeEntriesState = {
  entries: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    hasMore: true,
  },
}

// Async thunks
export const fetchTimeEntries = createAsyncThunk(
  'timeEntries/fetchAll',
  async ({ userId, limit = 50 }: { userId: string; limit?: number }) => {
    const entries = await getTimeEntries(userId, limit)
    return entries
  }
)

export const updateTimeEntryAsync = createAsyncThunk(
  'timeEntries/update',
  async ({
    entryId,
    updates,
  }: {
    entryId: string
    updates: {
      project_id?: string
      task_id?: string
      description?: string
      start_time?: string
      end_time?: string
      tags?: string[]
    }
  }) => {
    const entry = await updateTimeEntry(entryId, updates)
    return entry
  }
)

export const deleteTimeEntryAsync = createAsyncThunk(
  'timeEntries/delete',
  async (entryId: string) => {
    await deleteTimeEntry(entryId)
    return entryId
  }
)

const timeEntriesSlice = createSlice({
  name: 'timeEntries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addTimeEntry: (state, action) => {
      state.entries.unshift(action.payload)
    },
    updateTimeEntryLocal: (state, action) => {
      const index = state.entries.findIndex(e => e.id === action.payload.id)
      if (index !== -1) {
        state.entries[index] = action.payload
      }
    },
    removeTimeEntry: (state, action) => {
      state.entries = state.entries.filter(e => e.id !== action.payload)
    },
    resetPagination: (state) => {
      state.pagination = {
        page: 1,
        limit: 50,
        hasMore: true,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch time entries
      .addCase(fetchTimeEntries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTimeEntries.fulfilled, (state, action) => {
        state.loading = false
        if (state.pagination.page === 1) {
          state.entries = action.payload
        } else {
          state.entries.push(...action.payload)
        }
        state.pagination.hasMore = action.payload.length === state.pagination.limit
      })
      .addCase(fetchTimeEntries.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch time entries'
      })
      
      // Update time entry
      .addCase(updateTimeEntryAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTimeEntryAsync.fulfilled, (state, action) => {
        state.loading = false
        const index = state.entries.findIndex(e => e.id === action.payload.id)
        if (index !== -1) {
          state.entries[index] = action.payload
        }
      })
      .addCase(updateTimeEntryAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update time entry'
      })
      
      // Delete time entry
      .addCase(deleteTimeEntryAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTimeEntryAsync.fulfilled, (state, action) => {
        state.loading = false
        state.entries = state.entries.filter(e => e.id !== action.payload)
      })
      .addCase(deleteTimeEntryAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete time entry'
      })
  },
})

export const {
  clearError,
  addTimeEntry,
  updateTimeEntryLocal,
  removeTimeEntry,
  resetPagination,
} = timeEntriesSlice.actions

export { timeEntriesSlice }