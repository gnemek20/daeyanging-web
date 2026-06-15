const Custom = () => {
  return (
    <section className="sec sec--alt" id="custom">
      <div className="wrap">
        <div className="sec-head reveal"><span className="num">02</span><span className="label">Custom</span></div>
        <div className="custom-grid">
          <div>
            <h2 className="big reveal">생각하는 모양<br /><b className="gold-text">그대로.</b></h2>
            <p className="lede lede--sub reveal" data-d="1" style={{ marginTop: '1.8rem' }}>정해진 규격에 맞추지 않습니다. 사이즈, 컬러, 마감까지 — 1:1 맞춤 제작으로 원하는 지퍼를 자유롭게 구현합니다.</p>
          </div>
          <div className="spec reveal" data-d="2" aria-hidden="true">
            <div className="srow"><span className="slab">길이 · Length</span><span className="sval">맞춤 재단</span></div>
            <div className="srow"><span className="slab">컬러 · Color</span><span className="dots"><i className="on"></i><i className="on"></i><i className="on"></i><i></i><i></i></span></div>
            <div className="srow"><span className="slab">마감 · Finish</span><span className="sval">메탈 / 무광 / 유광</span></div>
            <div className="srow"><span className="slab">슬라이더 · Slider</span><span className="sval">형태 선택</span></div>
            <div className="srow"><span className="slab">수량 · MOQ</span><span className="sval">샘플 ~ 양산</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Custom
