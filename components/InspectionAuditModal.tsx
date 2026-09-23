"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, ShieldCheck, CheckCircle2, AlertCircle, FileText, 
  Gauge, Zap, Check, Printer, Award, Search, Calendar,
  UserCheck, ExternalLink, HelpCircle
} from 'lucide-react'

export interface InspectionAuditModalProps {
  isOpen: boolean
  onClose: () => void
  car: {
    id: string
    name: string
    brand: string
    year: number
    mileage: number
    transmission?: string
    plateNumber?: string | null
    engine?: string
    image?: string
    taxDate?: string | null
  } | null
}

type InspectionCategory = 'sasis' | 'mesin' | 'banjir' | 'eksterior'

export function InspectionAuditModal({ isOpen, onClose, car }: InspectionAuditModalProps) {
  const [activeTab, setActiveTab] = useState<InspectionCategory>('sasis')
  const [showCertificate, setShowCertificate] = useState(false)

  if (!isOpen || !car) return null

  const auditCategories = [
    {
      id: 'sasis' as const,
      label: 'Struktur & Sasis',
      score: '100% Lolos',
      badge: 'Bebas Tabrak',
      points: [
        { name: 'Tulang Apron Depan (Kiri & Kanan)', status: 'PASS', note: 'Titik las OEM pabrik utuh tanpa bekas press/ketok' },
        { name: 'Pilar Utama A, B, dan C', status: 'PASS', note: 'Lurus sempurna, ketebalan cat konsisten tanpa sambungan' },
        { name: 'Lantai Bagasi & Dudukan Ban Serep', status: 'PASS', note: 'Sealant pabrik orisinil tanpa kerutan deformasi tabrakan belakang' },
        { name: 'Chassis Frame Rail Longitudinal', status: 'PASS', note: 'Kelurusan sasis 100% simetris terverifikasi jig alignment' },
        { name: 'Mounting Suspensi & Subframe', status: 'PASS', note: 'Bushing padat, tidak ada retak rambut atau geser akibat benturan' },
      ]
    },
    {
      id: 'banjir' as const,
      label: 'Audit Bebas Banjir',
      score: '100% Lolos',
      badge: 'Zero Moisture',
      points: [
        { name: 'Kolong Karpet Dasar Kabin', status: 'PASS', note: 'Busa dasar kering murni, zero residu lumpur/pasir endapan' },
        { name: 'Jalur Kelistrikan & Fuse Box Bawah Setir', status: 'PASS', note: 'Konektor bersih keemasan, bebas jamur/oksidasi hijau' },
        { name: 'Rel Kursi Elektrik & Baut Seatbelt', status: 'PASS', note: 'Baut belum pernah dibongkar, bebas karat celah tersembunyi' },
        { name: 'Modul ECU & TCU Komputer Mobil', status: 'PASS', note: 'Posisi kering sempurna, seal tahan air OEM belum tersentuh' },
        { name: 'Aroma & Sirkulasi Evaporator AC', status: 'PASS', note: 'Bebas bau apak/lembab khas mobil bekas rendaman air' },
      ]
    },
    {
      id: 'mesin' as const,
      label: 'Mesin & Transmisi',
      score: '98/100',
      badge: 'Grade A+ Engine',
      points: [
        { name: 'Kompresi Silinder Mesin', status: 'PASS', note: 'Deviasi kompresi < 2% antar silinder (standar toleransi pabrik)' },
        { name: 'Diagnostic Scanner OBD-2 Full Scan', status: 'PASS', note: 'Zero DTC Fault Codes (ECU, ABS, Airbag, EPS semua hijau)' },
        { name: 'Perpindahan Gigi Transmisi', status: 'PASS', note: 'Torsi responsif, perpindahan gigi halus tanpa jedug/delay' },
        { name: 'Sistem Pendingin & Radiator Pressure Test', status: 'PASS', note: 'Tekanan radiator stabil 1.1 bar, tanpa kebocoran head gasket' },
        { name: 'Kerapatan Oli Mesin & Transmisi', status: 'PASS', note: 'Blok mesin kering bersih, tidak ada rembesan seal kruk as' },
      ]
    },
    {
      id: 'eksterior' as const,
      label: 'Eksterior & Ban',
      score: '96/100',
      badge: 'Original Finish',
      points: [
        { name: 'Ketebalan Cat (Coating Micrometer)', status: 'PASS', note: 'Rerata 95 - 120 mikron (cat orisinil pabrik tanpa dempul tebal)' },
        { name: 'Ketebalan Tapak Ban (4 Roda)', status: 'PASS', note: 'Tapak ban 85% - 90%, keausan rata seimbang' },
        { name: 'Kaca Depan & Samping (Kaca OEM)', status: 'PASS', note: 'Label logo pabrik tertera di semua kaca, bebas retak batu' },
        { name: 'Lampu LED / Matrix Headlamp', status: 'PASS', note: 'Mika bening tanpa kusam atau kemasukan embun air' },
        { name: 'Ketebalan Kampas & Piringan Cakram Rem', status: 'PASS', note: 'Kampas rem tebal > 75%, piringan rata tanpa gelombang' },
      ]
    }
  ]

  const currentCategoryData = auditCategories.find(c => c.id === activeTab) || auditCategories[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md" 
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-card border border-border/80 rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden z-10 my-auto text-foreground flex flex-col max-h-[92vh]"
      >
        {/* Header Ribbon Certificate Style */}
        <div className="bg-gradient-to-r from-primary via-[#782D43] to-primary p-6 sm:p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none">
            <Award className="w-64 h-64 -mr-16" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.28em] text-white">
                  Sertifikat Audit Independen • 150 Titik Inspeksi
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Lembar Audit Kelaikan & Integritas Unit
              </h2>
              <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-xl">
                Laporan hasil uji diagnostik digital, audit struktur sasis, dan verifikasi fisik komprehensif untuk <strong className="text-white underline">{car.name}</strong> ({car.year}).
              </p>
            </div>

            <button 
              onClick={onClose}
              className="rounded-full bg-white/10 hover:bg-white/25 p-2 text-white transition-colors shrink-0"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-white/60 text-[10px] uppercase font-bold block">Status Kelulusan</span>
              <span className="font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> GRADE A+ (EXCELLENT)
              </span>
            </div>
            <div>
              <span className="text-white/60 text-[10px] uppercase font-bold block">Odometer Teruji</span>
              <span className="font-bold text-white mt-0.5 block font-mono">
                {car.mileage.toLocaleString('id-ID')} KM (Original)
              </span>
            </div>
            <div>
              <span className="text-white/60 text-[10px] uppercase font-bold block">Legalitas BPKB/STNK</span>
              <span className="font-bold text-emerald-300 mt-0.5 block">
                100% Sah & Terverifikasi
              </span>
            </div>
            <div>
              <span className="text-white/60 text-[10px] uppercase font-bold block">Pemeriksa Resmi</span>
              <span className="font-bold text-white mt-0.5 block flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-amber-300" /> DENKEN Tech Team
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-muted/40 border-b border-border/60 px-4 sm:px-8 py-3 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {auditCategories.map((cat) => {
            const isActive = activeTab === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {cat.score}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content Body: Inspection Checkpoints */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
            <div>
              <h3 className="font-display font-black text-lg text-foreground">
                Item Pemeriksaan: {currentCategoryData.label}
              </h3>
              <p className="text-xs text-muted-foreground">
                Semua item di bawah ini telah diuji fisik menggunakan alat kalibrasi standar ATPM.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-500/20">
              <Check className="h-3.5 w-3.5" /> {currentCategoryData.badge}
            </span>
          </div>

          <div className="space-y-3">
            {currentCategoryData.points.map((pt, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-border/60 bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="font-bold text-sm text-foreground">{pt.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">
                    {pt.note}
                  </p>
                </div>

                <div className="pl-7 sm:pl-0 shrink-0">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-[11px] tracking-wider uppercase">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Lolos Uji
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Legal Warranty Box */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Award className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Garansi Uang Kembali 100% (*Buyback Guarantee*)
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Apabila dalam kurun waktu garansi ditemukan sasis bekas tabrakan berat atau bekas banjir yang luput dari lembar inspeksi ini, DENKEN bersedia membeli kembali unit Anda 100% seharga nota pembelian.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition shrink-0 shadow-sm"
            >
              <Printer className="h-3.5 w-3.5 text-primary" /> Cetak Lembar Audit
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-8 bg-card border-t border-border/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted-foreground">
            Nomor Sertifikasi: <strong className="text-foreground font-mono">DK-AUDIT-{car.id.toUpperCase().slice(0, 8)}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-primary px-7 py-2.5 text-xs font-black uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition shadow-md"
          >
            Tutup Lembar Audit
          </button>
        </div>
      </motion.div>
    </div>
  )
}
