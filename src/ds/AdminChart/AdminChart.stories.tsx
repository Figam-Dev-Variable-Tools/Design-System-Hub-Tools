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
    categories: MONTHS,
    series: TREND_SERIES,
    title: '월별 매출 추이',
    showLegend: true,
    height: 260,
    stacked: false,
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['bar', 'donut', 'line', 'area'] },
    height: { control: { type: 'number', min: 160, max: 480, step: 20 } },
    valueFormat: { control: false },
    // 차트 크롬 ON/OFF — 기본값(전부 켜짐)은 지금까지의 차트 그대로다
    showTooltip: { control: 'boolean' },
    showGrid: { control: 'boolean' },
    showCenterTotal: { control: 'boolean' },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'horizontal은 카테고리 라벨이 긴 랭킹용(bar에만 적용)',
    },
    legendPosition: { control: 'inline-radio', options: ['top', 'right', 'bottom'] },
    title: { control: 'text', description: '@deprecated — labels.title을 쓰세요' },
    centerLabel: { control: 'text', description: '@deprecated — labels.centerCaption을 쓰세요' },
    // 문구 통로 — 다른 컴포넌트와 같은 이름(labels)이다. x축 카테고리 데이터는 categories가 갖는다
    labels: { control: 'object' },
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
    categories: ORDER_LABELS,
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
    categories: MONTHS,
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
    categories: ORDER_LABELS,
    series: ORDER_SERIES,
    title: '주문 상태 비율',
    showCenterTotal: false,
    height: 280,
  },
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}

/** line — 기간 추세. 매출 추이를 막대가 아니라 제 모양(선)으로 그린다 */
export const Line: Story = {
  args: {
    kind: 'line',
    categories: MONTHS,
    series: TREND_SERIES,
    title: '월별 매출 추이',
    valueFormat: won,
  },
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}

/** area — 선 아래를 옅게 채운다. 누적이 아니라 '양'을 강조할 때 */
export const Area: Story = {
  args: {
    kind: 'area',
    categories: MONTHS,
    series: [TREND_SERIES[0]],
    title: '월별 매출',
    valueFormat: won,
  },
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}

/** horizontal — 카테고리 라벨이 긴 랭킹(상품명·유입경로)은 가로 막대라야 읽힌다 */
export const HorizontalBar: Story = {
  args: {
    kind: 'bar',
    orientation: 'horizontal',
    categories: ['네이버 검색', '인스타그램 광고', '카카오 채널', '직접 유입', '제휴 뉴스레터'],
    series: [{ label: '유입', data: [4820, 3610, 2940, 1870, 920], tone: 'primary' }],
    title: '유입 경로 TOP 5',
    showLegend: false,
    height: 280,
  },
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}

/** legendPosition="right" — 좁은 카드에 도넛을 넣을 때 세로 공간을 두 번 먹지 않는다 */
export const LegendRight: Story = {
  args: {
    kind: 'donut',
    categories: ORDER_LABELS,
    series: ORDER_SERIES,
    title: '주문 상태 비율',
    legendPosition: 'right',
    centerLabel: '총 주문',
    height: 220,
  },
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}

/**
 * Labels: 영문 오버라이드 — 제목·도넛 가운데 문구뿐 아니라, 지금까지 스크린리더에
 * 아무것도 읽히지 않던 <canvas>의 접근성 이름·요약까지 통로로 열린다.
 *
 * 문구 통로의 이름은 다른 컴포넌트와 같은 `labels`다 — x축 카테고리 '데이터'는 `categories`가 갖는다.
 */
export const Labels: Story = {
  args: {
    kind: 'donut',
    categories: ['Delivered', 'Shipping', 'Pending', 'Refunded'],
    series: ORDER_SERIES,
    title: undefined,
    centerLabel: undefined,
    height: 280,
    valueFormat: (n: number) => n.toLocaleString('en-US'),
    labels: {
      title: 'Order status breakdown',
      centerCaption: 'Total orders',
      ariaLabel: 'Order status breakdown, donut chart',
      ariaDescription:
        'Delivered 428, Shipping 176, Pending 92, Refunded 34. Total 730 orders.',
      empty: 'No orders in this period',
    },
  },
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}

/** 데이터가 없을 때 — 빈 격자가 아니라 labels.empty가 그려진다 */
export const Empty: Story = {
  args: {
    kind: 'bar',
    categories: [],
    series: [],
    title: '월별 매출 추이',
  },
  render: (args, { globals }) => <AdminChart key={String(globals.theme)} {...args} />,
}
