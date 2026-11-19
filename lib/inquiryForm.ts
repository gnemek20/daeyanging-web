// 상담 문의 양식 — 문의 폼(화면)과 서버 액션(메일 본문)이 함께 쓴다.
// 두 가지 작성 방식: "양식으로 작성"(기본, 사양을 고르거나 짧게 적기) / "자유롭게 작성"(글 한 칸).
// 사양 항목: 종류·슬라이더·호수·길이·컬러·수량·납기.

export const MODES = [
  { key: 'form', label: '양식으로 작성' },
  { key: 'free', label: '자유롭게 작성' },
] as const
export type Mode = (typeof MODES)[number]['key']

export const UNDECIDED = '미정'

// 고르는 항목(마지막에 "미정")과 짧게 적는 항목. 화면에는 이 순서대로, 이름은 낱말 하나로.
export type Field =
  | { name: string; label: string; options: string[]; placeholder?: never }
  | { name: string; label: string; placeholder: string; options?: never }

export const CHOICES: Field[] = [
  { name: 'q_kind', label: '종류', options: ['메탈', '비슬론', '나일론', '콘실', '방수'] },
  { name: 'q_slider', label: '슬라이더', options: ['기본', '로고판', '링', '끈', '가죽', '러버'] },
  { name: 'q_size', label: '호수', options: ['3호', '5호', '8호', '10호'] },
]
// 두 칸씩 나란히: (길이, 컬러) · (수량, 납기)
export const TEXTS: Field[] = [
  { name: 'q_len', label: '길이', placeholder: '예) 60cm' },
  { name: 'q_color', label: '컬러', placeholder: '예) 네이비, 팬톤 19-4052' },
  { name: 'q_qty', label: '수량', placeholder: '예) 샘플 2, 양산 300' },
  { name: 'q_date', label: '납기', placeholder: '예) 12월 중순' },
]
// 메일에 적는 순서
const MAIL_ORDER = ['q_kind', 'q_slider', 'q_size', 'q_len', 'q_color', 'q_qty', 'q_date']
const ALL = [...CHOICES, ...TEXTS]

export const ANSWER_NAMES = ALL.map((f) => f.name)
export const ANSWER_MAX = 200

// 고르는 항목의 값이 정해진 선택지인지(서버에서 다시 확인)
export const validChoice = (name: string, v: string) => {
  const f = CHOICES.find((c) => c.name === name)
  return !!f && (v === UNDECIDED || f.options!.includes(v))
}
export const isChoice = (name: string) => CHOICES.some((c) => c.name === name)

// 메일 본문에 붙일 정리된 사양(빈 칸은 "-")
export const composeAnswers = (a: Record<string, string>) =>
  ['— 문의 사양 —', ...MAIL_ORDER.map((n) => `${ALL.find((f) => f.name === n)!.label}: ${a[n] || '-'}`)].join('\n')

// ───────── 첨부 파일 ─────────
// 모든 이미지 형식 + PDF. 브라우저가 형식을 모르는 파일(HEIC 등)도 있어 확장자로도 본다.
export const FILES_MAX = 10
export const FILES_MAX_TOTAL = 15 * 1024 * 1024 // 메일 한 통에 실을 수 있게(인코딩하면 약 1.37배)
export const FILE_EXT = [
  'jpg', 'jpeg', 'jfif', 'png', 'gif', 'webp', 'avif', 'heic', 'heif', 'bmp', 'tif', 'tiff', 'svg', 'ico',
  'psd', 'ai', 'eps', 'raw', 'cr2', 'nef', 'arw', 'dng', 'pdf',
]
export const FILE_ACCEPT = ['image/*', 'application/pdf', ...FILE_EXT.map((e) => '.' + e)].join(',')

export const fileAllowed = (f: { name: string; type: string }) => {
  const ext = f.name.toLowerCase().split('.').pop() ?? ''
  return f.type.startsWith('image/') || f.type === 'application/pdf' || FILE_EXT.includes(ext)
}

export const formatBytes = (n: number) =>
  n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))}KB` : `${+(n / 1024 / 1024).toFixed(1)}MB`
