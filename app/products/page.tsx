import type { Metadata } from 'next'
import PageHead from '@/components/PageHead'
import Products from '@/components/Products'
import { OG_BASE } from '@/lib/site'

export const metadata: Metadata = {
  title: '제품',
  description:
    '메탈·비슬론·나일론·콘실 지퍼와 슬라이더·손잡이, 테이프 인쇄, 방수 지퍼. 모든 제품은 컬러와 규격을 맞춤으로 제작합니다.',
  alternates: { canonical: '/products' },
  openGraph: { ...OG_BASE, url: '/products', title: '제품 | 대양ING' },
}

export default function ProductsPage() {
  return (
    <main className="tabpage">
      <PageHead
        en="Products"
        title="제품"
        lead={
          <>
            <span className="ph">메탈부터 나일론까지,</span> <span className="ph">옷의 성격에 맞는 지퍼를 고르세요.</span>{' '}
            <span className="ph">모든 제품은 컬러와 규격을</span> <span className="ph">맞춤으로 제작합니다.</span>
          </>
        }
      />
      <Products />
    </main>
  )
}
