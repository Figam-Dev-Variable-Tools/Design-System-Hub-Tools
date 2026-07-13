import type { ReactNode } from 'react'
import { Badge } from '../Badge/Badge'
import styles from './PageHeaderBar.module.css'

export type PageHeaderBarTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error'

export type PageHeaderBarProps = {
  /** 없으면 헤딩 자체를 렌더하지 않는다 — 설명/액션만 있는 줄에 빈 h1이 남지 않게 */
  title?: string
  description?: string
  /** 제목 옆 상태 배지 — '활성', '임시저장' 등 */
  badge?: { label: string; tone?: PageHeaderBarTone }
  /** 우측 액션 — [엑셀 다운로드], [저장] */
  actions?: ReactNode
  /** 스크롤해도 상단에 붙는다(긴 폼의 저장 버튼) */
  sticky?: boolean
  /**
   * sticky 하단 보더 (기본 true).
   * 바로 아래 콘텐츠가 이미 보더를 가진 카드/표라면 선이 두 겹으로 보이므로 끈다.
   * (sticky가 아닐 땐 보더 자체가 없어 아무 영향이 없다)
   */
  showDivider?: boolean
  /**
   * 제목 크기 (기본 lg = 페이지 타이틀).
   * md는 페이지 "안쪽" 섹션 헤더용 한 단계 작은 규격이다 — PageSection이 이 규격으로 쓴다.
   */
  size?: 'md' | 'lg'
  /**
   * 제목 태그 (기본 1 = h1).
   * 한 페이지에 여러 번 놓이는 섹션 헤더는 2(h2)로 낮춘다 — h1이 여러 개면 문서 개요가 깨진다.
   */
  headingLevel?: 1 | 2
}

/**
 * PageHeaderBar — 페이지 상단 타이틀 줄.
 * ('고객 목록 + 설명 + [엑셀 다운로드]', '메인 비주얼 수정 + 활성 배지 + [저장]')
 *
 * 레이아웃을 갖지 않는 조각이다. AdminPageLayout의 header 자리에 넣어 쓴다 —
 * AdminPageLayout의 title/description/headerActions prop을 비우고 이 컴포넌트를
 * 본문 맨 위에 놓으면 헤더 슬롯이 통째로 이 조각으로 바뀐다.
 * 페이지 골격(그리드·여백)을 여기서 다시 짜지 않는다.
 *
 * "타이틀 + 설명 + 우측 액션" 한 줄의 단일 출처다 — PageSection의 섹션 헤더도
 * size="md" · headingLevel={2}로 이 조각을 그대로 쓴다.
 */
export function PageHeaderBar({
  title,
  description,
  badge,
  actions,
  sticky = false,
  showDivider = true,
  size = 'lg',
  headingLevel = 1,
}: PageHeaderBarProps) {
  const className = [
    styles.root,
    sticky ? styles.sticky : '',
    sticky && showDivider ? styles.divider : '',
  ]
    .filter(Boolean)
    .join(' ')

  const titleClassName = [styles.title, size === 'md' ? styles.titleMd : ''].filter(Boolean).join(' ')

  // 태그만 바꾼다 — 크기는 size가 따로 갖는다(태그와 시각 위계를 묶지 않는다)
  const Heading = headingLevel === 2 ? 'h2' : 'h1'

  return (
    <header className={className}>
      <div className={styles.headings}>
        {(title != null || badge != null) && (
          <div className={styles.titleRow}>
            {title != null && <Heading className={titleClassName}>{title}</Heading>}
            {badge != null && (
              <span className={styles.badge}>
                <Badge variant={badge.tone ?? 'primary'} appearance="soft" size="sm" label={badge.label} />
              </span>
            )}
          </div>
        )}
        {description != null && <p className={styles.description}>{description}</p>}
      </div>

      {actions != null && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}
