import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Whiteboard, CreateWhiteboardInput, UpdateWhiteboardInput } from '@/types/whiteboard.types'

interface WhiteboardStore {
  whiteboards: Whiteboard[]
  currentWhiteboard: Whiteboard | null
  loading: boolean
  error: string | null

  // Actions
  fetchWhiteboards: () => Promise<void>
  createWhiteboard: (input: CreateWhiteboardInput) => Promise<Whiteboard | null>
  updateWhiteboard: (id: string, input: UpdateWhiteboardInput) => Promise<void>
  deleteWhiteboard: (id: string) => Promise<void>
  setCurrentWhiteboard: (whiteboard: Whiteboard | null) => void
  saveSnapshot: (id: string, snapshot: any) => Promise<void>
}

export const useWhiteboardStore = create<WhiteboardStore>((set, get) => ({
  whiteboards: [],
  currentWhiteboard: null,
  loading: false,
  error: null,

  fetchWhiteboards: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ error: 'Not authenticated', loading: false })
        return
      }

      const { data, error } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      set({ whiteboards: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createWhiteboard: async (input: CreateWhiteboardInput) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from('whiteboards')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          snapshot: input.snapshot || {},
        })
        .select()
        .single()

      if (error) throw error

      set({ whiteboards: [data, ...get().whiteboards] })
      return data
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  updateWhiteboard: async (id: string, input: UpdateWhiteboardInput) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('whiteboards')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({
        whiteboards: get().whiteboards.map((wb) =>
          wb.id === id ? data : wb
        ),
        currentWhiteboard: get().currentWhiteboard?.id === id ? data : get().currentWhiteboard,
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteWhiteboard: async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('whiteboards')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({
        whiteboards: get().whiteboards.filter((wb) => wb.id !== id),
        currentWhiteboard: get().currentWhiteboard?.id === id ? null : get().currentWhiteboard,
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  setCurrentWhiteboard: (whiteboard: Whiteboard | null) => {
    set({ currentWhiteboard: whiteboard })
  },

  saveSnapshot: async (id: string, snapshot: any) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('whiteboards')
        .update({ snapshot })
        .eq('id', id)

      if (error) throw error

      // Update local state
      set({
        whiteboards: get().whiteboards.map((wb) =>
          wb.id === id ? { ...wb, snapshot } : wb
        ),
        currentWhiteboard: get().currentWhiteboard?.id === id
          ? { ...get().currentWhiteboard!, snapshot }
          : get().currentWhiteboard,
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },
}))
