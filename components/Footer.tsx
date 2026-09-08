"use client"

import Link from 'next/link'
import { Globe, Mail, MapPin, Phone } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { EditableText } from '@/components/EditableText'

export function Footer() {
  const siteConfig = useStore((state) => state.siteConfig)
  const adminAccounts = useStore((state) => state.adminAccounts)
  const branches = useStore((state) => state.branches)
  const [mounted, setMounted] = useState(false)
  
  const params = useParams()
  const currentCabang = (params?.cabang as string) || 'jakarta'
  const activeBranch = branches.find(b => (b.slug || b.city.toLowerCase().replace(/\s+/g, '-')) === currentCabang) || branches[0]
  const activeOwnerId = activeBranch ? activeBranch.ownerId : 'admin_owner_1'
  
  const activeAdmin = adminAccounts.find(a => (a.ownerId || a.id) === activeOwnerId)
  const currentPhone = activeAdmin?.phone || siteConfig.contactPhone

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <footer className="bg-background border-t border-border py-20 min-h-[400px]"></footer>
  }

  return (
    <footer className="bg-background border-t border-border py-20 text-foreground relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] lg:px-8 relative z-10">
        <div>
          <Link href="/" className="font-display text-2xl font-black tracking-[0.2em]">
            DENKEN<span className="text-primary">.</span>
          </Link>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
            <EditableText contentKey="footer_description" defaultText={siteConfig.footerDescription} multiline />
          </p>
          <div className="mt-8 flex gap-4">
            <a href="#" aria-label="Website" className="rounded-full bg-muted p-3 transition hover:bg-primary hover:text-primary-foreground"><Globe className="h-5 w-5" /></a>
            <a href="#" aria-label="Location" className="rounded-full bg-muted p-3 transition hover:bg-primary hover:text-primary-foreground"><MapPin className="h-5 w-5" /></a>
            <a href="#" aria-label="Email" className="rounded-full bg-muted p-3 transition hover:bg-primary hover:text-primary-foreground"><Mail className="h-5 w-5" /></a>
            <a href="#" aria-label="Phone" className="rounded-full bg-muted p-3 transition hover:bg-primary hover:text-primary-foreground"><Phone className="h-5 w-5" /></a>
          </div>
        </div>
        
        <div>
          <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Navigasi</h3>
          <div className="space-y-4 text-sm font-medium text-muted-foreground">
            <Link className="block transition-colors hover:text-primary" href="/">Home</Link>
            <Link className="block transition-colors hover:text-primary" href="/mobil">Semua Mobil</Link>
            <Link className="block transition-colors hover:text-primary" href="/simulasi-kredit">Kredit</Link>
            <Link className="block transition-colors hover:text-primary" href="/#tentang">Tentang Kami</Link>
          </div>
        </div>
        
        <div>
          <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Layanan</h3>
          <div className="space-y-4 text-sm font-medium text-muted-foreground">
            <Link className="block transition-colors hover:text-foreground" href="/mobil">Beli Mobil</Link>
            <p className="cursor-pointer transition-colors hover:text-foreground">Jual Mobil</p>
            <p className="cursor-pointer transition-colors hover:text-foreground">Trade-In</p>
            <Link className="block transition-colors hover:text-foreground" href="/simulasi-kredit">Kredit Mobil</Link>
            <p className="cursor-pointer transition-colors hover:text-foreground">Test Drive</p>
          </div>
        </div>
        
        <div>
          <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Showroom {activeBranch?.city || 'Pusat'}</h3>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {activeBranch?.address || siteConfig.contactAddress}<br /><br />
            <span className="text-foreground">{activeBranch?.openDays || "Senin - Minggu"}:</span> {activeBranch?.openHours || "09:00 - 20:00"}<br />
            <a
              href={`https://wa.me/${currentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(siteConfig.contactWaText)}`}
              target="_blank"
              rel="noreferrer"
              className="text-foreground mt-2 block font-display text-xl text-primary hover:underline"
            >
              {currentPhone}
            </a>
          </p>
        </div>
      </div>
      
      <div className="mx-auto mt-16 max-w-7xl border-t border-border px-5 pt-8 text-sm font-medium text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4 lg:px-8">
        <p>© 2026 DENKEN MOTORS. All Rights Reserved.</p>
        <div className="flex gap-6">
          <p className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</p>
          <p className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</p>
        </div>
      </div>
    </footer>
  )
}
