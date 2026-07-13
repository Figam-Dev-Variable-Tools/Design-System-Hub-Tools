import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react'
import styles from './ContextMenu.module.css'

export type ContextMenuItem = {
  key: string
  label: string
  icon?: ReactNode
  tone?: 'default' | 'error'
  disabled?: boolean
  onSelect?: () => void
  /** 해당 항목 위 구분선 */
  divider?: boolean
}

export type ContextMenuProps = {
  items: ContextMenuItem[]
  children: ReactNode
  trigger?: 'contextmenu' | 'click'
}

/**
 * ContextMenu — 우클릭(또는 클릭) 트리거 메뉴.
 *
 * 기존 Dropdown/Popover로 대체 불가한 지점만 갖는다:
 *  - Dropdown은 자기 텍스트 트리거 버튼에 종속되고, Popover는 앵커 기준 고정 배치라
 *    둘 다 **커서 좌표에 띄우기**·**뷰포트 경계 보정**·**방향키 로빙 포커스**가 없다.
 *  - 여기서는 position: fixed로 커서에 띄우고, 렌더 직후 실측해서 화면 밖으로 나가지 않게 민다.
 */
const EDGE_MARGIN = 8

export function ContextMenu({ items, children, trigger = 'contextmenu' }: ContextMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [activeIndex, setActiveIndex] = useState(-1)

  const menuRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const enabledIndexes = items
    .map((item, index) => (item.disabled === true ? -1 : index))
    .filter((index) => index >= 0)

  const close = useCallback(() => {
    setOpen(false)
    setActiveIndex(-1)
  }, [])

  const openAt = (x: number, y: number) => {
    setPos({ x, y })
    setActiveIndex(-1)
    setOpen(true)
  }

  // 뷰포트 경계 보정 — 실측 후 화면 안으로 민다. paint 전에 끝나므로 깜빡임이 없다.
  useLayoutEffect(() => {
    if (!open) return
    const el = menuRef.current
    if (el == null) return

    const { width, height } = el.getBoundingClientRect()
    const maxX = window.innerWidth - width - EDGE_MARGIN
    const maxY = window.innerHeight - height - EDGE_MARGIN
    const x = Math.max(EDGE_MARGIN, Math.min(pos.x, maxX))
    const y = Math.max(EDGE_MARGIN, Math.min(pos.y, maxY))

    // 값이 같아지면 더 이상 setState하지 않으므로 한 번 더 돌고 수렴한다
    if (x !== pos.x || y !== pos.y) setPos({ x, y })
  }, [open, pos])

  // 열리면 메뉴로 포커스 이동(방향키를 바로 받기 위해)
  useEffect(() => {
    if (open) menuRef.current?.focus()
  }, [open])

  // activeIndex를 실제 DOM 포커스로 옮긴다 — 포커스 링이 진짜로 따라간다
  useEffect(() => {
    if (!open || activeIndex < 0) return
    itemRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  // 바깥 클릭 / 스크롤 / 리사이즈로 닫기 (Escape는 메뉴 onKeyDown에서 처리)
  useEffect(() => {
    if (!open) return

    const handleMouseDown = (event: globalThis.MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (menuRef.current?.contains(target) === true) return
      // 클릭 트리거를 다시 누른 경우는 여기서 닫지 않는다 — mousedown이 click보다 먼저라
      // 여기서 닫으면 바로 뒤 onClick이 다시 열어 토글이 되지 않는다. 토글은 handleClick이 한다.
      if (trigger === 'click' && wrapperRef.current?.contains(target) === true) return
      close()
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open, close, trigger])

  const select = (item: ContextMenuItem) => {
    if (item.disabled === true) return
    item.onSelect?.()
    close()
  }

  /** 방향키 이동 — 비활성 항목은 건너뛴다 */
  const moveActive = (delta: number) => {
    if (enabledIndexes.length === 0) return
    const currentPos = enabledIndexes.indexOf(activeIndex)
    const nextPos =
      currentPos < 0
        ? delta > 0
          ? 0
          : enabledIndexes.length - 1
        : (currentPos + delta + enabledIndexes.length) % enabledIndexes.length
    setActiveIndex(enabledIndexes[nextPos])
  }

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        close()
        // 트리거로 포커스 복귀
        wrapperRef.current?.focus()
        break
      case 'ArrowDown':
        event.preventDefault()
        moveActive(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveActive(-1)
        break
      case 'Home':
        event.preventDefault()
        if (enabledIndexes.length > 0) setActiveIndex(enabledIndexes[0])
        break
      case 'End':
        event.preventDefault()
        if (enabledIndexes.length > 0) setActiveIndex(enabledIndexes[enabledIndexes.length - 1])
        break
      default:
        break
    }
  }

  const handleContextMenu = (event: ReactMouseEvent) => {
    if (trigger !== 'contextmenu') return
    event.preventDefault()
    openAt(event.clientX, event.clientY)
  }

  const handleClick = (event: ReactMouseEvent) => {
    if (trigger !== 'click') return
    event.preventDefault()
    if (open) {
      close()
      return
    }
    // 클릭 트리거는 커서가 아니라 트리거 요소 하단에 붙인다(드롭다운 느낌)
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (rect != null) openAt(rect.left, rect.bottom + 4)
    else openAt(event.clientX, event.clientY)
  }

  return (
    <>
      <span
        ref={wrapperRef}
        className={styles.wrapper}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        tabIndex={-1}
      >
        {children}
      </span>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className={styles.menu}
          style={{ left: pos.x, top: pos.y }}
          onKeyDown={handleMenuKeyDown}
          onContextMenu={(event) => event.preventDefault()}
        >
          {items.map((item, index) => (
            <Fragment key={item.key}>
              {item.divider === true && <div className={styles.divider} role="separator" />}
              <button
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                disabled={item.disabled}
                className={[styles.item, item.tone === 'error' ? styles.error : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => select(item)}
                onMouseEnter={() => {
                  if (item.disabled !== true) setActiveIndex(index)
                }}
              >
                {item.icon != null && (
                  <span className={styles.icon} aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className={styles.label}>{item.label}</span>
              </button>
            </Fragment>
          ))}
        </div>
      )}
    </>
  )
}
