// 탭 화면 맨 위의 제목 띠: 영문 구분 + 페이지 제목(h1) + 한 줄 설명
const PageHead = ({ en, title, lead }: { en: string; title: string; lead?: React.ReactNode }) => {
  return (
    <header className="phead">
      <div className="wrap phead__inner">
        <p className="eyebrow">{en}</p>
        <h1 className="phead__title">{title}</h1>
        {lead && <p className="phead__lead">{lead}</p>}
      </div>
    </header>
  )
}

export default PageHead
