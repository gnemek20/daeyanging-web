const Company = () => {
  return (
    <section className="sec" id="company">
      <div className="wrap">
        <div className="sec-head reveal"><span className="num">01</span><span className="label">Company</span></div>
        <div className="company-grid">
          <div>
            <h2 className="big reveal">최고의 작품을 위한<br /><b className="gold-text">첫 걸음.</b></h2>
            <p className="lede reveal" data-d="1" style={{ marginTop: '2rem' }}>패션의 완성을 위해 달리는 당신에게, 대양ING가 날개를 달아드리겠습니다.</p>
            <p className="lede reveal" data-d="2">고품질 지퍼와 의류 부자재를 빠르게, 그리고 원하는 방식 그대로 제작합니다. 옷의 첫인상이자 마지막 손길인 작은 디테일에 완성도를 담습니다.</p>
          </div>
          <div className="meta-list reveal" data-d="2">
            <div className="row"><span className="k">Company</span><span className="v">주식회사 대양아이엔지</span></div>
            <div className="row"><span className="k">Business</span><span className="v">도매·소매 / 제조업<br />ZIPPER 외 의류 부자재</span></div>
            <div className="row"><span className="k">Area</span><span className="v">서울 종로 · 동대문 일대</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Company
