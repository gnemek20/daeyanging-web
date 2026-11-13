'use client'

// 첫 화면의 "지퍼 컬러 카드". 부자재 쇼룸의 컬러 카드처럼 색색의 지퍼 테이프가 나란히 걸려 있고,
// 처음 열릴 때 슬라이더들이 물결처럼 내려가며 지퍼가 열린다. 포인터를 올리면 가까운 슬라이더들이 포인터를 따라온다.
// 장식용 그림이므로 보조기기에는 숨긴다. 동작 줄이기 설정이면 물결 모양으로 멈춘 채 보여 준다.

import { useEffect, useRef } from 'react'

type Metal = 'brass' | 'silver' | 'gun' | 'self'

const TAPES: { c: string; m: Metal }[] = [
  { c: '#EDE6D6', m: 'brass' },
  { c: '#C9A27A', m: 'brass' },
  { c: '#E0662F', m: 'self' },
  { c: '#C8202F', m: 'silver' },
  { c: '#E9A6B4', m: 'silver' },
  { c: '#8C7AC4', m: 'self' },
  { c: '#2B3A8C', m: 'brass' },
  { c: '#1F6FD1', m: 'silver' },
  { c: '#0F7A5C', m: 'self' },
  { c: '#9AAF4A', m: 'brass' },
  { c: '#F2C230', m: 'gun' },
  { c: '#4A4038', m: 'brass' },
  { c: '#17181C', m: 'silver' },
]

const rest = (i: number) => 0.34 + 0.2 * Math.sin(i * 0.62 + 0.4) + 0.06 * Math.sin(i * 1.7)

const HeroRack = () => {
  const rackRef = useRef<HTMLDivElement>(null)
  const state = useRef({
    cur: TAPES.map(() => 0.02),
    target: TAPES.map((_, i) => rest(i)),
    start: TAPES.map((_, i) => i * 70),
    t0: 0,
    raf: 0 as number,
    reduced: false,
  })

  useEffect(() => {
    const s = state.current
    const rack = rackRef.current
    if (!rack) return
    const tapes = [...rack.querySelectorAll<HTMLElement>('.tp')]
    const apply = () => tapes.forEach((el, i) => el.style.setProperty('--p', `${(s.cur[i] * 100).toFixed(2)}%`))

    s.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (s.reduced) {
      s.cur = TAPES.map((_, i) => rest(i))
      apply()
      return
    }

    const tick = (now: number) => {
      if (!s.t0) s.t0 = now
      let moving = false
      for (let i = 0; i < tapes.length; i++) {
        if (now - s.t0 < 400 + s.start[i]) {
          moving = true
          continue
        }
        const d = s.target[i] - s.cur[i]
        if (Math.abs(d) > 0.0008) {
          s.cur[i] += d * 0.09
          moving = true
        } else s.cur[i] = s.target[i]
      }
      apply()
      s.raf = moving ? requestAnimationFrame(tick) : 0
    }
    apply()
    s.raf = requestAnimationFrame(tick)
    ;(rack as HTMLDivElement & { _kick?: () => void })._kick = () => {
      if (!s.raf) s.raf = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(s.raf)
  }, [])

  const kick = () => (rackRef.current as (HTMLDivElement & { _kick?: () => void }) | null)?._kick?.()

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = state.current
    if (s.reduced || !rackRef.current) return
    const r = rackRef.current.getBoundingClientRect()
    const visible = [...rackRef.current.querySelectorAll<HTMLElement>('.tp')].filter((el) => el.offsetParent !== null)
    const n = visible.length
    const xi = ((e.clientX - r.left) / r.width) * n - 0.5
    const py = Math.min(0.9, Math.max(0.06, (e.clientY - r.top) / r.height))
    for (let i = 0; i < TAPES.length; i++) {
      const vi = visible.indexOf(rackRef.current.querySelectorAll<HTMLElement>('.tp')[i])
      if (vi < 0) continue
      const w = Math.exp(-((vi - xi) ** 2) / 1.6)
      s.target[i] = rest(i) * (1 - w) + py * w
    }
    kick()
  }
  const onLeave = () => {
    const s = state.current
    s.target = TAPES.map((_, i) => rest(i))
    kick()
  }

  return (
    <div className="rack" ref={rackRef} aria-hidden="true" onPointerMove={onMove} onPointerLeave={onLeave}>
      {TAPES.map((t, i) => (
        <div key={i} className={`tp tp--${t.m}`} style={{ '--tape': t.c } as React.CSSProperties}>
          <span className="tp__teeth tp__teeth--closed" />
          <span className="tp__teeth tp__teeth--l" />
          <span className="tp__teeth tp__teeth--r" />
          <span className="tp__slider" />
        </div>
      ))}
    </div>
  )
}

export default HeroRack
