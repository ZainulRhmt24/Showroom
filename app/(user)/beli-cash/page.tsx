"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, ChevronRight, FileText } from 'lucide-react'
import { useStore } from '@/store/useStore'

function CashFormContent() {
  const searchParams = useSearchParams()
  const cars = useStore((state) => state.cars)
  const addLead = useStore((state) => state.addLead)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addLead({
      type: 'Cash',
      name: formData.name,
      whatsapp: formData.whatsapp,
      email: formData.email,
      city: formData.city,
      carId: formData.carId,
      carName: selectedCar ? selectedCar.name : 'Belum Dipilih',
      details: {
        carPrice: selectedCar?.price,
      },
    })

    setIsSuccess(true)
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
            href="/"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-24 min-h-screen bg-secondary/30">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-black tracking-tight mb-4">Pembelian Mobil Cash</h1>
          <p className="text-muted-foreground">
            Lengkapi data di bawah ini untuk memulai proses transaksi pembelian tunai (Cash).
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-12 relative max-w-sm mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500"
            style={{ width: `${(step - 1) * 50}%` }}
          />

          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-background font-bold transition-colors ${
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
          className="rounded-3xl border border-border/50 bg-card p-6 sm:p-10 shadow-2xl"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold mb-6">1. Data Pemohon</h2>
              <div>
                <label className="text-sm font-bold mb-2 block">Nama Lengkap (sesuai KTP)</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/50 p-4 outline-none focus:border-primary"
                  placeholder="Sesuai KTP"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-2 block">Nomor WhatsApp</label>
                <input
                  required
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/50 p-4 outline-none focus:border-primary"
                  placeholder="0812xxxx"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold mb-2 block">Email</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 p-4 outline-none focus:border-primary"
                    placeholder="email@contoh.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Kota Domisili</label>
                  <input
                    required
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 p-4 outline-none focus:border-primary"
                    placeholder="Contoh: Jakarta Selatan"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold mb-6">
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
                <div className="rounded-2xl border border-border bg-muted/50 p-5 flex gap-5 items-center">
                  <img
                    src={selectedCar.image}
                    alt={selectedCar.name}
                    className="h-20 w-32 object-cover object-center rounded-xl border border-border/50"
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
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-7 w-7 text-primary" />
                <h2 className="font-display text-2xl font-bold">3. Ringkasan Pembelian</h2>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-6 space-y-4 text-sm font-medium">
                <div className="flex justify-between pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Nama Lengkap</span>
                  <span className="font-bold text-foreground">{formData.name}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Nomor WhatsApp</span>
                  <span className="font-bold text-foreground">{formData.whatsapp}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Mobil Pilihan</span>
                  <span className="font-bold text-foreground">{selectedCar?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga Total (Cash)</span>
                  <span className="font-bold text-primary text-lg">Rp {selectedCar ? selectedCar.price.toLocaleString('id-ID') : 0}</span>
                </div>
              </div>

              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Saya mengonfirmasi bahwa data yang saya berikan adalah benar, dan saya bersedia untuk dihubungi oleh tim sales DENKEN MOTORS terkait proses transaksi ini.
                </span>
              </label>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-10 flex gap-4 pt-6 border-t border-border/50">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="h-14 rounded-full border border-border px-8 font-bold transition-all hover:bg-muted"
              >
                Kembali
              </button>
            )}
            <button
              type="submit"
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              {step === 3 ? 'Kirim Pengajuan' : 'Selanjutnya'} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </form>
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
