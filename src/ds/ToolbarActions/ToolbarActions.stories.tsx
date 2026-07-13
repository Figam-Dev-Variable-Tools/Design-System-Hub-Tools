import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ClipboardCopy, FileDown, FileText, Link2, RotateCw } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { ToolbarActions, type ToolbarActionsProps } from './ToolbarActions'

// 새로고침을 실제로 눌러 회전을 볼 수 있는 로컬 데모
function ToolbarActionsDemo(props: ToolbarActionsProps) {
  const [refreshing, setRefreshing] = useState(false)

  const refresh = () => {
    setRefreshing(true)
    window.setTimeout(() => setRefreshing(false), 1600)
  }

  return <ToolbarActions {...props} refreshing={refreshing} onRefresh={refresh} />
}

const meta = {
  title: 'Admin/ToolbarActions',
  component: ToolbarActions,
  tags: ['autodocs'],
  args: {
    size: 'md',
    refreshing: false,
    exportMenu: [
      { label: 'CSV로 내보내기', onSelect: () => {} },
      { label: 'Excel로 내보내기', onSelect: () => {} },
    ],
    onPrint: () => {},
    onRefresh: () => {},
    onCopy: () => {},
    onShare: () => {},
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    refreshing: { control: 'boolean' },
    exportMenu: { control: 'object' },
    onExport: { control: false },
    onPrint: { control: false },
    onRefresh: { control: false },
    onCopy: { control: false },
    onShare: { control: false },
    exportIcon: { control: false, description: '내보내기 아이콘(기본 Download)' },
    printIcon: { control: false, description: '인쇄 아이콘(기본 Printer)' },
    refreshIcon: { control: false, description: '새로고침 아이콘(기본 RefreshCw · 회전한다)' },
    copyIcon: { control: false, description: '복사 아이콘(기본 Copy)' },
    shareIcon: { control: false, description: '공유 아이콘(기본 Share2)' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof ToolbarActions>

export default meta
type Story = StoryObj<typeof meta>

/** 전체 액션 + 내보내기 메뉴(CSV/Excel) */
export const Default: Story = {}

/** 새로고침을 눌러 보세요 — 아이콘이 회전하고 중복 실행이 막힌다 */
export const Refreshing: Story = {
  render: (args) => <ToolbarActionsDemo {...args} />,
}

/** 회전 중 정지 상태(스냅샷용) */
export const RefreshingStatic: Story = {
  args: { refreshing: true },
}

export const Small: Story = {
  args: { size: 'sm' },
}

/** exportMenu 없이 onExport만 — 메뉴 없는 단일 버튼이 된다 */
export const SingleExportButton: Story = {
  args: {
    exportMenu: undefined,
    onExport: () => {},
  },
}

/** 핸들러를 넘긴 버튼만 렌더된다 */
export const Partial: Story = {
  args: {
    exportMenu: undefined,
    onExport: () => {},
    onPrint: undefined,
    onCopy: undefined,
    onShare: undefined,
  },
  render: (args) => <ToolbarActionsDemo {...args} />,
}

/** 목록 상단 배치 예 — 제목 우측에 붙인다 */
export const InListHeader: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        width: 640,
        maxWidth: '100%',
        padding: '12px 16px',
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        fontFamily: 'var(--ds-font-family)',
      }}
    >
      <span
        style={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--ds-color-text)',
        }}
      >
        문의 관리
      </span>
      <ToolbarActions {...args} />
    </div>
  ),
}

/**
 * 아이콘 교체 — 아이콘 세트가 다른 제품에서 툴바만 튀지 않게 갈아 끼운다.
 * 접근성 이름(툴팁 문구)은 그대로 남는다 — 아이콘은 장식이고 이름은 aria-label이 갖는다.
 * (새로고침 아이콘은 커스텀이어도 refreshing일 때 회전한다)
 */
export const CustomIcons: Story = {
  render: (args) => (
    <ToolbarActionsDemo
      {...args}
      exportMenu={undefined}
      onExport={() => {}}
      exportIcon={<FileDown size={16} aria-hidden="true" />}
      printIcon={<FileText size={16} aria-hidden="true" />}
      refreshIcon={<RotateCw size={16} aria-hidden="true" />}
      copyIcon={<ClipboardCopy size={16} aria-hidden="true" />}
      shareIcon={<Link2 size={16} aria-hidden="true" />}
    />
  ),
}
