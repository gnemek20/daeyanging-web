import Image from 'next/image'
import Link from 'next/link'
import HandbookToc from './HandbookToc'
import ZipperLab from './ZipperLab'
import ZipperOverview from './ZipperOverview'
import { ORDER_CHECKLIST } from '@/lib/guides'
import { CARE, COLOR_TIPS, FAQ, MEASURE, ORDER_STEPS, PARTS, PICKS, SIZES, TOC, WORDS } from '@/lib/handbook'
import { PHOTOS, PHOTO_QUALITY, type Photo } from '@/lib/photos'
import { PRODUCTS, PARTS as PULLER_PHOTOS } from '@/lib/products'
import { DEFAULT_SPEC, LOCKS, METALS, specVars, type Spec } from '@/lib/zipperSpec'

// 가이드 화면: 왼쪽 목차(지금 보는 꼭지를 진하게) + 오른쪽 본문.
// 맨 위 "직접 골라 보기"에서 설정을 바꿔 가며 그림으로 확인하고, 아래 꼭지들은 표·목록·그림·사진으로 자세히 본다.

const BASE: Spec = { ...DEFAULT_SPEC, tape: '#26367A', len: 60 }

const Sec = ({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) => (
  <section className="hb__sec" id={id} aria-labelledby={`${id}-h`}>
    <p className="eyebrow">{String(n).padStart(2, '0')}</p>
    <h2 className="hb__h" id={`${id}-h`}>
      {title}
    </h2>
    <div className="hb__body">{children}</div>
  </section>
)

const Pic = ({ photo, sizes }: { photo: Photo; sizes: string }) => (
  <span className="hb__pic">
    <Image src={photo.src} alt={photo.alt} fill sizes={sizes} quality={PHOTO_QUALITY} placeholder="blur" />
  </span>
)

const Handbook = () => {
  const n = (id: string) => TOC.findIndex((t) => t.id === id) + 1
  return (
    <div className="wrap hb" style={specVars(BASE) as React.CSSProperties}>
      <HandbookToc items={TOC} />

      <div className="hb__main">
        <Sec id="lab" n={n('lab')} title="직접 골라 보기">
          <ZipperLab />
        </Sec>

        <Sec id="parts" n={n('parts')} title="지퍼의 구조">
          <div className="hb__fig">
            <ZipperOverview spec={BASE} idp="hb-parts" />
          </div>
          <dl className="spec spec--table">
            {PARTS.map((p) => (
              <div key={p.name}>
                <dt>{p.name}</dt>
                <dd>{p.role}</dd>
              </div>
            ))}
          </dl>
        </Sec>

        <Sec id="kinds" n={n('kinds')} title="지퍼 종류">
          <ul className="hb__cards">
            {PRODUCTS.map((p) => (
              <li key={p.id}>
                <Pic photo={p.photo} sizes="(max-width: 640px) 100vw, 300px" />
                <h3>{p.name}</h3>
                <p>{p.specs.find((s) => s.k === '어울리는 곳')?.v}</p>
              </li>
            ))}
            <li>
              <Pic photo={PHOTOS.waterproof} sizes="(max-width: 640px) 100vw, 300px" />
              <h3>방수 지퍼</h3>
              <p>아웃도어, 우의, 가방</p>
            </li>
          </ul>
        </Sec>

        <Sec id="size" n={n('size')} title="호수(굵기)">
          <ul className="hb__sizes">
            {SIZES.map((s) => (
              <li key={s.n}>
                <span className="hb__bar" style={{ '--w': s.n } as React.CSSProperties} aria-hidden="true" />
                <strong>{s.n}호</strong>
                <span className="hb__feel">{s.feel}</span>
                <span className="hb__use">{s.use}</span>
              </li>
            ))}
          </ul>
        </Sec>

        <Sec id="slider" n={n('slider')} title="슬라이더와 손잡이">
          <dl className="spec spec--table">
            {LOCKS.map((l) => (
              <div key={l.key}>
                <dt>{l.label}</dt>
                <dd>{l.hint}</dd>
              </div>
            ))}
          </dl>
          <ul className="hb__gallery">
            {PULLER_PHOTOS.map((g) => (
              <li key={g.title}>
                <Pic photo={g} sizes="(max-width: 640px) 50vw, 220px" />
                <strong>{g.title}</strong>
              </li>
            ))}
          </ul>
        </Sec>

        <Sec id="color" n={n('color')} title="컬러와 마감">
          <ul className="hb__metals" aria-label="금속 마감">
            {METALS.map((m) => (
              <li key={m.key}>
                <span
                  className="hb__metal"
                  style={{ background: `linear-gradient(160deg, ${m.stops[0]}, ${m.stops[1]} 45%, ${m.stops[2]} 80%, ${m.stops[3]})` }}
                  aria-hidden="true"
                />
                {m.name}
              </li>
            ))}
          </ul>
          <ul className="hb__tips">
            {COLOR_TIPS.map((c) => (
              <li key={c.t}>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </li>
            ))}
          </ul>
          <div className="hb__wide">
            <Pic photo={PHOTOS.tapePrint} sizes="(max-width: 900px) 100vw, 860px" />
          </div>
        </Sec>

        <Sec id="pick" n={n('pick')} title="옷 종류별 추천">
          <div className="hb__table" role="region" aria-label="옷 종류별 추천 지퍼" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th scope="col">만드는 것</th>
                  <th scope="col">종류</th>
                  <th scope="col">호수</th>
                  <th scope="col">슬라이더</th>
                </tr>
              </thead>
              <tbody>
                {PICKS.map((p) => (
                  <tr key={p.item}>
                    <th scope="row">{p.item}</th>
                    <td>{p.kind}</td>
                    <td>{p.size}</td>
                    <td>{p.lock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <a className="more" href="#lab">
              위에서 직접 골라 보기
            </a>
          </p>
        </Sec>

        <Sec id="measure" n={n('measure')} title="길이 재는 법">
          <div className="hb__fig">
            <ZipperOverview spec={{ ...BASE, len: 20 }} idp="hb-measure" />
          </div>
          <ol className="hb__steps">
            {MEASURE.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ol>
        </Sec>

        <Sec id="care" n={n('care')} title="사용과 관리">
          <ul className="hb__tips">
            {CARE.map((c) => (
              <li key={c.t}>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </li>
            ))}
          </ul>
        </Sec>

        <Sec id="order" n={n('order')} title="주문 순서">
          <ol className="hb__flow">
            {ORDER_STEPS.map((s, i) => (
              <li key={s.t}>
                <span className="hb__flow-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
          <dl className="spec spec--table">
            {ORDER_CHECKLIST.map((c) => (
              <div key={c.k}>
                <dt>{c.k}</dt>
                <dd>{c.v}</dd>
              </div>
            ))}
          </dl>
          <div className="hb__ctas">
            <Link className="btn btn--ink" href="/contact">
              상담 문의
            </Link>
          </div>
        </Sec>

        <Sec id="words" n={n('words')} title="용어 사전">
          <dl className="hb__words">
            {WORDS.map((w) => (
              <div key={w.w}>
                <dt>{w.w}</dt>
                <dd>{w.d}</dd>
              </div>
            ))}
          </dl>
        </Sec>

        <Sec id="faq" n={n('faq')} title="자주 묻는 질문">
          <div className="hb__faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </Sec>
      </div>
    </div>
  )
}

export default Handbook
