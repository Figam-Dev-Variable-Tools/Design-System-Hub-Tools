import type { ReactNode } from 'react'
import { Select, type SelectOption } from '../Select/Select'
import styles from './SortBar.module.css'

/**
 * 목록 상단의 정렬/필터 바. 라이트(흰색) 전용 — 다크 축은 없다.
 * 레퍼런스: 좌측 "전체 6개", 우측 "최신순 ▾" "서비스별 ▾".
 *
 * 드롭다운은 기존 Select를 그대로 쓴다(별도 구현 금지).
 */
export type SortBarSelect = {
  /** React key 겸 식별자 */
  key: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export type SortBarProps = {
  /** 총 개수 — 없으면 좌측 문구를 그리지 않고 컨트롤만 우측에 붙는다 */
  total?: number
  /** 총 개수 앞 라벨. 기본 '전체' → "전체 6개" */
  totalLabel?: string
  /** 총 개수 뒤 문구. 예: '의 상품이 있습니다.' → "총 24개의 상품이 있습니다." */
  totalSuffix?: string
  selects?: SortBarSelect[]
  /** Select **왼쪽** 액션(뷰 전환 등) — 레퍼런스처럼 뷰 스위치가 정렬 Select 앞에 설 때 쓴다 */
  leadingActions?: ReactNode
  /** Select 오른쪽 추가 액션(버튼 등) */
  actions?: ReactNode
}

export function SortBar({
  total,
  totalLabel = '전체',
  totalSuffix = '',
  selects = [],
  leadingActions,
  actions,
}: SortBarProps) {
  return (
    <div className={styles.bar}>
      {total != null && (
        <p className={styles.total}>
          {totalLabel} <strong className={styles.count}>{total.toLocaleString('ko-KR')}개</strong>
          {totalSuffix}
        </p>
      )}

      <div className={styles.controls}>
        {leadingActions}
        {selects.map((select) => (
          <div key={select.key} className={styles.select}>
            <Select value={select.value} options={select.options} onChange={select.onChange} />
          </div>
        ))}
        {actions}
      </div>
    </div>
  )
}
