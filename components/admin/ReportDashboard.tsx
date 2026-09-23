"use client"

import { useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car as CarIcon,
  Users,
  AlertTriangle,
  BarChart3,
  Calendar,
  ArrowRight,
  Clock,
  Target,
  Percent,
  Receipt,
  ShoppingCart
} from 'lucide-react'

interface ReportDashboardProps {
  cars: any[]
  leads: any[]
  transactions: any[]
  expenses: any[]
  transactionStats: {
    thisMonth: { revenue: number; units: number }
    lastMonth: { revenue: number; units: number }
    allTime: { revenue: number; units: number }
    monthlyBreakdown: { month: string; revenue: number; units: number }[]
  }
  expenseStats: {
    totalAll: number
    totalMonth: number
    countMonth: number
    byCategory: { category: string; total: number; count: number }[]
  }
}

const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
const formatShortIDR = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}Jt`
  return n.toLocaleString('id-ID')
}

const CATEGORY_LABELS: Record<string, string> = {
  Operasional: '🏢 Operasional',
  Servis: '🔧 Servis',
  Poles: '✨ Poles/Detailing',
  Dokumen: '📄 Dokumen',
  Marketing: '📢 Marketing',
  Gaji: '👤 Gaji',
  Lainnya: '📦 Lainnya',
}

export function ReportDashboard({
  cars,
  leads,
  transactions,
  expenses,
  transactionStats,
  expenseStats,
}: ReportDashboardProps) {
  // Computed metrics
  const readyStock = cars.filter(c => !c.isSoldOut && c.badge !== 'SOLD OUT')
  const totalValuation = readyStock.reduce((s, c) => s + (c.price || 0), 0)

  const activeLeads = leads.filter(l => !['Selesai', 'Ditolak', 'Batal'].includes(l.status))
  const newLeads = leads.filter(l => l.status === 'Baru')
  const spkLeads = leads.filter(l => l.status === 'SPK' || l.status === 'Disetujui')
  const completedLeads = leads.filter(l => l.status === 'Selesai')

  // Lead conversion rate
  const totalLeads = leads.length
  const conversionRate = totalLeads > 0 ? Math.round((completedLeads.length / totalLeads) * 100) : 0

  // Aging stock
  const getDaysOnLot = (car: any) => {
    if (!car.createdAt) return 0
    return Math.floor((new Date().getTime() - new Date(car.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  }
  const agingStockCars = readyStock.filter(c => getDaysOnLot(c) > 45).sort((a, b) => getDaysOnLot(b) - getDaysOnLot(a))
  const warningStockCars = readyStock.filter(c => getDaysOnLot(c) > 28 && getDaysOnLot(c) <= 45)

  // Brand performance
  const brandPerformance = useMemo(() => {
    const brandMap = new Map<string, { total: number; sold: number; ready: number; revenue: number }>()
    cars.forEach(c => {
      const entry = brandMap.get(c.brand) || { total: 0, sold: 0, ready: 0, revenue: 0 }
      entry.total++
      if (c.isSoldOut || c.badge === 'SOLD OUT') {
        entry.sold++
        entry.revenue += c.price || 0
      } else {
        entry.ready++
      }
      brandMap.set(c.brand, entry)
    })
    return [...brandMap.entries()]
      .map(([brand, data]) => ({ brand, ...data }))
      .sort((a, b) => b.sold - a.sold)
  }, [cars])

  // Revenue chart max for bar scaling
  const maxRevenue = Math.max(...(transactionStats.monthlyBreakdown.map(m => m.revenue)), 1)

  // Month-over-month growth
  const revenueGrowth = transactionStats.lastMonth.revenue > 0
    ? Math.round(((transactionStats.thisMonth.revenue - transactionStats.lastMonth.revenue) / transactionStats.lastMonth.revenue) * 100)
    : 0

  // Net profit estimate (revenue - expenses)
  const netMonth = transactionStats.thisMonth.revenue - expenseStats.totalMonth

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Laporan & Analisis Bisnis</h2>
        <p className="text-xs text-muted-foreground">
          Ringkasan performa penjualan, stok, dan keuangan showroom Anda.
        </p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue This Month */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Omzet Bulan Ini</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-display text-xl sm:text-2xl font-black text-foreground">
            {formatIDR(transactionStats.thisMonth.revenue)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px]">
            {revenueGrowth >= 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +{revenueGrowth}%
              </span>
            ) : (
              <span className="text-rose-500 font-bold flex items-center gap-0.5">
                <TrendingDown className="h-3 w-3" /> {revenueGrowth}%
              </span>
            )}
            <span className="text-muted-foreground">vs bulan lalu</span>
          </div>
        </div>

        {/* Units Sold This Month */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Unit Terjual</span>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <p className="font-display text-xl sm:text-2xl font-black text-foreground">
            {transactionStats.thisMonth.units} <span className="text-sm font-normal text-muted-foreground">Unit</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            Bulan lalu: {transactionStats.lastMonth.units} unit
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Konversi Lead</span>
            <Target className="h-4 w-4 text-blue-500" />
          </div>
          <p className="font-display text-xl sm:text-2xl font-black text-foreground">
            {conversionRate}%
          </p>
          <p className="text-[11px] text-muted-foreground">
            {completedLeads.length} selesai dari {totalLeads} total leads
          </p>
        </div>

        {/* Net Profit Estimate */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Laba Bersih (Est.)</span>
            <Receipt className="h-4 w-4 text-amber-500" />
          </div>
          <p className={`font-display text-xl sm:text-2xl font-black ${netMonth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
            {formatIDR(netMonth)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Omzet - Pengeluaran bulan ini
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart (Simplified Bar Chart) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Tren Penjualan (6 Bulan)
            </h3>
            <span className="text-xs text-muted-foreground">
              Total: {formatIDR(transactionStats.allTime.revenue)} ({transactionStats.allTime.units} unit)
            </span>
          </div>

          {/* Simple bar chart */}
          <div className="flex items-end gap-3 h-44 pt-4">
            {transactionStats.monthlyBreakdown.map((m, i) => {
              const heightPercent = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0
              const isCurrentMonth = i === transactionStats.monthlyBreakdown.length - 1

              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-bold text-muted-foreground">{m.units}u</span>
                  <span className="text-[9px] font-mono font-bold text-foreground">{formatShortIDR(m.revenue)}</span>
                  <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                    <div
                      className={`w-full max-w-[48px] rounded-t-lg transition-all duration-500 ${
                        isCurrentMonth ? 'bg-primary' : 'bg-primary/30'
                      }`}
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground">{m.month}</span>
                </div>
              )
            })}

            {transactionStats.monthlyBreakdown.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                Belum ada data transaksi
              </div>
            )}
          </div>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" /> Funnel Prospek
          </h3>

          <div className="space-y-2.5">
            {[
              { label: 'Baru', count: newLeads.length, color: 'bg-blue-500', width: totalLeads > 0 ? Math.max((newLeads.length / totalLeads) * 100, 8) : 100 },
              { label: 'Follow-Up & Test Drive', count: leads.filter(l => l.status === 'FollowUp' || l.status === 'TestDrive').length, color: 'bg-amber-500', width: totalLeads > 0 ? Math.max((leads.filter(l => l.status === 'FollowUp' || l.status === 'TestDrive').length / totalLeads) * 100, 8) : 60 },
              { label: 'Negosiasi', count: leads.filter(l => l.status === 'Negosiasi' || l.status === 'Diproses').length, color: 'bg-cyan-500', width: totalLeads > 0 ? Math.max((leads.filter(l => l.status === 'Negosiasi' || l.status === 'Diproses').length / totalLeads) * 100, 8) : 40 },
              { label: 'SPK / Booking', count: spkLeads.length, color: 'bg-emerald-500', width: totalLeads > 0 ? Math.max((spkLeads.length / totalLeads) * 100, 8) : 20 },
              { label: 'Selesai (Sold)', count: completedLeads.length, color: 'bg-green-600', width: totalLeads > 0 ? Math.max((completedLeads.length / totalLeads) * 100, 8) : 10 },
            ].map((stage) => (
              <div key={stage.label} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground">{stage.label}</span>
                  <span className="font-bold text-muted-foreground">{stage.count}</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-700`}
                    style={{ width: `${stage.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Batal / Ditolak</span>
            <span className="font-bold text-rose-500">
              {leads.filter(l => l.status === 'Batal' || l.status === 'Ditolak').length} leads
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Aging Stock + Brand Performance + Expense Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Aging Stock Alert */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" /> Aging Stock
            {agingStockCars.length > 0 && (
              <span className="rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black px-2 py-0.5">
                {agingStockCars.length}
              </span>
            )}
          </h3>

          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {agingStockCars.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <CarIcon className="h-6 w-6 mx-auto mb-2 opacity-40" />
                Tidak ada unit aging stock. Semua aman! ✅
              </div>
            ) : (
              agingStockCars.map((car) => (
                <div key={car.id} className="flex items-center justify-between p-3 rounded-xl bg-rose-500/[0.04] border border-rose-500/10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={car.image} alt={car.name} className="h-9 w-12 object-cover rounded-lg border border-border" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-foreground truncate">{car.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatIDR(car.price)}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    🔴 {getDaysOnLot(car)}d
                  </span>
                </div>
              ))
            )}
          </div>

          {warningStockCars.length > 0 && (
            <div className="pt-3 border-t border-border/40 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              ⚠️ {warningStockCars.length} unit mendekati aging (&gt;28 hari)
            </div>
          )}
        </div>

        {/* Brand Performance */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Performa Brand
          </h3>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
            {brandPerformance.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Belum ada data</div>
            ) : (
              brandPerformance.map((bp, i) => (
                <div key={bp.brand} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black text-muted-foreground w-5">#{i + 1}</span>
                    <div>
                      <p className="font-bold text-xs text-foreground">{bp.brand}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {bp.total} total • {bp.ready} ready • {bp.sold} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px] font-bold text-primary">{formatShortIDR(bp.revenue)}</p>
                    <p className="text-[9px] text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expense Summary */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-4 w-4 text-amber-500" /> Pengeluaran Bulan Ini
          </h3>

          <div className="text-center py-2">
            <p className="font-display text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatIDR(expenseStats.totalMonth)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {expenseStats.countMonth} transaksi pengeluaran
            </p>
          </div>

          <div className="space-y-2">
            {expenseStats.byCategory.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Belum ada pengeluaran tercatat bulan ini
              </div>
            ) : (
              expenseStats.byCategory.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                  <span className="text-[11px] font-semibold text-foreground">
                    {CATEGORY_LABELS[cat.category] || cat.category}
                  </span>
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {formatIDR(cat.total)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Sepanjang Waktu</span>
            <span className="font-mono font-bold text-foreground">{formatIDR(expenseStats.totalAll)}</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-emerald-500" /> Riwayat Transaksi Penjualan
          </h3>
          <span className="text-xs text-muted-foreground">{transactions.length} transaksi tercatat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Mobil</th>
                <th className="p-3">Pembeli</th>
                <th className="p-3">Harga Jual</th>
                <th className="p-3">Pembayaran</th>
                <th className="p-3">Cabang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {transactions.slice(0, 10).map((tx: any) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition">
                  <td className="p-3 text-muted-foreground font-semibold">
                    {new Date(tx.soldAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-foreground">{tx.carName}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold text-foreground">{tx.buyerName}</p>
                    {tx.buyerPhone && <p className="text-[10px] text-muted-foreground">{tx.buyerPhone}</p>}
                  </td>
                  <td className="p-3 font-mono font-bold text-primary">{formatIDR(tx.salePrice)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.paymentMethod === 'Kredit' ? 'bg-blue-500/10 text-blue-600' :
                      tx.paymentMethod === 'TradeIn' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground font-semibold">
                    {tx.branch?.name || '—'}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Belum ada transaksi penjualan tercatat
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
