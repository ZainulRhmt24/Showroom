'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, MessageCircle, X } from 'lucide-react'
import type { PublicShowroom } from '@/lib/public-showroom'

function publicWhatsAppUrl(phone: string | null | undefined, message: string) {
  const number = phone?.replace(/\D/g, '')
  if (!number) return null
  return `https://wa.me/${number.startsWith('0') ? `62${number.slice(1)}` : number}?text=${encodeURIComponent(message)}`
}

export function PublicNavbar({ showroom }: { showroom: PublicShowroom }) {
  const [open, setOpen] = useState(false)
  const base = `/showroom/${showroom.slug}`
  const whatsapp = publicWhatsAppUrl(showroom.whatsapp || showroom.phone, `Halo ${showroom.name}, saya ingin mendapatkan informasi tentang koleksi mobil Anda.`)
  const links = [
    { href: base, label: 'Home' },
    { href: `${base}/cars`, label: 'Mobil' },
    { href: `${base}/about`, label: 'Tentang Kami' },
    { href: `${base}/branches`, label: 'Cabang' },
    { href: `${base}/contact`, label: 'Kontak' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={base} className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          {showroom.logo ? <img src={showroom.logo} alt={`${showroom.name} logo`} className="h-9 w-9 rounded-lg object-contain" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">{showroom.name.slice(0, 1)}</span>}
          <span className="truncate text-sm font-black uppercase tracking-[0.12em] text-slate-950 sm:text-base">{showroom.name}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          {links.map((link) => <Link key={link.href} href={link.href} className="transition hover:text-slate-950">{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          {whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:inline-flex"><MessageCircle className="h-4 w-4" /> Chat WhatsApp</a>}
          <button type="button" className="rounded-lg p-2 text-slate-800 md:hidden" aria-label={open ? 'Tutup menu' : 'Buka menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-1">
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{link.label}</Link>)}
          {whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" /> Chat WhatsApp</a>}
        </div>
      </nav>}
    </header>
  )
}

export function PublicFooter({ showroom }: { showroom: PublicShowroom }) {
  const base = `/showroom/${showroom.slug}`
  const whatsapp = publicWhatsAppUrl(showroom.whatsapp || showroom.phone, `Halo ${showroom.name}, saya ingin mendapatkan informasi.`)
  return <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
      <div><p className="text-base font-black uppercase tracking-[0.12em] text-white">{showroom.name}</p><p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">{showroom.tagline || showroom.description || 'Temukan koleksi kendaraan berkualitas dengan proses pembelian yang mudah.'}</p></div>
      <div><p className="text-sm font-bold text-white">Navigasi</p><div className="mt-3 grid gap-2 text-sm"><Link href={base}>Home</Link><Link href={`${base}/cars`}>Koleksi Mobil</Link><Link href={`${base}/branches`}>Cabang</Link><Link href={`${base}/contact`}>Kontak</Link></div></div>
      <div><p className="text-sm font-bold text-white">Hubungi kami</p><div className="mt-3 space-y-2 text-sm text-slate-400">{showroom.address && <p>{showroom.address}</p>}{showroom.phone && <p>{showroom.phone}</p>}{showroom.email && <p>{showroom.email}</p>}{whatsapp && <a className="inline-block font-semibold text-emerald-400 hover:text-emerald-300" href={whatsapp} target="_blank" rel="noreferrer">Chat WhatsApp →</a>}</div></div>
    </div>
    <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} {showroom.name}. All rights reserved.</div>
  </footer>
}
