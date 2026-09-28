'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

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

export default function WhatsAppSettingsClient({ account, metaAppId, configId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const connectedParam = searchParams.get('connected')

    if (errorParam === 'whatsapp_connect_failed') {
      setErrorMsg('Gagal menghubungkan WhatsApp. Pastikan proses autentikasi berhasil.')
      // Optionally clean up URL
      router.replace('/admin/settings/whatsapp')
    }

    if (connectedParam === '1') {
      setSuccessMsg('WhatsApp berhasil dihubungkan!')
      // Optionally clean up URL
      router.replace('/admin/settings/whatsapp')
    }
  }, [searchParams, router])

  const handleConnect = () => {
    if (!metaAppId || !configId) {
      setErrorMsg('Konfigurasi Meta belum lengkap di server. Hubungi administrator.')
      return
    }

    setIsLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    window.location.href = '/api/meta/whatsapp/start'
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
        
        {account && account.businessAccountId && account.phoneNumberId && !account.phoneNumberId.includes('DUMMY') ? (
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
                disabled={isLoading}
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
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Hubungkan WhatsApp
              </button>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-xl border border-green-100 text-sm">
            {successMsg}
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
