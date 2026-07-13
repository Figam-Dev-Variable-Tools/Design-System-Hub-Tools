import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { AdminChart, type AdminChartSeries } from './AdminChart'

// 목데이터 — 매출/방문자 추이 (2계열)
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월']

const TREND_SERIES: AdminChartSeries[] = [
  { label: '매출', data: [3200, 4100, 3800, 5200, 4900, 6100], tone: 'primary' },
  { label: '방문자', data: [2400, 2800, 3100, 3600, 3300, 4200], tone: 'success' },
]

// 목데이터 — 주문 비율 (도넛)
const ORDER_LABELS = ['배송 완료', '배송 중', '결제 대기', '취소/환불']
const ORDER_SERIES: AdminChartSeries[] = [{ label: '주문', data: [428, 176, 92, 34] }]

// 목데이터 — 채널별 매출 누적 (스택 바)
const STACKED_SERIES: AdminChartSeries[] = [
  { label: '웹', data: [1800, 2200, 2000, 2700, 2500, 3100], tone: 'primary' },
  { label: '모바일', data: [1100, 1500, 1400, 1900, 1800, 2400], tone: 'success' },
  { label: '오프라인', data: [300, 400, 400, 600, 600, 600], tone: 'warning' },
]

const won = (n: number) => `${n.toLocaleString('ko-KR')}만원`

const meta = {
  title: 'Admin/AdminChart',
  component: AdminChart,
  tags: ['autodocs'],
  args: {
    kind: 'bar',
    labels: MONTHS,
    series: TREND_SERIES,
    title: '월별 매출 추이',
    showLegend: true,
    height: 260,
    stacked: false,
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['bar', 'donut'] },
    height: { control: { type: 'number', min: 160, max: 480, step: 20 } },
    valueFormat: { control: false },
    // 차트 크롬 ON/OFF — 기본값(전부 켜짐)은 지금까지의 차트 그대로다
    showTooltip: { control: 'boolean' },
    showGrid: { control: 'boolean' },
    showCenterTotal: { control: 'boolean' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof AdminChart>

export default meta
type Story = StoryObj<typeof meta>

// 프리셋(globals.theme) 전환 시 토큰 색을 다시 읽도록 key로 리마운트 (기존 DsChart 스토리와 동일)
export const Default: Story = {
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}

export const Donut: Story = {
  args: {
    kind: 'donut',
    labels: ORDER_LABELS,
    series: ORDER_SERIES,
    title: '주문 상태 비율',
    centerLabel: '총 주문',
    height: 280,
  },
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}

export const Stacked: Story = {
  args: {
    kind: 'bar',
    labels: MONTHS,
    series: STACKED_SERIES,
    title: '채널별 매출 (누적)',
    stacked: true,
    height: 280,
    valueFormat: won,
  },
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}

/**
 * 크롬 최소화 — 격자·툴팁·범례를 끈 스파크라인 톤. 대시보드 카드 안에 작게 얹을 때.
 * 데이터/색은 그대로다(끈 것은 읽기를 돕는 장치뿐).
 */
export const Minimal: Story = {
  args: {
    showGrid: false,
    showTooltip: false,
    showLegend: false,
    title: undefined,
    height: 180,
  },
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}

/** 도넛 가운데 총합 OFF — 합계가 옆 표에 이미 있을 때 숫자를 두 번 보여주지 않는다 */
export const DonutWithoutCenterTotal: Story = {
  args: {
    kind: 'donut',
    labels: ORDER_LABELS,
    series: ORDER_SERIES,
    title: '주문 상태 비율',
    showCenterTotal: false,
    height: 280,
  },
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}
