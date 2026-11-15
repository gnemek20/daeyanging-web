import Link from 'next/link'
import Logo from './Logo'
import { SITE } from '@/lib/site'
import { TABS } from '@/lib/tabs'

const Footer = () => {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__top">
          <Link className="foot__brand" href="/" aria-label="대양ING 처음으로">
            <Logo className="brand__logo" />
            <span>대양ING</span>
          </Link>
          <nav className="foot__nav" aria-label="바닥글 메뉴">
            {TABS.map((t) => (
              <Link key={t.href} href={t.href}>
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="foot__biz">
          <p>
            {SITE.legalName} <span aria-hidden="true">|</span> 사업자번호 {SITE.bizNo}
          </p>
          <p>{SITE.address.full}</p>
          <p>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
          <p className="foot__copy">ⓒ 2026 {SITE.legalName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
