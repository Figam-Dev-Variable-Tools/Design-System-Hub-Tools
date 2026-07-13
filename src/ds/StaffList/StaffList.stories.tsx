import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Plus, Trash2, UserCog } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from '../Button/Button'
import { StaffList, type StaffGroupItem, type StaffRow } from './StaffList'

// ── 목데이터 — 운영자 5명 / 운영 그룹 2개 ────────────────────────────────
const STAFF_GROUPS: StaffGroupItem[] = [
  { key: 'all', label: '전체 운영자', count: 5 },
  { key: 'super', label: '최고 관리자', count: 1, group: '운영 그룹' },
  { key: 'ops', label: '상품·주문 운영', count: 4, group: '운영 그룹' },
]

const STAFF_ROWS: StaffRow[] = [
  {
    id: 'st-01',
    nickname: '홍성보',
    account: 'sb.hong@spaceplanning.ai',
    group: '최고 관리자',
    joinedAt: '2024-03-02',
    department: '경영지원팀',
    position: '이사',
    phone: '010-2841-7720',
    memo: '전체 메뉴 권한 보유',
  },
  {
    id: 'st-02',
    nickname: '김서연',
    account: 'seoyeon.kim@spaceplanning.ai',
    group: '상품·주문 운영',
    joinedAt: '2025-01-15',
    department: '커머스운영팀',
    position: '팀장',
    phone: '010-3392-1184',
  },
  {
    id: 'st-03',
    nickname: '이준호',
    account: 'junho.lee@spaceplanning.ai',
    group: '상품·주문 운영',
    joinedAt: '2025-06-08',
    department: '커머스운영팀',
    position: '매니저',
    phone: '010-7745-0912',
    memo: '주말 CS 당번',
  },
  {
    id: 'st-04',
    nickname: '박지민',
    account: 'jimin.park@spaceplanning.ai',
    group: '상품·주문 운영',
    joinedAt: '2025-09-22',
    department: '물류팀',
    position: '매니저',
    phone: '010-5510-3348',
  },
  {
    id: 'st-05',
    nickname: '최수아',
    account: 'sua.choi@spaceplanning.ai',
    group: '상품·주문 운영',
    joinedAt: '2026-02-03',
    department: '마케팅팀',
    position: '주임',
    // 부서·직급·연락처·메모는 선택값 — 비어 있으면 '-'로 떨어진다
  },
]

const meta = {
  title: 'Admin/StaffList',
  component: StaffList,
  tags: ['autodocs'],
  args: {
    rows: STAFF_ROWS,
    groups: STAFF_GROUPS,
    density: 'compact',
  },
  argTypes: {
    headerActions: { control: false },
    rowMenu: { control: false },
    bulkActions: { control: false },
    tabs: { control: false },

    // 요소 ON/OFF — 탭 한 줄, 좌측 패널, 툴바의 검색·건수를 각각 끈다
    showTabs: { control: 'boolean' },
    showSide: { control: 'boolean' },
    showSearch: { control: 'boolean' },
    showCount: { control: 'boolean' },
    columnPicker: { control: 'boolean' },
    exportable: { control: 'boolean' },

    // 카피
    title: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    countUnit: { control: 'text' },
    emptyText: { control: 'text' },
    addGroupLabel: { control: 'text' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof StaffList>

export default meta
type Story = StoryObj<typeof meta>

/* ────────────────────────────────────────────────────────────────────────── */

function StaffListDemo() {
  const [rows, setRows] = useState(STAFF_ROWS)

  return (
    <StaffList
      rows={rows}
      groups={STAFF_GROUPS}
      description="운영진 계정과 그룹별 접근 권한을 관리합니다."
      headerActions={
        <Button
          variant="primary"
          size="md"
          label="운영진 등록"
          showLeftIcon
          leftIcon={<Plus size={16} />}
        />
      }
      onAddGroup={() => {}}
      onRowOpen={() => {}}
      onMemoChange={(row, memo) =>
        setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, memo } : item)))
      }
      rowMenu={(row) => [
        { key: 'edit', label: `${row.nickname} 정보 수정`, onSelect: () => {} },
        { key: 'group', label: '그룹 변경', onSelect: () => {} },
        { key: 'remove', label: '운영진 해제', tone: 'error', divider: true, onSelect: () => {} },
      ]}
      bulkActions={[
        {
          key: 'group',
          label: '그룹 변경',
          icon: <UserCog size={14} />,
          onAction: () => {},
        },
      ]}
      onBulkDelete={(ids) => setRows((prev) => prev.filter((item) => !ids.includes(item.id)))}
    />
  )
}

/** 기본 — 좌측 그룹 패널 + 탭 + 공용 툴바(검색 ····· "5명") + 운영진 표(행 메모·케밥·일괄 처리까지 살아 있다) */
export const Default: Story = {
  render: () => <StaffListDemo />,
}

/** 운영진이 한 명도 없을 때 — 표는 EmptyState로 떨어지고 좌측 패널·검색은 그대로 남는다 */
export const Empty: Story = {
  args: {
    rows: [],
    groups: [
      { key: 'all', label: '전체 운영자', count: 0 },
      { key: 'super', label: '최고 관리자', count: 0, group: '운영 그룹' },
    ],
    headerActions: (
      <Button variant="primary" size="md" label="운영진 등록" showLeftIcon leftIcon={<Plus size={16} />} />
    ),
  },
}

/** 조회 중 — 표 위에 오버레이가 뜬다(툴바·좌측 패널은 그대로 조작 가능) */
export const Loading: Story = {
  args: {
    loading: true,
  },
}

/** 밀도 비교 — comfortable(56px 행). 기본은 compact(44px)다 */
export const Comfortable: Story = {
  args: {
    density: 'comfortable',
    rowMenu: (row: StaffRow) => [
      { key: 'edit', label: `${row.nickname} 정보 수정`, onSelect: () => {} },
      { key: 'remove', label: '운영진 해제', tone: 'error', icon: <Trash2 size={14} />, onSelect: () => {} },
    ],
  },
}

/** 좌측 패널 OFF — 그룹을 바깥에서 이미 고른 화면에 끼울 때. 표는 폭을 다 쓴다 */
export const NoSidePanel: Story = {
  args: {
    showSide: false,
  },
}

/** 탭·패널·툴바까지 끈 최소 구성 — 다른 화면 안에 표만 얹을 때 */
export const Minimal: Story = {
  args: {
    showTabs: false,
    showSide: false,
    showSearch: false,
    showCount: false,
  },
}

/** 카피 교체 — 같은 화면을 '파트너 계정' 목록으로 돌려쓴다 */
export const CustomCopy: Story = {
  args: {
    title: '파트너 계정',
    searchPlaceholder: '파트너명 · 계정으로 검색',
    countUnit: '개사',
    addGroupLabel: '새 파트너 그룹 만들기',
    emptyText: '등록된 파트너가 없습니다.',
  },
}
