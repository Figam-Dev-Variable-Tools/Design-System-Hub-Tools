import type { ReactNode } from 'react'
import { Download, SlidersHorizontal } from 'lucide-react'
import { AdminListPage } from '../AdminListPage/AdminListPage'
import type { AdminColumn, AdminColumnTone } from '../AdminTable/AdminTable'
import { Button } from '../Button/Button'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import styles from './CustomerList.module.css'

/** 고객 한 명 — 표 한 행 */
export type CustomerRow = {
  id: string
  nickname: string
  /** 연락처 — 닉네임 아래 둘째 줄 */
  phone: string
  /** 계정(이메일) — 링크 톤 + mailto */
  email: string
  /** 회원 유형 — '일반회원' | '아티스트회원' (문자열이므로 유형을 늘려도 깨지지 않는다) */
  memberType: string
  /** 가입 경로 — '이메일' | '카카오' … */
  joinPath: string
  /** 가입일 — 'YYYY-MM-DD' */
  joinedAt: string
  orderCount: number
  /** 누적 구매금액(원) */
  totalPurchase: number
  memo?: string
}

/** 상태 탭 한 칸 — count를 주지 않으면 rows에서 센다 */
export type CustomerListTab = {
  value: string
  label: string
  count?: number
}

/**
 * 섹션·요소 ON/OFF — 기본값은 전부 true.
 * false면 그 영역이 DOM에서 완전히 사라진다(빈 자리·여백·구분선이 남지 않는다).
 * 열 단위 ON/OFF는 여기가 아니라 AdminTable의 columnVisibility가 담당한다.
 */
export type CustomerListShow = {
  /** 페이지 헤더 — 타이틀 · 설명 · [엑셀 다운로드] */
  header?: boolean
  /** 회원 유형 탭 — 전체 / 일반회원 / 아티스트회원 */
  tabs?: boolean
  /** 흰 카드 툴바 — 검색 · 건수 · 필터 (아래 search/filter의 부모다) */
  toolbar?: boolean
  /** 툴바 안 검색 입력 */
  search?: boolean
  /** 툴바 안 필터 아이콘 버튼 */
  filter?: boolean
  /** 표 하단 페이지네이션 + 페이지 크기 — false면 필터된 행을 자르지 않고 전부 그린다 */
  pagination?: boolean
}

export type CustomerListProps = {
  rows: CustomerRow[]

  title?: string
  description?: string

  /* ── 문구 — 같은 화면을 다른 도메인(고객/파트너/작가)에 쓸 때 라벨만 갈아끼운다 ── */
  /** 헤더 우측 내보내기 버튼 라벨 */
  exportLabel?: string
  /** 툴바 검색 입력 placeholder */
  searchPlaceholder?: string
  /** 툴바 우측 건수 단위 — '5명' / '5건' */
  countUnit?: string

  /* ── 아이콘 슬롯 — 프로덕트마다 아이콘 세트가 달라 lucide 기본값만 갈아끼우게 연다 ── */
  /** [엑셀 다운로드] 버튼 아이콘 */
  exportIcon?: ReactNode
  /** [필터] 버튼 아이콘 */
  filterIcon?: ReactNode

  /** 탭 목록 — 미지정 시 전체 / 일반회원 / 아티스트회원 */
  tabs?: CustomerListTab[]
  /** 선택된 탭 — 주지 않으면 컴포넌트가 내부 상태로 관리한다(비제어) */
  tabValue?: string
  onTabChange?: (value: string) => void

  /** 검색어 — 주지 않으면 내부 상태(비제어). 입력 즉시 rows를 좁힌다 */
  keyword?: string
  onKeywordChange?: (keyword: string) => void
  /** 필터 아이콘 버튼 */
  onFilter?: () => void
  /** 헤더 우측 [엑셀 다운로드] */
  onExport?: () => void

  /** 닉네임 클릭 — 없으면 닉네임이 버튼이 아니라 텍스트가 된다 */
  onOpen?: (row: CustomerRow) => void
  onMemoChange?: (row: CustomerRow, memo: string) => void

  /** 회원 유형 배지 톤 — 미지정 시 아티스트회원=primary / 그 외=secondary */
  memberTypeTone?: (row: CustomerRow) => AdminColumnTone

  /** 열 표시 여부(컬럼 key → boolean). 미지정 시 AdminTable이 내부 상태로 관리 */
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (next: Record<string, boolean>) => void
  /** 표 우상단 '컬럼' 피커 — 기본 true */
  columnPicker?: boolean

  /** 페이지 — 주지 않으면 내부 상태(비제어) */
  page?: number
  onPageChange?: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]

  loading?: boolean
  emptyText?: string
  density?: 'compact' | 'comfortable'

  show?: CustomerListShow
}

/** '전체' 탭 — 유형으로 거르지 않는다 */
const ALL_TAB = 'all'

const DEFAULT_TABS: CustomerListTab[] = [
  { value: ALL_TAB, label: '전체' },
  { value: '일반회원', label: '일반회원' },
  { value: '아티스트회원', label: '아티스트회원' },
]

const PAGE_SIZE_OPTIONS = [20, 50, 100]

/** 회원 유형 톤 — 아티스트만 강조색, 일반은 조용한 회색 */
function defaultMemberTypeTone(row: CustomerRow): AdminColumnTone {
  return row.memberType === '아티스트회원' ? 'primary' : 'secondary'
}

/** 검색 비교용 정규화 — 연락처는 하이픈을 지워야 '01048'로도 잡힌다 */
function normalize(value: string): string {
  return value.toLowerCase().replace(/-/g, '')
}

/** 1,284,000원 — 통화 기호 없이 '원'만(레퍼런스 표기) */
function formatKrw(value: number): string {
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

/** 탭 필터 — '전체'는 거르지 않는다 */
function matchesTab(row: CustomerRow, tab: string): boolean {
  return tab === ALL_TAB || row.memberType === tab
}

/** 검색 — 닉네임 · 계정 · 연락처 */
function matchesKeyword(row: CustomerRow, keyword: string): boolean {
  const query = normalize(keyword)
  return [row.nickname, row.email, row.phone].some((field) => normalize(field).includes(query))
}

/**
 * 고객 목록 화면 — 골격은 전부 AdminListPage(공용 셸)가 갖는다.
 *
 *   header  : '고객 목록' + 설명 + [엑셀 다운로드]      (show.header)
 *   tabs    : 전체 5 / 일반회원 2 / 아티스트회원 3      (show.tabs)
 *   toolbar : 검색 ····· "5명" + [필터]                 (show.toolbar / .search / .filter)
 *   content : AdminTable — 닉네임·연락처 / 이메일 / 회원 유형 / 가입 경로 / 가입일 / 주문 / 누적 구매금액 / 메모
 *
 * 탭·검색·페이지·건수는 셸이 굴린다(matchTab·matchKeyword만 넘긴다).
 * 이 파일에 남는 건 이 화면만의 것뿐이다 — 컬럼, 유형 톤, 한국어 문구, [필터] 버튼.
 */
export function CustomerList({
  rows,
  title = '고객 목록',
  description = '가입한 일반회원·아티스트회원을 조회하고 메모를 관리합니다.',
  exportLabel = '엑셀 다운로드',
  searchPlaceholder = '닉네임 · 계정 · 연락처로 검색',
  countUnit = '명',
  exportIcon,
  filterIcon,
  tabs = DEFAULT_TABS,
  tabValue,
  onTabChange,
  keyword,
  onKeywordChange,
  onFilter,
  onExport,
  onOpen,
  onMemoChange,
  memberTypeTone = defaultMemberTypeTone,
  columnVisibility,
  onColumnVisibilityChange,
  columnPicker = true,
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  loading = false,
  emptyText = '조회된 고객이 없습니다.',
  density = 'compact',
  show,
}: CustomerListProps) {
  // [필터]는 이 화면만의 툴바 액션이다 — 셸의 show에는 없는 축이라 여기서 푼다(기본 ON)
  const showFilter = show?.filter ?? true

  // 탭 건수는 셸이 matchesTab으로 rows에서 센다 — count를 주면 그 값(서버 총계)이 이긴다
  const tabItems: CategoryTabItem[] = tabs.map((item) => ({ ...item, fixed: true }))

  const columns: AdminColumn<CustomerRow>[] = [
    {
      kind: 'title',
      key: 'nickname',
      header: '닉네임 · 연락처',
      ratio: 3,
      sortable: true,
      // 정렬 키는 닉네임 — 표시는 2줄(닉네임 + 연락처)
      value: (row) => row.nickname,
      render: (row) => (
        <span className={styles.person}>
          {onOpen != null ? (
            <button type="button" className={styles.name} onClick={() => onOpen(row)} title={row.nickname}>
              {row.nickname}
            </button>
          ) : (
            <span className={styles.nameText} title={row.nickname}>
              {row.nickname}
            </span>
          )}
          <span className={styles.phone}>{row.phone}</span>
        </span>
      ),
    },
    {
      kind: 'text',
      key: 'email',
      header: '이메일',
      ratio: 3,
      sortable: true,
      render: (row) => (
        <a className={styles.email} href={`mailto:${row.email}`} title={row.email}>
          {row.email}
        </a>
      ),
    },
    {
      kind: 'type',
      key: 'memberType',
      header: '회원 유형',
      tone: memberTypeTone,
    },
    {
      kind: 'category',
      key: 'joinPath',
      header: '가입 경로',
      tone: () => 'secondary',
    },
    { kind: 'date', key: 'joinedAt', header: '가입일', sortable: true },
    {
      kind: 'number',
      key: 'orderCount',
      header: '주문',
      sortable: true,
      // 0건은 흐리게 — 구매 이력이 있는 고객만 눈에 들어오게
      render: (row) => (
        <span className={[styles.num, row.orderCount === 0 ? styles.zero : ''].filter(Boolean).join(' ')}>
          {row.orderCount.toLocaleString('ko-KR')}
        </span>
      ),
    },
    {
      kind: 'price',
      key: 'totalPurchase',
      header: '누적 구매금액',
      sortable: true,
      render: (row) => (
        <span className={[styles.num, row.totalPurchase === 0 ? styles.zero : ''].filter(Boolean).join(' ')}>
          {formatKrw(row.totalPurchase)}
        </span>
      ),
    },
    { kind: 'memo', key: 'memo', header: '메모' },
  ]

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
      title={title}
      description={description}
      headerActions={
        onExport != null ? (
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label={exportLabel}
            showIcon
            icon={exportIcon ?? <Download size={16} />}
            onClick={onExport}
          />
        ) : undefined
      }
      tabs={tabItems}
      tab={tabValue}
      onTabChange={onTabChange}
      matchTab={matchesTab}
      search="inline"
      keyword={keyword}
      onKeywordChange={onKeywordChange}
      searchPlaceholder={searchPlaceholder}
      matchKeyword={matchesKeyword}
      // 레퍼런스 표기는 접두사 없는 "5명" — 셸 기본값('총')을 빈 문자열로 지운다
      totalLabel=""
      totalUnit={countUnit}
      toolbarActions={
        showFilter ? (
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label="필터"
            showIcon
            icon={filterIcon ?? <SlidersHorizontal size={16} />}
            onClick={onFilter}
          />
        ) : undefined
      }
      onMemoChange={onMemoChange}
      columnPicker={columnPicker}
      // 열 ON/OFF는 셸 → AdminTable로 그대로 내려간다(피커에서 다시 켤 수 있다)
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      // 이 화면의 내보내기는 헤더 버튼(onExport) 하나뿐 — 표 우상단 CSV/Excel은 두지 않는다
      exportable={false}
      page={page}
      onPageChange={onPageChange}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      pageSizeOptions={pageSizeOptions}
      loading={loading}
      emptyText={emptyText}
      density={density}
      show={{
        header: show?.header,
        tabs: show?.tabs,
        toolbar: show?.toolbar,
        search: show?.search,
        pagination: show?.pagination,
      }}
    />
  )
}
