import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Badge } from './Badge'

const meta = {
  title: '3. 컴포넌트/Action/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    variant: 'primary',
    appearance: 'soft',
    label: 'Badge',
    size: 'md',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'success', 'warning', 'neutral'],
    },
    appearance: { control: 'inline-radio', options: ['solid', 'soft', 'outline'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['primary', 'secondary', 'error', 'success', 'warning'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge variant={variant} size="sm" label="Badge" />
          <Badge variant={variant} size="md" label="Badge" />
        </div>
      ))}
    </div>
  ),
}

export const Appearances: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {(['solid', 'soft', 'outline'] as const).map((appearance) => (
        <div key={appearance} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {(['primary', 'secondary', 'error', 'success', 'warning'] as const).map((variant) => (
            <Badge key={variant} variant={variant} appearance={appearance} size="md" label="Badge" />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** 긴 라벨 — 좁은 컨테이너·표 셀에서도 배지 밖으로 넘치지 않고 말줄임된다 */
export const LongLabel: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        width: 180,
        border: '1px dashed var(--ds-color-border)',
        padding: 12,
      }}
    >
      <Badge variant="success" label="아주 긴 한글 상태 라벨이 들어가도 넘치지 않습니다" size="md" />
      <Badge
        variant="error"
        appearance="outline"
        label="ExtremelyLongUnbrokenStatusLabelValue"
        size="sm"
      />
    </div>
  ),
}
