import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { GUIDES, getGuide, type Block } from '@/lib/guides'
import { OG_BASE, SITE, jsonLd } from '@/lib/site'

const PUBLISHED = '2026-11-13'

export const dynamicParams = false

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const g = getGuide(slug)
  if (!g) return {}
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guide/${g.slug}` },
    openGraph: { ...OG_BASE, type: 'article', url: `/guide/${g.slug}`, title: `${g.title} | 대양ING`, description: g.description },
  }
}

const BlockView = ({ b }: { b: Block }) => {
  switch (b.type) {
    case 'p':
      return <p>{b.text}</p>
    case 'ul':
      return (
        <ul className="doc__list">
          {b.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="doc__list doc__list--ol">
          {b.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      )
    case 'table':
      return (
        <div className="doc__table" role="region" aria-label={b.caption} tabIndex={0}>
          <table>
            <caption>{b.caption}</caption>
            <thead>
              <tr>
                {b.head.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r) => (
                <tr key={r.join()}>
                  {r.map((c, i) =>
                    i === 0 ? (
                      <th key={i} scope="row">
                        {c}
                      </th>
                    ) : (
                      <td key={i}>{c}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const g = getGuide(slug)
  if (!g) notFound()

  const url = `${SITE.url}/guide/${g.slug}`
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: g.title,
      description: g.description,
      inLanguage: 'ko',
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: SITE.legalName, url: SITE.url },
      publisher: { '@type': 'Organization', name: SITE.legalName, url: SITE.url },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '대양ING', item: SITE.url },
        { '@type': 'ListItem', position: 2, name: '가이드', item: `${SITE.url}/guide` },
        { '@type': 'ListItem', position: 3, name: g.short, item: url },
      ],
    },
  ]
  const related = g.related.map(getGuide).filter((x) => x !== undefined)

  return (
    <>
      <Header />
      <main className="doc">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
        <article className="wrap doc__wrap">
          <nav className="crumbs" aria-label="현재 위치">
            <Link href="/">대양ING</Link>
            <span aria-hidden="true">/</span>
            <Link href="/guide">가이드</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{g.short}</span>
          </nav>
          <h1 className="doc__title">{g.title}</h1>
          <p className="doc__lead">{g.lead}</p>

          {g.sections.map((s) => (
            <section key={s.h} className="doc__sec">
              <h2>{s.h}</h2>
              {s.blocks.map((b, i) => (
                <BlockView key={i} b={b} />
              ))}
            </section>
          ))}

          <aside className="doc__cta" aria-label="상담 문의">
            <p className="doc__cta-title">
              <span className="ph">필요한 지퍼가 있다면</span> <span className="ph">편하게 문의해 주세요.</span>
            </p>
            <p className="doc__cta-contact">
              <span className="ph">
                전화 <a href={`tel:${SITE.phone.replace(/-/g, '')}`}>{SITE.phone}</a>
              </span>
              <span className="ph">
                메일 <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </span>
            </p>
            <Link className="btn btn--ink" href="/#contact">
              상담 문의하기
            </Link>
          </aside>

          {related.length > 0 && (
            <nav className="doc__related" aria-labelledby="related-h">
              <h2 id="related-h">함께 보면 좋은 가이드</h2>
              <ul>
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/guide/${r.slug}`}>{r.title}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </article>
      </main>
      <Footer />
    </>
  )
}
