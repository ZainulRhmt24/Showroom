import type { Metadata } from 'next'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { getPublicShowroomBySlug, publicSiteUrl, publicWhatsAppUrl } from '@/lib/public-showroom'

export const dynamic = 'force-dynamic'
type ShowroomPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ShowroomPageProps): Promise<Metadata> {
  const { slug } = await params
  const showroom = await getPublicShowroomBySlug(slug)
  if (!showroom) return { title: 'Showroom tidak ditemukan' }
  const title = `Kontak ${showroom.name}`
  return { title, description: `Hubungi ${showroom.name}.`, openGraph: { title, url: publicSiteUrl(`/showroom/${showroom.slug}/contact`) } }
}

export default async function ContactPage({ params }: ShowroomPageProps) {
  const { slug } = await params
  const showroom = await getPublicShowroomBySlug(slug)
  if (!showroom) return null
  const whatsapp = publicWhatsAppUrl(showroom.whatsapp || showroom.phone, `Halo ${showroom.name}, saya ingin mendapatkan informasi.`)
  return <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Kontak</p><h1 className="mt-2 text-4xl font-black tracking-tight">Kami siap membantu</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">Hubungi {showroom.name} untuk informasi kendaraan, jadwal kunjungan, atau pertanyaan lainnya.</p><div className="mt-10 grid gap-4 sm:grid-cols-2">{showroom.phone && <div className="rounded-2xl border border-slate-200 bg-white p-6"><Phone className="h-6 w-6 text-emerald-700" /><p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Telepon</p><p className="mt-1 font-bold">{showroom.phone}</p></div>}{showroom.email && <div className="rounded-2xl border border-slate-200 bg-white p-6"><Mail className="h-6 w-6 text-emerald-700" /><p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Email</p><a href={`mailto:${showroom.email}`} className="mt-1 block break-all font-bold hover:underline">{showroom.email}</a></div>}{showroom.address && <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:col-span-2"><MapPin className="h-6 w-6 text-emerald-700" /><p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Alamat</p><p className="mt-1 font-bold">{showroom.address}{showroom.city ? `, ${showroom.city}` : ''}</p></div>}</div>{whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white"><MessageCircle className="h-5 w-5" /> Chat WhatsApp</a>}</div>
}
