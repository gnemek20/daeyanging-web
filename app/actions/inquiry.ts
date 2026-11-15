'use server'

import { headers } from 'next/headers'
import { GUIDE_MAX, GUIDE_STEPS, STAGES, composeGuide } from '@/lib/firstGuide'
import { describeSpec, parseSpec } from '@/lib/zipperSpec'

// 상담 문의 폼 → 대양ING 백엔드 API(FastAPI, server/) → hyunwoo.kim@daeyanging.com 으로 메일 발송.
// 항목: 성함 / 회사명*, 이메일*, 문의 내용*, 의류 창업이 처음인지(first), 지퍼 디자이너 사양(spec, 검색 파라미터 문자열)
// - first 가 켜져 있으면 API 가 메일 제목을 [첫 창업 문의]로 바꾸고, 작성 안내 양식(g_stage, g_item…)을 정리해 본문 맨 앞에 붙인다.
// - spec 은 여기서 다시 해석해 정리된 줄로만 본문 끝에 붙인다(보낸 문자열을 그대로 싣지 않음).
// API 는 iwinv 의 전용 내부 네트워크에만 있다. 서버 실행 환경변수(prod.env, 저장소에 없음):
//   INQUIRY_API_URL    예) http://web-daeyanging-api-prod:8000
//   INQUIRY_API_TOKEN  API 의 API_TOKEN 과 같은 값
const API_URL = process.env.INQUIRY_API_URL
const API_TOKEN = process.env.INQUIRY_API_TOKEN

export type InquiryFields = {
  name: string
  email: string
  message: string
  first: boolean
  stage: string
  guide: Record<string, string>
}
export type InquiryState = {
  status: 'idle' | 'sent' | 'invalid' | 'error'
  message: string
  fields?: InquiryFields // 실패했을 때 폼에 다시 채워 넣을 값
}

const LIMITS = { name: 80, email: 200, message: 5000 }
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/

// 아주 단순한 남용 방지: IP 하나당 10분에 5건
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()
const limited = (ip: string) => {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

// 메일 머리글(제목 등)에 들어갈 값은 줄바꿈과 제어 문자를 없앤다
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim()

export async function sendInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  const fields: InquiryFields = {
    name: oneLine(String(form.get('name') ?? '')).slice(0, LIMITS.name),
    email: oneLine(String(form.get('email') ?? '')).slice(0, LIMITS.email),
    message: String(form.get('message') ?? '').trim().slice(0, LIMITS.message),
    first: form.get('first') === 'on',
    stage: STAGES.find((s) => s === form.get('g_stage')) ?? '',
    guide: Object.fromEntries(
      GUIDE_STEPS.map((s) => [s.name, oneLine(String(form.get(s.name) ?? '')).slice(0, GUIDE_MAX)]),
    ),
  }
  const specRaw = String(form.get('spec') ?? '').slice(0, 500)

  // 사람에게는 보이지 않는 칸. 채워져 있으면 자동 입력 봇이므로 보낸 척만 한다.
  if (String(form.get('website') ?? '') !== '') return { status: 'sent', message: '문의가 접수되었습니다.' }

  if (!fields.name) {
    return { status: 'invalid', message: '성함을 적어 주세요.', fields }
  }
  // 처음인 분은 작성 안내 양식의 "무엇을 만드시나요?"만 있어도 된다
  if (fields.first ? !fields.guide.g_item && !fields.message : !fields.message) {
    return {
      status: 'invalid',
      message: fields.first ? '무엇을 만드시는지 적어 주세요.' : '문의 내용을 적어 주세요.',
      fields,
    }
  }
  if (!EMAIL_RE.test(fields.email)) {
    return { status: 'invalid', message: '답장을 받을 이메일 주소를 확인해 주세요.', fields }
  }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  if (limited(ip)) {
    return { status: 'error', message: '짧은 시간에 문의가 많았습니다. 잠시 후 다시 보내 주세요.', fields }
  }

  if (!API_URL || !API_TOKEN) {
    console.error('[inquiry] INQUIRY_API_URL / INQUIRY_API_TOKEN 이 설정되지 않았습니다.')
    return { status: 'error', message: '지금은 문의를 보낼 수 없습니다. 아래 메일 주소로 직접 보내 주세요.', fields }
  }

  let message = fields.first
    ? composeGuide(fields.stage, fields.guide) + (fields.message ? '\n\n' + fields.message : '')
    : fields.message
  if (specRaw) {
    const rows = describeSpec(parseSpec(new URLSearchParams(specRaw)))
    message += '\n\n— 지퍼 디자이너에서 고른 사양 —\n' + rows.map((r) => `${r.k}: ${r.v}`).join('\n')
  }

  try {
    const res = await fetch(`${API_URL}/inquiries`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': API_TOKEN },
      body: JSON.stringify({
        name: fields.name,
        email: fields.email,
        message: message.slice(0, 6000),
        first_time: fields.first,
        client_ip: ip.slice(0, 64),
      }),
      signal: AbortSignal.timeout(25_000),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`API ${res.status}`)
  } catch (err) {
    console.error('[inquiry] 문의 API 호출 실패:', err instanceof Error ? err.message : err)
    return { status: 'error', message: '문의를 보내지 못했습니다. 아래 메일 주소로 직접 보내 주세요.', fields }
  }

  return { status: 'sent', message: '문의가 접수되었습니다. 적어 주신 이메일로 답장 드리겠습니다.' }
}
