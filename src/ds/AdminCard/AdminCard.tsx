import type { KeyboardEvent, MouseEvent } from 'react'
import styles from './AdminCard.module.css'
import { Badge } from '../Badge/Badge'
import { Checkbox } from '../Checkbox/Checkbox'
import { RowActions } from '../RowActions/RowActions'
import { Toggle } from '../Toggle/Toggle'
import { Placeholder } from '../../shared/placeholders'

export type AdminCardBadge = {
  label: string
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export type AdminCardMeta = {
  label: string
  value: string
}

export type AdminCardProps = {
  thumbnail?: string
  title: string
  subtitle?: string
  /** 썸네일 좌상단 오버레이 배지 — 본문 여백을 흔들지 않는다 */
  badges?: AdminCardBadge[]
  /**
   * 첫 항목이 대표 값(가격 등)으로 크게 강조되고, 나머지는 한 줄 보조 메타로 접힌다.
   * → 라벨-값 테이블이 아니라 위계가 있는 정보 블록이 된다.
   */
  meta?: AdminCardMeta[]
  /** 상태 Toggle — onToggleActive와 함께 있어야 액션 바에 표시된다 */
  active?: boolean
  onToggleActive?: (next: boolean) => void
  /** 액션 바의 상태 라벨 — 기본 '판매중' / '중지' */
  activeLabel?: string
  inactiveLabel?: string
  /** 우상단 선택 체크박스 — onSelectChange가 있어야 표시된다 */
  selected?: boolean
  onSelectChange?: (next: boolean) => void
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
  /** 밀도 — compact는 썸네일 4:3 + 보조 메타 1건으로 축약 */
  density?: 'comfortable' | 'compact'
  /**
   * 썸네일 영역 — 이미지가 정보가 아닌 목록(설정·정책 등)에서 끈다.
   * 배지·선택 체크박스는 썸네일 위에 얹히는 오버레이라 함께 사라지고, 텍스트 전용 카드가 된다.
   */
  showThumbnail?: boolean
  /** 보조 메타(재고·등록일 등) 한 줄 — 대표 값(가격)만 남기고 싶을 때 끈다 */
  showSubMeta?: boolean
  /** 썸네일이 없을 때 플레이스홀더에 적히는 문구 */
  emptyThumbnailLabel?: string
}

export function AdminCard({
  thumbnail,
  title,
  subtitle,
  badges,
  meta,
  active,
  onToggleActive,
  activeLabel = '판매중',
  inactiveLabel = '중지',
  selected = false,
  onSelectChange,
  onEdit,
  onDelete,
  onClick,
  density = 'comfortable',
  showThumbnail = true,
  showSubMeta = true,
  emptyThumbnailLabel = '이미지 없음',
}: AdminCardProps) {
  const clickable = onClick != null
  const hasActions = onToggleActive != null || onEdit != null || onDelete != null
  const compact = density === 'compact'

  // 정보 위계: meta[0] = 대표 값(가격) → 크게 / 나머지 = 보조 메타 → 작게 한 줄
  const primaryMeta = meta?.[0]
  const restMeta = showSubMeta ? (meta ?? []).slice(1) : []
  // compact는 보조 메타를 1건으로 줄여 카드 키를 낮춘다
  const subMeta = compact ? restMeta.slice(0, 1) : restMeta

  const className = [
    styles.adminCard,
    compact ? styles.compact : '',
    clickable ? styles.clickable : '',
    selected ? styles.selected : '',
  ]
    .filter(Boolean)
    .join(' ')

  // 카드 내부 컨트롤(체크박스/토글/아이콘 버튼) 클릭이 카드 onClick으로 번지지 않게 막는다
  const stop = (event: MouseEvent) => event.stopPropagation()

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!clickable) return
    // 카드 본체에서 발생한 Enter/Space만 처리 — 내부 버튼의 키 입력은 무시
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    onClick?.()
    event.preventDefault()
  }

  return (
    <div
      className={className}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {showThumbnail && (
        <div className={styles.media}>
          {thumbnail != null && thumbnail !== '' ? (
            <img className={styles.thumb} src={thumbnail} alt={`${title} 썸네일`} />
          ) : (
            // 썸네일 없음 — 공용 SVG 플레이스홀더가 미디어 박스를 그대로 채운다
            <Placeholder
              kind="image"
              size="fill"
              label={emptyThumbnailLabel}
              className={styles.thumbEmpty}
            />
          )}

          {badges != null && badges.length > 0 && (
            // 좌상단 오버레이 — 배지 유무가 본문 높이에 영향을 주지 않는다
            <div className={styles.badgeOverlay}>
              {badges.map((badge, index) => (
                <span key={`${badge.label}-${index}`} className={styles.badgeChip}>
                  <Badge
                    variant={badge.tone ?? 'secondary'}
                    appearance="soft"
                    size="sm"
                    label={badge.label}
                  />
                </span>
              ))}
            </div>
          )}

          {onSelectChange != null && (
            // 우상단 — 흰 pill + 보더로 썸네일 위에 확실히 앉힌다
            <span className={styles.selectSlot} onClick={stop}>
              <Checkbox checked={selected} onChange={onSelectChange} />
            </span>
          )}
        </div>
      )}

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle != null && <p className={styles.subtitle}>{subtitle}</p>}

        {primaryMeta != null && (
          <dl className={styles.meta}>
            <div className={styles.priceRow}>
              {/* 라벨('가격')은 스크린리더에만 — 화면에는 숫자만 크게 남긴다 */}
              <dt className={styles.srOnly}>{primaryMeta.label}</dt>
              <dd className={styles.price}>{primaryMeta.value}</dd>
            </div>

            {subMeta.length > 0 && (
              <div className={styles.subMeta}>
                {subMeta.map((item, index) => (
                  <div key={`${item.label}-${index}`} className={styles.subMetaItem}>
                    <dt className={styles.subMetaLabel}>{item.label}</dt>
                    <dd className={styles.subMetaValue}>{item.value}</dd>
                  </div>
                ))}
              </div>
            )}
          </dl>
        )}
      </div>

      {hasActions && (
        <div className={styles.actions} onClick={stop}>
          {onToggleActive != null && (
            <Toggle
              checked={active ?? false}
              size="sm"
              label={active === true ? activeLabel : inactiveLabel}
              onChange={onToggleActive}
            />
          )}
          {/* 수정/삭제 아이콘 버튼은 공용 RowActions가 그린다 — 아이콘·툴팁·error 톤·전파 차단이
              목록 행과 카드에서 어긋나지 않게 한 곳에서만 정의한다.
              라벨에 카드 제목을 넣어 여러 카드가 깔려도 접근성 이름이 구별된다. */}
          <span className={styles.iconButtons}>
            <RowActions
              size="sm"
              onEdit={onEdit}
              onDelete={onDelete}
              labels={{ edit: `${title} 수정`, delete: `${title} 삭제` }}
            />
          </span>
        </div>
      )}
    </div>
  )
}
