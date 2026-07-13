import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Callout } from './Callout'

const meta = {
  title: '3. 컴포넌트/Feedback/Callout',
  component: Callout,
  tags: ['autodocs'],
  args: {
    tone: 'info',
    title: 'Heads up',
    children: 'This is an informational callout with a short supporting message.',
  },
  argTypes: {
    children: { control: 'text' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllTones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Callout tone="info" title="Information">
        Use this to share neutral, helpful context with the reader.
      </Callout>
      <Callout tone="success" title="Success">
        Your changes were saved and published successfully.
      </Callout>
      <Callout tone="warning" title="Warning">
        This action may have side effects. Review before continuing.
      </Callout>
      <Callout tone="error" title="Error">
        Something went wrong. Please try again in a moment.
      </Callout>
    </div>
  ),
}

/** 긴 본문 — 좁은 폭에서도 줄바꿈되어 콜아웃 밖으로 넘치지 않는다 */
export const LongText: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 300,
        border: '1px dashed var(--ds-color-border)',
        padding: 12,
      }}
    >
      <Callout tone="warning" title="아주 긴 제목이 들어가도 콜아웃을 뚫지 않아야 합니다">
        긴 본문 문장이 여러 줄로 흐르더라도 좌측 아이콘과 겹치거나 박스를 넘지 않아야 합니다. 끊기지
        않는 문자열도 마찬가지입니다: https://example.com/extremely/long/path/segment/without/spaces
      </Callout>
    </div>
  ),
}
