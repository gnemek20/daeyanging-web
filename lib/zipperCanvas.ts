// 가이드 지퍼(ZipperPlay)를 캔버스로 미리 굽고 그린다.
//
// 왜: SVG 필터(색 입히기·그림자)는 화면에 새 영역이 보일 때마다 다시 계산돼 느린 휴대폰에서 끊긴다.
// 그래서 색이나 종류·손잡이가 바뀔 때 한 번만 사진에 색과 그림자를 입혀 캔버스에 구워 두고(bake),
// 창마다 놓인 캔버스에 그 그림을 한 번 그려 둔다(draw). 끄는 동안에는 이미 그려진 층을 transform 으로 옮기기만 한다.
import { PULL_PHOTO, STRIP } from './zipperParts'
import type { Pull } from './zipperSpec'

type Kind = keyof typeof STRIP
type RGB = readonly [number, number, number]

// 구운 그림 한 장과 그것이 놓일 자리(그림 단위, 호수 배율을 걸기 전 좌표). 그림자 여백까지 포함한다
export type Sprite = { c: HTMLCanvasElement; x: number; y: number; w: number; h: number }
export type Baked = { full: Sprite; up: Sprite; dn: Sprite; slider: Sprite }

export const VW = 640 // 그림 좌표 폭·높이(ZipperPlay 와 같음)
export const VH = 512
export const CY = 256

const cache = new Map<string, Promise<HTMLImageElement>>()
const load = (src: string) => {
  let p = cache.get(src)
  if (!p) {
    p = new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.decoding = 'async'
      i.onload = () => res(i)
      i.onerror = rej
      i.src = src
    })
    cache.set(src, p)
  }
  return p
}

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  return c
}

// 사진 색 입히기(전에 쓰던 SVG 필터와 같은 계산): 밝기(회색) × 색 × slope. soft 면 색을 20% 뺀다(천이 희게 바랜 느낌)
// metalZone: 끈·가죽·러버 슬라이더 사진에서 몸통 쪽(오른쪽) 이 폭(px) 안의 밝은 무채색(몸통·금속 고리)만 물들인다
const tint = (img: HTMLImageElement, color: RGB | null, slope: number, soft = false, metalZone = 0) => {
  const c = canvas(img.naturalWidth, img.naturalHeight)
  const x = c.getContext('2d', { willReadFrequently: true })!
  x.drawImage(img, 0, 0)
  if (!color) return c
  const d = x.getImageData(0, 0, c.width, c.height)
  const p = d.data
  const kr = (color[0] / 255) * slope
  const kg = (color[1] / 255) * slope
  const kb = (color[2] / 255) * slope
  const s = 0.8
  const m = soft
    ? [0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s]
    : null
  const W = c.width
  const zx = W - metalZone
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] === 0) continue
    const g = 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2]
    let wgt = 1
    if (metalZone) {
      const px = (i >> 2) % W
      if (px < zx) continue
      const sat = Math.max(p[i], p[i + 1], p[i + 2]) - Math.min(p[i], p[i + 1], p[i + 2])
      wgt = Math.min(1, Math.max(0, (g - 95) / 25)) * (sat < 28 ? 1 : 0) * Math.min(1, (px - zx) / 12)
      if (wgt === 0) continue
    }
    let r = Math.min(255, g * kr)
    let gg = Math.min(255, g * kg)
    let b = Math.min(255, g * kb)
    if (m) {
      const r2 = m[0] * r + m[1] * gg + m[2] * b
      const g2 = m[3] * r + m[4] * gg + m[5] * b
      const b2 = m[6] * r + m[7] * gg + m[8] * b
      r = r2
      gg = g2
      b = b2
    }
    p[i] = p[i] + (r - p[i]) * wgt
    p[i + 1] = p[i + 1] + (gg - p[i + 1]) * wgt
    p[i + 2] = p[i + 2] + (b - p[i + 2]) * wgt
  }
  x.putImageData(d, 0, 0)
  return c
}

// 여러 장을 겹쳐(scale 배로) 그림자와 함께 한 장으로. ppu = 원본 1px 당 그림 단위의 역수(px / 단위)
const compose = (
  layers: HTMLCanvasElement[],
  rect: { x: number; y: number; w: number; h: number },
  scale: number,
  shadow: { sd: number; dy: number },
): Sprite => {
  const w0 = layers[0].width
  const h0 = layers[0].height
  const ppu = (w0 / rect.w) * scale // 구운 그림의 px / 그림 단위
  const pad = Math.ceil((shadow.sd * 3 + shadow.dy) * ppu)
  const c = canvas(w0 * scale + pad * 2, h0 * scale + pad * 2)
  const x = c.getContext('2d')!
  x.imageSmoothingQuality = 'high'
  const t = canvas(w0 * scale, h0 * scale)
  const tx = t.getContext('2d')!
  tx.imageSmoothingQuality = 'high'
  for (const l of layers) tx.drawImage(l, 0, 0, t.width, t.height)
  x.shadowColor = 'rgba(0,0,0,0.35)'
  x.shadowBlur = shadow.sd * 2 * ppu
  x.shadowOffsetY = shadow.dy * ppu
  x.drawImage(t, pad, pad)
  const pu = pad / ppu
  return { c, x: rect.x - pu, y: rect.y - pu, w: rect.w + pu * 2, h: rect.h + pu * 2 }
}

// CSS 색(var(), color-mix() 등 무엇이든)을 RGB 로: 탐침 요소의 계산된 색을 캔버스에 칠해 읽는다
const probeCtx = () => canvas(1, 1).getContext('2d', { willReadFrequently: true })!
export const readColor = (host: HTMLElement, cssVar: string): RGB => {
  const el = document.createElement('span')
  el.style.cssText = `position:absolute;width:0;height:0;overflow:hidden;color:var(${cssVar})`
  host.appendChild(el)
  const col = getComputedStyle(el).color
  el.remove()
  const x = probeCtx()
  x.fillStyle = '#000'
  x.fillStyle = col
  x.fillRect(0, 0, 1, 1)
  const d = x.getImageData(0, 0, 1, 1).data
  return [d[0], d[1], d[2]]
}

export const bake = async (
  kind: Kind,
  pull: Pull,
  colors: { tape: RGB; teeth: RGB; slider: RGB },
): Promise<Baked> => {
  const st = STRIP[kind]
  const parts = ['full', 'up', 'dn'] as const
  const imgs = await Promise.all([
    ...parts.flatMap((p) => [load(`/zipper/${kind}-${p}.webp`), st.mask ? load(`/zipper/${kind}-${p}-t.webp`) : null]),
    load(`/zipper/pull-${pull}.webp`),
  ])
  const stripRect = { x: -VW, y: CY + st.y, w: st.len, h: st.h }
  const strips = parts.map((_, i) => {
    const tape = imgs[i * 2]!
    const teeth = imgs[i * 2 + 1]
    const layers = [tint(tape, colors.tape, st.tape)]
    if (teeth) layers.push(tint(teeth, colors.teeth, st.teeth))
    return compose(layers, stripRect, 1, { sd: 3.5, dy: 3 })
  })
  const pi = imgs[6]!
  const ph = PULL_PHOTO[pull]
  return {
    full: strips[0],
    up: strips[1],
    dn: strips[2],
    slider: compose([tint(pi, colors.slider, 1.25, false, ph.metal ? 0 : ph.mz)], ph, 1, { sd: 2.6, dy: 3 }),
  }
}

// 창 캔버스에 그리기: SVG(viewBox 640×512, slice)와 같은 자리에 맞춘다
export type View = { cw: number; ch: number; dpr: number }
const fit = ({ cw, ch }: View) => {
  const k = Math.max(cw / VW, ch / VH)
  return { k, ox: (cw - VW * k) / 2, oy: (ch - VH * k) / 2 }
}
const size = (cv: HTMLCanvasElement, w: number, h: number, dpr: number) => {
  const W = Math.round(w * dpr)
  const H = Math.round(h * dpr)
  if (cv.width !== W || cv.height !== H) {
    cv.width = W
    cv.height = H
  } else cv.getContext('2d')!.clearRect(0, 0, W, H)
  return cv.getContext('2d')!
}

// 지퍼 줄: 가운데(VW/2, CY)를 축으로 f 배, 그 뒤 위아래로 dy
export const drawStrip = (cv: HTMLCanvasElement, sp: Sprite, f: number, dy: number, v: View) => {
  const { k, ox, oy } = fit(v)
  const x = size(cv, v.cw, v.ch, v.dpr)
  x.setTransform(v.dpr * k, 0, 0, v.dpr * k, v.dpr * ox, v.dpr * oy)
  x.translate(VW / 2, CY + dy)
  x.scale(f, f)
  x.translate(-VW / 2, -CY)
  x.imageSmoothingQuality = 'high'
  x.drawImage(sp.c, sp.x, sp.y, sp.w, sp.h)
}

// 슬라이더 부품: translate(11, CY) scale(f) translate(-31, 0). 몸통 밖(왼쪽으로 긴 손잡이)까지 덮도록 캔버스를 그 범위로 잡는다
export const drawSlider = (cv: HTMLCanvasElement, sp: Sprite, f: number, v: View) => {
  const { k, ox, oy } = fit(v)
  const x0 = 11 + f * (sp.x - 31) - 2
  const x1 = 11 + f * (sp.x + sp.w - 31) + 2
  cv.style.left = `${ox + k * x0}px`
  cv.style.width = `${k * (x1 - x0)}px`
  const x = size(cv, k * (x1 - x0), v.ch, v.dpr)
  x.setTransform(v.dpr * k, 0, 0, v.dpr * k, 0, v.dpr * oy)
  x.translate(-x0, 0)
  x.translate(11, CY)
  x.scale(f, f)
  x.translate(-31, 0)
  x.imageSmoothingQuality = 'high'
  x.drawImage(sp.c, sp.x, sp.y, sp.w, sp.h)
}
