import type { NextRequest } from 'next/server'
import { apiRaw, readSession } from '@/lib/dashboard'

// 문의 첨부 파일 — 대시보드에 로그인한 사람만(쿠키는 /dashboard 아래에서만 실리므로 이 경로에 둔다).
// 백엔드 API 는 내부망에만 있어 여기서 받아 그대로 넘긴다.
// 브라우저가 바로 그려도 안전한 형식(사진·PDF)만 화면에 띄우고, 나머지(SVG·PSD 등)는 내려받게 한다.
const INLINE = /^(image\/(jpeg|png|gif|webp|avif|bmp)|application\/pdf)$/

export async function GET(req: NextRequest, ctx: RouteContext<'/dashboard/inquiries/[id]/files/[n]'>) {
  if (!(await readSession())) return new Response('로그인이 필요합니다.', { status: 401 })
  const { id, n } = await ctx.params
  if (!/^\d{1,9}$/.test(id) || !/^\d{1,2}$/.test(n)) return new Response('잘못된 주소입니다.', { status: 400 })

  let res: Response
  try {
    res = await apiRaw(`/inquiries/${id}/files/${n}`)
  } catch {
    return new Response('파일을 불러오지 못했습니다.', { status: 502 })
  }
  if (!res.ok || !res.body) return new Response('파일이 없습니다.', { status: res.status === 404 ? 404 : 502 })

  const type = res.headers.get('content-type')?.split(';')[0].trim() || 'application/octet-stream'
  const download = req.nextUrl.searchParams.get('download') === '1' || !INLINE.test(type)
  // API 가 붙인 파일 이름(RFC 5987 형식 포함)을 그대로 쓰고, 보는 방식만 바꾼다
  const disposition = (res.headers.get('content-disposition') ?? 'attachment').replace(/^(inline|attachment)/, download ? 'attachment' : 'inline')

  const headers = new Headers({
    'content-type': type,
    'content-disposition': disposition,
    'cache-control': 'private, no-store',
    'x-content-type-options': 'nosniff',
  })
  const length = res.headers.get('content-length')
  if (length) headers.set('content-length', length)
  // 혹시 화면에 띄워진 파일이 스크립트를 실행하지 못하게(PDF 는 sandbox 를 걸면 크롬 PDF 뷰어가 열리지 않아 뺀다)
  if (type !== 'application/pdf') headers.set('content-security-policy', "sandbox; default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'")

  return new Response(res.body, { headers })
}
