"use client"

import Link from 'next/link'
import {
  Car as CarIcon,
  Plus,
  Users,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Building2,
  BarChart3,
  Receipt
} from 'lucide-react'
import { useAdminData } from './layout'

const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

export default function AdminDashboardPage() {
  const {
    dbCars,
    dbLeads,
    transactionStats,
  } = useAdminData()

  // CALCULATE REAL METRICS FROM DATABASE
  const readyStockCount = dbCars.filter((c: any) => !c.isSoldOut && c.badge !== 'SOLD OUT').length
  const totalValuation = dbCars
    .filter((c: any) => !c.isSoldOut && c.badge !== 'SOLD OUT')
    .reduce((sum: number, c: any) => sum + (c.price || 0), 0)
  const activeLeadsCount = dbLeads.filter((l: any) => l.status !== 'Selesai' && l.status !== 'Ditolak' && l.status !== 'Batal').length

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Valuasi Stok OTR</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-black text-foreground">
            {formatIDR(totalValuation)}
          </p>
          <p className="text-[11px] text-muted-foreground">Total modal & nilai jual unit aktif</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Unit Ready Stock</span>
            <CarIcon className="h-4 w-4 text-primary" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-black text-foreground">
            {readyStockCount} <span className="text-sm font-normal text-muted-foreground">Unit</span>
          </p>
          <p className="text-[11px] text-muted-foreground">Tersedia untuk dipajang & test drive</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Prospek Aktif</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-black text-foreground">
            {activeLeadsCount} <span className="text-sm font-normal text-muted-foreground">Orang</span>
          </p>
          <p className="text-[11px] text-muted-foreground">Sedang dalam tahap negosiasi / follow-up</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Omzet Bulan Ini</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {formatIDR(transactionStats?.thisMonth?.revenue || 0)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {transactionStats?.thisMonth?.units || 0} unit terjual bulan ini
          </p>
        </div>
      </div>

      {/* Quick Actions & Recent Inventory Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">Inventaris Terkini</h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Kelola Semua <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-border/40">
            {dbCars.slice(0, 5).map((car: any) => (
              <div key={car.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="h-12 w-16 object-cover rounded-xl border border-border"
                  />
                  <div>
                    <p className="font-bold text-sm text-foreground">{car.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {car.year} • {car.plateNumber || 'Plat B'} • {car.taxDate || 'Pajak Hidup'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono font-bold text-sm text-primary">
                    {formatIDR(car.priceCredit || car.price)}
                  </p>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    car.isSoldOut ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {car.isSoldOut ? 'SOLD OUT' : 'READY'}
                  </span>
                </div>
              </div>
            ))}
            {dbCars.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-xs">
                Belum ada data inventaris kendaraan.
              </div>
            )}
          </div>
        </div>

        {/* Quick Pipeline Status + Quick Links */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-bold text-foreground">Alur Penjualan</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40">
                <span className="font-semibold text-foreground">Prospek Baru</span>
                <span className="font-bold text-blue-500">{dbLeads.filter((l: any) => l.status === 'Baru').length} Leads</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40">
                <span className="font-semibold text-foreground">Follow-Up & Test Drive</span>
                <span className="font-bold text-amber-500">{dbLeads.filter((l: any) => l.status === 'FollowUp' || l.status === 'TestDrive').length} Leads</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40">
                <span className="font-semibold text-foreground">SPK & Booking Fee</span>
                <span className="font-bold text-emerald-500">{dbLeads.filter((l: any) => l.status === 'SPK' || l.status === 'Disetujui').length} Deals</span>
              </div>
            </div>
            <Link
              href="/admin/pipeline"
              className="flex w-full justify-center items-center rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
            >
              Buka Kanban Pipeline
            </Link>
          </div>

          {/* Quick Navigation */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
            <h2 className="font-display text-base font-bold text-foreground">Aksi Cepat</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/branches" className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition text-xs font-bold text-foreground">
                <Building2 className="h-4 w-4 text-primary" /> Cabang
              </Link>
              <Link href="/admin/reports" className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition text-xs font-bold text-foreground">
                <BarChart3 className="h-4 w-4 text-emerald-500" /> Laporan
              </Link>
              <Link href="/admin/expenses" className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition text-xs font-bold text-foreground">
                <Receipt className="h-4 w-4 text-amber-500" /> Pengeluaran
              </Link>
              <Link href="/admin/inventory" className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition text-xs font-bold text-foreground">
                <Plus className="h-4 w-4 text-blue-500" /> + Mobil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
