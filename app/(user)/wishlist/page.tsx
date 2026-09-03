"use client"

import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { CarCard } from '@/components/CarCard'

export default function WishlistPage() {
  const wishlistIds = useStore((state) => state.wishlist)
  const cars = useStore((state) => state.cars)

  const favoriteCars = cars.filter((car) => wishlistIds.includes(car.id))

  return (
    <div className="pt-24 pb-24 min-h-screen bg-secondary/30">
      {/* Theme Responsive Header */}
      <div className="bg-card border-b border-border/60 py-16 text-foreground relative overflow-hidden mb-12 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Heart className="h-7 w-7 fill-primary" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight">Wishlist Mobil Impian</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base">
            Koleksi mobil favorit yang telah Anda simpan. Konsultasikan atau segera ajukan pembiayaan.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {favoriteCars.length > 0 ? (
          <div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
              <p className="font-semibold text-muted-foreground">
                Menampilkan <strong className="text-foreground">{favoriteCars.length}</strong> mobil favorit Anda
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteCars.map((car, i) => (
                <CarCard key={car.id} car={car} index={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 py-24 px-6 text-center bg-card/60 shadow-sm max-w-2xl mx-auto">
            <div className="rounded-full bg-primary/10 p-6 mb-6 text-primary">
              <Heart className="h-12 w-12" />
            </div>
            <h2 className="font-display text-2xl font-bold">Wishlist Anda Masih Kosong</h2>
            <p className="mt-3 text-muted-foreground max-w-md text-sm leading-relaxed">
              Anda belum menyimpan mobil ke dalam favorit. Jelajahi katalog kendaraan kami dan tekan ikon hati untuk menyimpan mobil impian Anda.
            </p>
            <Link
              href="/mobil"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105"
            >
              Jelajahi Katalog Mobil <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
