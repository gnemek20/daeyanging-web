'use client'

import { useState } from 'react'

const Contact = () => {
  const [submitted, setSubmitted] = useState(false)

  const submitForm = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="sec contact" id="contact">
      <div className="wrap">
        <div className="sec-head reveal"><span className="num">06</span><span className="label">Contact</span></div>
        <div className="contact-grid">
          <div className="reveal">
            <h2><b className="gold-text">날개</b>를<br />달아드리겠습니다.</h2>
            <p className="lede lede--sub" style={{ marginTop: '1.4rem' }}>샘플 요청, 단가 문의, 맞춤 제작 상담 — 어떤 단계든 편하게 연락 주세요.</p>
            <div className="cinfo">
              <a href="tel:01037443084"><span className="k">Tel</span><span className="val">010-3744-3084</span></a>
              <a href="mailto:kyounghwa_kim@daeyanging.com"><span className="k">Email</span><span className="val">kyounghwa_kim@daeyanging.com</span></a>
              <div><span className="k">Addr</span><span className="val">서울특별시 종로구 김상옥로 59, 한아빌딩 3층</span></div>
            </div>
          </div>
          <div className="reveal" data-d="1">
            {submitted ? (
              <div className="thanks">
                <div className="serif-en">Thank you.</div>
                <p style={{ color: 'var(--muted)', marginTop: '.7rem' }}>
                  문의가 접수되었습니다.<br />빠른 시일 내에 회신드리겠습니다.
                </p>
              </div>
            ) : (
              <form onSubmit={submitForm}>
                <div className="field row2">
                  <div className="field">
                    <label htmlFor="n">성함 / 회사명</label>
                    <input id="n" type="text" placeholder="홍길동 / (주)○○" required />
                  </div>
                  <div className="field">
                    <label htmlFor="c">연락처</label>
                    <input id="c" type="text" placeholder="010-0000-0000" required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="e">이메일</label>
                  <input id="e" type="email" placeholder="you@company.com" />
                </div>
                <div className="field">
                  <label htmlFor="m">문의 내용</label>
                  <textarea id="m" rows={5} placeholder="필요하신 지퍼 종류, 수량, 일정 등을 적어주세요." required></textarea>
                </div>
                <button className="btn submit" type="submit">문의 보내기</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
