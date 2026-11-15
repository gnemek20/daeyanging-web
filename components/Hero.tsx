import Image from 'next/image'
import Link from 'next/link'
import { PHOTOS, PHOTO_QUALITY } from '@/lib/photos'

// 첫 화면: 왼쪽 글, 오른쪽 실제 제품 사진
const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__text">
        <p className="eyebrow">2004년부터, 지퍼와 의류 부자재</p>
        <h1 className="hero__title">
          패션에 새로운
          <br />
          날개를 달다.
        </h1>
        <p className="hero__sub">
          <span className="ph">고품질 지퍼와 의류 부자재를,</span> <span className="ph">원하는 방식 그대로.</span>
        </p>
        <div className="hero__cta">
          <Link className="btn btn--ink" href="/products">
            제품 보기
          </Link>
          <Link className="btn btn--line" href="/contact">
            상담 문의
          </Link>
        </div>
      </div>
      <div className="hero__media">
        {/* 첫 화면의 가장 큰 그림(LCP): 미리 불러온다 */}
        <Image
          src={PHOTOS.hero.src}
          alt={PHOTOS.hero.alt}
          fill
          preload
          sizes="(max-width: 900px) 100vw, 55vw"
          quality={PHOTO_QUALITY}
          placeholder="blur"
        />
      </div>
    </section>
  )
}

export default Hero
