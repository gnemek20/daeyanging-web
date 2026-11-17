import Link from 'next/link'
import { logout } from '@/app/dashboard/actions'

// 대시보드 머리: 화면 전환(통계 · 문의) + 로그인한 주소 · 로그아웃. 통계 화면은 기간 고르기를 children 으로 넣는다.
const Top = ({
  email,
  current,
  unhandled,
  children,
}: {
  email: string
  current: 'stats' | 'inquiries'
  unhandled?: number
  children?: React.ReactNode
}) => (
  <header className="dash__top">
    <div>
      <p className="dash__brand">대양ING</p>
      <h1 className="sr-only">대시보드 · {current === 'stats' ? '통계' : '문의'}</h1>
      <nav className="dash__nav" aria-label="대시보드 화면">
        <Link href="/dashboard" aria-current={current === 'stats' ? 'page' : undefined}>
          통계
        </Link>
        <Link href="/dashboard/inquiries" aria-current={current === 'inquiries' ? 'page' : undefined}>
          문의
          {!!unhandled && (
            <span className="dash__badge" aria-label={`미처리 ${unhandled}건`}>
              {unhandled}
            </span>
          )}
        </Link>
      </nav>
    </div>
    {children}
    <form action={logout} className="dash__who">
      <span>{email}</span>
      <button type="submit">로그아웃</button>
    </form>
  </header>
)

export default Top
