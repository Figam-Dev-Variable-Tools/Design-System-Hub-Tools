import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Archive, Copy, Forward, MoreHorizontal, Pencil, Reply, Trash2 } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { ContextMenu, type ContextMenuItem, type ContextMenuProps } from './ContextMenu'

const inquiryItems: ContextMenuItem[] = [
  { key: 'reply', label: '답변하기', icon: <Reply size={16} /> },
  { key: 'edit', label: '문의 수정', icon: <Pencil size={16} /> },
  { key: 'copy', label: '문의 번호 복사', icon: <Copy size={16} /> },
  { key: 'forward', label: '담당자 이관', icon: <Forward size={16} />, divider: true },
  { key: 'archive', label: '보관 처리', icon: <Archive size={16} />, disabled: true },
  {
    key: 'delete',
    label: '삭제',
    icon: <Trash2 size={16} />,
    tone: 'error',
    divider: true,
  },
]

// 마지막으로 고른 항목을 보여 주는 데모
function ContextMenuDemo(props: ContextMenuProps) {
  const [picked, setPicked] = useState<string | null>(null)

  const items = props.items.map((item) => ({
    ...item,
    onSelect: () => setPicked(item.label),
  }))

  return (
    <div style={{ fontFamily: 'var(--ds-font-family)' }}>
      <ContextMenu {...props} items={items}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 360,
            height: 140,
            border: '1px dashed var(--ds-color-border)',
            borderRadius: 8,
            background: 'var(--ds-color-bgSubtle)',
            color: 'var(--ds-color-secondary)',
            fontSize: 14,
            userSelect: 'none',
          }}
        >
          {props.trigger === 'click' ? '클릭해 보세요' : '이 영역에서 우클릭해 보세요'}
        </div>
      </ContextMenu>

      <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ds-color-secondary)' }}>
        선택: {picked ?? '(없음)'}
      </p>
    </div>
  )
}

const meta = {
  title: 'Admin/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  args: {
    items: inquiryItems,
    trigger: 'contextmenu',
    children: null,
  },
  argTypes: {
    trigger: { control: 'inline-radio', options: ['contextmenu', 'click'] },
    items: { control: 'object' },
    children: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

/** 우클릭 트리거 — 커서 좌표에 뜨고, 화면 경계 밖으로 나가면 안쪽으로 밀린다 */
export const Default: Story = {
  render: (args) => <ContextMenuDemo {...args} />,
}

/** 클릭 트리거 — 트리거 요소 하단에 붙는다(드롭다운 느낌) */
export const ClickTrigger: Story = {
  args: { trigger: 'click' },
  render: (args) => <ContextMenuDemo {...args} />,
}

/** 아이콘 버튼 트리거 — 목록 행의 "더보기" 메뉴 */
export const IconButtonTrigger: Story = {
  args: { trigger: 'click' },
  render: (args) => (
    <ContextMenu {...args}>
      <button
        type="button"
        aria-label="더보기"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          border: '1px solid var(--ds-color-border)',
          borderRadius: 6,
          background: 'var(--ds-color-bg)',
          color: 'var(--ds-color-secondary)',
          cursor: 'pointer',
        }}
      >
        <MoreHorizontal size={16} />
      </button>
    </ContextMenu>
  ),
}

/** 경계 보정 — 화면 우하단 가까이에서 열어도 메뉴가 잘리지 않는다 */
export const EdgeCorrection: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        height: 320,
        fontFamily: 'var(--ds-font-family)',
      }}
    >
      <ContextMenu {...args}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 200,
            height: 80,
            border: '1px dashed var(--ds-color-border)',
            borderRadius: 8,
            background: 'var(--ds-color-bgSubtle)',
            color: 'var(--ds-color-secondary)',
            fontSize: 13,
            userSelect: 'none',
          }}
        >
          우측 하단에서 우클릭
        </div>
      </ContextMenu>
    </div>
  ),
}

/** 목록 행 — 문의 관리에서의 실제 사용 모습 */
export const OnTableRows: Story = {
  render: (args) => (
    <div style={{ width: 420, fontFamily: 'var(--ds-font-family)' }}>
      {['배송이 너무 늦어요', '환불 요청드립니다', '상품 옵션 문의'].map((title, i) => (
        <ContextMenu key={title} items={args.items} trigger="contextmenu">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              width: 420,
              boxSizing: 'border-box',
              padding: '12px 16px',
              borderBottom: '1px solid var(--ds-color-border)',
              fontSize: 14,
              color: 'var(--ds-color-text)',
              cursor: 'context-menu',
              userSelect: 'none',
            }}
          >
            <span
              style={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </span>
            <span style={{ flex: 'none', fontSize: 12, color: 'var(--ds-color-secondary)' }}>
              INQ-{1001 + i}
            </span>
          </div>
        </ContextMenu>
      ))}
      <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ds-color-secondary)' }}>
        각 행에서 우클릭하세요.
      </p>
    </div>
  ),
}
