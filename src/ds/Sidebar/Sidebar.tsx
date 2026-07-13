import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './Sidebar.module.css'
import { Badge } from '../Badge/Badge'

export type SidebarItem = {
  label: string
  value: string
  badge?: string
  disabled?: boolean
  /** 메뉴 아이콘 (lucide-react 아이콘 등) */
  icon?: ReactNode
  /** 1단계 서브메뉴 — 데이터만 추가하면 메뉴가 확장된다 */
  children?: SidebarItem[]
}

export type SidebarSection = {
  title?: string
  items: SidebarItem[]
}

export type SidebarProps = {
  sections: SidebarSection[]
  value: string
  onChange?: (value: string) => void
  width?: number
  /** 미니 모드 — 아이콘만 표시 (폭 64px 고정) */
  collapsed?: boolean
  /**
   * 사이드바 머리의 브랜드/로고. 어드민 셸에서 상단 헤더가 사이드바를 침범하지 않게
   * 브랜드를 사이드바 안에 둘 때 사용한다. 높이는 헤더(--admin-topbar-h)와 맞춘다.
   */
  brand?: ReactNode
}

const COLLAPSED_WIDTH = 64

export function Sidebar({ sections, value, onChange, width = 240, collapsed = false, brand }: SidebarProps) {
  // 사용자가 직접 접고 편 그룹만 기록 — 나머지는 선택된 자식 유무로 자동 판단
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  const hasActiveChild = (item: SidebarItem) =>
    item.children?.some((child) => child.value === value) ?? false

  const toggle = (key: string, open: boolean) => setOpenMap((prev) => ({ ...prev, [key]: !open }))

  const renderIcon = (item: SidebarItem) => {
    if (item.icon != null) {
      return (
        <span className={styles.icon} aria-hidden="true">
          {item.icon}
        </span>
      )
    }
    // 미니 모드에서 아이콘이 없으면 라벨 첫 글자로 대체
    if (collapsed) {
      return (
        <span className={styles.icon} aria-hidden="true">
          {item.label.charAt(0)}
        </span>
      )
    }
    return null
  }

  const renderLeaf = (item: SidebarItem, sub: boolean) => {
    const active = item.value === value
    const className = [styles.item, sub ? styles.subItem : '', active ? styles.active : '']
      .filter(Boolean)
      .join(' ')

    return (
      <button
        key={item.value}
        type="button"
        aria-current={active ? 'page' : undefined}
        disabled={item.disabled}
        title={collapsed ? item.label : undefined}
        className={className}
        onClick={() => onChange?.(item.value)}
      >
        <span className={styles.lead}>
          {renderIcon(item)}
          {!collapsed && <span className={styles.label}>{item.label}</span>}
        </span>
        {!collapsed && item.badge != null && <Badge variant="primary" size="sm" label={item.badge} />}
      </button>
    )
  }

  const renderGroup = (item: SidebarItem) => {
    const children = item.children ?? []
    const open = openMap[item.value] ?? hasActiveChild(item)
    const active = item.value === value || hasActiveChild(item)

    // 미니 모드에서는 서브메뉴를 펼칠 자리가 없어 첫 활성 자식으로 바로 이동
    const firstEnabled = children.find((child) => !child.disabled)
    const handleClick = collapsed
      ? () => firstEnabled != null && onChange?.(firstEnabled.value)
      : () => toggle(item.value, open)

    return (
      <div key={item.value} className={styles.group}>
        <button
          type="button"
          disabled={item.disabled}
          title={collapsed ? item.label : undefined}
          aria-expanded={collapsed ? undefined : open}
          className={[styles.item, active ? styles.groupActive : ''].filter(Boolean).join(' ')}
          onClick={handleClick}
        >
          <span className={styles.lead}>
            {renderIcon(item)}
            {!collapsed && <span className={styles.label}>{item.label}</span>}
          </span>
          {!collapsed && item.badge != null && <Badge variant="primary" size="sm" label={item.badge} />}
          {!collapsed && (
            <ChevronDown
              size={14}
              className={[styles.chevron, open ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
              aria-hidden="true"
            />
          )}
        </button>
        {!collapsed && open && (
          <div className={styles.subList}>{children.map((child) => renderLeaf(child, true))}</div>
        )}
      </div>
    )
  }

  return (
    <nav
      className={[styles.sidebar, collapsed ? styles.mini : ''].filter(Boolean).join(' ')}
      style={{ width: collapsed ? COLLAPSED_WIDTH : width }}
    >
      {brand != null && <div className={styles.brand}>{brand}</div>}
      {sections.map((section, index) => (
        <div key={section.title ?? index} className={styles.section}>
          {section.title != null && !collapsed && <div className={styles.sectionTitle}>{section.title}</div>}
          {section.items.map((item) =>
            (item.children?.length ?? 0) > 0 ? renderGroup(item) : renderLeaf(item, false),
          )}
        </div>
      ))}
    </nav>
  )
}
