'use client'

import { startTransition, useActionState, useState } from 'react'
import { sendInquiry, type InquiryState } from '@/app/actions/inquiry'
import { ANSWER_MAX, CHOICES, FILES_MAX, FILES_MAX_TOTAL, FILE_ACCEPT, MODES, TEXTS, UNDECIDED, fileAllowed, formatBytes, type Mode } from '@/lib/inquiryForm'

// 상담 문의 폼. 서버 액션(sendInquiry) → 백엔드 API 가 hyunwoo.kim@daeyanging.com 으로 메일(첨부 포함)을 보내고,
// 보낸 분께는 접수 확인 메일을 보낸다.
// 맨 위 두 칸으로 작성 방식을 고른다: 양식으로 작성(기본, 사양을 고르거나 짧게) / 자유롭게 작성(글 한 칸).
// 두 방식을 오가도 적어 둔 내용은 그대로 남는다. 실패하면 적은 내용과 첨부를 그대로 둔다.
const INITIAL: InquiryState = { status: 'idle', message: '' }

// 브라우저가 바로 그릴 수 있는 이미지만 작은 미리보기를 띄운다(HEIC·PSD 등은 확장자만)
const PREVIEW_RE = /^image\/(jpeg|png|gif|webp|avif|bmp|svg\+xml)$/

const Thumb = ({ file }: { file: File }) =>
  PREVIEW_RE.test(file.type) ? (
    // eslint-disable-next-line @next/next/no-img-element -- 사용자가 고른 파일(blob:) 미리보기
    <img
      className="files__thumb"
      alt=""
      ref={(img) => {
        if (!img) return
        const url = URL.createObjectURL(file)
        img.src = url
        return () => URL.revokeObjectURL(url)
      }}
    />
  ) : (
    <span className="files__thumb files__thumb--doc" aria-hidden="true">
      {(file.name.split('.').pop() ?? '').slice(0, 4).toUpperCase()}
    </span>
  )

// 좁은 화면의 선택지 열 수: 짧은 말(3자 이하)이 5개 이하면 한 줄에 다 놓고, 아니면 3열(남는 칸이 덜 생기게)
const mobileCols = (opts: string[]) => (opts.length <= 5 && opts.every((o) => o.length <= 3) ? opts.length : 3)

const ContactForm = ({ email }: { email: string }) => {
  const [state, action, pending] = useActionState(sendInquiry, INITIAL)
  const f = state.fields
  const [mode, setMode] = useState<Mode>(f?.mode ?? 'form')
  const [answers, setAnswers] = useState<Record<string, string>>(f?.answers ?? {})
  const [files, setFiles] = useState<File[]>([])
  const [fileErr, setFileErr] = useState('')
  const [drag, setDrag] = useState(false)

  // 보내기에 성공하면 모두 비운다(렌더 중 상태 조정 — 이펙트 없이 한 번만)
  const [seen, setSeen] = useState(state)
  const [round, setRound] = useState(0) // 성공할 때마다 늘려 폼을 새로 그린다(빈 칸으로)
  if (seen !== state) {
    setSeen(state)
    if (state.status === 'sent') {
      setAnswers({})
      setFiles([])
      setFileErr('')
      setRound((r) => r + 1)
    }
  }

  const setAnswer = (name: string, v: string) => setAnswers((a) => ({ ...a, [name]: v.slice(0, ANSWER_MAX) }))

  const total = files.reduce((n, x) => n + x.size, 0)
  const addFiles = (list: FileList | null) => {
    if (!list?.length) return
    const next = [...files]
    let err = ''
    for (const file of list) {
      if (!fileAllowed(file)) {
        err = `${file.name}: 이미지, PDF 파일만 첨부 가능합니다.`
        continue
      }
      if (next.some((x) => x.name === file.name && x.size === file.size)) continue
      if (next.length >= FILES_MAX) {
        err = `첨부는 최대 ${FILES_MAX}개입니다.`
        break
      }
      if (next.reduce((n, x) => n + x.size, 0) + file.size > FILES_MAX_TOTAL) {
        err = `첨부는 합계 ${formatBytes(FILES_MAX_TOTAL)}까지입니다. 큰 파일은 회신 메일로 보내 주세요.`
        continue
      }
      next.push(file)
    }
    setFiles(next)
    setFileErr(err)
  }
  const removeFile = (i: number) => {
    setFiles((fs) => fs.filter((_, j) => j !== i))
    setFileErr('')
  }

  // 자바스크립트가 있으면 직접 보낸다 — React 의 자동 폼 초기화를 건너뛰어, 실패해도 고른 상태·첨부가 그대로 남는다.
  // 첨부는 상태에 모아 둔 파일로 바꿔 싣는다. (자바스크립트가 없으면 action 으로 일반 전송)
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    data.delete('files')
    files.forEach((file) => data.append('files', file, file.name))
    startTransition(() => action(data))
  }

  return (
    <form key={round} className="form" action={action} onSubmit={onSubmit} data-status={state.status} data-mode={mode} aria-busy={pending}>
      {/* 봇만 채우는 칸 — 화면과 보조기기 모두에서 숨긴다 */}
      <div className="form__trap" aria-hidden="true">
        <label>
          웹사이트
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="mode" role="radiogroup" aria-label="작성 방식">
        {MODES.map((m) => (
          <label key={m.key} className="mode__btn">
            <input type="radio" name="mode" value={m.key} checked={mode === m.key} onChange={() => setMode(m.key)} />
            {m.label}
          </label>
        ))}
      </div>

      <div className="form__row">
        <label>
          <span>성함 / 회사명</span>
          <input name="name" type="text" placeholder="홍길동 / (주)○○" autoComplete="name" maxLength={80} required defaultValue={f?.name} />
        </label>
        <label>
          <span>이메일</span>
          <input name="email" type="email" placeholder="you@company.com" autoComplete="email" maxLength={200} required defaultValue={f?.email} />
        </label>
      </div>

      {/* 양식으로 작성: 자바스크립트가 없어도 CSS(:has)로 방식에 맞는 칸만 보인다 */}
      <fieldset className="spec-f" disabled={mode !== 'form'}>
        <legend className="sr-only">사양</legend>
        {CHOICES.map((c) => (
          <div key={c.name} className="spec-f__fld" role="radiogroup" aria-labelledby={`${c.name}-k`}>
            <span className="spec-f__k" id={`${c.name}-k`}>
              {c.label}
            </span>
            <div className="opts" style={{ '--m-cols': mobileCols([...c.options!, UNDECIDED]) } as React.CSSProperties}>
              {[...c.options!, UNDECIDED].map((o) => (
                <label key={o} className="opt" data-muted={o === UNDECIDED || undefined}>
                  <input
                    type="radio"
                    name={c.name}
                    value={o}
                    checked={answers[c.name] === o}
                    onChange={() => setAnswer(c.name, o)}
                    // 고른 것을 다시 누르면 선택 해제
                    onClick={() => answers[c.name] === o && setAnswer(c.name, '')}
                  />
                  {o}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="spec-f__texts">
          {TEXTS.map((t) => (
            <label key={t.name} className="spec-f__fld">
              <span className="spec-f__k">{t.label}</span>
              <input
                name={t.name}
                type="text"
                placeholder={t.placeholder}
                value={answers[t.name] ?? ''}
                onChange={(e) => setAnswer(t.name, e.currentTarget.value)}
                maxLength={ANSWER_MAX}
                autoComplete="off"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="form__msg">
        <span>{mode === 'form' ? '추가 요청사항' : '문의 내용'}</span>
        <textarea
          name="message"
          rows={mode === 'form' ? 3 : 8}
          placeholder={mode === 'form' ? '용도, 참고 사항 등' : '종류, 호수, 길이, 형태, 컬러, 마감, 수량, 납기 등'}
          maxLength={5000}
          required={mode === 'free'}
          defaultValue={f?.message}
        />
      </label>

      <div className="files">
        <p className="files__h">
          첨부 파일 <span className="files__limit">이미지·PDF · 최대 {FILES_MAX}개 · {formatBytes(FILES_MAX_TOTAL)}</span>
        </p>
        <label
          className="files__drop"
          data-drag={drag || undefined}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            addFiles(e.dataTransfer.files)
          }}
        >
          <input
            className="files__input"
            name="files"
            type="file"
            multiple
            accept={FILE_ACCEPT}
            onChange={(e) => {
              addFiles(e.currentTarget.files)
              e.currentTarget.value = ''
            }}
          />
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>파일 선택 또는 끌어다 놓기</span>
        </label>
        {files.length > 0 && (
          <ul className="files__list">
            {files.map((file, i) => (
              <li key={`${file.name}-${file.size}-${file.lastModified}`}>
                <Thumb file={file} />
                <span className="files__name">{file.name}</span>
                <span className="files__size">{formatBytes(file.size)}</span>
                <button type="button" className="files__rm" onClick={() => removeFile(i)} aria-label={`${file.name} 삭제`}>
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
        {(fileErr || files.length > 0) && (
          <p className="files__note" role="status" data-err={fileErr ? '' : undefined}>
            {fileErr || `${files.length}개 · ${formatBytes(total)}`}
          </p>
        )}
      </div>

      <button className="btn btn--ink form__send" type="submit" disabled={pending}>
        {pending ? '보내는 중…' : '문의 보내기'}
      </button>
      <p className="form__note" role="status" aria-live="polite">
        {state.status === 'idle' ? (
          '접수 즉시 확인 메일이 발송되며, 검토 후 메일로 회신드립니다.'
        ) : state.status === 'error' ? (
          <>
            {state.message} <a href={`mailto:${email}`}>{email}</a>
          </>
        ) : (
          state.message
        )}
      </p>
    </form>
  )
}

export default ContactForm
