import type { Metadata } from 'next'
import Handbook from '@/components/Handbook'
import PageHead from '@/components/PageHead'
import { OG_BASE } from '@/lib/site'

export const metadata: Metadata = {
  title: '지퍼 가이드',
  description:
    '설정을 바꿔 가며 직접 확인하는 지퍼 미리보기와 지퍼의 구조와 종류, 호수와 형태, 슬라이더와 손잡이, 컬러와 마감, 옷 종류별 추천, 길이 재는 법, 사용과 관리, 주문 순서, 용어 사전까지. 지퍼를 처음 다루는 분을 위한 가이드입니다.',
  alternates: { canonical: '/handbook' },
  openGraph: { ...OG_BASE, url: '/handbook', title: '지퍼 가이드 | 대양ING' },
}

export default function HandbookPage() {
  return (
    <main className="tabpage">
      <PageHead
        en="Guide"
        title="지퍼 가이드"
        lead={
          <>
            <span className="ph">지퍼를 처음 다루는 분도</span> <span className="ph">이 한 페이지로 고르고, 재고, 주문하고,</span>{' '}
            <span className="ph">오래 쓸 수 있도록 정리했습니다.</span>
          </>
        }
      />
      <div className="sec sec--tight">
        <Handbook />
      </div>
    </main>
  )
}
