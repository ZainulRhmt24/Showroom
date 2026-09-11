"use client"

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, ChevronDown } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function ContactPage() {
  const addLead = useStore((state) => state.addLead)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [subject, setSubject] = useState('Konsultasi Pembelian')
  const [message, setMessage] = useState('')

  const [isSuccess, setIsSuccess] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addLead({
      type: 'Kontak',
      name,
      whatsapp,
      email,
      details: {
        subject,
        message,
      },
    })

    setIsSuccess(true)
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
    <div className="pt-24 pb-24 min-h-screen bg-secondary/30">
      {/* Theme Responsive Header */}
      <div className="bg-card border-b border-border/60 py-16 text-foreground relative overflow-hidden mb-12 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageSquare className="h-7 w-7" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight">Hubungi Kami</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base">
            Tim konsultan otomotif profesional kami siap membantu segala kebutuhan kendaraan impian Anda.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 mb-20">
          {/* Showroom Info */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-2">Showroom Utama</p>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">DENKEN MOTORS Jakarta</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Kunjungi showroom premium kami untuk melihat langsung koleksi kendaraan terbaik dan melakukan test drive.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/50 bg-card p-5 flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Alamat Showroom</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Jl. TB Simatupang No. 88, Cilandak, Jakarta, DKI Jakarta 12430
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-5 flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Jam Operasional</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Senin - Minggu: <strong className="text-foreground">09:00 - 20:00 WIB</strong>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-5 flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Layanan Hotline & WhatsApp</h4>
                  <a
                    href="https://wa.me/6287709165697?text=Halo%20DENKEN%20MOTORS,%20saya%20ingin%20konsultasi%20pembelian%20mobil."
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary font-bold mt-1 block hover:underline"
                  >
                    +62 877-0916-5697
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-5 flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Email Official</h4>
                  <p className="text-sm text-muted-foreground mt-1">hello@denkenmotors.id</p>
                </div>
              </div>
            </div>

            {/* Map Simulation Box */}
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-border/60 bg-muted flex items-center justify-center p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-zinc-900/80 to-zinc-950 opacity-90" />
              <div className="relative z-10">
                <MapPin className="h-10 w-10 text-primary mx-auto mb-2 animate-bounce" />
                <p className="font-display font-bold text-white text-lg">Showroom TB Simatupang</p>
                <p className="text-xs text-white/70 mt-1">Jakarta, DKI Jakarta</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Buka Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Form Inquiry */}
          <div className="rounded-3xl border border-border/50 bg-card p-8 sm:p-10 shadow-2xl h-fit">
            <h3 className="font-display text-2xl font-bold mb-2">Kirim Pesan / Inkuiri</h3>
            <p className="text-sm text-muted-foreground mb-8">
              Isi formulir di bawah ini. Tim Sales kami akan menghubungi Anda dalam waktu 15 menit.
            </p>

            {isSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="font-display text-2xl font-bold">Pesan Terkirim!</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Terima kasih, {name}. Tim konsultan kami telah menerima pesan Anda dan akan segera menghubungi nomor WhatsApp Anda.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 inline-flex rounded-full border border-border px-6 py-2.5 text-xs font-bold hover:bg-muted"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full rounded-xl border border-border bg-muted/50 p-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                      Nomor WhatsApp
                    </label>
                    <input
                      required
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="0812xxxx"
                      className="w-full rounded-xl border border-border bg-muted/50 p-3.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      className="w-full rounded-xl border border-border bg-muted/50 p-3.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Topik Pertanyaan
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-muted/50 p-3.5 text-sm outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Konsultasi Pembelian">Konsultasi Pembelian Mobil</option>
                    <option value="Jadwal Test Drive">Jadwal Test Drive</option>
                    <option value="Simulasi Kredit">Simulasi & Pengajuan Kredit</option>
                    <option value="Tukar Tambah (Trade-In)">Tukar Tambah (Trade-In)</option>
                    <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Pesan Anda
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan pertanyaan atau kebutuhan spesifik Anda..."
                    className="w-full rounded-xl border border-border bg-muted/50 p-3.5 text-sm outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.01]"
                >
                  <Send className="h-4 w-4" /> Kirim Pesan Sekarang
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-2">FAQ</p>
            <h2 className="font-display text-3xl font-extrabold">Pertanyaan Sering Diajukan</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-border/60 bg-card overflow-hidden transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left font-display font-bold text-lg"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-primary transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed border-t border-border/40 pt-4">
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
