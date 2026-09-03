"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calculator, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Car } from '@/data/cars'
import { motion } from 'framer-motion'

const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

export function CarCard({ car, index = 0 }: { car: Car; index?: number }) {
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
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/30 flex flex-col h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={gallery[activeImgIdx] || car.image}
          alt={car.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.onerror = null
            target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85'
          }}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-60" />
        
        {(car.isSoldOut || car.badge === 'SOLD OUT') ? (
          <>
            <span className="absolute left-4 top-4 rounded-full bg-rose-600 backdrop-blur-md px-4 py-1.5 text-[10px] font-extrabold tracking-[0.2em] text-white shadow-xl z-20">
              SOLD OUT
            </span>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="rounded-xl border border-white/30 bg-black/70 backdrop-blur-md px-4 py-2 text-xs font-black tracking-widest text-rose-400 shadow-2xl">
                UNIT TERJUAL
              </span>
            </div>
          </>
        ) : car.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-primary/95 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-primary-foreground shadow-lg z-10">
            {car.badge}
          </span>
        )}

        {/* Multi-Photo Counter Badge & Slide Controls */}
        {gallery.length > 1 && (
          <div className="absolute left-4 right-4 bottom-3 flex items-center justify-between z-20 pointer-events-none">
            <span className="rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white shadow-md">
              {activeImgIdx + 1} / {gallery.length} Foto
            </span>
            <div className="flex items-center gap-1.5 pointer-events-auto opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handlePrevImg}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md hover:bg-primary transition-all shadow-md hover:scale-110"
                title="Foto Sebelumnya"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleNextImg}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md hover:bg-primary transition-all shadow-md hover:scale-110"
                title="Foto Selanjutnya"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
        
        <div className="absolute right-4 top-4 flex flex-col gap-2 z-20">
          <Link
            href={`/simulasi-kredit?carId=${car.id}`}
            title="Hitung Simulasi Kredit"
            className="rounded-full bg-background/80 p-2.5 backdrop-blur-md transition-all hover:bg-background hover:scale-110 shadow-lg text-foreground hover:text-primary"
          >
            <Calculator className="h-4 w-4" />
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 p-6 space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">{car.year} • {car.transmission} • {car.fuel}</p>
          <Link href={`/mobil/${car.slug}`}>
            <h3 className="font-display text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{car.name}</h3>
          </Link>
        </div>
        
        <p className="text-sm font-medium text-muted-foreground flex-1">{car.mileage.toLocaleString('id-ID')} KM • {car.engine}</p>
        
        <div className="flex items-end justify-between border-t border-border/50 pt-5 mt-auto">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Harga Cash</p>
            <p className="font-display text-lg font-extrabold">{formatIDR(car.price)}</p>
          </div>
          <Link href={`/mobil/${car.slug}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
