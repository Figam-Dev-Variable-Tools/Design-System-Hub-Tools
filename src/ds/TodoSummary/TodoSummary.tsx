import styles from './TodoSummary.module.css'
import { Badge } from '../Badge/Badge'
import {
  mergeLabels,
  type DeepPartialOneLevel,
  type Formatters,
  type LabelFn,
} from '../../shared/labels'

export type TodoSummaryItem = {
  /** 항목 식별자 — React key 겸 클릭 라우팅 키 */
  key: string
  label: string
  count: number
  /** 처리할 건이 있을 때(count >= 1)만 클릭이 열린다 */
  onClick?: () => void
}

/** 이 화면이 스스로 만드는 문구 — 항목 라벨·제목은 데이터(items·title)가 갖는다 */
export type TodoSummaryLabels = {
  /** 총건수 단위 — 주문 '건', 상품 '개'처럼 도메인 말로 바꾼다. 기존 countUnit prop을 흡수한다 */
  countUnit: string
  /** 총건수 배지의 스크린리더 이름 — 숫자만으로는 단위를 알 수 없다. 기본 '총 12건' */
  totalAria: LabelFn<{ count: string; unit: string }>
}

export const DEFAULT_TODO_SUMMARY_LABELS: TodoSummaryLabels = {
  countUnit: '건',
  totalAria: ({ count, unit }) => `총 ${count}${unit}`,
}

export type TodoSummaryProps = {
  title?: string
  /** 제목 옆 배지 숫자 — 생략하면 items의 count 합계 */
  total?: number
  items: TodoSummaryItem[]
  /** 제목 줄(제목 + 총건수 배지) — 이미 섹션 제목이 있는 화면에서는 꺼서 항목 줄만 남긴다 */
  showHeader?: boolean
  /** 총건수 배지 — 제목만 남기고 숫자는 감추고 싶을 때 끈다 */
  showTotalBadge?: boolean
  /**
   * 항목 배치 (기본 inline).
   *   inline — 한 줄로 이어 흐른다(항목 사이 가운뎃점).
   *   grid   — 격자. 항목이 8~10개로 늘어 한 줄이 두세 번 접힐 때.
   *   stack  — 세로. 사이드 위젯처럼 폭이 좁을 때 라벨/숫자를 좌우로 벌린다.
   */
  layout?: 'inline' | 'grid' | 'stack'
  /** 밀도 (기본 md) — sm은 사이드 위젯용으로 패딩·글자를 한 단 줄인다 */
  size?: 'sm' | 'md'
  /** 카드 크롬(1px 보더 + 흰 면). 이미 카드 안(PageSection card)에 넣을 때 꺼서 이중 보더를 막는다 */
  framed?: boolean
  /** 문구 — 개별 prop(countUnit)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<TodoSummaryLabels>
  /** 숫자 표기 — 로케일·자릿수는 문구가 아니라 포맷이다 */
  formatters?: Formatters
  /**
   * @deprecated labels.countUnit을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  countUnit?: string
}

/** 큰 수도 자릿수 구분 — 표기와 tabular-nums로 자릿수를 맞춘다 */
const DEFAULT_FORMAT_COUNT: NonNullable<Formatters['number']> = (count) =>
  count.toLocaleString('ko-KR')

/**
 * 대시보드 상단 "오늘의 할일" 요약 줄.
 * 예) 오늘의 할일 ① — 신규주문 1 · 취소관리 0 · 반품관리 0 · 교환관리 0 · 판매신청 대기 0
 *
 * 밀도는 카페24/아임웹(한 줄에 항목을 촘촘히), 마감은 Toss(그림자 없이 1px 보더 + 큰 radius).
 * 0건은 흐리게 눌러 두고 1건 이상만 primary 굵게 + 클릭 가능 — 눈이 처리할 건에만 가게 한다.
 */
export function TodoSummary({
  title = '오늘의 할일',
  total,
  items,
  showHeader = true,
  showTotalBadge = true,
  layout = 'inline',
  size = 'md',
  framed = true,
  labels,
  formatters,
  countUnit,
}: TodoSummaryProps) {
  // 우선순위: 개별 prop(countUnit) > labels > 기본값.
  // mergeLabels는 undefined를 무시하므로, 넘기지 않은 개별 prop이 기본값을 지우지 않는다.
  const L = mergeLabels(mergeLabels(DEFAULT_TODO_SUMMARY_LABELS, labels), { countUnit })

  const formatCount = formatters?.number ?? DEFAULT_FORMAT_COUNT

  // total을 넘기지 않으면 합계를 직접 계산한다
  const totalCount = total ?? items.reduce((sum, item) => sum + item.count, 0)

  const className = [
    styles.todoSummary,
    layout === 'grid' ? styles.layoutGrid : '',
    layout === 'stack' ? styles.layoutStack : '',
    size === 'sm' ? styles.sizeSm : '',
    framed ? '' : styles.plain,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={className} aria-label={title}>
      {showHeader && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {showTotalBadge && (
            // 총건수 — 배지를 직접 그리지 않고 공용 Badge를 쓴다(톤만 갈아끼운다).
            // 처리할 건이 있으면 primary, 0이면 조용한 secondary. 숫자만으로는 단위를 알 수 없어
            // 스크린리더에는 role=img + '총 N건'으로 읽어 준다.
            <span
              className={styles.totalBadge}
              role="img"
              aria-label={L.totalAria({ count: formatCount(totalCount), unit: L.countUnit })}
            >
              <Badge
                variant={totalCount > 0 ? 'primary' : 'secondary'}
                appearance="soft"
                size="sm"
                label={formatCount(totalCount)}
              />
            </span>
          )}
        </div>
      )}

      <ul className={styles.items}>
        {items.map((item) => {
          const isZero = item.count === 0
          // 처리할 건이 없으면 클릭 대상이 아니다 — 0건은 이동해도 빈 목록만 나온다
          const interactive = !isZero && item.onClick != null

          const content = (
            <>
              <span className={styles.label}>{item.label}</span>
              <span className={[styles.count, isZero ? styles.countZero : styles.countActive].join(' ')}>
                {formatCount(item.count)}
              </span>
            </>
          )

          return (
            <li key={item.key} className={styles.item}>
              {interactive ? (
                <button type="button" className={styles.itemButton} onClick={item.onClick}>
                  {content}
                </button>
              ) : (
                <span className={styles.itemStatic}>{content}</span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
