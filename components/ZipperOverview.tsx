import { sizeScale, type Spec } from '@/lib/zipperSpec'

// 지퍼 전체 모양: 멈춤쇠, 슬라이더, 손잡이, 길이를 한눈에.
// 색은 미리보기와 같은 CSS 변수(--cfg-*)를 읽는다. 왼쪽이 아래 끝, 오른쪽이 위 끝.

const W = 640
const CY = 66
const X0 = 70 // 아래 끝(이가 시작하는 곳)
const X1 = 584 // 위 끝
const TAPE = 25 // 테이프 반폭

type SliderProps = {
  x: number
  th: number
  dir: 1 | -1
  pull: Spec['pull']
  idp: string
}

// 슬라이더: 넓은 어깨가 위(dir=1이면 오른쪽)를 향한다. 손잡이는 테이프 위로 아래쪽에 늘어진다.
const Slider = ({ x, th, dir, pull, idp }: SliderProps) => {
  const h = th / 2 + 6
  return (
    <g transform={`translate(${x} ${CY}) scale(${dir} 1)`}>
      <path
        d={`M-16 ${-h + 3} Q-16 ${-h} -12 ${-h} H10 Q16 ${-h} 18 ${-h + 4} L22 0 L18 ${h - 4} Q16 ${h} 10 ${h} H-12 Q-16 ${h} -16 ${h - 3} Z`}
        fill={`url(#${idp}-slider)`}
        stroke="#000"
        strokeOpacity={0.25}
      />
      <path d={`M-12 ${-h + 3} H10`} stroke="#fff" strokeOpacity={0.6} strokeWidth={1.4} strokeLinecap="round" />
      <g transform={`scale(${dir} 1)`}>
        {pull === 'tab' && <rect x={-5} y={2} width={10} height={36} rx={5} fill={`url(#${idp}-slider)`} stroke="#000" strokeOpacity={0.25} />}
        {pull === 'plate' && <rect x={-8} y={4} width={16} height={38} rx={3} fill={`url(#${idp}-slider)`} stroke="#000" strokeOpacity={0.25} />}
        {pull === 'ring' && (
          <>
            <rect x={-3} y={2} width={6} height={10} rx={3} fill={`url(#${idp}-slider)`} />
            <circle cx={0} cy={24} r={12} fill="none" stroke={`url(#${idp}-slider)`} strokeWidth={4} />
          </>
        )}
        {pull === 'leather' && <path d="M-6 6 H6 V40 L0 46 L-6 40 Z" fill="#6B4227" stroke="#000" strokeOpacity={0.25} />}
        {pull === 'rubber' && <rect x={-6} y={4} width={12} height={40} rx={5} fill="#3A3C40" stroke="#000" strokeOpacity={0.25} />}
        {pull === 'cord' && (
          <>
            <path d="M-3 2 C -6 20, -6 40, -2 50 Q 0 54 2 50 C 6 40, 6 20, 3 2" fill="none" strokeWidth={3} className="zo__cord" />
            <rect x={-5} y={26} width={10} height={12} rx={4} fill={`url(#${idp}-slider)`} />
          </>
        )}
      </g>
    </g>
  )
}

// idp: 한 페이지에 여러 장 그릴 때 그림 안 id 가 겹치지 않게 붙이는 앞머리
// dims: 'len' 이면 아래에 길이 치수선, 'none' 이면 지퍼만(위아래 여백을 잘라 낸다)
type Dims = 'len' | 'none'
const VIEW: Record<Dims, string> = { len: `0 0 ${W} 168`, none: `0 26 ${W} 104` }

const ZipperOverview = ({ spec, idp = 'zo', dims = 'len' }: { spec: Spec; idp?: string; dims?: Dims }) => {
  const f = sizeScale(spec.size)
  const th = 9 * f // 이 줄 폭
  const conceal = spec.kind === 'conceal' || spec.water
  const pw = 4.4 * f // 이 간격
  const teethFill = spec.kind === 'metal' ? `url(#${idp}-metal)` : undefined

  return (
    <svg className="zo" viewBox={VIEW[dims]} role="img" aria-label={dims === 'len' ? `지퍼 전체 모양: ${spec.len}cm` : '지퍼 전체 모양'}>
      <defs>
        <linearGradient id={`${idp}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--cfg-s0)' }} />
          <stop offset="0.4" style={{ stopColor: 'var(--cfg-s1)' }} />
          <stop offset="1" style={{ stopColor: 'var(--cfg-s3)' }} />
        </linearGradient>
        <linearGradient id={`${idp}-slider`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--cfg-k0)' }} />
          <stop offset="0.4" style={{ stopColor: 'var(--cfg-k1)' }} />
          <stop offset="1" style={{ stopColor: 'var(--cfg-k3)' }} />
        </linearGradient>
        <linearGradient id={`${idp}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${idp}-teeth`} patternUnits="userSpaceOnUse" width={pw} height={168}>
          <rect x={0.3} y={CY - th / 2} width={pw * 0.56} height={th * 0.6} rx={0.8} fill={teethFill} className={teethFill ? undefined : 'zo__tooth'} />
          <rect
            x={pw / 2 + 0.3}
            y={CY - th * 0.1}
            width={pw * 0.56}
            height={th * 0.6}
            rx={0.8}
            fill={teethFill}
            className={teethFill ? undefined : 'zo__tooth'}
          />
        </pattern>
      </defs>

      {/* 지퍼 그림(이름표 모드에서는 아래 확대 창이 이 그림을 다시 쓴다) */}
      <g id={`${idp}-art`}>
        {/* 테이프 */}
        <rect x={X0 - 30} y={CY - TAPE} width={X1 - X0 + 58} height={TAPE * 2} rx={2} className="zo__tape" />
        <rect x={X0 - 30} y={CY - TAPE} width={X1 - X0 + 58} height={TAPE * 2} rx={2} fill={`url(#${idp}-shade)`} />

        {/* 이(콘실은 겉으로 이가 보이지 않고 봉제선만) */}
        {conceal ? (
          <path d={`M${X0} ${CY} H${X1}`} stroke="#000" strokeOpacity={0.35} strokeWidth={1.4} />
        ) : (
          <rect x={X0} y={CY - th / 2} width={X1 - X0} height={th} fill={`url(#${idp}-teeth)`} />
        )}

        {spec.water && <rect x={X0 - 30} y={CY - TAPE} width={X1 - X0 + 58} height={TAPE} fill="#fff" opacity={0.12} />}
        {/* 위 멈춤쇠 */}
        <rect x={X1} y={CY - th / 2 - 2} width={5} height={th / 2 + 1} rx={1} fill={`url(#${idp}-metal)`} />
        <rect x={X1} y={CY + 1} width={5} height={th / 2 + 1} rx={1} fill={`url(#${idp}-metal)`} />

        {/* 아래 멈춤쇠 */}
        <rect x={X0 - 7} y={CY - th / 2 - 3} width={8} height={th + 6} rx={2} fill={`url(#${idp}-metal)`} />

        <Slider x={X1 - 44} th={th} dir={1} pull={spec.pull} idp={idp} />
      </g>

      {/* 길이 */}
      {dims === 'len' && (
        <g className="zo__dim">
          <path d={`M${X0} 132 H${X1 + 5} M${X0} 126 V138 M${X1 + 5} 126 V138`} />
          <text x={(X0 + X1) / 2} y={156} textAnchor="middle" className="zo__len">
            {spec.len}cm
          </text>
          <text x={X0} y={156} textAnchor="start">
            아래
          </text>
          <text x={X1 + 5} y={156} textAnchor="end">
            위
          </text>
        </g>
      )}
    </svg>
  )
}

export default ZipperOverview
