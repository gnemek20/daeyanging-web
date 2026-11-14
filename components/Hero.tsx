import HeroRack from './HeroRack'

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__text">
        <p className="hero__kicker">Zipper 전문 회사, 대양ING</p>
        <h1 className="hero__title">
          패션에 새로운
          <br />
          날개를 달다.
        </h1>
        <p className="hero__sub">
          <span className="ph">고품질 지퍼와 의류 부자재를</span> <span className="ph">빠르게, 원하는 방식으로</span>{' '}
          <span className="ph">제작해 드립니다.</span>
        </p>
        <div className="hero__cta">
          <a className="btn btn--ink" href="#contact">
            상담 문의하기
          </a>
          <a className="btn btn--ghost" href="#products">
            제품 보기
          </a>
        </div>
      </div>
      <HeroRack />
    </section>
  )
}

export default Hero
