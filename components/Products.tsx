import ZipperStrip, { type ZipperKind } from './ZipperStrip'

const PRODUCTS: { kind: ZipperKind; name: string; en: string; desc: string; tape: string; teeth?: string }[] = [
  { kind: 'metal', name: '메탈 지퍼', en: 'Metal', desc: '데님·아우터에 어울리는 묵직한 금속 질감과 견고함.', tape: '#23306B' },
  { kind: 'vislon', name: '비슬론 지퍼', en: 'Vislon', desc: '가볍고 다채로운 컬러. 캐주얼·스포츠웨어에 최적.', tape: '#1E1F23', teeth: '#F0B92E' },
  { kind: 'conceal', name: '콘실 지퍼', en: 'Conceal', desc: '봉제선에 숨어 깔끔하게. 매끈한 실루엣의 완성.', tape: '#B9B3C6', teeth: '#8E879E' },
  { kind: 'nylon', name: '나일론 지퍼', en: 'Nylon', desc: '부드러운 개폐감과 경량성. 가장 폭넓게 쓰이는 표준.', tape: '#3E5A50', teeth: '#C9D6CF' },
]

const Products = () => {
  return (
    <section className="sec" id="products" aria-labelledby="products-h">
      <div className="wrap">
        <div className="split">
          <h2 className="h2" id="products-h">
            다양한 지퍼를
            <br />
            자유롭게.
          </h2>
        </div>
        <ul className="products">
          {PRODUCTS.map((p) => (
            <li key={p.kind} className="product">
              <div className="product__art">
                <ZipperStrip id={`p-${p.kind}`} kind={p.kind} tape={p.tape} teeth={p.teeth} title={`${p.name} 그림`} />
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
