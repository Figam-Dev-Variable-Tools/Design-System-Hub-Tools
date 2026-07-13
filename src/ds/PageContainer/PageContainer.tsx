import type { ReactNode } from 'react'
import { PageHeaderBar } from '../PageHeaderBar/PageHeaderBar'
// 어드민 1920 레이아웃 상수(--admin-*) — 단일 소스
import './layout.css'
import styles from './PageContainer.module.css'

/** 외곽 여백 — none=0 / sm=24(드로어·모달·탭 패널) / md=40(1920 페이지 규격) */
export type PageContainerPadding = 'none' | 'sm' | 'md'

/** 배경 면 — subtle=회색 캔버스(페이지) / plain=투명(흰 면 위에 얹는 자리) */
export type PageContainerSurface = 'subtle' | 'plain'

export type PageContainerProps = {
  children: ReactNode
  /** 본문 최대 폭 — full=1600 / lg=1200 / md=768 (기본 lg) */
  maxWidth?: 'md' | 'lg' | 'full'
  /**
   * 외곽 여백 (기본 md=40).
   * sm(24)은 드로어·모달·탭 패널처럼 바깥이 이미 여백을 갖는 자리를 위한 한 단계 좁은 규격이다 —
   * 이 축이 없어서 화면들이 padding='none' + 자체 패딩으로 우회하고 있었다.
   */
  padding?: PageContainerPadding
  /** 섹션 간 수직 리듬 — md=24 / lg=32 (기본 md) */
  gap?: 'md' | 'lg'
  /**
   * 배경 면 (기본 subtle=회색 캔버스).
   * plain은 흰 배경 위에 얹는 페이지 — 회색 면이 강제로 깔리지 않는다.
   */
  surface?: PageContainerSurface
}

/**
 * 어드민 페이지 본문 규격 — 배경/폭/수직 리듬을 표준화한다.
 * 1920 캔버스 기준: 사이드바 240 + 콘텐츠 1680(패딩 40 + 실사용 1600 + 패딩 40).
 */
export function PageContainer({
  children,
  maxWidth = 'lg',
  padding = 'md',
  gap = 'md',
  surface = 'subtle',
}: PageContainerProps) {
  const className = [
    styles.container,
    styles[`surface-${surface}` as const],
    padding === 'none' ? '' : styles[`pad-${padding}` as const],
  ]
    .filter(Boolean)
    .join(' ')
  const innerClass = [styles.inner, styles[`max-${maxWidth}` as const], styles[`gap-${gap}` as const]].join(' ')

  return (
    <div className={className}>
      <div className={innerClass}>{children}</div>
    </div>
  )
}

/** 섹션 크롬 — card=흰 카드(기본) / outline=보더만(투명 면) / plain=크롬 없음 */
export type PageSectionAppearance = 'card' | 'plain' | 'outline'

/** 섹션 톤 — 경고 섹션(위험 설정·되돌릴 수 없는 작업)을 색이 아니라 축으로 표현한다 */
export type PageSectionTone = 'default' | 'warning'

/** 카드 안쪽 여백 — comfortable=20(기본) / compact=12 */
export type PageSectionDensity = 'comfortable' | 'compact'

export type PageSectionProps = {
  children: ReactNode
  title?: string
  description?: string
  /** 섹션 헤더 우측 액션 슬롯 */
  actions?: ReactNode
  /**
   * 본문을 카드로 감쌀지 여부 (기본 true).
   * @deprecated appearance를 쓴다 — card는 켜고 끄는 스위치라 강조·경고 톤을 표현할 자리가 없었다.
   * (appearance를 주면 그쪽이 이긴다. 안 주면 card=false → 'plain', 그 외 → 'card')
   */
  card?: boolean
  /** 섹션 크롬 (기본 card). 표를 담는 섹션은 plain으로 카드 이중 보더를 피한다 */
  appearance?: PageSectionAppearance
  /** 섹션 톤 (기본 default). warning은 위험 설정 구역 */
  tone?: PageSectionTone
  /** 카드 안쪽 여백 (기본 comfortable=20) */
  density?: PageSectionDensity
}

/**
 * 페이지 섹션 — 제목/설명/액션 + 본문 카드.
 *
 * 헤더 줄(제목 + 설명 + 우측 액션)은 PageHeaderBar가 단일 출처다 — 여기서 다시 짜지 않는다.
 * 섹션은 페이지 안에 여러 번 놓이므로 헤딩만 h2로 낮추고(headingLevel), 크기도 한 단계 내린다(size="md").
 */
export function PageSection({
  children,
  title,
  description,
  actions,
  card = true,
  appearance,
  tone = 'default',
  density = 'comfortable',
}: PageSectionProps) {
  const hasHeader = title != null || description != null || actions != null

  // 하위호환: appearance가 없으면 기존 card 스위치가 크롬을 정한다
  const chrome: PageSectionAppearance = appearance ?? (card ? 'card' : 'plain')

  // 크롬이 없는 면(plain)에는 톤·여백을 칠할 자리가 없다 — 보더도 배경도 없기 때문이다
  const hasChrome = chrome !== 'plain'

  const bodyClass = [
    styles[chrome],
    hasChrome && tone === 'warning' ? styles['tone-warning'] : '',
    hasChrome ? styles[`density-${density}` as const] : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={styles.section}>
      {hasHeader && (
        <PageHeaderBar
          title={title}
          description={description}
          actions={actions}
          size="md"
          headingLevel={2}
        />
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  )
}
