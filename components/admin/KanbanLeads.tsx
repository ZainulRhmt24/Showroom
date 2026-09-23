"use client"

import { useState } from 'react'
import {
  MessageSquare,
  Phone,
  User,
  Car as CarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Calendar,
  Sparkles
} from 'lucide-react'

export interface KanbanLeadItem {
  id: string
  name: string
  whatsapp: string
  email?: string
  city?: string
  carId?: string
  carName?: string
  type: 'Kredit' | 'Cash' | 'Trade-In' | 'Kontak'
  status: 'Baru' | 'FollowUp' | 'TestDrive' | 'Negosiasi' | 'Diproses' | 'SPK' | 'Disetujui' | 'Selesai' | 'Ditolak' | 'Batal'
  details?: Record<string, any>
  createdAt: string
  assignedTo?: string
  notes?: string
}

interface KanbanLeadsProps {
  leads: KanbanLeadItem[]
  allCars: any[]
  salesMembers: any[]
  sessionUser: any
  onStatusChange: (id: string, newStatus: any, assignedTo?: string, notes?: string) => void
  onOpenSpk: (lead: KanbanLeadItem, car: any) => void
}

const COLUMNS = [
  { id: 'Baru', label: 'Prospek Baru', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  { id: 'FollowUp', label: 'Follow-Up', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { id: 'TestDrive', label: 'Test Drive', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  { id: 'Negosiasi', label: 'Negosiasi / Berkas', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
  { id: 'SPK', label: 'SPK / Booking', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { id: 'Selesai', label: 'Selesai (Sold)', color: 'bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/30' },
  { id: 'Batal', label: 'Batal / Ditolak', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
]

export function KanbanLeads({ leads, allCars, salesMembers, sessionUser, onStatusChange, onOpenSpk }: KanbanLeadsProps) {
  const [activeLeadForNotes, setActiveLeadForNotes] = useState<string | null>(null)
  const [tempNotes, setTempNotes] = useState('')
  const [selectedSales, setSelectedSales] = useState<Record<string, string>>({})

  const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

  const getLeadPriority = (lead: KanbanLeadItem) => {
    if (lead.details?.isBookingLock || lead.type === 'Kredit' || (lead.details?.dp && lead.details.dp > 50000000)) {
      return { label: '🔥 HOT PROSPECT', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' }
    }
    if (lead.type === 'Trade-In' || lead.status === 'TestDrive' || lead.status === 'Negosiasi') {
      return { label: '⚡ WARM LEAD', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' }
    }
    return { label: '💬 INQUIRY', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' }
  }

  const getDaysOnLot = (car: any) => {
    if (!car) return null
    // Pseudo days calculation based on car name/id for demo stability
    const hash = (car.name || car.id || 'car').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)
    const days = (hash % 52) + 7
    
    if (days > 45) {
      return { days, label: `🔴 ${days} Hari (Aging Stock - Push Sales)`, isWarning: true }
    } else if (days > 28) {
      return { days, label: `🟡 ${days} Hari (Normal)`, isWarning: false }
    }
    return { days, label: `🟢 ${days} Hari (Unit Segar)`, isWarning: false }
  }

  const normalizeStatus = (status: string): string => {
    if (status === 'Diproses') return 'FollowUp'
    if (status === 'Disetujui') return 'SPK'
    if (status === 'Ditolak') return 'Batal'
    return status
  }

  const getWaLink = (lead: KanbanLeadItem) => {
    let rawPhone = lead.whatsapp.replace(/[^0-9]/g, '')
    if (rawPhone.startsWith('0')) rawPhone = '62' + rawPhone.slice(1)

    const car = allCars.find(c => c.id === lead.carId || (lead.carName && c.name.toLowerCase() === lead.carName.toLowerCase()))
    const carName = car ? car.name : lead.carName || 'Unit Kendaraan'
    const currentHour = new Date().getHours()
    const greeting = currentHour < 12 ? 'Selamat Pagi' : currentHour < 15 ? 'Selamat Siang' : 'Selamat Sore'

    let msg = ''
    if (lead.type === 'Kredit') {
      msg = `${greeting} Bapak/Ibu *${lead.name}* 🙏\n\nTerima kasih telah menghubungi *DENKEN MOTORS - Premium Showroom*.\n\nKami telah menerima pengajuan simulasi kredit untuk unit *${carName}*.\nSaya dengan tim sales ingin membantu konsultasi skema DP, angsuran per bulan, serta kelengkapan berkas leasing agar dapat diproses cepat.\n\nApakah saat ini waktu yang nyaman untuk berdiskusi? 😊`
    } else if (lead.type === 'Trade-In') {
      msg = `${greeting} Bapak/Ibu *${lead.name}* 🙏\n\nTerima kasih atas pengajuan *Tukar Tambah (Trade-In)* untuk unit *${carName}* di *DENKEN MOTORS*.\n\nKami ingin menjadwalkan penaksiran nilai mobil lama Anda dan inspeksi 150 titik secara gratis di showroom kami.\nKapan ada waktu luang untuk janji temu? 😊`
    } else {
      msg = `${greeting} Bapak/Ibu *${lead.name}* 🙏\n\nTerima kasih telah memilih *DENKEN MOTORS* untuk unit impian *${carName}*.\nUnit saat ini berstatus siap di showroom kami. Kapan Bapak/Ibu berkenan untuk melihat unit langsung / test drive? 😊`
    }

    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="space-y-6">
      {/* Kanban Board Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x">
        {COLUMNS.map((col) => {
          const columnLeads = leads.filter((l) => normalizeStatus(l.status) === col.id)

          return (
            <div
              key={col.id}
              className="flex-shrink-0 w-80 rounded-2xl bg-card border border-border/70 shadow-sm flex flex-col max-h-[750px] snap-start"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${col.color}`}>
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {columnLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground/60 text-xs">
                    Tidak ada prospek di tahapan ini
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const matchedCar = allCars.find(
                      (c) => c.id === lead.carId || (lead.carName && c.name.toLowerCase() === lead.carName.toLowerCase())
                    )

                    const priority = getLeadPriority(lead)
                    const daysInfo = getDaysOnLot(matchedCar)

                    return (
                      <div
                        key={lead.id}
                        className="rounded-xl border border-border bg-background/80 p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        {/* Top: Customer Name & Type & Priority */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-extrabold text-sm text-foreground">{lead.name}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3 text-primary" /> {lead.whatsapp}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`rounded border text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider ${priority.color}`}>
                              {priority.label}
                            </span>
                            <span className="rounded bg-primary/10 text-primary text-[9px] font-extrabold px-2 py-0.5 uppercase tracking-wide">
                              {lead.type}
                            </span>
                          </div>
                        </div>

                        {/* Car Incaran & Days on Lot */}
                        <div className="rounded-lg bg-muted/50 p-2.5 space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <CarIcon className="h-4 w-4 text-primary shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs text-foreground truncate">
                                {matchedCar ? matchedCar.name : lead.carName || 'Unit Showroom'}
                              </p>
                              {matchedCar && (
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  {formatIDR(matchedCar.priceCredit || matchedCar.price)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Aging Stock Indicator (Showroom Cash Flow Vital) */}
                          {daysInfo && (
                            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-border/40">
                              <span className="text-muted-foreground font-semibold">Umur Unit:</span>
                              <span className={`font-extrabold ${daysInfo.isWarning ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-foreground'}`}>
                                {daysInfo.label}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Sales Assigned */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                          <span className="text-[10px]">Sales:</span>
                          {sessionUser?.role === 'SALES' ? (
                            <span className="font-semibold text-[11px] text-foreground">
                              {(lead as any).assignedUser?.name || 'Belum Ditugaskan'}
                            </span>
                          ) : (
                            <select
                              value={lead.assignedTo || ''}
                              onChange={(e) => onStatusChange(lead.id, normalizeStatus(lead.status), e.target.value || undefined, lead.notes)}
                              className="rounded border border-border bg-card px-2 py-1 text-[10px] font-semibold outline-none focus:border-primary max-w-[120px]"
                            >
                              <option value="">— Unassigned —</option>
                              {salesMembers.map(m => (
                                <option key={m.userId} value={m.userId}>{m.user.name}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Notes snippet if available */}
                        {lead.notes && (
                          <p className="text-[11px] text-muted-foreground italic bg-muted/30 p-2 rounded border border-border/30">
                            "{lead.notes}"
                          </p>
                        )}

                        {/* Actions */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <a
                            href={getWaLink(lead)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 transition shadow-sm"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                          </a>

                          {(col.id === 'SPK' || col.id === 'Selesai' || lead.status === 'Disetujui') && (
                            <button
                              onClick={() => onOpenSpk(lead, matchedCar)}
                              title="Cetak Dokumen SPK Resmi"
                              className="flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-2.5 py-1.5 text-xs font-bold transition"
                            >
                              <FileText className="h-3.5 w-3.5" /> SPK
                            </button>
                          )}
                        </div>

                        {/* Pipeline Stage Controller */}
                        <div className="pt-1 flex items-center justify-between gap-1 text-[10px] text-muted-foreground">
                          <span>Pindah Tahapan:</span>
                          <select
                            value={normalizeStatus(lead.status)}
                            onChange={(e) => onStatusChange(lead.id, e.target.value)}
                            className="rounded border border-border bg-card text-foreground px-2 py-1 text-[11px] font-semibold outline-none focus:border-primary"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
