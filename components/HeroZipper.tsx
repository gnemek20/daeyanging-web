'use client'

// 첫 화면의 세로 지퍼. 처음엔 닫혀 있다가 슬라이더가 내려가며 열리고,
// 열린 두 테이프가 양옆으로 휘어 날개 모양이 된다("패션에 새로운 날개를 달다").
// 손잡이는 끌거나(포인터) 화살표 키로 여닫을 수 있다. 동작 줄이기 설정이면 처음부터 열린 모습으로 둔다.

import { useCallback, useEffect, useRef, useState } from 'react'

const N = 30 // 한쪽 이 개수
const P = 24 // 이 간격
const L = N * P // 지퍼 길이
const GAP = 10 // 닫혔을 때 테이프 안쪽 가장자리와 중심 사이
const TOOTH_W = 30
const TOOTH_H = P * 0.56
const TAPE_W = 84
const OPEN = Math.round(L * 0.6)
const MAX = Math.round(L * 0.78)
const SPREAD = 250 // 기준 거리(450)에서 벌어지는 폭

const ox = (d: number) => (d <= 0 ? 0 : SPREAD * Math.pow(d / 450, 1.6))
const oxSlope = (d: number) => (d <= 0 ? 0 : ((SPREAD * 1.6) / 450) * Math.pow(d / 450, 0.6))

type Side = -1 | 1

function edgeAt(y: number, s: number, side: Side) {
  const d = s - y
  const x = side * (GAP + ox(d))
  const a = d > 0 ? oxSlope(d) : 0 // 왼쪽 가장자리의 dx/dy (오른쪽은 부호 반대)
  return { x, a }
}

function tapePath(s: number, side: Side) {
  const inner: [number, number][] = []
  const outer: [number, number][] = []
  const ys: number[] = []
  for (let y = -34; y <= L + 46; y += 8) ys.push(y)
  if (s > -34 && s < L + 46) ys.push(s)
  ys.sort((p, q) => p - q)
  for (const y of ys) {
    const { x, a } = edgeAt(y, s, side)
    const n = Math.hypot(1, a)
    // 바깥쪽 법선: 왼쪽 (-1, a), 오른쪽 (1, a)
    inner.push([x, y])
    outer.push([x + (side * TAPE_W) / n, y + (a * TAPE_W) / n])
  }
  const pts = [...inner, ...outer.reverse()]
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z'
}

function stitchPath(s: number, side: Side) {
  const pts: string[] = []
  for (let y = -30; y <= L + 42; y += 8) {
    const { x, a } = edgeAt(y, s, side)
    const n = Math.hypot(1, a)
    const k = TAPE_W - 16
    pts.push(`${(x + (side * k) / n).toFixed(1)} ${(y + (a * k) / n).toFixed(1)}`)
  }
  return 'M' + pts.join('L')
}

function Teeth({ s, side }: { s: number; side: Side }) {
  const els = []
  for (let i = 0; i < N; i++) {
    const y = i * P + (side === 1 ? P / 2 : 0)
    const { x, a } = edgeAt(y, s, side)
    const deg = (side * -Math.atan(a) * 180) / Math.PI
    els.push(
      <g key={i} transform={`translate(${x.toFixed(1)} ${y}) rotate(${deg.toFixed(2)})`}>
        <rect
          x={side === -1 ? -8 : -(TOOTH_W - 8)}
          y={-TOOTH_H / 2}
          width={TOOTH_W}
          height={TOOTH_H}
          rx={3}
          fill="url(#hz-brass)"
        />
        <rect
          x={side === -1 ? -4 : -(TOOTH_W - 12)}
          y={-TOOTH_H / 2 + 2}
          width={TOOTH_W - 8}
          height={2.4}
          rx={1.2}
          fill="#fff"
          opacity={0.45}
        />
      </g>,
    )
  }
  return <>{els}</>
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const HeroZipper = () => {
  const [s, setS] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)
  const animRef = useRef<number | null>(null)
  const dragRef = useRef<{ offset: number } | null>(null)

  const stopAnim = () => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current)
    animRef.current = null
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // 움직임 없이 바로 열린 모습으로
      animRef.current = requestAnimationFrame(() => setS(OPEN))
      return stopAnim
    }
    const delay = 350
    const dur = 1900
    let t0: number | null = null
    const tick = (now: number) => {
      if (t0 === null) t0 = now
      const t = Math.min(1, Math.max(0, (now - t0 - delay) / dur))
      setS(OPEN * easeInOut(t))
      animRef.current = t < 1 ? requestAnimationFrame(tick) : null
    }
    animRef.current = requestAnimationFrame(tick)
    return stopAnim
  }, [])

  const toSvgY = useCallback((clientY: number) => {
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return 0
    const pt = svg.createSVGPoint()
    pt.x = 0
    pt.y = clientY
    return pt.matrixTransform(ctm.inverse()).y
  }, [])

  const clamp = (v: number) => Math.min(MAX, Math.max(0, v))

  const onPointerDown = (e: React.PointerEvent<SVGGElement>) => {
    stopAnim()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { offset: toSvgY(e.clientY) - s }
  }
  const onPointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!dragRef.current) return
    setS(clamp(toSvgY(e.clientY) - dragRef.current.offset))
  }
  const onPointerUp = () => {
    dragRef.current = null
  }
  const onKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
    const step = { ArrowDown: P, ArrowRight: P, ArrowUp: -P, ArrowLeft: -P, PageDown: P * 5, PageUp: -P * 5 } as Record<string, number>
    let next: number | null = null
    if (e.key in step) next = clamp(s + step[e.key])
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = MAX
    if (next === null) return
    e.preventDefault()
    stopAnim()
    setS(next)
  }

  const pct = Math.round((s / MAX) * 100)

  return (
    <figure className="hz">
      <svg ref={svgRef} viewBox="-440 -70 880 930" className="hz__svg" aria-hidden={false} role="group" aria-label="열리면 날개 모양이 되는 지퍼 그림">
        <defs>
          <linearGradient id="hz-brass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ECD08C" />
            <stop offset="0.55" stopColor="#B58A3A" />
            <stop offset="1" stopColor="#7A571C" />
          </linearGradient>
          <linearGradient id="hz-slider" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8A6526" />
            <stop offset="0.45" stopColor="#E3C47C" />
            <stop offset="1" stopColor="#9C732D" />
          </linearGradient>
          <pattern id="hz-weave" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M0 2.5h5" stroke="#fff" strokeOpacity="0.06" strokeWidth="1" />
          </pattern>
        </defs>

        {([-1, 1] as Side[]).map((side) => (
          <g key={side}>
            <path d={tapePath(s, side)} fill="var(--indigo)" />
            <path d={tapePath(s, side)} fill="url(#hz-weave)" />
            <path d={stitchPath(s, side)} fill="none" stroke="#fff" strokeOpacity="0.32" strokeWidth="1.6" strokeDasharray="7 6" />
          </g>
        ))}

        <Teeth s={s} side={-1} />
        <Teeth s={s} side={1} />

        {/* 아래 멈춤쇠 */}
        <rect x={-18} y={L + 2} width={36} height={14} rx={3} fill="url(#hz-brass)" />

        {/* 슬라이더 몸통 */}
        <g transform={`translate(0 ${s.toFixed(1)})`}>
          <path d="M-36 -46 Q-36 -52 -30 -52 H30 Q36 -52 36 -46 L24 26 Q22 34 14 34 H-14 Q-22 34 -24 26 Z" fill="url(#hz-slider)" />
          <path d="M-26 -42 H26" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="0" cy="-14" r="7" fill="#6E4F18" />
        </g>

        {/* 손잡이: 끌어서 여닫는다 */}
        <g
          className="hz__pull"
          transform={`translate(0 ${s.toFixed(1)})`}
          role="slider"
          tabIndex={0}
          aria-label="지퍼 손잡이"
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={`${pct}% 열림`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <rect className="hz__ring" x={-30} y={-24} width={60} height={150} rx={22} />
          <rect x={-17} y={-16} width={34} height={128} rx={16} fill="url(#hz-slider)" />
          <rect x={-7} y={68} width={14} height={34} rx={7} fill="var(--indigo)" />
          <rect x={-40} y={-30} width={80} height={170} fill="transparent" />
        </g>
      </svg>
      <figcaption className="hz__hint">손잡이를 끌어 지퍼를 여닫아 보세요</figcaption>
    </figure>
  )
}

export default HeroZipper
