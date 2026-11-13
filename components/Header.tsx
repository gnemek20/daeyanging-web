import Link from 'next/link'
import MobileMenu from './MobileMenu'

export const NAV_LINKS = [
  { href: '/#company', label: '회사소개' },
  { href: '/#products', label: '제품' },
  { href: '/#contact', label: '상담문의' },
  { href: '/#location', label: '오시는 길' },
]

// 서버 컴포넌트. 스크롤에 따른 배경 변화는 CSS 스크롤 기반 애니메이션이 맡는다(globals.css .top).
const Header = () => {
  return (
    <header className="top">
      <div className="top__inner">
        <Link className="brand" href="/" aria-label="대양ING 처음으로">
          <span className="brand__dy">DY</span>
          <span className="brand__kr">대양ING</span>
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <MobileMenu links={NAV_LINKS} />
      </div>
    </header>
  )
}

export default Header
