import type { MetadataRoute } from 'next'
import { GUIDES } from '@/lib/guides'
import { SITE } from '@/lib/site'

const UPDATED = new Date('2026-11-13')

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, lastModified: UPDATED, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE.url}/guide`, lastModified: UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    ...GUIDES.map((g) => ({
      url: `${SITE.url}/guide/${g.slug}`,
      lastModified: UPDATED,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ]
}
