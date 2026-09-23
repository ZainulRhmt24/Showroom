"use client"

import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Car as CarIcon,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  ChevronDown,
  Building2,
  X
} from 'lucide-react'

interface InventoryManagerProps {
  cars: any[]
  branches: any[]
  sessionUser?: any
  onEditCar: (car: any) => void
  onDeleteCar: (id: string) => void
  onAddCar: () => void
  onAssignBranch: (carId: string, branchId: string | null) => void
  onToggleStatus: (carId: string, badge: string, isSoldOut: boolean) => void
}

const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

const CAR_BRANDS = ['Semua', 'Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Ford', 'Nissan', 'Mitsubishi', 'Suzuki', 'Hyundai', 'Wuling']
const CAR_TYPES = ['Semua', 'SUV', 'MPV', 'Sedan', 'Hatchback', 'Pickup', 'Luxury']
const STATUS_OPTIONS = ['Semua', 'READY STOCK', 'BOOKED', 'SOLD OUT']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'price-high', label: 'Harga Tertinggi' },
  { value: 'price-low', label: 'Harga Terendah' },
  { value: 'year-new', label: 'Tahun Terbaru' },
  { value: 'mileage-low', label: 'KM Terendah' },
]

export function InventoryManager({
  cars,
  branches,
  onEditCar,
  onDeleteCar,
  onAddCar,
  onAssignBranch,
  onToggleStatus,
  sessionUser,
}: InventoryManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBrand, setFilterBrand] = useState('Semua')
  const [filterType, setFilterType] = useState('Semua')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterBranch, setFilterBranch] = useState('Semua')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const getDaysOnLot = (car: any) => {
    if (!car.createdAt) return 0
    const created = new Date(car.createdAt)
    const now = new Date()
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Get unique brands from actual inventory
  const actualBrands = useMemo(() => {
    const brands = [...new Set(cars.map(c => c.brand))].sort()
    return ['Semua', ...brands]
  }, [cars])

  // Filter and sort
  const filteredCars = useMemo(() => {
    let result = [...cars]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        (c.plateNumber && c.plateNumber.toLowerCase().includes(q)) ||
        (c.color && c.color.toLowerCase().includes(q))
      )
    }

    // Filters
    if (filterBrand !== 'Semua') {
      result = result.filter(c => c.brand === filterBrand)
    }
    if (filterType !== 'Semua') {
      result = result.filter(c => c.type === filterType)
    }
    if (filterStatus !== 'Semua') {
      if (filterStatus === 'SOLD OUT') {
        result = result.filter(c => c.isSoldOut || c.badge === 'SOLD OUT')
      } else if (filterStatus === 'BOOKED') {
        result = result.filter(c => c.badge === 'BOOKED' && !c.isSoldOut)
      } else {
        result = result.filter(c => !c.isSoldOut && c.badge !== 'SOLD OUT' && c.badge !== 'BOOKED')
      }
    }
    if (filterBranch !== 'Semua') {
      result = result.filter(c => c.branchId === filterBranch)
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'year-new':
        result.sort((a, b) => b.year - a.year)
        break
      case 'mileage-low':
        result.sort((a, b) => a.mileage - b.mileage)
        break
      default: // newest
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    }

    return result
  }, [cars, searchQuery, filterBrand, filterType, filterStatus, filterBranch, sortBy])

  // Stats
  const agingStock = cars.filter(c => !c.isSoldOut && getDaysOnLot(c) > 45).length
  const activeFilters = [filterBrand, filterType, filterStatus, filterBranch].filter(f => f !== 'Semua').length

  const clearFilters = () => {
    setFilterBrand('Semua')
    setFilterType('Semua')
    setFilterStatus('Semua')
    setFilterBranch('Semua')
    setSearchQuery('')
    setSortBy('newest')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Manajemen Stok Kendaraan</h2>
          <p className="text-xs text-muted-foreground">
            Kelola Dual Pricing, inspeksi, assign cabang, dan pantau aging stock.
            {agingStock > 0 && (
              <span className="ml-2 text-rose-500 font-bold">
                ⚠️ {agingStock} unit aging stock (&gt;45 hari)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onAddCar}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Tambah Mobil Baru
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, merek, plat nomor, warna..."
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-primary transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Toggle Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
              showFilters || activeFilters > 0
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
            {activeFilters > 0 && (
              <span className="rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-black">{activeFilters}</span>
            )}
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary transition"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="flex items-center gap-3 flex-wrap p-4 rounded-xl bg-muted/30 border border-border/50">
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold outline-none"
            >
              {actualBrands.map(b => <option key={b} value={b}>{b === 'Semua' ? '🏷️ Merek: Semua' : b}</option>)}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold outline-none"
            >
              {CAR_TYPES.map(t => <option key={t} value={t}>{t === 'Semua' ? '🚘 Tipe: Semua' : t}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold outline-none"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'Semua' ? '📦 Status: Semua' : s}</option>)}
            </select>

            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold outline-none"
            >
              <option value="Semua">🏢 Cabang: Semua</option>
              {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Reset Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Menampilkan <strong className="text-foreground">{filteredCars.length}</strong> dari {cars.length} unit</span>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Mobil</th>
                <th className="p-4">Dual Pricing</th>
                <th className="p-4">Pajak & Nopol</th>
                <th className="p-4">Inspeksi</th>
                <th className="p-4">Cabang</th>
                <th className="p-4">Umur Unit</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredCars.map((car) => {
                const days = getDaysOnLot(car)
                const isAging = days > 45 && !car.isSoldOut
                const branchName = branches.find((b: any) => b.id === car.branchId)?.name

                return (
                  <tr key={car.id} className={`hover:bg-muted/30 transition ${isAging ? 'bg-rose-500/[0.03]' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={car.image}
                          alt={car.name}
                          className="h-12 w-16 object-cover rounded-xl border border-border"
                        />
                        <div>
                          <p className="font-bold text-sm text-foreground">{car.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {car.year} • {car.transmission} • {car.mileage.toLocaleString('id-ID')} KM
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-primary">
                        Kredit: {formatIDR(car.priceCredit || Math.round(car.price * 0.95))}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Cash: {formatIDR(car.price)}
                      </p>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-foreground">{car.plateNumber || 'Plat B'}</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        Pajak: {car.taxDate || 'Oktober 2026'}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {car.isFloodFree !== false && (
                          <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5">
                            Bebas Banjir
                          </span>
                        )}
                        {car.isAccidentFree !== false && (
                          <span className="rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-1.5 py-0.5">
                            Bebas Tabrak
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      {sessionUser?.role === 'SALES' ? (
                        <span className="text-[11px] font-bold text-foreground bg-muted px-2 py-1 rounded">
                          {branchName || 'Semua Cabang'}
                        </span>
                      ) : (
                        <select
                          value={car.branchId || ''}
                          onChange={(e) => onAssignBranch(car.id, e.target.value || null)}
                          className="rounded-lg border border-border bg-card px-2 py-1.5 text-[11px] font-semibold outline-none focus:border-primary w-full max-w-[130px]"
                        >
                          <option value="">— Belum —</option>
                          {branches.map((b: any) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="p-4">
                      <div className={`text-[11px] font-bold ${
                        isAging ? 'text-rose-600 dark:text-rose-400' : days > 28 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {days} hari
                        {isAging && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-[9px]">Aging!</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={car.isSoldOut ? 'SOLD OUT' : (car.badge === 'BOOKED' ? 'BOOKED' : 'READY STOCK')}
                        onChange={(e) => {
                          const val = e.target.value
                          onToggleStatus(car.id, val, val === 'SOLD OUT')
                        }}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase border outline-none cursor-pointer ${
                          car.isSoldOut || car.badge === 'SOLD OUT'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                            : car.badge === 'BOOKED'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        }`}
                      >
                        <option value="READY STOCK">READY</option>
                        <option value="BOOKED">BOOKED</option>
                        <option value="SOLD OUT">SOLD OUT</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditCar(car)}
                          className="rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition"
                          title="Edit Detail Mobil"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCar(car.id)}
                          className="rounded-lg p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition"
                          title="Hapus Mobil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredCars.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    <CarIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">Tidak ada unit yang cocok</p>
                    <p className="text-xs mt-1">Coba ubah filter atau kata kunci pencarian</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
