'use client'

import { useState } from 'react'

const EMAIL = 'hyunwoo.kim@hyunwoo.ai'

// 서버로 보내는 기능이 없으므로, 적은 내용을 담아 방문자의 메일 앱을 연다.
const Contact = () => {
  const [opened, setOpened] = useState(false)

  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const f = new FormData(ev.currentTarget)
    const name = String(f.get('name') || '')
    const body = [
      `성함 / 회사명: ${name}`,
      `연락처: ${f.get('phone') || ''}`,
      `이메일: ${f.get('email') || ''}`,
      '',
      String(f.get('message') || ''),
    ].join('\n')
    const subject = `[홈페이지 문의] ${name}`
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setOpened(true)
  }

  return (
    <section className="sec sec--indigo" id="contact" aria-labelledby="contact-h">
      <div className="wrap split">
        <div>
          <h2 className="h2" id="contact-h">
            날개를
            <br />
            달아드리겠습니다.
          </h2>
          <p className="body split__note">
            <span className="ph">샘플 요청, 단가 문의, 맞춤 제작 상담 —</span>{' '}
            <span className="ph">어떤 단계든 편하게 연락 주세요.</span>
          </p>
          <dl className="cinfo">
            <div>
              <dt>전화</dt>
              <dd>
                <a href="tel:01037443084">010-3744-3084</a>
              </dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </dd>
            </div>
            <div>
              <dt>주소</dt>
              <dd>서울특별시 종로구 김상옥로 59, 한아빌딩 3층</dd>
            </div>
          </dl>
        </div>

        <form className="form" onSubmit={submit}>
          <div className="form__row">
            <label>
              <span>성함 / 회사명</span>
              <input name="name" type="text" placeholder="홍길동 / (주)○○" autoComplete="name" required />
            </label>
            <label>
              <span>연락처</span>
              <input name="phone" type="tel" placeholder="010-0000-0000" autoComplete="tel" required />
            </label>
          </div>
          <label>
            <span>이메일</span>
            <input name="email" type="email" placeholder="you@company.com" autoComplete="email" />
          </label>
          <label>
            <span>문의 내용</span>
            <textarea name="message" rows={5} placeholder="필요하신 지퍼 종류, 수량, 일정 등을 적어주세요." required />
          </label>
          <button className="btn btn--light" type="submit">
            메일로 문의 보내기
          </button>
          <p className="form__note" role="status">
            {opened ? (
              <>
                <span className="ph">메일 앱이 열렸습니다.</span> <span className="ph">메일 앱에서 보내기를 눌러야</span>{' '}
                <span className="ph">문의가 전달됩니다.</span>
              </>
            ) : (
              <>
                <span className="ph">보내기를 누르면</span> <span className="ph">작성한 내용이 담긴</span>{' '}
                <span className="ph">메일 앱이 열립니다.</span>
              </>
            )}
          </p>
        </form>
      </div>
    </section>
  )
}

export default Contact
