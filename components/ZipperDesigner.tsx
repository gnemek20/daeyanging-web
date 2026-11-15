'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import ColorSwatches, { type SwatchOption } from './ColorSwatches'
import ZipperOverview from './ZipperOverview'
import ZipperPlay from './ZipperPlay'
import { KIND_PHOTOS, PHOTO_QUALITY } from '@/lib/photos'
import {
  DEFAULT_SPEC,
  ENGRAVE_MAX,
  FORMS,
  KINDS,
  LEN_MAX,
  LEN_MIN,
  LOCKS,
  METALS,
  PRINT_MAX,
  PULLS,
  QTYS,
  TAPE_COLORS,
  USES,
  describeSpec,
  fixSpec,
  isLight,
  specVars,
  toQuery,
  type Spec,
} from '@/lib/zipperSpec'

// 맞춤 제작 설정: 문의할 때 정하는 사양을 여섯 묶음(지퍼 → 형태·길이 → 컬러 → 슬라이더·손잡이 → 테이프 인쇄 → 주문 정보)으로
// 직접 골라 보고, 고른 사양을 그대로 문의 폼으로 넘긴다. 사양은 주소에도 적어 두어 새로고침·공유해도 유지된다.

type SegOption<T> = { key: T; label: string; disabled?: boolean }

function Seg<T extends string | number>({
  name,
  label,
  value,
  options,
  onChange,
}: {
  name: string
  label: string
  value: T
  options: SegOption<T>[]
  onChange: (v: T) => void
}) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={String(o.key)} className="seg__btn" data-disabled={o.disabled ? '' : undefined}>
          <input
            type="radio"
            name={name}
            value={String(o.key)}
            checked={o.key === value}
            disabled={o.disabled}
            onChange={() => onChange(o.key)}
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}

const TAPE_OPTIONS: SwatchOption[] = TAPE_COLORS.map((c) => ({ key: c.hex, name: c.name, bg: c.hex }))
const METAL_OPTIONS: SwatchOption[] = METALS.map((m) => ({
  key: m.key,
  name: m.name,
  bg: `linear-gradient(160deg, ${m.stops[0]}, ${m.stops[1]} 45%, ${m.stops[2]} 80%, ${m.stops[3]})`,
  light: isLight(m.stops[1]),
}))

const Group = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <section className="cfg">
    <h2 className="cfg__h">
      <span className="cfg__n">{n}</span>
      {title}
    </h2>
    <div className="config__rows">{children}</div>
  </section>
)

const Row = ({ k, id, children, note }: { k: string; id?: string; children: React.ReactNode; note?: React.ReactNode }) => (
  <div className="config__row">
    <span className="config__k" id={id}>
      {k}
    </span>
    <div className="config__v">
      {children}
      {note && <div className="config__note">{note}</div>}
    </div>
  </div>
)

// 선택에 따라 바뀌는 설명: 모든 경우의 글을 한 칸에 겹쳐 두고 지금 것만 보인다.
// 칸 높이는 늘 가장 긴 글에 맞춰지므로, 골라도 아래 내용이 밀리지 않는다(레이아웃 이동 없음).
const Note = ({ texts, active }: { texts: Record<string, string>; active: string }) => (
  <span className="stack" aria-live="polite">
    {Object.entries(texts).map(([key, text]) => (
      <span key={key} className="stack__item" data-on={key === active ? '' : undefined} aria-hidden={key !== active}>
        {text}
      </span>
    ))}
  </span>
)

const FORM_NOTES = {
  ...Object.fromEntries(FORMS.map((f) => [f.key, f.hint])),
  conceal: '콘실 지퍼는 클로즈형으로 만들어요.',
}
const LOCK_NOTES = Object.fromEntries(LOCKS.map((l) => [l.key, l.hint]))
const WATER_NOTES = {
  coil: '방수 지퍼는 테이프를 코팅하고 코일을 안쪽에 두어 물이 잘 스며들지 않아요.',
  other: '방수 코팅은 나일론 지퍼에서 고를 수 있어요.',
}
const TEETH_NOTES = {
  none: '',
  conceal: '콘실 지퍼는 이가 봉제선 안쪽에 숨어 보이지 않아요.',
  water: '방수 지퍼는 이가 테이프 안쪽에 있어 겉에서 보이지 않아요.',
}
const ENGRAVE_NOTES = {
  yes: '브랜드 이름이나 로고 글자를 새겨 드려요.',
  no: '링·끈 손잡이에는 각인할 자리가 없어요.',
}

const ZipperDesigner = ({ initial }: { initial: Spec }) => {
  const [spec, setSpec] = useState(initial)
  const [lenText, setLenText] = useState(String(initial.len))
  const uid = useId()
  const set = (patch: Partial<Spec>) => setSpec((s) => fixSpec({ ...s, ...patch }))
  const query = toQuery(spec)

  // 주소에 지금 사양을 적어 둔다(방문 기록은 늘리지 않음)
  useEffect(() => {
    window.history.replaceState(null, '', `?${query}`)
  }, [query])

  const kind = KINDS.find((k) => k.key === spec.kind)!
  const pull = PULLS.find((p) => p.key === spec.pull)!
  const photo = KIND_PHOTOS[spec.water ? 'water' : spec.kind]
  // 이 컬러 고르는 방식: 메탈은 금속 색, 비슬론·나일론은 테이프와 같게/다른 색, 콘실·방수는 고를 것 없음
  const teethMode = spec.kind === 'metal' ? 'metal' : spec.kind === 'conceal' || spec.water ? 'none' : 'color'

  const commitLen = (raw: string) => {
    const n = Math.round(Number(raw))
    const len = Number.isFinite(n) && raw.trim() !== '' ? Math.min(LEN_MAX, Math.max(LEN_MIN, n)) : spec.len
    set({ len })
    setLenText(String(len))
  }

  const reset = () => {
    setSpec(DEFAULT_SPEC)
    setLenText(String(DEFAULT_SPEC.len))
  }

  return (
    <div className="designer" style={specVars(spec) as React.CSSProperties}>
      <div className="designer__stage">
        <div className="designer__macro">
          <ZipperPlay
            kind={spec.kind}
            size={spec.size}
            pull={spec.pull}
            engrave={pull.engravable ? spec.engrave : ''}
            print={spec.print}
            water={spec.water}
          />
        </div>
        <div className="designer__overview">
          <ZipperOverview spec={spec} />
        </div>
      </div>

      <div className="designer__panel">
        <Group n="01" title="지퍼">
          <Row k="종류">
            <Seg
              name={`${uid}-kind`}
              label="지퍼 종류"
              value={spec.kind}
              options={KINDS.map((k) => ({ key: k.key, label: k.label }))}
              onChange={(v) => set({ kind: v })}
            />
          </Row>
          <Row k="호수" note="숫자가 클수록 이가 굵고 튼튼해요. 3호는 원피스·파우치, 5호는 바지·가방, 8호 이상은 아우터에 많이 써요.">
            <Seg
              name={`${uid}-size`}
              label="호수"
              value={spec.size}
              options={kind.sizes.map((n) => ({ key: n, label: `${n}호` }))}
              onChange={(v) => set({ size: v })}
            />
          </Row>
          {/* 나일론에서만 고르지만 줄은 늘 둔다(종류를 바꿀 때 아래가 밀리지 않게) */}
          <Row k="기능" note={<Note texts={WATER_NOTES} active={spec.kind === 'coil' ? 'coil' : 'other'} />}>
            <Seg
              name={`${uid}-water`}
              label="기능"
              value={spec.water ? 'water' : 'std'}
              options={[
                { key: 'std', label: '일반', disabled: spec.kind !== 'coil' },
                { key: 'water', label: '방수 코팅', disabled: spec.kind !== 'coil' },
              ]}
              onChange={(v) => set({ water: v === 'water' })}
            />
          </Row>
          <figure className="designer__photo">
            <Image
              src={photo.src}
              alt={photo.alt}
              sizes="(max-width: 900px) 100vw, 40vw"
              quality={PHOTO_QUALITY}
              placeholder="blur"
            />
            <figcaption>실제 제품 예시 · {spec.water ? '방수' : kind.label} 지퍼</figcaption>
          </figure>
        </Group>

        <Group n="02" title="형태와 길이">
          <Row k="형태" note={<Note texts={FORM_NOTES} active={spec.kind === 'conceal' ? 'conceal' : spec.form} />}>
            <Seg
              name={`${uid}-form`}
              label="형태"
              value={spec.form}
              options={FORMS.map((f) => ({ key: f.key, label: f.label, disabled: spec.kind === 'conceal' && f.key !== 'close' }))}
              onChange={(v) => set({ form: v })}
            />
          </Row>
          <Row k="길이" id={`${uid}-len`} note={`${LEN_MIN}–${LEN_MAX}cm. 슬라이더 위쪽부터 아래 끝까지 잰 길이예요.`}>
            <label className="tfield tfield--num">
              <input
                value={lenText}
                inputMode="numeric"
                maxLength={3}
                autoComplete="off"
                aria-labelledby={`${uid}-len`}
                onChange={(e) => setLenText(e.currentTarget.value.replace(/\D/g, '').slice(0, 3))}
                onBlur={(e) => commitLen(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && commitLen(e.currentTarget.value)}
              />
              <span className="tfield__unit" aria-hidden="true">
                cm
              </span>
            </label>
          </Row>
        </Group>

        <Group n="03" title="컬러">
          <Row k="테이프">
            <ColorSwatches
              name={`${uid}-tape`}
              label="테이프 컬러"
              value={spec.tape}
              options={TAPE_OPTIONS}
              onChange={(v) => set({ tape: v })}
              custom
            />
          </Row>
          {/* 종류마다 고르는 칸이 다르지만, 모든 경우를 한 칸에 겹쳐 두어 높이가 늘 같다.
              안 보이는 쪽은 inert 라서 눌리거나 포커스되지 않는다. */}
          <Row
            k="이"
            note={<Note texts={TEETH_NOTES} active={spec.kind === 'conceal' ? 'conceal' : spec.water ? 'water' : 'none'} />}
          >
            <div className="stack">
              <div className="stack__item" data-on={teethMode === 'metal' ? '' : undefined} inert={teethMode !== 'metal'}>
                <ColorSwatches
                  name={`${uid}-teeth-metal`}
                  label="이 컬러"
                  value={spec.teeth}
                  options={METAL_OPTIONS}
                  onChange={(v) => set({ teeth: v })}
                />
              </div>
              {/* 비슬론·나일론: 맨 앞 견본이 "테이프와 같은 색", 나머지는 다른 색. 메탈과 같은 한 줄 높이 */}
              <div className="stack__item" data-on={teethMode === 'color' ? '' : undefined} inert={teethMode !== 'color'}>
                <ColorSwatches
                  name={`${uid}-teeth-color`}
                  label="이 컬러"
                  value={spec.teeth}
                  options={[{ key: 'same', name: '테이프와 같은 색', bg: spec.tape, same: true }, ...TAPE_OPTIONS]}
                  onChange={(v) => set({ teeth: v })}
                  custom
                />
              </div>
            </div>
          </Row>
          <Row k="슬라이더 마감">
            <ColorSwatches
              name={`${uid}-slider`}
              label="슬라이더 마감"
              value={spec.slider}
              options={[...METAL_OPTIONS, { key: 'paint', name: '테이프 색 도장', bg: spec.tape }]}
              onChange={(v) => set({ slider: v as Spec['slider'] })}
            />
          </Row>
        </Group>

        <Group n="04" title="슬라이더와 손잡이">
          <Row k="슬라이더 방식" note={<Note texts={LOCK_NOTES} active={spec.lock} />}>
            <Seg
              name={`${uid}-lock`}
              label="슬라이더 방식"
              value={spec.lock}
              options={LOCKS.map((l) => ({ key: l.key, label: l.label }))}
              onChange={(v) => set({ lock: v })}
            />
          </Row>
          <Row k="손잡이 모양">
            <Seg
              name={`${uid}-pull`}
              label="손잡이 모양"
              value={spec.pull}
              options={PULLS.map((p) => ({ key: p.key, label: p.label }))}
              onChange={(v) => set({ pull: v })}
            />
          </Row>
          <Row
            k="손잡이 각인"
            id={`${uid}-engrave`}
            note={<Note texts={ENGRAVE_NOTES} active={pull.engravable ? 'yes' : 'no'} />}
          >
            <label className="tfield">
              <input
                value={spec.engrave}
                maxLength={ENGRAVE_MAX}
                placeholder="예: BRAND"
                disabled={!pull.engravable}
                autoComplete="off"
                spellCheck={false}
                aria-labelledby={`${uid}-engrave`}
                onChange={(e) => set({ engrave: e.currentTarget.value.slice(0, ENGRAVE_MAX) })}
              />
            </label>
          </Row>
        </Group>

        <Group n="05" title="테이프 인쇄">
          <Row
            k="인쇄 문구"
            id={`${uid}-print`}
            note="브랜드 이름이나 문구를 테이프에 넣어요. 지퍼를 닫으면 위아래 글자가 하나로 이어져요."
          >
            <label className="tfield">
              <input
                value={spec.print}
                maxLength={PRINT_MAX}
                placeholder="예: YOUR BRAND"
                autoComplete="off"
                spellCheck={false}
                aria-labelledby={`${uid}-print`}
                onChange={(e) => set({ print: e.currentTarget.value.slice(0, PRINT_MAX) })}
              />
            </label>
          </Row>
        </Group>

        <Group n="06" title="주문 정보">
          <Row k="용도">
            <Seg
              name={`${uid}-use`}
              label="용도"
              value={spec.use}
              options={[...USES.map((u) => ({ key: u.key, label: u.label })), { key: '', label: '미정' }]}
              onChange={(v) => set({ use: v })}
            />
          </Row>
          <Row k="수량">
            <Seg
              name={`${uid}-qty`}
              label="수량"
              value={spec.qty}
              options={[...QTYS.map((q) => ({ key: q.key, label: q.label })), { key: '', label: '미정' }]}
              onChange={(v) => set({ qty: v })}
            />
          </Row>
        </Group>

        <div className="designer__summary">
          <h2 className="designer__summary-h">고른 사양</h2>
          <dl className="spec">
            {describeSpec(spec).map((r) => (
              <div key={r.k}>
                <dt>{r.k}</dt>
                <dd>{r.v}</dd>
              </div>
            ))}
          </dl>
          <div className="designer__actions">
            <Link className="btn btn--ink" href={`/contact?${query}`}>
              이 사양으로 문의하기
            </Link>
            <button type="button" className="btn btn--line" onClick={reset}>
              처음 상태로
            </button>
          </div>
          <p className="designer__fine">
            <span className="ph">화면의 색은 모니터마다 다르게 보일 수 있어요.</span>{' '}
            <span className="ph">정확한 색은 원단·컬러칩·샘플로 맞춰 드립니다.</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ZipperDesigner
