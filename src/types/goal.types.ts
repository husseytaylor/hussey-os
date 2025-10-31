export type GoalFrequency = 'daily' | 'weekly' | 'monthly'

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  metric_type: string // e.g., "hours", "count", "pages", "workouts"
  target_value: number
  current_value: number
  frequency: GoalFrequency
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateGoalInput {
  title: string
  description?: string
  metric_type: string
  target_value: number
  frequency?: GoalFrequency
  start_date?: string
  end_date?: string
}

export interface UpdateGoalInput {
  title?: string
  description?: string
  metric_type?: string
  target_value?: number
  current_value?: number
  frequency?: GoalFrequency
  start_date?: string
  end_date?: string
  is_active?: boolean
}

export interface GoalProgress {
  goal_id: string
  date: string
  value: number
}

// For calculating adherence
export interface GoalStats {
  goal: Goal
  progressPercentage: number
  daysActive: number
  adherenceRate: number // 0-100%
  currentStreak: number
  longestStreak: number
  remainingDays: number | null
}
