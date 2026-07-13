import { useEffect, useRef, useState } from 'react'
import type {
  CSSProperties,
  DragEvent as ReactDragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react'
import {
  Check,
  ChevronDown,
  Columns3,
  Download,
  Ellipsis,
  ExternalLink,
  FileSpreadsheet,
  GripVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Placeholder } from '../../shared/placeholders'
import { downloadCsv, downloadExcelXml, toCsv, type ExportColumn } from '../../shared/tableExport'
import styles from './AdminTable.module.css'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { Checkbox } from '../Checkbox/Checkbox'
import { ContextMenu, type ContextMenuItem } from '../ContextMenu/ContextMenu'
import { EmptyState } from '../EmptyState/EmptyState'
import { Loading } from '../Loading/Loading'
import { Modal } from '../Modal/Modal'
import { Pagination } from '../Pagination/Pagination'
import { Popover } from '../Popover/Popover'
import { RowActions } from '../RowActions/RowActions'
import { Select } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import { Toggle } from '../Toggle/Toggle'

/** 어드민 테이블이 아는 컬럼 종류 — 조합만으로 어떤 목록이든 구성한다 */
export type AdminColumnKind =
  | 'select' // 체크박스(전체선택 + indeterminate)
  | 'drag' // 순서 변경 드래그 핸들(⋮⋮) — onReorder가 있을 때만 활성
  | 'index' // 순번
  | 'thumbnail' // 썸네일 이미지(없으면 플레이스홀더)
  | 'thumbTitle' // 썸네일 + 제목(+부제) 2단 셀 — 상품 목록용
  | 'title' // 제목(강조, 줄바꿈 금지, 클릭 가능)
  | 'titleTags' // 제목 + 태그 뱃지(BEST/SALE/NEW) + 외부링크 아이콘
  | 'text' // 임의 텍스트
  | 'type' // Type 배지
  | 'category' // 카테고리 배지
  | 'price' // ₩ 포맷 + tabular-nums
  | 'number' // 재고 등 숫자(0이면 error 톤 배지 옵션)
  | 'status' // ON/OFF 토글
  | 'selectCell' // 행 안에서 값을 바꾸는 인라인 Select(판매중/품절/숨김 …)
  | 'badge' // 임의 상태 배지(톤 지정)
  | 'date' // 등록일자/수정일자
  | 'user' // 등록자/수정자
  | 'memo' // 메모 인라인 편집(연필 → 모달)
  | 'actions' // 수정/삭제 아이콘 버튼
  | 'kebab' // 우측 ⋯ 메뉴(ContextMenu)

export type AdminColumnTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error'

/** titleTags/thumbTitle 제목 옆 태그 — BEST/SALE/NEW 같은 짧은 라벨 */
export type AdminCellTag = { label: string; tone?: AdminColumnTone }

/** kebab 메뉴 항목 — ContextMenu 항목과 같은 모양(onSelect만 필수) */
export type AdminRowMenuItem = Omit<ContextMenuItem, 'onSelect'> & { onSelect: () => void }

export type AdminColumn<T> = {
  kind: AdminColumnKind
  key: string
  /** 미지정 시 kind별 기본 헤더 */
  header?: ReactNode
  /** 비율(flex). 지정 안 하면 kind별 기본 비율 — 고정폭 kind에 지정하면 가변 컬럼이 된다 */
  ratio?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  /** 셀 값 — 미지정 시 row[key] */
  value?: (row: T) => unknown
  /** badge/type/number 톤 */
  tone?: (row: T) => AdminColumnTone
  /** 셀 클릭 — 셀이 스스로 인터랙션을 갖는 kind는 제외되고, 제목류는 제목 텍스트만 버튼이 된다 */
  onClick?: (row: T) => void
  /** 완전 커스텀 렌더 (select 제외) */
  render?: (row: T) => ReactNode
  /** 컬럼 피커에서 끌 수 있는지 — 기본 true, select/drag/actions/kebab만 기본 false */
  hideable?: boolean
  /**
   * 가로 스크롤 시 좌/우 고정. sticky offset을 px로 누적해야 하므로
   * 고정 컬럼은 ratio 대신 px 고정폭(kind 기본 고정폭 또는 minWidth)을 갖는다.
   */
  pinned?: 'left' | 'right'
  /** selectCell — 고를 수 있는 값 목록 */
  options?: { label: string; value: string }[]
  /** selectCell — 행 안에서 값이 바뀌었을 때 */
  onCellChange?: (row: T, value: string) => void
  /** titleTags/thumbTitle — 제목 앞에 붙는 태그 뱃지 */
  tags?: (row: T) => AdminCellTag[]
  /** titleTags/thumbTitle — 있으면 제목 뒤에 새 창 링크 아이콘 */
  externalHref?: (row: T) => string | undefined
  /** kebab — 행 메뉴 항목 */
  menu?: (row: T) => AdminRowMenuItem[]
  /** thumbTitle — 썸네일 주소. 미지정 시 row.thumbnail */
  thumb?: (row: T) => string | undefined
  /** thumbTitle — 제목 아래 둘째 줄(상품코드 등) */
  subValue?: (row: T) => ReactNode
}

/** 선택된 행에 대한 일괄 처리 — 삭제는 onBulkDelete가 따로 담당한다 */
export type AdminBulkAction = {
  key: string
  label: string
  tone?: 'primary' | 'secondary' | 'error'
  icon?: ReactNode
  onAction: (ids: string[]) => void
}

export type AdminTableProps<T> = {
  columns: AdminColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  selectedIds?: string[]
  onSelectChange?: (ids: string[]) => void
  onToggleStatus?: (row: T, next: boolean) => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  /** memo 셀 편집 저장 */
  onMemoChange?: (row: T, memo: string) => void
  /**
   * drag 셀로 행 순서를 바꿨을 때 — 이 콜백이 있어야 드래그가 활성된다.
   * 재정렬된 rows 전체를 그대로 돌려준다(정렬 중에는 비활성).
   */
  onReorder?: (rows: T[]) => void
  onBulkDelete?: (ids: string[]) => void
  /** 선택 시 하단에 뜨는 추가 버튼들 — 삭제 왼쪽에 나열된다 */
  bulkActions?: AdminBulkAction[]
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  /** 컬럼 표시 여부(key → boolean). 미지정 키는 표시. 없으면 컴포넌트가 내부 상태로 관리 */
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (next: Record<string, boolean>) => void
  /** 표 우상단 '컬럼' 버튼 — 체크박스 목록 팝오버 */
  columnPicker?: boolean
  /** 하단 좌측 페이지 크기 Select — onPageSizeChange와 함께 줘야 렌더된다 */
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
  /** 표 우상단 CSV/Excel 버튼 — 현재 rows·보이는 컬럼을 그대로 내보낸다 */
  exportable?: boolean
  exportFilename?: string
  loading?: boolean
  emptyText?: string
  density?: 'comfortable' | 'compact'
  /** 빈 상태의 보조 문구 — 필터 개념이 없는 표에서는 꺼서 제목만 남긴다 */
  showEmptyDescription?: boolean
  /** 빈 상태 보조 문구 — 다음 행동을 안내한다 */
  emptyDescription?: string
  /** 로딩 오버레이 문구 — 스크린리더가 읽는 이름이기도 하다 */
  loadingLabel?: string
  /** actions 셀 수정 아이콘 — 넘기지 않으면 공용 RowActions의 기본 아이콘(연필) */
  editIcon?: ReactNode
  /** actions 셀 삭제 아이콘 — 넘기지 않으면 공용 RowActions의 기본 아이콘(휴지통) */
  deleteIcon?: ReactNode
  /** kebab 셀 더보기 아이콘 */
  kebabIcon?: ReactNode
  /** drag 셀 순서 이동 핸들 아이콘 */
  dragIcon?: ReactNode
  /** 툴바 CSV 내보내기 아이콘 */
  csvIcon?: ReactNode
  /** 툴바 Excel 내보내기 아이콘 */
  excelIcon?: ReactNode
  /** 툴바 컬럼 피커 아이콘 */
  columnPickerIcon?: ReactNode
}

type KindSpec = {
  /** px 고정폭 — null이면 ratio로 남는 공간을 배분받는다 */
  fixed: number | null
  ratio: number | null
  /** 이 폭 아래로는 짜부라지지 않고 표가 가로 스크롤된다 */
  minWidth: number
  align: 'left' | 'center' | 'right'
  header: string
}

/**
 * kind별 기본 비율/최소폭 — 고정폭 컬럼은 px, 나머지는 남는 공간을 ratio로 배분한다.
 * 어떤 조합이든 비율이 깨지지 않고, 최소폭 합보다 좁아지면 가로 스크롤된다.
 */
const KIND_SPEC: Record<AdminColumnKind, KindSpec> = {
  select: { fixed: 44, ratio: null, minWidth: 44, align: 'center', header: '' },
  drag: { fixed: 40, ratio: null, minWidth: 40, align: 'center', header: '' },
  index: { fixed: 56, ratio: null, minWidth: 56, align: 'center', header: '순번' },
  thumbnail: { fixed: 72, ratio: null, minWidth: 72, align: 'center', header: '이미지' },
  thumbTitle: { fixed: null, ratio: 3, minWidth: 240, align: 'left', header: '상품' },
  title: { fixed: null, ratio: 3, minWidth: 180, align: 'left', header: 'Title' },
  titleTags: { fixed: null, ratio: 3, minWidth: 200, align: 'left', header: '제목' },
  text: { fixed: null, ratio: 2, minWidth: 140, align: 'left', header: '내용' },
  type: { fixed: null, ratio: 1, minWidth: 96, align: 'left', header: 'Type' },
  category: { fixed: null, ratio: 1, minWidth: 96, align: 'left', header: '카테고리' },
  price: { fixed: 120, ratio: null, minWidth: 120, align: 'right', header: '가격' },
  number: { fixed: 90, ratio: null, minWidth: 90, align: 'center', header: '수량' },
  status: { fixed: 90, ratio: null, minWidth: 90, align: 'center', header: '상태' },
  selectCell: { fixed: 120, ratio: null, minWidth: 120, align: 'center', header: '상태' },
  badge: { fixed: 110, ratio: null, minWidth: 110, align: 'center', header: '상태' },
  date: { fixed: 120, ratio: null, minWidth: 120, align: 'center', header: '일자' },
  user: { fixed: 110, ratio: null, minWidth: 110, align: 'center', header: '작성자' },
  memo: { fixed: 120, ratio: null, minWidth: 120, align: 'left', header: '메모' },
  actions: { fixed: 96, ratio: null, minWidth: 96, align: 'center', header: '관리' },
  kebab: { fixed: 48, ratio: null, minWidth: 48, align: 'center', header: '' },
}

/**
 * 셀 자체가 인터랙션을 갖는 kind — cellButton 래핑 대상에서 제외.
 * 제목류(titleTags/thumbTitle)는 링크·태그를 품으므로 셀 전체를 button으로 감싸면
 * 인터랙티브 요소가 중첩된다. onClick은 제목 텍스트에만 붙인다.
 */
const INTERACTIVE_KINDS: AdminColumnKind[] = [
  'select',
  'drag',
  'status',
  'selectCell',
  'memo',
  'actions',
  'kebab',
  'titleTags',
  'thumbTitle',
]

/** 제목으로 읽히는 kind — aria-label용 행 이름을 여기서 뽑는다 */
const TITLE_KINDS: AdminColumnKind[] = ['title', 'titleTags', 'thumbTitle']

/** 기본으로 끌 수 없는 kind — 선택/순서/관리는 표의 뼈대다 */
const ALWAYS_VISIBLE_KINDS: AdminColumnKind[] = ['select', 'drag', 'actions', 'kebab']

/** 내보내도 의미 없는 kind — 체크박스·썸네일·핸들·버튼 */
const NON_EXPORTABLE_KINDS: AdminColumnKind[] = [
  'select',
  'drag',
  'thumbnail',
  'actions',
  'kebab',
]

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

type SortDir = 'asc' | 'desc'
type SortState = { key: string; dir: SortDir } | null

type ColLayout = { fixed: number | null; ratio: number; minWidth: number }

/** ₩1,234,000 */
function formatPrice(value: unknown): string {
  return `₩${Number(value ?? 0).toLocaleString('ko-KR')}`
}

/** 문자열은 localeCompare, 숫자는 수치 비교 */
function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return String(a ?? '').localeCompare(String(b ?? ''), 'ko')
}

/**
 * 정렬 화살표.
 * NOTE: Table.tsx에도 같은 모양의 SortIcon이 있다. 다만 그쪽은 export되지 않아 가져다 쓸 수 없다.
 * (Table은 이 작업의 수정 범위 밖이다.) 나중에 Table이 SortIcon을 export하면 이 사본을 지우고
 * 그걸 import하면 된다 — 마크업은 지금도 동일하다.
 */
function SortIcon({ dir }: { dir: SortDir | null }) {
  if (dir === 'asc') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 15l6-6 6 6" />
      </svg>
    )
  }
  if (dir === 'desc') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 9l5-5 5 5" />
      <path d="M7 15l5 5 5-5" />
    </svg>
  )
}

/** 컬럼 선언을 조합해 만드는 범용 어드민 테이블 */
export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  selectedIds = [],
  onSelectChange,
  onToggleStatus,
  onEdit,
  onDelete,
  onMemoChange,
  onReorder,
  onBulkDelete,
  bulkActions = [],
  page,
  totalPages,
  onPageChange,
  columnVisibility,
  onColumnVisibilityChange,
  columnPicker = false,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  exportable = false,
  exportFilename = 'table',
  loading = false,
  emptyText = '데이터가 없습니다.',
  density = 'comfortable',
  showEmptyDescription = true,
  emptyDescription = '필터를 바꾸거나 새 항목을 등록해 보세요.',
  loadingLabel = '불러오는 중',
  editIcon,
  deleteIcon,
  kebabIcon,
  dragIcon,
  csvIcon,
  excelIcon,
  columnPickerIcon,
}: AdminTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  // columnVisibility를 주지 않으면 컴포넌트가 직접 들고 있는다(비제어)
  const [internalVisibility, setInternalVisibility] = useState<Record<string, boolean>>({})
  const wrapRef = useRef<HTMLDivElement>(null)
  // 고정 컬럼 경계선 — 그 방향으로 가려진 내용이 있을 때만 보인다
  const [edges, setEdges] = useState({ left: false, right: false })
  // 메모 편집 — 모달은 표 바깥(루트)에 한 번만 띄운다(셀 안에 두면 가로 스크롤 컨테이너에 갇힌다)
  const [memoRow, setMemoRow] = useState<T | null>(null)
  const [memoDraft, setMemoDraft] = useState('')
  // 행 순서 드래그 — armed는 핸들에서 mousedown 했을 때만 켠다(행 전체가 잡히지 않도록)
  const [armedId, setArmedId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  // ── 컬럼 숨김 ────────────────────────────────────────────────────────
  const visibility = columnVisibility ?? internalVisibility
  const isHideable = (col: AdminColumn<T>): boolean =>
    col.hideable ?? !ALWAYS_VISIBLE_KINDS.includes(col.kind)
  const isVisible = (col: AdminColumn<T>): boolean =>
    !isHideable(col) || (visibility[col.key] ?? true)

  const visibleColumns = columns.filter(isVisible)
  const hideableColumns = columns.filter(isHideable)
  // 마지막 한 컬럼까지 끄면 빈 표가 된다 — 그건 막는다
  const visibleHideableCount = hideableColumns.filter(isVisible).length

  const setColumnVisible = (key: string, next: boolean) => {
    const draft: Record<string, boolean> = {}
    for (const col of hideableColumns) {
      draft[col.key] = col.key === key ? next : isVisible(col)
    }
    onColumnVisibilityChange?.(draft)
    if (columnVisibility == null) setInternalVisibility(draft)
  }

  /** 컬럼 피커·내보내기 헤더에 쓸 문자열 라벨(header가 ReactNode일 수 있다) */
  const columnLabel = (col: AdminColumn<T>): string => {
    if (typeof col.header === 'string' && col.header !== '') return col.header
    const fallback = KIND_SPEC[col.kind].header
    return fallback !== '' ? fallback : col.key
  }

  // ── 폭 배분: 고정폭은 px, 나머지는 (100% - 고정폭 합)을 ratio로 나눠 갖는다 ──
  const layouts: ColLayout[] = visibleColumns.map((col) => {
    const spec = KIND_SPEC[col.kind]
    // pinned는 sticky offset 누적을 위해 반드시 px 고정폭이어야 한다
    if (col.pinned != null) {
      const px = spec.fixed ?? spec.minWidth
      return { fixed: px, ratio: 0, minWidth: px }
    }
    // ratio를 명시하면 고정폭 kind라도 가변 컬럼이 된다
    if (col.ratio != null) return { fixed: null, ratio: col.ratio, minWidth: spec.minWidth }
    if (spec.fixed != null) return { fixed: spec.fixed, ratio: 0, minWidth: spec.fixed }
    return { fixed: null, ratio: spec.ratio ?? 1, minWidth: spec.minWidth }
  })

  const fixedSum = layouts.reduce((sum, l) => sum + (l.fixed ?? 0), 0)
  const ratioSum = layouts.reduce((sum, l) => sum + l.ratio, 0)
  const minWidthSum = layouts.reduce((sum, l) => sum + l.minWidth, 0)

  const colWidth = (l: ColLayout): string | undefined => {
    if (l.fixed != null) return `${l.fixed}px`
    if (ratioSum === 0) return undefined
    return `calc((100% - ${fixedSum}px) * ${l.ratio / ratioSum})`
  }

  // ── 컬럼 고정: 좌측은 앞에서, 우측은 뒤에서 px 폭을 누적한 offset ──────
  const pinnedOffsets = new Map<string, number>()
  let leftAcc = 0
  visibleColumns.forEach((col, i) => {
    if (col.pinned !== 'left') return
    pinnedOffsets.set(col.key, leftAcc)
    leftAcc += layouts[i].fixed ?? layouts[i].minWidth
  })
  let rightAcc = 0
  for (let i = visibleColumns.length - 1; i >= 0; i -= 1) {
    const col = visibleColumns[i]
    if (col.pinned !== 'right') continue
    pinnedOffsets.set(col.key, rightAcc)
    rightAcc += layouts[i].fixed ?? layouts[i].minWidth
  }

  // 경계선은 고정 그룹의 안쪽 끝 컬럼에만 그린다
  const leftPinned = visibleColumns.filter((col) => col.pinned === 'left')
  const rightPinned = visibleColumns.filter((col) => col.pinned === 'right')
  const leftEdgeKey = leftPinned.length > 0 ? leftPinned[leftPinned.length - 1].key : null
  const rightEdgeKey = rightPinned.length > 0 ? rightPinned[0].key : null
  const hasPinned = leftPinned.length > 0 || rightPinned.length > 0

  const isEmpty = rows.length === 0 && !loading

  // 가로 스크롤 위치를 보고 경계선 표시 여부를 갱신한다
  useEffect(() => {
    const el = wrapRef.current
    if (el == null || !hasPinned || isEmpty) return

    const sync = () => {
      const max = el.scrollWidth - el.clientWidth
      const left = el.scrollLeft > 1
      const right = el.scrollLeft < max - 1
      setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }))
    }

    sync()
    el.addEventListener('scroll', sync, { passive: true })

    // 컬럼 숨김·행 변화로 표 폭이 바뀌어도 다시 재어야 한다
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', sync)
      return () => {
        el.removeEventListener('scroll', sync)
        window.removeEventListener('resize', sync)
      }
    }

    const observer = new ResizeObserver(sync)
    observer.observe(el)
    const table = el.querySelector('table')
    if (table != null) observer.observe(table)
    return () => {
      el.removeEventListener('scroll', sync)
      observer.disconnect()
    }
  }, [hasPinned, isEmpty])

  // ── 선택 ──────────────────────────────────────────────────────────────
  const selected = new Set(selectedIds)
  const allChecked = rows.length > 0 && rows.every((row) => selected.has(rowKey(row)))
  const someChecked = rows.some((row) => selected.has(rowKey(row)))

  const toggleAll = (checked: boolean) => {
    onSelectChange?.(checked ? rows.map(rowKey) : [])
  }

  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(id)
    else next.delete(id)
    // rows 순서를 유지해 반환
    onSelectChange?.(rows.map(rowKey).filter((id2) => next.has(id2)))
  }

  // ── 정렬 (asc → desc → none 순환) ────────────────────────────────────
  const valueOf = (col: AdminColumn<T>, row: T): unknown =>
    col.value != null ? col.value(row) : (row as Record<string, unknown>)[col.key]

  const cycleSort = (key: string) => {
    setSort((prev) => {
      if (prev == null || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  // 숨겨진 컬럼으로는 정렬하지 않는다
  const sortCol = sort != null ? visibleColumns.find((col) => col.key === sort.key) : undefined
  const sorted =
    sort == null || sortCol == null
      ? rows
      : [...rows].sort((a, b) => {
          const result = compareValues(valueOf(sortCol, a), valueOf(sortCol, b))
          return sort.dir === 'asc' ? result : -result
        })

  // 순번은 rows 원본 순서 기준 — 정렬을 바꿔도 순번은 행을 따라간다
  const seqOf = new Map(rows.map((row, i) => [rowKey(row), i + 1]))

  // 액션 버튼 aria-label용 행 이름 — 제목 컬럼이 있으면 그 값을 쓴다
  const titleCol = columns.find((col) => TITLE_KINDS.includes(col.kind))
  const rowLabel = (row: T): string =>
    titleCol != null ? String(valueOf(titleCol, row) ?? rowKey(row)) : rowKey(row)

  // ── 행 순서 드래그 ────────────────────────────────────────────────────
  // 정렬 중에는 화면 순서와 rows 순서가 달라 재정렬이 거짓말이 된다 — 그때는 끈다.
  const reorderable = onReorder != null && sort == null
  const indexOfId = (id: string): number => rows.findIndex((row) => rowKey(row) === id)

  const moveRow = (from: number, to: number) => {
    if (from < 0 || to < 0 || from === to || to >= rows.length) return
    const next = [...rows]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onReorder?.(next)
  }

  const endDrag = () => {
    setArmedId(null)
    setDragId(null)
    setOverId(null)
  }

  const handleDragStart = (id: string) => (event: ReactDragEvent<HTMLTableRowElement>) => {
    setDragId(id)
    event.dataTransfer.effectAllowed = 'move'
    // Firefox는 데이터가 없으면 드래그를 시작하지 않는다
    event.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (id: string) => (event: ReactDragEvent<HTMLTableRowElement>) => {
    if (dragId == null || dragId === id) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (overId !== id) setOverId(id)
  }

  const handleDrop = (id: string) => (event: ReactDragEvent<HTMLTableRowElement>) => {
    event.preventDefault()
    if (dragId != null) moveRow(indexOfId(dragId), indexOfId(id))
    endDrag()
  }

  /** 키보드로도 순서를 바꾼다 — 핸들에 포커스한 뒤 ↑/↓ */
  const handleHandleKeyDown = (id: string) => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const from = indexOfId(id)
    moveRow(from, event.key === 'ArrowUp' ? from - 1 : from + 1)
  }

  // 드롭 위치 선(위/아래)은 끌고 온 방향으로 정한다
  const dragIndex = dragId != null ? indexOfId(dragId) : -1
  const overIndex = overId != null ? indexOfId(overId) : -1

  // ── 메모 ──────────────────────────────────────────────────────────────
  const openMemo = (row: T, current: string) => {
    setMemoRow(row)
    setMemoDraft(current)
  }

  const closeMemo = () => {
    setMemoRow(null)
    setMemoDraft('')
  }

  const saveMemo = () => {
    if (memoRow != null) onMemoChange?.(memoRow, memoDraft)
    closeMemo()
  }

  // ── 내보내기: 화면에 보이는 컬럼 · 현재 정렬된 행 그대로 ────────────────
  const exportColumns: ExportColumn<T>[] = visibleColumns
    .filter((col) => !NON_EXPORTABLE_KINDS.includes(col.kind))
    .map((col) => ({
      key: col.key,
      header: columnLabel(col),
      value: (row: T) => {
        const raw = valueOf(col, row)
        // 순번은 값이 없으면 화면과 같은 자동 번호를 쓴다
        if (col.kind === 'index') return raw ?? seqOf.get(rowKey(row))
        // 가격·수량은 숫자로 내보내야 엑셀에서 합계가 된다(₩ 문자열 금지)
        if (col.kind === 'price' || col.kind === 'number') return Number(raw ?? 0)
        // 인라인 Select는 값이 아니라 화면에 보이던 라벨로 내보낸다
        if (col.kind === 'selectCell') {
          return col.options?.find((option) => option.value === String(raw ?? ''))?.label ?? raw
        }
        // status는 boolean → toText가 ON/OFF로 바꾼다
        return raw
      },
    }))

  const handleExportCsv = () => {
    downloadCsv(exportFilename, toCsv(sorted, exportColumns))
  }

  const handleExportExcel = () => {
    downloadExcelXml(exportFilename, sorted, exportColumns)
  }

  // ── 셀 렌더 ──────────────────────────────────────────────────────────
  /** thumbTitle 썸네일 주소 — col.thumb 우선, 없으면 row.thumbnail */
  const thumbOf = (col: AdminColumn<T>, row: T): string | undefined => {
    const src =
      col.thumb != null ? col.thumb(row) : (row as Record<string, unknown>)['thumbnail']
    return typeof src === 'string' && src !== '' ? src : undefined
  }

  /** 썸네일 상자 — 이미지가 없으면 공용 대체 그림 */
  const thumbBox = (src: string | undefined, row: T): ReactNode =>
    src != null ? (
      <img className={styles.thumb} src={src} alt={`${rowLabel(row)} 썸네일`} />
    ) : (
      // 썸네일 없는 행 — 공용 대체 이미지(Image·ImageCard와 같은 그림)
      <span className={styles.thumbEmpty} role="img" aria-label="이미지 없음">
        <Placeholder kind="image" size="fill" />
      </span>
    )

  /** 태그 + 제목 + 외부링크 한 줄 — titleTags/thumbTitle이 공유한다 */
  const titleLine = (col: AdminColumn<T>, row: T, raw: unknown): ReactNode => {
    const tags = col.tags?.(row) ?? []
    const href = col.externalHref?.(row)
    const text = String(raw ?? '')
    return (
      <span className={styles.titleLine}>
        {tags.map((tag) => (
          <span key={tag.label} className={styles.tag}>
            <Badge variant={tag.tone ?? 'secondary'} appearance="soft" size="sm" label={tag.label} />
          </span>
        ))}
        {col.onClick != null ? (
          // 링크·태그와 겹치지 않도록 셀 전체가 아니라 제목 텍스트만 버튼이 된다
          <button
            type="button"
            className={[styles.title, styles.titleButton].join(' ')}
            title={text}
            onClick={() => col.onClick?.(row)}
          >
            {text}
          </button>
        ) : (
          <span className={styles.title} title={text}>
            {text}
          </span>
        )}
        {href != null && href !== '' && (
          <a
            className={[styles.external, styles.inlineAction].join(' ')}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${text} 새 창으로 열기`}
          >
            <ExternalLink size={13} />
          </a>
        )}
      </span>
    )
  }

  const renderCell = (col: AdminColumn<T>, row: T): ReactNode => {
    const id = rowKey(row)

    if (col.kind === 'select') {
      return <Checkbox checked={selected.has(id)} onChange={(checked) => toggleOne(id, checked)} />
    }

    // select 외에는 render가 최우선 escape hatch
    if (col.render != null) return col.render(row)

    const raw = valueOf(col, row)

    switch (col.kind) {
      case 'drag': {
        const disabled = !reorderable
        return (
          <button
            type="button"
            className={[styles.grip, styles.inlineAction].join(' ')}
            disabled={disabled}
            aria-label={`${rowLabel(row)} 순서 이동`}
            title={
              onReorder == null
                ? '순서 변경을 지원하지 않습니다'
                : disabled
                  ? '정렬 중에는 순서를 바꿀 수 없습니다'
                  : '드래그하거나 ↑ ↓ 키로 순서를 바꿉니다'
            }
            // 핸들을 눌렀을 때만 행이 draggable이 된다 — 텍스트 선택을 막지 않는다
            onMouseDown={() => {
              if (!disabled) setArmedId(id)
            }}
            onMouseUp={() => setArmedId(null)}
            onKeyDown={disabled ? undefined : handleHandleKeyDown(id)}
          >
            {dragIcon ?? <GripVertical size={14} />}
          </button>
        )
      }

      case 'index':
        return <span className={styles.muted}>{raw != null ? String(raw) : seqOf.get(id)}</span>

      case 'thumbnail':
        return thumbBox(typeof raw === 'string' && raw !== '' ? raw : undefined, row)

      case 'thumbTitle': {
        const sub = col.subValue?.(row)
        return (
          <span className={styles.thumbTitle}>
            {thumbBox(thumbOf(col, row), row)}
            <span className={styles.thumbTitleText}>
              {titleLine(col, row, raw)}
              {sub != null && <span className={styles.sub}>{sub}</span>}
            </span>
          </span>
        )
      }

      case 'title':
        return <span className={styles.title}>{String(raw ?? '')}</span>

      case 'titleTags':
        return titleLine(col, row, raw)

      case 'text':
        return <span className={styles.text}>{String(raw ?? '')}</span>

      case 'type':
        return (
          <Badge
            variant={col.tone?.(row) ?? 'primary'}
            appearance="soft"
            size="sm"
            label={String(raw ?? '')}
          />
        )

      case 'category':
        return (
          <Badge
            variant={col.tone?.(row) ?? 'secondary'}
            appearance="soft"
            size="sm"
            label={String(raw ?? '')}
          />
        )

      case 'price':
        return <span className={styles.price}>{formatPrice(raw)}</span>

      case 'number': {
        const num = Number(raw ?? 0)
        // 0이면 톤 배지로(예: 재고 0 → error) — tone 미지정 시 그냥 숫자
        if (num === 0 && col.tone != null) {
          return <Badge variant={col.tone(row)} appearance="soft" size="sm" label="0" />
        }
        return <span className={styles.number}>{num.toLocaleString('ko-KR')}</span>
      }

      case 'status':
        return (
          <Toggle
            checked={Boolean(raw)}
            size="sm"
            onChange={(next) => onToggleStatus?.(row, next)}
          />
        )

      case 'selectCell': {
        const options = col.options ?? []
        const current = String(raw ?? '')
        const label = options.find((option) => option.value === current)?.label ?? current
        // Select의 패널은 absolute라 가로 스크롤 컨테이너(tableWrap)에 잘린다.
        // ContextMenu는 fixed + 뷰포트 보정이라 마지막 행에서도 온전히 열린다.
        return (
          <ContextMenu
            trigger="click"
            items={options.map((option) => ({
              key: option.value,
              label: option.label,
              icon: option.value === current ? <Check size={14} /> : undefined,
              onSelect: () => col.onCellChange?.(row, option.value),
            }))}
          >
            <button
              type="button"
              className={styles.selectCell}
              aria-haspopup="menu"
              aria-label={`${rowLabel(row)} ${columnLabel(col)} 변경 — 현재 ${label}`}
              disabled={options.length === 0}
            >
              <span className={styles.selectCellValue}>{label}</span>
              <span className={styles.selectCellChevron} aria-hidden="true">
                <ChevronDown size={14} />
              </span>
            </button>
          </ContextMenu>
        )
      }

      case 'badge':
        return (
          <Badge
            variant={col.tone?.(row) ?? 'secondary'}
            appearance="soft"
            size="sm"
            label={String(raw ?? '')}
          />
        )

      case 'date':
        return <span className={styles.muted}>{String(raw ?? '')}</span>

      case 'user':
        return <span className={styles.user}>{String(raw ?? '')}</span>

      case 'memo': {
        const memo = raw == null ? '' : String(raw)
        const filled = memo !== ''
        return (
          <button
            type="button"
            className={[styles.memo, filled ? styles.memoFilled : styles.inlineAction].join(' ')}
            aria-label={`${rowLabel(row)} 메모 ${filled ? '편집' : '작성'}`}
            title={filled ? memo : '메모 없음'}
            onClick={() => openMemo(row, memo)}
          >
            <span className={styles.memoIcon} aria-hidden="true">
              <Pencil size={13} />
            </span>
            <span className={styles.memoText}>{filled ? memo : '메모'}</span>
          </button>
        )
      }

      case 'kebab': {
        const items = col.menu?.(row) ?? []
        if (items.length === 0) return null
        return (
          <ContextMenu trigger="click" items={items}>
            <button
              type="button"
              className={[styles.kebab, styles.inlineAction].join(' ')}
              aria-haspopup="menu"
              aria-label={`${rowLabel(row)} 더보기`}
            >
              {kebabIcon ?? <Ellipsis size={16} />}
            </button>
          </ContextMenu>
        )
      }

      case 'actions': {
        const label = rowLabel(row)

        // 아이콘을 갈아끼우지 않는 기본 경우 — 공용 RowActions가 버튼·툴팁·error 톤·전파 차단을 전부 갖는다.
        // 핸들러를 넘긴 버튼만 렌더되므로 onEdit/onDelete가 없으면 빈 자리가 남지 않는다.
        if (editIcon == null && deleteIcon == null) {
          return (
            <span className={styles.rowActions}>
              <RowActions
                size="sm"
                onEdit={onEdit != null ? () => onEdit(row) : undefined}
                onDelete={onDelete != null ? () => onDelete(row) : undefined}
                labels={{ edit: `${label} 수정`, delete: `${label} 삭제` }}
              />
            </span>
          )
        }

        // 아이콘 슬롯을 쓴 경우 — RowActions는 아이콘 교체를 받지 않으므로(수정 범위 밖) 여기서 그린다.
        // 배치/톤은 위와 같게 유지한다.
        return (
          <span className={styles.rowActions}>
            {onEdit != null && (
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`${label} 수정`}
                onClick={() => onEdit(row)}
              >
                {editIcon ?? <Pencil size={15} />}
              </button>
            )}
            {onDelete != null && (
              <button
                type="button"
                className={[styles.iconButton, styles.danger].join(' ')}
                aria-label={`${label} 삭제`}
                onClick={() => onDelete(row)}
              >
                {deleteIcon ?? <Trash2 size={15} />}
              </button>
            )}
          </span>
        )
      }

      default:
        return String(raw ?? '')
    }
  }

  // onClick이 있으면(인터랙티브 kind 제외) 셀 내용을 버튼으로 감싼다
  const cell = (col: AdminColumn<T>, row: T): ReactNode => {
    const node = renderCell(col, row)
    if (col.onClick == null || INTERACTIVE_KINDS.includes(col.kind)) return node
    return (
      <button type="button" className={styles.cellButton} onClick={() => col.onClick?.(row)}>
        {node}
      </button>
    )
  }

  const headerOf = (col: AdminColumn<T>): ReactNode => {
    if (col.kind === 'select') {
      return (
        <Checkbox
          checked={allChecked}
          indeterminate={!allChecked && someChecked}
          onChange={toggleAll}
        />
      )
    }
    return col.header ?? KIND_SPEC[col.kind].header
  }

  const cellStyle = (col: AdminColumn<T>): CSSProperties => {
    const base: CSSProperties = { textAlign: col.align ?? KIND_SPEC[col.kind].align }
    if (col.pinned === 'left') return { ...base, left: pinnedOffsets.get(col.key) }
    if (col.pinned === 'right') return { ...base, right: pinnedOffsets.get(col.key) }
    return base
  }

  const cellClass = (col: AdminColumn<T>, base: string): string =>
    [
      base,
      col.pinned != null ? styles.pinned : '',
      col.key === leftEdgeKey ? styles.pinnedLeftEdge : '',
      col.key === rightEdgeKey ? styles.pinnedRightEdge : '',
    ]
      .filter(Boolean)
      .join(' ')

  const tableClass = [
    styles.table,
    density === 'compact' ? styles.compact : '',
    edges.left ? styles.edgeLeft : '',
    edges.right ? styles.edgeRight : '',
  ]
    .filter(Boolean)
    .join(' ')

  const showPagination = page != null && totalPages != null && totalPages > 1
  const showPageSize = pageSize != null && onPageSizeChange != null
  const showToolbar = columnPicker || exportable
  const showBulk = selectedIds.length > 0 && (bulkActions.length > 0 || onBulkDelete != null)

  return (
    <div className={styles.adminTable}>
      {showToolbar && (
        <div className={styles.toolbar}>
          {exportable && (
            <>
              <Button
                variant="secondary"
                appearance="outline"
                size="sm"
                label="CSV"
                showIcon
                icon={csvIcon ?? <Download size={14} />}
                onClick={handleExportCsv}
              />
              <Button
                variant="secondary"
                appearance="outline"
                size="sm"
                label="Excel"
                showIcon
                icon={excelIcon ?? <FileSpreadsheet size={14} />}
                onClick={handleExportExcel}
              />
            </>
          )}
          {columnPicker && (
            <Popover
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              placement="bottom-end"
              title="컬럼 표시"
              trigger={
                <Button
                  variant="secondary"
                  appearance="outline"
                  size="sm"
                  label="컬럼"
                  showIcon
                  icon={columnPickerIcon ?? <Columns3 size={14} />}
                />
              }
            >
              <div className={styles.pickerList}>
                {hideableColumns.map((col) => {
                  const checked = isVisible(col)
                  return (
                    <Checkbox
                      key={col.key}
                      checked={checked}
                      // 마지막 남은 한 컬럼은 끌 수 없다
                      disabled={checked && visibleHideableCount <= 1}
                      label={columnLabel(col)}
                      onChange={(next) => setColumnVisible(col.key, next)}
                    />
                  )
                })}
              </div>
            </Popover>
          )}
        </div>
      )}

      <div className={styles.tableWrap} ref={wrapRef}>
        {isEmpty ? (
          <EmptyState
            title={emptyText}
            description={showEmptyDescription ? emptyDescription : undefined}
            compact
          />
        ) : (
          // 고정폭 + 비율 배분은 table-layout: fixed + colgroup으로 계산한다.
          // 최소폭 합보다 좁아지면 줄바꿈 대신 가로 스크롤.
          <table className={tableClass} style={{ minWidth: minWidthSum }}>
            <colgroup>
              {visibleColumns.map((col, i) => (
                <col key={col.key} style={{ width: colWidth(layouts[i]) }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {visibleColumns.map((col) => {
                  const dir = sort != null && sort.key === col.key ? sort.dir : null
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={cellClass(col, styles.th)}
                      style={cellStyle(col)}
                      aria-sort={dir == null ? undefined : dir === 'asc' ? 'ascending' : 'descending'}
                    >
                      {col.sortable === true ? (
                        <button type="button" className={styles.sortButton} onClick={() => cycleSort(col.key)}>
                          {headerOf(col)}
                          <span className={dir == null ? styles.sortIcon : styles.sortIconActive}>
                            <SortIcon dir={dir} />
                          </span>
                        </button>
                      ) : (
                        headerOf(col)
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const id = rowKey(row)
                const isDragging = dragId === id
                // 드롭선은 끌고 온 방향의 반대편 모서리에 그린다
                const isOver = overId === id && dragIndex >= 0 && !isDragging
                const rowClass = [
                  styles.row,
                  isDragging ? styles.dragging : '',
                  isOver ? (dragIndex < overIndex ? styles.dropAfter : styles.dropBefore) : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <tr
                    key={id}
                    className={rowClass}
                    draggable={reorderable && armedId === id}
                    onDragStart={reorderable ? handleDragStart(id) : undefined}
                    onDragOver={reorderable ? handleDragOver(id) : undefined}
                    onDrop={reorderable ? handleDrop(id) : undefined}
                    onDragEnd={reorderable ? endDrag : undefined}
                  >
                    {visibleColumns.map((col) => (
                      <td key={col.key} className={cellClass(col, styles.td)} style={cellStyle(col)}>
                        {cell(col, row)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {loading && <Loading overlay label={loadingLabel} />}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          {showPageSize && (
            <div className={styles.pageSize}>
              <Select
                value={String(pageSize)}
                options={pageSizeOptions.map((size) => ({
                  value: String(size),
                  label: `${size}개씩`,
                }))}
                onChange={(value) => onPageSizeChange(Number(value))}
              />
            </div>
          )}
          {showBulk && (
            <div className={styles.bulk}>
              <span className={styles.selectedCount}>선택 {selectedIds.length}건</span>
              {bulkActions.map((action) => (
                <Button
                  key={action.key}
                  variant={action.tone ?? 'secondary'}
                  appearance="outline"
                  size="sm"
                  label={action.label}
                  showIcon={action.icon != null}
                  icon={action.icon}
                  onClick={() => action.onAction(selectedIds)}
                />
              ))}
              {onBulkDelete != null && (
                <Button
                  variant="error"
                  appearance="outline"
                  size="sm"
                  label="선택 삭제"
                  showIcon
                  icon={<Trash2 size={14} />}
                  onClick={() => onBulkDelete(selectedIds)}
                />
              )}
            </div>
          )}
        </div>
        {showPagination && <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />}
      </div>

      {/* 메모 편집 — 셀 안이 아니라 표 루트에서 한 번만 띄운다 */}
      <Modal
        open={memoRow != null}
        onClose={closeMemo}
        title={memoRow != null ? `메모 — ${rowLabel(memoRow)}` : '메모'}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              appearance="outline"
              size="sm"
              label="취소"
              onClick={closeMemo}
            />
            <Button variant="primary" size="sm" label="저장" onClick={saveMemo} />
          </>
        }
      >
        <Textarea
          value={memoDraft}
          onChange={setMemoDraft}
          rows={4}
          maxLength={200}
          showCounter
          placeholder="이 행에 대한 메모를 남기세요"
        />
      </Modal>
    </div>
  )
}
