import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import styles from './Tag.module.css'

/**
 * Tag — 분류(카테고리) 라벨.
 *
 * 역할 구분 — Badge/Chip과 겹치지 않는 지점만 갖는다.
 *  - Badge : 상태. 톤이 면(面)을 채우고, 제거 불가·비대화형.
 *  - Chip  : 선택/제거 가능한 대화형 pill. 루트가 button이라 항상 포커스를 가져가고 톤 축이 없다.
 *  - Tag   : 분류 라벨. 중립 표면 + 톤 점(dot)으로 카테고리를 가리키고 라벨은 대화형이 아니다.
 *            포커스 가능한 건 제거 버튼뿐 → "환불·배송·VIP"처럼 여러 개를 나열해도
 *            탭 순서를 오염시키지 않는다. (Chip은 개당 no-op 버튼이 하나씩 끼어든다)
 */
export type TagProps = {
  label: string
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'
  size?: 'sm' | 'md'
  /** 전달하면 우측에 × 제거 버튼이 붙는다 */
  onRemove?: () => void
  /**
   * 톤 점 (기본 true).
   * 태그를 한 톤(secondary)으로만 쓰는 목록에서는 점이 정보를 더하지 않고 줄만 시끄럽게 한다 —
   * 그럴 때 끄면 순수한 텍스트 라벨이 된다.
   */
  showDot?: boolean
  /** 제거 아이콘 — 기본 lucide X */
  removeIcon?: ReactNode
}

export function Tag({
  label,
  tone = 'secondary',
  size = 'md',
  onRemove,
  showDot = true,
  removeIcon,
}: TagProps) {
  return (
    <span className={[styles.tag, styles[tone], styles[size]].join(' ')}>
      {showDot && <span className={styles.dot} aria-hidden="true" />}
      <span className={styles.label} title={label}>
        {label}
      </span>
      {onRemove != null && (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`${label} 태그 제거`}
        >
          {removeIcon ?? <X size={size === 'sm' ? 10 : 12} strokeWidth={2.4} aria-hidden="true" />}
        </button>
      )}
    </span>
  )
}
