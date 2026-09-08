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
  ownerId: string
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

export interface AdminAccount {
  id: string
  name: string
  email: string
  password: string
  role: 'Owner' | 'Manager' | 'Sales Admin'
  phone?: string
  ownerId?: string
  createdAt: string
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

export interface MonthlySalesRecord {
  id: string
  ownerId: string
  year: number
  month: string
  units: number
  revenue: number
}

interface StoreState {
  wishlist: string[]
  compare: string[]
  recentlyViewed: string[]
  cars: Car[]
  leads: Lead[]
  testimonials: Testimonial[]
  siteConfig: SiteConfig
  isAdminLoggedIn: boolean
  currentAdminUser: AdminAccount | null
  adminAccounts: AdminAccount[]
  activeRandomMasterKey: string | null
  lastEmailNotification: {
    from: string
    to: string
    subject: string
    code: string
    timestamp: string
  } | null
  lastNotification: string | null
  monthlySalesRecords: MonthlySalesRecord[]
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

  clearNotification: () => void
  clearEmailNotification: () => void
  adminLogin: (email: string, pass: string) => boolean
  requestMasterKeyEmail: (
    targetEmail: string,
    recipientName?: string
  ) => { success: boolean; code: string; message: string }
  registerAdmin: (
    accountData: Omit<AdminAccount, 'id' | 'createdAt' | 'ownerId'>,
    masterKey: string,
    branchData?: { name: string; city: string; address: string }
  ) => { success: boolean; message: string }
  adminLogout: () => void
  updateMonthlySalesRecord: (year: number, month: string, units: number, revenue: number) => void
  updateDynamicContent: (key: string, value: string) => void
  toggleEditMode: () => void
  setEditMode: (mode: boolean) => void

  addBranch: (branchData: Omit<Branch, 'id' | 'createdAt' | 'ownerId'>) => void
  updateBranch: (id: string, data: Partial<Branch>) => void
  deleteBranch: (id: string) => void
  setClientBranch: (id: string | null) => void
}

export const getActiveShowroom = (searchParamShowroom?: string | null): string => {
  if (typeof window === 'undefined') return searchParamShowroom || 'admin_owner_1'

  if (searchParamShowroom) {
    try {
      sessionStorage.setItem('denken_preview_showroom', searchParamShowroom)
    } catch (e) { }
    return searchParamShowroom
  }

  try {
    const savedPreview = sessionStorage.getItem('denken_preview_showroom')
    if (savedPreview) return savedPreview
  } catch (e) { }

  const state = useStore.getState()
  const loggedInOwner = state.currentAdminUser?.ownerId || state.currentAdminUser?.id
  if (loggedInOwner) return loggedInOwner

  return 'admin_owner_1'
}

const getInitialAuthSession = (): { isAdminLoggedIn: boolean; currentAdminUser: AdminAccount | null } => {
  if (typeof window === 'undefined') return { isAdminLoggedIn: false, currentAdminUser: null }
  try {
    // Memeriksa jembatan sementara dari tombol pratinjau
    const bridge = localStorage.getItem('denken_temp_transfer')
    if (bridge) {
      sessionStorage.setItem('denken_admin_session', bridge)
      localStorage.removeItem('denken_temp_transfer')
    }

    const saved = sessionStorage.getItem('denken_admin_session')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed.isAdminLoggedIn === 'boolean') {
        return {
          isAdminLoggedIn: parsed.isAdminLoggedIn,
          currentAdminUser: parsed.currentAdminUser || null,
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return { isAdminLoggedIn: false, currentAdminUser: null }
}

const saveAuthSession = (isAdminLoggedIn: boolean, currentAdminUser: AdminAccount | null) => {
  if (typeof window !== 'undefined') {
    try {
      if (isAdminLoggedIn && currentAdminUser) {
        const ownerId = currentAdminUser.ownerId || currentAdminUser.id
        sessionStorage.setItem(
          'denken_admin_session',
          JSON.stringify({ isAdminLoggedIn: true, currentAdminUser })
        )
        sessionStorage.setItem('denken_preview_showroom', ownerId)
      } else {
        sessionStorage.removeItem('denken_admin_session')
        sessionStorage.removeItem('denken_preview_showroom')
      }
    } catch (e) {
      // ignore
    }
  }
}

const initialAuth = getInitialAuthSession()

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      compare: [],
      recentlyViewed: [],
      cars: CARS.map((c) => ({ ...c, ownerId: c.ownerId || 'admin_owner_1' })),
      leads: [],
      testimonials: [],
      siteConfig: {
        heroTitle: "Premium Automotive Experience",
        heroSubtitle: "Temukan koleksi mobil premium impian Anda. Kualitas terjamin, proses transparan, dan layanan prioritas VVIP untuk setiap pelanggan.",
        contactPhone: "+62 877-0916-5697",
        contactAddress: "Jl. TB Simatupang No. 88\nJakarta Selatan, 12430",
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
      isAdminLoggedIn: initialAuth.isAdminLoggedIn,
      currentAdminUser: initialAuth.currentAdminUser,
      adminAccounts: [
        {
          id: 'admin_owner_1',
          name: 'Owner Denken Motors',
          email: 'admin@denkenmotors.id',
          password: 'AdminDenken2026!',
          role: 'Owner',
          ownerId: 'admin_owner_1',
          createdAt: new Date().toISOString(),
        },
      ],
      activeRandomMasterKey: null,
      lastEmailNotification: null,
      lastNotification: null,
      monthlySalesRecords: [],
      dynamicContent: {},
      isEditMode: false,
      branches: [
        {
          id: 'branch_jkt',
          slug: 'jakarta',
          name: 'DENKEN Jakarta (Pusat)',
          city: 'Jakarta',
          address: 'Jl. TB Simatupang No. 88, Jakarta Selatan',
          mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.9224483329995!2d106.79724491537233!3d-6.273934995458514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1a065a63901%3A0xc34857b2da63be3d!2sJl.%20TB%20Simatupang%20No.88!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid',
          ownerId: 'admin_owner_1',
          createdAt: new Date().toISOString()
        }
      ],
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
          const sessionAuth = getInitialAuthSession()
          const activeOwnerId =
            carData.ownerId ||
            state.currentAdminUser?.ownerId ||
            state.currentAdminUser?.id ||
            sessionAuth.currentAdminUser?.ownerId ||
            sessionAuth.currentAdminUser?.id ||
            getActiveShowroom(null) ||
            'admin_owner_1'

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
          // Call server action asynchronously
          import('@/app/actions/carActions').then((m) => {
            m.updateCar(id, data as any)
          })

          return {
            cars: state.cars.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c)),
          }
        }),

      deleteCar: (id) =>
        set((state) => {
          // Call server action asynchronously
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
          const mergedCars = dbCars.length > 0 ? [...dbCars.map((c: any) => ({ ...c, ownerId: c.ownerId || 'admin_owner_1' }))] : [...state.cars];
          if (dbCars.length > 0) {
            const dbCarIds = new Set(dbCars.map((c: any) => c.id));
            state.cars.forEach((c) => {
              if (!dbCarIds.has(c.id)) mergedCars.push(c);
            });
          }

          const mergedLeads = dbLeads.length > 0 ? [...dbLeads.map((l: any) => ({ ...l, ownerId: l.ownerId || 'admin_owner_1' }))] : [...state.leads];
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
        if (!targetOwnerId) {
          targetOwnerId = state.currentAdminUser?.ownerId || state.currentAdminUser?.id || 'admin_owner_1'
        }

        // Call server action asynchronously and await the REAL database record
        const m = await import('@/app/actions/leadActions')
        const res = await m.createLead({
          ...leadData,
          type: leadData.type === 'Trade-In' ? 'Trade_In' : (leadData.type as any),
          ownerId: targetOwnerId,
        })

        if (res.success && res.lead) {
          const newLead: Lead = {
            ...res.lead,
            createdAt: new Date(res.lead.createdAt).toISOString(),
            type: res.lead.type === 'Trade_In' ? 'Trade-In' : res.lead.type,
          } as unknown as Lead

          // Trigger native browser notification if enabled
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification("🔔 Leads Customer Baru Masuk!", {
                body: `${newLead.name} (${newLead.type}): ${newLead.whatsapp}`,
              })
            } catch (e) {
              // ignore notification error
            }
          }

          set((state) => ({
            leads: [newLead, ...state.leads],
            lastNotification: `🔔 LEADS BARU: ${newLead.name} (${newLead.type}) - ${newLead.whatsapp}`,
          }))
        }
      },

      updateLeadStatus: (id, status) =>
        set((state) => {
          // Call server action asynchronously
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
          // Call server action asynchronously
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

      clearNotification: () => set({ lastNotification: null }),
      clearEmailNotification: () => set({ lastEmailNotification: null }),

      requestMasterKeyEmail: (targetEmail, recipientName) => {
        const cleanEmail = targetEmail.trim().toLowerCase()
        if (!cleanEmail) {
          return { success: false, code: '', message: 'Silakan isi Email Admin / Owner terlebih dahulu!' }
        }

        // Generate random 4-digit code with DK- prefix (e.g., DK-8492)
        const randomDigits = Math.floor(1000 + Math.random() * 9000)
        const generatedCode = `DK-${randomDigits}`

        const notificationPayload = {
          from: 'flodev261123@gmail.com',
          to: cleanEmail,
          subject: '🔑 Kode Otorisasi Master Key Pendaftaran Showroom',
          code: generatedCode,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        }

        set({
          activeRandomMasterKey: generatedCode,
          lastEmailNotification: notificationPayload,
        })

        return {
          success: true,
          code: generatedCode,
          message: `Kode Master Key (${generatedCode}) telah dikirim dari flodev261123@gmail.com ke ${cleanEmail}!`,
        }
      },

      adminLogin: (email, pass) => {
        const state = useStore.getState()
        const accounts = state.adminAccounts || []
        const inputEmail = email.trim().toLowerCase()

        // 1. Search in registered accounts
        const found = accounts.find(
          (acc) => acc.email.toLowerCase() === inputEmail && acc.password === pass
        )

        if (found) {
          saveAuthSession(true, found)
          set({ isAdminLoggedIn: true, currentAdminUser: found })
          return true
        }

        // 2. Legacy fallback for Owner credentials (admin@denkenmotors.id / AdminDenken2026! or admin/admin)
        if (
          (inputEmail === 'admin@denkenmotors.id' || inputEmail === 'admin') &&
          (pass === 'AdminDenken2026!' || pass === 'admin' || pass === 'admin123')
        ) {
          const ownerAccount: AdminAccount = {
            id: 'admin_owner_1',
            name: 'Owner Showroom Denken Motors',
            email: 'admin@denkenmotors.id',
            password: pass,
            role: 'Owner',
            ownerId: 'admin_owner_1',
            createdAt: new Date().toISOString(),
          }
          saveAuthSession(true, ownerAccount)
          set({ isAdminLoggedIn: true, currentAdminUser: ownerAccount })
          return true
        }

        return false
      },

      registerAdmin: (accountData, masterKey, branchData) => {
        const state = useStore.getState()
        const activeKey = state.activeRandomMasterKey
        const inputKey = masterKey.trim().toUpperCase()

        // Accept dynamically generated key OR fallback DENKEN2026
        const isValidMasterKey =
          (activeKey && inputKey === activeKey.toUpperCase()) ||
          inputKey === 'DENKEN2026'

        if (!isValidMasterKey) {
          return {
            success: false,
            message: 'Kode Master Key acak tidak cocok! Silakan klik "Minta Kode Master Key ke Email" untuk menerima kode dari flodev261123@gmail.com.',
          }
        }

        const accounts = state.adminAccounts || []
        const inputEmail = accountData.email.trim().toLowerCase()

        if (accounts.some((a) => a.email.toLowerCase() === inputEmail)) {
          return {
            success: false,
            message: 'Email tersebut sudah terdaftar sebagai Akun Admin!',
          }
        }

        const newAccountId = `admin_${Date.now()}`
        const assignedOwnerId = accountData.role === 'Owner'
          ? newAccountId
          : (state.currentAdminUser?.ownerId || state.currentAdminUser?.id || newAccountId)

        const newAccount: AdminAccount = {
          ...accountData,
          email: inputEmail,
          id: newAccountId,
          ownerId: assignedOwnerId,
          createdAt: new Date().toISOString(),
        }

        let newBranch: Branch | undefined
        if (accountData.role === 'Owner' && branchData) {
          const baseSlug = branchData.city.toLowerCase().replace(/\s+/g, '-')
          let uniqueSlug = baseSlug
          let counter = 1
          while (state.branches.some(b => b.slug === uniqueSlug)) {
            uniqueSlug = `${baseSlug}-${counter}`
            counter++
          }

          newBranch = {
            id: `branch_${Date.now()}`,
            slug: uniqueSlug,
            name: branchData.name,
            city: branchData.city,
            address: branchData.address,
            mapUrl: '',
            ownerId: assignedOwnerId,
            createdAt: new Date().toISOString()
          }
        }

        let newOwnerCars: Car[] = []
        if (accountData.role === 'Owner' && newBranch) {
          // Make sure data is completely fresh for new admin accounts
          newOwnerCars = []
        }

        import('@/app/actions/userActions').then((m) => {
          m.createUser(newAccount)
        }).catch(err => console.error("Failed to call createUser action", err))
        
        if (newBranch) {
          import('@/app/actions/branchActions').then((m) => {
            m.createBranch(newBranch as any)
          }).catch(err => console.error("Failed to call createBranch action", err))
        }

        saveAuthSession(true, newAccount)
        set((state) => ({
          adminAccounts: [...state.adminAccounts, newAccount],
          branches: newBranch ? [newBranch, ...state.branches] : state.branches,
          cars: [...newOwnerCars, ...state.cars],
          isAdminLoggedIn: true,
          currentAdminUser: newAccount,
          activeRandomMasterKey: null,
          lastEmailNotification: null,
        }))

        return {
          success: true,
          message: 'Akun Admin/Owner baru berhasil dibuat dan otomatis terotentikasi!',
        }
      },

      adminLogout: () => {
        saveAuthSession(false, null)
        set({ isAdminLoggedIn: false, currentAdminUser: null })
      },

      updateMonthlySalesRecord: (year, month, units, revenue) =>
        set((state) => {
          const ownerId = state.currentAdminUser?.ownerId || state.currentAdminUser?.id || 'admin_owner_1'
          const id = `sales_${ownerId}_${year}_${month}`
          const existingIdx = state.monthlySalesRecords.findIndex((r) => r.id === id)

          if (existingIdx !== -1) {
            const updated = [...state.monthlySalesRecords]
            updated[existingIdx] = { ...updated[existingIdx], units, revenue }
            return { monthlySalesRecords: updated }
          }

          return {
            monthlySalesRecords: [
              ...state.monthlySalesRecords,
              { id, ownerId, year, month, units, revenue }
            ]
          }
        }),

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
          const ownerId = state.currentAdminUser?.ownerId || state.currentAdminUser?.id || 'admin_owner_1'
          const newBranch: Branch = {
            ...branchData,
            id: `branch_${Date.now()}`,
            ownerId,
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
      version: 37,
      partialize: (state) => ({
        wishlist: state.wishlist,
        compare: state.compare,
        recentlyViewed: state.recentlyViewed,
        cars: state.cars,
        leads: state.leads,
        testimonials: state.testimonials,
        siteConfig: state.siteConfig,
        adminAccounts: state.adminAccounts,
        monthlySalesRecords: state.monthlySalesRecords,
        dynamicContent: state.dynamicContent,
        branches: state.branches,
        activeClientBranchId: state.activeClientBranchId,
      }),
      migrate: (persistedState: any, version: number) => {
        let state = persistedState || {}
        
        if (version < 37) {
          // Remove accidentally created branches and their cars (Bogor, Bandung, etc.)
          if (Array.isArray(state.branches)) {
            state.branches = state.branches.filter((b: any) => {
              const city = b.city?.toLowerCase() || ''
              return !city.includes('bogor') && !city.includes('bandung')
            })
          }
          if (Array.isArray(state.cars)) {
            state.cars = state.cars.filter((c: any) => {
              const loc = c.location?.toLowerCase() || ''
              return !loc.includes('bogor') && !loc.includes('bandung')
            })
          }
        }

        if (version < 36) {
          // Ensure default branch exists
          if (!state.branches) {
            state.branches = []
          }
          if (!state.branches.find((b: any) => b.id === 'branch_jkt')) {
            state.branches.unshift({
              id: 'branch_jkt',
              name: 'DENKEN Jakarta (Pusat)',
              city: 'Jakarta',
              address: 'Jl. TB Simatupang No. 88, Jakarta Selatan',
              mapUrl: '',
              ownerId: 'admin_owner_1',
              createdAt: new Date().toISOString()
            })
          }

          // Force reset cars to default many cars for admin_owner_1 and assign to Jakarta branch
          state.cars = CARS.map((c) => ({
            ...c,
            ownerId: 'admin_owner_1',
            branchId: 'branch_jkt',
            location: 'Jakarta Selatan'
          }))

          // Inject special admin account
          if (Array.isArray(state.adminAccounts)) {
            if (!state.adminAccounts.find((a: any) => a.email === 'zainul@denkenmotors.id')) {
              state.adminAccounts.unshift({
                id: 'admin_zainul_1',
                name: 'Zainul Rahmat',
                email: 'zainul@denkenmotors.id',
                password: 'Zainul123',
                role: 'Owner',
                ownerId: 'admin_owner_1',
                createdAt: new Date().toISOString(),
              })
            }
          }
        }

        if (Array.isArray(state.cars)) {
          state.cars = state.cars.map((c: any) => ({ ...c, ownerId: c.ownerId || 'admin_owner_1' }))
        } else {
          state.cars = CARS.map((c) => ({ ...c, ownerId: 'admin_owner_1' }))
        }
        if (Array.isArray(state.leads)) {
          state.leads = state.leads.map((l: any) => ({ ...l, ownerId: l.ownerId || 'admin_owner_1' }))
        }
        return state
      },
    }
  )
)