import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { publicSiteUrl } from '@/lib/public-showroom'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [showrooms, cars] = await Promise.all([
    prisma.showroom.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.car.findMany({
      where: { isSoldOut: false, OR: [{ badge: null }, { badge: { not: 'SOLD OUT' } }] },
      select: { slug: true, updatedAt: true, showroom: { select: { slug: true } } },
    }),
  ])
  return [
    ...showrooms.flatMap(showroom => [
      { url: publicSiteUrl(`/showroom/${showroom.slug}`), lastModified: showroom.updatedAt, changeFrequency: 'daily' as const, priority: 1 },
      { url: publicSiteUrl(`/showroom/${showroom.slug}/cars`), lastModified: showroom.updatedAt, changeFrequency: 'daily' as const, priority: 0.9 },
    ]),
    ...cars.map(car => ({ url: publicSiteUrl(`/showroom/${car.showroom.slug}/cars/${car.slug}`), lastModified: car.updatedAt, changeFrequency: 'weekly' as const, priority: 0.8 })),
  ]
}
