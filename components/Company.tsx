import Image from 'next/image'
import { PHOTOS, PHOTO_QUALITY } from '@/lib/photos'

// 회사소개 화면: 소개 → 사진 → 연혁·파트너 숫자 → 품질 원칙. 문장은 의미 덩어리(.ph)로 나눠 둔다.

const STATS = [
  { n: '20+', l: '협업 브랜드' },
  { n: '2004', l: '창업 연도' },
  { n: '15+', l: '제조 파트너' },
]

const QUALITIES = [
  { t: '부드러운 개폐감', d: ['수천 번을 여닫아도 처음 그대로.', '걸림 없이 미끄러지는', '슬라이더의 움직임.'] },
  { t: '강인한 내구성', d: ['반복되는 마찰과 장력에도', '변형되지 않는,', '끝까지 제 역할을 다하는 견고함.'] },
  { t: '정밀한 마감', d: ['균일한 이[齒] 간격과', '치수 관리에서 시작되는', '품질의 일관성.'] },
]

const Company = () => {
  return (
    <>
      <section className="sec" aria-labelledby="company-h">
        <div className="wrap about">
          <h2 className="statement" id="company-h">
            <span className="ph">최고의 작품을 위한 첫걸음.</span>{' '}
            <span className="statement__sub">
              <span className="ph">패션의 완성을 위해 달리는 당신에게,</span>{' '}
              <span className="ph">대양ING가 날개를 달아드리겠습니다.</span>
            </span>
          </h2>
          <div className="about__body">
            <p className="body">
              <span className="ph">고품질 지퍼와 의류 부자재를 빠르게,</span>{' '}
              <span className="ph">그리고 원하는 방식 그대로 제작합니다.</span>{' '}
              <span className="ph">옷의 첫인상이자 마지막 손길인</span>{' '}
              <span className="ph">작은 디테일에 완성도를 담습니다.</span>
            </p>
            <dl className="facts">
              <div>
                <dt>회사명</dt>
                <dd>주식회사 대양아이엔지</dd>
              </div>
              <div>
                <dt>업종</dt>
                <dd>
                  도매·소매 / 제조업
                  <br />
                  ZIPPER 외 의류 부자재
                </dd>
              </div>
              <div>
                <dt>지역</dt>
                <dd>서울 종로, 동대문 일대</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="band-img">
        <Image
          src={PHOTOS.metalTapes.src}
          alt={PHOTOS.metalTapes.alt}
          fill
          sizes="100vw"
          quality={PHOTO_QUALITY}
          placeholder="blur"
        />
      </div>

      <section className="sec" aria-labelledby="partners-h">
        <div className="wrap">
          <div className="split2">
            <div>
              <p className="eyebrow">Partners</p>
              <h2 className="h2" id="partners-h">
                2004년부터,
                <br />
                단단하게.
              </h2>
            </div>
            <div className="split2__body">
              <p className="lede">
                <span className="ph">2004년 창업 이래 20년 넘게</span> <span className="ph">패션 브랜드와 함께 성장해 왔습니다.</span>
              </p>
              <p className="body">
                <span className="ph">브랜드 파트너십과는 별개로,</span> <span className="ph">대양ING는 국내외 15개 이상의</span>{' '}
                <span className="ph">하청 전문 생산 공장과</span> <span className="ph">장기 파트너십을 유지합니다.</span>{' '}
                <span className="ph">OEM·ODM 방식의 안정적인 제조 네트워크를 통해</span>{' '}
                <span className="ph">소량 샘플부터 대량 납품까지</span> <span className="ph">품질 일관성을 보장합니다.</span>
              </p>
            </div>
          </div>
          <dl className="stats">
            {STATS.map((s) => (
              <div key={s.l}>
                <dt>{s.l}</dt>
                <dd>{s.n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="sec sec--soft" aria-labelledby="quality-h">
        <div className="wrap">
          <div className="split2">
            <div>
              <p className="eyebrow">Quality</p>
              <h2 className="h2" id="quality-h">
                하나의 예술처럼.
              </h2>
            </div>
            <p className="body split2__body">
              <span className="ph">부드럽고, 강하게.</span> <span className="ph">매일 여닫는 작은 움직임이</span>{' '}
              <span className="ph">오래도록 변함없도록 만듭니다.</span>
            </p>
          </div>
          <ol className="qualities">
            {QUALITIES.map((q, i) => (
              <li key={q.t}>
                <span className="qualities__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{q.t}</h3>
                <p>
                  {q.d.map((s, j) => (
                    <span key={j}>
                      {j > 0 && ' '}
                      <span className="ph">{s}</span>
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}

export default Company
