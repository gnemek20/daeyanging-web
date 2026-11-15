'use client'

import { useEffect, useRef, useState } from 'react'

// 가이드 목차: 지금 보고 있는 꼭지를 IntersectionObserver 로 잡아 진하게 표시한다.
// 화면 위쪽(머리글 바로 아래 ~ 화면 40% 지점)에 걸친 꼭지 중 목차 순서상 가장 앞선 것이 "지금 꼭지".
// 진하게 바뀌어도 폭이 그대로이게 굵은 글자 폭을 미리 잡아 둔다(.hb__toc-label).
type Item = { id: string; label: string }

const HandbookToc = ({ items }: { items: readonly Item[] }) => {
  const [active, setActive] = useState(items[0]?.id ?? '')
  const ref = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72
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
      { rootMargin: `-${header + 1}px 0px -60% 0px` },
    )
    for (const i of items) {
      const el = document.getElementById(i.id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [items])

  // 좁은 화면(가로로 넘기는 목차): 지금 꼭지가 늘 보이게 목차만 가로로 옮긴다(페이지는 움직이지 않음)
  useEffect(() => {
    const ol = ref.current
    const cur = ol?.querySelector<HTMLElement>('[aria-current]')
    if (!ol || !cur || ol.scrollWidth <= ol.clientWidth) return
    const o = ol.getBoundingClientRect()
    const c = cur.getBoundingClientRect()
    ol.scrollTo({ left: ol.scrollLeft + (c.left - o.left) - (o.width - c.width) / 2, behavior: 'smooth' })
  }, [active])

  return (
    <nav className="hb__toc" aria-label="가이드 목차">
      <p className="hb__toc-h">목차</p>
      <ol ref={ref}>
        {items.map((t, i) => (
          <li key={t.id}>
            <a href={`#${t.id}`} aria-current={active === t.id ? 'location' : undefined}>
              <span className="hb__toc-n">{String(i + 1).padStart(2, '0')}</span>
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
