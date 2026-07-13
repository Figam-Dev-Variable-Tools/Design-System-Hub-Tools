import type { ReactNode } from 'react'
import { mergeLabels, resolveLabel, type SearchLabels } from '../../shared/labels'
import styles from './FilterBar.module.css'
import { SearchField } from '../SearchField/SearchField'
import { Select, type SelectOption } from '../Select/Select'
import { Chip } from '../Chip/Chip'
import { Button } from '../Button/Button'

export type FilterBarFilter = {
  key: string
  label: string
  options: SelectOption[]
  /** 트리거 폭(px) — 옵션 라벨이 길면 넓힌다. 기본 160 */
  width?: number
}

export type FilterBarChip = {
  key: string
  label: string
}

/**
 * 검색 줄 문구 — 공용 SearchLabels에서 이 바가 실제로 그리는 것만 받는다.
 * (검색 입력의 접근성 이름 SearchLabels.search는 SearchField에 aria 이름 축이 없어 아직 줄 수 없다.
 *  칩 제거 버튼의 이름도 Chip이 자체 기본값으로 갖고 있다.)
 */
export type FilterBarLabels = Pick<SearchLabels, 'searchPlaceholder' | 'reset'>

export const DEFAULT_FILTER_BAR_LABELS: Required<FilterBarLabels> = {
  searchPlaceholder: '검색어를 입력하세요',
  reset: '초기화',
}

/** Select 트리거 기본 폭 — 필터 라벨('전체 카테고리')이 말줄임 없이 들어가는 최소 폭 */
const DEFAULT_FILTER_WIDTH = 160

export type FilterBarProps = {
  searchValue: string
  onSearchChange?: (value: string) => void
  /** @deprecated labels.searchPlaceholder를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  searchPlaceholder?: string
  filters?: FilterBarFilter[]
  filterValues?: Record<string, string | null>
  onFilterChange?: (key: string, value: string | null) => void
  /** 적용된 필터 칩 — onRemoveChip으로 제거 */
  activeChips?: FilterBarChip[]
  onRemoveChip?: (key: string) => void
  /** 있으면 우측에 '초기화' 버튼 표시 */
  onReset?: () => void
  /** 우측 액션 슬롯 — 등록 버튼, 엑셀 다운로드 등 (초기화 버튼 오른쪽에 배치) */
  actions?: ReactNode
  /**
   * 크롬 (기본 plain — 배경·보더 없음. 지금까지의 렌더).
   * card는 흰 면 + 1px 보더를 입힌다 — 페이지 배경 위에 홀로 놓일 때 영역이 읽히게.
   */
  appearance?: 'plain' | 'card'
  /** 문구 — 개별 prop(searchPlaceholder)이 있으면 그쪽이 이긴다 */
  labels?: FilterBarLabels
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  filterValues = {},
  onFilterChange,
  activeChips = [],
  onRemoveChip,
  onReset,
  actions,
  appearance = 'plain',
  labels,
}: FilterBarProps) {
  const L = mergeLabels(DEFAULT_FILTER_BAR_LABELS, labels)
  const resolvedPlaceholder =
    resolveLabel(searchPlaceholder, L.searchPlaceholder) ?? DEFAULT_FILTER_BAR_LABELS.searchPlaceholder

  return (
    <div
      className={[styles.filterBar, appearance === 'card' ? styles.card : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.row}>
        <div className={styles.search}>
          <SearchField
            value={searchValue}
            onChange={onSearchChange}
            placeholder={resolvedPlaceholder}
          />
        </div>
        {filters.map((filter) => (
          <div
            key={filter.key}
            className={styles.filter}
            style={{ width: filter.width ?? DEFAULT_FILTER_WIDTH }}
          >
            <Select
              value={filterValues[filter.key] ?? null}
              onChange={(value) => onFilterChange?.(filter.key, value)}
              options={filter.options}
              placeholder={filter.label}
            />
          </div>
        ))}
        {(onReset != null || actions != null) && (
          <div className={styles.actions}>
            {onReset != null && (
              <Button variant="secondary" size="sm" label={L.reset} onClick={onReset} />
            )}
            {actions}
          </div>
        )}
      </div>
      {activeChips.length > 0 && (
        <div className={styles.chips}>
          {activeChips.map((chip) => (
            <Chip key={chip.key} label={chip.label} size="sm" onRemove={() => onRemoveChip?.(chip.key)} />
          ))}
        </div>
      )}
    </div>
  )
}
