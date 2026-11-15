'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { TABS } from '@/lib/tabs'

// 머리글 탭: 누르면 해당 화면으로 바뀐다(페이지 새로 고침 없이). 지금 화면의 탭은 aria-current 로 표시한다.
// 좁은 화면에서는 머리글 아래 한 줄로 가로로 넘겨 보며, 지금 탭이 늘 보이게 스크롤해 둔다.
const Tabs = () => {
  const path = usePathname()
  const ref = useRef<HTMLElement>(null)

  // 지금 탭을 가운데로. 처음 열 때는 레이아웃이 잡힌 다음 프레임에 바로, 탭을 바꿀 때는 부드럽게.
  const first = useRef(true)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const nav = ref.current
      const cur = nav?.querySelector<HTMLElement>('[aria-current="page"]')
      if (!nav || !cur) return
      const n = nav.getBoundingClientRect()
      const c = cur.getBoundingClientRect()
      const left = nav.scrollLeft + (c.left - n.left) - (n.width - c.width) / 2
      nav.scrollTo({ left, behavior: first.current ? 'instant' : 'smooth' })
      first.current = false
    })
    return () => cancelAnimationFrame(id)
  }, [path])

  return (
    <nav className="tabs" aria-label="주요 메뉴" ref={ref}>
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={path === t.href ? 'page' : undefined}>
          <span className="tabs__label" data-label={t.label}>
            {t.label}
          </span>
        </Link>
      ))}
    </nav>
  )
}

export default Tabs
