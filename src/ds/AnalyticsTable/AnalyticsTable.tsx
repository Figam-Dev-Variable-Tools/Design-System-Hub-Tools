import styles from './AnalyticsTable.module.css'
import { EmptyState } from '../EmptyState/EmptyState'

export type AnalyticsAlign = 'left' | 'right'

export type AnalyticsColumn = {
  key: string
  label: string
  /** 생략하면 첫 데이터 행의 값 타입으로 정한다 — 숫자면 right, 나머지는 left */
  align?: AnalyticsAlign
  /** 셀 표기 변환. 없으면 숫자는 자릿수 구분, null/undefined는 '-' */
  format?: (v: unknown) => string
}

export type AnalyticsSummary = {
  /** 첫 컬럼 자리에 들어갈 행 머리말 — 예: 합계, 일 평균 */
  label: string
  row: Record<string, unknown>
}

export type AnalyticsTableProps = {
  columns: AnalyticsColumn[]
  rows: Record<string, unknown>[]
  /** 하단 고정 요약 행 — 합계·평균 등 */
  summaries?: AnalyticsSummary[]
  /** 헤더 줄 — 컬럼이 자명한 미니 표(대시보드 카드 안 등)에서 끈다 */
  showHeader?: boolean
  /** 0을 흐리게 눌러 두기 — 0이 '없음'이 아니라 유효한 값인 표(재고·잔액)에서는 끈다 */
  dimZero?: boolean
  /** 행 44 → 36px로 조이기. 기본은 기존 밀도(false) */
  dense?: boolean
  /** 데이터가 없을 때 제목 */
  emptyText?: string
  /** 데이터가 없을 때 보조 문구 */
  emptyDescription?: string
}

/** 기본 표기 — 숫자는 자릿수 구분, 빈 값은 '-' */
function defaultFormat(value: unknown): string {
  if (value == null || value === '') return '-'
  if (typeof value === 'number') return Number.isFinite(value) ? value.toLocaleString('ko-KR') : '-'
  if (typeof value === 'boolean') return value ? 'Y' : 'N'
  return String(value)
}

function formatCell(column: AnalyticsColumn, value: unknown): string {
  return column.format != null ? column.format(value) : defaultFormat(value)
}

/** 0은 흐리게 — 표기가 '0원'이어도 원본 값이 0이면 눌러 준다 */
function isZero(value: unknown): boolean {
  if (typeof value === 'number') return value === 0
  if (typeof value === 'string') return value.trim() === '0'
  return false
}

/** 정렬 미지정 컬럼 — 첫 번째 비어있지 않은 값이 숫자면 우측 정렬 */
function resolveAlign(column: AnalyticsColumn, rows: Record<string, unknown>[]): AnalyticsAlign {
  if (column.align != null) return column.align
  const sample = rows.find((row) => row[column.key] != null)
  return sample != null && typeof sample[column.key] === 'number' ? 'right' : 'left'
}

/**
 * 기간별 분석 표 — 일자별 주문수·매출액·방문자 등을 촘촘히 훑고 합계로 마무리한다.
 *
 * 밀도는 카페24/아임웹: 행 44px · 셀 패딩 8/12 · 본문 13px · 헤더 12px.
 * 마감은 Toss: 그림자 없이 1px 보더 + radius, 헤더만 bgSubtle, 행 구분선 한 겹.
 * 합계 행은 tfoot에 두고 sticky bottom — 높이를 제한한 컨테이너 안에서도 항상 보인다.
 *
 * 공용 Table로 갈아타지 않는 이유: Table에는 tfoot(요약 행)이 없다. 이 표의 존재 이유가
 * "스크롤해도 바닥에 붙어 있는 합계"라서, 그걸 잃으면서까지 표 한 벌을 아낄 이유가 없다.
 * 단순 목록이면 이 컴포넌트 말고 Table을 쓰면 된다.
 */
export function AnalyticsTable({
  columns,
  rows,
  summaries = [],
  showHeader = true,
  dimZero = true,
  dense = false,
  emptyText = '분석할 데이터가 없습니다',
  emptyDescription = '기간을 다시 선택해 보세요.',
}: AnalyticsTableProps) {
  // 정렬은 행 데이터로 한 번만 정해 헤더/본문/합계가 같은 축을 쓰게 한다
  const aligns = columns.map((column) => resolveAlign(column, rows))

  // 0 흐리게 처리는 스위치 하나로 껐다 켠다 — 셀마다 조건을 흩뿌리지 않는다
  const zeroClass = (value: unknown): string => (dimZero && isZero(value) ? styles.zero : '')

  const rootClass = [styles.analyticsTable, dense ? styles.dense : ''].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      {/* 좁아지면 셀이 짜부라지는 대신 이 래퍼가 가로로 스크롤된다 */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          {showHeader && (
            <thead>
              <tr>
                {columns.map((column, i) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={[styles.th, aligns[i] === 'right' ? styles.right : styles.left].join(' ')}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={styles.emptyCell} colSpan={columns.length}>
                  <EmptyState kind="empty" title={emptyText} description={emptyDescription} compact />
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={styles.row}>
                  {columns.map((column, i) => {
                    const value = row[column.key]
                    return (
                      <td
                        key={column.key}
                        className={[
                          styles.td,
                          aligns[i] === 'right' ? styles.right : styles.left,
                          zeroClass(value),
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {formatCell(column, value)}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>

          {summaries.length > 0 && (
            <tfoot>
              {summaries.map((summary) => (
                <tr key={summary.label} className={styles.summaryRow}>
                  {columns.map((column, i) => {
                    // 첫 컬럼 자리는 '합계' 같은 행 머리말이 차지한다
                    if (i === 0) {
                      return (
                        <th key={column.key} scope="row" className={[styles.summaryCell, styles.left].join(' ')}>
                          {summary.label}
                        </th>
                      )
                    }

                    const value = summary.row[column.key]
                    return (
                      <td
                        key={column.key}
                        className={[
                          styles.summaryCell,
                          aligns[i] === 'right' ? styles.right : styles.left,
                          zeroClass(value),
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {formatCell(column, value)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
