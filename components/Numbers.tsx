const Numbers = () => {
  return (
    <section className="sec sec--alt" id="partners">
      <div className="wrap">
        <div className="sec-head reveal"><span className="num">04</span><span className="label">By the Numbers</span></div>
        <h2 className="big reveal">2004년부터,<br /><b className="gold-text">단단하게.</b></h2>
        <p className="lede lede--sub reveal" data-d="1" style={{ marginTop: '1.5rem' }}>
          2004년 창업 이래 20년 넘게 패션 브랜드와 함께 성장해 왔습니다.<br />
          브랜드 파트너십과 독립적으로, 15개 이상의 하청 생산 공장과 안정적인 제조 네트워크를 구축하고 있습니다.
        </p>

        <div className="stats reveal" data-d="1">
          <div className="stat">
            <div className="n">15+</div>
            <div className="l">하청 생산 파트너<span className="en">Production Partners</span></div>
          </div>
          <div className="stat">
            <div className="n">2004</div>
            <div className="l">창업 연도<span className="en">Founded</span></div>
          </div>
          <div className="stat">
            <div className="n">00+</div>
            <div className="l">협업 브랜드<span className="en">Partner Brands</span></div>
          </div>
          <div className="stat">
            <div className="n">00+</div>
            <div className="l">부자재 품목<span className="en">Product Items</span></div>
          </div>
        </div>

        <div className="mfr-band reveal" data-d="2">
          <div className="mfr-band__label">Manufacturing Network</div>
          <div className="mfr-band__body">
            <p>
              브랜드 파트너십과는 별개로, 대양ING는 국내외 <strong>15개 이상의 하청 전문 생산 공장</strong>과
              장기 파트너십을 유지합니다. OEM·ODM 방식의 안정적인 제조 네트워크를 통해
              소량 샘플부터 대량 납품까지 품질 일관성을 보장합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Numbers
