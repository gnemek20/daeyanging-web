import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // iwinv VPS 의 Docker 이미지가 쓰는 최소 실행 묶음(.next/standalone).
  output: 'standalone',
  images: {
    // 제품 사진은 이 저장소 안의 파일만 줄여 내려준다(외부 이미지 변환 없음).
    qualities: [75],
    formats: ['image/webp'],
    localPatterns: [{ pathname: '/_next/static/media/**' }],
  },
  experimental: {
    // 상담 문의 첨부파일(최대 5개·합계 10MB)을 서버 액션으로 받는다.
    serverActions: { bodySizeLimit: '11mb' },
  },
}

export default nextConfig
