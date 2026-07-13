import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { AttachmentList, type Attachment, type AttachmentListProps } from './AttachmentList'

const sampleItems: Attachment[] = [
  {
    id: 'a1',
    name: '반품요청_상품사진.png',
    size: 842_310,
    type: 'image/png',
    url: mockImage('사진 1', 'slate'),
    thumbnail: mockImage('사진 1', 'slate'),
  },
  {
    id: 'a2',
    name: '개봉영상.mp4',
    size: 18_432_000,
    type: 'video/mp4',
    url: 'https://example.com/clip.mp4',
  },
  {
    id: 'a3',
    name: '주문내역_영수증.pdf',
    size: 231_004,
    type: 'application/pdf',
  },
  {
    id: 'a4',
    name: '문의내용정리.hwp',
    size: 47_820,
    type: 'application/x-hwp',
  },
  {
    id: 'a5',
    name: 'logs.zip',
    size: 5_120,
    type: 'application/zip',
  },
]

// 삭제를 실제로 눌러 볼 수 있는 로컬 데모
function AttachmentListDemo(props: AttachmentListProps) {
  const [items, setItems] = useState(props.items)

  return (
    <div style={{ width: 460, maxWidth: '100%' }}>
      <AttachmentList
        {...props}
        items={items}
        onRemove={(a) => setItems((prev) => prev.filter((i) => i.id !== a.id))}
      />
      {items.length === 0 && (
        <button type="button" style={{ marginTop: 12 }} onClick={() => setItems(sampleItems)}>
          되돌리기
        </button>
      )}
    </div>
  )
}

const meta = {
  title: 'Admin/AttachmentList',
  component: AttachmentList,
  tags: ['autodocs'],
  args: {
    items: sampleItems,
    compact: false,
    downloadAllLabel: '전체 다운로드',
  },
  argTypes: {
    items: { control: 'object' },
    compact: { control: 'boolean' },
    onDownload: { control: false },
    onRemove: { control: false },
    onPreview: { control: false },
    onDownloadAll: { control: false },
    // ON/OFF — 끄면 그 요소가 DOM에서 사라진다
    showHeader: { control: 'boolean' },
    showSummary: { control: 'boolean' },
    showThumbnail: { control: 'boolean' },
    showMeta: { control: 'boolean' },
    // 문구
    emptyText: { control: 'text' },
    downloadAllLabel: { control: 'text' },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    previewIcon: { control: false },
    downloadIcon: { control: false },
    removeIcon: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof AttachmentList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onDownload: () => {},
    onPreview: () => {},
    onDownloadAll: () => {},
  },
  render: (args) => (
    <div style={{ width: 460, maxWidth: '100%' }}>
      <AttachmentList {...args} />
    </div>
  ),
}

/** 조밀한 행 — 상세 패널 사이드바처럼 폭이 좁은 자리 */
export const Compact: Story = {
  args: {
    compact: true,
    onDownload: () => {},
    onPreview: () => {},
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <AttachmentList {...args} />
    </div>
  ),
}

/** 삭제 가능 — 목록에서 실제로 지워진다 */
export const Removable: Story = {
  args: {
    onDownload: () => {},
    onPreview: () => {},
    onDownloadAll: () => {},
  },
  render: (args) => <AttachmentListDemo {...args} />,
}

/** 읽기 전용 — 다운로드만 가능(첨부 확인 화면) */
export const ReadOnly: Story = {
  args: {
    onDownload: () => {},
  },
  render: (args) => (
    <div style={{ width: 460 }}>
      <AttachmentList {...args} />
    </div>
  ),
}

/** 빈 상태 — 공용 EmptyState(kind="file"). emptyText로 문구를 바꾼다 */
export const Empty: Story = {
  args: { items: [], emptyText: '아직 첨부된 파일이 없습니다.' },
  render: (args) => (
    <div style={{ width: 460 }}>
      <AttachmentList {...args} />
    </div>
  ),
}

/**
 * ON/OFF — 헤더·썸네일·메타를 모두 끈 최소 구성(파일명 + 액션만).
 * 좁은 사이드바나, 목록 위쪽에서 이미 건수를 보여 주는 화면에서 쓴다.
 */
export const MinimalToggles: Story = {
  args: {
    showHeader: false,
    showThumbnail: false,
    showMeta: false,
    compact: true,
    onDownload: () => {},
    onRemove: () => {},
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <AttachmentList {...args} />
    </div>
  ),
}

/** 헤더에서 요약만 끈 형태 — [전체 다운로드]만 우측에 남는다 */
export const HeaderWithoutSummary: Story = {
  args: {
    showSummary: false,
    onDownload: () => {},
    onDownloadAll: () => {},
  },
  render: (args) => (
    <div style={{ width: 460 }}>
      <AttachmentList {...args} />
    </div>
  ),
}

/** 긴 파일명도 컨테이너를 넘지 않고 말줄임 처리된다 */
export const LongFileName: Story = {
  args: {
    items: [
      {
        id: 'long',
        name: '2026년-1분기-고객문의-반품요청-상세내역-정리본-최종-진짜최종-v3.xlsx',
        size: 3_204_000,
        type: 'application/vnd.ms-excel',
      },
      ...sampleItems.slice(0, 2),
    ],
    onDownload: () => {},
    onRemove: () => {},
    onPreview: () => {},
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <AttachmentList {...args} />
    </div>
  ),
}
