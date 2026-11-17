import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Login from '@/components/dashboard/Login'
import Top from '@/components/dashboard/Top'
import { api, readSession, type InquiryDetail } from '@/lib/dashboard'
import { bytes, kst } from '@/lib/dashboardFormat'
import { setHandled } from '../../actions'

// 대시보드 · 문의 하나: 보낸 사람, 본문(메일과 같은 내용), 첨부(사진은 미리보기), 처리 완료 표시, 메일로 회신.
export const metadata: Metadata = {
  title: '문의 · 대시보드',
  robots: { index: false, follow: false, nocache: true },
}

// 화면에 바로 띄우는 사진 형식(나머지는 내려받기)
const PREVIEW = /^image\/(jpeg|png|gif|webp|avif|bmp)$/

export default async function InquiryPage({ params }: PageProps<'/dashboard/inquiries/[id]'>) {
  const email = await readSession()
  if (!email) return <Login />

  const { id } = await params
  if (!/^\d{1,9}$/.test(id)) notFound()
  let q: InquiryDetail | null = null
  let failed = false
  try {
    q = await api<InquiryDetail>(`/inquiries/${id}`)
  } catch (err) {
    if (err instanceof Error && err.message === 'API 404') notFound()
    failed = true
  }

  const subject = encodeURIComponent(`Re: [대양ING] 문의${q?.ref ? ` ${q.ref}` : ''} 답변드립니다`)
  const base = `/dashboard/inquiries/${id}/files`

  return (
    <main className="dash">
      <Top email={email} current="inquiries" />
      <p className="dash__back">
        <Link href="/dashboard/inquiries">← 문의 목록</Link>
      </p>

      {failed || !q ? (
        <p className="dash__empty">문의를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.</p>
      ) : (
        <article className="dash__panel inqd">
          <header className="inqd__head">
            <div>
              <p className="inqd__ref">{q.ref || `#${q.id}`}</p>
              <h2 className="inqd__name">{q.name}</h2>
              <p className="inqd__mail">
                <a href={`mailto:${q.email}`}>{q.email}</a>
              </p>
            </div>
            <div className="inqd__actions">
              <a className="dash__btn" href={`mailto:${q.email}?subject=${subject}`}>
                메일로 회신
              </a>
              <form action={setHandled.bind(null, q.id, !q.handled)}>
                <button type="submit" className="dash__btn dash__btn--line" data-on={q.handled || undefined}>
                  {q.handled ? '처리 완료 취소' : '처리 완료'}
                </button>
              </form>
            </div>
          </header>

          <dl className="inqd__meta">
            <div>
              <dt>접수</dt>
              <dd>{kst.format(q.ts * 1000)}</dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd>{q.handled ? '처리 완료' : '미처리'}</dd>
            </div>
            <div>
              <dt>작성 방식</dt>
              <dd>{q.mode === 'form' ? '양식' : q.mode === 'free' ? '자유 작성' : '—'}</dd>
            </div>
            <div>
              <dt>알림 메일</dt>
              <dd>{q.mailed ? '발송됨' : '발송 실패'}</dd>
            </div>
            <div>
              <dt>IP</dt>
              <dd className="dash__mono">{q.ip || '—'}</dd>
            </div>
          </dl>

          <section className="inqd__body">
            <h3>내용</h3>
            {q.message ? <p className="inqd__msg">{q.message}</p> : <p className="dash__empty">내용 없음(내용 저장 이전에 들어온 문의)</p>}
          </section>

          {q.files.length > 0 && (
            <section className="inqd__body">
              <h3>첨부 {q.files.length}개</h3>
              <ul className="inqd__files">
                {q.files.map((f, n) => (
                  <li key={n}>
                    {PREVIEW.test(f.type) ? (
                      <a className="inqd__thumb" href={`${base}/${n}`} target="_blank" rel="noopener">
                        {/* eslint-disable-next-line @next/next/no-img-element -- 로그인한 사람만 받는 비공개 파일(이미지 최적화 대상 아님) */}
                        <img src={`${base}/${n}`} alt={f.name} loading="lazy" />
                      </a>
                    ) : (
                      <span className="inqd__thumb inqd__thumb--doc" aria-hidden="true">
                        {(f.name.split('.').pop() ?? '').slice(0, 4).toUpperCase()}
                      </span>
                    )}
                    <span className="inqd__fname">{f.name}</span>
                    <span className="inqd__fsize">{bytes(f.size)}</span>
                    <a className="inqd__dl" href={`${base}/${n}?download=1`}>
                      내려받기
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}
    </main>
  )
}
