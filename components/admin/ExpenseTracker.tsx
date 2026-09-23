"use client"

import { useState } from 'react'
import {
  Plus,
  Trash2,
  Receipt,
  X,
  Calendar,
  DollarSign,
  Car as CarIcon,
  Building2
} from 'lucide-react'

interface ExpenseTrackerProps {
  expenses: any[]
  cars: any[]
  branches: any[]
  onCreateExpense: (data: any) => Promise<void>
  onDeleteExpense: (id: string) => Promise<void>
}

const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

const CATEGORIES = [
  { value: 'Operasional', label: '🏢 Operasional', desc: 'Listrik, air, sewa' },
  { value: 'Servis', label: '🔧 Servis', desc: 'Perbaikan unit' },
  { value: 'Poles', label: '✨ Poles/Detailing', desc: 'Poles, coating' },
  { value: 'Dokumen', label: '📄 Dokumen', desc: 'Balik nama, mutasi' },
  { value: 'Marketing', label: '📢 Marketing', desc: 'Iklan, promosi' },
  { value: 'Gaji', label: '👤 Gaji', desc: 'Gaji staff' },
  { value: 'Lainnya', label: '📦 Lainnya', desc: '' },
]

export function ExpenseTracker({ expenses, cars, branches, onCreateExpense, onDeleteExpense }: ExpenseTrackerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterCategory, setFilterCategory] = useState('Semua')
  const [form, setForm] = useState({
    category: 'Operasional',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    carId: '',
    branchId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onCreateExpense({
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
        carId: form.carId || undefined,
        branchId: form.branchId || undefined,
      })
      setIsModalOpen(false)
      setForm({
        category: 'Operasional',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        carId: '',
        branchId: '',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Hapus catatan pengeluaran ini?')) {
      await onDeleteExpense(id)
    }
  }

  const filteredExpenses = filterCategory === 'Semua'
    ? expenses
    : expenses.filter((e: any) => e.category === filterCategory)

  // Monthly totals
  const now = new Date()
  const thisMonthExpenses = expenses.filter((e: any) => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalThisMonth = thisMonthExpenses.reduce((s: number, e: any) => s + e.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Pengeluaran Operasional</h2>
          <p className="text-xs text-muted-foreground">
            Catat semua biaya operasional showroom — servis, poles, dokumen, marketing, dll.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Catat Pengeluaran
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-bold uppercase">Bulan Ini</span>
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <p className="font-display text-lg font-black text-rose-600 dark:text-rose-400">{formatIDR(totalThisMonth)}</p>
          <p className="text-[10px] text-muted-foreground">{thisMonthExpenses.length} transaksi</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-bold uppercase">Total Semua</span>
            <DollarSign className="h-3.5 w-3.5" />
          </div>
          <p className="font-display text-lg font-black text-foreground">{formatIDR(expenses.reduce((s: number, e: any) => s + e.amount, 0))}</p>
          <p className="text-[10px] text-muted-foreground">{expenses.length} transaksi</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-bold uppercase">Terbesar</span>
            <Receipt className="h-3.5 w-3.5" />
          </div>
          <p className="font-display text-lg font-black text-foreground">
            {expenses.length > 0 ? formatIDR(Math.max(...expenses.map((e: any) => e.amount))) : 'Rp 0'}
          </p>
          <p className="text-[10px] text-muted-foreground">pengeluaran terbesar</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-bold uppercase">Rata-rata</span>
            <Receipt className="h-3.5 w-3.5" />
          </div>
          <p className="font-display text-lg font-black text-foreground">
            {expenses.length > 0 ? formatIDR(Math.round(expenses.reduce((s: number, e: any) => s + e.amount, 0) / expenses.length)) : 'Rp 0'}
          </p>
          <p className="text-[10px] text-muted-foreground">per transaksi</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('Semua')}
          className={`rounded-full px-3 py-1.5 text-[11px] font-bold border transition ${
            filterCategory === 'Semua' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          Semua
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold border transition ${
              filterCategory === cat.value ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Expense Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Deskripsi</th>
                <th className="p-3">Terkait Unit</th>
                <th className="p-3">Cabang</th>
                <th className="p-3">Jumlah</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredExpenses.map((expense: any) => (
                <tr key={expense.id} className="hover:bg-muted/30 transition">
                  <td className="p-3 font-semibold text-muted-foreground">
                    {new Date(expense.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground">
                      {CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-foreground max-w-[200px] truncate">{expense.description}</td>
                  <td className="p-3 text-muted-foreground">
                    {expense.car ? `${expense.car.brand} ${expense.car.name}` : '—'}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {expense.branch?.name || '—'}
                  </td>
                  <td className="p-3 font-mono font-bold text-rose-600 dark:text-rose-400">{formatIDR(expense.amount)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="rounded-lg p-1.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <Receipt className="h-6 w-6 mx-auto mb-2 opacity-40" />
                    Belum ada pengeluaran tercatat
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Catat Pengeluaran Baru</h3>
                <p className="text-xs text-muted-foreground">Input biaya operasional showroom.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Deskripsi</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                  placeholder="Contoh: Poles dan coating BMW X3"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                  placeholder="500000"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Terkait Unit (Opsional)</label>
                  <select
                    value={form.carId}
                    onChange={(e) => setForm({ ...form, carId: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                  >
                    <option value="">— Tidak terkait —</option>
                    {cars.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.brand} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Cabang (Opsional)</label>
                  <select
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 font-bold outline-none focus:border-primary transition"
                  >
                    <option value="">— Semua Cabang —</option>
                    {branches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
