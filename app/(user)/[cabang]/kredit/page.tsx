"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, ChevronRight, FileText } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { getPublicCarsForForm, submitPublicLead } from '@/app/actions/publicFormActions'

const formatDots = (n?: number | string | null) => {
  if (n === undefined || n === null || n === '') return ''
  const num = typeof n === 'number' ? n : parseInt(n.toString().replace(/\D/g, ''), 10)
  return isNaN(num) ? '' : num.toLocaleString('id-ID')
}

const parseDots = (s: string) => {
  const cleaned = s.replace(/\D/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

function CreditFormContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const currentCabang = (params.cabang as string) || 'jakarta'
  const [cars, setCars] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getPublicCarsForForm(currentCabang).then(res => {
      setCars(res)
    })
  }, [currentCabang])

  const [step, setStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    city: '',
    carId: searchParams.get('carId') || '',
    dp: searchParams.get('dp') || '100000000',
    tenor: searchParams.get('tenor') || '5',
    paymentType: 'ADDB',
    insuranceType: 'All Risk'
  })
  
  const [dpPercent, setDpPercent] = useState<number>(20)

  useEffect(() => {
    if (searchParams.get('carId')) {
      setFormData((prev) => ({ ...prev, carId: searchParams.get('carId') as string }))
    }
    if (searchParams.get('dp')) {
      setFormData((prev) => ({ ...prev, dp: searchParams.get('dp') as string }))
    }
    if (searchParams.get('tenor')) {
      setFormData((prev) => ({ ...prev, tenor: searchParams.get('tenor') as string }))
    }
  }, [searchParams])

  const selectedCar = cars.find((c) => c.id === formData.carId)

  useEffect(() => {
    if (selectedCar && !searchParams.get('dp')) {
      const defaultDp = Math.floor(selectedCar.price * (dpPercent / 100))
      setFormData(prev => ({ ...prev, dp: defaultDp.toString() }))
    }
  }, [selectedCar?.id, searchParams, dpPercent])

  const handleNext = () => setStep((s) => Math.min(s + 1, 4))
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const res = await submitPublicLead(currentCabang, {
      name: formData.name,
      whatsapp: formData.whatsapp,
      email: formData.email,
      city: formData.city,
      carId: formData.carId,
      carName: selectedCar ? `${selectedCar.brand} ${selectedCar.name}` : undefined,
      dp: formData.dp,
      tenor: formData.tenor,
      paymentType: formData.paymentType,
      insuranceType: formData.insuranceType
    })

    setIsSubmitting(false)
    if (res.success) {
      setIsSuccess(true)
    } else {
      alert(res.error || 'Terjadi kesalahan')
    }
  }

  if (isSuccess) {
    return (
      <div className="pt-32 pb-24 min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-10 rounded-3xl bg-card border border-border shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="font-display text-3xl font-black mb-3">Pengajuan Berhasil!</h1>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            Terima kasih {formData.name}. Tim konsultan pembiayaan kami akan segera menghubungi nomor WhatsApp (
            {formData.whatsapp}) Anda untuk memandu proses verifikasi dokumen.
          </p>
          <Link
            href={`/${currentCabang}`}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-page-shell">
      <div className="mobile-container">
        <div className={`mx-auto transition-all duration-500 ${step === 3 ? 'max-w-6xl' : 'max-w-3xl'}`}>
          <div className="mb-6 sm:mb-12 text-center">
            <h1 className="font-display text-xl sm:text-4xl font-black tracking-tight mb-2 sm:mb-4">Formulir Pengajuan Kredit</h1>
          <p className="text-[11px] sm:text-base text-muted-foreground">
            Lengkapi data di bawah ini untuk memulai proses simulasi & pengajuan kredit mobil Anda.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 sm:mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500"
            style={{ width: `${(step - 1) * 33.3}%` }}
          />

          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 sm:border-4 border-background text-xs sm:text-sm font-bold transition-colors ${
                step >= s ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        <form
          onSubmit={
            step === 4
              ? handleSubmit
              : (e) => {
                  e.preventDefault()
                  handleNext()
                }
          }
          className="rounded-2xl sm:rounded-3xl border border-border/50 bg-card p-4 sm:p-10 shadow-2xl"
        >
          {step === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="font-display text-lg sm:text-2xl font-bold mb-3 sm:mb-6">1. Data Pemohon</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-bold mb-1 sm:mb-2 block">Nama Lengkap (KTP)</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary min-h-[40px]"
                    placeholder="Sesuai KTP"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-bold mb-1 sm:mb-2 block">Nomor WhatsApp</label>
                  <input
                    required
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary min-h-[40px]"
                    placeholder="0812xxxx"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-bold mb-1 sm:mb-2 block">Email</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary min-h-[40px]"
                    placeholder="email@contoh.com"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-bold mb-1 sm:mb-2 block">Kota Domisili</label>
                  <input
                    required
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary min-h-[40px]"
                    placeholder="Contoh: Jakarta"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                2. {searchParams.get('carId') ? 'Kendaraan Pilihan' : 'Pilih Kendaraan'}
              </h2>
              {!searchParams.get('carId') && (
                <div>
                  <label className="text-sm font-bold mb-2 block">Kendaraan Target</label>
                  <select
                    required
                    value={formData.carId}
                    onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-border bg-muted/50 p-4 outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">-- Pilih Mobil --</option>
                    {cars.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.brand} {c.name} - Rp {(c.price / 1000000).toLocaleString('id-ID')} Jt
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {selectedCar && (
                <div className="rounded-2xl border border-border bg-muted/50 p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-5 sm:items-center">
                  <img
                    src={selectedCar.image}
                    alt={selectedCar.name}
                    className="h-40 w-full sm:h-20 sm:w-32 object-cover object-center rounded-xl border border-border/50"
                  />
                  <div>
                    <p className="font-bold font-display text-lg">{selectedCar.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedCar.year} • {selectedCar.transmission} • {selectedCar.engine}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      Rp {selectedCar.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="font-display text-lg sm:text-2xl font-bold mb-3 sm:mb-6">3. Rencana Pembiayaan</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
                {/* LEFT: INPUT CONTROLS */}
                <div className="lg:col-span-8 space-y-4 sm:space-y-8 rounded-2xl border border-border/60 bg-card p-4 sm:p-6 shadow-sm">
                  
                  {/* Harga Kendaraan */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        Harga Kendaraan (OTR)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                        <input
                          type="text"
                          value={selectedCar ? formatDots(selectedCar.price) : ''}
                          readOnly
                          className="w-full sm:w-48 rounded-xl border border-border/50 bg-muted/30 py-2 pl-9 pr-3 text-right font-display text-lg font-bold text-foreground outline-none cursor-not-allowed opacity-80"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Uang Muka */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        Uang Muka (DP) - {dpPercent}%
                      </label>
                      <span className="font-display text-lg font-bold text-foreground">
                        Rp {formatDots(formData.dp)}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {[10, 15, 20, 30, 50].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setDpPercent(p)
                            if (selectedCar) {
                              setFormData(prev => ({ ...prev, dp: Math.floor(selectedCar.price * (p / 100)).toString() }))
                            }
                          }}
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
                      onChange={(e) => {
                        const p = Number(e.target.value)
                        setDpPercent(p)
                        if (selectedCar) {
                          setFormData(prev => ({ ...prev, dp: Math.floor(selectedCar.price * (p / 100)).toString() }))
                        }
                      }}
                      className="w-full h-2 rounded-full appearance-none bg-muted accent-primary outline-none cursor-pointer"
                    />
                  </div>

                  {/* Tenor */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        Jangka Waktu (Tenor)
                      </label>
                      <span className="font-display text-sm sm:text-lg font-bold text-foreground">
                        {formData.tenor} Tahun <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">({Number(formData.tenor) * 12} bulan)</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 sm:gap-2">
                      {[1, 2, 3, 4, 5].map((t) => {
                        const rates: Record<number, number> = { 1: 0.0325, 2: 0.035, 3: 0.0375, 4: 0.0425, 5: 0.0475 }
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({ ...formData, tenor: t.toString() })}
                            className={`py-2 sm:py-3.5 rounded-xl font-bold transition-all border flex flex-col items-center justify-center ${
                              formData.tenor === t.toString()
                                ? 'border-primary bg-primary text-primary-foreground shadow-md'
                                : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            <span className="text-xs sm:text-sm">{t} Thn</span>
                            <span className="text-[9px] sm:text-[10px] opacity-80">{(rates[t] * 100).toFixed(2)}%</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Skema & Asuransi */}
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-6 pt-3 sm:pt-4 border-t border-border/50">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                        Skema Pembayaran
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentType: 'ADDB' })}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            formData.paymentType === 'ADDB' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          ADDB
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentType: 'ADDM' })}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            formData.paymentType === 'ADDM' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          ADDM
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {formData.paymentType === 'ADDB' ? 'ADDB: Angsuran ke-1 dibayar bulan berikutnya' : 'ADDM: Angsuran ke-1 masuk dalam Total DP'}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                        Perlindungan Asuransi
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['All Risk', 'Kombinasi', 'TLO']).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, insuranceType: type })}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              formData.insuranceType === type ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/40 text-muted-foreground'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: BLACK SUMMARY CARD */}
                {selectedCar && (() => {
                  const price = selectedCar.price
                  const dpAmount = parseDots(formData.dp)
                  const tenor = parseInt(formData.tenor) || 5
                  const rates: Record<number, number> = { 1: 0.0325, 2: 0.035, 3: 0.0375, 4: 0.0425, 5: 0.0475 }
                  const annualRate = rates[tenor] || 0.0475
                  
                  const loanPrincipal = Math.max(0, price - dpAmount)
                  const totalInterest = loanPrincipal * annualRate * tenor
                  const totalLoanWithInterest = loanPrincipal + totalInterest
                  const monthlyPayment = totalLoanWithInterest / (tenor * 12)
                  
                  const adminFee = 2500000
                  const insuranceRateMap: Record<string, number> = { 'All Risk': 0.025, 'Kombinasi': 0.018, 'TLO': 0.008 }
                  const insuranceFee = price * (insuranceRateMap[formData.insuranceType] || 0.025)
                  
                  const firstPayment = formData.paymentType === 'ADDM' ? monthlyPayment : 0
                  const totalFirstDp = dpAmount + adminFee + insuranceFee + firstPayment

                  return (
                    <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-3 sm:space-y-6">
                      <div className="rounded-2xl sm:rounded-3xl bg-zinc-950 text-white p-3 sm:p-7 border border-white/15 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/30 blur-[100px]" />
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                            <h3 className="font-display text-[10px] sm:text-xl font-black tracking-wide text-white">Ringkasan Pembiayaan</h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">Estimasi Resmi</span>
                            </div>
                          </div>

                          <div className="mb-3 sm:mb-6 p-2.5 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-b from-primary/25 to-primary/10 border border-primary/35 text-center relative backdrop-blur-md shadow-inner overflow-hidden">
                            <p className="text-[8px] sm:text-[11px] font-bold uppercase tracking-widest text-white/70 mb-1 sm:mb-2">Angsuran Per Bulan</p>
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

                          <div className="space-y-2 sm:space-y-3.5 text-[9px] sm:text-xs font-medium text-white/85 border-b border-white/15 pb-3 sm:pb-6 mb-3 sm:mb-6">
                            <div className="flex justify-between">
                              <span className="text-white/70">Harga Kendaraan (OTR)</span>
                              <span className="font-bold text-white">Rp {price.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Uang Muka (DP {dpPercent}%)</span>
                              <span className="font-bold text-white">Rp {dpAmount.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Plafond Pinjaman (Pokok)</span>
                              <span className="font-bold text-white">Rp {loanPrincipal.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-white/70">Estimasi Suku Bunga</span>
                              <span className="font-bold text-white bg-primary/30 border border-primary/40 px-2 py-0.5 rounded-md text-[11px]">
                                {(annualRate * 100).toFixed(2)}% / Tahun
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Total Bunga ({tenor} Thn)</span>
                              <span className="font-bold text-white">Rp {totalInterest.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-white/10">
                              <span className="text-white/70">Perkiraan Asuransi ({formData.insuranceType})</span>
                              <span className="font-bold text-white">Rp {insuranceFee.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Biaya Administrasi & Polos</span>
                              <span className="font-bold text-white">Rp {adminFee.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-white/15 text-sm font-bold items-center">
                              <span className="text-white">Total Bayar Pertama (TDP)</span>
                              <span className="text-white font-black text-base">Rp {totalFirstDp.toLocaleString('id-ID')}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={handleNext}
                              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 py-4 text-sm font-bold text-primary-foreground transition-all hover:scale-[1.02] shadow-lg shadow-primary/30 border border-white/10 active:scale-[0.99]"
                            >
                              Selanjutnya <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 py-3.5 text-xs font-bold text-white transition-all hover:bg-white/15 hover:border-white/30"
                              >
                                Kembali
                              </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <FileText className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                <h2 className="font-display text-lg sm:text-2xl font-bold">4. Ringkasan Pengajuan</h2>
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-border bg-muted/30 p-3 sm:p-6 space-y-3 sm:space-y-4 text-xs sm:text-sm font-medium">
                <div className="flex justify-between items-center pb-2 sm:pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Nama Lengkap</span>
                  <span className="font-bold text-foreground">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 sm:pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Nomor WhatsApp</span>
                  <span className="font-bold text-foreground">{formData.whatsapp}</span>
                </div>
                <div className="flex justify-between items-center pb-2 sm:pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Mobil Pilihan</span>
                  <span className="font-bold text-foreground truncate max-w-[160px] sm:max-w-none">{selectedCar?.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 sm:pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Uang Muka (DP)</span>
                  <span className="font-bold text-foreground">Rp {Number(formData.dp).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tenor Kredit</span>
                  <span className="font-bold text-foreground">{formData.tenor} Tahun</span>
                </div>
              </div>

              <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  Saya mengonfirmasi bahwa data yang saya berikan adalah benar, dan saya menyetujui syarat & ketentuan pengajuan pembiayaan di DENKEN MOTORS.
                </span>
              </label>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-6 sm:mt-10 flex gap-2.5 sm:gap-4 pt-4 sm:pt-6 border-t border-border/50">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="h-10 sm:h-12 rounded-full border border-border px-4 sm:px-8 text-xs sm:text-sm font-bold transition-all hover:bg-muted active:scale-95"
              >
                Kembali
              </button>
            )}
            <button
              disabled={isSubmitting}
              className="flex h-10 sm:h-12 flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-primary px-4 sm:px-8 text-xs sm:text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {step === 4 ? (isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan') : 'Selanjutnya'} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  )
}

export default function KreditPage() {
  return (
    <Suspense fallback={<div className="pt-32 pb-20 text-center min-h-screen"><p>Memuat formulir...</p></div>}>
      <CreditFormContent />
    </Suspense>
  )
}
