import type { ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonProps = {
  variant: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'neutral'
  appearance?: 'solid' | 'outline' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  label: string
  // 레거시 좌측 아이콘 슬롯(하위호환) — leftIcon이 없을 때만 왼쪽에 렌더된다.
  showIcon?: boolean
  icon?: ReactNode
  // 좌/우 아이콘 슬롯. 아이콘 위치는 boolean + ReactNode 조합으로만 표현한다
  // (문자열 유니온 prop을 추가하면 variant 축이 늘어 Figma 매니페스트가 깨진다).
  showLeftIcon?: boolean
  leftIcon?: ReactNode
  showRightIcon?: boolean
  rightIcon?: ReactNode
  // true면 버튼이 부모 폭을 꽉 채운다(폼 하단 제출 CTA). 문자열 유니온이 아니라
  // boolean이므로 variant 축이 늘지 않는다 — showLeftIcon과 같은 결의 축이다.
  fullWidth?: boolean
  // 아이콘만 보이는 정사각 버튼(표의 행 액션·툴바). label은 화면에서 감춰지지만 지워지지 않는다 —
  // 버튼의 접근성 이름으로 계속 쓰인다(스크린리더는 아이콘을 읽지 못한다).
  // 이 축이 없던 동안 각 화면이 "라벨을 sr-only로 감추는 CSS"를 따로 만들어 쓰고 있었다.
  iconOnly?: boolean
  // 함수 타입은 §3 매핑 파서(scripts/lib/ds-props.mjs)가 무시하므로 Figma 매니페스트
  // 왕복 동일성에 영향이 없다.
  onClick?: () => void
}

export function Button({
  variant,
  appearance = 'solid',
  size,
  disabled = false,
  label,
  showIcon = false,
  icon,
  showLeftIcon = false,
  leftIcon,
  showRightIcon = false,
  rightIcon,
  fullWidth = false,
  iconOnly = false,
  onClick,
}: ButtonProps) {
  const className = [
    styles.button,
    styles[variant],
    styles[appearance],
    styles[size],
    disabled ? styles.disabled : '',
    fullWidth ? styles.fullWidth : '',
    iconOnly ? styles.iconOnly : '',
  ]
    .filter(Boolean)
    .join(' ')

  // 좌측: leftIcon 우선, 없으면 레거시 icon
  const left = showLeftIcon && leftIcon != null ? leftIcon : showIcon && icon != null ? icon : null
  const right = showRightIcon && rightIcon != null ? rightIcon : null

  return (
    <button type="button" className={className} disabled={disabled} onClick={onClick}>
      {left != null && (
        <span className={styles.icon} aria-hidden="true">
          {left}
        </span>
      )}
      {/* iconOnly여도 라벨을 지우지 않는다 — 화면에서만 감추고 접근성 이름으로 남긴다 */}
      <span className={iconOnly ? styles.srOnly : styles.label}>{label}</span>
      {right != null && (
        <span className={styles.icon} aria-hidden="true">
          {right}
        </span>
      )}
    </button>
  )
}
