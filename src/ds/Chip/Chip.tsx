import type { ReactNode } from 'react'
import styles from './Chip.module.css'

/** 제거(×) 버튼의 접근성 이름 기본값 — 아이콘뿐이라 어떤 칩을 지우는지 이름으로만 알 수 있다 */
const defaultRemoveLabel = (label: string): string => `${label} 제거`

export type ChipProps = {
  label: string
  selected?: boolean
  onSelect?: () => void
  /** 전달하면 우측에 × 제거 버튼이 생긴다 */
  onRemove?: () => void
  disabled?: boolean
  size?: 'sm' | 'md'
  leading?: ReactNode
  /**
   * 제거(×) 버튼의 접근성 이름 — 기본 `{label} 제거`.
   * 칩이 필터 조건이 아닌 다른 것(태그·수신자)일 때 '제거'가 맞는 말이 아닐 수 있어 연다.
   */
  removeLabel?: string
}

export function Chip({
  label,
  selected = false,
  onSelect,
  onRemove,
  disabled = false,
  size = 'md',
  leading,
  removeLabel,
}: ChipProps) {
  const className = [
    styles.chip,
    styles[size],
    selected ? styles.selected : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <button
        type="button"
        className={styles.action}
        onClick={onSelect}
        disabled={disabled}
        aria-pressed={selected}
      >
        {leading != null && (
          <span className={styles.leading} aria-hidden="true">
            {leading}
          </span>
        )}
        <span className={styles.label}>{label}</span>
      </button>
      {onRemove != null && (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          disabled={disabled}
          aria-label={removeLabel ?? defaultRemoveLabel(label)}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M2 2L8 8M8 2L2 8" />
          </svg>
        </button>
      )}
    </div>
  )
}
