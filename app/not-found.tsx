import Link from 'next/link'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

export default function NotFound() {
  // 없는 주소는 사이트 틀(app/(site)/layout) 밖에서 그려지므로 머리글·바닥글을 직접 둔다
  return (
    <>
      <Header />
    <main className="doc">
      <div className="wrap doc__wrap">
        <h1 className="doc__title">페이지를 찾을 수 없습니다</h1>
        <p className="doc__lead">
          <span className="ph">주소가 바뀌었거나 없는 페이지입니다.</span>{' '}
          <span className="ph">위의 메뉴에서 다시 찾아보세요.</span>
        </p>
        <div className="hero__cta">
          <Link className="btn btn--ink" href="/">
            처음으로
          </Link>
          <Link className="btn btn--ghost" href="/contact">
            상담 문의하기
          </Link>
        </div>
      </div>
    </main>
      <Footer />
    </>
  )
}
