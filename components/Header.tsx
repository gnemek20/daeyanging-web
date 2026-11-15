import Link from 'next/link'
import Logo from './Logo'
import Tabs from './Tabs'

// 서버 컴포넌트. 배경·밑줄은 TopSentinel 이 켜는 <html data-at-top> 에 따라 CSS 가 다룬다.
const Header = () => {
  return (
    <header className="top">
      <div className="top__inner">
        <Link className="brand" href="/" aria-label="대양ING 처음으로">
          <Logo className="brand__logo" />
          <span className="brand__kr">대양ING</span>
        </Link>
        <Tabs />
      </div>
    </header>
  )
}

export default Header
