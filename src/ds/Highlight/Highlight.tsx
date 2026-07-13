import type { ReactNode } from 'react'
import styles from './Highlight.module.css'

/**
 * 강조 톤.
 *   accent — SiteSection이 내려주는 --site-accent-text를 그대로 소비한다(섹션의 강조색을 따라간다).
 *   그 외   — 흰 배경에서 AA(4.5:1)를 넘는 톤별 텍스트 셰이드.
 * 색을 새로 만들지 않는다 — 전부 기존 토큰이다.
 */
export type HighlightTone = 'accent' | 'primary' | 'success' | 'warning' | 'error'

export type HighlightProps = {
  children: ReactNode
  /** 기본 accent — 섹션 강조색을 상속한다 */
  tone?: HighlightTone
  /** 굵기 — inherit=주변 글자 그대로(기본) / bold=한 단어만 더 굵게 */
  weight?: 'inherit' | 'bold'
}

/**
 * 문장 안의 한 단어만 강조색으로 세우는 인라인 텍스트.
 *
 * 히어로 헤드라인의 강조어(`태산, <Highlight>자연</Highlight>의 가치를…`)처럼
 * 페이지마다 `<span style={{color:…}}>`을 새로 만들던 자리를 대체한다.
 * 색 정의는 SiteSection(--site-accent-text)과 토큰이 소유하고, 여기서는 소비만 한다.
 */
export function Highlight({ children, tone = 'accent', weight = 'inherit' }: HighlightProps) {
  const className = [styles.highlight, styles[tone], weight === 'bold' ? styles.bold : '']
    .filter(Boolean)
    .join(' ')

  return <span className={className}>{children}</span>
}
