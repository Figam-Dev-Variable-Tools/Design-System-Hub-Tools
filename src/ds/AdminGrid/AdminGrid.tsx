import type { CSSProperties, ReactNode } from 'react'
// 어드민 1920 레이아웃 상수(--admin-*) — 단일 소스
import '../PageContainer/layout.css'
import styles from './AdminGrid.module.css'

/** 기준 컬럼 수 — 1920 캔버스 실사용 1600 기준 12컬럼(컬럼 ≈ 111.3px, gutter 24) */
const COLUMNS = 12
/** <1440 폴백 */
const COLUMNS_MD = 8
/** <1024 폴백 */
const COLUMNS_SM = 4
const GUTTER = 24

const clamp = (value: number, max: number) => Math.min(Math.max(Math.round(value), 1), max)

export type AdminGridProps = {
  children: ReactNode
  /** 컬럼 수 (기본 12) */
  columns?: number
  /** 컬럼 사이 간격 px (기본 24) */
  gutter?: number
}

/**
 * 어드민 12컬럼 그리드 — 상세 페이지 조합용 배치 프리미티브.
 * 뷰포트가 좁아지면 12 → 8(<1440) → 4(<1024) 컬럼으로 폴백한다.
 */
export function AdminGrid({ children, columns = COLUMNS, gutter = GUTTER }: AdminGridProps) {
  const cols = clamp(columns, COLUMNS)

  const style = {
    '--grid-cols': cols,
    '--grid-cols-md': Math.min(cols, COLUMNS_MD),
    '--grid-cols-sm': Math.min(cols, COLUMNS_SM),
    '--grid-gutter': `${Math.max(Math.round(gutter), 0)}px`,
  } as CSSProperties

  return (
    <div className={styles.grid} style={style}>
      {children}
    </div>
  )
}

export type AdminGridItemProps = {
  children: ReactNode
  /** 차지할 컬럼 수 1~12 (기본 12 — 한 줄 전체) */
  span?: number
  /** <1440(8컬럼)에서의 span — 기본 min(span, 8) */
  spanMd?: number
  /** <1024(4컬럼)에서의 span — 기본 min(span, 4) */
  spanSm?: number
}

/** 그리드 셀 — `span={8}` + `span={4}` 로 "좌 8 : 우 4" 배치를 선언한다 */
export function AdminGridItem({ children, span = COLUMNS, spanMd, spanSm }: AdminGridItemProps) {
  const base = clamp(span, COLUMNS)
  const md = spanMd != null ? clamp(spanMd, COLUMNS_MD) : Math.min(base, COLUMNS_MD)
  const sm = spanSm != null ? clamp(spanSm, COLUMNS_SM) : Math.min(base, COLUMNS_SM)

  const style = {
    '--item-span': base,
    '--item-span-md': md,
    '--item-span-sm': sm,
  } as CSSProperties

  return (
    <div className={styles.item} style={style}>
      {children}
    </div>
  )
}
