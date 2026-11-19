// 지퍼의 선택지와 사양 — 가이드(/handbook)의 그림과 맨 위 "직접 골라 보기"(ZipperLab)가 쓴다.

export type Kind = 'metal' | 'vislon' | 'coil' | 'conceal'
export type Lock = 'auto' | 'non' | 'reverse'
export type Pull = 'tab' | 'plate' | 'ring' | 'cord' | 'leather' | 'rubber'
export type MetalKey = 'gold' | 'silver' | 'antique' | 'black' | 'gun'

export type Spec = {
  kind: Kind
  size: number // 호수
  len: number // cm
  tape: string // '#RRGGBB'
  teeth: string // 메탈: 슬라이더와 같은 값 · 그 밖: 'same'(슬라이더 컬러를 따름) 또는 '#RRGGBB'
  slider: string // 슬라이더 컬러: MetalKey(도금) 또는 '#RRGGBB'(도장), 'paint' 는 테이프 색
  pull: Pull
  engrave: string // 손잡이 각인
  print: string // 테이프 인쇄 문구
  lock: Lock // 슬라이더 방식
  water: boolean // 방수 코팅(나일론만)
}

export const KINDS: { key: Kind; label: string; sizes: number[] }[] = [
  { key: 'metal', label: '메탈', sizes: [3, 5, 8, 10] },
  { key: 'vislon', label: '비슬론', sizes: [3, 5, 8, 10] },
  { key: 'coil', label: '나일론', sizes: [3, 5, 8] },
  { key: 'conceal', label: '콘실', sizes: [3, 5] },
]

export const LOCKS: { key: Lock; label: string; hint: string }[] = [
  { key: 'auto', label: '오토락', hint: '손잡이를 내리면 고정돼요. 바지 앞여밈 등' },
  { key: 'non', label: '논락', hint: '고정 없이 부드럽게 움직여요. 주머니·가방 등' },
  { key: 'reverse', label: '양면', hint: '앞뒤 양쪽에 손잡이가 있어요. 리버서블 옷 등' },
]

export const PULLS: { key: Pull; label: string; engravable: boolean }[] = [
  { key: 'tab', label: '기본', engravable: true },
  { key: 'plate', label: '로고판', engravable: true },
  { key: 'ring', label: '링', engravable: false },
  { key: 'cord', label: '끈', engravable: false },
  { key: 'leather', label: '가죽', engravable: true },
  { key: 'rubber', label: '러버', engravable: true },
]

export const TAPE_COLORS: { name: string; hex: string }[] = [
  { name: '데님', hex: '#253F72' },
  { name: '코발트', hex: '#1F6FD1' },
  { name: '레드', hex: '#C8202F' },
  { name: '탠저린', hex: '#E0662F' },
  { name: '머스터드', hex: '#E2AE2A' },
  { name: '에메랄드', hex: '#0F7A5C' },
  { name: '로즈', hex: '#E9A6B4' },
  { name: '아이보리', hex: '#E6DECB' },
  { name: '블랙', hex: '#17181C' },
]

// 금속 색: 밝은 면 → 그늘 순서의 네 단계
export const METALS: { key: MetalKey; name: string; stops: [string, string, string, string] }[] = [
  { key: 'gold', name: '골드', stops: ['#F6E2A8', '#D4AE5E', '#A07A2E', '#6E4F18'] },
  { key: 'silver', name: '실버', stops: ['#F7F8FA', '#CDD0D6', '#8F949C', '#5B6068'] },
  { key: 'antique', name: '앤틱 브라스', stops: ['#D8BE86', '#9B7940', '#6A4E22', '#3E2C12'] },
  { key: 'black', name: '블랙 니켈', stops: ['#8C8F95', '#4B4E54', '#27292D', '#111214'] },
  { key: 'gun', name: '건메탈', stops: ['#B9BEC6', '#70767F', '#464B53', '#2B2F35'] },
]

export const DEFAULT_SPEC: Spec = {
  kind: 'metal',
  size: 5,
  len: 20,
  tape: '#253F72',
  teeth: 'gold',
  slider: 'gold',
  pull: 'tab',
  engrave: '',
  print: '',
  lock: 'auto',
  water: false,
}

// '#abc' · 'abc' · '#AABBCC' · 'aabbcc' → '#AABBCC' (형식이 틀리면 null)
export const normalizeHex = (raw: string): string | null => {
  const s = raw.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(s)) return ('#' + [...s].map((c) => c + c).join('')).toUpperCase()
  if (/^[0-9a-f]{6}$/i.test(s)) return ('#' + s).toUpperCase()
  return null
}

// 밝은 색인지(위에 올릴 글자·체크 표시를 어둡게 할지) — 상대 휘도 기준
export const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.4
}

export const isMetal = (v: string): v is MetalKey => METALS.some((m) => m.key === v)
const metal = (k: MetalKey) => METALS.find((m) => m.key === k)!

// 종류에 맞지 않는 값은 그 종류의 기본값으로 바로잡는다(호수 · 이 색: 메탈 이는 슬라이더와 같은 컬러)
export const fixSpec = (s: Spec): Spec => {
  const kind = KINDS.find((k) => k.key === s.kind)!
  const size = kind.sizes.includes(s.size) ? s.size : kind.sizes.includes(5) ? 5 : kind.sizes[0]
  const water = s.kind === 'coil' && s.water
  const teeth = s.kind === 'metal' ? s.slider : s.teeth === 'same' || normalizeHex(s.teeth) ? s.teeth : 'same'
  return { ...s, size, teeth, water }
}

// 직접 고른 색(도장)의 밝은 면 → 그늘 네 단계
const shades = (hex: string) => [
  `color-mix(in oklab, ${hex} 55%, #fff)`,
  hex,
  `color-mix(in oklab, ${hex} 72%, #000)`,
  `color-mix(in oklab, ${hex} 45%, #000)`,
]

// 미리보기 그림이 읽는 CSS 변수
export const specVars = (s: Spec): Record<string, string> => {
  // 슬라이더 컬러: 도금(금속 네 단계) 또는 직접 고른 색. 이 색: 메탈은 슬라이더와 같고, 비슬론·나일론도 기본은 슬라이더 컬러
  const stopsOf = (v: string): readonly string[] => (isMetal(v) ? metal(v).stops : shades(v === 'paint' ? s.tape : (normalizeHex(v) ?? '#D4AE5E')))
  const k = stopsOf(s.slider)
  const teethStops = s.kind === 'metal' ? stopsOf(s.teeth) : k
  const teethHex = s.kind === 'metal' ? s.tape : s.teeth === 'same' ? k[1] : s.teeth
  const vars: Record<string, string> = { '--cfg-tape': s.tape, '--cfg-teeth': teethHex }
  teethStops.forEach((c, i) => (vars[`--cfg-s${i}`] = c))
  k.forEach((c, i) => (vars[`--cfg-k${i}`] = c))
  return vars
}

// 호수 → 미리보기 이·슬라이더 크기 배율
export const sizeScale = (size: number) => ({ 3: 0.74, 5: 1, 8: 1.28, 10: 1.48 })[size] ?? 1

// public/zipper 그림을 다시 만들 때마다 올린다(브라우저에 남은 옛 그림을 쓰지 않게 주소 뒤에 ?v= 로 붙인다)
export const ZIPPER_ASSET_V = 7
