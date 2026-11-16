import type { Metadata } from 'next'
import Custom from '@/components/Custom'
import { OG_BASE } from '@/lib/site'

export const metadata: Metadata = {
  title: '맞춤 제작',
  description:
    '정해진 규격에 맞추지 않습니다. 메탈·비슬론·나일론·콘실 지퍼를 사이즈, 컬러, 마감까지 1:1 맞춤 제작합니다.',
  alternates: { canonical: '/design' },
  openGraph: { ...OG_BASE, url: '/design', title: '맞춤 제작 | 대양ING' },
}

export default function DesignPage() {
  return (
    <main className="tabpage">
      <h1 className="sr-only">맞춤 제작</h1>
      <Custom />
    </main>
  )
}
