const Products = () => {
  return (
    <section className="sec" id="products">
      <div className="wrap">
        <div className="sec-head reveal"><span className="num">05</span><span className="label">Products</span></div>
        <h2 className="big reveal" style={{ marginBottom: '3.2rem' }}>다양한 지퍼를<br /><b className="gold-text">자유롭게.</b></h2>

        <div className="prod-grid">
          {/* ── 01 Feature: 메탈 지퍼 (좌측 전체 높이) ── */}
          <div className="prod prod--feature reveal" data-d="1">
            <div className="ph ph--feature">
              <span className="prod-index serif-en">01</span>
              <span className="mono">메탈 지퍼 — 제품 이미지</span>
            </div>
            <div className="prod__body">
              <h3>메탈 지퍼<span className="en">Metal</span></h3>
              <p>데님·아우터에 어울리는 묵직한 금속 질감과 견고함.</p>
            </div>
          </div>

          {/* ── 02 비슬론 지퍼 (우상단 좌) ── */}
          <div className="prod reveal" data-d="2">
            <div className="ph">
              <span className="prod-index serif-en">02</span>
              <span className="mono">비슬론 지퍼 — 제품 이미지</span>
            </div>
            <div className="prod__body">
              <h3>비슬론 지퍼<span className="en">Vislon</span></h3>
              <p>가볍고 다채로운 컬러. 캐주얼·스포츠웨어에 최적.</p>
            </div>
          </div>

          {/* ── 03 콘실 지퍼 (우상단 우) ── */}
          <div className="prod reveal" data-d="3">
            <div className="ph">
              <span className="prod-index serif-en">03</span>
              <span className="mono">콘실 지퍼 — 제품 이미지</span>
            </div>
            <div className="prod__body">
              <h3>콘실 지퍼<span className="en">Conceal</span></h3>
              <p>봉제선에 숨어 깔끔하게. 매끈한 실루엣의 완성.</p>
            </div>
          </div>

          {/* ── 04 나일론 지퍼 (우하단 와이드) ── */}
          <div className="prod prod--wide reveal" data-d="2">
            <div className="ph ph--wide">
              <span className="prod-index serif-en">04</span>
              <span className="mono">나일론 지퍼 — 제품 이미지</span>
            </div>
            <div className="prod__body">
              <h3>나일론 지퍼<span className="en">Nylon</span></h3>
              <p>부드러운 개폐감과 경량성. 가장 폭넓게 쓰이는 표준.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Products
