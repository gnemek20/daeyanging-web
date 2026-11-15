'use client'

import Link from 'next/link'
import { startTransition, useActionState, useState } from 'react'
import { sendInquiry, type InquiryState } from '@/app/actions/inquiry'
import { GUIDE_MAX, GUIDE_STEPS, STAGES } from '@/lib/firstGuide'

// 맞춤 제작 화면에서 고른 사양(주소의 검색 파라미터와 사람이 읽는 줄)
export type SpecInfo = { query: string; rows: { k: string; v: string }[] }

// 상담 문의 폼. 서버 액션(sendInquiry)이 hyunwoo.kim@daeyanging.com 으로 메일을 보낸다.
// 자바스크립트가 아직 없어도 일반 폼 전송으로 동작한다(서버 액션의 점진적 향상).
// 실패하면 적은 내용을 그대로 다시 채워 둔다(React 는 액션 뒤에 폼을 초기값으로 되돌리므로 초기값을 상태에서 준다).
//
// "의류 창업이 처음이에요"를 고르면
// - 무엇을 어떻게 적으면 되는지 짚어 주는 단계별 작성 양식이 열린다(각 칸마다 이유·작성 요령·예시, "예시 넣기").
// - 메일 제목이 [첫 창업 문의]로 바뀌고, 양식 내용이 정리되어 본문 맨 앞에 붙는다.
const INITIAL: InquiryState = { status: 'idle', message: '' }

const ContactForm = ({ email, spec, startFirst = false }: { email: string; spec: SpecInfo | null; startFirst?: boolean }) => {
  const [state, action, pending] = useActionState(sendInquiry, INITIAL)
  const f = state.fields
  const [first, setFirst] = useState(f?.first ?? startFirst)
  const [guide, setGuide] = useState<Record<string, string>>(f?.guide ?? {})
  const [stage, setStage] = useState(f?.stage ?? '')
  // 보내기에 성공하면 작성 안내 양식도 비운다(렌더 중 상태 조정 — 이펙트 없이 한 번만)
  const [seen, setSeen] = useState(state)
  const [round, setRound] = useState(0) // 보내기에 성공할 때마다 늘려 폼을 새로 그린다(빈 칸으로)
  if (seen !== state) {
    setSeen(state)
    if (state.status === 'sent') {
      setFirst(false)
      setGuide({})
      setStage('')
      setRound((r) => r + 1)
    }
  }

  // 자바스크립트가 있으면 직접 보낸다 — React 의 자동 폼 초기화를 건너뛰어, 실패해도 체크·선택 상태가 그대로 남는다.
  // (자바스크립트가 없으면 action 으로 일반 전송)
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(() => action(data))
  }
  const done = GUIDE_STEPS.filter((s) => guide[s.name]?.trim()).length + (stage ? 1 : 0)
  const total = GUIDE_STEPS.length + 1

  const setStep = (name: string, v: string) => setGuide((g) => ({ ...g, [name]: v.slice(0, GUIDE_MAX) }))

  return (
    <form key={round} className="form" action={action} onSubmit={onSubmit} data-status={state.status} aria-busy={pending}>
      {/* 봇만 채우는 칸 — 화면과 보조기기 모두에서 숨긴다 */}
      <div className="form__trap" aria-hidden="true">
        <label>
          웹사이트
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {spec && (
        <div className="form__spec">
          <input type="hidden" name="spec" value={spec.query} />
          <p className="form__spec-h">맞춤 제작 화면에서 고른 사양</p>
          <dl className="spec">
            {spec.rows.map((r) => (
              <div key={r.k}>
                <dt>{r.k}</dt>
                <dd>{r.v}</dd>
              </div>
            ))}
          </dl>
          <p className="form__spec-links">
            <Link href={`/design?${spec.query}`}>사양 고치기</Link>
            <Link href="/contact" scroll={false}>
              사양 빼고 문의하기
            </Link>
          </p>
        </div>
      )}
      <div className="form__row">
        <label>
          <span>성함 / 회사명</span>
          <input
            name="name"
            type="text"
            placeholder="홍길동 / (주)○○"
            autoComplete="name"
            maxLength={80}
            required
            defaultValue={f?.name}
          />
        </label>
        <label>
          <span>이메일</span>
          <input
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            maxLength={200}
            required
            defaultValue={f?.email}
          />
        </label>
      </div>

      <label className="check">
        <input
          name="first"
          type="checkbox"
          checked={first}
          onChange={(e) => setFirst(e.currentTarget.checked)}
          aria-controls="first-guide"
          aria-expanded={first}
        />
        <span className="check__box" aria-hidden="true" />
        <span className="check__label">의류 창업이 처음이에요</span>
      </label>

      {first && (
        <fieldset className="fguide" id="first-guide">
          <legend className="sr-only">의류 창업이 처음인 분을 위한 작성 안내</legend>
          <div className="fguide__intro">
            <p className="fguide__h">이 순서대로 적어 주시면 충분해요</p>
            <p>
              <span className="ph">사업자 등록 전이어도, 부자재 용어를 몰라도 괜찮아요.</span>{' '}
              <span className="ph">아래 질문에 아는 만큼만 답해 주시면</span>{' '}
              <span className="ph">필요한 사양은 저희가 정리해 드립니다.</span>
            </p>
            <p className="fguide__progress" aria-live="polite">
              <span className="fguide__bar" style={{ '--p': done / total } as React.CSSProperties} aria-hidden="true" />
              {done}/{total} 작성
            </p>
          </div>

          <ol className="fguide__steps">
            <li className="fguide__step">
              <span className="fguide__n">01</span>
              <div className="fguide__body">
                <p className="fguide__title" id="g-stage-h">
                  지금 어느 단계인가요?
                </p>
                <p className="fguide__why">단계에 맞춰 샘플 수량과 진행 순서를 안내해 드려요.</p>
                <div className="seg" role="radiogroup" aria-labelledby="g-stage-h">
                  {STAGES.map((s) => (
                    <label key={s} className="seg__btn">
                      <input type="radio" name="g_stage" value={s} checked={stage === s} onChange={() => setStage(s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </li>
            {GUIDE_STEPS.map((s, i) => (
              <li key={s.name} className="fguide__step">
                <span className="fguide__n">{String(i + 2).padStart(2, '0')}</span>
                <div className="fguide__body">
                  <label className="fguide__title" htmlFor={s.name}>
                    {s.title}
                    {s.required && <em className="fguide__req">필수</em>}
                  </label>
                  <p className="fguide__why" id={`${s.name}-why`}>
                    {s.why}
                  </p>
                  <input
                    id={s.name}
                    name={s.name}
                    type="text"
                    value={guide[s.name] ?? ''}
                    onChange={(e) => setStep(s.name, e.currentTarget.value)}
                    placeholder={`예) ${s.example}`}
                    maxLength={GUIDE_MAX}
                    required={s.required}
                    autoComplete="off"
                    aria-describedby={`${s.name}-why`}
                  />
                  {!guide[s.name] && (
                    <button type="button" className="fguide__fill" onClick={() => setStep(s.name, s.example)}>
                      예시 넣기
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </fieldset>
      )}

      <label>
        <span>{first ? '그 밖에 궁금한 점 (선택)' : '문의 내용'}</span>
        <textarea
          name="message"
          rows={first ? 3 : 5}
          placeholder={
            first
              ? '예) 단가가 대략 어느 정도인지, 방문 상담이 가능한지 궁금해요.'
              : spec
                ? '수량, 일정, 원단 컬러 등 더 알려 주실 내용을 적어 주세요.'
                : '필요하신 지퍼 종류, 수량, 일정 등을 적어 주세요.'
          }
          maxLength={5000}
          required={!first}
          defaultValue={f?.message}
        />
      </label>
      <button className="btn btn--ink" type="submit" disabled={pending}>
        {pending ? '보내는 중…' : '문의 보내기'}
      </button>
      <p className="form__note" role="status" aria-live="polite">
        {state.status === 'idle' ? (
          <>
            <span className="ph">보내기를 누르면</span> <span className="ph">문의가 바로 전달되고,</span>{' '}
            <span className="ph">적어 주신 이메일로 답장 드립니다.</span>
          </>
        ) : state.status === 'error' ? (
          <>
            {state.message} <a href={`mailto:${email}`}>{email}</a>
          </>
        ) : (
          state.message
        )}
      </p>
    </form>
  )
}

export default ContactForm
