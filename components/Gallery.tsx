'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { GALLERY, GALLERY_TAGS, tagLabel, type GalleryTag } from '@/lib/gallery'
import { PHOTO_QUALITY } from '@/lib/photos'

// 제품 화면의 사진 갤러리: 종류별로 걸러 보고, 누르면 크게(앞뒤 넘기기 · 화살표 키 · 밀어 넘기기).
// 크게 보기는 <dialog> 의 모달이라 Esc 로 닫히고, 닫으면 누른 사진으로 초점이 돌아간다.

type Filter = 'all' | GalleryTag

const Gallery = () => {
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState(0)
  const dlg = useRef<HTMLDialogElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const swipe = useRef<number | null>(null)

  const items = filter === 'all' ? GALLERY : GALLERY.filter((g) => g.tags.includes(filter))
  const cur = items[Math.min(open, items.length - 1)]
  const go = (d: number) => setOpen((i) => (i + d + items.length) % items.length)

  const show = (i: number) => {
    setOpen(i)
    dlg.current?.showModal()
    // 처음 초점은 닫기 단추(맨 앞 링크 '문의하기'에 초점 테두리가 생기지 않게)
    closeBtn.current?.focus()
  }

  return (
    <section className="sec gal" id="gallery" aria-labelledby="gallery-h">
      <div className="wrap">
        <h2 className="h2" id="gallery-h">
          다양한 지퍼를
          <br />
          자유롭게.
        </h2>

        <div className="seg2 gal__seg" role="radiogroup" aria-label="종류">
          {(['all', ...GALLERY_TAGS.map((t) => t.id)] as Filter[]).map((t) => (
            <label key={t} className="seg2__btn">
              <input
                type="radio"
                name="gal-filter"
                value={t}
                checked={filter === t}
                onChange={() => {
                  setFilter(t)
                  setOpen(0)
                }}
              />
              {t === 'all' ? '전체' : tagLabel(t)}
            </label>
          ))}
        </div>

        <ul className="gal__grid">
          {items.map((g, i) => (
            <li key={g.id} className="gal__item" data-tall={g.tall || undefined}>
              <button type="button" className="gal__tile" onClick={() => show(i)} aria-label={`${g.title} 크게 보기`}>
                <Image
                  src={g.photo.src}
                  alt={g.photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 340px"
                  quality={PHOTO_QUALITY}
                  placeholder="blur"
                />
                <span className="gal__cap" aria-hidden="true">
                  {g.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dlg}
        className="gal__dlg"
        aria-label="사진 크게 보기"
        onClick={(e) => {
          // 사진·버튼 밖(어두운 바탕)을 누르면 닫는다
          if (e.target === e.currentTarget) e.currentTarget.close()
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1)
          else if (e.key === 'ArrowLeft') go(-1)
        }}
        onPointerDown={(e) => {
          swipe.current = e.pointerType === 'mouse' ? null : e.clientX
        }}
        onPointerUp={(e) => {
          if (swipe.current === null) return
          const dx = e.clientX - swipe.current
          swipe.current = null
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
        }}
      >
        {cur && (
          <figure className="gal__fig">
            <div className="gal__stage" onClick={(e) => e.target === e.currentTarget && dlg.current?.close()}>
              <Image
                key={cur.id}
                src={cur.photo.src}
                alt={cur.photo.alt}
                sizes="(max-width: 1280px) 100vw, 1280px"
                quality={PHOTO_QUALITY}
                placeholder="blur"
                className="gal__big"
              />
            </div>
            <figcaption className="gal__info">
              <p className="gal__count" aria-live="polite">
                {Math.min(open, items.length - 1) + 1} / {items.length}
              </p>
              <p className="gal__title">{cur.title}</p>
              <p className="gal__kind">{cur.tags.map(tagLabel).join(' · ')}</p>
              <Link href="/contact" className="gal__cta">
                이런 지퍼 문의하기 <span aria-hidden="true">→</span>
              </Link>
            </figcaption>
          </figure>
        )}
        {items.length > 1 && (
          <>
            <button type="button" className="gal__nav gal__nav--prev" onClick={() => go(-1)} aria-label="이전 사진">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button type="button" className="gal__nav gal__nav--next" onClick={() => go(1)} aria-label="다음 사진">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        <button ref={closeBtn} type="button" className="gal__close" onClick={() => dlg.current?.close()} aria-label="닫기">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </dialog>
    </section>
  )
}

export default Gallery
