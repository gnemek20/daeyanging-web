import type { Metadata } from 'next'
import Craft from '@/components/Craft'
import Gallery from '@/components/Gallery'
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
      <h1 className="sr-only">제품</h1>
      <Products />
      <Gallery />
      <Craft />
    </main>
  )
}
