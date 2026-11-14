import { LOGO_PATHS, LOGO_TRANSFORM, LOGO_VIEWBOX } from '@/lib/logo'

// 대양ING 기존 로고. fill 은 currentColor 라 글자색을 따라가고, 크기는 CSS height 로 정한다.
const Logo = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    className={className}
    viewBox={LOGO_VIEWBOX}
    role={title ? 'img' : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    focusable="false"
  >
    <g transform={LOGO_TRANSFORM} fill="currentColor">
      {LOGO_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  </svg>
)

export default Logo
