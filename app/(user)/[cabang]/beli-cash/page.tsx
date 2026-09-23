"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, ChevronRight, FileText } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { submitPublicLead } from '@/app/actions/publicFormActions'

function CashFormContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const allCars = useStore((state) => state.cars)
  const branches = useStore((state) => state.branches)

  const currentCabang = (params.cabang as string) || 'jakarta'
  const activeBranch = branches.find(b => (b.slug || b.city.toLowerCase().replace(/\s+/g, '-')) === currentCabang) || branches[0]
  
  const showroomParam = searchParams.get('showroom')
  const activeOwnerId = showroomParam || (activeBranch ? activeBranch.ownerId : null)
  
  let cars = allCars.filter((car) => car.ownerId === activeOwnerId)
  if (activeBranch) {
    cars = cars.filter(car => {
      const isBranchMatch = car.branchId === activeBranch.id;
      const isCityMatch = car.location.toLowerCase().includes(activeBranch.city.toLowerCase());
      const isNameMatch = car.location.toLowerCase().includes(activeBranch.name.toLowerCase());
      return isBranchMatch || isCityMatch || isNameMatch;
    })
  }

  const [step, setStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    city: '',
    carId: searchParams.get('carId') || '',
  })

  useEffect(() => {
    if (searchParams.get('carId')) {
      setFormData((prev) => ({ ...prev, carId: searchParams.get('carId') as string }))
    }
  }, [searchParams])

  const selectedCar = cars.find((c) => c.id === formData.carId)

  const handleNext = () => setStep((s) => Math.min(s + 1, 3))
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1))

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const res = await submitPublicLead(currentCabang, {
      name: formData.name,
      whatsapp: formData.whatsapp,
      email: formData.email,
      city: formData.city,
      carId: formData.carId,
      carName: selectedCar ? selectedCar.name : 'Belum Dipilih',
      subject: 'Beli Cash',
      message: `Harga Kendaraan: Rp ${selectedCar?.price ? selectedCar.price.toLocaleString('id-ID') : '-'}`
    })

    setIsSubmitting(false)
    if (res.success) {
      setIsSuccess(true)
    } else {
      alert(res.error)
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
            Terima kasih {formData.name}. Tim sales kami akan segera menghubungi nomor WhatsApp (
            {formData.whatsapp}) Anda untuk memandu proses transaksi pembelian mobil.
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 sm:mb-12 text-center">
          <h1 className="font-display text-xl sm:text-4xl font-black tracking-tight mb-2 sm:mb-4">Pembelian Mobil Cash</h1>
          <p className="text-[11px] sm:text-base text-muted-foreground">
            Lengkapi data di bawah ini untuk memulai proses transaksi pembelian tunai (Cash).
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 sm:mb-12 relative max-w-sm mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500"
            style={{ width: `${(step - 1) * 50}%` }}
          />

          {[1, 2, 3].map((s) => (
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
            step === 3
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
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="text-[10px] sm:text-sm font-bold mb-1 sm:mb-2 block text-muted-foreground uppercase tracking-wider">Nama Lengkap</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary min-h-[38px]"
                    placeholder="Sesuai KTP"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-sm font-bold mb-1 sm:mb-2 block text-muted-foreground uppercase tracking-wider">No. WhatsApp</label>
                  <input
                    required
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary min-h-[38px]"
                    placeholder="0812xxxx"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="text-[10px] sm:text-sm font-bold mb-1 sm:mb-2 block text-muted-foreground uppercase tracking-wider">Email</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary min-h-[38px]"
                    placeholder="email@contoh.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-sm font-bold mb-1 sm:mb-2 block text-muted-foreground uppercase tracking-wider">Kota Domisili</label>
                  <input
                    required
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary min-h-[38px]"
                    placeholder="Contoh: Jakarta"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="font-display text-lg sm:text-2xl font-bold mb-3 sm:mb-6">
                2. {searchParams.get('carId') ? 'Kendaraan Pilihan' : 'Pilih Kendaraan'}
              </h2>
              {!searchParams.get('carId') && (
                <div>
                  <label className="text-xs sm:text-sm font-bold mb-1 sm:mb-2 block">Kendaraan Target</label>
                  <select
                    required
                    value={formData.carId}
                    onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-border bg-muted/50 p-2.5 sm:p-4 text-xs sm:text-sm outline-none focus:border-primary cursor-pointer min-h-[40px]"
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
                <div className="rounded-xl sm:rounded-2xl border border-border bg-muted/50 p-2.5 sm:p-5 flex items-center gap-2.5 sm:gap-5">
                  <img
                    src={selectedCar.image}
                    alt={selectedCar.name}
                    className="h-16 w-24 sm:h-20 sm:w-32 object-cover object-center rounded-lg sm:rounded-xl border border-border/50 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold font-display text-xs sm:text-lg truncate">{selectedCar.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                      {selectedCar.year} • {selectedCar.transmission} • {selectedCar.engine}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-primary mt-1">
                      Rp {selectedCar.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <FileText className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                <h2 className="font-display text-lg sm:text-2xl font-bold">3. Ringkasan Pembelian</h2>
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
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Harga Total (Cash)</span>
                  <span className="font-bold text-primary text-sm sm:text-lg">Rp {selectedCar ? selectedCar.price.toLocaleString('id-ID') : 0}</span>
                </div>
              </div>

              <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  Saya mengonfirmasi bahwa data yang saya berikan adalah benar, dan saya bersedia untuk dihubungi oleh tim sales DENKEN MOTORS terkait proses transaksi ini.
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
              type="submit"
              disabled={step === 3 && isSubmitting}
              className="flex h-10 sm:h-12 flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-primary px-4 sm:px-8 text-xs sm:text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {step === 3 ? (isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan Cash') : 'Selanjutnya'} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  )
}

export default function BeliCashPage() {
  return (
    <Suspense fallback={<div className="pt-32 pb-20 text-center min-h-screen"><p>Memuat formulir...</p></div>}>
      <CashFormContent />
    </Suspense>
  )
}
