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
  MessageSquare
} from 'lucide-react'
import { useStore, getActiveShowroom } from '@/store/useStore'

const formatIDR = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`

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
  const cars = useStore((state) => state.cars)

  const queryCarId = searchParams.get('carId')
  const showroomParam = searchParams.get('showroom')

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const activeOwnerId = getActiveShowroom(showroomParam)
  const displayCars = cars.filter((car) => (car.ownerId || 'admin_owner_1') === activeOwnerId)

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
    <div className="pt-24 pb-24 min-h-screen bg-secondary/30">
      {/* Theme Responsive Header */}
      <div className="bg-card border-b border-border/60 py-20 text-foreground relative overflow-hidden mb-12 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 mb-6 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Executive Financial Suite
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight">
            Simulasi Pembiayaan Mobil Mewah
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-medium leading-relaxed">
            Hitung perkiraan skema kredit secara akurat dengan suku bunga khusus mitra leasing premier DENKEN MOTORS.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* CAR SELECTION STRIP */}
        <div className="mb-10 rounded-3xl border border-border/60 bg-card p-6 shadow-xl">
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

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {mounted && displayCars.map((c) => {
              const isSelected = c.id === selectedCarId
              return (
                <button
                  key={c.id}
                  onClick={() => handleCarSelect(c.id)}
                  className={`group relative overflow-hidden rounded-2xl border p-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/50 shadow-md scale-[1.02]'
                      : 'border-border/60 bg-muted/40 hover:border-primary/40 hover:bg-muted'
                  }`}
                >
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted mb-2">
                    <img src={c.image} alt={c.name} className="h-full w-full object-cover object-center" />
                  </div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider truncate">{c.brand}</p>
                  <p className="font-display text-xs font-bold truncate text-foreground">{c.name}</p>
                  <p className="text-[11px] font-extrabold text-foreground mt-0.5">{(c.price / 1000000).toFixed(0)} Jt</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* MAIN CALCULATOR GRID */}
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
          
          {/* LEFT: INPUT CONTROLS */}
          <div className="space-y-8 rounded-3xl border border-border/60 bg-card p-6 sm:p-10 shadow-xl">
            
            {/* Selected Car Highlight */}
            {selectedCar && (
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-secondary/70 border border-border/50">
                <img
                  src={selectedCar.image}
                  alt={selectedCar.name}
                  className="h-20 w-32 object-cover object-center rounded-xl border border-border/50 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{selectedCar.brand} • {selectedCar.year}</span>
                  <h3 className="font-display text-lg font-bold">{selectedCar.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedCar.transmission} • {selectedCar.fuel} • {selectedCar.engine}</p>
                </div>
              </div>
            )}

            {/* Input 1: Harga Kendaraan */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Harga Kendaraan (OTR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                  <input
                    type="text"
                    value={formatDots(price)}
                    onChange={(e) => setPrice(parseDots(e.target.value))}
                    className="w-48 rounded-xl border border-border bg-muted/60 py-2 pl-9 pr-3 text-right font-display text-lg font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
              <input
                type="range"
                min="100000000"
                max="3000000000"
                step="10000000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-muted accent-primary outline-none cursor-pointer"
              />
            </div>

            {/* Input 2: Uang Muka (DP) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Percent className="h-4 w-4 text-primary" /> Uang Muka (DP) - {dpPercent}%
                </label>
                <span className="font-display text-lg font-bold text-foreground">{formatIDR(dpAmount)}</span>
              </div>

              {/* Preset DP Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[15, 20, 30, 50].map((p) => (
                  <button
                    key={p}
                    onClick={() => setDpPercent(p)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
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
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Jangka Waktu (Tenor)
                </label>
                <span className="font-display text-lg font-bold text-foreground">
                  {tenor} Tahun <span className="text-xs font-normal text-muted-foreground">({tenor * 12} bulan)</span>
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTenor(t)}
                    className={`py-3.5 rounded-xl font-bold transition-all border flex flex-col items-center justify-center ${
                      tenor === t
                        ? 'border-primary bg-primary text-primary-foreground shadow-md'
                        : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-sm">{t} Thn</span>
                    <span className="text-[10px] opacity-80">{(interestRates[t] * 100).toFixed(2)}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input 4: Jenis Pembiayaan & Asuransi */}
            <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border/50">
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
          <div className="sticky top-28 space-y-6">
            <div className="rounded-3xl bg-zinc-950 text-white p-8 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/20 blur-[90px]" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
                  <h3 className="font-display text-xl font-black tracking-wide">Ringkasan Pembiayaan</h3>
                  <span className="rounded-full bg-primary/20 text-primary border border-primary/30 px-3 py-1 text-[10px] font-bold tracking-wider">
                    ESTIMASI RESMI
                  </span>
                </div>

                {/* Main Monthly Output */}
                <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 text-center relative backdrop-blur-md">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
                    Angsuran Per Bulan
                  </p>
                  <p className="font-display text-4xl sm:text-5xl font-black text-primary tracking-tight">
                    {formatIDR(monthlyPayment)}
                  </p>
                  <p className="text-xs text-white/50 mt-2 font-medium">
                    Tenor {tenor} Tahun ({tenor * 12}x Cicilan)
                  </p>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-3.5 text-xs font-medium text-white/80 border-b border-white/15 pb-6 mb-6">
                  <div className="flex justify-between">
                    <span className="text-white/60">Harga Kendaraan (OTR)</span>
                    <span className="font-bold text-white">{formatIDR(price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Uang Muka (DP {dpPercent}%)</span>
                    <span className="font-bold text-white">{formatIDR(dpAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Plafond Pinjaman (Pokok)</span>
                    <span className="font-bold text-white">{formatIDR(loanPrincipal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Estimasi Suku Bunga</span>
                    <span className="font-bold text-primary">{(annualRate * 100).toFixed(2)}% / Tahun</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Bunga ({tenor} Thn)</span>
                    <span className="font-bold text-white">{formatIDR(totalInterest)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white/60">Perkiraan Asuransi ({insuranceType})</span>
                    <span className="font-bold text-white">{formatIDR(insuranceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Biaya Administrasi & Polos</span>
                    <span className="font-bold text-white">{formatIDR(adminFee)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/15 text-sm font-bold">
                    <span className="text-white">Total Bayar Pertama (TDP)</span>
                    <span className="text-primary font-black">{formatIDR(totalFirstDp)}</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <Link
                    href={`/kredit?carId=${selectedCarId}&price=${price}&dp=${dpAmount}&tenor=${tenor}`}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] shadow-lg shadow-primary/25"
                  >
                    Ajukan Kredit Sekarang <ArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href={`https://wa.me/6287709165697?text=Halo%20DENKEN%20MOTORS,%20saya%20inisiatif%20konsultasi%20kredit%20mobil%20${encodeURIComponent(
                      selectedCar?.name || 'Mobil'
                    )}%20dengan%20Harga:%20${formatIDR(price)},%20DP:%20${formatIDR(dpAmount)},%20Tenor:%20${tenor}%20Tahun.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 py-3.5 text-xs font-bold text-white transition-all hover:bg-white/15"
                  >
                    <MessageSquare className="h-4 w-4 text-emerald-400" /> Konsultasi Sales via WhatsApp
                  </a>
                </div>

                <p className="mt-4 text-[10px] leading-relaxed text-white/40 text-center">
                  *Simulasi bersifat indikatif. Nilai final dapat menyesuaikan dengan analisa profil kredit leasing resmi.
                </p>
              </div>
            </div>

            {/* Leasing Partner Trust Bar */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 text-center shadow-sm">
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
        <div className="mt-12 rounded-3xl border border-border/60 bg-card p-6 sm:p-10 shadow-xl">
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
