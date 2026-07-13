import type { ReactNode } from 'react'
import { PageHeaderBar } from '../PageHeaderBar/PageHeaderBar'
// 어드민 1920 레이아웃 상수(--admin-*) — 단일 소스
import './layout.css'
import styles from './PageContainer.module.css'

export type PageContainerProps = {
  children: ReactNode
  /** 본문 최대 폭 — full=1600 / lg=1200 / md=768 (기본 lg) */
  maxWidth?: 'md' | 'lg' | 'full'
  /** 외곽 여백 — md=40px (기본 md) */
  padding?: 'none' | 'md'
  /** 섹션 간 수직 리듬 — md=24 / lg=32 (기본 md) */
  gap?: 'md' | 'lg'
}

/**
 * 어드민 페이지 본문 규격 — 배경/폭/수직 리듬을 표준화한다.
 * 1920 캔버스 기준: 사이드바 240 + 콘텐츠 1680(패딩 40 + 실사용 1600 + 패딩 40).
 */
export function PageContainer({ children, maxWidth = 'lg', padding = 'md', gap = 'md' }: PageContainerProps) {
  const className = [styles.container, padding === 'md' ? styles.padded : ''].filter(Boolean).join(' ')
  const innerClass = [styles.inner, styles[`max-${maxWidth}` as const], styles[`gap-${gap}` as const]].join(' ')

  return (
    <div className={className}>
      <div className={innerClass}>{children}</div>
    </div>
  )
}

export type PageSectionProps = {
  children: ReactNode
  title?: string
  description?: string
  /** 섹션 헤더 우측 액션 슬롯 */
  actions?: ReactNode
  /** 본문을 카드로 감쌀지 여부 (기본 true) */
  card?: boolean
}

/**
 * 페이지 섹션 — 제목/설명/액션 + 본문 카드.
 *
 * 헤더 줄(제목 + 설명 + 우측 액션)은 PageHeaderBar가 단일 출처다 — 여기서 다시 짜지 않는다.
 * 섹션은 페이지 안에 여러 번 놓이므로 헤딩만 h2로 낮추고(headingLevel), 크기도 한 단계 내린다(size="md").
 */
export function PageSection({ children, title, description, actions, card = true }: PageSectionProps) {
  const hasHeader = title != null || description != null || actions != null

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
      <div className={card ? styles.card : styles.plain}>{children}</div>
    </section>
  )
}
