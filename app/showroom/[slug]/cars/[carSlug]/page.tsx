import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Fuel, Gauge, MapPin, MessageCircle, Palette, Settings2 } from 'lucide-react'
import { getPublicCarBySlug, getPublicShowroomBySlug, publicSiteUrl, publicWhatsAppUrl } from '@/lib/public-showroom'

export const dynamic = 'force-dynamic'
const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
type CarPageProps = { params: Promise<{ slug: string; carSlug: string }> }

async function getContext(slug: string, carSlug: string) { const showroom = await getPublicShowroomBySlug(slug); if (!showroom) return null; const car = await getPublicCarBySlug(showroom.id, carSlug); return car ? { showroom, car } : null }

export async function generateMetadata({ params }: CarPageProps): Promise<Metadata> {
  const { slug, carSlug } = await params
  const data = await getContext(slug, carSlug)
  if (!data) return { title: 'Mobil tidak ditemukan' }
  const title = `${data.car.brand} ${data.car.name} ${data.car.year} | ${data.showroom.name}`
  const description = `Lihat detail ${data.car.name} ${data.car.year}, tersedia di ${data.showroom.name}.`
  return { title, description, alternates: { canonical: `/showroom/${data.showroom.slug}/cars/${data.car.slug}` }, openGraph: { title, description, url: publicSiteUrl(`/showroom/${data.showroom.slug}/cars/${data.car.slug}`), images: [{ url: data.car.image }] } }
}

export default async function PublicCarDetailPage({ params }: CarPageProps) {
  const { slug, carSlug } = await params
  const data = await getContext(slug, carSlug)
  if (!data) notFound()
  const { showroom, car } = data
  const images = [...new Set([car.image, ...car.gallery].filter(Boolean))]
  const whatsapp = publicWhatsAppUrl(showroom.whatsapp || showroom.phone, `Halo, saya tertarik dengan ${car.brand} ${car.name} ${car.year} yang tersedia di ${showroom.name}.`)
  const specs = [{ label: 'Tahun', value: car.year }, { label: 'Kilometer', value: `${car.mileage.toLocaleString('id-ID')} km`, icon: Gauge }, { label: 'Transmisi', value: car.transmission, icon: Settings2 }, { label: 'Bahan bakar', value: car.fuel, icon: Fuel }, { label: 'Warna', value: car.color, icon: Palette }, { label: 'Lokasi', value: car.branch?.name || car.location, icon: MapPin }]
  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><p className="text-sm text-slate-500"><a className="hover:underline" href={`/showroom/${showroom.slug}`}>Home</a> <span className="px-1">/</span> <a className="hover:underline" href={`/showroom/${showroom.slug}/cars`}>Mobil</a> <span className="px-1">/</span> {car.name}</p><div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr_.65fr]"><div><div className="grid gap-3 sm:grid-cols-2"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 sm:col-span-2">{car.image.startsWith('http') ? <img src={car.image} alt={`${car.brand} ${car.name}`} className="h-full w-full object-cover" /> : <Image src={car.image} alt={`${car.brand} ${car.name}`} fill priority sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover" />}</div>{images.slice(1, 3).map((image, index) => <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">{image.startsWith('http') ? <img src={image} alt={`${car.name} foto ${index + 2}`} className="h-full w-full object-cover" /> : <Image src={image} alt={`${car.name} foto ${index + 2}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />}</div>)}</div><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Tentang kendaraan ini</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{car.description}</p>{car.features.length > 0 && <div className="mt-6 grid gap-2 sm:grid-cols-2">{car.features.map(feature => <div key={feature} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">✓ {feature}</div>)}</div>}</section></div><aside><div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{car.badge === 'BOOKED' ? 'Reserved' : 'Tersedia'}</p><h1 className="mt-2 text-3xl font-black leading-tight">{car.name}</h1><p className="mt-2 text-sm font-semibold text-slate-500">{car.brand} · {car.year}</p><p className="mt-6 text-3xl font-black">{money.format(car.price)}</p><div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">{specs.map(spec => <div key={spec.label} className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{spec.label}</p><p className="mt-1 text-sm font-bold text-slate-900">{spec.value}</p></div>)}</div>{car.branch && <p className="mt-5 text-sm leading-6 text-slate-600">{car.branch.address}, {car.branch.city}</p>}{whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700"><MessageCircle className="h-5 w-5" /> Chat via WhatsApp</a>}</div></aside></div></div>
}
