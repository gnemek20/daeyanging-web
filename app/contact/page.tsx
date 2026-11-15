import type { Metadata } from 'next'
import Contact from '@/components/Contact'
import Location from '@/components/Location'
import PageHead from '@/components/PageHead'
import { OG_BASE } from '@/lib/site'
import { describeSpec, hasSpec, parseSpec, toQuery } from '@/lib/zipperSpec'

export const metadata: Metadata = {
  title: '상담 문의',
  description:
    '샘플 요청, 단가 문의, 지퍼 맞춤 제작 상담. 의류 창업이 처음이어도 편하게 문의하세요. 서울 종로구 김상옥로 59 (종로5가역·동대문역 인근).',
  alternates: { canonical: '/contact' },
  openGraph: { ...OG_BASE, url: '/contact', title: '상담 문의 | 대양ING' },
}

export default async function ContactPage({ searchParams }: PageProps<'/contact'>) {
  const params = await searchParams
  // 맞춤 제작 화면에서 "이 사양으로 문의하기"로 왔으면 그 사양을 폼에 담는다
  const spec = hasSpec(params) ? parseSpec(params) : null
  // 가이드의 "의류 창업이 처음이에요"로 왔으면 작성 안내 양식을 열어 둔 채로 시작한다
  const first = params.first === '1'
  return (
    <main className="tabpage">
      <PageHead
        en="Contact"
        title="상담 문의"
        lead={
          <>
            <span className="ph">샘플 요청, 단가 문의, 맞춤 제작 상담 —</span>{' '}
            <span className="ph">어떤 단계든 편하게 연락 주세요.</span>
          </>
        }
      />
      <Contact spec={spec ? { query: toQuery(spec), rows: describeSpec(spec) } : null} first={first} />
      <Location />
    </main>
  )
}
