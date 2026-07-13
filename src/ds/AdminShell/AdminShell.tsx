import type { ReactNode } from 'react'
// 어드민 1920 레이아웃 상수(--admin-*) — 단일 소스
import '../PageContainer/layout.css'
import styles from './AdminShell.module.css'
import { Navbar, type NavbarItem } from '../Navbar/Navbar'
import { Sidebar, type SidebarSection } from '../Sidebar/Sidebar'
import { AdminTopbar, type AdminTopbarUser, type BreadcrumbTrail } from '../AdminTopbar/AdminTopbar'

export type AdminShellProps = {
  brand: string
  navItems: NavbarItem[]
  navValue: string
  onNavChange?: (value: string) => void
  sidebarSections: SidebarSection[]
  sidebarValue: string
  onSidebarChange?: (value: string) => void
  /** Navbar 우측 액션 */
  actions?: ReactNode
  children: ReactNode
  /** 본문 영역 패딩 적용 여부 (기본 true) */
  contentPadding?: boolean
  /** 사이드바 미니 모드(폭 64) — 외부에서 제어. 헤더에 토글 버튼은 두지 않는다. */
  sidebarCollapsed?: boolean
  /** pageTitle이 있으면 AdminTopbar를 렌더한다 */
  pageTitle?: string
  pageDescription?: string
  breadcrumb?: BreadcrumbTrail[]
  /** AdminTopbar 우측 액션 */
  pageActions?: ReactNode
  user?: AdminTopbarUser
}

export function AdminShell({
  brand,
  navItems,
  navValue,
  onNavChange,
  sidebarSections,
  sidebarValue,
  onSidebarChange,
  actions,
  children,
  contentPadding = true,
  sidebarCollapsed,
  pageTitle,
  pageDescription,
  breadcrumb,
  pageActions,
  user,
}: AdminShellProps) {
  // 토바의 햄버거를 없앴으므로 접기는 외부에서 sidebarCollapsed로만 제어한다(기본 펼침).
  const collapsed = sidebarCollapsed ?? false

  const mainClass = [styles.main, contentPadding ? styles.padded : ''].filter(Boolean).join(' ')

  // 사이드바는 최상단부터 전체 높이를 차지하고, 헤더(Navbar·AdminTopbar)는 콘텐츠 열 안에만 있다
  // → 상단 헤더가 사이드바를 넘어 그려지지 않는다. 브랜드는 사이드바 머리에 둔다.
  return (
    <div className={styles.shell}>
      <Sidebar
        sections={sidebarSections}
        value={sidebarValue}
        onChange={onSidebarChange}
        collapsed={collapsed}
        brand={collapsed ? brand.slice(0, 1) : brand}
      />
      <div className={styles.content}>
        <Navbar items={navItems} value={navValue} onChange={onNavChange} actions={actions} />
        {pageTitle != null && (
          <AdminTopbar
            breadcrumb={breadcrumb ?? []}
            title={pageTitle}
            description={pageDescription}
            actions={pageActions}
            user={user}
          />
        )}
        <main className={mainClass}>{children}</main>
      </div>
    </div>
  )
}
