import { useId, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { PanelLeft } from 'lucide-react'
// 어드민 1920 레이아웃 상수(--admin-*) — 단일 소스
import '../PageContainer/layout.css'
import styles from './AdminPageLayout.module.css'
import { PageContainer } from '../PageContainer/PageContainer'

export type AdminPageLayoutProps = {
  /** 상단: 페이지 타이틀 + 우측 액션(등록/엑셀/일괄등록) */
  title?: string
  description?: string
  headerActions?: ReactNode
  /** 상태 탭(전체/판매중/품절…) */
  tabs?: ReactNode
  /** 좌측 패널(GroupPanel | CategoryTree | FormAnchorNav) */
  side?: ReactNode
  sideWidth?: number
  /** 검색/필터/내보내기 툴바 */
  toolbar?: ReactNode
  /** 본문(목록/폼/카드 그리드) */
  children: ReactNode
  /** 우측 요약/미리보기(MobilePreview | 활동정보) */
  aside?: ReactNode
  asideWidth?: number
  asideSticky?: boolean
  /** 하단 sticky 액션 바 */
  footer?: ReactNode
  /** 콘텐츠 최대폭 — 1920 규격(full=1600 / lg=1200 / md=768) */
  maxWidth?: 'md' | 'lg' | 'full'
  /** 하위 컴포넌트에 CSS 변수로 전달되는 밀도 — AdminTable의 density prop과는 별개다(아래 주석 참고) */
  density?: 'compact' | 'comfortable'
  /**
   * 좌측 패널 접기 버튼 — 1280 미만에서만 의미가 있다.
   * 항상 펼쳐 두는 화면(패널이 곧 내비게이션인 경우)에서는 꺼서 버튼 줄을 없앤다.
   */
  showSideToggle?: boolean
  /** 접기 버튼 아이콘 — 기본은 좌측 패널 아이콘 */
  sideToggleIcon?: ReactNode
  /** 패널이 닫혀 있을 때의 버튼 문구(누르면 열린다) */
  sideOpenLabel?: string
  /** 패널이 열려 있을 때의 버튼 문구(누르면 닫힌다) */
  sideCloseLabel?: string
}

/**
 * 화면 조합용 레이아웃 박스 — 어드민 화면 12종이 공유하는 골격.
 *
 * 슬롯을 채우는 만큼만 렌더된다. 비운 슬롯은 DOM에서 완전히 사라지므로 빈 칸/여백이 남지 않는다.
 *
 *   ┌ header ─ title + headerActions ┐
 *   ├ tabs ──────────────────────────┤
 *   ├ side │ toolbar ····· │ aside ──┤   본문 = side(240) + main(1fr) + aside(360)
 *   │      │ children      │         │
 *   └ footer ─ sticky 액션 바 ───────┘
 *
 * 폭은 --admin-* 상수를 따른다. 좁아지면
 *   - 1440 미만: aside → 본문 아래
 *   - 1280 미만: side → 상단 드로어 토글로 접힘
 *
 * 페이지 루트 컨테이너다(PageContainer를 내부에서 쓴다). 바깥에서 또 PageContainer로
 * 감싸면 패딩 40이 두 번 먹으니 감싸지 말 것.
 *
 * density: 루트에 data-density와 CSS 변수(--admin-row-h / --admin-row-header-h /
 * --admin-cell-pad-y / --admin-cell-pad-x / --admin-row-font)를 심어 자식이 읽어 쓰게 한다.
 * AdminTable은 이 변수를 읽지 않고 자체 density prop(기본 comfortable)으로 동작하므로,
 * 표까지 같은 밀도로 맞추려면 AdminTable에 density를 명시적으로 넘겨야 한다.
 */
export function AdminPageLayout({
  title,
  description,
  headerActions,
  tabs,
  side,
  sideWidth = 240,
  toolbar,
  children,
  aside,
  asideWidth = 360,
  asideSticky = true,
  footer,
  maxWidth = 'full',
  density = 'compact',
  showSideToggle = true,
  sideToggleIcon,
  sideOpenLabel = '패널 열기',
  sideCloseLabel = '패널 닫기',
}: AdminPageLayoutProps) {
  // 1280 미만에서만 의미가 있는 상태 — 그 이상에서는 CSS가 side를 항상 펼쳐 보여준다
  const [sideOpen, setSideOpen] = useState(false)
  const sideId = useId()

  const hasHeader = title != null || description != null || headerActions != null
  const hasSide = side != null
  const hasAside = aside != null

  // 폭은 CSS 변수로 넘겨 미디어쿼리에서도 같은 값을 쓰게 한다
  const vars = {
    '--apl-side-w': `${sideWidth}px`,
    '--apl-aside-w': `${asideWidth}px`,
  } as CSSProperties

  const bodyClass = [styles.body, hasSide ? styles.withSide : '', hasAside ? styles.withAside : '']
    .filter(Boolean)
    .join(' ')

  const sideClass = [styles.side, sideOpen ? '' : styles.sideClosed].filter(Boolean).join(' ')
  const asideClass = [styles.aside, asideSticky ? styles.sticky : ''].filter(Boolean).join(' ')

  return (
    <div className={styles.root} data-density={density} style={vars}>
      <PageContainer maxWidth={maxWidth} padding="md" gap="md">
        {hasHeader && (
          <header className={styles.header}>
            <div className={styles.headings}>
              {title != null && <h1 className={styles.title}>{title}</h1>}
              {description != null && <p className={styles.description}>{description}</p>}
            </div>
            {headerActions != null && <div className={styles.headerActions}>{headerActions}</div>}
          </header>
        )}

        {tabs != null && <div className={styles.tabs}>{tabs}</div>}

        {hasSide && showSideToggle && (
          <div className={styles.sideToggleRow}>
            <button
              type="button"
              className={styles.sideToggle}
              aria-expanded={sideOpen}
              aria-controls={sideId}
              onClick={() => setSideOpen((open) => !open)}
            >
              {sideToggleIcon ?? <PanelLeft size={16} aria-hidden="true" />}
              <span>{sideOpen ? sideCloseLabel : sideOpenLabel}</span>
            </button>
          </div>
        )}

        <div className={bodyClass}>
          {hasSide && (
            <div className={sideClass} id={sideId}>
              {side}
            </div>
          )}

          <div className={styles.main}>
            {toolbar != null && <div className={styles.toolbar}>{toolbar}</div>}
            <div className={styles.content}>{children}</div>
          </div>

          {hasAside && <aside className={asideClass}>{aside}</aside>}
        </div>

        {footer != null && <div className={styles.footer}>{footer}</div>}
      </PageContainer>
    </div>
  )
}
