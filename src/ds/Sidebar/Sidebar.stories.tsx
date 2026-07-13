import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BarChart3, LayoutDashboard, MessageSquare, Package, Settings, ShoppingCart, Users } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Sidebar, type SidebarProps, type SidebarSection } from './Sidebar'

const sections: SidebarSection[] = [
  {
    title: '시작하기',
    items: [
      { label: '홈', value: 'home' },
      { label: '설치', value: 'install' },
      { label: '업데이트', value: 'updates', badge: 'N' },
    ],
  },
  {
    title: '컴포넌트',
    items: [
      { label: '버튼', value: 'button' },
      { label: '입력 필드', value: 'input' },
      { label: '내비게이션', value: 'navigation', disabled: true },
    ],
  },
]

// 어드민 메뉴 트리 — 데이터 선언만으로 무한 확장된다
const adminSections: SidebarSection[] = [
  {
    title: '운영',
    items: [
      { label: '대시보드', value: 'dashboard', icon: <LayoutDashboard size={18} /> },
      {
        label: '상품 관리',
        value: 'products',
        icon: <Package size={18} />,
        children: [
          { label: '상품 목록', value: 'products.list' },
          { label: '상품 등록', value: 'products.new' },
          { label: '카테고리', value: 'products.categories' },
        ],
      },
      { label: '주문', value: 'orders', icon: <ShoppingCart size={18} />, badge: '7' },
      { label: '회원', value: 'members', icon: <Users size={18} /> },
      { label: '게시판', value: 'boards', icon: <MessageSquare size={18} /> },
    ],
  },
  {
    title: '분석 · 설정',
    items: [
      { label: '통계', value: 'stats', icon: <BarChart3 size={18} /> },
      { label: '설정', value: 'settings', icon: <Settings size={18} /> },
    ],
  },
]

// 컨트롤드 컴포넌트용 데모
function SidebarDemo(props: SidebarProps) {
  const [value, setValue] = useState(props.value)
  return (
    <div style={{ height: 440, display: 'flex' }}>
      <Sidebar {...props} value={value} onChange={setValue} />
    </div>
  )
}

const meta = {
  title: '3. 컴포넌트/Structure/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  args: {
    sections,
    value: 'home',
    width: 240,
    collapsed: false,
  },
  argTypes: {
    onChange: { control: false },
    width: { control: { type: 'number', min: 160, max: 400 } },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <SidebarDemo {...args} />,
}

/** 아이콘 + 서브메뉴 — 메뉴를 데이터로만 선언한 어드민 트리 */
export const AdminMenu: Story = {
  args: { sections: adminSections, value: 'products.new' },
  render: (args) => <SidebarDemo {...args} />,
}

/** 미니 모드 — 아이콘만, 폭 64px */
export const Collapsed: Story = {
  args: { sections: adminSections, value: 'dashboard', collapsed: true },
  render: (args) => <SidebarDemo {...args} />,
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, height: 320 }}>
      <Sidebar sections={sections} value="home" />
      <Sidebar sections={sections} value="updates" />
      <Sidebar
        width={200}
        value="button"
        sections={[
          {
            items: [
              { label: '버튼', value: 'button', badge: '3' },
              { label: '배지', value: 'badge' },
              { label: '차트', value: 'chart', disabled: true },
            ],
          },
        ]}
      />
    </div>
  ),
}
