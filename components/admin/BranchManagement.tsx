"use client"

import { useState } from 'react'
import {
  Store,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Clock,
  Car as CarIcon,
  TrendingUp,
  DollarSign,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  Building2,
  ChevronRight
} from 'lucide-react'

interface BranchItem {
  id: string
  slug: string
  name: string
  city: string
  address: string
  mapUrl?: string
  phone?: string
  openDays?: string
  openHours?: string
  description?: string
  isActive?: boolean
  _count?: { cars: number; transactions: number; memberships: number; leads: number }
}

interface BranchManagementProps {
  branches: BranchItem[]
  allCars: any[]
  onCreateBranch: (data: any) => Promise<void>
  onUpdateBranch: (id: string, data: any) => Promise<void>
  onDeleteBranch: (id: string) => Promise<void>
}

const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

export function BranchManagement({ branches, allCars, onCreateBranch, onUpdateBranch, onDeleteBranch }: BranchManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    openDays: 'Senin - Sabtu',
    openHours: '09:00 - 18:00',
    description: '',
    mapUrl: '',
  })

  const openCreateModal = () => {
    setEditingBranch(null)
    setForm({
      name: '',
      city: '',
      address: '',
      phone: '',
      openDays: 'Senin - Sabtu',
      openHours: '09:00 - 18:00',
      description: '',
      mapUrl: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (branch: BranchItem) => {
    setEditingBranch(branch)
    setForm({
      name: branch.name,
      city: branch.city,
      address: branch.address,
      phone: branch.phone || '',
      openDays: branch.openDays || 'Senin - Sabtu',
      openHours: branch.openHours || '09:00 - 18:00',
      description: branch.description || '',
      mapUrl: branch.mapUrl || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingBranch) {
        await onUpdateBranch(editingBranch.id, form)
      } else {
        const slug = form.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4)
        await onCreateBranch({ ...form, slug })
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus cabang ini? Semua mobil yang terkait akan di-unassign.')) {
      await onDeleteBranch(id)
    }
  }

  const handleToggleActive = async (branch: BranchItem) => {
    await onUpdateBranch(branch.id, { isActive: !(branch.isActive !== false) })
  }

  // Calculate per-branch stats from allCars
  const getBranchStats = (branchId: string) => {
    const branchCars = allCars.filter(c => c.branchId === branchId)
    const readyCars = branchCars.filter(c => !c.isSoldOut && c.badge !== 'SOLD OUT')
    const soldCars = branchCars.filter(c => c.isSoldOut || c.badge === 'SOLD OUT')
    const valuation = readyCars.reduce((sum: number, c: any) => sum + (c.price || 0), 0)
    return { total: branchCars.length, ready: readyCars.length, sold: soldCars.length, valuation }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Manajemen Cabang Showroom</h2>
          <p className="text-xs text-muted-foreground">
            Kelola lokasi cabang, jam operasional, dan pantau performa setiap cabang.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Tambah Cabang Baru
        </button>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((branch) => {
          const stats = getBranchStats(branch.id)
          const isActive = branch.isActive !== false

          return (
            <div
              key={branch.id}
              className={`rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md space-y-4 ${
                isActive ? 'border-border' : 'border-rose-500/30 opacity-70'
              }`}
            >
              {/* Branch Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{branch.name}</h3>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {branch.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(branch)}
                    className={`p-1.5 rounded-lg transition ${isActive ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-rose-500 hover:bg-rose-500/10'}`}
                    title={isActive ? 'Nonaktifkan Cabang' : 'Aktifkan Cabang'}
                  >
                    {isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => openEditModal(branch)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    title="Edit Cabang"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition"
                    title="Hapus Cabang"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Address & Contact */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/60" />
                  <span>{branch.address}</span>
                </p>
                {branch.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span>{branch.phone}</span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span>{branch.openDays || 'Senin - Sabtu'} • {branch.openHours || '09:00 - 18:00'}</span>
                </p>
              </div>

              {/* Branch Stats */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40">
                <div className="text-center">
                  <p className="font-display text-lg font-black text-foreground">{stats.ready}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Unit Ready</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-lg font-black text-emerald-600 dark:text-emerald-400">{stats.sold}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Terjual</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-lg font-black text-primary">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Total Unit</p>
                </div>
              </div>

              {/* Valuation */}
              <div className="flex items-center justify-between bg-muted/40 rounded-xl p-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Valuasi Stok</span>
                <span className="font-mono text-xs font-bold text-primary">{formatIDR(stats.valuation)}</span>
              </div>

              {/* Status Badge & Additional Counts */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                }`}>
                  {isActive ? '● AKTIF' : '● NONAKTIF'}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                  <span>{branch._count?.memberships || 0} Sales</span>
                  <span>•</span>
                  <span>{branch._count?.leads || 0} Leads</span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Empty state */}
        {branches.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-border/50 p-12 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-bold text-muted-foreground">Belum ada cabang terdaftar</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Klik "Tambah Cabang Baru" untuk memulai</p>
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Branch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {editingBranch ? 'Edit Cabang Showroom' : 'Tambah Cabang Baru'}
                </h3>
                <p className="text-xs text-muted-foreground">Lengkapi profil cabang showroom Anda.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Nama Cabang</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                    placeholder="Contoh: DENKEN Surabaya"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Kota</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                    placeholder="Contoh: Surabaya"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Alamat Lengkap</label>
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition resize-none"
                  rows={2}
                  placeholder="Contoh: Jl. Ahmad Yani No. 100, Surabaya"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                    placeholder="Contoh: +62 812-3456-7890"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">URL Google Maps</label>
                  <input
                    type="text"
                    value={form.mapUrl}
                    onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Hari Operasional</label>
                  <input
                    type="text"
                    value={form.openDays}
                    onChange={(e) => setForm({ ...form, openDays: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                    placeholder="Senin - Sabtu"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Jam Operasional</label>
                  <input
                    type="text"
                    value={form.openHours}
                    onChange={(e) => setForm({ ...form, openHours: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                    placeholder="09:00 - 18:00"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Deskripsi (Opsional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition resize-none"
                  rows={2}
                  placeholder="Cabang utama showroom premium..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : editingBranch ? 'Simpan Perubahan' : 'Tambah Cabang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
