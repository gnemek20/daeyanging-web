import ContactForm from './ContactForm'
import { ORDER_CHECKLIST } from '@/lib/guides'
import { SITE } from '@/lib/site'

// 서버 컴포넌트. 입력 폼만 클라이언트 컴포넌트다.
// 문의 전 체크리스트는 폼 바로 옆에서 펼쳐 볼 수 있게 둔다(자바스크립트 없이 <details>).
const Contact = ({ first = false }: { first?: boolean }) => {
  return (
    <section className="sec sec--indigo" id="contact" aria-labelledby="contact-h">
      <div className="wrap split">
        <div>
          <h2 className="h2" id="contact-h">
            날개를
            <br />
            달아드리겠습니다.
          </h2>
          <p className="body split__note">
            <span className="ph">샘플 요청, 단가 문의, 맞춤 제작 상담 —</span>{' '}
            <span className="ph">어떤 단계든 편하게 연락 주세요.</span>
          </p>

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
            </div>
          </details>

          <dl className="cinfo">
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
          </dl>
        </div>

        <ContactForm email={SITE.email} spec={null} startFirst={first} />
      </div>
    </section>
  )
}

export default Contact
