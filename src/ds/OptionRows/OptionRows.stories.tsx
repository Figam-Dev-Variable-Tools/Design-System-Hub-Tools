import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MapPin, X } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { OptionRows, type OptionRow, type OptionRowsProps } from './OptionRows'

// 상태를 가진 컴포넌트라 스토리 안에서 로컬 데모 래퍼로 감싼다
function OptionRowsDemo(props: OptionRowsProps) {
  const [rows, setRows] = useState<OptionRow[]>(props.rows)
  return <OptionRows {...props} rows={rows} onChange={setRows} />
}

const SAMPLE_ROWS: OptionRow[] = [
  { id: 'option-color-black', name: '색상', value: '블랙', extraPrice: 0, stock: 120 },
  { id: 'option-color-silver', name: '색상', value: '실버', extraPrice: 5000, stock: 40 },
  { id: 'option-layout-87', name: '배열', value: '87키 (텐키리스)', extraPrice: 0, stock: 65 },
]

const meta = {
  title: 'Admin/OptionRows',
  component: OptionRows,
  tags: ['autodocs'],
  args: {
    rows: [],
    // 실제 상태는 아래 데모 래퍼가 들고 있으므로 여기서는 no-op
    onChange: () => {},
    max: 20,
    disabled: false,
    showHeader: true,
    showReorder: true,
    showCount: true,
    addLabel: '옵션 추가',
  },
  argTypes: {
    onChange: { control: false },
    showHeader: { control: 'boolean', description: '컬럼 헤더 줄' },
    showReorder: { control: 'boolean', description: '행 순서 이동 버튼' },
    showCount: { control: 'boolean', description: "하단 'n/max' 카운터" },
    addIcon: { control: false, description: '추가 버튼 아이콘(기본 Plus)' },
    moveUpIcon: { control: false, description: '위로 이동 아이콘(기본 ChevronUp)' },
    moveDownIcon: { control: false, description: '아래로 이동 아이콘(기본 ChevronDown)' },
    removeIcon: { control: false, description: '삭제 아이콘(기본 Trash2)' },
    emptyTitle: { control: 'text', description: '빈 상태 제목' },
    emptyDescription: { control: 'text', description: '빈 상태 설명' },
    addLabel: { control: 'text', description: '추가 버튼 라벨' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'padded',
  },
} satisfies Meta<typeof OptionRows>

export default meta
type Story = StoryObj<typeof meta>

/** 옵션이 없는 초기 상태 — 안내 문구와 '옵션 추가' 버튼만 노출된다 */
export const Default: Story = {
  render: (args) => <OptionRowsDemo {...args} />,
}

/** 상품 등록 — 색상·배열 옵션에 추가금액과 재고까지 입력된 상태 */
export const ProductOptions: Story = {
  args: {
    rows: SAMPLE_ROWS,
  },
  render: (args) => <OptionRowsDemo {...args} />,
}

/** 최대 개수에 도달하면 '옵션 추가' 버튼이 비활성화된다 */
export const MaxReached: Story = {
  args: {
    rows: SAMPLE_ROWS,
    max: 3,
  },
  render: (args) => <OptionRowsDemo {...args} />,
}

export const Disabled: Story = {
  args: {
    rows: SAMPLE_ROWS.slice(0, 2),
    disabled: true,
  },
  render: (args) => <OptionRowsDemo {...args} />,
}

/**
 * 토글 OFF — 헤더·순서 이동·카운터를 모두 끈 최소 구성.
 * 순서가 노출 순서와 무관한 표(재고 관리 등)에서 잡음을 줄인다.
 */
export const TogglesOff: Story = {
  args: {
    rows: SAMPLE_ROWS,
    showHeader: false,
    showReorder: false,
    showCount: false,
  },
  render: (args) => <OptionRowsDemo {...args} />,
}

/**
 * 문구·아이콘 교체 — 옵션이 아닌 다른 반복 행(배송지 등)으로 재사용할 때.
 * 빈 상태는 공용 EmptyState가 그리므로 제목/설명/액션만 갈아 끼우면 된다.
 */
export const CustomCopyAndIcons: Story = {
  args: {
    rows: [],
    emptyTitle: '등록된 배송지가 없습니다.',
    emptyDescription: '자주 쓰는 배송지를 미리 등록해 두면 주문이 빨라집니다.',
    addLabel: '배송지 추가',
    addIcon: <MapPin size={16} />,
    removeIcon: <X size={16} />,
  },
  render: (args) => <OptionRowsDemo {...args} />,
}
