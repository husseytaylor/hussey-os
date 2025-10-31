import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Subscription, CreateSubscriptionInput, UpdateSubscriptionInput } from '@/types/subscription.types'

interface SubscriptionStore {
  subscriptions: Subscription[]
  loading: boolean
  error: string | null

  // Actions
  fetchSubscriptions: () => Promise<void>
  createSubscription: (input: CreateSubscriptionInput) => Promise<Subscription | null>
  updateSubscription: (id: string, input: UpdateSubscriptionInput) => Promise<void>
  deleteSubscription: (id: string) => Promise<void>
  getMonthlyTotal: () => number
  getYearlyTotal: () => number
  getActiveSubscriptions: () => Subscription[]
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscriptions: [],
  loading: false,
  error: null,

  fetchSubscriptions: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ error: 'Not authenticated', loading: false })
        return
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) throw error

      set({ subscriptions: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createSubscription: async (input: CreateSubscriptionInput) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          name: input.name,
          cost: input.cost,
          currency: input.currency || 'USD',
          billing_cycle: input.billing_cycle,
          next_billing_date: input.next_billing_date,
          category: input.category || null,
          is_active: input.is_active !== undefined ? input.is_active : true,
          notes: input.notes || null,
        })
        .select()
        .single()

      if (error) throw error

      set({ subscriptions: [...get().subscriptions, data].sort((a, b) => a.name.localeCompare(b.name)) })
      return data
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  updateSubscription: async (id: string, input: UpdateSubscriptionInput) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('subscriptions')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({
        subscriptions: get().subscriptions.map((s) =>
          s.id === id ? data : s
        ).sort((a, b) => a.name.localeCompare(b.name)),
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteSubscription: async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({ subscriptions: get().subscriptions.filter((s) => s.id !== id) })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  getMonthlyTotal: () => {
    const subscriptions = get().subscriptions.filter(s => s.is_active)
    return subscriptions.reduce((total, sub) => {
      switch (sub.billing_cycle) {
        case 'monthly':
          return total + sub.cost
        case 'yearly':
          return total + (sub.cost / 12)
        case 'quarterly':
          return total + (sub.cost / 3)
        default:
          return total
      }
    }, 0)
  },

  getYearlyTotal: () => {
    const subscriptions = get().subscriptions.filter(s => s.is_active)
    return subscriptions.reduce((total, sub) => {
      switch (sub.billing_cycle) {
        case 'monthly':
          return total + (sub.cost * 12)
        case 'yearly':
          return total + sub.cost
        case 'quarterly':
          return total + (sub.cost * 4)
        default:
          return total
      }
    }, 0)
  },

  getActiveSubscriptions: () => {
    return get().subscriptions.filter(s => s.is_active)
  },
}))
