"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { GitCompareArrows, CheckCircle2, ChevronRight, Calculator, Car as CarIcon, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'

const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

const formatDots = (n?: number | string | null) => {
  if (n === undefined || n === null || n === '') return ''
  const num = typeof n === 'number' ? n : parseInt(n.toString().replace(/\D/g, ''), 10)
  return isNaN(num) ? '' : num.toLocaleString('id-ID')
}

const parseDots = (s: string) => {
  const cleaned = s.replace(/\D/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

export default function TradeInPage() {
  const params = useParams()
  const currentCabang = (params?.cabang as string) || 'jakarta'

  const cars = useStore((state) => state.cars)
  const addLead = useStore((state) => state.addLead)

  const [step, setStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)

  // Form State
  const [myCarBrand, setMyCarBrand] = useState('')
  const [myCarModel, setMyCarModel] = useState('')
  const [myCarYear, setMyCarYear] = useState('2020')
  const [myCarMileage, setMyCarMileage] = useState('50000')
  const [myCarTransmission, setMyCarTransmission] = useState('Automatic')
  const [myCarCondition, setMyCarCondition] = useState('Bagus')

  const [targetCarId, setTargetCarId] = useState('')
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')

  // Dynamic Valuation Estimate Calculation
  const basePrice = Math.max(80000000, 350000000 - (2026 - Number(myCarYear)) * 30000000)
  const estimatedValuationMin = Math.round(basePrice * 0.95)
  const estimatedValuationMax = Math.round(basePrice * 1.08)

  const selectedTargetCar = cars.find((c) => c.id === targetCarId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addLead({
      type: 'Trade-In',
      name,
      whatsapp,
      email,
      city,
      carId: targetCarId,
      carName: selectedTargetCar ? selectedTargetCar.name : 'Belum Ditentukan',
      details: {
        oldCarBrand: myCarBrand,
        oldCarModel: myCarModel,
        oldCarYear: myCarYear,
        oldCarMileage: myCarMileage,
        oldCarTransmission: myCarTransmission,
        oldCarCondition: myCarCondition,
        estimatedValuationMin,
        estimatedValuationMax,
      },
    })

    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <div className="pt-32 pb-24 min-h-[80vh] flex items-center justify-center bg-secondary/30">
        <div className="text-center max-w-lg mx-auto p-10 rounded-3xl bg-card border border-border shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="font-display text-3xl font-black mb-3">Pengajuan Trade-In Berhasil!</h1>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Tim inspektor DENKEN MOTORS akan menghubungi Anda melalui WhatsApp ({whatsapp}) untuk mengonfirmasi jadwal inspeksi gratis dan valuasi final.
          </p>
          <div className="rounded-2xl bg-secondary p-4 text-left text-xs space-y-2 mb-8 border border-border/50">
            <p><strong className="text-foreground">Mobil Anda:</strong> {myCarBrand} {myCarModel} ({myCarYear})</p>
            <p><strong className="text-foreground">Estimasi Valuasi:</strong> {formatIDR(estimatedValuationMin)} - {formatIDR(estimatedValuationMax)}</p>
            {selectedTargetCar && <p><strong className="text-foreground">Mobil Impian:</strong> {selectedTargetCar.name}</p>}
          </div>
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
    <div className="pt-24 pb-24 min-h-screen bg-secondary/30">
      {/* Theme Responsive Header */}
      <div className="bg-card border-b border-border/60 py-16 text-foreground relative overflow-hidden mb-12 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GitCompareArrows className="h-7 w-7" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight">Trade-In & Jual Mobil</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base">
            Dapatkan taksiran harga tertinggi untuk mobil lama Anda dan upgrade ke kendaraan impian dengan proses 1 hari selesai.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500"
            style={{ width: `${(step - 1) * 50}%` }}
          />

          {[
            { s: 1, label: 'Mobil Lama' },
            { s: 2, label: 'Mobil Target' },
            { s: 3, label: 'Kontak & Jadwal' },
          ].map((item) => (
            <div key={item.s} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-background font-bold transition-all ${
                  step >= item.s ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'
                }`}
              >
                {item.s}
              </div>
              <span className="text-xs font-bold text-muted-foreground hidden sm:block">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <form
          onSubmit={
            step === 3
              ? handleSubmit
              : (e) => {
                  e.preventDefault()
                  setStep((s) => s + 1)
                }
          }
          className="rounded-3xl border border-border/50 bg-card p-6 sm:p-10 shadow-2xl"
        >
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <CarIcon className="h-6 w-6 text-primary" />
                <h2 className="font-display text-2xl font-bold">1. Informasi Mobil Lama Anda</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold mb-2 block">Merek Mobil</label>
                  <input
                    required
                    type="text"
                    value={myCarBrand}
                    onChange={(e) => setMyCarBrand(e.target.value)}
                    placeholder="Contoh: Toyota / Honda"
                    className="w-full rounded-xl border border-border bg-muted/50 p-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Model / Varian</label>
                  <input
                    required
                    type="text"
                    value={myCarModel}
                    onChange={(e) => setMyCarModel(e.target.value)}
                    placeholder="Contoh: Avanza G / HR-V E"
                    className="w-full rounded-xl border border-border bg-muted/50 p-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-bold mb-2 block">Tahun Pembuatan</label>
                  <select
                    value={myCarYear}
                    onChange={(e) => setMyCarYear(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-muted/50 p-4 text-sm outline-none focus:border-primary cursor-pointer"
                  >
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => (
                      <option key={y} value={y.toString()}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Transmisi</label>
                  <select
                    value={myCarTransmission}
                    onChange={(e) => setMyCarTransmission(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-muted/50 p-4 text-sm outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Jarak Tempuh (KM)</label>
                  <input
                    required
                    type="text"
                    value={formatDots(myCarMileage)}
                    onChange={(e) => setMyCarMileage(parseDots(e.target.value).toString())}
                    className="w-full rounded-xl border border-border bg-muted/50 p-4 text-sm font-mono font-bold outline-none focus:border-primary"
                    placeholder="50.000"
                  />
                </div>
              </div>

              {/* Instant Valuation Preview */}
              {myCarBrand && myCarModel && (
                <div className="rounded-2xl bg-primary/10 border border-primary/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <Sparkles className="h-4 w-4" /> Estimasi Valuasi Sementara
                    </p>
                    <p className="font-display text-2xl font-black text-foreground mt-1">
                      {formatIDR(estimatedValuationMin)} - {formatIDR(estimatedValuationMax)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground max-w-xs">
                    *Harga pasti ditentukan setelah inspeksi fisik 150 titik oleh tim teknisi kami.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <Calculator className="h-6 w-6 text-primary" />
                <h2 className="font-display text-2xl font-bold">2. Pilih Mobil Pengganti (Target)</h2>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Pilih Mobil dari Showroom DENKEN MOTORS</label>
                <select
                  value={targetCarId}
                  onChange={(e) => setTargetCarId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-muted/50 p-4 text-sm outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">-- Saya hanya ingin jual mobil (Tanpa tukar tambah) --</option>
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brand} {c.name} ({c.year}) - {formatIDR(c.price)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTargetCar && (
                <div className="rounded-2xl border border-border bg-muted/40 p-5 flex items-center gap-5">
                  <img
                    src={selectedTargetCar.image}
                    alt={selectedTargetCar.name}
                    className="h-24 w-36 object-cover object-center rounded-xl border border-border/50"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Target Upgrade</span>
                    <h3 className="font-display text-lg font-bold">{selectedTargetCar.name}</h3>
                    <p className="font-display font-extrabold text-primary text-xl mt-1">
                      {formatIDR(selectedTargetCar.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <h2 className="font-display text-2xl font-bold">3. Data Pemilik & Lokasi Inspeksi</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold mb-2 block">Nama Lengkap</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sesuai KTP"
                    className="w-full rounded-xl border border-border bg-muted/50 p-4 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Nomor WhatsApp</label>
                  <input
                    required
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full rounded-xl border border-border bg-muted/50 p-4 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold mb-2 block">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@contoh.com"
                    className="w-full rounded-xl border border-border bg-muted/50 p-4 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Kota Domisili</label>
                  <input
                    required
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta / Tangerang"
                    className="w-full rounded-xl border border-border bg-muted/50 p-4 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4 pt-6 border-t border-border/50">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="h-14 rounded-full border border-border px-8 font-bold transition-all hover:bg-muted"
              >
                Kembali
              </button>
            )}
            <button
              type="submit"
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              {step === 3 ? 'Kirim Pengajuan Trade-In' : 'Lanjutkan'} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
