const STATS = [
  { n: '20+', l: '협업 브랜드', c: '#E0662F' },
  { n: '2004', l: '창업 연도', c: '#26367A' },
  { n: '15+', l: '제조 파트너', c: '#0F7A5C' },
]

const Numbers = () => {
  return (
    <section className="sec sec--ink" id="partners" aria-labelledby="numbers-h">
      <div className="wrap">
        <header className="sec__head">
          <h2 className="h2" id="numbers-h">
            2004년부터,
            <br />
            단단하게.
          </h2>
          <div className="sec__headbody">
            <p className="lede">
              <span className="ph">2004년 창업 이래 20년 넘게</span> <span className="ph">패션 브랜드와 함께 성장해 왔습니다.</span>
            </p>
            <p className="body">
              <span className="ph">브랜드 파트너십과는 별개로,</span> <span className="ph">대양ING는 국내외 15개 이상의</span>{' '}
              <span className="ph">하청 전문 생산 공장과</span> <span className="ph">장기 파트너십을 유지합니다.</span>{' '}
              <span className="ph">OEM·ODM 방식의 안정적인 제조 네트워크를 통해</span>{' '}
              <span className="ph">소량 샘플부터 대량 납품까지</span> <span className="ph">품질 일관성을 보장합니다.</span>
            </p>
          </div>
        </header>

        <dl className="stats">
          {STATS.map((s) => (
            <div key={s.l} style={{ '--c': s.c } as React.CSSProperties}>
              <dt>{s.l}</dt>
              <dd>{s.n}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default Numbers
