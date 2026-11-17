import type { Metadata } from 'next'
import Link from 'next/link'
import Login from '@/components/dashboard/Login'
import Top from '@/components/dashboard/Top'
import { api, readSession, type InquiryList } from '@/lib/dashboard'
import { kst } from '@/lib/dashboardFormat'

// 대시보드 · 문의 목록. 최신순, 상태별(전체 · 미처리 · 처리 완료)로 거르고 30건씩 넘겨 본다.
export const metadata: Metadata = {
  title: '문의 · 대시보드',
  robots: { index: false, follow: false, nocache: true },
}

const PER = 30
const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'new', label: '미처리' },
  { key: 'done', label: '처리 완료' },
] as const
type Filter = (typeof FILTERS)[number]['key']

const href = (status: Filter, page = 1) => {
  const q = new URLSearchParams()
  if (status !== 'all') q.set('status', status)
  if (page > 1) q.set('page', String(page))
  const s = q.toString()
  return `/dashboard/inquiries${s ? `?${s}` : ''}`
}

export default async function InquiriesPage({ searchParams }: PageProps<'/dashboard/inquiries'>) {
  const email = await readSession()
  if (!email) return <Login />

  const sp = await searchParams
  const status = (FILTERS.find((f) => f.key === sp.status)?.key ?? 'all') as Filter
  const page = Math.max(1, Math.min(10_000, Number(sp.page) || 1))

  let list: InquiryList | null = null
  try {
    list = await api<InquiryList>(`/inquiries?status=${status}&limit=${PER}&offset=${(page - 1) * PER}`)
  } catch {
    list = null
  }
  const pages = list ? Math.max(1, Math.ceil(list.matched / PER)) : 1

  return (
    <main className="dash">
      <Top email={email} current="inquiries" unhandled={list?.new} />

      {!list ? (
        <p className="dash__empty">문의를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.</p>
      ) : (
        <section className="dash__panel">
          <div className="dash__head">
            <h2>상담 문의</h2>
            <nav className="dash__ranges" aria-label="상태">
              {FILTERS.map((f) => (
                <Link key={f.key} href={href(f.key)} aria-current={f.key === status ? 'page' : undefined}>
                  {f.label}
                  <span className="dash__count">{f.key === 'all' ? list.total : f.key === 'new' ? list.new : list.total - list.new}</span>
                </Link>
              ))}
            </nav>
          </div>

          {list.items.length === 0 ? (
            <p className="dash__empty">{status === 'new' ? '미처리 문의가 없습니다.' : '문의가 없습니다.'}</p>
          ) : (
            <ul className="inq">
              {list.items.map((q) => (
                <li key={q.id}>
                  <Link className="inq__row" href={`/dashboard/inquiries/${q.id}`} data-new={!q.handled || undefined}>
                    <span className="inq__state">{q.handled ? '처리 완료' : '미처리'}</span>
                    <span className="inq__who">
                      <strong>{q.name}</strong>
                      <span>{q.email}</span>
                    </span>
                    <span className="inq__snippet">{q.snippet || '내용 없음(예전 기록)'}</span>
                    <span className="inq__meta">
                      {q.files > 0 && <span className="inq__files">첨부 {q.files}</span>}
                      {!q.mailed && <span className="inq__fail">메일 실패</span>}
                      <time dateTime={new Date(q.ts * 1000).toISOString()}>{kst.format(q.ts * 1000)}</time>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {pages > 1 && (
            <nav className="dash__pager" aria-label="쪽">
              {page > 1 ? <Link href={href(status, page - 1)}>이전</Link> : <span />}
              <span>
                {page} / {pages}
              </span>
              {page < pages ? <Link href={href(status, page + 1)}>다음</Link> : <span />}
            </nav>
          )}
        </section>
      )}
    </main>
  )
}
