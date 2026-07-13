import styles from './Badge.module.css'

export type BadgeProps = {
  variant: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'neutral'
  appearance?: 'solid' | 'soft' | 'outline'
  label: string
  size: 'sm' | 'md'
}

export function Badge({ variant, appearance = 'soft', label, size }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[variant], styles[appearance], styles[size]].join(' ')} title={label}>
      {/* 라벨을 별도 span으로 감싸야 flex 컨테이너에서 말줄임이 먹는다 */}
      <span className={styles.label}>{label}</span>
    </span>
  )
}
