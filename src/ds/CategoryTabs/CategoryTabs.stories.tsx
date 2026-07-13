import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { CategoryTabs, type CategoryTabItem } from './CategoryTabs'

const DEMO_ITEMS: CategoryTabItem[] = [
  { value: 'all', label: '전체', count: 128 },
  { value: 'outer', label: '아우터', count: 32 },
  { value: 'top', label: '상의', count: 54 },
  { value: 'bottom', label: '하의', count: 30 },
  { value: 'acc', label: '액세서리', count: 12 },
]

type DemoProps = {
  items?: CategoryTabItem[]
  addable?: boolean
  /** false면 onRemove를 넘기지 않아 x 버튼이 사라진다 */
  removable?: boolean
  variant?: 'underline' | 'pill'
  align?: 'start' | 'center'
  rule?: boolean
}

// 카테고리 추가/삭제까지 동작하는 데모 래퍼
function CategoryTabsDemo({
  items: initialItems = DEMO_ITEMS,
  addable = true,
  removable = true,
  variant,
  align,
  rule,
}: DemoProps) {
  const [items, setItems] = useState<CategoryTabItem[]>(initialItems)
  const [value, setValue] = useState(initialItems[0]?.value ?? '')

  const handleAdd = (label: string) => {
    const next: CategoryTabItem = { value: `c-${Date.now()}`, label, count: 0 }
    setItems((prev) => [...prev, next])
    setValue(next.value)
  }

  const handleRemove = (target: string) => {
    setItems((prev) => {
      const rest = prev.filter((item) => item.value !== target)
      if (target === value) setValue(rest[0]?.value ?? '')
      return rest
    })
  }

  return (
    <CategoryTabs
      items={items}
      value={value}
      onChange={setValue}
      onAdd={handleAdd}
      onRemove={removable ? handleRemove : undefined}
      addable={addable}
      variant={variant}
      align={align}
      rule={rule}
    />
  )
}

const meta = {
  title: 'Admin/CategoryTabs',
  component: CategoryTabs,
  tags: ['autodocs'],
  args: {
    items: DEMO_ITEMS,
    value: 'all',
    addable: true,
    variant: 'underline',
    align: 'start',
    rule: true,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['underline', 'pill'],
      description: 'underline=밑줄 탭(어드민) / pill=알약 필터(사이트 히어로 아래)',
    },
    align: { control: 'inline-radio', options: ['start', 'center'] },
    rule: { control: 'boolean', description: 'underline 룩의 컨테이너 가로선 ON/OFF' },
    items: { control: false },
    value: { control: false },
    onChange: { control: false },
    onAdd: { control: false },
    onRemove: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof CategoryTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <CategoryTabsDemo
      items={args.items}
      addable={args.addable}
      variant={args.variant}
      align={args.align}
      rule={args.rule}
    />
  ),
}

/**
 * pill — 알약 필터 칩. 선택된 탭만 solid 면이고, 그 색은 SiteSection의 강조색을 따른다
 * (섹션 밖이면 primary로 폴백). 포트폴리오 히어로 아래 필터가 이 룩이다.
 */
export const PillCentered: Story = {
  render: () => (
    <CategoryTabsDemo variant="pill" align="center" addable={false} removable={false} />
  ),
}

/** 가로선 없는 밑줄 탭 — 히어로 아래에는 면 경계가 없다(ShopPage). */
export const UnderlineCenteredNoRule: Story = {
  render: () => (
    <CategoryTabsDemo align="center" rule={false} addable={false} removable={false} />
  ),
}

// 어드민 상품 카테고리 관리 — 추가(엔터/Esc) + 탭 hover 시 삭제
export const AdminCategories: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--ds-color-secondary)' }}>
        “카테고리 추가”를 눌러 이름을 입력하고 Enter로 추가, Esc로 취소합니다. 탭에 마우스를 올리면 x로 삭제됩니다.
      </p>
      <CategoryTabsDemo />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ds-color-secondary)' }}>
          건수 배지 없이 · 삭제 없이
        </p>
        <CategoryTabsDemo
          items={[
            { value: 'all', label: '전체' },
            { value: 'notice', label: '공지사항' },
            { value: 'faq', label: 'FAQ' },
          ]}
          removable={false}
        />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ds-color-secondary)' }}>
          읽기 전용 — addable=false
        </p>
        <CategoryTabsDemo addable={false} removable={false} />
      </div>
    </div>
  ),
}
