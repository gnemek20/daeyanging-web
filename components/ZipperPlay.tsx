'use client'

import { useCallback, useState } from 'react'

// 맞춤 제작 미리보기: 끌어서 여닫는 지퍼. 지퍼가 맞물린 구간에서만 테이프 위 글자가 하나로 이어진다.
//
// 성능 설계
// - 지퍼 그림(테이프·글자·이빨)은 한 번만 그려 두고 <use> 로 재사용한다. 움직일 때 SVG 를 다시 그리지 않는다.
// - 화면은 세 구간으로 나눈다: 슬라이더 뒤 "닫힘", 바로 앞 "벌어짐"(위·아래 반쪽을 skewY 로 V 자), 그 앞 "열림".
//   각 구간은 "창(overflow:hidden)을 x 만큼, 안쪽 그림을 -x 만큼" 옮겨 잘라낸다 → 프레임마다 transform 만 바뀐다
//   (레이아웃·페인트 없음, 합성만).
// - 끌기는 스프링(임계 감쇠)으로 따라가고, 놓으면 속도만큼 미끄러진 뒤 멈춘다. 움직임이 멎으면 rAF 도 멈춘다.
// - 자바스크립트가 없을 때도 CSS(var(--s) + cqw)로 같은 첫 화면이 나온다(레이아웃 이동 없음).

export type ZipKind = 'metal' | 'vislon' | 'coil' | 'conceal'

const W = 640 // 그림 좌표 폭 (높이 512, 가운데 줄 CY)
const H = 512
const CY = 256
const L = 170 // 벌어지는 구간 길이
const G = 34 // 완전히 열렸을 때 반쪽이 위·아래로 벌어지는 거리
const S0 = 598 // 첫 화면: 닫힌 상태(글자 완성)
const S_OPEN = 300 // 섹션에 들어오면 여기까지 저절로 열린다
const SMIN = 24
const SMAX = 620

const WORD = 'DAEYANG'
const FS = 150

// 이빨 줄 반폭(가운데 줄에서 테이프 끝까지)과 한 칸 간격
const BAND: Record<ZipKind, number> = { metal: 9, vislon: 10, coil: 7, conceal: 0 }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

const Teeth = ({ kind, half }: { kind: ZipKind; half: 'up' | 'dn' }) => {
  const up = half === 'up'
  if (kind === 'conceal') {
    // 숨은 지퍼: 이빨 대신 접힌 가장자리만
    return (
      <path
        d={`M-60 ${up ? CY - 1.5 : CY + 1.5} H${W + 60}`}
        stroke={up ? '#fff' : '#000'}
        strokeOpacity={up ? 0.28 : 0.22}
        strokeWidth={2}
      />
    )
  }
  return (
    <rect x={-60} y={CY - 34} width={W + 120} height={68} fill={`url(#zp-p-${kind}-${half})`} filter="url(#zp-tsh)" />
  )
}

// 테이프 반쪽: 바탕 + 결 + 가운데로 갈수록 그늘 + 박음질 + 글자(그 반쪽 안만)
const Tape = ({ kind, half }: { kind: ZipKind; half: 'up' | 'dn' }) => {
  const up = half === 'up'
  const b = BAND[kind]
  const y = up ? -320 : CY
  const h = up ? CY + 320 : H + 320 - CY
  return (
    <g filter="url(#zp-hsh)">
      <rect x={-60} y={y} width={W + 120} height={h} className="zp__tape" />
      <rect x={-60} y={y} width={W + 120} height={h} fill="url(#zp-weave)" />
      <rect x={-60} y={y} width={W + 120} height={h} fill={`url(#zp-shade-${half})`} />
      {b > 0 && <rect x={-60} y={up ? CY - b : CY} width={W + 120} height={b} className="zp__core" />}
      <path
        d={`M-60 ${up ? CY - 96 : CY + 96} H${W + 60}`}
        stroke="#fff"
        strokeOpacity={0.32}
        strokeWidth={1.4}
        strokeDasharray="7 5"
      />
      <text
        className="zp__word"
        x={40}
        y={CY + FS * 0.36}
        fontSize={FS}
        textLength={W - 80}
        lengthAdjust="spacingAndGlyphs"
        clipPath={`url(#zp-clip-${half})`}
      >
        {WORD}
      </text>
    </g>
  )
}

const ToothPatterns = () => (
  <>
    {/* 금속: 마감(메탈·무광·유광) 그라데이션 */}
    {(['up', 'dn'] as const).map((h) => (
      <pattern
        key={`m${h}`}
        id={`zp-p-metal-${h}`}
        patternUnits="userSpaceOnUse"
        x={h === 'up' ? 0 : 11}
        y={0}
        width={22}
        height={H}
      >
        <rect x={4.5} y={h === 'up' ? CY - 26 : CY - 9} width={13} height={35} rx={3} fill="url(#zp-metal)" />
        <rect x={7} y={h === 'up' ? CY - 23 : CY - 5} width={3} height={28} rx={1.5} fill="#fff" opacity={0.55} />
      </pattern>
    ))}
    {/* 비슬론(플라스틱): 테이프보다 조금 진한 같은 색 */}
    {(['up', 'dn'] as const).map((h) => (
      <pattern
        key={`v${h}`}
        id={`zp-p-vislon-${h}`}
        patternUnits="userSpaceOnUse"
        x={h === 'up' ? 0 : 12}
        y={0}
        width={24}
        height={H}
      >
        <rect x={4} y={h === 'up' ? CY - 28 : CY - 10} width={16} height={38} rx={5} className="zp__plastic" />
        <rect x={7} y={h === 'up' ? CY - 24 : CY - 6} width={3.5} height={30} rx={1.75} fill="#fff" opacity={0.3} />
      </pattern>
    ))}
    {/* 나일론 코일 */}
    {(['up', 'dn'] as const).map((h) => {
      const d =
        h === 'up'
          ? `M1 ${CY - 15} C 10 ${CY - 13}, 10 ${CY + 3}, 3 ${CY + 6}`
          : `M1 ${CY + 15} C 10 ${CY + 13}, 10 ${CY - 3}, 3 ${CY - 6}`
      return (
        <pattern
          key={`c${h}`}
          id={`zp-p-coil-${h}`}
          patternUnits="userSpaceOnUse"
          x={h === 'up' ? 0 : 6}
          y={0}
          width={12}
          height={H}
        >
          <path d={d} fill="none" strokeWidth={4.6} strokeLinecap="round" className="zp__coil" />
          <path
            d={d}
            fill="none"
            stroke="#fff"
            strokeOpacity={0.35}
            strokeWidth={1.4}
            strokeLinecap="round"
            transform="translate(-1 -1)"
          />
        </pattern>
      )
    })}
  </>
)

// 슬라이더 몸통(슬라이더 위치 s = 0 기준 좌표)
const SliderBody = () => (
  <g transform={`translate(-20 ${CY})`} filter="url(#zp-ssh)">
    <path
      d="M-8 -34 H54 Q70 -34 74 -20 L80 0 L74 20 Q70 34 54 34 H-8 Q-18 34 -18 24 V-24 Q-18 -34 -8 -34 Z"
      fill="url(#zp-metal)"
    />
    <path d="M-6 -24 H52" stroke="#fff" strokeOpacity={0.6} strokeWidth={2.4} strokeLinecap="round" />
    <circle cx={22} cy={8} r={7} fill="url(#zp-metal)" stroke="#000" strokeOpacity={0.25} />
  </g>
)

const Pull = () => (
  <g transform={`translate(-20 ${CY})`} filter="url(#zp-ssh)">
    <g transform="rotate(-72 22 8)">
      <rect x={6} y={2} width={32} height={104} rx={14} fill="url(#zp-metal)" />
      <rect x={10} y={10} width={4} height={86} rx={2} fill="#fff" opacity={0.45} />
      <rect x={15} y={66} width={14} height={28} rx={7} className="zp__tape" />
    </g>
  </g>
)

const Layer = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    {children}
  </svg>
)

const ZipperPlay = () => {
  const [kind, setKind] = useState<ZipKind>('metal')

  // 한 번만 붙인다(형식이 바뀌어 다시 그려져도 슬라이더 위치·스프링 상태 유지)
  const setup = useCallback((root: HTMLDivElement | null) => {
    if (!root) return
    const $ = (sel: string) => root.querySelector<HTMLElement>(sel)!
    const closedWin = $('.zp__win--closed')
    const closedIn = $('.zp__win--closed > .zp__in')
    const wedges = [...root.querySelectorAll<HTMLElement>('.zp__win--wedge')]
    const wedgeIns = wedges.map((w) => w.querySelector<HTMLElement>('.zp__in')!)
    const openWin = $('.zp__win--open')
    const openIn = $('.zp__win--open > .zp__in')
    const slider = $('.zp__slider')
    const pull = $('.zp__pull')
    const handle = $('.zp__handle')
    const scope = root.closest<HTMLElement>('.custom')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')

    let u = root.clientWidth / W // 그림 1 단위 = u px
    let s = S0 // 슬라이더 위치(그림 단위)
    let v = 0 // 속도(단위/초)
    let target = S0
    let k = 900 // 스프링 강도: 끌 때 단단하게, 놓은 뒤엔 부드럽게
    let a = 0 // 손잡이 흔들림 각도
    let av = 0
    let raf = 0
    let last = 0
    let pid = -1
    let startX = 0
    let startY = 0
    let dragging = false
    let offset = 0
    let left = 0
    let touched = false
    let aria = -1

    const px = (n: number) => `translate3d(${(n * u).toFixed(2)}px,0,0)`
    const paint = () => {
      closedWin.style.transform = px(s - W)
      closedIn.style.transform = px(W - s)
      for (let i = 0; i < wedges.length; i++) {
        wedges[i].style.transform = px(s)
        wedgeIns[i].style.transform = px(-s)
      }
      openWin.style.transform = px(s + L)
      openIn.style.transform = px(-(s + L))
      slider.style.transform = px(s)
      handle.style.transform = px(s)
      pull.style.transform = `rotate(${a.toFixed(2)}deg)`
      const pct = Math.round(((clamp(s, SMIN, SMAX) - SMIN) / (SMAX - SMIN)) * 100)
      if (pct !== aria) {
        aria = pct
        handle.setAttribute('aria-valuenow', String(pct))
        handle.setAttribute('aria-valuetext', `${pct}% 닫힘`)
      }
    }

    const tick = (now: number) => {
      const dt = Math.min(0.034, (now - last) / 1000)
      last = now
      const n = Math.max(1, Math.ceil(dt / 0.004)) // 작은 걸음으로 나눠 프레임 속도와 무관하게 안정
      const h = dt / n
      const c = 2 * Math.sqrt(k)
      for (let i = 0; i < n; i++) {
        v += (-k * (s - target) - c * v) * h
        s += v * h
        const at = reduce.matches ? 0 : clamp(-v * 0.03, -32, 32)
        av += (-170 * (a - at) - 9 * av) * h
        a += av * h
      }
      const moving = Math.abs(s - target) > 0.02 || Math.abs(v) > 0.4 || Math.abs(a) > 0.05 || Math.abs(av) > 0.5
      if (!moving) {
        s = target
        v = a = av = 0
      }
      paint()
      raf = moving ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    // 끝을 넘겨 끌면 고무줄처럼 버틴다
    const rubber = (x: number) =>
      x < SMIN ? SMIN - Math.sqrt(SMIN - x) * 4 : x > SMAX ? SMAX + Math.sqrt(x - SMAX) * 4 : x
    const unitsAt = (clientX: number) => (clientX - left) / u

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || pid !== -1) return
      pid = e.pointerId
      startX = e.clientX
      startY = e.clientY
      left = root.getBoundingClientRect().left
      dragging = false
      touch()
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pid) return
      if (!dragging) {
        if (Math.abs(e.clientX - startX) < 4) return
        dragging = true
        root.setPointerCapture(pid)
        root.toggleAttribute('data-drag', true)
        const at = unitsAt(startX)
        offset = Math.abs(at - s) < 70 ? at - s : 0 // 슬라이더를 잡았으면 잡은 자리 유지, 아니면 손가락으로 끌려온다
        k = 900
      }
      target = rubber(unitsAt(e.clientX) - offset)
      kick()
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pid) return
      if (dragging) {
        k = 170
        target = clamp(s + v * 0.14, SMIN, SMAX) // 놓을 때 속도만큼 미끄러짐
      } else if (Math.hypot(e.clientX - startX, e.clientY - startY) < 8) {
        k = 120
        target = clamp(unitsAt(e.clientX), SMIN, SMAX) // 누른 자리로 스르르
      }
      dragging = false
      pid = -1
      root.removeAttribute('data-drag')
      kick()
    }
    const onCancel = (e: PointerEvent) => {
      if (e.pointerId !== pid) return
      if (dragging) {
        k = 170
        target = clamp(target, SMIN, SMAX)
        kick()
      }
      dragging = false
      pid = -1
      root.removeAttribute('data-drag')
    }
    const onKey = (e: KeyboardEvent) => {
      const step = { ArrowRight: 24, ArrowUp: 24, ArrowLeft: -24, ArrowDown: -24, PageUp: 96, PageDown: -96 }[e.key]
      if (step === undefined && e.key !== 'Home' && e.key !== 'End') return
      e.preventDefault()
      touch()
      k = 260
      target = e.key === 'Home' ? SMIN : e.key === 'End' ? SMAX : clamp(target + (step ?? 0), SMIN, SMAX)
      kick()
    }
    // 사용자가 직접 만지면 안내를 거둔다
    const touch = () => {
      touched = true
      root.removeAttribute('data-hint')
    }
    const onKind = (e: Event) => {
      const t = e.target as HTMLInputElement
      if (t.name === 'kind') setKind(t.value as ZipKind)
    }

    const ro = new ResizeObserver(() => {
      u = root.clientWidth / W
      paint()
    })
    ro.observe(root)

    // 섹션에 들어서면 한 번 스르르 열어 보이고, 직접 여닫을 수 있다는 안내를 띄운다
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return
        io.disconnect()
        if (touched) return
        root.toggleAttribute('data-hint', true)
        k = reduce.matches ? 2000 : 34
        target = S_OPEN
        kick()
      },
      { threshold: 0.45 },
    )
    io.observe(root)

    root.addEventListener('pointerdown', onDown)
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerup', onUp)
    root.addEventListener('pointercancel', onCancel)
    handle.addEventListener('keydown', onKey)
    scope?.addEventListener('change', onKind)
    const checked = scope?.querySelector<HTMLInputElement>('input[name="kind"]:checked')
    if (checked) setKind(checked.value as ZipKind)
    paint()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      root.removeEventListener('pointerdown', onDown)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerup', onUp)
      root.removeEventListener('pointercancel', onCancel)
      handle.removeEventListener('keydown', onKey)
      scope?.removeEventListener('change', onKind)
    }
  }, [])

  const half = (h: 'up' | 'dn', dy = 0) => <use href={`#zp-tape-${h}`} y={dy} />

  return (
    <div className="zp" ref={setup} style={{ '--s': S0 } as React.CSSProperties}>
      <svg className="zp__defs" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="zp-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--cfg-s0)' }} />
            <stop offset="0.35" style={{ stopColor: 'var(--cfg-s1)' }} />
            <stop offset="0.75" style={{ stopColor: 'var(--cfg-s2)' }} />
            <stop offset="1" style={{ stopColor: 'var(--cfg-s3)' }} />
          </linearGradient>
          <linearGradient id="zp-shade-up" gradientUnits="userSpaceOnUse" x1="0" y1={CY - 140} x2="0" y2={CY}>
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="zp-shade-dn" gradientUnits="userSpaceOnUse" x1="0" y1={CY} x2="0" y2={CY + 140}>
            <stop offset="0" stopColor="#000" stopOpacity="0.16" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <pattern id="zp-weave" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <path d="M0 1h4" stroke="#fff" strokeOpacity="0.07" strokeWidth="1" />
            <path d="M0 3h4" stroke="#000" strokeOpacity="0.06" strokeWidth="1" />
          </pattern>
          <clipPath id="zp-clip-up" clipPathUnits="userSpaceOnUse">
            <rect x={-60} y={-320} width={W + 120} height={CY + 320} />
          </clipPath>
          <clipPath id="zp-clip-dn" clipPathUnits="userSpaceOnUse">
            <rect x={-60} y={CY} width={W + 120} height={H + 320 - CY} />
          </clipPath>
          <filter id="zp-hsh" filterUnits="userSpaceOnUse" x={-80} y={-340} width={W + 160} height={H + 680}>
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#000" floodOpacity="0.4" />
          </filter>
          <filter id="zp-tsh" filterUnits="userSpaceOnUse" x={-80} y={CY - 60} width={W + 160} height={120}>
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.35" />
          </filter>
          <filter id="zp-ssh" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.6" floodColor="#000" floodOpacity="0.35" />
          </filter>
          <ToothPatterns />
          {(['up', 'dn'] as const).map((h) => (
            <g key={h} id={`zp-tape-${h}`}>
              <Tape kind={kind} half={h} />
            </g>
          ))}
          {(['up', 'dn'] as const).map((h) => (
            <g key={h} id={`zp-teeth-${h}`}>
              <Teeth kind={kind} half={h} />
            </g>
          ))}
        </defs>
      </svg>

      {/* 벌어지는 구간: 위·아래 반쪽을 따로 기울인다 */}
      {(['up', 'dn'] as const).map((h) => (
        <div key={h} className="zp__win zp__win--wedge">
          <div className={`zp__skew zp__skew--${h}`}>
            <div className="zp__in">
              <Layer>
                {half(h)}
                <use href={`#zp-teeth-${h}`} />
              </Layer>
            </div>
          </div>
        </div>
      ))}
      {/* 닫힌 구간: 테이프 둘 다 깐 뒤 이빨을 위에 (서로 맞물린 이빨이 테이프에 가리지 않게) */}
      <div className="zp__win zp__win--closed">
        <div className="zp__in">
          <Layer>
            {half('up')}
            {half('dn')}
            <use href="#zp-teeth-up" />
            <use href="#zp-teeth-dn" />
          </Layer>
        </div>
      </div>
      {/* 열린 구간: 반쪽을 위·아래로 G 만큼 */}
      <div className="zp__win zp__win--open">
        <div className="zp__in">
          <Layer>
            {half('up', -G)}
            {half('dn', G)}
            <use href="#zp-teeth-up" y={-G} />
            <use href="#zp-teeth-dn" y={G} />
          </Layer>
        </div>
      </div>

      <div className="zp__slider" aria-hidden="true">
        <Layer>
          <SliderBody />
        </Layer>
        <div className="zp__pull">
          <Layer>
            <Pull />
          </Layer>
        </div>
        {/* 직접 해 보라는 안내: 슬라이더를 따라다니고, 처음 만지면 사라진다 */}
        <span className="zp__ping" />
        <span className="zp__hint">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M8 7 3 12l5 5M16 7l5 5-5 5M3 12h18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="zp__hint-mouse">클릭하거나 끌어서 직접 열어 보세요</span>
          <span className="zp__hint-touch">손가락으로 끌어서 직접 열어 보세요</span>
        </span>
      </div>
      <div
        className="zp__handle"
        role="slider"
        tabIndex={0}
        aria-label="지퍼 슬라이더 (좌우로 끌거나 화살표 키로 여닫기)"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(((S0 - SMIN) / (SMAX - SMIN)) * 100)}
      />
    </div>
  )
}

export default ZipperPlay
