// 자동 생성: scratchpad strips_v4.py · extract_v2.py (tape.png · texture.png · slider.png → public/zipper). 직접 고치지 말 것.
// 단위는 가이드 지퍼 그림 좌표(가로 640). y 는 가운데 줄 기준(위가 음수). 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기. 줄 그림(full·up·dn)은 모두 같은 자리·크기.

export const STRIP = {
  metal: { len: 1920.0, y: -121.0, h: 238.0, tape: 1.947, teeth: 1.7, mask: true },
  vislon: { len: 1920.0, y: -119.0, h: 236.0, tape: 1.932, teeth: 1.7, mask: true },
  coil: { len: 1920.0, y: -123.0, h: 238.0, tape: 2.107, teeth: 1.7, mask: true },
  conceal: { len: 1920.0, y: -115.0, h: 230.0, tape: 1.962, teeth: 1.7, mask: false },
} as const

// 손잡이별 슬라이더 사진(원본 한 장을 걸이 높이에서 몸통·손잡이로 나눔): 그림 단위 자리·크기(y 는 가운데 줄 기준),
// pivot 손잡이가 흔들리는 축 x, metal 손잡이가 금속인지, mz 끈·가죽·러버 사진에서 몸통 쪽 금속 고리 폭(px)
export const PULL_PHOTO = {
  tab: { body: { x: -16.3, y: -42.3, w: 96.3, h: 84.6 }, pull: { x: -195.4, y: -42.3, w: 194.4, h: 84.6 }, pivot: -8.2, metal: true, mz: 0 },
  plate: { body: { x: -16.3, y: -58.05, w: 96.3, h: 116.1 }, pull: { x: -255.88, y: -49.34, w: 253.8, h: 99.0 }, pivot: -8.2, metal: true, mz: 0 },
  ring: { body: { x: -16.3, y: -72.45, w: 96.3, h: 144.9 }, pull: { x: -159.4, y: -72.45, w: 158.4, h: 144.9 }, pivot: -8.2, metal: true, mz: 0 },
  cord: { body: { x: -16.3, y: -43.65, w: 96.3, h: 87.3 }, pull: { x: -364.78, y: -26.19, w: 360.9, h: 52.2 }, pivot: -8.2, metal: false, mz: 53 },
  leather: { body: { x: -16.3, y: -67.5, w: 96.3, h: 135.0 }, pull: { x: -364.78, y: -40.5, w: 360.9, h: 81.0 }, pivot: -8.2, metal: false, mz: 60 },
  rubber: { body: { x: -16.3, y: -48.15, w: 96.3, h: 96.3 }, pull: { x: -365.68, y: -28.89, w: 361.8, h: 57.6 }, pivot: -8.2, metal: false, mz: 53 },
} as const
