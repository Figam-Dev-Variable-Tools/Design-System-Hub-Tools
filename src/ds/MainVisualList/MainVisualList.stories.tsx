import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { EyeOff } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import {
  MAIN_VISUAL_ROWS,
  MAIN_VISUAL_TABS,
  MainVisualList,
  type MainVisualListProps,
  type MainVisualRow,
} from './MainVisualList'

/** 화면은 제어 컴포넌트다 — 스토리가 탭·검색·선택·순번 상태를 쥔다. */
type DemoProps = MainVisualListProps & {
  /** 일괄 처리 바를 바로 보여 주기 위한 초기 선택 */
  initialSelected?: string[]
}

function Demo({ initialSelected = [], ...props }: DemoProps) {
  const [tab, setTab] = useState('used')
  // 탭별 행 — 드래그 재정렬은 현재 탭의 배열만 갈아 끼운다
  const [rowsByTab, setRowsByTab] = useState<Record<string, MainVisualRow[]>>(MAIN_VISUAL_ROWS)
  const [status, setStatus] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState('order')
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected)
  const [page, setPage] = useState(1)

  const tabRows = rowsByTab[tab] ?? []

  // 상태 필터 + 제목 검색 — 툴바가 실제로 살아 있게 한다
  const rows = useMemo(() => {
    const query = keyword.trim()
    return tabRows
      .filter((row) =>
        status === 'all' ? true : status === 'active' ? row.active : !row.active,
      )
      .filter((row) => (query === '' ? true : row.title.includes(query)))
  }, [tabRows, status, keyword])

  /** 드래그 결과를 순번(order)까지 다시 매겨 저장한다 */
  const handleReorder = (next: MainVisualRow[]) => {
    setRowsByTab((prev) => ({
      ...prev,
      [tab]: next.map((row, index) => ({ ...row, order: index + 1 })),
    }))
  }

  const patchRow = (id: string, patch: Partial<MainVisualRow>) => {
    setRowsByTab((prev) => ({
      ...prev,
      [tab]: (prev[tab] ?? []).map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }))
  }

  const removeRows = (ids: string[]) => {
    const gone = new Set(ids)
    setRowsByTab((prev) => ({
      ...prev,
      [tab]: (prev[tab] ?? [])
        .filter((row) => !gone.has(row.id))
        .map((row, index) => ({ ...row, order: index + 1 })),
    }))
    setSelectedIds((prev) => prev.filter((id) => !gone.has(id)))
  }

  // 탭 배지 건수는 실제 데이터에서 뽑는다
  const tabs = MAIN_VISUAL_TABS.map((item) => ({
    ...item,
    count: (rowsByTab[item.value] ?? []).length,
  }))

  return (
    <MainVisualList
      {...props}
      tabs={tabs}
      tab={tab}
      onTabChange={(next) => {
        setTab(next)
        setSelectedIds([])
        setPage(1)
      }}
      rows={rows}
      status={status}
      onStatusChange={setStatus}
      keyword={keyword}
      onKeywordChange={setKeyword}
      sort={sort}
      onSortChange={setSort}
      onCreate={() => undefined}
      onEdit={() => undefined}
      onDelete={(row) => removeRows([row.id])}
      onToggleActive={(row, next) => patchRow(row.id, { active: next })}
      onReorder={handleReorder}
      selectedIds={selectedIds}
      onSelectChange={setSelectedIds}
      onBulkDelete={removeRows}
      page={props.page ?? page}
      onPageChange={props.onPageChange ?? setPage}
    />
  )
}

const meta = {
  title: 'Admin/MainVisualList',
  component: MainVisualList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  argTypes: {
    tabs: { control: false },
    rows: { control: false },
    bulkActions: { control: false },
    columnVisibility: { control: false },
    typeTone: { control: false },
    statusOptions: { control: false },
    sortOptions: { control: false },
    // 섹션 ON/OFF — columnPicker·export도 이 객체의 키다(top-level prop을 새로 늘리지 않는다)
    show: { control: 'object' },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    createIcon: { control: false },
  },
} satisfies Meta<typeof MainVisualList>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 레퍼런스 그대로 — 헤더('중고 메인 비주얼 등록'은 현재 탭 이름을 물고 온다) ·
 * 탭(중고 2 / 렌탈 3 / 시공 2) · 툴바(전체 상태 · 검색 · 순번순 · 2건) ·
 * 표(드래그·순번·이미지·타입·제목·등록일·수정일·등록자·수정자·활성화·관리).
 */
export const Default: Story = {
  render: (args) => <Demo {...args} />,
}

/** 전부 ON — show의 모든 키를 명시적으로 켠다. 선택 시 일괄 바, 페이지네이션까지 모두 나온다. */
export const AllSections: Story = {
  args: {
    show: {
      header: true,
      tabs: true,
      toolbar: true,
      pagination: true,
      bulk: true,
      reorder: true,
      rowActions: true,
      columnPicker: true,
      export: true,
    },
    totalPages: 3,
    pageSize: 10,
    bulkActions: [
      {
        key: 'hide',
        label: '선택 비활성',
        icon: <EyeOff size={14} />,
        onAction: () => undefined,
      },
    ],
  },
  render: (args) => <AllSectionsDemo {...args} />,
}

/** 일괄 바가 바로 보이도록 한 행을 미리 선택해 둔다. */
function AllSectionsDemo(props: MainVisualListProps) {
  const [pageSize, setPageSize] = useState(10)
  return (
    <Demo
      {...props}
      initialSelected={['mv-used-1']}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
    />
  )
}

/**
 * 대부분 OFF — 헤더·탭·툴바·페이지네이션·일괄·드래그·관리를 모두 끈다.
 * 꺼진 섹션은 통째로 사라지고 빈 자리·여백·구분선이 남지 않는다(표만 남는다).
 */
export const Minimal: Story = {
  args: {
    show: {
      header: false,
      tabs: false,
      toolbar: false,
      pagination: false,
      bulk: false,
      reorder: false,
      rowActions: false,
      columnPicker: false,
      export: false,
    },
  },
  render: (args) => <Demo {...args} />,
}

/**
 * 표 도구(컬럼 피커 · 내보내기) — show.columnPicker / show.export로 켠다.
 * 이 화면은 기본이 OFF라 켜야 표 우상단에 버튼이 생긴다(top-level prop을 늘리지 않고 show 키로 다룬다).
 */
export const TableTools: Story = {
  args: {
    show: { columnPicker: true, export: true },
  },
  render: (args) => <Demo {...args} />,
}

/**
 * 열 단위 ON/OFF는 show가 아니라 AdminTable의 columnVisibility로 한다.
 * 등록자·수정자·수정일을 끄고, 표 우상단 '컬럼' 피커로 다시 켤 수 있다.
 */
export const ColumnVisibility: Story = {
  render: (args) => <ColumnVisibilityDemo {...args} />,
}

function ColumnVisibilityDemo(props: MainVisualListProps) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    updatedAt: false,
    createdBy: false,
    updatedBy: false,
  })

  return (
    <Demo
      {...props}
      columnPicker
      columnVisibility={visibility}
      onColumnVisibilityChange={setVisibility}
    />
  )
}

/** 빈 목록 — 검색 결과가 없을 때. 표가 공용 EmptyState를 그린다. */
export const Empty: Story = {
  args: {
    rows: [],
    total: 0,
  },
}

/** 불러오는 중 — 표 위에 오버레이. */
export const Loading: Story = {
  args: {
    loading: true,
  },
}
