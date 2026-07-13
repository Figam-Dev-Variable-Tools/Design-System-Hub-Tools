import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Minus } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Badge } from '../Badge/Badge'
import { Chip } from '../Chip/Chip'
import { Tag, type TagProps } from './Tag'

// 제거를 실제로 눌러 볼 수 있는 로컬 데모
function TagDemo(props: TagProps) {
  const [tags, setTags] = useState(['환불 요청', '배송 지연', 'VIP', '재문의'])

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 360 }}>
      {tags.map((label) => (
        <Tag
          {...props}
          key={label}
          label={label}
          onRemove={() => setTags((prev) => prev.filter((t) => t !== label))}
        />
      ))}
      {tags.length === 0 && (
        <button type="button" onClick={() => setTags(['환불 요청', '배송 지연', 'VIP', '재문의'])}>
          되돌리기
        </button>
      )}
    </div>
  )
}

const meta = {
  title: 'Admin/Tag',
  component: Tag,
  tags: ['autodocs'],
  args: {
    label: '환불 요청',
    tone: 'secondary',
    size: 'md',
    showDot: true,
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'neutral'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    onRemove: { control: false },
    showDot: { control: 'boolean', description: '톤 점' },
    removeIcon: { control: false, description: '제거 아이콘(기본 X)' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Tag {...args} tone="primary" label="문의" />
      <Tag {...args} tone="secondary" label="일반" />
      <Tag {...args} tone="success" label="답변완료" />
      <Tag {...args} tone="warning" label="보류" />
      <Tag {...args} tone="error" label="클레임" />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Tag {...args} size="sm" label="sm 분류 라벨" tone="primary" />
      <Tag {...args} size="md" label="md 분류 라벨" tone="primary" />
    </div>
  ),
}

/** 제거 가능 — 포커스를 받는 건 × 버튼뿐이라 라벨을 여러 개 나열해도 탭 순서가 깨끗하다 */
export const Removable: Story = {
  render: (args) => <TagDemo {...args} />,
}

/**
 * 점 없이 — 한 톤(secondary)으로만 쓰는 목록에서는 점이 정보를 더하지 않는다.
 * 제거 아이콘도 갈아 끼울 수 있다(기본 lucide X).
 */
export const WithoutDot: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Tag {...args} showDot={false} label="환불 요청" />
      <Tag {...args} showDot={false} label="배송 지연" />
      <Tag {...args} showDot={false} label="VIP" onRemove={() => {}} removeIcon={<Minus size={12} />} />
    </div>
  ),
}

/** 긴 라벨도 컨테이너를 넘지 않고 말줄임 처리된다 */
export const Overflow: Story = {
  render: (args) => (
    <div
      style={{
        width: 180,
        padding: 12,
        border: '1px dashed var(--ds-color-border)',
        borderRadius: 8,
      }}
    >
      <Tag
        {...args}
        tone="warning"
        label="아주 아주 아주 긴 분류 라벨 이름이 들어오는 경우"
        onRemove={() => {}}
      />
    </div>
  ),
}

/** 역할 구분 — Badge=상태 / Chip=선택·제거 / Tag=분류 */
export const VersusBadgeAndChip: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, fontFamily: 'var(--ds-font-family)' }}>
      <Row title="Badge — 상태" desc="톤이 면을 채운다. 비대화형, 제거 불가.">
        <Badge variant="success" label="답변완료" size="md" />
        <Badge variant="warning" label="확인중" size="md" />
      </Row>
      <Row title="Chip — 선택/제거" desc="pill 형태의 대화형 버튼. 필터 선택에 쓴다.">
        <Chip label="미답변" selected onSelect={() => {}} />
        <Chip label="전체" onSelect={() => {}} />
      </Row>
      <Row title="Tag — 분류" desc="중립 표면 + 톤 점. 라벨은 대화형이 아니다.">
        <Tag label="환불 요청" tone="error" />
        <Tag label="배송" tone="primary" />
        <Tag label="VIP" tone="warning" onRemove={() => {}} />
      </Row>
    </div>
  ),
}

function Row({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: ReactNode
}) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ds-color-text)' }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--ds-color-secondary)', marginBottom: 8 }}>{desc}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>
    </div>
  )
}
