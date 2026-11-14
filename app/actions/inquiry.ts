'use server'

import { headers } from 'next/headers'
import { MAIL_TO, mailReady, sendMail } from '@/lib/mailer'

// 상담 문의 폼 → hyunwoo.kim@daeyanging.com 으로 메일 발송(옛 Express 메일 서버를 대신한다).
// 항목: 성함 / 회사명*, 이메일*, 문의 내용*

export type InquiryFields = { name: string; email: string; message: string }
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

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
// 메일 머리글(제목 등)에 들어갈 값은 줄바꿈과 제어 문자를 없앤다
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim()

export async function sendInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  const fields: InquiryFields = {
    name: oneLine(String(form.get('name') ?? '')).slice(0, LIMITS.name),
    email: oneLine(String(form.get('email') ?? '')).slice(0, LIMITS.email),
    message: String(form.get('message') ?? '').trim().slice(0, LIMITS.message),
  }

  // 사람에게는 보이지 않는 칸. 채워져 있으면 자동 입력 봇이므로 보낸 척만 한다.
  if (String(form.get('website') ?? '') !== '') return { status: 'sent', message: '문의가 접수되었습니다.' }

  if (!fields.name || !fields.message) {
    return { status: 'invalid', message: '성함과 문의 내용을 적어 주세요.', fields }
  }
  if (!EMAIL_RE.test(fields.email)) {
    return { status: 'invalid', message: '답장을 받을 이메일 주소를 확인해 주세요.', fields }
  }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  if (limited(ip)) {
    return { status: 'error', message: '짧은 시간에 문의가 많았습니다. 잠시 후 다시 보내 주세요.', fields }
  }

  if (!mailReady()) {
    console.error('[inquiry] SMTP_PASS 가 설정되지 않아 메일을 보내지 못했습니다.')
    return { status: 'error', message: '지금은 문의를 보낼 수 없습니다. 아래 메일 주소로 직접 보내 주세요.', fields }
  }

  const text = [`성함 / 회사명: ${fields.name}`, `이메일: ${fields.email}`, '', fields.message].join('\n')
  const html =
    `<p><b>성함 / 회사명</b>: ${esc(fields.name)}<br><b>이메일</b>: ${esc(fields.email)}</p>` +
    `<hr><p style="white-space:pre-wrap">${esc(fields.message)}</p>`

  try {
    await sendMail({
      to: MAIL_TO,
      replyTo: { name: fields.name, address: fields.email },
      subject: `[홈페이지 문의] ${fields.name}`,
      text,
      html,
    })
  } catch (err) {
    console.error('[inquiry] 메일 발송 실패:', err instanceof Error ? err.message : err)
    return { status: 'error', message: '문의를 보내지 못했습니다. 아래 메일 주소로 직접 보내 주세요.', fields }
  }

  return { status: 'sent', message: '문의가 접수되었습니다. 적어 주신 이메일로 답장 드리겠습니다.' }
}
