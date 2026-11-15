import Image from 'next/image'
import Link from 'next/link'
import ZipperOverview from './ZipperOverview'
import { ORDER_CHECKLIST } from '@/lib/guides'
import { CARE, COLOR_TIPS, FAQ, MEASURE, ORDER_STEPS, PARTS, PICKS, SIZES, TOC, WORDS } from '@/lib/handbook'
import { PHOTOS, PHOTO_QUALITY, type Photo } from '@/lib/photos'
import { PRODUCTS, PARTS as PULLER_PHOTOS } from '@/lib/products'
import { DEFAULT_SPEC, FORMS, LOCKS, METALS, specVars, type Spec } from '@/lib/zipperSpec'

// 가이드 화면: 왼쪽 목차(넓은 화면에서 따라 내려옴) + 오른쪽 본문 열두 꼭지.
// 그림은 맞춤 제작과 같은 지퍼 전체 모양 그림(ZipperOverview)과 실제 제품 사진을 쓴다.

const BASE: Spec = { ...DEFAULT_SPEC, tape: '#26367A', len: 60 }

const Sec = ({ id, n, title, lead, children }: { id: string; n: number; title: string; lead?: React.ReactNode; children: React.ReactNode }) => (
  <section className="hb__sec" id={id} aria-labelledby={`${id}-h`}>
    <p className="eyebrow">{String(n).padStart(2, '0')}</p>
    <h2 className="hb__h" id={`${id}-h`}>
      {title}
    </h2>
    {lead && <p className="hb__lead">{lead}</p>}
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
      <nav className="hb__toc" aria-label="가이드 목차">
        <p className="hb__toc-h">목차</p>
        <ol>
          {TOC.map((t, i) => (
            <li key={t.id}>
              <a href={`#${t.id}`}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {t.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="hb__main">
        <Sec
          id="parts"
          n={n('parts')}
          title="지퍼의 구조"
          lead="부품 이름을 알면 원하는 지퍼를 정확하게 설명할 수 있어요. 주문서나 작업지시서를 쓸 때도 도움이 됩니다."
        >
          <figure className="hb__fig">
            <ZipperOverview spec={{ ...BASE, form: 'open' }} idp="hb-parts" />
            <figcaption>오픈형 지퍼 전체 모양. 왼쪽 끝의 박스와 핀으로 양쪽이 분리됩니다.</figcaption>
          </figure>
          <dl className="spec spec--table hb__parts">
            {PARTS.map((p) => (
              <div key={p.name}>
                <dt>
                  {p.name}
                  <small>{p.other}</small>
                </dt>
                <dd>{p.role}</dd>
              </div>
            ))}
          </dl>
        </Sec>

        <Sec
          id="kinds"
          n={n('kinds')}
          title="지퍼 종류"
          lead="이(엘리먼트)를 무엇으로, 어떻게 만들었는지에 따라 크게 네 가지로 나뉩니다. 옷의 성격과 원단에 맞는 종류를 고르는 것이 첫 단계예요."
        >
          <ul className="hb__cards">
            {PRODUCTS.map((p) => (
              <li key={p.id}>
                <Pic photo={p.photo} sizes="(max-width: 640px) 100vw, 300px" />
                <h3>
                  {p.name}
                  <small lang="en">{p.en}</small>
                </h3>
                <p>{p.desc}</p>
                <p className="hb__meta">
                  <strong>어울리는 곳</strong> {p.specs.find((s) => s.k === '어울리는 곳')?.v}
                </p>
              </li>
            ))}
            <li>
              <Pic photo={PHOTOS.waterproof} sizes="(max-width: 640px) 100vw, 300px" />
              <h3>
                방수 지퍼
                <small lang="en">Water-repellent</small>
              </h3>
              <p>나일론 지퍼의 테이프를 코팅하고 코일을 안쪽에 두어 물이 잘 스며들지 않게 만든 지퍼입니다.</p>
              <p className="hb__meta">
                <strong>어울리는 곳</strong> 아웃도어, 우의, 가방
              </p>
            </li>
          </ul>
        </Sec>

        <Sec
          id="size"
          n={n('size')}
          title="호수(굵기)"
          lead="호수는 이의 크기를 나타내는 숫자예요. 보통 지퍼를 닫았을 때 이 줄의 폭을 대략 밀리미터로 나타낸 값이며, 숫자가 클수록 이가 크고 튼튼합니다."
        >
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
          <p className="hb__note">
            위 내용은 일반적인 기준이에요. 원단 두께, 옷의 무게, 이가 드러나는 정도에 따라 다른 호수를 고르기도 합니다. 정확한 치수는
            종류에 따라 조금씩 다를 수 있습니다.
          </p>
        </Sec>

        <Sec id="form" n={n('form')} title="형태" lead="지퍼 끝이 막혀 있는지, 슬라이더가 몇 개인지에 따라 네 가지로 나뉩니다.">
          <ul className="hb__forms">
            {FORMS.map((f) => (
              <li key={f.key}>
                <ZipperOverview spec={{ ...BASE, form: f.key }} idp={`hb-form-${f.key}`} />
                <h3>{f.label}</h3>
                <p>{f.hint}</p>
              </li>
            ))}
          </ul>
        </Sec>

        <Sec id="slider" n={n('slider')} title="슬라이더와 손잡이" lead="슬라이더는 움직이는 방식을, 손잡이는 모양과 소재를 고릅니다.">
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
                <span>{g.text}</span>
              </li>
            ))}
          </ul>
          <p className="hb__note">손잡이에는 브랜드 이름이나 로고를 각인할 수 있어요. 링·끈 손잡이처럼 평평한 면이 없는 모양은 각인이 어렵습니다.</p>
        </Sec>

        <Sec id="color" n={n('color')} title="컬러와 마감" lead="테이프, 이, 슬라이더의 색을 각각 정해요. 금속 부분은 도금과 마감에 따라 분위기가 크게 달라집니다.">
          <ul className="hb__metals" aria-label="금속 마감 예시">
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
          <figure className="hb__wide">
            <Pic photo={PHOTOS.tapePrint} sizes="(max-width: 900px) 100vw, 860px" />
            <figcaption>테이프에는 브랜드 이름이나 문구, 라인을 넣을 수도 있어요.</figcaption>
          </figure>
        </Sec>

        <Sec
          id="pick"
          n={n('pick')}
          title="옷 종류별 추천"
          lead="처음이라 막막하다면 아래 조합에서 시작해 보세요. 많이 쓰는 일반적인 기준이며, 원단과 디자인에 따라 달라질 수 있어요."
        >
          <div className="hb__table" role="region" aria-label="옷 종류별 추천 지퍼" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th scope="col">만드는 것</th>
                  <th scope="col">종류</th>
                  <th scope="col">호수</th>
                  <th scope="col">형태</th>
                  <th scope="col">슬라이더</th>
                </tr>
              </thead>
              <tbody>
                {PICKS.map((p) => (
                  <tr key={p.item}>
                    <th scope="row">{p.item}</th>
                    <td>{p.kind}</td>
                    <td>{p.size}</td>
                    <td>{p.form}</td>
                    <td>{p.lock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hb__cta-line">
            <Link className="more" href="/design">
              맞춤 제작 화면에서 직접 골라 보기
            </Link>
          </p>
        </Sec>

        <Sec id="measure" n={n('measure')} title="길이 재는 법">
          <figure className="hb__fig">
            <ZipperOverview spec={{ ...BASE, form: 'close', len: 20 }} idp="hb-measure" />
            <figcaption>지퍼 길이는 슬라이더를 끝까지 올린 상태에서, 슬라이더 위쪽부터 아래 끝까지 잽니다.</figcaption>
          </figure>
          <ol className="hb__steps">
            {MEASURE.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ol>
        </Sec>

        <Sec id="care" n={n('care')} title="사용과 관리" lead="조금만 신경 쓰면 지퍼를 훨씬 오래 쓸 수 있어요.">
          <ul className="hb__tips">
            {CARE.map((c) => (
              <li key={c.t}>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </li>
            ))}
          </ul>
        </Sec>

        <Sec id="order" n={n('order')} title="주문 순서" lead="지퍼를 처음 맞추는 분도 이 순서대로 따라오시면 됩니다.">
          <ol className="hb__flow">
            {ORDER_STEPS.map((s, i) => (
              <li key={s.t}>
                <span className="hb__flow-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="hb__check">
            <h3>문의할 때 적어 주시면 좋은 것</h3>
            <dl className="spec spec--table">
              {ORDER_CHECKLIST.map((c) => (
                <div key={c.k}>
                  <dt>{c.k}</dt>
                  <dd>{c.v}</dd>
                </div>
              ))}
            </dl>
            <p className="hb__note">아는 것만 적어 주셔도 괜찮아요. 정해지지 않은 부분은 상담하며 함께 정리해 드립니다.</p>
          </div>
          <div className="hb__ctas">
            <Link className="btn btn--ink" href="/design">
              맞춤 제작으로 사양 고르기
            </Link>
            <Link className="btn btn--line" href="/contact">
              상담 문의하기
            </Link>
            <Link className="btn btn--line" href="/contact?first=1">
              의류 창업이 처음이에요
            </Link>
          </div>
        </Sec>

        <Sec id="words" n={n('words')} title="용어 사전" lead="상담이나 거래처와 이야기할 때 자주 나오는 말을 모았어요.">
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
