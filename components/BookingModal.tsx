"use client"

import { useState } from 'react'
import {
  X,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Building2,
  Copy,
  Check,
  CreditCard,
  QrCode,
  FileText,
  AlertCircle
} from 'lucide-react'
import { createLead } from '@/app/actions/leadActions'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  car: any
  currentCabang?: string
}

export function BookingModal({ isOpen, onClose, car, currentCabang = 'jakarta' }: BookingModalProps) {
  const [bookingType, setBookingType] = useState<'hold_free' | 'booking_deposit'>('hold_free')
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [bookingFee] = useState(10000000) // Rp 10.000.000 tanda jadi standar mobil premium
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [city, setCity] = useState('')
  const [visitSchedule, setVisitSchedule] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'BCA' | 'Mandiri' | 'QRIS'>('BCA')
  const [proofFileName, setProofFileName] = useState('')
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingCode, setBookingCode] = useState('')

  if (!isOpen || !car) return null

  const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

  const bankAccounts = {
    BCA: {
      bank: 'Bank Central Asia (BCA)',
      accountNumber: '883-918-2819',
      accountName: 'PT DENKEN MOTORS INDONESIA',
    },
    Mandiri: {
      bank: 'Bank Mandiri',
      accountNumber: '127-00-98218-091',
      accountName: 'PT DENKEN MOTORS INDONESIA',
    },
    QRIS: {
      bank: 'QRIS Pembayaran Resmi (GOPAY/OVO/BCA/ShopeePay)',
      accountNumber: 'NMID: ID1020261123984',
      accountName: 'DENKEN MOTORS INDONESIA',
    }
  }

  const handleCopyAccount = (num: string) => {
    navigator.clipboard.writeText(num)
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const code = bookingType === 'hold_free' 
      ? `DK-HOLD-${Math.floor(1000 + Math.random() * 9000)}`
      : `DK-LOCK-${Math.floor(1000 + Math.random() * 9000)}`
    setBookingCode(code)

    try {
      await createLead({
        type: 'Cash',
        name,
        whatsapp,
        city: city || 'Jakarta',
        carId: car.id,
        carName: car.name,
        ownerId: car.ownerId,
        details: {
          isBookingLock: true,
          bookingType,
          bookingFee: bookingType === 'booking_deposit' ? bookingFee : 0,
          paymentMethod: bookingType === 'booking_deposit' ? paymentMethod : 'Gratis (Hold)',
          proofFileName: bookingType === 'booking_deposit' ? (proofFileName || 'Bukti_Transfer_Tanda_Jadi.jpg') : undefined,
          visitSchedule: visitSchedule || 'Dalam 24 Jam',
          bookingCode: code,
          lockDurationHours: bookingType === 'hold_free' ? 24 : 48,
          timestamp: new Date().toISOString(),
        }
      })
      setStep('success')
    } catch (err) {
      console.error('Failed to submit booking lock:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 my-8 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display font-bold text-base text-foreground">
                Reservasi & Kunci Unit Eksklusif
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Amankan ketersediaan {car.name} agar tidak dilepas ke pembeli lain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dual Booking Strategy Tab */}
        <div className="mt-4 grid grid-cols-2 gap-2 bg-muted/50 p-1 rounded-2xl border border-border/50 text-xs font-bold">
          <button
            type="button"
            onClick={() => setBookingType('hold_free')}
            className={`py-2.5 px-3 rounded-xl transition text-center flex flex-col items-center gap-0.5 ${
              bookingType === 'hold_free' 
                ? 'bg-card text-foreground shadow-sm border border-border/80 font-black' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Hold VIP 24 Jam</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">GRATIS • Tanpa Biaya</span>
          </button>

          <button
            type="button"
            onClick={() => setBookingType('booking_deposit')}
            className={`py-2.5 px-3 rounded-xl transition text-center flex flex-col items-center gap-0.5 ${
              bookingType === 'booking_deposit' 
                ? 'bg-card text-foreground shadow-sm border border-border/80 font-black' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Tanda Jadi Resmi</span>
            <span className="text-[10px] text-primary font-extrabold">Rp 10 Jt (100% Refundable)</span>
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmitBooking} className="mt-5 space-y-5 text-xs">
            {/* Unit Summary Card */}
            <div className="rounded-2xl bg-muted/40 border border-border/50 p-4 flex items-center gap-3.5">
              <img
                src={car.image}
                alt={car.name}
                className="h-14 w-20 object-cover rounded-xl border border-border/60 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {car.year} • {car.plateNumber || 'Plat B'}
                </span>
                <p className="font-extrabold text-sm text-foreground truncate">{car.name}</p>
                <p className="font-mono text-xs font-bold text-muted-foreground mt-0.5">
                  Harga: {formatIDR(car.priceCredit || car.price)}
                </p>
              </div>
            </div>

            {bookingType === 'hold_free' ? (
              /* HOLD VIP 24 JAM (GRATIS) BANNER */
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Keuntungan Hold Prioritas 24 Jam (Tanpa Biaya):</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-muted-foreground list-disc pl-4">
                  <li>Unit <strong className="text-foreground">{car.name}</strong> di-hold selama 24 jam dan tidak akan dilepas ke penawar lain.</li>
                  <li>Sales Concierge DENKEN akan memverifikasi reservasi Anda via WhatsApp dalam kurun waktu 15 menit.</li>
                  <li>Anda bebas melakukan inspeksi fisik & test drive langsung di showroom tanpa ikatan biaya apapun.</li>
                </ul>
              </div>
            ) : (
              /* TANDA JADI RESMI RP 10 JT WITH REFUND GUARANTEE */
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-amber-500" /> Rekening Resmi PT Showroom
                  </span>
                  <span className="rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-0.5">
                    TANDA JADI: {formatIDR(bookingFee)}
                  </span>
                </div>

                {/* Refund Legal Clause Banner */}
                <div className="rounded-xl bg-card p-3 border border-emerald-500/30 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Garansi 100% Uang Kembali (Refundable):
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    Dana tanda jadi Rp 10 Jt kembali 100% tanpa potongan jika kondisi fisik mobil tidak sesuai Lembar Audit 150 Titik saat Anda cek unit di showroom, atau pengajuan kredit leasing ditolak.
                  </p>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-3 gap-2">
                  {(['BCA', 'Mandiri', 'QRIS'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`rounded-xl p-2 font-bold text-center border transition ${
                        paymentMethod === m
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Account Details Box */}
                <div className="rounded-xl bg-card p-3 border border-border/70 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground">{bankAccounts[paymentMethod].bank}</p>
                    <p className="font-mono font-black text-sm text-foreground tracking-wider">
                      {bankAccounts[paymentMethod].accountNumber}
                    </p>
                    <p className="text-[10px] font-bold text-primary mt-0.5">
                      a/n {bankAccounts[paymentMethod].accountName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(bankAccounts[paymentMethod].accountNumber)}
                    className="flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-[10px] font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition"
                  >
                    {copiedAccount ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copiedAccount ? 'Disalin' : 'Salin'}
                  </button>
                </div>
              </div>
            )}

            {/* Input Data Pemesan */}
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Nama Lengkap Anda</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary"
                    placeholder="Contoh: Hendra Wijaya"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Nomor WhatsApp Aktif</label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary"
                    placeholder="0812XXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Domisili / Kota</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary"
                    placeholder="Contoh: Jakarta Selatan"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Rencana Kunjungan Inspeksi</label>
                  <select
                    value={visitSchedule}
                    onChange={(e) => setVisitSchedule(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary"
                  >
                    <option value="Hari Ini (Sore / Malam)">Hari Ini (Sore / Malam)</option>
                    <option value="Besok Pagi (10:00 - 12:00)">Besok Pagi (10:00 - 12:00)</option>
                    <option value="Besok Siang (13:00 - 16:00)">Besok Siang (13:00 - 16:00)</option>
                    <option value="Akhir Pekan Ini (Sabtu / Minggu)">Akhir Pekan Ini (Sabtu / Minggu)</option>
                  </select>
                </div>
              </div>

              {/* Upload Proof Mock / Selector ONLY on Deposit */}
              {bookingType === 'booking_deposit' && (
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Upload Bukti Transfer Tanda Jadi</label>
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-3 text-center">
                    <input
                      type="file"
                      id="proofUpload"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProofFileName(e.target.files[0].name)
                        }
                      }}
                    />
                    <label htmlFor="proofUpload" className="cursor-pointer flex flex-col items-center gap-1">
                      <Upload className="h-5 w-5 text-primary" />
                      <span className="font-bold text-foreground">
                        {proofFileName ? proofFileName : 'Pilih Foto / Screenshot Struk Transfer'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Format JPG, PNG, atau PDF (Maks 5 MB)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-xl py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition disabled:opacity-50 ${
                bookingType === 'hold_free' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isSubmitting 
                ? 'Memproses Reservasi...' 
                : bookingType === 'hold_free' 
                  ? 'Klaim Hold Prioritas 24 Jam (Gratis Tanpa Biaya)' 
                  : `Kunci Unit Prioritas (${formatIDR(bookingFee)})`
              }
            </button>
          </form>
        ) : (
          /* SUCCESS SCREEN: VIP BOOKING PASS */
          <div className="mt-6 text-center space-y-5 py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                UNIT BERHASIL DIKUNCI
              </span>
              <h3 className="font-display text-xl font-extrabold text-foreground mt-2">
                Booking Pass Terverifikasi
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Terima kasih, <strong>{name}</strong>. Unit <strong>{car.name}</strong> kini berstatus dikunci untuk Anda selama 48 jam.
              </p>
            </div>

            <div className="rounded-2xl bg-muted/40 border border-border p-4 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kode Booking:</span>
                <span className="font-mono font-black text-primary">{bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit Mobil:</span>
                <span className="font-bold text-foreground">{car.name} ({car.year})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanda Jadi:</span>
                <span className="font-bold text-foreground">{formatIDR(bookingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Masa Penguncian:</span>
                <span className="font-bold text-emerald-600">48 Jam (Prioritas Utama)</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Sales Consultant Denken Motors akan segera menghubungi Anda di WhatsApp ({whatsapp}) untuk konfirmasi jadwal inspeksi fisik & penandatanganan SPK.
            </p>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow"
            >
              Selesai & Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
