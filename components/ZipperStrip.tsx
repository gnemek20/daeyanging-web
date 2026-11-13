// 가로로 놓인 지퍼 한 토막을 그린다 — 제품 카드와 맞춤 제작 미리보기에서 쓴다.
// 사진이 없으므로 종류별 생김새(이 모양, 테이프, 슬라이더)를 그림으로 보여 준다.

export type ZipperKind = 'metal' | 'vislon' | 'conceal' | 'nylon'
export type ToothFinish = 'metal' | 'matte' | 'gloss'

type Props = {
  id: string
  kind: ZipperKind
  tape: string
  teeth?: string
  finish?: ToothFinish
  title: string
}

const W = 600
const H = 240
const CY = H / 2

const finishStops: Record<ToothFinish, [string, string, string]> = {
  metal: ['#E7CB86', '#B58A3A', '#7E5B1F'],
  matte: ['#6A6D73', '#4C4F55', '#3A3C41'],
  gloss: ['#8C8F96', '#1E1F23', '#000000'],
}

const ZipperStrip = ({ id, kind, tape, teeth = '#B58A3A', finish = 'metal', title }: Props) => {
  const g = `${id}-teeth`
  const [s0, s1, s2] = finishStops[finish]
  const tapeTop = { y: 34, h: kind === 'conceal' ? CY - 34 - 1 : CY - 34 - 8 }
  const tapeBot = { y: kind === 'conceal' ? CY + 1 : CY + 8, h: kind === 'conceal' ? CY - 34 - 1 : CY - 34 - 8 }
  const sliderX = 410

  const teethEls: React.ReactNode[] = []
  if (kind === 'metal' || kind === 'vislon') {
    const p = kind === 'metal' ? 22 : 26
    const tw = kind === 'metal' ? 13 : 17
    const th = kind === 'metal' ? 30 : 34
    const fill = kind === 'metal' ? `url(#${g})` : teeth
    for (let x = -p; x < sliderX + 10; x += p) {
      teethEls.push(
        <rect key={`a${x}`} x={x} y={CY - th + 10} width={tw} height={th} rx={kind === 'metal' ? 2.5 : 5} fill={fill} />,
        <rect key={`b${x}`} x={x + p / 2} y={CY - 10} width={tw} height={th} rx={kind === 'metal' ? 2.5 : 5} fill={fill} />,
      )
      if (kind === 'vislon') {
        teethEls.push(
          <rect key={`ah${x}`} x={x + 3} y={CY - th + 14} width={tw - 6} height={5} rx={2.5} fill="#fff" opacity={0.28} />,
          <rect key={`bh${x}`} x={x + p / 2 + 3} y={CY - 6} width={tw - 6} height={5} rx={2.5} fill="#fff" opacity={0.28} />,
        )
      }
    }
    // 슬라이더 오른쪽은 열린 상태: 이가 위아래로 벌어져 있다
    for (let x = sliderX + 70; x < W + p; x += p) {
      teethEls.push(
        <rect key={`c${x}`} x={x} y={CY - th - 6} width={tw} height={th - 8} rx={kind === 'metal' ? 2.5 : 5} fill={fill} />,
        <rect key={`d${x}`} x={x + p / 2} y={CY + 14} width={tw} height={th - 8} rx={kind === 'metal' ? 2.5 : 5} fill={fill} />,
      )
    }
  }

  let coil: React.ReactNode = null
  if (kind === 'nylon') {
    const p = 11
    let top = ''
    let bot = ''
    for (let x = -p; x < sliderX + 10; x += p) {
      top += `M${x} ${CY - 14} q ${p * 0.5} 22 ${p * 0.25} 22 `
      bot += `M${x + p / 2} ${CY + 14} q ${p * 0.5} -22 ${p * 0.25} -22 `
    }
    let topOpen = ''
    let botOpen = ''
    for (let x = sliderX + 70; x < W + p; x += p) {
      topOpen += `M${x} ${CY - 30} q ${p * 0.5} 18 ${p * 0.25} 18 `
      botOpen += `M${x + p / 2} ${CY + 30} q ${p * 0.5} -18 ${p * 0.25} -18 `
    }
    coil = (
      <g fill="none" stroke={teeth} strokeWidth={4.2} strokeLinecap="round">
        <path d={top + bot} />
        <path d={topOpen + botOpen} />
      </g>
    )
  }

  const openGap = kind === 'conceal' ? 0 : 16

  return (
    <svg className="zstrip" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s0} />
          <stop offset="0.5" stopColor={s1} />
          <stop offset="1" stopColor={s2} />
        </linearGradient>
        <pattern id={`${id}-weave`} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3h6" stroke="#000" strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
      </defs>

      {/* 테이프: 슬라이더 오른쪽은 살짝 벌어져 있다 */}
      <path
        d={`M0 ${tapeTop.y} H${W} V${tapeTop.y + tapeTop.h - openGap} L${sliderX + 60} ${tapeTop.y + tapeTop.h} H0 Z`}
        fill={tape}
      />
      <path
        d={`M0 ${tapeBot.y} H${sliderX + 60} L${W} ${tapeBot.y + openGap} V${tapeBot.y + tapeBot.h} H0 Z`}
        fill={tape}
      />
      <rect x="0" y={tapeTop.y} width={W} height={tapeTop.h} fill={`url(#${id}-weave)`} />
      <rect x="0" y={tapeBot.y} width={W} height={tapeBot.h} fill={`url(#${id}-weave)`} />
      <g stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="7 6">
        <path d={`M0 ${tapeTop.y + 16} H${W}`} />
        <path d={`M0 ${tapeBot.y + tapeBot.h - 16} H${W}`} />
      </g>

      {kind === 'conceal' && (
        <g>
          <path d={`M0 ${CY - 7} H${sliderX + 60} L${W} ${CY - 7 - openGap - 10}`} stroke="#fff" strokeOpacity="0.4" strokeWidth="2" fill="none" />
          <path d={`M0 ${CY} H${sliderX + 60}`} stroke="#000" strokeOpacity="0.25" strokeWidth="1.2" />
          <path d={`M${sliderX + 60} ${CY - 6} L${W} ${CY - 22} M${sliderX + 60} ${CY + 6} L${W} ${CY + 22}`} stroke={teeth} strokeWidth="3" strokeDasharray="2 3" />
        </g>
      )}

      {teethEls}
      {coil}

      {/* 슬라이더와 손잡이 */}
      <g transform={`translate(${sliderX} ${CY})`}>
        <path d="M-6 -30 H52 Q66 -30 70 -18 L74 0 L70 18 Q66 30 52 30 H-6 Q-14 30 -14 22 V-22 Q-14 -30 -6 -30 Z" fill={`url(#${g})`} />
        <path d="M-4 -20 H48" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
        {kind === 'conceal' ? (
          <g transform="rotate(-70 18 6)">
            <path d="M18 2 C 34 30, 36 70, 18 92 C 0 70, 2 30, 18 2 Z" fill={`url(#${g})`} />
            <circle cx="18" cy="70" r="6" fill={tape} />
          </g>
        ) : (
          <g transform="rotate(-70 18 6)">
            <rect x="4" y="2" width="28" height="98" rx="12" fill={`url(#${g})`} />
            <rect x="12" y="62" width="12" height="26" rx="6" fill={tape} />
          </g>
        )}
      </g>
    </svg>
  )
}

export default ZipperStrip
