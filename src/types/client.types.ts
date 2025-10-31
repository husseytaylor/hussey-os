export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateClientInput {
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
}

export interface UpdateClientInput {
  name?: string
  email?: string
  phone?: string
  company?: string
  notes?: string
}

export interface ClientAsset {
  name: string
  url: string
  size: number
  type: string
  uploaded_at: string
}
