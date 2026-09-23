import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { PublicCarCard } from '@/components/public/PublicCarCard'
import { getPublicBranches, getPublicCatalog, getPublicShowroomBySlug, publicSiteUrl } from '@/lib/public-showroom'

export const dynamic = 'force-dynamic'

type CatalogSearch = { q?: string; brand?: string; transmission?: string; branch?: string; minYear?: string; minPrice?: string; maxPrice?: string; sort?: string; page?: string }
type CarsPageProps = { params: Promise<{ slug: string }>; searchParams: Promise<CatalogSearch> }
const num = (value?: string) => value && /^\d+$/.test(value) ? Number(value) : undefined

export async function generateMetadata({ params }: Pick<CarsPageProps, 'params'>): Promise<Metadata> {
  const { slug } = await params
  const showroom = await getPublicShowroomBySlug(slug)
  if (!showroom) return { title: 'Showroom tidak ditemukan' }
  const title = `Koleksi Mobil | ${showroom.name}`
  const description = `Jelajahi koleksi mobil tersedia dari ${showroom.name}.`
  return { title, description, alternates: { canonical: `/showroom/${showroom.slug}/cars` }, openGraph: { title, description, url: publicSiteUrl(`/showroom/${showroom.slug}/cars`) } }
}

export default async function PublicCarsPage({ params, searchParams }: CarsPageProps) {
  const [{ slug }, raw] = await Promise.all([params, searchParams])
  const showroom = await getPublicShowroomBySlug(slug)
  if (!showroom) return null
  const search = raw as CatalogSearch
  const filters = {
    q: search.q,
    brand: search.brand,
    transmission: search.transmission === 'Automatic' || search.transmission === 'Manual' ? search.transmission as 'Automatic' | 'Manual' : undefined,
    branch: search.branch,
    minYear: num(search.minYear), minPrice: num(search.minPrice), maxPrice: num(search.maxPrice),
    sort: ['newest', 'price_asc', 'price_desc', 'year_desc'].includes(search.sort || '') ? search.sort as 'newest' | 'price_asc' | 'price_desc' | 'year_desc' : 'newest',
    page: num(search.page),
  }
  const [catalog, branches] = await Promise.all([getPublicCatalog(showroom.id, filters), getPublicBranches(showroom.id)])
  const base = `/showroom/${showroom.slug}/cars`
  const pages = Math.max(1, Math.ceil(catalog.total / catalog.pageSize))
  const makePageHref = (page: number) => { const query = new URLSearchParams(); Object.entries({ ...search, page: String(page) }).forEach(([key, value]) => { if (value) query.set(key, value) }); return `${base}?${query}` }

  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Koleksi {showroom.name}</p><h1 className="mt-2 text-4xl font-black tracking-tight">Temukan mobil yang tepat</h1><p className="mt-3 text-sm leading-6 text-slate-600">Jelajahi unit yang tersedia. Kendaraan terjual tidak ditampilkan di katalog publik.</p></div>
    <form action={base} className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"><label className="relative sm:col-span-2"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input name="q" defaultValue={search.q} placeholder="Cari merek atau model" className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600" /></label><select name="brand" defaultValue={search.brand || ''} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><option value="">Semua merek</option>{catalog.brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}</select><select name="transmission" defaultValue={search.transmission || ''} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><option value="">Semua transmisi</option><option value="Automatic">Automatic</option><option value="Manual">Manual</option></select><select name="branch" defaultValue={search.branch || ''} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><option value="">Semua cabang</option>{branches.map(branch => <option key={branch.slug} value={branch.slug}>{branch.name}</option>)}</select><input name="minYear" inputMode="numeric" defaultValue={search.minYear} placeholder="Tahun minimum" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /><input name="maxPrice" inputMode="numeric" defaultValue={search.maxPrice} placeholder="Harga maksimum" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /><select name="sort" defaultValue={filters.sort} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><option value="newest">Terbaru</option><option value="price_asc">Harga terendah</option><option value="price_desc">Harga tertinggi</option><option value="year_desc">Tahun terbaru</option></select><div className="flex gap-2"><button className="flex-1 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Terapkan</button><Link href={base} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold">Reset</Link></div></form>
    <div className="mt-8 flex items-center justify-between"><p className="text-sm text-slate-600"><strong className="text-slate-950">{catalog.total}</strong> unit ditemukan</p><p className="text-xs text-slate-500">Halaman {catalog.page} dari {pages}</p></div>
    {catalog.cars.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{catalog.cars.map(car => <PublicCarCard key={car.slug} car={car} showroomSlug={showroom.slug} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><p className="font-bold">Tidak ada mobil yang sesuai</p><p className="mt-2 text-sm text-slate-600">Coba ubah kata pencarian atau filter Anda.</p><Link href={base} className="mt-5 inline-block text-sm font-bold underline">Lihat semua mobil</Link></div>}
    {pages > 1 && <nav className="mt-10 flex justify-center gap-2" aria-label="Pagination">{catalog.page > 1 && <Link className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold" href={makePageHref(catalog.page - 1)}>Sebelumnya</Link>}{catalog.page < pages && <Link className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white" href={makePageHref(catalog.page + 1)}>Berikutnya</Link>}</nav>}
  </div>
}
