import Image from 'next/image'
import Link from 'next/link'
import { PHOTOS, PHOTO_QUALITY } from '@/lib/photos'
import { PRODUCTS } from '@/lib/products'

// 첫 화면 아래: 제품 네 가지 → 맞춤 제작 → 상담 문의로 이어지는 짧은 안내

export const HomeProducts = () => (
  <section className="sec" aria-labelledby="home-products-h">
    <div className="wrap">
      <div className="sec__top">
        <div>
          <p className="eyebrow">Products</p>
          <h2 className="h2" id="home-products-h">
            다양한 지퍼를 자유롭게.
          </h2>
        </div>
        <Link className="more" href="/products">
          제품 전체 보기
        </Link>
      </div>
      <ul className="tiles">
        {PRODUCTS.map((p) => (
          <li key={p.id}>
            <Link className="tile" href={`/products#${p.id}`}>
              <span className="tile__img">
                <Image
                  src={p.photo.src}
                  alt={p.photo.alt}
                  fill
                  sizes="(max-width: 900px) 50vw, 25vw"
                  quality={PHOTO_QUALITY}
                  placeholder="blur"
                />
              </span>
              <span className="tile__en">{p.en}</span>
              <span className="tile__name">{p.name}</span>
              <span className="tile__sum">{p.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
)

export const HomeCustom = () => (
  <section className="feature" aria-labelledby="home-custom-h">
    <div className="feature__media">
      <Image
        src={PHOTOS.tapePrint.src}
        alt={PHOTOS.tapePrint.alt}
        fill
        sizes="(max-width: 900px) 100vw, 50vw"
        quality={PHOTO_QUALITY}
        placeholder="blur"
      />
    </div>
    <div className="feature__text">
      <p className="eyebrow">Custom</p>
      <h2 className="h2" id="home-custom-h">
        생각하는 모양
        <br />
        그대로.
      </h2>
      <p className="body">
        <span className="ph">정해진 규격에 맞추지 않습니다.</span>{' '}
        <span className="ph">사이즈, 컬러, 마감까지,</span> <span className="ph">1:1 맞춤 제작으로</span>{' '}
        <span className="ph">원하는 지퍼를 자유롭게 구현합니다.</span>
      </p>
      <Link className="btn btn--ink" href="/design">
        맞춤 제작 시작하기
      </Link>
    </div>
  </section>
)

export const HomeContact = () => (
  <section className="strip" aria-labelledby="home-contact-h">
    <div className="wrap strip__inner">
      <div>
        <h2 className="strip__h" id="home-contact-h">
          샘플 요청, 단가 문의, 맞춤 제작 상담
        </h2>
        <p className="strip__p">
          <span className="ph">어떤 단계든 편하게 연락 주세요.</span>
        </p>
      </div>
      <Link className="btn btn--light" href="/contact">
        상담 문의하기
      </Link>
    </div>
  </section>
)
