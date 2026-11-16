'use client'

import { applyPick } from './tapeColor'

// 컬러 줄 맨 끝의 "직접 고르기" 스와치.
// 무지개 고리 안에 기본 색상 선택기(스포이드 포함)를 숨겨 두고, 고른 색을 미리보기에 바로 입힌다.
// 같은 name="tape" 라디오를 함께 두어 나머지 컬러와 한 묶음으로 선택·해제된다.
// 상태 없이 이벤트 핸들러에서 CSS 변수와 입력 칸 값만 바꾼다(렌더링 다시 하지 않음).
const TapePicker = ({ initial }: { initial: string }) => {
  const apply = (input: HTMLInputElement) => {
    const root = input.closest<HTMLElement>('.custom')
    if (root) applyPick(root, input.value.toUpperCase(), input)
  }

  return (
    <label className="swatch swatch--pick" title="컬러 직접 고르기">
      <input type="radio" name="tape" value="custom" data-hex={initial} aria-label="직접 고른 컬러" />
      <input
        type="color"
        className="swatch__color"
        defaultValue={initial}
        aria-label="컬러 직접 고르기"
        onClick={(e) => apply(e.currentTarget)}
        onInput={(e) => apply(e.currentTarget)}
      />
    </label>
  )
}

export default TapePicker
