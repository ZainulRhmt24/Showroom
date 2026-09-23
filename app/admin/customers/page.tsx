"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Users, Phone, MapPin, ChevronRight, Activity } from 'lucide-react'
import { useAdminData } from '../layout'
import { createCustomer } from '@/app/actions/customerActions'

export default function CustomersPage() {
  const { sessionUser, dbCustomers, loadFreshData, loadingData } = useAdminData()
  
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    source: 'WALK_IN'
  })
  
  const [error, setError] = useState('')

  const filteredCustomers = dbCustomers.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    const res = await createCustomer(form as any)
    if (res.success) {
      setIsAddOpen(false)
      setForm({ name: '', phone: '', email: '', address: '', source: 'WALK_IN' })
      loadFreshData()
    } else {
      setError(res.error || 'Terjadi kesalahan')
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Daftar Customer</h2>
          <p className="text-xs text-muted-foreground">Kelola basis data pelanggan dan histori hubungan showroom.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Tambah Customer
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau nomor HP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-primary transition"
        />
      </div>

      {/* Customer List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Profil Pelanggan</th>
                <th className="px-4 py-3 font-semibold">Kontak</th>
                <th className="px-4 py-3 font-semibold">Lokasi</th>
                <th className="px-4 py-3 font-semibold text-center">Total Lead</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Belum ada data customer.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{customer.name}</p>
                          <p className="text-[10px] text-muted-foreground">Terdaftar: {new Date(customer.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Phone className="h-3 w-3 text-emerald-500" />
                        {customer.phone}
                      </div>
                      {customer.email && <p className="text-[10px] text-muted-foreground mt-0.5">{customer.email}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{customer.address || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-500/10 text-blue-600 font-bold px-2.5 py-0.5 rounded-full text-xs">
                        <Activity className="h-3 w-3 mr-1" />
                        {customer._count?.leads || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-muted px-3 py-1.5 text-xs font-bold transition"
                      >
                        Detail <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal Add Customer */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Tambah Customer Baru</h3>
              <p className="text-xs text-muted-foreground">Masukkan profil pelanggan. Pastikan nomor HP aktif (WhatsApp).</p>
            </div>
            
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary"
                    placeholder="081234..."
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Sumber (Source)</label>
                  <select
                    value={form.source}
                    onChange={e => setForm({...form, source: e.target.value})}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary"
                  >
                    <option value="WALK_IN">Walk In (Datang Langsung)</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="WEBSITE">Website</option>
                    <option value="REFERRAL">Referral (Referensi)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Alamat Domisili</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-medium outline-none focus:border-primary min-h-[80px]"
                  placeholder="Contoh: Jakarta Selatan..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold hover:bg-muted transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-primary px-6 py-2 font-bold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
