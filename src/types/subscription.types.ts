export type BillingCycle = 'monthly' | 'yearly' | 'quarterly'

export interface Subscription {
  id: string
  user_id: string
  name: string
  cost: number
  currency: string
  billing_cycle: BillingCycle
  next_billing_date: string
  category: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateSubscriptionInput {
  name: string
  cost: number
  currency?: string
  billing_cycle: BillingCycle
  next_billing_date: string
  category?: string
  is_active?: boolean
  notes?: string
}

export interface UpdateSubscriptionInput {
  name?: string
  cost?: number
  currency?: string
  billing_cycle?: BillingCycle
  next_billing_date?: string
  category?: string
  is_active?: boolean
  notes?: string
}
