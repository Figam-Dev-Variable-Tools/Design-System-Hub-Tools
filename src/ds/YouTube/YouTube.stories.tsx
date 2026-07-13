import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { MEDIA_RATIOS, MEDIA_RATIO_LABEL } from '../Image/Image'
import { YouTube } from './YouTube'

const meta = {
  title: '3. 컴포넌트/Media/YouTube',
  component: YouTube,
  tags: ['autodocs'],
  args: {
    id: 'dQw4w9WgXcQ',
    title: 'YouTube video',
    ratio: '16x9',
  },
  argTypes: {
    ratio: { control: 'inline-radio', options: MEDIA_RATIOS },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof YouTube>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * 비율 전체 — 오프라인에서는 iframe이 빈 박스로 보이며,
 * 확인 포인트는 각 비율의 박스가 그대로 유지되는지다.
 * (iframe은 내재 비율이 없어 auto는 16:9로 폴백)
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
        <figure key={ratio} style={{ margin: 0 }}>
          <YouTube ratio={ratio} title={`YouTube ${MEDIA_RATIO_LABEL[ratio]}`} />
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
