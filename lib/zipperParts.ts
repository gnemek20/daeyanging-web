// 자동 생성: scratchpad extract_v2.py (tape.png · slider.png → public/zipper). 직접 고치지 말 것.
// 단위는 가이드 지퍼 그림 좌표(가로 640). y 는 가운데 줄 기준(위가 음수).

export const STRIP = {
  metal: { len: 1920.0, up: { y: -121.0, h: 148.0 }, dn: { y: -29.0, h: 162.0 }, tape: 1.711, teeth: 1.478, mask: true },
  vislon: { len: 1920.0, up: { y: -135.0, h: 170.0 }, dn: { y: -35.0, h: 174.0 }, tape: 1.723, teeth: 1.475, mask: true },
  coil: { len: 1920.0, up: { y: -115.0, h: 116.0 }, dn: { y: -1.0, h: 106.0 }, tape: 1.861, teeth: 1.858, mask: true },
  conceal: { len: 1920.0, up: { y: -145.0, h: 146.0 }, dn: { y: -1.0, h: 154.0 }, tape: 1.796, teeth: 1.796, mask: false },
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
