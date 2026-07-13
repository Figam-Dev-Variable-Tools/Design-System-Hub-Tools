import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Download, Eye, EyeOff, Trash2 } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { AdminListPage, type AdminListPageProps, type AdminListRowContext } from './AdminListPage'
import type { AdminBulkAction, AdminColumn } from '../AdminTable/AdminTable'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import type { SearchFieldDef } from '../SearchPanel/SearchPanel'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { CategoryTree, type CategoryNode } from '../CategoryTree/CategoryTree'

/*
 * 셸이 무엇을 대신해 주는지 보이기 위한 데모 —
 * 스토리가 선언하는 건 화면마다 다른 세 가지(컬럼 · 상태 축 · 문구)뿐이고,
 * 탭·검색·정렬·페이징·선택·일괄 처리·삭제 확인은 전부 AdminListPage가 갖는다.
 */
type DemoStatus = 'active' | 'paused' | 'draft'

type DemoRow = {
  id: string
  category: string
  title: string
  author: string
  createdAt: string
  views: number
  status: DemoStatus
}

const STATUS_LABEL: Record<DemoStatus, string> = {
  active: '진행중',
  paused: '중지',
  draft: '작성중',
}

const STATUS_TONE: Record<DemoStatus, 'primary' | 'secondary' | 'warning'> = {
  active: 'primary',
  paused: 'warning',
  draft: 'secondary',
}

const CATEGORIES = ['공지', '이벤트', '점검', '안내']
const AUTHORS = ['홍성보', '김서연', '이준호', '박지민', '최수아']
const STATUSES: DemoStatus[] = ['active', 'paused', 'draft']

const pad = (value: number): string => String(value).padStart(2, '0')

const ROWS: DemoRow[] = Array.from({ length: 24 }, (_, i) => ({
  id: `row-${pad(i + 1)}`,
  category: CATEGORIES[i % 4],
  title: `목록 항목 ${i + 1} — 같은 셸, 다른 컬럼 조합`,
  author: AUTHORS[i % 5],
  createdAt: `2026-07-${pad((i % 28) + 1)}`,
  views: (i + 1) * 137,
  status: STATUSES[i % 3],
}))

/** 탭 = 전체 + 상태 축 — 건수는 셸이 matchTab으로 센다 */
const TABS: CategoryTabItem[] = [
  { label: '전체', value: 'all', fixed: true },
  ...STATUSES.map((status) => ({ label: STATUS_LABEL[status], value: status, fixed: true })),
]

const matchTab = (row: DemoRow, tab: string): boolean => tab === 'all' || row.status === tab

/** 인라인 검색 — 제목·작성자 */
const matchKeyword = (row: DemoRow, keyword: string): boolean =>
  [row.title, row.author].some((field) => field.toLowerCase().includes(keyword.toLowerCase()))

const SEARCH_FIELDS: SearchFieldDef[] = [
  { kind: 'text', key: 'title', label: '제목', placeholder: '제목으로 검색', span: 2 },
  { kind: 'text', key: 'author', label: '작성자', placeholder: '작성자 입력' },
  { kind: 'daterange', key: 'period', label: '등록일', presets: ['today', '7d', '30d'] },
  {
    kind: 'select',
    key: 'status',
    label: '상태',
    options: STATUSES.map((status) => ({ label: STATUS_LABEL[status], value: status })),
  },
  {
    kind: 'select',
    key: 'category',
    label: '카테고리',
    options: CATEGORIES.map((category) => ({ label: category, value: category })),
  },
]

const SORT_OPTIONS = [
  { label: '최신순', value: 'recent' },
  { label: '조회수순', value: 'views' },
]

/** 정렬 Select는 값만 알려 준다 — 실제 순서는 화면이 정한다(셸은 도메인을 모른다) */
const orderRows = (rows: DemoRow[], sort: string | null): DemoRow[] =>
  sort === 'views' ? [...rows].sort((a, b) => b.views - a.views) : rows

/** 좌측 레일 데모 — 카테고리 트리(선택 상태는 레일이 갖는다) */
const TREE: CategoryNode[] = [
  { key: 'all', label: '전체', count: ROWS.length },
  {
    key: 'board',
    label: '게시판',
    count: 18,
    children: [
      { key: 'notice', label: '공지', count: 6 },
      { key: 'event', label: '이벤트', count: 6 },
      { key: 'guide', label: '안내', count: 6 },
    ],
  },
  { key: 'ops', label: '운영', count: 6 },
]

function SideRail() {
  const [value, setValue] = useState('all')
  return <CategoryTree nodes={TREE} value={value} onChange={setValue} />
}

/** 컬럼 — 케밥의 삭제만 셸의 확인창(ctx.confirmDelete)을 쓴다 */
function buildColumns(ctx: AdminListRowContext): AdminColumn<DemoRow>[] {
  return [
    { kind: 'select', key: 'select', pinned: 'left' },
    { kind: 'index', key: 'no' },
    { kind: 'category', key: 'category', header: '카테고리', sortable: true, tone: () => 'secondary' },
    { kind: 'title', key: 'title', header: '제목', ratio: 3, align: 'left', sortable: true },
    { kind: 'user', key: 'author', header: '작성자', sortable: true },
    { kind: 'date', key: 'createdAt', header: '등록일', sortable: true },
    { kind: 'number', key: 'views', header: '조회수', align: 'right', sortable: true },
    {
      kind: 'badge',
      key: 'status',
      header: '상태',
      sortable: true,
      value: (row) => STATUS_LABEL[row.status],
      render: (row) => (
        <Badge
          variant={STATUS_TONE[row.status]}
          appearance="soft"
          size="sm"
          label={STATUS_LABEL[row.status]}
        />
      ),
    },
    {
      kind: 'kebab',
      key: 'kebab',
      pinned: 'right',
      menu: (row) => [
        { key: 'open', label: '상세 보기', icon: <Eye size={14} />, onSelect: () => {} },
        { key: 'hide', label: '숨기기', icon: <EyeOff size={14} />, onSelect: () => {} },
        {
          key: 'delete',
          label: '삭제',
          tone: 'error' as const,
          divider: true,
          icon: <Trash2 size={14} />,
          onSelect: () => ctx.confirmDelete([row.id]),
        },
      ],
    },
  ]
}

const BULK_ACTIONS: AdminBulkAction[] = [
  { key: 'show', label: '노출', tone: 'primary', icon: <Eye size={14} />, onAction: () => {} },
  { key: 'hide', label: '숨김', icon: <EyeOff size={14} />, onAction: () => {} },
]

/** 삭제가 실제로 반영되도록 rows를 들고 있는 데모 래퍼(그 밖의 상태는 전부 셸 안에 있다) */
function Demo(props: AdminListPageProps<DemoRow>) {
  const [rows, setRows] = useState<DemoRow[]>(props.rows)
  return (
    <AdminListPage
      {...props}
      rows={rows}
      onBulkDelete={(ids) => setRows((prev) => prev.filter((row) => !ids.includes(row.id)))}
    />
  )
}

const meta = {
  title: 'Admin/AdminListPage',
  component: Demo,
  tags: ['autodocs'],
  args: {
    rows: ROWS,
    columns: buildColumns,
    rowKey: (row: DemoRow) => row.id,
    title: '목록 화면',
    description: '어드민 목록 13종이 공유하는 셸 — 컬럼·상태·문구만 갈아끼운다.',
    createLabel: '등록',
    exportFilename: '목록',
    emptyText: '표시할 항목이 없습니다.',
    density: 'compact',
    loading: false,
    tabs: TABS,
    matchTab,
    bulkActions: BULK_ACTIONS,
    deleteConfirm: { title: '선택한 항목을 삭제할까요?' },
    onCreate: () => {},
    onRowOpen: () => {},
  },
  argTypes: {
    rows: { control: false },
    columns: { control: false },
    rowKey: { control: false },
    tabs: { control: false },
    matchTab: { control: false },
    matchKeyword: { control: false },
    orderRows: { control: false },
    bulkActions: { control: false },
    deleteConfirm: { control: false },
    searchFields: { control: false },
    sortOptions: { control: false },
    side: { control: false },
    headerActions: { control: false },
    toolbarActions: { control: false },
    createIcon: { control: false },
    show: { control: 'object' },
    search: { control: 'radio', options: ['panel', 'inline', false] },
    density: { control: 'radio', options: ['compact', 'comfortable'] },
    title: { control: 'text' },
    description: { control: 'text' },
    createLabel: { control: 'text' },
    emptyText: { control: 'text' },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<AdminListPageProps<DemoRow>>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 기본 — 헤더 · 탭 · 건수 바 · 표(선택·일괄·컬럼·내보내기·페이징).
 * 검색은 기본값 panel이지만 searchFields가 없으면 패널 자리는 통째로 접힌다.
 */
export const Default: Story = {}

/** 다중 조건 검색(SearchPanel) — 툴바 슬롯은 패널이 갖고, 건수 바는 표 위로 내려간다 */
export const WithSearchPanel: Story = {
  args: {
    searchFields: SEARCH_FIELDS,
    onSearch: () => {},
  },
}

/**
 * 한 줄 검색(ListToolbar) — 검색·정렬·건수가 한 카드에 모여 툴바 슬롯을 차지한다.
 * matchKeyword를 주면 셸이 rows를 그 자리에서 좁힌다(서버 검색이면 onSearch만 쓰면 된다).
 */
export const InlineSearch: Story = {
  args: {
    search: 'inline',
    searchPlaceholder: '제목 · 작성자로 검색',
    matchKeyword,
    sortOptions: SORT_OPTIONS,
    orderRows,
    toolbarActions: (
      <Button
        variant="secondary"
        appearance="outline"
        size="md"
        label="엑셀 다운로드"
        showIcon
        icon={<Download size={16} />}
      />
    ),
  },
}

/** 요소 전부 OFF — 표만 남는다(꺼진 자리에 빈 여백이 남지 않는다) */
export const Minimal: Story = {
  args: {
    rows: ROWS.slice(0, 8),
    show: {
      header: false,
      tabs: false,
      toolbar: false,
      search: false,
      count: false,
      pagination: false,
      bulk: false,
      rowActions: false,
      columnPicker: false,
      export: false,
    },
  },
}

/** 좌측 레일 — 카테고리 트리를 side 슬롯에 넣는다(폭·접힘은 AdminPageLayout이 맡는다) */
export const WithSideRail: Story = {
  args: {
    side: <SideRail />,
    searchFields: SEARCH_FIELDS,
  },
}

/** 로딩 — 검색 조건은 잠기고 표에는 로딩 오버레이 */
export const Loading: Story = {
  args: {
    loading: true,
    searchFields: SEARCH_FIELDS,
  },
}

/** 빈 목록 — 표만 EmptyState로 바뀌고 탭 건수는 모두 0 */
export const Empty: Story = {
  args: {
    rows: [],
    searchFields: SEARCH_FIELDS,
  },
}
