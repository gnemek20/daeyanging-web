'use client'

import { useEffect, useRef } from 'react'

const Header = () => {
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('.hnav .links a')]
    const spy = navLinks
      .map((a) => ({ a, sec: document.querySelector<HTMLElement>(a.getAttribute('href') || '') }))
      .filter((x) => x.sec)

    const onScroll = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle('scrolled', window.scrollY > 30)
      }

      const pos = window.scrollY + window.innerHeight * 0.32
      let cur: { a: HTMLAnchorElement; sec: HTMLElement | null } | null = null
      for (const item of spy) {
        if (item.sec && item.sec.offsetTop <= pos) cur = item
      }

      navLinks.forEach((a) => a.classList.remove('active'))
      if (cur && window.scrollY > 40) cur.a.classList.add('active')
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header id="topbar" ref={headerRef}>
      <div className="brand" onClick={scrollToTop}>
        <span className="dy">DY</span>
        <span className="kr">대양ING</span>
      </div>
      <nav className="hnav">
        <div className="links">
          <a href="#company">회사소개</a>
          <a href="#products">제품</a>
          <a href="#contact">상담문의</a>
          <a href="#location">오시는 길</a>
        </div>
      </nav>
    </header>
  )
}

export default Header
