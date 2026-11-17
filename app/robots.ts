import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    // 대시보드와 내부 수집 주소는 검색에서 뺀다
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/api/'] },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
