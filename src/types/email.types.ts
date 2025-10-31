export interface Email {
  id: string
  user_id: string
  gmail_id: string
  subject: string
  from_email: string
  to_email: string
  body: string | null
  labels: string[] | null
  received_at: string
  created_at: string
}

export interface EmailFilter {
  search?: string
  labels?: string[]
  dateFrom?: string
  dateTo?: string
}
