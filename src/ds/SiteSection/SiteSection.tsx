import type { ReactNode } from 'react'
import styles from './SiteSection.module.css'

export type SiteSectionProps = {
  children: ReactNode
  /** 강조색 — 가격·연도·라벨·구분선 세그먼트 (기본 success) */
  accent?: 'primary' | 'success'
  /**
   * 헤드라인. 문자열 대신 노드를 넘기면 Highlight로 일부 단어만 강조색을 줄 수 있다
   * (예: `태산, <Highlight>자연</Highlight>의 가치를 공간에 담다.`)
   */
  title?: ReactNode
  /** 서브카피. 여러 줄 히어로 카피는 노드로 넘긴다(center에서는 줄 수 제한이 없다). */
  subtitle?: ReactNode
  /** 우측 상단 액션(정렬 Select 등). center에서는 헤딩 아래 가운데로 내려온다. */
  actions?: ReactNode
  /**
   * 헤더 정렬 — start=좌측(목록·어드민형 섹션·기본값) / center=가운데(페이지 히어로).
   * center에서는 제목·서브카피의 줄 수 제한이 풀리고, 서브카피가 읽기 좋은 폭(measure)으로 좁혀진다.
   */
  align?: 'start' | 'center'
  /** 본문 최대 폭 — lg=1200 / xl=1440 / full=제한 없음 (기본 xl) */
  maxWidth?: 'lg' | 'xl' | 'full'
  /** 섹션 여백 (기본 md) */
  padding?: 'md' | 'lg' | 'none'
  /** 제목 아래 구분선 + 강조색 세그먼트 (center면 세그먼트도 가운데로 선다) */
  divider?: boolean
  /** 섹션 면 — plain=흰색 / subtle=아주 옅은 회색(--ds-color-bgSubtle). 교차시켜 리듬을 만든다. */
  tone?: 'plain' | 'subtle'
}

/**
 * 프론트 전 페이지의 뼈대. **라이트(흰색) 단일 테마**다 — 다크는 없다.
 *
 * 위계는 색 반전이 아니라 tone 교차(흰색 ↔ bgSubtle)로 만든다.
 * 강조색(--site-accent / --site-accent-text)의 정의도 이 컴포넌트의 CSS가 단일 출처이고,
 * 안쪽 콘텐츠(ProductCard·페이지들)는 상속받아 소비만 한다.
 */
export function SiteSection({
  children,
  accent = 'success',
  title,
  subtitle,
  actions,
  align = 'start',
  maxWidth = 'xl',
  padding = 'md',
  divider = false,
  tone = 'plain',
}: SiteSectionProps) {
  const hasHeader = title != null || subtitle != null || actions != null

  const rootClass = [
    styles.root,
    accent === 'primary' ? styles.accentPrimary : styles.accentSuccess,
    tone === 'subtle' ? styles.toneSubtle : styles.tonePlain,
    padding === 'lg' ? styles.padLg : padding === 'none' ? styles.padNone : styles.padMd,
  ].join(' ')

  const innerClass = [
    styles.inner,
    maxWidth === 'lg' ? styles.maxLg : maxWidth === 'full' ? styles.maxFull : styles.maxXl,
  ].join(' ')

  const headerClass = [
    styles.header,
    align === 'center' ? styles.headerCenter : '',
    divider ? styles.divider : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={rootClass}>
      <div className={innerClass}>
        {hasHeader && (
          <div className={headerClass}>
            <div className={styles.headings}>
              {title != null && <h2 className={styles.title}>{title}</h2>}
              {subtitle != null && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {actions != null && <div className={styles.actions}>{actions}</div>}
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  )
}
