import styles from './TodoSummary.module.css'
import { Badge } from '../Badge/Badge'

export type TodoSummaryItem = {
  /** 항목 식별자 — React key 겸 클릭 라우팅 키 */
  key: string
  label: string
  count: number
  /** 처리할 건이 있을 때(count >= 1)만 클릭이 열린다 */
  onClick?: () => void
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
  /** 총건수의 스크린리더 단위 — 주문 '건', 상품 '개'처럼 도메인 말로 바꾼다 */
  countUnit?: string
}

/** 큰 수도 자릿수 구분 — 표기와 tabular-nums로 자릿수를 맞춘다 */
function formatCount(count: number): string {
  return count.toLocaleString('ko-KR')
}

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
  countUnit = '건',
}: TodoSummaryProps) {
  // total을 넘기지 않으면 합계를 직접 계산한다
  const totalCount = total ?? items.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className={styles.todoSummary} aria-label={title}>
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
              aria-label={`총 ${formatCount(totalCount)}${countUnit}`}
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
