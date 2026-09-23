import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const AUTH_SECRET = process.env.AUTH_SECRET || 'denken-motors-secure-flagship-secret-key-2026-indonesia'

export interface AdminSessionPayload {
  userId: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'USER'
  ownerId?: string
  branchId?: string
  exp: number
  mustChangePassword?: boolean
}

/**
 * Sign a payload into an HMAC SHA-256 JWT-like secure token
 */
export function signSessionToken(payload: Omit<AdminSessionPayload, 'exp'>, expiresInDays = 7): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60
  const fullPayload: AdminSessionPayload = { ...payload, exp }
  
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(encodedPayload)
    .digest('base64url')

  return `${encodedPayload}.${signature}`
}

/**
 * Verify token and ensure it hasn't expired or been tampered with
 */
export function verifySessionToken(token: string): AdminSessionPayload | null {
  try {
    if (!token || typeof token !== 'string') return null
    const parts = token.split('.')
    if (parts.length !== 2) return null

    const [encodedPayload, signature] = parts
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(encodedPayload)
      .digest('base64url')

    const sigBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null
    }

    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf-8')
    const payload: AdminSessionPayload = JSON.parse(payloadJson)

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Hash password securely with bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10)
}

/**
 * Verify password supporting bcrypt, legacy PBKDF2, and legacy plain text
 */
export async function verifyPassword(plainText: string, storedHash?: string | null): Promise<boolean> {
  if (!storedHash) return false

  // Bcrypt formats ($2a$, $2b$, $2y$)
  if (storedHash.startsWith('$2')) {
    try {
      return await bcrypt.compare(plainText, storedHash)
    } catch {
      return false
    }
  }

  // Legacy plain-text fallback for backward compatibility
  if (!storedHash.includes(':')) {
    return plainText === storedHash
  }

  // Legacy PBKDF2 fallback
  try {
    const [salt, hash] = storedHash.split(':')
    const verifyHash = crypto.pbkdf2Sync(plainText, salt, 10000, 64, 'sha512').toString('hex')
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'))
  } catch {
    return false
  }
}
