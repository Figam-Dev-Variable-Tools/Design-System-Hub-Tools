import { useEffect, useRef, useState } from 'react'
import type { DragEvent, KeyboardEvent, PointerEvent, ReactNode } from 'react'
import { GripVertical } from 'lucide-react'
import styles from './SortableList.module.css'

export type SortableListProps<T> = {
  items: T[]
  /** 아이템 고유 키 — 재정렬 중에도 값이 바뀌지 않아야 한다 */
  getId: (item: T) => string
  /** 재정렬된 전체 배열을 돌려준다 */
  onReorder: (items: T[]) => void
  renderItem: (item: T, state: { dragging: boolean; index: number }) => ReactNode
  /** 'grid'면 가로로 흐르고 삽입 인디케이터가 세로선이 된다 */
  direction?: 'vertical' | 'grid'
  disabled?: boolean
  /** true면 SortableHandle 위에서 시작한 드래그만 허용한다 */
  handleOnly?: boolean
}

/** 삽입 위치 — 대상 아이템의 앞/뒤 */
type DropSide = 'before' | 'after'
type DropTarget = { index: number; side: DropSide } | null

export type SortableHandleProps = {
  /**
   * 그립 아이콘 교체 슬롯. 핸들 그림은 화면마다 다르지만(그립·점 6개·이동 화살표)
   * 드래그 판별은 data-sortable-handle 속성이 하므로, 아이콘만 갈아 끼워도 동작은 그대로다.
   * 없으면 기존 GripVertical — 기본 렌더는 바뀌지 않는다.
   */
  icon?: ReactNode
}

/**
 * 드래그 핸들 슬롯 — renderItem 안에 넣어 쓴다.
 * handleOnly일 때 SortableList가 data-sortable-handle 속성으로 핸들 여부를 판별한다.
 */
export function SortableHandle({ icon }: SortableHandleProps) {
  return (
    <span className={styles.handle} data-sortable-handle="" aria-hidden="true">
      {icon ?? <GripVertical size={16} />}
    </span>
  )
}

/** from 위치의 아이템을 to 위치로 옮긴 새 배열 */
function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function SortableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
  direction = 'vertical',
  disabled = false,
  handleOnly = false,
}: SortableListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget>(null)
  // handleOnly에서 핸들을 눌렀을 때만 draggable을 켜기 위한 상태
  const [armedId, setArmedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  // 키보드 이동 후에도 같은 아이템에 포커스를 유지하기 위한 참조
  const itemRefs = useRef(new Map<string, HTMLLIElement>())
  const focusIdRef = useRef<string | null>(null)

  useEffect(() => {
    const id = focusIdRef.current
    if (id == null) return
    focusIdRef.current = null
    itemRefs.current.get(id)?.focus()
  })

  const reset = () => {
    setDragIndex(null)
    setDropTarget(null)
    setArmedId(null)
  }

  /** 대상 인덱스/방향을 실제 삽입 인덱스로 환산해 재정렬 */
  const commit = (from: number, target: NonNullable<DropTarget>) => {
    const insertAt = target.side === 'after' ? target.index + 1 : target.index
    const to = insertAt > from ? insertAt - 1 : insertAt
    if (to === from) return
    onReorder(moveItem(items, from, to))
  }

  const handlePointerDown = (e: PointerEvent<HTMLLIElement>, id: string) => {
    if (disabled || !handleOnly) return
    const target = e.target as HTMLElement
    setArmedId(target.closest('[data-sortable-handle]') != null ? id : null)
  }

  const handleDragStart = (e: DragEvent<HTMLLIElement>, index: number) => {
    if (disabled) return
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Firefox는 데이터가 없으면 드래그를 시작하지 않는다
    e.dataTransfer.setData('text/plain', getId(items[index]))
  }

  const handleDragOver = (e: DragEvent<HTMLLIElement>, index: number) => {
    if (disabled || dragIndex == null) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    const rect = e.currentTarget.getBoundingClientRect()
    const side: DropSide =
      direction === 'grid'
        ? e.clientX < rect.left + rect.width / 2
          ? 'before'
          : 'after'
        : e.clientY < rect.top + rect.height / 2
          ? 'before'
          : 'after'

    setDropTarget((prev) =>
      prev != null && prev.index === index && prev.side === side ? prev : { index, side },
    )
  }

  const handleDrop = (e: DragEvent<HTMLLIElement>, index: number) => {
    if (disabled || dragIndex == null) return
    e.preventDefault()
    commit(dragIndex, dropTarget ?? { index, side: 'after' })
    reset()
  }

  /** Ctrl/Cmd + 방향키로 순서 이동 (grid면 ←/→ 포함) */
  const handleKeyDown = (e: KeyboardEvent<HTMLLIElement>, index: number) => {
    if (disabled || !(e.ctrlKey || e.metaKey)) return

    const horizontal = direction === 'grid'
    let delta = 0
    if (e.key === 'ArrowUp') delta = -1
    else if (e.key === 'ArrowDown') delta = 1
    else if (horizontal && e.key === 'ArrowLeft') delta = -1
    else if (horizontal && e.key === 'ArrowRight') delta = 1
    else return

    const to = index + delta
    if (to < 0 || to >= items.length) return

    e.preventDefault()
    focusIdRef.current = getId(items[index])
    setMessage(`${index + 1}번째 항목을 ${to + 1}번째로 이동했습니다.`)
    onReorder(moveItem(items, index, to))
  }

  const listClass = [
    styles.list,
    direction === 'grid' ? styles.grid : styles.vertical,
    disabled ? styles.disabledList : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.root}>
      <ul className={listClass}>
        {items.map((item, index) => {
          const id = getId(item)
          const dragging = dragIndex === index
          const showBefore = dropTarget?.index === index && dropTarget.side === 'before'
          const showAfter = dropTarget?.index === index && dropTarget.side === 'after'
          const draggable = !disabled && (!handleOnly || armedId === id)

          const itemClass = [
            styles.item,
            dragging ? styles.dragging : '',
            showBefore ? styles.before : '',
            showAfter ? styles.after : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <li
              key={id}
              ref={(node) => {
                if (node == null) itemRefs.current.delete(id)
                else itemRefs.current.set(id, node)
              }}
              className={itemClass}
              draggable={draggable}
              tabIndex={disabled ? -1 : 0}
              // aria-grabbed는 폐기 예정이지만 스크린리더 호환을 위해 함께 노출한다
              aria-grabbed={dragging}
              aria-roledescription="정렬 가능한 항목"
              aria-label={`${index + 1}번째 / 전체 ${items.length}개. Ctrl 또는 Cmd와 방향키로 순서를 바꿀 수 있습니다.`}
              data-dragging={dragging ? 'true' : 'false'}
              onPointerDown={(e) => handlePointerDown(e, id)}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={reset}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {renderItem(item, { dragging, index })}
            </li>
          )
        })}
      </ul>

      {/* 키보드 이동 결과 안내 */}
      <div className={styles.srOnly} role="status" aria-live="polite">
        {message}
      </div>
    </div>
  )
}
