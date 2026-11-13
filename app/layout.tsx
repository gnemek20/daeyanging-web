import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '대양ING — 패션에 새로운 날개를 달다',
  description: '고품질 지퍼와 의류 부자재를, 원하는 방식 그대로. 주식회사 대양아이엔지, 서울 종로·동대문.',
}

export const viewport: Viewport = {
  themeColor: '#EFF0EE',
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
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
