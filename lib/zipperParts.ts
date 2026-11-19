// 자동 생성: scratchpad strips_v4.py · slider_v3.py (tape.png · texture.png · slider.png → public/zipper). 직접 고치지 말 것.
// 단위는 가이드 지퍼 그림 좌표(가로 640). y 는 가운데 줄 기준(위가 음수). 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기.

export const STRIP = {
  metal: { len: 1920.0, y: -121.0, h: 238.0, tape: 1.947, teeth: 1.7, mask: true },
  vislon: { len: 1920.0, y: -119.0, h: 236.0, tape: 1.932, teeth: 1.7, mask: true },
  coil: { len: 1920.0, y: -123.0, h: 238.0, tape: 2.107, teeth: 1.7, mask: true },
  conceal: { len: 1920.0, y: -115.0, h: 230.0, tape: 1.962, teeth: 1.7, mask: false },
} as const

// 슬라이더 몸통 사진(손잡이와 상관없이 하나): 왼쪽 위 x·y, 폭·높이(그림 단위, y 는 가운데 줄 기준)
export const SLIDER_BODY = { x: -14.05, y: -38.95, w: 94.05, h: 78.85 } as const

// 손잡이가 걸리는 곳(몸통 걸이 끝) x. 손잡이는 이 점을 축으로 흔들린다
export const PULL_PIVOT = 2.1

// 손잡이 사진: 왼쪽 위 x·y, 폭·높이, 금속인지(금속이면 슬라이더 색으로 물들인다)
export const PULL_PHOTO = {
  tab: { x: -204.05, y: -41.8, w: 217.55, h: 76.95, metal: true },
  plate: { x: -242.87, y: -43.23, w: 256.5, h: 82.14, metal: true },
  ring: { x: -208.8, y: -70.3, w: 223.25, h: 132.05, metal: true },
  cord: { x: -251.51, y: -28.31, w: 256.5, h: 48.53, metal: false },
  leather: { x: -249.48, y: -32.81, w: 256.5, h: 56.33, metal: false },
  rubber: { x: -242.37, y: -26.8, w: 256.5, h: 49.22, metal: false },
} as const
