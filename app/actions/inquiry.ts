'use server'

import { headers } from 'next/headers'
import { internalFetch } from '@/lib/internalApi'
import {
  ANSWER_MAX,
  ANSWER_NAMES,
  FILES_MAX,
  FILES_MAX_TOTAL,
  composeAnswers,
  findMissing,
  fileAllowed,
  formatBytes,
  isChoice,
  validChoice,
  type Mode,
} from '@/lib/inquiryForm'

// 상담 문의 폼 → 대양ING 백엔드 API(FastAPI, server/) → hyunwoo.kim@daeyanging.com 으로 메일(첨부 포함),
// 보낸 분께는 같은 계정으로 접수 확인 메일.
// 항목: 성함 / 회사명*, 이메일*, 작성 방식(mode: form | free), 사양(q_*), 문의 내용, 첨부(files)
// - 양식으로 작성: 성함·이메일·종류·슬라이더·호수가 있어야 한다. 사양을 정리해 본문 맨 앞에 붙인다.
// - 자유롭게 작성: 성함·이메일·문의 내용이 있어야 한다.
// API 는 iwinv 의 전용 내부 네트워크에만 있다. 서버 실행 환경변수(prod.env, 저장소에 없음):
//   INQUIRY_API_URL    예) http://web-daeyanging-api-prod:8000
//   INQUIRY_API_TOKEN  API 의 API_TOKEN 과 같은 값
const API_URL = process.env.INQUIRY_API_URL
const API_TOKEN = process.env.INQUIRY_API_TOKEN

export type InquiryFields = {
  name: string
  email: string
  message: string
  mode: Mode
  answers: Record<string, string>
}
export type InquiryState = {
  status: 'idle' | 'sent' | 'invalid' | 'error'
  message: string
  fields?: InquiryFields // 실패했을 때 폼에 다시 채워 넣을 값
  missing?: string // 비어 있던 필수 항목(폼이 그 칸을 강조하고 초점을 옮긴다)
}

const LIMITS = { name: 80, email: 200, message: 5000 }

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
  const mode: Mode = form.get('mode') === 'free' ? 'free' : 'form'
  const answers: Record<string, string> = {}
  if (mode === 'form') {
    for (const n of ANSWER_NAMES) {
      const v = oneLine(String(form.get(n) ?? '')).slice(0, ANSWER_MAX)
      if (!v) continue
      if (isChoice(n) && !validChoice(n, v)) continue
      answers[n] = v
    }
  }
  const fields: InquiryFields = {
    name: oneLine(String(form.get('name') ?? '')).slice(0, LIMITS.name),
    email: oneLine(String(form.get('email') ?? '')).slice(0, LIMITS.email),
    message: String(form.get('message') ?? '').trim().slice(0, LIMITS.message),
    mode,
    answers,
  }
  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)

  // 사람에게는 보이지 않는 칸. 채워져 있으면 자동 입력 봇이므로 보낸 척만 한다.
  if (String(form.get('website') ?? '') !== '') return { status: 'sent', message: '문의가 접수되었습니다.' }

  const top: Record<string, string> = { name: fields.name, email: fields.email, message: fields.message }
  const miss = findMissing((n) => top[n] ?? answers[n] ?? '', mode)
  if (miss) return { status: 'invalid', message: miss.message, fields, missing: miss.name }
  if (files.length > FILES_MAX) {
    return { status: 'invalid', message: `첨부는 최대 ${FILES_MAX}개입니다.`, fields }
  }
  if (files.reduce((n, f) => n + f.size, 0) > FILES_MAX_TOTAL) {
    return { status: 'invalid', message: `첨부는 합계 ${formatBytes(FILES_MAX_TOTAL)}까지입니다.`, fields }
  }
  const bad = files.find((f) => !fileAllowed(f))
  if (bad) {
    return { status: 'invalid', message: `${bad.name}: 이미지, PDF 파일만 첨부 가능합니다.`, fields }
  }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  if (limited(ip)) {
    return { status: 'error', message: '요청이 많습니다. 잠시 후 다시 시도해 주세요.', fields }
  }

  if (!API_URL || !API_TOKEN) {
    console.error('[inquiry] INQUIRY_API_URL / INQUIRY_API_TOKEN 이 설정되지 않았습니다.')
    return { status: 'error', message: '일시적으로 접수할 수 없습니다. 아래 메일로 문의해 주세요.', fields }
  }

  const message =
    mode === 'form'
      ? composeAnswers(answers) + (fields.message ? '\n\n— 추가 요청사항 —\n' + fields.message : '')
      : fields.message

  const body = new FormData()
  body.set('name', fields.name)
  body.set('email', fields.email)
  body.set('message', message.slice(0, 6000))
  body.set('mode', mode)
  body.set('client_ip', ip.slice(0, 64))
  for (const f of files) body.append('files', f, f.name.slice(-120) || 'file')

  try {
    const res = await internalFetch(`${API_URL}/inquiries/v2`, {
      method: 'POST',
      headers: { 'x-api-key': API_TOKEN },
      body,
      signal: AbortSignal.timeout(60_000),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`API ${res.status}`)
  } catch (err) {
    console.error('[inquiry] 문의 API 호출 실패:', err instanceof Error ? err.message : err)
    return { status: 'error', message: '접수에 실패했습니다. 아래 메일로 문의해 주세요.', fields }
  }

  return {
    status: 'sent',
    message: '문의가 접수되었습니다. 확인 메일을 발송했으며, 검토 후 회신드리겠습니다.',
  }
}
