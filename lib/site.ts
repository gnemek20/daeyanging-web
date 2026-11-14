// 사이트 공통 정보 — 메타데이터, 구조화 데이터, sitemap 이 함께 쓴다.

export const SITE = {
  url: 'https://daeyanging.com',
  name: '대양ING',
  legalName: '주식회사 대양아이엔지',
  tagline: '패션에 새로운 날개를 달다',
  // 최신 사이트(DaeyangING)의 설명문 그대로 + 위치
  description:
    '지퍼를 통해 패션에 새로운 날개를 달다 - 대양ING는 고품질 지퍼와 의류 부자재를 빠르게, 원하는 방식으로 제작해 드립니다. 서울 종로구 김상옥로 59 (종로5가역·동대문역 인근).',
  keywords: [
    '의류 부자재',
    '지퍼',
    '지퍼 제작',
    '지퍼 맞춤 제작',
    '지퍼 도매',
    '지퍼 풀러',
    '메탈 지퍼',
    '비슬론 지퍼',
    '나일론 지퍼',
    '콘실 지퍼',
    '동대문 부자재',
    '종로 부자재',
    '의류 부자재 업체',
    'OEM 지퍼',
  ],
  email: 'hyunwoo.kim@daeyanging.com',
  bizNo: '869-81-02857',
  address: {
    street: '김상옥로 59, 한아빌딩 3층',
    locality: '종로구',
    region: '서울특별시',
    country: 'KR',
    full: '서울특별시 종로구 김상옥로 59, 한아빌딩 3층',
  },
  // 건물 위치(김상옥로 59, 효제동). 최신 사이트의 지도 좌표와 같다.
  geo: { lat: 37.5736, lng: 127.0045 },
  // 서치 어드바이저 소유 확인 코드 — 받으면 채운다(빈 값이면 메타 태그를 넣지 않는다).
  verification: {
    google: '',
    naver: '',
  },
} as const

// 하위 페이지가 openGraph 를 정의하면 부모 값이 통째로 바뀌므로, 공통 값을 함께 넣는다.
export const OG_BASE = {
  siteName: SITE.name,
  locale: 'ko_KR',
  images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: '대양ING — 고품질 지퍼 및 의류 부자재 맞춤 제작' }],
}

// JSON-LD 를 <script> 에 넣을 때 '<' 를 이스케이프한다(Next.js JSON-LD 가이드).
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
