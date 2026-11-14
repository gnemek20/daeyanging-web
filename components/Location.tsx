import NaverMap from './NaverMap'

const Location = () => {
  return (
    <section className="sec" id="location" aria-labelledby="location-h">
      <div className="wrap loc">
        <div className="loc__info">
          <h2 className="h2" id="location-h">
            대양ING
            <br />
            찾아오시는 길
          </h2>

          <address className="loc__addr">
            서울특별시 종로구 김상옥로 59
            <span>한아빌딩 3층 (HANA BLDG 3F)</span>
          </address>

          <ul className="subway">
            <li>
              <span className="subway__ln" style={{ background: '#0052A4' }} aria-label="1호선">1</span>
              <span className="subway__nm">
                종로5가역<small>5·6번 출구</small>
              </span>
              <span className="subway__walk">도보 약 5분</span>
            </li>
            <li>
              <span className="subway__ln" style={{ background: '#00A5DE' }} aria-label="4호선">4</span>
              <span className="subway__nm">
                동대문역<small>2번 출구</small>
              </span>
              <span className="subway__walk">도보 약 10분</span>
            </li>
          </ul>

          <dl className="facts facts--compact">
            <div>
              <dt>주차</dt>
              <dd>건물 내 주차 가능 (방문 전 문의)</dd>
            </div>
            <div>
              <dt>운영</dt>
              <dd>평일 09:00 – 18:00</dd>
            </div>
          </dl>

          <div className="loc__actions">
            <a
              className="btn btn--solid"
              href="https://map.naver.com/p/search/서울특별시 종로구 김상옥로 59"
              target="_blank"
              rel="noopener noreferrer"
            >
              네이버 지도에서 보기
            </a>
            <a
              className="btn btn--line"
              href="https://map.naver.com/p/directions/-/-/-/walk?c=15.00,0,0,0,dh"
              target="_blank"
              rel="noopener noreferrer"
            >
              길찾기
            </a>
          </div>
        </div>

        <div className="loc__map">
          <NaverMap />
        </div>
      </div>
    </section>
  )
}

export default Location
