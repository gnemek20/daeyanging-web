'use client'

import { useState } from 'react'
import { PopBox } from './Picker'
import ZipperPlay from './ZipperPlay'
import { DEFAULT_SPEC, KINDS, METALS, PULLS, TAPE_COLORS, fixSpec, isLight, specVars, type Spec } from '@/lib/zipperSpec'

// 가이드 맨 위 "직접 골라 보기": 상담 문의 양식처럼 종류 · 슬라이더 두 가지만 고른다.
//   종류 상자: 지퍼 종류 4가지 + 컬러(테이프) / 슬라이더 상자: 손잡이 6가지 + 컬러(도금 또는 원하는 색)
// 고르면 사진으로 만든 지퍼가 바로 바뀐다. 주문용이 아니라 이해를 돕는 보충 자료다(고른 값은 어디로도 보내지 않는다).

const metalBg = (stops: readonly string[]) => `linear-gradient(150deg, ${stops[0]}, ${stops[1]} 45%, ${stops[2]} 80%, ${stops[3]})`

// 미리 줄여 둔 작은 WebP 썸네일(종류: 이 부분 확대 사진, 손잡이: slider.png 에서 자른 사진)
/* eslint-disable @next/next/no-img-element */
const KindIcon = ({ kind }: { kind: Spec['kind'] }) => (
  <img src={`/zipper/kind-${kind}-icon.webp`} alt="" className="pick__photo pick__photo--kind" loading="lazy" decoding="async" />
)
const PullIcon = ({ pull }: { pull: Spec['pull'] }) => (
  <img src={`/zipper/pull-${pull}-gold.webp`} alt="" className="pick__photo" loading="lazy" decoding="async" />
)
/* eslint-enable @next/next/no-img-element */

type Swatch = { value: string; name: string; bg: string; light?: boolean }

// 컬러 고르기: 자주 쓰는 컬러 + 원하는 컬러 직접 선택(무엇이든)
const Swatches = ({
  name,
  label,
  items,
  value,
  onPick,
}: {
  name: string
  label: string
  items: Swatch[]
  value: string
  onPick: (v: string) => void
}) => {
  const picked = !items.some((c) => c.value === value)
  return (
    <div className="swatches pop__swatches" role="radiogroup" aria-label={label}>
      {items.map((c) => (
        <label key={c.value} className="swatch" style={{ background: c.bg }} title={c.name} data-light={c.light || undefined}>
          <input type="radio" name={name} checked={value === c.value} onChange={() => onPick(c.value)} />
          <span className="sr-only">{c.name}</span>
        </label>
      ))}
      <label
        className="swatch swatch--pick"
        title="원하는 컬러 직접 선택"
        data-picked={picked || undefined}
        style={picked ? ({ '--cfg-tape': value } as React.CSSProperties) : undefined}
      >
        <input
          type="color"
          className="swatch__color"
          value={(picked ? value : '#7B4FD6').toLowerCase()}
          aria-label={`${label} 직접 선택`}
          onChange={(e) => onPick(e.currentTarget.value.toUpperCase())}
        />
      </label>
    </div>
  )
}

const TAPE_SW: Swatch[] = TAPE_COLORS.map((c) => ({ value: c.hex, name: c.name, bg: c.hex, light: isLight(c.hex) }))
const SLIDER_SW: Swatch[] = METALS.map((m) => ({ value: m.key, name: m.name, bg: metalBg(m.stops), light: m.key === 'silver' }))
const colorName = (sw: Swatch[], v: string) => sw.find((c) => c.value === v)?.name ?? '직접 고른 컬러'
const Dot = ({ bg }: { bg: string }) => <span className="pop__dot" style={{ background: bg }} aria-hidden="true" />

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="lab__row">
    <span className="lab__k">{label}</span>
    <div className="lab__v">{children}</div>
  </div>
)

const ZipperLab = () => {
  const [spec, setSpec] = useState<Spec>({ ...DEFAULT_SPEC, len: 60 })
  const set = (patch: Partial<Spec>) => setSpec((s) => fixSpec({ ...s, ...patch }))
  const kind = KINDS.find((k) => k.key === spec.kind)!
  const pull = PULLS.find((p) => p.key === spec.pull)!
  const tapeName = colorName(TAPE_SW, spec.tape)
  const sliderName = colorName(SLIDER_SW, spec.slider)
  const sliderBg = SLIDER_SW.find((c) => c.value === spec.slider)?.bg ?? spec.slider

  return (
    <div className="lab" style={specVars(spec) as React.CSSProperties}>
      <div className="lab__view">
        <div className="lab__play">
          <ZipperPlay kind={spec.kind} size={spec.size} pull={spec.pull} tint={`${spec.tape}|${spec.slider}|${spec.teeth}`} />
        </div>
      </div>

      <div className="lab__panel">
        <Row label="종류">
          <PopBox
            label="종류"
            summary={
              <>
                <KindIcon kind={spec.kind} />
                {kind.label}
                <span className="pop__sep" aria-hidden="true" />
                <Dot bg={spec.tape} />
                {tapeName}
              </>
            }
          >
            <p className="pop__h">종류</p>
            <div className="pop__grid pop__grid--4" role="radiogroup" aria-label="종류">
              {KINDS.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  role="radio"
                  aria-checked={spec.kind === k.key}
                  className="pick__opt"
                  onClick={() => set({ kind: k.key })}
                >
                  <span className="pick__icon">
                    <KindIcon kind={k.key} />
                  </span>
                  <span className="pick__name">{k.label}</span>
                </button>
              ))}
            </div>
            <p className="pop__h">컬러</p>
            <Swatches name="lab-tape" label="지퍼 컬러" items={TAPE_SW} value={spec.tape} onPick={(v) => set({ tape: v })} />
          </PopBox>
        </Row>
        <Row label="슬라이더">
          <PopBox
            label="슬라이더"
            summary={
              <>
                <PullIcon pull={spec.pull} />
                {pull.label}
                <span className="pop__sep" aria-hidden="true" />
                <Dot bg={sliderBg} />
                {sliderName}
              </>
            }
          >
            <p className="pop__h">손잡이</p>
            <div className="pop__grid" role="radiogroup" aria-label="손잡이">
              {PULLS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={spec.pull === p.key}
                  className="pick__opt"
                  onClick={() => set({ pull: p.key })}
                >
                  <span className="pick__icon">
                    <PullIcon pull={p.key} />
                  </span>
                  <span className="pick__name">{p.label}</span>
                </button>
              ))}
            </div>
            <p className="pop__h">컬러</p>
            <Swatches name="lab-slider" label="슬라이더 컬러" items={SLIDER_SW} value={spec.slider} onPick={(v) => set({ slider: v })} />
          </PopBox>
        </Row>
      </div>
    </div>
  )
}

export default ZipperLab
