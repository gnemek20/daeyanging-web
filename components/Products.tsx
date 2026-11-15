import Image from 'next/image'
import Link from 'next/link'
import { PHOTO_QUALITY } from '@/lib/photos'
import { PARTS, PRODUCTS, SPECIALS } from '@/lib/products'

// 제품 화면: 지퍼 네 종류(사진 + 설명 + 사양표) → 슬라이더·손잡이 → 테이프 인쇄·방수 → 맞춤 제작으로
const Products = () => {
  return (
    <>
      <section className="sec sec--tight" aria-label="지퍼 종류">
        <div className="wrap">
          <nav className="jump" aria-label="지퍼 종류 바로가기">
            {PRODUCTS.map((p) => (
              <a key={p.id} href={`#${p.id}`}>
                {p.name}
              </a>
            ))}
          </nav>
          <div className="plist">
            {PRODUCTS.map((p, i) => (
              <article key={p.id} id={p.id} className="prow" aria-labelledby={`${p.id}-h`}>
                <div className="prow__img">
                  <Image
                    src={p.photo.src}
                    alt={p.photo.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 640px"
                    quality={PHOTO_QUALITY}
                    placeholder="blur"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                  />
                </div>
                <div className="prow__text">
                  <p className="eyebrow">
                    {String(i + 1).padStart(2, '0')} — {p.en}
                  </p>
                  <h2 className="prow__name" id={`${p.id}-h`}>
                    {p.name}
                  </h2>
                  <dl className="spec spec--table">
                    {p.specs.map((s) => (
                      <div key={s.k}>
                        <dt>{s.k}</dt>
                        <dd>{s.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec--soft" aria-labelledby="parts-h">
        <div className="wrap">
          <div className="split2">
            <div>
              <p className="eyebrow">Slider &amp; Puller</p>
              <h2 className="h2" id="parts-h">
                슬라이더와 손잡이
              </h2>
            </div>
            <p className="body split2__body">
              <span className="ph">슬라이더의 마감과 손잡이의 소재·모양,</span> <span className="ph">로고 각인까지 맞춰 드립니다.</span>
            </p>
          </div>
          <ul className="gallery">
            {PARTS.map((g) => (
              <li key={g.title}>
                <figure>
                  <span className="gallery__img">
                    <Image
                      src={g.src}
                      alt={g.alt}
                      fill
                      sizes="(max-width: 560px) 100vw, (max-width: 1100px) 50vw, 320px"
                      quality={PHOTO_QUALITY}
                      placeholder="blur"
                    />
                  </span>
                  <figcaption>
                    <strong>{g.title}</strong>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec" aria-labelledby="special-h">
        <div className="wrap">
          <div className="split2">
            <div>
              <p className="eyebrow">Special</p>
              <h2 className="h2" id="special-h">
                테이프 인쇄와 방수
              </h2>
            </div>
          </div>
          <ul className="gallery gallery--2">
            {SPECIALS.map((g) => (
              <li key={g.title}>
                <figure>
                  <span className="gallery__img">
                    <Image
                      src={g.src}
                      alt={g.alt}
                      fill
                      sizes="(max-width: 560px) 100vw, 640px"
                      quality={PHOTO_QUALITY}
                      placeholder="blur"
                    />
                  </span>
                  <figcaption>
                    <strong>{g.title}</strong>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="strip" aria-labelledby="products-cta-h">
        <div className="wrap strip__inner">
          <div>
            <h2 className="strip__h" id="products-cta-h">
              모든 제품은 컬러와 규격을 맞춤으로 제작합니다.
            </h2>
            <p className="strip__p">
              <span className="ph">종류부터 손잡이 각인까지</span> <span className="ph">직접 골라 보고 그대로 문의하세요.</span>
            </p>
          </div>
          <Link className="btn btn--light" href="/design">
            맞춤 제작 시작하기
          </Link>
        </div>
      </section>
    </>
  )
}

export default Products
