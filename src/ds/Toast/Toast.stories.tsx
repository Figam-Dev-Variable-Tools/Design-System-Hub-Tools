import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Toast } from './Toast'

const MESSAGE = '토스트 메시지는 최대 30자 내외로 구성되어야 합니다'

function DismissibleDemo() {
  const [visible, setVisible] = useState(true)
  if (!visible) {
    return (
      <button type="button" onClick={() => setVisible(true)}>
        토스트 다시 표시
      </button>
    )
  }
  return <Toast tone="info" message={MESSAGE} onClose={() => setVisible(false)} />
}

const meta = {
  title: '3. 컴포넌트/Feedback/Toast',
  component: Toast,
  tags: ['autodocs'],
  args: {
    tone: 'success',
    message: MESSAGE,
    showIcon: true,
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['success', 'info', 'warning', 'error'] },
    onClose: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['success', 'info', 'warning', 'error'] as const).map((tone) => (
        <Toast key={tone} tone={tone} message={MESSAGE} />
      ))}
    </div>
  ),
}

export const Dismissible: Story = {
  render: () => <DismissibleDemo />,
}

/** 긴 메시지 — 2줄까지 표시 후 말줄임. 아이콘·닫기 버튼 자리를 침범하지 않는다 */
export const LongMessage: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 320,
        border: '1px dashed var(--ds-color-border)',
        padding: 12,
      }}
    >
      <Toast
        tone="error"
        message="아주 긴 토스트 메시지가 들어와도 토스트 박스를 뚫지 않고 두 줄까지만 보인 뒤 말줄임 처리됩니다. 나머지 문장은 잘립니다."
      />
      <Toast tone="success" message="ExtremelyLongUnbrokenTokenWithoutAnySpaceCharacters1234567890" />
    </div>
  ),
}
