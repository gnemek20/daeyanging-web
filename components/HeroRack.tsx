'use client'

// 첫 화면의 "지퍼 컬러 카드".
// 성능: 움직이는 것은 테이프마다 .tp__run 한 겹의 translate 뿐이다(GPU 합성만, 레이아웃·다시 그리기 없음).
//   이빨·슬라이더·벌어진 V 는 한 번 그려 두고 그 레이어째로 옮긴다.
// - 처음 열리는 물결: CSS keyframes(translate)가 맡는다. 서버에서 그린 HTML 그대로 움직인다.
// - 포인터 따라오기: 이벤트 핸들러에서 각 테이프의 --t 만 바꾸고, 부드러운 이동은 CSS transition 이 맡는다.
// 장식용 그림이므로 보조기기에는 숨긴다. 동작 줄이기 설정이면 CSS 가 멈춘 물결 모양으로 보여 준다.

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

const rest = (i: number) => +(100 * (0.34 + 0.2 * Math.sin(i * 0.62 + 0.4) + 0.06 * Math.sin(i * 1.7))).toFixed(2)

const tapesOf = (rack: HTMLElement) => [...rack.querySelectorAll<HTMLElement>('.tp')].filter((el) => el.offsetParent !== null)

const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const rack = e.currentTarget
  const r = rack.getBoundingClientRect()
  const tapes = tapesOf(rack)
  const xi = ((e.clientX - r.left) / r.width) * tapes.length - 0.5
  const py = Math.min(90, Math.max(6, ((e.clientY - r.top) / r.height) * 100))
  tapes.forEach((el, vi) => {
    const w = Math.exp(-((vi - xi) ** 2) / 1.6)
    const base = Number(el.dataset.rest)
    el.style.setProperty('--t', `${(base * (1 - w) + py * w).toFixed(2)}%`)
  })
}

const onLeave = (e: React.PointerEvent<HTMLDivElement>) => {
  tapesOf(e.currentTarget).forEach((el) => el.style.setProperty('--t', `${el.dataset.rest}%`))
}

const HeroRack = () => (
  <div className="rack" aria-hidden="true" onPointerMove={onMove} onPointerLeave={onLeave}>
    {TAPES.map((t, i) => (
      <div
        key={i}
        className={`tp tp--${t.m}`}
        data-rest={rest(i)}
        style={{ '--tape': t.c, '--i': i, '--t': `${rest(i)}%` } as React.CSSProperties}
      >
        <span className="tp__chain" />
        <span className="tp__run">
          <span className="tp__open">
            <span className="tp__half tp__half--l" />
            <span className="tp__half tp__half--r" />
          </span>
          <span className="tp__slider" />
        </span>
      </div>
    ))}
  </div>
)

export default HeroRack
