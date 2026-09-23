"use client"

import { useState, useEffect } from 'react'
import { RefreshCw, Plus, X } from 'lucide-react'
import { KanbanLeads } from '@/components/admin/KanbanLeads'
import { useAdminData } from '../layout'
import { updateLeadStatus, createLead } from '@/app/actions/leadActions'
import { getCars } from '@/app/actions/carActions'
import { getTeamMembers } from '@/app/actions/teamActions'

export default function PipelinePage() {
  const { sessionUser, dbLeads, dbCars, dbCustomers, dbBranches, setDbLeads, setDbCars, loadFreshData, loadingData } = useAdminData()

  const [salesMembers, setSalesMembers] = useState<any[]>([])
  const [isSpkOpen, setIsSpkOpen] = useState(false)
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [spkLead, setSpkLead] = useState<any>(null)
  const [spkCar, setSpkCar] = useState<any>(null)

  const [leadForm, setLeadForm] = useState({
    customerId: '',
    name: '',
    whatsapp: '',
    email: '',
    type: 'Kredit' as any,
    carId: '',
    source: 'WALK_IN' as any,
    branchId: '',
    assignedTo: ''
  })

  useEffect(() => {
    if (sessionUser && sessionUser.role !== 'SALES') {
      getTeamMembers().then(members => {
        setSalesMembers(members.filter((m: any) => m.role === 'SALES'))
      })
    }
  }, [sessionUser])

  const handleLeadStatusChange = async (id: string, newStatus: any, assignedTo?: string, notes?: string) => {
    setDbLeads((prev: any[]) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus, assignedTo: assignedTo || l.assignedTo, notes: notes || l.notes } : l))
    )
    await updateLeadStatus(id, newStatus, assignedTo, notes)
    const updatedCars = await getCars()
    if (updatedCars) setDbCars(updatedCars as any)
  }

  const handleOpenSpk = (lead: any, car: any) => {
    setSpkLead(lead)
    setSpkCar(car)
    setIsSpkOpen(true)
  }

  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Auto populate carName if carId provided
    const selectedCar = dbCars.find((c: any) => c.id === leadForm.carId)
    
    const res = await createLead({
      type: leadForm.type,
      name: leadForm.name,
      whatsapp: leadForm.whatsapp,
      email: leadForm.email,
      customerId: leadForm.customerId || undefined,
      carId: leadForm.carId || undefined,
      carName: selectedCar ? selectedCar.name : undefined,
      source: leadForm.source,
      branchId: leadForm.branchId || undefined,
      assignedTo: leadForm.assignedTo || undefined
    })

    if (res.success) {
      setIsAddLeadOpen(false)
      setLeadForm({ customerId: '', name: '', whatsapp: '', email: '', type: 'Kredit', carId: '', source: 'WALK_IN', branchId: '', assignedTo: '' })
      loadFreshData()
    } else {
      alert(res.error || 'Terjadi kesalahan')
    }
    setIsSubmitting(false)
  }

  // Effect to auto-fill form if existing customer is selected
  useEffect(() => {
    if (leadForm.customerId) {
      const cust = dbCustomers.find((c: any) => c.id === leadForm.customerId)
      if (cust) {
        setLeadForm(prev => ({ ...prev, name: cust.name, whatsapp: cust.phone, email: cust.email || '' }))
      }
    } else if (leadForm.name && dbCustomers.length > 0) {
      // Clear if empty customerId and previous was filled via selection
    }
  }, [leadForm.customerId, dbCustomers])

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Sales Pipeline & Follow-Up</h2>
          <p className="text-xs text-muted-foreground">
            Pantau prospek pembeli, jadwalkan test drive, kirim template WhatsApp, dan cetak SPK.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadFreshData}
            disabled={loadingData}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold hover:bg-muted transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? 'animate-spin' : ''}`} /> Sinkronkan Data
          </button>
          <button
            onClick={() => setIsAddLeadOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Tambah Lead
          </button>
        </div>
      </div>

      <KanbanLeads
        leads={dbLeads}
        allCars={dbCars}
        salesMembers={salesMembers}
        sessionUser={sessionUser}
        onStatusChange={handleLeadStatusChange}
        onOpenSpk={handleOpenSpk}
      />

      {/* MODAL ADD LEAD */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Tambah Deal / Prospek Baru</h3>
                <p className="text-xs text-muted-foreground">Pilih pelanggan lama atau buat pelanggan baru sekaligus.</p>
              </div>
              <button onClick={() => setIsAddLeadOpen(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddLeadSubmit} className="space-y-5 text-sm">
              <div className="space-y-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
                <h4 className="font-bold text-primary flex items-center gap-2">Profil Pelanggan</h4>
                
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Cari Pelanggan Lama (Opsional)</label>
                  <select 
                    value={leadForm.customerId} 
                    onChange={e => setLeadForm({...leadForm, customerId: e.target.value})}
                    className="w-full rounded-xl border border-border bg-card p-2.5 font-bold outline-none focus:border-primary"
                  >
                    <option value="">-- Buat Pelanggan Baru --</option>
                    {dbCustomers.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} (+{c.phone})</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Nama Lengkap *</label>
                    <input type="text" required value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} disabled={!!leadForm.customerId} className="w-full rounded-xl border border-border bg-card p-2.5 font-bold outline-none focus:border-primary disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">WhatsApp *</label>
                    <input type="text" required value={leadForm.whatsapp} onChange={e => setLeadForm({...leadForm, whatsapp: e.target.value})} disabled={!!leadForm.customerId} className="w-full rounded-xl border border-border bg-card p-2.5 font-bold outline-none focus:border-primary disabled:opacity-50" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-foreground">Detail Deal</h4>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Unit Kendaraan Incaran</label>
                    <select value={leadForm.carId} onChange={e => setLeadForm({...leadForm, carId: e.target.value})} className="w-full rounded-xl border border-border bg-card p-2.5 font-bold outline-none focus:border-primary">
                      <option value="">-- Bebas / Belum Tahu --</option>
                      {dbCars.filter((c: any) => !c.isSoldOut).map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name} - Rp {c.price.toLocaleString('id-ID')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Tipe Pembelian</label>
                    <select value={leadForm.type} onChange={e => setLeadForm({...leadForm, type: e.target.value as any})} className="w-full rounded-xl border border-border bg-card p-2.5 font-bold outline-none focus:border-primary">
                      <option value="Kredit">Kredit</option>
                      <option value="Cash">Cash</option>
                      <option value="Trade-In">Trade-In</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Sumber (Source)</label>
                    <select value={leadForm.source} onChange={e => setLeadForm({...leadForm, source: e.target.value as any})} className="w-full rounded-xl border border-border bg-card p-2.5 font-bold outline-none focus:border-primary">
                      <option value="WALK_IN">Walk In</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="WEBSITE">Website</option>
                      <option value="OTHER">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Cabang</label>
                    <select value={leadForm.branchId} onChange={e => setLeadForm({...leadForm, branchId: e.target.value})} className="w-full rounded-xl border border-border bg-card p-2.5 font-bold outline-none focus:border-primary">
                      <option value="">-- Pusat / Bebas --</option>
                      {dbBranches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Sales Person</label>
                    <select value={leadForm.assignedTo} onChange={e => setLeadForm({...leadForm, assignedTo: e.target.value})} className="w-full rounded-xl border border-border bg-card p-2.5 font-bold outline-none focus:border-primary">
                      <option value="">-- Unassigned --</option>
                      {salesMembers.map((m: any) => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <button type="button" onClick={() => setIsAddLeadOpen(false)} className="rounded-xl border border-border px-6 py-2.5 font-bold hover:bg-muted transition">Batal</button>
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-primary px-6 py-2.5 font-bold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50">
                  {isSubmitting ? 'Memproses...' : 'Simpan Lead Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
