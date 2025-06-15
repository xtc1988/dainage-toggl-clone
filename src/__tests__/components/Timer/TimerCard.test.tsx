import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import TimerCard from '@/components/Timer/TimerCard'
import { timerSlice } from '@/store/timerSlice'
import { projectsSlice } from '@/store/projectsSlice'

// Mock hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com'
    }
  })
}))

jest.mock('@/hooks/useTimer', () => ({
  useTimer: () => ({
    isRunning: false,
    formattedTime: '0:00',
    currentEntry: null,
    startTimer: jest.fn(),
    stopTimer: jest.fn(),
    loading: false
  })
}))

jest.mock('@/hooks/useTestTimer', () => ({
  useTestTimer: () => ({
    isRunning: false,
    formattedTime: '0:00',
    currentEntry: null,
    startTimer: jest.fn(),
    stopTimer: jest.fn(),
    loading: false
  })
}))

jest.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({
    projects: [
      {
        id: 'project-1',
        name: 'Test Project',
        color: '#3B82F6',
        description: 'Test project description'
      },
      {
        id: 'project-2',
        name: 'Another Project',
        color: '#10B981',
        description: 'Another test project'
      }
    ],
    loading: false,
    error: null
  })
}))

const renderWithRedux = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      timer: timerSlice.reducer,
      projects: projectsSlice.reducer,
    },
  })

  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

describe('TimerCard', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders timer display correctly', () => {
    renderWithRedux(<TimerCard />)
    
    expect(screen.getByText('0:00')).toBeInTheDocument()
    expect(screen.getByText('タイマー停止中')).toBeInTheDocument()
  })

  it('shows project selection dropdown when not running', () => {
    renderWithRedux(<TimerCard />)
    
    expect(screen.getByText('プロジェクトを選択')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /プロジェクトを選択/ })).toBeInTheDocument()
  })

  it('opens project dropdown when clicked', async () => {
    renderWithRedux(<TimerCard />)
    
    const dropdownButton = screen.getByRole('button', { name: /プロジェクトを選択/ })
    await user.click(dropdownButton)
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('Another Project')).toBeInTheDocument()
  })

  it('selects a project from dropdown', async () => {
    renderWithRedux(<TimerCard />)
    
    const dropdownButton = screen.getByRole('button', { name: /プロジェクトを選択/ })
    await user.click(dropdownButton)
    
    const projectOption = screen.getByText('Test Project')
    await user.click(projectOption)
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('has description input field', () => {
    renderWithRedux(<TimerCard />)
    
    const descriptionInput = screen.getByPlaceholderText('何をしていますか？（任意）')
    expect(descriptionInput).toBeInTheDocument()
    expect(descriptionInput).not.toBeDisabled()
  })

  it('allows typing in description field', async () => {
    renderWithRedux(<TimerCard />)
    
    const descriptionInput = screen.getByPlaceholderText('何をしていますか？（任意）')
    await user.type(descriptionInput, 'Test description')
    
    expect(descriptionInput).toHaveValue('Test description')
  })

  it('shows start button when timer is not running', () => {
    renderWithRedux(<TimerCard />)
    
    const startButton = screen.getByRole('button', { name: /開始/ })
    expect(startButton).toBeInTheDocument()
    expect(startButton).toBeDisabled() // Disabled because no project selected
  })

  it('disables start button when no project is selected', () => {
    renderWithRedux(<TimerCard />)
    
    const startButton = screen.getByRole('button', { name: /開始/ })
    expect(startButton).toBeDisabled()
  })

  it('enables start button when project is selected', async () => {
    renderWithRedux(<TimerCard />)
    
    // Select a project
    const dropdownButton = screen.getByRole('button', { name: /プロジェクトを選択/ })
    await user.click(dropdownButton)
    
    const projectOption = screen.getByText('Test Project')
    await user.click(projectOption)
    
    // Check if start button is enabled
    const startButton = screen.getByRole('button', { name: /開始/ })
    expect(startButton).not.toBeDisabled()
  })
})

describe('TimerCard - Running State', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock running timer state
    jest.mock('@/hooks/useTimer', () => ({
      useTimer: () => ({
        isRunning: true,
        formattedTime: '1:23',
        currentEntry: {
          id: 'entry-1',
          project: {
            id: 'project-1',
            name: 'Test Project',
            color: '#3B82F6'
          },
          description: 'Working on tests',
          start_time: new Date().toISOString()
        },
        startTimer: jest.fn(),
        stopTimer: jest.fn(),
        loading: false
      })
    }))
  })

  it('shows running timer display', () => {
    renderWithRedux(<TimerCard />)
    
    expect(screen.getByText('タイマー実行中')).toBeInTheDocument()
  })

  it('hides project selection when running', () => {
    renderWithRedux(<TimerCard />)
    
    expect(screen.queryByText('プロジェクトを選択')).not.toBeInTheDocument()
  })

  it('disables description input when running', () => {
    renderWithRedux(<TimerCard />)
    
    const descriptionInput = screen.getByPlaceholderText('何をしていますか？（任意）')
    expect(descriptionInput).toBeDisabled()
  })

  it('shows stop button when running', () => {
    renderWithRedux(<TimerCard />)
    
    const stopButton = screen.getByRole('button', { name: /停止/ })
    expect(stopButton).toBeInTheDocument()
    expect(stopButton).not.toBeDisabled()
  })
})