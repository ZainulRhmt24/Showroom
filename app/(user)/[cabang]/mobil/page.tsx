"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useParams } from 'next/navigation'
import { SlidersHorizontal, Search, X, Store } from 'lucide-react'
import { useStore, getActiveShowroom } from '@/store/useStore'
import { CarCard } from '@/components/CarCard'

function FilterContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const currentCabang = (params.cabang as string) || 'jakarta'

  const cars = useStore((state) => state.cars)
  const currentAdminUser = useStore((state) => state.currentAdminUser)
  const adminAccounts = useStore((state) => state.adminAccounts)
  const branches = useStore((state) => state.branches)

  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [brand, setBrand] = useState(searchParams.get('brand') || '')
  const [sortBy, setSortBy] = useState<'terbaru' | 'termurah' | 'termahal'>('terbaru')

  const initialPrice = searchParams.get('price') ? Number(searchParams.get('price')) : 10000000000
  const [priceRange, setPriceRange] = useState(initialPrice)
  const [mounted, setMounted] = useState(false)

  const activeBranch = branches.find(b => (b.slug || b.city.toLowerCase().replace(/\s+/g, '-')) === currentCabang) || branches[0]
  
  const showroomParam = searchParams.get('showroom')
  const activeOwnerId = showroomParam || (activeBranch ? activeBranch.ownerId : 'admin_owner_1')
  
  const activeShowroomAcc = adminAccounts.find(
    (a) => a.id === activeOwnerId || a.ownerId === activeOwnerId
  )

  useEffect(() => {
    setMounted(true)
    if (searchParams.get('brand')) setBrand(searchParams.get('brand') as string)
    if (searchParams.get('search')) setSearch(searchParams.get('search') as string)
    if (searchParams.get('price')) setPriceRange(Number(searchParams.get('price')))
  }, [searchParams])

  const filteredCars = cars
    .filter((car) => {
      if ((car.ownerId || 'admin_owner_1') !== activeOwnerId) {
        return false
      }
      if (activeBranch) {
        const isBranchMatch = car.branchId === activeBranch.id;
        const isCityMatch = car.location.toLowerCase().includes(activeBranch.city.toLowerCase());
        const isNameMatch = car.location.toLowerCase().includes(activeBranch.name.toLowerCase());
        
        if (!isBranchMatch && !isCityMatch && !isNameMatch) {
          return false
        }
      }
      if (search && !car.name.toLowerCase().includes(search.toLowerCase()) && !car.brand.toLowerCase().includes(search.toLowerCase()))
        return false
      if (brand && car.brand.toLowerCase() !== brand.toLowerCase()) return false
      if (car.price > priceRange) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'termurah') return a.price - b.price
      if (sortBy === 'termahal') return b.price - a.price
      return b.year - a.year // default terbaru
    })

  return (
    <div className="pt-24 pb-20 min-h-screen bg-secondary/30">
      {/* Theme Responsive Header */}
      <div className="bg-card border-b border-border/60 py-16 text-foreground relative overflow-hidden mb-12 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight">Katalog Mobil Premium</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base">
            Temukan berbagai pilihan kendaraan kualitas terbaik bersertifikat dengan harga yang transparan.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* ACTIVE SHOWROOM PREVIEW NOTIFICATION BANNER */}
        {mounted && currentAdminUser && (
          <div className="mb-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-primary/10 border border-amber-500/40 p-5 shadow-lg flex items-center justify-center gap-3">
            <Store className="h-6 w-6 text-amber-500 shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-sm text-foreground">
                📍 Mode Pratinjau Website Showroom: <strong className="text-primary">{currentAdminUser.name}</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Menampilkan unit kendaraan yang dikelola secara independen oleh {currentAdminUser.name}.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 rounded-2xl bg-card border border-border p-4 font-bold shadow-sm"
          >
            <SlidersHorizontal className="h-5 w-5 text-primary" /> Filter Pencarian
          </button>

          {/* Sidebar Filters */}
          <aside className={`lg:w-80 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-28 rounded-3xl bg-card border border-border/50 p-6 shadow-xl space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" /> Filter
                </h2>
                <button
                  onClick={() => {
                    setBrand('')
                    setSearch('')
                    setPriceRange(2000000000)
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* Search */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2.5 block text-muted-foreground">
                  Pencarian
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari model atau merek..."
                    className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              {/* Brands */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2.5 block text-muted-foreground">
                  Merek
                </label>
                <div className="space-y-2.5">
                  {['Semua', 'Ford', 'Nissan', 'Honda', 'Toyota', 'Mercedes-Benz', 'BMW', 'Land Rover', 'Porsche'].map((b) => (
                    <label key={b} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="brandFilter"
                        className="hidden"
                        checked={brand === (b === 'Semua' ? '' : b)}
                        onChange={() => setBrand(b === 'Semua' ? '' : b)}
                      />
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                          brand === (b === 'Semua' ? '' : b)
                            ? 'border-primary bg-primary'
                            : 'border-border bg-card group-hover:border-primary/50'
                        }`}
                      >
                        {brand === (b === 'Semua' ? '' : b) && <X className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium">{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2 flex justify-between text-muted-foreground">
                  <span>Harga Maksimal</span>
                  <span className="text-foreground font-bold">Rp {(priceRange / 1000000).toLocaleString('id-ID')} Jt</span>
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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
              <p className="font-semibold text-sm text-muted-foreground">
                Menampilkan <strong className="text-foreground">{mounted ? filteredCars.length : 0}</strong> mobil
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="terbaru">Mobil Terbaru</option>
                  <option value="termurah">Harga Terendah</option>
                  <option value="termahal">Harga Tertinggi</option>
                </select>
              </div>
            </div>

            {!mounted ? (
              <div className="flex justify-center py-24">
                <p className="text-muted-foreground animate-pulse">Memuat data mobil...</p>
              </div>
            ) : filteredCars.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCars.map((car, i) => (
                  <CarCard key={car.id} car={car} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 py-24 text-center bg-card/50 px-6">
                <div className="rounded-full bg-primary/10 p-4 mb-4 text-primary">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-bold">
                  {search || brand ? 'Mobil tidak ditemukan' : 'Stok Showroom Belum Ada Unit'}
                </h3>
                <p className="mt-2 text-muted-foreground max-w-sm text-sm">
                  {search || brand
                    ? 'Maaf, tidak ada mobil yang cocok dengan filter pencarian Anda.'
                    : `Showroom ${activeShowroomAcc?.name || 'ini'} belum memiliki unit mobil yang di-upload.`}
                </p>
                {search || brand ? (
                  <button
                    onClick={() => {
                      setBrand('')
                      setSearch('')
                      setPriceRange(10000000000)
                    }}
                    className="mt-6 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    Reset Filter
                  </button>
                ) : (
                  <div className="mt-6 flex flex-wrap gap-3 justify-center">
                    <Link
                      href="/admin"
                      target="_blank"
                      className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
                    >
                      + Tambah Unit di Portal Admin
                    </Link>
                  </div>
                )}
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
