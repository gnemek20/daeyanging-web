import ContactForm from './ContactForm'
import { SITE } from '@/lib/site'

// 서버 컴포넌트. 입력 폼만 클라이언트 컴포넌트다.
const Contact = () => {
  return (
    <section className="sec sec--indigo" id="contact" aria-labelledby="contact-h">
      <div className="wrap split">
        <div>
          <h2 className="h2" id="contact-h">
            상담 문의
          </h2>
          <p className="body split__note">
            <span className="ph">필요한 지퍼와 풀러를 알려 주세요.</span>{' '}
            <span className="ph">참고 사진이나 도안을 첨부하시면</span> <span className="ph">더 정확하게 안내해 드립니다.</span>
          </p>
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

        <ContactForm email={SITE.email} />
      </div>
    </section>
  )
}

export default Contact
