import styles from './Statistics.module.css'
import {
  mergeLabels,
  type DeepPartialOneLevel,
  type LabelFn,
} from '../../shared/labels'

/** 지표 톤 — 경고성 지표(이탈률 급등)를 증감색이 아니라 카드 자체로 강조한다 */
export type StatTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error'

export type StatItem = {
  label: string
  value: string
  /** 증감 % — 양수 success ▲, 음수 error ▼ */
  delta?: number
  hint?: string
  /** 카드 톤 — 기본 'neutral'(= 지금 화면 그대로) */
  tone?: StatTone
}

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   증감 표기('+12%')와 그 방향(▲/▼)이 컴포넌트 안에 박혀 있었다. 화살표는 aria-hidden이라
   스크린리더에는 부호만 읽혔다 — 방향 문구를 따로 열어 소리로도 증감이 전달되게 한다. */
type StatisticsLabelsResolved = {
  /** 증감 표기 — 부호와 단위(%)까지 호출부가 가져간다 */
  delta: LabelFn<number>
  /** 증감 방향의 스크린리더 문구 — 화살표(그림)를 대신해 읽힌다 */
  deltaUp: string
  deltaDown: string
  deltaFlat: string
  /** items가 비었을 때 — 지금은 빈 그리드만 남는다 */
  empty: string
}

export const DEFAULT_STATISTICS_LABELS: StatisticsLabelsResolved = {
  delta: (delta) => `${delta > 0 ? '+' : ''}${delta}%`,
  deltaUp: '증가',
  deltaDown: '감소',
  deltaFlat: '변동 없음',
  empty: '표시할 지표가 없습니다',
} as const

export type StatisticsLabels = DeepPartialOneLevel<StatisticsLabelsResolved>

export type StatisticsProps = {
  items: StatItem[]
  /** 열 수 — 1은 단일 지표 카드, 5~6은 KPI를 한 줄에 늘어놓을 때 */
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  /**
   * 마감 — card(1px 보더·기본) / plain(테두리 없음).
   * plain은 이미 보더가 있는 카드 안에 지표를 넣을 때 이중 테두리를 없앤다.
   */
  appearance?: 'card' | 'plain'
  /** 화면 문구를 통째로 갈아끼우는 단일 통로 */
  labels?: StatisticsLabels
}

function deltaClass(delta: number): string {
  if (delta > 0) return styles.up
  if (delta < 0) return styles.down
  return styles.flat
}

export function Statistics({
  items,
  columns = 3,
  appearance = 'card',
  labels,
}: StatisticsProps) {
  const L = mergeLabels(DEFAULT_STATISTICS_LABELS, labels)

  /** 증감 방향의 소리 — 화살표는 그림(aria-hidden)이라 방향이 읽히지 않는다 */
  const deltaDirection = (delta: number): string => {
    if (delta > 0) return L.deltaUp
    if (delta < 0) return L.deltaDown
    return L.deltaFlat
  }

  // 지표가 없으면 빈 그리드(선만 남은 카드)가 아니라 문구를 보여준다
  if (items.length === 0) {
    return <p className={styles.empty}>{L.empty}</p>
  }

  const rootClass = [
    styles.statistics,
    styles[`cols${columns}`],
    appearance === 'plain' ? styles.plain : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      {items.map((item) => (
        <div
          key={item.label}
          className={[
            styles.card,
            // neutral은 기본 마감이라 클래스를 붙이지 않는다
            item.tone != null && item.tone !== 'neutral' ? styles[item.tone] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className={styles.label}>{item.label}</span>
          <strong className={styles.value}>{item.value}</strong>
          {(item.delta != null || item.hint != null) && (
            <div className={styles.meta}>
              {item.delta != null && (
                <span className={[styles.delta, deltaClass(item.delta)].join(' ')}>
                  {item.delta !== 0 && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
                      {item.delta > 0 ? <path d="M4 1L7.5 7H0.5Z" /> : <path d="M4 7L0.5 1H7.5Z" />}
                    </svg>
                  )}
                  {L.delta(item.delta)}
                  <span className={styles.srOnly}>{deltaDirection(item.delta)}</span>
                </span>
              )}
              {item.hint != null && <span className={styles.hint}>{item.hint}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
