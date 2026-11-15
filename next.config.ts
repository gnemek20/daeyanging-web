import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // iwinv VPS 의 Docker 이미지가 쓰는 최소 실행 묶음(.next/standalone).
  output: 'standalone',
  images: {
    // AVIF 를 먼저(같은 화질에 더 작다), 못 읽는 브라우저는 WebP.
    formats: ['image/avif', 'image/webp'],
    // 사진은 화질 90 으로 내려준다(lib/photos.ts 의 PHOTO_QUALITY). 75 는 기본값.
    qualities: [75, 90],
    // 원본 폭(1280·1920)을 목록에 넣어 고해상도 화면에서 원본 해상도를 그대로 쓰게 한다.
    deviceSizes: [640, 750, 828, 1080, 1280, 1600, 1920],
    // 사진 파일은 거의 바뀌지 않으므로 변환 결과를 오래(31일) 둔다.
    minimumCacheTTL: 2678400,
  },
}

export default nextConfig
