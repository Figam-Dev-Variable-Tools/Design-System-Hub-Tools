import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Grid3x3, Rows3 } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { ViewSwitch, type ViewSwitchProps, type ViewSwitchValue } from './ViewSwitch'

// 컨트롤드 컴포넌트라 스토리에서 state를 붙여 실제 전환을 보여 준다
function ViewSwitchDemo(props: ViewSwitchProps) {
  const [value, setValue] = useState<ViewSwitchValue>(props.value)
  return <ViewSwitch {...props} value={value} onChange={setValue} />
}

const meta = {
  title: 'Admin/ViewSwitch',
  component: ViewSwitch,
  tags: ['autodocs'],
  args: {
    value: 'card',
    size: 'md',
    showLabel: true,
    orientation: 'horizontal',
    // 컨트롤드 — 각 스토리가 state를 붙여 덮어쓴다
    onChange: () => {},
  },
  argTypes: {
    onChange: { control: false },
    value: { control: 'inline-radio', options: ['card', 'board'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    showLabel: {
      control: 'boolean',
      description: '라벨 ON/OFF — OFF면 아이콘만 남는다(좁은 툴바용, aria-label은 유지)',
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: '세로 배치 — 사이드 레일용(방향키는 이미 상하 키를 받는다)',
    },
    labels: { control: false, description: '옵션 라벨 + radiogroup 이름' },
    icons: { control: false, description: '아이콘 교체(기본 LayoutGrid·List)' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof ViewSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <ViewSwitchDemo {...args} />,
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <ViewSwitchDemo value="card" onChange={() => {}} size="sm" />
      <ViewSwitchDemo value="board" onChange={() => {}} size="md" />
      <ViewSwitchDemo value="card" onChange={() => {}} size="lg" />
    </div>
  ),
}

/** 아이콘만 — 라벨을 끄면 좁은 툴바(ShopPage 정렬 바)에 들어간다. 접근성 이름은 aria-label로 남는다. */
export const IconOnly: Story = {
  render: () => <ViewSwitchDemo value="card" onChange={() => {}} size="sm" showLabel={false} />,
}

/** 세로 배치 — 사이드 레일. 방향키(↑↓)로 이동한다. */
export const Vertical: Story = {
  render: () => <ViewSwitchDemo value="card" onChange={() => {}} orientation="vertical" />,
}

/** 아이콘 교체 — 아이콘 세트가 다른 사이트에서 이 컨트롤만 튀지 않게 갈아 끼운다 */
export const CustomIcons: Story = {
  render: () => (
    <ViewSwitchDemo
      value="card"
      onChange={() => {}}
      icons={{
        card: <Grid3x3 size={16} aria-hidden="true" />,
        board: <Rows3 size={16} aria-hidden="true" />,
      }}
    />
  ),
}

/**
 * 문구 오버라이드 — 옵션 라벨은 화면에 보이는 글자이자, 라벨을 껐을 때의 접근성 이름이다.
 * group은 radiogroup의 이름이라 화면에는 보이지 않는다.
 */
export const Labels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <ViewSwitchDemo
        value="card"
        onChange={() => {}}
        labels={{ group: 'List view', options: { card: 'Grid', board: 'List' } }}
      />
      {/* 라벨을 꺼도 같은 문구가 aria-label로 남는다 */}
      <ViewSwitchDemo
        value="card"
        onChange={() => {}}
        showLabel={false}
        labels={{ group: 'List view', options: { card: 'Grid', board: 'List' } }}
      />
    </div>
  ),
}
