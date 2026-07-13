import type { ReactNode } from 'react'
import {
  mergeLabels,
  resolveLabel,
  type Formatters,
  type SearchLabels,
  type TotalLabels,
} from '../../shared/labels'
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
  /** 트리거 폭(px) — 정렬 라벨이 길면 넓힌다. 기본 140(필터 Select와 같은 축) */
  width?: number
}

/**
 * 툴바 문구.
 *
 * search는 SearchLabels 전체가 아니라 searchPlaceholder만 받는다 —
 * 이 툴바에는 초기화·검색 버튼이 없고(그건 SearchPanel·FilterBar다),
 * 검색 입력의 접근성 이름(SearchLabels.search)은 SearchField에 aria 이름 축이 없어 아직 줄 수 없다.
 */
export type ListToolbarLabels = {
  search?: Pick<SearchLabels, 'searchPlaceholder'>
  total?: TotalLabels
}

type ListToolbarLabelsResolved = {
  search: Required<Pick<SearchLabels, 'searchPlaceholder'>>
  total: Required<Pick<TotalLabels, 'prefix' | 'unit'>> & Pick<TotalLabels, 'count'>
}

export const DEFAULT_LIST_TOOLBAR_LABELS: ListToolbarLabelsResolved = {
  search: { searchPlaceholder: '검색어를 입력하세요' },
  total: {
    // 접두사 없음이 기본이다 — 지금까지 totalLabel을 주지 않으면 숫자만 나왔다(기본 렌더 유지)
    prefix: null,
    unit: '건',
  },
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
   * @deprecated labels.total.prefix를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  totalLabel?: string
  /**
   * 건수 단위. 기본 '건' → "2건"
   * @deprecated labels.total.unit을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
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
   * @deprecated labels.search.searchPlaceholder를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  searchPlaceholder?: string
  /**
   * 카드 크롬(흰 면 + 1px 보더 + 패딩). 기본 card.
   * 이미 카드 안(AdminListView.toolbar 슬롯)에 넣을 때 plain으로 껍데기를 벗겨 테두리가 겹치지 않게 한다.
   */
  appearance?: 'card' | 'plain'
  /** 문구 — 개별 prop(totalLabel·totalUnit·searchPlaceholder)이 있으면 그쪽이 이긴다 */
  labels?: ListToolbarLabels
  /** 건수 표기 — 1,234를 1.234로 쓰는 것은 문구가 아니라 포맷이다 */
  formatters?: Formatters
}

/** Select 트리거 기본 폭 — '전체 상태' 같은 라벨이 말줄임 없이 들어가는 최소 폭 */
const DEFAULT_SELECT_WIDTH = 140

export function ListToolbar({
  selects = [],
  search,
  sort,
  total,
  totalLabel,
  totalUnit,
  actions,
  showCount = true,
  searchPlaceholder,
  appearance = 'card',
  labels,
  formatters,
}: ListToolbarProps) {
  const L = mergeLabels(DEFAULT_LIST_TOOLBAR_LABELS, labels)

  const resolvedPlaceholder =
    resolveLabel(searchPlaceholder, L.search.searchPlaceholder) ??
    DEFAULT_LIST_TOOLBAR_LABELS.search.searchPlaceholder
  // prefix의 기본값은 null(접두사 없음)이라 ??로 접으면 안 된다 — resolveLabel이 null을 값으로 존중한다
  const resolvedPrefix = resolveLabel<string | null>(totalLabel, L.total.prefix) ?? null
  const resolvedUnit = resolveLabel(totalUnit, L.total.unit) ?? DEFAULT_LIST_TOOLBAR_LABELS.total.unit
  const formatNumber = formatters?.number ?? ((value: number) => value.toLocaleString('ko-KR'))

  const countVisible = showCount && total != null

  const hasLeft = selects.length > 0 || search != null
  // 건수를 끄면 우측이 통째로 빌 수 있다 — 빈 우측 칸이 남지 않게 계산에 함께 넣는다
  const hasRight = sort != null || countVisible || actions != null

  // 켜진 요소가 하나도 없으면 빈 보더 카드가 남지 않게 통째로 제거한다
  if (!hasLeft && !hasRight) return null

  return (
    <div
      className={[styles.toolbar, appearance === 'plain' ? styles.plain : '']
        .filter(Boolean)
        .join(' ')}
    >
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
                placeholder={search.placeholder ?? resolvedPlaceholder}
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
            <div className={styles.select} style={{ width: sort.width ?? DEFAULT_SELECT_WIDTH }}>
              <Select value={sort.value} options={sort.options} onChange={sort.onChange} />
            </div>
          )}

          {countVisible &&
            // count를 주면 문장 전체를 그 함수가 만든다(접두사·단위를 무시한다)
            (L.total.count != null ? (
              <p className={styles.total}>{L.total.count(total)}</p>
            ) : (
              <p className={styles.total}>
                {resolvedPrefix != null && `${resolvedPrefix} `}
                <strong className={styles.count}>{formatNumber(total)}</strong>
                {resolvedUnit}
              </p>
            ))}

          {actions}
        </div>
      )}
    </div>
  )
}
