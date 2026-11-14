'use client'

import { applyPick, normalizeHex, rgbToHex, showCode, type Rgb } from './tapeColor'

// 컬러 코드 입력 줄: HEX 한 칸과 R·G·B 세 칸.
// 팔레트에서 색을 고르면 그 색의 코드를 보여 주고, 코드를 입력하면 "직접 고른 컬러"로 바뀐다.
// 값은 DOM 에 직접 쓴다(TapePicker 와 같은 방식, 렌더링 다시 하지 않음).
const TapeCode = ({ initial }: { initial: string }) => {
  // 팔레트 라디오가 바뀌면(기본 컬러 선택) 그 색 코드를 칸에 보여 준다.
  const watch = (el: HTMLDivElement | null) => {
    const root = el?.closest<HTMLElement>('.custom')
    if (!root) return
    const onChange = (e: Event) => {
      const t = e.target as HTMLInputElement
      if (t.name !== 'tape') return
      const hex = t.value === 'custom' ? root.style.getPropertyValue('--cfg-pick') || t.dataset.hex : t.dataset.hex
      if (hex) showCode(root, hex)
    }
    root.addEventListener('change', onChange)
    return () => root.removeEventListener('change', onChange)
  }

  const onHex = (input: HTMLInputElement) => {
    const clean = input.value.replace(/[^0-9a-f]/gi, '').slice(0, 6)
    if (clean !== input.value) input.value = clean
    const hex = clean.length === 3 || clean.length === 6 ? normalizeHex(clean) : null
    const root = input.closest<HTMLElement>('.custom')
    if (hex && root) applyPick(root, hex, input)
  }

  const onRgb = (input: HTMLInputElement) => {
    const clean = input.value.replace(/\D/g, '').slice(0, 3)
    if (clean !== input.value) input.value = clean
    const root = input.closest<HTMLElement>('.custom')
    if (!root) return
    const vals = (['r', 'g', 'b'] as const).map(
      (k) => root.querySelector<HTMLInputElement>(`[data-code="${k}"]`)?.value ?? '',
    )
    if (vals.some((v) => v === '' || Number(v) > 255)) return
    applyPick(root, rgbToHex(vals.map(Number) as Rgb), input)
  }

  // 칸을 벗어나면 틀린 값은 지금 색으로 되돌리고, 맞는 값은 표준 형태로 정리한다.
  const onBlur = (input: HTMLInputElement) => {
    const root = input.closest<HTMLElement>('.custom')
    if (!root) return
    const rgb = (['r', 'g', 'b'] as const).map((k) =>
      Number(root.querySelector<HTMLInputElement>(`[data-code="${k}"]`)?.value),
    )
    const current =
      input.dataset.code === 'hex'
        ? normalizeHex(input.value)
        : rgb.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)
          ? rgbToHex(rgb as Rgb)
          : null
    const checked = root.querySelector<HTMLInputElement>('input[name="tape"]:checked')
    const fallback =
      (checked?.value === 'custom' ? root.style.getPropertyValue('--cfg-pick') : checked?.dataset.hex) || initial
    showCode(root, current ?? fallback)
  }

  const [r, g, b] = [1, 3, 5].map((i) => parseInt(initial.slice(i, i + 2), 16))
  const field = (code: 'r' | 'g' | 'b', label: string, value: number) => (
    <label className="code__field code__field--rgb">
      <span className="code__pre" aria-hidden="true">
        {code.toUpperCase()}
      </span>
      <input
        data-code={code}
        defaultValue={value}
        inputMode="numeric"
        maxLength={3}
        autoComplete="off"
        aria-label={`${label} 값 (0–255)`}
        onInput={(e) => onRgb(e.currentTarget)}
        onBlur={(e) => onBlur(e.currentTarget)}
      />
    </label>
  )

  return (
    <div className="config__v code" ref={watch}>
      <label className="code__field code__field--hex">
        <span className="code__pre" aria-hidden="true">
          #
        </span>
        <input
          data-code="hex"
          defaultValue={initial.slice(1)}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="characters"
          aria-label="HEX 컬러 코드"
          onInput={(e) => onHex(e.currentTarget)}
          onBlur={(e) => onBlur(e.currentTarget)}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
      </label>
      <div className="code__rgb" role="group" aria-label="RGB 컬러 값">
        {field('r', '빨강(R)', r)}
        {field('g', '초록(G)', g)}
        {field('b', '파랑(B)', b)}
      </div>
    </div>
  )
}

export default TapeCode
