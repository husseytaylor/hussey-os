export interface Password {
  id: string
  user_id: string
  encrypted_data: string
  iv: string
  salt: string
  website: string
  username: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DecryptedPassword {
  password: string
}

export interface CreatePasswordInput {
  website: string
  username?: string
  password: string
  notes?: string
}

export interface UpdatePasswordInput {
  website?: string
  username?: string
  password?: string
  notes?: string
}

export interface PasswordWithDecrypted extends Password {
  decryptedPassword?: string
}
