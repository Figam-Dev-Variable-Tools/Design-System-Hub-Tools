import { useState } from 'react'
import type { ReactNode } from 'react'
import styles from './StaffList.module.css'
import {
  mergeLabels,
  resolveLabel,
  type ColumnLabels,
  type DeepPartialOneLevel,
  type EmptyLabels,
  type SearchLabels,
} from '../../shared/labels'
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

/** 표 컬럼 — labels.columns의 키이자 AdminTable 컬럼 key */
export type StaffColumnKey =
  | 'nickname'
  | 'account'
  | 'group'
  | 'joinedAt'
  | 'department'
  | 'position'
  | 'phone'
  | 'memo'

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   이 화면은 카피가 거의 다 개별 prop으로 열려 있었다(title·searchPlaceholder·addGroupLabel·notes …).
   닫혀 있던 것은 컬럼 머리글과 기본 탭 라벨뿐이라 그 둘을 여기로 모은다.
   우선순위: 개별 prop > labels.* > 기본값. */
type StaffListLabelsResolved = {
  title: string
  columns: Record<StaffColumnKey, string>
  /** 기본 탭 — tabs prop을 주면 그쪽이 이긴다 */
  tabs: { staff: string }
  /** 좌측 패널 '새 그룹 만들기' */
  addGroup: string
  search: SearchLabels
  empty: EmptyLabels
  /** 값이 없는 칸(부서·직급·연락처)에 찍히는 문자 */
  emptyCell: string
}

export const DEFAULT_STAFF_LIST_LABELS: StaffListLabelsResolved = {
  title: '운영진 관리',
  columns: {
    nickname: '닉네임',
    account: '계정',
    group: '그룹',
    joinedAt: '가입일',
    department: '부서',
    position: '직급',
    phone: '연락처',
    memo: '메모',
  },
  tabs: { staff: '운영진 목록' },
  addGroup: '새 운영진 그룹 만들기',
  search: { searchPlaceholder: '전체 운영자 검색' },
  empty: { title: '등록된 운영진이 없습니다.' },
  emptyCell: '-',
} as const

export type StaffListLabels = DeepPartialOneLevel<StaffListLabelsResolved>

/** 컬럼 머리글만 갈아끼울 때 — labels.columns와 같은 모양 */
export type StaffColumnLabels = ColumnLabels<StaffColumnKey>

export type StaffListProps = {
  rows: StaffRow[]
  groups: StaffGroupItem[]

  /** 선택 그룹 key — 주면 제어, 안 주면 내부 상태(첫 항목으로 시작) */
  groupKey?: string
  onGroupChange?: (key: string) => void
  /** 없으면 '새 운영진 그룹 만들기' 버튼이 렌더되지 않는다 */
  onAddGroup?: () => void
  /** @deprecated labels.addGroup 을 쓰세요 (개별 prop이 labels보다 우선한다) */
  addGroupLabel?: string
  /** 좌측 패널 하단 권한 안내 — 한 항목이 한 문단이다. 빈 배열이면 문구가 사라진다 */
  notes?: string[]

  /** 검색어 — 주면 제어, 안 주면 내부 상태 */
  keyword?: string
  onKeywordChange?: (keyword: string) => void
  /** 엔터로 검색 확정 — 목록 필터링은 컴포넌트가 이미 하고 있으니 서버 조회용 훅이다 */
  onSearch?: (keyword: string) => void
  /** @deprecated labels.search.searchPlaceholder 를 쓰세요 */
  searchPlaceholder?: string

  /** 상단 탭 — 기본은 '운영진 목록' 한 개(문구만 바꿀 거면 labels.tabs.staff) */
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

  /** @deprecated labels.title 을 쓰세요 */
  title?: string
  description?: string
  headerActions?: ReactNode
  /** 건수 문구 앞머리 — 툴바의 totalLabel로 들어간다("전체 운영자 5명") */
  countLabel?: string
  /** 건수 단위 — "5명"의 '명' */
  countUnit?: string
  /** 화면 문구를 통째로 갈아끼우는 단일 통로 — 개별 카피 prop이 우선한다 */
  labels?: StaffListLabels

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
  /** @deprecated labels.empty.title 을 쓰세요 */
  emptyText?: string
  density?: 'compact' | 'comfortable'
  /** 좌측 그룹 레일 너비(px). 기본 240 — 그룹명이 긴 조직에서 넓힌다 */
  sideWidth?: number
}

/** 좌측 패널 하단 권한 안내 — 카피는 화면 상수 */
const DEFAULT_NOTES = [
  '운영진 그룹을 만들면 메뉴별 접근 권한을 그룹 단위로 한 번에 지정할 수 있습니다.',
  '최고 관리자 그룹은 삭제할 수 없고, 권한 변경은 최고 관리자만 할 수 있습니다.',
]

const DEFAULT_PAGE_SIZE_OPTIONS = [20, 50, 100]

/** 좌측 그룹 레일 기본 너비 — 그룹명 한 줄이 말줄임 없이 들어가는 최소 폭 */
const DEFAULT_SIDE_WIDTH = 240

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
  // 카피의 기본값은 DEFAULT_STAFF_LIST_LABELS가 갖는다 — 여기서 기본값을 주면
  // 넘기지 않은 개별 prop이 labels를 항상 이겨 통로가 막힌다
  addGroupLabel,
  notes = DEFAULT_NOTES,
  keyword,
  onKeywordChange,
  onSearch,
  searchPlaceholder,
  tabs,
  tabKey,
  onTabChange,
  selectedIds,
  onSelectChange,
  onRowOpen,
  onMemoChange,
  rowMenu,
  bulkActions,
  onBulkDelete,
  title,
  description,
  headerActions,
  countLabel,
  countUnit = '명',
  labels,
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
  emptyText,
  density = 'compact',
  sideWidth = DEFAULT_SIDE_WIDTH,
}: StaffListProps) {
  const L = mergeLabels(DEFAULT_STAFF_LIST_LABELS, labels)

  // 기본 탭은 한 개('운영진 목록') — tabs를 통째로 주면 그쪽이 이긴다
  const tabItems: CategoryTabItem[] = tabs ?? [
    { label: L.tabs.staff, value: 'staff', fixed: true },
  ]

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
      header: L.columns.nickname,
      ratio: 2,
      sortable: true,
      onClick: onRowOpen,
    },
    { kind: 'text', key: 'account', header: L.columns.account, ratio: 2.6 },
    { kind: 'category', key: 'group', header: L.columns.group, ratio: 1.6, sortable: true },
    { kind: 'date', key: 'joinedAt', header: L.columns.joinedAt, sortable: true },
    {
      kind: 'text',
      key: 'department',
      header: L.columns.department,
      ratio: 1.4,
      value: (row) => row.department ?? L.emptyCell,
    },
    {
      kind: 'text',
      key: 'position',
      header: L.columns.position,
      ratio: 1,
      value: (row) => row.position ?? L.emptyCell,
    },
    {
      kind: 'text',
      key: 'phone',
      header: L.columns.phone,
      ratio: 1.4,
      // 자릿수가 흔들리지 않게 tabular-nums + 1줄 말줄임
      render: (row) => <span className={styles.tel}>{row.phone ?? L.emptyCell}</span>,
    },
    { kind: 'memo', key: 'memo', header: L.columns.memo },
  ]

  if (rowMenu != null) columns.push({ kind: 'kebab', key: 'kebab', menu: rowMenu })

  return (
    <AdminListPage
      rows={visibleRows}
      columns={columns}
      rowKey={(row) => row.id}
      loading={loading}
      title={resolveLabel(title, L.title)}
      description={description}
      headerActions={headerActions}
      tabs={tabItems}
      tab={tabKey}
      onTabChange={onTabChange}
      side={
        showSide ? (
          <GroupPanel
            items={groups}
            value={group}
            onChange={selectGroup}
            onAdd={onAddGroup}
            addLabel={resolveLabel(addGroupLabel, L.addGroup)}
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
            width={sideWidth}
          />
        ) : undefined
      }
      search="inline"
      keyword={keyword}
      onKeywordChange={onKeywordChange}
      searchPlaceholder={resolveLabel(searchPlaceholder, L.search.searchPlaceholder)}
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
      emptyText={resolveLabel(emptyText, L.empty.title)}
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
