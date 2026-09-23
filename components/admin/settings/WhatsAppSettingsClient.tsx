'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WhatsAppAccountProps {
  status: string
  displayPhoneNumber: string | null
  businessAccountId: string | null
  phoneNumberId: string | null
  connectedAt: Date
}

interface Props {
  account: WhatsAppAccountProps | null
  metaAppId: string
  configId: string
}

declare global {
  interface Window {
    fbAsyncInit: () => void
    FB: any
  }
}

export default function WhatsAppSettingsClient({ account, metaAppId, configId }: Props) {
  const router = useRouter()
  const [isSdkLoaded, setIsSdkLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!metaAppId || !configId) {
      setErrorMsg('Konfigurasi Meta belum lengkap di server. Hubungi administrator.')
      return
    }

    if (window.FB) {
      setIsSdkLoaded(true)
      return
    }

    window.fbAsyncInit = function() {
      window.FB.init({
        appId: metaAppId,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v20.0'
      })
      setIsSdkLoaded(true)
    }

    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    document.body.appendChild(script)

    return () => {
      // Cleanup is tricky with FB SDK, mostly we just leave it.
    }
  }, [metaAppId, configId])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
        return
      }
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          // This postMessage is often just informative (FINISH, CANCEL).
          // We rely on the FB.login callback to give us the actual 'code'.
          if (data.event === 'CANCEL') {
            setIsLoading(false)
            setErrorMsg('Proses pendaftaran dibatalkan.')
          }
        }
      } catch (e) {
        // Ignore JSON parse errors for unrelated messages
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleConnect = () => {
    if (!isSdkLoaded || !window.FB) {
      setErrorMsg('Facebook SDK belum siap. Silakan muat ulang halaman.')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    window.FB.login((response: any) => {
      if (response.authResponse && response.authResponse.code) {
        exchangeCode(response.authResponse.code)
      } else {
        setIsLoading(false)
        setErrorMsg('Proses dibatalkan atau popup Meta diblokir browser. Izinkan popup untuk melanjutkan.')
      }
    }, {
      config_id: configId,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {}
      }
    })
  }

  const exchangeCode = async (code: string) => {
    try {
      const res = await fetch('/api/meta/whatsapp/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      const data = await res.json()
      if (data.success) {
        router.refresh() // Reload server data to show updated connection status
      } else {
        setErrorMsg(data.error || 'WhatsApp belum berhasil terhubung. Periksa konfigurasi Meta.')
      }
    } catch (error) {
      setErrorMsg('Terjadi kesalahan koneksi saat memproses pendaftaran.')
    } finally {
      setIsLoading(false)
    }
  }

  const maskString = (str: string | null) => {
    if (!str) return '-'
    if (str.length <= 4) return str
    return str.substring(0, 4) + '*'.repeat(str.length - 4)
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-6">
        <h3 className="font-bold text-lg mb-4">Status Koneksi</h3>
        
        {account ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold text-sm">WhatsApp Terhubung</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-xl">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Nomor Telepon</p>
                <p className="font-medium">{account.displayPhoneNumber || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Phone Number ID</p>
                <p className="font-medium font-mono">{maskString(account.phoneNumberId)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">WABA ID</p>
                <p className="font-medium font-mono">{maskString(account.businessAccountId)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Terhubung Sejak</p>
                <p className="font-medium">{new Date(account.connectedAt).toLocaleDateString('id-ID')}</p>
              </div>
            </div>
            
            <div className="pt-4 flex gap-3">
              <button 
                onClick={handleConnect}
                disabled={isLoading || !isSdkLoaded}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sambungkan Ulang
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 p-3 rounded-xl border border-border">
              <XCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">Belum terhubung</span>
            </div>
            
            <div className="pt-2">
              <button 
                onClick={handleConnect}
                disabled={isLoading || !isSdkLoaded}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Hubungkan WhatsApp
              </button>
              {!isSdkLoaded && !errorMsg && (
                <p className="text-xs text-muted-foreground mt-2">Memuat Meta SDK...</p>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  )
}
