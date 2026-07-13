import type { KeyboardEvent, MouseEvent } from 'react'
import { ratioClassName, type MediaRatio } from '../Image/Image'
import { Placeholder } from '../../shared/placeholders'
import styles from './ImageCard.module.css'

export type ImageCardProps = {
  image?: string
  title: string
  description?: string
  /**
   * 제목 위 한 줄 라벨(카테고리·분류). below 배치에서만 그린다.
   * 목록 카드에서 '어떤 분류인지'를 제목보다 먼저 읽히게 하는 자리다.
   */
  eyebrow?: string
  /** 비율 축 — 단일 출처는 src/ds/Image/Image.tsx의 MediaRatio */
  ratio?: MediaRatio
  /** 텍스트 배치: below = 이미지 아래 캡션(기존 동작·기본값), overlay = 이미지 안에 텍스트 */
  layout?: 'below' | 'overlay'
  /** overlay일 때 텍스트 세로 위치 */
  align?: 'top' | 'center' | 'bottom'
  /** overlay 가독성 처리 */
  scrim?: 'gradient' | 'solid' | 'none'
  /** 좌상단 배지(예: NEW, 이벤트) */
  badge?: string
  /** 하단 CTA 라벨 — 있으면 버튼 노출 */
  actionLabel?: string
  onAction?: () => void
  onClick?: () => void
  rounded?: boolean
  /**
   * true면 카드가 그리드 셀을 꽉 채운다(기본 320px 상한 해제).
   * 갤러리 그리드에서는 열 폭을 목록이 정하고 카드는 따라가야 한다.
   */
  fill?: boolean
}

const alignClass: Record<NonNullable<ImageCardProps['align']>, string> = {
  top: styles.alignTop,
  center: styles.alignCenter,
  bottom: styles.alignBottom,
}

/** 스크림은 텍스트가 놓이는 방향으로 어두워져야 하므로 align과 함께 결정한다. */
function scrimClass(
  scrim: NonNullable<ImageCardProps['scrim']>,
  align: NonNullable<ImageCardProps['align']>
): string {
  if (scrim === 'none') return ''
  if (scrim === 'solid') return styles.scrimSolid
  if (align === 'top') return styles.scrimGradientTop
  if (align === 'center') return styles.scrimGradientCenter
  return styles.scrimGradientBottom
}

export function ImageCard({
  image,
  title = '이미지 카드',
  description,
  eyebrow,
  ratio = '16x9',
  layout = 'below',
  align = 'bottom',
  scrim = 'gradient',
  badge,
  actionLabel,
  onAction,
  onClick,
  rounded = true,
  fill = false,
}: ImageCardProps) {
  const isOverlay = layout === 'overlay'
  const interactive = Boolean(onClick)

  const cardClassName = [
    styles.card,
    rounded ? styles.rounded : '',
    interactive ? styles.interactive : '',
    fill ? styles.fill : '',
  ]
    .filter(Boolean)
    .join(' ')

  const mediaClassName = [
    styles.media,
    ratioClassName(styles, ratio),
    isOverlay ? styles.mediaOverlay : '',
  ]
    .filter(Boolean)
    .join(' ')

  // CTA 클릭이 카드 전체 onClick으로 번지지 않게 한다.
  const handleAction = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onAction?.()
  }

  // onClick이 있으면 카드가 버튼처럼 Enter·Space에 반응한다.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onClick?.()
  }

  const badgeNode = badge ? <span className={styles.badge}>{badge}</span> : null

  const actionNode = actionLabel ? (
    <button
      type="button"
      className={isOverlay ? styles.overlayAction : styles.action}
      onClick={handleAction}
    >
      {actionLabel}
    </button>
  ) : null

  return (
    <div
      className={cardClassName}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className={mediaClassName}>
        {image ? (
          <img className={styles.image} src={image} alt={isOverlay ? '' : title} />
        ) : (
          // image가 없으면 overlay·below 어느 배치든 공용 대체 이미지로 채운다
          <Placeholder kind="image" size="fill" className={styles.placeholder} />
        )}

        {isOverlay && (
          <>
            {scrim !== 'none' && (
              <div className={`${styles.scrim} ${scrimClass(scrim, align)}`} aria-hidden="true" />
            )}
            {badgeNode}
            <div className={`${styles.overlayBody} ${alignClass[align]}`}>
              <h3 className={styles.overlayTitle}>{title}</h3>
              {description && <p className={styles.overlayDescription}>{description}</p>}
              {actionNode}
            </div>
          </>
        )}

        {!isOverlay && badgeNode}
      </div>

      {!isOverlay && (
        <div className={styles.body}>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
          {actionNode}
        </div>
      )}
    </div>
  )
}
