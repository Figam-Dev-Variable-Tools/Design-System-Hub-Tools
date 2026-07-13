import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '../Button/Button'
import { Placeholder } from '../../shared/placeholders'
import { Video } from '../Video/Video'
import styles from './ImagePreview.module.css'

export type ImagePreviewItem = {
  url: string
  name?: string
  kind?: 'image' | 'video'
}

export type ImagePreviewProps = {
  open: boolean
  items: ImagePreviewItem[]
  index?: number
  onIndexChange?: (i: number) => void
  onClose?: () => void
  /** 문서/데모용 인라인 렌더 — fixed 오버레이 없이 정적 배치(Modal 관례와 동일) */
  inline?: boolean

  /*
   * ── 요소 ON/OFF (기본 전부 true) ──
   * 같은 뷰어가 '첨부 미리보기'(파일명·카운터·확대까지)와 '이미지 한 장 크게 보기'(스테이지만)
   * 양쪽에 쓰인다. false면 그 요소가 DOM에서 완전히 사라진다(빈 자리·여백이 남지 않는다).
   */
  /** 상단 줄 전체(파일명 + 카운터 + 확대/축소 + 닫기) */
  showHeader?: boolean
  /** 상단 '3 / 8' 카운터 */
  showCount?: boolean
  /** 확대/축소 버튼 + 배율 표시 — 이미지 항목에서만 원래 뜬다 */
  showZoom?: boolean
  /** 스테이지 좌우 이동 버튼 — 항목이 2개 이상일 때만 원래 뜬다 */
  showNav?: boolean
  /** 하단 썸네일 스트립 — 항목이 2개 이상일 때만 원래 뜬다 */
  showThumbnails?: boolean

  /* ── 아이콘 슬롯 — 없으면 기존 lucide 기본 아이콘 ── */
  closeIcon?: ReactNode
  prevIcon?: ReactNode
  nextIcon?: ReactNode
  zoomInIcon?: ReactNode
  zoomOutIcon?: ReactNode
}

/** 확대 단계 — "과하지 않게": 3단만 둔다 */
const ZOOM_STEPS = [1, 1.5, 2] as const

/*
 * 공용 Modal을 쓰지 않는 이유(백드롭·Esc·role=dialog가 겹치는 건 알고 있다).
 * Modal의 API로는 이 화면을 만들 수 없다 — 세 가지가 없다.
 *  1) 헤더 액션 슬롯: Modal 헤더는 `title`(문자열) + 고정 닫기 버튼뿐이라
 *     카운터·확대/축소 컨트롤을 헤더 우측에 넣을 자리가 없다.
 *  2) full-bleed 본문: Modal의 body에는 패딩이 고정으로 들어가 있어, 패널 폭을 꽉 채우는
 *     확대 스테이지(좌우 이동 버튼이 스테이지에 절대 배치되는)를 만들 수 없다.
 *  3) 좌우 방향키 이동: Modal의 키 훅은 Esc 하나뿐이다.
 * Modal에 orientation/headerActions/bodyPadding 축을 늘리면 다른 화면들의 매니페스트가 흔들리므로,
 * 여기서는 같은 관례(backdrop · role="dialog" · inline)만 맞춰 자체 패널을 유지한다.
 */
export function ImagePreview({
  open,
  items,
  index = 0,
  onIndexChange,
  onClose,
  inline = false,
  showHeader = true,
  showCount = true,
  showZoom = true,
  showNav = true,
  showThumbnails = true,
  closeIcon,
  prevIcon,
  nextIcon,
  zoomInIcon,
  zoomOutIcon,
}: ImagePreviewProps) {
  const [zoomStep, setZoomStep] = useState(0)

  const count = items.length
  // 범위를 벗어난 index가 들어와도 깨지지 않게 고정
  const safeIndex = count === 0 ? 0 : Math.min(Math.max(index, 0), count - 1)
  const current: ImagePreviewItem | undefined = items[safeIndex]
  const kind = current?.kind ?? 'image'

  const go = useCallback(
    (next: number) => {
      if (count === 0) return
      onIndexChange?.((next + count) % count)
    },
    [count, onIndexChange],
  )

  // 항목이 바뀌면 확대 초기화
  useEffect(() => {
    setZoomStep(0)
  }, [safeIndex])

  // Esc 닫기 / 좌우 이동 — inline은 정적 렌더라 전역 리스너를 걸지 않는다
  useEffect(() => {
    if (!open || inline) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.()
      else if (event.key === 'ArrowLeft') go(safeIndex - 1)
      else if (event.key === 'ArrowRight') go(safeIndex + 1)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, inline, onClose, go, safeIndex])

  if (!open) return null

  const zoom = ZOOM_STEPS[zoomStep]
  // 확대는 원래도 '이미지 + URL이 있을 때'만 열린다 — showZoom은 그 위에 얹는 화면 스위치다
  const canZoom = showZoom && kind === 'image' && current?.url != null && current.url !== ''
  const hasMultiple = count > 1

  const stage =
    kind === 'video' ? (
      // 동영상은 기존 Video 컴포넌트 재사용(src 없으면 Video가 알아서 video 플레이스홀더)
      <div className={styles.videoWrap}>
        <Video src={current?.url} title={current?.name} ratio="16x9" />
      </div>
    ) : current?.url ? (
      <img
        className={styles.image}
        src={current.url}
        alt={current.name ?? ''}
        style={{ transform: `scale(${zoom})` }}
      />
    ) : (
      // 이미지가 없으면 공용 플레이스홀더
      <div className={styles.fallback}>
        <Placeholder kind="image" size="fill" label="이미지를 불러올 수 없습니다" />
      </div>
    )

  const panel = (
    <div
      role="dialog"
      aria-modal={!inline}
      aria-label={current?.name ?? '첨부 미리보기'}
      className={[styles.panel, inline ? styles.inlinePanel : ''].filter(Boolean).join(' ')}
      onClick={(event) => event.stopPropagation()}
    >
      {/*
       * 헤더의 아이콘 버튼은 공용 Button(ghost)의 iconOnly 축이 그린다. label('닫기'·'확대')은
       * 화면에서만 감춰지고 DOM에는 남아 그대로 버튼의 접근성 이름이 된다.
       */}
      {showHeader && (
        <div className={styles.header}>
          <span className={styles.name} title={current?.name}>
            {current?.name ?? '미리보기'}
          </span>

          <div className={styles.headerActions}>
            {showCount && count > 0 && (
              <span className={styles.counter}>
                {safeIndex + 1} / {count}
              </span>
            )}

            {canZoom && (
              <>
                <Button
                  variant="secondary"
                  appearance="ghost"
                  size="sm"
                  label="축소"
                  iconOnly
                  showLeftIcon
                  leftIcon={zoomOutIcon ?? <ZoomOut size={16} aria-hidden="true" />}
                  disabled={zoomStep === 0}
                  onClick={() => setZoomStep((s) => Math.max(0, s - 1))}
                />
                <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
                <Button
                  variant="secondary"
                  appearance="ghost"
                  size="sm"
                  label="확대"
                  iconOnly
                  showLeftIcon
                  leftIcon={zoomInIcon ?? <ZoomIn size={16} aria-hidden="true" />}
                  disabled={zoomStep === ZOOM_STEPS.length - 1}
                  onClick={() => setZoomStep((s) => Math.min(ZOOM_STEPS.length - 1, s + 1))}
                />
              </>
            )}

            <Button
              variant="secondary"
              appearance="ghost"
              size="sm"
              label="닫기"
              iconOnly
              showLeftIcon
              leftIcon={closeIcon ?? <X size={16} aria-hidden="true" />}
              onClick={onClose}
            />
          </div>
        </div>
      )}

      <div className={styles.stage}>
        {showNav && hasMultiple && (
          <span className={[styles.nav, styles.prev].join(' ')}>
            <Button
              variant="secondary"
              appearance="outline"
              size="sm"
              label="이전 항목"
              iconOnly
              showLeftIcon
              leftIcon={prevIcon ?? <ChevronLeft size={20} aria-hidden="true" />}
              onClick={() => go(safeIndex - 1)}
            />
          </span>
        )}

        <div className={styles.viewport}>{stage}</div>

        {showNav && hasMultiple && (
          <span className={[styles.nav, styles.next].join(' ')}>
            <Button
              variant="secondary"
              appearance="outline"
              size="sm"
              label="다음 항목"
              iconOnly
              showLeftIcon
              leftIcon={nextIcon ?? <ChevronRight size={20} aria-hidden="true" />}
              onClick={() => go(safeIndex + 1)}
            />
          </span>
        )}
      </div>

      {showThumbnails && hasMultiple && (
        <div className={styles.strip} role="tablist" aria-label="첨부 목록">
          {items.map((item, i) => (
            <button
              key={`${item.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === safeIndex}
              className={[styles.thumb, i === safeIndex ? styles.thumbActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onIndexChange?.(i)}
              aria-label={item.name ?? `${i + 1}번째 항목`}
            >
              {item.kind === 'video' || !item.url ? (
                <Placeholder kind={item.kind === 'video' ? 'video' : 'image'} size="fill" />
              ) : (
                <img className={styles.thumbImage} src={item.url} alt="" loading="lazy" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  if (inline) return <div className={styles.inlineRoot}>{panel}</div>

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {panel}
    </div>
  )
}
