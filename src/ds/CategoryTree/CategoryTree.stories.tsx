import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Tab } from '../Tab/Tab'
import { CategoryTree, type CategoryNode } from './CategoryTree'

// 3단 계층 — 전체 / 대분류 / 중분류 / 소분류
const NODES: CategoryNode[] = [
  { key: 'all', label: '전체 상품', count: 1284 },
  {
    key: 'fashion',
    label: '패션의류',
    count: 642,
    children: [
      {
        key: 'fashion-women',
        label: '여성의류',
        count: 388,
        children: [
          { key: 'fashion-women-outer', label: '아우터', count: 96 },
          { key: 'fashion-women-top', label: '상의', count: 152 },
          { key: 'fashion-women-dress', label: '원피스', count: 140 },
        ],
      },
      {
        key: 'fashion-men',
        label: '남성의류',
        count: 254,
        children: [
          { key: 'fashion-men-outer', label: '아우터', count: 88 },
          { key: 'fashion-men-top', label: '상의', count: 166 },
        ],
      },
    ],
  },
  {
    key: 'beauty',
    label: '뷰티',
    count: 312,
    children: [
      { key: 'beauty-skin', label: '스킨케어', count: 180 },
      { key: 'beauty-makeup', label: '메이크업', count: 132 },
    ],
  },
  {
    key: 'living',
    label: '리빙 · 인테리어 소품 및 데코레이션 용품',
    count: 218,
    children: [
      { key: 'living-kitchen', label: '주방용품', count: 120 },
      { key: 'living-deco', label: '데코', count: 98 },
    ],
  },
  { key: 'etc', label: '미분류', count: 112 },
]

type DemoProps = {
  nodes?: CategoryNode[]
  collapsible?: boolean
  maxHeight?: number
  withTabs?: boolean
  addable?: boolean
  showCount?: boolean
}

// 선택 + 탭 상태를 들고 있는 데모 래퍼(폭은 어드민 좌측 패널 240px 기준)
function CategoryTreeDemo({
  nodes = NODES,
  collapsible = true,
  maxHeight,
  withTabs = true,
  addable = true,
  showCount = true,
}: DemoProps) {
  const [value, setValue] = useState('all')
  const [tab, setTab] = useState('category')
  const [added, setAdded] = useState(0)

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ width: 240, flex: 'none' }}>
        <CategoryTree
          nodes={nodes}
          value={value}
          onChange={setValue}
          onAdd={addable ? () => setAdded((n) => n + 1) : undefined}
          collapsible={collapsible}
          showCount={showCount}
          maxHeight={maxHeight}
          tabs={
            withTabs ? (
              <Tab
                items={[
                  { value: 'category', label: '카테고리' },
                  { value: 'exhibit', label: '기획전' },
                ]}
                value={tab}
                onChange={setTab}
                variant="underline"
                size="sm"
              />
            ) : undefined
          }
        />
      </div>
      <div style={{ fontSize: 13, color: 'var(--ds-color-secondary)', paddingTop: 8 }}>
        선택: <strong style={{ color: 'var(--ds-color-text)' }}>{value}</strong>
        {withTabs && <span> · 탭: {tab}</span>}
        {added > 0 && <span> · 추가 {added}회 클릭</span>}
      </div>
    </div>
  )
}

const meta = {
  title: 'Admin/CategoryTree',
  component: CategoryTree,
  tags: ['autodocs'],
  args: {
    nodes: NODES,
    value: 'all',
    // 실제 선택 상태는 아래 데모 래퍼(useState)가 들고 있다 — args의 onChange는 자리 채우기
    onChange: () => {},
    addLabel: '추가',
    collapsible: true,
  },
  argTypes: {
    nodes: { control: false },
    value: { control: false },
    onChange: { control: false },
    onAdd: { control: false },
    tabs: { control: false },
    // ON/OFF — 끄면 행 우측 건수 Badge가 DOM에서 사라진다
    showCount: { control: 'boolean' },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    addIcon: { control: false },
    expandIcon: { control: false },
    collapsible: { control: { type: 'boolean' } },
    maxHeight: { control: { type: 'number' } },
  },
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof CategoryTree>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <CategoryTreeDemo
      nodes={args.nodes}
      collapsible={args.collapsible}
      maxHeight={args.maxHeight}
      showCount={args.showCount}
    />
  ),
}

// showCount=false — 상품 수를 아직 집계하지 않는 화면(등록 폼의 상위 카테고리 선택 등)
export const WithoutCount: Story = {
  args: { showCount: false },
  render: (args) => <CategoryTreeDemo showCount={args.showCount} />,
}

// 상품 목록 좌측 패널 — 탭(카테고리/기획전) + 추가, 넘치면 세로 스크롤
export const ProductSidebar: Story = {
  render: () => <CategoryTreeDemo maxHeight={320} />,
}

// 탭·추가 없이 트리만
export const TreeOnly: Story = {
  render: () => <CategoryTreeDemo withTabs={false} addable={false} />,
}

// collapsible=false — 항상 펼친 상태, chevron 없음
export const AlwaysExpanded: Story = {
  render: () => <CategoryTreeDemo collapsible={false} withTabs={false} />,
}
