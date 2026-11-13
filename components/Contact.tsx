import ContactForm from './ContactForm'
import { SITE } from '@/lib/site'

// 서버 컴포넌트. 입력 폼만 클라이언트 컴포넌트다.
const Contact = () => {
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
          <dl className="cinfo">
            <div>
              <dt>전화</dt>
              <dd>
                <a href={`tel:${SITE.phone.replace(/-/g, '')}`}>{SITE.phone}</a>
              </dd>
            </div>
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

        <ContactForm email={SITE.email} />
      </div>
    </section>
  )
}

export default Contact
