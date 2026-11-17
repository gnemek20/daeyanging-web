import { headers } from 'next/headers'
import { internalFetch } from '@/lib/internalApi'

// 방문 기록 받기(components/Analytics 가 보냄) → 백엔드 API /events 로 넘긴다.
// 이 사이트 화면에서 온 요청만 받고, 무엇이든 204 로 바로 답한다(방문자 화면을 기다리게 하지 않음).
const API_URL = process.env.INQUIRY_API_URL
const API_TOKEN = process.env.INQUIRY_API_TOKEN

export async function POST(req: Request) {
  const h = await headers()
  const host = h.get('host') ?? ''
  const origin = h.get('origin')
  if (origin && new URL(origin).host !== host) return new Response(null, { status: 204 })

  let p = ''
  let r = ''
  try {
    const raw = await req.text()
    if (raw.length > 2000) return new Response(null, { status: 204 })
    const data = JSON.parse(raw) as { p?: unknown; r?: unknown }
    p = typeof data.p === 'string' ? data.p.slice(0, 300) : ''
    r = typeof data.r === 'string' ? data.r.slice(0, 200) : ''
  } catch {
    return new Response(null, { status: 204 })
  }
  if (!p.startsWith('/') || p.startsWith('/dashboard') || !API_URL || !API_TOKEN) return new Response(null, { status: 204 })

  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || ''
  try {
    await internalFetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': API_TOKEN },
      body: JSON.stringify({ path: p, ref: r, ip: ip.slice(0, 64), ua: (h.get('user-agent') ?? '').slice(0, 500) }),
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    })
  } catch {
    // 기록 실패는 무시한다
  }
  return new Response(null, { status: 204 })
}
