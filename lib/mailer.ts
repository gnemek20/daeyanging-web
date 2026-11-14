import { createTransport } from 'nodemailer'
import { SITE } from './site'

// 서버에서만 쓰는 메일 발송기 — 사이트에서 나가는 메일은 전부 hyunwoo.kim@daeyanging.com 계정(Zoho)으로 보낸다.
// 환경변수(서버 /home/ubuntu/web/daeyanging/prod.env, 실행 시점에만 읽는다 — 이미지에 들어가지 않는다):
//   SMTP_PASS  Zoho 앱 비밀번호 (필수)
//   SMTP_USER  보내는 계정 (기본: SITE.email)
//   SMTP_HOST  기본 smtppro.zoho.com (도메인 계정용 Zoho SMTP, US 데이터센터)
//   SMTP_PORT  기본 465 (SSL)
//   MAIL_TO    문의를 받을 주소 (기본: SITE.email)

const user = process.env.SMTP_USER || SITE.email
const port = Number(process.env.SMTP_PORT || 465)

export const MAIL_TO = process.env.MAIL_TO || SITE.email
export const mailReady = () => Boolean(process.env.SMTP_PASS)

type Transport = ReturnType<typeof createTransport>
type MailOptions = Parameters<Transport['sendMail']>[0]

let transport: Transport | null = null
const getTransport = () => {
  transport ??= createTransport({
    host: process.env.SMTP_HOST || 'smtppro.zoho.com',
    port,
    secure: port === 465,
    auth: { user, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  })
  return transport
}

// 보내는 사람은 항상 인증한 계정 하나로 고정한다(Zoho 는 다른 주소를 From 으로 쓰면 거부한다).
export const sendMail = (opts: Omit<MailOptions, 'from'>) =>
  getTransport().sendMail({ ...opts, from: { name: `${SITE.name} 홈페이지`, address: user } })
