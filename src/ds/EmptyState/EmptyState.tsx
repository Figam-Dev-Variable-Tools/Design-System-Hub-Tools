import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'
import { Button } from '../Button/Button'
import { Placeholder, type PlaceholderKind } from '../../shared/placeholders'

export type EmptyStateProps = {
  title: string
  description?: string
  /** 기본: kind에 해당하는 공용 Placeholder 그림. 넘기면 이 노드가 우선한다. */
  icon?: ReactNode
  /** icon이 없을 때 그릴 공용 플레이스홀더 종류 — 목록·검색·오류를 골라 쓴다 */
  kind?: PlaceholderKind
  actionLabel?: string
  onAction?: () => void
  /** 패딩/아이콘 축소 */
  compact?: boolean
}

export function EmptyState({
  title,
  description,
  icon,
  kind = 'empty',
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  const className = [styles.emptyState, compact ? styles.compact : ''].filter(Boolean).join(' ')

  return (
    <div className={className}>
      <span className={styles.icon} aria-hidden="true">
        {/* icon을 넘기면 그대로, 없으면 저장소 공용 플레이스홀더로 폴백 */}
        {icon ?? <Placeholder kind={kind} size={compact ? 32 : 48} />}
      </span>
      <span className={styles.title}>{title}</span>
      {description != null && <span className={styles.description}>{description}</span>}
      {actionLabel != null && (
        <span className={styles.action}>
          <Button variant="primary" size="sm" label={actionLabel} onClick={onAction} />
        </span>
      )}
    </div>
  )
}
