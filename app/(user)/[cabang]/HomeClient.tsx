"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Search, ShieldCheck, Sparkles, Calculator, GitCompareArrows, Heart, Star, ChevronLeft, ChevronRight, Clock, ThumbsUp, Store, Car as CarIcon, MessageSquarePlus, X, Award, CheckCircle, Zap } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useStore, getActiveShowroom } from '@/store/useStore'
import { CarCard } from '@/components/CarCard'
import { EditableText } from '@/components/EditableText'
import { EditableIcon } from '@/components/EditableIcon'

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck, Sparkles, Calculator, GitCompareArrows, Clock, ThumbsUp, Star, CarIcon, Heart, Award, CheckCircle, Zap
}

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()

  const cars = useStore((state) => state.cars)
  const currentAdminUser = useStore((state) => state.currentAdminUser)
  const adminAccounts = useStore((state) => state.adminAccounts)
  const branches = useStore((state) => state.branches)
  const currentCabang = (params.cabang as string) || 'jakarta'
  const activeBranch = branches.find(b => (b.slug || b.city.toLowerCase().replace(/\s+/g, '-')) === currentCabang) || branches[0]

  const showroomParam = searchParams.get('showroom')
  const activeOwnerId = showroomParam || (activeBranch ? activeBranch.ownerId : 'admin_owner_1')
  
  const activeShowroomAcc = adminAccounts.find(
    (a) => a.id === activeOwnerId || a.ownerId === activeOwnerId
  )

  // Filter and deduplicate cars strictly for active showroom owner
  const uniqueCarsMap = new Map()
  cars.forEach(c => {
    if (!uniqueCarsMap.has(c.id)) {
      uniqueCarsMap.set(c.id, c)
    }
  })
  const deduplicatedCars = Array.from(uniqueCarsMap.values()) as typeof cars
  let displayCars = deduplicatedCars.filter((car) => (car.ownerId || 'admin_owner_1') === activeOwnerId)
  
  if (activeBranch) {
    displayCars = displayCars.filter(car => {
      const isBranchMatch = car.branchId === activeBranch.id;
      const isCityMatch = car.location.toLowerCase().includes(activeBranch.city.toLowerCase());
      const isNameMatch = car.location.toLowerCase().includes(activeBranch.name.toLowerCase());
      return isBranchMatch || isCityMatch || isNameMatch;
    })
  }

  const featuredCars = displayCars.slice(0, 6)

  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [year, setYear] = useState('')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setMounted(true), [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (activeOwnerId) params.set('showroom', activeOwnerId)
    if (brand) params.set('brand', brand)
    if (model) params.set('search', model)
    if (maxPrice) params.set('price', maxPrice)
    router.push(`/mobil?${params.toString()}`)
  }

  const [slide, setSlide] = useState(0)
  const allTestimonials = useStore((state) => state.testimonials)
  const branchTestimonials = allTestimonials.filter(t => !t.branchId || (activeBranch && t.branchId === activeBranch.id))
  const addTestimonial = useStore((state) => state.addTestimonial)
  const siteConfig = useStore((state) => state.siteConfig)

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ name: '', car: '', quote: '', rating: 5 })
  const [hoverRating, setHoverRating] = useState(0)

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewForm.name || !reviewForm.car || !reviewForm.quote) return
    addTestimonial({
      name: reviewForm.name,
      car: reviewForm.car,
      quote: reviewForm.quote,
      rating: reviewForm.rating,
      branchId: activeBranch ? activeBranch.id : undefined
    })
    setShowReviewModal(false)
    setReviewForm({ name: '', car: '', quote: '', rating: 5 })
    setSlide(branchTestimonials.length)
  }

  const brands = ['Toyota', 'Honda', 'Mitsubishi', 'Suzuki', 'Hyundai', 'Mazda', 'BMW', 'Mercedes-Benz', 'Wuling', 'BYD']

  if (!mounted) {
    // Return a basic skeleton instead of a blank screen to prevent the "white bug" appearance
    // while waiting for hydration, but avoid full SSR to prevent layout shifts.
    return (
      <div className="min-h-screen bg-foreground flex flex-col items-center justify-center text-white">
         <div className="animate-pulse flex flex-col items-center gap-6">
           <div className="h-12 w-64 bg-white/20 rounded-full"></div>
           <p className="text-white/50 text-sm">Memuat pengalaman premium...</p>
         </div>
      </div>
    )
  }

  return (
    <>
      {/* ACTIVE SHOWROOM PREVIEW BANNER */}
      {mounted && currentAdminUser && (
        <div className="fixed top-20 inset-x-0 z-40 bg-gradient-to-r from-amber-600 via-amber-500 to-primary text-white py-2.5 px-4 text-xs font-bold shadow-xl flex items-center justify-center gap-3 backdrop-blur-md border-b border-white/20">
          <Store className="h-4 w-4 shrink-0 text-white animate-pulse" />
          <span>
            📍 PRATINJAU WEBSITE SHOWROOM: <strong className="underline font-black">{currentAdminUser.name}</strong> ({displayCars.length} Unit Stok Aktif)
          </span>
        </div>
      )}

      {/* 3. HERO SECTION */}
      <section className="relative flex min-h-[100dvh] items-end overflow-hidden bg-foreground pb-20 pt-32 text-white">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=2200&q=90" 
          alt="Premium Cars" 
          className="absolute inset-0 h-full w-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        
        <div className="relative mx-auto w-full max-w-7xl px-5 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-primary">
              <span className="h-px w-12 bg-primary" /> <EditableText contentKey="home_hero_kicker" defaultText="Premium automotive experience" />
            </p>
            <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-7xl drop-shadow-lg text-white">
              {mounted ? <EditableText contentKey="home_hero_title" defaultText={siteConfig.heroTitle} /> : "Premium Automotive Experience"}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 font-medium">
              {mounted ? <EditableText contentKey="home_hero_subtitle" defaultText={siteConfig.heroSubtitle} multiline /> : "Temukan koleksi mobil premium impian Anda. Kualitas terjamin, proses transparan, dan layanan prioritas VVIP untuk setiap pelanggan."}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="#koleksi" className="group flex h-14 items-center gap-2 rounded-full bg-primary pl-8 pr-6 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02]">
                <EditableText contentKey="home_hero_btn_collection" defaultText="Lihat Koleksi Mobil" /> <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href={showroomParam ? `/simulasi-kredit?showroom=${showroomParam}` : '/simulasi-kredit'} className="flex h-14 items-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-8 text-sm font-bold transition-all hover:bg-white/15 hover:border-white/40 hover:scale-[1.02]">
                <EditableText contentKey="home_hero_btn_credit" defaultText="Simulasi Kredit" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid max-w-3xl grid-cols-2 gap-6 border-t border-white/15 pt-8 sm:grid-cols-4"
          >
            <div><p className="font-display text-3xl font-black">{mounted ? displayCars.length : 0}<span className="text-primary">+</span></p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50"><EditableText contentKey="home_stat_label_1" defaultText="Mobil Tersedia" /></p></div>
            <div><p className="font-display text-3xl font-black"><EditableText contentKey="home_stat_customers" defaultText="10K" as="span" /><span className="text-primary">+</span></p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50"><EditableText contentKey="home_stat_label_2" defaultText="Pelanggan" /></p></div>
            <div><p className="font-display text-3xl font-black"><EditableText contentKey="home_stat_experience" defaultText="15" as="span" /><span className="text-primary">+</span></p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50"><EditableText contentKey="home_stat_label_3" defaultText="Tahun Pengalaman" /></p></div>
            <div><p className="font-display text-3xl font-black"><EditableText contentKey="home_stat_rating" defaultText="4.9" as="span" /><span className="text-primary text-xl">/5</span></p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50"><EditableText contentKey="home_stat_label_4" defaultText="Customer Rating" /></p></div>
          </motion.div>
        </div>
      </section>

      {/* Hero Search Form */}
      <section className="relative z-20 mx-auto -mt-12 max-w-6xl px-5 lg:px-8">
        {/* Desktop Search Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="hidden md:grid gap-3 rounded-3xl border border-border/50 bg-background/80 backdrop-blur-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]"
        >
          <div className="relative">
            <select value={brand} onChange={e => setBrand(e.target.value)} className="h-full w-full appearance-none rounded-2xl bg-muted/50 hover:bg-muted transition-colors px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
              <option value="">Pilih Merek</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="relative">
            <select value={model} onChange={e => setModel(e.target.value)} className="h-full w-full appearance-none rounded-2xl bg-muted/50 hover:bg-muted transition-colors px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
              <option value="">Pilih Model (Opsional)</option>
              {mounted && displayCars.filter(c => !brand || c.brand === brand).map((c, idx) => (
                <option key={`${c.id}-${idx}`} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select value={minPrice} onChange={e => setMinPrice(e.target.value)} className="h-full w-full appearance-none rounded-2xl bg-muted/50 hover:bg-muted transition-colors px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
              <option value="">Harga Minimum</option>
              <option value="100000000">Rp 100 Juta</option>
              <option value="500000000">Rp 500 Juta</option>
              <option value="1000000000">Rp 1 Miliar</option>
            </select>
          </div>
          <div className="relative">
            <select value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="h-full w-full appearance-none rounded-2xl bg-muted/50 hover:bg-muted transition-colors px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
              <option value="">Harga Maksimum</option>
              <option value="500000000">Rp 500 Juta</option>
              <option value="1000000000">Rp 1 Miliar</option>
              <option value="2000000000">Rp 2 Miliar</option>
            </select>
          </div>
          <div className="relative">
            <select value={year} onChange={e => setYear(e.target.value)} className="h-full w-full appearance-none rounded-2xl bg-muted/50 hover:bg-muted transition-colors px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
              <option value="">Tahun Mobil</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <button onClick={handleSearch} className="flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25">
            Cari Mobil
          </button>
        </motion.div>

        {/* Mobile Search Floating Trigger */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="md:hidden flex items-center justify-center"
        >
          <button onClick={() => setIsMobileFilterOpen(true)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-2xl px-6 py-5 shadow-xl text-left text-sm font-bold">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-primary" />
              <span>Cari mobil idaman Anda...</span>
            </div>
            <div className="rounded-full bg-muted/50 p-1.5"><ArrowRight className="h-4 w-4" /></div>
          </button>
        </motion.div>
      </section>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-[2.5rem] bg-background p-6 pb-safe border-t border-border shadow-2xl flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-bold">Filter Pencarian</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="rounded-full bg-muted p-2"><X className="h-5 w-5" /></button>
              </div>
              
              <div className="flex flex-col gap-4 mt-2">
                <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full appearance-none rounded-2xl bg-muted/50 px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Pilih Merek</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={model} onChange={e => setModel(e.target.value)} className="w-full appearance-none rounded-2xl bg-muted/50 px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Pilih Model (Opsional)</option>
                  {mounted && displayCars.filter(c => !brand || c.brand === brand).map((c, idx) => (
                    <option key={`${c.id}-${idx}`} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <select value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full appearance-none rounded-2xl bg-muted/50 px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">Harga Min</option>
                    <option value="100000000">100 Jt</option>
                    <option value="500000000">500 Jt</option>
                    <option value="1000000000">1 M</option>
                  </select>
                  <select value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full appearance-none rounded-2xl bg-muted/50 px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">Harga Max</option>
                    <option value="500000000">500 Jt</option>
                    <option value="1000000000">1 M</option>
                    <option value="2000000000">2 M</option>
                  </select>
                </div>
                <select value={year} onChange={e => setYear(e.target.value)} className="w-full appearance-none rounded-2xl bg-muted/50 px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Tahun Mobil</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <button 
                onClick={() => {
                  setIsMobileFilterOpen(false)
                  handleSearch()
                }} 
                className="mt-4 w-full rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                Tampilkan Hasil
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. SECTION MOBIL UNGGULAN */}
      <section id="koleksi" className="mx-auto max-w-7xl px-5 py-32 lg:px-8">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary"><EditableText contentKey="home_col_kicker" defaultText="Koleksi pilihan" /></p>
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl"><EditableText contentKey="home_col_title" defaultText="Mobil Pilihan Terbaik" /></h2>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground"><EditableText contentKey="home_col_subtitle" defaultText="Temukan kendaraan terbaik yang sesuai dengan kebutuhan dan gaya hidup Anda." multiline /></p>
          </div>
          <Link href={showroomParam ? `/mobil?showroom=${showroomParam}` : '/mobil'} className="group inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-bold transition-all hover:bg-muted">
            Lihat Semua Mobil <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        {!mounted ? (
          <div className="flex justify-center py-24">
            <p className="text-muted-foreground animate-pulse">Memuat koleksi mobil...</p>
          </div>
        ) : featuredCars.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory pb-8 -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 scrollbar-hide">
            {featuredCars.map((car, i) => (
              <div key={`${car.id}-${i}`} className="snap-center shrink-0 w-[85vw] md:w-auto">
                <CarCard car={car} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/70 p-12 text-center bg-card/50 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CarIcon className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold">Stok Showroom Masih Kosong</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Sebagai pengelola showroom baru ({activeShowroomAcc?.name || 'Showroom Anda'}), Anda belum meng-upload unit mobil. Tambahkan mobil dari Portal Admin untuk menampilkan unit di halaman utama ini.
            </p>
            <Link
              href="/admin"
              target="_blank"
              className="inline-flex rounded-full bg-primary px-8 py-3 text-xs font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
            >
              + Masuk Ke Portal Admin & Upload Mobil
            </Link>
          </div>
        )}
      </section>


      {/* 10. KENAPA MEMILIH DENKEN MOTORS */}
      <section id="tentang" className="mx-auto max-w-7xl px-5 py-32 lg:px-8">
        <div className="text-center mb-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary"><EditableText contentKey="home_why_kicker" defaultText="The DENKEN standard" /></p>
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl"><EditableText contentKey="home_why_title" defaultText="Mengapa DENKEN MOTORS?" /></h2>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {siteConfig.features?.map((feature) => {
            const IconComponent = ICON_MAP[feature.icon] || ShieldCheck
            return (
              <div key={feature.id} className="group rounded-3xl border border-border/50 bg-card/30 p-8 transition-all hover:bg-card hover:shadow-xl hover:border-primary/20 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <EditableIcon contentKey={`feature_icon_${feature.id}`} defaultIconId={feature.icon} className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-bold">{mounted ? <EditableText contentKey={`feature_title_${feature.id}`} defaultText={feature.title} /> : ''}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{mounted ? <EditableText contentKey={`feature_desc_${feature.id}`} defaultText={feature.description} multiline /> : ''}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 11. CAR BRANDS */}
      <section className="bg-secondary/50 py-24 border-y border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {brands.map(brand => (
              <div key={brand} className="text-2xl sm:text-3xl font-display font-black tracking-widest text-muted-foreground/40 transition-all hover:text-foreground cursor-pointer grayscale hover:grayscale-0">
                {brand.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOKASI SHOWROOM */}
      {mounted && activeBranch && activeBranch.address && (
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">📍 Lokasi Showroom Kami</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold">{activeBranch.name}</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{activeBranch.address}</p>
          </div>
          <div className="rounded-3xl overflow-hidden border border-border/50 shadow-xl h-[400px] w-full bg-muted relative">
            <iframe 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(activeBranch.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>
      )}

      {/* 12. TESTIMONI */}
      <section id="testimoni" className="mx-auto max-w-7xl px-5 py-32 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary"><EditableText contentKey="home_testi_kicker" defaultText="Real stories" /></p>
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl"><EditableText contentKey="home_testi_title" defaultText="Apa Kata Pelanggan Kami" /></h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowReviewModal(true)}
              className="hidden sm:flex items-center gap-2 rounded-full border-2 border-primary bg-primary/10 px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <MessageSquarePlus className="h-4 w-4" /> Tulis Ulasan Anda
            </button>
            <div className="flex gap-3">
              <button aria-label="Testimoni sebelumnya" onClick={() => { if (branchTestimonials.length) setSlide((slide + branchTestimonials.length - 1) % branchTestimonials.length) }} className="rounded-full border border-border p-4 transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button aria-label="Testimoni berikutnya" onClick={() => { if (branchTestimonials.length) setSlide((slide + 1) % branchTestimonials.length) }} className="rounded-full border border-border p-4 transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="sm:hidden flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary bg-primary/10 px-6 py-4 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <MessageSquarePlus className="h-4 w-4" /> Tulis Ulasan Anda
          </button>
        </div>
        
        {branchTestimonials.length > 0 ? (
          <div className="relative overflow-hidden">
            <motion.div 
              key={slide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl rounded-[2.5rem] bg-secondary p-10 sm:p-16 border border-border/50 shadow-xl"
            >
              <div className="mb-8 flex gap-1 text-primary">
                {[1,2,3,4,5].map(s => <Star key={s} className={`h-5 w-5 ${s <= (mounted && branchTestimonials[slide]?.rating ? branchTestimonials[slide].rating : 5) ? 'fill-current' : 'text-muted-foreground/30'}`} />)}
              </div>
              <blockquote className="font-display text-3xl font-semibold leading-relaxed sm:text-4xl text-foreground">
                “{mounted && branchTestimonials[slide] ? branchTestimonials[slide].quote : 'Memuat ulasan...'}”
              </blockquote>
              <div className="mt-12 flex items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    {mounted && branchTestimonials[slide] ? branchTestimonials[slide].name.charAt(0) : '?'}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-lg">{mounted && branchTestimonials[slide] ? branchTestimonials[slide].name : 'Pelanggan'}</p>
                  <p className="text-sm font-medium text-primary">Pemilik {mounted && branchTestimonials[slide] ? branchTestimonials[slide].car : 'Mobil Premium'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card/30">
            <p className="text-muted-foreground font-medium">Belum ada ulasan untuk showroom ini.</p>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-5">
            <div className="w-full max-w-lg rounded-3xl bg-card p-6 sm:p-8 shadow-2xl relative border border-border/50 animate-in zoom-in-95">
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute right-6 top-6 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="font-display text-2xl font-bold mb-2">Tulis Ulasan</h3>
              <p className="text-sm text-muted-foreground mb-6">Bagikan pengalaman Anda membeli mobil di DENKEN MOTORS.</p>
              
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star className={`h-8 w-8 ${star <= (hoverRating || reviewForm.rating) ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Nama Anda</label>
                    <input required type="text" value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} className="w-full rounded-xl border border-border bg-muted/50 p-3.5 text-sm outline-none focus:border-primary" placeholder="Contoh: Budi" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Mobil Anda</label>
                    <input required type="text" value={reviewForm.car} onChange={e => setReviewForm({...reviewForm, car: e.target.value})} className="w-full rounded-xl border border-border bg-muted/50 p-3.5 text-sm outline-none focus:border-primary" placeholder="Contoh: Honda CR-V" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Ulasan Anda</label>
                  <textarea required value={reviewForm.quote} onChange={e => setReviewForm({...reviewForm, quote: e.target.value})} className="w-full min-h-[100px] rounded-xl border border-border bg-muted/50 p-3.5 text-sm outline-none focus:border-primary resize-none" placeholder="Tuliskan pengalaman Anda di sini..."></textarea>
                </div>
                <button type="submit" className="w-full rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-[1.02] mt-4">
                  Kirim Ulasan
                </button>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* 13. CTA SECTION */}
      <section className="relative overflow-hidden bg-foreground py-32 text-background">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2200&q=80" alt="CTA Background" className="h-full w-full object-cover opacity-40 mix-blend-overlay" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/80 to-transparent" />
        
        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center px-5 lg:px-8">
          <h2 className="font-display text-5xl font-black tracking-tight sm:text-7xl leading-[1.1]">
            <EditableText contentKey="home_cta_title" defaultText="Siap Memiliki Mobil Impian Anda?" />
          </h2>
          <p className="mt-8 text-xl text-background/80 max-w-2xl font-medium leading-relaxed">
            <EditableText contentKey="home_cta_subtitle" defaultText="Temukan mobil terbaik dengan harga terbaik dan pelayanan kelas dunia hanya di DENKEN MOTORS." multiline />
          </p>
          <div className="mt-12 flex flex-col sm:flex-row w-full sm:w-auto gap-4">
            <Link href={showroomParam ? `/mobil?showroom=${showroomParam}` : '/mobil'} className="flex h-14 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-xl hover:shadow-primary/30">
              Cari Mobil Sekarang
            </Link>
            <Link href="/kontak" className="flex h-14 items-center justify-center rounded-full border-2 border-background bg-transparent px-8 text-sm font-bold text-background transition-all hover:bg-background hover:text-foreground hover:scale-105">
              Hubungi Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default function HomeClient({ initialCars }: { initialCars: any[] }) {
  useEffect(() => {
    if (initialCars && initialCars.length > 0) {
      useStore.setState((state) => {
        const mergedCars = [...initialCars];
        const initialCarIds = new Set(initialCars.map((c: any) => c.id));
        state.cars.forEach((c) => {
          if (!initialCarIds.has(c.id)) {
            mergedCars.push(c);
          }
        });
        return { cars: mergedCars };
      });
    }
  }, [initialCars])

  return (
    <HomeContent />
  )
}
