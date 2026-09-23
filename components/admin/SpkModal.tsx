"use client"

import { useState, useRef } from 'react'
import { X, Printer, CheckCircle, Car, Shield, FileText, Download } from 'lucide-react'

interface SpkModalProps {
  isOpen: boolean
  onClose: () => void
  lead: any
  car: any
  showroomInfo?: {
    name: string
    address: string
    phone?: string
    city: string
  }
}

export function SpkModal({ isOpen, onClose, lead, car, showroomInfo }: SpkModalProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [spkNumber] = useState(() => `SPK-DK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
  const [bookingFee, setBookingFee] = useState('10000000')
  const [salesName, setSalesName] = useState(lead?.assignedTo || 'Rian Ardiansyah (Senior Sales)')
  const [vinNumber, setVinNumber] = useState('MHK12389849281749')
  const [engineNumber, setEngineNumber] = useState('2AR-FE-984218')

  if (!isOpen || !lead) return null

  const formatIDR = (n: number | string) => {
    const num = typeof n === 'number' ? n : parseInt(n.toString().replace(/\D/g, ''), 10) || 0
    return `Rp ${num.toLocaleString('id-ID')}`
  }

  const handlePrint = () => {
    window.print()
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-background border border-border shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-bold text-sm text-foreground">Surat Pemesanan Kendaraan (SPK)</h2>
              <p className="text-xs text-muted-foreground">Dokumen resmi pemesanan & penguncian unit showroom</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" /> Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* SPK Document Body (Optimized for Screen & Print) */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-white text-neutral-900 print:p-0 print:m-0" ref={printRef}>
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-black tracking-wider uppercase text-neutral-900">
                DENKEN MOTORS
              </h1>
              <p className="text-xs font-bold tracking-widest text-primary uppercase mt-0.5">
                PREMIUM CERTIFIED AUTOMOTIVE SHOWROOM
              </p>
              <p className="text-xs text-neutral-600 mt-1 max-w-sm">
                {showroomInfo?.address || 'Jl. TB Simatupang No. 88, Cilandak, Jakarta Selatan, 12430'}
                <br />
                Hotline: {showroomInfo?.phone || '+62 877-0916-5697'} • Website: denkenmotors.id
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded border border-neutral-900 px-3 py-1 text-xs font-black tracking-widest uppercase">
                FORMULIR SPK RESMI
              </span>
              <p className="text-xs font-mono font-bold text-neutral-800 mt-2">
                No: <strong>{spkNumber}</strong>
              </p>
              <p className="text-xs text-neutral-600 mt-0.5">Tanggal: {currentDate}</p>
            </div>
          </div>

          {/* Section 1: Data Pemesan */}
          <div className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider bg-neutral-100 p-2 border-l-4 border-neutral-900 mb-3 text-neutral-900">
              I. DATA PEMESAN (KONSUMEN)
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex">
                <span className="w-32 text-neutral-500 font-medium">Nama Lengkap:</span>
                <span className="font-bold text-neutral-900">{lead.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-neutral-500 font-medium">No. Handphone/WA:</span>
                <span className="font-bold text-neutral-900">{lead.whatsapp}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-neutral-500 font-medium">Email Konsumen:</span>
                <span className="font-semibold text-neutral-900">{lead.email || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-neutral-500 font-medium">Domisili / Kota:</span>
                <span className="font-semibold text-neutral-900">{lead.city || showroomInfo?.city || 'Jakarta'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Data Kendaraan */}
          <div className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider bg-neutral-100 p-2 border-l-4 border-neutral-900 mb-3 text-neutral-900">
              II. SPESIFIKASI KENDARAAN YANG DIPESAN
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex">
                <span className="w-32 text-neutral-500 font-medium">Unit Kendaraan:</span>
                <span className="font-black text-neutral-900">{car?.name || lead.carName || 'Unit Showroom'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-neutral-500 font-medium">Tahun Pembuatan:</span>
                <span className="font-bold text-neutral-900">{car?.year || 2024}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-neutral-500 font-medium">Warna Unit:</span>
                <span className="font-semibold text-neutral-900">{car?.color || 'Hitam Metalik'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-neutral-500 font-medium">Transmisi / Mesin:</span>
                <span className="font-semibold text-neutral-900">{car?.transmission || 'Automatic'} • {car?.engine || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-neutral-500 font-medium">No. Rangka (VIN):</span>
                <input 
                  type="text" 
                  value={vinNumber} 
                  onChange={(e) => setVinNumber(e.target.value)}
                  className="font-mono font-bold text-neutral-900 border-b border-neutral-400 bg-transparent outline-none print:border-none" 
                />
              </div>
              <div className="flex">
                <span className="w-32 text-neutral-500 font-medium">No. Mesin:</span>
                <input 
                  type="text" 
                  value={engineNumber} 
                  onChange={(e) => setEngineNumber(e.target.value)}
                  className="font-mono font-bold text-neutral-900 border-b border-neutral-400 bg-transparent outline-none print:border-none" 
                />
              </div>
            </div>
          </div>

          {/* Section 3: Skema Finansial & Tanda Jadi */}
          <div className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider bg-neutral-100 p-2 border-l-4 border-neutral-900 mb-3 text-neutral-900">
              III. SKEMA KESEPAKATAN HARGA & PEMBAYARAN
            </h2>
            <div className="rounded-xl border border-neutral-300 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-neutral-600 font-medium">Metode Pembayaran:</span>
                <span className="font-extrabold uppercase px-2 py-0.5 rounded bg-neutral-200 text-neutral-900">
                  {lead.type === 'Kredit' ? 'Paket Pembiayaan Kredit' : lead.type === 'Trade-In' ? 'Tukar Tambah (Trade-In)' : 'Pembayaran Tunai (Cash)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Harga Kesepakatan (OTR):</span>
                <span className="font-black text-sm text-neutral-900">{formatIDR(car?.priceCredit || car?.price || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Tanda Jadi (Booking Fee):</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-neutral-500">Rp</span>
                  <input
                    type="number"
                    value={bookingFee}
                    onChange={(e) => setBookingFee(e.target.value)}
                    className="font-bold text-right w-28 border-b border-neutral-400 bg-transparent outline-none print:border-none"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200 font-bold text-neutral-900">
                <span>Sisa Pembayaran / Pelunasan:</span>
                <span>{formatIDR((car?.priceCredit || car?.price || 0) - Number(bookingFee))}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Syarat & Ketentuan */}
          <div className="mb-8 text-[10px] text-neutral-500 space-y-1 leading-relaxed">
            <p className="font-bold text-neutral-700">KETENTUAN PEMESANAN:</p>
            <p>1. Tanda jadi (booking fee) berfungsi untuk mengunci unit kendaraan selama maksimal 7 (tujuh) hari kerja.</p>
            <p>2. Kendaraan telah melalui 150 titik inspeksi resmi dan bergaransi mesin & transmisi selama 1 (satu) tahun.</p>
            <p>3. Pelunasan atau persetujuan leasing wajib diselesaikan sebelum serah terima kendaraan (STNK & BPKB).</p>
          </div>

          {/* Section 5: Signature Blocks */}
          <div className="grid grid-cols-3 gap-8 text-center text-xs pt-4 border-t border-neutral-300">
            <div>
              <p className="text-neutral-600 mb-16">Pemesan (Konsumen),</p>
              <p className="font-bold text-neutral-900 uppercase underline">{lead.name}</p>
              <p className="text-[10px] text-neutral-500">Tanda Tangan & Nama Terang</p>
            </div>
            <div>
              <p className="text-neutral-600 mb-16">Sales Consultant,</p>
              <input 
                type="text" 
                value={salesName} 
                onChange={(e) => setSalesName(e.target.value)}
                className="font-bold text-center text-neutral-900 uppercase underline border-b border-neutral-400 bg-transparent outline-none w-full print:border-none" 
              />
              <p className="text-[10px] text-neutral-500">DENKEN MOTORS</p>
            </div>
            <div>
              <p className="text-neutral-600 mb-16">Mengetahui (Branch Manager),</p>
              <p className="font-bold text-neutral-900 uppercase underline">Bramantyo, S.E.</p>
              <p className="text-[10px] text-neutral-500">Kepala Cabang</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
