'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

// 방문 기록: 화면(주소)이 바뀔 때마다 한 번 /api/collect 로 보낸다(쿠키·외부 스크립트 없음).
// 들어온 곳(다른 사이트에서 온 경우 그 호스트)은 처음 들어온 화면에만 붙인다.
const Analytics = () => {
  const path = usePathname()
  const first = useRef(true)

  useEffect(() => {
    let ref = ''
    if (first.current) {
      first.current = false
      try {
        const r = document.referrer ? new URL(document.referrer).hostname : ''
        if (r && r !== location.hostname) ref = r.replace(/^www\./, '')
      } catch {}
    }
    const body = JSON.stringify({ p: path, r: ref })
    if (!navigator.sendBeacon?.('/api/collect', new Blob([body], { type: 'application/json' }))) {
      fetch('/api/collect', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(
        () => {},
      )
    }
  }, [path])

  return null
}

export default Analytics
