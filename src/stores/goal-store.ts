import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Goal, CreateGoalInput, UpdateGoalInput, GoalStats } from '@/types/goal.types'
import { differenceInDays, parseISO } from 'date-fns'

interface GoalStore {
  goals: Goal[]
  loading: boolean
  error: string | null

  // Actions
  fetchGoals: () => Promise<void>
  createGoal: (input: CreateGoalInput) => Promise<Goal | null>
  updateGoal: (id: string, input: UpdateGoalInput) => Promise<void>
  updateProgress: (id: string, value: number) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  toggleActive: (id: string) => Promise<void>
  getGoalStats: (goal: Goal) => GoalStats
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  fetchGoals: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ error: 'Not authenticated', loading: false })
        return
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ goals: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createGoal: async (input: CreateGoalInput) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          metric_type: input.metric_type,
          target_value: input.target_value,
          current_value: 0,
          frequency: input.frequency || 'daily',
          start_date: input.start_date || new Date().toISOString().split('T')[0],
          end_date: input.end_date || null,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      set({ goals: [data, ...get().goals] })
      return data
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  updateGoal: async (id: string, input: UpdateGoalInput) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('goals')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({
        goals: get().goals.map((goal) =>
          goal.id === id ? data : goal
        ),
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  updateProgress: async (id: string, value: number) => {
    try {
      const goal = get().goals.find((g) => g.id === id)
      if (!goal) return

      const newValue = Math.min(goal.target_value, Math.max(0, value))

      const supabase = createClient()
      const { data, error } = await supabase
        .from('goals')
        .update({ current_value: newValue })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({
        goals: get().goals.map((goal) =>
          goal.id === id ? data : goal
        ),
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteGoal: async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({ goals: get().goals.filter((goal) => goal.id !== id) })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  toggleActive: async (id: string) => {
    const goal = get().goals.find((g) => g.id === id)
    if (!goal) return

    await get().updateGoal(id, { is_active: !goal.is_active })
  },

  getGoalStats: (goal: Goal): GoalStats => {
    const now = new Date()
    const startDate = parseISO(goal.start_date)
    const endDate = goal.end_date ? parseISO(goal.end_date) : null

    const daysActive = differenceInDays(now, startDate) + 1
    const remainingDays = endDate ? differenceInDays(endDate, now) : null
    const progressPercentage = Math.min(100, (goal.current_value / goal.target_value) * 100)

    // Simple adherence calculation based on progress vs time
    let adherenceRate = 0
    if (endDate) {
      const totalDays = differenceInDays(endDate, startDate)
      const expectedProgress = (daysActive / totalDays) * 100
      adherenceRate = Math.min(100, (progressPercentage / expectedProgress) * 100)
    } else {
      // For ongoing goals, adherence is same as progress
      adherenceRate = progressPercentage
    }

    // For streak calculation, we'd need historical data
    // For now, use simple calculation based on current progress
    const currentStreak = goal.current_value > 0 ? Math.floor(daysActive * (progressPercentage / 100)) : 0
    const longestStreak = currentStreak // Would need historical tracking

    return {
      goal,
      progressPercentage: Math.round(progressPercentage),
      daysActive,
      adherenceRate: Math.round(adherenceRate),
      currentStreak,
      longestStreak,
      remainingDays,
    }
  },
}))
