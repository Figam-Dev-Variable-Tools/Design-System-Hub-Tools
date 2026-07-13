import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Menu } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Badge } from '../Badge/Badge'
import { SortableHandle, SortableList, type SortableListProps } from './SortableList'

type Todo = {
  id: string
  title: string
  owner: string
}

const TODOS: Todo[] = [
  { id: 'todo-1', title: '메인 배너 시안 확정', owner: '김서연' },
  { id: 'todo-2', title: '상품 상세 카피 검수', owner: '이준호' },
  { id: 'todo-3', title: '결제 실패 로그 분석', owner: '박지민' },
  { id: 'todo-4', title: '9월 프로모션 쿠폰 발행', owner: '최수아' },
]

type Photo = {
  id: string
  label: string
  fill: string
}

const PHOTOS: Photo[] = [
  { id: 'photo-1', label: '대표', fill: '#E5E8EB' },
  { id: 'photo-2', label: '상세 1', fill: '#D1D6DB' },
  { id: 'photo-3', label: '상세 2', fill: '#F2F4F6' },
  { id: 'photo-4', label: '상세 3', fill: '#E5E8EB' },
  { id: 'photo-5', label: '상세 4', fill: '#D1D6DB' },
  { id: 'photo-6', label: '상세 5', fill: '#F2F4F6' },
]

/** 외부 이미지 대신 사용하는 인라인 SVG 플레이스홀더 */
const photoUrl = (label: string, fill: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="100%" height="100%" fill="${fill}"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#6B7684" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`,
  )}`

// 제네릭 고정 — Storybook 타입 추론용 (Table과 동일한 방식)
const TodoSortableList = SortableList<Todo>
const PhotoSortableList = SortableList<Photo>

const cardStyle = (dragging: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 16px',
  border: '1px solid var(--ds-color-border)',
  borderRadius: 'var(--ds-radius-md)',
  background: dragging ? 'var(--ds-color-bgSubtle)' : 'var(--ds-color-bg)',
  fontSize: 14,
  color: 'var(--ds-color-text)',
})

// 상태를 가진 컴포넌트라 스토리 안에서 로컬 데모 래퍼로 감싼다
function TodoDemo(props: SortableListProps<Todo>) {
  const [items, setItems] = useState<Todo[]>(props.items)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
      <TodoSortableList {...props} items={items} onReorder={setItems} />
      <span style={{ fontSize: 13, color: 'var(--ds-color-secondary)' }}>
        현재 순서: {items.map((item) => item.title).join(' → ')}
      </span>
    </div>
  )
}

function PhotoDemo(props: SortableListProps<Photo>) {
  const [items, setItems] = useState<Photo[]>(props.items)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
      <PhotoSortableList {...props} items={items} onReorder={setItems} />
      <span style={{ fontSize: 13, color: 'var(--ds-color-secondary)' }}>
        첫 번째 이미지가 대표로 노출됩니다 — 현재 대표: {items[0]?.label}
      </span>
    </div>
  )
}

const meta = {
  title: 'Admin/SortableList',
  component: TodoSortableList,
  tags: ['autodocs'],
  args: {
    items: TODOS,
    getId: (item) => item.id,
    // 실제 상태는 아래 데모 래퍼가 들고 있으므로 여기서는 no-op
    onReorder: () => {},
    renderItem: (item, state) => (
      <div style={cardStyle(state.dragging)}>
        <span style={{ color: 'var(--ds-color-secondary)', fontVariantNumeric: 'tabular-nums' }}>
          {state.index + 1}
        </span>
        <span style={{ flex: 1 }}>{item.title}</span>
        <Badge variant="secondary" appearance="soft" size="sm" label={item.owner} />
      </div>
    ),
    direction: 'vertical',
    disabled: false,
    handleOnly: false,
  },
  argTypes: {
    items: { control: false },
    getId: { control: false },
    onReorder: { control: false },
    renderItem: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'padded',
  },
} satisfies Meta<SortableListProps<Todo>>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 세로 목록 — 아이템을 끌어다 놓거나, 포커스 후 `Ctrl/Cmd + ↑/↓`로 순서를 바꾼다.
 */
export const Vertical: Story = {
  render: (args) => <TodoDemo {...args} />,
}

/**
 * 그리드 — 이미지 카드 6장. 좌우로 드래그하거나 `Ctrl/Cmd + ←/→`로 순서를 바꾼다.
 */
export const Grid: Story = {
  render: () => (
    <PhotoDemo
      items={PHOTOS}
      getId={(item) => item.id}
      onReorder={() => {}}
      direction="grid"
      renderItem={(item, state) => (
        <div
          style={{
            position: 'relative',
            width: 104,
            height: 104,
            border: '1px solid var(--ds-color-border)',
            borderRadius: 'var(--ds-radius-md)',
            overflow: 'hidden',
            background: 'var(--ds-color-bgSubtle)',
          }}
        >
          <img
            src={photoUrl(item.label, item.fill)}
            alt=""
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {state.index === 0 && (
            <span style={{ position: 'absolute', left: 4, bottom: 4 }}>
              <Badge variant="primary" appearance="solid" size="sm" label="대표" />
            </span>
          )}
        </div>
      )}
    />
  ),
}

/**
 * 핸들 전용 — 카드 본문은 드래그되지 않고, 좌측 핸들에서 시작한 드래그만 순서를 바꾼다.
 * 키보드(`Ctrl/Cmd + ↑/↓`)는 핸들 없이도 그대로 동작한다.
 */
export const HandleOnly: Story = {
  args: {
    handleOnly: true,
    renderItem: (item, state) => (
      <div style={cardStyle(state.dragging)}>
        <SortableHandle />
        <span style={{ flex: 1 }}>{item.title}</span>
        <Badge variant="secondary" appearance="soft" size="sm" label={item.owner} />
      </div>
    ),
  },
  render: (args) => <TodoDemo {...args} />,
}

/**
 * 핸들 아이콘 교체 — SortableHandle의 `icon` 슬롯.
 * 그림만 바뀌고 드래그 판별(data-sortable-handle)은 그대로라 동작은 동일하다.
 */
export const CustomHandleIcon: Story = {
  args: {
    handleOnly: true,
    renderItem: (item, state) => (
      <div style={cardStyle(state.dragging)}>
        <SortableHandle icon={<Menu size={16} />} />
        <span style={{ flex: 1 }}>{item.title}</span>
        <Badge variant="secondary" appearance="soft" size="sm" label={item.owner} />
      </div>
    ),
  },
  render: (args) => <TodoDemo {...args} />,
}
