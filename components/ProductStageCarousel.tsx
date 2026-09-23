"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, 
  ArrowRight, Gauge, Zap, Sparkles, Lock, Calendar, Star, Info
} from 'lucide-react'

export interface CarouselCar {
  id: string
  name: string
  brand: string
  type: string
  price: number
  priceCredit: number
  dp: number
  color: string
  engine: string
  hp: string
  accel: string
  image: string
  slug: string
  plate: string
  tax: string
  hotspots: {
    id: string
    top: string // percentage string e.g. "35%"
    left: string // percentage string e.g. "40%"
    label: string
    detail: string
  }[]
}

const SHOWCASE_CARS: CarouselCar[] = [
  {
    id: 'bmw-m4',
    name: 'BMW M4 Competition Coupe',
    brand: 'BMW',
    type: 'High-Performance Coupe',
    price: 2650000000,
    priceCredit: 2490000000,
    dp: 490000000,
    color: 'Isle of Man Red Metallic',
    engine: '3.0L S58 M TwinPower Turbo',
    hp: '510 HP',
    accel: '3.5s (0-100)',
    image: '/cars/carousel-bmw-m4.png',
    slug: 'bmw-m4-competition',
    plate: 'Plat B Ganjil',
    tax: 'Pajak Hidup 08/2027',
    hotspots: [
      {
        id: 'bmw-windshield',
        top: '25%',
        left: '42%',
        label: 'Sensotec ADAS Radar 360°',
        detail: 'Kamera pemindai jalur & pengereman darurat aktif'
      },
      {
        id: 'bmw-grille',
        top: '52%',
        left: '50%',
        label: 'S58 M TwinPower Turbo Engine',
        detail: '510 HP • 650 Nm • 100% Lolos Kompresi Silinder'
      },
      {
        id: 'bmw-aero',
        top: '68%',
        left: '70%',
        label: 'M Carbon Aero Splitter Original',
        detail: 'Serat karbon murni OEM pabrik, tanpa rekondisi'
      }
    ]
  },
  {
    id: 'audi-rsq8',
    name: 'Audi RS Q8 Performance',
    brand: 'Audi',
    type: 'Flagship Luxury Super SUV',
    price: 3450000000,
    priceCredit: 3280000000,
    dp: 650000000,
    color: 'Mythos Black Metallic',
    engine: '4.0L V8 Twin-Turbocharged',
    hp: '600 HP',
    accel: '3.8s (0-100)',
    image: '/cars/carousel-audi-rsq8.png',
    slug: 'audi-rs-q8',
    plate: 'Plat B Genap',
    tax: 'Pajak Hidup 11/2027',
    hotspots: [
      {
        id: 'audi-lights',
        top: '40%',
        left: '28%',
        label: 'HD Matrix LED Laser Lights',
        detail: 'Teknologi sorot otomatis 600 meter tanpa silau'
      },
      {
        id: 'audi-engine',
        top: '52%',
        left: '50%',
        label: 'Handcrafted V8 800 Nm Torque',
        detail: 'Inspeksi transmisi Tiptronic 8-Speed 100% prima'
      },
      {
        id: 'audi-chassis',
        top: '72%',
        left: '74%',
        label: 'Quattro Sport Differential',
        detail: 'Sistem gerak 4 roda cerdas dengan suspensi udara adaptif'
      }
    ]
  },
  {
    id: 'amg-gt',
    name: 'Mercedes-AMG GT S Coupe',
    brand: 'Mercedes-AMG',
    type: 'Biturbo Grand Tourer',
    price: 3150000000,
    priceCredit: 2980000000,
    dp: 590000000,
    color: 'Iridium Silver Metallic',
    engine: '4.0L V8 Biturbo Handcrafted',
    hp: '522 HP',
    accel: '3.7s (0-100)',
    image: '/cars/carousel-amg-gt.png',
    slug: 'mercedes-amg-gt',
    plate: 'Plat B Ganjil',
    tax: 'Pajak Hidup 10/2027',
    hotspots: [
      {
        id: 'amg-grille',
        top: '46%',
        left: '32%',
        label: 'Panamericana AMG Front Grille',
        detail: 'Desain grille aero agresif khas Affalterbach 100% orisinil'
      },
      {
        id: 'amg-engine',
        top: '52%',
        left: '52%',
        label: 'Handcrafted M178 V8 Engine',
        detail: '522 HP • "One Man, One Engine" signed plate terverifikasi'
      },
      {
        id: 'amg-exhaust',
        top: '68%',
        left: '70%',
        label: 'AMG Performance Exhaust System',
        detail: 'Knalpot katup aktif orisinil dengan kontrol tombol kabin'
      }
    ]
  }
]

const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

interface ProductStageCarouselProps {
  currentCabang: string
  onLockUnit: (car: any) => void
  onTestDrive: (car: any) => void
}

export function ProductStageCarousel({ currentCabang, onLockUnit, onTestDrive }: ProductStageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)

  const currentCar = SHOWCASE_CARS[activeIndex]
  const totalCars = SHOWCASE_CARS.length

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalCars) % totalCars)
    setActiveHotspot(null)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalCars)
    setActiveHotspot(null)
  }

  const getCarAtOffset = (offset: number) => {
    const idx = (activeIndex + offset + totalCars) % totalCars
    return { car: SHOWCASE_CARS[idx], index: idx }
  }

  const leftCar = getCarAtOffset(-1)
  const rightCar = getCarAtOffset(1)

  return (
    <section className="relative rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden border border-border/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] py-14 sm:py-20 my-4 sm:my-8">
      {/* 50% Red Left & 50% White Right Split Background */}
      <div className="absolute inset-0 flex pointer-events-none z-0">
        {/* Left 50% Red */}
        <div className="w-1/2 h-full bg-gradient-to-br from-[#5A2132] via-[#481624] to-[#2E0C16] relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-black/40 rounded-full blur-3xl pointer-events-none" />
        </div>
        {/* Right 50% White */}
        <div className="w-1/2 h-full bg-[#FAF8F8] dark:bg-[#140A0D] relative overflow-hidden border-l border-white/10 dark:border-white/5">
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-black/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* Subtle Center Seam Divider Line */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header (Floating Frosted Luxury Pavilion Centered Across 50/50 Split) */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-14 p-6 sm:p-8 rounded-[2rem] bg-white/85 dark:bg-card/85 backdrop-blur-2xl border border-border/60 shadow-[0_15px_45px_rgba(0,0,0,0.1)]">
          <div className="inline-flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">
              Tested Auto Dealership • 150-Point Certified
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] uppercase text-foreground">
            DRIVE YOUR{' '}
            <span className="text-primary font-serif italic font-normal lowercase">
              dream
            </span>{' '}
            TODAY
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Atelier otomotif terpercaya di Indonesia. Transaksi transparan, jaminan integritas sasis bebas tabrakan & banjir, serta opsi pembiayaan fleksibel untuk setiap klien.
          </p>
        </div>

        {/* 3D Interactive Showroom Stage */}
        <div className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-[580px] flex items-center justify-center select-none w-full max-w-6xl mx-auto">
          
          {/* Stage Navigation Arrows (Themed for Left-Red & Right-White) */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-0 sm:left-4 lg:left-12 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-[#5A2132] hover:border-white shadow-xl transition-all hover:scale-110 active:scale-95"
            aria-label="Previous Car"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-0 sm:right-4 lg:right-12 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-white/95 text-foreground backdrop-blur-md hover:bg-[#5A2132] hover:text-white hover:border-[#5A2132] shadow-xl transition-all hover:scale-110 active:scale-95"
            aria-label="Next Car"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Seamless 3D Car Mapping */}
          {SHOWCASE_CARS.map((car, index) => {
            // Calculate relative offset
            let offset = index - activeIndex
            if (offset < -1 && offset + totalCars <= 1) offset += totalCars
            if (offset > 1 && offset - totalCars >= -1) offset -= totalCars

            const isCenter = offset === 0
            const isLeft = offset === -1
            const isRight = offset === 1
            const isVisible = Math.abs(offset) <= 1

            // Dynamic 3D depth styles based on relative offset
            const scale = isCenter ? 1 : 0.72
            const opacity = isCenter ? 1 : (isVisible ? 0.35 : 0)
            const zIndex = isCenter ? 30 : (isVisible ? 10 : 0)
            const x = isCenter ? '0%' : (isLeft ? '-40%' : (isRight ? '40%' : '0%'))
            const y = isCenter ? '0px' : '-25px' // Center is pushed forward/down

            return (
              <motion.div
                key={car.id}
                className="absolute w-[75%] sm:w-[65%] lg:w-[50%] max-w-[640px] flex flex-col items-center cursor-pointer"
                style={{ originX: 0.5, originY: 0.5 }}
                animate={{
                  scale,
                  opacity,
                  zIndex,
                  x,
                  y,
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.2, 0.8, 0.2, 1] // Super smooth spring-like ease without overshoot
                }}
                onClick={() => {
                  if (!isCenter) {
                    setActiveIndex(index)
                    setActiveHotspot(null)
                  }
                }}
              >
                <div className="relative w-full flex items-center justify-center">

                  {/* Soft Ground Contact Shadow (Visible only on Center) */}
                  <div className={`absolute -bottom-3 sm:-bottom-5 inset-x-8 sm:inset-x-12 h-8 sm:h-10 bg-black/40 dark:bg-black/90 blur-2xl sm:blur-3xl rounded-[100%] pointer-events-none z-0 transition-opacity duration-700 ${isCenter ? 'opacity-100' : 'opacity-0'}`} />

                  {/* Main Car Image with Framer Motion Breathing / Floating ONLY when centered */}
                  <motion.img 
                    animate={isCenter ? { y: [0, -6, 0] } : { y: 0 }}
                    transition={isCenter ? { duration: 5, ease: "easeInOut", repeat: Infinity } : {}}
                    src={car.image} 
                    alt={car.name}
                    className={`relative z-10 w-full object-contain transition-all duration-700 select-none ${isCenter ? 'drop-shadow-[0_20px_35px_rgba(0,0,0,0.22)] dark:drop-shadow-[0_25px_45px_rgba(0,0,0,0.7)]' : 'filter grayscale-[25%] blur-[0.8px] hover:filter-none hover:scale-105'}`}
                  />

                  {/* INTERACTIVE INSPECTION HOTSPOT MARKERS */}
                  {isCenter && car.hotspots.map((hotspot) => {
                    const isOpen = activeHotspot === hotspot.id
                    return (
                      <div
                        key={hotspot.id}
                        style={{ top: hotspot.top, left: hotspot.left }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-40"
                      >
                        <div className="relative group/spot">
                          {/* Pulsing Target Marker */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHotspot(isOpen ? null : hotspot.id)
                            }}
                            className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-125 focus:outline-none"
                            title={hotspot.label}
                          >
                            <span className="absolute h-full w-full rounded-full bg-primary/40 animate-ping" />
                            <span className="h-2 w-2 rounded-full bg-white" />
                          </button>

                          {/* Expanded Inspection Tooltip Callout Card */}
                          <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 sm:w-60 rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/80 p-3 shadow-2xl transition-all duration-300 pointer-events-auto ${
                            isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible group-hover/spot:opacity-100 group-hover/spot:scale-100 group-hover/spot:visible'
                          }`}>
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary mb-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Audit Terverifikasi</span>
                            </div>
                            <p className="text-xs font-bold text-foreground leading-snug">
                              {hotspot.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                              {hotspot.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* FLOATING PRODUCT INFO CARD & CONTROLS (Below Center Car, Matching Reference Image) */}
        <div className="mt-5 sm:mt-7 w-full max-w-xl mx-auto px-4">
          <motion.div 
            key={currentCar.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-border/70 bg-white/95 dark:bg-card/90 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-40"
          >
            {/* Car Spec & Price Title */}
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  {currentCar.brand}
                </span>
                <span className="text-[10px] text-muted-foreground">• {currentCar.hp}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">150-Point Grade A+</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-black text-foreground">
                {currentCar.name}
              </h3>
              <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-2 whitespace-nowrap">
                <span className="font-display text-xl sm:text-2xl font-black text-foreground">
                  {formatIDR(currentCar.priceCredit)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  (Cash: {formatIDR(currentCar.price)})
                </span>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Link
                href={`/${currentCabang}/mobil/${currentCar.slug}`}
                className="flex-1 sm:flex-initial rounded-full border border-border bg-background hover:bg-muted px-4 py-2.5 text-xs font-bold text-foreground transition-all text-center whitespace-nowrap"
              >
                Detail
              </Link>

              <button
                onClick={() => onLockUnit(currentCar)}
                className="flex-1 sm:flex-initial rounded-full bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-105 text-center whitespace-nowrap"
              >
                Kunci Unit
              </button>
            </div>
          </motion.div>
        </div>

        {/* DOT INDICATORS (Cleaned up navigation below) */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 bg-white/90 dark:bg-card/90 backdrop-blur-md px-4 py-2 rounded-full border border-border/60 shadow-sm">
            {SHOWCASE_CARS.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Pilih ${c.name}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === i ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM WHY CHOOSE PILLARS (Themed for Left-Red & Right-White Split) */}
        <div className="mt-16 pt-12 border-t border-white/15 dark:border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <h3 className="font-display text-2xl sm:text-3xl font-black tracking-tight">
              <span className="text-white drop-shadow-sm">Why Choose </span>
              <span className="text-[#E5B882]">DENKEN</span>
              <span className="text-[#2A171B] dark:text-[#FAF8F8]">?</span>
            </h3>
            <p className="text-xs sm:text-sm text-foreground/80 bg-white/80 dark:bg-card/80 backdrop-blur-md py-1.5 px-4 rounded-full inline-block border border-border/50 shadow-sm">
              Kami bukan sekadar menjual mobil; kami membangun rasa aman dan hubungan kepemilikan berkelas jangka panjang.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Left Red Side */}
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 space-y-2 hover:bg-white/15 transition-all text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-rose-200 mb-2">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h4 className="font-display text-sm font-bold text-white">One Price. No Haggle.</h4>
              <p className="text-xs text-rose-100/80">Harga transparan tanpa biaya tersembunyi atau mark-up tidak wajar.</p>
            </div>

            {/* Card 2: Left Red Side */}
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 space-y-2 hover:bg-white/15 transition-all text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-rose-200 mb-2">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="font-display text-sm font-bold text-white">Bunga Rendah 2.6%</h4>
              <p className="text-xs text-rose-100/80">Bekerja sama dengan 7 leasing resmi terkemuka di Indonesia.</p>
            </div>

            {/* Card 3: Right White Side */}
            <div className="rounded-2xl border border-border/70 bg-white dark:bg-card/90 p-5 space-y-2 hover:border-primary/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-display text-sm font-bold text-foreground">150 Titik Garansi</h4>
              <p className="text-xs text-muted-foreground">Garansi 1 tahun mesin & transmisi serta sertifikasi 100% bebas banjir.</p>
            </div>

            {/* Card 4: Right White Side */}
            <div className="rounded-2xl border border-border/70 bg-white dark:bg-card/90 p-5 space-y-2 hover:border-primary/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="font-display text-sm font-bold text-foreground">Kunci Unit Rp 10 Jt</h4>
              <p className="text-xs text-muted-foreground">Jaminan 100% uang kembali jika unit tidak sesuai laporan inspeksi.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
