import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { Image, MEDIA_RATIOS, MEDIA_RATIO_LABEL } from './Image'

const meta = {
  title: '3. 컴포넌트/Media/Image',
  component: Image,
  tags: ['autodocs'],
  args: {
    ratio: '16x9',
    rounded: false,
  },
  argTypes: {
    ratio: { control: 'inline-radio', options: MEDIA_RATIOS },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Image>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSource: Story = {
  args: {
    src: mockImage('16:9'),
    alt: '샘플 이미지',
    rounded: true,
  },
}

/** 웹에서 실제로 쓰이는 비율 전체 — 어떤 비율이 있는지 한눈에 */
export const AllRatios: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 24,
        alignItems: 'start',
      }}
    >
      {MEDIA_RATIOS.map((ratio) => (
        <figure key={ratio} style={{ margin: 0 }}>
          <Image ratio={ratio} src={mockImage(MEDIA_RATIO_LABEL[ratio])} alt={ratio} rounded />
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

/** 이미지가 없을 때의 플레이스홀더(비율 박스는 그대로 유지된다) */
export const PlaceholderRatios: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 24,
        alignItems: 'start',
      }}
    >
      {MEDIA_RATIOS.map((ratio) => (
        <figure key={ratio} style={{ margin: 0 }}>
          <Image ratio={ratio} />
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
