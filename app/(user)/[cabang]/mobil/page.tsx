"use client"

import { useState, useEffect, Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useParams } from 'next/navigation'
import {
  SlidersHorizontal,
  Search,
  X,
  Store,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { CarCard } from '@/components/CarCard'
import { Car } from '@/data/cars'

function FilterContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const currentCabang = (params.cabang as string) || 'jakarta'

  const storeCars = useStore((state) => state.cars)
  const branches = useStore((state) => state.branches)

  const [mounted, setMounted] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [brand, setBrand] = useState(searchParams.get('brand') || '')
  const [sortBy, setSortBy] = useState<'terbaru' | 'kredit_termurah' | 'cash_termurah' | 'termahal'>('kredit_termurah')
  const initialPrice = searchParams.get('price') ? Number(searchParams.get('price')) : 10000000000
  const [priceRange, setPriceRange] = useState(initialPrice)

  // Indonesian Automotive Specific Filters
  const [plateFilter, setPlateFilter] = useState<'Semua' | 'Ganjil' | 'Genap'>('Semua')
  const [taxFilter, setTaxFilter] = useState(false) // Pajak Hidup Only
  const [firstHandOnly, setFirstHandOnly] = useState(false) // Tangan 1 Only
  const [certifiedOnly, setCertifiedOnly] = useState(false) // 150-Point Certified Only

  const activeBranch = branches.find(b => (b.slug || b.city.toLowerCase().replace(/\s+/g, '-')) === currentCabang) || branches[0]
  const showroomParam = searchParams.get('showroom')
  const activeOwnerId = showroomParam || (activeBranch ? activeBranch.ownerId : null)

  // Fetch latest cars from database on mount
  useEffect(() => {
    setMounted(true)
    if (searchParams.get('brand')) setBrand(searchParams.get('brand') as string)
    if (searchParams.get('search')) setSearch(searchParams.get('search') as string)
    if (searchParams.get('price')) setPriceRange(Number(searchParams.get('price')))
  }, [searchParams])

  const filteredCars = useMemo(() => {
    return storeCars
      .filter((car) => {
        // Location & Branch filtering
        if (activeBranch) {
          const isBranchMatch = car.branchId === activeBranch.id
          const isCityMatch = car.location.toLowerCase().includes(activeBranch.city.toLowerCase())
          const isNameMatch = car.location.toLowerCase().includes(activeBranch.name.toLowerCase())
          if (!isBranchMatch && !isCityMatch && !isNameMatch) return false
        }

        // Search text
        if (search) {
          const s = search.toLowerCase()
          const matchName = car.name.toLowerCase().includes(s)
          const matchBrand = car.brand.toLowerCase().includes(s)
          const matchPlate = car.plateNumber ? car.plateNumber.toLowerCase().includes(s) : false
          if (!matchName && !matchBrand && !matchPlate) return false
        }

        // Brand
        if (brand && car.brand.toLowerCase() !== brand.toLowerCase()) return false

        // Price range (compare against credit price if available, else cash price)
        const effectivePrice = car.priceCredit || car.price
        if (effectivePrice > priceRange) return false

        // Plat Ganjil / Genap Filter
        if (plateFilter !== 'Semua') {
          const p = (car.plateNumber || '').toLowerCase()
          if (plateFilter === 'Ganjil' && !p.includes('ganjil')) return false
          if (plateFilter === 'Genap' && !p.includes('genap')) return false
        }

        // Pajak Hidup Filter
        if (taxFilter) {
          const t = (car.taxDate || '').toLowerCase()
          if (t.includes('mati')) return false
        }

        // Tangan Pertama Filter
        if (firstHandOnly) {
          const o = (car.ownership || '').toLowerCase()
          if (!o.includes('tangan 1') && !o.includes('tangan pertama')) return false
        }

        // Certified 150-Point Filter
        if (certifiedOnly) {
          if (car.isFloodFree === false || car.isAccidentFree === false) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'kredit_termurah') {
          const priceA = a.priceCredit || a.price
          const priceB = b.priceCredit || b.price
          return priceA - priceB
        }
        if (sortBy === 'cash_termurah') return a.price - b.price
        if (sortBy === 'termahal') return (b.priceCredit || b.price) - (a.priceCredit || a.price)
        return b.year - a.year // default terbaru
      })
  }, [storeCars, activeBranch, search, brand, priceRange, plateFilter, taxFilter, firstHandOnly, certifiedOnly, sortBy])

  const handleResetFilters = () => {
    setBrand('')
    setSearch('')
    setPriceRange(10000000000)
    setPlateFilter('Semua')
    setTaxFilter(false)
    setFirstHandOnly(false)
    setCertifiedOnly(false)
    setSortBy('kredit_termurah')
  }

  return (
    <div className="mobile-page-shell">
      {/* Theme Responsive Header */}
      <div className="bg-card border-b border-border/60 py-7 sm:py-16 text-foreground relative overflow-hidden mb-4 sm:mb-10 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto w-full max-w-[1536px] px-4 sm:px-10 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.28em] text-primary">
              DENKEN Motors Selection
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-5xl font-black tracking-tight">
            Katalog Mobil Premium
          </h1>
          <p className="mt-1.5 sm:mt-3 text-muted-foreground max-w-2xl mx-auto text-[10px] sm:text-base leading-relaxed">
            Temukan unit mobil impian bersertifikasi 150 titik inspeksi dengan skema paket kredit terjangkau & harga cash transparan.
          </p>
        </div>
      </div>

      <div className="mobile-container">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-card border border-border px-3 font-bold shadow-sm text-xs shrink-0 active:scale-[0.99]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> Filter Pencarian ({mounted ? filteredCars.length : 0} Unit)
          </button>

          {/* Sidebar Filters */}
          <aside className={`lg:w-80 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-28 rounded-2xl sm:rounded-3xl bg-card border border-border/60 p-4 sm:p-6 shadow-xl space-y-5 sm:space-y-6 text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <h2 className="font-bold text-base flex items-center gap-2 text-foreground">
                  <SlidersHorizontal className="h-4 w-4 text-primary" /> Filter Otomotif
                </h2>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset Semua
                </button>
              </div>

              {/* Search */}
              <div>
                <label className="font-bold uppercase tracking-wider mb-2 block text-muted-foreground text-[10px]">
                  Pencarian Unit
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ketik model / nopol..."
                    className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-primary font-bold"
                  />
                </div>
              </div>

              {/* 1. FILTER PLAT GANJIL / GENAP (INDONESIAN REALITY) */}
              <div>
                <label className="font-bold uppercase tracking-wider mb-2 block text-muted-foreground text-[10px]">
                  Plat Nopol (Ganjil / Genap)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Semua', 'Ganjil', 'Genap'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlateFilter(p)}
                      className={`py-2 rounded-xl font-bold text-center border transition ${
                        plateFilter === p
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/30 border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. CHECKBOXES: PAJAK HIDUP, TANGAN 1, SERTIFIKASI */}
              <div className="space-y-2.5 pt-2 border-t border-border/40">
                <label className="font-bold uppercase tracking-wider block text-muted-foreground text-[10px]">
                  Kriteria Prioritas Pembeli
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={taxFilter}
                    onChange={(e) => setTaxFilter(e.target.checked)}
                    className="rounded text-primary h-4 w-4"
                  />
                  <span className="font-bold text-foreground group-hover:text-primary transition">
                    Pajak STNK Hidup / Panjang
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={firstHandOnly}
                    onChange={(e) => setFirstHandOnly(e.target.checked)}
                    className="rounded text-primary h-4 w-4"
                  />
                  <span className="font-bold text-foreground group-hover:text-primary transition">
                    Tangan Pertama dari Baru
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={certifiedOnly}
                    onChange={(e) => setCertifiedOnly(e.target.checked)}
                    className="rounded text-primary h-4 w-4"
                  />
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline transition flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> 100% Bebas Banjir & Tabrak
                  </span>
                </label>
              </div>

              {/* 3. BRANDS FILTER */}
              <div className="pt-2 border-t border-border/40">
                <label className="font-bold uppercase tracking-wider mb-2 block text-muted-foreground text-[10px]">
                  Pabrikan (Merek)
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {['Semua', 'BMW', 'Mercedes-Benz', 'Porsche', 'Land Rover', 'Ford', 'Toyota', 'Honda', 'Nissan', 'Mitsubishi'].map((b) => (
                    <label key={b} className="flex items-center gap-2.5 cursor-pointer py-1 hover:text-primary transition">
                      <input
                        type="radio"
                        name="brandFilter"
                        className="hidden"
                        checked={brand === (b === 'Semua' ? '' : b)}
                        onChange={() => setBrand(b === 'Semua' ? '' : b)}
                      />
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center transition ${
                          brand === (b === 'Semua' ? '' : b)
                            ? 'border-primary bg-primary'
                            : 'border-border bg-card'
                        }`}
                      >
                        {brand === (b === 'Semua' ? '' : b) && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="font-medium text-xs text-foreground">{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. PRICE SLIDER */}
              <div className="pt-2 border-t border-border/40">
                <label className="font-bold uppercase tracking-wider mb-2 flex justify-between text-muted-foreground text-[10px]">
                  <span>Batas Harga Maksimal</span>
                  <span className="text-primary font-mono font-bold">
                    Rp {(priceRange / 1000000).toLocaleString('id-ID')} Jt
                  </span>
                </label>
                <input
                  type="range"
                  min="100000000"
                  max="10000000000"
                  step="50000000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-muted accent-primary outline-none cursor-pointer"
                />
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <main className="flex-1">
            {/* Sort & Count Header */}
            <div className="mb-3 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 bg-card p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-border/50 shadow-sm text-xs">
              <p className="font-semibold text-muted-foreground text-[11px] sm:text-xs">
                Menampilkan <strong className="text-foreground">{mounted ? filteredCars.length : 0}</strong> unit bersertifikat di <strong className="text-primary capitalize">{currentCabang.replace(/-/g, ' ')}</strong>
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-muted-foreground flex items-center gap-1 text-[11px]">
                  <ArrowUpDown className="h-3 w-3" /> Urutkan:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-muted/40 px-2.5 py-1.5 sm:px-3 sm:py-2 font-bold outline-none cursor-pointer focus:border-primary text-foreground text-xs"
                >
                  <option value="kredit_termurah">Paket Kredit Terendah (Termurah)</option>
                  <option value="cash_termurah">Harga Cash Terendah</option>
                  <option value="terbaru">Tahun Terbaru</option>
                  <option value="termahal">Harga Tertinggi (Luxury)</option>
                </select>
              </div>
            </div>

            {!mounted ? (
              <div className="flex justify-center py-24">
                <p className="text-muted-foreground animate-pulse text-sm font-bold">Memuat katalog mobil...</p>
              </div>
            ) : filteredCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {filteredCars.map((car, i) => (
                  <CarCard key={car.id} car={car} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed border-border/70 py-16 sm:py-24 text-center bg-card/50 px-6">
                <div className="rounded-full bg-primary/10 p-4 mb-4 text-primary">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Mobil Tidak Ditemukan
                </h3>
                <p className="mt-2 text-muted-foreground max-w-sm text-xs">
                  Tidak ada unit yang cocok dengan kriteria filter (Plat {plateFilter}, Pajak, atau rentang harga Anda).
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function MobilPage() {
  return (
    <Suspense fallback={<div className="pt-32 pb-20 min-h-screen text-center"><p>Memuat katalog...</p></div>}>
      <FilterContent />
    </Suspense>
  )
}
