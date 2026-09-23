"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowRight, Calculator, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Car } from '@/data/cars'
import { motion } from 'framer-motion'

const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

export function CarCard({ car, index = 0, className = "" }: { car: Car; index?: number; className?: string }) {
  const params = useParams()
  const currentCabang = (params?.cabang as string) || 'jakarta'
  const gallery = car.gallery && car.gallery.length > 0 ? car.gallery : [car.image]
  const [activeImgIdx, setActiveImgIdx] = useState(0)

  const handleNextImg = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveImgIdx((prev) => (prev + 1) % gallery.length)
  }

  const handlePrevImg = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveImgIdx((prev) => (prev - 1 + gallery.length) % gallery.length)
  }

  return (
    <motion.article 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[2rem] bg-black shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col min-h-[290px] sm:min-h-[350px] lg:min-h-[390px] w-full border border-white/10 ${className}`}
    >
      {/* FULL BACKGROUND IMAGE */}
      <img
        src={gallery[activeImgIdx] || car.image}
        alt={car.name}
        loading={index < 2 ? "eager" : "lazy"}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.onerror = null
          target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85'
        }}
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 group-hover:scale-110"
      />
      
      {/* HIGH CONTRAST GRADIENT OVERLAY (Starts lower) */}
      <div className="absolute inset-x-0 bottom-0 top-[15%] bg-gradient-to-t from-black via-black/85 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* TOP CONTROLS (Badges & Calculator) */}
      <div className="relative z-10 flex items-start justify-between p-2 sm:p-4 lg:p-5">
        <div>
          {(car.isSoldOut || car.badge === 'SOLD OUT') ? (
            <span className="rounded-full bg-rose-600 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 text-[7px] sm:text-[9px] font-black tracking-[0.15em] text-white shadow-xl">
              SOLD OUT
            </span>
          ) : car.badge ? (
            <span className="rounded-full bg-primary/90 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 text-[7px] sm:text-[9px] font-black tracking-[0.15em] text-primary-foreground shadow-lg">
              {car.badge}
            </span>
          ) : null}
        </div>
        
        {!car.isSoldOut && car.badge !== 'SOLD OUT' && (
          <Link
            href={`/${currentCabang}/simulasi-kredit?carId=${car.id}`}
            title="Hitung Simulasi Kredit"
            className="rounded-full bg-white/10 p-1 sm:p-2 backdrop-blur-md transition-all hover:bg-white hover:text-black hover:scale-110 shadow-lg text-white border border-white/20"
          >
            <Calculator className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>
        )}
      </div>

      {/* MULTI-PHOTO CONTROLS (Hover State) */}
      {gallery.length > 1 && (
        <div className="absolute top-1/2 left-2 right-2 sm:left-4 sm:right-4 flex items-center justify-between z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-1/2">
          <button onClick={handlePrevImg} className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-primary transition-all pointer-events-auto border border-white/20 hover:scale-110">
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
          <button onClick={handleNextImg} className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-primary transition-all pointer-events-auto border border-white/20 hover:scale-110">
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      )}

      {/* BOTTOM CONTENT (Information over Image) */}
      <div className="relative z-10 flex flex-col flex-1 justify-end p-2.5 sm:p-4 lg:p-5 mt-auto text-white">
        
        {/* Dealership Vital Badges */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap mb-1.5 sm:mb-2.5">
          <span className="rounded bg-white/20 backdrop-blur-sm px-1 sm:px-1.5 py-0.5 text-[7px] sm:text-[8px] font-bold text-white border border-white/20">
            {car.plateNumber || 'Plat B'}
          </span>
          <span className="rounded bg-emerald-500/20 backdrop-blur-sm px-1 sm:px-1.5 py-0.5 text-[7px] sm:text-[8px] font-bold text-emerald-300 border border-emerald-500/30">
            {car.taxDate ? `Pajak: ${car.taxDate}` : 'Pajak Hidup'}
          </span>
          <span className="hidden sm:inline-block rounded bg-blue-500/20 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-bold text-blue-300 border border-blue-500/30">
            Bebas Banjir
          </span>
        </div>

        <div className="mb-1.5 sm:mb-2.5">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap mb-0.5">
            <span className="text-[7px] sm:text-[8px] font-extrabold uppercase tracking-widest text-white/80">
              {car.year} • {car.transmission}
            </span>
          </div>
          <Link href={`/${currentCabang}/mobil/${car.slug}`}>
            <h3 className="font-display text-xs sm:text-sm lg:text-base font-black tracking-tight text-white transition-colors line-clamp-2 drop-shadow-md hover:underline decoration-white/30 underline-offset-2">
              {car.name}
            </h3>
          </Link>
          <p className="text-[9px] sm:text-[11px] font-medium text-white/70 mt-0.5 drop-shadow-sm flex items-center gap-1">
            <span>{car.mileage.toLocaleString('id-ID')} KM</span>
            <span className="h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-white/40"></span>
            <span className="truncate">{car.engine}</span>
          </p>
        </div>
        
        {/* Pricing Section (High Contrast) */}
        <div className="border-t border-white/20 pt-1.5 sm:pt-2.5 flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <div>
              <span className="inline-block rounded bg-primary/20 backdrop-blur-sm px-1 py-0.2 text-[6px] sm:text-[7px] font-extrabold text-primary-foreground mb-0.5 border border-primary/30 tracking-wider">
                KREDIT
              </span>
              <p className="font-display text-xs sm:text-base lg:text-lg font-black text-white drop-shadow-lg leading-tight tracking-tight">
                {formatIDR(car.priceCredit || Math.round(car.price * 0.95))}
              </p>
            </div>
            
            <div className="text-right shrink-0">
              <span className="text-[6px] sm:text-[7px] font-bold text-white/60 block mb-0.5 tracking-wider uppercase">
                Cash OTR
              </span>
              <p className="text-[7px] sm:text-[9px] font-bold text-white/50 line-through">
                {formatIDR(car.price)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1">
            <span className="text-[8px] sm:text-[10px] text-white/80 font-medium truncate">
              DP <strong className="text-white font-bold">{formatIDR(car.dp)}</strong>
            </span>
            <Link 
              href={`/${currentCabang}/mobil/${car.slug}`} 
              className="inline-flex items-center gap-1 rounded-full bg-white text-black px-2 sm:px-3.5 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all shadow-xl shrink-0"
            >
              Lihat <ArrowRight className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
            </Link>
          </div>
        </div>

      </div>
      
      {/* Overlay Sold Out (if applies) */}
      {(car.isSoldOut || car.badge === 'SOLD OUT') && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-30 pointer-events-none">
          <span className="rounded-xl border border-rose-500/40 bg-black/80 backdrop-blur-xl px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-black tracking-widest text-rose-500 shadow-2xl">
            UNIT TERJUAL
          </span>
        </div>
      )}
    </motion.article>
  )
}
