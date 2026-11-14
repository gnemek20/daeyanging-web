import Link from 'next/link'
import Logo from './Logo'
import MobileMenu from './MobileMenu'
import NavLink from './NavLink'

export const NAV_LINKS = [
  { id: 'company', label: '회사소개' },
  { id: 'products', label: '제품' },
  { id: 'contact', label: '상담문의' },
  { id: 'location', label: '오시는 길' },
]

// 서버 컴포넌트. 배경·밑줄은 TopSentinel 이 켜는 <html data-at-top> 에 따라 CSS 가 다룬다.
const Header = () => {
  return (
    <header className="top">
      <div className="top__inner">
        <Link className="brand" href="/" aria-label="대양ING 처음으로">
          <Logo className="brand__logo" />
          <span className="brand__kr">대양ING</span>
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.id} id={l.id}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <MobileMenu links={NAV_LINKS} />
      </div>
    </header>
  )
}

export default Header
