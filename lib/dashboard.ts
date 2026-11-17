import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { internalFetch } from './internalApi'

// 대시보드(/dashboard) 서버 쪽 도우미 — 서버 컴포넌트와 서버 액션에서만 쓴다.
// 로그인: 메일 인증번호(백엔드 API 가 허용 주소에만 보냄) → 맞으면 서명한 쿠키(12시간).
// 환경변수(서버 web prod.env, 저장소에 없음): DASHBOARD_SECRET(쿠키 서명), INQUIRY_API_URL / INQUIRY_API_TOKEN

const SECRET = process.env.DASHBOARD_SECRET ?? ''
const API_URL = process.env.INQUIRY_API_URL
const API_TOKEN = process.env.INQUIRY_API_TOKEN
export const COOKIE = 'dy_dash'
export const SESSION_HOURS = 12

export const dashboardReady = () => Boolean(SECRET && API_URL && API_TOKEN)

const sign = (payload: string) => createHmac('sha256', SECRET).update(payload).digest('base64url')

export const makeSession = (email: string) => {
  const exp = Math.floor(Date.now() / 1000) + SESSION_HOURS * 3600
  const payload = `${Buffer.from(email).toString('base64url')}.${exp}`
  return `${payload}.${sign(payload)}`
}

// 쿠키가 있고 서명이 맞고 기한 안이면 로그인한 주소를 돌려준다
export const readSession = async (): Promise<string | null> => {
  // 쿠키를 먼저 읽는다 — 그래야 이 화면이 요청마다 새로 그려진다(빌드 때 미리 굳지 않음)
  const raw = (await cookies()).get(COOKIE)?.value
  if (!SECRET || !raw) return null
  const [mail, exp, sig] = raw.split('.')
  if (!mail || !exp || !sig) return null
  const want = Buffer.from(sign(`${mail}.${exp}`))
  const got = Buffer.from(sig)
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null
  if (Number(exp) < Date.now() / 1000) return null
  return Buffer.from(mail, 'base64url').toString()
}

export const api = async <T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> => {
  const res = await internalFetch(`${API_URL}${path}`, {
    method: init?.method ?? 'GET',
    headers: { 'content-type': 'application/json', 'x-api-key': API_TOKEN ?? '' },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(25_000),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return (await res.json()) as T
}

export type Row = { k: string; views: number; visitors: number }
export type Stats = {
  days: number
  since: string
  collecting_since: number | null
  totals: { views: number; visitors: number; inquiries: number; first_time: number }
  series: { day: string; views: number; visitors: number; inquiries: number }[]
  pages: Row[]
  referrers: Row[]
  devices: Row[]
  browsers: Row[]
  oses: Row[]
  inquiries: { ts: number; name: string; email: string; first_time: number; ip: string; mailed: number }[]
}
