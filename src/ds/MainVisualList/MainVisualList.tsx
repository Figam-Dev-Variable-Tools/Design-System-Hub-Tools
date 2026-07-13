import type { ReactNode } from 'react'
import { GripVertical, Plus } from 'lucide-react'
import { mockImage } from '../../shared/mediaMock'
import { AdminPageLayout } from '../AdminPageLayout/AdminPageLayout'
import {
  AdminTable,
  type AdminBulkAction,
  type AdminColumn,
  type AdminColumnTone,
} from '../AdminTable/AdminTable'
import { Button } from '../Button/Button'
import { CategoryTabs } from '../CategoryTabs/CategoryTabs'
import { ListToolbar } from '../ListToolbar/ListToolbar'
import { RowActions } from '../RowActions/RowActions'
import type { SelectOption } from '../Select/Select'
import styles from './MainVisualList.module.css'

/** 메인 비주얼 한 줄 — 표의 컬럼 순서(순번·이미지·타입·제목·일자·담당자·활성)와 1:1 */
export type MainVisualRow = {
  id: string
  order: number
  /** 썸네일 주소 — 없으면 표가 공용 Placeholder를 그린다 */
  image?: string
  /** 타입 배지 문구 — '히어로' · '서브' */
  type: string
  title: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  active: boolean
}

/** 상단 탭 — 중고 2 / 렌탈 3 / 시공 2 */
export type MainVisualTab = {
  value: string
  label: string
  count?: number
}

/**
 * 섹션 ON/OFF — 기본값은 전부 true.
 * false면 그 영역이 DOM에서 완전히 사라진다(빈 자리·여백·구분선이 남지 않는다).
 * 표의 **열 단위** ON/OFF는 이 객체가 아니라 columnVisibility(AdminTable)로 한다.
 */
export type MainVisualListShow = {
  /** 페이지 헤더 — 타이틀·설명·[+ 등록] */
  header?: boolean
  /** 카테고리 탭(중고/렌탈/시공) */
  tabs?: boolean
  /** 검색·필터·정렬·건수 툴바 */
  toolbar?: boolean
  /** 하단 페이지네이션 + 페이지 크기 */
  pagination?: boolean
  /** 선택 체크박스 열 + 일괄 처리 바 */
  bulk?: boolean
  /** 드래그 핸들 열(순번 변경) */
  reorder?: boolean
  /** 관리 열 — 연필·휴지통(RowActions) */
  rowActions?: boolean
  /**
   * 표 우상단 '컬럼' 피커 버튼.
   * 미지정이면 기존 top-level columnPicker prop을 따른다(기본 false) — 기본 렌더는 바뀌지 않는다.
   */
  columnPicker?: boolean
  /**
   * 표 우상단 '내보내기' 버튼.
   * 이 화면은 원래 내보내기를 쓰지 않으므로 기본은 false다 — 켜야 버튼이 생긴다.
   */
  export?: boolean
}

export type MainVisualListProps = {
  title?: string
  description?: string
  show?: MainVisualListShow

  /** 탭 */
  tabs?: MainVisualTab[]
  tab?: string
  onTabChange?: (value: string) => void

  /** 표 — 이미 걸러진 현재 탭의 행들 */
  rows?: MainVisualRow[]
  /** 타입 배지 톤 — 기본: '히어로'만 primary, 나머지 secondary */
  typeTone?: (row: MainVisualRow) => AdminColumnTone

  /** 툴바 — 상태 필터 */
  statusOptions?: SelectOption[]
  status?: string
  onStatusChange?: (value: string) => void
  /** 툴바 — 제목·문구 검색 */
  keyword?: string
  onKeywordChange?: (value: string) => void
  searchPlaceholder?: string
  /** 툴바 — 정렬 */
  sortOptions?: SelectOption[]
  sort?: string
  onSortChange?: (value: string) => void
  /** 툴바 우측 건수 — 미지정 시 rows.length */
  total?: number

  /** 헤더 우측 등록 버튼 — 라벨은 현재 탭 이름을 물고 온다('중고 메인 비주얼 등록') */
  onCreate?: () => void
  /** 등록 버튼 문구 직접 지정(미지정 시 탭 이름으로 조립) */
  createLabel?: string
  /** 등록 버튼 아이콘 — 없으면 기본 Plus */
  createIcon?: ReactNode

  /** 행 액션 */
  onEdit?: (row: MainVisualRow) => void
  onDelete?: (row: MainVisualRow) => void
  onToggleActive?: (row: MainVisualRow, next: boolean) => void
  /** 드래그로 순번 변경 — 재정렬된 rows 전체를 돌려준다 */
  onReorder?: (rows: MainVisualRow[]) => void

  /** 일괄 처리 */
  selectedIds?: string[]
  onSelectChange?: (ids: string[]) => void
  onBulkDelete?: (ids: string[]) => void
  bulkActions?: AdminBulkAction[]

  /** 페이지네이션 */
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void

  /** 열 단위 ON/OFF — AdminTable의 columnVisibility를 그대로 통과시킨다 */
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (next: Record<string, boolean>) => void
  /** 표 우상단 '컬럼' 피커 버튼 */
  columnPicker?: boolean

  loading?: boolean
  emptyText?: string
  density?: 'comfortable' | 'compact'
}

/** 탭 — 레퍼런스와 같은 결(중고 2 / 렌탈 3 / 시공 2) */
export const MAIN_VISUAL_TABS: MainVisualTab[] = [
  { value: 'used', label: '중고', count: 2 },
  { value: 'rental', label: '렌탈', count: 3 },
  { value: 'build', label: '시공', count: 2 },
]

/** 탭별 목데이터 — 스토리가 탭을 바꾸면 이 표를 갈아 끼운다 */
export const MAIN_VISUAL_ROWS: Record<string, MainVisualRow[]> = {
  used: [
    {
      id: 'mv-used-1',
      order: 1,
      image: mockImage('중고', 'slate'),
      type: '히어로',
      title: '겨울 재고 정리 — 중고 장비 특가전',
      createdAt: '2026-05-12',
      updatedAt: '2026-06-30',
      createdBy: '홍성보',
      updatedBy: '김서연',
      active: true,
    },
    {
      id: 'mv-used-2',
      order: 2,
      image: mockImage('매입', 'sand'),
      type: '히어로',
      title: '검증된 중고 굴착기 상시 매입 안내',
      createdAt: '2026-04-02',
      updatedAt: '2026-04-18',
      createdBy: '박준호',
      updatedBy: '박준호',
      active: false,
    },
  ],
  rental: [
    {
      id: 'mv-rental-1',
      order: 1,
      image: mockImage('렌탈', 'sage'),
      type: '히어로',
      title: '단기 렌탈 3일 무료 체험 이벤트',
      createdAt: '2026-06-01',
      updatedAt: '2026-07-02',
      createdBy: '김서연',
      updatedBy: '홍성보',
      active: true,
    },
    {
      id: 'mv-rental-2',
      order: 2,
      // 썸네일이 없는 행 — 표가 공용 Placeholder를 대신 그린다
      type: '히어로',
      title: '월 렌탈 신규 고객 20% 할인',
      createdAt: '2026-05-21',
      updatedAt: '2026-05-29',
      createdBy: '이지훈',
      updatedBy: '김서연',
      active: true,
    },
    {
      id: 'mv-rental-3',
      order: 3,
      image: mockImage('상담', 'dusk'),
      type: '서브',
      title: '현장 맞춤 장비 렌탈 상담 신청',
      createdAt: '2026-03-14',
      updatedAt: '2026-06-11',
      createdBy: '박준호',
      updatedBy: '이지훈',
      active: false,
    },
  ],
  build: [
    {
      id: 'mv-build-1',
      order: 1,
      image: mockImage('시공', 'slate'),
      type: '히어로',
      title: '시공 실적 500건 돌파 감사 인사',
      createdAt: '2026-02-09',
      updatedAt: '2026-07-01',
      createdBy: '홍성보',
      updatedBy: '홍성보',
      active: true,
    },
    {
      id: 'mv-build-2',
      order: 2,
      image: mockImage('실측', 'sage'),
      type: '서브',
      title: '무료 현장 실측 신청 접수 중',
      createdAt: '2026-01-27',
      updatedAt: '2026-03-03',
      createdBy: '김서연',
      updatedBy: '박준호',
      active: true,
    },
  ],
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
]

const SORT_OPTIONS: SelectOption[] = [
  { value: 'order', label: '순번순' },
  { value: 'latest', label: '최신순' },
  { value: 'title', label: '제목순' },
]

/** 기본 타입 톤 — 히어로만 강조, 나머지는 중립 */
function defaultTypeTone(row: MainVisualRow): AdminColumnTone {
  return row.type === '히어로' ? 'primary' : 'secondary'
}

/**
 * MainVisualList — 메인 비주얼 관리 목록 화면.
 *
 * 골격은 AdminPageLayout(header/tabs/toolbar/content), 조각은
 * CategoryTabs · ListToolbar · AdminTable · RowActions를 그대로 조립한다.
 * 레이아웃·표·툴바를 여기서 다시 짜지 않는다.
 *
 * 모든 섹션은 `show` 하나로 켜고 끈다(기본 전부 ON). 끈 섹션은 통째로 사라진다.
 */
export function MainVisualList({
  title = '메인 비주얼 관리',
  description = '메인 화면 상단에 노출되는 비주얼을 등록하고 순서를 관리합니다.',
  show,
  tabs = MAIN_VISUAL_TABS,
  tab,
  onTabChange,
  rows = MAIN_VISUAL_ROWS.used,
  typeTone = defaultTypeTone,
  statusOptions = STATUS_OPTIONS,
  status = 'all',
  onStatusChange,
  keyword = '',
  onKeywordChange,
  searchPlaceholder = '제목·문구 검색',
  sortOptions = SORT_OPTIONS,
  sort = 'order',
  onSortChange,
  total,
  onCreate,
  createLabel,
  createIcon,
  onEdit,
  onDelete,
  onToggleActive,
  onReorder,
  selectedIds = [],
  onSelectChange,
  onBulkDelete,
  bulkActions = [],
  page,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  columnVisibility,
  onColumnVisibilityChange,
  columnPicker = false,
  loading = false,
  emptyText = '등록된 메인 비주얼이 없습니다.',
  density = 'comfortable',
}: MainVisualListProps) {
  // 기본값 전부 true — 명시적으로 false를 준 섹션만 사라진다
  const showHeader = show?.header !== false
  const showTabs = show?.tabs !== false && tabs.length > 0
  const showToolbar = show?.toolbar !== false
  const showPagination = show?.pagination !== false
  const showBulk = show?.bulk !== false
  const showReorder = show?.reorder !== false
  const showRowActions = show?.rowActions !== false
  // 컬럼 피커는 기존 top-level prop(기본 false)이 기본값이고, 내보내기는 이 화면에 원래 없었다.
  // 둘 다 켤 때만 표에 버튼이 생긴다 — 기본 렌더는 바뀌지 않는다.
  const showColumnPicker = show?.columnPicker ?? columnPicker
  const showExport = show?.export ?? false

  const currentTab = tab ?? tabs[0]?.value ?? ''
  const currentTabLabel = tabs.find((item) => item.value === currentTab)?.label ?? ''

  // '중고 메인 비주얼 등록' — 버튼 문구가 현재 탭을 물고 온다
  const addLabel =
    createLabel ??
    (currentTabLabel !== '' ? `${currentTabLabel} 메인 비주얼 등록` : '메인 비주얼 등록')

  // ── 컬럼 조합 ────────────────────────────────────────────────────────
  // select/drag/actions는 columnVisibility로 끌 수 없는 kind라 show 키가 직접 넣고 뺀다.
  const columns: AdminColumn<MainVisualRow>[] = []

  if (showBulk) columns.push({ kind: 'select', key: 'select' })
  if (showReorder) columns.push({ kind: 'drag', key: 'drag' })

  columns.push(
    { kind: 'index', key: 'order', header: '순번' },
    { kind: 'thumbnail', key: 'image', header: '이미지' },
    { kind: 'type', key: 'type', header: '타입', tone: typeTone },
    // 제목은 좁아져도 줄바꿈 없이 말줄임(AdminTable .title)
    { kind: 'title', key: 'title', header: '제목', onClick: onEdit },
    { kind: 'date', key: 'createdAt', header: '등록일' },
    { kind: 'date', key: 'updatedAt', header: '수정일' },
    { kind: 'user', key: 'createdBy', header: '등록자' },
    { kind: 'user', key: 'updatedBy', header: '수정자' },
    { kind: 'status', key: 'active', header: '활성화' },
  )

  if (showRowActions) {
    columns.push({
      kind: 'actions',
      key: 'actions',
      header: '관리',
      // 표 기본 액션 대신 공용 RowActions를 쓴다 — 아이콘·툴팁·전파 차단이 한 곳에 있다
      render: (row) => (
        <RowActions
          size="sm"
          onEdit={() => onEdit?.(row)}
          onDelete={() => onDelete?.(row)}
          labels={{ edit: `${row.title} 수정`, delete: `${row.title} 삭제` }}
        />
      ),
    })
  }

  return (
    <AdminPageLayout
      title={showHeader ? title : undefined}
      description={showHeader ? description : undefined}
      headerActions={
        showHeader ? (
          <Button
            variant="primary"
            size="md"
            label={addLabel}
            showLeftIcon
            leftIcon={createIcon ?? <Plus size={16} />}
            onClick={onCreate}
          />
        ) : undefined
      }
      tabs={
        showTabs ? (
          <CategoryTabs items={tabs} value={currentTab} onChange={onTabChange} addable={false} />
        ) : undefined
      }
      toolbar={
        showToolbar ? (
          <ListToolbar
            selects={[
              {
                key: 'status',
                value: status,
                options: statusOptions,
                onChange: (value) => onStatusChange?.(value),
              },
            ]}
            search={{
              value: keyword,
              onChange: (value) => onKeywordChange?.(value),
              placeholder: searchPlaceholder,
            }}
            sort={{ value: sort, options: sortOptions, onChange: (value) => onSortChange?.(value) }}
            total={total ?? rows.length}
          />
        ) : undefined
      }
    >
      <div className={styles.list}>
        <AdminTable<MainVisualRow>
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          density={density}
          loading={loading}
          emptyText={emptyText}
          onToggleStatus={(row, next) => onToggleActive?.(row, next)}
          onReorder={showReorder ? onReorder : undefined}
          selectedIds={showBulk ? selectedIds : undefined}
          onSelectChange={showBulk ? onSelectChange : undefined}
          onBulkDelete={showBulk ? onBulkDelete : undefined}
          bulkActions={showBulk ? bulkActions : []}
          page={showPagination ? page : undefined}
          totalPages={showPagination ? totalPages : undefined}
          onPageChange={showPagination ? onPageChange : undefined}
          pageSize={showPagination ? pageSize : undefined}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={showPagination ? onPageSizeChange : undefined}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
          // 이 화면의 컬럼 피커는 원래 툴바와 독립이었다(표 우상단) — 기존 동작을 그대로 둔다
          columnPicker={showColumnPicker}
          exportable={showExport}
          exportFilename="메인비주얼"
        />

        {/* 드래그가 실제로 동작할 때만 안내를 남긴다 — 꺼져 있으면 자리도 없다 */}
        {showReorder && onReorder != null && rows.length > 1 && (
          <p className={styles.hint}>
            <span className={styles.hintIcon} aria-hidden="true">
              <GripVertical size={14} />
            </span>
            핸들을 드래그하거나 화살표 키로 순번을 바꿉니다.
          </p>
        )}
      </div>
    </AdminPageLayout>
  )
}
