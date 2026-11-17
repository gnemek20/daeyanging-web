import Analytics from '@/components/Analytics'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import TopSentinel from '@/components/TopSentinel'

// 사이트 화면 공통 틀: 머리글·바닥글 + 방문 기록. 대시보드(/dashboard)는 이 묶음 밖이라 둘 다 없다.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopSentinel />
      <Header />
      {children}
      <Footer />
      <Analytics />
    </>
  )
}
