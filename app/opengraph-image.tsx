import { ImageResponse } from 'next/og'
import { LOGO_PATHS, LOGO_TRANSFORM, LOGO_VIEWBOX } from '@/lib/logo'

// 공유 미리보기 이미지: 지퍼 컬러 카드 + DY 로고 + 영문 워드마크(기본 글꼴로 그릴 수 있는 라틴 문자만 쓴다)
export const alt = 'DY 대양ING — Zippers & garment trims since 2004'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TAPES = ['#EDE6D6', '#C9A27A', '#E0662F', '#C8202F', '#E9A6B4', '#8C7AC4', '#26367A', '#1F6FD1', '#0F7A5C', '#9AAF4A', '#F2C230', '#17181C']

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#F6F6F3' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px', width: 560 }}>
          <svg width={170} height={100} viewBox={LOGO_VIEWBOX}>
            <g transform={LOGO_TRANSFORM} fill="#121316">
              {LOGO_PATHS.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          </svg>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#121316', marginTop: 20 }}>DAEYANG ING</div>
          <div style={{ fontSize: 28, color: '#64676E', marginTop: 24 }}>Zippers &amp; garment trims</div>
          <div style={{ fontSize: 28, color: '#64676E' }}>Seoul, since 2004</div>
        </div>
        <div style={{ display: 'flex', flex: 1, gap: 6, padding: '0 14px', background: '#E3E2DC' }}>
          {TAPES.map((c, i) => (
            <div key={c} style={{ flex: 1, background: c, display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: 10, height: '100%', background: i % 3 === 0 ? '#C79A45' : '#C7CBD1', opacity: 0.85 }} />
              <div
                style={{
                  position: 'absolute',
                  top: 120 + Math.round(180 * Math.abs(Math.sin(i * 0.7))),
                  width: 26,
                  height: 40,
                  borderRadius: 6,
                  background: i % 3 === 0 ? '#D4AE5E' : '#D9DCE1',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
