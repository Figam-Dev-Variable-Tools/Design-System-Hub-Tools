import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { MEDIA_RATIOS, MEDIA_RATIO_LABEL } from '../Image/Image'
import { ImageSlide } from './ImageSlide'

const meta = {
  title: '3. 컴포넌트/Media/ImageSlide',
  component: ImageSlide,
  tags: ['autodocs'],
  args: {
    ratio: '16x9',
  },
  argTypes: {
    ratio: { control: 'inline-radio', options: MEDIA_RATIOS },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof ImageSlide>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithImages: Story = {
  args: {
    images: [mockImage('1', 'slate'), mockImage('2', 'sand'), mockImage('3', 'sage')],
  },
}

/** 비율 전체 — 슬라이드 뷰포트가 각 비율을 유지하는지 확인 */
export const AllRatios: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 24,
        alignItems: 'start',
      }}
    >
      {MEDIA_RATIOS.map((ratio) => (
        <figure key={ratio} style={{ margin: 0 }}>
          <ImageSlide
            ratio={ratio}
            images={[mockImage(MEDIA_RATIO_LABEL[ratio], 'slate'), mockImage('2', 'sand')]}
          />
          <figcaption
            style={{
              marginTop: 8,
              fontSize: 12,
              fontFamily: 'var(--ds-font-family)',
              color: 'var(--ds-color-secondary)',
            }}
          >
            {MEDIA_RATIO_LABEL[ratio]}
          </figcaption>
        </figure>
      ))}
    </div>
  ),
}
