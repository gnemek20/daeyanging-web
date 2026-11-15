'use client'

import { useState } from 'react'
import { isLight } from '@/lib/zipperSpec'

// 컬러 고르기 줄: 동그란 견본 + (선택) 맨 끝의 "직접 고르기".
// 고른 견본에는 체크 표시만 올린다(검은 테두리 없음). 직접 고르기는 브라우저 기본 색상 선택기를 열고,
// 컬러 코드(HEX·RGB)와 스포이드는 그 선택기 안에서만 보인다.

// same: "테이프와 같은 색" 견본(테이프 색 위에 흰 안쪽 테로 구별)
export type SwatchOption = { key: string; name: string; bg: string; light?: boolean; same?: boolean }

type Props = {
  name: string
  label: string
  value: string // 고른 견본의 key, 직접 고른 색이면 그 '#RRGGBB'
  options: SwatchOption[]
  onChange: (key: string) => void
  custom?: boolean // 직접 고르기 견본을 둘지
}

const PICK_DEFAULT = '#7B4FD6'

const ColorSwatches = ({ name, label, value, options, onChange, custom = false }: Props) => {
  const preset = options.find((o) => o.key === value)
  const picked = !preset && /^#[0-9A-F]{6}$/i.test(value) ? value.toUpperCase() : null
  // 직접 고른 색을 잠시 다른 견본으로 바꿨다가 돌아와도 그 색이 남아 있게
  const [last, setLast] = useState(picked ?? PICK_DEFAULT)
  const pickHex = picked ?? last

  const pick = (hex: string) => {
    const h = hex.toUpperCase()
    setLast(h)
    onChange(h)
  }

  return (
    <div className="swatches">
      <div className="swatches__row" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <label
            key={o.key}
            className={o.same ? 'swatch swatch--same' : 'swatch'}
            style={{ background: o.bg }}
            data-light={o.light ?? (o.bg.startsWith('#') && isLight(o.bg)) ? '' : undefined}
            title={o.name}
          >
            <input type="radio" name={name} value={o.key} checked={o.key === value} onChange={() => onChange(o.key)} />
            <span className="sr-only">{o.name}</span>
          </label>
        ))}
        {custom && (
          <label
            className="swatch swatch--pick"
            title="컬러 직접 고르기"
            style={{ '--pick': pickHex } as React.CSSProperties}
            data-light={isLight(pickHex) ? '' : undefined}
            data-picked={picked ? '' : undefined}
          >
            <input type="radio" name={name} value="custom" checked={!!picked} onChange={() => pick(pickHex)} tabIndex={-1} aria-hidden="true" />
            <input
              type="color"
              className="swatch__color"
              value={pickHex.toLowerCase()}
              aria-label={`${label}: 직접 고르기`}
              onClick={(e) => pick(e.currentTarget.value)}
              onChange={(e) => pick(e.currentTarget.value)}
            />
          </label>
        )}
      </div>
      <span className="swatches__name" aria-live="polite">
        {preset ? preset.name : picked ? `직접 고른 색 ${picked}` : ''}
      </span>
    </div>
  )
}

export default ColorSwatches
