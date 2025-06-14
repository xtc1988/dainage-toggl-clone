export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          tech_stack: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          tech_stack?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          tech_stack?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'member' | 'lead' | 'admin'
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'member' | 'lead' | 'admin'
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'member' | 'lead' | 'admin'
          joined_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          user_id: string
          team_id: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          user_id: string
          team_id?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          user_id?: string
          team_id?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          task_type: 'feature' | 'bug' | 'review' | 'meeting' | 'research' | 'testing' | 'deployment' | 'other'
          git_branch: string | null
          git_commit: string | null
          external_ticket_id: string | null
          external_ticket_url: string | null
          estimated_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          task_type?: 'feature' | 'bug' | 'review' | 'meeting' | 'research' | 'testing' | 'deployment' | 'other'
          git_branch?: string | null
          git_commit?: string | null
          external_ticket_id?: string | null
          external_ticket_url?: string | null
          estimated_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          task_type?: 'feature' | 'bug' | 'review' | 'meeting' | 'research' | 'testing' | 'deployment' | 'other'
          git_branch?: string | null
          git_commit?: string | null
          external_ticket_id?: string | null
          external_ticket_url?: string | null
          estimated_hours?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          project_id: string
          task_id: string | null
          description: string | null
          start_time: string
          end_time: string | null
          duration: number | null
          is_running: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          task_id?: string | null
          description?: string | null
          start_time: string
          end_time?: string | null
          duration?: number | null
          is_running?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          task_id?: string | null
          description?: string | null
          start_time?: string
          end_time?: string | null
          duration?: number | null
          is_running?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      sprints: {
        Row: {
          id: string
          team_id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          goal: string | null
          status: 'planning' | 'active' | 'completed' | 'cancelled'
          velocity_points: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          goal?: string | null
          status?: 'planning' | 'active' | 'completed' | 'cancelled'
          velocity_points?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          goal?: string | null
          status?: 'planning' | 'active' | 'completed' | 'cancelled'
          velocity_points?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      sprint_tasks: {
        Row: {
          id: string
          sprint_id: string
          task_id: string
          story_points: number | null
          status: 'todo' | 'in_progress' | 'review' | 'done'
          assigned_user_id: string | null
        }
        Insert: {
          id?: string
          sprint_id: string
          task_id: string
          story_points?: number | null
          status?: 'todo' | 'in_progress' | 'review' | 'done'
          assigned_user_id?: string | null
        }
        Update: {
          id?: string
          sprint_id?: string
          task_id?: string
          story_points?: number | null
          status?: 'todo' | 'in_progress' | 'review' | 'done'
          assigned_user_id?: string | null
        }
      }
      git_integrations: {
        Row: {
          id: string
          user_id: string
          provider: 'github' | 'gitlab' | 'bitbucket'
          repository_url: string
          access_token: string
          webhook_secret: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'github' | 'gitlab' | 'bitbucket'
          repository_url: string
          access_token: string
          webhook_secret?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'github' | 'gitlab' | 'bitbucket'
          repository_url?: string
          access_token?: string
          webhook_secret?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      external_tickets: {
        Row: {
          id: string
          external_id: string
          provider: 'jira' | 'github' | 'linear' | 'asana'
          title: string
          description: string | null
          status: string
          assignee: string | null
          url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          external_id: string
          provider: 'jira' | 'github' | 'linear' | 'asana'
          title: string
          description?: string | null
          status: string
          assignee?: string | null
          url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          external_id?: string
          provider?: 'jira' | 'github' | 'linear' | 'asana'
          title?: string
          description?: string | null
          status?: string
          assignee?: string | null
          url?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      active_time_entries: {
        Row: {
          id: string
          user_id: string
          project_id: string
          task_id: string | null
          description: string | null
          start_time: string
          end_time: string | null
          duration: number | null
          is_running: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
          project_name: string | null
          project_color: string | null
          task_name: string | null
          task_type: string | null
        }
      }
      daily_time_summary: {
        Row: {
          user_id: string
          date: string
          total_duration: number
          entries_count: number
          projects: string[]
        }
      }
      project_time_summary: {
        Row: {
          project_id: string
          project_name: string
          project_color: string
          user_id: string
          entries_count: number
          total_duration: number
          first_entry_date: string | null
          last_entry_date: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      task_type: 'feature' | 'bug' | 'review' | 'meeting' | 'research' | 'testing' | 'deployment' | 'other'
      team_role: 'member' | 'lead' | 'admin'
      sprint_status: 'planning' | 'active' | 'completed' | 'cancelled'
      sprint_task_status: 'todo' | 'in_progress' | 'review' | 'done'
    }
  }
}