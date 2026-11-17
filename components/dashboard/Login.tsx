'use client'

import { useActionState } from 'react'
import { requestCode, verifyCode, type LoginState } from '@/app/dashboard/actions'

// 대시보드 로그인: 1) 이메일 → 2) 메일로 온 인증번호 6자리
const START: LoginState = { step: 'email', email: '', message: '' }

const Login = () => {
  const [sent, ask, asking] = useActionState(requestCode, START)
  const [checked, check, checking] = useActionState(verifyCode, START)
  // 인증번호 단계에서 틀렸을 때는 확인 결과(checked)를, 아니면 요청 결과(sent)를 보여 준다
  const state = checked.step === 'code' && checked.message ? checked : sent

  return (
    <main className="dash dash--login">
      <div className="dash__card">
        <p className="dash__brand">대양ING</p>
        <h1 className="dash__title">대시보드</h1>
        {sent.step === 'email' ? (
          <form action={ask} className="dash__form">
            <label>
              <span>이메일</span>
              <input name="email" type="email" autoComplete="email" required defaultValue={sent.email} autoFocus />
            </label>
            <button className="dash__btn" type="submit" disabled={asking}>
              {asking ? '보내는 중…' : '인증번호 받기'}
            </button>
          </form>
        ) : (
          <form action={check} className="dash__form">
            <input type="hidden" name="email" value={sent.email} />
            <p className="dash__to">{sent.email}</p>
            <label>
              <span>인증번호 6자리</span>
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                autoFocus
                className="dash__code"
              />
            </label>
            <button className="dash__btn" type="submit" disabled={checking}>
              {checking ? '확인 중…' : '확인'}
            </button>
          </form>
        )}
        <p className="dash__msg" data-error={state.error ? '' : undefined} role="status" aria-live="polite">
          {state.message}
        </p>
      </div>
    </main>
  )
}

export default Login
