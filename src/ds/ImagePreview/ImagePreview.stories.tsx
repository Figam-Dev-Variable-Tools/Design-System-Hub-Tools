import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { Button } from '../Button/Button'
import { ImagePreview, type ImagePreviewItem, type ImagePreviewProps } from './ImagePreview'

const sampleItems: ImagePreviewItem[] = [
  { url: mockImage('사진 1', 'slate'), name: '반품요청_상품사진.png', kind: 'image' },
  { url: mockImage('사진 2', 'sand'), name: '택배박스_훼손.jpg', kind: 'image' },
  { url: '', name: '개봉영상.mp4', kind: 'video' },
  { url: mockImage('사진 3', 'sage'), name: '라벨_클로즈업.jpg', kind: 'image' },
  { url: mockImage('사진 4', 'dusk'), name: '동봉된_영수증.jpg', kind: 'image' },
]

// index를 실제로 움직여 보는 컨트롤드 데모 — 오버레이가 열리고 닫힌다
function ImagePreviewDemo(props: ImagePreviewProps) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <>
      <Button variant="primary" size="md" label="첨부 미리보기 열기" onClick={() => setOpen(true)} />
      <ImagePreview
        {...props}
        open={open}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

// inline 정적 렌더도 좌우 이동이 동작하게 index만 붙인 데모
function ImagePreviewInlineDemo(props: ImagePreviewProps) {
  const [index, setIndex] = useState(props.index ?? 0)
  return <ImagePreview {...props} inline open index={index} onIndexChange={setIndex} />
}

const meta = {
  title: 'Admin/ImagePreview',
  component: ImagePreview,
  tags: ['autodocs'],
  args: {
    open: true,
    items: sampleItems,
    index: 0,
    inline: true,
  },
  argTypes: {
    items: { control: 'object' },
    index: { control: { type: 'number', min: 0 } },
    inline: { control: 'boolean' },
    onClose: { control: false },
    onIndexChange: { control: false },
    // ON/OFF — 끄면 그 영역이 DOM에서 사라진다
    showHeader: { control: 'boolean' },
    showCount: { control: 'boolean' },
    showZoom: { control: 'boolean' },
    showNav: { control: 'boolean' },
    showThumbnails: { control: 'boolean' },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    closeIcon: { control: false },
    prevIcon: { control: false },
    nextIcon: { control: false },
    zoomInIcon: { control: false },
    zoomOutIcon: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof ImagePreview>

export default meta
type Story = StoryObj<typeof meta>

/** inline 정적 렌더 — 좌우 버튼·썸네일 스트립·확대 모두 동작 */
export const Default: Story = {
  render: (args) => <ImagePreviewInlineDemo {...args} />,
}

/** 실제 오버레이 — 방향키 이동, Esc 닫기 */
export const Overlay: Story = {
  args: { open: false, inline: false },
  render: (args) => <ImagePreviewDemo {...args} />,
}

/** 동영상 항목 — 기존 Video 컴포넌트를 재사용한다 */
export const VideoItem: Story = {
  args: { index: 2 },
  render: (args) => <ImagePreviewInlineDemo {...args} />,
}

/** 단일 항목 — 좌우 이동·썸네일 스트립이 사라진다 */
export const Single: Story = {
  args: {
    items: [sampleItems[0]],
  },
  render: (args) => <ImagePreviewInlineDemo {...args} />,
}

/** 이미지 URL이 없으면 공용 Placeholder kind="image" size="fill" */
export const NoImage: Story = {
  args: {
    items: [{ url: '', name: '삭제된_첨부.png', kind: 'image' }],
  },
  render: (args) => <ImagePreviewInlineDemo {...args} />,
}

/**
 * 확대 없이 — 카운터는 남기고 확대/축소 컨트롤만 끈 형태.
 * 로고·아이콘처럼 원본이 작아 확대할 이유가 없는 첨부에 쓴다.
 */
export const WithoutZoom: Story = {
  args: { showZoom: false },
  render: (args) => <ImagePreviewInlineDemo {...args} />,
}

/**
 * 스테이지만 — 헤더(파일명·카운터·확대·닫기)와 좌우 이동, 썸네일 스트립을 모두 끈다.
 * 상세 페이지 안에 이미지 한 장을 크게 박아 넣는 자리에서 쓴다(닫기가 없으니 inline 전용).
 */
export const StageOnly: Story = {
  args: {
    showHeader: false,
    showNav: false,
    showThumbnails: false,
  },
  render: (args) => <ImagePreviewInlineDemo {...args} />,
}

/** 썸네일 스트립만 끈 형태 — 좌우 버튼과 카운터로만 이동한다 */
export const WithoutThumbnails: Story = {
  args: { showThumbnails: false },
  render: (args) => <ImagePreviewInlineDemo {...args} />,
}
