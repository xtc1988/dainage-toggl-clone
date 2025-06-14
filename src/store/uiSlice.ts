import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  currentPage: string
  theme: 'light' | 'dark' | 'system'
  notifications: Notification[]
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

const initialState: UIState = {
  sidebarOpen: true,
  currentPage: 'dashboard',
  theme: 'system',
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setCurrentPage,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions

export { uiSlice }