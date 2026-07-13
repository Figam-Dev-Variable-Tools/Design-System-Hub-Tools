import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import {
  MainVisualUploader,
  type MainVisualItem,
  type MainVisualUploaderProps,
} from './MainVisualUploader'

/** 외부 이미지 대신 사용하는 인라인 SVG 플레이스홀더 (1920×640 비율) */
const banner = (label: string, fill: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="160"><rect width="100%" height="100%" fill="${fill}"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#6B7684" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`,
  )}`

const SAMPLE_ITEMS: MainVisualItem[] = [
  {
    id: 'banner-summer',
    imageUrl: banner('여름 시즌 오프', '#E5E8EB'),
    title: '여름 시즌 오프 최대 50%',
    link: 'https://example.com/event/summer',
    visible: true,
  },
  {
    id: 'banner-new',
    imageUrl: banner('신상품 입고', '#D1D6DB'),
    title: '신상품 입고 안내',
    link: 'https://example.com/new',
    visible: true,
  },
  {
    id: 'banner-notice',
    imageUrl: banner('배송 지연 공지', '#F2F4F6'),
    title: '추석 연휴 배송 지연 안내',
    visible: false,
  },
]

// 상태를 가진 컴포넌트라 스토리 안에서 로컬 데모 래퍼로 감싼다
function MainVisualUploaderDemo(props: MainVisualUploaderProps) {
  const [items, setItems] = useState<MainVisualItem[]>(props.items)
  return <MainVisualUploader {...props} items={items} onChange={setItems} />
}

const meta = {
  title: 'Admin/MainVisualUploader',
  component: MainVisualUploader,
  tags: ['autodocs'],
  args: {
    items: [],
    // 실제 상태는 아래 데모 래퍼가 들고 있으므로 여기서는 no-op
    onChange: () => {},
    max: 8,
    ratioHint: '권장 1920×640',
  },
  argTypes: {
    onChange: { control: false },
    // ON/OFF — 끄면 그 컨트롤이 DOM에서 사라진다
    showLinkField: { control: 'boolean' },
    showVisibleToggle: { control: 'boolean' },
    showMoveButtons: { control: 'boolean' },
    showOrder: { control: 'boolean' },
    // 문구
    addLabel: { control: 'text' },
    ratioHint: { control: 'text' },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    moveUpIcon: { control: false },
    moveDownIcon: { control: false },
    removeIcon: { control: false },
    addIcon: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'padded',
  },
} satisfies Meta<typeof MainVisualUploader>

export default meta
type Story = StoryObj<typeof meta>

/** 배너가 없는 초기 상태 — DropZone만 노출된다 */
export const Default: Story = {
  render: (args) => <MainVisualUploaderDemo {...args} />,
}

/**
 * 메인비주얼 관리 — 노출 중 2건, 비노출 1건이 등록된 실제 시나리오.
 * 좌측 핸들을 끌어 노출 순서를 바꾸거나, 항목에 포커스한 뒤 `Ctrl/Cmd + ↑/↓`로 이동할 수 있다.
 * 기존 위/아래 버튼도 그대로 동작한다.
 */
export const BannerList: Story = {
  args: {
    items: SAMPLE_ITEMS,
  },
  render: (args) => <MainVisualUploaderDemo {...args} />,
}

/** 최대 개수에 도달하면 DropZone이 비활성화된다 */
export const MaxReached: Story = {
  args: {
    items: SAMPLE_ITEMS,
    max: 3,
  },
  render: (args) => <MainVisualUploaderDemo {...args} />,
}

/**
 * ON/OFF — 링크 필드·노출 토글·위아래 버튼·순서 배지를 모두 끈 최소 구성.
 * 제목만 붙는 단순 이미지 슬라이드(드래그로만 순서를 바꾸는 화면)에 쓴다.
 */
export const MinimalToggles: Story = {
  args: {
    items: SAMPLE_ITEMS,
    showLinkField: false,
    showVisibleToggle: false,
    showMoveButtons: false,
    showOrder: false,
  },
  render: (args) => <MainVisualUploaderDemo {...args} />,
}

/** 드래그 전용 — 위/아래 버튼만 끄고 노출 토글은 남긴다 */
export const WithoutMoveButtons: Story = {
  args: {
    items: SAMPLE_ITEMS,
    showMoveButtons: false,
  },
  render: (args) => <MainVisualUploaderDemo {...args} />,
}

/** 문구 교체 — 하단 드롭존 라벨을 화면 결에 맞춘다 */
export const CustomAddLabel: Story = {
  args: {
    items: SAMPLE_ITEMS.slice(0, 1),
    addLabel: '슬라이드 추가',
    ratioHint: '권장 1440×480',
  },
  render: (args) => <MainVisualUploaderDemo {...args} />,
}
