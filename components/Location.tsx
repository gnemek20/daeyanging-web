import LocationMap from './LocationMap'

const Location = () => {
  return (
    <section className="sec sec--alt loc" id="location">
      <div className="wrap">
        <div className="sec-head reveal"><span className="num">07</span><span className="label">Location · 오시는 길</span></div>

        <div className="loc-grid">
          {/* ── 텍스트 정보 ── */}
          <div className="reveal">
            <h2>대양ING<br />찾아오시는 길</h2>

            <div className="addr">
              서울특별시 종로구 김상옥로 59
              <small>한아빌딩 3층 · HANA BLDG 3F</small>
            </div>

            <div className="subway">
              <div className="s">
                <span className="ln" style={{ background: '#0052A4' }}>1</span>
                <div className="s-info">
                  <span className="nm">종로5가역</span>
                  <span className="s-exit">5·6번 출구</span>
                </div>
                <span className="walk">도보 약 5분</span>
              </div>
              <div className="s">
                <span className="ln" style={{ background: '#00A5DE' }}>4</span>
                <div className="s-info">
                  <span className="nm">동대문역</span>
                  <span className="s-exit">2번 출구</span>
                </div>
                <span className="walk">도보 약 10분</span>
              </div>
            </div>

            <div className="loc-detail">
              <div className="loc-row">
                <span className="loc-k">주차</span>
                <span className="loc-v">건물 내 주차 가능 (방문 전 문의)</span>
              </div>
              <div className="loc-row">
                <span className="loc-k">운영</span>
                <span className="loc-v">평일 09:00 – 18:00</span>
              </div>
            </div>

            <div className="loc-actions">
              <a
                className="btn"
                href="https://map.naver.com/p/search/서울특별시 종로구 김상옥로 59"
                target="_blank"
                rel="noopener noreferrer"
              >
                네이버 지도 →
              </a>
              <a
                className="btn btn--ghost"
                href="https://map.naver.com/p/directions/-/-/-/walk?c=15.00,0,0,0,dh"
                target="_blank"
                rel="noopener noreferrer"
              >
                길찾기
              </a>
            </div>
          </div>

          {/* ── 지도 ── */}
          <div className="map reveal" data-d="1" style={{ background: 'transparent', border: '1px solid rgba(201,164,82,.15)', overflow: 'hidden' }}>
            <LocationMap />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Location
