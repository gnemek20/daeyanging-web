// 회사가 직접 촬영한 제품 사진(public/images).
// 정적 import 라서 빌드 때 크기와 흐린 미리보기(blurDataURL)가 자동으로 만들어지고,
// next/image 가 화면 폭에 맞는 크기·AVIF/WebP 로 바꿔 내려준다(next.config.ts 의 images).
// 크게 보이는 세 장(company-metal-zippers, tape-print, metal-tapes)은 원본 1280px 을 1920px 로
// 고품질(Lanczos) 확대 + 약한 선명화를 한 파일이다.
import type { StaticImageData } from 'next/image'
import companyMetalZippers from '@/public/images/company-metal-zippers.jpg'
import conceal from '@/public/images/conceal.jpg'
import metalAntique from '@/public/images/metal-antique.jpg'
import metalTapes from '@/public/images/metal-tapes.jpg'
import nylon from '@/public/images/nylon.jpg'
import pullerCord from '@/public/images/puller-cord.jpg'
import pullerLeather from '@/public/images/puller-leather.jpg'
import pullerRubber from '@/public/images/puller-rubber.jpg'
import slidersFinishes from '@/public/images/sliders-finishes.jpg'
import tapePrint from '@/public/images/tape-print.jpg'
import vislonColor from '@/public/images/vislon-color.jpg'
import waterproof from '@/public/images/waterproof.jpg'

export type Photo = { src: StaticImageData; alt: string }

// 사진 화질: next.config.ts 의 images.qualities 에 있는 값만 쓸 수 있다
export const PHOTO_QUALITY = 90

export const PHOTOS = {
  hero: { src: companyMetalZippers, alt: '흰 계단 위에 놓인 베이지 테이프 메탈 지퍼 두 줄' },
  metalTapes: { src: metalTapes, alt: '검정·흰색 테이프에 실버·코퍼 메탈 지퍼가 나란히 놓인 모습' },
  tapePrint: { src: tapePrint, alt: '브랜드 문구가 인쇄된 여러 가지 지퍼 테이프' },
  metal: { src: metalAntique, alt: '카키 테이프에 앤틱 브라스 메탈 지퍼' },
  vislon: { src: vislonColor, alt: '청록·남색 테이프에 분홍·노랑 이를 단 비슬론 지퍼' },
  nylon: { src: nylon, alt: '파랑·검정 테이프의 나일론 코일 지퍼' },
  conceal: { src: conceal, alt: '겉에서 이가 보이지 않는 남색·초록 콘실 지퍼' },
  waterproof: { src: waterproof, alt: '물방울이 맺힌 검정·빨강 방수 지퍼' },
  sliders: { src: slidersFinishes, alt: '골드·실버·블랙 등 여러 마감의 메탈 슬라이더' },
  pullerRubber: { src: pullerRubber, alt: '브랜드 로고가 들어간 러버·테이프 손잡이' },
  pullerLeather: { src: pullerLeather, alt: '갈색·검정·카키·남색 가죽 손잡이' },
  pullerCord: { src: pullerCord, alt: '파란 테이프에 달린 여러 가지 끈 손잡이' },
} satisfies Record<string, Photo>

// 맞춤 제작에서 고른 종류의 실물 예시
export const KIND_PHOTOS: Record<'metal' | 'vislon' | 'coil' | 'conceal' | 'water', Photo> = {
  metal: PHOTOS.metal,
  vislon: PHOTOS.vislon,
  coil: PHOTOS.nylon,
  conceal: PHOTOS.conceal,
  water: PHOTOS.waterproof,
}
