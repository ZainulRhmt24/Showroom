import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Car, CARS } from '@/data/cars'

export interface Lead {
  id: string
  type: 'Kredit' | 'Cash' | 'Trade-In' | 'Kontak'
  name: string
  whatsapp: string
  email?: string
  city?: string
  carId?: string
  carName?: string
  details?: Record<string, any>
  createdAt: string
  status: 'Baru' | 'Diproses' | 'Disetujui' | 'Ditolak'
  ownerId?: string
}

export interface Branch {
  id: string
  slug: string
  name: string
  city: string
  address: string
  mapUrl: string
  ownerId?: string
  openDays?: string
  openHours?: string
  createdAt: string
}

export interface Testimonial {
  id: string
  quote: string
  name: string
  car: string
  rating: number
  branchId?: string
}

export interface SiteFeature {
  id: string
  title: string
  description: string
  icon: string
}

export interface SiteConfig {
  heroTitle: string
  heroSubtitle: string
  contactPhone: string
  contactAddress: string
  contactEmail: string
  contactWaText: string
  footerDescription: string
  features: SiteFeature[]
}

interface StoreState {
  wishlist: string[]
  compare: string[]
  recentlyViewed: string[]
  cars: Car[]
  leads: Lead[]
  testimonials: Testimonial[]
  siteConfig: SiteConfig
  dynamicContent: Record<string, string>
  isEditMode: boolean
  branches: Branch[]
  activeClientBranchId: string | null

  addToWishlist: (id: string) => void
  removeFromWishlist: (id: string) => void
  toggleWishlist: (id: string) => void

  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void

  addRecentlyViewed: (id: string) => void

  addCar: (carData: Omit<Car, 'id' | 'slug'> & { id?: string; slug?: string }) => void
  updateCar: (id: string, carData: Partial<Car>) => void
  deleteCar: (id: string) => void
  syncFromDatabase: (cars: Car[], leads: Lead[]) => void
  addLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>) => void
  updateLeadStatus: (id: string, status: Lead['status']) => void
  deleteLead: (id: string) => void

  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => void
  deleteTestimonial: (id: string) => void

  updateSiteConfig: (config: Partial<SiteConfig>) => void

  updateDynamicContent: (key: string, value: string) => void
  toggleEditMode: () => void
  setEditMode: (mode: boolean) => void

  addBranch: (branchData: Omit<Branch, 'id' | 'createdAt' | 'ownerId'>) => void
  updateBranch: (id: string, data: Partial<Branch>) => void
  deleteBranch: (id: string) => void
  setClientBranch: (id: string | null) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      compare: [],
      recentlyViewed: [],
      cars: CARS,
      leads: [],
      testimonials: [],
      siteConfig: {
        heroTitle: "Premium Automotive Experience",
        heroSubtitle: "Temukan koleksi mobil premium impian Anda. Kualitas terjamin, proses transparan, dan layanan prioritas VVIP untuk setiap pelanggan.",
        contactPhone: "+62 877-0916-5697",
        contactAddress: "Jl. TB Simatupang No. 88\nJakarta, 12430",
        contactEmail: "info@denkenmotors.com",
        contactWaText: "Halo DENKEN MOTORS, saya ingin menanyakan unit mobil showroom.",
        footerDescription: "Premium automotive experience untuk perjalanan terbaik Anda. Pilihan mobil terbaik dengan layanan yang tak tertandingi.",
        features: [
          { id: 'f1', title: 'Mobil Berkualitas', description: 'Setiap mobil melalui proses inspeksi dan pengecekan ketat.', icon: 'ShieldCheck' },
          { id: 'f2', title: 'Harga Transparan', description: 'Tidak ada biaya tersembunyi. Dokumen asli dan terjamin.', icon: 'Sparkles' },
          { id: 'f3', title: 'Kredit Mudah', description: 'Pilihan pembiayaan fleksibel dari leasing terkemuka.', icon: 'Calculator' },
          { id: 'f4', title: 'Trade-In', description: 'Tukar tambah mobil lama Anda dengan penawaran instan.', icon: 'GitCompareArrows' },
          { id: 'f5', title: 'Proses Cepat', description: 'Proses pembelian sangat mudah, cepat, dan anti ribet.', icon: 'Clock' },
          { id: 'f6', title: 'Layanan Profesional', description: 'Tim kami siap melayani Anda sepenuh hati.', icon: 'ThumbsUp' }
        ]
      },
      dynamicContent: {},
      isEditMode: false,
      branches: [],
      activeClientBranchId: null,

      addToWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id)
            ? state.wishlist
            : [...state.wishlist, id],
        })),

      removeFromWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.filter((itemId) => itemId !== id),
        })),

      toggleWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id)
            ? state.wishlist.filter((itemId) => itemId !== id)
            : [...state.wishlist, id],
        })),

      addToCompare: (id) =>
        set((state) => {
          if (state.compare.includes(id)) return state
          if (state.compare.length >= 3) {
            return { compare: [...state.compare.slice(1), id] }
          }
          return { compare: [...state.compare, id] }
        }),

      removeFromCompare: (id) =>
        set((state) => ({
          compare: state.compare.filter((itemId) => itemId !== id),
        })),

      clearCompare: () => set({ compare: [] }),

      addRecentlyViewed: (id) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter((itemId) => itemId !== id)
          return { recentlyViewed: [id, ...filtered].slice(0, 10) }
        }),

      addCar: (carData) =>
        set((state) => {
          const newId = carData.id || `c_${Date.now()}`
          const newCar: Car = {
            ...carData,
            id: newId,
            slug: carData.slug || carData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            monthly: carData.monthly || Math.round((carData.price * 0.8 * 1.25) / 60),
            dp: carData.dp || Math.round(carData.price * 0.15),
            location: carData.location || 'Jakarta',
            gallery: carData.gallery && carData.gallery.length > 0 ? carData.gallery : [carData.image],
            features: carData.features || [],
          } as Car

          // Call server action asynchronously
          import('@/app/actions/carActions').then((m) => {
            m.createCar(newCar as any)
          })

          return { cars: [newCar, ...state.cars] }
        }),

      updateCar: (id, data) =>
        set((state) => {
          import('@/app/actions/carActions').then((m) => {
            m.updateCar(id, data as any)
          })

          return {
            cars: state.cars.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c)),
          }
        }),

      deleteCar: (id) =>
        set((state) => {
          import('@/app/actions/carActions').then((m) => {
            m.deleteCar(id)
          })

          return {
            cars: state.cars.filter((c) => c.id !== id),
            wishlist: state.wishlist.filter((wId) => wId !== id),
            compare: state.compare.filter((cId) => cId !== id),
          }
        }),

      syncFromDatabase: (dbCars, dbLeads) =>
        set((state) => {
          const mergedCars = dbCars.length > 0 ? [...dbCars] : [...state.cars];
          if (dbCars.length > 0) {
            const dbCarIds = new Set(dbCars.map((c: any) => c.id));
            state.cars.forEach((c) => {
              if (!dbCarIds.has(c.id)) mergedCars.push(c);
            });
          }

          const mergedLeads = dbLeads.length > 0 ? [...dbLeads] : [...state.leads];
          if (dbLeads.length > 0) {
            const dbLeadIds = new Set(dbLeads.map((l: any) => l.id));
            state.leads.forEach((l) => {
              if (!dbLeadIds.has(l.id)) mergedLeads.push(l);
            });
          }

          return {
            cars: mergedCars,
            leads: mergedLeads,
          }
        }),

      addLead: async (leadData) => {
        const state = get()
        let targetOwnerId = (leadData as any).ownerId
        if (!targetOwnerId && (leadData.carId || leadData.carName)) {
          const matched = state.cars.find(
            (c) => c.id === leadData.carId || (leadData.carName && c.name.toLowerCase() === leadData.carName.toLowerCase())
          )
          if (matched?.ownerId) {
            targetOwnerId = matched.ownerId
          }
        }

        const m = await import('@/app/actions/leadActions')
        const res = await m.createLead({
          ...leadData,
          type: leadData.type === 'Trade-In' ? 'Trade_In' : (leadData.type as any),
          ownerId: targetOwnerId || null,
        })

        if (res.success && res.lead) {
          const newLead: Lead = {
            ...res.lead,
            createdAt: new Date(res.lead.createdAt).toISOString(),
            type: res.lead.type === 'Trade_In' ? 'Trade-In' : res.lead.type,
          } as unknown as Lead

          set((state) => ({
            leads: [newLead, ...state.leads],
          }))
        }
      },

      updateLeadStatus: (id, status) =>
        set((state) => {
          import('@/app/actions/leadActions').then((m) => {
            m.updateLeadStatus(id, status as any)
          })

          const targetLead = state.leads.find((l) => l.id === id)
          let updatedCars = state.cars

          if (targetLead) {
            const carToMark = targetLead.carId || targetLead.carName
            if (carToMark) {
              updatedCars = state.cars.map((c) => {
                if (c.id === targetLead.carId || c.name === targetLead.carName) {
                  if (status === 'Disetujui') {
                    return { ...c, isSoldOut: true, badge: 'SOLD OUT' as const }
                  } else {
                    return { ...c, isSoldOut: false, badge: 'READY STOCK' as const }
                  }
                }
                return c
              })
            }
          }

          return {
            leads: state.leads.map((l) => (l.id === id ? { ...l, status } : l)),
            cars: updatedCars,
          }
        }),

      deleteLead: (id) =>
        set((state) => {
          import('@/app/actions/leadActions').then((m) => {
            m.deleteLead(id)
          })

          const targetLead = state.leads.find((l) => l.id === id)
          let updatedCars = state.cars
          if (targetLead && targetLead.status === 'Disetujui') {
            const carToMark = targetLead.carId || targetLead.carName
            if (carToMark) {
              updatedCars = state.cars.map((c) => {
                if (c.id === targetLead.carId || c.name === targetLead.carName) {
                  return { ...c, isSoldOut: false, badge: 'READY STOCK' as const }
                }
                return c
              })
            }
          }

          return {
            leads: state.leads.filter((l) => l.id !== id),
            cars: updatedCars
          }
        }),

      addTestimonial: (data) =>
        set((state) => ({
          testimonials: [
            ...state.testimonials,
            { ...data, id: `testimoni-${Date.now()}` }
          ]
        })),

      deleteTestimonial: (id) =>
        set((state) => ({
          testimonials: state.testimonials.filter((t) => t.id !== id)
        })),

      updateSiteConfig: (config) =>
        set((state) => ({
          siteConfig: { ...state.siteConfig, ...config }
        })),

      updateDynamicContent: (key, value) =>
        set((state) => ({
          dynamicContent: {
            ...state.dynamicContent,
            [key]: value,
          },
        })),

      toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
      setEditMode: (mode) => set({ isEditMode: mode }),

      addBranch: (branchData) =>
        set((state) => {
          const newBranch: Branch = {
            ...branchData,
            id: `branch_${Date.now()}`,
            createdAt: new Date().toISOString(),
          }
          return { branches: [newBranch, ...state.branches] }
        }),

      updateBranch: (id, data) =>
        set((state) => ({
          branches: state.branches.map((b) => (b.id === id ? { ...b, ...data } : b)),
        })),

      deleteBranch: (id) =>
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== id),
        })),

      setClientBranch: (id) => set({ activeClientBranchId: id }),
    }),
    {
      name: 'denken-motors-storage',
      version: 40,
      partialize: (state) => ({
        wishlist: state.wishlist,
        compare: state.compare,
        recentlyViewed: state.recentlyViewed,
        testimonials: state.testimonials,
        siteConfig: state.siteConfig,
        activeClientBranchId: state.activeClientBranchId,
      }),
      migrate: (persistedState: any, version: number) => {
        let state = persistedState || {}
        
        // Remove legacy auth data if present
        delete state.adminAccounts;
        delete state.isAdminLoggedIn;
        delete state.currentAdminUser;
        delete state.lastNotification;
        delete state.lastEmailNotification;
        delete state.monthlySalesRecords;

        // Remove sensitive CRM data from being persisted on shared computers
        delete state.cars;
        delete state.leads;
        delete state.branches;
        delete state.dynamicContent;

        return state
      },
    }
  )
)