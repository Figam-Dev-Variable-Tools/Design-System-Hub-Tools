import type { ReactNode } from 'react'
import { Copy, Download, Printer, RefreshCw, Share2 } from 'lucide-react'
import { Tooltip } from '../Tooltip/Tooltip'
import { ContextMenu, type ContextMenuItem } from '../ContextMenu/ContextMenu'
import styles from './ToolbarActions.module.css'

export type ToolbarActionsProps = {
  onExport?: () => void
  onPrint?: () => void
  onRefresh?: () => void
  onCopy?: () => void
  onShare?: () => void
  /** 전달하면 내보내기가 단일 버튼 대신 메뉴(CSV/Excel …)가 된다 */
  exportMenu?: { label: string; onSelect: () => void }[]
  size?: 'sm' | 'md'
  /** 새로고침 중 — 아이콘이 회전하고 중복 실행을 막는다 */
  refreshing?: boolean
  /**
   * 아이콘 슬롯 — 기본은 lucide(Download·Printer·RefreshCw·Copy·Share2).
   * 아이콘 세트를 바꾸는 제품에서 툴바만 튀지 않게 갈아 끼운다.
   * 크기(size 축)는 기본 아이콘에만 적용되므로, 넘길 땐 size에 맞춰(sm 14 / md 16) 만든다.
   */
  exportIcon?: ReactNode
  printIcon?: ReactNode
  refreshIcon?: ReactNode
  copyIcon?: ReactNode
  shareIcon?: ReactNode
}

/**
 * ToolbarActions — 목록 상단 공용 액션 묶음.
 * 핸들러를 넘긴 버튼만 렌더된다(내보내기·인쇄·새로고침·복사·공유).
 * 툴팁은 기존 Tooltip, 내보내기 메뉴는 기존 ContextMenu(trigger='click')를 재사용한다.
 *
 * 아이콘 버튼을 Button으로 바꾸지 않는다 — Button은 label(보이는 글자)이 곧 접근성 이름이고
 * aria-label을 받지 않아, 아이콘만 있는 버튼에서 이름이 사라진다.
 * 여기서는 Tooltip이 감싼 <button aria-label>이 이름과 설명을 함께 준다.
 */
export function ToolbarActions({
  onExport,
  onPrint,
  onRefresh,
  onCopy,
  onShare,
  exportMenu,
  size = 'md',
  refreshing = false,
  exportIcon,
  printIcon,
  refreshIcon,
  copyIcon,
  shareIcon,
}: ToolbarActionsProps) {
  const iconSize = size === 'sm' ? 14 : 16
  const buttonClassName = [styles.button, styles[size]].join(' ')

  /** 아이콘 버튼 — 툴팁이 감싸 접근성 이름과 설명을 함께 준다 */
  const renderButton = (
    label: string,
    icon: ReactNode,
    onClick?: () => void,
    disabled = false,
    extraClassName = '',
  ) => (
    <Tooltip content={label}>
      <button
        type="button"
        className={[buttonClassName, extraClassName].filter(Boolean).join(' ')}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      >
        {icon}
      </button>
    </Tooltip>
  )

  const hasExportMenu = exportMenu != null && exportMenu.length > 0
  const showExport = hasExportMenu || onExport != null

  // exportMenu 항목 → ContextMenu 항목
  const exportItems: ContextMenuItem[] = (exportMenu ?? []).map((entry, index) => ({
    key: `${index}-${entry.label}`,
    label: entry.label,
    icon: <Download size={16} />,
    onSelect: entry.onSelect,
  }))

  const exportNode = exportIcon ?? <Download size={iconSize} aria-hidden="true" />

  // 새로고침만 회전 애니메이션을 아이콘에 직접 건다 — 커스텀 아이콘은 래퍼에 클래스를 준다
  const refreshNode =
    refreshIcon != null ? (
      <span
        className={[styles.iconWrap, refreshing ? styles.spinning : ''].filter(Boolean).join(' ')}
        aria-hidden="true"
      >
        {refreshIcon}
      </span>
    ) : (
      <RefreshCw
        size={iconSize}
        aria-hidden="true"
        className={refreshing ? styles.spinning : undefined}
      />
    )

  return (
    <div className={styles.root} role="toolbar" aria-label="목록 액션">
      {showExport &&
        (hasExportMenu ? (
          // 메뉴가 있으면 클릭 트리거 ContextMenu로 감싼다
          <ContextMenu items={exportItems} trigger="click">
            {renderButton('내보내기', exportNode)}
          </ContextMenu>
        ) : (
          renderButton('내보내기', exportNode, onExport)
        ))}

      {onPrint != null &&
        renderButton('인쇄', printIcon ?? <Printer size={iconSize} aria-hidden="true" />, onPrint)}

      {onRefresh != null &&
        renderButton(refreshing ? '새로고침 중' : '새로고침', refreshNode, onRefresh, refreshing)}

      {onCopy != null &&
        renderButton('복사', copyIcon ?? <Copy size={iconSize} aria-hidden="true" />, onCopy)}

      {onShare != null &&
        renderButton('공유', shareIcon ?? <Share2 size={iconSize} aria-hidden="true" />, onShare)}
    </div>
  )
}
