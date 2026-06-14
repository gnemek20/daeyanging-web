const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__eyebrow label">Impressive · 인상적인</div>
      <div className="hero__mark" aria-label="DY 대양ING">
        <span className="hero__letter">D</span>
        <span className="hero__seam" aria-hidden="true"></span>
        <span className="hero__letter">Y</span>
      </div>
      <div className="hero__kr">대양ING</div>
      <h1 className="hero__title">패션에 새로운 <b className="gold-text">날개</b>를 달다.</h1>
      <p className="hero__sub">고품질 지퍼와 의류 부자재를, 원하는 방식 그대로.</p>
      <div className="scroll-cue">Scroll<div className="bar"></div></div>
    </section>
  )
}

export default Hero
