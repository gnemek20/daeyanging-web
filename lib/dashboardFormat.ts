// 대시보드 화면들이 같이 쓰는 표시 형식(한국 시간 · 숫자 · 파일 크기)
export const kst = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export const num = new Intl.NumberFormat('ko-KR')

export const bytes = (n: number) =>
  n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))}KB` : `${+(n / 1024 / 1024).toFixed(1)}MB`
