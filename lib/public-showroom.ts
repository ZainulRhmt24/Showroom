import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const SHOWROOM_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PAGE_SIZE = 12

const publicShowroomSelect = {
  id: true,
  slug: true,
  name: true,
  logo: true,
  phone: true,
  email: true,
  address: true,
  tagline: true,
  description: true,
  whatsapp: true,
  city: true,
  province: true,
  heroTitle: true,
  heroDescription: true,
  primaryContactLabel: true,
  instagramUrl: true,
  facebookUrl: true,
  updatedAt: true,
} satisfies Prisma.ShowroomSelect

const publicCarSelect = {
  slug: true,
  brand: true,
  name: true,
  year: true,
  price: true,
  mileage: true,
  transmission: true,
  fuel: true,
  color: true,
  image: true,
  gallery: true,
  badge: true,
  description: true,
  features: true,
  engine: true,
  type: true,
  condition: true,
  location: true,
  createdAt: true,
  updatedAt: true,
  branch: { select: { name: true, city: true, address: true } },
} satisfies Prisma.CarSelect

export type PublicShowroom = Prisma.ShowroomGetPayload<{ select: typeof publicShowroomSelect }>
export type PublicCar = Prisma.CarGetPayload<{ select: typeof publicCarSelect }>

export type CatalogFilters = {
  q?: string
  brand?: string
  transmission?: 'Automatic' | 'Manual'
  branch?: string
  minYear?: number
  minPrice?: number
  maxPrice?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'year_desc'
  page?: number
}

export function isValidPublicShowroomSlug(slug: string) {
  return SHOWROOM_SLUG.test(slug)
}

/** Resolves a tenant from a URL-safe slug and returns public fields only. */
export async function getPublicShowroomBySlug(slug: string): Promise<PublicShowroom | null> {
  if (!isValidPublicShowroomSlug(slug)) return null

  return prisma.showroom.findUnique({
    where: { slug },
    select: publicShowroomSelect,
  })
}

function visibleCarsWhere(showroomId: string): Prisma.CarWhereInput {
  // The existing operational status model uses isSoldOut and badge rather than
  // a duplicate public-status enum. BOOKED stays visible and is labelled Reserved.
  return {
    showroomId,
    isSoldOut: false,
    OR: [{ badge: null }, { badge: { not: 'SOLD OUT' } }],
  }
}

function publicOrder(sort: CatalogFilters['sort']): Prisma.CarOrderByWithRelationInput {
  switch (sort) {
    case 'price_asc': return { price: 'asc' }
    case 'price_desc': return { price: 'desc' }
    case 'year_desc': return { year: 'desc' }
    default: return { createdAt: 'desc' }
  }
}

export async function getFeaturedPublicCars(showroomId: string, take = 6): Promise<PublicCar[]> {
  const visible = visibleCarsWhere(showroomId)
  const highlighted = await prisma.car.findMany({
    where: { ...visible, badge: { in: ['BEST SELLER', 'NEW', 'PROMO'] } },
    select: publicCarSelect,
    orderBy: { createdAt: 'desc' },
    take,
  })

  // Badge is the existing equivalent of a featured flag. A new tenant may not
  // have one yet, so show its newest public inventory rather than an empty home.
  if (highlighted.length === take) return highlighted
  const remaining = await prisma.car.findMany({
    where: visible,
    select: publicCarSelect,
    orderBy: { createdAt: 'desc' },
    take,
  })
  const unique = new Map<string, PublicCar>()
  for (const car of [...highlighted, ...remaining]) unique.set(car.slug, car)
  return [...unique.values()].slice(0, take)
}

export async function getPublicBranches(showroomId: string) {
  return prisma.branch.findMany({
    where: { showroomId, isActive: true },
    select: { slug: true, name: true, city: true, address: true, phone: true, openDays: true, openHours: true, description: true },
    orderBy: { name: 'asc' },
  })
}

export async function getPublicCatalog(showroomId: string, filters: CatalogFilters = {}) {
  const page = Math.max(1, Math.floor(filters.page || 1))
  const where: Prisma.CarWhereInput = { ...visibleCarsWhere(showroomId) }
  const and: Prisma.CarWhereInput[] = []
  const q = filters.q?.trim().slice(0, 80)
  if (q) and.push({ OR: [{ brand: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] })
  if (filters.brand) and.push({ brand: filters.brand.slice(0, 80) })
  if (filters.transmission) and.push({ transmission: filters.transmission })
  if (filters.branch) and.push({ branch: { slug: filters.branch.slice(0, 120), showroomId } })
  if (Number.isFinite(filters.minYear)) and.push({ year: { gte: filters.minYear } })
  if (Number.isFinite(filters.minPrice) || Number.isFinite(filters.maxPrice)) {
    and.push({ price: { ...(Number.isFinite(filters.minPrice) ? { gte: filters.minPrice } : {}), ...(Number.isFinite(filters.maxPrice) ? { lte: filters.maxPrice } : {}) } })
  }
  if (and.length) where.AND = and

  const [cars, total, brands] = await Promise.all([
    prisma.car.findMany({ where, select: publicCarSelect, orderBy: publicOrder(filters.sort), skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.car.count({ where }),
    prisma.car.findMany({ where: visibleCarsWhere(showroomId), select: { brand: true }, distinct: ['brand'], orderBy: { brand: 'asc' } }),
  ])

  return { cars, total, page, pageSize: PAGE_SIZE, brands: brands.map(({ brand }) => brand) }
}

/** Car lookup is always constrained by both the resolved tenant and public visibility. */
export async function getPublicCarBySlug(showroomId: string, carSlug: string): Promise<PublicCar | null> {
  if (!SHOWROOM_SLUG.test(carSlug)) return null
  return prisma.car.findFirst({
    where: { ...visibleCarsWhere(showroomId), slug: carSlug },
    select: publicCarSelect,
  })
}

export function publicWhatsAppUrl(phone: string | null | undefined, message: string) {
  const number = phone?.replace(/\D/g, '')
  if (!number) return null
  const normalized = number.startsWith('0') ? `62${number.slice(1)}` : number
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export function publicSiteUrl(path = '') {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'
  return `${base}${path}`
}
