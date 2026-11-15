// "의류 창업이 처음이에요" 작성 안내 양식 — 문의 폼(화면)과 서버 액션(메일 본문)이 함께 쓴다.
// 부자재 용어를 몰라도 답할 수 있는 질문으로 바꿔 묻고, 각 칸에 무엇을 어떻게 적으면 되는지 짚어 준다.

export const STAGES = ['아이디어 단계', '샘플 만드는 중', '판매 준비 중', '이미 판매 중'] as const

export type GuideStep = {
  name: string // 폼 필드 이름
  label: string // 메일에 쓰는 짧은 이름
  title: string
  why: string // 이 내용이 왜 필요한지, 어떻게 적는지
  example: string
  required?: boolean
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    name: 'g_item',
    label: '만드는 옷',
    title: '무엇을 만드시나요?',
    why: '옷 종류와 원단(소재)을 적어 주세요. 이것만 알아도 어울리는 지퍼 종류와 굵기(호수)를 저희가 골라 드려요.',
    example: '여성 롱패딩 (나일론 겉감) / 남성 데님 재킷 (두꺼운 면)',
    required: true,
  },
  {
    name: 'g_place',
    label: '지퍼 자리·개수',
    title: '지퍼는 어디에, 몇 개 들어가나요?',
    why: '옷 한 벌을 기준으로 자리와 개수, 대략의 길이를 적어 주세요. 길이를 모르면 "앞여밈", "주머니"처럼 자리만 적어도 괜찮아요.',
    example: '앞여밈 1개 (약 60cm), 옆 주머니 2개 (약 15cm)',
  },
  {
    name: 'g_look',
    label: '색과 느낌',
    title: '원하는 색과 느낌이 있나요?',
    why: '테이프 색(원단과 같은 색 등)과 금속 느낌(골드·실버·블랙 등), 참고하고 싶은 옷이나 브랜드를 적어 주세요. 원단이나 참고 사진은 답장 메일에 첨부해 주시면 색을 정확하게 맞출 수 있어요.',
    example: '원단과 같은 남색 테이프, 무광 실버 지퍼, 손잡이에 로고 각인',
  },
  {
    name: 'g_qty',
    label: '수량',
    title: '몇 벌 만들 예정인가요?',
    why: '샘플 수량과 이후 생산할 수량을 나눠 적어 주세요. 정확하지 않아도 괜찮아요. 수량에 맞는 진행 방법과 단가를 안내해 드려요.',
    example: '샘플 2벌, 반응을 보고 100벌 정도',
  },
  {
    name: 'g_date',
    label: '일정',
    title: '언제까지 필요하신가요?',
    why: '샘플이 필요한 날짜와 생산 일정을 알려 주세요. 일정에 맞춰 가능한 방법부터 말씀드려요.',
    example: '12월 중순까지 샘플, 2월 출시 예정',
  },
]

export const GUIDE_MAX = 300

// 메일 본문 맨 앞에 붙일 정리된 안내 양식(빈 칸은 "미정")
export const composeGuide = (stage: string, values: Record<string, string>) => {
  const lines = [
    '— 의류 창업이 처음인 분의 작성 안내 양식 —',
    `지금 단계: ${stage || '미정'}`,
    ...GUIDE_STEPS.map((s) => `${s.label}: ${values[s.name] || '미정'}`),
  ]
  return lines.join('\n')
}
