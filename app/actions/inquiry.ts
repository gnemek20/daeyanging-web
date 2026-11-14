'use server'

import { headers } from 'next/headers'
import { MAIL_TO, mailReady, sendMail } from '@/lib/mailer'

// 상담 문의 폼 → hyunwoo.kim@daeyanging.com 으로 메일 발송.
// 옛 daeyangINGBack(Express, /postOrder)을 대신한다. 항목은 최신 사이트(DaeyangING /request)와 같다:
//   성함*, 연락받을 이메일*, 제품 종류(지퍼·풀러), 제목*, 요청 사항, 첨부파일.
// 첨부파일은 실제 파일 내용만 받는다(옛 서버처럼 "경로"를 받아 서버가 읽어 오는 일은 없다).

export type InquiryFields = { name: string; email: string; types: string[]; title: string; message: string }
export type InquiryState = {
  status: 'idle' | 'sent' | 'invalid' | 'error'
  message: string
  fields?: InquiryFields // 실패했을 때 폼에 다시 채워 넣을 값
}

const LIMITS = { name: 80, email: 200, title: 150, message: 5000 }
const TYPES = ['지퍼', '풀러']
const FILES = { count: 5, total: 10 * 1024 * 1024 }
// 참고 사진·도안·문서만 받는다
const FILE_EXT = /\.(jpe?g|png|webp|gif|heic|heif|pdf|ai|eps|psd|svg|zip|hwp|hwpx|docx?|xlsx?|pptx?)$/i
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
// 메일 머리글(제목 등)·파일 이름에 들어갈 값은 줄바꿈과 제어 문자를 없앤다
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim()

export async function sendInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  const fields: InquiryFields = {
    name: oneLine(String(form.get('name') ?? '')).slice(0, LIMITS.name),
    email: oneLine(String(form.get('email') ?? '')).slice(0, LIMITS.email),
    types: form.getAll('types').map(String).filter((t) => TYPES.includes(t)),
    title: oneLine(String(form.get('title') ?? '')).slice(0, LIMITS.title),
    message: String(form.get('message') ?? '').trim().slice(0, LIMITS.message),
  }

  // 사람에게는 보이지 않는 칸. 채워져 있으면 자동 입력 봇이므로 보낸 척만 한다.
  if (String(form.get('website') ?? '') !== '') return { status: 'sent', message: '문의가 접수되었습니다.' }

  if (!fields.name || !fields.title) {
    return { status: 'invalid', message: '성함과 제목을 적어 주세요.', fields }
  }
  if (!EMAIL_RE.test(fields.email)) {
    return { status: 'invalid', message: '답장을 받을 이메일 주소를 확인해 주세요.', fields }
  }

  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length > FILES.count) {
    return { status: 'invalid', message: `첨부파일은 ${FILES.count}개까지 보낼 수 있습니다.`, fields }
  }
  if (files.reduce((n, f) => n + f.size, 0) > FILES.total) {
    return { status: 'invalid', message: '첨부파일은 모두 합쳐 10MB까지 보낼 수 있습니다.', fields }
  }
  const badFile = files.find((f) => !FILE_EXT.test(f.name))
  if (badFile) {
    return { status: 'invalid', message: '사진·도안(PDF, AI 등)·문서 파일만 첨부할 수 있습니다.', fields }
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

  const typeText = fields.types.length ? fields.types.join(', ') : '미기재'
  const rows: [string, string][] = [
    ['성함', fields.name],
    ['이메일', fields.email],
    ['제품 종류', typeText],
    ['제목', fields.title],
  ]
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), '', fields.message || '(요청 사항 없음)'].join('\n')
  const html =
    `<table cellpadding="4" style="border-collapse:collapse">` +
    rows.map(([k, v]) => `<tr><th align="left">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('') +
    `</table><hr><p style="white-space:pre-wrap">${esc(fields.message || '(요청 사항 없음)')}</p>`

  try {
    const attachments = await Promise.all(
      files.map(async (f) => ({
        filename: oneLine(f.name).slice(0, 120) || 'attachment',
        content: Buffer.from(await f.arrayBuffer()),
        contentType: f.type || undefined,
      })),
    )
    await sendMail({
      to: MAIL_TO,
      replyTo: { name: fields.name, address: fields.email },
      subject: `[대양ING 문의] ${fields.title}`,
      text,
      html,
      attachments,
    })
  } catch (err) {
    console.error('[inquiry] 메일 발송 실패:', err instanceof Error ? err.message : err)
    return { status: 'error', message: '문의를 보내지 못했습니다. 아래 메일 주소로 직접 보내 주세요.', fields }
  }

  return { status: 'sent', message: '문의가 등록되었습니다. 적어 주신 이메일로 답장 드리겠습니다.' }
}
