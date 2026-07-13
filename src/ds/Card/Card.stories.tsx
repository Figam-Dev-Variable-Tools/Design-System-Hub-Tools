import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Card } from './Card'

const meta = {
  title: '3. 컴포넌트/Layout/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    title: 'Card title',
    showFooter: true,
    children: 'This is a sample card.',
  },
  argTypes: {
    children: { control: 'text' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <Card title="Card title">This is a sample card.</Card>
      <Card title="Card title" showFooter>
        This is a sample card.
      </Card>
    </div>
  ),
}

/** 긴 제목·본문 — 제목은 2줄 클램프, 본문은 줄바꿈되어 카드를 뚫지 않는다 */
export const LongText: Story = {
  render: () => (
    <div style={{ width: 260, border: '1px dashed var(--ds-color-border)', padding: 12 }}>
      <Card title="아주 긴 카드 제목이 들어가도 카드 밖으로 넘치지 않고 두 줄까지만 보입니다" showFooter>
        긴 본문도 자연스럽게 줄바꿈됩니다. 끊기지 않는 문자열도 안전합니다:
        ExtremelyLongUnbrokenBodyToken1234567890ABCDEFGH
      </Card>
    </div>
  ),
}
