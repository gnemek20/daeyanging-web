import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="doc">
      <div className="wrap doc__wrap">
        <h1 className="doc__title">페이지를 찾을 수 없습니다</h1>
        <p className="doc__lead">
          <span className="ph">주소가 바뀌었거나 없는 페이지입니다.</span>{' '}
          <span className="ph">처음 화면이나 가이드에서 다시 찾아보세요.</span>
        </p>
        <div className="hero__cta">
          <Link className="btn btn--ink" href="/">
            처음으로
          </Link>
          <Link className="btn btn--ghost" href="/guide">
            지퍼 가이드 보기
          </Link>
        </div>
      </div>
    </main>
  )
}
