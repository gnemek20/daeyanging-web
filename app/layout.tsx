import type { Metadata, Viewport } from 'next'
import { SITE } from '@/lib/site'
import './globals.css'

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
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,300..800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
