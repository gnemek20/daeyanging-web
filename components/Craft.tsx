import Image from 'next/image'
import { PULLERS } from '@/lib/photos'

// 최신 사이트(DaeyangING /product)의 "하나의 예술처럼." — 지퍼 풀러 사진 세 장
const Craft = () => {
  return (
    <section className="sec" id="craft" aria-labelledby="craft-h">
      <div className="wrap">
        <header className="sec__head">
          <h2 className="h2" id="craft-h">
            하나의 예술처럼.
          </h2>
          <p className="body">
            <span className="ph">지퍼 끝에 다는 풀러까지,</span> <span className="ph">브랜드에 맞춰 만듭니다.</span>
          </p>
        </header>
        <ul className="pullers">
          {PULLERS.map((p) => (
            <li key={p.alt}>
              <Image src={p.src} alt={p.alt} placeholder="blur" sizes="(max-width: 860px) 100vw, 33vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Craft
