import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import styles from './PortfolioList.module.css'
import { AdminPageLayout } from '../AdminPageLayout/AdminPageLayout'
import { AdminTable, type AdminBulkAction, type AdminColumn } from '../AdminTable/AdminTable'
import { Button } from '../Button/Button'
import { CategoryTabs } from '../CategoryTabs/CategoryTabs'
import { ListToolbar } from '../ListToolbar/ListToolbar'
import { RowActions } from '../RowActions/RowActions'
import type { SelectOption } from '../Select/Select'

/** 포트폴리오 카테고리 — 탭·필터·표에 이모지 + 라벨로 찍힌다 */
export type PortfolioCategory = {
  value: string
  label: string
  /** 라벨 앞에 붙는 이모지(예: 🍳) */
  emoji: string
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

/** 시공 내역 한 건 */
export type PortfolioRow = {
  id: string
  /** 썸네일 주소 — 없으면 표가 공용 대체 그림(Placeholder)을 그린다 */
  thumbnail?: string
  title: string
  /** PortfolioCategory.value */
  category: string
  /** 상세 설명 — 목록에서는 쓰지 않고 등록/수정 화면이 쓴다 */
  detail?: string
  /** 외부 링크(시공 사례 페이지 등) */
  link?: string
  createdAt: string
  updatedAt?: string
  createdBy: string
  updatedBy?: string
  active: boolean
}

/** 툴바 정렬 — 순번순일 때만 드래그 재정렬이 열린다 */
export type PortfolioSort = 'order' | 'newest' | 'title'

/** 조회 조건 — 하나라도 바뀌면 통째로 onFilterChange로 나간다 */
export type PortfolioFilter = {
  /** null이면 전체 카테고리 */
  category: string | null
  /** null이면 전체 상태 */
  status: 'active' | 'inactive' | null
  keyword: string
  sort: PortfolioSort
}

/**
 * 섹션 ON/OFF — 기본값은 전부 true. false면 그 영역이 DOM에서 완전히 사라진다.
 *
 * 열 단위 ON/OFF(이미지·카테고리·등록일…)는 여기가 아니라 AdminTable의
 * columnVisibility로 한다. 아래 키는 columnVisibility로 끌 수 없는 것들만 남겼다
 * (선택·드래그·관리 열은 표의 뼈대라 컬럼 피커에서 꺼지지 않는다).
 */
export type PortfolioListShow = {
  /** 페이지 헤더(타이틀·설명·[+ 포트폴리오 등록]) */
  header?: boolean
  /** 카테고리 탭 */
  tabs?: boolean
  /** 검색·필터·정렬·건수·내보내기 */
  toolbar?: boolean
  /** 페이지네이션 + 페이지 크기 */
  pagination?: boolean
  /** 선택 체크박스 열 + 일괄 처리 바 */
  bulk?: boolean
  /** 드래그 핸들 열(순번 재정렬) */
  reorder?: boolean
  /** 관리 열(RowActions) */
  rowActions?: boolean
  /** 표 우상단 '컬럼' 피커 버튼 — 열 구성을 고정해야 하는 화면에서 끈다(툴바를 끄면 함께 사라진다) */
  columnPicker?: boolean
  /** 표 우상단 '내보내기' 버튼 — CSV 반출을 막을 때 끈다(툴바를 끄면 함께 사라진다) */
  export?: boolean
}

export type PortfolioListProps = {
  rows: PortfolioRow[]
  categories: PortfolioCategory[]
  title?: string
  description?: string
  createLabel?: string
  /** 등록 버튼 아이콘 — 없으면 기본 Plus */
  createIcon?: ReactNode
  /** 검색창 안내 문구 — 기본 '제목 검색' */
  searchPlaceholder?: string
  /** 조회 결과가 없을 때 표 안 문구 — 기본 '등록된 포트폴리오가 없습니다.' */
  emptyText?: string
  /**
   * 툴바 상태 Select 항목 — 기본은 전체/활성화/비활성화.
   * 운영 화면마다 상태 라벨이 다르므로(노출/숨김 등) 모듈 상수에서 prop으로 연다.
   * value는 ''(전체) · 'active' · 'inactive'와 맞춰야 필터가 동작한다.
   */
  statusOptions?: SelectOption[]
  /**
   * 툴바 정렬 Select 항목 — 기본은 순번순/최신 등록순/제목순.
   * value는 PortfolioSort와 맞춰야 하고, 'order'일 때만 드래그 재정렬이 열린다.
   */
  sortOptions?: SelectOption[]
  loading?: boolean
  /** 한 페이지 행 수 — show.pagination이 false면 무시된다 */
  pageSize?: number
  pageSizeOptions?: number[]
  density?: 'compact' | 'comfortable'
  /** 섹션 ON/OFF — 미지정 키는 true */
  show?: PortfolioListShow
  /** 조회 조건 — 주면 제어(서버 조회), 안 주면 내부 상태로 화면에서 거른다 */
  filter?: PortfolioFilter
  onFilterChange?: (filter: PortfolioFilter) => void
  /** 선택된 행 — 주면 제어, 안 주면 내부 상태 */
  selectedIds?: string[]
  onSelectChange?: (ids: string[]) => void
  /** 열 표시 여부(key → boolean) — 열 단위 ON/OFF는 이걸로 한다 */
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (next: Record<string, boolean>) => void
  onCreate?: () => void
  /** 제목 클릭 · 관리(연필) */
  onEdit?: (row: PortfolioRow) => void
  /** 있으면 관리 열에 눈(상세보기) 아이콘이 붙는다 */
  onView?: (row: PortfolioRow) => void
  onDelete?: (row: PortfolioRow) => void
  onToggleActive?: (row: PortfolioRow, next: boolean) => void
  /** 드래그로 순번을 바꿨을 때 — 재정렬된 rows 전체가 그대로 돌아온다 */
  onReorder?: (rows: PortfolioRow[]) => void
  /** 일괄 처리 — show.bulk가 true여야 바가 뜬다 */
  onBulkDelete?: (ids: string[]) => void
  bulkActions?: AdminBulkAction[]
}

/**
 * '전체' 센티넬 — Select는 선택을 비우는 수단이 없다(값을 고르면 되돌릴 수 없다).
 * 그래서 '전체'를 빈 문자열 옵션으로 두고, 안에서 null로 바꿔 다룬다.
 */
const ALL = ''

/** statusOptions를 안 넘겼을 때의 기본값 */
const STATUS_OPTIONS: SelectOption[] = [
  { label: '전체 상태', value: ALL },
  { label: '활성화', value: 'active' },
  { label: '비활성화', value: 'inactive' },
]

/** sortOptions를 안 넘겼을 때의 기본값 */
const SORT_OPTIONS: SelectOption[] = [
  { label: '순번순', value: 'order' },
  { label: '최신 등록순', value: 'newest' },
  { label: '제목순', value: 'title' },
]

const DEFAULT_PAGE_SIZE_OPTIONS = [20, 50, 100]

const DEFAULT_FILTER: PortfolioFilter = {
  category: null,
  status: null,
  keyword: '',
  sort: 'order',
}

/** 미지정 키는 전부 켜진 것으로 본다 */
const DEFAULT_SHOW: Required<PortfolioListShow> = {
  header: true,
  tabs: true,
  toolbar: true,
  pagination: true,
  bulk: true,
  reorder: true,
  rowActions: true,
  columnPicker: true,
  export: true,
}

/**
 * PortfolioList — 포트폴리오(시공 내역) 관리 화면.
 *
 * 골격은 조각 조합이다(레이아웃을 직접 짜지 않는다):
 *   AdminPageLayout( header · tabs=CategoryTabs · toolbar=ListToolbar · content=AdminTable )
 * 관리 열은 RowActions, 활성화 열은 AdminTable의 status(Toggle) 셀이 그린다.
 *
 * 카테고리 탭과 툴바의 [전체 카테고리 ▾]는 같은 filter.category를 읽고 쓴다 —
 * 둘 중 하나를 꺼도 나머지로 카테고리를 계속 고를 수 있다.
 *
 * 순번은 rows의 저장 순서다. 드래그 재정렬은 화면 순서와 저장 순서가 같을 때만 열린다 —
 * 필터·검색·다른 정렬이 걸린 상태에서 끌면 "보이는 순서"를 저장 순서로 착각하게 되므로
 * 그때는 onReorder를 표에 넘기지 않아 핸들이 잠긴다.
 */
export function PortfolioList({
  rows,
  categories,
  title = '포트폴리오 관리',
  description = '시공 내역(이미지·제목·상세·링크)을 등록·수정·삭제하고 순번/활성화를 관리합니다.',
  createLabel = '포트폴리오 등록',
  createIcon,
  searchPlaceholder = '제목 검색',
  emptyText = '등록된 포트폴리오가 없습니다.',
  statusOptions = STATUS_OPTIONS,
  sortOptions = SORT_OPTIONS,
  loading = false,
  pageSize: initialPageSize = 20,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  density = 'compact',
  show,
  filter: filterProp,
  onFilterChange,
  selectedIds: selectedIdsProp,
  onSelectChange,
  columnVisibility,
  onColumnVisibilityChange,
  onCreate,
  onEdit,
  onView,
  onDelete,
  onToggleActive,
  onReorder,
  onBulkDelete,
  bulkActions = [],
}: PortfolioListProps) {
  const [innerFilter, setInnerFilter] = useState<PortfolioFilter>(DEFAULT_FILTER)
  const [innerSelected, setInnerSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const s = { ...DEFAULT_SHOW, ...show }

  // filter/selectedIds는 주면 제어, 안 주면 내부 상태 — 스토리와 서버 조회를 같은 코드로 쓴다
  const filter = filterProp ?? innerFilter
  const selectedIds = selectedIdsProp ?? innerSelected

  /** 조건 하나가 바뀌면 나머지와 묶어 한 번에 통보하고 페이지를 되돌린다 */
  const applyFilter = (patch: Partial<PortfolioFilter>) => {
    const next: PortfolioFilter = { ...filter, ...patch }
    if (filterProp == null) setInnerFilter(next)
    setPage(1)
    onFilterChange?.(next)
  }

  const applySelect = (ids: string[]) => {
    if (selectedIdsProp == null) setInnerSelected(ids)
    onSelectChange?.(ids)
  }

  const categoryOf = useMemo(
    () => new Map(categories.map((item) => [item.value, item])),
    [categories],
  )

  // 순번 = rows의 저장 순서. 정렬/필터를 바꿔도 순번은 행을 따라간다.
  const seqOf = useMemo(() => new Map(rows.map((row, index) => [row.id, index + 1])), [rows])

  // ── 조회: 필터 → 정렬 ────────────────────────────────────────────────
  const { category, status, keyword, sort } = filter

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    const matched = rows.filter((row) => {
      if (category != null && row.category !== category) return false
      if (status != null && row.active !== (status === 'active')) return false
      if (query !== '' && !row.title.toLowerCase().includes(query)) return false
      return true
    })

    if (sort === 'newest') {
      return [...matched].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }
    if (sort === 'title') {
      return [...matched].sort((a, b) => a.title.localeCompare(b.title, 'ko'))
    }
    return matched
  }, [rows, category, status, keyword, sort])

  // ── 페이지 ───────────────────────────────────────────────────────────
  // pagination이 꺼지면 자르지 않고 전부 그린다(빈 페이지 바가 남지 않게 표에 페이지 props도 넘기지 않는다)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  // 행이 줄어 페이지가 범위를 벗어나도 빈 화면이 되지 않게 마지막 페이지로 클램프
  const safePage = Math.min(page, totalPages)
  const start = s.pagination ? (safePage - 1) * pageSize : 0
  const paged = s.pagination ? filtered.slice(start, start + pageSize) : filtered

  // ── 순번 드래그 ──────────────────────────────────────────────────────
  // 화면 순서 === 저장 순서일 때만 열린다(필터/검색/다른 정렬이 걸리면 잠근다).
  const reorderable =
    s.reorder &&
    onReorder != null &&
    sort === 'order' &&
    category == null &&
    status == null &&
    keyword.trim() === ''

  /** 표는 현재 페이지 행만 재정렬해 돌려준다 — 그 구간만 전체 목록에 다시 끼운다 */
  const handleReorder = (nextPageRows: PortfolioRow[]) => {
    const next = [...rows]
    next.splice(start, nextPageRows.length, ...nextPageRows)
    onReorder?.(next)
  }

  // ── 컬럼 ─────────────────────────────────────────────────────────────
  // 데이터 열(이미지·카테고리·등록일…)은 컬럼 피커(columnVisibility)로 끈다.
  // 여기서 조건부로 넣고 빼는 건 피커가 건드리지 못하는 뼈대 열뿐이다.
  const columns: AdminColumn<PortfolioRow>[] = []

  if (s.bulk) columns.push({ kind: 'select', key: 'select' })
  if (s.reorder) columns.push({ kind: 'drag', key: 'drag' })

  columns.push(
    { kind: 'index', key: 'index', header: '순번', value: (row) => seqOf.get(row.id) },
    { kind: 'thumbnail', key: 'thumbnail', header: '이미지', value: (row) => row.thumbnail },
    { kind: 'title', key: 'title', header: '제목', ratio: 3, onClick: onEdit },
    {
      kind: 'category',
      key: 'category',
      header: '카테고리',
      ratio: 1,
      // 이모지 + 라벨. 정렬·내보내기도 이 문자열(코드값이 아니라)을 쓴다
      value: (row) => {
        const item = categoryOf.get(row.category)
        return item != null ? `${item.emoji} ${item.label}` : row.category
      },
      tone: (row) => categoryOf.get(row.category)?.tone ?? 'secondary',
    },
    { kind: 'date', key: 'createdAt', header: '등록일' },
    { kind: 'date', key: 'updatedAt', header: '수정일', value: (row) => row.updatedAt ?? '—' },
    { kind: 'user', key: 'createdBy', header: '등록자' },
    { kind: 'user', key: 'updatedBy', header: '수정자', value: (row) => row.updatedBy ?? '—' },
    { kind: 'status', key: 'active', header: '활성화' },
  )

  if (s.rowActions) {
    columns.push({
      kind: 'actions',
      key: 'actions',
      header: '관리',
      pinned: 'right',
      // 표 기본 아이콘 대신 공용 RowActions — 핸들러를 넘긴 버튼만 그려진다
      render: (row) => (
        <RowActions
          size="sm"
          onView={onView != null ? () => onView(row) : undefined}
          onEdit={onEdit != null ? () => onEdit(row) : undefined}
          onDelete={onDelete != null ? () => onDelete(row) : undefined}
          labels={{
            view: `${row.title} 상세보기`,
            edit: `${row.title} 수정`,
            delete: `${row.title} 삭제`,
          }}
        />
      ),
    })
  }

  // ── 탭 ───────────────────────────────────────────────────────────────
  // 건수는 필터 전체가 아니라 rows 기준 — 탭을 눌러도 다른 탭의 숫자가 흔들리지 않는다
  const tabItems = [
    { label: '전체', value: ALL, count: rows.length, fixed: true },
    ...categories.map((item) => ({
      label: `${item.emoji} ${item.label}`,
      value: item.value,
      count: rows.filter((row) => row.category === item.value).length,
      fixed: true,
    })),
  ]

  // ── 표 하단 빈 줄 방지 ────────────────────────────────────────────────
  // AdminTable은 페이지네이션/일괄바가 없어도 footer 줄(min-height 32px)을 항상 그린다.
  // pagination·bulk를 모두 끄면 그 빈 줄이 여백으로 남으므로 여기서 접는다.
  // (AdminTable은 다른 화면들이 함께 쓰는 파일이라 손대지 않는다)
  const bulkBarPossible = s.bulk && (bulkActions.length > 0 || onBulkDelete != null)
  const footerEmpty = !s.pagination && !(bulkBarPossible && selectedIds.length > 0)
  const tableClass = [styles.table, footerEmpty ? styles.noFooter : ''].filter(Boolean).join(' ')

  return (
    <AdminPageLayout
      density={density}
      // header 슬롯 — show.header가 false면 세 prop이 모두 비어 헤더가 통째로 사라진다
      title={s.header ? title : undefined}
      description={s.header ? description : undefined}
      headerActions={
        s.header ? (
          <Button
            variant="primary"
            size="md"
            label={createLabel}
            showLeftIcon
            leftIcon={createIcon ?? <Plus size={16} aria-hidden="true" />}
            onClick={onCreate}
          />
        ) : undefined
      }
      tabs={
        s.tabs ? (
          <CategoryTabs
            items={tabItems}
            value={category ?? ALL}
            onChange={(value) => applyFilter({ category: value === ALL ? null : value })}
          />
        ) : undefined
      }
      toolbar={
        s.toolbar ? (
          <ListToolbar
            selects={[
              {
                key: 'category',
                value: category ?? ALL,
                width: 170,
                options: [
                  { value: ALL, label: '전체 카테고리' },
                  ...categories.map((item) => ({
                    value: item.value,
                    label: `${item.emoji} ${item.label}`,
                  })),
                ],
                onChange: (value) => applyFilter({ category: value === ALL ? null : value }),
              },
              {
                key: 'status',
                value: status ?? ALL,
                options: statusOptions,
                onChange: (value) =>
                  applyFilter({
                    status: value === ALL ? null : (value as 'active' | 'inactive'),
                  }),
              },
            ]}
            search={{
              value: keyword,
              placeholder: searchPlaceholder,
              onChange: (value) => applyFilter({ keyword: value }),
            }}
            sort={{
              value: sort,
              options: sortOptions,
              onChange: (value) => applyFilter({ sort: value as PortfolioSort }),
            }}
            total={filtered.length}
          />
        ) : undefined
      }
    >
      <div className={tableClass}>
        <AdminTable<PortfolioRow>
          columns={columns}
          rows={paged}
          rowKey={(row) => row.id}
          density={density}
          onToggleStatus={onToggleActive}
          onEdit={onEdit}
          onDelete={onDelete}
          onReorder={reorderable ? handleReorder : undefined}
          // 선택·일괄 처리 — bulk가 꺼지면 체크박스 열도 일괄바도 없다
          selectedIds={s.bulk ? selectedIds : undefined}
          onSelectChange={s.bulk ? applySelect : undefined}
          onBulkDelete={s.bulk ? onBulkDelete : undefined}
          bulkActions={s.bulk ? bulkActions : undefined}
          // 페이지네이션 — 꺼지면 props를 아예 넘기지 않아 하단 바가 사라진다
          page={s.pagination ? safePage : undefined}
          totalPages={s.pagination ? totalPages : undefined}
          onPageChange={s.pagination ? setPage : undefined}
          pageSize={s.pagination ? pageSize : undefined}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={
            s.pagination
              ? (size) => {
                  setPageSize(size)
                  setPage(1)
                }
              : undefined
          }
          // 내보내기·컬럼 피커는 툴바에 속한다 — 툴바를 끄면 함께 사라지고, 각각 따로도 끌 수 있다
          columnPicker={s.toolbar && s.columnPicker}
          exportable={s.toolbar && s.export}
          exportFilename="포트폴리오"
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
          loading={loading}
          emptyText={emptyText}
        />
      </div>
    </AdminPageLayout>
  )
}
