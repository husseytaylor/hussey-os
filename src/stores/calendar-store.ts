import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { CalendarEvent, CreateEventInput, UpdateEventInput } from '@/types/calendar.types'

interface CalendarStore {
  events: CalendarEvent[]
  loading: boolean
  error: string | null

  // Actions
  fetchEvents: () => Promise<void>
  createEvent: (input: CreateEventInput) => Promise<CalendarEvent | null>
  updateEvent: (id: string, input: UpdateEventInput) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  syncFromWebhook: (webhookData: any) => Promise<void>
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ error: 'Not authenticated', loading: false })
        return
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true })

      if (error) throw error

      set({ events: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createEvent: async (input: CreateEventInput) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          google_event_id: `local_${Date.now()}`, // Will be updated when synced with Google
          title: input.title,
          description: input.description || null,
          start_time: input.start_time,
          end_time: input.end_time,
          location: input.location || null,
          attendees: input.attendees || null,
        })
        .select()
        .single()

      if (error) throw error

      set({ events: [...get().events, data].sort((a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )})

      return data
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  updateEvent: async (id: string, input: UpdateEventInput) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('calendar_events')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({
        events: get().events.map((event) =>
          event.id === id ? data : event
        ).sort((a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ),
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteEvent: async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({ events: get().events.filter((event) => event.id !== id) })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  syncFromWebhook: async (webhookData: any) => {
    // This will be called from the webhook endpoint
    // Refresh events after webhook sync
    await get().fetchEvents()
  },
}))
