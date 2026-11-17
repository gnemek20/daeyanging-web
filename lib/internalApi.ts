// 백엔드 API(내부 네트워크) 호출 — 무중단 교체 중 옛 컨테이너가 막 멈추는 순간에 연결이 거절되면 한 번 더 시도한다.
// 거절(ECONNREFUSED)·이름 못 찾음은 요청이 아예 전달되지 않은 경우라 다시 보내도 메일이 두 번 가지 않는다.
const RETRYABLE = new Set(['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'UND_ERR_SOCKET'])

const notDelivered = (err: unknown) => {
  const cause = (err as { cause?: { code?: string } })?.cause
  return err instanceof TypeError && !!cause?.code && RETRYABLE.has(cause.code)
}

export async function internalFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (err) {
    if (!notDelivered(err)) throw err
    await new Promise((r) => setTimeout(r, 400))
    return fetch(url, init)
  }
}
