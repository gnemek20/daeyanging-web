import Image from 'next/image'
import Link from 'next/link'
import { PRODUCT_COVER, ZIPPERS } from '@/lib/photos'

// 최신 사이트(DaeyangING /product)의 "다양한 지퍼를 자유롭게," — 대표 사진 한 장과 지퍼 사진 일곱 장
const Products = () => {
  return (
    <section className="sec" id="products" aria-labelledby="products-h">
      <div className="wrap">
        <header className="sec__head">
          <h2 className="h2" id="products-h">
            다양한 지퍼를
            <br />
            자유롭게.
          </h2>
          <p className="lede">
            <span className="ph">DaeyangING,</span> <span className="ph">패션에 날개를 달아주는</span>{' '}
            <span className="ph">하나의 방법.</span>
          </p>
        </header>
        <figure className="pcover">
          <Image src={PRODUCT_COVER.src} alt={PRODUCT_COVER.alt} placeholder="blur" sizes="(max-width: 1360px) 100vw, 1300px" />
        </figure>
        <ul className="gallery">
          {ZIPPERS.map((p) => (
            <li key={p.alt}>
              <Image src={p.src} alt={p.alt} placeholder="blur" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
            </li>
          ))}
        </ul>
        <p className="products__more">
          <Link href="/guide/zipper-types">지퍼 종류별 차이 자세히 보기</Link>
        </p>
      </div>
    </section>
  )
}

export default Products
