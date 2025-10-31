import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Email, EmailFilter } from '@/types/email.types'

interface EmailStore {
  emails: Email[]
  loading: boolean
  error: string | null
  filter: EmailFilter

  // Actions
  fetchEmails: (filter?: EmailFilter) => Promise<void>
  deleteEmail: (id: string) => Promise<void>
  setFilter: (filter: EmailFilter) => void
  syncFromWebhook: (webhookData: any) => Promise<void>
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  emails: [],
  loading: false,
  error: null,
  filter: {},

  fetchEmails: async (filter?: EmailFilter) => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ error: 'Not authenticated', loading: false })
        return
      }

      let query = supabase
        .from('emails')
        .select('*')
        .eq('user_id', user.id)

      // Apply filters
      const currentFilter = filter || get().filter

      if (currentFilter.search) {
        query = query.or(
          `subject.ilike.%${currentFilter.search}%,from_email.ilike.%${currentFilter.search}%,body.ilike.%${currentFilter.search}%`
        )
      }

      if (currentFilter.labels && currentFilter.labels.length > 0) {
        query = query.contains('labels', currentFilter.labels)
      }

      if (currentFilter.dateFrom) {
        query = query.gte('received_at', currentFilter.dateFrom)
      }

      if (currentFilter.dateTo) {
        query = query.lte('received_at', currentFilter.dateTo)
      }

      const { data, error } = await query.order('received_at', { ascending: false })

      if (error) throw error

      set({ emails: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  deleteEmail: async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({ emails: get().emails.filter((email) => email.id !== id) })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  setFilter: (filter: EmailFilter) => {
    set({ filter })
    get().fetchEmails(filter)
  },

  syncFromWebhook: async (webhookData: any) => {
    // This will be called from the webhook endpoint
    // Refresh emails after webhook sync
    await get().fetchEmails()
  },
}))
