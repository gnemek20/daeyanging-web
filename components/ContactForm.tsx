'use client'

import { useActionState } from 'react'
import { sendInquiry, type InquiryState } from '@/app/actions/inquiry'

// 상담 문의 폼. 서버 액션(sendInquiry)이 hyunwoo.kim@daeyanging.com 으로 메일을 보낸다.
// 항목은 최신 사이트(DaeyangING /request)와 같다. 연락처는 전화 대신 답장 받을 이메일로 받는다.
// 자바스크립트가 아직 없어도 일반 폼 전송으로 동작한다(서버 액션의 점진적 향상).
// 실패하면 적은 내용을 그대로 다시 채워 둔다(React 는 액션 뒤에 폼을 초기값으로 되돌리므로 초기값을 상태에서 준다).
const INITIAL: InquiryState = { status: 'idle', message: '' }

const ContactForm = ({ email }: { email: string }) => {
  const [state, action, pending] = useActionState(sendInquiry, INITIAL)
  const f = state.fields

  return (
    <form className="form" action={action} data-status={state.status} aria-busy={pending}>
      {/* 봇만 채우는 칸 — 화면과 보조기기 모두에서 숨긴다 */}
      <div className="form__trap" aria-hidden="true">
        <label>
          웹사이트
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
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
      <fieldset className="form__types">
        <legend>제품 종류</legend>
        {['지퍼', '풀러'].map((t) => (
          <label key={t} className="chip">
            <input type="checkbox" name="types" value={t} defaultChecked={f?.types.includes(t)} />
            {t}
          </label>
        ))}
      </fieldset>
      <label>
        <span>제목</span>
        <input
          name="title"
          type="text"
          placeholder="예: 아우터용 메탈 지퍼 샘플 요청"
          maxLength={150}
          required
          defaultValue={f?.title}
        />
      </label>
      <label>
        <span>요청 사항</span>
        <textarea
          name="message"
          rows={5}
          placeholder="필요하신 지퍼 종류, 수량, 일정 등을 적어주세요."
          maxLength={5000}
          defaultValue={f?.message}
        />
      </label>
      <label className="form__file">
        <span>첨부파일</span>
        <input
          name="files"
          type="file"
          multiple
          accept="image/*,.pdf,.ai,.eps,.psd,.svg,.zip,.hwp,.hwpx,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        />
        <small>사진·도안·문서, 5개까지 합계 10MB</small>
      </label>
      <button className="btn btn--light" type="submit" disabled={pending}>
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
