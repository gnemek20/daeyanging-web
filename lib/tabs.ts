// 사이트의 화면(탭) 목록 — 머리글 탭과 화면 전환 방향(앞·뒤)이 이 순서를 쓴다.
// 첫 화면(/)이 곧 회사소개 탭이다(랜딩 + 회사 소개). "가이드"(/handbook)는 손님용 안내서이고,
// 검색 노출용 가이드(/guide)는 사이트 어디에서도 링크하지 않는다.
export const TABS = [
  { href: '/', label: '회사소개' },
  { href: '/products', label: '제품' },
  { href: '/handbook', label: '가이드' },
  { href: '/contact', label: '상담문의' },
] as const

const ORDER: string[] = TABS.map((t) => t.href)

export const tabIndex = (path: string) => ORDER.indexOf(path)
