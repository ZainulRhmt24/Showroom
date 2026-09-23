import crypto from 'crypto'
import { decryptToken } from '@/lib/encryption'

export interface WhatsAppMessagePayload {
  to: string
  body: string
  phoneNumberId?: string
  accessToken?: string
}

export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  error?: string
}

export class WhatsAppProvider {
  // Global fallbacks
  private get globalAccessToken() {
    return process.env.WHATSAPP_ACCESS_TOKEN
  }

  private get globalPhoneNumberId() {
    return process.env.WHATSAPP_PHONE_NUMBER_ID
  }

  private get appSecret() {
    return process.env.WHATSAPP_APP_SECRET
  }

  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    let token = payload.accessToken
    if (token) {
      try {
        token = decryptToken(token)
      } catch (err) {
        console.error('Failed to decrypt token in sendMessage', err)
        return { success: false, error: 'Kredensial WhatsApp tidak valid atau rusak.' }
      }
    } else {
      token = this.globalAccessToken
    }

    const phoneId = payload.phoneNumberId || this.globalPhoneNumberId

    if (!token || !phoneId) {
      console.warn('WhatsApp API not configured for this tenant and no global fallback.')
      return { success: false, error: 'Konfigurasi API WhatsApp (token/phoneId) belum diatur untuk showroom ini.' }
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: payload.to.replace(/\D/g, '').replace(/^0/, '62'), // Normalisasi nomor (contoh: 0812 -> 62812)
          type: 'text',
          text: {
            preview_url: false,
            body: payload.body
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('WhatsApp API Error:', data)
        return { success: false, error: data.error?.message || 'Gagal mengirim pesan via WhatsApp API.' }
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id
      }
    } catch (error: any) {
      console.error('WhatsApp Provider Error:', error.message)
      return { success: false, error: 'Koneksi ke WhatsApp API gagal.' }
    }
  }

  verifyWebhookSignature(signature: string, payload: string): boolean {
    if (!this.appSecret) {
      console.warn('WHATSAPP_APP_SECRET is missing, skipping signature verification.')
      return true
    }
    
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.appSecret)
        .update(payload)
        .digest('hex')
      
      // WhatsApp prepends 'sha256='
      const signatureHash = signature.replace('sha256=', '')
      
      // Constant-time comparison
      return crypto.timingSafeEqual(
        Buffer.from(signatureHash),
        Buffer.from(expectedSignature)
      )
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return false
    }
  }
}

export const whatsappProvider = new WhatsAppProvider()
