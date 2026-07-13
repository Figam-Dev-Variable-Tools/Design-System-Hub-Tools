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
    appearance: 'outline',
    labelDisplay: 'icon',
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
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    appearance: {
      control: 'inline-radio',
      options: ['outline', 'ghost'],
      description: 'ghost는 보더·면을 지운다(이미 보더가 있는 바 안)',
    },
    labelDisplay: {
      control: 'inline-radio',
      options: ['icon', 'iconText'],
      description: 'iconText는 아이콘 옆에 글자를 함께 보여준다(툴팁이 없는 터치 환경)',
    },
    labels: { control: false, description: '접근성 이름 겸 툴팁 — iconText면 화면에도 보인다' },
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

/** 크기 — sm(28px) / md(36px) / lg(44px) */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <ToolbarActions {...args} size="sm" />
      <ToolbarActions {...args} size="md" />
      <ToolbarActions {...args} size="lg" />
    </div>
  ),
}

/** 룩 — ghost는 보더·면을 지운다. 이미 보더가 있는 바 안에 넣을 때 사각이 이중으로 겹치지 않는다. */
export const Appearance: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolbarActions {...args} appearance="outline" />
      <div
        style={{
          display: 'inline-flex',
          width: 'fit-content',
          padding: 'var(--ds-spacing-2)',
          background: 'var(--ds-color-bg)',
          border: 'var(--ds-border-width) solid var(--ds-color-border)',
          borderRadius: 'var(--ds-radius-md)',
        }}
      >
        <ToolbarActions {...args} appearance="ghost" />
      </div>
    </div>
  ),
}

/**
 * 라벨 노출 — 툴팁은 마우스가 있어야 뜬다.
 * 터치 화면에서 액션의 뜻을 잃지 않으려면 iconText로 글자를 함께 보여준다.
 */
export const WithText: Story = {
  args: { labelDisplay: 'iconText' },
}

/**
 * 문구 오버라이드 — 각 문구는 접근성 이름이자 툴팁이다(뜻이 둘일 이유가 없다).
 * iconText로 켜 두면 그 글자가 화면에도 그대로 보인다.
 */
export const Labels: Story = {
  args: {
    labelDisplay: 'iconText',
    labels: {
      toolbar: 'List actions',
      export: 'Export',
      print: 'Print',
      refresh: 'Refresh',
      refreshing: 'Refreshing',
      copy: 'Copy',
      share: 'Share',
    },
  },
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
