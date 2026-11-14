import Image from 'next/image'
import { COMPANY_COVER } from '@/lib/photos'

// 회사 소개 문구는 최신 사이트(DaeyangING /company) 그대로. 줄바꿈은 의미 덩어리(.ph) 사이에서만.
const PARAGRAPHS = [
  ['국내 최고의 패션 리더 그룹사들의 파트너로서', '20여 년간 끊임없는 신뢰와 열정으로', '함께 걸어가고 있습니다.'],
  ['최상의 품질, 빠른 생산 납기 시스템으로', '국내 20여 브랜드에 납품하고 있으며,', '희망과 꿈을 이루어가는 고객사들의', '최고의 파트너가 되도록 더욱 노력하겠습니다.'],
  ['패션의 완성을 위한 최고의 선택!', 'Zipper 전문 회사 대양ING와 함께 경험해보세요.'],
]

const Company = () => {
  return (
    <section className="sec" id="company" aria-labelledby="company-h">
      <div className="wrap company">
        <figure className="company__photo">
          <Image src={COMPANY_COVER.src} alt={COMPANY_COVER.alt} placeholder="blur" sizes="(max-width: 860px) 100vw, 50vw" />
        </figure>
        <div className="company__text">
          <h2 className="h2" id="company-h">
            대양 아이엔지란?
          </h2>
          <div className="company__body">
            {PARAGRAPHS.map((p, i) => (
              <p key={i} className="body">
                {p.map((s, j) => (
                  <span key={j}>
                    {j > 0 && ' '}
                    <span className="ph">{s}</span>
                  </span>
                ))}
              </p>
            ))}
          </div>
          <dl className="facts">
            <div>
              <dt>회사명</dt>
              <dd>주식회사 대양아이엔지</dd>
            </div>
            <div>
              <dt>업종</dt>
              <dd>
                도매 및 소매, 제조업
                <br />
                ZIPPER 외 의류 부자재
              </dd>
            </div>
            <div>
              <dt>사업자번호</dt>
              <dd>869-81-02857</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

export default Company
