import { useState } from 'react'
import type { ReactNode } from 'react'
import { AdminListPage } from '../AdminListPage/AdminListPage'
import type { AdminColumn, AdminColumnTone } from '../AdminTable/AdminTable'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import { RowActions } from '../RowActions/RowActions'
import type { SelectOption } from '../Select/Select'
import styles from './InquiryManageList.module.css'

/** 챗봇으로 접수된 시공 문의의 처리 상태 */
export type InquiryManageStatus = 'pending' | 'answered' | 'hold'

/** 탭 값 — 상태 3종 + '전체' */
export type InquiryManageTab = 'all' | InquiryManageStatus

export type InquiryManageRow = {
  id: string
  /** 화면에 찍히는 순번(목록 정렬과 무관하게 접수 번호를 그대로 보여준다) */
  no: number
  applicant: string
  phone: string
  email: string
  /** YYYY-MM-DD */
  appliedAt: string
  status: InquiryManageStatus
}

/**
 * 섹션·요소 ON/OFF — 기본값은 전부 true.
 * false면 그 영역이 DOM에서 통째로 사라진다(빈 자리·여백·구분선이 남지 않는다).
 * 열 단위 ON/OFF는 여기가 아니라 AdminTable의 columnVisibility로 한다.
 */
export type InquiryManageListShow = {
  /** 페이지 헤더(타이틀·설명·액션) */
  header?: boolean
  /** 상태 탭(전체/대기중/답변완료/보류) */
  tabs?: boolean
  /** 검색·정렬·건수 툴바 — false면 아래 search/sort/total도 함께 사라진다 */
  toolbar?: boolean
  /** 툴바 안 검색 입력 */
  search?: boolean
  /** 툴바 안 정렬 Select */
  sort?: boolean
  /** 툴바 안 "N건" */
  total?: boolean
  /** 페이지네이션 — false면 걸러진 행을 한 번에 모두 보여준다 */
  pagination?: boolean
  /** 선택 체크박스 + 일괄 처리 바 */
  bulk?: boolean
  /** 표의 '관리' 열(눈=상세보기 / 휴지통=삭제) */
  rowActions?: boolean
}

export type InquiryManageListProps = {
  rows: InquiryManageRow[]
  show?: InquiryManageListShow
  title?: string
  description?: string
  /** 헤더 우측 액션(엑셀 다운로드 등) */
  headerActions?: ReactNode
  searchPlaceholder?: string
  /** 정렬 옵션 — 미지정 시 최신순/오래된순/신청자순 */
  sortOptions?: SelectOption[]
  /** 초기 정렬 값. 기본 'latest' */
  defaultSort?: string
  /** 한 페이지 행 수. 기본 10 */
  pageSize?: number
  /** 표시할 컬럼(key → boolean). 미지정 키는 표시 */
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (next: Record<string, boolean>) => void
  /** 표 우상단 '컬럼' 피커 버튼. 기본 false */
  columnPicker?: boolean
  loading?: boolean
  emptyText?: string
  /** 눈 아이콘 · 신청자 클릭 — 상세보기 */
  onView?: (row: InquiryManageRow) => void
  /** 휴지통 아이콘 — 단건 삭제 */
  onDelete?: (row: InquiryManageRow) => void
  /** 일괄 삭제(bulk가 켜져 있을 때만 호출된다) */
  onBulkDelete?: (ids: string[]) => void
  onTabChange?: (tab: InquiryManageTab) => void
  onSearch?: (keyword: string) => void
  onSortChange?: (sort: string) => void
  onPageChange?: (page: number) => void
  onSelectChange?: (ids: string[]) => void
}

/** 상태 → 배지 문구 */
const STATUS_LABEL: Record<InquiryManageStatus, string> = {
  pending: '대기중',
  answered: '답변완료',
  hold: '보류',
}

/** 상태 → 배지 톤(AdminTable badge는 soft로 그린다) */
const STATUS_TONE: Record<InquiryManageStatus, AdminColumnTone> = {
  pending: 'error',
  answered: 'success',
  hold: 'warning',
}

/** 탭 순서 — 전체 뒤로 상태 3종. 건수는 셸이 matchesTab으로 rows에서 센다 */
const TAB_ORDER: InquiryManageStatus[] = ['pending', 'answered', 'hold']

const TAB_ITEMS: CategoryTabItem[] = [
  { value: 'all', label: '전체', fixed: true },
  ...TAB_ORDER.map((status) => ({ value: status, label: STATUS_LABEL[status], fixed: true })),
]

function matchesTab(row: InquiryManageRow, tab: string): boolean {
  return tab === 'all' || row.status === tab
}

const DEFAULT_SORT_OPTIONS: SelectOption[] = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'name', label: '신청자순' },
]

const DEFAULT_PAGE_SIZE = 10

/** 숫자만 남긴다 — '010-1234-5678'을 '01012345678'로 검색할 수 있게 */
function digits(value: string): string {
  return value.replace(/\D/g, '')
}

/** 신청자·연락처·이메일 어느 쪽이든 걸리면 통과 */
function matchesKeyword(row: InquiryManageRow, keyword: string): boolean {
  const needle = keyword.toLowerCase()

  const digitNeedle = digits(needle)
  if (digitNeedle !== '' && digits(row.phone).includes(digitNeedle)) return true

  return (
    row.applicant.toLowerCase().includes(needle) ||
    row.phone.toLowerCase().includes(needle) ||
    row.email.toLowerCase().includes(needle)
  )
}

/** 툴바 [최신순 ▾]의 정렬 — sort가 null(정렬 Select가 꺼진 상태)이면 원본 순서 그대로 */
function orderRows(rows: InquiryManageRow[], sort: string | null): InquiryManageRow[] {
  if (sort == null) return rows
  return [...rows].sort((a, b) => {
    if (sort === 'oldest') return a.appliedAt.localeCompare(b.appliedAt)
    if (sort === 'name') return a.applicant.localeCompare(b.applicant, 'ko')
    // latest — 같은 날짜면 순번이 큰 쪽(나중 접수)이 위로
    const byDate = b.appliedAt.localeCompare(a.appliedAt)
    return byDate !== 0 ? byDate : b.no - a.no
  })
}

/**
 * 시공 문의 내역 — 챗봇으로 접수된 신청 내역을 조회·관리한다.
 *
 * 화면 골격(헤더·탭·툴바·표·페이징·선택·일괄 처리)은 전부 AdminListPage(공용 셸)가 갖는다.
 * 이 파일에 남는 건 이 화면만의 것뿐이다 —
 *   1) 컬럼      : (체크박스)·순번·신청자·연락처·이메일·신청일·상태·관리(눈/휴지통)
 *   2) 상태 축   : pending/answered/hold 의 라벨·톤·탭, 최신순/오래된순/신청자순 정렬
 *   3) 한국어 문구: 타이틀·설명·검색 placeholder·빈 상태
 *
 * 문의 게시판(InquiryBoard)·문의 목록(InquiryList)과는 다른 화면이다.
 */
export function InquiryManageList({
  rows,
  show = {},
  title = '시공 문의 내역',
  description = '시공 문의 챗봇을 통해 접수된 신청 내역을 조회·관리합니다.',
  headerActions,
  searchPlaceholder = '신청자, 연락처, 이메일로 검색',
  sortOptions = DEFAULT_SORT_OPTIONS,
  defaultSort = 'latest',
  pageSize = DEFAULT_PAGE_SIZE,
  columnVisibility,
  onColumnVisibilityChange,
  columnPicker = false,
  loading = false,
  emptyText = '접수된 시공 문의가 없습니다.',
  onView,
  onDelete,
  onBulkDelete,
  onTabChange,
  onSearch,
  onSortChange,
  onPageChange,
  onSelectChange,
}: InquiryManageListProps) {
  // 셸의 show로 그대로 넘기지 못하는 두 축만 먼저 푼다 — 정렬 Select(셸엔 없는 축)와 체크박스 열
  const { toolbar = true, sort = true, bulk = true } = show

  // 정렬 Select — 셸에는 '초기 정렬값' 규격이 없다(첫 옵션으로 시작한다).
  // defaultSort를 지키려면 값은 여기서 들고 있어야 한다(변경 시 페이지 되돌리기는 셸이 한다).
  const [sortValue, setSortValue] = useState(defaultSort)
  // 툴바나 정렬 Select가 꺼지면 정렬 자체가 사라진다 — 보이지 않는 정렬로 순서를 바꾸지 않는다
  const sortable = toolbar && sort

  /*
   * 페이지 크기는 이 화면에서 고정이다 — 원래 '20개씩' Select가 없던 목록이라
   * 셸의 show.pageSize=false로 그 컨트롤만 끈다(페이지네이션은 그대로 둔다).
   * 크기 Select가 없으니 크기를 되받을 상태도, 옵션 배열도 필요 없다 — pageSize만 넘긴다.
   */

  const columns: AdminColumn<InquiryManageRow>[] = []

  // 체크박스 열 — show.bulk가 꺼지면 열 자체가 없다(셸의 show.bulk는 하단 일괄 바만 담당한다)
  if (bulk) columns.push({ kind: 'select', key: 'select' })

  columns.push(
    { kind: 'index', key: 'no', header: '순번' },
    {
      kind: 'title',
      key: 'applicant',
      header: '신청자',
      ratio: 1.2,
      // 신청자는 이 표의 이름 열 — 굵게 강조하고 좁아지면 말줄임
      render: (row) => (
        <span className={styles.applicant} title={row.applicant}>
          {row.applicant}
        </span>
      ),
      onClick: onView,
    },
    {
      kind: 'text',
      key: 'phone',
      header: '연락처',
      ratio: 1,
      render: (row) => <span className={styles.phone}>{row.phone}</span>,
    },
    { kind: 'text', key: 'email', header: '이메일', ratio: 1.8 },
    // 정렬은 툴바 [최신순 ▾]이 단일 소스다 — 표 헤더 정렬을 함께 열면
    // 페이지에 잘린 행만 다시 정렬돼 순서가 거짓말이 된다
    { kind: 'date', key: 'appliedAt', header: '신청일' },
    {
      kind: 'badge',
      key: 'status',
      header: '상태',
      value: (row) => STATUS_LABEL[row.status],
      tone: (row) => STATUS_TONE[row.status],
    },
    {
      // show.rowActions가 꺼지면 셸이 이 열만 빼 준다
      kind: 'actions',
      key: 'manage',
      header: '관리',
      // 기본 actions 셀은 [연필][휴지통]이다 — 이 화면은 [눈][휴지통]이라 RowActions로 갈아끼운다
      render: (row) => (
        <RowActions
          size="sm"
          onView={onView != null ? () => onView(row) : undefined}
          onDelete={onDelete != null ? () => onDelete(row) : undefined}
          labels={{
            view: `${row.applicant} 상세보기`,
            delete: `${row.applicant} 삭제`,
          }}
        />
      ),
    },
  )

  /*
   * 열 표시 상태는 셸이 갖는다 — columnVisibility/onColumnVisibilityChange를 AdminListPage가
   * AdminTable로 그대로 통과시킨다. 그래서 여기서 컬럼 배열을 미리 거르지 않는다.
   * (걸러 버리면 표 우상단 [컬럼] 피커가 그 열을 아예 모르게 돼 다시 켤 수 없다.)
   */

  return (
    <AdminListPage
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      loading={loading}
      title={title}
      description={description}
      headerActions={headerActions}
      tabs={TAB_ITEMS}
      onTabChange={(value) => onTabChange?.(value as InquiryManageTab)}
      matchTab={matchesTab}
      search="inline"
      searchPlaceholder={searchPlaceholder}
      matchKeyword={matchesKeyword}
      // 이 화면의 onSearch는 한 글자마다 나간다(엔터 확정이 아니다) — 검색어 축을 그대로 흘린다
      onKeywordChange={(value) => onSearch?.(value)}
      // 레퍼런스 표기는 접두사 없는 "3건" — 셸 기본값('총')을 빈 문자열로 지운다
      totalLabel=""
      sortOptions={sortable ? sortOptions : []}
      sort={sortable ? sortValue : undefined}
      onSortChange={(value) => {
        setSortValue(value)
        onSortChange?.(value)
      }}
      orderRows={orderRows}
      onSelectChange={onSelectChange}
      onBulkDelete={onBulkDelete}
      onPageChange={onPageChange}
      pageSize={pageSize}
      columnPicker={columnPicker}
      // 열 ON/OFF는 셸 → AdminTable로 그대로 내려간다(피커에서 다시 켤 수 있다)
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      // 이 화면엔 표 우상단 CSV/Excel이 없다(내보내기는 headerActions로 붙인다)
      exportable={false}
      emptyText={emptyText}
      show={{
        header: show.header,
        tabs: show.tabs,
        toolbar: show.toolbar,
        search: show.search,
        count: show.total,
        pagination: show.pagination,
        // 이 화면엔 원래 '20개씩' 페이지 크기 Select가 없다 — 페이지네이션만 두고 크기 선택은 끈다
        pageSize: false,
        bulk: show.bulk,
        rowActions: show.rowActions,
      }}
    />
  )
}
