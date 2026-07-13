import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Placeholder } from '../../shared/placeholders'
import styles from './CategoryList.module.css'
import { AdminPageLayout } from '../AdminPageLayout/AdminPageLayout'
import { AdminTable, type AdminBulkAction, type AdminColumn } from '../AdminTable/AdminTable'
import { Button } from '../Button/Button'
import { CategoryTabs, type CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import { ListToolbar } from '../ListToolbar/ListToolbar'
import { RowActions } from '../RowActions/RowActions'
import type { SelectOption } from '../Select/Select'

/** 카테고리 한 줄 — 이름 앞 표식은 emoji > image > 대체 그림 순으로 하나만 쓴다 */
export type CategoryRow = {
  id: string
  /** 노출 순번(1부터) — 드래그로 바뀌면 onReorder가 다시 매긴 값을 돌려준다 */
  order: number
  name: string
  emoji?: string
  image?: string
  description?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  active: boolean
}

/** 상태 필터 — 탭과 툴바 Select가 같은 값을 공유한다 */
export type CategoryStatusFilter = 'all' | 'active' | 'inactive'

/** 정렬 키 — 순번순일 때만 드래그로 순서를 바꿀 수 있다 */
export type CategorySortKey = 'order' | 'name' | 'createdAt' | 'updatedAt'

/**
 * 화면 ON/OFF — 기본값은 전부 true.
 * false면 그 영역이 DOM에서 완전히 사라진다(빈 자리·여백·구분선이 남지 않는다).
 * 열 단위 ON/OFF는 여기서 다루지 않는다 — AdminTable의 columnVisibility를 쓴다.
 */
export type CategoryListShow = {
  /** 페이지 헤더(타이틀·설명·[+ 카테고리 등록]) */
  header?: boolean
  /** 상태 탭(전체/활성/비활성) */
  tabs?: boolean
  /** 검색·상태 필터·정렬·건수 + 표 위 내보내기/컬럼 버튼 */
  toolbar?: boolean
  /** 하단 페이지네이션 + 페이지 크기 */
  pagination?: boolean
  /** 선택 체크박스 열 + 일괄 처리 바 */
  bulk?: boolean
  /**
   * 표 우상단 '컬럼' 피커 버튼. 열 구성을 관리자가 바꾸면 안 되는 화면(고정 리포트)에서 끈다.
   * 툴바를 끄면 함께 사라진다(피커는 툴바에 속한 도구다).
   * 미지정이면 기존 top-level columnPicker prop을 따른다 — 기본 동작은 그대로다.
   */
  columnPicker?: boolean
  /**
   * 표 우상단 '내보내기' 버튼. 개인정보가 섞인 목록에서 CSV 반출을 막을 때 끈다.
   * 미지정이면 기존 top-level exportable prop을 따른다 — 기본 동작은 그대로다.
   */
  export?: boolean
}

export type CategoryListProps = {
  rows: CategoryRow[]
  /** 섹션 ON/OFF — 생략하면 전부 켜진다 */
  show?: CategoryListShow

  /** 헤더 */
  title?: string
  description?: string
  /** 있으면 헤더 우측 [+ 카테고리 등록] 버튼이 렌더된다 */
  onAdd?: () => void
  addLabel?: string
  /** 등록 버튼 아이콘 — 없으면 기본 Plus */
  addIcon?: ReactNode
  /** 기본 등록 버튼 대신 쓸 헤더 액션 — 주면 onAdd 버튼을 대체한다 */
  headerActions?: ReactNode

  /** 상태 필터 — 주면 제어, 안 주면 내부 상태 */
  status?: CategoryStatusFilter
  onStatusChange?: (status: CategoryStatusFilter) => void
  /**
   * 툴바 상태 Select 항목. 기본은 전체/활성/비활성.
   * 운영 화면마다 상태 라벨이 다르므로(노출/숨김, 판매중/중지…) 모듈 상수에서 prop으로 연다.
   * value는 CategoryStatusFilter('all'|'active'|'inactive')와 맞춰야 필터가 동작한다.
   */
  statusOptions?: SelectOption[]
  /**
   * 툴바 정렬 Select 항목. 기본은 순번/이름/등록일/수정일.
   * value는 CategorySortKey와 맞춰야 하고, 'order'일 때만 드래그 재정렬이 열린다.
   */
  sortOptions?: SelectOption[]
  /** 검색어 — 카테고리명·설명을 훑는다. 주면 제어, 안 주면 내부 상태 */
  keyword?: string
  onKeywordChange?: (keyword: string) => void
  searchPlaceholder?: string
  /** 정렬 — 주면 제어, 안 주면 내부 상태(기본 순번순) */
  sort?: CategorySortKey
  onSortChange?: (sort: CategorySortKey) => void

  /** 행 선택 — 주면 제어, 안 주면 내부 상태 */
  selectedIds?: string[]
  onSelectChange?: (ids: string[]) => void
  bulkActions?: AdminBulkAction[]
  onBulkDelete?: (ids: string[]) => void

  /** 있어야 드래그 핸들 열이 붙는다. 순번(order)을 1부터 다시 매긴 rows 전체를 돌려준다 */
  onReorder?: (rows: CategoryRow[]) => void
  /** 활성화 토글 */
  onToggleActive?: (row: CategoryRow, next: boolean) => void
  /** 관리 열(RowActions) — 넘긴 핸들러의 아이콘만 렌더된다. 셋 다 없으면 열 자체가 사라진다 */
  onView?: (row: CategoryRow) => void
  onEdit?: (row: CategoryRow) => void
  onDelete?: (row: CategoryRow) => void

  /** 열 표시 여부(key → boolean). 없으면 AdminTable이 내부 상태로 관리한다 */
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (next: Record<string, boolean>) => void
  columnPicker?: boolean

  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void

  exportable?: boolean
  exportFilename?: string
  loading?: boolean
  emptyText?: string
  density?: 'compact' | 'comfortable'
}

/** 툴바 좌측 상태 필터 — statusOptions를 안 넘겼을 때의 기본값 */
const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
]

/** 툴바 우측 정렬 */
const SORT_OPTIONS: SelectOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'name', label: '이름순' },
  { value: 'createdAt', label: '최근 등록순' },
  { value: 'updatedAt', label: '최근 수정순' },
]

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50]

/** 검색 대상 — 카테고리명·설명 */
function matchesKeyword(row: CategoryRow, query: string): boolean {
  if (query === '') return true
  return [row.name, row.description].some((field) =>
    (field ?? '').toLowerCase().includes(query),
  )
}

function matchesStatus(row: CategoryRow, status: CategoryStatusFilter): boolean {
  if (status === 'all') return true
  return status === 'active' ? row.active : !row.active
}

/** 최근순(내림차순) — 날짜는 'YYYY-MM-DD' 문자열이라 사전순 비교로 충분하다 */
function compareRows(a: CategoryRow, b: CategoryRow, key: CategorySortKey): number {
  if (key === 'order') return a.order - b.order
  if (key === 'name') return a.name.localeCompare(b.name, 'ko')
  return b[key].localeCompare(a[key])
}

/**
 * 카테고리 관리 — AdminPageLayout 슬롯 조합.
 *
 *   header  = 타이틀 + 설명 + [+ 카테고리 등록]
 *   tabs    = CategoryTabs(전체/활성/비활성 — 건수 배지)
 *   toolbar = ListToolbar(전체 상태 ▾ · 검색 · 순번순 ▾ · 18건)
 *   본문     = AdminTable(드래그 · 순번 · 카테고리명 · 설명 · 등록/수정일 · 등록/수정자 · 활성화 · 관리)
 *
 * 레이아웃·표·툴바를 새로 짜지 않는다. 필터/정렬/페이징은 rows를 그대로 걸러 쓰는 클라이언트 처리다.
 *
 * 헤더는 PageHeaderBar 조각과 같은 규격이지만, AdminPageLayout의 header 슬롯(title/description/
 * headerActions)을 쓴다 — PageHeaderBar를 본문에 넣으면 tabs·toolbar 슬롯보다 아래로 밀려
 * 타이틀이 툴바 밑에 놓인다.
 *
 * 상태 값은 탭과 툴바 Select가 함께 물고 있다(같은 status). 한쪽을 꺼도 다른 쪽으로 바꿀 수 있다.
 */
export function CategoryList({
  rows,
  show = {},
  title = '카테고리 관리',
  description = '시공 분야 카테고리를 등록·수정·삭제하고 순번/활성화를 관리합니다.',
  onAdd,
  addLabel = '카테고리 등록',
  addIcon,
  headerActions,
  status,
  onStatusChange,
  statusOptions = STATUS_OPTIONS,
  sortOptions = SORT_OPTIONS,
  keyword,
  onKeywordChange,
  searchPlaceholder = '카테고리명·설명 검색',
  sort,
  onSortChange,
  selectedIds,
  onSelectChange,
  bulkActions = [],
  onBulkDelete,
  onReorder,
  onToggleActive,
  onView,
  onEdit,
  onDelete,
  columnVisibility,
  onColumnVisibilityChange,
  columnPicker = true,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  exportable = true,
  exportFilename = '카테고리목록',
  loading = false,
  emptyText = '등록된 카테고리가 없습니다.',
  density = 'compact',
}: CategoryListProps) {
  // ── ON/OFF — 기본 전부 true. false면 그 영역을 아예 렌더하지 않는다 ──
  const showHeader = show.header !== false
  const showTabs = show.tabs !== false
  const showToolbar = show.toolbar !== false
  const showPagination = show.pagination !== false
  // 고를 이유(일괄 액션·삭제·선택 콜백)가 없으면 체크박스 열도 만들지 않는다 — 빈 열이 남으면 안 된다
  const showBulk =
    show.bulk !== false &&
    (bulkActions.length > 0 || onBulkDelete != null || onSelectChange != null)
  // show 키가 없으면 기존 top-level prop을 그대로 따른다 — 기본 렌더는 바뀌지 않는다
  const showColumnPicker = show.columnPicker ?? columnPicker
  const showExport = show.export ?? exportable

  const [innerStatus, setInnerStatus] = useState<CategoryStatusFilter>('all')
  const [innerKeyword, setInnerKeyword] = useState('')
  const [innerSort, setInnerSort] = useState<CategorySortKey>('order')
  const [innerSelected, setInnerSelected] = useState<string[]>([])
  const [innerPageSize, setInnerPageSize] = useState(pageSize ?? 10)
  const [page, setPage] = useState(1)

  // 제어/비제어 — prop이 오면 그걸, 아니면 내부 상태
  const statusValue = status ?? innerStatus
  const query = keyword ?? innerKeyword
  const sortKey = sort ?? innerSort
  const selected = selectedIds ?? innerSelected
  const size = pageSize ?? innerPageSize

  const changeStatus = (next: string) => {
    const value = next as CategoryStatusFilter
    if (status == null) setInnerStatus(value)
    setPage(1)
    onStatusChange?.(value)
  }

  const changeKeyword = (next: string) => {
    if (keyword == null) setInnerKeyword(next)
    setPage(1)
    onKeywordChange?.(next)
  }

  const changeSort = (next: string) => {
    const value = next as CategorySortKey
    if (sort == null) setInnerSort(value)
    setPage(1)
    onSortChange?.(value)
  }

  const changeSelected = (ids: string[]) => {
    if (selectedIds == null) setInnerSelected(ids)
    onSelectChange?.(ids)
  }

  const changePageSize = (next: number) => {
    if (pageSize == null) setInnerPageSize(next)
    setPage(1)
    onPageSizeChange?.(next)
  }

  // 탭 건수는 필터와 무관한 전체 기준이다
  const counts = useMemo(() => {
    const active = rows.filter((row) => row.active).length
    return { all: rows.length, active, inactive: rows.length - active }
  }, [rows])

  const tabItems: CategoryTabItem[] = [
    { label: '전체', value: 'all', count: counts.all, fixed: true },
    { label: '활성', value: 'active', count: counts.active, fixed: true },
    { label: '비활성', value: 'inactive', count: counts.inactive, fixed: true },
  ]

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows
      .filter((row) => matchesStatus(row, statusValue) && matchesKeyword(row, q))
      .sort((a, b) => compareRows(a, b, sortKey))
  }, [rows, statusValue, query, sortKey])

  // 페이지가 범위를 벗어나면(필터로 줄었을 때) 마지막 페이지로 접는다
  const totalPages = Math.max(1, Math.ceil(sorted.length / size))
  const safePage = Math.min(page, totalPages)
  // 페이지네이션이 꺼져 있으면 자르지 않고 전부 보여준다
  const paged = showPagination ? sorted.slice((safePage - 1) * size, safePage * size) : sorted

  /**
   * 표에서 돌려준 건 '현재 페이지'의 새 순서다. 이걸 전체 목록의 같은 자리에 되꽂고
   * 순번(order)을 1부터 다시 매긴다. 정렬이 순번순일 때만 드래그가 열리므로
   * 전체 목록 순서와 화면 순서가 어긋나지 않는다.
   */
  const reorderable = onReorder != null && sortKey === 'order'

  const handleReorder = (nextPaged: CategoryRow[]) => {
    if (onReorder == null) return
    const movedIds = new Set(paged.map((row) => row.id))
    const base = [...rows].sort((a, b) => a.order - b.order)
    let cursor = 0
    const next = base.map((row) => (movedIds.has(row.id) ? nextPaged[cursor++] : row))
    onReorder(next.map((row, index) => ({ ...row, order: index + 1 })))
  }

  /** 카테고리명 셀 — 이모지 > 이미지 > 대체 그림 중 하나 + 이름(1줄 말줄임) */
  const renderName = (row: CategoryRow): ReactNode => (
    <span className={styles.name}>
      {row.emoji != null && row.emoji !== '' ? (
        <span className={styles.emoji} aria-hidden="true">
          {row.emoji}
        </span>
      ) : row.image != null && row.image !== '' ? (
        <img className={styles.thumb} src={row.image} alt="" />
      ) : (
        <span className={styles.thumbEmpty} aria-hidden="true">
          <Placeholder kind="image" size="fill" />
        </span>
      )}
      <span className={styles.nameText} title={row.name}>
        {row.name}
      </span>
    </span>
  )

  const hasRowActions = onView != null || onEdit != null || onDelete != null

  const columns: AdminColumn<CategoryRow>[] = []

  if (showBulk) columns.push({ kind: 'select', key: 'select' })
  // 드래그 핸들은 순서를 바꿀 수 있을 때만 — 비활성 핸들이 자리만 차지하지 않게 한다
  if (reorderable) columns.push({ kind: 'drag', key: 'drag' })

  columns.push(
    { kind: 'index', key: 'order', header: '순번', sortable: true },
    {
      kind: 'title',
      key: 'name',
      header: '카테고리명',
      ratio: 2,
      sortable: true,
      onClick: onView ?? onEdit,
      render: renderName,
    },
    {
      kind: 'text',
      key: 'description',
      header: '설명',
      ratio: 3,
      value: (row) => row.description ?? '-',
    },
    { kind: 'date', key: 'createdAt', header: '등록일', sortable: true },
    { kind: 'date', key: 'updatedAt', header: '수정일', sortable: true },
    { kind: 'user', key: 'createdBy', header: '등록자' },
    { kind: 'user', key: 'updatedBy', header: '수정자' },
    {
      kind: 'status',
      key: 'active',
      header: '활성화',
      value: (row) => row.active,
    },
  )

  if (hasRowActions) {
    columns.push({
      kind: 'actions',
      key: 'actions',
      header: '관리',
      // 아이콘 3개(상세·수정·삭제)는 actions 기본 고정폭(96)을 넘긴다 — 비율 열로 풀어 준다
      ratio: 1,
      render: (row) => (
        <RowActions
          size="sm"
          onView={onView == null ? undefined : () => onView(row)}
          onEdit={onEdit == null ? undefined : () => onEdit(row)}
          onDelete={onDelete == null ? undefined : () => onDelete(row)}
          labels={{
            view: `${row.name} 상세보기`,
            edit: `${row.name} 수정`,
            delete: `${row.name} 삭제`,
          }}
        />
      ),
    })
  }

  return (
    <AdminPageLayout
      // 헤더 OFF — 세 값 모두 비우면 AdminPageLayout이 헤더 슬롯을 통째로 지운다
      title={showHeader ? title : undefined}
      description={showHeader ? description : undefined}
      headerActions={
        showHeader
          ? (headerActions ??
            (onAdd != null ? (
              <Button
                variant="primary"
                size="md"
                label={addLabel}
                showLeftIcon
                leftIcon={addIcon ?? <Plus size={16} />}
                onClick={onAdd}
              />
            ) : undefined))
          : undefined
      }
      density={density}
      tabs={
        showTabs ? (
          <CategoryTabs
            items={tabItems}
            value={statusValue}
            onChange={changeStatus}
            addable={false}
          />
        ) : undefined
      }
      toolbar={
        showToolbar ? (
          <ListToolbar
            selects={[
              {
                key: 'status',
                value: statusValue,
                options: statusOptions,
                onChange: changeStatus,
              },
            ]}
            search={{
              value: query,
              onChange: changeKeyword,
              placeholder: searchPlaceholder,
            }}
            sort={{ value: sortKey, options: sortOptions, onChange: changeSort }}
            total={sorted.length}
          />
        ) : undefined
      }
    >
      <AdminTable
        columns={columns}
        rows={paged}
        rowKey={(row) => row.id}
        selectedIds={showBulk ? selected : undefined}
        onSelectChange={showBulk ? changeSelected : undefined}
        bulkActions={showBulk ? bulkActions : undefined}
        onBulkDelete={showBulk ? onBulkDelete : undefined}
        onToggleStatus={onToggleActive}
        onReorder={reorderable ? handleReorder : undefined}
        // 페이지네이션 OFF — page/pageSize를 넘기지 않으면 하단 바가 통째로 사라진다
        page={showPagination ? safePage : undefined}
        totalPages={showPagination ? totalPages : undefined}
        onPageChange={showPagination ? setPage : undefined}
        pageSize={showPagination ? size : undefined}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={showPagination ? changePageSize : undefined}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        // 내보내기·컬럼 버튼도 목록 조작 도구다 — 툴바를 끄면 함께 사라진다
        columnPicker={showToolbar && showColumnPicker}
        exportable={showToolbar && showExport}
        exportFilename={exportFilename}
        loading={loading}
        emptyText={emptyText}
        // AdminTable은 레이아웃의 CSS 변수를 읽지 않는다 — 밀도를 직접 넘겨야 같이 맞는다
        density={density}
      />
    </AdminPageLayout>
  )
}
