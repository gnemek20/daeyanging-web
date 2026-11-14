// 최신 사이트의 "최고의 작품을 위해 대양ING가 약속드립니다." + 회사 소개의 숫자(20여 년, 20여 브랜드)
const PROMISES = [
  { t: '빠른 응대', icon: '/icons/promise-1.svg', c: '#E0662F' },
  { t: '완벽한 품질', icon: '/icons/promise-2.svg', c: '#5B8DEF' },
  { t: '신속한 납기', icon: '/icons/promise-3.svg', c: '#E2AE2A' },
]

const STATS = [
  { n: '20여 년', l: '끊임없는 신뢰와 열정으로 함께한 시간' },
  { n: '20여 곳', l: '납품하고 있는 국내 브랜드' },
]

const Promises = () => {
  return (
    <section className="sec sec--ink" id="promise" aria-labelledby="promise-h">
      <div className="wrap">
        <h2 className="h2" id="promise-h">
          <span className="ph">최고의 작품을 위해</span> <span className="ph">대양ING가 약속드립니다.</span>
        </h2>
        <ul className="promises">
          {PROMISES.map((p) => (
            <li key={p.t} style={{ '--c': p.c, '--icon': `url(${p.icon})` } as React.CSSProperties}>
              <span className="promises__icon" aria-hidden="true" />
              <h3>{p.t}</h3>
            </li>
          ))}
        </ul>
        <dl className="stats">
          {STATS.map((s) => (
            <div key={s.n}>
              <dt>{s.l}</dt>
              <dd>{s.n}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default Promises
