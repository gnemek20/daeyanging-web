'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// 3열 선택 상자: 단추를 누르면 미리보기(사진·색)와 이름이 3열로 펼쳐지고, 고르면 닫힌다.
// 바깥을 누르거나 Esc 로 닫는다. 가이드 "직접 골라 보기"와 상담 문의 양식이 같이 쓴다.
// value 가 '' 이면 아직 고르지 않은 상태(placeholder 를 보여 준다).
export type PickItem<T extends string> = { value: T; label: string; icon?: React.ReactNode; hint?: string; disabled?: boolean }

// 펼친 동안 바깥을 누르거나 Esc 를 누르면 닫는다
function useDismiss(open: boolean, close: () => void, box: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!open) return
    const onEv = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !box.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', onEv)
    document.addEventListener('keydown', onEv)
    return () => {
      document.removeEventListener('pointerdown', onEv)
      document.removeEventListener('keydown', onEv)
    }
  }, [open, close, box])
}

const Chev = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="pick__chev">
    <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// 여러 설정을 한 상자에 담는 선택 상자(예: 종류 + 컬러). 안에서 골라도 닫히지 않고, 바깥·Esc 로 닫는다.
export function PopBox({ label, summary, children, className }: { label: string; summary: React.ReactNode; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, close, box)
  return (
    <div className={`pick pop${className ? ` ${className}` : ''}`} ref={box} data-open={open || undefined}>
      <button type="button" className="pick__btn" aria-expanded={open} aria-label={`${label} 설정`} onClick={() => setOpen((o) => !o)}>
        <span className="pick__cur">{summary}</span>
        <Chev />
      </button>
      {open && (
        <div className="pick__panel pop__panel" role="group" aria-label={label}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function Picker<T extends string>({
  label,
  items,
  value,
  onPick,
  placeholder = '선택',
  className,
}: {
  label: string
  items: PickItem<T>[]
  value: T | ''
  onPick: (v: T) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const cur = items.find((i) => i.value === value)

  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, close, box)

  return (
    <div className={`pick${className ? ` ${className}` : ''}`} ref={box} data-open={open || undefined}>
      <button
        type="button"
        className="pick__btn"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${label}: ${cur?.label ?? placeholder}`}
        data-empty={!cur || undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="pick__cur">
          {cur?.icon}
          {cur?.label ?? placeholder}
        </span>
        <Chev />
      </button>
      {open && (
        <div className="pick__panel" role="listbox" aria-label={label}>
          {items.map((it) => (
            <button
              key={it.value}
              type="button"
              role="option"
              aria-selected={it.value === value}
              disabled={it.disabled}
              className="pick__opt"
              onClick={() => {
                onPick(it.value)
                setOpen(false)
              }}
            >
              {it.icon && <span className="pick__icon">{it.icon}</span>}
              <span className="pick__name">{it.label}</span>
              {it.hint && <span className="pick__hint">{it.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
