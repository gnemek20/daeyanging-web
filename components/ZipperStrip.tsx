// 가로로 놓인 지퍼 한 토막(접사 느낌). 제품 타일과 맞춤 제작 미리보기에서 쓴다.
// 테이프 결, 이의 금속 광택, 그림자를 넣어 소재감을 살린다. bleed 이면 테이프가 틀을 가득 채운다.

export type ZipperKind = 'metal' | 'vislon' | 'conceal' | 'nylon'
export type ToothFinish = 'metal' | 'silver' | 'matte' | 'gloss'

type Props = {
  id: string
  kind: ZipperKind
  tape: string
  teeth?: string
  finish?: ToothFinish
  title: string
  bleed?: boolean
  /** 금속 그라데이션 4단계를 직접 지정(CSS 변수 가능). 없으면 finish 프리셋을 쓴다. */
  stops?: [string, string, string, string]
}

const W = 600
const H = 300
const CY = H / 2

const finishStops: Record<ToothFinish, [string, string, string, string]> = {
  metal: ['#F6E2A8', '#D4AE5E', '#A07A2E', '#6E4F18'],
  silver: ['#FFFFFF', '#D9DCE1', '#9DA2AA', '#5F646C'],
  matte: ['#7A7D83', '#5C5F65', '#46494E', '#323438'],
  gloss: ['#B9BCC2', '#3A3C41', '#141518', '#000000'],
}

// 색은 presentation 속성이 아니라 style 로 넣는다 — 그래야 var(--…) 같은 CSS 변수도 받을 수 있다.
const ZipperStrip = ({ id, kind, tape, teeth = '#B58A3A', finish = 'metal', title, bleed = false, stops }: Props) => {
  const g = `${id}-t`
  const sg = `${id}-s`
  const [s0, s1, s2, s3] = stops ?? finishStops[finish]
  const top = bleed ? 0 : 46
  const bot = bleed ? H : H - 46
  const sliderX = bleed ? 350 : 400
  const gapClosed = kind === 'conceal' ? 1 : 9
  const openGap = kind === 'conceal' ? 10 : 22

  const els: React.ReactNode[] = []
  if (kind === 'metal' || kind === 'vislon') {
    const p = kind === 'metal' ? 24 : 28
    const tw = kind === 'metal' ? 14 : 18
    const th = kind === 'metal' ? 32 : 36
    const rx = kind === 'metal' ? 3 : 6
    const fill = kind === 'metal' ? `url(#${g})` : teeth
    const tooth = (key: string, x: number, y: number, h: number) => (
      <g key={key}>
        <rect x={x} y={y} width={tw} height={h} rx={rx} fill={fill} />
        <rect x={x + 2.5} y={y + 3} width={3} height={h - 6} rx={1.5} fill="#fff" opacity={kind === 'metal' ? 0.55 : 0.32} />
      </g>
    )
    for (let x = -p; x < sliderX + 8; x += p) {
      els.push(tooth(`a${x}`, x, CY - th + 10, th), tooth(`b${x}`, x + p / 2, CY - 10, th))
    }
    for (let i = 0, x = sliderX + 72; x < W + p; x += p, i++) {
      const spread = Math.min(1, i / 3)
      els.push(
        tooth(`c${x}`, x, CY - th - 4 - spread * 10, th - 8),
        tooth(`d${x}`, x + p / 2, CY + 12 + spread * 10, th - 8),
      )
    }
  }
  if (kind === 'nylon') {
    const p = 12
    let d = ''
    for (let x = -p; x < sliderX + 8; x += p) {
      d += `M${x} ${CY - 16} C ${x + 10} ${CY - 14}, ${x + 10} ${CY + 4}, ${x + 3} ${CY + 6} `
      d += `M${x + p / 2} ${CY + 16} C ${x + p / 2 + 10} ${CY + 14}, ${x + p / 2 + 10} ${CY - 4}, ${x + p / 2 + 3} ${CY - 6} `
    }
    for (let i = 0, x = sliderX + 72; x < W + p; x += p, i++) {
      const o = 10 + Math.min(1, i / 4) * 10
      d += `M${x} ${CY - 16 - o} C ${x + 10} ${CY - 14 - o}, ${x + 10} ${CY - 2 - o}, ${x + 3} ${CY - o} `
      d += `M${x + p / 2} ${CY + 16 + o} C ${x + p / 2 + 10} ${CY + 14 + o}, ${x + p / 2 + 10} ${CY + 2 + o}, ${x + p / 2 + 3} ${CY + o} `
    }
    els.push(
      <path key="coil" d={d} fill="none" stroke={teeth} strokeWidth={4.6} strokeLinecap="round" />,
      <path key="coil-hi" d={d} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={1.4} strokeLinecap="round" transform="translate(-1 -1)" />,
    )
  }

  const tapeTopPath = `M-10 ${top} H${W + 10} V${CY - gapClosed - openGap} L${sliderX + 64} ${CY - gapClosed} H-10 Z`
  const tapeBotPath = `M-10 ${CY + gapClosed} H${sliderX + 64} L${W + 10} ${CY + gapClosed + openGap} V${bot} H-10 Z`

  return (
    <svg
      className="zstrip"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={bleed ? 'xMidYMid slice' : 'xMidYMid meet'}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: s0 }} />
          <stop offset="0.35" style={{ stopColor: s1 }} />
          <stop offset="0.75" style={{ stopColor: s2 }} />
          <stop offset="1" style={{ stopColor: s3 }} />
        </linearGradient>
        <linearGradient id={sg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.26" />
        </linearGradient>
        <pattern id={`${id}-w`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <path d="M0 1h4" stroke="#fff" strokeOpacity="0.07" strokeWidth="1" />
          <path d="M0 3h4" stroke="#000" strokeOpacity="0.06" strokeWidth="1" />
        </pattern>
        <filter id={`${id}-sh`} x="-10%" y="-30%" width="120%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.4" floodColor="#000" floodOpacity="0.32" />
        </filter>
      </defs>

      {bleed && <rect x="0" y="0" width={W} height={H} fill="#000" opacity="0.55" />}
      <g>
        <path d={tapeTopPath} style={{ fill: tape }} />
        <path d={tapeBotPath} style={{ fill: tape }} />
        <path d={tapeTopPath} fill={`url(#${id}-w)`} />
        <path d={tapeBotPath} fill={`url(#${id}-w)`} />
        <rect x="0" y={top} width={W} height={bot - top} fill={`url(#${sg})`} style={{ mixBlendMode: 'soft-light' }} />
      </g>
      <g stroke="#fff" strokeOpacity="0.35" strokeWidth="1.3" strokeDasharray="6 5" fill="none">
        <path d={`M-10 ${CY - 58} H${W + 10}`} />
        <path d={`M-10 ${CY + 58} H${W + 10}`} />
      </g>

      {kind === 'conceal' && (
        <g fill="none">
          <path d={`M-10 ${CY - 5} H${sliderX + 64} L${W + 10} ${CY - 5 - openGap}`} stroke="#fff" strokeOpacity="0.45" strokeWidth="2.4" />
          <path d={`M-10 ${CY + 5} H${sliderX + 64} L${W + 10} ${CY + 5 + openGap}`} stroke="#000" strokeOpacity="0.18" strokeWidth="2.4" />
          <path d={`M${sliderX + 64} ${CY - 8} L${W + 10} ${CY - 22 - openGap} M${sliderX + 64} ${CY + 8} L${W + 10} ${CY + 22 + openGap}`} stroke={teeth} strokeWidth="3.4" strokeDasharray="2.2 2.6" />
        </g>
      )}

      <g filter={`url(#${id}-sh)`}>{els}</g>

      {/* 슬라이더와 손잡이 */}
      <g transform={`translate(${sliderX} ${CY})`} filter={`url(#${id}-sh)`}>
        <path d="M-8 -34 H54 Q70 -34 74 -20 L80 0 L74 20 Q70 34 54 34 H-8 Q-18 34 -18 24 V-24 Q-18 -34 -8 -34 Z" fill={`url(#${g})`} />
        <path d="M-6 -24 H52" stroke="#fff" strokeOpacity="0.6" strokeWidth="2.4" strokeLinecap="round" />
        <g transform="rotate(-72 22 8)">
          {kind === 'conceal' ? (
            <>
              <path d="M22 4 C 38 32, 40 74, 22 98 C 4 74, 6 32, 22 4 Z" fill={`url(#${g})`} />
              <circle cx="22" cy="74" r="6" style={{ fill: tape }} />
            </>
          ) : (
            <>
              <rect x="6" y="2" width="32" height="104" rx="14" fill={`url(#${g})`} />
              <rect x="10" y="10" width="4" height="86" rx="2" fill="#fff" opacity="0.45" />
              <rect x="15" y="66" width="14" height="28" rx="7" style={{ fill: tape }} />
            </>
          )}
        </g>
      </g>
    </svg>
  )
}

export default ZipperStrip
