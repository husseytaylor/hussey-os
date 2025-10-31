import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { encryptData, decryptData } from '@/lib/crypto'
import type { Password, CreatePasswordInput, UpdatePasswordInput, PasswordWithDecrypted } from '@/types/password.types'

interface PasswordStore {
  passwords: Password[]
  loading: boolean
  error: string | null
  masterPassword: string | null
  isUnlocked: boolean

  // Actions
  setMasterPassword: (password: string) => void
  clearMasterPassword: () => void
  fetchPasswords: () => Promise<void>
  createPassword: (input: CreatePasswordInput) => Promise<Password | null>
  updatePassword: (id: string, input: UpdatePasswordInput) => Promise<void>
  deletePassword: (id: string) => Promise<void>
  decryptPassword: (password: Password) => Promise<string | null>
  decryptAllPasswords: () => Promise<PasswordWithDecrypted[]>
}

export const usePasswordStore = create<PasswordStore>((set, get) => ({
  passwords: [],
  loading: false,
  error: null,
  masterPassword: null,
  isUnlocked: false,

  setMasterPassword: (password: string) => {
    set({ masterPassword: password, isUnlocked: true })
  },

  clearMasterPassword: () => {
    set({ masterPassword: null, isUnlocked: false })
  },

  fetchPasswords: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ error: 'Not authenticated', loading: false })
        return
      }

      const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .eq('user_id', user.id)
        .order('website', { ascending: true })

      if (error) throw error

      set({ passwords: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createPassword: async (input: CreatePasswordInput) => {
    const { masterPassword } = get()
    if (!masterPassword) {
      set({ error: 'Master password not set' })
      return null
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      // Encrypt the password
      const { encrypted, iv, salt } = await encryptData(input.password, masterPassword)

      const { data, error } = await supabase
        .from('passwords')
        .insert({
          user_id: user.id,
          encrypted_data: encrypted,
          iv,
          salt,
          website: input.website,
          username: input.username || null,
          notes: input.notes || null,
        })
        .select()
        .single()

      if (error) throw error

      set({ passwords: [...get().passwords, data].sort((a, b) => a.website.localeCompare(b.website)) })
      return data
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  updatePassword: async (id: string, input: UpdatePasswordInput) => {
    const { masterPassword } = get()
    if (!masterPassword && input.password) {
      set({ error: 'Master password not set' })
      return
    }

    try {
      const supabase = createClient()

      // If password is being updated, encrypt it
      let updateData: any = {
        website: input.website,
        username: input.username !== undefined ? input.username : undefined,
        notes: input.notes !== undefined ? input.notes : undefined,
      }

      if (input.password && masterPassword) {
        const { encrypted, iv, salt } = await encryptData(input.password, masterPassword)
        updateData.encrypted_data = encrypted
        updateData.iv = iv
        updateData.salt = salt
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key =>
        updateData[key] === undefined && delete updateData[key]
      )

      const { data, error } = await supabase
        .from('passwords')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set({
        passwords: get().passwords.map((p) =>
          p.id === id ? data : p
        ).sort((a, b) => a.website.localeCompare(b.website)),
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deletePassword: async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('passwords')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({ passwords: get().passwords.filter((p) => p.id !== id) })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  decryptPassword: async (password: Password) => {
    const { masterPassword } = get()
    if (!masterPassword) {
      set({ error: 'Master password not set' })
      return null
    }

    try {
      const decrypted = await decryptData(
        password.encrypted_data,
        password.iv,
        password.salt,
        masterPassword
      )
      return decrypted
    } catch (error: any) {
      set({ error: 'Failed to decrypt password. Invalid master password.' })
      return null
    }
  },

  decryptAllPasswords: async () => {
    const { passwords, masterPassword } = get()
    if (!masterPassword) return []

    const decryptedPasswords: PasswordWithDecrypted[] = []

    for (const password of passwords) {
      try {
        const decrypted = await decryptData(
          password.encrypted_data,
          password.iv,
          password.salt,
          masterPassword
        )
        decryptedPasswords.push({
          ...password,
          decryptedPassword: decrypted,
        })
      } catch (error) {
        decryptedPasswords.push({
          ...password,
          decryptedPassword: undefined,
        })
      }
    }

    return decryptedPasswords
  },
}))
