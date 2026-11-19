'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { TABS } from '@/lib/tabs'

// 머리글 탭: 누르면 해당 화면으로 바뀐다(페이지 새로 고침 없이). 지금 화면의 탭은 aria-current 로 표시한다.
// 좁은 화면: 머리글은 한 줄(로고 + 메뉴 단추). 단추를 누르면 머리글 아래로 탭 목록이 펼쳐진다.
const Tabs = () => {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [openedAt, setOpenedAt] = useState(path)
  const box = useRef<HTMLDivElement>(null)

  // 다른 화면으로 가면 닫는다(렌더 중 상태 맞추기)
  if (open && openedAt !== path) {
    setOpen(false)
    setOpenedAt(path)
  }

  // 펼친 동안: 바깥을 누르거나 Esc 로 닫는다
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="tabs-box" ref={box} data-open={open || undefined}>
      <button
        type="button"
        className="tabs__menu"
        aria-expanded={open}
        aria-controls="main-tabs"
        aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
        onClick={() => {
          setOpen((o) => !o)
          setOpenedAt(path)
        }}
      >
        <span className="tabs__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      <nav className="tabs" id="main-tabs" aria-label="주요 메뉴">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} aria-current={path === t.href ? 'page' : undefined} onClick={() => setOpen(false)}>
            <span className="tabs__label" data-label={t.label}>
              {t.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Tabs
