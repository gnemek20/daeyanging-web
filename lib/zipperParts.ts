// 자동 생성: scratchpad strips_v5.py · extract_v2.py (tape.png · texture.png · slider.png → public/zipper). 직접 고치지 말 것.
// 단위는 가이드 지퍼 그림 좌표(가로 640). y 는 가운데 줄 기준(위가 음수). 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기.

export const STRIP = {
  metal: { len: 1920.0, y: -119.0, h: 236.0, tape: 1.947, teeth: 1.7, mask: true },
  vislon: { len: 1920.0, y: -121.0, h: 236.0, tape: 1.936, teeth: 1.7, mask: true },
  coil: { len: 1920.0, y: -119.0, h: 236.0, tape: 2.112, teeth: 1.7, mask: true },
  conceal: { len: 1920.0, y: -117.0, h: 230.0, tape: 1.975, teeth: 1.7, mask: false },
} as const

// 손잡이별 슬라이더 사진(원본 그대로 한 장: 몸통 + 손잡이): 그림 단위 자리·크기(y 는 가운데 줄 기준),
// metal 손잡이가 금속인지, mz 끈·가죽·러버 사진에서 몸통·금속 고리 쪽(오른쪽 끝부터) 폭(px) — 여기만 슬라이더 색
export const PULL_PHOTO = {
  tab: { x: -195.4, y: -42.3, w: 275.4, h: 84.6, metal: true, mz: 0 },
  plate: { x: -299.8, y: -58.05, w: 379.8, h: 116.1, metal: true, mz: 0 },
  ring: { x: -159.4, y: -72.45, w: 239.4, h: 144.9, metal: true, mz: 0 },
  cord: { x: -405.1, y: -43.65, w: 485.1, h: 87.3, metal: false, mz: 174 },
  leather: { x: -404.2, y: -67.5, w: 484.2, h: 135.0, metal: false, mz: 186 },
  rubber: { x: -406.0, y: -48.15, w: 486.0, h: 96.3, metal: false, mz: 174 },
} as const
