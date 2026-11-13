'use client'

import Link from 'next/link'
import { useRef } from 'react'

// 모바일 메뉴: <details> 로 열고 닫는다(자바스크립트 없이도 동작). 링크를 누르면 닫기만 클라이언트에서 처리한다.
const MobileMenu = ({ links }: { links: { href: string; label: string }[] }) => {
  const ref = useRef<HTMLDetailsElement>(null)
  return (
    <details className="mnav" ref={ref}>
      <summary aria-label="메뉴 열기">메뉴</summary>
      <div className="mnav__panel">
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => ref.current?.removeAttribute('open')}>
            {l.label}
          </Link>
        ))}
      </div>
    </details>
  )
}

export default MobileMenu
