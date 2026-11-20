// 가이드 지퍼(ZipperPlay)를 캔버스로 미리 굽고 그린다.
//
// 왜: SVG 필터(색 입히기·그림자)는 화면에 새 영역이 보일 때마다 다시 계산돼 느린 휴대폰에서 끊긴다.
// 그래서 색이나 종류·손잡이가 바뀔 때 한 번만 사진에 색과 그림자를 입혀 캔버스에 구워 두고(bake),
// 창마다 놓인 캔버스에 그 그림을 한 번 그려 둔다(draw). 끄는 동안에는 이미 그려진 층을 transform 으로 옮기기만 한다.
import { PULL_PHOTO, STRIP } from './zipperParts'
import { ZIPPER_ASSET_V, type Pull } from './zipperSpec'

type Kind = keyof typeof STRIP
type RGB = readonly [number, number, number]

// 구운 그림 한 장과 그것이 놓일 자리(그림 단위, 호수 배율을 걸기 전 좌표). 그림자 여백까지 포함한다
export type Sprite = { c: HTMLCanvasElement; x: number; y: number; w: number; h: number }
// slider: 몸통(+ 가운데 걸이 막대), pull: 손잡이(걸이 막대 끝을 축으로 흔들린다, 몸통 밑에 깔린다)
export type Baked = { full: Sprite; up: Sprite; dn: Sprite; slider: Sprite; pull: Sprite }

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

// 사진 색 입히기(전에 쓰던 SVG 필터와 같은 계산): 밝기(회색) × 색 × slope.
// lift: 천 — 평균보다 밝은 결은 살짝 희끗하게(청바지 씨실이 비치는 느낌, 샘플 C)
// metalZone: 끈·가죽·러버 슬라이더 사진에서 몸통 쪽(오른쪽) 이 폭(px) 안의 밝은 무채색(몸통·금속 고리)만 물들인다
const tint = (img: HTMLImageElement, color: RGB | null, slope: number, lift = false, metalZone = 0) => {
  const c = canvas(img.naturalWidth, img.naturalHeight)
  const x = c.getContext('2d', { willReadFrequently: true })!
  x.drawImage(img, 0, 0)
  if (!color) return c
  const d = x.getImageData(0, 0, c.width, c.height)
  const p = d.data
  const kr = (color[0] / 255) * slope
  const kg = (color[1] / 255) * slope
  const kb = (color[2] / 255) * slope
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
    if (lift) {
      const hi = Math.min(1, Math.max(0, ((g * slope) / 255 - 1) / 0.6)) * 0.32
      r += (200 - r) * hi
      gg += (210 - gg) * hi
      b += (225 - b) * hi
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
  shadowFrom = 0, // 원본 px: 이 x 왼쪽에는 그림자를 드리우지 않는다(몸통 그림자가 그 밑 손잡이 위에 지지 않게)
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
  if (shadowFrom > 0) {
    x.shadowColor = 'transparent'
    x.clearRect(0, 0, pad + shadowFrom * scale, c.height)
    x.drawImage(t, 0, 0, shadowFrom * scale, t.height, pad, pad, shadowFrom * scale, t.height)
  }
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

// 슬라이더 사진(가로, 오른쪽 끝이 몸통 머리)을 몸통과 손잡이로 나눈다. 둘을 겹치면 원래 사진 그대로다.
//   몸통: 오른쪽 끝부터 cut 폭 + 가운데 걸이 막대(lug 까지, 가운데 줄 ±LUG px)
//   손잡이: 나머지. 흔들려도 틈이 보이지 않게 몸통 밑으로 UNDER 만큼 더 들어가고, 걸이 막대 자리(±LUG_IN)는 비운다
const LUG = 13
const LUG_IN = 9
const UNDER = 8 // 손잡이가 몸통 밑으로 들어가는 폭(px): 기울어도 몸통과 사이에 틈이 안 생기게
const splitPull = (img: HTMLCanvasElement, ph: { cut: number; lug: number; cy: number }) => {
  const W = img.width
  const H = img.height
  const body = canvas(W, H)
  const b = body.getContext('2d')!
  b.drawImage(img, W - ph.cut, 0, ph.cut, H, W - ph.cut, 0, ph.cut, H)
  const lx = W - ph.lug
  const lw = ph.lug - ph.cut
  b.drawImage(img, lx, ph.cy - LUG, lw, LUG * 2, lx, ph.cy - LUG, lw, LUG * 2)
  const pull = canvas(W, H)
  const p = pull.getContext('2d')!
  const cx = W - ph.cut
  const px = cx + UNDER
  p.drawImage(img, 0, 0, cx, H, 0, 0, cx, H)
  // 몸통 밑으로 들어가는 부분: 몸통 머리(더 넓다)를 복사하면 기울 때 삐져나오므로 손잡이 맨 윗줄을 늘여 깐다
  p.drawImage(img, cx - 1, 0, 1, H, cx, 0, UNDER, H)
  p.clearRect(lx, ph.cy - LUG_IN, px - lx, LUG_IN * 2)
  return { body, pull }
}

export const bake = async (
  kind: Kind,
  pull: Pull,
  colors: { tape: RGB; teeth: RGB; slider: RGB },
): Promise<Baked> => {
  const st = STRIP[kind]
  const parts = ['full', 'up', 'dn'] as const
  const imgs = await Promise.all([
    ...parts.flatMap((p) => [load(`/zipper/${kind}-${p}.webp?v=${ZIPPER_ASSET_V}`), st.mask ? load(`/zipper/${kind}-${p}-t.webp?v=${ZIPPER_ASSET_V}`) : null]),
    load(`/zipper/pull-${pull}.webp?v=${ZIPPER_ASSET_V}`),
  ])
  const stripRect = { x: -VW, y: CY + st.y, w: st.len, h: st.h }
  const strips = parts.map((_, i) => {
    const tape = imgs[i * 2]!
    const teeth = imgs[i * 2 + 1]
    const layers = [tint(tape, colors.tape, st.tape, true)]
    if (teeth) layers.push(tint(teeth, colors.teeth, st.teeth))
    return compose(layers, stripRect, 1, { sd: 3.5, dy: 3 })
  })
  const pi = imgs[6]!
  const ph = PULL_PHOTO[pull]
  const whole = tint(pi, colors.slider, 1.25, false, ph.metal ? 0 : ph.mz)
  const split = splitPull(whole, ph)
  return {
    full: strips[0],
    up: strips[1],
    dn: strips[2],
    slider: compose([split.body], ph, 1, { sd: 2.6, dy: 3 }, whole.width - ph.cut),
    pull: compose([split.pull], ph, 1, { sd: 2.6, dy: 3 }),
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
  }
  const x = cv.getContext('2d')!
  x.setTransform(1, 0, 0, 1, 0, 0) // 지난번 그리기의 변환이 남아 있으면 일부만 지워진다
  x.clearRect(0, 0, W, H)
  return x
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

// 손잡이 축의 화면 자리(px, 슬라이더 위치 0 기준·창 왼쪽 위 기준)
export const pivotAt = (pv: number, f: number, v: View) => {
  const { k, ox, oy } = fit(v)
  return { x: ox + k * (11 + f * (pv - 31)), y: oy + k * CY }
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
