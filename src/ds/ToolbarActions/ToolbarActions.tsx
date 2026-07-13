import type { ReactNode } from 'react'
import { Copy, Download, Printer, RefreshCw, Share2 } from 'lucide-react'
import { mergeLabels } from '../../shared/labels'
import { Tooltip } from '../Tooltip/Tooltip'
import { ContextMenu, type ContextMenuItem } from '../ContextMenu/ContextMenu'
import styles from './ToolbarActions.module.css'

/**
 * 툴바 액션 문구 — 각 문구는 aria-label과 툴팁을 겸한다(renderButton이 둘을 같은 값으로 쓴다).
 *
 * 공용 TableToolbarLabels(csv·excel·columnPicker)를 쓰지 않는 이유:
 * 그건 AdminTable 툴바의 '내보내기 형식 버튼' 문구고, 여기 액션(내보내기·인쇄·새로고침·복사·공유)과
 * 키가 하나도 겹치지 않는다. 형식 문구(CSV/Excel)는 이 컴포넌트에서는 exportMenu의 데이터로 들어온다.
 */
export type ToolbarActionsLabels = {
  /** role="toolbar"의 이름 — 기본 '목록 액션' */
  toolbar?: string
  export?: string
  print?: string
  refresh?: string
  /** 새로고침 중 — 버튼 이름이 상태를 말한다 */
  refreshing?: string
  copy?: string
  share?: string
}

export const DEFAULT_TOOLBAR_ACTIONS_LABELS: Required<ToolbarActionsLabels> = {
  toolbar: '목록 액션',
  export: '내보내기',
  print: '인쇄',
  refresh: '새로고침',
  refreshing: '새로고침 중',
  copy: '복사',
  share: '공유',
}

export type ToolbarActionsProps = {
  onExport?: () => void
  onPrint?: () => void
  onRefresh?: () => void
  onCopy?: () => void
  onShare?: () => void
  /** 전달하면 내보내기가 단일 버튼 대신 메뉴(CSV/Excel …)가 된다 */
  exportMenu?: { label: string; onSelect: () => void }[]
  size?: 'sm' | 'md' | 'lg'
  /**
   * 버튼 룩 (기본 outline — 1px 보더 + 흰 면).
   * ghost는 보더·면을 지운다 — 이미 보더가 있는 바(ListToolbar·AdminTable 툴바) 안에 넣을 때.
   */
  appearance?: 'outline' | 'ghost'
  /**
   * 라벨 노출 (기본 icon — 아이콘만).
   * iconText는 아이콘 옆에 글자를 함께 보여준다 — 툴팁이 뜨지 않는 터치 환경에서 액션의 뜻을 잃지 않게.
   */
  labelDisplay?: 'icon' | 'iconText'
  /** 새로고침 중 — 아이콘이 회전하고 중복 실행을 막는다 */
  refreshing?: boolean
  /** 문구 — 접근성 이름 겸 툴팁(labelDisplay='iconText'면 화면에도 보인다) */
  labels?: ToolbarActionsLabels
  /**
   * 아이콘 슬롯 — 기본은 lucide(Download·Printer·RefreshCw·Copy·Share2).
   * 아이콘 세트를 바꾸는 제품에서 툴바만 튀지 않게 갈아 끼운다.
   * 크기(size 축)는 기본 아이콘에만 적용되므로, 넘길 땐 size에 맞춰(sm 14 / md 16 / lg 18) 만든다.
   */
  exportIcon?: ReactNode
  printIcon?: ReactNode
  refreshIcon?: ReactNode
  copyIcon?: ReactNode
  shareIcon?: ReactNode
}

/** 크기별 기본 아이콘 px — 버튼 정사각(28/36/44)과 시각 비율을 맞춘 값 */
const ICON_SIZE: Record<NonNullable<ToolbarActionsProps['size']>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
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
  appearance = 'outline',
  labelDisplay = 'icon',
  refreshing = false,
  labels,
  exportIcon,
  printIcon,
  refreshIcon,
  copyIcon,
  shareIcon,
}: ToolbarActionsProps) {
  const L = mergeLabels(DEFAULT_TOOLBAR_ACTIONS_LABELS, labels)

  const iconSize = ICON_SIZE[size]
  const showText = labelDisplay === 'iconText'
  const buttonClassName = [
    styles.button,
    styles[size],
    styles[appearance],
    showText ? styles.iconText : '',
  ]
    .filter(Boolean)
    .join(' ')

  /** 아이콘 버튼 — 툴팁이 감싸 접근성 이름과 설명을 함께 준다 */
  const renderButton = (label: string, icon: ReactNode, onClick?: () => void, disabled = false) => (
    <Tooltip content={label}>
      <button
        type="button"
        className={buttonClassName}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      >
        {icon}
        {showText && <span className={styles.text}>{label}</span>}
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
    <div className={styles.root} role="toolbar" aria-label={L.toolbar}>
      {showExport &&
        (hasExportMenu ? (
          // 메뉴가 있으면 클릭 트리거 ContextMenu로 감싼다
          <ContextMenu items={exportItems} trigger="click">
            {renderButton(L.export, exportNode)}
          </ContextMenu>
        ) : (
          renderButton(L.export, exportNode, onExport)
        ))}

      {onPrint != null &&
        renderButton(L.print, printIcon ?? <Printer size={iconSize} aria-hidden="true" />, onPrint)}

      {onRefresh != null &&
        renderButton(refreshing ? L.refreshing : L.refresh, refreshNode, onRefresh, refreshing)}

      {onCopy != null &&
        renderButton(L.copy, copyIcon ?? <Copy size={iconSize} aria-hidden="true" />, onCopy)}

      {onShare != null &&
        renderButton(L.share, shareIcon ?? <Share2 size={iconSize} aria-hidden="true" />, onShare)}
    </div>
  )
}
