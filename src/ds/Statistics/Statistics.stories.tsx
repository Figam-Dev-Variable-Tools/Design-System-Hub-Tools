import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Statistics, type StatItem } from './Statistics'

const demoStats: StatItem[] = [
  { label: '월 매출', value: '₩4.2억', delta: 12.4, hint: '지난달 대비' },
  { label: '신규 가입', value: '1,824명', delta: 3.1, hint: '지난달 대비' },
  { label: '이탈률', value: '2.4%', delta: -0.8, hint: '지난달 대비' },
]

const meta = {
  title: '3. 컴포넌트/Data/Statistics',
  component: Statistics,
  tags: ['autodocs'],
  args: {
    items: demoStats,
    columns: 3,
  },
  argTypes: {
    items: { control: 'object' },
    columns: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    appearance: {
      control: 'inline-radio',
      options: ['card', 'plain'],
      description: 'plain은 이미 보더가 있는 카드 안에 넣을 때 이중 테두리를 없앤다',
    },
    labels: { control: 'object' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Statistics>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Statistics
        columns={2}
        items={[
          { label: '총 방문자', value: '82,400명', delta: 5.2, hint: '지난주 대비' },
          { label: '전환율', value: '3.6%', delta: -1.4, hint: '지난주 대비' },
        ]}
      />
      <Statistics
        columns={4}
        items={[
          { label: '주문 수', value: '1,204건', delta: 8.1 },
          { label: '평균 객단가', value: '₩38,500', delta: 0 },
          { label: '취소율', value: '1.2%', delta: -0.3 },
          { label: '재구매율', value: '27%' },
        ]}
      />
    </div>
  ),
}

/** tone — 경고성 지표를 증감색이 아니라 카드 자체로 강조한다(왼쪽 색 띠 + 옅은 배경) */
export const Tones: Story = {
  args: {
    columns: 4,
    items: [
      { label: '월 매출', value: '₩4.2억', delta: 12.4, tone: 'primary' },
      { label: '정상 처리', value: '1,204건', delta: 8.1, tone: 'success' },
      { label: '지연 배송', value: '38건', delta: 21.0, tone: 'warning' },
      { label: '이탈률', value: '8.4%', delta: 5.2, tone: 'error' },
    ],
  },
}

/** plain — 이미 보더가 있는 카드 안에 넣을 때. 6열까지 한 줄 KPI로 늘어놓을 수 있다 */
export const PlainSixColumns: Story = {
  args: { appearance: 'plain', columns: 6 },
  render: (args) => (
    <div
      style={{
        padding: 'var(--ds-spacing-5)',
        border: 'var(--ds-border-width) solid var(--ds-color-border)',
        borderRadius: 'var(--ds-radius-lg)',
      }}
    >
      <Statistics
        {...args}
        items={[
          { label: '주문', value: '1,204' },
          { label: '매출', value: '₩4.2억' },
          { label: '방문자', value: '82,400' },
          { label: '전환율', value: '3.6%' },
          { label: '객단가', value: '₩38,500' },
          { label: '재구매', value: '27%' },
        ]}
      />
    </div>
  ),
}

/**
 * Labels: 영문 오버라이드 — 증감 표기(부호·단위)와 빈 상태 문구가 labels 통로로 화면까지 닿는다.
 * delta는 인자 1개짜리 함수라 '+12.4%'를 'up 12.4 pt'처럼 통째로 갈아끼울 수 있다.
 */
export const Labels: Story = {
  args: {
    columns: 3,
    items: [
      { label: 'Revenue', value: '$420K', delta: 12.4, hint: 'vs. last month' },
      { label: 'New signups', value: '1,824', delta: 3.1, hint: 'vs. last month' },
      { label: 'Churn', value: '2.4%', delta: -0.8, hint: 'vs. last month' },
    ],
    labels: {
      delta: (delta: number) => `${delta > 0 ? '▲' : delta < 0 ? '▼' : ''} ${Math.abs(delta)} pt`,
      deltaUp: 'increased',
      deltaDown: 'decreased',
      deltaFlat: 'unchanged',
      empty: 'No metrics to show',
    },
  },
}

/** 지표가 없을 때 — 빈 그리드가 아니라 labels.empty가 그려진다 */
export const Empty: Story = {
  args: { items: [] },
}

/** 긴 라벨·값·힌트 — 좁은 카드에서도 각 줄이 말줄임되어 카드를 뚫지 않는다 */
export const LongText: Story = {
  render: () => (
    <div style={{ width: 460, border: '1px dashed var(--ds-color-border)', padding: 12 }}>
      <Statistics
        columns={3}
        items={[
          {
            label: '아주 긴 지표 라벨이 들어간 경우입니다',
            value: '₩1,234,567,890',
            delta: 12.4,
            hint: '지난달 같은 기간 대비 증감률',
          },
          { label: '신규 가입', value: 'VeryLongUnbrokenValue123456', delta: -3.1, hint: '지난달 대비' },
          { label: '이탈률', value: '2.4%', hint: '지난달 대비' },
        ]}
      />
    </div>
  ),
}
