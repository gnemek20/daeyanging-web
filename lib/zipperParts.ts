// 자동 생성: scratchpad extract_v2.py · strips_v4.py (tape.png · texture.png · slider.png → public/zipper). 직접 고치지 말 것.
// 단위는 가이드 지퍼 그림 좌표(가로 640). y 는 가운데 줄 기준(위가 음수). 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기.

export const STRIP = {
  metal: { len: 1920.0, y: -121.0, h: 238.0, tape: 1.947, teeth: 1.7, mask: true },
  vislon: { len: 1920.0, y: -119.0, h: 236.0, tape: 1.932, teeth: 1.7, mask: true },
  coil: { len: 1920.0, y: -123.0, h: 238.0, tape: 2.107, teeth: 1.7, mask: true },
  conceal: { len: 1920.0, y: -115.0, h: 230.0, tape: 1.962, teeth: 1.7, mask: false },
} as const

// 손잡이별 슬라이더 사진: 폭·높이, 흔들림 축(그림 왼쪽 위 기준), 손잡이가 금속인지(금속이면 마감 색으로 물들인다)
export const PULL_PHOTO = {
  tab: { w: 275.4, h: 84.6, pivot: { x: 187.2, y: 42.3 }, metal: true },
  plate: { w: 379.8, h: 116.1, pivot: { x: 291.6, y: 58.05 }, metal: true },
  ring: { w: 239.4, h: 144.9, pivot: { x: 151.2, y: 72.45 }, metal: true },
  cord: { w: 683.1, h: 87.3, pivot: { x: 594.9, y: 43.65 }, metal: false },
  leather: { w: 682.2, h: 135.0, pivot: { x: 594.0, y: 67.5 }, metal: false },
  rubber: { w: 684.0, h: 96.3, pivot: { x: 595.8, y: 48.15 }, metal: false },
} as const
