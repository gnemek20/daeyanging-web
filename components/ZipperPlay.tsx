'use client'

import { useCallback, useEffect, useRef } from 'react'
import { PULL_PHOTO, STRIP } from '@/lib/zipperParts'
import { bake, drawSlider, drawStrip, readColor, type Baked } from '@/lib/zipperCanvas'
import { sizeScale, type Pull } from '@/lib/zipperSpec'

// 가이드 "직접 골라 보기"의 가까이 보기: 끌어서 여닫는 지퍼(테이프에 글자는 넣지 않는다).
// 그림은 모두 사진(public/zipper, tape.png · slider.png 에서 자른 것)이다. 종류·손잡이는 부모가 넘기고,
// 색은 부모 상자의 CSS 변수(--cfg-tape 테이프, --cfg-s1 메탈 이, --cfg-teeth 수지·코일 이, --cfg-k1 슬라이더)로 물들인다.
//
// 성능 설계
// - 색 입히기·그림자는 종류·손잡이·색이 바뀔 때 한 번만 캔버스로 구워(lib/zipperCanvas) 창마다 놓인 캔버스에 그려 둔다.
//   화면에서 SVG 필터를 돌리지 않으므로 느린 휴대폰에서도 끌 때 다시 그리는 일이 없다.
//   (굽기 전 첫 화면과 자바스크립트가 없을 때는 같은 모양의 SVG 판을 보여 준다.)
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
const S0 = 598 // 첫 화면: 닫힌 상태
const S_OPEN = 300 // 섹션에 들어오면 여기까지 저절로 열린다
const SMIN = 24
const SMAX = 620

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// f: 호수에 따른 배율(5호 = 1). 지퍼 줄은 가운데(W/2, CY)를 축으로 키우고 줄인다
const grow = (f: number) => `translate(${W / 2} ${CY}) scale(${f}) translate(${-W / 2} ${-CY})`

// 지퍼 줄 사진(테이프는 데님 결, 이는 tape.png 에서 하나씩 주인을 가른 것). 세 장 모두 같은 자리·크기다.
//   full: 닫힌 구간(맞물린 그대로 한 장) / up·dn: 열린 구간의 반쪽(테이프 + 자기 이만, 이 사이 틈은 비어 있다)
// 테이프는 테이프 색으로 물들이고, 그 위에 이만 따로 자른 사진(-t)을 이 색으로 물들여 얹는다.
const Strip = ({ kind, part, f }: { kind: ZipKind; part: 'full' | 'up' | 'dn'; f: number }) => {
  const st = STRIP[kind]
  const img = { x: -W, y: CY + st.y, width: st.len, height: st.h, preserveAspectRatio: 'none' as const }
  return (
    <g transform={grow(f)} filter="url(#zp-hsh)">
      <image href={`/zipper/${kind}-${part}.webp`} {...img} filter="url(#zp-tint-tape)" />
      {st.mask && <image href={`/zipper/${kind}-${part}-t.webp`} {...img} filter="url(#zp-tint-teeth)" />}
    </g>
  )
}

// 사진 색 입히기: 사진 밝기(회색)를 평균이 1 이 되게 늘린 뒤 색을 곱한다(명암·결은 사진 그대로)
// soft: 천처럼 밝은 결이 조금 희게 바래 보이게(색을 살짝 뺀다)
const Tint = ({ id, color, slope, shadow, soft }: { id: string; color: string; slope: number; shadow?: boolean; soft?: boolean }) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
    <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="g" />
    <feFlood style={{ floodColor: color }} result="c" />
    <feBlend in="c" in2="g" mode="multiply" result="m" />
    <feComponentTransfer in="m" result="b">
      <feFuncR type="linear" slope={slope} />
      <feFuncG type="linear" slope={slope} />
      <feFuncB type="linear" slope={slope} />
    </feComponentTransfer>
    {soft && <feColorMatrix in="b" type="saturate" values="0.8" result="b" />}
    <feComposite in="b" in2="SourceAlpha" operator="in" result="t" />
    {shadow && <feDropShadow in="t" dx="0" dy="3" stdDeviation="2.6" floodColor="#000" floodOpacity="0.35" />}
  </filter>
)

// 슬라이더(슬라이더 위치 s = 0 기준 좌표). 호수만큼: 몸통 가운데(그림 좌표 11)를 축으로
const slide = (f: number) => `translate(11 ${CY}) scale(${f}) translate(-31 0)`

// 슬라이더 사진은 몸통(위층, 고정)과 손잡이(아래층, 걸이를 축으로 흔들림) 두 장(원본 한 사진을 걸이 높이에서 나눈 것).
// 긴 손잡이는 걸이를 축으로 줄여 두었다. 몸통과 금속 손잡이는 슬라이더 색으로, 끈·가죽·러버는 몸통 쪽 금속 고리만 물들인다.
const SliderPart = ({ f, pull, part }: { f: number; pull: Pull; part: 'body' | 'pull' }) => {
  const ph = PULL_PHOTO[pull]
  const box = ph[part]
  const tint = part === 'body' || ph.metal ? 'url(#zp-tint-k)' : 'url(#zp-ssh)'
  return (
    <g transform={slide(f)}>
      <image
        href={`/zipper/pull-${pull}${part === 'body' ? '-body' : ''}.webp`}
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        preserveAspectRatio="none"
        filter={tint}
      />
    </g>
  )
}

const Layer = ({ children }: { children: React.ReactNode }) => (
  <svg className="zp__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    {children}
  </svg>
)

// 손잡이 흔들림 축(슬라이더 위치 기준 x, 그림 단위)
const pivotX = (f: number, pull: Pull) => 11 + f * (PULL_PHOTO[pull].pivot - 31)
const PULL_MAX = 14 // 손잡이가 기울 수 있는 최대 각도(평면에 놓인 손잡이라 크게 돌지 않는다)

// 구운 그림을 창 캔버스마다 그린다(크기가 바뀌거나 새로 구웠을 때만)
const paintCanvases = (root: HTMLElement, b: Baked, f: number) => {
  const v = { cw: root.clientWidth, ch: root.clientHeight, dpr: Math.min(2, window.devicePixelRatio || 1) }
  if (!v.cw || !v.ch) return
  root.querySelectorAll<HTMLCanvasElement>('canvas[data-cv]').forEach((cv) => {
    const k = cv.dataset.cv
    if (k === 'full') drawStrip(cv, b.full, f, 0, v)
    else if (k === 'up') drawStrip(cv, b.up, f, 0, v)
    else if (k === 'dn') drawStrip(cv, b.dn, f, 0, v)
    else if (k === 'up-open') drawStrip(cv, b.up, f, -G, v)
    else if (k === 'dn-open') drawStrip(cv, b.dn, f, G, v)
    else if (k === 'body') drawSlider(cv, b.body, f, v)
    else if (k === 'pull') drawSlider(cv, b.pull, f, v)
  })
  root.toggleAttribute('data-baked', true)
}

// tint: 색이 바뀌었음을 알리는 값(부모의 테이프·이·슬라이더 색). 색 자체는 부모 상자의 CSS 변수에서 읽는다
const ZipperPlay = ({ kind, size = 5, pull = 'tab', tint = '' }: { kind: ZipKind; size?: number; pull?: Pull; tint?: string }) => {
  const f = sizeScale(size)
  const pvx = pivotX(f, pull)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const bakedRef = useRef<Baked | null>(null)
  const fRef = useRef(f)

  // 종류·손잡이·색이 바뀌면 다시 굽는다
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let alive = true
    const colors = {
      tape: readColor(root, '--cfg-tape'),
      teeth: readColor(root, kind === 'metal' ? '--cfg-s1' : '--cfg-teeth'),
      slider: readColor(root, '--cfg-k1'),
    }
    bake(kind, pull, colors)
      .then((b) => {
        if (!alive) return
        bakedRef.current = b
        paintCanvases(root, b, fRef.current)
      })
      .catch(() => {}) // 굽지 못하면 SVG 판이 그대로 보인다
    return () => {
      alive = false
    }
  }, [kind, pull, tint])

  // 호수가 바뀌면 다시 그리기만
  useEffect(() => {
    fRef.current = f
    if (rootRef.current && bakedRef.current) paintCanvases(rootRef.current, bakedRef.current, f)
  }, [f])

  // 상자 크기가 바뀌면 다시 그리기(한 프레임에 한 번)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let id = 0
    let w = root.clientWidth
    let h = root.clientHeight
    const ro = new ResizeObserver(() => {
      if (root.clientWidth === w && root.clientHeight === h) return
      w = root.clientWidth
      h = root.clientHeight
      cancelAnimationFrame(id)
      id = requestAnimationFrame(() => bakedRef.current && paintCanvases(root, bakedRef.current, fRef.current))
    })
    ro.observe(root)
    return () => {
      cancelAnimationFrame(id)
      ro.disconnect()
    }
  }, [])

  // 한 번만 붙인다(형식이 바뀌어 다시 그려져도 슬라이더 위치·스프링 상태 유지)
  const setup = useCallback((root: HTMLDivElement | null) => {
    rootRef.current = root
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
    let top = 0
    let ptrX = 0 // 끄는 중인 포인터(화면 px)
    let ptrY = 0
    let touched = false
    let aria = -1

    // 끄는 동안 손잡이가 포인터 쪽으로 기운다. 포인터가 축 오른쪽(몸통 위)이어도 위아래 위치만큼 기울게,
    // 가로 거리는 최소 40 단위로 본다.
    const aim = () => {
      if (!dragging) return 0
      const px0 = Number(root.dataset.pvx) || 0 // 손잡이 축(호수·손잡이마다 렌더 때 data-pvx 로 갱신)
      const dx = (ptrX - left) / u - (s + px0)
      const dy = (ptrY - top) / u - root.clientHeight / 2 / u
      return (Math.atan2(-dy, Math.max(-dx, 40)) * 180) / Math.PI
    }
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
        const at = reduce.matches ? 0 : clamp(aim() - v * 0.012, -PULL_MAX, PULL_MAX)
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
      const r = root.getBoundingClientRect()
      left = r.left
      top = r.top
      ptrX = e.clientX
      ptrY = e.clientY
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
      ptrX = e.clientX
      ptrY = e.clientY
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
    }
  }, [])

  const half = (h: 'full' | 'up' | 'dn', dy = 0) => <use href={`#zp-half-${h}`} y={dy} />
  const st = STRIP[kind]
  const teethColor = kind === 'metal' ? 'var(--cfg-s1)' : 'var(--cfg-teeth)'

  return (
    <div className="zp" ref={setup} data-pvx={pvx} style={{ '--s': S0 } as React.CSSProperties}>
      <svg className="zp__defs" aria-hidden="true" focusable="false">
        <defs>
          <filter id="zp-hsh" filterUnits="userSpaceOnUse" x={-80} y={-340} width={W + 160} height={H + 680}>
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#000" floodOpacity="0.35" />
          </filter>
          <filter id="zp-ssh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.6" floodColor="#000" floodOpacity="0.35" />
          </filter>
          <Tint id="zp-tint-tape" color="var(--cfg-tape)" slope={st.tape} />
          <Tint id="zp-tint-teeth" color={teethColor} slope={st.teeth} />
          <Tint id="zp-tint-k" color="var(--cfg-k1)" slope={1.25} shadow />
          {(['full', 'up', 'dn'] as const).map((h) => (
            <g key={h} id={`zp-half-${h}`}>
              <Strip kind={kind} part={h} f={f} />
            </g>
          ))}
        </defs>
      </svg>

      {/* 벌어지는 구간: 위·아래 반쪽을 따로 기울인다 */}
      {(['up', 'dn'] as const).map((h) => (
        <div key={h} className="zp__win zp__win--wedge">
          <div className={`zp__skew zp__skew--${h}`}>
            <div className="zp__in">
              <Layer>{half(h)}</Layer>
              <canvas className="zp__cv" data-cv={h} />
            </div>
          </div>
        </div>
      ))}
      {/* 닫힌 구간: 두 반쪽이 맞물린 그대로 */}
      <div className="zp__win zp__win--closed">
        <div className="zp__in">
          <Layer>{half('full')}</Layer>
          <canvas className="zp__cv" data-cv="full" />
        </div>
      </div>
      {/* 열린 구간: 반쪽을 위·아래로 G 만큼 */}
      <div className="zp__win zp__win--open">
        <div className="zp__in">
          <Layer>
            {half('up', -G)}
            {half('dn', G)}
          </Layer>
          <canvas className="zp__cv" data-cv="up-open" />
          <canvas className="zp__cv" data-cv="dn-open" />
        </div>
      </div>

      <div className="zp__slider" aria-hidden="true">
        {/* 손잡이(아래층)는 걸이 고리를 축으로 흔들리고, 몸통(위층)이 이음매를 덮는다 */}
        <div className="zp__pull" style={{ transformOrigin: `calc(${pvx} * var(--u)) 50%` }}>
          <Layer>
            <SliderPart f={f} pull={pull} part="pull" />
          </Layer>
          <canvas className="zp__cv zp__cv--s" data-cv="pull" />
        </div>
        <Layer>
          <SliderPart f={f} pull={pull} part="body" />
        </Layer>
        <canvas className="zp__cv zp__cv--s" data-cv="body" />
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
