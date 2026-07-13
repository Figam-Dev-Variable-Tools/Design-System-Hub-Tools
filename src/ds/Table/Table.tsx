import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  mergeLabels,
  resolveLabel,
  type EmptyCellLabels,
  type LabelFn,
} from '../../shared/labels'
import styles from './Table.module.css'

export type TableColumn<T> = {
  key: string
  /** 문자열이 기본이지만 헤더 체크박스 등 커스텀 노드도 허용 */
  header: ReactNode
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (row: T) => ReactNode
}

/** 표 문구 — 값이 없는 셀 표기(공용 EmptyCellLabels)에 표 전용 문구를 얹는다 */
export type TableLabels = EmptyCellLabels & {
  /** <caption>(시각적 숨김) — 주면 표가 접근성 이름을 갖는다. 없으면 캡션을 그리지 않는다. */
  caption?: string
  /** 빈 표의 한 줄 문구 — 개별 prop(emptyText)이 이긴다 */
  empty?: string
  /** 정렬 버튼의 접근성 이름 — 헤더가 문자열인 컬럼에만 적용된다 */
  sortBy?: LabelFn<string>
}

type TableLabelsResolved = Required<Omit<TableLabels, 'caption'>> & Pick<TableLabels, 'caption'>

export const DEFAULT_TABLE_LABELS: TableLabelsResolved = {
  /**
   * 값이 없는 셀의 표기.
   * 공용 타입의 주석은 '-'를 예로 들지만 기본값은 빈 문자열이다 —
   * 지금까지 빈 셀은 아무것도 그리지 않았고, '-'로 바꾸면 기존 표 전부의 렌더가 바뀐다(회귀).
   */
  emptyCell: '',
  empty: '데이터가 없습니다.',
  sortBy: (columnLabel) => `${columnLabel} 기준 정렬`,
}

export type TableProps<T> = {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  striped?: boolean
  bordered?: boolean
  /**
   * @deprecated density='compact'를 쓴다. 하위호환으로 유지된다(density를 주면 그쪽이 이긴다).
   */
  compact?: boolean
  /**
   * 밀도 — AdminTable·AdminCard·DefinitionList와 같은 축 이름을 쓴다.
   * 미지정 시 기존 compact boolean을 따른다(기본 comfortable).
   */
  density?: 'comfortable' | 'compact'
  /**
   * 헤더 고정 (기본 false).
   * 세로로 긴 표에서 헤더가 스크롤 밖으로 나가면 컬럼의 뜻을 잃는다.
   * 스크롤될 높이가 있어야 의미가 있으므로 maxHeight와 함께 쓴다.
   */
  stickyHeader?: boolean
  /** 표 영역의 최대 높이 — 넘치면 세로 스크롤된다(stickyHeader의 짝) */
  maxHeight?: number | string
  /** @deprecated labels.empty를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  emptyText?: string
  onRowClick?: (row: T) => void
  /** 문구 — 개별 prop(emptyText)이 있으면 그쪽이 이긴다 */
  labels?: TableLabels
}

type SortDir = 'asc' | 'desc'
type SortState = { key: string; dir: SortDir } | null

function SortIcon({ dir }: { dir: SortDir | null }) {
  if (dir === 'asc') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 15l6-6 6 6" />
      </svg>
    )
  }
  if (dir === 'desc') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 9l5-5 5 5" />
      <path d="M7 15l5 5 5-5" />
    </svg>
  )
}

/** 문자열은 localeCompare, 숫자는 수치 비교 */
function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a ?? '').localeCompare(String(b ?? ''), 'ko')
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  striped = false,
  bordered = false,
  compact = false,
  density,
  stickyHeader = false,
  maxHeight,
  emptyText,
  onRowClick,
  labels,
}: TableProps<T>) {
  const [sort, setSort] = useState<SortState>(null)

  const L = mergeLabels(DEFAULT_TABLE_LABELS, labels)
  const resolvedEmpty = resolveLabel(emptyText, L.empty) ?? DEFAULT_TABLE_LABELS.empty
  // density가 새 축이고 compact는 그 하위호환 — 둘 다 없으면 comfortable
  const isCompact = density != null ? density === 'compact' : compact

  // asc → desc → none 순환
  const cycleSort = (key: string) => {
    setSort((prev) => {
      if (prev == null || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  const sorted =
    sort == null
      ? rows
      : [...rows].sort((a, b) => {
          const result = compareValues(
            (a as Record<string, unknown>)[sort.key],
            (b as Record<string, unknown>)[sort.key],
          )
          return sort.dir === 'asc' ? result : -result
        })

  const cellValue = (row: T, col: TableColumn<T>): ReactNode => {
    if (col.render) return col.render(row)
    const raw = (row as Record<string, unknown>)[col.key]
    // 값이 없는 셀은 문구가 정한다 — 기본값이 빈 문자열이라 지금까지의 렌더와 같다
    if (raw == null || raw === '') return L.emptyCell
    return String(raw)
  }

  const cellStyle = (col: TableColumn<T>): CSSProperties => ({
    width: col.width,
    textAlign: col.align,
  })

  const tableClass = [
    styles.table,
    striped ? styles.striped : '',
    bordered ? styles.bordered : '',
    isCompact ? styles.compact : '',
    stickyHeader ? styles.stickyHeader : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    // 좁아지면 셀이 줄바꿈으로 짜부라지는 대신 래퍼가 가로 스크롤된다.
    // maxHeight를 주면 세로로도 스크롤된다 — stickyHeader가 붙을 자리다.
    <div className={styles.scroll} style={{ maxHeight }}>
      <table className={tableClass}>
        {/* 캡션은 문구를 줬을 때만 — 표의 접근성 이름이고 화면에서는 숨긴다(AnalyticsTable과 같은 방식) */}
        {L.caption != null && <caption className={styles.srOnly}>{L.caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => {
              const dir = sort != null && sort.key === col.key ? sort.dir : null
              // 헤더가 문자열일 때만 이름을 만들 수 있다(체크박스 헤더 등은 자기 이름을 갖는다)
              const sortLabel =
                typeof col.header === 'string' ? L.sortBy(col.header) : undefined
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={styles.th}
                  style={cellStyle(col)}
                  aria-sort={dir == null ? undefined : dir === 'asc' ? 'ascending' : 'descending'}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className={styles.sortButton}
                      aria-label={sortLabel}
                      onClick={() => cycleSort(col.key)}
                    >
                      {col.header}
                      <span className={dir == null ? styles.sortIcon : styles.sortIconActive}>
                        <SortIcon dir={dir} />
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td className={[styles.td, styles.empty].join(' ')} colSpan={columns.length}>
                {resolvedEmpty}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={rowKey(row)}
                className={[styles.row, onRowClick ? styles.clickable : ''].filter(Boolean).join(' ')}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={styles.td} style={cellStyle(col)}>
                    {cellValue(row, col)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
