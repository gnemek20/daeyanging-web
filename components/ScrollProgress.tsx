'use client'

import { useEffect, useRef } from 'react'

const ScrollProgress = () => {
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? (window.scrollY / max) * 100 : 0
      if (progressRef.current) {
        progressRef.current.style.width = p.toFixed(2) + '%'
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return <div id="progress" ref={progressRef} />
}

export default ScrollProgress
