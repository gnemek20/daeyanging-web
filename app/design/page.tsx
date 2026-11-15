import type { Metadata } from 'next'
import PageHead from '@/components/PageHead'
import ZipperDesigner from '@/components/ZipperDesigner'
import { parseSpec } from '@/lib/zipperSpec'
import { OG_BASE } from '@/lib/site'

export const metadata: Metadata = {
  title: '맞춤 제작',
  description:
    '지퍼 종류와 호수, 형태와 길이, 테이프·이·슬라이더 컬러, 슬라이더 방식, 손잡이 모양과 각인, 테이프 인쇄까지 직접 골라 보고 그 사양 그대로 맞춤 제작을 문의하세요.',
  alternates: { canonical: '/design' },
  openGraph: { ...OG_BASE, url: '/design', title: '맞춤 제작 | 대양ING' },
}

export default async function DesignPage({ searchParams }: PageProps<'/design'>) {
  const spec = parseSpec(await searchParams)
  return (
    <main className="tabpage">
      <PageHead
        en="Custom"
        title="맞춤 제작"
        lead={
          <>
            <span className="ph">정해진 규격에 맞추지 않습니다.</span>{' '}
            <span className="ph">원하는 사양을 직접 골라 보세요.</span>{' '}
            <span className="ph">고른 사양은 그대로</span> <span className="ph">문의서에 담겨 전달됩니다.</span>
          </>
        }
      />
      <div className="sec sec--tight">
        <div className="wrap">
          <ZipperDesigner initial={spec} />
        </div>
      </div>
    </main>
  )
}
