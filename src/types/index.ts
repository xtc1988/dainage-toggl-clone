export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  color: string
  user_id: string
  description?: string
  team_id?: string
  is_archived?: boolean
  created_at?: string
  updated_at?: string
}

export interface Task {
  id: string
  project_id: string
  name: string
  description?: string
  task_type: 'feature' | 'bug' | 'review' | 'meeting' | 'research' | 'testing' | 'deployment' | 'other'
  git_branch?: string
  git_commit?: string
  external_ticket_id?: string
  external_ticket_url?: string
  estimated_hours?: number
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  project_id: string
  task_id?: string
  description?: string
  start_time: string
  end_time?: string
  duration?: number // in seconds
  is_running: boolean
  tags?: string[]
  created_at: string
  updated_at: string
  
  // Relations
  project?: Project
  task?: Task
}

export interface Team {
  id: string
  name: string
  description?: string
  tech_stack?: string[]
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'member' | 'lead' | 'admin'
  joined_at: string
  
  // Relations
  user?: User
  team?: Team
}

export interface Sprint {
  id: string
  team_id: string
  name: string
  description?: string
  start_date: string
  end_date: string
  goal?: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  velocity_points?: number
  created_at: string
  updated_at: string
}

export interface SprintTask {
  id: string
  sprint_id: string
  task_id: string
  story_points?: number
  status: 'todo' | 'in_progress' | 'review' | 'done'
  assigned_user_id?: string
  
  // Relations
  sprint?: Sprint
  task?: Task
  assigned_user?: User
}

// Timer state for Redux
export interface TimerState {
  currentEntry: TimeEntry | null
  isRunning: boolean
  startTime: string | null
  elapsedTime: number // in seconds
}

// Report interfaces
export interface TimeReport {
  total_duration: number
  entries_count: number
  project_breakdown: ProjectTimeBreakdown[]
  daily_breakdown: DailyTimeBreakdown[]
  task_type_breakdown: TaskTypeBreakdown[]
}

export interface ProjectTimeBreakdown {
  project_id: string
  project_name: string
  project_color: string
  total_duration: number
  entries_count: number
  percentage: number
}

export interface DailyTimeBreakdown {
  date: string
  total_duration: number
  entries_count: number
  projects: ProjectTimeBreakdown[]
}

export interface TaskTypeBreakdown {
  task_type: string
  total_duration: number
  entries_count: number
  percentage: number
}

// Sprint metrics
export interface SprintMetrics {
  sprint_id: string
  sprint_name: string
  planned_hours: number
  actual_hours: number
  completed_story_points: number
  total_story_points: number
  velocity: number
  completion_rate: number
  team_members: TeamMemberMetrics[]
}

export interface TeamMemberMetrics {
  user_id: string
  user_name: string
  total_hours: number
  completed_story_points: number
  tasks_completed: number
  avg_task_completion_time: number
}

// External integrations
export interface GitIntegration {
  id: string
  user_id: string
  provider: 'github' | 'gitlab' | 'bitbucket'
  repository_url: string
  access_token: string
  webhook_secret?: string
  is_active: boolean
  created_at: string
}

export interface ExternalTicket {
  id: string
  external_id: string
  provider: 'jira' | 'github' | 'linear' | 'asana'
  title: string
  description?: string
  status: string
  assignee?: string
  url: string
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error?: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// Form validation schemas
export interface CreateProjectForm {
  name: string
  description?: string
  color: string
  team_id?: string
}

export interface CreateTaskForm {
  project_id: string
  name: string
  description?: string
  task_type: Task['task_type']
  estimated_hours?: number
  git_branch?: string
  external_ticket_id?: string
  external_ticket_url?: string
}

export interface CreateTimeEntryForm {
  project_id: string
  task_id?: string
  description?: string
  start_time: string
  end_time?: string
  tags?: string[]
}

export interface UpdateProfileForm {
  name: string
  timezone: string
}

// UI State types
export interface UIState {
  sidebarOpen: boolean
  currentPage: string
  theme: 'light' | 'dark' | 'system'
}

// Notification types
export interface Notification {
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

// Filter and sort types
export interface TimeEntryFilters {
  project_ids?: string[]
  task_types?: Task['task_type'][]
  date_from?: string
  date_to?: string
  user_ids?: string[]
  tags?: string[]
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
}

// Statistics types
export interface ProductivityStats {
  daily_average: number
  weekly_total: number
  monthly_total: number
  most_productive_day: string
  most_productive_hour: number
  top_projects: ProjectTimeBreakdown[]
  productivity_trend: { date: string; hours: number }[]
}

export interface TeamProductivityStats {
  team_daily_average: number
  team_weekly_total: number
  most_active_member: string
  project_distribution: ProjectTimeBreakdown[]
  member_contribution: TeamMemberMetrics[]
  sprint_velocity_trend: { sprint: string; velocity: number }[]
}