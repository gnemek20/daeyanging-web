const Company = () => {
  return (
    <section className="sec" id="company" aria-labelledby="company-h">
      <div className="wrap">
        <h2 className="statement" id="company-h">
          <span className="ph">최고의 작품을 위한 첫 걸음.</span>{' '}
          <span className="statement__sub">
            <span className="ph">패션의 완성을 위해 달리는 당신에게,</span>{' '}
            <span className="ph">대양ING가 날개를 달아드리겠습니다.</span>
          </span>
        </h2>
        <div className="company">
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
  )
}

export default Company
