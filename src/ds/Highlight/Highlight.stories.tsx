import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { SiteSection } from '../SiteSection/SiteSection'
import { Highlight } from './Highlight'

/**
 * 문장 안의 한 단어만 강조색으로 세우는 인라인 텍스트.
 * 히어로 헤드라인(`태산, 자연의 가치를…`)의 강조어처럼, 페이지마다 색을 새로 지정하던 자리를 대체한다.
 */
const meta = {
  title: 'Site/Highlight',
  component: Highlight,
  tags: ['autodocs'],
  args: {
    children: '자연',
    tone: 'accent',
    weight: 'inherit',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['accent', 'primary', 'success', 'warning', 'error'],
      description: 'accent는 SiteSection이 내려주는 강조색을 상속한다(섹션 밖이면 primary).',
    },
    weight: { control: 'inline-radio', options: ['inherit', 'bold'] },
    children: { control: 'text' },
  },
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Highlight>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 단독(섹션 밖)이라 primary로 폴백한다. */
export const Default: Story = {}

/** 헤드라인 안 — SiteSection(accent=success) 안에서는 섹션의 그린을 그대로 따른다. */
export const InHeadline: Story = {
  render: (args) => (
    <SiteSection
      accent="success"
      align="center"
      title={
        <>
          태산, <Highlight {...args} />의 가치를 공간에 담다.
        </>
      }
      subtitle="강조어의 색은 섹션이 소유하고, Highlight는 소비만 한다."
    >
      <></>
    </SiteSection>
  ),
}

/** 톤 — 흰 배경에서 AA(4.5:1)를 넘는 셰이드만 노출한다. */
export const Tones: Story = {
  render: () => (
    <p style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.6, margin: 0 }}>
      <Highlight tone="primary">primary</Highlight> · <Highlight tone="success">success</Highlight> ·{' '}
      <Highlight tone="warning">warning</Highlight> · <Highlight tone="error">error</Highlight>
    </p>
  ),
}
