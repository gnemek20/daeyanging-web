'use client'

import { useEffect } from 'react'

const RevealObserver = () => {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.16, rootMargin: '0px 0px -7% 0px' }
    )

    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))

    return () => io.disconnect()
  }, [])

  return null
}

export default RevealObserver
