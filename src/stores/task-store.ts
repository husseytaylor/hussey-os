import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@/types/task.types'

interface TaskStore {
  tasks: Task[]
  loading: boolean
  error: string | null

  // Actions
  fetchTasks: () => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<Task | null>
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setTasks: (tasks: Task[]) => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ error: 'Not authenticated', loading: false })
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ tasks: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createTask: async (input: CreateTaskInput) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          priority: input.priority || 'medium',
          status: input.status || 'todo',
        })
        .select()
        .single()

      if (error) throw error

      set({ tasks: [data, ...get().tasks] })
      return data
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  updateTask: async (id: string, input: UpdateTaskInput) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({
        tasks: get().tasks.map((task) =>
          task.id === id ? data : task
        ),
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  updateTaskStatus: async (id: string, status: TaskStatus) => {
    try {
      const supabase = createClient()
      const updateData: any = { status }

      // Set completed_at when moving to completed
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({
        tasks: get().tasks.map((task) =>
          task.id === id ? data : task
        ),
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteTask: async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('tasks').delete().eq('id', id)

      if (error) throw error

      set({ tasks: get().tasks.filter((task) => task.id !== id) })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  setTasks: (tasks: Task[]) => set({ tasks }),
}))
