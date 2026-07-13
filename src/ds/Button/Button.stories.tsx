import type { Meta, StoryObj } from '@storybook/react'
import { ArrowRight, Download, Plus } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from './Button'

function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.26L21.5 9.27l-4.75 4.28L18.2 20 12 16.56 5.8 20l1.45-6.45L2.5 9.27l6.6-1.01L12 2z" />
    </svg>
  )
}

const meta = {
  title: '3. 컴포넌트/Action/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    variant: 'primary',
    appearance: 'solid',
    size: 'md',
    disabled: false,
    label: 'Button',
    showIcon: false,
    icon: <IconStar />,
    showLeftIcon: false,
    leftIcon: <Plus size={16} />,
    showRightIcon: false,
    rightIcon: <ArrowRight size={16} />,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'success', 'warning', 'neutral'],
    },
    appearance: { control: 'inline-radio', options: ['solid', 'outline', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    fullWidth: { control: 'boolean', description: '부모 폭을 꽉 채운다(폼 하단 제출 CTA)' },
    iconOnly: {
      control: 'boolean',
      description: '아이콘만 보이는 정사각 버튼 — label은 화면에서만 감추고 접근성 이름으로 남는다',
    },
    icon: { control: false },
    leftIcon: { control: false },
    rightIcon: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['primary', 'secondary', 'error', 'success', 'warning'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={size} variant={variant} size={size} label="Button" />
          ))}
          <Button variant={variant} size="md" label="Button" showIcon icon={<IconStar />} />
          <Button variant={variant} size="md" label="Button" disabled />
        </div>
      ))}
    </div>
  ),
}

export const Appearances: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['solid', 'outline', 'ghost'] as const).map((appearance) => (
        <div key={appearance} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {(['primary', 'secondary', 'error', 'success', 'warning'] as const).map((variant) => (
            <Button key={variant} variant={variant} appearance={appearance} size="md" label="Button" />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** 좌/우 아이콘 슬롯 — showLeftIcon·leftIcon / showRightIcon·rightIcon (레거시 showIcon은 좌측) */
export const IconSlots: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button variant="primary" size="md" label="추가하기" showLeftIcon leftIcon={<Plus size={16} />} />
      <Button variant="primary" size="md" label="다음 단계" showRightIcon rightIcon={<ArrowRight size={16} />} />
      <Button
        variant="secondary"
        appearance="outline"
        size="md"
        label="내려받기"
        showLeftIcon
        leftIcon={<Download size={16} />}
        showRightIcon
        rightIcon={<ArrowRight size={16} />}
      />
      <Button variant="success" size="sm" label="레거시 showIcon" showIcon icon={<IconStar />} />
    </div>
  ),
}

/** 아주 긴 라벨 — 좁은 컨테이너에서도 버튼 밖으로 넘치지 않고 말줄임된다(아이콘은 유지) */
export const LongLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 220, border: '1px dashed var(--ds-color-border)', padding: 12 }}>
      <Button
        variant="primary"
        size="md"
        label="아주 긴 한글 라벨이 들어가도 버튼 밖으로 넘치지 않아야 합니다"
      />
      <Button
        variant="secondary"
        appearance="outline"
        size="md"
        label="Extremely long English button label that must never overflow its container"
        showLeftIcon
        leftIcon={<Download size={16} />}
        showRightIcon
        rightIcon={<ArrowRight size={16} />}
      />
      <Button variant="error" size="sm" label="삭제하기" />
    </div>
  ),
}

/** 전폭 CTA — 폼 하단 제출 버튼(ContactPage). 라벨은 계속 가운데에 선다. */
export const FullWidth: Story = {
  args: { variant: 'secondary', size: 'lg', label: '문의하기', fullWidth: true },
  render: (args) => (
    <div style={{ width: 480, maxWidth: '100%' }}>
      <Button {...args} />
    </div>
  ),
}

/** 아이콘 전용 — 표의 행 액션·툴바처럼 라벨 자리가 없는 곳. 라벨은 스크린리더가 읽는다. */
export const IconOnly: Story = {
  args: {
    variant: 'secondary',
    appearance: 'outline',
    size: 'sm',
    label: '삭제',
    iconOnly: true,
    showLeftIcon: true,
    leftIcon: <Download size={14} aria-hidden="true" />,
  },
}
