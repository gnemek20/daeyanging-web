import type { Metadata, Viewport } from 'next'
import { Archivo } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SITE } from '@/lib/site'
// 글꼴은 모두 이 사이트에서 직접 내려준다(외부 글꼴 서버 연결 없음).
// Pretendard: 한글을 유니코드 구간별로 쪼갠 파일이라 화면에 쓰인 글자 구간만 받는다.
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './globals.css'

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' })

const verificationOther: Record<string, string> = {}
if (SITE.verification.naver) verificationOther['naver-site-verification'] = SITE.verification.naver

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — 지퍼·의류 부자재 맞춤 제작 | 서울 종로·동대문`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  applicationName: SITE.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE.name,
    url: '/',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: true },
  verification: {
    ...(SITE.verification.google ? { google: SITE.verification.google } : {}),
    ...(Object.keys(verificationOther).length ? { other: verificationOther } : {}),
  },
}

export const viewport: Viewport = {
  themeColor: '#F6F6F3',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={archivo.variable}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
