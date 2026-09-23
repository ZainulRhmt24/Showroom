"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ShieldCheck, CheckCircle2, Award, Users, Car, Wrench, 
  ArrowRight, FileCheck, Sparkles, Gauge, Compass, MapPin, 
  Clock, Shield, Eye
} from 'lucide-react'

export default function AboutPage() {
  const params = useParams()
  const currentCabang = (params?.cabang as string) || 'jakarta'
  const formattedCabang = currentCabang.replace(/-/g, ' ').toUpperCase()

  const [activeTab, setActiveTab] = useState(0)

  const inspectionCategories = [
    {
      id: 'mesin',
      title: 'Mesin & Transmisi',
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1000&q=80',
      desc: 'Pengecekan mendalam terhadap performa dapur pacu, tekanan kompresi silinder, dan kehalusan transmisi otomatis/manual.',
      highlight: 'Uji Kompresi & Kalibrasi ECU',
      items: [
        'Kompresi silinder & kehalusan idler mesin tanpa getaran abnormal',
        'Pengecekan viskositas oli, cairan radiator, dan kebocoran seal mesin',
        'Kondisi radiator, thermostat, dan pompa pendingin mesin',
        'Perpindahan gigi (Automatic & Manual) halus tanpa jeda atau hentakan',
        'Kinerja turbosupercharger, intercooler, dan injeksi bahan bakar',
        'Audit suara mekanis camshaft dan rantai keteng (timing belt/chain)',
      ],
    },
    {
      id: 'chassis',
      title: 'Rangka & Bodi (Chassis)',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80',
      desc: 'Jaminan integritas 100% bebas dari bekas tabrakan struktur besar, deformasi apron, maupun korosi air banjir.',
      highlight: 'Pengukuran Mikron Cat & Sasis Presisi',
      items: [
        'Struktur pilar A, B, C dan apron depan utuh presisi standar pabrik',
        'Pengukuran ketebalan cat dengan coating thickness gauge digital',
        'Sasis bebas las ulang, retakan, atau sambungan non-pabrikan',
        'Pintu, kap mesin, dan bagasi terpasang simetris dengan celah (gap) presisi',
        'Inspeksi rongga lantai, firewall, dan karpet dari residu lumpur banjir',
        'Seal karet kaca dan list bodi kedap air tanpa indikasi rembesan',
      ],
    },
    {
      id: 'elektrikal',
      title: 'Elektrikal & Elektronik',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
      desc: 'Pemindaian menyeluruh instrumen komputerisasi ECU, modul kenyamanan, sensor radar ADAS, dan sistem infotainment.',
      highlight: 'Diagnostik Komputer OBD-II Zero-Fault',
      items: [
        'Diagnostik ECU OBD-II tanpa fault code (DTC) aktif ataupun disembunyikan',
        'Kinerja lampu Matrix LED, Adaptive Highbeam, dan DRL',
        'Fungsi pendingin AC dual/quad zone (kompresor, evaporator & blower)',
        'Head unit, Apple CarPlay/Android Auto, dan sound system premium',
        'Fitur ADAS (Adaptive Cruise Control, Lane Keeping Assist, Blind Spot Monitor)',
        'Fungsi kamera 360°, sensor parkir ultrasonik, dan power back door',
      ],
    },
    {
      id: 'interior',
      title: 'Interior & Ergonomi',
      image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1000&q=80',
      desc: 'Verifikasi keaslian material kabin kulit nappa/alcantara, sterilisasi higienis interior, dan verifikasi odometer resmi.',
      highlight: 'Odometer Asli & Bebas Bau Lembab',
      items: [
        'Kondisi jok kulit / alcantara bebas sobek, retak parah, dan bau rokok',
        'Fungsi pengaturan kursi elektrik, memory seat, lumbar support & heater/cooler',
        'Kekedapan plafon peredam kabin dan mekanisme sunroof/panoramic glass',
        'Kelengkapan kunci serep (smart key), buku manual, dan buku servis resmi',
        'Keaslian kilometer (Odometer tidak pernah di-reset atau dimanipulasi)',
        'Sterilisasi kabin dengan ozone treatment sebelum unit diserahkan',
      ],
    },
    {
      id: 'kaki-kaki',
      title: 'Rem, Suspensi & Kaki-Kaki',
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1000&q=80',
      desc: 'Pengujian ketahanan suspensi udara (air-suspension), komponen kemudi, dan kestabilan sistem pengereman ABS.',
      highlight: 'Pengereman ABS & Suspensi Stabil',
      items: [
        'Ketebalan tapak ban minimal 75% dengan tahun produksi yang layak',
        'Ketebalan piringan rotor cakram dan kampas rem ABS tanpa getaran',
        'Shockbreaker dan balon air-suspension bebas dari bocor oli maupun udara',
        'Kondisi link stabilizer, tie rod end, ball joint, dan rack steer presisi',
        'Hasil uji jalan: kestabilan kemudi lurus tanpa gejala lari ke kanan/kiri',
        'Keseimbangan velg & ban telah melalui kalibrasi spooring 3D dan balancing',
      ],
    },
  ]

  const corePillars = [
    {
      badge: 'INTEGRITAS FISIK',
      title: '150+ Titik Audit Digital',
      desc: 'Setiap unit melalui pemindaian diagnostik multi-zona oleh inspektur bersertifikat sebelum mendapat sertifikat kelaikan DENKEN.',
      icon: ShieldCheck,
      stat: '100%',
      statLabel: 'Teruji Mandiri',
    },
    {
      badge: 'PROTEKSI MESIN',
      title: 'Garansi 1 Tahun Penuh',
      desc: 'Perlindungan garansi resmi untuk komponen mesin, transmisi, dan kelistrikan vital agar perjalanan Anda selalu tenang.',
      icon: Award,
      stat: '365 Hari',
      statLabel: 'Jaminan Garansi',
    },
    {
      badge: 'MUTLAK AMAN',
      title: 'Bebas Banjir & Laka Struktur',
      desc: 'Jaminan buyback uang kembali 100% jika terbukti kendaraan pernah mengalami tabrakan rangka berat atau genangan air banjir.',
      icon: Car,
      stat: '100%',
      statLabel: 'Jaminan Buyback',
    },
    {
      badge: 'LEGALITAS PASTI',
      title: 'Verifikasi Dokumen Polda & Samsat',
      desc: 'Pemeriksaan keabsahan BPKB, STNK, faktur pembelian pertama, dan riwayat cek fisik resmi instansi kepolisian tanpa sengketa.',
      icon: FileCheck,
      stat: '100%',
      statLabel: 'Absah & Bersih',
    },
  ]

  const metrics = [
    { number: '1.200+', label: 'Kendaraan Mewah Terkurasi', sub: 'Terdistribusi di seluruh Indonesia' },
    { number: '150', label: 'Titik Audit Kelaikan', sub: 'Standar protokol diagnostik resmi' },
    { number: '100%', label: 'Jaminan Bebas Banjir & Tabrakan', sub: 'Klausul buyback legal bermaterai' },
    { number: '99.4%', label: 'Indeks Kepuasan Klien', sub: 'Berdasarkan 800+ ulasan terverifikasi' },
  ]

  return (
    <div className="mobile-page-shell">
      
      {/* 1. HERO SECTION: Cinematic Editorial with Mixed Typography */}
      <section className="bg-card border-b border-border/60 py-10 lg:py-28 text-foreground relative overflow-hidden mb-8 sm:mb-24 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-black/5 dark:bg-black/40 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative mx-auto w-full max-w-[1536px] px-4 sm:px-10 lg:px-16">
          <div className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                The DENKEN Standard
              </span>
            </div>

            <h1 className="font-display text-xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] sm:leading-[1.05] text-foreground">
              Driven by <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-foreground/80">
                UNCOMPROMISED INTEGRITY,
              </span>{' '}
              <span className="font-serif italic font-normal text-muted-foreground sm:block">
                curated for excellence.
              </span>
            </h1>

            <p className="mt-2 sm:mt-4 text-muted-foreground max-w-2xl mx-auto text-[11px] sm:text-lg leading-relaxed font-normal">
              DENKEN MOTORS berdiri dengan satu tujuan fundamental: mendefinisikan ulang standar kepemilikan mobil premium di Indonesia melalui transparansi data mutlak, sertifikasi inspeksi ketat, dan dedikasi concierge kelas atas.
            </p>

            <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-[9px] sm:text-xs text-muted-foreground font-semibold">
              <span className="flex items-center gap-1 sm:gap-2">
                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary" /> Atelier Showroom {formattedCabang}
              </span>
              <span className="flex items-center gap-1 sm:gap-2">
                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary" /> Multi-Point Diagnostic Lab
              </span>
              <span className="flex items-center gap-1 sm:gap-2">
                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary" /> Garansi Resmi 1 Tahun Penuh
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mobile-container space-y-8 sm:space-y-20 lg:space-y-32">

        {/* 2. SECTION 2: THE STORY & PHILOSOPHY (Split Narrative & Atmospheric Photography) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-16 items-center">
          {/* Left Column: Narrative Philosophy */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-6">
            <div className="inline-flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                Atelier Narrative
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-foreground">
              Bukan Sekadar Showroom, <br />
              <span className="font-serif italic font-normal text-muted-foreground">
                melainkan ruang kurasi mahakarya.
              </span>
            </h2>

            <div className="space-y-3 sm:space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              <p>
                Di pasar otomotif kelas atas, ketidakpastian adalah musuh terbesar seorang pembeli. Masalah manipulasi odometer, cacat struktur yang ditutupi dempul tebal, hingga sengketa legalitas berkas adalah hal yang kami tolak dengan tegas sejak hari pertama DENKEN MOTORS beroperasi.
              </p>
              <p>
                Kami memposisikan diri layaknya kurator galeri seni. Setiap kendaraan yang memasuki etalase kami harus melewati seleksi ketat dengan rasio kelulusan hanya <strong>3 dari setiap 10 unit</strong> yang ditawarkan ke meja kurasi kami.
              </p>
              <p>
                Ketika Anda membawa pulang kendaraan dari DENKEN, Anda tidak hanya membawa pulang sebuah mesin berperforma tinggi—Anda membawa kepastian dan rasa tenang mutlak untuk keluarga Anda.
              </p>
            </div>

            <div className="pt-4 border-t border-border/60 grid grid-cols-2 gap-6">
              <div>
                <span className="font-display text-2xl sm:text-3xl font-black text-foreground block">
                  3 : 10
                </span>
                <span className="text-xs text-muted-foreground leading-snug block mt-1">
                  Rasio seleksi unit yang lolos standar showroom kami
                </span>
              </div>
              <div>
                <span className="font-display text-2xl sm:text-3xl font-black text-primary block">
                  Grade A+
                </span>
                <span className="text-xs text-muted-foreground leading-snug block mt-1">
                  Kriteria minimum sasis, mesin & legalitas dokumen
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Curated Showroom Visual Stage */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-border/70 bg-card p-2 sm:p-3 shadow-2xl group">
              <div className="relative rounded-xl sm:rounded-[2rem] overflow-hidden aspect-[4/3]">
                <img 
                  src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85" 
                  alt="DENKEN Motors Atelier Lounge & Gallery" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.95]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                
                {/* Floating Bottom Card */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 p-3 sm:p-5 rounded-2xl bg-background/85 dark:bg-card/85 backdrop-blur-xl border border-border/80 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary block">
                      Ruang Konsultasi Privat
                    </span>
                    <h3 className="font-display text-base font-bold text-foreground mt-0.5">
                      DENKEN Executive Atelier Lounge
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground hidden sm:block">
                    Cabang {formattedCabang}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECTION 3: FOUR PILLARS OF EXCELLENCE */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                Four Pillars of Distinction
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-5xl font-black tracking-tight text-foreground">
              Empat Pilar <span className="font-serif italic font-normal text-muted-foreground">Integritas Kami.</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Fondasi ketat yang menjamin setiap transaksi di showroom DENKEN transparan dan bebas kompromi.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {corePillars.map((pillar, idx) => {
              const IconComp = pillar.icon
              return (
                <div 
                  key={idx}
                  className="rounded-xl sm:rounded-[2.2rem] border border-border/60 bg-card p-3 sm:p-6 lg:p-8 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/40 group"
                >
                  <div className="space-y-2 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                      <div className="h-7 w-7 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComp className="h-3.5 w-3.5 sm:h-6 sm:w-6" />
                      </div>
                      <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary truncate">
                        {pillar.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-xs sm:text-base lg:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 sm:line-clamp-none">
                        {pillar.title}
                      </h3>
                      <p className="mt-1 sm:mt-2.5 text-[9px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 sm:pt-6 mt-2 sm:mt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-0">
                    <span className="font-display text-xs sm:text-xl font-black text-foreground">
                      {pillar.stat}
                    </span>
                    <span className="text-[7px] sm:text-[10px] font-medium text-muted-foreground">
                      {pillar.statLabel}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 4. SECTION 4: 150-POINT INSPECTION LAB SHOWCASE */}
        <section className="rounded-2xl sm:rounded-[2.5rem] border border-border/70 bg-card p-4 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Section Header */}
          <div className="mb-6 sm:mb-12 text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2.5 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                150-Point Audit Protocol
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              Protokol Uji Lab & <span className="font-serif italic font-normal text-muted-foreground">Sertifikasi Fisik.</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Transparansi tidak hanya dijanjikan—tetapi dibuktikan melalui 150 indikator inspeksi teknis yang dapat diaudit langsung sebelum pelunasan unit.
            </p>
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex overflow-x-auto gap-2.5 mb-6 sm:mb-10 pb-2 no-scrollbar justify-start sm:justify-center">
            {inspectionCategories.map((cat, index) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(index)}
                  className={`whitespace-nowrap px-4 sm:px-6 py-3 sm:py-3.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === index
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${activeTab === index ? 'bg-white' : 'bg-primary'}`} />
                {cat.title}
              </button>
            ))}
          </div>

          {/* Active Tab Panel Split: Narrative + Photo + Checkpoints */}
          <div className="rounded-2xl sm:rounded-3xl bg-secondary/40 border border-border/60 p-3.5 sm:p-10">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Photo Stage for Active Inspection Area */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl overflow-hidden aspect-[16/10] border border-border/70 relative shadow-md">
                  <img 
                    src={inspectionCategories[activeTab].image} 
                    alt={inspectionCategories[activeTab].title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-200">
                      Area Inspeksi Terfokus
                    </span>
                    <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                      {inspectionCategories[activeTab].highlight}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-black text-foreground">
                    {inspectionCategories[activeTab].title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {inspectionCategories[activeTab].desc}
                  </p>
                </div>
              </div>

              {/* Right Column: Granular Checked Items */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-2 gap-1.5 sm:gap-3.5">
                  {inspectionCategories[activeTab].items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-1.5 sm:gap-3 bg-card/90 p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-border/50 shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[10px] sm:text-xs font-semibold text-foreground/90 leading-tight">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-5 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-bold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Lembar Audit Resmi Tersedia
                  </span>
                  <Link 
                    href={`/${currentCabang}/mobil`}
                    className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Cari Unit Terinspeksi <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SECTION 5: REAL NUMBERS / CREDIBILITY METRICS */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2.5 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                Proven Track Record
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              Dedikasi dalam <span className="font-serif italic font-normal text-muted-foreground">Angka Nyata.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5">
            {metrics.map((m, idx) => (
              <div 
                key={idx}
                className="rounded-xl sm:rounded-3xl border border-border/60 bg-card p-3 sm:p-8 text-center shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-center"
              >
                <span className="font-display text-xl sm:text-4xl lg:text-5xl font-black text-primary block tracking-tight">
                  {m.number}
                </span>
                <p className="mt-1 sm:mt-2 text-[9px] sm:text-sm font-bold text-foreground line-clamp-2">
                  {m.label}
                </p>
                <span className="mt-0.5 sm:mt-1 text-[7px] sm:text-[11px] text-muted-foreground block truncate">
                  {m.sub}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 6. SECTION 6: CONCIERGE & HANDOVER EXPERIENCE */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-10 items-center rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-card via-card to-primary/5 border border-border/70 p-3.5 sm:p-14 shadow-xl">
          <div className="lg:col-span-7 space-y-3 sm:space-y-6">
            <div className="inline-flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                Executive Experience
              </span>
            </div>

            <h2 className="font-display text-xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              Dari Kunjungan Pertama <br />
              <span className="font-serif italic font-normal text-muted-foreground">
                hingga penyerahan kunci di garasi Anda.
              </span>
            </h2>

            <p className="text-muted-foreground text-xs sm:text-base leading-relaxed">
              Kami percaya kenyamanan Anda tak boleh terganggu oleh birokrasi yang melelahkan. Tim concierge kami menangani seluruh proses—mulai dari perhitungan kredit leasing bunga kompetitif, balik nama BPKB, hingga pengiriman towing tertutup (enclosed carrier) langsung ke alamat Anda.
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-1 sm:pt-2">
              <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="line-clamp-2">Doorstep Test Drive</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="line-clamp-2">Pengurusan Balik Nama</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="line-clamp-2">Pengiriman Towing VIP</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="line-clamp-2">Layanan Darurat 24 Jam</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-border/70 shadow-lg relative group">
              <img 
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80" 
                alt="VIP Handover Experience" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-[9px] sm:text-xs font-bold text-white uppercase tracking-wider">
                Private Handover Bay • DENKEN Showroom
              </span>
            </div>
          </div>
        </section>

        {/* 7. SECTION 7: CLOSING ATELIER INVITATION (CTA) */}
        <section className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6 pt-2 sm:pt-4 pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.28em] text-primary">
              Visit Our Atelier
            </span>
          </div>

          <h2 className="font-display text-xl sm:text-5xl font-black tracking-tight text-foreground">
            Rasakan Sendiri Standar <br />
            <span className="font-serif italic font-normal text-muted-foreground">
              Kemewahan DENKEN MOTORS.
            </span>
          </h2>

          <p className="text-muted-foreground text-xs sm:text-base leading-relaxed max-w-xl mx-auto">
            Kunjungi showroom kami di cabang {formattedCabang} untuk melihat langsung kurasi kendaraan, mencoba sesi test drive privat, atau berdiskusi santai mengenai mobil impian Anda.
          </p>

          <div className="grid grid-cols-2 sm:flex sm:justify-center items-center gap-2 sm:gap-4 pt-2 sm:pt-4">
            <Link
              href={`/${currentCabang}/mobil`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-full bg-primary px-3 sm:px-8 py-2.5 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-wider text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 truncate"
            >
              Jelajahi Koleksi <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            </Link>
            <Link
              href={`/${currentCabang}/kontak`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-full border border-border bg-card px-3 sm:px-8 py-2.5 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted transition-all truncate"
            >
              Sales Concierge
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
