// 대양ING 실제 제품 사진(최신 사이트 DaeyangING 의 이미지). 정적 import 라 크기가 미리 정해져 레이아웃이 밀리지 않고,
// next/image 가 화면 크기에 맞는 WebP 로 줄여 내려준다.
import pullerCollection from '@/assets/photos/puller-collection.jpg'
import zipperTapeColors from '@/assets/photos/zipper-tape-colors.jpg'
import sliderCollection from '@/assets/photos/slider-collection.jpg'
import metalZipperBrass from '@/assets/photos/metal-zipper-brass.jpg'
import companyCover from '@/assets/photos/company-cover.jpg'
import productCover from '@/assets/photos/product-cover.jpg'
import letteringZipper from '@/assets/photos/lettering-zipper.jpg'
import zipper01 from '@/assets/photos/zipper-01.jpg'
import zipper02 from '@/assets/photos/zipper-02.jpg'
import zipper03 from '@/assets/photos/zipper-03.jpg'
import zipper04 from '@/assets/photos/zipper-04.jpg'
import zipper05 from '@/assets/photos/zipper-05.jpg'
import zipper06 from '@/assets/photos/zipper-06.jpg'
import zipper07 from '@/assets/photos/zipper-07.jpg'
import puller01 from '@/assets/photos/puller-01.jpg'
import puller02 from '@/assets/photos/puller-02.jpg'
import puller03 from '@/assets/photos/puller-03.jpg'

// 첫 화면 아래 사진 줄
export const SAMPLES = [
  { src: pullerCollection, alt: '색색의 실리콘·금속 지퍼 풀러 모음' },
  { src: zipperTapeColors, alt: '여러 색 테이프의 지퍼를 겹쳐 놓은 모습' },
  { src: sliderCollection, alt: '금속 마감별 지퍼 슬라이더 모음' },
  { src: metalZipperBrass, alt: '카키 테이프에 황동 이빨을 단 메탈 지퍼' },
]

export const COMPANY_COVER = { src: companyCover, alt: '계단 모형 위에 놓인 베이지 테이프 메탈 지퍼 두 줄' }
export const PRODUCT_COVER = { src: productCover, alt: '블랙·화이트 테이프에 실버·로즈골드 이빨을 단 메탈 지퍼' }
export const LETTERING_ZIPPER = { src: letteringZipper, alt: '테이프에 브랜드 문구와 줄무늬를 새긴 맞춤 지퍼' }

export const ZIPPERS = [
  { src: zipper01, alt: '코팅 테이프의 블랙 비슬론 지퍼와 금속 슬라이더' },
  { src: zipper02, alt: '블랙 테이프 메탈 지퍼 여러 줄' },
  { src: zipper03, alt: '레드 라인이 들어간 블랙 지퍼와 브랜드 풀러' },
  { src: zipper04, alt: '네이비와 그린 테이프에 컬러 라인이 들어간 지퍼' },
  { src: zipper05, alt: '두 가지 색 이빨을 단 투톤 비슬론 지퍼' },
  { src: zipper06, alt: '블루와 블랙 테이프의 코일 지퍼' },
  { src: zipper07, alt: '그레이 테이프에 브론즈 이빨을 단 메탈 지퍼' },
]

export const PULLERS = [
  { src: puller01, alt: '브랜드 로고를 새긴 실리콘 지퍼 풀러' },
  { src: puller02, alt: '가죽 끈을 단 지퍼 풀러' },
  { src: puller03, alt: '블루 테이프 지퍼에 단 여러 모양의 풀러' },
]
