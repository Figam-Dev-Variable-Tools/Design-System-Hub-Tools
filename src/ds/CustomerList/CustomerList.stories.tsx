import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FileDown, Filter } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { CustomerList, type CustomerListProps, type CustomerRow } from './CustomerList'

/* ── 목데이터 — 레퍼런스와 같은 결(전체 5 / 일반회원 2 / 아티스트회원 3) ──────────── */

const ROWS: CustomerRow[] = [
  {
    id: 'CU-2024-1102',
    nickname: '서준작가',
    phone: '010-4821-7734',
    email: 'seojun.kim@example.com',
    memberType: '아티스트회원',
    joinPath: '이메일',
    joinedAt: '2024-11-02',
    orderCount: 42,
    totalPurchase: 3_284_000,
    memo: '배송 지연 클레임 건으로 3,000원 쿠폰 지급 완료. 신제품 입고 시 우선 안내 요망.',
  },
  {
    id: 'CU-2025-0318',
    nickname: '하윤',
    phone: '010-2937-1120',
    email: 'hayun.park@example.com',
    memberType: '일반회원',
    joinPath: '이메일',
    joinedAt: '2025-03-18',
    orderCount: 7,
    totalPurchase: 412_000,
  },
  {
    id: 'CU-2025-0904',
    nickname: '도현스튜디오',
    phone: '010-7645-8892',
    email: 'dohyun.lee@example.com',
    memberType: '아티스트회원',
    joinPath: '이메일',
    joinedAt: '2025-09-04',
    orderCount: 0,
    totalPurchase: 0,
    memo: '포트폴리오 검수 대기 중.',
  },
  {
    id: 'CU-2026-0127',
    nickname: '은비',
    phone: '010-3318-2047',
    email: 'eunbi.choi@example.com',
    memberType: '일반회원',
    joinPath: '이메일',
    joinedAt: '2026-01-27',
    orderCount: 3,
    totalPurchase: 128_500,
  },
  {
    id: 'CU-2026-0712',
    nickname: '예린',
    phone: '010-5502-6613',
    email: 'yerin.jung@example.com',
    memberType: '아티스트회원',
    joinPath: '이메일',
    joinedAt: '2026-07-12',
    orderCount: 0,
    totalPurchase: 0,
  },
]

/* ── 데모 래퍼 — 메모 저장·페이지 크기가 화면에 남도록 스토리가 상태를 들고 있는다 ──── */

function CustomerListDemo({
  rows: initialRows,
  onMemoChange,
  pageSize: initialPageSize,
  onPageSizeChange,
  columnVisibility: initialColumnVisibility,
  onColumnVisibilityChange,
  ...rest
}: CustomerListProps) {
  const [rows, setRows] = useState(initialRows)
  // args로 준 스토리만 제어값이 된다 — 안 주면 컴포넌트/AdminTable 내부 기본값이 굴러간다
  const [pageSize, setPageSize] = useState(initialPageSize)
  // 제어값을 그대로 두면 [컬럼] 피커가 얼어붙는다 — 스토리가 상태를 들고 되돌려준다
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility)

  return (
    <CustomerList
      {...rest}
      rows={rows}
      pageSize={pageSize}
      onPageSizeChange={(size) => {
        setPageSize(size)
        onPageSizeChange?.(size)
      }}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={(next) => {
        setColumnVisibility(next)
        onColumnVisibilityChange?.(next)
      }}
      onMemoChange={
        onMemoChange == null
          ? undefined
          : (row, memo) => {
              setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, memo } : item)))
              onMemoChange(row, memo)
            }
      }
    />
  )
}

const meta = {
  title: 'Admin/CustomerList',
  component: CustomerList,
  tags: ['autodocs'],
  args: {
    rows: ROWS,
    title: '고객 목록',
    description: '가입한 일반회원·아티스트회원을 조회하고 메모를 관리합니다.',
    density: 'compact',
    columnPicker: true,
    loading: false,
    onExport: () => {},
    onFilter: () => {},
    onOpen: () => {},
    onMemoChange: () => {},
  },
  argTypes: {
    rows: { control: 'object' },
    show: { control: 'object' },
    columnVisibility: { control: 'object' },
    exportLabel: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    countUnit: { control: 'text' },
    exportIcon: { control: false },
    filterIcon: { control: false },
    onExport: { control: false },
    onFilter: { control: false },
    onOpen: { control: false },
    onMemoChange: { control: false },
    onTabChange: { control: false },
    onKeywordChange: { control: false },
    onPageChange: { control: false },
    onPageSizeChange: { control: false },
    onColumnVisibilityChange: { control: false },
    memberTypeTone: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => <CustomerListDemo {...args} />,
} satisfies Meta<typeof CustomerList>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 기본 — 레퍼런스 그대로.
 * 헤더('고객 목록' + [엑셀 다운로드]) / 탭(전체 5 · 일반회원 2 · 아티스트회원 3) /
 * 툴바(검색 + 건수 + 필터) / 표(닉네임·연락처 2줄, 이메일 링크, 유형·경로 배지, 0은 흐리게, 메모 연필).
 * 탭·검색은 실제로 동작한다 — '아티스트회원' 탭을 누르면 3건으로 좁혀진다.
 */
export const Default: Story = {}

/**
 * 전부 ON — show의 모든 키를 명시적으로 true로 켠 상태(기본값과 같은 화면).
 * 헤더 · 탭 · 툴바(검색 · 필터) · 페이지네이션이 모두 보인다.
 */
export const AllSections: Story = {
  args: {
    show: {
      header: true,
      tabs: true,
      toolbar: true,
      search: true,
      filter: true,
      pagination: true,
    },
    // 페이지네이션이 실제로 보이도록 한 페이지를 3건으로 줄인다(5건 → 2페이지)
    pageSize: 3,
    pageSizeOptions: [3, 20, 50],
  },
}

/**
 * 대부분 OFF — 표만 남는다.
 * 헤더·탭·툴바(검색·필터)·페이지네이션이 DOM에서 완전히 사라지고,
 * 빈 자리나 여백·구분선이 남지 않는다. 페이지네이션이 꺼졌으므로 5건이 잘리지 않고 전부 그려진다.
 */
export const Minimal: Story = {
  args: {
    show: {
      header: false,
      tabs: false,
      toolbar: false,
      search: false,
      filter: false,
      pagination: false,
    },
  },
}

/**
 * 툴바 요소 단위 OFF — 툴바 카드는 남기고 검색만 끈다(건수 + 필터 버튼만).
 * search=false면 입력이 사라지고, 남아 있던 검색어로 결과를 몰래 좁히지도 않는다.
 */
export const ToolbarWithoutSearch: Story = {
  args: {
    show: { search: false },
  },
}

/**
 * 열 ON/OFF — AdminTable의 columnVisibility로 '가입 경로 · 주문 · 누적 구매금액'을 끈다.
 * 표 우상단 [컬럼] 피커로도 같은 상태를 바꿀 수 있다(제어값이라 여기서는 스토리가 들고 있다).
 */
export const ColumnsHidden: Story = {
  args: {
    columnVisibility: {
      joinPath: false,
      orderCount: false,
      totalPurchase: false,
    },
  },
}

/** 검색 결과 없음 — 필터를 좁혔을 때의 빈 상태 */
export const Empty: Story = {
  args: {
    rows: [],
  },
}

/** 로딩 — 표 골격만 남기고 내용은 로딩 표시로 대체된다 */
export const Loading: Story = {
  args: {
    loading: true,
  },
}

/** 밀도 — comfortable은 행 높이가 늘어난다(바깥 여백은 그대로) */
export const Comfortable: Story = {
  args: {
    density: 'comfortable',
  },
}

/**
 * 문구·아이콘 교체 — 같은 화면을 다른 도메인(작가 목록)에 쓸 때.
 * 타이틀·내보내기 라벨·검색 placeholder·건수 단위·빈 상태 문구와 두 버튼 아이콘만 갈아끼운다(레이아웃은 그대로).
 */
export const CustomCopy: Story = {
  args: {
    title: '작가 목록',
    description: '등록된 작가를 조회하고 메모를 관리합니다.',
    exportLabel: 'CSV 내보내기',
    exportIcon: <FileDown size={16} />,
    filterIcon: <Filter size={16} />,
    searchPlaceholder: '작가명 · 계정으로 검색',
    countUnit: '건',
    emptyText: '조회된 작가가 없습니다.',
  },
}

/**
 * labels — 화면의 모든 글자를 통로 하나로 갈아끼운다(영문 오버라이드).
 * 컬럼 머리글과 [필터] 버튼이 labels로 열렸다. 금액의 '원'은 문구가 아니라 포맷이라 formatters로 연다.
 *
 * labels.table은 화면이 그리지 않는 '표 크롬'(메모 편집창 · [컬럼] 피커 · 페이지 크기 · 빈 표 설명)이다 —
 * 셸(AdminListPage)을 지나 AdminTable까지 그대로 흘러간다. 넘기지 않은 키는 AdminTable 기본값을 지킨다.
 */
export const Labels: Story = {
  args: {
    labels: {
      title: 'Customers',
      description: 'Browse members and keep notes on each account.',
      columns: {
        nickname: 'Name · Phone',
        email: 'Email',
        memberType: 'Member type',
        joinPath: 'Sign-up path',
        joinedAt: 'Joined',
        orderCount: 'Orders',
        totalPurchase: 'Lifetime spend',
        memo: 'Note',
      },
      toolbar: { export: 'Export to Excel', filter: 'Filter' },
      search: { searchPlaceholder: 'Search by name, email or phone' },
      empty: { title: 'No customers found.' },
      table: {
        toolbar: { columnPicker: 'Columns', columnPickerTitle: 'Show columns' },
        memo: {
          empty: 'Note',
          emptyTitle: 'No note',
          edit: (row) => `Edit note — ${row}`,
          create: (row) => `Add note — ${row}`,
          dialogTitle: (row) => `Note — ${row}`,
          placeholder: 'Leave a note about this customer',
          cancel: 'Cancel',
          save: 'Save',
        },
        pageSizeOption: (size) => `${size} per page`,
        empty: { description: 'Try a different keyword or filter.' },
      },
    },
    // 통화는 labels가 아니라 formatters의 몫이다 — '1,284,000원' → '$1,284,000'
    formatters: { price: (value) => `$${Math.round(value).toLocaleString('en-US')}` },
    countUnit: ' people',
  },
}
