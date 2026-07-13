import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { MultiSelect, type MultiSelectProps } from './MultiSelect'

const OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'jquery', label: 'jQuery (비활성)', disabled: true },
]

function Demo(props: MultiSelectProps) {
  const [values, setValues] = useState<string[]>(props.values)
  return <MultiSelect {...props} values={values} onChange={setValues} />
}

const meta = {
  title: '3. 컴포넌트/Input/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  args: {
    label: '사용 기술',
    values: [],
    options: OPTIONS,
    placeholder: '선택하세요',
    maxSelected: 3,
    disabled: false,
    helperText: '최대 3개까지 선택할 수 있습니다.',
  },
  argTypes: {
    onChange: { control: false },
    options: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof MultiSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <Demo {...args} />,
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 240 }}>
      <MultiSelect values={[]} options={OPTIONS} label="기본" />
      <MultiSelect values={['react', 'svelte']} options={OPTIONS} label="선택됨" />
      <MultiSelect values={['vue']} options={OPTIONS} label="비활성" disabled />
    </div>
  ),
}

const LONG_OPTIONS = [
  { value: 'long1', label: '아주 긴 옵션 라벨이 들어간 첫 번째 항목입니다' },
  { value: 'long2', label: 'VeryLongUnbrokenOptionLabelWithoutSpaces1234567890' },
  { value: 'short', label: '짧은 옵션' },
]

/** 긴 옵션 라벨 — 선택 칩과 패널 항목이 모두 말줄임된다(× 버튼은 유지) */
export const LongOptions: Story = {
  render: () => (
    <div style={{ width: 260, paddingBottom: 240, border: '1px dashed var(--ds-color-border)', padding: 12 }}>
      <Demo label="긴 옵션" values={['long1', 'long2']} options={LONG_OPTIONS} />
    </div>
  ),
}
