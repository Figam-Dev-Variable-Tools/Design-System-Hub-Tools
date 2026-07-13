import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import styles from './ViewSwitch.module.css'

export type ViewSwitchValue = 'card' | 'board'

export type ViewSwitchProps = {
  value: ViewSwitchValue
  onChange: (value: ViewSwitchValue) => void
  size?: 'sm' | 'md'
  /**
   * 라벨('카드형'·'게시물형') ON/OFF (기본 ON).
   * OFF면 아이콘만 남는다 — 툴바가 좁은 사이트 목록용. 라벨을 지워도 스크린리더용 aria-label은 남는다.
   */
  showLabel?: boolean
}

// 카드형 / 게시물형 두 가지 — 방향키 이동 순서를 이 배열 순서로 고정
const OPTIONS: { value: ViewSwitchValue; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'card', label: '카드형', icon: LayoutGrid },
  { value: 'board', label: '게시물형', icon: List },
]

export function ViewSwitch({
  value,
  onChange,
  size = 'md',
  showLabel = true,
}: ViewSwitchProps) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // 좌우/상하 방향키로 선택 이동 (radiogroup 관례)
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown'
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp'
    if (!forward && !backward) return

    const index = OPTIONS.findIndex((option) => option.value === value)
    if (index < 0) return

    const delta = forward ? 1 : -1
    const next = OPTIONS[(index + delta + OPTIONS.length) % OPTIONS.length]
    onChange(next.value)
    buttonRefs.current[next.value]?.focus()
    event.preventDefault()
  }

  const iconSize = size === 'sm' ? 14 : 16

  return (
    <div
      role="radiogroup"
      aria-label="목록 보기 방식"
      className={[styles.viewSwitch, styles[size]].join(' ')}
      onKeyDown={handleKeyDown}
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[option.value] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            // 선택된 항목만 탭 순서에 남기고 나머지는 방향키로만 이동
            tabIndex={selected ? 0 : -1}
            className={[styles.option, selected ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => onChange(option.value)}
            // 라벨을 감춰도 버튼의 이름은 남아야 한다(스크린리더는 아이콘을 읽지 못한다)
            aria-label={showLabel ? undefined : option.label}
          >
            <Icon size={iconSize} aria-hidden="true" />
            {showLabel && <span className={styles.label}>{option.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
