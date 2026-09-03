"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useStore, getActiveShowroom } from '@/store/useStore'

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
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

  const activeShowroom = mounted ? getActiveShowroom(null) : null
  const getNavHref = (href: string) => {
    if (mounted && activeShowroom && activeShowroom !== 'admin_owner_1') {
      const sep = href.includes('?') ? '&' : '?'
      return `${href}${sep}showroom=${activeShowroom}`
    }
    return href
  }

  const isHome = pathname === '/'

  const navClass = `fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
    isScrolled || !isHome
      ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm py-4'
      : 'bg-transparent py-6'
  }`

  const textClass = isScrolled || !isHome ? 'text-foreground' : 'text-white'

  return (
    <header className={navClass}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href={getNavHref('/')} className={`font-display text-2xl font-black tracking-[0.2em] ${textClass}`}>
          DENKEN<span className="text-primary">.</span>
        </Link>
        
        <nav className={`hidden items-center gap-8 text-sm font-semibold lg:flex ${textClass}`}>
          <Link href={getNavHref('/')} className="transition hover:text-primary">Home</Link>
          <Link href={getNavHref('/mobil')} className="transition hover:text-primary">Mobil</Link>
          <Link href={getNavHref('/simulasi-kredit')} className="transition hover:text-primary">Kredit</Link>
          <Link href={getNavHref('/#tentang')} className="transition hover:text-primary">Tentang Kami</Link>
        </nav>

        <div className={`flex items-center gap-2 ${textClass}`}>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle Dark Mode" className="rounded-full p-2 transition hover:bg-foreground/10">
            <Sun className="h-5 w-5 hidden dark:block" />
            <Moon className="h-5 w-5 block dark:hidden" />
          </button>
          
          <Link href={getNavHref('/mobil')} aria-label="Search" className="hidden rounded-full p-2 transition hover:bg-foreground/10 sm:block">
            <Search className="h-5 w-5" />
          </Link>

          <Link href={getNavHref('/kontak')} className="hidden ml-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold tracking-wide text-primary-foreground transition hover:bg-primary/90 hover:scale-105 sm:block">
            Hubungi Kami
          </Link>

          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" className="rounded-full p-2 hover:bg-foreground/10 lg:hidden">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-border shadow-lg lg:hidden">
          <nav className="flex flex-col px-6 py-6 text-sm font-semibold text-foreground space-y-4">
            <Link onClick={() => setMenuOpen(false)} href={getNavHref('/')}>Home</Link>
            <Link onClick={() => setMenuOpen(false)} href={getNavHref('/mobil')}>Mobil</Link>
            <Link onClick={() => setMenuOpen(false)} href={getNavHref('/simulasi-kredit')}>Kredit</Link>
            <Link onClick={() => setMenuOpen(false)} href={getNavHref('/#tentang')}>Tentang Kami</Link>
            <Link onClick={() => setMenuOpen(false)} href={getNavHref('/kontak')} className="w-full text-center mt-4 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Hubungi Kami</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
