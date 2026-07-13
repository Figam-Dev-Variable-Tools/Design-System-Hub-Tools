import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { mergeLabels, type LabelFn } from '../../shared/labels'
import styles from './CategoryTabs.module.css'

/**
 * 탭 크롬의 문구 — 탭 라벨(items[].label)은 데이터라 여기 없다.
 * 삭제 x·추가 버튼·인라인 입력은 컴포넌트가 그리므로 문구도 컴포넌트가 열어야 한다.
 */
export type CategoryTabsLabels = {
  /** 탭 삭제 x의 접근성 이름 — 기본: (label) => `${label} 카테고리 삭제` */
  remove?: LabelFn<string>
  /** 추가 버튼 — 기본 '카테고리 추가' */
  add?: string
  /** 추가 입력의 placeholder — 기본 '카테고리명 입력 후 Enter' */
  addPlaceholder?: string
  /** 추가 입력의 접근성 이름 — 기본 '새 카테고리명' */
  addField?: string
}

export const DEFAULT_CATEGORY_TABS_LABELS: Required<CategoryTabsLabels> = {
  remove: (label) => `${label} 카테고리 삭제`,
  add: '카테고리 추가',
  addPlaceholder: '카테고리명 입력 후 Enter',
  addField: '새 카테고리명',
}

export type CategoryTabItem = {
  label: string
  value: string
  /** 탭 라벨 우측 건수 배지 */
  count?: number
  /** true면 삭제 x를 붙이지 않는다 — '전체'처럼 지워지면 안 되는 탭 */
  fixed?: boolean
}

export type CategoryTabsProps = {
  items: CategoryTabItem[]
  value: string
  onChange?: (value: string) => void
  /** 있으면 '+ 카테고리 추가' 버튼 노출 — 인라인 입력에서 엔터로 확정 */
  onAdd?: (label: string) => void
  /** 있으면 탭 hover/focus 시 x 버튼 노출 */
  onRemove?: (value: string) => void
  /** 기본 true — false면 onAdd가 있어도 추가 버튼을 숨긴다 */
  addable?: boolean
  /**
   * 룩 — underline=밑줄 탭(어드민 목록·기본값) / pill=알약 필터 칩.
   * pill은 밑줄(면 경계)이 없어 사이트 히어로 아래에 필터만 띄울 때 쓴다.
   */
  variant?: 'underline' | 'pill'
  /** 정렬 — start=좌측(기본) / center=가운데(히어로 아래 필터) */
  align?: 'start' | 'center'
  /**
   * underline 룩의 컨테이너 가로선 ON/OFF (기본 true).
   * 사이트 히어로 아래에 탭만 띄울 때는 면 경계가 필요 없어 false로 끈다.
   */
  rule?: boolean
  /** 문구 통로 — 넘기지 않으면 기본 문구 그대로다 */
  labels?: CategoryTabsLabels
}

export function CategoryTabs({
  items,
  value,
  onChange,
  onAdd,
  onRemove,
  addable = true,
  variant = 'underline',
  align = 'start',
  rule = true,
  labels,
}: CategoryTabsProps) {
  const L = mergeLabels(DEFAULT_CATEGORY_TABS_LABELS, labels)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  const showAdd = addable && onAdd != null

  // 방향키로 활성 탭 이동 (Tab 컴포넌트와 동일한 동작)
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    if (items.length === 0) return
    const index = items.findIndex((item) => item.value === value)
    if (index < 0) return
    const delta = event.key === 'ArrowRight' ? 1 : -1
    const next = items[(index + delta + items.length) % items.length]
    onChange?.(next.value)
    tabRefs.current[next.value]?.focus()
    event.preventDefault()
  }

  const closeAdd = () => {
    setAdding(false)
    setDraft('')
  }

  const commitAdd = () => {
    const label = draft.trim()
    if (label === '') {
      closeAdd()
      return
    }
    onAdd?.(label)
    closeAdd()
  }

  // 엔터로 추가, Esc로 취소
  function handleDraftKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      commitAdd()
      event.preventDefault()
      return
    }
    if (event.key === 'Escape') {
      closeAdd()
      event.preventDefault()
    }
  }

  const rootClass = [
    styles.categoryTabs,
    variant === 'pill' ? styles.pill : styles.underline,
    // 가로선은 underline 룩에서만 의미가 있다(pill은 각 탭이 스스로 판을 갖는다)
    variant === 'underline' && rule ? styles.ruled : '',
    align === 'center' ? styles.alignCenter : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      <div role="tablist" className={styles.tablist} onKeyDown={handleKeyDown}>
        {items.map((item) => {
          const selected = item.value === value
          return (
            // role="tab"과 삭제 버튼을 형제로 두기 위한 래퍼 — 접근성 트리에서는 무시
            <span
              key={item.value}
              role="presentation"
              className={[styles.item, selected ? styles.selected : ''].filter(Boolean).join(' ')}
            >
              <button
                ref={(el) => {
                  tabRefs.current[item.value] = el
                }}
                type="button"
                role="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                className={styles.tab}
                onClick={() => onChange?.(item.value)}
              >
                {item.label}
                {item.count != null && <span className={styles.count}>{item.count}</span>}
              </button>
              {onRemove != null && !item.fixed && (
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={L.remove(item.label)}
                  onClick={() => onRemove(item.value)}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          )
        })}
      </div>

      {showAdd &&
        (adding ? (
          <input
            type="text"
            autoFocus
            className={styles.input}
            value={draft}
            placeholder={L.addPlaceholder}
            aria-label={L.addField}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleDraftKeyDown}
            onBlur={closeAdd}
          />
        ) : (
          <button type="button" className={styles.add} onClick={() => setAdding(true)}>
            <Plus size={14} />
            {L.add}
          </button>
        ))}
    </div>
  )
}
