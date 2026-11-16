// 맞춤 제작 섹션(.custom)의 "직접 고른 컬러"를 한곳에서 바꾼다.
// 색상 선택기(TapePicker)와 HEX·RGB 입력(TapeCode)이 모두 이 함수를 써서 서로 값이 맞춰진다.

export type Rgb = [number, number, number]

// '#abc' · 'abc' · '#AABBCC' · 'aabbcc' → '#AABBCC' (형식이 틀리면 null)
export const normalizeHex = (raw: string): string | null => {
  const s = raw.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(s)) return ('#' + [...s].map((c) => c + c).join('')).toUpperCase()
  if (/^[0-9a-f]{6}$/i.test(s)) return ('#' + s).toUpperCase()
  return null
}

export const hexToRgb = (hex: string): Rgb => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export const rgbToHex = ([r, g, b]: Rgb): string =>
  '#' +
  [r, g, b]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()

// HEX·RGB 입력 칸에 현재 색을 보여 준다. skip 은 지금 사용자가 입력 중인 칸(덮어쓰지 않음).
export const showCode = (root: HTMLElement, hex: string, skip?: Element | null) => {
  const set = (sel: string, v: string) => {
    const el = root.querySelector<HTMLInputElement>(sel)
    if (el && el !== skip) el.value = v
  }
  set('[data-code="hex"]', hex.slice(1))
  hexToRgb(hex).forEach((v, i) => set(`[data-code="${'rgb'[i]}"]`, String(v)))
}

// 직접 고른 컬러로 바꾸고 선택 상태·미리보기·안내 문구·입력 칸을 모두 맞춘다.
export const applyPick = (root: HTMLElement, hex: string, from?: Element | null) => {
  root.style.setProperty('--cfg-pick', hex)
  root.toggleAttribute('data-picked', true)
  const radio = root.querySelector<HTMLInputElement>('input[name="tape"][value="custom"]')
  if (radio) radio.checked = true
  const color = root.querySelector<HTMLInputElement>('.swatch__color')
  if (color && color !== from) color.value = hex.toLowerCase()
  const tag = root.querySelector('[data-tag-hex]')
  if (tag) tag.textContent = hex
  showCode(root, hex, from)
}
