'use client'

import { useEffect, useRef, useState } from 'react'

// 가이드 목차: 지금 보고 있는 꼭지를 IntersectionObserver 로 잡아 진하게 표시한다.
// 화면 위쪽(머리글 바로 아래 ~ 화면 40% 지점)에 걸친 꼭지 중 목차 순서상 가장 앞선 것이 "지금 꼭지".
// 진하게 바뀌어도 폭이 그대로이게 굵은 글자 폭을 미리 잡아 둔다(.hb__toc-label).
// 좁은 화면: 머리글 바로 아래에 붙어 따라오는 막대(지금 꼭지 이름) → 누르면 전체 목차가 펼쳐져 바로 고른다.
type Item = { id: string; label: string }

const pad = (i: number) => String(i + 1).padStart(2, '0')

const HandbookToc = ({ items }: { items: readonly Item[] }) => {
  const [active, setActive] = useState(items[0]?.id ?? '')
  const [open, setOpen] = useState(false)
  const nav = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = getComputedStyle(document.documentElement)
    const header = parseFloat(root.getPropertyValue('--header-h')) || 72
    // 좁은 화면에서는 목차 막대만큼 더 내려간 곳부터 본다
    const bar = nav.current?.querySelector<HTMLElement>('.hb__toc-bar')?.offsetHeight ?? 0
    const visible = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        const first = items.find((i) => visible.has(i.id))
        if (first) setActive(first.id)
      },
      { rootMargin: `-${header + bar + 1}px 0px -60% 0px` },
    )
    for (const i of items) {
      const el = document.getElementById(i.id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [items])

  // 펼친 목차: 바깥을 누르거나 Esc 로 닫는다
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!nav.current?.contains(e.target as Node)) setOpen(false)
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

  const cur = Math.max(0, items.findIndex((t) => t.id === active))

  return (
    <nav className="hb__toc" aria-label="가이드 목차" ref={nav} data-open={open || undefined}>
      <button type="button" className="hb__toc-bar" aria-expanded={open} aria-controls="hb-toc-list" onClick={() => setOpen((o) => !o)}>
        <span className="hb__toc-n">{pad(cur)}</span>
        <span className="hb__toc-cur">{items[cur]?.label}</span>
        <span className="hb__toc-all">
          목차
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 4.5 6 8l3.5-3.5" />
          </svg>
        </span>
      </button>
      <p className="hb__toc-h">목차</p>
      <ol id="hb-toc-list">
        {items.map((t, i) => (
          <li key={t.id}>
            <a href={`#${t.id}`} aria-current={active === t.id ? 'location' : undefined} onClick={() => setOpen(false)}>
              <span className="hb__toc-n">{pad(i)}</span>
              <span className="hb__toc-label" data-label={t.label}>
                {t.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default HandbookToc
