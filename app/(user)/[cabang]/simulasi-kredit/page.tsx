"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Calculator,
  ArrowRight,
  ShieldCheck,
  Percent,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle2,
  Building2,
  Shield,
  FileCheck
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useStore } from '@/store/useStore'

const formatIDR = (n: number) => `Rp\u00A0${Math.round(n).toLocaleString('id-ID')}`

const formatDots = (n?: number | string | null) => {
  if (n === undefined || n === null || n === '') return ''
  const num = typeof n === 'number' ? n : parseInt(n.toString().replace(/\D/g, ''), 10)
  return isNaN(num) ? '' : num.toLocaleString('id-ID')
}

const parseDots = (s: string) => {
  const cleaned = s.replace(/\D/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

function SimulationContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const cars = useStore((state) => state.cars)
  const branches = useStore((state) => state.branches)
  const currentCabang = (params.cabang as string) || 'jakarta'

  const queryCarId = searchParams.get('carId')
  const showroomParam = searchParams.get('showroom')

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const activeBranch = branches.find(b => (b.slug || b.city.toLowerCase().replace(/\s+/g, '-')) === currentCabang) || branches[0]
  
  const activeOwnerId = showroomParam || (activeBranch ? activeBranch.ownerId : null)
  let displayCars = cars.filter((car) => car.ownerId === activeOwnerId)
  
  if (activeBranch) {
    displayCars = displayCars.filter(car => {
      const isBranchMatch = car.branchId === activeBranch.id;
      const isCityMatch = car.location.toLowerCase().includes(activeBranch.city.toLowerCase());
      const isNameMatch = car.location.toLowerCase().includes(activeBranch.name.toLowerCase());
      return isBranchMatch || isCityMatch || isNameMatch;
    })
  }

  // Selected Car state
  const [selectedCarId, setSelectedCarId] = useState<string>('')
  
  // Financial Inputs
  const [price, setPrice] = useState<number>(620000000)
  const [dpPercent, setDpPercent] = useState<number>(20)
  const [tenor, setTenor] = useState<number>(5)
  const [paymentType, setPaymentType] = useState<'ADDM' | 'ADDB'>('ADDB')
  const [insuranceType, setInsuranceType] = useState<'All Risk' | 'Kombinasi' | 'TLO'>('All Risk')
  const [showAmortization, setShowAmortization] = useState(false)

  // Handle URL query carId pre-fill and default selection
  useEffect(() => {
    if (!mounted) return

    let foundCar = null
    if (queryCarId) {
      foundCar = displayCars.find((c) => c.id === queryCarId || c.slug === queryCarId)
    }

    if (!foundCar && !selectedCarId && displayCars.length > 0) {
      foundCar = displayCars[0]
    }

    if (foundCar && (!selectedCarId || queryCarId)) {
      setSelectedCarId(foundCar.id)
      setPrice(foundCar.price)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, queryCarId, cars, activeOwnerId])

  const selectedCar = displayCars.find((c) => c.id === selectedCarId)

  // Sync price if car changes
  const handleCarSelect = (id: string) => {
    setSelectedCarId(id)
    const car = displayCars.find((c) => c.id === id)
    if (car) {
      setPrice(car.price)
    }
  }

  // Tiered Interest Rates by Tenor
  const interestRates: Record<number, number> = {
    1: 0.0325, // 3.25%
    2: 0.035,  // 3.50%
    3: 0.0375, // 3.75%
    4: 0.0425, // 4.25%
    5: 0.0475, // 4.75%
  }

  const annualRate = interestRates[tenor] || 0.0475

  // Financial Calculations
  const dpAmount = (price * dpPercent) / 100
  const loanPrincipal = Math.max(0, price - dpAmount)
  const totalInterest = loanPrincipal * annualRate * tenor
  const totalLoanWithInterest = loanPrincipal + totalInterest
  const monthlyPayment = totalLoanWithInterest / (tenor * 12)

  // Estimated Fees & Insurance
  const adminFee = 2500000
  const insuranceRateMap = { 'All Risk': 0.025, 'Kombinasi': 0.018, 'TLO': 0.008 }
  const insuranceFee = price * insuranceRateMap[insuranceType]

  // Total DP Pertama (TDP)
  const firstPayment = paymentType === 'ADDM' ? monthlyPayment : 0
  const totalFirstDp = dpAmount + adminFee + insuranceFee + firstPayment

  // Amortization Schedule per year
  const amortizationSchedule = Array.from({ length: tenor }, (_, i) => {
    const year = i + 1
    const principalPaidPerYear = loanPrincipal / tenor
    const interestPaidPerYear = loanPrincipal * annualRate
    const remainingBalance = Math.max(0, loanPrincipal - principalPaidPerYear * year)
    return {
      year,
      principalPaid: principalPaidPerYear,
      interestPaid: interestPaidPerYear,
      totalPaid: principalPaidPerYear + interestPaidPerYear,
      remainingBalance,
    }
  })

  return (
    <div className="mobile-page-shell">
      {/* 1. HERO SECTION */}
      <section className="bg-card border-b border-border/60 py-7 sm:py-24 text-foreground relative overflow-hidden mb-5 sm:mb-12 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-black/5 dark:bg-black/40 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative mx-auto w-full max-w-[1536px] px-4 sm:px-10 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.28em] text-primary">
              Executive Financial Suite
            </span>
          </div>

          <h1 className="mobile-hero-title max-w-4xl mx-auto">
            Skema Pembiayaan <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-foreground/80">
              TERKURASI & FLEKSIBEL,
            </span>{' '}
            <span className="font-serif italic font-normal text-muted-foreground sm:block">
              khusus portofolio Anda.
            </span>
          </h1>

          <p className="mt-2 sm:mt-4 text-muted-foreground max-w-2xl mx-auto text-[11px] sm:text-lg leading-relaxed font-normal">
            Hitung estimasi skema kredit secara akurat dengan suku bunga khusus mitra leasing premier perbankan terkemuka DENKEN MOTORS mulai dari tenor 1 hingga 5 tahun.
          </p>

          <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-[9px] sm:text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary" /> Suku Bunga Spesial Mulai 2.6% p.a.
            </span>
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary" /> Kemitraan 7+ Lembaga Finansial
            </span>
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary" /> Persetujuan Cepat & Administrasi Dibantu
            </span>
          </div>
        </div>
      </section>

      {/* OUTER WORKSPACE WRAPPER (Standardized with Navbar max-w-[1536px] px-6 sm:px-10 lg:px-16) */}
      <div className="mobile-container space-y-5 sm:space-y-12">
        {/* Contextual Visual Card Above Car Selector */}
        <div className="rounded-2xl sm:rounded-[2.2rem] border border-border/70 bg-card overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="md:col-span-7 p-4 sm:p-10 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Fasilitas Kredit Eksekutif</span>
            </div>
            <h3 className="font-display text-lg sm:text-2xl font-black text-foreground leading-snug">
              Solusi Finansial Fleksibel dengan Pendampingan Konsultan Privat
            </h3>
            <p className="text-[9px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">
              Kami mengerti fleksibilitas arus kas Anda adalah prioritas. Tim konsultan pembiayaan DENKEN siap memformulasikan opsi kombinasi DP rendah, angsuran berjenjang (step-up), maupun paket bunga tetap (fixed rate) hingga pelunasan unit.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 text-[9px] sm:text-[11px] font-bold text-foreground">
              <span className="flex items-center gap-1 sm:gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Kerahasiaan Data 100%
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5">
                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" /> Bebas Biaya Appraisal
              </span>
            </div>
          </div>
          <div className="md:col-span-5 h-44 sm:h-56 md:h-full relative overflow-hidden">
            <img 
              src="/services/kredit-leasing.jpg" 
              alt="DENKEN Executive Financial Suite" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-card via-transparent to-transparent" />
            <span className="absolute bottom-2 left-2 sm:bottom-4 sm:left-5 text-[7px] sm:text-[10px] font-black uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/20">
              Mitra Terakreditasi OJK
            </span>
          </div>
        </div>

        {/* CAR SELECTION STRIP */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-3 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
            <div>
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" /> Pilih Unit dari Showroom
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pilih mobil di bawah untuk memasukkan harga & rincian secara otomatis
              </p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full w-fit">
              {mounted ? displayCars.length : 0} Mobil Tersedia
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {mounted && displayCars.map((c) => {
              const isSelected = c.id === selectedCarId
              return (
                <button
                  key={c.id}
                  onClick={() => handleCarSelect(c.id)}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border p-2 sm:p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/50 shadow-md scale-[1.02]'
                      : 'border-border/60 bg-muted/40 hover:border-primary/40 hover:bg-muted'
                  }`}
                >
                  <div className="aspect-[16/10] overflow-hidden rounded-lg sm:rounded-xl bg-muted mb-1.5 sm:mb-2">
                    <img src={c.image} alt={c.name} className="h-full w-full object-cover object-center" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-wider truncate">{c.brand}</p>
                  <p className="font-display text-[11px] sm:text-xs font-bold truncate text-foreground">{c.name}</p>
                  <p className="text-[10px] sm:text-[11px] font-extrabold text-foreground mt-0.5">{(c.price / 1000000).toFixed(0)} Jt</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* MAIN CALCULATOR GRID: Standard 8 cols (inputs) + 4 cols (summary card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
          
          {/* LEFT: INPUT CONTROLS (8 COLS) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-8 rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-4 sm:p-10 shadow-xl">
            
            {/* Selected Car Highlight */}
            {selectedCar && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-2xl bg-secondary/70 border border-border/50">
                <img
                  src={selectedCar.image}
                  alt={selectedCar.name}
                  className="h-36 w-full sm:h-20 sm:w-32 object-cover object-center rounded-xl border border-border/50 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    {selectedCar.brand} • {selectedCar.year}
                    {selectedCar.isSoldOut && (
                      <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-black text-white">SOLD OUT</span>
                    )}
                  </span>
                  <h3 className="font-display text-lg font-bold">{selectedCar.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedCar.transmission} • {selectedCar.fuel} • {selectedCar.engine}</p>
                </div>
              </div>
            )}

            {/* Input 1: Harga Kendaraan */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Harga Kendaraan (OTR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                  <input
                    type="text"
                    value={formatDots(price)}
                    readOnly
                    className="w-full sm:w-48 rounded-xl border border-border/50 bg-muted/30 py-2 pl-9 pr-3 text-right font-display text-lg font-bold text-foreground outline-none cursor-not-allowed opacity-80"
                  />
                </div>
              </div>
            </div>

            {/* Input 2: Uang Muka (DP) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Percent className="h-4 w-4 text-primary" /> Uang Muka (DP) - {dpPercent}%
                </label>
                <span className="font-display text-lg font-bold text-foreground">{formatIDR(dpAmount)}</span>
              </div>

              {/* Preset DP Buttons */}
              <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-3 sm:mb-4">
                {[10, 15, 20, 30, 50].map((p) => (
                  <button
                    key={p}
                    onClick={() => setDpPercent(p)}
                    className={`py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all border ${
                      dpPercent === p
                        ? 'border-primary bg-primary/15 text-primary shadow-sm'
                        : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    DP {p}%
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={dpPercent}
                onChange={(e) => setDpPercent(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-muted accent-primary outline-none cursor-pointer"
              />
            </div>

            {/* Input 3: Tenor (Jangka Waktu) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Jangka Waktu (Tenor)
                </label>
                <span className="font-display text-sm sm:text-lg font-bold text-foreground">
                  {tenor} Tahun <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">({tenor * 12} bulan)</span>
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTenor(t)}
                    className={`py-2 sm:py-3.5 rounded-xl font-bold transition-all border flex flex-col items-center justify-center ${
                      tenor === t
                        ? 'border-primary bg-primary text-primary-foreground shadow-md'
                        : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{t} Thn</span>
                    <span className="text-[9px] sm:text-[10px] opacity-80">{(interestRates[t] * 100).toFixed(2)}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input 4: Jenis Pembiayaan & Asuransi */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-6 pt-3 sm:pt-4 border-t border-border/50">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Skema Pembayaran (Skema Angsuran)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentType('ADDB')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      paymentType === 'ADDB'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/40 text-muted-foreground'
                    }`}
                    title="Angsuran Dibayar Di Belakang"
                  >
                    ADDB
                  </button>
                  <button
                    onClick={() => setPaymentType('ADDM')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      paymentType === 'ADDM'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/40 text-muted-foreground'
                    }`}
                    title="Angsuran Dibayar Di Muka"
                  >
                    ADDM
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {paymentType === 'ADDB' ? 'ADDB: Angsuran ke-1 dibayar bulan berikutnya' : 'ADDM: Angsuran ke-1 masuk dalam Total DP'}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Perlindungan Asuransi
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['All Risk', 'Kombinasi', 'TLO'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setInsuranceType(type)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        insuranceType === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Information Banner */}
            <div className="rounded-2xl bg-secondary/50 p-4 border border-border/50 flex items-start gap-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                Simulasi ini dihitung menggunakan estimasi suku bunga flat <strong className="text-foreground">{(annualRate * 100).toFixed(2)}%/tahun</strong> dengan mitra BCA Finance / Mandiri Utama Finance.
              </span>
            </div>

          </div>

          {/* RIGHT: LUXURIOUS SUMMARY CARD */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-3 sm:space-y-6">
            <div className="rounded-2xl sm:rounded-3xl bg-zinc-950 text-white p-3 sm:p-7 border border-white/15 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/30 blur-[100px]" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                  <h3 className="font-display text-[10px] sm:text-xl font-black tracking-wide text-white">Ringkasan Pembiayaan</h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">
                      Estimasi Resmi
                    </span>
                  </div>
                </div>

                {/* Main Monthly Output */}
                <div className="mb-3 sm:mb-6 p-2.5 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-b from-primary/25 to-primary/10 border border-primary/35 text-center relative backdrop-blur-md shadow-inner overflow-hidden">
                  <p className="text-[8px] sm:text-[11px] font-bold uppercase tracking-widest text-white/70 mb-1 sm:mb-2">
                    Angsuran Per Bulan
                  </p>
                  <div className="flex items-baseline justify-center gap-1 sm:gap-1.5 whitespace-nowrap">
                    <span className="font-display text-[10px] sm:text-lg font-bold text-white/80 shrink-0">Rp</span>
                    <span className="font-display text-2xl sm:text-3xl xl:text-[2.25rem] font-black text-white tracking-tight tabular-nums">
                      {Math.round(monthlyPayment).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[8px] sm:text-xs font-semibold text-white/60 shrink-0">/bln</span>
                  </div>
                  <p className="text-[8px] sm:text-xs text-white/60 mt-1 sm:mt-2 font-medium">
                    Tenor {tenor} Tahun ({tenor * 12}x Cicilan)
                  </p>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-2 sm:space-y-3.5 text-[9px] sm:text-xs font-medium text-white/85 border-b border-white/15 pb-3 sm:pb-6 mb-3 sm:mb-6">
                  <div className="flex justify-between">
                    <span className="text-white/70">Harga Kendaraan (OTR)</span>
                    <span className="font-bold text-white">{formatIDR(price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Uang Muka (DP {dpPercent}%)</span>
                    <span className="font-bold text-white">{formatIDR(dpAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Plafond Pinjaman (Pokok)</span>
                    <span className="font-bold text-white">{formatIDR(loanPrincipal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Estimasi Suku Bunga</span>
                    <span className="font-bold text-white bg-primary/30 border border-primary/40 px-2 py-0.5 rounded-md text-[11px]">
                      {(annualRate * 100).toFixed(2)}% / Tahun
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Bunga ({tenor} Thn)</span>
                    <span className="font-bold text-white">{formatIDR(totalInterest)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white/70">Perkiraan Asuransi ({insuranceType})</span>
                    <span className="font-bold text-white">{formatIDR(insuranceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Biaya Administrasi & Polos</span>
                    <span className="font-bold text-white">{formatIDR(adminFee)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/15 text-sm font-bold items-center">
                    <span className="text-white">Total Bayar Pertama (TDP)</span>
                    <span className="text-white font-black text-base">{formatIDR(totalFirstDp)}</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  {selectedCar?.isSoldOut ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 py-4 text-center">
                      <p className="font-display text-sm font-black text-red-500">UNIT TERJUAL (SOLD OUT)</p>
                      <p className="text-[10px] text-white/50 mt-1">Silakan pilih unit lain untuk pengajuan kredit.</p>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/${currentCabang}/kredit?carId=${selectedCarId}&price=${price}&dp=${dpAmount}&tenor=${tenor}${showroomParam ? `&showroom=${showroomParam}` : ''}`}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 py-4 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.02] shadow-lg shadow-primary/30 border border-white/10 active:scale-[0.99]"
                      >
                        Ajukan Kredit Sekarang <ArrowRight className="h-4 w-4" />
                      </Link>

                      <a
                        href={`https://wa.me/6287709165697?text=Halo%20DENKEN%20MOTORS,%20saya%20inisiatif%20konsultasi%20kredit%20mobil%20${encodeURIComponent(
                          selectedCar?.name || 'Mobil'
                        )}%20dengan%20Harga:%20${formatIDR(price)},%20DP:%20${formatIDR(dpAmount)},%20Tenor:%20${tenor}%20Tahun.`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 py-3.5 text-xs font-bold text-white transition-all hover:bg-white/15 hover:border-white/30"
                      >
                        <MessageSquare className="h-4 w-4 text-emerald-400" /> Konsultasi Sales via WhatsApp
                      </a>
                    </>
                  )}
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-white/50 text-center">
                  *Simulasi bersifat indikatif. Nilai final dapat menyesuaikan dengan analisa profil kredit leasing resmi.
                </p>
              </div>
            </div>

            {/* Leasing Partner Trust Bar */}
            <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-card p-3 sm:p-5 text-center shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Mitra Resmi Pembiayaan Showroom
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-muted-foreground/70">
                <span className="hover:text-foreground transition-colors">BCA FINANCE</span>
                <span>•</span>
                <span className="hover:text-foreground transition-colors">MANDIRI UTAMA</span>
                <span>•</span>
                <span className="hover:text-foreground transition-colors">CIMB NIAGA</span>
                <span>•</span>
                <span className="hover:text-foreground transition-colors">MAYBANK</span>
              </div>
            </div>

          </div>

        </div>

        {/* AMORTIZATION SCHEDULE BREAKDOWN TABLE */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-3 sm:p-10 shadow-xl">
          <button
            onClick={() => setShowAmortization(!showAmortization)}
            className="flex w-full items-center justify-between text-left font-display text-xl font-bold"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Rincian Jadwal Angsuran Per Tahun (Amortization Schedule)
            </span>
            <div className="rounded-full bg-muted p-2">
              {showAmortization ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </button>

          {showAmortization && (
            <div className="mt-6 overflow-x-auto border-t border-border/50 pt-6 animate-in fade-in">
              <table className="w-full min-w-[650px] text-left border-collapse text-xs font-medium">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Tahun Ke</th>
                    <th className="p-4">Angsuran Pokok / Thn</th>
                    <th className="p-4">Bunga / Thn</th>
                    <th className="p-4">Total Bayar / Thn</th>
                    <th className="p-4 text-right">Sisa Pokok Hutang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {amortizationSchedule.map((row) => (
                    <tr key={row.year} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold">Tahun {row.year}</td>
                      <td className="p-4">{formatIDR(row.principalPaid)}</td>
                      <td className="p-4 text-primary font-bold">{formatIDR(row.interestPaid)}</td>
                      <td className="p-4 font-bold">{formatIDR(row.totalPaid)}</td>
                      <td className="p-4 text-right font-bold">{formatIDR(row.remainingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 2. PREMIER FINANCING PARTNERS SHOWCASE */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                Premier Financing Partners
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Mitra Lembaga Pembiayaan <span className="font-serif italic font-normal text-muted-foreground">Resmi & Terpercaya.</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Kemitraan strategis dengan institusi perbankan nasional untuk memastikan proses kredit yang transparan, aman, dan efisien.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            <div className="rounded-xl sm:rounded-[2.2rem] border border-border/60 bg-card p-3 sm:p-5 lg:p-7 flex flex-col justify-between shadow-sm hover:border-primary/40 hover:shadow-lg transition-all group">
              <div className="space-y-1.5 sm:space-y-3">
                <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <h3 className="font-display text-xs sm:text-base lg:text-lg font-bold text-foreground line-clamp-1">BCA Finance</h3>
                <p className="text-[9px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Paket suku bunga terendah mulai 2.6% p.a. fixed untuk unit baru maupun second luxury dengan tenor hingga 5 tahun.
                </p>
              </div>
              <div className="pt-2 sm:pt-4 mt-2 sm:mt-4 border-t border-border/40 text-[8px] sm:text-[11px] font-bold text-primary truncate">
                Suku Bunga Khusus Prioritas
              </div>
            </div>

            <div className="rounded-xl sm:rounded-[2.2rem] border border-border/60 bg-card p-3 sm:p-5 lg:p-7 flex flex-col justify-between shadow-sm hover:border-primary/40 hover:shadow-lg transition-all group">
              <div className="space-y-1.5 sm:space-y-3">
                <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <h3 className="font-display text-xs sm:text-base lg:text-lg font-bold text-foreground line-clamp-1">Mandiri Utama (MUF)</h3>
                <p className="text-[9px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Fasilitas uang muka (DP) fleksibel mulai 20% dan proses persetujuan verifikasi dokumen kilat 1x24 jam kerja.
                </p>
              </div>
              <div className="pt-2 sm:pt-4 mt-2 sm:mt-4 border-t border-border/40 text-[8px] sm:text-[11px] font-bold text-primary truncate">
                Approval Kilat 24 Jam
              </div>
            </div>

            <div className="rounded-xl sm:rounded-[2.2rem] border border-border/60 bg-card p-3 sm:p-5 lg:p-7 flex flex-col justify-between shadow-sm hover:border-primary/40 hover:shadow-lg transition-all group">
              <div className="space-y-1.5 sm:space-y-3">
                <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <h3 className="font-display text-xs sm:text-base lg:text-lg font-bold text-foreground line-clamp-1">Maybank Finance</h3>
                <p className="text-[9px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Plafon pembiayaan tinggi khusus kendaraan supercar & premium SUV dengan skema angsuran ADDM atau ADDB.
                </p>
              </div>
              <div className="pt-2 sm:pt-4 mt-2 sm:mt-4 border-t border-border/40 text-[8px] sm:text-[11px] font-bold text-primary truncate">
                Plafon Supercar Eksklusif
              </div>
            </div>

            <div className="rounded-xl sm:rounded-[2.2rem] border border-border/60 bg-card p-3 sm:p-5 lg:p-7 flex flex-col justify-between shadow-sm hover:border-primary/40 hover:shadow-lg transition-all group">
              <div className="space-y-1.5 sm:space-y-3">
                <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <h3 className="font-display text-xs sm:text-base lg:text-lg font-bold text-foreground line-clamp-1">CIMB Niaga Auto</h3>
                <p className="text-[9px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Opsi akad Syariah murni (Murabahah) maupun Konvensional dilengkapi asuransi all-risk komprehensif.
                </p>
              </div>
              <div className="pt-2 sm:pt-4 mt-2 sm:mt-4 border-t border-border/40 text-[8px] sm:text-[11px] font-bold text-primary truncate">
                Opsi Akad Syariah & All-Risk
              </div>
            </div>
          </div>
        </div>

        {/* 3. LUXURY EXECUTIVE HANDOVER BANNER */}
        <div className="rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-card via-card to-primary/5 border border-border/70 p-4 sm:p-12 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8 items-center">
          <div className="md:col-span-7 space-y-2 sm:space-y-4">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Executive Handover</span>
            </div>
            <h3 className="font-display text-xl sm:text-3xl font-black text-foreground">
              Kredit Disetujui, Kendaraan Impian Siap Dikirim ke Garasi Anda
            </h3>
            <p className="text-[9px] sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">
              Seluruh pengurusan berkas leasing, polis asuransi all-risk, hingga penerbitan plat nomor dan STNK dipandu langsung oleh tim konsultan showroom tanpa repot.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Pengantaran Towing Tertutup VIP
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Garansi Mesin 1 Tahun Resmi
              </span>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-2xl overflow-hidden aspect-[16/10] border border-border/70 shadow-lg relative group">
              <img 
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80" 
                alt="Executive Handover" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-[10px] font-black uppercase tracking-wider text-white">
                Serah Terima Unit Showroom DENKEN
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function SimulasiKreditPage() {
  return (
    <Suspense fallback={<div className="pt-32 pb-20 text-center min-h-screen"><p>Memuat simulasi...</p></div>}>
      <SimulationContent />
    </Suspense>
  )
}
