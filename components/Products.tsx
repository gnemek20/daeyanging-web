import ZipperStrip, { type ToothFinish, type ZipperKind } from './ZipperStrip'

const PRODUCTS: {
  kind: ZipperKind
  name: string
  en: string
  desc: string
  tape: string
  teeth?: string
  finish?: ToothFinish
  bg: string
}[] = [
  { kind: 'metal', name: '메탈 지퍼', en: 'Metal', desc: '데님·아우터에 어울리는 묵직한 금속 질감과 견고함.', tape: '#26367A', finish: 'metal', bg: '#1B2657' },
  { kind: 'vislon', name: '비슬론 지퍼', en: 'Vislon', desc: '가볍고 다채로운 컬러. 캐주얼·스포츠웨어에 최적.', tape: '#E8622A', teeth: '#FF9A55', finish: 'silver', bg: '#B8481A' },
  { kind: 'conceal', name: '콘실 지퍼', en: 'Conceal', desc: '봉제선에 숨어 깔끔하게. 매끈한 실루엣의 완성.', tape: '#E7B3B6', teeth: '#B97C82', finish: 'silver', bg: '#C98D93' },
  { kind: 'nylon', name: '나일론 지퍼', en: 'Nylon', desc: '부드러운 개폐감과 경량성. 가장 폭넓게 쓰이는 표준.', tape: '#0F7A5C', teeth: '#BFEBD8', finish: 'gloss', bg: '#0A5843' },
]

const Products = () => {
  return (
    <section className="sec" id="products" aria-labelledby="products-h">
      <div className="wrap">
        <header className="sec__head">
          <h2 className="h2" id="products-h">
            다양한 지퍼를
            <br />
            자유롭게.
          </h2>
          <p className="body">메탈부터 나일론까지, 옷의 성격에 맞는 지퍼를 고르세요. 모든 제품은 컬러와 규격을 맞춤으로 제작합니다.</p>
        </header>
        <ul className="products">
          {PRODUCTS.map((p) => (
            <li key={p.kind} className="product">
              <div className="product__art" style={{ background: p.bg }}>
                <ZipperStrip
                  id={`p-${p.kind}`}
                  kind={p.kind}
                  tape={p.tape}
                  teeth={p.teeth}
                  finish={p.finish}
                  title={`${p.name} 확대 그림`}
                  bleed
                />
              </div>
              <div className="product__body">
                <h3>
                  {p.name}
                  <span lang="en">{p.en}</span>
                </h3>
                <p>{p.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Products
