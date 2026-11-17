// 제품 화면의 사진 갤러리: 실제로 만든 지퍼·부자재 사진과 분류.
// 사진을 더 넣으려면 public/images 에 파일을 두고 lib/photos.ts 에 등록한 뒤 아래 GALLERY 에 한 줄 더하면 된다.
import { PHOTOS, type Photo } from './photos'

// 종류는 넷만: 콘실·방수 코일은 나일론, 슬라이더·손잡이·테이프 인쇄는 부자재로 묶는다
export const GALLERY_TAGS = [
  { id: 'metal', label: '메탈' },
  { id: 'vislon', label: '비슬론' },
  { id: 'nylon', label: '나일론' },
  { id: 'parts', label: '부자재' },
] as const

export type GalleryTag = (typeof GALLERY_TAGS)[number]['id']

export type GalleryItem = {
  id: string
  photo: Photo
  title: string
  tags: GalleryTag[]
  // 세로 사진은 칸을 위아래로 두 칸 쓴다
  tall?: boolean
}

export const GALLERY: GalleryItem[] = [
  { id: 'metal-beige', photo: PHOTOS.hero, title: '베이지 테이프 · 실버 메탈', tags: ['metal'] },
  { id: 'vislon-color', photo: PHOTOS.vislon, title: '컬러 비슬론', tags: ['vislon'] },
  { id: 'pullers', photo: PHOTOS.pullersAssorted, title: '러버 손잡이 · 메탈 슬라이더', tags: ['parts'] },
  { id: 'metal-vislon', photo: PHOTOS.metalVislonTapes, title: '메탈 · 비슬론 · 건메탈 슬라이더', tags: ['metal', 'vislon'], tall: true },
  { id: 'nylon', photo: PHOTOS.nylon, title: '나일론 코일', tags: ['nylon'] },
  { id: 'water', photo: PHOTOS.waterproof, title: '방수 지퍼', tags: ['nylon'] },
  { id: 'metal-antique', photo: PHOTOS.metal, title: '앤틱 브라스 메탈', tags: ['metal'] },
  { id: 'print', photo: PHOTOS.tapePrint, title: '테이프 로고 인쇄', tags: ['parts'] },
  { id: 'conceal', photo: PHOTOS.conceal, title: '콘실 지퍼', tags: ['nylon'] },
  { id: 'metal-black-set', photo: PHOTOS.metalBlackSet, title: '검정 테이프 메탈 모음', tags: ['metal'] },
  { id: 'sliders', photo: PHOTOS.sliders, title: '슬라이더 마감', tags: ['parts'] },
  { id: 'vislon-water', photo: PHOTOS.vislonWaterproof, title: '방수 비슬론', tags: ['vislon'] },
  { id: 'metal-tapes', photo: PHOTOS.metalTapes, title: '실버 · 코퍼 메탈', tags: ['metal'] },
  { id: 'leather', photo: PHOTOS.pullerLeather, title: '가죽 손잡이', tags: ['parts'] },
  { id: 'metal-bronze', photo: PHOTOS.metalGrayBronze, title: '회색 테이프 · 브론즈 메탈', tags: ['metal'] },
  { id: 'rubber', photo: PHOTOS.pullerRubber, title: '러버 손잡이', tags: ['parts'] },
  { id: 'coil-logo', photo: PHOTOS.coilBlackLogo, title: '검정 코일 · 로고 손잡이', tags: ['nylon'] },
  { id: 'metal-silver', photo: PHOTOS.metalBlackSilver, title: '검정 테이프 · 실버 메탈', tags: ['metal'] },
  { id: 'cord', photo: PHOTOS.pullerCord, title: '끈 손잡이', tags: ['parts'] },
]

export const tagLabel = (id: GalleryTag) => GALLERY_TAGS.find((t) => t.id === id)?.label ?? id
