import type { ReactNode } from 'react'
import { mergeLabels, resolveLabel, type EmptyLabels } from '../../shared/labels'
import styles from './EmptyState.module.css'
import { Button } from '../Button/Button'
import { Placeholder, type PlaceholderKind } from '../../shared/placeholders'

/**
 * 빈 상태의 기본 문구.
 * title은 지금까지 필수 prop이라 기본값이 없었다 — labels만으로도 그릴 수 있게 되면서
 * '아무것도 안 넘긴 EmptyState'가 가능해졌고, 그때 쓸 문구가 필요해졌다.
 */
export const DEFAULT_EMPTY_STATE_LABELS: EmptyLabels & { title: string } = {
  title: '데이터가 없습니다.',
}

export type EmptyStateProps = {
  /**
   * 제목. labels.title로도 줄 수 있다(이 prop이 이긴다).
   * @deprecated 되지 않는다 — EmptyState는 공용 EmptyLabels가 흘러 들어오는 **종착지**라
   * 개별 prop과 labels 두 통로가 모두 1급이다(AdminTable.empty → 여기로 그대로 전달된다).
   */
  title?: string
  description?: string
  /** 기본: kind에 해당하는 공용 Placeholder 그림. 넘기면 이 노드가 우선한다. */
  icon?: ReactNode
  /** icon이 없을 때 그릴 공용 플레이스홀더 종류 — 목록·검색·오류를 골라 쓴다 */
  kind?: PlaceholderKind
  /** 있으면 CTA 버튼이 뜬다(onAction과 짝) */
  actionLabel?: string
  onAction?: () => void
  /** 패딩/아이콘 축소 */
  compact?: boolean
  /** 문구 — 개별 prop(title·description·actionLabel)이 있으면 그쪽이 이긴다 */
  labels?: EmptyLabels
}

export function EmptyState({
  title,
  description,
  icon,
  kind = 'empty',
  actionLabel,
  onAction,
  compact = false,
  labels,
}: EmptyStateProps) {
  const L = mergeLabels(DEFAULT_EMPTY_STATE_LABELS, labels)

  const resolvedTitle = resolveLabel(title, L.title)
  const resolvedDescription = resolveLabel(description, L.description)
  const resolvedActionLabel = resolveLabel(actionLabel, L.actionLabel)

  const className = [styles.emptyState, compact ? styles.compact : ''].filter(Boolean).join(' ')

  return (
    <div className={className}>
      <span className={styles.icon} aria-hidden="true">
        {/* icon을 넘기면 그대로, 없으면 저장소 공용 플레이스홀더로 폴백 */}
        {icon ?? <Placeholder kind={kind} size={compact ? 32 : 48} />}
      </span>
      <span className={styles.title}>{resolvedTitle}</span>
      {resolvedDescription != null && (
        <span className={styles.description}>{resolvedDescription}</span>
      )}
      {resolvedActionLabel != null && (
        <span className={styles.action}>
          <Button variant="primary" size="sm" label={resolvedActionLabel} onClick={onAction} />
        </span>
      )}
    </div>
  )
}
