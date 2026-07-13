import type { ReactNode } from 'react'
import { Badge } from '../Badge/Badge'
import styles from './PageHeaderBar.module.css'

export type PageHeaderBarTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error'

/**
 * 제목 옆 상태 배지.
 * appearance·size는 Badge의 축을 그대로 연다 — '판매중지'처럼 강한 톤이 필요한 상태를
 * soft·sm에 가둬 두지 않기 위해서다(기본값은 지금까지와 같은 soft·sm).
 */
export type PageHeaderBarBadge = {
  label: string
  tone?: PageHeaderBarTone
  appearance?: 'solid' | 'soft' | 'outline'
  size?: 'sm' | 'md'
}

/** 제목 줄과 액션의 관계 — row=한 줄(기본) / stack=액션을 제목 아래로 */
export type PageHeaderBarLayout = 'row' | 'stack'

export type PageHeaderBarProps = {
  /** 없으면 헤딩 자체를 렌더하지 않는다 — 설명/액션만 있는 줄에 빈 h1이 남지 않게 */
  title?: string
  description?: string
  /** 제목 옆 상태 배지 — '활성', '임시저장' 등 */
  badge?: PageHeaderBarBadge
  /**
   * 상태가 둘 이상인 화면('임시저장' + '노출중')용 — 선언 순서대로 제목 옆에 붙는다.
   * badge와 함께 주면 badge가 먼저 온다(기존 화면의 배지 자리가 밀리지 않게).
   */
  badges?: PageHeaderBarBadge[]
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
   * sm은 카드·드로어 안에 놓이는 더 작은 헤더 — 이 규격이 없어서 그런 자리는 제목 마크업을 직접 만들고 있었다.
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * 제목 태그 (기본 1 = h1).
   * 한 페이지에 여러 번 놓이는 섹션 헤더는 2(h2)로 낮춘다 — h1이 여러 개면 문서 개요가 깨진다.
   */
  headingLevel?: 1 | 2
  /**
   * 제목과 액션의 줄바꿈 규칙 (기본 row = 한 줄).
   * stack은 액션이 3개 이상이거나 폭이 좁아 타이틀이 눌리는 화면에서 액션을 제목 아래로 내린다.
   */
  layout?: PageHeaderBarLayout
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
 *
 * 문구는 전부 prop이다(title·description·badge.label·actions) — 컴포넌트 안에 리터럴이 한 개도 없어
 * labels 통로를 따로 두지 않는다(두면 같은 문구에 통로가 두 개가 된다).
 */
export function PageHeaderBar({
  title,
  description,
  badge,
  badges,
  actions,
  sticky = false,
  showDivider = true,
  size = 'lg',
  headingLevel = 1,
  layout = 'row',
}: PageHeaderBarProps) {
  const className = [
    styles.root,
    layout === 'stack' ? styles.stack : '',
    sticky ? styles.sticky : '',
    sticky && showDivider ? styles.divider : '',
  ]
    .filter(Boolean)
    .join(' ')

  const titleClassName = [styles.title, size === 'lg' ? '' : styles[`title-${size}` as const]]
    .filter(Boolean)
    .join(' ')

  // 태그만 바꾼다 — 크기는 size가 따로 갖는다(태그와 시각 위계를 묶지 않는다)
  const Heading = headingLevel === 2 ? 'h2' : 'h1'

  // 단수 badge와 복수 badges를 한 배열로 합친다 — 그리는 자리는 한 곳뿐이다
  const badgeList: PageHeaderBarBadge[] = [...(badge != null ? [badge] : []), ...(badges ?? [])]

  return (
    <header className={className}>
      <div className={styles.headings}>
        {(title != null || badgeList.length > 0) && (
          <div
            className={[styles.titleRow, badgeList.length > 1 ? styles.titleRowWrap : '']
              .filter(Boolean)
              .join(' ')}
          >
            {title != null && <Heading className={titleClassName}>{title}</Heading>}
            {badgeList.map((item) => (
              <span key={item.label} className={styles.badge}>
                <Badge
                  variant={item.tone ?? 'primary'}
                  appearance={item.appearance ?? 'soft'}
                  size={item.size ?? 'sm'}
                  label={item.label}
                />
              </span>
            ))}
          </div>
        )}
        {description != null && <p className={styles.description}>{description}</p>}
      </div>

      {actions != null && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}
