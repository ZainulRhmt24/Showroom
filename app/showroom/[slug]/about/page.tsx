import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicShowroomBySlug, publicSiteUrl } from '@/lib/public-showroom'

export const dynamic = 'force-dynamic'
type ShowroomPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ShowroomPageProps): Promise<Metadata> {
  const { slug } = await params
  const showroom = await getPublicShowroomBySlug(slug)
  if (!showroom) return { title: 'Showroom tidak ditemukan' }
  const title = `Tentang ${showroom.name}`
  const description = showroom.description || `Pelajari lebih lanjut tentang ${showroom.name}.`
  return { title, description, openGraph: { title, description, url: publicSiteUrl(`/showroom/${showroom.slug}/about`) } }
}

export default async function AboutPage({ params }: ShowroomPageProps) {
  const { slug } = await params
  const showroom = await getPublicShowroomBySlug(slug)
  if (!showroom) return null
  return <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Tentang kami</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{showroom.name}</h1><p className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-600">{showroom.description || showroom.tagline || `${showroom.name} menyediakan pilihan kendaraan berkualitas dengan pengalaman pembelian yang nyaman dan transparan.`}</p>{showroom.address && <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="font-bold">Kunjungi showroom kami</p><p className="mt-2 text-sm leading-6 text-slate-600">{showroom.address}{showroom.city ? `, ${showroom.city}` : ''}{showroom.province ? `, ${showroom.province}` : ''}</p></div>}<Link href={`/showroom/${showroom.slug}/cars`} className="mt-10 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Lihat koleksi mobil</Link></div>
}
