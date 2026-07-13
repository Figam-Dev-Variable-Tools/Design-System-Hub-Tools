import type { ReactNode } from 'react'
// 어드민 1920 레이아웃 상수(--admin-*) — 단일 소스
import '../PageContainer/layout.css'
import styles from './DetailLayout.module.css'

export type DetailLayoutProps = {
  /** 본문 — 폼 섹션(PageSection) 스택 */
  children: ReactNode
  /** 우측 사이드 — 요약/상태/메타 카드 */
  aside?: ReactNode
  /** 사이드 폭 — md=360 / sm=280 (기본 md) */
  asideWidth?: 'sm' | 'md'
  /** 사이드를 스크롤에 고정 (기본 true) */
  sticky?: boolean
  /** 하단 고정 액션 바 — 취소/저장 */
  footer?: ReactNode
  /**
   * 하단 액션 바 노출 (기본 true).
   * 같은 화면을 읽기 전용(상세 보기)으로 재사용할 때, footer를 지우지 않고 이 토글만 끈다 —
   * 저장/취소 핸들러를 들고 있는 쪽 코드를 조건부로 갈아엎지 않기 위한 스위치다.
   */
  showFooter?: boolean
}

/**
 * 어드민 상세 페이지 뼈대 — 본문 + 우측 사이드 + 하단 sticky 액션 바.
 * PageContainer(maxWidth="full") 안에 넣으면 1600 실사용 폭 기준으로 정렬된다.
 */
export function DetailLayout({
  children,
  aside,
  asideWidth = 'md',
  sticky = true,
  footer,
  showFooter = true,
}: DetailLayoutProps) {
  const hasAside = aside != null
  const bodyClass = [styles.body, hasAside ? styles[`aside-${asideWidth}` as const] : styles.single].join(' ')
  const asideClass = [styles.aside, sticky ? styles.sticky : ''].filter(Boolean).join(' ')

  return (
    <div className={styles.root}>
      <div className={bodyClass}>
        <div className={styles.main}>{children}</div>
        {hasAside && <aside className={asideClass}>{aside}</aside>}
      </div>
      {showFooter && footer != null && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
