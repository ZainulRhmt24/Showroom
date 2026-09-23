"use client"

import { useState, useEffect, useTransition, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Lock,
  AlertTriangle,
  LogOut,
  LayoutDashboard,
  Car as CarIcon,
  Users,
  Building2,
  Receipt,
  BarChart3,
  Globe2,
  Store,
  RefreshCw,
  ExternalLink,
  Calendar,
  MessageSquare,
  Bell,
  CheckCircle,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/app/actions/inboxActions'
import { loginAdmin, logoutAdmin, getAdminSession, changePassword } from '@/app/actions/authActions'
import { getCurrentPublicWebsite } from '@/app/actions/showroomActions'
import { getCars } from '@/app/actions/carActions'
import { getLeads } from '@/app/actions/leadActions'
import { getBranches } from '@/app/actions/branchActions'
import { getExpenses, getExpenseStats } from '@/app/actions/expenseActions'
import { getTransactions, getTransactionStats } from '@/app/actions/transactionActions'
import { getCustomers } from '@/app/actions/customerActions'

// Context to share loaded data with sub-pages to avoid refetching
export const AdminContext = createContext<any>(null)

export function useAdminData() {
  return useContext(AdminContext)
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  // Auth State
  const [sessionUser, setSessionUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginForm, setLoginForm] = useState({ email: 'admin@denkenmotors.id', password: '' })
  const [loginError, setLoginError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Real Database Records
  const [dbCars, setDbCars] = useState<any[]>([])
  const [dbLeads, setDbLeads] = useState<any[]>([])
  const [dbCustomers, setDbCustomers] = useState<any[]>([])
  const [dbBranches, setDbBranches] = useState<any[]>([])
  const [dbExpenses, setDbExpenses] = useState<any[]>([])
  const [dbTransactions, setDbTransactions] = useState<any[]>([])
  const [transactionStats, setTransactionStats] = useState<any>({
    thisMonth: { revenue: 0, units: 0 },
    lastMonth: { revenue: 0, units: 0 },
    allTime: { revenue: 0, units: 0 },
    monthlyBreakdown: []
  })

  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  const [expenseStats, setExpenseStats] = useState<any>({
    totalAll: 0, totalMonth: 0, countMonth: 0, byCategory: [],
  })
  const [loadingData, setLoadingData] = useState(false)
  const [publicWebsite, setPublicWebsite] = useState<{ slug: string; path: string } | null>(null)

  // Password Change State
  const [pwdForm, setPwdForm] = useState({ old: '', new: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')
  const [pwdPending, setPwdPending] = useState(false)

  const handleForceChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError('')
    if (pwdForm.new !== pwdForm.confirm) {
      setPwdError('Konfirmasi password tidak cocok.')
      return
    }
    setPwdPending(true)
    const res = await changePassword(pwdForm.old, pwdForm.new)
    if (res.success) {
      setSessionUser({ ...sessionUser, mustChangePassword: false })
    } else {
      setPwdError(res.error || 'Gagal mengubah password.')
    }
    setPwdPending(false)
  }

  // Branches & Store Fallback
  const branches = useStore((state) => state.branches)
  const currentBranch = dbBranches[0] || branches[0] || { name: 'DENKEN Jakarta (Pusat)', city: 'Jakarta', address: 'Jl. TB Simatupang No. 88' }

  // 1. Check server session on mount
  useEffect(() => {
    setMounted(true)
    const init = async () => {
      try {
        const session = await getAdminSession()
        if (session) {
          setSessionUser(session)
        }
      } catch (err) {
        console.error('Session check error:', err)
      } finally {
        setAuthLoading(false)
      }
    }
    init()
  }, [])

  // 2. Fetch fresh database data once authenticated
  const loadFreshData = async () => {
    setLoadingData(true)
    try {
      const ownerId = sessionUser?.userId || null
      const [carsData, leadsData, branchesData, expensesData, transData, txStats, expStats, customersData] = await Promise.all([
        getCars(),
        getLeads(ownerId),
        getBranches(ownerId),
        getExpenses(ownerId),
        getTransactions(ownerId),
        getTransactionStats(ownerId),
        getExpenseStats(ownerId),
        getCustomers(),
      ])
      if (carsData) setDbCars(carsData as any)
      if (leadsData) setDbLeads(leadsData as any)
      if (customersData) setDbCustomers(customersData as any)
      if (branchesData) setDbBranches(branchesData)
      if (expensesData) setDbExpenses(expensesData)
      if (transData) setDbTransactions(transData)
      if (txStats) setTransactionStats(txStats)
      if (expStats) setExpenseStats(expStats)
      setPublicWebsite(null)
    } catch (err) {
      console.error('Failed to load fresh DB data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchNotifications = async () => {
    if (!sessionUser) return
    const res = await getNotifications()
    if (res.success) {
      setNotifications(res.notifications || [])
    }
  }

  useEffect(() => {
    if (sessionUser && !sessionUser.mustChangePassword) {
      loadFreshData()
      fetchNotifications()
      getCurrentPublicWebsite().then(setPublicWebsite).catch(() => setPublicWebsite(null))
    }
  }, [sessionUser])

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    startTransition(async () => {
      const res = await loginAdmin(loginForm.email, loginForm.password)
      if (res.success && res.user) {
        setSessionUser(res.user)
      } else {
        setLoginError(res.error || 'Email atau kata sandi tidak valid.')
      }
    })
  }

  // Handle Logout
  const handleLogout = async () => {
    await logoutAdmin()
    setSessionUser(null)
  }

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <p className="font-bold text-sm animate-pulse">Memverifikasi sesi aman...</p>
      </div>
    )
  }

  // LOGIN SCREEN
  if (!sessionUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-5 py-12">
        <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight text-foreground">
              DENKEN MOTORS
            </h1>
            <p className="text-xs text-muted-foreground">
              Portal Manajemen Showroom & CRM Prospek
            </p>
          </div>

          {loginError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">Email Administrator</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full rounded-xl border border-border bg-muted/40 p-3 text-xs font-semibold outline-none focus:border-primary transition"
                placeholder="admin@denkenmotors.id"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/40 p-3 pr-10 text-xs font-semibold outline-none focus:border-primary transition"
                  placeholder="Masukkan kata sandi..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-primary py-3.5 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {isPending ? 'Memproses Masuk...' : 'Masuk Dashboard'}
            </button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground">
            Akses dilindungi oleh enkripsi sesi server HTTP-Only Cookie.
          </p>
        </div>
      </div>
    )
  }

  // FORCE PASSWORD CHANGE SCREEN
  if (sessionUser.mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-5 py-12">
        <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-500">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-3">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight text-foreground">
              Ubah Password Wajib
            </h1>
            <p className="text-xs text-muted-foreground">
              Demi keamanan, Anda wajib mengubah password sementara sebelum dapat melanjutkan.
            </p>
          </div>

          {pwdError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{pwdError}</span>
            </div>
          )}

          <form onSubmit={handleForceChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">Password Sementara</label>
              <input
                type="password"
                required
                value={pwdForm.old}
                onChange={(e) => setPwdForm({ ...pwdForm, old: e.target.value })}
                className="w-full rounded-xl border border-border bg-muted/40 p-3 text-xs font-semibold outline-none focus:border-primary transition"
                placeholder="Masukkan password saat ini..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">Password Baru (Min 8 Karakter)</label>
              <input
                type="password"
                required
                minLength={8}
                value={pwdForm.new}
                onChange={(e) => setPwdForm({ ...pwdForm, new: e.target.value })}
                className="w-full rounded-xl border border-border bg-muted/40 p-3 text-xs font-semibold outline-none focus:border-primary transition"
                placeholder="Buat password baru..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                minLength={8}
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                className="w-full rounded-xl border border-border bg-muted/40 p-3 text-xs font-semibold outline-none focus:border-primary transition"
                placeholder="Ketik ulang password baru..."
              />
            </div>
            <button
              type="submit"
              disabled={pwdPending}
              className="w-full rounded-xl bg-amber-500 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-amber-600 transition disabled:opacity-50"
            >
              {pwdPending ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
            </button>
          </form>
          <button onClick={handleLogout} className="w-full text-center text-xs font-bold text-muted-foreground hover:text-foreground">Keluar Akun</button>
        </div>
      </div>
    )
  }

  // CALCULATE REAL METRICS
  const readyStockCount = dbCars.filter((c) => !c.isSoldOut && c.badge !== 'SOLD OUT').length
  const activeLeadsCount = dbLeads.filter((l) => l.status !== 'Selesai' && l.status !== 'Ditolak' && l.status !== 'Batal').length

  const TABS = [
    { id: '/admin', label: 'Ringkasan Bisnis', icon: LayoutDashboard },
    { id: '/admin/inbox', label: 'WhatsApp Inbox', icon: MessageSquare },
    { id: '/admin/follow-ups', label: 'Follow-ups', icon: Calendar },
    { id: '/admin/inbox/analytics', label: 'Inbox Analytics', icon: BarChart3 },
    { id: '/admin/pipeline', label: 'Sales Pipeline CRM', icon: Users, badge: activeLeadsCount || undefined },
    { id: '/admin/customers', label: 'Customer', icon: Users, badge: dbCustomers.length },
    { id: '/admin/inventory', label: 'Stok & Dual Pricing', icon: CarIcon, badge: readyStockCount },
    { id: '/admin/branches', label: 'Cabang Showroom', icon: Building2, badge: dbBranches.length },
    { id: '/admin/reports', label: 'Laporan & Analisis', icon: BarChart3 },
    { id: '/admin/expenses', label: 'Pengeluaran', icon: Receipt },
    { id: '/admin/team', label: 'Manajemen Tim', icon: Users },
    { id: '/admin/public-website', label: 'Public Website', icon: Globe2 },
    { id: '/admin/settings/whatsapp', label: 'WhatsApp', icon: Settings },
  ]

  // Context value to pass to sub-pages
  const contextValue = {
    sessionUser,
    dbCars, setDbCars,
    dbLeads, setDbLeads,
    dbCustomers, setDbCustomers,
    dbBranches, setDbBranches,
    dbExpenses, setDbExpenses,
    dbTransactions, setDbTransactions,
    transactionStats,
    expenseStats,
    loadFreshData,
    loadingData
  }

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display font-black text-base text-foreground flex items-center gap-2">
                DENKEN MOTORS <span className="text-xs font-normal text-muted-foreground">| Admin Portal</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Showroom: <strong>{currentBranch.name}</strong> • Akun: <strong>{sessionUser.name}</strong> • Role: <strong>{sessionUser.role}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center justify-center rounded-full border border-border bg-card h-8 w-8 text-muted-foreground hover:text-foreground transition shadow-sm relative"
              >
                <Bell className="h-4 w-4" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-card">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card rounded-2xl border border-border shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
                    <span className="font-bold text-sm">Notifikasi</span>
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <button 
                        onClick={async () => {
                          await markAllNotificationsRead()
                          fetchNotifications()
                        }}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Tandai Semua Dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">Tidak ada notifikasi.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-border hover:bg-muted/50 transition cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}>
                          <Link href={n.link || '#'} onClick={async () => {
                            if (!n.isRead) {
                              await markNotificationRead(n.id)
                              fetchNotifications()
                            }
                            setShowNotifications(false)
                          }}>
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-xs">{n.title}</span>
                              <span className="text-[9px] text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">{n.message}</p>
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                loadFreshData();
                fetchNotifications();
              }}
              disabled={loadingData}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? 'animate-spin' : ''}`} /> Sync
            </button>
            <Link
              href={publicWebsite?.path || '/admin'}
              target="_blank"
              aria-disabled={!publicWebsite}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Preview Website
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" /> Keluar
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="mx-auto max-w-7xl px-5 lg:px-8 flex gap-1 border-t border-border/40 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = pathname === tab.id
            return (
              <Link
                key={tab.id}
                href={tab.id}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`rounded-full text-[10px] px-1.5 py-0.5 font-black ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </header>

      {/* Main Dashboard Content */}
      <AdminContext.Provider value={contextValue}>
        <main className="mx-auto max-w-7xl px-5 lg:px-8 pt-8">
          {children}
        </main>
      </AdminContext.Provider>
    </div>
  )
}
