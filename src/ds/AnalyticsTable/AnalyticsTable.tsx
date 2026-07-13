import styles from './AnalyticsTable.module.css'
import { EmptyState } from '../EmptyState/EmptyState'
import {
  mergeLabels,
  resolveLabel,
  type DeepPartialOneLevel,
  type EmptyCellLabels,
  type EmptyLabels,
  type Formatters,
} from '../../shared/labels'

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
  /** 강조 톤 — 기본 'neutral'(= 지금 화면 그대로). 'strong'은 합계처럼 결론이 되는 행에 쓴다 */
  tone?: AnalyticsSummaryTone
}

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   셀 표기('-'·'Y'/'N')도 화면에 보이는 글자다 — 컴포넌트 안에 박아 두지 않고 통로를 연다.
   우선순위: 개별 prop(emptyText·emptyDescription) > labels.* > 기본값. */
type AnalyticsTableLabelsResolved = EmptyCellLabels & {
  emptyCell: string
  /** boolean 셀 표기 */
  boolTrue: string
  boolFalse: string
  /** 표 자체의 접근성 이름 — 한 화면에 분석표가 여럿일 때 구별한다. 기본은 이름 없음 */
  caption?: string
  empty: EmptyLabels & { title: string; description: string }
}

export const DEFAULT_ANALYTICS_TABLE_LABELS: AnalyticsTableLabelsResolved = {
  emptyCell: '-',
  boolTrue: 'Y',
  boolFalse: 'N',
  empty: {
    title: '분석할 데이터가 없습니다',
    description: '기간을 다시 선택해 보세요.',
  },
} as const

export type AnalyticsTableLabels = DeepPartialOneLevel<AnalyticsTableLabelsResolved>

/** 요약 행 강조 톤 — 합계(strong)와 일 평균(neutral)이 같은 무게로 붙지 않게 한다 */
export type AnalyticsSummaryTone = 'neutral' | 'strong'

export type AnalyticsTableProps = {
  columns: AnalyticsColumn[]
  rows: Record<string, unknown>[]
  /** 하단 고정 요약 행 — 합계·평균 등 */
  summaries?: AnalyticsSummary[]
  /** 헤더 줄 — 컬럼이 자명한 미니 표(대시보드 카드 안 등)에서 끈다 */
  showHeader?: boolean
  /** 0을 흐리게 눌러 두기 — 0이 '없음'이 아니라 유효한 값인 표(재고·잔액)에서는 끈다 */
  dimZero?: boolean
  /** @deprecated density="compact" 를 쓰세요 (개별 prop이 density보다 우선한다) */
  dense?: boolean
  /**
   * 행 높이 — comfortable 44 / compact 36px.
   * DS의 다른 표·카드(AdminTable·AdminCard·DefinitionList)와 같은 이름·같은 값의 축이다.
   */
  density?: 'comfortable' | 'compact'
  /** 짝수 행 줄무늬 — 30~90행이 이어지는 표에서 가로 추적을 돕는다. 기본 false(= 지금 화면 그대로) */
  striped?: boolean
  /** 헤더 고정 — 인쇄·리포트 캡처처럼 고정이 방해되는 맥락에서 끈다. 기본 true(= 지금 화면 그대로) */
  stickyHeader?: boolean
  /** 요약 행 고정 — 위와 같다. 기본 true */
  stickySummary?: boolean
  /** @deprecated labels.empty.title 을 쓰세요 */
  emptyText?: string
  /** @deprecated labels.empty.description 을 쓰세요 */
  emptyDescription?: string
  /** 화면 문구를 통째로 갈아끼우는 단일 통로 */
  labels?: AnalyticsTableLabels
  /** 숫자 포맷(문구가 아니라 포맷이다) — column.format이 없는 셀의 기본 표기를 바꾼다 */
  formatters?: Formatters
}

/** 기본 숫자 포맷 — formatters.number로 갈아끼운다 */
const defaultNumberFormat = (value: number): string => value.toLocaleString('ko-KR')

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
  // 기본값을 여기서 주면 넘기지 않은 개별 prop이 labels/density를 항상 이겨 통로가 막힌다
  dense,
  density = 'comfortable',
  striped = false,
  stickyHeader = true,
  stickySummary = true,
  emptyText,
  emptyDescription,
  labels,
  formatters,
}: AnalyticsTableProps) {
  const L = mergeLabels(DEFAULT_ANALYTICS_TABLE_LABELS, labels)
  const formatNumber = formatters?.number ?? defaultNumberFormat

  /** 기본 셀 표기 — 숫자는 자릿수 구분, 빈 값·비유한수는 emptyCell, boolean은 Y/N */
  const defaultFormat = (value: unknown): string => {
    if (value == null || value === '') return L.emptyCell
    if (typeof value === 'number') {
      return Number.isFinite(value) ? formatNumber(value) : L.emptyCell
    }
    if (typeof value === 'boolean') return value ? L.boolTrue : L.boolFalse
    return String(value)
  }

  const formatCell = (column: AnalyticsColumn, value: unknown): string =>
    column.format != null ? column.format(value) : defaultFormat(value)

  // 정렬은 행 데이터로 한 번만 정해 헤더/본문/합계가 같은 축을 쓰게 한다
  const aligns = columns.map((column) => resolveAlign(column, rows))

  // 0 흐리게 처리는 스위치 하나로 껐다 켠다 — 셀마다 조건을 흩뿌리지 않는다
  const zeroClass = (value: unknown): string => (dimZero && isZero(value) ? styles.zero : '')

  // dense(구 API)를 넘겼으면 그것이 이긴다 — 기존 호출부의 화면이 바뀌면 안 된다
  const compact = dense ?? density === 'compact'

  const rootClass = [
    styles.analyticsTable,
    compact ? styles.dense : '',
    striped ? styles.striped : '',
    stickyHeader ? '' : styles.staticHeader,
    stickySummary ? '' : styles.staticSummary,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      {/* 좁아지면 셀이 짜부라지는 대신 이 래퍼가 가로로 스크롤된다 */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          {L.caption != null && <caption className={styles.srOnly}>{L.caption}</caption>}
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
                  <EmptyState
                    kind="empty"
                    title={
                      resolveLabel(emptyText, L.empty.title) ??
                      DEFAULT_ANALYTICS_TABLE_LABELS.empty.title
                    }
                    description={resolveLabel(emptyDescription, L.empty.description)}
                    compact
                  />
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
              {summaries.map((summary) => {
                // 톤은 행 단위로 한 번만 정한다 — 셀마다 조건을 흩뿌리지 않는다
                const toneClass = summary.tone === 'strong' ? styles.summaryStrong : ''
                return (
                  <tr
                    key={summary.label}
                    className={[styles.summaryRow, toneClass].filter(Boolean).join(' ')}
                  >
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
                )
              })}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
