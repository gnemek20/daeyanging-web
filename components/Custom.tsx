'use client'

import { useState } from 'react'
import ZipperStrip, { type ToothFinish } from './ZipperStrip'

const COLORS = [
  { name: '인디고', hex: '#23306B' },
  { name: '블랙', hex: '#1E1F23' },
  { name: '아이보리', hex: '#D9D2BF' },
  { name: '와인', hex: '#6B2333' },
  { name: '올리브', hex: '#545F45' },
]

const FINISHES: { key: ToothFinish; label: string }[] = [
  { key: 'metal', label: '메탈' },
  { key: 'matte', label: '무광' },
  { key: 'gloss', label: '유광' },
]

const Custom = () => {
  const [color, setColor] = useState(COLORS[0])
  const [finish, setFinish] = useState<ToothFinish>('metal')
  const finishLabel = FINISHES.find((f) => f.key === finish)?.label

  return (
    <section className="sec sec--tint" id="custom" aria-labelledby="custom-h">
      <div className="wrap split">
        <div>
          <h2 className="h2" id="custom-h">
            생각하는 모양
            <br />
            그대로.
          </h2>
          <p className="body split__note">
            정해진 규격에 맞추지 않습니다. 사이즈, 컬러, 마감까지, 1:1 맞춤 제작으로 원하는 지퍼를 자유롭게 구현합니다.
          </p>
        </div>

        <div className="config">
          <div className="config__preview">
            <ZipperStrip
              id="cfg"
              kind="metal"
              tape={color.hex}
              finish={finish}
              title={`${color.name} 테이프, ${finishLabel} 마감 지퍼 미리보기`}
            />
          </div>

          <dl className="config__rows">
            <div>
              <dt>길이</dt>
              <dd>맞춤 재단</dd>
            </div>
            <div>
              <dt id="cfg-color">컬러</dt>
              <dd>
                <div className="swatches" role="radiogroup" aria-labelledby="cfg-color">
                  {COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      role="radio"
                      aria-checked={color.hex === c.hex}
                      aria-label={c.name}
                      title={c.name}
                      className="swatch"
                      style={{ background: c.hex }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </dd>
            </div>
            <div>
              <dt id="cfg-finish">마감</dt>
              <dd>
                <div className="seg" role="radiogroup" aria-labelledby="cfg-finish">
                  {FINISHES.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      role="radio"
                      aria-checked={finish === f.key}
                      className="seg__btn"
                      onClick={() => setFinish(f.key)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </dd>
            </div>
            <div>
              <dt>슬라이더</dt>
              <dd>형태 선택</dd>
            </div>
            <div>
              <dt>수량</dt>
              <dd>샘플부터 양산까지</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

export default Custom
