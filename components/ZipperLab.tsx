'use client'

import { useState } from 'react'
import Picker from './Picker'
import ZipperPlay from './ZipperPlay'
import { DEFAULT_SPEC, KINDS, LOCKS, METALS, PULLS, TAPE_COLORS, fixSpec, isLight, specVars, type Spec } from '@/lib/zipperSpec'

// 가이드 맨 위 "직접 골라 보기": 설정을 바꾸면 사진으로 만든 지퍼가 바로 바뀐다.
// 주문용이 아니라 이해를 돕는 보충 자료다(고른 값은 어디로도 보내지 않는다).
// 짧은 선택지는 전환 버튼, 그림으로 봐야 이해되는 선택지(마감·손잡이)는 3열 선택 상자.
// 맨 아래 한 줄에 방금 바꾼 항목의 뜻을 보여 준다.

type Key = 'kind' | 'size' | 'tape' | 'finish' | 'lock' | 'pull'

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
  leather: '가죽 손잡이. 로고 각인, 고급 아우터·가방',
  rubber: '러버 손잡이. 로고 각인, 스포츠·아웃도어',
}

// 손잡이 고르기 아이콘: slider.png 에서 자른 실제 사진(세로)
const PullIcon = ({ pull }: { pull: Spec['pull'] }) => (
  // eslint-disable-next-line @next/next/no-img-element -- 112px 짜리 고정 썸네일(이미 WebP 로 줄여 둠)
  <img src={`/zipper/pull-${pull}-gold.webp`} alt="" className="pick__photo" loading="lazy" decoding="async" />
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
    tape: [TAPE_COLORS.find((c) => c.hex === spec.tape)?.name ?? '직접 선택', '원단 샘플, 컬러칩, 팬톤 번호로 정확히 맞춤'],
    finish: [metal.name, '이와 슬라이더를 같은 금속 컬러로'],
    lock: [LOCKS.find((l) => l.key === spec.lock)!.label, LOCK_NOTE[spec.lock]],
    pull: [PULLS.find((p) => p.key === spec.pull)!.label + ' 손잡이', PULL_NOTE[spec.pull]],
  }
  const [capK, capV] = caption[last]

  return (
    <div className="lab" style={specVars(spec) as React.CSSProperties}>
      <div className="lab__view">
        <div className="lab__play">
          <ZipperPlay kind={spec.kind} size={spec.size} pull={spec.pull} />
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
