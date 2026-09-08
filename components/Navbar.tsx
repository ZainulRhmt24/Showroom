"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useParams, useRouter } from 'next/navigation'
import { Menu, Search, X, Moon, Sun, Home, Car, Calculator, MoreHorizontal } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useStore, getActiveShowroom } from '@/store/useStore'

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()
  const currentCabang = (params.cabang as string) || 'jakarta'
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const branches = useStore((state) => state.branches)
  const activeBranch = branches.find(b => (b.slug || b.city.toLowerCase().replace(/\s+/g, '-')) === currentCabang) || branches[0]

  useEffect(() => {
    if (mounted) {
      const exists = branches.some(b => (b.slug || b.city.toLowerCase().replace(/\s+/g, '-')) === currentCabang)
      if (!exists && currentCabang !== 'jakarta') {
        router.replace('/jakarta')
      }
    }
  }, [mounted, currentCabang, branches, router])

  const activeShowroom = mounted ? getActiveShowroom(null) : null
  const getNavHref = (href: string) => {
    let finalHref = `/${currentCabang}${href === '/' ? '' : href}`
    if (mounted && activeShowroom && activeShowroom !== 'admin_owner_1') {
      const sep = finalHref.includes('?') ? '&' : '?'
      return `${finalHref}${sep}showroom=${activeShowroom}`
    }
    return finalHref || '/'
  }

  const isHome = pathname === `/${currentCabang}` || pathname === '/'

  const navClass = `fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
    isScrolled || !isHome
      ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm py-4'
      : 'bg-transparent py-6'
  }`

  const textClass = isScrolled || !isHome ? 'text-foreground' : 'text-white'

  return (
    <>
      <header className={navClass}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href={getNavHref('/')} className={`font-display text-2xl font-black tracking-[0.1em] uppercase ${textClass}`}>
              DENKEN {currentCabang.replace(/-/g, ' ')}<span className="text-primary">.</span>
            </Link>
          </div>
          
          <nav className={`hidden items-center gap-8 text-sm font-semibold md:flex ${textClass}`}>
            <Link href={getNavHref('/')} className="transition hover:text-primary">Home</Link>
            <Link href={getNavHref('/mobil')} className="transition hover:text-primary">Mobil</Link>
            <Link href={getNavHref('/simulasi-kredit')} className="transition hover:text-primary">Kredit</Link>
            <Link href={getNavHref('/tentang-kami')} className="transition hover:text-primary">Tentang Kami</Link>
          </nav>

          <div className={`flex items-center gap-2 ${textClass}`}>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle Dark Mode" className="rounded-full p-2 transition hover:bg-foreground/10">
              <Sun className="h-5 w-5 hidden dark:block" />
              <Moon className="h-5 w-5 block dark:hidden" />
            </button>
            
            <Link href={getNavHref('/mobil')} aria-label="Search" className="hidden rounded-full p-2 transition hover:bg-foreground/10 md:block">
              <Search className="h-5 w-5" />
            </Link>

            <Link href={getNavHref('/kontak')} className="hidden ml-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold tracking-wide text-primary-foreground transition hover:bg-primary/90 hover:scale-105 md:block">
              Hubungi Kami
            </Link>

            {/* Mobile More Button (replaces generic hamburger for full-screen menu if needed, but we use bottom nav now) */}
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" className="rounded-full p-2 hover:bg-foreground/10 md:hidden">
              <MoreHorizontal className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Full Menu (Optional, for links that don't fit in bottom nav) */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-background border-b border-border shadow-lg md:hidden">
            <nav className="flex flex-col px-6 py-6 text-sm font-semibold text-foreground space-y-4">
              <Link onClick={() => setMenuOpen(false)} href={getNavHref('/tentang-kami')} className="flex items-center justify-between border-b border-border pb-4">
                Tentang Kami <span className="text-muted-foreground">→</span>
              </Link>
              <Link onClick={() => setMenuOpen(false)} href={getNavHref('/kontak')} className="w-full text-center mt-4 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Hubungi Kami</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-background/80 backdrop-blur-xl border-t border-border pb-safe">
        <nav className="flex items-center justify-around px-2 py-3">
          <Link href={getNavHref('/')} className={`flex flex-col items-center gap-1 p-2 ${pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link href={getNavHref('/mobil')} className={`flex flex-col items-center gap-1 p-2 ${pathname === '/mobil' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Car className="h-5 w-5" />
            <span className="text-[10px] font-bold">Mobil</span>
          </Link>
          <Link href={getNavHref('/simulasi-kredit')} className={`flex flex-col items-center gap-1 p-2 ${pathname === '/simulasi-kredit' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Calculator className="h-5 w-5" />
            <span className="text-[10px] font-bold">Kredit</span>
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className={`flex flex-col items-center gap-1 p-2 ${menuOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-bold">Lainnya</span>
          </button>
        </nav>
      </div>
    </>
  )
}
