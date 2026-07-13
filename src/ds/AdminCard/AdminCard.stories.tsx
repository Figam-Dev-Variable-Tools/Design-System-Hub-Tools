import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { AdminCard, type AdminCardProps } from './AdminCard'

// 선택/상태 토글을 실제로 눌러 볼 수 있게 로컬 state를 붙인 데모
function AdminCardDemo(props: AdminCardProps) {
  const [active, setActive] = useState(props.active ?? true)
  const [selected, setSelected] = useState(props.selected ?? false)

  return (
    <div style={{ width: 300 }}>
      <AdminCard
        {...props}
        active={active}
        onToggleActive={setActive}
        selected={selected}
        onSelectChange={setSelected}
      />
    </div>
  )
}

const meta = {
  title: 'Admin/AdminCard',
  component: AdminCard,
  tags: ['autodocs'],
  args: {
    thumbnail: mockImage('', 'sand'),
    title: '겨울 울 코트',
    subtitle: '아우터 · 2026-01-08 등록',
    badges: [{ label: '신상품', tone: 'primary' }],
    // meta[0]이 카드에서 가장 크게 강조되는 대표 값이 된다
    meta: [
      { label: '가격', value: '₩189,000' },
      { label: '재고', value: '24개' },
      { label: '등록일', value: '2026-01-08' },
    ],
    active: true,
    selected: false,
    density: 'comfortable',
  },
  argTypes: {
    density: {
      control: 'inline-radio',
      options: ['comfortable', 'compact'],
    },
    onToggleActive: { control: false },
    onSelectChange: { control: false },
    onEdit: { control: false },
    onDelete: { control: false },
    onClick: { control: false },
    badges: { control: false },
    meta: { control: false },
    // ON/OFF · 문구 — 기본값은 지금까지의 카드 그대로다
    showThumbnail: { control: 'boolean' },
    showSubMeta: { control: 'boolean' },
    emptyThumbnailLabel: { control: 'text' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof AdminCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <AdminCardDemo {...args} onEdit={() => {}} onDelete={() => {}} />,
}

// 썸네일이 없으면 공용 SVG 플레이스홀더가 미디어 박스를 그대로 채운다
export const WithoutImage: Story = {
  args: {
    thumbnail: undefined,
    title: '옥스포드 셔츠',
    subtitle: '상의 · 2026-01-15 등록',
    badges: [],
    meta: [
      { label: '가격', value: '₩42,000' },
      { label: '재고', value: '132개' },
    ],
  },
  render: (args) => <AdminCardDemo {...args} onEdit={() => {}} onDelete={() => {}} />,
}

// 선택됨 — primary 보더 + primary-50 배경, 체크박스 pill 강조
export const Selected: Story = {
  args: {
    thumbnail: mockImage('', 'sage'),
    title: '경량 패딩 베스트',
    subtitle: '아우터 · 2026-02-14 등록',
    badges: [{ label: '베스트', tone: 'success' }],
    selected: true,
  },
  render: (args) => (
    <div style={{ width: 300 }}>
      <AdminCard {...args} onToggleActive={() => {}} onSelectChange={() => {}} onEdit={() => {}} onDelete={() => {}} />
    </div>
  ),
}

// 품절 배지 — 썸네일 좌상단 오버레이라 본문 여백을 흔들지 않는다
export const SoldOut: Story = {
  args: {
    thumbnail: mockImage('', 'dusk'),
    title: '캐시미어 머플러',
    subtitle: '액세서리 · 2026-01-11 등록',
    badges: [{ label: '품절', tone: 'error' }],
    meta: [
      { label: '가격', value: '₩59,000' },
      { label: '재고', value: '0개' },
    ],
    active: false,
  },
  render: (args) => <AdminCardDemo {...args} onEdit={() => {}} onDelete={() => {}} />,
}

// compact — 썸네일 4:3, 타이틀 1줄, 보조 메타 1건으로 축약
export const Compact: Story = {
  args: {
    density: 'compact',
  },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 280px)', gap: 20, alignItems: 'start' }}>
      <AdminCardDemo {...args} density="comfortable" onEdit={() => {}} onDelete={() => {}} />
      <AdminCardDemo {...args} density="compact" onEdit={() => {}} onDelete={() => {}} />
    </div>
  ),
}

/**
 * showThumbnail=false — 미디어 영역이 통째로 빠진 텍스트 전용 카드.
 * 배지·선택 체크박스는 썸네일 위 오버레이라 함께 사라진다(설정·정책처럼 그림이 없는 목록용).
 */
export const WithoutThumbnail: Story = {
  args: {
    showThumbnail: false,
    title: '무료배송 정책',
    subtitle: '2026-01-08 등록',
  },
  render: (args) => (
    <div style={{ width: 300 }}>
      <AdminCard {...args} onToggleActive={() => {}} onEdit={() => {}} onDelete={() => {}} />
    </div>
  ),
}

/** showSubMeta=false — 대표 값(가격)만 남기고 재고·등록일 줄을 접는다 */
export const WithoutSubMeta: Story = {
  args: {
    showSubMeta: false,
  },
  render: (args) => <AdminCardDemo {...args} onEdit={() => {}} onDelete={() => {}} />,
}

/** 썸네일 없음 + 문구 교체 — 플레이스홀더에 도메인 말을 적는다 */
export const CustomEmptyThumbnail: Story = {
  args: {
    thumbnail: undefined,
    emptyThumbnailLabel: '등록된 사진 없음',
  },
  render: (args) => <AdminCardDemo {...args} onEdit={() => {}} onDelete={() => {}} />,
}

// 배지 유무 · 썸네일 유무 · 타이틀 길이가 섞여도 카드 높이는 흔들리지 않는다
export const Grid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 280px)',
        gap: 20,
        alignItems: 'stretch',
      }}
    >
      <AdminCard
        thumbnail={mockImage('', 'sand')}
        title="겨울 울 코트"
        subtitle="아우터 · 2026-01-08 등록"
        badges={[{ label: '신상품', tone: 'primary' }]}
        meta={[
          { label: '가격', value: '₩189,000' },
          { label: '재고', value: '24개' },
        ]}
        active
        onToggleActive={() => {}}
        onSelectChange={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
      <AdminCard
        title="옥스포드 셔츠"
        subtitle="상의 · 2026-01-15 등록"
        meta={[
          { label: '가격', value: '₩42,000' },
          { label: '재고', value: '132개' },
        ]}
        active
        onToggleActive={() => {}}
        onSelectChange={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
      <AdminCard
        thumbnail={mockImage('', 'dusk')}
        title="레더 크로스백 — 타이틀이 길면 두 줄까지만 보이고 나머지는 말줄임 처리된다"
        subtitle="액세서리 · 2026-03-03 등록"
        badges={[{ label: '재고 부족', tone: 'warning' }]}
        meta={[
          { label: '가격', value: '₩245,000' },
          { label: '재고', value: '5개' },
        ]}
        active={false}
        onToggleActive={() => {}}
        onSelectChange={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
      <AdminCard
        thumbnail={mockImage('', 'sage')}
        title="캐시미어 머플러"
        subtitle="액세서리 · 2026-01-11 등록"
        badges={[{ label: '품절', tone: 'error' }]}
        meta={[
          { label: '가격', value: '₩59,000' },
          { label: '재고', value: '0개' },
        ]}
        active={false}
        onToggleActive={() => {}}
        selected
        onSelectChange={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  ),
}
