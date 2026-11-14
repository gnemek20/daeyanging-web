import Hero from '@/components/Hero'
import Intro from '@/components/Intro'
import Company from '@/components/Company'
import Products from '@/components/Products'
import Custom from '@/components/Custom'
import Craft from '@/components/Craft'
import Promises from '@/components/Promises'
import Contact from '@/components/Contact'
import Location from '@/components/Location'
import { SITE, jsonLd } from '@/lib/site'

// 검색엔진이 회사·매장 정보를 이해하도록 넣는 구조화 데이터(사이트에 이미 공개된 정보만)
const businessLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE.url}/#business`,
  name: SITE.legalName,
  alternateName: [SITE.name, '대양아이엔지', 'DAEYANG ING'],
  description: SITE.description,
  url: SITE.url,
  image: `${SITE.url}/opengraph-image`,
  email: SITE.email,
  taxID: SITE.bizNo,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.locality,
    addressRegion: SITE.address.region,
    addressCountry: SITE.address.country,
  },
  geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  areaServed: 'KR',
  knowsAbout: ['지퍼', '지퍼 풀러', '의류 부자재', '메탈 지퍼', '비슬론 지퍼', '나일론 지퍼', '콘실 지퍼', '지퍼 맞춤 제작'],
  makesOffer: ['지퍼', '지퍼 풀러'].map((name) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Product', name, category: '의류 부자재 > 지퍼' },
  })),
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(businessLd) }} />
      <main>
        <Hero />
        <Intro />
        <Company />
        <Promises />
        <Products />
        <Custom />
        <Craft />
        <Contact />
        <Location />
      </main>
    </>
  )
}
