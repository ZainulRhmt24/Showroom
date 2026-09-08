"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, CheckCircle2, Award, Users, Car, Wrench, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState(0)

  const inspectionCategories = [
    {
      title: 'Mesin & Transmisi',
      desc: 'Pengecekan mendalam terhadap performa dapur pacu dan kehalusan perpindahan transmisi.',
      items: [
        'Kompresi silinder & kehalusan idler mesin',
        'Pengecekan oli, coolant, dan kebocoran cairan',
        'Kondisi radiator & sistem pendingin',
        'Perpindahan gigi (Automatic & Manual) tanpa jeda/hentakan',
        'Kondisi turbosupercharger & sistem bahan bakar',
      ],
    },
    {
      title: 'Rangka & Bodi (Chassis)',
      desc: 'Jaminan 100% bebas dari bekas kecelakaan struktur besar dan karat air banjir.',
      items: [
        'Struktur pilar A, B, C dan apron depan utuh presisi',
        'Pengecekan keaslian cat dengan ketebalan standar pabrik',
        'Sasis bebas dari pengelasan ulangan / keretakan',
        'Pintu, kap mesin, dan bagasi terpasang simetris',
        'Inspeksi bebas dari perendaman air banjir',
      ],
    },
    {
      title: 'Elektrikal & Elektronik',
      desc: 'Pemindaian instrumen komputerisasi ECU dan fitur keselamatan kendaraan.',
      items: [
        'Diagnostik ECU OBD-II tanpa indikator eror',
        'Kinerja lampu LED, Xenon, dan DRL',
        'Fungsi sistem pendingin AC (Kompresor & Evaporator)',
        'Head unit, kamera 360°, dan sistem audio',
        'Fitur ADAS (Lane Assist, Adaptive Cruise, Blindspot)',
      ],
    },
    {
      title: 'Interior & Kenyamanan',
      desc: 'Keaslian material kabin dan kebersihan higienis kelas premium.',
      items: [
        'Kondisi jok kulit / fabric bebas dari robekan & bau',
        'Fungsi pengaturan kursi elektrik & fitur memory seat',
        'Kekedapan peredam kabin dan kondisi plafon',
        'Ketersediaan kunci cadangan & buku servis resmi',
        'Keaslian kilometer (Odometer tidak direset)',
      ],
    },
    {
      title: 'Rem, Ban & Kaki-Kaki',
      desc: 'Pengujian kekuatan suspensi dan pengereman untuk keselamatan berkendara.',
      items: [
        'Ketebalan tapak ban minimal 70% dan tahun produksi',
        'Kondisi piringan cakram & kampas rem ABS',
        'Shockbreaker bebas dari kebocoran oli',
        'Kondisi tie rod, ball joint, dan rack steer',
        'Keseimbangan Spooring & Balancing',
      ],
    },
  ]

  return (
    <div className="pt-24 pb-24 min-h-screen bg-secondary/30">
      {/* Theme Responsive Hero */}
      <div className="bg-card border-b border-border/60 py-20 text-foreground relative overflow-hidden mb-16 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary mb-3">The DENKEN Standard</p>
          <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            Drive Your Dream, With Absolute Peace of Mind.
          </h1>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            DENKEN MOTORS hadir untuk mengubah standar pembelian mobil bekas & baru di Indonesia melalui transparansi total, sertifikasi ketat, dan pelayanan kelas atas.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Value Props */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-24">
          <div className="rounded-3xl border border-border/50 bg-card p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold">150+ Titik Inspeksi</h3>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground"> Setiamp unit diperiksa secara presisi oleh teknisi tersertifikasi sebelum masuk showroom.</p>
          </div>

          <div className="rounded-3xl border border-border/50 bg-card p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold">Garansi Mesin 1 Tahun</h3>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Perlindungan garansi resmi untuk ketenangan pikiran selama perjalanan Anda.</p>
          </div>

          <div className="rounded-3xl border border-border/50 bg-card p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Car className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold">Bebas Banjir & Tabrakan</h3>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Jaminan pengembalian uang 100% jika terbukti ada riwayat banjir atau tabrakan struktur.</p>
          </div>

          <div className="rounded-3xl border border-border/50 bg-card p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold">Dokumen Terjamin 100%</h3>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Keabsahan BPKB, STNK, dan Faktur terverifikasi resmi tanpa masalah hukum.</p>
          </div>
        </div>

        {/* 150-Point Inspection Section */}
        <div className="rounded-3xl border border-border/60 bg-card p-8 sm:p-14 shadow-2xl mb-24">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-3">
              <Wrench className="h-4 w-4" /> DENKEN Certified Inspection
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Standard Inspeksi 150 Titik</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm">
              Kami tidak pernah mengompromikan keselamatan Anda. Setiap bagian kendaraan dites dan didokumentasikan dengan ketat.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 mb-8 pb-2 no-scrollbar justify-start sm:justify-center">
            {inspectionCategories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-xs font-bold transition-all ${
                  activeTab === index
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="rounded-2xl bg-secondary/50 p-8 border border-border/50">
            <h3 className="font-display text-2xl font-bold mb-2 text-foreground">{inspectionCategories[activeTab].title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{inspectionCategories[activeTab].desc}</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {inspectionCategories[activeTab].items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-card p-4 rounded-xl border border-border/40">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="font-display text-3xl font-bold">Siap Mengunjungi Showroom Kami?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Tim konsultan kami siap menyambut Anda dengan secangkir kopi premium dan membantu Anda menemukan mobil impian yang sempurna.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/mobil"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
            >
              Lihat Katalog Mobil <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-4 text-sm font-bold hover:bg-muted transition-all"
            >
              Hubungi Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
