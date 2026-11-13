'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const LINKS = [
  { href: '/#company', label: '회사소개' },
  { href: '/#products', label: '제품' },
  { href: '/#contact', label: '상담문의' },
  { href: '/#location', label: '오시는 길' },
]

const Header = () => {
  const [active, setActive] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      const pos = window.scrollY + window.innerHeight * 0.35
      let cur: string | null = null
      for (const { href } of LINKS) {
        const sec = document.querySelector<HTMLElement>(href.slice(1))
        if (sec && sec.offsetTop <= pos) cur = href
      }
      setActive(window.scrollY > 40 ? cur : null)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const closeMenu = () => menuRef.current?.removeAttribute('open')

  return (
    <header className={`top${scrolled ? ' top--scrolled' : ''}`}>
      <div className="top__inner">
        <Link className="brand" href="/" aria-label="대양ING 처음으로">
          <span className="brand__dy">DY</span>
          <span className="brand__kr">대양ING</span>
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} aria-current={active === l.href ? 'true' : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <details className="mnav" ref={menuRef}>
          <summary aria-label="메뉴 열기">메뉴</summary>
          <div className="mnav__panel">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={closeMenu}>
                {l.label}
              </a>
            ))}
          </div>
        </details>
      </div>
    </header>
  )
}

export default Header
