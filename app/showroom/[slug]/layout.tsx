import { notFound } from 'next/navigation'
import { PublicFooter, PublicNavbar } from '@/components/public/PublicSiteShell'
import { getPublicShowroomBySlug } from '@/lib/public-showroom'

export default async function ShowroomLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const showroom = await getPublicShowroomBySlug(slug)
  if (!showroom) notFound()

  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <PublicNavbar showroom={showroom} />
    <main>{children}</main>
    <PublicFooter showroom={showroom} />
  </div>
}
