import Link from 'next/link'
import NaverMap from './NaverMap'
import { SITE } from '@/lib/site'

// 회사소개(첫 화면) 맨 아래: 상담 문의로 넘어가는 섹션 + 위치 지도.
// 랜딩 첫 부분이 아니어도 페이지 끝에서 바로 문의로 이어지게 눈에 띄는 남색 띠로 둔다.
const VisitCta = () => {
  return (
    <section className="sec sec--indigo visit" id="visit" aria-labelledby="visit-h">
      <div className="wrap visit__grid">
        <div className="visit__text">
          <p className="eyebrow visit__eyebrow">Contact</p>
          <h2 className="h2" id="visit-h">
            필요한 지퍼,
            <br />
            지금 상담하세요.
          </h2>
          <p className="body visit__body">
            상상하시는 그대로,
            <br />
            맞춤 지퍼를 만들어 드립니다.
          </p>

          {/* 지도 옆이라 눈이 지도로 가기 쉬워서, 문의 양식으로 가는 버튼은 왼쪽 칸 폭 전체의 큰 카드로 둔다 */}
          <Link className="visit__go" href="/contact">
            <span className="visit__go-text">
              <strong>상담 문의하기</strong>
              <span>종류·호수·컬러만 골라 보내면 메일로 회신드립니다</span>
            </span>
            <span className="visit__go-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
          <p className="visit__mail">
            또는 <a href={`mailto:${SITE.email}`}>{SITE.email}</a> 로 바로 메일
          </p>

          <address className="visit__addr">
            <strong>서울특별시 종로구 김상옥로 59, 한아빌딩 3층</strong>
            <span>평일 09:00 – 18:00 · 건물 내 주차 가능</span>
          </address>
          <ul className="visit__subway">
            <li>
              <span className="subway__ln" style={{ background: '#0052A4' }} aria-label="1호선">
                1
              </span>
              종로5가역 5·6번 출구 · 도보 5분
            </li>
            <li>
              <span className="subway__ln" style={{ background: '#00A5DE' }} aria-label="4호선">
                4
              </span>
              동대문역 2번 출구 · 도보 10분
            </li>
          </ul>
        </div>

        <div className="loc__map visit__map">
          <NaverMap />
        </div>
      </div>
    </section>
  )
}

export default VisitCta
