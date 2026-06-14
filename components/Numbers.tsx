const Numbers = () => {
  return (
    <section className="sec sec--alt" id="partners">
      <div className="wrap">
        <div className="sec-head reveal"><span className="num">04</span><span className="label">By the Numbers</span></div>
        <h2 className="big reveal" style={{ maxWidth: 'none' }}>작지만, <b className="gold-text">단단하게.</b></h2>
        <p className="lede lede--sub reveal" data-d="1" style={{ marginTop: '1.5rem' }}>다양한 패션 브랜드와 오랜 시간 함께하며 쌓아온 신뢰를, 숫자로 보여드립니다.</p>
        <div className="stats reveal" data-d="1">
          <div className="stat"><div className="n">00+</div><div className="l">협업 브랜드<span className="en">Partner Brands</span></div></div>
          <div className="stat"><div className="n">00+</div><div className="l">년의 업력<span className="en">Years</span></div></div>
          <div className="stat"><div className="n">00+</div><div className="l">맞춤 제작 사례<span className="en">Custom Projects</span></div></div>
          <div className="stat"><div className="n">00+</div><div className="l">부자재 품목<span className="en">Product Items</span></div></div>
        </div>
      </div>
    </section>
  )
}

export default Numbers
