import { useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { mergeLabels } from '../../shared/labels'
import styles from './ViewSwitch.module.css'

export type ViewSwitchValue = 'card' | 'board'

/** 옵션 문구 — 라벨을 감춰도(showLabel=false) 버튼의 접근성 이름으로 계속 쓰인다 */
export type ViewSwitchLabels = {
  /** radiogroup의 접근성 이름 — 기본 '목록 보기 방식' */
  group?: string
  options?: Partial<Record<ViewSwitchValue, string>>
}

export const DEFAULT_VIEW_SWITCH_LABELS: { group: string; options: Record<ViewSwitchValue, string> } =
  {
    group: '목록 보기 방식',
    options: { card: '카드형', board: '게시물형' },
  }

export type ViewSwitchProps = {
  value: ViewSwitchValue
  onChange: (value: ViewSwitchValue) => void
  size?: 'sm' | 'md' | 'lg'
  /**
   * 라벨('카드형'·'게시물형') ON/OFF (기본 ON).
   * OFF면 아이콘만 남는다 — 툴바가 좁은 사이트 목록용. 라벨을 지워도 스크린리더용 aria-label은 남는다.
   */
  showLabel?: boolean
  /**
   * 배치 (기본 horizontal).
   * 방향키는 이미 상하 키를 함께 받으므로(사이드 레일에 세워도 조작이 자연스럽다) 축만 열어 준다.
   */
  orientation?: 'horizontal' | 'vertical'
  /** 문구 — 옵션 라벨과 묶음 이름 */
  labels?: ViewSwitchLabels
  /**
   * 아이콘 교체 — 기본은 lucide(LayoutGrid·List).
   * 아이콘 세트가 다른 사이트에서 이 컨트롤만 튀지 않게 갈아 끼운다.
   * 크기(size 축)는 기본 아이콘에만 적용되므로, 넘길 땐 size에 맞춰(sm 14 / md 16 / lg 18) 만든다.
   */
  icons?: Partial<Record<ViewSwitchValue, ReactNode>>
}

/** 값의 순서 = 방향키 이동 순서. 문구는 labels가, 아이콘은 icons가 갈아끼울 수 있다. */
const OPTIONS: { value: ViewSwitchValue; icon: typeof LayoutGrid }[] = [
  { value: 'card', icon: LayoutGrid },
  { value: 'board', icon: List },
]

/** 크기별 기본 아이콘 px — 세그먼트 글자 크기와 시각 비율을 맞춘 값 */
const ICON_SIZE: Record<NonNullable<ViewSwitchProps['size']>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
}

export function ViewSwitch({
  value,
  onChange,
  size = 'md',
  showLabel = true,
  orientation = 'horizontal',
  labels,
  icons,
}: ViewSwitchProps) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const L = mergeLabels(DEFAULT_VIEW_SWITCH_LABELS, labels)

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

  const iconSize = ICON_SIZE[size]

  return (
    <div
      role="radiogroup"
      aria-label={L.group}
      aria-orientation={orientation}
      className={[
        styles.viewSwitch,
        styles[size],
        orientation === 'vertical' ? styles.vertical : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onKeyDown={handleKeyDown}
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value
        const Icon = option.icon
        const label = L.options[option.value]
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
            aria-label={showLabel ? undefined : label}
          >
            {icons?.[option.value] ?? <Icon size={iconSize} aria-hidden="true" />}
            {showLabel && <span className={styles.label}>{label}</span>}
          </button>
        )
      })}
    </div>
  )
}
