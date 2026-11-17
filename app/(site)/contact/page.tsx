import type { Metadata } from 'next'
import Contact from '@/components/Contact'
import Location from '@/components/Location'
import { OG_BASE } from '@/lib/site'

export const metadata: Metadata = {
  title: '상담 문의',
  description:
    '샘플 요청, 단가 문의, 지퍼 맞춤 제작 상담. 의류 창업이 처음이어도 편하게 문의하세요. 서울 종로구 김상옥로 59 (종로5가역·동대문역 인근).',
  alternates: { canonical: '/contact' },
  openGraph: { ...OG_BASE, url: '/contact', title: '상담 문의 | 대양ING' },
}

export default function ContactPage() {
  return (
    <main className="tabpage">
      <h1 className="sr-only">상담 문의</h1>
      <Contact />
      <Location />
    </main>
  )
}
