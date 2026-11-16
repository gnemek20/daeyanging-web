// 문장은 의미 덩어리로 나눠 두고, 줄바꿈은 덩어리 사이에서만 일어나게 한다(.ph).
const QUALITIES = [
  { t: '부드러운 개폐감', d: ['수천 번을 여닫아도 처음 그대로.', '걸림 없이 미끄러지는', '슬라이더의 움직임.'] },
  { t: '강인한 내구성', d: ['반복되는 마찰과 장력에도', '변형되지 않는,', '끝까지 제 역할을 다하는 견고함.'] },
  { t: '정밀한 마감', d: ['균일한 이[齒] 간격과', '치수 관리에서 시작되는', '품질의 일관성.'] },
]

const Craft = () => {
  return (
    <section className="sec" id="craft" aria-labelledby="craft-h">
      <div className="wrap">
        <header className="sec__head">
          <h2 className="h2" id="craft-h">하나의 예술처럼.</h2>
          <p className="body">
            <span className="ph">부드럽고, 강하게.</span> <span className="ph">매일 여닫는 작은 움직임이</span>{' '}
            <span className="ph">오래도록 변함없도록 만듭니다.</span>
          </p>
        </header>
        <ul className="qualities">
          {QUALITIES.map((q) => (
            <li key={q.t}>
              <h3>{q.t}</h3>
              <p>
                {q.d.map((s, i) => (
                  <span key={i}>
                    {i > 0 && ' '}
                    <span className="ph">{s}</span>
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Craft
