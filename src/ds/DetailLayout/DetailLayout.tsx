import type { ReactNode } from 'react'
// 어드민 1920 레이아웃 상수(--admin-*) — 단일 소스
import '../PageContainer/layout.css'
import styles from './DetailLayout.module.css'

/** 사이드 레일이 서는 쪽 — right=요약·메타(기본) / left=FormAnchorNav·CategoryTree */
export type DetailLayoutAsidePlacement = 'left' | 'right'

/** 하단 액션 바 정렬 — end=[취소][저장](기본) / between=좌측 [삭제] · 우측 [취소][저장] / start */
export type DetailLayoutFooterAlign = 'start' | 'between' | 'end'

export type DetailLayoutProps = {
  /** 본문 — 폼 섹션(PageSection) 스택 */
  children: ReactNode
  /** 우측 사이드 — 요약/상태/메타 카드 */
  aside?: ReactNode
  /** 사이드 폭 — md=360 / sm=280 (기본 md) */
  asideWidth?: 'sm' | 'md'
  /**
   * 사이드가 서는 쪽 (기본 right).
   * left는 FormAnchorNav·CategoryTree처럼 본문보다 먼저 읽혀야 하는 레일 — DOM 순서도 함께 바뀐다.
   */
  asidePlacement?: DetailLayoutAsidePlacement
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
  /**
   * 하단 액션 바 정렬 (기본 end).
   * between은 좌측 [삭제] · 우측 [취소][저장]인 상세 화면의 흔한 액션 바다 —
   * 이 축이 없어서 그런 화면은 액션 바를 직접 만들고 있었다.
   */
  footerAlign?: DetailLayoutFooterAlign
  /**
   * 본문 최대 폭 — 주지 않으면 부모 폭을 그대로 쓴다(기존 동작: PageContainer가 폭을 잡는다).
   * 페이지 컨테이너 없이 단독으로 쓰는 자리에서 1920 규격(full=1600 / lg=1200 / md=768)을 지키기 위한 축.
   */
  maxWidth?: 'md' | 'lg' | 'full'
  /**
   * 밀도 (기본 compact) — 루트에 data-density와 CSS 변수(--admin-row-h 등)를 심어 자식이 읽어 쓰게 한다.
   * 형제 레이아웃(AdminPageLayout)과 같은 계약이다. AdminTable은 이 변수를 읽지 않으므로
   * 표까지 맞추려면 AdminTable에 density를 명시적으로 넘겨야 한다.
   */
  density?: 'compact' | 'comfortable'
}

/**
 * 어드민 상세 페이지 뼈대 — 본문 + 사이드 레일 + 하단 액션 바.
 * PageContainer(maxWidth="full") 안에 넣거나, 단독으로 쓸 땐 maxWidth로 폭을 잡는다.
 *
 * 문구를 그리지 않는다(children/aside/footer 슬롯 배치 전용) — labels 통로가 없는 이유다.
 */
export function DetailLayout({
  children,
  aside,
  asideWidth = 'md',
  asidePlacement = 'right',
  sticky = true,
  footer,
  showFooter = true,
  footerAlign = 'end',
  maxWidth,
  density = 'compact',
}: DetailLayoutProps) {
  const hasAside = aside != null

  const rootClass = [styles.root, maxWidth != null ? styles[`max-${maxWidth}` as const] : '']
    .filter(Boolean)
    .join(' ')

  const bodyClass = [
    styles.body,
    hasAside ? styles[`aside-${asidePlacement}-${asideWidth}` as const] : styles.single,
  ].join(' ')

  const asideClass = [styles.aside, sticky ? styles.sticky : ''].filter(Boolean).join(' ')
  const footerClass = [styles.footer, styles[`align-${footerAlign}` as const]].join(' ')

  const asideNode = hasAside ? <aside className={asideClass}>{aside}</aside> : null

  return (
    <div className={rootClass} data-density={density}>
      <div className={bodyClass}>
        {/* 좌측 레일은 본문보다 먼저 읽혀야 한다 — 시각 순서와 DOM 순서를 어긋나게 두지 않는다 */}
        {asidePlacement === 'left' && asideNode}
        <div className={styles.main}>{children}</div>
        {asidePlacement === 'right' && asideNode}
      </div>
      {showFooter && footer != null && <div className={footerClass}>{footer}</div>}
    </div>
  )
}
