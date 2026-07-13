import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ArrowRight, RotateCw } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { Button } from '../Button/Button'
import { DashboardScreen, type DashboardFeed, type DashboardScreenProps, type DashboardTab } from './DashboardScreen'
import type { TodoSummaryItem } from '../TodoSummary/TodoSummary'
import type { AnalyticsColumn, AnalyticsSummary } from '../AnalyticsTable/AnalyticsTable'
import type { AdminChartSeries } from '../AdminChart/AdminChart'

/* ── 목데이터 ─────────────────────────────────────────────────────────────── */

const TABS: DashboardTab[] = [
  { value: 'used', label: '중고' },
  { value: 'rental', label: '렌탈' },
  { value: 'install', label: '시공' },
]

// 오늘의 할일 — 처리할 건은 신규주문 1건뿐. 나머지 0은 흐리게 눌린다
const TODO_ITEMS: TodoSummaryItem[] = [
  { key: 'new-order', label: '신규주문', count: 1 },
  { key: 'cancel', label: '취소관리', count: 0 },
  { key: 'return', label: '반품관리', count: 0 },
  { key: 'exchange', label: '교환관리', count: 0 },
  { key: 'sell-request', label: '판매신청 대기', count: 0 },
]

// 최근 주문 — 썸네일이 있는 건과 없는 건(공용 Placeholder로 대체)이 섞여 있다
const RECENT_ORDERS: DashboardFeed = {
  key: 'recent-orders',
  title: '최근 주문',
  moreLabel: '더보기',
  items: [
    {
      id: 'o-1',
      title: '삼성 비스포크 4도어 냉장고 875L 코타화이트',
      author: '김민준',
      date: '2026-07-13',
      thumbnail: mockImage('냉장고', 'slate'),
    },
    {
      id: 'o-2',
      title: 'LG 트롬 오브제컬렉션 드럼세탁기 25kg',
      author: '이서연',
      date: '2026-07-12',
      thumbnail: mockImage('세탁기', 'sage'),
    },
    { id: 'o-3', title: '캐리어 인버터 스탠드 에어컨 40평형', author: '박도윤', date: '2026-07-12' },
    { id: 'o-4', title: '코웨이 아이콘 정수기 정수·냉수 (36개월 렌탈)', author: '최지우', date: '2026-07-11' },
    { id: 'o-5', title: '한샘 유로 6000 주방 상판 교체 시공', author: '정하늘', date: '2026-07-10', kind: 'file' },
  ],
}

// 판매 신청 ③ — 제목 옆 배지 숫자
const SELL_REQUESTS: DashboardFeed = {
  key: 'sell-requests',
  title: '판매 신청',
  count: 3,
  moreLabel: '더보기',
  items: [
    {
      id: 's-1',
      title: '다이슨 V15 디텍트 앱솔루트 무선청소기',
      author: '강예은',
      date: '2026-07-13',
      thumbnail: mockImage('청소기', 'dusk'),
    },
    { id: 's-2', title: '일룸 링키플러스 책상·의자 세트 (사용감 적음)', author: '윤태호', date: '2026-07-12' },
    { id: 's-3', title: 'LG 스타일러 슈케이스 블랙 (2024년식)', author: '임수아', date: '2026-07-11', kind: 'file' },
  ],
}

// 방문자/페이지뷰 2계열 — 주말로 갈수록 한산해진다
const CHART_LABELS = ['07-07', '07-08', '07-09', '07-10', '07-11', '07-12', '07-13']

const CHART_SERIES: AdminChartSeries[] = [
  { label: '방문자', data: [3412, 2980, 3871, 2640, 1905, 842, 214], tone: 'primary' },
  { label: '페이지뷰', data: [9840, 8620, 11240, 7480, 5210, 2360, 610], tone: 'secondary' },
]

const won = (v: unknown) => (typeof v === 'number' ? `${v.toLocaleString('ko-KR')}원` : '-')

const ANALYTICS_COLUMNS: AnalyticsColumn[] = [
  { key: 'date', label: '일자', align: 'left' },
  { key: 'orders', label: '주문수', align: 'right' },
  { key: 'sales', label: '매출액', align: 'right', format: won },
  { key: 'visitors', label: '방문자', align: 'right' },
  { key: 'signups', label: '가입', align: 'right' },
  { key: 'inquiries', label: '문의', align: 'right' },
  { key: 'reviews', label: '후기', align: 'right' },
]

const ANALYTICS_ROWS: Record<string, unknown>[] = [
  { date: '2026-07-07', orders: 128, sales: 4_820_000, visitors: 3_412, signups: 24, inquiries: 9, reviews: 12 },
  { date: '2026-07-08', orders: 96, sales: 3_150_000, visitors: 2_980, signups: 18, inquiries: 4, reviews: 7 },
  { date: '2026-07-09', orders: 143, sales: 5_640_000, visitors: 3_871, signups: 31, inquiries: 12, reviews: 15 },
  { date: '2026-07-10', orders: 87, sales: 2_910_000, visitors: 2_640, signups: 12, inquiries: 3, reviews: 0 },
  { date: '2026-07-11', orders: 54, sales: 1_720_000, visitors: 1_905, signups: 7, inquiries: 0, reviews: 2 },
  { date: '2026-07-12', orders: 12, sales: 384_000, visitors: 842, signups: 0, inquiries: 0, reviews: 0 },
  { date: '2026-07-13', orders: 1, sales: 32_000, visitors: 214, signups: 0, inquiries: 1, reviews: 0 },
]

const ANALYTICS_SUMMARIES: AnalyticsSummary[] = [
  {
    label: '최근 7일 합계',
    row: { orders: 521, sales: 18_656_000, visitors: 15_864, signups: 92, inquiries: 29, reviews: 36 },
  },
  {
    label: '이번달 합계',
    row: { orders: 1_842, sales: 64_320_000, visitors: 52_470, signups: 318, inquiries: 96, reviews: 121 },
  },
]

const BASE_ARGS: DashboardScreenProps = {
  title: '대시보드',
  description: '오늘 처리할 일과 최근 유입·매출 추이를 한 화면에서 확인합니다.',
  tabs: TABS,
  activeTab: 'used',
  todoItems: TODO_ITEMS,
  feeds: [RECENT_ORDERS, SELL_REQUESTS],
  chartTitle: '방문자 · 페이지뷰 추이',
  chart: { labels: CHART_LABELS, series: CHART_SERIES, height: 280 },
  analytics: { columns: ANALYTICS_COLUMNS, rows: ANALYTICS_ROWS, summaries: ANALYTICS_SUMMARIES },
  density: 'compact',
  maxWidth: 'full',
}

/* ── 데모 래퍼 — 탭은 제어 컴포넌트라 스토리에서 상태를 쥔다 ─────────────── */

function DashboardDemo(args: DashboardScreenProps) {
  const [tab, setTab] = useState(args.activeTab ?? TABS[0]?.value)

  return (
    <DashboardScreen
      {...args}
      activeTab={tab}
      onTabChange={setTab}
      headerActions={
        <Button variant="secondary" appearance="outline" size="sm" label="새로고침" showLeftIcon leftIcon={<RotateCw size={14} />} />
      }
    />
  )
}

const meta = {
  title: 'Admin/DashboardScreen',
  component: DashboardScreen,
  tags: ['autodocs'],
  args: BASE_ARGS,
  argTypes: {
    headerActions: { control: false },
    tabs: { control: 'object' },
    feeds: { control: 'object' },
    chart: { control: 'object' },
    analytics: { control: 'object' },
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    maxWidth: { control: 'inline-radio', options: ['md', 'lg', 'full'] },
    // 피드 행 ON/OFF — 기본값은 지금까지의 피드 카드 그대로다
    showFeedThumbnail: { control: 'boolean' },
    showFeedMeta: { control: 'boolean' },
    // 아이콘 슬롯 — ReactNode라 컨트롤로는 다루지 않는다(FeedTextOnly 스토리 참고)
    moreIcon: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => <DashboardDemo {...args} />,
} satisfies Meta<typeof DashboardScreen>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 기본 — 중고/렌탈/시공 탭 + 오늘의 할일 + 2열 피드(최근 주문 · 판매 신청 ③) + 통계(차트 · 분석표).
 * 레이아웃은 전부 AdminPageLayout / AdminGrid / PageSection이 잡는다.
 */
export const Default: Story = {}

/**
 * 밀도 비교 — comfortable. 피드 행이 44 → 56px로 벌어진다.
 * (AdminPageLayout이 --admin-row-h를 심어 주고 피드 행이 그 값을 읽는다)
 */
export const Comfortable: Story = {
  args: { density: 'comfortable' },
}

/** 로딩 — 카드 골격은 그대로 두고 내용만 스켈레톤으로. 끝나도 높이가 튀지 않는다 */
export const Loading: Story = {
  args: { loading: true },
}

/**
 * 개점 첫날 — 할일 0건, 피드 비어 있음, 분석표 데이터 없음.
 * 빈 카드가 남지 않도록 각 카드가 공용 Placeholder 빈 상태를 그린다.
 */
export const Empty: Story = {
  args: {
    todoItems: TODO_ITEMS.map((item) => ({ ...item, count: 0 })),
    feeds: [
      { ...RECENT_ORDERS, items: [], emptyText: '아직 들어온 주문이 없습니다' },
      { ...SELL_REQUESTS, count: 0, items: [], emptyText: '접수된 판매 신청이 없습니다' },
    ],
    chart: { labels: CHART_LABELS, series: [{ label: '방문자', data: [0, 0, 0, 0, 0, 0, 0], tone: 'primary' }] },
    analytics: { columns: ANALYTICS_COLUMNS, rows: [], summaries: [] },
  },
}

/**
 * 클릭 가능한 대시보드 — 할일/피드/더보기에 콜백을 물린 실사용 형태.
 * 값과 콜백이 모두 props라 화면은 데이터가 시키는 대로만 그린다.
 */
export const Interactive: Story = {
  args: {
    todoItems: TODO_ITEMS.map((item) => ({
      ...item,
      // 0건은 TodoSummary가 알아서 클릭을 막는다 — 콜백은 그냥 달아 둔다
      onClick: () => console.log('todo:', item.key),
    })),
    feeds: [
      {
        ...RECENT_ORDERS,
        onMore: () => console.log('more: orders'),
        items: RECENT_ORDERS.items.map((item) => ({ ...item, onClick: () => console.log('order:', item.id) })),
      },
      {
        ...SELL_REQUESTS,
        onMore: () => console.log('more: sell-requests'),
        items: SELL_REQUESTS.items.map((item) => ({ ...item, onClick: () => console.log('request:', item.id) })),
      },
    ],
  },
}

/** 통계만 — 피드/할일 없이 차트와 분석표만. 데이터가 없는 슬롯은 통째로 사라진다 */
export const StatsOnly: Story = {
  args: {
    todoItems: [],
    feeds: [],
  },
}

/**
 * 텍스트 피드 — 썸네일·메타(작성자·날짜)를 끄면 제목만 촘촘히 쌓인다.
 * 문의·공지처럼 그림이 없는 피드에 쓴다. 더보기 아이콘도 갈아끼웠다.
 */
export const FeedTextOnly: Story = {
  args: {
    showFeedThumbnail: false,
    showFeedMeta: false,
    moreIcon: <ArrowRight size={14} aria-hidden="true" />,
    chart: undefined,
    analytics: undefined,
  },
}
