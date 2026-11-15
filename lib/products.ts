// 제품 정보 — 첫 화면의 제품 목록과 제품 페이지가 함께 쓴다.
// 설명은 가이드(lib/guides.ts)에 이미 정리한 내용과 같은 사실만 쓴다. 사진은 회사가 직접 촬영한 제품 사진.

import { PHOTOS, type Photo } from './photos'

export type Product = {
  id: string
  name: string
  en: string
  photo: Photo
  summary: string
  desc: string
  specs: { k: string; v: string }[]
}

export const PRODUCTS: Product[] = [
  {
    id: 'metal',
    name: '메탈 지퍼',
    en: 'Metal',
    photo: PHOTOS.metal,
    summary: '묵직한 금속 질감과 견고함',
    desc: '금속으로 만든 이를 테이프에 하나씩 고정한 지퍼입니다. 무게감과 광택이 있어 옷에 단단한 인상을 주고, 반복되는 장력에도 잘 견딥니다. 도금과 마감에 따라 분위기가 크게 달라집니다.',
    specs: [
      { k: '이(엘리먼트)', v: '금속 이를 테이프에 하나씩 고정' },
      { k: '호수', v: '3호 · 5호 · 8호 · 10호' },
      { k: '마감', v: '골드, 실버, 앤틱 브라스, 블랙 니켈, 건메탈 등' },
      { k: '어울리는 곳', v: '청바지, 가죽 재킷, 아우터, 가방' },
    ],
  },
  {
    id: 'vislon',
    name: '비슬론 지퍼',
    en: 'Vislon',
    photo: PHOTOS.vislon,
    summary: '가볍고 다채로운 컬러',
    desc: '수지를 테이프 위에 직접 사출해 이를 만든 지퍼입니다. 가볍고 튼튼하며, 이까지 원하는 색으로 만들 수 있어 컬러 표현이 자유롭습니다.',
    specs: [
      { k: '이(엘리먼트)', v: '수지를 테이프에 사출 성형' },
      { k: '호수', v: '3호 · 5호 · 8호 · 10호' },
      { k: '컬러', v: '테이프와 이를 같은 색 또는 다른 색으로' },
      { k: '어울리는 곳', v: '패딩, 점퍼, 스포츠·아웃도어웨어' },
    ],
  },
  {
    id: 'nylon',
    name: '나일론 지퍼',
    en: 'Nylon Coil',
    photo: PHOTOS.nylon,
    summary: '부드러운 개폐감과 경량성',
    desc: '나일론 실을 코일 모양으로 감아 테이프에 봉제한 지퍼입니다. 가볍고 유연해 곡선 부위에도 자연스럽게 달리고, 가장 폭넓게 쓰이는 표준 지퍼입니다.',
    specs: [
      { k: '이(엘리먼트)', v: '나일론 실을 코일 모양으로 감아 봉제' },
      { k: '호수', v: '3호 · 5호 · 8호' },
      { k: '기능', v: '일반, 방수 코팅' },
      { k: '어울리는 곳', v: '바지, 스커트, 이너, 파우치, 가방' },
    ],
  },
  {
    id: 'conceal',
    name: '콘실 지퍼',
    en: 'Concealed',
    photo: PHOTOS.conceal,
    summary: '봉제선에 숨어 깔끔하게',
    desc: '코일 이가 테이프 안쪽으로 말려 들어가 있어, 닫으면 겉에서는 봉제선만 보이는 지퍼입니다. 옷의 실루엣을 매끈하게 살려야 하는 곳에 씁니다.',
    specs: [
      { k: '이(엘리먼트)', v: '코일 이가 테이프 안쪽으로 숨음' },
      { k: '호수', v: '3호 · 5호' },
      { k: '형태', v: '클로즈형' },
      { k: '어울리는 곳', v: '원피스, 스커트, 드레스, 블라우스' },
    ],
  },
]

// 슬라이더·손잡이와 특수 사양 사진
export const PARTS = [
  {
    ...PHOTOS.sliders,
    title: '메탈 슬라이더',
    text: '골드, 실버, 앤틱 브라스, 블랙 니켈 등 다양한 도금과 마감',
  },
  {
    ...PHOTOS.pullerRubber,
    title: '로고 손잡이',
    text: '브랜드 로고를 넣은 러버·테이프 손잡이',
  },
  {
    ...PHOTOS.pullerLeather,
    title: '가죽 손잡이',
    text: '옷의 소재와 어울리는 가죽 손잡이',
  },
  {
    ...PHOTOS.pullerCord,
    title: '끈 손잡이',
    text: '가볍고 캐주얼한 끈 손잡이',
  },
]

export const SPECIALS = [
  {
    ...PHOTOS.tapePrint,
    title: '테이프 인쇄',
    text: '브랜드 이름과 문구, 라인을 테이프에 넣어 지퍼 자체를 디자인 요소로 만듭니다.',
  },
  {
    ...PHOTOS.waterproof,
    title: '방수 지퍼',
    text: '테이프를 코팅하고 코일을 안쪽에 두어 물이 잘 스며들지 않는 지퍼입니다.',
  },
]
