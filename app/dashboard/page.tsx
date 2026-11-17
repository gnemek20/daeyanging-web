import type { Metadata } from 'next'
import Link from 'next/link'
import DailyChart from '@/components/dashboard/DailyChart'
import Login from '@/components/dashboard/Login'
import Top from '@/components/dashboard/Top'
import { api, readSession, type Row, type Stats } from '@/lib/dashboard'
import { kst, num } from '@/lib/dashboardFormat'

// 대양ING 대시보드 — 주소로만 들어온다(사이트 어디에서도 링크하지 않음, 검색 제외, 사이트맵 제외).
export const metadata: Metadata = {
  title: '대시보드',
  robots: { index: false, follow: false, nocache: true },
}

const RANGES = [7, 30, 90] as const

const PAGE_NAMES: Record<string, string> = {
  '/': '첫 화면·회사소개',
  '/products': '제품',
  '/design': '맞춤 제작',
  '/handbook': '가이드',
  '/contact': '상담문의',
  '/guide': '검색용 가이드 목록',
}
const pageName = (p: string) => PAGE_NAMES[p] ?? (p.startsWith('/guide/') ? `검색용 가이드 ${p.slice(7)}` : p)

const Table = ({ title, rows, name, empty }: { title: string; rows: Row[]; name?: (k: string) => string; empty: string }) => {
  const total = rows.reduce((s, r) => s + r.views, 0) || 1
  return (
    <section className="dash__panel">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="dash__empty">{empty}</p>
      ) : (
        <table className="dash__table">
          <thead>
            <tr>
              <th scope="col">이름</th>
              <th scope="col">방문자</th>
              <th scope="col">페이지뷰</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k}>
                <th scope="row">
                  <span className="dash__bar" style={{ '--w': r.views / total } as React.CSSProperties} aria-hidden="true" />
                  {name ? name(r.k) : r.k}
                </th>
                <td>{num.format(r.visitors)}</td>
                <td>{num.format(r.views)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default async function DashboardPage({ searchParams }: PageProps<'/dashboard'>) {
  const email = await readSession()
  if (!email) return <Login />

  const d = Number((await searchParams).days)
  const days = RANGES.includes(d as (typeof RANGES)[number]) ? d : 30
  let s: Stats | null = null
  try {
    s = await api<Stats>(`/stats?days=${days}`)
  } catch {
    s = null
  }

  return (
    <main className="dash">
      <Top email={email} current="stats" unhandled={s?.totals.unhandled}>
        <nav className="dash__ranges" aria-label="기간">
          {RANGES.map((r) => (
            <Link key={r} href={`/dashboard?days=${r}`} aria-current={r === days ? 'page' : undefined}>
              최근 {r}일
            </Link>
          ))}
        </nav>
      </Top>

      {!s ? (
        <p className="dash__empty">데이터를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.</p>
      ) : (
        <>
          <p className="dash__since">
            {s.since} 부터 오늘까지 · 한국 시간 ·{' '}
            {s.collecting_since ? `방문 기록 수집 시작 ${kst.format(s.collecting_since * 1000)}` : '아직 방문 기록이 없습니다'}
          </p>

          <dl className="dash__kpis">
            <div>
              <dt>방문자</dt>
              <dd>{num.format(s.totals.visitors)}</dd>
            </div>
            <div>
              <dt>페이지뷰</dt>
              <dd>{num.format(s.totals.views)}</dd>
            </div>
            <div>
              <dt>상담 문의</dt>
              <dd>{num.format(s.totals.inquiries)}</dd>
            </div>
            <div>
              <dt>
                <Link href="/dashboard/inquiries?status=new">미처리 문의 (전체 기간)</Link>
              </dt>
              <dd>{num.format(s.totals.unhandled)}</dd>
            </div>
          </dl>

          <section className="dash__panel">
            <h2>날짜별 방문자</h2>
            <DailyChart series={s.series} />
            <details className="dash__more">
              <summary>날짜별 표로 보기</summary>
              <table className="dash__table">
                <thead>
                  <tr>
                    <th scope="col">날짜</th>
                    <th scope="col">방문자</th>
                    <th scope="col">페이지뷰</th>
                    <th scope="col">문의</th>
                  </tr>
                </thead>
                <tbody>
                  {[...s.series].reverse().map((r) => (
                    <tr key={r.day}>
                      <th scope="row">{r.day}</th>
                      <td>{r.visitors}</td>
                      <td>{r.views}</td>
                      <td>{r.inquiries}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>

          <div className="dash__grid">
            <Table title="많이 본 화면" rows={s.pages} name={pageName} empty="아직 기록이 없습니다." />
            <Table title="들어온 곳" rows={s.referrers} name={(k) => k || '직접 방문·북마크'} empty="아직 기록이 없습니다." />
            <Table title="기기" rows={s.devices} empty="아직 기록이 없습니다." />
            <Table title="브라우저" rows={s.browsers} empty="아직 기록이 없습니다." />
            <Table title="운영체제" rows={s.oses} empty="아직 기록이 없습니다." />
          </div>

          <section className="dash__panel">
            <div className="dash__head">
              <h2>상담 문의</h2>
              <Link className="dash__link" href="/dashboard/inquiries">
                전체 보기
              </Link>
            </div>
            {s.inquiries.length === 0 ? (
              <p className="dash__empty">이 기간에 들어온 문의가 없습니다.</p>
            ) : (
              <div className="dash__scroll">
                <table className="dash__table dash__table--wide">
                  <thead>
                    <tr>
                      <th scope="col">시각</th>
                      <th scope="col">성함 / 회사명</th>
                      <th scope="col">이메일</th>
                      <th scope="col">상태</th>
                      <th scope="col">알림 메일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.inquiries.map((q) => (
                      <tr key={q.id}>
                        <th scope="row">
                          <Link href={`/dashboard/inquiries/${q.id}`}>{kst.format(q.ts * 1000)}</Link>
                        </th>
                        <td>
                          <Link href={`/dashboard/inquiries/${q.id}`}>{q.name}</Link>
                        </td>
                        <td>{q.email}</td>
                        <td>{q.handled ? '처리 완료' : '미처리'}</td>
                        <td>{q.mailed ? '발송됨' : '실패'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}
