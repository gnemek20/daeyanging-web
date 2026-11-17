'use client'

import { useState } from 'react'

// 날짜별 방문자 막대 그래프(한 계열이라 범례 없음, 제목이 이름).
// 막대 위에 올리면 그날의 방문자·페이지뷰·문의를 보여 준다. 표는 아래 "날짜별" 표가 대신한다.
type Day = { day: string; views: number; visitors: number; inquiries: number }

const H = 180
const PAD = { top: 12, right: 8, bottom: 26, left: 32 }

const niceMax = (n: number) => {
  if (n <= 4) return 4
  const p = 10 ** Math.floor(Math.log10(n))
  const s = [1, 2, 2.5, 5, 10].find((m) => m * p >= n)!
  return s * p
}

const DailyChart = ({ series }: { series: Day[] }) => {
  const [hover, setHover] = useState<number | null>(null)
  const W = 720
  const max = niceMax(Math.max(...series.map((d) => d.visitors), 0))
  const iw = W - PAD.left - PAD.right
  const ih = H - PAD.top - PAD.bottom
  const step = iw / series.length
  const bw = Math.max(2, Math.min(28, step - 2)) // 막대 사이 2px 이상 간격
  const y = (v: number) => PAD.top + ih - (v / max) * ih
  const ticks = [0, max / 2, max]
  const labelEvery = Math.ceil(series.length / 8)
  const h = hover === null ? null : series[hover]

  return (
    <figure className="dchart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="날짜별 방문자 수" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="dchart__grid" />
            <text x={PAD.left - 6} y={y(t) + 4} textAnchor="end" className="dchart__axis">
              {t}
            </text>
          </g>
        ))}
        {series.map((d, i) => {
          const x = PAD.left + i * step + (step - bw) / 2
          const top = y(d.visitors)
          const hgt = PAD.top + ih - top
          return (
            <g key={d.day}>
              {hgt > 0 && (
                <path
                  className="dchart__bar"
                  data-on={hover === i ? '' : undefined}
                  d={`M${x} ${PAD.top + ih} V${top + Math.min(4, hgt)} Q${x} ${top} ${x + Math.min(4, bw / 2)} ${top} H${x + bw - Math.min(4, bw / 2)} Q${x + bw} ${top} ${x + bw} ${top + Math.min(4, hgt)} V${PAD.top + ih} Z`}
                />
              )}
              {i % labelEvery === 0 && (
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" className="dchart__axis">
                  {d.day.slice(5).replace('-', '.')}
                </text>
              )}
              {/* 막대보다 넓은 보이지 않는 칸으로 올리기 쉽게 */}
              <rect
                x={PAD.left + i * step}
                y={PAD.top}
                width={step}
                height={ih}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                tabIndex={0}
                aria-label={`${d.day} 방문자 ${d.visitors}명, 페이지뷰 ${d.views}, 문의 ${d.inquiries}건`}
              />
            </g>
          )
        })}
      </svg>
      <figcaption className="dchart__tip" data-on={h ? '' : undefined}>
        {h ? (
          <>
            <strong>{h.day}</strong> 방문자 {h.visitors}명 · 페이지뷰 {h.views} · 문의 {h.inquiries}건
          </>
        ) : (
          '막대에 올리면 그날의 수치가 보여요.'
        )}
      </figcaption>
    </figure>
  )
}

export default DailyChart
