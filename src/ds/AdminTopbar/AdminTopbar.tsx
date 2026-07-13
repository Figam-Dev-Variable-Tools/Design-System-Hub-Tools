import type { ReactNode } from 'react'
// 어드민 1920 레이아웃 상수(--admin-*) — 단일 소스
import '../PageContainer/layout.css'
import styles from './AdminTopbar.module.css'
import { Avatar } from '../Avatar/Avatar'
import { Breadcrumb, type BreadcrumbItem } from '../Breadcrumb/Breadcrumb'

/**
 * 현재 위치 depth 한 조각 — href 또는 onClick 중 하나만 주면 링크로 동작.
 * 공용 Breadcrumb의 항목 타입 그대로다(예전 이름을 쓰던 호출부가 깨지지 않게 별칭으로 남겨 둔다).
 */
export type BreadcrumbTrail = BreadcrumbItem

export type AdminTopbarUser = {
  name: string
  role?: string
}

export type AdminTopbarProps = {
  /** 홈 > 상품 관리 > 상품 등록 */
  breadcrumb: BreadcrumbTrail[]
  title: string
  description?: string
  /** 우측 액션 슬롯 */
  actions?: ReactNode
  user?: AdminTopbarUser
  /** 경로(브레드크럼) 줄 — depth가 1단계뿐인 화면에서는 꺼서 타이틀만 남긴다 */
  showBreadcrumb?: boolean
  /** 사용자 아바타 — 이름/역할 텍스트만 두고 싶을 때 끈다 */
  showAvatar?: boolean
}

export function AdminTopbar({
  breadcrumb,
  title,
  description,
  actions,
  user,
  showBreadcrumb = true,
  showAvatar = true,
}: AdminTopbarProps) {
  const hasBreadcrumb = showBreadcrumb && breadcrumb.length > 0

  // 규격: 타이틀만 1줄 = 72px, 브레드크럼/설명이 붙어 2줄 = 104px
  const stacked = hasBreadcrumb || description != null
  const topbarClass = [styles.topbar, stacked ? styles.stacked : ''].filter(Boolean).join(' ')

  return (
    <header className={topbarClass}>
      <div className={styles.left}>
        <div className={styles.headings}>
          {/* 경로는 공용 Breadcrumb이 그린다 — 마지막 항목 aria-current, href/onClick 분기(a/button)를
              여기서 다시 구현하지 않는다. 구분자는 어드민 헤더 관례대로 '›'를 유지한다. */}
          {hasBreadcrumb && <Breadcrumb items={breadcrumb} separator="›" ariaLabel="경로" />}
          <h1 className={styles.title}>{title}</h1>
          {description != null && <p className={styles.description}>{description}</p>}
        </div>
      </div>
      <div className={styles.right}>
        {actions != null && <div className={styles.actions}>{actions}</div>}
        {user != null && (
          <div className={styles.user}>
            <div className={styles.userText}>
              <span className={styles.userName}>{user.name}</span>
              {user.role != null && <span className={styles.userRole}>{user.role}</span>}
            </div>
            {showAvatar && <Avatar name={user.name} size="sm" />}
          </div>
        )}
      </div>
    </header>
  )
}
