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
  tab: { x: -186.4, y: -41.85, w: 266.4, h: 82.8, metal: true, mz: 0 },
  plate: { x: -289.9, y: -54.9, w: 369.9, h: 109.8, metal: true, mz: 0 },
  ring: { x: -151.3, y: -69.3, w: 231.3, h: 143.1, metal: true, mz: 0 },
  cord: { x: -397.9, y: -40.5, w: 477.9, h: 81.0, metal: false, mz: 165 },
  leather: { x: -409.6, y: -60.3, w: 489.6, h: 119.7, metal: false, mz: 175 },
  rubber: { x: -388.9, y: -44.55, w: 468.9, h: 89.1, metal: false, mz: 177 },
} as const
