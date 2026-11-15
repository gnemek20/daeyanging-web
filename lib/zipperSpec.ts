// 지퍼 디자이너의 선택지와 사양.
// 디자이너(/design), 문의 페이지(/contact), 문의 서버 액션이 함께 쓴다.
// 사양은 주소의 검색 파라미터로 오간다(?k=metal&s=5…) — 링크로 공유할 수 있고, 문의 폼까지 그대로 넘어간다.

export type Kind = 'metal' | 'vislon' | 'coil' | 'conceal'
export type Form = 'close' | 'open' | 'twoway' | 'twoclose'
export type Lock = 'auto' | 'non' | 'reverse'
export type Pull = 'tab' | 'plate' | 'ring' | 'cord'
export type MetalKey = 'gold' | 'silver' | 'antique' | 'black' | 'gun'

export type Spec = {
  kind: Kind
  size: number // 호수
  form: Form
  len: number // cm
  tape: string // '#RRGGBB'
  teeth: string // 메탈: MetalKey · 그 밖: 'same'(테이프와 같은 색) 또는 '#RRGGBB'
  slider: MetalKey | 'paint' // paint: 테이프 색으로 도장
  pull: Pull
  engrave: string // 손잡이 각인
  print: string // 테이프 인쇄 문구
  lock: Lock // 슬라이더 방식
  water: boolean // 방수 코팅(나일론만)
  use: string // 용도(USES 의 key, 빈 값 = 미정)
  qty: string // 수량(QTYS 의 key, 빈 값 = 미정)
}

export const KINDS: { key: Kind; label: string; sizes: number[] }[] = [
  { key: 'metal', label: '메탈', sizes: [3, 5, 8, 10] },
  { key: 'vislon', label: '비슬론', sizes: [3, 5, 8, 10] },
  { key: 'coil', label: '나일론', sizes: [3, 5, 8] },
  { key: 'conceal', label: '콘실', sizes: [3, 5] },
]

export const FORMS: { key: Form; label: string; hint: string }[] = [
  { key: 'close', label: '클로즈형', hint: '아래가 막혀 분리되지 않아요 (바지·가방·주머니)' },
  { key: 'open', label: '오픈형', hint: '아래가 완전히 분리돼요 (재킷·점퍼 앞여밈)' },
  { key: 'twoway', label: '양방향 오픈', hint: '슬라이더 두 개로 위아래 모두 열리고 분리돼요 (롱패딩·코트)' },
  { key: 'twoclose', label: '양방향 클로즈', hint: '양쪽 끝이 막혀 있고 슬라이더 두 개로 어느 쪽에서든 열려요 (가방·캐리어)' },
]

export const LOCKS: { key: Lock; label: string; hint: string }[] = [
  { key: 'auto', label: '오토락', hint: '손잡이를 내리면 그 자리에 고정돼요. 바지 앞여밈처럼 저절로 열리면 안 되는 곳에.' },
  { key: 'non', label: '논락', hint: '고정 없이 부드럽게 움직여요. 자주 여닫는 주머니·가방에.' },
  { key: 'reverse', label: '양면', hint: '앞뒤 양쪽에 손잡이가 달려 안팎 어디서든 여닫을 수 있어요. 리버서블 아우터에.' },
]

export const USES: { key: string; label: string }[] = [
  { key: 'outer', label: '아우터·점퍼' },
  { key: 'bottom', label: '바지·스커트' },
  { key: 'dress', label: '원피스·블라우스' },
  { key: 'bag', label: '가방·잡화' },
  { key: 'etc', label: '기타' },
]

export const QTYS: { key: string; label: string }[] = [
  { key: 'sample', label: '샘플 (10개 이하)' },
  { key: 'small', label: '100개 미만' },
  { key: 'mid', label: '100–1,000개' },
  { key: 'large', label: '1,000개 이상' },
]

export const PULLS: { key: Pull; label: string; engravable: boolean }[] = [
  { key: 'tab', label: '기본', engravable: true },
  { key: 'plate', label: '로고판', engravable: true },
  { key: 'ring', label: '링', engravable: false },
  { key: 'cord', label: '끈', engravable: false },
]

export const TAPE_COLORS: { name: string; hex: string }[] = [
  { name: '인디고', hex: '#26367A' },
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

export const LEN_MIN = 5
export const LEN_MAX = 200
export const ENGRAVE_MAX = 10
export const PRINT_MAX = 12

export const DEFAULT_SPEC: Spec = {
  kind: 'metal',
  size: 5,
  form: 'close',
  len: 20,
  tape: '#26367A',
  teeth: 'gold',
  slider: 'gold',
  pull: 'tab',
  engrave: '',
  print: '',
  lock: 'auto',
  water: false,
  use: '',
  qty: '',
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

const isMetal = (v: string): v is MetalKey => METALS.some((m) => m.key === v)
const metal = (k: MetalKey) => METALS.find((m) => m.key === k)!

// 글자 칸: 줄바꿈·제어 문자를 없애고 길이를 자른다
const cleanText = (v: string, max: number) =>
  [...v.replace(/[\u0000-\u001f\u007f]+/g, ' ')].slice(0, max).join('')

// 종류에 맞지 않는 값은 그 종류의 기본값으로 바로잡는다(호수·형태·이 색)
export const fixSpec = (s: Spec): Spec => {
  const kind = KINDS.find((k) => k.key === s.kind)!
  const size = kind.sizes.includes(s.size) ? s.size : kind.sizes.includes(5) ? 5 : kind.sizes[0]
  const form = s.kind === 'conceal' ? 'close' : s.form
  const water = s.kind === 'coil' && s.water
  let teeth = s.teeth
  if (s.kind === 'metal' && !isMetal(teeth)) teeth = isMetal(s.slider) ? s.slider : 'gold'
  if (s.kind !== 'metal' && teeth !== 'same' && !normalizeHex(teeth)) teeth = 'same'
  return { ...s, size, form, teeth, water }
}

type Params = URLSearchParams | Record<string, string | string[] | undefined>

export const parseSpec = (params: Params): Spec => {
  const get = (k: string) => {
    const v = params instanceof URLSearchParams ? params.get(k) : params[k]
    return (Array.isArray(v) ? v[0] : v) ?? ''
  }
  const d = DEFAULT_SPEC
  const kind = (KINDS.find((k) => k.key === get('k'))?.key ?? d.kind) as Kind
  const len = Math.round(Number(get('l')))
  const teethRaw = get('e')
  const slider = get('sl')
  return fixSpec({
    kind,
    size: Number(get('s')) || d.size,
    form: (FORMS.find((f) => f.key === get('f'))?.key ?? d.form) as Form,
    len: Number.isFinite(len) && len >= LEN_MIN && len <= LEN_MAX ? len : d.len,
    tape: normalizeHex(get('t')) ?? d.tape,
    teeth: isMetal(teethRaw) || teethRaw === 'same' ? teethRaw : (normalizeHex(teethRaw) ?? (kind === 'metal' ? 'gold' : 'same')),
    slider: isMetal(slider) || slider === 'paint' ? slider : kind === 'metal' ? 'gold' : 'silver',
    pull: (PULLS.find((p) => p.key === get('p'))?.key ?? d.pull) as Pull,
    engrave: cleanText(get('en'), ENGRAVE_MAX),
    print: cleanText(get('pr'), PRINT_MAX),
    lock: (LOCKS.find((l) => l.key === get('lk'))?.key ?? d.lock) as Lock,
    water: get('w') === '1',
    use: USES.some((u) => u.key === get('u')) ? get('u') : '',
    qty: QTYS.some((q) => q.key === get('q')) ? get('q') : '',
  })
}

// 문의 폼으로 넘길 때 "디자이너를 거쳐 왔는지"는 k 가 있는지로 본다
export const hasSpec = (params: Params) =>
  params instanceof URLSearchParams ? params.has('k') : typeof params.k === 'string'

export const toQuery = (s: Spec) => {
  const q = new URLSearchParams({
    k: s.kind,
    s: String(s.size),
    f: s.form,
    l: String(s.len),
    t: s.tape.slice(1),
    e: s.teeth.replace(/^#/, ''),
    sl: s.slider,
    p: s.pull,
    lk: s.lock,
  })
  if (s.water) q.set('w', '1')
  if (s.use) q.set('u', s.use)
  if (s.qty) q.set('q', s.qty)
  if (s.engrave && PULLS.find((p) => p.key === s.pull)?.engravable) q.set('en', s.engrave)
  if (s.print) q.set('pr', s.print)
  return q.toString()
}

export const tapeName = (hex: string) => {
  const c = TAPE_COLORS.find((t) => t.hex === hex)
  return c ? `${c.name} (${hex})` : `직접 고른 색 (${hex})`
}

// 사양을 사람이 읽는 줄로 — 디자이너 요약, 문의 폼, 메일 본문에 쓴다
export const describeSpec = (s: Spec): { k: string; v: string }[] => {
  const kind = KINDS.find((k) => k.key === s.kind)!
  const pull = PULLS.find((p) => p.key === s.pull)!
  const teeth =
    s.kind === 'conceal' || s.water
      ? s.water
        ? '테이프 안쪽 (방수 코팅)'
        : '보이지 않음 (콘실)'
      : s.kind === 'metal'
        ? metal(s.teeth as MetalKey).name
        : s.teeth === 'same'
          ? '테이프와 같은 색'
          : tapeName(s.teeth)
  const rows = [
    { k: '종류', v: `${kind.label} 지퍼 ${s.size}호${s.water ? ' · 방수 코팅' : ''}` },
    { k: '형태', v: FORMS.find((f) => f.key === s.form)!.label },
    { k: '길이', v: `${s.len}cm` },
    { k: '테이프', v: tapeName(s.tape) },
    { k: '이', v: teeth },
    { k: '슬라이더', v: `${s.slider === 'paint' ? '테이프 색 도장' : metal(s.slider).name} · ${LOCKS.find((l) => l.key === s.lock)!.label}` },
    { k: '손잡이', v: pull.label + (pull.engravable && s.engrave ? ` · 각인 “${s.engrave}”` : '') },
  ]
  if (s.print) rows.push({ k: '테이프 인쇄', v: `“${s.print}”` })
  rows.push({ k: '용도', v: USES.find((u) => u.key === s.use)?.label ?? '미정' })
  rows.push({ k: '수량', v: QTYS.find((q) => q.key === s.qty)?.label ?? '미정' })
  return rows
}

// 미리보기 그림이 읽는 CSS 변수
export const specVars = (s: Spec): Record<string, string> => {
  const teethHex = s.kind === 'metal' || s.teeth === 'same' ? s.tape : s.teeth
  const teethStops = s.kind === 'metal' ? metal(s.teeth as MetalKey).stops : metal('gold').stops
  const k: readonly string[] =
    s.slider === 'paint'
      ? [
          `color-mix(in oklab, ${s.tape} 55%, #fff)`,
          s.tape,
          `color-mix(in oklab, ${s.tape} 72%, #000)`,
          `color-mix(in oklab, ${s.tape} 45%, #000)`,
        ]
      : metal(s.slider).stops
  const vars: Record<string, string> = { '--cfg-tape': s.tape, '--cfg-teeth': teethHex }
  teethStops.forEach((c, i) => (vars[`--cfg-s${i}`] = c))
  k.forEach((c, i) => (vars[`--cfg-k${i}`] = c))
  return vars
}

// 호수 → 미리보기 이·슬라이더 크기 배율
export const sizeScale = (size: number) => ({ 3: 0.74, 5: 1, 8: 1.28, 10: 1.48 })[size] ?? 1
