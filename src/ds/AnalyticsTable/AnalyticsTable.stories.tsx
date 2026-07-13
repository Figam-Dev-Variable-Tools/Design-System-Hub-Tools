import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { AnalyticsTable, type AnalyticsColumn, type AnalyticsSummary } from './AnalyticsTable'

// 표기 헬퍼 — 매출액은 원화, 그 외 숫자는 컴포넌트 기본 표기(자릿수 구분)에 맡긴다
const won = (v: unknown) => (typeof v === 'number' ? `${v.toLocaleString('ko-KR')}원` : '-')

const COLUMNS: AnalyticsColumn[] = [
  { key: 'date', label: '일자', align: 'left' },
  { key: 'orders', label: '주문수', align: 'right' },
  { key: 'sales', label: '매출액', align: 'right', format: won },
  { key: 'visitors', label: '방문자', align: 'right' },
  { key: 'signups', label: '가입', align: 'right' },
  { key: 'inquiries', label: '문의', align: 'right' },
  { key: 'reviews', label: '후기', align: 'right' },
]

// 목데이터 — 최근 7일. 주말로 갈수록 한산해지고 0건이 섞인다
const ROWS: Record<string, unknown>[] = [
  { date: '2026-07-07', orders: 128, sales: 4_820_000, visitors: 3_412, signups: 24, inquiries: 9, reviews: 12 },
  { date: '2026-07-08', orders: 96, sales: 3_150_000, visitors: 2_980, signups: 18, inquiries: 4, reviews: 7 },
  { date: '2026-07-09', orders: 143, sales: 5_640_000, visitors: 3_871, signups: 31, inquiries: 12, reviews: 15 },
  { date: '2026-07-10', orders: 87, sales: 2_910_000, visitors: 2_640, signups: 12, inquiries: 3, reviews: 0 },
  { date: '2026-07-11', orders: 54, sales: 1_720_000, visitors: 1_905, signups: 7, inquiries: 0, reviews: 2 },
  { date: '2026-07-12', orders: 12, sales: 384_000, visitors: 842, signups: 0, inquiries: 0, reviews: 0 },
  { date: '2026-07-13', orders: 1, sales: 32_000, visitors: 214, signups: 0, inquiries: 1, reviews: 0 },
]

const SUMMARIES: AnalyticsSummary[] = [
  {
    label: '합계',
    row: { orders: 521, sales: 18_656_000, visitors: 15_864, signups: 92, inquiries: 29, reviews: 36 },
  },
]

const meta = {
  title: 'Admin/AnalyticsTable',
  component: AnalyticsTable,
  tags: ['autodocs'],
  args: {
    columns: COLUMNS,
    rows: ROWS,
    summaries: SUMMARIES,
  },
  argTypes: {
    columns: { control: 'object' },
    rows: { control: 'object' },
    summaries: { control: 'object' },
    // ON/OFF · 문구 — dense만 기본 false(나머지는 지금까지의 표 그대로)
    showHeader: { control: 'boolean' },
    dimZero: { control: 'boolean' },
    dense: { control: 'boolean' },
    emptyText: { control: 'text' },
    emptyDescription: { control: 'text' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof AnalyticsTable>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 일자별 지표 + 하단 합계 행. 0은 흐리게, 숫자는 우측 정렬 */
export const Default: Story = {}

/** 요약 2줄 — 합계 · 일 평균이 아래에서부터 차곡차곡 고정된다 */
export const MultipleSummaries: Story = {
  args: {
    summaries: [
      {
        label: '일 평균',
        row: { orders: 74, sales: 2_665_143, visitors: 2_266, signups: 13, inquiries: 4, reviews: 5 },
      },
      {
        label: '합계',
        row: { orders: 521, sales: 18_656_000, visitors: 15_864, signups: 92, inquiries: 29, reviews: 36 },
      },
    ],
  },
}

/** 요약 행 없이 — 순수 데이터 표 */
export const WithoutSummary: Story = {
  args: { summaries: [] },
}

/** 개점 휴업 — 전 지표 0. 표 전체가 흐리게 눌린다 */
export const AllZero: Story = {
  args: {
    rows: ROWS.map((row) => ({
      date: row.date,
      orders: 0,
      sales: 0,
      visitors: 0,
      signups: 0,
      inquiries: 0,
      reviews: 0,
    })),
    summaries: [
      { label: '합계', row: { orders: 0, sales: 0, visitors: 0, signups: 0, inquiries: 0, reviews: 0 } },
    ],
  },
}

/** 데이터 없음 — 공용 Placeholder 빈 상태 */
export const Empty: Story = {
  args: { rows: [], summaries: [] },
}

/**
 * 높이를 제한한 컨테이너(대시보드 카드) — 세로 스크롤 중에도
 * 헤더는 위, 합계 행은 아래에 고정된다.
 */
export const StickySummary: Story = {
  args: {
    rows: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      orders: i % 7 === 6 ? 0 : 40 + ((i * 13) % 120),
      sales: i % 7 === 6 ? 0 : 1_200_000 + ((i * 137_000) % 4_800_000),
      visitors: 900 + ((i * 271) % 3_100),
      signups: i % 5 === 4 ? 0 : (i * 3) % 29,
      inquiries: i % 4 === 3 ? 0 : i % 11,
      reviews: i % 3 === 2 ? 0 : i % 8,
    })),
  },
  render: (args) => (
    <div style={{ height: 320, background: 'var(--ds-color-bgSubtle)', padding: 20 }}>
      <AnalyticsTable {...args} />
    </div>
  ),
}

/** 좁은 폭 — 셀이 줄바꿈으로 짜부라지지 않고 래퍼가 가로로 스크롤된다 */
export const NarrowScroll: Story = {
  render: (args) => (
    <div style={{ width: 420, background: 'var(--ds-color-bgSubtle)', padding: 20 }}>
      <AnalyticsTable {...args} />
    </div>
  ),
}

/**
 * dense — 행 44 → 36px. 합계 행 sticky offset도 함께 따라오므로
 * 높이를 제한한 카드 안에서 더 많은 날짜를 한눈에 훑을 수 있다.
 */
export const Dense: Story = {
  args: { dense: true },
  render: (args) => (
    <div style={{ height: 320, background: 'var(--ds-color-bgSubtle)', padding: 20 }}>
      <AnalyticsTable {...args} />
    </div>
  ),
}

/** 헤더 OFF — 컬럼이 자명한 미니 표(대시보드 카드 안 등)에서 헤더 줄을 없앤다 */
export const WithoutHeader: Story = {
  args: { showHeader: false },
}

/** dimZero OFF — 0이 '없음'이 아니라 유효한 값인 표(잔액·재고)에서는 흐리게 누르지 않는다 */
export const KeepZeroTone: Story = {
  args: {
    dimZero: false,
    rows: ROWS.slice(4),
  },
}

/** 빈 상태 문구 교체 — 제목/보조 문구를 도메인 말로 */
export const CustomEmptyCopy: Story = {
  args: {
    rows: [],
    summaries: [],
    emptyText: '집계된 방문 기록이 없습니다',
    emptyDescription: '수집 스크립트가 설치됐는지 확인해 보세요.',
  },
}

/** 정렬 자동 판정 — align을 비워 두면 숫자 컬럼만 우측 정렬된다 */
export const AutoAlign: Story = {
  args: {
    columns: [
      { key: 'date', label: '일자' },
      { key: 'channel', label: '유입 채널' },
      { key: 'orders', label: '주문수' },
      { key: 'sales', label: '매출액', format: won },
    ],
    rows: [
      { date: '2026-07-11', channel: '검색', orders: 32, sales: 1_240_000 },
      { date: '2026-07-12', channel: '광고', orders: 0, sales: 0 },
      { date: '2026-07-13', channel: '직접 유입', orders: 8, sales: 296_000 },
    ],
    summaries: [{ label: '합계', row: { channel: '-', orders: 40, sales: 1_536_000 } }],
  },
}
