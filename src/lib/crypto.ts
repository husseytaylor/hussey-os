// Client-side encryption utilities for zero-knowledge password management
// Uses Web Crypto API for strong encryption

/**
 * Derives a cryptographic key from a master password using PBKDF2
 */
export async function deriveKey(
  masterPassword: string,
  salt: BufferSource
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(masterPassword)

  // Import the password as a key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive a key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts data using AES-GCM
 */
export async function encryptData(
  data: string,
  masterPassword: string
): Promise<{ encrypted: string; iv: string; salt: string }> {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Derive key from master password
  const key = await deriveKey(masterPassword, salt)

  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Encrypt the data
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  )

  // Convert to base64 for storage
  const encrypted = bufferToBase64(encryptedBuffer)
  const ivBase64 = bufferToBase64(iv)
  const saltBase64 = bufferToBase64(salt)

  return {
    encrypted,
    iv: ivBase64,
    salt: saltBase64,
  }
}

/**
 * Decrypts data using AES-GCM
 */
export async function decryptData(
  encrypted: string,
  iv: string,
  salt: string,
  masterPassword: string
): Promise<string> {
  try {
    // Convert from base64
    const encryptedBuffer = base64ToBuffer(encrypted)
    const ivBuffer = base64ToBuffer(iv)
    const saltBuffer = base64ToBuffer(salt)

    // Derive key from master password
    const key = await deriveKey(masterPassword, new Uint8Array(saltBuffer))

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
      key,
      encryptedBuffer
    )

    // Convert back to string
    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  } catch (error) {
    throw new Error('Failed to decrypt data. Invalid master password.')
  }
}

/**
 * Generates a random password
 */
export function generatePassword(
  length: number = 16,
  options: {
    uppercase?: boolean
    lowercase?: boolean
    numbers?: boolean
    symbols?: boolean
  } = {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  }
): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let charset = ''
  if (options.uppercase) charset += uppercase
  if (options.lowercase) charset += lowercase
  if (options.numbers) charset += numbers
  if (options.symbols) charset += symbols

  if (charset.length === 0) {
    charset = uppercase + lowercase + numbers + symbols
  }

  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length]
  }

  return password
}

/**
 * Validates master password strength
 */
export function validateMasterPassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Helper functions for base64 conversion
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
