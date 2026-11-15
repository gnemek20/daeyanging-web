import Link from 'next/link'
import ContactForm, { type SpecInfo } from './ContactForm'
import { ORDER_CHECKLIST } from '@/lib/guides'
import { SITE } from '@/lib/site'

// 서버 컴포넌트. 입력 폼만 클라이언트 컴포넌트다.
// 왼쪽: 연락처와 문의 전 체크리스트(자바스크립트 없이 <details> 로 펼침), 오른쪽: 문의 폼.
const Contact = ({ spec, first = false }: { spec: SpecInfo | null; first?: boolean }) => {
  return (
    <section className="sec sec--tight" aria-label="상담 문의">
      <div className="wrap contact">
        <aside className="contact__side">
          <dl className="facts">
            <div>
              <dt>이메일</dt>
              <dd>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </dd>
            </div>
            <div>
              <dt>주소</dt>
              <dd>{SITE.address.full}</dd>
            </div>
            <div>
              <dt>운영</dt>
              <dd>평일 09:00 – 18:00</dd>
            </div>
          </dl>

          <details className="prep">
            <summary>
              <span>
                <span className="ph">문의할 때</span> <span className="ph">이런 내용을 적어 주세요</span>
              </span>
            </summary>
            <div className="prep__body">
              <p>
                <span className="ph">아는 것만 적어 주셔도 괜찮아요.</span>{' '}
                <span className="ph">미리 정리해 주시면 더 빠르고 정확하게 상담해 드려요.</span>
              </p>
              <dl className="prep__list">
                {ORDER_CHECKLIST.map((c) => (
                  <div key={c.k}>
                    <dt>{c.k}</dt>
                    <dd>{c.v}</dd>
                  </div>
                ))}
              </dl>
              <p className="prep__links">
                <Link href="/design">맞춤 제작 화면에서 사양 골라 보기</Link>
              </p>
            </div>
          </details>
        </aside>

        <ContactForm email={SITE.email} spec={spec} startFirst={first} />
      </div>
    </section>
  )
}

export default Contact
