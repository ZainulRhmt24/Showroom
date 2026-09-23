"use client"

import { useState, useEffect, useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Search, ShieldCheck, Sparkles, Calculator, GitCompareArrows, 
  Heart, Star, ChevronLeft, ChevronRight, Clock, ThumbsUp, Store, 
  Car as CarIcon, MessageSquarePlus, X, Award, CheckCircle, Zap,
  CheckCircle2, FileText, ArrowUpRight, Gauge, Calendar, ShieldAlert
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { CarCard } from '@/components/CarCard'
import { EditableText } from '@/components/EditableText'
import { EditableIcon } from '@/components/EditableIcon'
import { ProductStageCarousel } from '@/components/ProductStageCarousel'

const BookingModal = dynamic(() => import('@/components/BookingModal').then(m => m.BookingModal), { ssr: false })
const TestDriveModal = dynamic(() => import('@/components/TestDriveModal').then(m => m.TestDriveModal), { ssr: false })
const InspectionAuditModal = dynamic(() => import('@/components/InspectionAuditModal').then(m => m.InspectionAuditModal), { ssr: false })

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck, Sparkles, Calculator, GitCompareArrows, Clock, ThumbsUp, Star, CarIcon, Heart, Award, CheckCircle, Zap
}

const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()

  const cars = useStore((state) => state.cars)
  const branches = useStore((state) => state.branches)
  const currentCabang = (params.cabang as string) || 'jakarta'
  const activeBranch = branches.find(b => (b.slug || b.city.toLowerCase().replace(/\s+/g, '-')) === currentCabang) || branches[0]

  const showroomParam = searchParams.get('showroom')
  const activeOwnerId = showroomParam || (activeBranch ? activeBranch.ownerId : null)

  // Filter and deduplicate cars strictly for active showroom owner
  const displayCars = useMemo(() => {
    const uniqueCarsMap = new Map()
    cars.forEach(c => {
      if (!uniqueCarsMap.has(c.id)) {
        uniqueCarsMap.set(c.id, c)
      }
    })
    const deduplicatedCars = Array.from(uniqueCarsMap.values()) as typeof cars
    let list = deduplicatedCars.filter((car) => car.ownerId === activeOwnerId)
    
    if (activeBranch) {
      list = list.filter(car => {
        const isBranchMatch = car.branchId === activeBranch.id;
        const isCityMatch = car.location.toLowerCase().includes(activeBranch.city.toLowerCase());
        const isNameMatch = car.location.toLowerCase().includes(activeBranch.name.toLowerCase());
        return isBranchMatch || isCityMatch || isNameMatch;
      })
    }
    return list
  }, [cars, activeOwnerId, activeBranch])

  const spotlightCar = displayCars[0] || cars[0]
  const bentoCar = displayCars[1] || displayCars[0] || cars[0]
  const featuredCars = useMemo(() => displayCars.slice(0, 6), [displayCars])

  // Modals state
  const [selectedBookingCar, setSelectedBookingCar] = useState<any | null>(null)
  const [selectedTestDriveCar, setSelectedTestDriveCar] = useState<any | null>(null)
  const [selectedAuditCar, setSelectedAuditCar] = useState<any | null>(null)
  const [selectedFlagship, setSelectedFlagship] = useState<'porsche' | 'amg'>('porsche')

  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [year, setYear] = useState('')
  const [plateFilter, setPlateFilter] = useState<'all' | 'ganjil' | 'genap'>('all')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])

  const handleSearch = () => {
    const searchArgs = new URLSearchParams()
    if (activeOwnerId) searchArgs.set('showroom', activeOwnerId)
    if (brand) searchArgs.set('brand', brand)
    if (model) searchArgs.set('search', model)
    if (maxPrice) searchArgs.set('price', maxPrice)
    router.push(`/${currentCabang}/mobil?${searchArgs.toString()}`)
  }

  const [slide, setSlide] = useState(0)
  const allTestimonials = useStore((state) => state.testimonials)
  const branchTestimonials = useMemo(() => {
    return allTestimonials.filter(t => !t.branchId || (activeBranch && t.branchId === activeBranch.id))
  }, [allTestimonials, activeBranch])
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

  const brands = ['Toyota', 'Honda', 'Mitsubishi', 'Porsche', 'BMW', 'Mercedes-Benz', 'Hyundai', 'Mazda', 'Land Rover']

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="h-10 w-48 bg-primary/20 rounded-full"></div>
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Menyiapkan Pengalaman Kurasi DENKEN...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* OUTER CANVAS WRAPPER (Refined Framed Luxury Architecture) */}
      <main className="w-full max-w-[1536px] mx-auto px-4 sm:px-10 lg:px-16 pt-20 sm:pt-24 pb-20 sm:pb-24 space-y-14 sm:space-y-24 lg:space-y-32">
        
        {/* TOP GROUP: Hero Canvas, Video Grid, and Search Filter tightly bundled */}
        <div className="space-y-2 sm:space-y-3">
        {/* 1. HERO SECTION: Framed Canvas, Sculpted Notch, Editorial Mixed Typography */}
        <section className="dark relative rounded-[1.75rem] sm:rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden min-h-[440px] sm:min-h-[440px] lg:h-[420px] xl:h-[460px] flex flex-col justify-between border border-primary/30 shadow-[0_30px_80px_-20px_rgba(90,33,50,0.5)] bg-background text-foreground">
          {/* Background High-Definition Visual */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.img 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.75 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90" 
              alt="DENKEN Luxury Fleet" 
              className="h-full w-full object-cover object-center" 
            />
            {/* Cinematic Multilayer Vignette Gradients using Semantic Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          </div>

          {/* Top Row: Micro Kicker & Editorial Summary (Preserves Two-Sided Desktop Layout on Mobile) */}
          <div className="relative z-10 pt-4 sm:pt-7 lg:pt-6 px-4 sm:px-12 lg:px-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(120,45,67,0.9)] shrink-0" />
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.28em] text-foreground/90 truncate">
                Atelier Otomotif • Cabang {currentCabang.replace(/-/g, ' ')}
              </span>
            </div>

            {/* Desktop / Tablet: Full Editorial Card */}
            <p className="hidden md:block max-w-xs lg:max-w-md text-xs sm:text-sm font-medium leading-relaxed text-foreground/80 backdrop-blur-xl bg-background/30 border border-primary/20 rounded-2xl p-3 md:p-4 lg:p-5 shadow-lg">
              Kurasi kendaraan premium terinspeksi 150 titik dengan jaminan legalitas dokumen mutlak, riwayat servis bengkel resmi, dan garansi mesin komprehensif.
            </p>

            {/* Mobile: Compact Pill mirroring top-right desktop placement */}
            <span className="md:hidden text-[9px] font-extrabold uppercase tracking-wider text-foreground/90 backdrop-blur-xl bg-background/50 border border-primary/20 rounded-full px-2.5 py-1 shrink-0 shadow-sm">
              Audit 150 Titik
            </span>
          </div>

          {/* Middle Content: Mixed Editorial Typography & Floating Stat Cards (Desktop 2-Col / Balanced Composition) */}
          <div className="relative z-10 px-4 sm:px-12 lg:px-16 py-2 grid lg:grid-cols-12 items-end gap-3 sm:gap-4 lg:gap-6 my-auto">
            {/* Left: Signature Mixed Typography Headline */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="lg:col-span-6 xl:col-span-7 space-y-2 sm:space-y-3"
            >
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-black tracking-tight leading-[0.98] text-foreground">
                Where <br />
                <span className="tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-foreground/70">PASSION MEETS </span>
                <span className="font-serif italic font-normal text-muted-foreground lowercase block sm:inline">distinction.</span>
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex -space-x-2 overflow-hidden shrink-0">
                  <span className="inline-block h-7 w-7 sm:h-9 sm:w-9 rounded-full ring-2 ring-black bg-zinc-800 text-[9px] sm:text-[10px] font-bold flex items-center justify-center text-white/80">VIP</span>
                  <span className="inline-block h-7 w-7 sm:h-9 sm:w-9 rounded-full ring-2 ring-black bg-primary text-[9px] sm:text-[10px] font-bold flex items-center justify-center text-white">150+</span>
                  <span className="inline-block h-7 w-7 sm:h-9 sm:w-9 rounded-full ring-2 ring-black bg-zinc-700 text-[9px] sm:text-[10px] font-bold flex items-center justify-center text-white">100%</span>
                </div>
                <div className="text-[10px] sm:text-xs text-white/70">
                  <strong className="text-white font-bold">{displayCars.length}+ Unit Siap Kirim</strong> dengan sertifikasi Grade A
                </div>
              </div>
            </motion.div>

            {/* Right: 3 Stat Cards STRICTLY PRESERVED IN 1 HORIZONTAL ROW (grid-cols-3 on all screens) */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="lg:col-span-6 xl:col-span-5 grid grid-cols-3 gap-1.5 sm:gap-2.5 lg:gap-3 w-full items-end"
            >
              <div className="backdrop-blur-xl bg-background/50 border border-primary/20 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 lg:p-3 shadow-[0_8px_30px_rgba(90,33,50,0.15)] transition-all hover:-translate-y-0.5 hover:border-primary/50 group">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-display text-lg sm:text-2xl lg:text-3xl font-black text-foreground">{displayCars.length > 0 ? `${displayCars.length}+` : '40+'}</span>
                  <span className="rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">Terkurasi</span>
                </div>
                <p className="mt-0.5 text-[9px] sm:text-[10px] text-foreground/80 font-medium truncate">Unit Stok Siap Kirim</p>
                <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5 truncate hidden sm:block">Lulus Audit 150 Titik</p>
              </div>

              <div className="backdrop-blur-xl bg-background/50 border border-primary/20 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 lg:p-3 shadow-[0_8px_30px_rgba(90,33,50,0.15)] transition-all hover:-translate-y-0.5 hover:border-primary/50 group">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-display text-lg sm:text-2xl lg:text-3xl font-black text-foreground">150</span>
                  <span className="rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">Garansi</span>
                </div>
                <p className="mt-0.5 text-[9px] sm:text-[10px] text-foreground/80 font-medium truncate">Titik Inspeksi Resmi</p>
                <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5 truncate hidden sm:block">Mesin & Transmisi 1 Thn</p>
              </div>

              <div className="backdrop-blur-xl bg-background/50 border border-primary/20 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 lg:p-3 shadow-[0_8px_30px_rgba(90,33,50,0.15)] transition-all hover:-translate-y-0.5 hover:border-primary/50 group">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-display text-lg sm:text-2xl lg:text-3xl font-black text-foreground">100%</span>
                  <span className="rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">Aman</span>
                </div>
                <p className="mt-0.5 text-[9px] sm:text-[10px] text-foreground/80 font-medium truncate">Bebas Risiko</p>
                <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5 truncate hidden sm:block">Jaminan 100% Buyback</p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Center: Sculpted Notch Pill Button Container */}
          <div className="relative z-10 flex justify-center items-end pb-3 sm:pb-4 lg:pb-3">
            <div className="relative flex items-center justify-center">
              <Link 
                href="#koleksi" 
                className="group inline-flex items-center gap-2.5 sm:gap-3 rounded-full bg-background/95 dark:bg-card/95 text-foreground backdrop-blur-2xl px-6 sm:px-10 py-2.5 sm:py-4 text-[11px] sm:text-sm font-extrabold uppercase tracking-wider shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-border/80 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-primary/20"
              >
                <span>Jelajahi Koleksi</span>
                <span className="flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* 1.5. VIDEO HIGHLIGHT GRID (Auto-play Looping Videos, STRICTLY PRESERVED 3-COLUMNS IN 1 ROW) */}
        <section className="relative z-10 w-full pb-2 sm:pb-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
            
            {/* Video Card 1 */}
            <div className="group relative rounded-2xl sm:rounded-3xl overflow-hidden h-[130px] sm:h-[180px] md:h-[200px] lg:h-[220px] xl:h-[240px] bg-muted shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 border border-border/50">
              <video 
                src="/videos/video-performa.mp4"
                poster="/videos/thumb-performa.jpg"
                autoPlay 
                loop 
                muted 
                playsInline 
                preload="auto"
                ref={(el) => {
                  if (el) {
                    el.muted = true
                    el.defaultMuted = true
                    el.play().catch(() => {})
                  }
                }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[10s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 pointer-events-none" />
              
              <div className="relative z-10 p-2.5 sm:p-5 flex flex-col justify-between h-full pointer-events-none">
                <div className="flex justify-between items-start pointer-events-auto">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-white text-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[7px] sm:text-[9px] font-bold shadow-lg">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" /> Video
                  </span>
                  <button className="flex h-5 w-5 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-black shadow-lg hover:scale-110 transition-transform">
                    <ArrowUpRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
                
                <div>
                  <h3 className="font-display text-[11px] sm:text-lg font-black text-white drop-shadow-md leading-tight">
                    Performa <span className="hidden sm:inline"><br/></span>Maksimal.
                  </h3>
                </div>
              </div>
            </div>

            {/* Video Card 2 */}
            <div className="group relative rounded-2xl sm:rounded-3xl overflow-hidden h-[130px] sm:h-[180px] md:h-[200px] lg:h-[220px] xl:h-[240px] bg-muted shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 border border-border/50">
              <video 
                src="/videos/video-white-car.mp4"
                poster="/videos/thumb-kemewahan.jpg"
                autoPlay 
                loop 
                muted 
                playsInline 
                preload="auto"
                ref={(el) => {
                  if (el) {
                    el.muted = true
                    el.defaultMuted = true
                    el.play().catch(() => {})
                  }
                }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[10s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 pointer-events-none" />
              
              <div className="relative z-10 p-2.5 sm:p-5 flex flex-col justify-between h-full pointer-events-none">
                <div className="flex justify-between items-start pointer-events-auto">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-white text-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[7px] sm:text-[9px] font-bold shadow-lg">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" /> Video
                  </span>
                  <button className="flex h-5 w-5 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-black shadow-lg hover:scale-110 transition-transform">
                    <ArrowUpRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
                
                <div>
                  <h3 className="font-display text-[11px] sm:text-lg font-black text-white drop-shadow-md leading-tight">
                    Kemewahan <span className="hidden sm:inline"><br/></span>Eksklusif.
                  </h3>
                </div>
              </div>
            </div>

            {/* Video Card 3 - Lead Gen */}
            <div className="group relative rounded-2xl sm:rounded-3xl overflow-hidden h-[130px] sm:h-[180px] md:h-[200px] lg:h-[220px] xl:h-[240px] bg-muted shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 border border-border/50">
              <video 
                src="/videos/video-macro-car.mp4"
                poster="/videos/thumb-cockpit.jpg"
                autoPlay 
                loop 
                muted 
                playsInline 
                preload="auto"
                ref={(el) => {
                  if (el) {
                    el.muted = true
                    el.defaultMuted = true
                    el.play().catch(() => {})
                  }
                }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[10s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-90 pointer-events-none" />
              
              <div className="relative z-10 p-2.5 sm:p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-white text-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[7px] sm:text-[9px] font-bold shadow-lg">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> VIP
                  </span>
                  <button className="flex h-5 w-5 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-black shadow-lg hover:scale-110 transition-transform">
                    <ArrowUpRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
                
                <div className="w-full">
                  <h3 className="font-display text-[11px] sm:text-base font-black text-white drop-shadow-md mb-1 leading-tight truncate">
                    Penawaran VIP
                  </h3>
                  {/* Desktop input */}
                  <div className="relative hidden sm:block">
                    <input 
                      type="email" 
                      placeholder="Email Anda..." 
                      className="w-full rounded-full bg-white/10 border border-white/20 backdrop-blur-md pl-4 pr-16 py-1.5 text-[10px] font-medium text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50" 
                    />
                    <button className="absolute right-1 top-1 bottom-1 rounded-full bg-white text-black px-2.5 text-[8px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-colors">
                      Sub
                    </button>
                  </div>
                  {/* Mobile compact button */}
                  <Link 
                    href={`/${currentCabang}/kontak`}
                    className="sm:hidden block w-full text-center rounded-full bg-white text-black py-0.5 text-[8px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-colors"
                  >
                    Klaim
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>




        </div>
        
        {/* 3. SECTION 2: TRANSPARENT CUTOUT ATELIER STAGE (Matching Reference Image "Every Drive Begins") */}
        <section className="relative py-8 lg:py-16">
          <div className="grid lg:grid-cols-12 items-center gap-10 lg:gap-16">
            
            {/* LEFT COLUMN: Editorial Mixed Typography, Narrative & Actions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                  Curated Atelier Showcase
                </span>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-foreground">
                Every Drive Begins <br />
                <span className="font-serif italic font-normal text-muted-foreground block sm:inline">
                  vision of curated excellence.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                Setiap kendaraan dalam etalase atelier DENKEN dipersiapkan selayaknya sebuah mahakarya. Dari audit struktur sasis independen hingga kalibrasi komputerisasi ECU dan verifikasi riwayat servis resmi, kami menjamin integritas kemewahan tanpa kompromi.
              </p>

              {/* 4 Luxury Spec Badges (Strictly 4 Columns on all screens) */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-3 pt-2">
                <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-2 sm:p-3.5 text-center transition-all hover:border-primary/40 shadow-sm">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-muted-foreground block truncate">Tenaga</span>
                  <span className="font-display text-xs sm:text-lg font-black text-foreground block">
                    {selectedFlagship === 'porsche' ? '502 HP' : '523 HP'}
                  </span>
                  <span className="text-[7px] sm:text-[9px] text-muted-foreground truncate hidden sm:block">
                    {selectedFlagship === 'porsche' ? 'Flat-6 TT' : 'V8 Biturbo'}
                  </span>
                </div>

                <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-2 sm:p-3.5 text-center transition-all hover:border-primary/40 shadow-sm">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-muted-foreground block truncate">Akselerasi</span>
                  <span className="font-display text-xs sm:text-lg font-black text-foreground block">
                    {selectedFlagship === 'porsche' ? '3.4s' : '3.2s'}
                  </span>
                  <span className="text-[7px] sm:text-[9px] text-muted-foreground truncate hidden sm:block">0-100 km/h</span>
                </div>

                <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-2 sm:p-3.5 text-center transition-all hover:border-primary/40 shadow-sm">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-muted-foreground block truncate">Inspeksi</span>
                  <span className="font-display text-xs sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block">100%</span>
                  <span className="text-[7px] sm:text-[9px] text-emerald-600 dark:text-emerald-400 font-bold truncate hidden sm:block">Grade A+</span>
                </div>

                <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-2 sm:p-3.5 text-center transition-all hover:border-primary/40 shadow-sm">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-muted-foreground block truncate">Garansi</span>
                  <span className="font-display text-xs sm:text-lg font-black text-primary block">1 Thn</span>
                  <span className="text-[7px] sm:text-[9px] text-muted-foreground truncate hidden sm:block">Mesin & Trans</span>
                </div>
              </div>

              {/* Dual Pricing Breakdown (Preserves Side-by-Side on Mobile) */}
              <div className="pt-3 sm:pt-4 border-t border-border/60 flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                    Paket Kredit Spesial
                  </span>
                  <span className="font-display text-lg sm:text-2xl lg:text-3xl font-black text-foreground leading-tight">
                    {selectedFlagship === 'porsche' ? 'Rp 2.850.000.000' : 'Rp 3.100.000.000'}
                  </span>
                  <span className="text-[8px] sm:text-xs text-muted-foreground block mt-0.5">
                    TDP {selectedFlagship === 'porsche' ? 'Rp 550 Jt' : 'Rp 620 Jt'} • Tenor 1-5 Thn
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[8px] sm:text-[10px] font-medium text-muted-foreground block">
                    Cash OTR
                  </span>
                  <span className="font-display text-xs sm:text-lg font-bold text-muted-foreground">
                    {selectedFlagship === 'porsche' ? 'Rp 2.990.000.000' : 'Rp 3.250.000.000'}
                  </span>
                  <span className="text-[8px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    {selectedFlagship === 'porsche' ? 'Plat Genap' : 'Plat Ganjil'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => setSelectedBookingCar(spotlightCar)}
                  className="flex-1 sm:flex-initial rounded-full bg-primary px-4 sm:px-8 py-2.5 sm:py-4 text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 whitespace-nowrap text-center"
                >
                  Kunci Unit (Rp 10 Jt)
                </button>

                <button
                  onClick={() => setSelectedTestDriveCar(spotlightCar)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-border bg-background hover:bg-muted px-4 sm:px-7 py-2.5 sm:py-4 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap text-center"
                >
                  <span>VIP Test Drive</span>
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAuditCar(spotlightCar)}
                  className="hidden sm:inline-block text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-2 px-3 underline decoration-dotted whitespace-nowrap"
                >
                  Lembar Audit →
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Transparent PNG Supercar with Soft Shadow & Ambient Light */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
              
              {/* Radial Luxury Light Halo behind the car */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-3xl rounded-full scale-95 opacity-60 dark:opacity-80 pointer-events-none" />

              {/* Floating Glass Pill Badge Top Right */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="self-end mb-4 z-20"
              >
                <div 
                  onClick={() => setSelectedAuditCar(spotlightCar)}
                  className="backdrop-blur-xl bg-background/80 dark:bg-card/80 border border-border/80 rounded-full px-4 py-1.5 shadow-lg flex items-center gap-2 text-xs font-extrabold text-foreground cursor-pointer hover:scale-105 hover:border-emerald-500/60 transition-all"
                  title="Klik untuk membuka Lembar Audit Digital 150 Titik"
                >
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>150-Point Grade A+ Certified (Cek Audit)</span>
                </div>
              </motion.div>

              {/* Floating Animated Car Stage */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
                className="relative w-full flex items-center justify-center py-6"
              >
                {/* Signature Brand Red Persegi (Positioned behind the rear of the car, modern geometric framing) */}
                <div 
                  className="absolute right-0 sm:right-[2%] lg:right-[4%] top-1/2 -translate-y-1/2 w-[54%] sm:w-[48%] lg:w-[44%] aspect-square rounded-3xl sm:rounded-[2.5rem] bg-primary shadow-2xl shadow-primary/30 pointer-events-none z-0" 
                />

                <motion.img 
                  key={selectedFlagship}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.04, rotate: -0.5 }}
                  src={selectedFlagship === 'porsche' ? '/cars/flagship-porsche-transparent.png' : '/cars/flagship-amg-transparent.png'} 
                  alt={selectedFlagship === 'porsche' ? 'Porsche 911 Carrera S' : 'Mercedes-AMG GT Coupe'} 
                  className="relative z-10 w-full max-w-[620px] object-contain select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_30px_50px_rgba(0,0,0,0.7)]"
                />

                {/* Soft ground contact shadow */}
                <div className="absolute -bottom-2 inset-x-12 h-8 bg-black/35 dark:bg-black/85 blur-2xl rounded-[100%] pointer-events-none z-0" />
              </motion.div>

              {/* Bottom Interactive Car Switcher Pill */}
              <div className="mt-4 flex items-center justify-between w-full max-w-md pt-4 border-t border-border/40">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Unit Unggulan:
                </span>
                
                <div className="inline-flex rounded-full bg-muted/60 p-1 border border-border/60">
                  <button
                    type="button"
                    onClick={() => setSelectedFlagship('porsche')}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      selectedFlagship === 'porsche' 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Porsche 911 Carrera S
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFlagship('amg')}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      selectedFlagship === 'amg' 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Mercedes-AMG GT
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 3. SECTION 2: 3D IMMERSIVE SHOWROOM PRODUCT CAROUSEL (Matching Reference Image "DRIVE YOUR DREAM TODAY") */}
        <ProductStageCarousel 
          currentCabang={currentCabang}
          onLockUnit={(car) => {
            const matchedCar = cars.find(c => c.slug === car.slug) || {
              id: car.id,
              name: car.name,
              brand: car.brand,
              price: car.price,
              priceCredit: car.priceCredit,
              image: car.image,
              slug: car.slug,
              engine: car.engine,
              location: activeBranch ? activeBranch.city : 'Jakarta',
              year: 2023,
              dp: car.dp
            }
            setSelectedBookingCar(matchedCar)
          }}
          onTestDrive={(car) => {
            const matchedCar = cars.find(c => c.slug === car.slug) || {
              id: car.id,
              name: car.name,
              brand: car.brand,
              price: car.price,
              image: car.image,
              slug: car.slug
            }
            setSelectedTestDriveCar(matchedCar)
          }}
        />

        {/* 4. SECTION 3: ASYMMETRICAL BENTO GRID ("Built with Precision") */}
        <section className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                The Benchmark of Quality
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight">
              Built with <span className="font-serif italic font-normal text-muted-foreground">Precision.</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Setiap detail operasional kami didesain untuk menghadirkan rasa tenang mutlak, memadukan keaslian data dengan kepastian legalitas nyata.
            </p>
          </div>

          {/* Asymmetrical Bento Grid: 1 Tall Card Left + 2x2 Squircle Cards Right (Preserved on all screens) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
            
            {/* LEFT TALL SPOTLIGHT CARD (Spans 5 cols on lg) - Reversed Red Luxury Theme */}
            <div className="lg:col-span-5 rounded-2xl sm:rounded-[2.5rem] border border-[#782D43]/50 bg-gradient-to-br from-[#5A2132] via-[#4A1826] to-[#2E0C16] text-white p-4 sm:p-8 lg:p-10 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(90,33,50,0.55)] relative overflow-hidden group">
              {/* Atmospheric subtle radial glow */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-black/40 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 sm:space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-rose-300 animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.28em] text-rose-100">
                      150-Point Audit
                    </span>
                  </div>
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-rose-200" />
                </div>

                <div>
                  <h3 className="font-display text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                    Sertifikasi Inspeksi <br />
                    <span className="font-serif italic font-normal text-rose-200/90">Digital Independen.</span>
                  </h3>
                  <p className="mt-2 sm:mt-3 text-[11px] sm:text-sm text-rose-100/80 leading-relaxed font-normal">
                    Setiap unit melalui pemindaian komputerisasi ECU, pengujian kompresi mesin, verifikasi ketebalan cat panel sasis, dan audit riwayat bengkel resmi.
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
                  <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold text-white/95">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
                    <span>Garansi 100% Bebas Rendaman Banjir</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold text-white/95">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
                    <span>Garansi Bebas Kerusakan Struktur Rangka</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold text-white/95">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
                    <span>Odometer Asli Terverifikasi Buku Servis</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold text-white/95">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
                    <span>Garansi Mesin & Transmisi 1 Tahun Penuh</span>
                  </div>
                </div>
              </div>

              {/* Bottom Visual & Action */}
              <div className="pt-4 sm:pt-8 relative z-10">
                <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/8] sm:aspect-[16/9] border border-white/20 mb-3 sm:mb-6 relative shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1000&q=80" 
                    alt="Engine Inspection" 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                    Sertifikasi Resmi Multi-Point Check
                  </span>
                </div>

                <Link
                  href={`/${currentCabang}/tentang-kami`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-white text-[#5A2132] hover:bg-rose-50 py-2.5 sm:py-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.01]"
                >
                  Pelajari Standar Inspeksi Kami →
                </Link>
              </div>
            </div>

            {/* RIGHT 2x2 SQUIRCLE CARDS (Strictly 2 Columns on Mobile/Tablet/Desktop) */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-2.5 sm:gap-6">
              
              {/* Card 1: Smart Trade-In Suite */}
              <div className="rounded-2xl sm:rounded-[2.2rem] border border-border/70 bg-card p-3 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/40 group">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GitCompareArrows className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider sm:tracking-widest text-primary">
                      Instant Diff
                    </span>
                  </div>
                  <div>
                    <h4 className="font-display text-xs sm:text-xl font-bold text-foreground leading-tight">
                      Smart Trade-In
                    </h4>
                    <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                      Kalkulasi selisih nilai mobil lama ke mobil baru secara transparan dalam 3 langkah.
                    </p>
                  </div>

                  {/* Relevant Visual */}
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/9] border border-border/70 relative shadow-sm">
                    <img 
                      src="/services/trade-in.jpg" 
                      alt="Smart Trade-In Suite" 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 left-2 sm:bottom-2.5 sm:left-3 text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider truncate">
                      Penaksiran Obyektif
                    </span>
                  </div>
                </div>

                <div className="pt-2 sm:pt-4">
                  <Link
                    href={`/${currentCabang}/trade-in`}
                    className="inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold text-primary group-hover:text-primary/80 transition-colors"
                  >
                    Hitung Selisih <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Card 2: VIP Doorstep Concierge Test Drive */}
              <div className="rounded-2xl sm:rounded-[2.2rem] border border-border/70 bg-card p-3 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/40 group">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider sm:tracking-widest text-emerald-600 dark:text-emerald-400">
                      Doorstep
                    </span>
                  </div>
                  <div>
                    <h4 className="font-display text-xs sm:text-xl font-bold text-foreground leading-tight">
                      VIP Test Drive
                    </h4>
                    <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                      Unit idaman diantar langsung ke kediaman atau kantor Anda dengan aman.
                    </p>
                  </div>

                  {/* Relevant Visual */}
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/9] border border-border/70 relative shadow-sm">
                    <img 
                      src="/services/test-drive.jpg" 
                      alt="VIP Test Drive Di Rumah" 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 left-2 sm:bottom-2.5 sm:left-3 text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider truncate">
                      Diantar Ke Rumah
                    </span>
                  </div>
                </div>

                <div className="pt-2 sm:pt-4">
                  <button
                    onClick={() => setSelectedTestDriveCar(spotlightCar)}
                    className="inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold text-primary group-hover:text-primary/80 transition-colors"
                  >
                    Jadwalkan Sesi <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Card 3: Instant Unit Lock (Rp 10 Jt) */}
              <div className="rounded-2xl sm:rounded-[2.2rem] border border-border/70 bg-card p-3 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/40 group">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider sm:tracking-widest text-blue-600 dark:text-blue-400">
                      Refundable
                    </span>
                  </div>
                  <div>
                    <h4 className="font-display text-xs sm:text-xl font-bold text-foreground leading-tight">
                      Kunci Unit Online
                    </h4>
                    <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                      Amankan unit 48 jam. Dana tanda jadi kembali 100% bila unit tidak sesuai.
                    </p>
                  </div>

                  {/* Relevant Visual */}
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/9] border border-border/70 relative shadow-sm">
                    <img 
                      src="/services/kunci-unit.jpg" 
                      alt="Kunci Unit Online" 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 left-2 sm:bottom-2.5 sm:left-3 text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider truncate">
                      Jaminan 100% Refund
                    </span>
                  </div>
                </div>

                <div className="pt-2 sm:pt-4">
                  <button
                    onClick={() => setSelectedBookingCar(spotlightCar)}
                    className="inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold text-primary group-hover:text-primary/80 transition-colors"
                  >
                    Kunci Prioritas <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Card 4: Simulasi Kredit & Approval Instan */}
              <div className="rounded-2xl sm:rounded-[2.2rem] border border-border/70 bg-card p-3 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/40 group">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider sm:tracking-widest text-amber-600 dark:text-amber-400">
                      7+ Leasing
                    </span>
                  </div>
                  <div>
                    <h4 className="font-display text-xs sm:text-xl font-bold text-foreground leading-tight">
                      Kredit Fleksibel
                    </h4>
                    <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                      Bunga kompetitif mulai 2.6% p.a. bekerja sama dengan leasing terkemuka.
                    </p>
                  </div>

                  {/* Relevant Visual */}
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/9] border border-border/70 relative shadow-sm">
                    <img 
                      src="/services/kredit-leasing.jpg" 
                      alt="Kredit Fleksibel & Cepat" 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 left-2 sm:bottom-2.5 sm:left-3 text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider truncate">
                      Approval Cepat
                    </span>
                  </div>
                </div>

                <div className="pt-2 sm:pt-4">
                  <Link
                    href={`/${currentCabang}/simulasi-kredit`}
                    className="inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold text-primary group-hover:text-primary/80 transition-colors"
                  >
                    Simulasi Angsuran <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. SECTION 4: CURATED INVENTORY SHOWCASE (WITH INTEGRATED COMPACT FILTER) */}
        <section id="koleksi" className="space-y-10 pt-2 sm:pt-4">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-border/60 pb-8">
            
            {/* Left: Typography */}
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-primary block mb-2">
                Curated Inventory
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                Koleksi Pilihan <span className="font-serif italic font-normal text-muted-foreground">Eksklusif.</span>
              </h2>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground">
                Setiap unit dalam stok kami telah lolos verifikasi legalitas faktur/BPKB dan uji kelayakan fisik menyeluruh.
              </p>
            </div>

            {/* Right: Integrated Compact Search Filter Suite & Lihat Semua */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              
              {/* Compact Filter Pill (Desktop) */}
              <div className="hidden lg:flex items-center rounded-full border border-border/70 bg-card/85 backdrop-blur-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                
                <select 
                  value={brand} 
                  onChange={e => setBrand(e.target.value)} 
                  className="bg-transparent text-[11px] font-bold pl-4 pr-2 py-2 border-r border-border/50 outline-none w-28 cursor-pointer text-foreground appearance-none"
                >
                  <option value="">Semua Merek</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <input 
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="Cari Model..."
                  className="bg-transparent text-[11px] font-bold px-4 py-2 border-r border-border/50 outline-none w-32 placeholder:text-muted-foreground text-foreground"
                />

                <select 
                  value={maxPrice} 
                  onChange={e => setMaxPrice(e.target.value)} 
                  className="bg-transparent text-[11px] font-bold px-4 py-2 border-r border-border/50 outline-none w-36 cursor-pointer text-foreground appearance-none"
                >
                  <option value="">Budget Maksimal</option>
                  <option value="500000000">Hingga Rp 500 Jt</option>
                  <option value="1000000000">Hingga Rp 1 Miliar</option>
                  <option value="2000000000">Hingga Rp 2 Miliar</option>
                  <option value="3500000000">Hingga Rp 3.5 Miliar</option>
                </select>

                <div className="flex bg-muted/50 rounded-full p-0.5 mx-2">
                  <button onClick={() => setPlateFilter('all')} className={`px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full transition-all ${plateFilter === 'all' ? 'bg-background text-foreground shadow-sm scale-105' : 'text-muted-foreground hover:text-foreground'}`}>Semua</button>
                  <button onClick={() => setPlateFilter('ganjil')} className={`px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full transition-all ${plateFilter === 'ganjil' ? 'bg-primary text-primary-foreground shadow-sm scale-105' : 'text-muted-foreground hover:text-foreground'}`}>Ganjil</button>
                  <button onClick={() => setPlateFilter('genap')} className={`px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full transition-all ${plateFilter === 'genap' ? 'bg-primary text-primary-foreground shadow-sm scale-105' : 'text-muted-foreground hover:text-foreground'}`}>Genap</button>
                </div>

                <button onClick={handleSearch} className="rounded-full bg-primary p-2.5 text-white hover:bg-primary/90 transition-all hover:scale-105 shadow-md shadow-primary/20">
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Mobile Filter Trigger + Lihat Semua Row */}
              <div className="flex lg:hidden w-full items-center gap-2">
                <button 
                  onClick={() => setIsMobileFilterOpen(true)} 
                  className="flex-1 flex items-center justify-between gap-2 rounded-full border border-border bg-card/80 backdrop-blur-md px-3.5 py-2 text-xs font-semibold shadow-sm"
                >
                  <div className="flex items-center gap-2 text-muted-foreground truncate">
                    <Search className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="truncate">Cari Model / Merk...</span>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">Filter</span>
                </button>
                <Link 
                  href={showroomParam ? `/${currentCabang}/mobil?showroom=${showroomParam}` : `/${currentCabang}/mobil`} 
                  className="h-8 flex items-center justify-center gap-1.5 rounded-full bg-foreground text-background px-3 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-foreground/90 whitespace-nowrap shadow-sm flex-shrink-0"
                >
                  <span>Semua ({displayCars.length})</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Desktop Lihat Semua Button */}
              <Link 
                href={showroomParam ? `/${currentCabang}/mobil?showroom=${showroomParam}` : `/${currentCabang}/mobil`} 
                className="hidden lg:flex h-[42px] items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 text-[10px] font-extrabold uppercase tracking-wider transition-all hover:bg-foreground/90 whitespace-nowrap shadow-md"
              >
                <span>Semua ({displayCars.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

            </div>
          </div>
          
          {featuredCars.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5 lg:gap-7 auto-rows-[minmax(280px,auto)] sm:auto-rows-[minmax(420px,auto)]">
              {featuredCars.map((car, i) => {
                // Bento Grid Logic:
                // i = 0: Large Hero (spans 2 cols on mobile and desktop)
                // i = 1, 2, 3, 4, 5: Regular 1x1 (2 columns on mobile e-commerce style!)
                let bentoClass = "col-span-1 lg:col-span-1 lg:row-span-1";
                
                if (i === 0) {
                  bentoClass = "col-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2";
                }

                return (
                  <CarCard 
                    key={`${car.id}-${i}`} 
                    car={car} 
                    index={i} 
                    className={bentoClass}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-[2.5rem] border border-dashed border-border/70 p-8 sm:p-12 text-center bg-card/40 space-y-4">
              <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CarIcon className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold">Stok Showroom Masih Kosong</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Tambahkan mobil dari Portal Admin untuk menampilkan unit di etalase premium ini.
              </p>
              <Link
                href="/admin"
                target="_blank"
                className="inline-flex rounded-full bg-primary px-6 sm:px-8 py-2.5 sm:py-3 text-xs font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
              >
                + Masuk Ke Portal Admin & Upload Mobil
              </Link>
            </div>
          )}
        </section>

        {/* 6. SECTION 5: LUXURY TRUST PILLARS (Why Clients Choose DENKEN) */}
        <section className="rounded-2xl sm:rounded-[3rem] bg-secondary/60 border border-border/70 p-4 sm:p-12 lg:p-16 space-y-6 sm:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-3">
            <span className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-[0.25em] text-primary block">
              The DENKEN Standard
            </span>
            <h2 className="font-display text-xl sm:text-4xl font-black tracking-tight">
              Mengapa Klien Memilih <span className="font-serif italic font-normal text-muted-foreground">DENKEN MOTORS?</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
            {siteConfig.features?.map((feature) => {
              const IconComponent = ICON_MAP[feature.icon] || ShieldCheck
              return (
                <div key={feature.id} className="rounded-2xl sm:rounded-[2rem] border border-border/50 bg-card/60 p-3.5 sm:p-8 transition-all hover:bg-card hover:shadow-xl hover:border-primary/30 text-left space-y-2 sm:space-y-4 group">
                  <div className="flex h-9 w-9 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <EditableIcon contentKey={`feature_icon_${feature.id}`} defaultIconId={feature.icon} className="h-4 w-4 sm:h-7 sm:w-7" />
                  </div>
                  <h3 className="font-display text-xs sm:text-lg font-bold text-foreground line-clamp-1 sm:line-clamp-none">
                    <EditableText contentKey={`feature_title_${feature.id}`} defaultText={feature.title} />
                  </h3>
                  <p className="text-[10px] sm:text-xs leading-relaxed text-muted-foreground line-clamp-3 sm:line-clamp-none">
                    <EditableText contentKey={`feature_desc_${feature.id}`} defaultText={feature.description} multiline />
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* 7. SECTION 6: CLIENT EDITORIAL REVIEWS & TESTIMONIALS */}
        <section id="testimoni" className="space-y-6 sm:space-y-10">
          <div className="flex flex-row items-end justify-between gap-4 border-b border-border/60 pb-4 sm:pb-8">
            <div>
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.28em] text-primary">
                  Real Stories
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-3xl md:text-5xl font-black tracking-tight">
                Pengalaman Klien <span className="font-serif italic font-normal text-muted-foreground">Terhormat Kami.</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary bg-primary/10 px-3 sm:px-5 py-2 sm:py-3 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
              >
                <MessageSquarePlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden xs:inline">Tulis Ulasan</span><span className="xs:hidden">Ulas</span>
              </button>
              
              {branchTestimonials.length > 0 && (
                <div className="flex gap-1.5 sm:gap-2">
                  <button 
                    aria-label="Testimoni sebelumnya" 
                    onClick={() => setSlide((slide + branchTestimonials.length - 1) % branchTestimonials.length)} 
                    className="rounded-full border border-border p-2 sm:p-3 transition-colors hover:bg-muted"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <button 
                    aria-label="Testimoni berikutnya" 
                    onClick={() => setSlide((slide + 1) % branchTestimonials.length)} 
                    className="rounded-full border border-border p-2 sm:p-3 transition-colors hover:bg-muted"
                  >
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {branchTestimonials.length > 0 ? (
            <div className="relative overflow-hidden">
              <motion.div 
                key={slide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl sm:rounded-[2.5rem] bg-card p-5 sm:p-14 border border-border/70 shadow-xl max-w-4xl space-y-4"
              >
                <div className="flex gap-1 text-primary">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${s <= (branchTestimonials[slide]?.rating || 5) ? 'fill-current' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <blockquote className="font-serif italic text-base sm:text-2xl md:text-3xl leading-relaxed text-foreground font-normal">
                  “{branchTestimonials[slide]?.quote || 'Memuat ulasan...'}”
                </blockquote>
                <div className="pt-2 flex items-center gap-3 sm:gap-4">
                  <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm sm:text-lg flex-shrink-0">
                    {branchTestimonials[slide]?.name.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="font-display font-bold text-xs sm:text-base">{branchTestimonials[slide]?.name}</p>
                    <p className="text-[10px] sm:text-xs text-primary font-medium">Pembeli {branchTestimonials[slide]?.car}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-[2rem] border border-dashed border-border p-6 sm:p-10 text-center bg-card/30">
              <p className="text-muted-foreground text-xs sm:text-sm font-medium">Belum ada ulasan untuk showroom ini.</p>
            </div>
          )}
        </section>

        {/* 8. SECTION 7: FINAL LUXURY EDITORIAL CTA BANNER */}
        <section className="relative rounded-2xl sm:rounded-[3rem] overflow-hidden bg-zinc-950 p-6 sm:p-14 lg:p-20 text-white shadow-2xl border border-border/40">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2200&q=80" 
              alt="Luxury Driving" 
              className="h-full w-full object-cover opacity-35" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
            <span className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-[0.25em] sm:tracking-[0.28em] text-primary block">
              Experience Perfection
            </span>
            <h2 className="font-display text-2xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
              Your Journey to <br />
              <span className="font-serif italic font-normal text-white/95">Distinction Begins Here.</span>
            </h2>
            <p className="text-xs sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
              Jadwalkan kunjungan privat ke galeri showroom kami atau konsultasikan kebutuhan tukar tambah Anda bersama spesialis otomotif DENKEN.
            </p>

            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4">
              <Link
                href={`/${currentCabang}/mobil`}
                className="w-full sm:w-auto rounded-full bg-primary px-6 sm:px-8 py-3 sm:py-4 text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-105 text-center"
              >
                Jelajahi Semua Koleksi ({displayCars.length} Unit)
              </Link>
              <Link
                href={`/${currentCabang}/kontak`}
                className="w-full sm:w-auto rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white/20 hover:border-white/40 hover:scale-105 text-center"
              >
                Hubungi VIP Concierge →
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* MODAL 1: BOOKING LOCK UNIT (Rp 10 Jt) */}
      {selectedBookingCar && (
        <BookingModal
          isOpen={!!selectedBookingCar}
          onClose={() => setSelectedBookingCar(null)}
          car={selectedBookingCar}
          currentCabang={currentCabang}
        />
      )}

      {/* MODAL 2: VIP TEST DRIVE SCHEDULER */}
      {selectedTestDriveCar && (
        <TestDriveModal
          isOpen={!!selectedTestDriveCar}
          onClose={() => setSelectedTestDriveCar(null)}
          car={selectedTestDriveCar}
          currentCabang={currentCabang}
        />
      )}

      {/* MODAL 3: 150-POINT CERTIFIED INSPECTION AUDIT */}
      {selectedAuditCar && (
        <InspectionAuditModal
          isOpen={!!selectedAuditCar}
          onClose={() => setSelectedAuditCar(null)}
          car={selectedAuditCar}
        />
      )}

      {/* MODAL 3: SUBMIT REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-5">
          <div className="w-full max-w-lg rounded-[2rem] bg-card p-6 sm:p-8 shadow-2xl relative border border-border animate-in zoom-in-95">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-2xl font-bold mb-1">Tulis Ulasan Klien</h3>
            <p className="text-xs text-muted-foreground mb-6">Bagikan kepuasan dan pengalaman bertransaksi di DENKEN MOTORS.</p>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-2 text-muted-foreground">Rating</label>
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
                      <Star className={`h-7 w-7 ${star <= (hoverRating || reviewForm.rating) ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-2 text-muted-foreground">Nama Anda</label>
                  <input required type="text" value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} className="w-full rounded-xl border border-border bg-muted/50 p-3 text-xs outline-none focus:border-primary" placeholder="Nama Lengkap" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-2 text-muted-foreground">Model Kendaraan</label>
                  <input required type="text" value={reviewForm.car} onChange={e => setReviewForm({...reviewForm, car: e.target.value})} className="w-full rounded-xl border border-border bg-muted/50 p-3 text-xs outline-none focus:border-primary" placeholder="Contoh: Porsche Macan" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-2 text-muted-foreground">Komentar & Pengalaman</label>
                <textarea required value={reviewForm.quote} onChange={e => setReviewForm({...reviewForm, quote: e.target.value})} className="w-full min-h-[90px] rounded-xl border border-border bg-muted/50 p-3 text-xs outline-none focus:border-primary resize-none" placeholder="Ceritakan kepuasan Anda bersama tim DENKEN..."></textarea>
              </div>
              <button type="submit" className="w-full rounded-full bg-primary py-3.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-[1.02] mt-3">
                Publikasikan Ulasan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE SEARCH MODAL */}
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
              className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-[2.5rem] bg-background p-6 pb-safe border-t border-border shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">Filter Pencarian</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="rounded-full bg-muted p-2"><X className="h-4 w-4" /></button>
              </div>
              
              <div className="flex flex-col gap-3 mt-1">
                <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full appearance-none rounded-xl bg-muted/60 px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Pilih Merek</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <input 
                  type="text" 
                  value={model} 
                  onChange={e => setModel(e.target.value)} 
                  placeholder="Model / Seri Mobil..." 
                  className="w-full rounded-xl bg-muted/60 px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/50"
                />

                <select value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full appearance-none rounded-xl bg-muted/60 px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Budget Maksimal</option>
                  <option value="500000000">Hingga Rp 500 Jt</option>
                  <option value="1000000000">Hingga Rp 1 Miliar</option>
                  <option value="2000000000">Hingga Rp 2 Miliar</option>
                </select>
              </div>

              <button 
                onClick={() => {
                  setIsMobileFilterOpen(false)
                  handleSearch()
                }} 
                className="mt-3 w-full rounded-full bg-primary py-3.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                Tampilkan Hasil Pencarian
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HomeClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <div className="h-8 w-40 bg-primary/20 rounded-full animate-pulse"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
