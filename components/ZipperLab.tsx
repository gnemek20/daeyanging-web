'use client'

import { useEffect, useRef, useState } from 'react'
import ZipperOverview from './ZipperOverview'
import ZipperPlay from './ZipperPlay'
import { DEFAULT_SPEC, FORMS, KINDS, LOCKS, METALS, PULLS, TAPE_COLORS, fixSpec, isLight, specVars, type Spec } from '@/lib/zipperSpec'

// 가이드 맨 위 "직접 골라 보기": 설정을 바꾸면 위(가까이)와 아래(전체 모양) 그림이 바로 바뀐다.
// 주문용이 아니라 이해를 돕는 보충 자료다(고른 값은 어디로도 보내지 않는다).
// 짧은 선택지는 전환 버튼, 그림으로 봐야 이해되는 선택지(형태·마감·손잡이)는 3열 선택 상자.
// 맨 아래 한 줄에 방금 바꾼 항목의 뜻을 보여 준다.

type Key = 'kind' | 'size' | 'form' | 'tape' | 'finish' | 'lock' | 'pull'

const KIND_NOTE: Record<Spec['kind'], string> = {
  metal: '금속 이. 단단하고 고급스러운 마감. 청바지, 재킷, 가방',
  vislon: '수지(플라스틱) 이. 가볍고 컬러가 자유로움. 아우터, 패딩',
  coil: '나일론 코일 이. 부드럽고 유연함. 주머니, 파우치, 아웃도어',
  conceal: '이가 안쪽에 숨는 지퍼. 겉에서 보이지 않음. 스커트, 원피스',
}
const SIZE_NOTE: Record<number, string> = {
  3: '가늘고 가벼움. 스커트, 원피스, 파우치',
  5: '가장 많이 쓰는 굵기. 바지, 재킷, 가방',
  8: '굵고 튼튼함. 아우터, 패딩, 큰 가방',
  10: '가장 굵음. 대형 가방, 텐트, 작업복',
}
const FORM_NOTE: Record<Spec['form'], string> = {
  close: '아래 고정, 분리 안 됨',
  open: '아래 완전 분리',
  twoway: '슬라이더 2개, 아래 분리',
  twoclose: '슬라이더 2개, 양 끝 고정',
}
const LOCK_NOTE: Record<Spec['lock'], string> = {
  auto: '손잡이를 내리면 고정. 바지 앞여밈',
  non: '고정 없이 부드럽게 이동. 주머니, 가방',
  reverse: '앞뒤 양면 손잡이. 리버서블 의류',
}
const PULL_NOTE: Record<Spec['pull'], string> = {
  tab: '가장 흔한 막대형. 로고 각인 가능',
  plate: '넓은 판형. 브랜드 로고 각인에 적합',
  ring: '고리형. 장갑을 낀 채로도 잡기 쉬움',
  cord: '끈 손잡이. 아웃도어, 가방',
}

// 형태 아이콘: 왼쪽이 아래 끝(멈춤쇠 또는 박스·핀), 오른쪽이 위. 슬라이더 개수까지
const FormIcon = ({ form }: { form: Spec['form'] }) => {
  const open = form === 'open' || form === 'twoway'
  const two = form === 'twoway' || form === 'twoclose'
  return (
    <svg viewBox="0 0 72 28" width="72" height="28" aria-hidden="true" className="lab__icon">
      <rect x="6" y="8" width="62" height="12" rx="1.5" className="lab__icon-tape" />
      <path d="M10 14H64" strokeDasharray="1.6 1.6" className="lab__icon-teeth" />
      {open ? (
        <>
          <rect x="1" y="7.5" width="9" height="6" rx="1" className="lab__icon-metal" />
          <rect x="1" y="14.5" width="9" height="6" rx="1" className="lab__icon-metal" />
        </>
      ) : (
        <rect x="6" y="7" width="4" height="14" rx="1" className="lab__icon-metal" />
      )}
      <rect x="64" y="9" width="3" height="10" rx="1" className="lab__icon-metal" />
      <path d="M50 8.5h7l3 5.5-3 5.5h-7z" className="lab__icon-metal" />
      {two && <path d="M22 8.5h-7l-3 5.5 3 5.5h7z" className="lab__icon-metal" />}
    </svg>
  )
}

const PullIcon = ({ pull }: { pull: Spec['pull'] }) => (
  <svg viewBox="0 0 32 40" width="26" height="32" aria-hidden="true" className="lab__icon">
    <rect x="8" y="2" width="16" height="9" rx="3" className="lab__icon-metal" />
    {pull === 'tab' && <rect x="12.5" y="9" width="7" height="26" rx="3.5" className="lab__icon-metal" />}
    {pull === 'plate' && <rect x="9" y="11" width="14" height="25" rx="2" className="lab__icon-metal" />}
    {pull === 'ring' && (
      <>
        <rect x="14" y="9" width="4" height="6" rx="2" className="lab__icon-metal" />
        <circle cx="16" cy="25" r="9" fill="none" strokeWidth="3.4" className="lab__icon-ring" />
      </>
    )}
    {pull === 'cord' && (
      <>
        <path d="M14 10c-2 9-2 18 1 26M18 10c2 9 2 18-1 26" fill="none" strokeWidth="2" className="lab__icon-ring" />
        <rect x="12" y="22" width="8" height="8" rx="3" className="lab__icon-metal" />
      </>
    )}
  </svg>
)

const metalBg = (stops: readonly string[]) => `linear-gradient(150deg, ${stops[0]}, ${stops[1]} 45%, ${stops[2]} 80%, ${stops[3]})`

// 전환 버튼(같은 폭으로 나눈 한 줄)
function Seg<T extends string | number>({
  name,
  label,
  items,
  value,
  onPick,
}: {
  name: string
  label: string
  items: { value: T; label: string; disabled?: boolean }[]
  value: T
  onPick: (v: T) => void
}) {
  return (
    <div className="seg2" role="radiogroup" aria-label={label}>
      {items.map((it) => (
        <label key={it.value} className="seg2__btn" data-disabled={it.disabled || undefined}>
          <input type="radio" name={name} checked={value === it.value} disabled={it.disabled} onChange={() => onPick(it.value)} />
          {it.label}
        </label>
      ))}
    </div>
  )
}

// 3열 선택 상자: 누르면 아래로 열리고, 바깥을 누르거나 Esc 로 닫힌다
function Picker<T extends string>({
  label,
  items,
  value,
  onPick,
}: {
  label: string
  items: { value: T; label: string; icon: React.ReactNode; hint?: string; disabled?: boolean }[]
  value: T
  onPick: (v: T) => void
}) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const cur = items.find((i) => i.value === value) ?? items[0]

  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !box.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div className="pick" ref={box} data-open={open || undefined}>
      <button type="button" className="pick__btn" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((o) => !o)}>
        <span className="pick__cur">
          {cur.icon}
          {cur.label}
        </span>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="pick__chev">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
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
              <span className="pick__icon">{it.icon}</span>
              <span className="pick__name">{it.label}</span>
              {it.hint && <span className="pick__hint">{it.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="lab__row">
    <span className="lab__k">{label}</span>
    <div className="lab__v">{children}</div>
  </div>
)

const ZipperLab = () => {
  const [spec, setSpec] = useState<Spec>({ ...DEFAULT_SPEC, len: 60 })
  const [last, setLast] = useState<Key>('kind')
  const set = (key: Key, patch: Partial<Spec>) => {
    setSpec((s) => fixSpec({ ...s, ...patch }))
    setLast(key)
  }
  const kind = KINDS.find((k) => k.key === spec.kind)!
  const finish = spec.slider === 'paint' ? 'gold' : spec.slider
  const picked = !TAPE_COLORS.some((c) => c.hex === spec.tape)
  const metal = METALS.find((m) => m.key === finish)!

  const caption: Record<Key, [string, string]> = {
    kind: [`${kind.label} 지퍼`, KIND_NOTE[spec.kind]],
    size: [`${spec.size}호`, SIZE_NOTE[spec.size]],
    form: [FORMS.find((f) => f.key === spec.form)!.label, FORM_NOTE[spec.form]],
    tape: [TAPE_COLORS.find((c) => c.hex === spec.tape)?.name ?? '직접 선택', '원단 샘플, 컬러칩, 팬톤 번호로 정확히 맞춤'],
    finish: [metal.name, spec.kind === 'metal' ? '이와 슬라이더를 같은 금속 컬러로' : '이는 테이프 컬러, 슬라이더만 금속 컬러로'],
    lock: [LOCKS.find((l) => l.key === spec.lock)!.label, LOCK_NOTE[spec.lock]],
    pull: [PULLS.find((p) => p.key === spec.pull)!.label + ' 손잡이', PULL_NOTE[spec.pull]],
  }
  const [capK, capV] = caption[last]

  return (
    <div className="lab" style={specVars(spec) as React.CSSProperties}>
      <div className="lab__view">
        <div className="lab__play">
          <ZipperPlay kind={spec.kind} size={spec.size} />
        </div>
        <div className="lab__whole">
          <ZipperOverview spec={spec} idp="lab" dims="callout" />
        </div>
      </div>

      <div className="lab__panel">
        <Row label="종류">
          <Seg
            name="lab-kind"
            label="종류"
            items={KINDS.map((k) => ({ value: k.key, label: k.label }))}
            value={spec.kind}
            onPick={(v) => set('kind', { kind: v, teeth: v === 'metal' ? finish : 'same', slider: finish })}
          />
        </Row>
        <Row label="호수">
          <Seg
            name="lab-size"
            label="호수"
            items={[3, 5, 8, 10].map((n) => ({ value: n, label: `${n}호`, disabled: !kind.sizes.includes(n) }))}
            value={spec.size}
            onPick={(v) => set('size', { size: v })}
          />
        </Row>
        <Row label="형태">
          <Picker
            label="형태"
            items={FORMS.map((f) => ({
              value: f.key,
              label: f.label,
              hint: FORM_NOTE[f.key],
              icon: <FormIcon form={f.key} />,
              disabled: spec.kind === 'conceal' && f.key !== 'close',
            }))}
            value={spec.form}
            onPick={(v) => set('form', { form: v })}
          />
        </Row>
        <Row label="컬러">
          <div className="swatches lab__swatches" role="radiogroup" aria-label="테이프 컬러">
            {TAPE_COLORS.map((c) => (
              <label key={c.hex} className="swatch" style={{ background: c.hex }} title={c.name} data-light={isLight(c.hex) || undefined}>
                <input type="radio" name="lab-tape" checked={spec.tape === c.hex} onChange={() => set('tape', { tape: c.hex })} />
                <span className="sr-only">{c.name}</span>
              </label>
            ))}
            <label className="swatch swatch--pick" title="컬러 직접 선택" data-picked={picked || undefined}>
              <input
                type="color"
                className="swatch__color"
                value={(picked ? spec.tape : '#7B4FD6').toLowerCase()}
                aria-label="컬러 직접 선택"
                onChange={(e) => set('tape', { tape: e.currentTarget.value.toUpperCase() })}
              />
            </label>
          </div>
        </Row>
        <Row label="마감">
          <Picker
            label="마감"
            items={METALS.map((m) => ({ value: m.key, label: m.name, icon: <span className="pick__metal" style={{ background: metalBg(m.stops) }} /> }))}
            value={finish}
            onPick={(v) => set('finish', { slider: v, teeth: spec.kind === 'metal' ? v : spec.teeth })}
          />
        </Row>
        <Row label="슬라이더">
          <Seg
            name="lab-lock"
            label="슬라이더"
            items={LOCKS.map((l) => ({ value: l.key, label: l.label }))}
            value={spec.lock}
            onPick={(v) => set('lock', { lock: v })}
          />
        </Row>
        <Row label="손잡이">
          <Picker
            label="손잡이"
            items={PULLS.map((p) => ({ value: p.key, label: p.label, hint: PULL_NOTE[p.key], icon: <PullIcon pull={p.key} /> }))}
            value={spec.pull}
            onPick={(v) => set('pull', { pull: v })}
          />
        </Row>

        <p className="lab__cap" aria-live="polite">
          <strong>{capK}</strong>
          <span>{capV}</span>
        </p>
      </div>
    </div>
  )
}

export default ZipperLab
