import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Select, type SelectProps } from './Select'

const OPTIONS = [
  { value: 'design', label: '디자인' },
  { value: 'dev', label: '개발' },
  { value: 'plan', label: '기획' },
  { value: 'qa', label: 'QA' },
  { value: 'etc', label: '기타 (비활성)', disabled: true },
]

function Demo(props: SelectProps) {
  const [value, setValue] = useState<string | null>(props.value)
  return <Select {...props} value={value} onChange={setValue} />
}

const meta = {
  title: '3. 컴포넌트/Input/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    label: '직군',
    value: null,
    options: OPTIONS,
    placeholder: '선택하세요',
    disabled: false,
    error: false,
    helperText: '해당하는 직군을 선택하세요.',
  },
  argTypes: {
    fullWidth: { control: 'boolean', description: '폼 그리드에서 열을 채운다 — 기본 320px 상한을 푼다' },
    onChange: { control: false },
    options: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <Demo {...args} />,
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 240 }}>
      <Select value={null} options={OPTIONS} label="기본" />
      <Select value="dev" options={OPTIONS} label="선택됨" />
      <Select value={null} options={OPTIONS} label="에러" error helperText="필수 항목입니다." />
      <Select value="design" options={OPTIONS} label="비활성" disabled />
    </div>
  ),
}

const LONG_OPTIONS = [
  { value: 'long1', label: '아주 긴 옵션 라벨이 들어가도 트리거 밖으로 넘치지 않아야 합니다' },
  { value: 'long2', label: 'VeryLongUnbrokenOptionLabelWithoutSpaces1234567890' },
  { value: 'short', label: '짧은 옵션' },
]

/** 긴 옵션 라벨 — 트리거·패널 모두 말줄임되고 셰브런/체크는 항상 보인다 */
export const LongOptions: Story = {
  render: () => (
    <div style={{ width: 240, paddingBottom: 240, border: '1px dashed var(--ds-color-border)', padding: 12 }}>
      <Demo
        label="아주 긴 라벨을 가진 셀렉트"
        value="long1"
        options={LONG_OPTIONS}
        helperText="긴 헬퍼 문구도 필드 밖으로 넘치지 않고 줄바꿈됩니다."
      />
    </div>
  ),
}
