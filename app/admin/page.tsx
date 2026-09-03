"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Car as CarIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  LayoutDashboard,
  ExternalLink,
  X,
  PhoneCall,
  RefreshCw,
  Lock,
  LogOut,
  ShieldCheck,
  Sparkles,
  Upload,
  CheckCircle2,
  Eye,
  EyeOff,
  Bell,
  BellRing,
  UserPlus,
  KeyRound,
  ShieldAlert,
  Mail,
  Send,
  Copy,
  Check,
  Settings,
  Calculator,
  GitCompareArrows,
  Clock,
  ThumbsUp,
  Star,
  Heart,
  Award,
  CheckCircle,
  Zap
} from 'lucide-react'
import { useStore, Lead, AdminAccount } from '@/store/useStore'
import { Car } from '@/data/cars'

const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

export const AVAILABLE_ICONS = [
  { id: 'ShieldCheck', icon: ShieldCheck, label: 'Keamanan' },
  { id: 'Sparkles', icon: Sparkles, label: 'Menarik' },
  { id: 'Calculator', icon: Calculator, label: 'Keuangan' },
  { id: 'GitCompareArrows', icon: GitCompareArrows, label: 'Tukar Tambah' },
  { id: 'Clock', icon: Clock, label: 'Waktu' },
  { id: 'ThumbsUp', icon: ThumbsUp, label: 'Kualitas' },
  { id: 'Star', icon: Star, label: 'Bintang' },
  { id: 'CarIcon', icon: CarIcon, label: 'Mobil' },
  { id: 'Heart', icon: Heart, label: 'Hati' },
  { id: 'Award', icon: Award, label: 'Penghargaan' },
  { id: 'CheckCircle', icon: CheckCircle, label: 'Selesai' },
  { id: 'Zap', icon: Zap, label: 'Cepat' },
]

const formatDots = (n?: number | string | null) => {
  if (n === undefined || n === null || n === '') return ''
  const num = typeof n === 'number' ? n : parseInt(n.toString().replace(/\D/g, ''), 10)
  return isNaN(num) ? '' : num.toLocaleString('id-ID')
}

const parseDots = (s: string) => {
  const cleaned = s.replace(/\D/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

function buildAdminWaUrl(lead: Lead) {
  let rawPhone = lead.whatsapp.replace(/[^0-9]/g, '')
  if (rawPhone.startsWith('0')) {
    rawPhone = '62' + rawPhone.slice(1)
  }

  // Get car details from store if available
  const allCars = useStore.getState().cars
  const matchedCar = allCars.find(
    (c) => c.id === lead.carId || (lead.carName && c.name.toLowerCase() === lead.carName.toLowerCase())
  )

  const carName = matchedCar ? matchedCar.name : lead.carName || 'Unit Mobil Impian'
  const carYear = matchedCar ? matchedCar.year.toString() : ''
  const carPrice = matchedCar ? formatIDR(matchedCar.price) : lead.details?.carPrice ? formatIDR(Number(lead.details.carPrice)) : ''
  const carSpecs = matchedCar ? `${matchedCar.engine} • ${matchedCar.transmission} • ${matchedCar.fuel}` : ''
  const carImage = matchedCar?.image ? `🖼️ *Foto Unit*: ${matchedCar.image}\n` : ''

  const cityText = lead.city ? lead.city : 'Jakarta'
  const currentHour = new Date().getHours()
  const timeGreeting = currentHour < 12 ? 'Selamat Pagi' : currentHour < 15 ? 'Selamat Siang' : 'Selamat Sore'

  let msg = ''

  if (lead.type === 'Kredit') {
    const rawDp = lead.details?.dp || (matchedCar ? matchedCar.dp : '')
    const dpStr = rawDp ? (rawDp.toString().includes('Rp') ? rawDp : `Rp ${formatDots(rawDp)}`) : 'Sesuai Pengajuan'
    const tenorStr = lead.details?.tenor
      ? lead.details.tenor.toString().includes('Tahun')
        ? lead.details.tenor
        : `${lead.details.tenor} Tahun`
      : '1 - 5 Tahun'

    msg = `${timeGreeting} Kak *${lead.name}* 🙏\n\nTerima kasih banyak telah menghubungi *DENKEN MOTORS - Premium Showroom*.\n\nKami telah menerima rincian pengajuan *Simulasi & Pembiayaan Kredit* kendaraan Anda dengan rincian berikut:\n\n🚗 *Unit Mobil Pilihan*: *${carName}* ${carYear ? `(${carYear})` : ''}\n${carPrice ? `💰 *Harga OTR*: ${carPrice}\n` : ''}${carImage}💵 *Rencana DP*: ${dpStr}\n📅 *Tenor Pembiayaan*: ${tenorStr}\n📍 *Domisili*: ${cityText}\n\nSaya Admin Showroom *DENKEN MOTORS* ingin membantu proses verifikasi & kelengkapan dokumen kredit Anda (KTP/KK/NPWP) agar dapat langsung diproses oleh leasing mitra kami.\n\nApakah waktu Kak *${lead.name}* saat ini senggang untuk berdiskusi via WhatsApp / Telepon? 😊`
  } else if (lead.type === 'Trade-In') {
    const oldBrand = lead.details?.oldCarBrand || ''
    const oldModel = lead.details?.oldCarModel || ''
    const oldYear = lead.details?.oldCarYear || ''
    const oldMileage = lead.details?.oldCarMileage ? `${formatDots(lead.details.oldCarMileage)} KM` : ''
    const oldCarStr = oldBrand || oldModel ? `${oldBrand} ${oldModel} ${oldYear ? `(${oldYear})` : ''}` : 'Mobil Lama Anda'

    msg = `${timeGreeting} Kak *${lead.name}* 🙏\n\nTerima kasih telah menghubungi *DENKEN MOTORS - Premium Showroom*.\n\nKami mencatat pengajuan *Tukar Tambah (Trade-In)* Anda untuk unit kendaraan berikut:\n\n🚗 *Mobil Incaran Showroom*: *${carName}* ${carYear ? `(${carYear})` : ''}\n${carPrice ? `💰 *Harga Unit Incaran*: ${carPrice}\n` : ''}${carImage}🚘 *Mobil Lama Anda*: ${oldCarStr}\n${oldMileage ? `🛣️ *Estimasi Odometer*: ${oldMileage}\n` : ''}📍 *Domisili*: ${cityText}\n\nSaya Admin Showroom *DENKEN MOTORS* ingin menjadwalkan penafsiran harga terbaik (appraisal) & inspeksi 150 titik secara gratis untuk mobil lama Anda.\n\nKapan waktu yang paling nyaman bagi Kak *${lead.name}* untuk janji temu / kami hubungi lebih lanjut? 😊`
  } else if (lead.type === 'Cash') {
    msg = `${timeGreeting} Kak *${lead.name}* 🙏\n\nTerima kasih banyak telah menghubungi *DENKEN MOTORS - Premium Showroom*.\n\nKami telah menerima pengajuan pembelian *Cash* kendaraan Anda dengan rincian berikut:\n\n🚗 *Unit Mobil Pilihan*: *${carName}* ${carYear ? `(${carYear})` : ''}\n${carPrice ? `💰 *Harga OTR Cash*: ${carPrice}\n` : ''}${carImage}📍 *Domisili*: ${cityText}\n\nSaya Admin Showroom *DENKEN MOTORS* siap membantu proses transaksi dan kelengkapan dokumen pembelian unit secara tunai.\n\nKapan waktu yang paling nyaman bagi Kak *${lead.name}* untuk janji temu / kami hubungi lebih lanjut? 😊`
  } else {
    const messageNotes = lead.details?.message ? `\n📝 *Catatan Pesan*: "${lead.details.message}"` : ''
    const subjectTitle = lead.details?.subject ? ` (${lead.details.subject})` : ''

    msg = `${timeGreeting} Kak *${lead.name}* 🙏\n\nTerima kasih telah menghubungi *DENKEN MOTORS - Premium Showroom*${subjectTitle}.\n\nKami menerima inkuiri & pertanyaan Anda mengenai unit kendaraan:\n\n🚗 *Unit Mobil Pilihan*: *${carName}* ${carYear ? `(${carYear})` : ''}\n${carPrice ? `💰 *Harga OTR Cash*: ${carPrice}\n` : ''}${carImage}${carSpecs ? `✨ *Spesifikasi*: ${carSpecs}\n` : ''}📍 *Domisili*: ${cityText}${messageNotes}\n\nSaya Admin Showroom *DENKEN MOTORS* siap memberikan penawaran harga promo khusus, rincian paket kredit, serta penjadwalan Test Drive.\n\nAda hal spesifik yang ingin Kak *${lead.name}* ketahui lebih detail? 😊`
  }

  return `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(msg)}`
}

// Sample Luxury Presets for Quick Car Uploads by Showroom Owners
const CAR_PRESETS = [
  {
    name: 'Porsche 911 Carrera S',
    slug: 'porsche-911-carrera-s-preset',
    brand: 'Porsche',
    year: 2024,
    price: 3200000000,
    monthly: 48000000,
    dp: 600000000,
    transmission: 'Automatic' as const,
    fuel: 'Bensin' as const,
    engine: '3.0L Twin-Turbo Boxer 6',
    mileage: 2500,
    color: 'Guards Red',
    type: 'Luxury' as const,
    condition: 'Bekas' as const,
    location: 'Jakarta Selatan',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=85',
    badge: 'LUXURY' as const,
    description: 'Iconic sports car dengan performa legendaris 450 HP. Kondisi mulus bebas cat ulang, Odometer asli 2.500 KM.',
    features: ['Sport Chrono Package', 'PASM Suspension', 'Bose Surround Sound', 'Matrix LED Headlights'],
  },
  {
    name: 'Land Rover Defender 110 SE',
    slug: 'land-rover-defender-110-se-preset',
    brand: 'Land Rover',
    year: 2024,
    price: 2450000000,
    monthly: 36000000,
    dp: 450000000,
    transmission: 'Automatic' as const,
    fuel: 'Bensin' as const,
    engine: '2.0L Turbocharged I4',
    mileage: 4800,
    color: 'Pangea Green',
    type: 'SUV' as const,
    condition: 'Bekas' as const,
    location: 'Jakarta Selatan',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85',
    badge: 'NEW' as const,
    description: 'SUV Off-road paling tangguh dan mewah. Dilengkapi Terrain Response 2 dan Meridian Sound System.',
    features: ['3D Surround Camera', 'Air Suspension', 'Meridian Sound System', 'Panoramic Sunroof'],
  },
  {
    name: 'Mercedes-AMG G 63',
    slug: 'mercedes-amg-g-63-preset',
    brand: 'Mercedes-Benz',
    year: 2023,
    price: 5800000000,
    monthly: 88000000,
    dp: 1100000000,
    transmission: 'Automatic' as const,
    fuel: 'Bensin' as const,
    engine: '4.0L V8 Biturbo',
    mileage: 3100,
    color: 'Obsidian Black Metallic',
    type: 'Luxury' as const,
    condition: 'Bekas' as const,
    location: 'Jakarta Pusat',
    image: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1200&q=85',
    badge: 'LUXURY' as const,
    description: 'Mobil impian para elit. Performa ganas V8 Biturbo 585 HP dipadukan dengan kenyamanan kabin eksklusif AMG.',
    features: ['Burmester 3D Surround', 'AMG Night Package', 'Designo Nappa Leather', 'AMG Performance Exhaust'],
  },
]

function MonthlySalesRow({ month, defaultUnits, defaultRevenue, record, onSave }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [units, setUnits] = useState(record ? record.units : defaultUnits)
  const [revenue, setRevenue] = useState(record ? record.revenue : defaultRevenue)

  const handleSave = () => {
    onSave(Number(units), Number(revenue))
    setIsEditing(false)
  }

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="py-4 font-bold">{month}</td>
      <td className="py-4">
        {isEditing ? (
          <input
            type="number"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            className="w-24 rounded-lg border border-border bg-muted p-2 text-xs font-bold outline-none focus:border-primary"
          />
        ) : (
          <span className="font-bold">{record ? record.units : defaultUnits} Unit</span>
        )}
      </td>
      <td className="py-4">
        {isEditing ? (
          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            className="w-36 rounded-lg border border-border bg-muted p-2 text-xs font-bold font-mono outline-none focus:border-primary"
          />
        ) : (
          <span className="font-bold font-mono text-primary">{formatIDR(record ? record.revenue : defaultRevenue)}</span>
        )}
      </td>
      <td className="py-4 text-right">
        {isEditing ? (
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-muted-foreground hover:text-foreground">Batal</button>
            <button onClick={handleSave} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90">Simpan</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-muted">Edit</button>
        )}
      </td>
    </tr>
  )
}

export default function AdminDashboardPage() {
  const rawCars = useStore((state) => state.cars)
  const rawLeads = useStore((state) => state.leads)
  const currentAdminUser = useStore((state) => state.currentAdminUser)
  const syncFromDatabase = useStore((state) => state.syncFromDatabase)

  const activeOwnerId = currentAdminUser?.ownerId || currentAdminUser?.id || 'admin_owner_1'

  // Deduplicate cars by ID to fix duplicated metrics from test data
  const uniqueCarsMap = new Map()
  rawCars.forEach(c => {
    if (!uniqueCarsMap.has(c.id)) {
      uniqueCarsMap.set(c.id, c)
    }
  })
  const deduplicatedRawCars = Array.from(uniqueCarsMap.values()) as typeof rawCars

  const cars = deduplicatedRawCars.filter((c) => (c.ownerId || 'admin_owner_1') === activeOwnerId)
  const leads = rawLeads.filter((l) => (l.ownerId || 'admin_owner_1') === activeOwnerId)

  const isAdminLoggedIn = useStore((state) => state.isAdminLoggedIn)
  const adminLogin = useStore((state) => state.adminLogin)
  const adminLogout = useStore((state) => state.adminLogout)
  const lastNotification = useStore((state) => state.lastNotification)
  const clearNotification = useStore((state) => state.clearNotification)

  const monthlySalesRecords = useStore((state) => state.monthlySalesRecords)
  const updateMonthlySalesRecord = useStore((state) => state.updateMonthlySalesRecord)

  const addCar = useStore((state) => state.addCar)
  const updateCar = useStore((state) => state.updateCar)
  const deleteCar = useStore((state) => state.deleteCar)
  const resetCars = useStore((state) => state.resetCars)
  const updateLeadStatus = useStore((state) => state.updateLeadStatus)
  const deleteLead = useStore((state) => state.deleteLead)

  const registerAdmin = useStore((state) => state.registerAdmin)
  const requestMasterKeyEmail = useStore((state) => state.requestMasterKeyEmail)
  const lastEmailNotification = useStore((state) => state.lastEmailNotification)
  const clearEmailNotification = useStore((state) => state.clearEmailNotification)
  const siteConfig = useStore((state) => state.siteConfig)
  const updateSiteConfig = useStore((state) => state.updateSiteConfig)

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    
    // Sync data from database to clear old local storage and get fresh data
    const fetchFreshData = async () => {
      try {
        const { getCars } = await import('@/app/actions/carActions')
        const { getLeads } = await import('@/app/actions/leadActions')
        const [dbCars, dbLeads] = await Promise.all([
          getCars(),
          getLeads(activeOwnerId)
        ])
        if (dbCars && dbLeads) {
          syncFromDatabase(dbCars as any, dbLeads as any)
        }
      } catch (e) {
        console.error('Failed to sync from database:', e)
      }
    }
    
    if (isAdminLoggedIn) {
      fetchFreshData()
    }
  }, [isAdminLoggedIn, activeOwnerId, syncFromDatabase])

  // Auth Screen Mode ('login' | 'register')
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Register Form States
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regRole, setRegRole] = useState<'Owner' | 'Manager' | 'Sales Admin'>('Owner')
  const [regMasterKey, setRegMasterKey] = useState('')
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  // Admin Dashboard Tabs & Filters
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'leads' | 'settings'>('leads')
  const [searchTerm, setSearchTerm] = useState('')
  const [leadStatusFilter, setLeadStatusFilter] = useState<'Semua' | 'Baru' | 'Diproses' | 'Disetujui' | 'Ditolak'>('Semua')
  const [carStatusFilter, setCarStatusFilter] = useState<'Semua' | 'Tersedia' | 'Terjual'>('Semua')
  const [desktopPermission, setDesktopPermission] = useState<string>('default')

  const [configForm, setConfigForm] = useState(siteConfig)
  const [saveConfigToast, setSaveConfigToast] = useState(false)

  // Modal State for Car Form (Add / Edit)
  const [showCarModal, setShowCarModal] = useState(false)
  const [editingCarId, setEditingCarId] = useState<string | null>(null)
  const [newFeatureInput, setNewFeatureInput] = useState('')
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false)

  const [carForm, setCarForm] = useState<Partial<Car>>({
    brand: 'Toyota',
    name: '',
    year: 2024,
    price: 650000000,
    monthly: 10500000,
    dp: 100000000,
    transmission: 'Automatic',
    fuel: 'Bensin',
    engine: '2.000 CC',
    mileage: 5000,
    color: 'Hitam Metallic',
    type: 'SUV',
    condition: 'Bekas',
    location: 'Jakarta Selatan',
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=85',
    gallery: [],
    badge: 'NEW',
    description: 'Unit mulus terawat, servis berkala di bengkel resmi, bebas banjir dan tabrakan.',
    features: ['Keyless Entry', 'Leather Seats', 'Touchscreen Head Unit', 'Parking Sensor'],
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDesktopPermission(Notification.permission)
    }
  }, [])

  const requestNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setDesktopPermission(perm)
        if (perm === 'granted') {
          new Notification('🔔 Notifikasi Browser Aktif!', {
            body: 'Anda akan menerima pemberitahuan desktop setiap kali ada pengajuan customer baru masuk.',
          })
        }
      })
    }
  }
  // Handle Login Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Email dan Password wajib diisi!')
      return
    }
    const success = adminLogin(loginEmail, loginPassword)
    if (!success) {
      setLoginError('Email atau Password salah! Periksa kembali kredensial Anda.')
    }
  }

  // Handle Request Master Key Email Notification from flodev261123@gmail.com
  const handleRequestMasterKey = () => {
    setRegError('')
    if (!regEmail.trim()) {
      setRegError('Silakan isi kolom Email Admin terlebih dahulu untuk menerima kiriman Kode Master Key!')
      return
    }

    setEmailSending(true)
    setTimeout(() => {
      const res = requestMasterKeyEmail(regEmail, regName)
      setEmailSending(false)
      if (!res.success) {
        setRegError(res.message)
      }
    }, 500)
  }

  // Handle Admin Account Registration Submit
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    setRegSuccess('')

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regMasterKey.trim()) {
      setRegError('Semua kolom bertanda * wajib diisi!')
      return
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi Password tidak cocok dengan Password!')
      return
    }

    if (regPassword.length < 6) {
      setRegError('Password minimal 6 karakter demi keamanan!')
      return
    }

    const res = registerAdmin(
      {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
      },
      regMasterKey
    )

    if (!res.success) {
      setRegError(res.message)
    } else {
      setRegSuccess(res.message)
    }
  }

  const openAddCarModal = () => {
    setEditingCarId(null)
    setCarForm({
      brand: 'Toyota',
      name: '',
      year: 2024,
      price: 650000000,
      monthly: 10500000,
      dp: 100000000,
      transmission: 'Automatic',
      fuel: 'Bensin',
      engine: '2.000 CC Turbo',
      mileage: 5000,
      color: 'Hitam Metallic',
      type: 'SUV',
      condition: 'Bekas',
      location: 'Jakarta Selatan',
      image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=85',
      gallery: [],
      badge: 'NEW',
      description: 'Mobil mulus siap pakai, interior harum bebas rokok, garansi mesin 1 tahun.',
      features: ['Keyless Push Start', 'Leather Seats', 'Subwoofer Sound System', '360 Camera'],
    })
    setShowCarModal(true)
  }

  const openEditCarModal = (car: Car) => {
    setEditingCarId(car.id)
    setCarForm(car)
    setShowCarModal(true)
  }

  const handleApplyPreset = (preset: typeof CAR_PRESETS[0]) => {
    setCarForm({
      ...preset,
      gallery: [preset.image],
    })
  }

  const handleImportPresets = () => {
    CAR_PRESETS.forEach((preset) => {
      addCar({
        ...preset,
        ownerId: activeOwnerId,
        gallery: [preset.image],
      })
    })
  }

  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return
    const updatedFeatures = [...(carForm.features || []), newFeatureInput.trim()]
    setCarForm({ ...carForm, features: updatedFeatures })
    setNewFeatureInput('')
  }

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = (carForm.features || []).filter((_, i) => i !== index)
    setCarForm({ ...carForm, features: updatedFeatures })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const currentGallery = carForm.gallery && carForm.gallery.length > 0 ? carForm.gallery : (carForm.image ? [carForm.image] : [])
    const remainingSlots = 10 - currentGallery.length

    if (remainingSlots <= 0) {
      alert('Maksimal 10 foto per unit mobil telah tercapai!')
      return
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots)
    const readPromises = filesToProcess.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (reader.result) resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(readPromises).then((newImages) => {
      const updatedGallery = [...currentGallery, ...newImages].slice(0, 10)
      setCarForm({
        ...carForm,
        image: updatedGallery[0] || carForm.image,
        gallery: updatedGallery,
      })
    })

    e.target.value = ''
  }

  const handleSetMainCover = (index: number) => {
    const gallery = carForm.gallery || []
    if (index === 0 || index >= gallery.length) return
    const targetImage = gallery[index]
    const updatedGallery = [targetImage, ...gallery.filter((_, i) => i !== index)]
    setCarForm({
      ...carForm,
      image: targetImage,
      gallery: updatedGallery,
    })
  }

  const handleRemovePhoto = (index: number) => {
    const gallery = carForm.gallery || []
    const updatedGallery = gallery.filter((_, i) => i !== index)
    setCarForm({
      ...carForm,
      image: updatedGallery[0] || '',
      gallery: updatedGallery,
    })
  }

  const handleMovePhoto = (index: number, direction: 'left' | 'right') => {
    const gallery = [...(carForm.gallery || [])]
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= gallery.length) return
    const temp = gallery[index]
    gallery[index] = gallery[targetIndex]
    gallery[targetIndex] = temp
    setCarForm({
      ...carForm,
      image: gallery[0],
      gallery,
    })
  }

  const handleSaveCar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!carForm.name || !carForm.brand || !carForm.price) return

    const finalGallery = carForm.gallery && carForm.gallery.length > 0 ? carForm.gallery : (carForm.image ? [carForm.image] : [])
    const finalCarForm = {
      ...carForm,
      ownerId: activeOwnerId,
      image: finalGallery[0] || carForm.image,
      gallery: finalGallery,
    }

    if (editingCarId) {
      updateCar(editingCarId, finalCarForm)
    } else {
      addCar(finalCarForm as Car)
    }

    setShowCarModal(false)
    setUploadSuccessToast(true)
    setTimeout(() => setUploadSuccessToast(false), 4000)
  }

  const filteredLeads = leads.filter((l) => {
    if (leadStatusFilter === 'Semua') return true
    return l.status === leadStatusFilter
  })

  const filteredCars = cars.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brand.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    if (carStatusFilter === 'Tersedia') return !c.isSoldOut && c.badge !== 'SOLD OUT'
    if (carStatusFilter === 'Terjual') return c.isSoldOut || c.badge === 'SOLD OUT'
    return true
  })

  const newLeadsCount = leads.filter((l) => l.status === 'Baru').length

  // LOGIN & REGISTRATION SCREEN FOR UNAUTHENTICATED USERS
  
  if (!mounted) return null

  if (!isAdminLoggedIn) {
    return (
      <div className="pt-28 pb-24 min-h-screen bg-secondary/30 flex items-center justify-center px-5 relative">
        {/* REAL-TIME SYSTEM EMAIL NOTIFICATION FLOATING TOAST CARD FROM flodev261123@gmail.com */}
        {lastEmailNotification && (
          <div className="fixed top-24 right-6 z-50 w-full max-w-md rounded-3xl bg-zinc-950 text-white p-6 shadow-2xl border border-amber-500/50 animate-in slide-in-from-top-5 space-y-4 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-amber-500/20 p-2 text-amber-400 border border-amber-500/30">
                  <Mail className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-xs text-amber-400 uppercase tracking-wider">
                    📩 EMAIL OTOMATIS TERKIRIM
                  </p>
                  <p className="text-[11px] text-white/70">
                    Dari: <span className="font-mono text-white font-bold">flodev261123@gmail.com</span>
                  </p>
                </div>
              </div>
              <button
                onClick={clearEmailNotification}
                className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 text-white/70 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="text-white/90">
                Kepada: <strong className="text-amber-300 font-mono">{lastEmailNotification.to}</strong>
              </p>
              <p className="text-white/60 text-[11px]">
                Subjek: {lastEmailNotification.subject}
              </p>

              <div className="mt-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-center">
                <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-1">
                  Kode Master Key Otorisasi Acak Anda:
                </p>
                <p className="font-mono text-3xl font-black tracking-widest text-amber-300">
                  {lastEmailNotification.code}
                </p>
                <p className="text-[10px] text-white/50 mt-1">
                  Dikirim pada: {lastEmailNotification.timestamp}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setRegMasterKey(lastEmailNotification.code)
                setCopiedKey(true)
                setTimeout(() => setCopiedKey(false), 2500)
              }}
              className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs py-3 flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer hover:scale-[1.01]"
            >
              {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedKey ? 'Kode Berhasil Ditempel ke Form!' : '📋 Isi Kode Otomatis ke Form Registrasi'}
            </button>
          </div>
        )}
        <div className="w-full max-w-lg rounded-3xl border border-border/60 bg-card p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-primary/10 blur-[80px]" />

          <div className="text-center mb-8 relative z-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-md">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              DENKEN MOTORS / SECURE ADMIN PORTAL
            </span>
            <h1 className="font-display text-3xl font-black tracking-tight mt-1">Portal Pengelola Showroom</h1>
            <p className="text-xs text-muted-foreground mt-2">
              Sistem otentikasi terenkripsi & registrasi akun resmi khusus pemilik & staf showroom.
            </p>
          </div>

          {/* Auth Tab Switcher */}
          <div className="grid grid-cols-2 rounded-2xl bg-muted/60 p-1.5 mb-8 border border-border/40 relative z-10">
            <button
              type="button"
              onClick={() => { setAuthTab('login'); setLoginError(''); setRegError(''); setRegSuccess('') }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                authTab === 'login'
                  ? 'bg-card text-foreground shadow-md border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Lock className="h-3.5 w-3.5" /> Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab('register'); setLoginError(''); setRegError(''); setRegSuccess('') }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                authTab === 'register'
                  ? 'bg-card text-primary shadow-md border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" /> Buat Akun Admin
            </button>
          </div>

          {authTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4 relative z-10">
              {loginError && (
                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-600 font-bold flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-muted-foreground">
                  Email Resmi Admin *
                </label>
                <input
                  required
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@denkenmotors.id"
                  className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 text-sm outline-none focus:border-primary focus:bg-card transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showPassword ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </div>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 text-sm outline-none focus:border-primary focus:bg-card transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-primary py-4 text-xs font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-[1.01] mt-2"
              >
                Masuk ke Dashboard Admin
              </button>

              <div className="pt-4 border-t border-border/40 text-center">
                <p className="text-[11px] text-muted-foreground">
                  Belum punya akun admin?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthTab('register')}
                    className="text-primary font-bold hover:underline"
                  >
                    Registrasi Akun Baru →
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4 relative z-10">
              {regError && (
                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-600 font-bold flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-600 font-bold flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-muted-foreground">
                  Nama Lengkap Admin *
                </label>
                <input
                  required
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Hendra Wijaya"
                  className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 text-sm outline-none focus:border-primary focus:bg-card transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-muted-foreground">
                    Email Admin *
                  </label>
                  <input
                    required
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@denkenmotors.id"
                    className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 text-sm outline-none focus:border-primary focus:bg-card transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-muted-foreground">
                    Jabatan / Peran *
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 text-sm outline-none focus:border-primary focus:bg-card transition-all cursor-pointer font-medium text-foreground"
                  >
                    <option value="Owner">Owner Showroom</option>
                    <option value="Manager">General Manager</option>
                    <option value="Sales Admin">Sales Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-muted-foreground">
                    Password *
                  </label>
                  <input
                    required
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 text-sm outline-none focus:border-primary focus:bg-card transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-muted-foreground">
                    Ulangi Password *
                  </label>
                  <input
                    required
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Sama dengan password"
                    className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 text-sm outline-none focus:border-primary focus:bg-card transition-all"
                  />
                </div>
              </div>

              {/* Showroom Master Key Protection Field */}
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    <KeyRound className="h-4 w-4 shrink-0" />
                    <span>Kode Keamanan Master Showroom (Master Key) *</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestMasterKey}
                    disabled={emailSending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-3 py-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-300 transition-all shadow-sm cursor-pointer"
                  >
                    <Send className="h-3 w-3" />
                    {emailSending ? 'Mengirim Email...' : '⚡ Minta Kode ke Email (flodev)'}
                  </button>
                </div>

                <div className="relative">
                  <input
                    required
                    type="text"
                    value={regMasterKey}
                    onChange={(e) => setRegMasterKey(e.target.value)}
                    placeholder="Masukkan atau tempel Kode Master (cth: DK-8492)"
                    className="w-full rounded-xl border border-amber-500/30 bg-background/80 p-3 text-xs outline-none focus:border-amber-500 font-mono text-foreground font-bold tracking-wider"
                  />
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  🛡️ <strong>Verifikasi Email Otomatis</strong>: Pendaftaran akun mewajibkan Kode Master Key acak. Klik tombol di atas untuk mengirimkan notifikasi kode otorisasi dari <strong className="text-foreground">flodev261123@gmail.com</strong>.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-primary py-4 text-xs font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-[1.01] mt-2"
              >
                Registrasi & Buat Akun Admin
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  // DASHBOARD FOR AUTHENTICATED SHOWROOM OWNERS
  return (
    <div className="flex h-screen bg-secondary/30 overflow-hidden">
      
      {/* REAL-TIME LEAD NOTIFICATION POPUP TOAST */}
      {lastNotification && (
        <div className="fixed top-6 right-6 z-50 flex items-center justify-between gap-4 rounded-2xl bg-rose-600 text-white p-4 shadow-2xl border border-white/20 animate-in slide-in-from-top-5 max-w-md">
          <div className="flex items-center gap-3">
            <BellRing className="h-6 w-6 animate-bounce text-white shrink-0" />
            <div>
              <p className="font-bold text-xs">Pemberitahuan Leads Masuk!</p>
              <p className="text-[11px] text-white/90 leading-tight mt-0.5">{lastNotification}</p>
            </div>
          </div>
          <button onClick={clearNotification} className="rounded-full bg-black/20 p-1 hover:bg-black/40">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* UPLOAD SUCCESS TOAST */}
      {uploadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-zinc-950 text-white p-4 shadow-2xl border border-emerald-500/40 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-xs">Unit Mobil Berhasil Ditambahkan!</p>
            <p className="text-[11px] text-white/70">Mobil baru kini langsung aktif & tampil di website showroom.</p>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-72 bg-card border-r border-border flex flex-col justify-between hidden lg:flex shrink-0 shadow-xl z-20">
        <div className="p-8 space-y-10">
          <div className="flex items-center gap-2 text-primary font-black font-display text-3xl tracking-widest">
            DENKEN<span className="text-foreground">.</span>
          </div>
          <nav className="space-y-3">
            <button onClick={() => setActiveTab('overview')} className={`flex w-full items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <LayoutDashboard className="h-6 w-6" /> Ringkasan Bisnis
            </button>
            <button onClick={() => setActiveTab('cars')} className={`flex w-full items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'cars' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <CarIcon className="h-6 w-6" /> Inventaris Mobil
            </button>
            <button onClick={() => setActiveTab('leads')} className={`flex w-full items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all relative ${activeTab === 'leads' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <Users className="h-6 w-6" /> Prospek Pelanggan
              {newLeadsCount > 0 && (
                <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white animate-pulse shadow-sm">
                  {newLeadsCount}
                </span>
              )}
            </button>
          </nav>
        </div>
        <div className="p-8 border-t border-border/50 bg-muted/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg uppercase shrink-0">
              {currentAdminUser?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate">{currentAdminUser?.name}</p>
              <p className="text-xs text-muted-foreground truncate uppercase tracking-wider font-bold mt-0.5">{currentAdminUser?.role}</p>
            </div>
          </div>
          <button onClick={adminLogout} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-destructive/20 text-destructive bg-destructive/5 px-4 py-4 text-sm font-bold transition-all hover:bg-destructive hover:text-destructive-foreground hover:scale-[1.02] shadow-sm">
            <LogOut className="h-5 w-5" /> Keluar dari Admin
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-secondary/20">
        
        {/* MOBILE HEADER (Only visible on small screens) */}
        <header className="lg:hidden flex flex-col gap-4 p-5 bg-card border-b border-border shadow-sm z-30 shrink-0">
           <div className="flex items-center justify-between">
             <div className="font-display font-black tracking-widest text-2xl text-primary">DENKEN<span className="text-foreground">.</span></div>
             <button onClick={adminLogout} className="text-destructive p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
               <LogOut className="h-5 w-5" />
             </button>
           </div>
           <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
             <button onClick={() => setActiveTab('overview')} className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-md' : 'bg-muted border border-border text-muted-foreground'}`}>Ringkasan</button>
             <button onClick={() => setActiveTab('cars')} className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === 'cars' ? 'bg-primary text-white shadow-md' : 'bg-muted border border-border text-muted-foreground'}`}>Inventaris</button>
             <button onClick={() => setActiveTab('leads')} className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === 'leads' ? 'bg-primary text-white shadow-md' : 'bg-muted border border-border text-muted-foreground'}`}>
               Prospek
               {newLeadsCount > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white animate-pulse shadow-sm">{newLeadsCount}</span>}
             </button>
             <button onClick={() => setActiveTab('settings')} className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-md' : 'bg-muted border border-border text-muted-foreground'}`}>Pengaturan</button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 md:p-10 pb-32">
          <div className="mx-auto max-w-7xl">
          
            {/* UNREAD LEADS ALERT BANNER */}
            {newLeadsCount > 0 && (
              <div className="mb-8 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-white/20">
                <div className="flex items-center gap-5">
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-md shrink-0 shadow-inner">
                    <BellRing className="h-8 w-8 animate-bounce" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xl sm:text-2xl mb-1.5 drop-shadow-sm">
                      Ada {newLeadsCount} Prospek Pelanggan Baru!
                    </p>
                    <p className="text-sm text-white/90 leading-relaxed font-medium">
                      Segera hubungi calon pembeli melalui WhatsApp untuk meningkatkan konversi penjualan showroom.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('leads')}
                  className="rounded-full bg-white text-rose-600 px-8 py-4 text-sm font-bold shadow-xl hover:bg-white/90 hover:scale-[1.02] transition-all whitespace-nowrap shrink-0"
                >
                  Lihat Prospek Sekarang →
                </button>
              </div>
            )}

            {/* TOP BAR / PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-sm font-bold text-primary mb-2 uppercase tracking-widest">Dashboard Portal</p>
                <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground tracking-tight drop-shadow-sm">
                  {activeTab === 'overview' && 'Ringkasan Bisnis'}
                  {activeTab === 'cars' && 'Inventaris Mobil'}
                  {activeTab === 'leads' && 'Prospek Pelanggan'}
                  {activeTab === 'settings' && 'Pengaturan Website'}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {desktopPermission !== 'granted' && (
                  <button onClick={requestNotificationPermission} className="inline-flex items-center gap-2.5 rounded-full bg-primary/10 text-primary px-5 py-3 text-xs font-bold hover:bg-primary/20 transition-all border border-primary/20" title="Aktifkan Notifikasi Desktop">
                    <Bell className="h-4 w-4" /> Notifikasi
                  </button>
                )}
                <button onClick={resetCars} className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-5 py-3 text-xs font-bold hover:bg-muted transition-colors shadow-sm">
                  <RefreshCw className="h-4 w-4" /> Reset Data
                </button>
                <button
                  onClick={() => {
                    const session = sessionStorage.getItem('denken_admin_session')
                    if (session) {
                      localStorage.setItem('denken_temp_transfer', session)
                    }
                    window.open(`/?showroom=${activeOwnerId}`, '_blank')
                  }}
                  className="inline-flex items-center gap-2.5 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]"
                >
                  <Eye className="h-4 w-4" /> Pratinjau Website
                </button>
              </div>
            </div>

        {/* TAB 1: CUSTOMER LEADS & NOTIFICATION SYSTEM */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Status Filter Bar */}
            <div className="flex flex-wrap gap-2 items-center bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
              <span className="text-xs font-bold text-muted-foreground mr-2 uppercase tracking-wider">Filter Status:</span>
              <button
                onClick={() => setLeadStatusFilter('Semua')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  leadStatusFilter === 'Semua' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/60 hover:bg-muted text-foreground'
                }`}
              >
                Semua ({leads.length})
              </button>
              <button
                onClick={() => setLeadStatusFilter('Baru')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  leadStatusFilter === 'Baru' ? 'bg-rose-500 text-white shadow-sm' : 'bg-muted/60 hover:bg-muted text-foreground'
                }`}
              >
                🔴 Baru ({leads.filter((l) => l.status === 'Baru').length})
              </button>
              <button
                onClick={() => setLeadStatusFilter('Diproses')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  leadStatusFilter === 'Diproses' ? 'bg-amber-500 text-white shadow-sm' : 'bg-muted/60 hover:bg-muted text-foreground'
                }`}
              >
                🟡 Diproses / WA ({leads.filter((l) => l.status === 'Diproses').length})
              </button>
              <button
                onClick={() => setLeadStatusFilter('Disetujui')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  leadStatusFilter === 'Disetujui' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-muted/60 hover:bg-muted text-foreground'
                }`}
              >
                🟢 Diterima / Deal ({leads.filter((l) => l.status === 'Disetujui').length})
              </button>
              <button
                onClick={() => setLeadStatusFilter('Ditolak')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  leadStatusFilter === 'Ditolak' ? 'bg-zinc-600 text-white shadow-sm' : 'bg-muted/60 hover:bg-muted text-foreground'
                }`}
              >
                ⚪ Ditolak / Batal ({leads.filter((l) => l.status === 'Ditolak').length})
              </button>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card shadow-xl overflow-x-auto">
              <table className="w-full min-w-[850px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-5">Tipe Aplikasi</th>
                    <th className="p-5">Nama Pemohon</th>
                    <th className="p-5">Hubungi WhatsApp</th>
                    <th className="p-5">Detail Kebutuhan</th>
                    <th className="p-5">Status Aplikasi</th>
                    <th className="p-5 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm font-medium">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`transition-colors ${
                        lead.status === 'Baru' ? 'bg-rose-500/5 hover:bg-rose-500/10' : 'hover:bg-muted/30'
                      }`}
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          {lead.status === 'Baru' && (
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                          )}
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${
                              lead.type === 'Kredit'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : lead.type === 'Trade-In'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            }`}
                          >
                            {lead.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {new Date(lead.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>
                      <td className="p-5">
                        <p className="font-bold">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.city || '-'}</p>
                      </td>
                      <td className="p-5">
                        <a
                          href={buildAdminWaUrl(lead)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            if (lead.status === 'Baru') {
                              updateLeadStatus(lead.id, 'Diproses')
                            }
                          }}
                          className="inline-flex items-center gap-1.5 font-bold text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all text-xs bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full shadow-sm"
                          title="Klik untuk membuka WhatsApp dengan template pesan otomatis ramah pelanggan"
                        >
                          <PhoneCall className="h-3.5 w-3.5" /> WhatsApp ({lead.whatsapp})
                        </a>
                      </td>
                      <td className="p-5">
                        <p className="font-semibold text-xs text-primary">{lead.carName || '-'}</p>
                        {lead.details && (
                          <p className="text-[11px] text-muted-foreground truncate max-w-xs mt-0.5">
                            {JSON.stringify(lead.details)}
                          </p>
                        )}
                      </td>
                      <td className="p-5">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold outline-none border cursor-pointer ${
                            lead.status === 'Baru'
                              ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                              : lead.status === 'Diproses'
                              ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : lead.status === 'Disetujui'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'border-zinc-500 bg-zinc-50 text-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-300'
                          }`}
                        >
                          <option value="Baru">🔴 Baru</option>
                          <option value="Diproses">🟡 Diproses (WA)</option>
                          <option value="Disetujui">🟢 Diterima / Deal (Auto SOLD OUT)</option>
                          <option value="Ditolak">⚪ Ditolak / Batal</option>
                        </select>
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => {
                            if (confirm('Hapus lead ini?')) deleteLead(lead.id)
                          }}
                          className="rounded-xl border border-border bg-muted/50 p-2 text-destructive hover:bg-destructive hover:text-white transition-colors"
                          title="Hapus Lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeads.length === 0 && (
                <div className="p-12 text-center space-y-3">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <h3 className="font-display text-base font-bold">Belum Ada Customer Leads</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Ketika calon pembeli mengajukan simulasi kredit, trade-in, atau inkuiri kontak untuk unit showroom Anda, data permohonan akan otomatis tampil di sini.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: KELOLA MOBIL */}
        {activeTab === 'cars' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari model atau merek mobil..."
                  className="w-full rounded-2xl border border-border bg-muted/40 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => setCarStatusFilter('Semua')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    carStatusFilter === 'Semua' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/60 hover:bg-muted text-foreground'
                  }`}
                >
                  Semua ({cars.length})
                </button>
                <button
                  onClick={() => setCarStatusFilter('Tersedia')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    carStatusFilter === 'Tersedia' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-muted/60 hover:bg-muted text-foreground'
                  }`}
                >
                  🟢 Siap Dijual ({cars.filter((c) => !c.isSoldOut && c.badge !== 'SOLD OUT').length})
                </button>
                <button
                  onClick={() => setCarStatusFilter('Terjual')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    carStatusFilter === 'Terjual' ? 'bg-rose-600 text-white shadow-sm' : 'bg-muted/60 hover:bg-muted text-foreground'
                  }`}
                >
                  🔴 Terjual ({cars.filter((c) => c.isSoldOut || c.badge === 'SOLD OUT').length})
                </button>
              </div>

              <button
                onClick={openAddCarModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 shrink-0"
              >
                <Plus className="h-4 w-4" /> + Upload Unit Mobil Baru
              </button>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-xl">
              <table className="w-full min-w-[850px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-5">Unit Mobil</th>
                    <th className="p-5">Merek & Tahun</th>
                    <th className="p-5">Harga OTR</th>
                    <th className="p-5">Cicilan / Bln</th>
                    <th className="p-5">Status Unit</th>
                    <th className="p-5 text-right">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm font-medium">
                  {filteredCars.map((car, idx) => {
                    const isSold = car.isSoldOut || car.badge === 'SOLD OUT'
                    return (
                      <tr key={`${car.id}-${idx}`} className="hover:bg-muted/30 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <img
                              src={car.image}
                              alt={car.name}
                              className="h-14 w-20 object-cover object-center rounded-xl border border-border/50 shrink-0"
                            />
                            <div>
                              <Link href={`/mobil/${car.slug}`} target="_blank" className="font-bold font-display hover:text-primary transition-colors flex items-center gap-1.5">
                                {car.name} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </Link>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {car.transmission} • {car.fuel} • {car.engine}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <p className="font-bold">{car.brand}</p>
                          <p className="text-xs text-muted-foreground">Tahun {car.year}</p>
                        </td>
                        <td className="p-5 font-bold font-display">{formatIDR(car.price)}</td>
                        <td className="p-5 text-primary font-bold">{formatIDR(car.monthly)}</td>
                        <td className="p-5">
                          {isSold ? (
                            <div className="flex flex-col items-start gap-1">
                              <span className="rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30 px-3 py-0.5 text-[10px] font-extrabold tracking-wider">
                                🔴 SOLD OUT
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCar(car.id, { isSoldOut: false, badge: 'READY STOCK' })}
                                className="text-[10px] text-muted-foreground hover:text-primary font-bold underline"
                              >
                                Set Ke Ready
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-start gap-1">
                              <span className="rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-3 py-0.5 text-[10px] font-extrabold tracking-wider">
                                🟢 SIAP DIJUAL
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCar(car.id, { isSoldOut: true, badge: 'SOLD OUT' })}
                                className="text-[10px] text-rose-500 hover:underline font-bold"
                              >
                                Mark as SOLD OUT
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditCarModal(car)}
                              className="rounded-xl border border-border bg-muted/50 p-2.5 text-foreground hover:bg-primary hover:text-white transition-colors"
                              title="Edit Data Mobil"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus ${car.name}?`)) {
                                  deleteCar(car.id)
                                }
                              }}
                              className="rounded-xl border border-border bg-muted/50 p-2.5 text-destructive hover:bg-destructive hover:text-white transition-colors"
                              title="Hapus Mobil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredCars.length === 0 && (
                <div className="p-12 text-center space-y-4">
                  <CarIcon className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <h3 className="font-display text-base font-bold">Belum Ada Unit Mobil di Showroom Anda</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Sebagai akun pengelola/owner showroom baru, stok mobil Anda saat ini masih kosong. Anda dapat meng-upload unit baru atau mengimpor preset contoh.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={openAddCarModal}
                      className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
                    >
                      + Upload Unit Mobil Pertama
                    </button>
                    <button
                      onClick={handleImportPresets}
                      className="rounded-full border border-primary/40 bg-primary/10 text-primary px-6 py-2.5 text-xs font-bold hover:bg-primary/20 transition-all"
                    >
                      ⚡ Impor 3 Mobil Presets Contoh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: OVERVIEW & REAL-TIME ANALYTICS DASHBOARD */}
        {activeTab === 'overview' && (() => {
          // 1. Live Car Metrics
          const readyCars = cars.filter((c) => !c.isSoldOut && c.badge !== 'SOLD OUT')
          const soldCars = cars.filter((c) => c.isSoldOut || c.badge === 'SOLD OUT')
          const totalReadyValue = readyCars.reduce((sum, c) => sum + c.price, 0)
          const totalSoldValue = soldCars.reduce((sum, c) => sum + c.price, 0)

          // 2. Live Lead Pipeline Metrics
          const newLeads = leads.filter((l) => l.status === 'Baru').length
          const processingLeads = leads.filter((l) => l.status === 'Diproses').length
          const closedLeads = leads.filter((l) => l.status === 'Disetujui').length
          const rejectedLeads = leads.filter((l) => l.status === 'Ditolak').length

          // Compute Potential Sales Revenue from Leads
          const leadPotentialRevenue = leads.reduce((sum, l) => {
            const matched = cars.find((c) => c.id === l.carId || (l.carName && c.name.toLowerCase() === l.carName.toLowerCase()))
            return sum + (matched ? matched.price : 0)
          }, 0)

          // 3. Dynamic Monthly Trend Calculation 2026
          const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
          const monthlyStats = MONTHS.map((m, idx) => {
            const record = monthlySalesRecords.find(r => (r.ownerId || 'admin_owner_1') === activeOwnerId && r.year === 2026 && r.month === m)

            const monthLeads = leads.filter((l) => {
              if (!l.createdAt) return false
              const d = new Date(l.createdAt)
              return d.getMonth() === idx
            })

            const monthDealLeads = monthLeads.filter((l) => l.status === 'Disetujui')
            
            const autoUnits = monthDealLeads.length
            const autoRevenue = monthDealLeads.reduce((sum, l) => {
              const matched = cars.find((c) => c.id === l.carId || (l.carName && c.name.toLowerCase() === l.carName.toLowerCase()))
              return sum + (matched ? matched.price : 0)
            }, 0)

            const actualUnits = record ? record.units : autoUnits
            const actualRevenue = record ? record.revenue : autoRevenue

            return {
              month: m,
              units: actualUnits,
              revenue: actualRevenue,
              leadCount: monthLeads.length,
              dealCount: monthDealLeads.length,
            }
          })

          const maxMonthlyUnits = Math.max(...monthlyStats.map((m) => m.units))

          // 4. Car Demand Ranking (Inquiry Count per Car)
          const carInquiryMap: Record<string, number> = {}
          leads.forEach((l) => {
            const key = l.carName || 'Unit Lain'
            carInquiryMap[key] = (carInquiryMap[key] || 0) + 1
          })

          const rankedCars = cars
            .map((c) => ({
              ...c,
              inquiries: carInquiryMap[c.name] || 0,
            }))
            .sort((a, b) => b.inquiries - a.inquiries)

          // 5. Latest Leads
          const latestLeads = [...leads].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5)

          // 6. Top Demand Cars
          const topDemandCars = rankedCars.slice(0, 3)

          return (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* 3 Summary Stat KPI Cards */}
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 mb-8">
                {/* CARD 1: TOTAL ASET */}
                <div className="group rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/50 p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CarIcon className="h-7 w-7" />
                    </div>
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest">
                      Total Aset
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-muted-foreground mb-1">Stok Tersedia</p>
                    <p className="font-display text-4xl font-black text-foreground tracking-tight">
                      {formatIDR(totalReadyValue)}
                    </p>
                    <p className="mt-3 text-sm font-medium text-muted-foreground bg-muted/50 inline-block px-3 py-1.5 rounded-lg">
                      <strong className="text-foreground">{readyCars.length}</strong> Unit Siap Jual
                    </p>
                  </div>
                </div>

                {/* CARD 2: TOTAL OMZET */}
                <div className="group rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/50 p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest">
                      Total Omzet
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-muted-foreground mb-1">Pendapatan Kotor</p>
                    <p className="font-display text-4xl font-black text-foreground tracking-tight">
                      {formatIDR(totalSoldValue)}
                    </p>
                    <p className="mt-3 text-sm font-medium text-emerald-600 bg-emerald-500/10 inline-block px-3 py-1.5 rounded-lg">
                      <strong className="text-emerald-700">{soldCars.length}</strong> Unit Terjual
                    </p>
                  </div>
                </div>

                {/* CARD 3: PROSPEK AKTIF */}
                <div className="group rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/50 p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                      <Users className="h-7 w-7" />
                    </div>
                    <span className="rounded-full bg-rose-500/10 text-rose-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest">
                      Prioritas Follow-up
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-muted-foreground mb-1">Prospek Aktif (Perlu Dihubungi)</p>
                    <p className="font-display text-4xl font-black text-foreground tracking-tight">
                      {newLeads + processingLeads} <span className="text-xl font-bold text-muted-foreground">Orang</span>
                    </p>
                    <p className="mt-3 text-sm font-medium text-rose-600 bg-rose-500/10 inline-block px-3 py-1.5 rounded-lg">
                      {newLeads} Pesan Baru Belum Dibaca
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONABLE PANELS */}
              <div className="grid gap-6 lg:grid-cols-2">
                
                {/* RECENT LEADS TABLE */}
                <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold">Prospek Pelanggan Terbaru</h3>
                      <p className="text-xs text-muted-foreground">Daftar pesan masuk terakhir dari calon pembeli.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('leads')}
                      className="text-xs font-bold text-primary hover:underline whitespace-nowrap"
                    >
                      Lihat Semua &rarr;
                    </button>
                  </div>
                  
                  {latestLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="rounded-full bg-muted/50 p-4 mb-3">
                        <Users className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-bold text-muted-foreground">Belum ada prospek masuk</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {latestLeads.map((lead) => (
                        <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-foreground truncate">{lead.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">Mencari: <strong className="text-foreground">{lead.carName || 'Belum Menentukan'}</strong></p>
                            </div>
                          </div>
                          <a 
                            href={`https://wa.me/${lead.whatsapp?.replace(/^0/, '62') || ''}?text=Halo%20kak%20${encodeURIComponent(lead.name)},%20terima%20kasih%20sudah%20menghubungi%20kami.%20Ada%20yang%20bisa%20kami%20bantu%3F`}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 px-4 py-2 text-xs font-bold bg-[#25D366]/10 text-[#25D366] rounded-full hover:bg-[#25D366]/20 transition-colors flex items-center gap-2 w-fit"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            Balas WA
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* TOP CAR DEMAND LIST */}
                <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-sm">
                  <div className="mb-6">
                    <h3 className="font-display text-lg font-bold">3 Mobil Paling Dicari</h3>
                    <p className="text-xs text-muted-foreground">Unit dengan tingkat peminatan tertinggi minggu ini.</p>
                  </div>

                  <div className="space-y-4">
                    {topDemandCars.length === 0 || topDemandCars[0].inquiries === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="rounded-full bg-muted/50 p-4 mb-3">
                          <CarIcon className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground">Belum ada data peminatan</p>
                      </div>
                    ) : (
                      topDemandCars.map((car, idx) => (
                        <div key={`${car.id}-${idx}`} className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors relative overflow-hidden bg-muted/10">
                          {idx === 0 && (
                            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                              PALING DIMINATI
                            </div>
                          )}
                          <div className="h-16 w-24 shrink-0 rounded-xl bg-muted overflow-hidden relative border border-border/50">
                            {car.image ? (
                              <img src={car.image} alt={car.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                                <CarIcon className="h-6 w-6 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">{car.name}</p>
                            <p className="text-xs text-primary font-bold mt-1">{formatIDR(car.price)}</p>
                          </div>
                          <div className="flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-xl bg-primary/5 border border-primary/10">
                            <span className="font-display text-xl font-black text-primary">{car.inquiries}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Tanya</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )
        })()}

        {/* Settings tab removed */}

      </div>

      {/* MODAL UPLOAD / EDIT MOBIL DEDIKASI OWNER */}
      {showCarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-card border border-border p-8 shadow-2xl my-8 text-foreground">
            <button
              onClick={() => setShowCarModal(false)}
              className="absolute top-6 right-6 rounded-full bg-muted p-2 hover:bg-muted/80"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {editingCarId ? 'Edit Unit Mobil' : 'Upload Unit Mobil Baru'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Isi data di bawah. Mobil yang diupload akan langsung aktif di katalog website showroom.
                </p>
              </div>
            </div>

            {/* Quick Presets Bar */}
            {!editingCarId && (
              <div className="mb-6 rounded-2xl bg-secondary/70 p-4 border border-border/50">
                <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Pilih Preset Contoh Mobil Mewah (Opsional):
                </p>
                <div className="flex flex-wrap gap-2">
                  {CAR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold hover:border-primary hover:text-primary transition-all"
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveCar} className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Merek Mobil *
                  </label>
                  <input
                    required
                    type="text"
                    value={carForm.brand || ''}
                    onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm outline-none focus:border-primary"
                    placeholder="Contoh: Toyota / BMW / Porsche"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Nama Model Mobil *
                  </label>
                  <input
                    required
                    type="text"
                    value={carForm.name || ''}
                    onChange={(e) => setCarForm({ ...carForm, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm outline-none focus:border-primary"
                    placeholder="Contoh: Toyota Fortuner 2.8 GR Sport"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Tahun Pembuatan *
                  </label>
                  <input
                    required
                    type="number"
                    value={carForm.year || 2024}
                    onChange={(e) => setCarForm({ ...carForm, year: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Harga OTR Cash (Rp) *
                  </label>
                  <input
                    required
                    type="text"
                    value={formatDots(carForm.price)}
                    onChange={(e) => setCarForm({ ...carForm, price: parseDots(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm font-mono font-bold outline-none focus:border-primary"
                    placeholder="650.000.000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Estimasi Cicilan / Bln (Rp)
                  </label>
                  <input
                    type="text"
                    value={formatDots(carForm.monthly)}
                    onChange={(e) => setCarForm({ ...carForm, monthly: parseDots(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm font-mono font-bold outline-none focus:border-primary"
                    placeholder="10.500.000"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Transmisi
                  </label>
                  <select
                    value={carForm.transmission || 'Automatic'}
                    onChange={(e) => setCarForm({ ...carForm, transmission: e.target.value as any })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Bahan Bakar
                  </label>
                  <select
                    value={carForm.fuel || 'Bensin'}
                    onChange={(e) => setCarForm({ ...carForm, fuel: e.target.value as any })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Bensin">Bensin</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Listrik">Listrik</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Badge Spesial
                  </label>
                  <select
                    value={carForm.badge || ''}
                    onChange={(e) => setCarForm({ ...carForm, badge: e.target.value as any })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Tanpa Badge</option>
                    <option value="BEST SELLER">BEST SELLER</option>
                    <option value="NEW">NEW</option>
                    <option value="PROMO">PROMO</option>
                    <option value="LUXURY">LUXURY</option>
                    <option value="READY STOCK">READY STOCK</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Kapasitas Mesin
                  </label>
                  <input
                    type="text"
                    value={carForm.engine || ''}
                    onChange={(e) => setCarForm({ ...carForm, engine: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm outline-none focus:border-primary"
                    placeholder="Contoh: 2.000 CC Turbo"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                    Jarak Tempuh (KM)
                  </label>
                  <input
                    type="text"
                    value={formatDots(carForm.mileage)}
                    onChange={(e) => setCarForm({ ...carForm, mileage: parseDots(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm font-mono font-bold outline-none focus:border-primary"
                    placeholder="5.000"
                  />
                </div>
              </div>

              {/* Multi-Photo File Upload & Gallery Manager (Max 10 Photos) */}
              <div className="space-y-3 rounded-2xl bg-secondary/50 p-5 border border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-primary" /> Upload Foto Mobil Dari File (Maksimal 10 Foto)
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Ambil foto langsung dari file laptop/HP. Foto pertama otomatis menjadi foto sampul utama.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {(carForm.gallery?.length || (carForm.image ? 1 : 0))} / 10 Foto
                  </span>
                </div>

                {/* File Upload Dropzone */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <label
                    htmlFor="file-upload-input"
                    className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-primary/40 rounded-2xl p-4 bg-card/60 hover:bg-primary/5 hover:border-primary transition-all cursor-pointer text-center group"
                  >
                    <input
                      type="file"
                      id="file-upload-input"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="rounded-full bg-primary/10 p-2.5 text-primary mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="font-bold text-xs text-foreground">
                      + Pilih Foto Dari Laptop / HP
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Bisa pilih hingga 10 foto sekaligus (PNG, JPG, WEBP)
                    </p>
                  </label>
                </div>

                {/* Optional URL Input */}
                <div className="flex gap-2 items-center pt-2">
                  <input
                    type="text"
                    value={carForm.image || ''}
                    onChange={(e) => {
                      const url = e.target.value
                      const currentGallery = carForm.gallery && carForm.gallery.length > 0 ? carForm.gallery : (url ? [url] : [])
                      setCarForm({
                        ...carForm,
                        image: url,
                        gallery: currentGallery.length > 0 ? [url, ...currentGallery.slice(1)] : [url],
                      })
                    }}
                    className="flex-1 rounded-xl border border-border bg-muted/40 p-3 text-xs outline-none focus:border-primary font-mono"
                    placeholder="Atau masukan URL gambar (https://images.unsplash.com/...)"
                  />
                  {carForm.image && (
                    <button
                      type="button"
                      onClick={() => {
                        if ((carForm.gallery?.length || 0) >= 10) {
                          alert('Maksimal 10 foto per unit!')
                          return
                        }
                        if (carForm.image) {
                          const updated: string[] = [...(carForm.gallery || []), carForm.image]
                          setCarForm({ ...carForm, gallery: updated })
                        }
                      }}
                      className="rounded-xl border border-border bg-card px-3.5 py-3 text-xs font-bold hover:bg-muted shrink-0"
                    >
                      + Tambah URL
                    </button>
                  )}
                </div>

                {/* Thumbnails Manager Grid (up to 10 photos) */}
                {(() => {
                  const gallery = carForm.gallery || []
                  if (gallery.length === 0) return null
                  return (
                    <div className="pt-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Foto Terupload ({gallery.length} foto) - Klik ★ untuk foto utama:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {gallery.map((imgUrl, idx) => {
                          const isMain = idx === 0
                          return (
                            <div
                              key={idx}
                              className={`group relative aspect-[16/10] overflow-hidden rounded-xl border-2 transition-all ${
                                isMain ? 'border-primary shadow-md ring-2 ring-primary/30' : 'border-border/60 bg-muted'
                              }`}
                            >
                              <img src={imgUrl} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover object-center" />

                              <span className="absolute top-1 left-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                                {isMain ? '★ Utama' : `#${idx + 1}`}
                              </span>

                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                                {!isMain && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetMainCover(idx)}
                                    className="rounded-md bg-primary px-1.5 py-1 text-[10px] font-bold text-primary-foreground hover:scale-105"
                                    title="Jadikan Foto Utama"
                                  >
                                    ★
                                  </button>
                                )}
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMovePhoto(idx, 'left')}
                                    className="rounded-md bg-white/20 px-1.5 py-1 text-xs text-white hover:bg-white/40"
                                    title="Geser Kiri"
                                  >
                                    ←
                                  </button>
                                )}
                                {idx < gallery.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMovePhoto(idx, 'right')}
                                    className="rounded-md bg-white/20 px-1.5 py-1 text-xs text-white hover:bg-white/40"
                                    title="Geser Kanan"
                                  >
                                    →
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  className="rounded-md bg-rose-600 p-1 text-white hover:bg-rose-700"
                                  title="Hapus Foto"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div>
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                  Deskripsi Kendaraan
                </label>
                <textarea
                  rows={3}
                  value={carForm.description || ''}
                  onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm outline-none focus:border-primary resize-none"
                  placeholder="Tuliskan keunggulan, kondisi mobil, dan catatan garansi..."
                />
              </div>

              {/* Tag Feature Manager */}
              <div>
                <label className="text-xs font-bold mb-1.5 block text-muted-foreground uppercase tracking-wider">
                  Fitur Unggulan
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    placeholder="Tambah fitur baru (e.g. Panoramic Sunroof)"
                    className="flex-1 rounded-xl border border-border bg-muted/40 p-3 text-xs outline-none focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddFeature()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                  >
                    Tambah Fitur
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(carForm.features || []).map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border px-3 py-1 text-xs font-semibold"
                    >
                      {feat}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowCarModal(false)}
                  className="rounded-full border border-border px-6 py-3 text-xs font-bold hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-lg"
                >
                  {editingCarId ? 'Simpan Perubahan' : 'Upload Mobil ke Showroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  )
}
