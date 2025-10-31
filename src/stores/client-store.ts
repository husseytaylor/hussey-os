import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Client, CreateClientInput, UpdateClientInput, ClientAsset } from '@/types/client.types'

interface ClientStore {
  clients: Client[]
  loading: boolean
  error: string | null

  // Actions
  fetchClients: () => Promise<void>
  createClient: (input: CreateClientInput) => Promise<Client | null>
  updateClient: (id: string, input: UpdateClientInput) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  uploadAsset: (clientId: string, file: File) => Promise<string | null>
  getClientAssets: (clientId: string) => Promise<ClientAsset[]>
  deleteAsset: (clientId: string, fileName: string) => Promise<void>
}

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ error: 'Not authenticated', loading: false })
        return
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ clients: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createClient: async (input: CreateClientInput) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          company: input.company || null,
          notes: input.notes || null,
        })
        .select()
        .single()

      if (error) throw error

      set({ clients: [data, ...get().clients] })
      return data
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  updateClient: async (id: string, input: UpdateClientInput) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('clients')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({
        clients: get().clients.map((client) =>
          client.id === id ? data : client
        ),
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteClient: async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({ clients: get().clients.filter((client) => client.id !== id) })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  uploadAsset: async (clientId: string, file: File) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${clientId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('client-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('client-assets')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  getClientAssets: async (clientId: string) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return []

      const { data, error } = await supabase.storage
        .from('client-assets')
        .list(`${user.id}/${clientId}`)

      if (error) throw error

      return (data || []).map((file) => ({
        name: file.name,
        url: supabase.storage.from('client-assets').getPublicUrl(`${user.id}/${clientId}/${file.name}`).data.publicUrl,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'unknown',
        uploaded_at: file.created_at,
      }))
    } catch (error: any) {
      set({ error: error.message })
      return []
    }
  },

  deleteAsset: async (clientId: string, fileName: string) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.storage
        .from('client-assets')
        .remove([`${user.id}/${clientId}/${fileName}`])

      if (error) throw error
    } catch (error: any) {
      set({ error: error.message })
    }
  },
}))
