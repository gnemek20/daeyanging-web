import Image from 'next/image'
import { SAMPLES } from '@/lib/photos'

// 첫 화면 바로 아래: 최신 사이트 첫 문장 + 실제 제품 사진 네 장
const Intro = () => {
  return (
    <section className="sec sec--tight" aria-labelledby="intro-h">
      <div className="wrap">
        <h2 className="statement" id="intro-h">
          <span className="ph">패션의 완성을 위해</span> <span className="ph">달리는 당신에게</span>{' '}
          <span className="ph statement__sub">날개를 달아드리겠습니다.</span>
        </h2>
        <ul className="samples">
          {SAMPLES.map((p) => (
            <li key={p.alt}>
              <Image src={p.src} alt={p.alt} placeholder="blur" sizes="(max-width: 640px) 50vw, 25vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Intro
