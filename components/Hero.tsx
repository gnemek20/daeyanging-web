import HeroRack from './HeroRack'

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__text">
        <p className="hero__kicker">2004년부터, 지퍼와 의류 부자재</p>
        <h1 className="hero__title">
          패션에 새로운
          <br />
          날개를 달다.
        </h1>
        <p className="hero__sub">
          <span className="ph">고품질 지퍼와 의류 부자재를,</span> <span className="ph">원하는 방식 그대로.</span>
        </p>
        <div className="hero__cta">
          <a className="btn btn--ink" href="#contact">상담 문의하기</a>
          <a className="btn btn--ghost" href="#products">제품 보기</a>
        </div>
      </div>
      <HeroRack />
    </section>
  )
}

export default Hero
