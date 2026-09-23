"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useParams, useRouter } from 'next/navigation'
import { Menu, Search, X, Moon, Sun, Home, Car, Calculator, MoreHorizontal, GitCompareArrows } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useStore } from '@/store/useStore'
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
      const scrolled = window.scrollY > 40
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
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
  const getNavHref = (href: string) => {
    let finalHref = `/${currentCabang}${href === '/' ? '' : href}`
    return finalHref || '/'
  }

  const isHome = pathname === `/${currentCabang}` || pathname === '/'

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-10 lg:px-16 pt-3 sm:pt-4 pointer-events-none transition-all duration-300">
        <div className={`mx-auto w-full max-w-[1536px] flex items-center justify-between pointer-events-auto rounded-full transition-all duration-500 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-3xl border border-primary/20 shadow-[0_12px_40px_rgba(90,33,50,0.15)] px-3.5 sm:px-5 py-2.5 sm:py-3'
            : 'bg-background/90 backdrop-blur-2xl border border-primary/10 px-4 sm:px-6 py-2.5 sm:py-3.5 shadow-[0_8px_32px_rgba(90,33,50,0.05)]'
        }`}>
          {/* Logo with Branch Pill */}
          <div className="flex items-center gap-3">
            <Link href={getNavHref('/')} className="flex items-center gap-2 group">
              <span className={`font-display text-lg sm:text-2xl font-black tracking-[0.12em] uppercase transition-colors text-primary`}>
                DENKEN<span className="text-foreground">.</span>
              </span>
              <span className={`hidden sm:inline-block rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest border border-primary/30 bg-primary/5 text-primary`}>
                {currentCabang.replace(/-/g, ' ')}
              </span>
            </Link>
          </div>
          
          {/* Centered Desktop Navigation Pill */}
          <nav className="hidden md:flex items-center gap-1 rounded-full p-1.5 text-xs font-bold tracking-wide bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(90,33,50,0.25)]">
            <Link 
              href={getNavHref('/')} 
              className={`rounded-full px-4 py-2 transition-all ${
                pathname === `/${currentCabang}` || pathname === '/' 
                  ? 'bg-white/25 text-white shadow-sm' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              Beranda
            </Link>
            <Link 
              href={getNavHref('/mobil')} 
              className={`rounded-full px-4 py-2 transition-all ${
                pathname.includes('/mobil') 
                  ? 'bg-white/25 text-white shadow-sm' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              Koleksi Mobil
            </Link>
            <Link 
              href={getNavHref('/trade-in')} 
              className={`rounded-full px-4 py-2 transition-all ${
                pathname.includes('/trade-in') 
                  ? 'bg-white/25 text-white shadow-sm' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              Smart Trade-In
            </Link>
            <Link 
              href={getNavHref('/simulasi-kredit')} 
              className={`rounded-full px-4 py-2 transition-all ${
                pathname.includes('/simulasi-kredit') 
                  ? 'bg-white/25 text-white shadow-sm' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              Simulasi Kredit
            </Link>
            <Link 
              href={getNavHref('/tentang-kami')} 
              className={`rounded-full px-4 py-2 transition-all ${
                pathname.includes('/tentang-kami') 
                  ? 'bg-white/25 text-white shadow-sm' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              Tentang Kami
            </Link>
          </nav>

          {/* Right Action Icons & VIP Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              aria-label="Toggle Dark Mode" 
              className={`rounded-full p-2 transition-all hover:scale-105 text-primary hover:bg-primary/10`}
            >
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 block dark:hidden" />
            </button>
            
            <Link 
              href={getNavHref('/mobil')} 
              aria-label="Cari Mobil" 
              className={`hidden sm:flex rounded-full p-2 transition-all hover:scale-105 text-primary hover:bg-primary/10`}
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link 
              href={getNavHref('/kontak')} 
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold tracking-wide text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-[1.03] border border-primary-foreground/20 shadow-[0_8px_24px_rgba(90,33,50,0.4)]"
            >
              <span>Jadwalkan Kunjungan</span>
              <span className="text-[10px]">→</span>
            </Link>

            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              aria-label="Menu" 
              className={`rounded-full p-2 md:hidden transition-colors ${
                isScrolled || !isHome
                  ? 'text-foreground hover:bg-muted'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Full Dropdown Menu */}
        {menuOpen && (
          <div className="mx-auto mt-2 max-w-7xl rounded-2xl bg-background/95 backdrop-blur-2xl border border-border p-3.5 shadow-2xl md:hidden pointer-events-auto animate-in fade-in slide-in-from-top-4">
            <nav className="flex flex-col space-y-1.5 text-sm font-semibold text-foreground">
              <Link 
                onClick={() => setMenuOpen(false)} 
                href={getNavHref('/')} 
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-muted"
              >
                <span>Beranda</span>
                <span className="text-muted-foreground">→</span>
              </Link>
              <Link 
                onClick={() => setMenuOpen(false)} 
                href={getNavHref('/mobil')} 
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-muted"
              >
                <span>Koleksi Mobil</span>
                <span className="text-muted-foreground">→</span>
              </Link>
              <Link 
                onClick={() => setMenuOpen(false)} 
                href={getNavHref('/trade-in')} 
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-muted"
              >
                <span>Smart Trade-In Suite</span>
                <span className="text-muted-foreground">→</span>
              </Link>
              <Link 
                onClick={() => setMenuOpen(false)} 
                href={getNavHref('/simulasi-kredit')} 
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-muted"
              >
                <span>Simulasi Kredit</span>
                <span className="text-muted-foreground">→</span>
              </Link>
              <Link 
                onClick={() => setMenuOpen(false)} 
                href={getNavHref('/tentang-kami')} 
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-muted"
              >
                <span>Tentang Kami</span>
                <span className="text-muted-foreground">→</span>
              </Link>
              <Link 
                onClick={() => setMenuOpen(false)} 
                href={getNavHref('/kontak')} 
                className="w-full text-center mt-2 rounded-full bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg"
              >
                Jadwalkan Kunjungan VIP →
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Bottom Quick Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-background/90 backdrop-blur-xl border-t border-border/80 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <nav className="flex items-center justify-around px-2.5 pt-2 pb-1">
          <Link href={getNavHref('/')} className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${pathname === `/${currentCabang}` || pathname === '/' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
            <Home className="h-5 w-5" />
            <span className="text-[10px]">Beranda</span>
          </Link>
          <Link href={getNavHref('/mobil')} className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${pathname.includes('/mobil') ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
            <Car className="h-5 w-5" />
            <span className="text-[10px]">Koleksi</span>
          </Link>
          <Link href={getNavHref('/trade-in')} className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${pathname.includes('/trade-in') ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
            <GitCompareArrows className="h-5 w-5" />
            <span className="text-[10px]">Trade-In</span>
          </Link>
          <Link href={getNavHref('/simulasi-kredit')} className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${pathname.includes('/simulasi-kredit') ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
            <Calculator className="h-5 w-5" />
            <span className="text-[10px]">Kredit</span>
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${menuOpen ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px]">Menu</span>
          </button>
        </nav>
      </div>
    </>
  )
}
