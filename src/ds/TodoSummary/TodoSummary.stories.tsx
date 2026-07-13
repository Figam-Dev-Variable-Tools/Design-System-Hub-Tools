import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { TodoSummary, type TodoSummaryItem } from './TodoSummary'

// 목데이터 — 쇼핑몰 어드민 대시보드 상단의 "오늘의 할일"
const TODO_ITEMS: TodoSummaryItem[] = [
  { key: 'newOrder', label: '신규주문', count: 1 },
  { key: 'cancel', label: '취소관리', count: 0 },
  { key: 'return', label: '반품관리', count: 0 },
  { key: 'exchange', label: '교환관리', count: 0 },
  { key: 'sellerApply', label: '판매신청 대기', count: 0 },
]

const meta = {
  title: 'Admin/TodoSummary',
  component: TodoSummary,
  tags: ['autodocs'],
  args: {
    title: '오늘의 할일',
    items: TODO_ITEMS,
  },
  argTypes: {
    title: { control: 'text' },
    total: { control: 'number' },
    items: { control: 'object' },
    // ON/OFF · 문구 — 기본값은 지금까지의 요약 줄 그대로다
    showHeader: { control: 'boolean' },
    showTotalBadge: { control: 'boolean' },
    countUnit: { control: 'text' },
    // 변형 축 — 기본값(inline · md · framed)이 지금까지의 요약 줄이다
    layout: { control: 'inline-radio', options: ['inline', 'grid', 'stack'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    framed: { control: 'boolean' },
    labels: { control: 'object' },
    formatters: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof TodoSummary>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 신규주문 1건만 primary 굵게, 나머지 0건은 흐리게 */
export const Default: Story = {}

/** 처리할 건이 많은 날 — 1건 이상 항목이 모두 살아난다 */
export const Busy: Story = {
  args: {
    items: [
      { key: 'newOrder', label: '신규주문', count: 24 },
      { key: 'cancel', label: '취소관리', count: 3 },
      { key: 'return', label: '반품관리', count: 12 },
      { key: 'exchange', label: '교환관리', count: 0 },
      { key: 'sellerApply', label: '판매신청 대기', count: 1_204 },
    ],
  },
}

/** 처리할 건이 하나도 없는 날 — 배지까지 조용한 회색 */
export const AllZero: Story = {
  args: {
    items: TODO_ITEMS.map((item) => ({ ...item, count: 0 })),
  },
}

/** total을 직접 넘긴 경우 — 합계와 다른 기준(예: 미확인 건수)을 배지에 띄운다 */
export const CustomTotal: Story = {
  args: {
    title: '미확인 알림',
    total: 7,
    items: [
      { key: 'inquiry', label: '문의', count: 4 },
      { key: 'review', label: '후기', count: 3 },
      { key: 'report', label: '신고', count: 0 },
    ],
  },
}

/** 클릭 — 1건 이상 항목만 눌린다(0건은 이동해도 빈 목록이라 잠가 둔다) */
export const Clickable: Story = {
  render: () => {
    // 스토리 내 데모 래퍼 — 클릭한 항목을 아래에 표시
    function ClickableDemo() {
      const [picked, setPicked] = useState<string | null>(null)
      const items: TodoSummaryItem[] = [
        { key: 'newOrder', label: '신규주문', count: 8, onClick: () => setPicked('신규주문') },
        { key: 'cancel', label: '취소관리', count: 2, onClick: () => setPicked('취소관리') },
        { key: 'return', label: '반품관리', count: 0, onClick: () => setPicked('반품관리') },
        { key: 'exchange', label: '교환관리', count: 0, onClick: () => setPicked('교환관리') },
        { key: 'sellerApply', label: '판매신청 대기', count: 5, onClick: () => setPicked('판매신청 대기') },
      ]

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TodoSummary items={items} />
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ds-color-secondary)' }}>
            {picked != null ? `${picked} 목록으로 이동` : '1건 이상인 항목을 눌러보세요'}
          </p>
        </div>
      )
    }

    return <ClickableDemo />
  },
}

/** 제목 줄 OFF — 바깥 섹션에 이미 제목이 있을 때. 항목 줄만 한 줄로 남는다 */
export const WithoutHeader: Story = {
  args: { showHeader: false },
}

/** 배지 OFF — 제목만 남기고 총건수는 감춘다(단위는 countUnit으로 바꾼다) */
export const WithoutTotalBadge: Story = {
  args: { showTotalBadge: false },
}

/**
 * 격자 — 항목이 8~10개로 늘면 한 줄이 두세 번 접히는 대신 칸으로 나눈다.
 * 라벨은 왼쪽, 숫자는 오른쪽 끝에 붙는다(가운뎃점 구분자는 사라진다).
 */
export const LayoutGrid: Story = {
  args: {
    layout: 'grid',
    items: [
      { key: 'newOrder', label: '신규주문', count: 24 },
      { key: 'pay', label: '입금대기', count: 6 },
      { key: 'ready', label: '배송준비', count: 12 },
      { key: 'cancel', label: '취소관리', count: 3 },
      { key: 'return', label: '반품관리', count: 0 },
      { key: 'exchange', label: '교환관리', count: 2 },
      { key: 'inquiry', label: '문의', count: 9 },
      { key: 'review', label: '후기', count: 0 },
    ],
  },
}

/** 세로 · sm — 좁은 사이드 위젯. 카드 크롬을 끄면(framed=false) 바깥 카드와 보더가 겹치지 않는다 */
export const StackedSidebar: Story = {
  args: { layout: 'stack', size: 'sm', framed: false },
  render: (args) => (
    <div
      style={{
        width: 260,
        padding: 16,
        background: 'var(--ds-color-bg)',
        border: '1px solid var(--ds-color-border)',
        borderRadius: 12,
      }}
    >
      <TodoSummary {...args} />
    </div>
  ),
}

/**
 * Labels — 영문 오버라이드. 화면 문구(단위·스크린리더 이름)를 밖에서 갈아끼운다.
 * 숫자 표기는 문구가 아니라 포맷이므로 formatters로 연다(여기서는 en-US).
 */
export const Labels: Story = {
  args: {
    title: "Today's tasks",
    items: [
      { key: 'newOrder', label: 'New orders', count: 1240 },
      { key: 'cancel', label: 'Cancellations', count: 0 },
      { key: 'return', label: 'Returns', count: 3 },
      { key: 'exchange', label: 'Exchanges', count: 0 },
    ],
    labels: {
      countUnit: ' items',
      totalAria: ({ count, unit }) => `${count}${unit} in total`,
    },
    formatters: { number: (value) => value.toLocaleString('en-US') },
  },
}

/** 좁은 폭 · 긴 라벨 — 항목 줄이 접히고 라벨은 말줄임되어 카드를 뚫지 않는다 */
export const NarrowAndLongLabel: Story = {
  render: () => (
    <div style={{ width: 360, background: 'var(--ds-color-bgSubtle)', padding: 16 }}>
      <TodoSummary
        title="오늘의 할일"
        items={[
          { key: 'newOrder', label: '신규주문(결제완료·배송준비 포함)', count: 3 },
          { key: 'cancel', label: '취소관리', count: 0 },
          { key: 'return', label: '반품관리', count: 0 },
          { key: 'exchange', label: '교환관리', count: 0 },
          { key: 'sellerApply', label: '입점 판매자 판매신청 승인 대기', count: 0 },
        ]}
      />
    </div>
  ),
}
