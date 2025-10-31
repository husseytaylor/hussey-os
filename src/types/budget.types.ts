export interface Budget {
  id: string
  user_id: string
  category: string
  amount: number
  spent: number
  month: string // Format: YYYY-MM
  created_at: string
  updated_at: string
}

export interface CreateBudgetInput {
  category: string
  amount: number
  spent?: number
  month: string
}

export interface UpdateBudgetInput {
  category?: string
  amount?: number
  spent?: number
  month?: string
}

export interface BudgetStats {
  totalBudget: number
  totalSpent: number
  remaining: number
  percentageUsed: number
}
