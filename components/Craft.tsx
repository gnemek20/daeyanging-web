const QUALITIES = [
  { t: '부드러운 개폐감', d: '수천 번을 여닫아도 처음 그대로. 걸림 없이 미끄러지는 슬라이더의 움직임.' },
  { t: '강인한 내구성', d: '반복되는 마찰과 장력에도 변형되지 않는, 끝까지 제 역할을 다하는 견고함.' },
  { t: '정밀한 마감', d: '균일한 이[齒] 간격과 치수 관리에서 시작되는 품질의 일관성.' },
]

const Craft = () => {
  return (
    <section className="sec" id="craft" aria-labelledby="craft-h">
      <div className="wrap">
        <div className="split">
          <h2 className="h2" id="craft-h">하나의 예술처럼.</h2>
          <p className="lede split__body">부드럽고, 강하게. 매일 여닫는 작은 움직임이 오래도록 변함없도록 만듭니다.</p>
        </div>
        <ul className="qualities">
          {QUALITIES.map((q) => (
            <li key={q.t}>
              <h3>{q.t}</h3>
              <p>{q.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Craft
