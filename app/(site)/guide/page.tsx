import type { Metadata } from 'next'
import Link from 'next/link'
import { GUIDES } from '@/lib/guides'
import { OG_BASE, SITE, jsonLd } from '@/lib/site'

export const metadata: Metadata = {
  title: '지퍼·의류 부자재 가이드',
  description:
    '의류 부자재의 종류, 지퍼 종류 비교, 지퍼 호수와 길이 고르는 법, 부품 명칭, 맞춤 제작 준비까지. 대양ING가 정리한 지퍼·의류 부자재 가이드입니다.',
  alternates: { canonical: '/guide' },
  openGraph: { ...OG_BASE, url: '/guide', title: '지퍼·의류 부자재 가이드 | 대양ING' },
}

export default function GuideIndex() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '지퍼·의류 부자재 가이드',
    url: `${SITE.url}/guide`,
    inLanguage: 'ko',
    publisher: { '@type': 'Organization', name: SITE.legalName, url: SITE.url },
    hasPart: GUIDES.map((g) => ({ '@type': 'Article', headline: g.title, url: `${SITE.url}/guide/${g.slug}` })),
  }

  return (
    <>
      <main className="doc">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
        <div className="wrap doc__wrap">
          <nav className="crumbs" aria-label="현재 위치">
            <Link href="/">대양ING</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">가이드</span>
          </nav>
          <h1 className="doc__title">지퍼·의류 부자재 가이드</h1>
          <p className="doc__lead">
            <span className="ph">지퍼를 고르고 주문할 때</span> <span className="ph">알아 두면 좋은 내용을 정리했습니다.</span>
          </p>
          <ul className="guide-list">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link href={`/guide/${g.slug}`}>
                  <h2>{g.title}</h2>
                  <p>{g.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  )
}
