import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Loading } from './Loading'

const meta = {
  title: '3. 컴포넌트/Feedback/Loading',
  component: Loading,
  tags: ['autodocs'],
  args: {
    variant: 'spinner',
    size: 'md',
    label: '불러오는 중',
    overlay: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['spinner', 'dots'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    label: {
      control: 'text',
      description: '인디케이터 아래 보이는 글자 — 있으면 접근성 이름도 겸한다',
    },
    labels: { control: false, description: '접근성 이름(loading) — label을 넘기면 그쪽이 이긴다' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Loading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * 문구 오버라이드 — 글자 없는 스피너에도 접근성 이름은 남아야 한다(기본 '로딩 중').
 * label(보이는 글자)을 주면 그쪽이 이름을 가져가므로, 여기서는 label을 비우고 labels만 넘긴다.
 */
export const Labels: Story = {
  args: { label: undefined, labels: { loading: 'Loading' } },
  render: (args) => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      {/* 이름만 영문으로 바뀐다(화면에는 글자가 없다) */}
      <Loading {...args} />
      {/* 글자까지 영문으로 — label이 이름을 겸한다 */}
      <Loading {...args} label="Loading…" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        <Loading variant="spinner" size="sm" />
        <Loading variant="spinner" size="md" />
        <Loading variant="spinner" size="lg" />
      </div>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        <Loading variant="dots" size="sm" />
        <Loading variant="dots" size="md" />
        <Loading variant="dots" size="lg" />
      </div>
      <Loading variant="spinner" size="md" label="불러오는 중" />
      <div
        style={{
          position: 'relative',
          width: 200,
          height: 120,
          border: '1px solid var(--ds-color-border)',
          borderRadius: 8,
          padding: 12,
          fontSize: 13,
          color: 'var(--ds-color-secondary)',
        }}
      >
        콘텐츠 영역
        <Loading overlay label="불러오는 중" />
      </div>
    </div>
  ),
}
