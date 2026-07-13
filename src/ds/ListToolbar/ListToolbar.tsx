import type { ReactNode } from 'react'
import { Select, type SelectOption } from '../Select/Select'
import { SearchField } from '../SearchField/SearchField'
import styles from './ListToolbar.module.css'

/**
 * ListToolbar — 어드민 목록 상단의 흰 카드 바.
 * 레퍼런스: "전체 상태 ▾ | 검색 | ………… | 순번순 ▾ | 2건"
 *
 * 드롭다운은 기존 Select, 검색은 기존 SearchField(leading 아이콘)를 그대로 쓴다 — 새로 만들지 않는다.
 * 요소 단위 ON/OFF: prop을 넘기지 않으면 그 요소가 통째로 사라진다(빈 자리·구분선 없음).
 * 아무 요소도 없으면 카드 자체를 렌더하지 않는다.
 */
export type ListToolbarSelect = {
  /** React key 겸 식별자 */
  key: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  /** 트리거 폭(px) — 옵션 라벨이 길면 넓힌다. 기본 140 */
  width?: number
}

export type ListToolbarSearch = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /**
   * Enter 확정 — SearchField가 이미 가진 축을 그대로 통과시킨다.
   * 없으면 목록들이 툴바를 감싼 div에서 keydown을 주워 담는 우회로를 만들게 된다(실제로 그랬다).
   */
  onSearch?: (value: string) => void
  /** 로딩 중 입력 잠금 */
  disabled?: boolean
}

export type ListToolbarSort = {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export type ListToolbarProps = {
  /** 좌측 필터 Select들 — 상태·카테고리 등 */
  selects?: ListToolbarSelect[]
  /** 좌측 검색 입력 */
  search?: ListToolbarSearch
  /** 우측 정렬 Select */
  sort?: ListToolbarSort
  /** 우측 총 건수 — 숫자는 tabular-nums로 폭이 흔들리지 않는다 */
  total?: number
  /**
   * 건수 앞 문구 — "총 24건", "전체 사용자 495명"처럼 목록마다 다른 접두사를 붙인다.
   * 없으면 숫자만 나온다(기존 동작).
   */
  totalLabel?: string
  /** 건수 단위. 기본 '건' → "2건" */
  totalUnit?: string
  /** 우측 끝 추가 액션(등록 버튼·내보내기 등) */
  actions?: ReactNode
  /**
   * 총 건수 표시 (기본 true).
   * 목록 하단 Pagination이 이미 건수를 말하고 있으면 같은 숫자가 두 번 나오므로 끈다 —
   * total을 undefined로 바꾸지 않고 표시만 멈춘다(집계는 그대로 쓰는 화면이 있다).
   */
  showCount?: boolean
  /**
   * 검색 입력 플레이스홀더 (기본 '검색어를 입력하세요').
   * search.placeholder를 각 항목마다 주지 않고 툴바 전체의 기본 문구만 갈아 끼울 때 쓴다
   * (search.placeholder가 있으면 그쪽이 이긴다).
   */
  searchPlaceholder?: string
}

/** Select 트리거 기본 폭 — '전체 상태' 같은 라벨이 말줄임 없이 들어가는 최소 폭 */
const DEFAULT_SELECT_WIDTH = 140

export function ListToolbar({
  selects = [],
  search,
  sort,
  total,
  totalLabel,
  totalUnit = '건',
  actions,
  showCount = true,
  searchPlaceholder = '검색어를 입력하세요',
}: ListToolbarProps) {
  const countVisible = showCount && total != null

  const hasLeft = selects.length > 0 || search != null
  // 건수를 끄면 우측이 통째로 빌 수 있다 — 빈 우측 칸이 남지 않게 계산에 함께 넣는다
  const hasRight = sort != null || countVisible || actions != null

  // 켜진 요소가 하나도 없으면 빈 보더 카드가 남지 않게 통째로 제거한다
  if (!hasLeft && !hasRight) return null

  return (
    <div className={styles.toolbar}>
      {hasLeft && (
        <div className={styles.left}>
          {selects.map((select) => (
            <div
              key={select.key}
              className={styles.select}
              style={{ width: select.width ?? DEFAULT_SELECT_WIDTH }}
            >
              <Select value={select.value} options={select.options} onChange={select.onChange} />
            </div>
          ))}

          {search != null && (
            <div className={styles.search}>
              <SearchField
                value={search.value}
                onChange={search.onChange}
                placeholder={search.placeholder ?? searchPlaceholder}
                onSearch={search.onSearch}
                disabled={search.disabled}
              />
            </div>
          )}
        </div>
      )}

      {hasRight && (
        <div className={styles.right}>
          {sort != null && (
            <div className={styles.select} style={{ width: DEFAULT_SELECT_WIDTH }}>
              <Select value={sort.value} options={sort.options} onChange={sort.onChange} />
            </div>
          )}

          {countVisible && (
            <p className={styles.total}>
              {totalLabel != null && `${totalLabel} `}
              <strong className={styles.count}>{total.toLocaleString('ko-KR')}</strong>
              {totalUnit}
            </p>
          )}

          {actions}
        </div>
      )}
    </div>
  )
}
