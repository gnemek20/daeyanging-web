const STRIP = ['#EDE6D6', '#C9A27A', '#E0662F', '#C8202F', '#E9A6B4', '#8C7AC4', '#26367A', '#1F6FD1', '#0F7A5C', '#9AAF4A', '#F2C230', '#4A4038']

const Footer = () => {
  return (
    <footer className="foot">
      <div className="foot__strip" aria-hidden="true">
        {STRIP.map((c) => (
          <span key={c} style={{ background: c }} />
        ))}
      </div>
      <div className="wrap">
        <p className="foot__line">패션에 새로운 날개를 달다.</p>
        <div className="foot__grid">
          <div className="foot__brand">
            <span className="brand__dy">DY</span>
            <span>대양ING</span>
          </div>
          <div className="foot__biz">
            <p>주식회사 대양아이엔지 | 사업자번호 869-81-02857</p>
            <p>도매·소매, 제조업: ZIPPER 외 의류 부자재 | 010-3744-3084</p>
            <p>ⓒ 2026 주식회사 대양아이엔지. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
