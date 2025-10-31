import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Budget, CreateBudgetInput, UpdateBudgetInput, BudgetStats } from '@/types/budget.types'

interface BudgetStore {
  budgets: Budget[]
  loading: boolean
  error: string | null

  // Actions
  fetchBudgets: (month?: string) => Promise<void>
  createBudget: (input: CreateBudgetInput) => Promise<Budget | null>
  updateBudget: (id: string, input: UpdateBudgetInput) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  updateSpent: (id: string, amount: number) => Promise<void>
  getBudgetStats: (month: string) => BudgetStats
  getCurrentMonthBudgets: () => Budget[]
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  budgets: [],
  loading: false,
  error: null,

  fetchBudgets: async (month?: string) => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ error: 'Not authenticated', loading: false })
        return
      }

      let query = supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)

      if (month) {
        query = query.eq('month', month)
      }

      const { data, error } = await query.order('category', { ascending: true })

      if (error) throw error

      set({ budgets: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createBudget: async (input: CreateBudgetInput) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category: input.category,
          amount: input.amount,
          spent: input.spent || 0,
          month: input.month,
        })
        .select()
        .single()

      if (error) throw error

      set({ budgets: [...get().budgets, data].sort((a, b) => a.category.localeCompare(b.category)) })
      return data
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  updateBudget: async (id: string, input: UpdateBudgetInput) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('budgets')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({
        budgets: get().budgets.map((b) =>
          b.id === id ? data : b
        ).sort((a, b) => a.category.localeCompare(b.category)),
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteBudget: async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({ budgets: get().budgets.filter((b) => b.id !== id) })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  updateSpent: async (id: string, amount: number) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('budgets')
        .update({ spent: amount })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({
        budgets: get().budgets.map((b) =>
          b.id === id ? data : b
        ),
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  getBudgetStats: (month: string): BudgetStats => {
    const monthBudgets = get().budgets.filter(b => b.month === month)

    const totalBudget = monthBudgets.reduce((sum, b) => sum + b.amount, 0)
    const totalSpent = monthBudgets.reduce((sum, b) => sum + b.spent, 0)
    const remaining = totalBudget - totalSpent
    const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    return {
      totalBudget,
      totalSpent,
      remaining,
      percentageUsed,
    }
  },

  getCurrentMonthBudgets: () => {
    const currentMonth = new Date().toISOString().substring(0, 7)
    return get().budgets.filter(b => b.month === currentMonth)
  },
}))
