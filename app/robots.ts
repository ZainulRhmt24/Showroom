import type { MetadataRoute } from 'next'
import { publicSiteUrl } from '@/lib/public-showroom'

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/admin/'] }, sitemap: publicSiteUrl('/sitemap.xml') }
}
