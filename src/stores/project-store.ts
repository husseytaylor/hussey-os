import { create } from 'zustand'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import type {
  Project,
  ProjectObjective,
  CreateProjectInput,
  UpdateProjectInput,
  CreateObjectiveInput,
  UpdateObjectiveInput,
  ProjectWithClient,
} from '@/types/project.types'

interface ProjectStore {
  projects: ProjectWithClient[]
  objectives: Record<string, ProjectObjective[]>
  loading: boolean
  error: string | null

  // Project actions
  fetchProjects: () => Promise<void>
  createProject: (input: CreateProjectInput) => Promise<Project | null>
  updateProject: (id: string, input: UpdateProjectInput) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  // Objective actions
  fetchObjectives: (projectId: string) => Promise<void>
  createObjective: (input: CreateObjectiveInput) => Promise<ProjectObjective | null>
  updateObjective: (id: string, input: UpdateObjectiveInput) => Promise<void>
  deleteObjective: (id: string, projectId: string) => Promise<void>
  uploadObjectiveImage: (projectId: string, file: File) => Promise<string | null>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  objectives: {},
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ error: 'Not authenticated', loading: false })
        return
      }

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*, client:clients(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      set({ projects: projects || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createProject: async (input: CreateProjectInput) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          client_id: input.client_id || null,
          status: input.status || 'active',
          start_date: input.start_date || null,
          end_date: input.end_date || null,
        })
        .select()
        .single()

      if (error) throw error

      await get().fetchProjects() // Refetch to get client data
      return data
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  updateProject: async (id: string, input: UpdateProjectInput) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('projects')
        .update(input)
        .eq('id', id)

      if (error) throw error

      await get().fetchProjects()
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteProject: async (id: string) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({
        projects: get().projects.filter((project) => project.id !== id),
        objectives: Object.fromEntries(
          Object.entries(get().objectives).filter(([key]) => key !== id)
        ),
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  fetchObjectives: async (projectId: string) => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('project_objectives')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({
        objectives: {
          ...get().objectives,
          [projectId]: data || [],
        },
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  createObjective: async (input: CreateObjectiveInput) => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('project_objectives')
        .insert({
          project_id: input.project_id,
          title: input.title,
          description: input.description || null,
          status: input.status || 'pending',
          notes: input.notes || null,
        })
        .select()
        .single()

      if (error) throw error

      const projectObjectives = get().objectives[input.project_id] || []
      set({
        objectives: {
          ...get().objectives,
          [input.project_id]: [data, ...projectObjectives],
        },
      })

      return data
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  updateObjective: async (id: string, input: UpdateObjectiveInput) => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('project_objectives')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const projectId = data.project_id
      const projectObjectives = get().objectives[projectId] || []

      set({
        objectives: {
          ...get().objectives,
          [projectId]: projectObjectives.map((obj) =>
            obj.id === id ? data : obj
          ),
        },
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteObjective: async (id: string, projectId: string) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('project_objectives')
        .delete()
        .eq('id', id)

      if (error) throw error

      const projectObjectives = get().objectives[projectId] || []
      set({
        objectives: {
          ...get().objectives,
          [projectId]: projectObjectives.filter((obj) => obj.id !== id),
        },
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  uploadObjectiveImage: async (projectId: string, file: File) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/projects/${projectId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('client-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('client-assets')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },
}))
