import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from '../Button/Button'
import { Snackbar, type SnackbarProps } from './Snackbar'

// 컨트롤드 컴포넌트용 데모 — 버튼 클릭으로 열고, duration(기본 3초) 뒤 자동 닫힘
function SnackbarDemo(props: SnackbarProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="primary" size="md" label="알림 표시" onClick={() => setOpen(true)} />
      <Snackbar {...props} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

const meta = {
  title: '3. 컴포넌트/Feedback/Snackbar',
  component: Snackbar,
  tags: ['autodocs'],
  args: {
    open: false,
    message: '변경 사항이 저장되었습니다.',
    variant: 'default',
    duration: 3000,
    showClose: false,
    inline: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'success', 'error'] },
    onAction: { control: false },
    onClose: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Snackbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <SnackbarDemo {...args} />,
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Snackbar open inline message="기본 알림입니다." />
      <Snackbar open inline variant="success" message="저장이 완료되었습니다." />
      <Snackbar open inline variant="error" message="저장에 실패했습니다." showClose />
      <Snackbar open inline message="메시지가 삭제되었습니다." actionLabel="실행 취소" />
    </div>
  ),
}

/** 긴 메시지 — 2줄 말줄임. 액션/닫기 버튼은 항상 자리를 지킨다 */
export const LongMessage: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 480,
        border: '1px dashed var(--ds-color-border)',
        padding: 12,
      }}
    >
      <Snackbar
        open
        inline
        message="아주 긴 스낵바 메시지가 들어와도 액션 버튼과 닫기 버튼을 밀어내지 않고 두 줄까지만 표시된 뒤 말줄임됩니다."
        actionLabel="실행 취소"
        showClose
      />
      <Snackbar
        open
        inline
        variant="error"
        message="ExtremelyLongUnbrokenErrorTokenWithoutSpaces0123456789ABCDEF"
        showClose
      />
    </div>
  ),
}
