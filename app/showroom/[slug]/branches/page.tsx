import type { Metadata } from 'next'
import { Clock3, MapPin, Phone } from 'lucide-react'
import { getPublicBranches, getPublicShowroomBySlug, publicSiteUrl } from '@/lib/public-showroom'

export const dynamic = 'force-dynamic'
type ShowroomPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ShowroomPageProps): Promise<Metadata> {
  const { slug } = await params
  const showroom = await getPublicShowroomBySlug(slug)
  if (!showroom) return { title: 'Showroom tidak ditemukan' }
  const title = `Cabang ${showroom.name}`
  return { title, description: `Lokasi cabang ${showroom.name}.`, openGraph: { title, url: publicSiteUrl(`/showroom/${showroom.slug}/branches`) } }
}

export default async function BranchesPage({ params }: ShowroomPageProps) {
  const { slug } = await params
  const showroom = await getPublicShowroomBySlug(slug)
  if (!showroom) return null
  const branches = await getPublicBranches(showroom.id)
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Lokasi kami</p><h1 className="mt-2 text-4xl font-black tracking-tight">Cabang {showroom.name}</h1><p className="mt-3 text-sm text-slate-600">Pilih cabang yang paling nyaman untuk Anda kunjungi.</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{branches.map(branch => <article key={branch.slug} className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">{branch.name}</h2>{branch.description && <p className="mt-3 text-sm leading-6 text-slate-600">{branch.description}</p>}<div className="mt-5 space-y-3 text-sm text-slate-600"><p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-emerald-700" />{branch.address}, {branch.city}</p>{branch.phone && <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-emerald-700" />{branch.phone}</p>}{(branch.openDays || branch.openHours) && <p className="flex gap-2"><Clock3 className="h-4 w-4 shrink-0 text-emerald-700" />{branch.openDays}{branch.openHours ? ` · ${branch.openHours}` : ''}</p>}</div></article>)}</div>{!branches.length && <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">Informasi cabang sedang diperbarui.</p>}</div>
}
