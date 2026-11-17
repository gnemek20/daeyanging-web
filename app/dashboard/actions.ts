'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE, SESSION_HOURS, api, dashboardReady, makeSession } from '@/lib/dashboard'

// 대시보드 로그인 단계: 이메일 → (메일로 온) 인증번호 → 쿠키
export type LoginState = { step: 'email' | 'code'; email: string; message: string; error?: boolean }

const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/

// 같은 IP 에서 10분에 인증 시도 10번까지(인증번호 요청·확인 합쳐서)
const hits = new Map<string, number[]>()
const limited = async () => {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 2000) hits.clear()
  return recent.length > 10
}

export async function requestCode(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 200)
  if (!dashboardReady()) return { step: 'email', email, message: '대시보드가 아직 설정되지 않았습니다.', error: true }
  if (!EMAIL_RE.test(email)) return { step: 'email', email, message: '이메일 주소를 확인해 주세요.', error: true }
  if (await limited()) return { step: 'email', email, message: '잠시 후 다시 시도해 주세요.', error: true }
  try {
    await api('/otp/request', { method: 'POST', body: { email } })
  } catch {
    return { step: 'email', email, message: '인증번호 메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.', error: true }
  }
  // 허용된 주소인지는 알려 주지 않는다(누구에게나 같은 안내)
  return { step: 'code', email, message: '등록된 주소라면 인증번호 6자리를 보냈습니다. 10분 안에 입력해 주세요.' }
}

export async function verifyCode(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 200)
  const code = String(form.get('code') ?? '').replace(/\D/g, '')
  if (code.length !== 6) return { step: 'code', email, message: '인증번호 6자리를 입력해 주세요.', error: true }
  if (await limited()) return { step: 'code', email, message: '잠시 후 다시 시도해 주세요.', error: true }
  let ok = false
  try {
    ok = (await api<{ ok: boolean }>('/otp/verify', { method: 'POST', body: { email, code } })).ok
  } catch {
    return { step: 'code', email, message: '확인하지 못했습니다. 잠시 후 다시 시도해 주세요.', error: true }
  }
  if (!ok) return { step: 'code', email, message: '인증번호가 맞지 않거나 만료되었습니다.', error: true }
  ;(await cookies()).set(COOKIE, makeSession(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/dashboard',
    maxAge: SESSION_HOURS * 3600,
  })
  redirect('/dashboard')
}

export async function logout() {
  ;(await cookies()).delete({ name: COOKIE, path: '/dashboard' })
  redirect('/dashboard')
}
