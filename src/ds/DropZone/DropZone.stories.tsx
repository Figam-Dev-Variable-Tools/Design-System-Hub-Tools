import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { DropZone, type DropZoneProps } from './DropZone'

/** 드롭/선택한 파일 목록을 아래에 보여주는 데모 래퍼 */
function DropZoneDemo(props: DropZoneProps) {
  const [files, setFiles] = useState<File[]>([])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
      <DropZone
        {...props}
        onFiles={(picked) => setFiles((prev) => (props.multiple ? [...prev, ...picked] : picked))}
      />
      {files.length > 0 && (
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            listStyle: 'none',
            margin: 0,
            padding: 0,
            fontSize: 13,
            color: 'var(--ds-color-text)',
          }}
        >
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              {file.name}
              <span style={{ color: 'var(--ds-color-secondary)' }}>
                {' '}
                · {(file.size / 1024).toFixed(0)}KB
              </span>
            </li>
          ))}
        </ul>
      )}
      {files.length === 0 && (
        <span style={{ fontSize: 13, color: 'var(--ds-color-secondary)' }}>
          파일을 끌어다 놓거나 클릭해서 선택해 보세요.
        </span>
      )}
    </div>
  )
}

const meta = {
  title: 'Admin/DropZone',
  component: DropZone,
  tags: ['autodocs'],
  args: {
    // 실제 파일 목록은 아래 데모 래퍼가 들고 있으므로 여기서는 no-op
    onFiles: () => {},
    accept: 'image/*',
    multiple: true,
    disabled: false,
    maxSizeMb: 5,
    hint: 'PNG·JPG · 5MB 이하',
    compact: false,
  },
  argTypes: {
    onFiles: { control: false },
    children: { control: false },
    // ON/OFF — 끄면 그 요소가 DOM에서 사라진다
    showLabel: { control: 'boolean' },
    showError: { control: 'boolean' },
    // 문구
    label: { control: 'text' },
    draggingLabel: { control: 'text' },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    errorIcon: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'padded',
  },
} satisfies Meta<typeof DropZone>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 드롭하거나 클릭해서 선택한 파일명이 아래에 쌓인다 */
export const Default: Story = {
  render: (args) => <DropZoneDemo {...args} />,
}

/** compact — 한 줄 높이로 폼 안에 끼워 넣는 형태 */
export const Compact: Story = {
  args: {
    compact: true,
    hint: '5MB 이하',
  },
  render: (args) => <DropZoneDemo {...args} />,
}

/** 비활성 — 드래그·클릭 모두 반응하지 않는다 */
export const Disabled: Story = {
  args: {
    disabled: true,
    hint: '업로드가 잠겨 있습니다',
  },
  render: (args) => <DropZoneDemo {...args} />,
}

/** 검증 실패 — accept(PDF만)·maxSizeMb(0.05MB) 위반 시 공용 Alert(error)이 뜬다 */
export const Validation: Story = {
  args: {
    accept: 'application/pdf,.pdf',
    maxSizeMb: 0.05,
    hint: 'PDF · 50KB 이하만 업로드할 수 있습니다',
  },
  render: (args) => <DropZoneDemo {...args} />,
}

/** 문구 교체 — 평상시/드래그 중 라벨을 화면 결에 맞춘다 */
export const CustomLabels: Story = {
  args: {
    label: '견적서를 여기에 올려 주세요',
    draggingLabel: '놓으면 바로 첨부됩니다',
  },
  render: (args) => <DropZoneDemo {...args} />,
}

/**
 * ON/OFF — showLabel=false면 아이콘·힌트만 남는 미니 드롭존이 되고,
 * showError=false면 검증은 그대로 돌지만 실패 문구를 드롭존이 그리지 않는다
 * (에러를 FieldRow 등 바깥에서 그리는 화면용 — 같은 말이 두 번 뜨지 않는다).
 */
export const TogglesOff: Story = {
  args: {
    showLabel: false,
    showError: false,
    accept: 'application/pdf,.pdf',
    maxSizeMb: 0.05,
    hint: 'PDF · 50KB 이하',
  },
  render: (args) => <DropZoneDemo {...args} />,
}
