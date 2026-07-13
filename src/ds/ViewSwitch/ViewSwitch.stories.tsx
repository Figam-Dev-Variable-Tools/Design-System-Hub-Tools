import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
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
    // 컨트롤드 — 각 스토리가 state를 붙여 덮어쓴다
    onChange: () => {},
  },
  argTypes: {
    onChange: { control: false },
    value: { control: 'inline-radio', options: ['card', 'board'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    showLabel: {
      control: 'boolean',
      description: '라벨 ON/OFF — OFF면 아이콘만 남는다(좁은 툴바용, aria-label은 유지)',
    },
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
    </div>
  ),
}

/** 아이콘만 — 라벨을 끄면 좁은 툴바(ShopPage 정렬 바)에 들어간다. 접근성 이름은 aria-label로 남는다. */
export const IconOnly: Story = {
  render: () => <ViewSwitchDemo value="card" onChange={() => {}} size="sm" showLabel={false} />,
}
