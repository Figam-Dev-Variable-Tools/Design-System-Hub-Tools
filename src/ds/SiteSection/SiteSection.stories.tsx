import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from '../Button/Button'
import { Checkbox } from '../Checkbox/Checkbox'
import { InputBase } from '../InputBase/InputBase'
import { Select } from '../Select/Select'
import { SiteSection } from './SiteSection'

const SORT_OPTIONS = [
  { value: 'new', label: '신상품순' },
  { value: 'low', label: '낮은 가격순' },
  { value: 'high', label: '높은 가격순' },
]

/** 섹션 안에 그대로 넣은 기존 컴포넌트들 — 라이트 단일 테마라 손댈 것이 없다 */
function ControlsDemo() {
  const [email, setEmail] = useState('')
  const [sort, setSort] = useState<string | null>('new')
  const [agreed, setAgreed] = useState(false)

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 420 }}>
      <InputBase
        label="이메일"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        helperText="입고 알림을 보내드립니다."
      />
      <Select label="정렬" value={sort} onChange={setSort} options={SORT_OPTIONS} />
      <Checkbox checked={agreed} onChange={setAgreed} label="마케팅 수신에 동의합니다" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="success" size="md" label="Subscribe" />
        <Button variant="secondary" size="md" appearance="outline" label="더 알아보기" />
        <Button variant="primary" size="md" appearance="ghost" label="Ghost" />
      </div>
    </div>
  )
}

const meta = {
  title: 'Site/SiteSection',
  component: SiteSection,
  tags: ['autodocs'],
  args: {
    title: 'New Arrivals',
    subtitle: '이번 주 새로 입고된 상품을 먼저 만나보세요.',
    accent: 'success',
    maxWidth: 'xl',
    padding: 'md',
    tone: 'plain',
    divider: true,
    children: '섹션 본문이 들어갑니다.',
  },
  argTypes: {
    accent: { control: 'inline-radio', options: ['primary', 'success'] },
    tone: { control: 'inline-radio', options: ['plain', 'subtle'] },
    children: { control: false },
    actions: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SiteSection>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 흰 면(tone="plain") */
export const Default: Story = {
  args: {
    children: <ControlsDemo />,
  },
}

/** tone="subtle" — 아주 옅은 회색 면. 흰 섹션과 교차시켜 리듬을 만든다. */
export const Subtle: Story = {
  args: {
    tone: 'subtle',
    title: 'Winter Collection',
    subtitle: '같은 컴포넌트가 옅은 회색 면 위에서도 그대로 선다.',
    children: <ControlsDemo />,
  },
}

/** 섹션 리듬 — plain → subtle → plain 교차가 페이지의 위계를 만든다(다크 밴드의 대체재) */
export const Rhythm: Story = {
  render: () => (
    <>
      <SiteSection title="Plain" subtitle="흰 면 — 기본 섹션입니다." divider>
        <ControlsDemo />
      </SiteSection>
      <SiteSection tone="subtle" title="Subtle" subtitle="옅은 회색 면 — 한 단계 뒤로 물러난다." divider>
        <ControlsDemo />
      </SiteSection>
      <SiteSection title="Plain" subtitle="다시 흰 면으로 돌아온다." divider>
        <ControlsDemo />
      </SiteSection>
    </>
  ),
  args: { children: null },
}

/** 강조색 primary — 구분선 세그먼트와 강조 텍스트가 함께 바뀐다 */
export const AccentPrimary: Story = {
  args: {
    accent: 'primary',
    title: 'All Products',
    children: (
      <p style={{ margin: 0, color: 'var(--site-accent-text)', fontWeight: 'var(--ds-font-weight-bold)' }}>
        --site-accent-text 는 흰 배경에서 AA를 통과하는 셰이드다.
      </p>
    ),
  },
}

/** 우측 상단 액션 — 정렬 Select를 헤더에 배치 */
export const WithActions: Story = {
  render: function Render(args) {
    const [sort, setSort] = useState<string | null>('new')
    return (
      <SiteSection
        {...args}
        actions={
          <div style={{ minWidth: 160 }}>
            <Select value={sort} onChange={setSort} options={SORT_OPTIONS} />
          </div>
        }
      >
        <ControlsDemo />
      </SiteSection>
    )
  },
  args: {
    title: 'All Products',
    subtitle: '헤더 우측에 액션 슬롯을 둔 예시입니다.',
    children: null,
  },
}
