import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16

function getKey(): Buffer {
  const keyBase64 = process.env.ENCRYPTION_KEY
  if (!keyBase64) {
    throw new Error('ENCRYPTION_KEY environment variable is not set. It must be a 32-byte base64 encoded string.')
  }
  
  const key = Buffer.from(keyBase64, 'base64')
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes after base64 decoding.')
  }
  
  return key
}

export function encryptToken(text: string): string {
  if (!text) return text
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const key = getKey()
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag().toString('hex')
    
    // Format: iv:authTag:encryptedText
    return `${iv.toString('hex')}:${authTag}:${encrypted}`
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Gagal mengenkripsi token.')
  }
}

export function decryptToken(encryptedText: string): string {
  if (!encryptedText) return encryptedText
  
  try {
    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      // If it doesn't match the format, it might be an old plaintext token.
      // But for security, we should enforce the format.
      // For backward compatibility during migration, we can return as is, but it's better to fail secure.
      throw new Error('Invalid encrypted token format.')
    }
    
    const [ivHex, authTagHex, encryptedData] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const key = getKey()
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error: any) {
    // Check if it looks like a plaintext token (e.g. starts with EA or similar, but best not to guess)
    if (encryptedText.startsWith('EA') && !encryptedText.includes(':')) {
       console.warn('Fallback: Returning potential plaintext token. Please migrate this token to encrypted format immediately.')
       return encryptedText;
    }
    console.error('Decryption failed:', error.message)
    throw new Error('Gagal mendekripsi token.')
  }
}
