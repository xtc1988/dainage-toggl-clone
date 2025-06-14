import { configureStore } from '@reduxjs/toolkit'
import { timerSlice } from './timerSlice'
import { projectsSlice } from './projectsSlice'
import { timeEntriesSlice } from './timeEntriesSlice'
import { uiSlice } from './uiSlice'

export const store = configureStore({
  reducer: {
    timer: timerSlice.reducer,
    projects: projectsSlice.reducer,
    timeEntries: timeEntriesSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch