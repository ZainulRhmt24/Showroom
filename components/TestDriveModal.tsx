"use client"

import { useState } from 'react'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Car as CarIcon,
  ShieldCheck,
  Send,
  User,
  Phone
} from 'lucide-react'
import { createLead } from '@/app/actions/leadActions'

interface TestDriveModalProps {
  isOpen: boolean
  onClose: () => void
  car: any
  currentCabang?: string
}

export function TestDriveModal({ isOpen, onClose, car, currentCabang = 'jakarta' }: TestDriveModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [timeSlot, setTimeSlot] = useState('13:30 - 15:30 WIB (Sesi Siang)')
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [hasSimA, setHasSimA] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !car) return null

  const timeSlots = [
    { id: 'pagi', label: '10:00 - 12:00 WIB', name: 'Sesi Pagi' },
    { id: 'siang', label: '13:30 - 15:30 WIB', name: 'Sesi Siang' },
    { id: 'sore', label: '16:00 - 18:00 WIB', name: 'Sesi Sore' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createLead({
        type: 'Kontak',
        name,
        whatsapp,
        carId: car.id,
        carName: car.name,
        city: car.location || 'Jakarta',
        ownerId: car.ownerId,
        details: {
          isTestDrive: true,
          scheduledDate: selectedDate,
          timeSlot,
          hasSimA,
          carLocation: car.location,
        }
      })
      setStep('success')
    } catch (err) {
      console.error('Failed to book test drive:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getWaConfirmationLink = () => {
    let rawPhone = '6287709165697' // Admin showroom phone
    const msg = `Halo DENKEN MOTORS, saya *${name}* ingin mengonfirmasi jadwal *VIP Test Drive* untuk unit *${car.name}* pada tanggal *${selectedDate}* (${timeSlot}) di Showroom ${car.location}. Mohon dipersiapkan unitnya. Terima kasih! 🙏`
    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display font-bold text-base text-foreground">
                Jadwalkan Test Drive VIP
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Rasakan langsung performa & kenyamanan berkendara di showroom
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

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            {/* Unit Info Box */}
            <div className="rounded-2xl bg-muted/40 border border-border/50 p-3.5 flex items-center gap-3">
              <img
                src={car.image}
                alt={car.name}
                className="h-12 w-16 object-cover rounded-xl border border-border shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-foreground truncate">{car.name}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-primary" /> Showroom {car.location || 'Jakarta'}
                </p>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="font-bold text-muted-foreground block mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Pilih Tanggal Kunjungan
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary"
              />
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="font-bold text-muted-foreground block mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Pilih Sesi Waktu
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const fullSlot = `${slot.label} (${slot.name})`
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setTimeSlot(fullSlot)}
                      className={`rounded-xl p-2 text-center border transition ${
                        timeSlot === fullSlot
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                          : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted font-medium'
                      }`}
                    >
                      <p className="text-[11px]">{slot.label}</p>
                      <p className="text-[9px] opacity-80 mt-0.5">{slot.name}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contact Inputs */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Nama Lengkap Anda</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary"
                  placeholder="0812XXXXXXXX"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={hasSimA}
                  onChange={(e) => setHasSimA(e.target.checked)}
                  className="rounded text-primary h-4 w-4"
                />
                <span className="text-[11px] text-muted-foreground font-medium">
                  Saya memiliki SIM A aktif yang siap ditunjukkan saat test drive
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary py-3.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-md disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Menjadwalkan...' : 'Konfirmasi Jadwal Test Drive'}
            </button>
          </form>
        ) : (
          /* Success Screen */
          <div className="mt-6 text-center space-y-4 py-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                JADWAL TERKONFIRMASI
              </span>
              <h3 className="font-display text-xl font-extrabold text-foreground mt-2">
                VIP Test Drive Siap
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Unit <strong>{car.name}</strong> telah disiapkan untuk Anda pada tanggal <strong>{selectedDate}</strong> ({timeSlot}) di Showroom {car.location}.
              </p>
            </div>

            <a
              href={getWaConfirmationLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs transition shadow"
            >
              <Send className="h-4 w-4" /> Buka WhatsApp Showroom
            </a>

            <button
              onClick={onClose}
              className="w-full rounded-xl border border-border bg-card py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
