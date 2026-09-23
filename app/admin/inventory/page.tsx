"use client"

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { InventoryManager } from '@/components/admin/InventoryManager'
import { useAdminData } from '../layout'
import { createCar, updateCar, deleteCar } from '@/app/actions/carActions'
import { Car } from '@/data/cars'

export default function InventoryPage() {
  const { sessionUser, dbCars, dbBranches, loadFreshData } = useAdminData()
  const [isPending, startTransition] = useTransition()

  // Modals & Form State
  const [isCarModalOpen, setIsCarModalOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  
  const [carForm, setCarForm] = useState({
    name: '',
    brand: '',
    year: 2024,
    price: 500000000,
    priceCredit: 475000000,
    monthly: 9500000,
    dp: 75000000,
    transmission: 'Automatic' as const,
    fuel: 'Bensin' as const,
    engine: '2.0L Turbocharged',
    mileage: 12000,
    color: 'Hitam Metalik',
    type: 'SUV' as const,
    condition: 'Bekas' as const,
    location: 'Jakarta',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85',
    gallery: [] as string[],
    badge: 'READY STOCK' as const,
    description: 'Unit istimewa, rawatan berkala bengkel resmi. Kondisi interior wangi & mulus, bebas tabrak dan bebas banjir.',
    features: ['Panoramic Sunroof', 'Keyless Entry', 'Leather Seats', 'Apple CarPlay & Android Auto', 'Cruise Control'],
    taxDate: 'Oktober 2026',
    plateNumber: 'B 1234 DEN (Genap)',
    ownership: 'Tangan Pertama (Pribadi)',
    serviceRecord: 'Bengkel Resmi (ATPM)',
    documents: ['BPKB Asli', 'STNK Hidup', 'Faktur Resmi', 'Kunci Serep', 'Buku Servis'],
    isFloodFree: true,
    isAccidentFree: true,
    isOdometerVerified: true,
    warrantyDays: 365,
  })

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const slug = editingCar ? editingCar.slug : carForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4)
      const payload = {
        ...carForm,
        slug,
        ownerId: sessionUser?.userId || null,
      }
      if (editingCar) {
        await updateCar(editingCar.id, payload as any)
      } else {
        await createCar(payload as any)
      }
      setIsCarModalOpen(false)
      setEditingCar(null)
      loadFreshData()
    })
  }

  const handleEditCarClick = (car: Car) => {
    setEditingCar(car)
    setCarForm({
      name: car.name,
      brand: car.brand,
      year: car.year,
      price: car.price,
      priceCredit: car.priceCredit || Math.round(car.price * 0.95),
      monthly: car.monthly,
      dp: car.dp,
      transmission: car.transmission as any,
      fuel: car.fuel as any,
      engine: car.engine,
      mileage: car.mileage,
      color: car.color,
      type: car.type as any,
      condition: car.condition as any,
      location: car.location,
      image: car.image,
      gallery: car.gallery || [car.image],
      badge: (car.badge as any) || 'READY STOCK',
      description: car.description,
      features: car.features || [],
      taxDate: car.taxDate || 'Oktober 2026',
      plateNumber: car.plateNumber || 'B 1234 DEN (Genap)',
      ownership: car.ownership || 'Tangan Pertama (Pribadi)',
      serviceRecord: car.serviceRecord || 'Bengkel Resmi (ATPM)',
      documents: car.documents || ['BPKB Asli', 'STNK Hidup', 'Faktur Resmi', 'Kunci Serep'],
      isFloodFree: car.isFloodFree !== undefined ? car.isFloodFree : true,
      isAccidentFree: car.isAccidentFree !== undefined ? car.isAccidentFree : true,
      isOdometerVerified: car.isOdometerVerified !== undefined ? car.isOdometerVerified : true,
      warrantyDays: car.warrantyDays || 365,
    })
    setIsCarModalOpen(true)
  }

  const handleDeleteCarClick = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus mobil ini dari stok?')) {
      await deleteCar(id)
      loadFreshData()
    }
  }

  const handleAssignBranch = async (carId: string, branchId: string | null) => {
    await updateCar(carId, { branchId: branchId || undefined } as any)
    loadFreshData()
  }

  const handleToggleStatus = async (carId: string, badge: string, isSoldOut: boolean) => {
    await updateCar(carId, { badge, isSoldOut } as any)
    loadFreshData()
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <InventoryManager
        cars={dbCars}
        branches={dbBranches}
        sessionUser={sessionUser}
        onEditCar={handleEditCarClick}
        onDeleteCar={handleDeleteCarClick}
        onAddCar={() => { setEditingCar(null); setIsCarModalOpen(true) }}
        onAssignBranch={handleAssignBranch}
        onToggleStatus={handleToggleStatus}
      />

      {/* MODAL: ADD / EDIT CAR */}
      {isCarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {editingCar ? 'Perbarui Data Kendaraan' : 'Tambah Mobil Baru'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Lengkapi spesifikasi teknis, dual pricing, dan verifikasi sertifikasi inspeksi.
                </p>
              </div>
              <button
                onClick={() => setIsCarModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCar} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Nama Model Kendaraan</label>
                  <input
                    type="text"
                    required
                    value={carForm.name}
                    onChange={(e) => setCarForm({ ...carForm, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted p-2.5 font-bold outline-none focus:border-primary"
                    placeholder="Contoh: BMW 330i M Sport"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Merek (Brand)</label>
                  <input
                    type="text"
                    required
                    value={carForm.brand}
                    onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted p-2.5 font-bold outline-none focus:border-primary"
                    placeholder="Contoh: BMW"
                  />
                </div>
              </div>

              {/* Dual Pricing Inputs */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <div>
                  <label className="font-bold text-primary block mb-1">Harga Paket Kredit (OTR)</label>
                  <input
                    type="number"
                    required
                    value={carForm.priceCredit}
                    onChange={(e) => setCarForm({ ...carForm, priceCredit: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-muted-foreground">Harga promosi lebih terjangkau khusus leasing</span>
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Harga Tunai / Cash (OTR)</label>
                  <input
                    type="number"
                    required
                    value={carForm.price}
                    onChange={(e) => setCarForm({ ...carForm, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-muted-foreground">Harga pembelian tunai langsung</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Tahun</label>
                  <input type="number" value={carForm.year} onChange={(e) => setCarForm({ ...carForm, year: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-muted p-2.5 font-bold" />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Jarak Tempuh (km)</label>
                  <input type="number" value={carForm.mileage} onChange={(e) => setCarForm({ ...carForm, mileage: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-muted p-2.5 font-bold" />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Transmisi</label>
                  <select value={carForm.transmission} onChange={(e) => setCarForm({ ...carForm, transmission: e.target.value as any })} className="w-full rounded-xl border border-border bg-muted p-2.5 font-bold">
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Bahan Bakar</label>
                  <select value={carForm.fuel} onChange={(e) => setCarForm({ ...carForm, fuel: e.target.value as any })} className="w-full rounded-xl border border-border bg-muted p-2.5 font-bold">
                    <option value="Bensin">Bensin</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Listrik">Listrik</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsCarModalOpen(false)} className="rounded-xl border border-border px-6 py-2.5 font-bold hover:bg-muted">Batal</button>
                <button type="submit" disabled={isPending} className="rounded-xl bg-primary px-6 py-2.5 font-bold text-primary-foreground hover:bg-primary/90">{isPending ? 'Menyimpan...' : 'Simpan Kendaraan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
