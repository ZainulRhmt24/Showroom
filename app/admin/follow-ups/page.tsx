"use client"

import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle, XCircle, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getFollowUps, updateFollowUpStatus } from '@/app/actions/inboxActions'

export default function FollowUpsPage() {
  const [filter, setFilter] = useState<'TODAY' | 'OVERDUE' | 'UPCOMING' | 'COMPLETED'>('TODAY')
  const [followUps, setFollowUps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFollowUps = async (activeFilter: 'TODAY' | 'OVERDUE' | 'UPCOMING' | 'COMPLETED') => {
    setLoading(true)
    const res = await getFollowUps(activeFilter)
    if (res.success) {
      setFollowUps(res.followUps || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFollowUps(filter)
  }, [filter])

  const handleUpdateStatus = async (id: string, status: 'DONE' | 'CANCELLED') => {
    const res = await updateFollowUpStatus(id, status)
    if (res.success) {
      fetchFollowUps(filter)
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Follow-ups</h2>
          <p className="text-muted-foreground mt-1">Kelola dan pantau tugas tindak lanjut pelanggan Anda.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['OVERDUE', 'TODAY', 'UPCOMING', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                filter === f 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              {f === 'OVERDUE' ? 'Terlewat' : f === 'TODAY' ? 'Hari Ini' : f === 'UPCOMING' ? 'Akan Datang' : 'Selesai'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm min-h-[500px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm font-bold gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Memuat data...
          </div>
        ) : followUps.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Tidak ada tugas</h3>
            <p className="text-sm mt-1">Bagus! Semua tugas pada kategori ini sudah tertangani.</p>
          </div>
        ) : (
          <div className="divide-y divide-border overflow-y-auto">
            {followUps.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/30 transition">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    filter === 'OVERDUE' ? 'bg-red-500/10 text-red-500' :
                    filter === 'TODAY' ? 'bg-amber-500/10 text-amber-500' :
                    filter === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {filter === 'OVERDUE' ? <AlertCircle className="h-5 w-5" /> : 
                     filter === 'COMPLETED' ? <CheckCircle className="h-5 w-5" /> :
                     <Clock className="h-5 w-5" />}
                  </div>
                  <div>
                    <Link href={`/admin/customers/${item.customerId}`} className="font-bold text-base text-foreground hover:text-primary transition flex items-center gap-1.5">
                      {item.customer?.name} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 font-medium">
                      <span>{item.customer?.phone}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(item.dueAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="mt-3 bg-muted/50 border border-border/60 rounded-lg p-3 text-sm text-foreground">
                      {item.note}
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      PIC: {item.assignedTo?.name}
                    </div>
                  </div>
                </div>
                {item.status === 'PENDING' && (
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button 
                      onClick={() => handleUpdateStatus(item.id, 'DONE')}
                      className="flex-1 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-500/20 transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="h-4 w-4" /> Selesai
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(item.id, 'CANCELLED')}
                      className="flex-1 rounded-xl bg-muted px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/80 transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4" /> Batal
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
