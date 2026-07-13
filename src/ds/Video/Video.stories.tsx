import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { MEDIA_RATIOS, MEDIA_RATIO_LABEL } from '../Image/Image'
import { Video } from './Video'

const meta = {
  title: '3. 컴포넌트/Media/Video',
  component: Video,
  tags: ['autodocs'],
  args: {
    title: 'Sample video',
    ratio: '16x9',
    rounded: true,
  },
  argTypes: {
    ratio: { control: 'inline-radio', options: MEDIA_RATIOS },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Video>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Product overview',
  },
}

export const WithControls: Story = {
  args: {
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Playable video',
  },
}

/**
 * 비율 전체 — 네트워크 재생 없이 플레이스홀더로 비율 박스만 확인한다.
 * (auto는 영상 원본 비율을 따르며, 소스가 없으면 16:9로 폴백)
 */
export const AllRatios: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 24,
        alignItems: 'start',
      }}
    >
      {MEDIA_RATIOS.map((ratio) => (
        <Video key={ratio} ratio={ratio} title={MEDIA_RATIO_LABEL[ratio]} />
      ))}
    </div>
  ),
}
