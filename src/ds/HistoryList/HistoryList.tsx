import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { AdminListPage, type AdminListRowContext } from '../AdminListPage/AdminListPage'
import type { AdminColumn } from '../AdminTable/AdminTable'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import { RowActions } from '../RowActions/RowActions'
import type { SelectOption } from '../Select/Select'

/*
 * HistoryList — '연혁 관리'(어드민). 고객용 화면은 HistoryPage(+EraTimeline)다.
 *
 * 고객 화면은 연도로 묶인 그룹(HistoryGroup)이지만, 관리 화면의 단위는 '연혁 한 줄'이다 —
 * 등록·수정·삭제·노출이 항목 단위로 일어나기 때문이다. 연도는 행이 들고 있고,
 * 그룹핑(연도 → EraTimeline 칸)은 고객 화면이 저장된 행을 읽어 만든다.
 * 그래서 행 타입(HistoryRow)은 HistoryGroup.year + HistoryItem(month·title·description) +
 * 그룹의 대표 이미지(image) + 운영 축(노출·등록일)을 한 줄로 편 모양이다.
 *
 * 골격(헤더·탭·툴바·검색·표·선택·일괄 처리·페이지네이션·삭제 확인창)은 AdminListPage 셸이 갖는다.
 * 이 파일에 남는 건 컬럼 · 상태 축(노출/숨김) · 정렬 · 한국어 문구뿐이다(NoticeBoard와 같은 결).
 */

/** 연혁 한 줄 — 고객 화면(HistoryPage)의 HistoryGroup.year + HistoryItem을 편 것 */
export type HistoryRow = {
  id: string
  /** '2019'처럼 연도만. 고객 화면에서 같은 연도끼리 한 칸(연대)으로 묶인다 */
  year: string
  /** '5월'처럼 사람이 읽는 문자열. 없으면 연도만 표기된다 */
  month?: string
  title: string
  description?: string
  /** 그 연대의 대표 이미지 — 없으면 표·고객 화면 모두 대체 그림이 뜬다 */
  image?: string
  /** 노출 여부 — 끄면 고객 화면 연혁에서 이 줄이 빠진다 */
  visible: boolean
  createdAt: string
}

/** 탭 — 전체 + 노출 상태 2종 */
export type HistoryTabKey = 'all' | 'visible' | 'hidden'

/** 정렬 축 — 최신순(등록일) / 연도순(연·월) */
export type HistorySortKey = 'recent' | 'year'

/**
 * 요소 ON/OFF — 전부 기본 true(오너 확정 규약, 키마다 `?? true`).
 * false면 그 요소가 DOM에서 통째로 사라진다(빈 자리·여백·구분선이 남지 않는다).
 */
export type HistoryListShow = {
  /** 페이지 헤더(타이틀·설명·[연혁 등록]) */
  header?: boolean
  /** 상태 탭(전체·노출·숨김) */
  tabs?: boolean
  /** 흰 카드 툴바(검색·정렬·건수) */
  toolbar?: boolean
  /** 툴바 안 제목 검색 */
  search?: boolean
  /** 툴바 안 '총 N건' */
  count?: boolean
  /** 표 하단 페이지네이션 + 페이지 크기 */
  pagination?: boolean
  /** 선택 체크박스 + 선택 일괄 삭제 바 */
  bulk?: boolean
  /** 행의 관리(수정·삭제) 컬럼 */
  rowActions?: boolean
  /** 표 우상단 '컬럼' 피커 */
  columnPicker?: boolean
  /** 표 우상단 내보내기 */
  export?: boolean
}

export type HistoryListProps = {
  rows: HistoryRow[]
  /** 서버 페이징 시 전체 건수 — 없으면 걸러진 rows 길이를 쓴다 */
  total?: number
  loading?: boolean
  show?: HistoryListShow
  density?: 'compact' | 'comfortable'

  /* ── 액션 — 넘긴 것만 화면에 생긴다 ── */
  /** 있으면 헤더 우측 [연혁 등록] */
  onCreate?: () => void
  /** 제목 클릭 — 상세/수정으로 이동 */
  onRowOpen?: (row: HistoryRow) => void
  onEdit?: (row: HistoryRow) => void
  /** 행 삭제와 선택 일괄 삭제가 함께 부른다(항상 id 배열, 확인창을 거친 뒤에만) */
  onDelete?: (ids: string[]) => void
  /** 행 안의 노출 토글 */
  onToggleVisible?: (row: HistoryRow, next: boolean) => void

  /* ── 문구 — 기본값이 있고 전부 교체 가능하다 ── */
  title?: string
  description?: string
  createLabel?: string
  searchPlaceholder?: string
  emptyText?: string
  exportFilename?: string
  /** 탭 라벨 — 넘긴 키만 기본 문구를 덮어쓴다 */
  tabLabels?: Partial<Record<HistoryTabKey, string>>
  /** 정렬 후보 — value는 HistorySortKey와 맞춰야 정렬이 동작한다 */
  sortOptions?: SelectOption[]
  /** 삭제 확인창 문구 */
  deleteTitle?: string
  deleteDescription?: (ids: string[]) => string

  /* ── 아이콘 슬롯 — 없으면 기본 lucide 아이콘 ── */
  /** 등록 버튼 (기본 Plus) */
  createIcon?: ReactNode
}

const DEFAULT_TAB_LABEL: Record<HistoryTabKey, string> = {
  all: '전체',
  visible: '노출',
  hidden: '숨김',
}

const TAB_ORDER: HistoryTabKey[] = ['all', 'visible', 'hidden']

/** 툴바 정렬 — 연혁은 '언제 등록했나'보다 '언제 있었던 일인가'가 자주 쓰인다 */
const SORT_OPTIONS: SelectOption[] = [
  { value: 'recent', label: '최신순' },
  { value: 'year', label: '연도순' },
]

/** show 기본값 — 전부 true. 스프레드로 합치면 명시적 undefined가 기본값을 덮으므로 키마다 ?? true */
function resolveShow(show: HistoryListShow = {}): Required<HistoryListShow> {
  return {
    header: show.header ?? true,
    tabs: show.tabs ?? true,
    toolbar: show.toolbar ?? true,
    search: show.search ?? true,
    count: show.count ?? true,
    pagination: show.pagination ?? true,
    bulk: show.bulk ?? true,
    rowActions: show.rowActions ?? true,
    columnPicker: show.columnPicker ?? true,
    export: show.export ?? true,
  }
}

function matchesTab(row: HistoryRow, tab: string): boolean {
  if (tab === 'all') return true
  return tab === 'visible' ? row.visible : !row.visible
}

/** 검색 대상 — 제목 한 축뿐이다(연도·월은 정렬·탭이 담당한다) */
function matchesKeyword(row: HistoryRow, keyword: string): boolean {
  return row.title.toLowerCase().includes(keyword.toLowerCase())
}

/** '5월' → 5. 월이 없거나 숫자가 아니면 0(연도만 있는 줄은 그 해의 맨 뒤로) */
function monthNumber(month?: string): number {
  const parsed = Number.parseInt(month ?? '', 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * 화면 순서 — 셸이 탭·검색으로 거른 뒤, 페이지로 자르기 전에 부른다.
 *   year   : 최근 연도 → 같은 해면 늦은 달이 위(연혁은 최근이 먼저 읽힌다)
 *   recent : 등록일 내림차순('YYYY-MM-DD'는 사전순 비교로 충분하다)
 */
function orderRows(rows: HistoryRow[], sort: string | null): HistoryRow[] {
  const next = [...rows]
  if (sort === 'year') {
    return next.sort(
      (a, b) => b.year.localeCompare(a.year) || monthNumber(b.month) - monthNumber(a.month),
    )
  }
  return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/**
 * HistoryList — 연혁 관리 화면(AdminListPage 프리셋).
 *
 *   header  : 타이틀 · 설명 · [연혁 등록]
 *   tabs    : 전체 / 노출 / 숨김 — 건수는 셸이 matchTab으로 rows에서 센다
 *   toolbar : 제목 검색 · 정렬(최신순/연도순) · 총 N건
 *   content : 표 — 순번 · 연도 · 월 · 제목 · 설명 · 대표 이미지 · 노출(토글) · 등록일 · 관리
 *   dialog  : 삭제 확인(선택 일괄 삭제 · 행 삭제가 같은 창을 쓴다)
 *
 * 탭 필터·검색·정렬·페이징·선택은 전부 셸의 축이다 — 이 파일은 rows를 그대로 넘긴다.
 */
export function HistoryList({
  rows,
  total,
  loading = false,
  show,
  density = 'compact',
  onCreate,
  onRowOpen,
  onEdit,
  onDelete,
  onToggleVisible,
  title = '연혁 관리',
  description = '연도별 연혁의 노출 여부와 대표 이미지를 관리합니다.',
  createLabel = '연혁 등록',
  searchPlaceholder = '제목 검색',
  emptyText = '등록된 연혁이 없습니다.',
  exportFilename = '연혁목록',
  tabLabels,
  sortOptions = SORT_OPTIONS,
  deleteTitle = '선택한 연혁을 삭제할까요?',
  deleteDescription = (ids) => `연혁 ${ids.length}건이 목록에서 제거됩니다.`,
  createIcon,
}: HistoryListProps) {
  const on = resolveShow(show)

  const tabs: CategoryTabItem[] = TAB_ORDER.map((key) => ({
    label: tabLabels?.[key] ?? DEFAULT_TAB_LABEL[key],
    value: key,
    fixed: true,
  }))

  /*
   * 컬럼 — 삭제는 셸의 확인창을 거쳐야 하므로 ctx.confirmDelete로 부른다
   * (RowActions.onDelete를 onDelete에 직접 물리면 확인 없이 지워진다).
   */
  const columns = (ctx: AdminListRowContext): AdminColumn<HistoryRow>[] => [
    { kind: 'select', key: 'select', pinned: 'left' },
    { kind: 'index', key: 'index', header: '순번' },
    { kind: 'text', key: 'year', header: '연도', ratio: 1, sortable: true },
    { kind: 'text', key: 'month', header: '월', ratio: 1, value: (row) => row.month ?? '-' },
    { kind: 'title', key: 'title', header: '제목', ratio: 3, sortable: true },
    {
      kind: 'text',
      key: 'description',
      header: '설명',
      ratio: 3,
      value: (row) => row.description ?? '-',
    },
    // 썸네일·플레이스홀더 폴백은 AdminTable이 갖는다 — 여기서 <img>를 다시 만들지 않는다
    { kind: 'thumbnail', key: 'image', header: '대표 이미지' },
    {
      kind: 'status',
      key: 'visible',
      header: '노출',
      // 토글의 값은 visible 하나뿐이다 — 파생 상태를 따로 두면 두 값이 어긋난다
      value: (row) => row.visible,
    },
    { kind: 'date', key: 'createdAt', header: '등록일', sortable: true },
    {
      kind: 'actions',
      key: 'actions',
      header: '관리',
      render: (row) => (
        <RowActions
          size="sm"
          onEdit={onEdit == null ? undefined : () => onEdit(row)}
          onDelete={onDelete == null ? undefined : () => ctx.confirmDelete([row.id])}
          labels={{ edit: `${row.title} 수정`, delete: `${row.title} 삭제` }}
        />
      ),
    },
  ]

  return (
    <AdminListPage<HistoryRow>
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      total={total}
      loading={loading}
      title={title}
      description={description}
      onCreate={onCreate}
      createLabel={createLabel}
      createIcon={createIcon ?? <Plus size={16} aria-hidden="true" />}
      tabs={tabs}
      matchTab={matchesTab}
      // 검색은 툴바 한 줄(inline) — 조건이 제목 하나뿐이라 상단 검색 패널을 세울 이유가 없다
      search="inline"
      searchPlaceholder={searchPlaceholder}
      matchKeyword={matchesKeyword}
      sortOptions={sortOptions}
      orderRows={orderRows}
      onRowOpen={onRowOpen}
      onToggleStatus={onToggleVisible}
      // 선택 일괄 삭제 — 표 하단 [선택 삭제]와 행 관리의 삭제가 같은 확인창을 지난다
      onBulkDelete={onDelete}
      deleteConfirm={{ title: deleteTitle, description: deleteDescription }}
      emptyText={emptyText}
      exportFilename={exportFilename}
      density={density}
      show={{
        header: on.header,
        tabs: on.tabs,
        toolbar: on.toolbar,
        search: on.search,
        count: on.count,
        pagination: on.pagination,
        bulk: on.bulk,
        rowActions: on.rowActions,
        columnPicker: on.columnPicker,
        export: on.export,
      }}
    />
  )
}
