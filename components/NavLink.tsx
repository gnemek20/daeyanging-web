'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 첫 화면 구역으로 가는 머리글 링크.
// 이미 첫 화면에 있으면 브라우저 기본 앵커(#id)로 스크롤한다 — 주소에 ?utm_… 같은 검색 파라미터가
// 붙어 있어도 확실히 움직이고, scroll-padding·부드러운 스크롤 설정을 그대로 따른다.
// 다른 페이지(가이드 등)에서는 Next.js Link 로 첫 화면의 해당 구역으로 이동한다.
type Props = { id: string; children: React.ReactNode; className?: string; onClick?: () => void }

const NavLink = ({ id, children, className, onClick }: Props) => {
  const onHome = usePathname() === '/'
  return onHome ? (
    <a href={`#${id}`} className={className} onClick={onClick}>
      {children}
    </a>
  ) : (
    <Link href={`/#${id}`} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

export default NavLink
