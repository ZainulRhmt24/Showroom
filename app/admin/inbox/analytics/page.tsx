"use client"

import { useState, useEffect } from 'react'
import { MessageSquare, RefreshCw, BarChart2, Inbox, TrendingUp, Send, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getInboxAnalytics } from '@/app/actions/inboxActions'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    setLoading(true)
    const res = await getInboxAnalytics()
    if (res.success) {
      setData(res.analytics)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart2 className="h-7 w-7 text-primary" /> Inbox Analytics
          </h2>
          <p className="text-muted-foreground mt-1">Pantau performa interaksi dan metrik operasional WhatsApp Anda.</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          disabled={loading}
          className="rounded-xl bg-muted px-4 py-2 text-sm font-bold text-foreground hover:bg-muted/80 transition flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {loading && !data ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm font-bold gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" /> Memuat analitik...
        </div>
      ) : data ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-muted-foreground">Total Obrolan</span>
              <div className="bg-primary/10 p-2 rounded-lg text-primary"><MessageSquare className="h-4 w-4" /></div>
            </div>
            <div className="text-4xl font-black text-foreground">{data.totalConversations}</div>
            <div className="text-xs font-medium text-muted-foreground mt-2">Seluruh tiket percakapan.</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-muted-foreground">Pesan Masuk vs Keluar</span>
              <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><Inbox className="h-4 w-4" /></div>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-black text-foreground">{data.messagesReceived}</div>
              <div className="text-sm font-bold text-emerald-500 flex items-center gap-1 mb-1">
                <Send className="h-3 w-3" /> {data.messagesSent} Out
              </div>
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-2">Rasio responsivitas pesan.</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-muted-foreground">Obrolan Aktif</span>
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500"><TrendingUp className="h-4 w-4" /></div>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-black text-foreground">{data.openConversations}</div>
              <div className="text-sm font-bold text-muted-foreground mb-1">
                / {data.closedConversations} Selesai
              </div>
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-2">Status penyelesaian.</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-muted-foreground">Follow-up Tugas</span>
              <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500"><CheckCircle className="h-4 w-4" /></div>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-black text-foreground">{data.followUpsPending}</div>
              {data.followUpsOverdue > 0 && (
                <div className="text-sm font-bold text-red-500 flex items-center gap-1 mb-1">
                  <AlertCircle className="h-3 w-3" /> {data.followUpsOverdue} Terlewat
                </div>
              )}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-2">Status tanggung jawab Sales.</div>
          </div>
          
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm font-bold">
          Gagal memuat analitik.
        </div>
      )}
      
      <div className="flex justify-start">
        <Link href="/admin/inbox" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
           Kembali ke Inbox
        </Link>
      </div>
    </div>
  )
}
