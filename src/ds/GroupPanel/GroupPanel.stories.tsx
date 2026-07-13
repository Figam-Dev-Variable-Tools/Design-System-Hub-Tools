import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FolderPlus } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { GroupPanel, type GroupPanelItem } from './GroupPanel'

// 고객 그룹 — 첫 항목은 '전체', 이후 group 키로 묶여 경계마다 굵은 구분선이 들어간다
const CUSTOMER_ITEMS: GroupPanelItem[] = [
  { key: 'all', label: '전체 고객', count: 12480 },
  { key: 'vip', label: 'VIP', count: 312, group: 'grade' },
  { key: 'gold', label: '골드', count: 1204, group: 'grade' },
  { key: 'silver', label: '실버', count: 3890, group: 'grade' },
  { key: 'welcome', label: '신규 가입 30일', count: 268, group: 'auto' },
  { key: 'dormant', label: '휴면 예정', count: 74, group: 'auto' },
  { key: 'blocked', label: '이용 제한', count: 6, group: 'manage' },
]

const STAFF_ITEMS: GroupPanelItem[] = [
  { key: 'all', label: '전체 운영진', count: 24 },
  { key: 'owner', label: '최고 관리자', count: 2, group: 'role' },
  { key: 'manager', label: '운영 매니저', count: 9, group: 'role' },
  { key: 'cs', label: 'CS 담당', count: 13, group: 'role' },
]

type DemoProps = {
  items?: GroupPanelItem[]
  addable?: boolean
  footnote?: string
  width?: number
}

// 선택 상태를 들고 있는 데모 래퍼
function GroupPanelDemo({ items = CUSTOMER_ITEMS, addable = true, footnote, width }: DemoProps) {
  const [value, setValue] = useState(items[0]?.key ?? '')
  const [added, setAdded] = useState(0)

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <GroupPanel
        items={items}
        value={value}
        onChange={setValue}
        onAdd={addable ? () => setAdded((n) => n + 1) : undefined}
        footnote={footnote}
        width={width}
      />
      <div style={{ fontSize: 13, color: 'var(--ds-color-secondary)', paddingTop: 8 }}>
        선택: <strong style={{ color: 'var(--ds-color-text)' }}>{value}</strong>
        {added > 0 && <span> · 새 그룹 만들기 {added}회 클릭</span>}
      </div>
    </div>
  )
}

const meta = {
  title: 'Admin/GroupPanel',
  component: GroupPanel,
  tags: ['autodocs'],
  args: {
    items: CUSTOMER_ITEMS,
    value: 'all',
    // 실제 선택 상태는 아래 데모 래퍼(useState)가 들고 있다 — args의 onChange는 자리 채우기
    onChange: () => {},
    addLabel: '새 그룹 만들기',
    width: 240,
    showCount: true,
    highlightFirst: true,
  },
  argTypes: {
    items: { control: false },
    value: { control: false },
    onChange: { control: false },
    onAdd: { control: false },
    footnote: { control: false },
    width: { control: { type: 'number' } },
    showCount: { control: 'boolean', description: '항목 우측 건수' },
    highlightFirst: { control: 'boolean', description: "첫 항목('전체') primary 강조" },
    addIcon: { control: false, description: '추가 버튼 아이콘(기본 Plus)' },
  },
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof GroupPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <GroupPanelDemo items={args.items} width={args.width} />,
}

// 고객 목록 좌측 패널 — 등급/자동/관리 그룹 경계 + 설명 문구
export const CustomerGroups: Story = {
  render: () => (
    <GroupPanelDemo
      items={CUSTOMER_ITEMS}
      footnote="조건에 맞는 고객이 자동으로 그룹에 포함됩니다. 그룹은 최대 20개까지 만들 수 있습니다."
    />
  ),
}

// 운영진 목록 — 권한 역할별 그룹
export const StaffGroups: Story = {
  render: () => <GroupPanelDemo items={STAFF_ITEMS} footnote="역할별 접근 권한은 권한 설정에서 변경합니다." />,
}

/**
 * 토글 OFF — 건수와 첫 항목 강조를 끈 조용한 목록.
 * (건수가 실시간 집계라 흔들리거나, 첫 항목이 '전체'가 아닌 그냥 첫 그룹일 때)
 */
export const TogglesOff: Story = {
  render: () => (
    <GroupPanel
      items={STAFF_ITEMS}
      value="owner"
      onChange={() => {}}
      showCount={false}
      highlightFirst={false}
      onAdd={() => {}}
      addIcon={<FolderPlus size={14} />}
      addLabel="역할 추가"
    />
  ),
}

// 추가 버튼 없이 읽기 전용, 긴 라벨(말줄임), 좁은 폭
export const ReadOnlyAndOverflow: Story = {
  render: () => (
    <GroupPanelDemo
      items={[
        { key: 'all', label: '전체 사용자', count: 128900 },
        { key: 'long', label: '최근 6개월 내 구매 이력이 있는 재구매 우수 고객 세그먼트', count: 1284, group: 'seg' },
        { key: 'none', label: '건수 없음', group: 'seg' },
      ]}
      addable={false}
      width={200}
    />
  ),
}
