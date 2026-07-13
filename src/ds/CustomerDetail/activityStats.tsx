import styles from './activityStats.module.css'

/**
 * 활동 통계 4칸(주문 수 · 누적 구매금액 · 문의 · 댓글).
 *
 * 공용 Statistics를 쓰지 않는다 — 그건 대시보드용 카드라 값이 28px(xxl)에 자체 보더 판을 갖는다.
 * 여기는 360px 폭의 aside 안이라 '3,284,000원' 같은 값이 말줄임으로 잘리고 카드가 두 배로 길어진다.
 * (실제로 한 번 Statistics로 바꿨다가 그 문제가 재현돼 되돌렸다.)
 *
 * 원래는 고객 상세가 두 벌(일반/Page)이라 이 마크업이 양쪽에 복사돼 있었다 — 그래서 이 파일 하나로
 * 모았고, 이제는 상세 화면 자체가 CustomerDetail 하나뿐이라 사용처도 하나다.
 */
export type ActivityStat = {
  label: string
  value: string
}

export function ActivityStats({ items }: { items: ActivityStat[] }) {
  return (
    <dl className={styles.stats}>
      {items.map((item) => (
        <div key={item.label} className={styles.stat}>
          <dt className={styles.statLabel}>{item.label}</dt>
          <dd className={styles.statValue}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
