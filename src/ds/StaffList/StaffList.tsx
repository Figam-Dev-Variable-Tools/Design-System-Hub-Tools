import { useState } from 'react'
import type { ReactNode } from 'react'
import styles from './StaffList.module.css'
import { AdminListPage } from '../AdminListPage/AdminListPage'
import type { AdminBulkAction, AdminColumn, AdminRowMenuItem } from '../AdminTable/AdminTable'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import { GroupPanel, type GroupPanelItem } from '../GroupPanel/GroupPanel'

/** 운영진 한 명 — group은 좌측 패널 항목의 label과 같은 문자열로 맞춘다 */
export type StaffRow = {
  id: string
  nickname: string
  account: string
  group: string
  joinedAt: string
  department?: string
  position?: string
  phone?: string
  memo?: string
}

/** 좌측 운영 그룹 패널 항목 — 첫 항목이 '전체 운영자'(전체 보기) 역할을 맡는다 */
export type StaffGroupItem = GroupPanelItem

export type StaffListProps = {
  rows: StaffRow[]
  groups: StaffGroupItem[]

  /** 선택 그룹 key — 주면 제어, 안 주면 내부 상태(첫 항목으로 시작) */
  groupKey?: string
  onGroupChange?: (key: string) => void
  /** 없으면 '새 운영진 그룹 만들기' 버튼이 렌더되지 않는다 */
  onAddGroup?: () => void
  addGroupLabel?: string
  /** 좌측 패널 하단 권한 안내 — 한 항목이 한 문단이다. 빈 배열이면 문구가 사라진다 */
  notes?: string[]

  /** 검색어 — 주면 제어, 안 주면 내부 상태 */
  keyword?: string
  onKeywordChange?: (keyword: string) => void
  /** 엔터로 검색 확정 — 목록 필터링은 컴포넌트가 이미 하고 있으니 서버 조회용 훅이다 */
  onSearch?: (keyword: string) => void
  searchPlaceholder?: string

  /** 상단 탭 — 기본은 '운영진 목록' 한 개 */
  tabs?: CategoryTabItem[]
  tabKey?: string
  onTabChange?: (key: string) => void

  selectedIds?: string[]
  onSelectChange?: (ids: string[]) => void
  /** 닉네임 클릭 — 없으면 텍스트로만 렌더된다 */
  onRowOpen?: (row: StaffRow) => void
  onMemoChange?: (row: StaffRow, memo: string) => void
  /** 있으면 우측 케밥(⋯) 컬럼이 붙는다 */
  rowMenu?: (row: StaffRow) => AdminRowMenuItem[]
  bulkActions?: AdminBulkAction[]
  onBulkDelete?: (ids: string[]) => void

  title?: string
  description?: string
  headerActions?: ReactNode
  /** 건수 문구 앞머리 — 툴바의 totalLabel로 들어간다("전체 운영자 5명") */
  countLabel?: string
  /** 건수 단위 — "5명"의 '명' */
  countUnit?: string

  // ── 요소 ON/OFF — 운영진 목록을 다른 화면에 끼워 넣을 때 남는 줄을 끈다 ──
  /** 상단 탭('운영진 목록') — 탭이 하나뿐인 화면이면 꺼서 한 줄을 아낀다 */
  showTabs?: boolean
  /** 좌측 운영 그룹 패널 — 그룹을 바깥에서 이미 고른 화면이면 끈다 */
  showSide?: boolean
  /** 툴바 검색창 */
  showSearch?: boolean
  /** 툴바 우측 "5명" — 좌측 패널 건수와 겹치면 끈다 */
  showCount?: boolean

  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
  columnPicker?: boolean
  exportable?: boolean
  exportFilename?: string
  loading?: boolean
  emptyText?: string
  density?: 'compact' | 'comfortable'
}

/** 좌측 패널 하단 권한 안내 — 카피는 화면 상수 */
const DEFAULT_NOTES = [
  '운영진 그룹을 만들면 메뉴별 접근 권한을 그룹 단위로 한 번에 지정할 수 있습니다.',
  '최고 관리자 그룹은 삭제할 수 없고, 권한 변경은 최고 관리자만 할 수 있습니다.',
]

const DEFAULT_TABS: CategoryTabItem[] = [{ label: '운영진 목록', value: 'staff', fixed: true }]

const DEFAULT_PAGE_SIZE_OPTIONS = [20, 50, 100]

/** 검색 대상 필드 — 닉네임·계정·그룹·부서·직급·연락처를 통으로 훑는다 */
function matchesKeyword(row: StaffRow, keyword: string): boolean {
  const query = keyword.toLowerCase()
  return [row.nickname, row.account, row.group, row.department, row.position, row.phone].some(
    (field) => (field ?? '').toLowerCase().includes(query),
  )
}

/**
 * 운영진 목록 — 골격은 전부 AdminListPage(공용 셸)가 갖는다.
 *
 *   side    : GroupPanel(전체 운영자 + 운영 그룹 + 새 그룹 만들기 + 권한 안내)
 *   tabs    : CategoryTabs('운영진 목록')
 *   toolbar : 검색 ····· "전체 운영자 5명"(엔터 확정은 셸이 넘겨준다)
 *   content : AdminTable — 닉네임·계정·그룹·가입일·부서·직급·연락처·메모(+케밥)
 *
 * 검색·페이징·선택·일괄 처리는 셸이 굴린다. 이 파일에 남는 건 이 화면만의 것뿐이다 —
 * 컬럼, 좌측 그룹 패널(+그룹 필터), 한국어 문구.
 */
export function StaffList({
  rows,
  groups,
  groupKey,
  onGroupChange,
  onAddGroup,
  addGroupLabel = '새 운영진 그룹 만들기',
  notes = DEFAULT_NOTES,
  keyword,
  onKeywordChange,
  onSearch,
  searchPlaceholder = '전체 운영자 검색',
  tabs = DEFAULT_TABS,
  tabKey,
  onTabChange,
  selectedIds,
  onSelectChange,
  onRowOpen,
  onMemoChange,
  rowMenu,
  bulkActions,
  onBulkDelete,
  title = '운영진 관리',
  description,
  headerActions,
  countLabel,
  countUnit = '명',
  showTabs = true,
  showSide = true,
  showSearch = true,
  showCount = true,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  columnPicker = true,
  exportable = true,
  exportFilename = '운영진목록',
  loading = false,
  emptyText = '등록된 운영진이 없습니다.',
  density = 'compact',
}: StaffListProps) {
  // 첫 항목이 '전체' — 그룹이 비어 있어도 렌더는 되어야 하므로 빈 문자열로 흘린다
  const allKey = groups[0]?.key ?? ''

  // 그룹은 셸이 모르는 축이다(좌측 레일은 셸에겐 그냥 노드) — 선택 상태와 그에 딸린
  // 페이지 되돌리기는 이 화면이 갖는다. 그래서 page만 제어값으로 넘긴다.
  const [innerGroup, setInnerGroup] = useState(allKey)
  const [page, setPage] = useState(1)

  const group = groupKey ?? innerGroup

  const selectGroup = (key: string) => {
    if (groupKey == null) setInnerGroup(key)
    // 그룹이 바뀌면 결과가 통째로 달라진다 — 첫 페이지로 되돌린다
    setPage(1)
    onGroupChange?.(key)
  }

  // 그룹 필터는 label로 맞춘다 — 첫 항목(전체)이면 거르지 않는다
  const groupLabel = groups.find((item) => item.key === group)?.label
  const visibleRows =
    group === allKey || groupLabel == null
      ? rows
      : rows.filter((row) => row.group === groupLabel)

  const columns: AdminColumn<StaffRow>[] = [
    { kind: 'select', key: 'select' },
    {
      kind: 'title',
      key: 'nickname',
      header: '닉네임',
      ratio: 2,
      sortable: true,
      onClick: onRowOpen,
    },
    { kind: 'text', key: 'account', header: '계정', ratio: 2.6 },
    { kind: 'category', key: 'group', header: '그룹', ratio: 1.6, sortable: true },
    { kind: 'date', key: 'joinedAt', header: '가입일', sortable: true },
    { kind: 'text', key: 'department', header: '부서', ratio: 1.4, value: (row) => row.department ?? '-' },
    { kind: 'text', key: 'position', header: '직급', ratio: 1, value: (row) => row.position ?? '-' },
    {
      kind: 'text',
      key: 'phone',
      header: '연락처',
      ratio: 1.4,
      // 자릿수가 흔들리지 않게 tabular-nums + 1줄 말줄임
      render: (row) => <span className={styles.tel}>{row.phone ?? '-'}</span>,
    },
    { kind: 'memo', key: 'memo', header: '메모' },
  ]

  if (rowMenu != null) columns.push({ kind: 'kebab', key: 'kebab', menu: rowMenu })

  return (
    <AdminListPage
      rows={visibleRows}
      columns={columns}
      rowKey={(row) => row.id}
      loading={loading}
      title={title}
      description={description}
      headerActions={headerActions}
      tabs={tabs}
      tab={tabKey}
      onTabChange={onTabChange}
      side={
        showSide ? (
          <GroupPanel
            items={groups}
            value={group}
            onChange={selectGroup}
            onAdd={onAddGroup}
            addLabel={addGroupLabel}
            footnote={
              notes.length > 0 ? (
                <>
                  {notes.map((note) => (
                    // GroupPanel이 <p>로 감싸므로 문단은 block span으로 쌓는다(p 중첩 금지)
                    <span key={note} className={styles.note}>
                      {note}
                    </span>
                  ))}
                </>
              ) : undefined
            }
            width={240}
          />
        ) : undefined
      }
      search="inline"
      keyword={keyword}
      onKeywordChange={onKeywordChange}
      searchPlaceholder={searchPlaceholder}
      matchKeyword={matchesKeyword}
      onSearch={(values) => onSearch?.(String(values.keyword ?? ''))}
      // 그룹명 접두사가 없으면 접두사 없이 "5명" — 셸 기본값('총')이 끼어들지 않게 빈 문자열을 준다
      totalLabel={countLabel ?? ''}
      totalUnit={countUnit}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      bulkActions={bulkActions}
      onBulkDelete={onBulkDelete}
      onMemoChange={onMemoChange}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      pageSizeOptions={pageSizeOptions}
      columnPicker={columnPicker}
      exportable={exportable}
      exportFilename={exportFilename}
      emptyText={emptyText}
      density={density}
      show={{
        tabs: showTabs,
        // 검색·건수를 둘 다 끄면 빈 툴바 카드가 아니라 툴바 슬롯째 사라져야 한다
        toolbar: showSearch || showCount,
        search: showSearch,
        count: showCount,
      }}
    />
  )
}
