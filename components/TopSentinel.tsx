'use client'

import { useCallback } from 'react'

// 페이지 맨 위에 놓인 보이지 않는 표식. 화면에 보이는 동안 <html data-at-top> 을 켜 둔다.
// 머리글 배경·밑줄은 이 속성에 따라 CSS transition 으로 나타나고 사라진다(양방향 모두 부드럽게).
// 스크롤 이벤트 대신 IntersectionObserver 를 쓰고, ref 콜백 정리 함수로 끝낸다(useEffect 없음).
// 자바스크립트가 없으면 속성이 켜지지 않아 머리글 배경이 늘 보인다.
const TopSentinel = () => {
  const watch = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    const root = document.documentElement
    const io = new IntersectionObserver(([e]) => root.toggleAttribute('data-at-top', e.isIntersecting))
    io.observe(el)
    return () => {
      io.disconnect()
      root.removeAttribute('data-at-top')
    }
  }, [])
  return <div ref={watch} className="top-sentinel" aria-hidden="true" />
}

export default TopSentinel
