import type { Metadata } from 'next'
import Company from '@/components/Company'
import Numbers from '@/components/Numbers'
import { OG_BASE } from '@/lib/site'

export const metadata: Metadata = {
  title: '회사소개',
  description:
    '주식회사 대양아이엔지는 서울 종로·동대문 일대에서 지퍼와 의류 부자재를 제작·공급합니다. 국내외 15개 이상의 생산 공장과 함께 소량 샘플부터 대량 납품까지.',
  alternates: { canonical: '/company' },
  openGraph: { ...OG_BASE, url: '/company', title: '회사소개 | 대양ING' },
}

export default function CompanyPage() {
  return (
    <main className="tabpage">
      <h1 className="sr-only">회사소개</h1>
      <Company />
      <Numbers />
    </main>
  )
}
