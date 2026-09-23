"use client"

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, ChevronDown } from 'lucide-react'
import { useParams } from 'next/navigation'
import { submitPublicLead } from '@/app/actions/publicFormActions'

export default function ContactPage() {
  const params = useParams()
  const cabang = (params.cabang as string) || 'jakarta'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [subject, setSubject] = useState('Konsultasi Pembelian')
  const [message, setMessage] = useState('')

  const [isSuccess, setIsSuccess] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const res = await submitPublicLead(cabang, {
      name,
      whatsapp,
      email,
      subject,
      message
    })

    setIsSubmitting(false)
    if (res.success) {
      setIsSuccess(true)
    } else {
      alert(res.error)
    }
  }

  const faqs = [
    {
      q: 'Bagaimana cara menjadwalkan Test Drive di showroom DENKEN MOTORS?',
      a: 'Anda dapat menghubungi tim sales kami melalui form kontak ini, WhatsApp, atau langsung mengunjungi showroom kami di Jl. TB Simatupang No. 88, Jakarta. Unit siap diuji coba.',
    },
    {
      q: 'Apakah semua mobil di DENKEN MOTORS memiliki garansi?',
      a: 'Ya, seluruh unit kendaraan bersertifikat DENKEN Certified telah lolos inspeksi 150 titik dan mendapatkan jaminan garansi mesin serta transmisi hingga 1 tahun.',
    },
    {
      q: 'Dokumen apa saja yang diperlukan untuk pengajuan kredit?',
      a: 'Dokumen standar yang dibutuhkan antara lain: KTP Suami/Istri, Kartu Keluarga, NPWP, Slip Gaji/Surat Keterangan Usaha, dan Rekening Koran 3 bulan terakhir.',
    },
    {
      q: 'Apakah DENKEN MOTORS melayani pengiriman luar kota/pulau?',
      a: 'Tentu! Kami berpengalaman melayani pengiriman kendaraan secara aman ke seluruh wilayah Indonesia melalui ekspedisi towing darat maupun laut berpengalaman.',
    },
  ]

  return (
    <div className="mobile-page-shell">
      {/* Theme Responsive Header */}
      <div className="bg-card border-b border-border/60 py-7 sm:py-16 text-foreground relative overflow-hidden mb-5 sm:mb-12 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto w-full max-w-[1536px] px-4 sm:px-10 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.28em] text-primary">
              Direct Concierge
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-5xl font-black tracking-tight">Hubungi Kami</h1>
          <p className="mt-2 sm:mt-4 text-muted-foreground max-w-xl mx-auto text-[11px] sm:text-base">
            Tim konsultan otomotif profesional kami siap membantu segala kebutuhan kendaraan impian Anda.
          </p>
        </div>
      </div>

      <div className="mobile-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-12 mb-10 sm:mb-20">
          {/* Showroom Info */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                  Showroom Utama
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">DENKEN MOTORS Jakarta</h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Kunjungi showroom premium kami untuk melihat langsung koleksi kendaraan terbaik dan melakukan test drive.
              </p>
            </div>
            {/* Info Cards */}
            <div className="space-y-2 sm:space-y-4">
              <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-card p-3 sm:p-5 flex items-start gap-2.5 sm:gap-4">
                <div className="rounded-lg sm:rounded-xl bg-primary/10 p-2 sm:p-3 text-primary shrink-0">
                  <MapPin className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-base text-foreground">Alamat Showroom Utama</h4>
                  <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 leading-relaxed">
                    Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan 12430
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-card p-2.5 sm:p-5 flex items-start gap-2 sm:gap-4">
                  <div className="rounded-lg sm:rounded-xl bg-primary/10 p-2 sm:p-3 text-primary shrink-0">
                    <Phone className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[11px] sm:text-base text-foreground truncate">Hotline / WA</h4>
                    <a
                      href="https://wa.me/6287709165697?text=Halo%20DENKEN%20MOTORS,%20saya%20ingin%20konsultasi%20pembelian%20mobil."
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] sm:text-sm text-primary font-bold mt-0.5 sm:mt-1 block hover:underline truncate"
                    >
                      +62 877-0916-5697
                    </a>
                  </div>
                </div>

                <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-card p-2.5 sm:p-5 flex items-start gap-2 sm:gap-4">
                  <div className="rounded-lg sm:rounded-xl bg-primary/10 p-2 sm:p-3 text-primary shrink-0">
                    <Mail className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[11px] sm:text-base text-foreground truncate">Email</h4>
                    <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">hello@denkenmotors.id</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Simulation Box */}
            <div className="relative aspect-[21/9] sm:aspect-video overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-muted flex items-center justify-center p-4 sm:p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-zinc-900/80 to-zinc-950 opacity-90" />
              <div className="relative z-10">
                <MapPin className="h-6 w-6 sm:h-10 sm:w-10 text-primary mx-auto mb-1 sm:mb-2 animate-bounce" />
                <p className="font-display font-bold text-white text-sm sm:text-lg">Showroom TB Simatupang</p>
                <p className="text-[10px] sm:text-xs text-white/70 mt-0.5 sm:mt-1">Jakarta, DKI Jakarta</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 sm:mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Buka Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Form Inquiry */}
          <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl border border-border/50 bg-card p-3.5 sm:p-10 shadow-xl h-fit">
            <h3 className="font-display text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Kirim Pesan / Inkuiri</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-8">
              Isi formulir di bawah ini. Tim Sales kami akan menghubungi Anda dalam waktu 15 menit.
            </p>

            {isSuccess ? (
              <div className="py-8 sm:py-12 text-center space-y-3 sm:space-y-4">
                <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h4 className="font-display text-xl sm:text-2xl font-bold">Pesan Terkirim!</h4>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  Terima kasih, {name}. Tim konsultan kami telah menerima pesan Anda dan akan segera menghubungi nomor WhatsApp Anda.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-3 inline-flex rounded-full border border-border px-5 py-2 text-xs font-bold hover:bg-muted"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
                <div>
                  <label className="text-[10px] sm:text-xs font-bold mb-1 block text-muted-foreground uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold mb-1 block text-muted-foreground uppercase tracking-wider">
                      Nomor WhatsApp
                    </label>
                    <input
                      required
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="0812xxxx"
                      className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold mb-1 block text-muted-foreground uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-bold mb-1 block text-muted-foreground uppercase tracking-wider">
                    Topik Pertanyaan
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Konsultasi Pembelian">Konsultasi Pembelian Mobil</option>
                    <option value="Jadwal Test Drive">Jadwal Test Drive</option>
                    <option value="Simulasi Kredit">Simulasi & Pengajuan Kredit</option>
                    <option value="Tukar Tambah (Trade-In)">Tukar Tambah (Trade-In)</option>
                    <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-bold mb-1 block text-muted-foreground uppercase tracking-wider">
                    Pesan Anda
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan pertanyaan atau kebutuhan spesifik Anda..."
                    className="w-full rounded-xl border border-border bg-muted/50 p-2.5 sm:p-3.5 text-xs sm:text-sm outline-none focus:border-primary resize-none"
                  />
                </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Mengirim...' : <><Send className="h-4 w-4" /> Kirim Pesan</>}
                  </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto mt-8 sm:mt-16">
          <div className="text-center mb-4 sm:mb-10">
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                Pertanyaan Sering Diajukan
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-3xl font-extrabold">Pertanyaan Sering Diajukan</h2>
          </div>

          <div className="space-y-2 sm:space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-xl sm:rounded-2xl border border-border/60 bg-card overflow-hidden transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-2 p-3 sm:p-6 text-left font-display font-bold text-xs sm:text-lg"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-3 sm:px-6 pb-3 sm:pb-6 text-muted-foreground text-xs sm:text-sm leading-relaxed border-t border-border/40 pt-2 sm:pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
