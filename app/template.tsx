'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { tabIndex } from '@/lib/tabs'

// 화면 전환: 탭을 바꿀 때마다 새로 그려지는 겉싸개(template).
// 오른쪽 탭으로 가면 오른쪽에서, 왼쪽 탭으로 가면 왼쪽에서 들어온다. 처음 열 때는 움직이지 않는다.
let prev = -1

export default function Template({ children }: { children: React.ReactNode }) {
  const i = tabIndex(usePathname())
  const [dir] = useState(() => (prev < 0 || i < 0 || i === prev ? 'none' : i > prev ? 'next' : 'prev'))

  useEffect(() => {
    prev = i
  }, [i])

  return (
    <div className="screen" data-dir={dir}>
      {children}
    </div>
  )
}
