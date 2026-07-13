import { mergeLabels, resolveLabel, type LoadingLabels } from '../../shared/labels'
import styles from './Loading.module.css'

/**
 * 기본 문구 — 접근성 이름(role="status")에만 쓰인다.
 * '불러오는 중'이 아니라 '로딩 중'인 이유: 지금까지의 기본 렌더가 그랬고, 기본값이 바뀌면 회귀다.
 */
export const DEFAULT_LOADING_LABELS: Required<LoadingLabels> = {
  loading: '로딩 중',
}

export type LoadingProps = {
  variant?: 'spinner' | 'dots'
  size?: 'sm' | 'md' | 'lg'
  /**
   * 인디케이터 아래에 **보이는** 텍스트. 넘기면 접근성 이름도 이 글자가 된다.
   * 이름만 바꾸고 글자는 보이지 않게 하려면 labels.loading을 쓴다.
   */
  label?: string
  /** true면 부모를 덮는 반투명 오버레이로 중앙 배치 — 부모에 position: relative가 필요하다 */
  overlay?: boolean
  /** 접근성 이름(role="status") — 개별 prop(label)이 있으면 그쪽이 이긴다 */
  labels?: LoadingLabels
}

export function Loading({
  variant = 'spinner',
  size = 'md',
  label,
  overlay = false,
  labels,
}: LoadingProps) {
  const L = mergeLabels(DEFAULT_LOADING_LABELS, labels)
  // 보이는 글자가 있으면 그것이 곧 이름이다 — 같은 뜻을 두 번 낭독하지 않는다
  const name = resolveLabel(label, L.loading)

  const className = [styles.loading, styles[size], overlay ? styles.overlay : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className} role="status" aria-label={name}>
      {variant === 'spinner' ? (
        <svg className={styles.spinner} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="47.1"
            strokeDashoffset="14"
          />
        </svg>
      ) : (
        <span className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </span>
      )}
      {label != null && label !== '' && <span className={styles.label}>{label}</span>}
    </div>
  )
}
