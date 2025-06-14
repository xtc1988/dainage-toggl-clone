import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/supabase/client'
import type { Project } from '@/types'

interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
}

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (userId: string) => {
    const projects = await getProjects(userId)
    return projects
  }
)

export const createProjectAsync = createAsyncThunk(
  'projects/create',
  async ({
    userId,
    projectData,
  }: {
    userId: string
    projectData: {
      name: string
      description?: string
      color: string
      team_id?: string
    }
  }) => {
    const project = await createProject(userId, projectData)
    return project
  }
)

export const updateProjectAsync = createAsyncThunk(
  'projects/update',
  async ({
    projectId,
    updates,
  }: {
    projectId: string
    updates: {
      name?: string
      description?: string
      color?: string
    }
  }) => {
    const project = await updateProject(projectId, updates)
    return project
  }
)

export const deleteProjectAsync = createAsyncThunk(
  'projects/delete',
  async (projectId: string) => {
    await deleteProject(projectId)
    return projectId
  }
)

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addProject: (state, action) => {
      state.projects.push(action.payload)
    },
    removeProject: (state, action) => {
      state.projects = state.projects.filter(p => p.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch projects'
      })
      
      // Create project
      .addCase(createProjectAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProjectAsync.fulfilled, (state, action) => {
        state.loading = false
        state.projects.push(action.payload)
      })
      .addCase(createProjectAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create project'
      })
      
      // Update project
      .addCase(updateProjectAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProjectAsync.fulfilled, (state, action) => {
        state.loading = false
        const index = state.projects.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.projects[index] = action.payload
        }
      })
      .addCase(updateProjectAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update project'
      })
      
      // Delete project
      .addCase(deleteProjectAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProjectAsync.fulfilled, (state, action) => {
        state.loading = false
        state.projects = state.projects.filter(p => p.id !== action.payload)
      })
      .addCase(deleteProjectAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete project'
      })
  },
})

export const { clearError, addProject, removeProject } = projectsSlice.actions
export { projectsSlice }