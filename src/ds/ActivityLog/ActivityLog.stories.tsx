import type { Meta, StoryObj } from '@storybook/react'
import { ArrowRight, CreditCard, Headphones, ServerCog } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { ActivityLog, type ActivityItem } from './ActivityLog'

/** 목데이터의 at을 "현재 기준 n분 전"으로 만들기 위한 헬퍼 */
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

const ITEMS: ActivityItem[] = [
  {
    id: 'a1',
    type: 'inquiry',
    actor: '홍길동',
    action: '문의를 등록했습니다',
    target: '배송 지연 관련',
    at: minutesAgo(3),
    unread: true,
  },
  {
    id: 'a2',
    type: 'order',
    actor: '김서연',
    action: '주문을 완료했습니다',
    target: '#20260713-0042',
    at: minutesAgo(18),
    unread: true,
  },
  {
    id: 'a3',
    type: 'member',
    actor: '이준호',
    action: '회원 가입했습니다',
    at: minutesAgo(47),
  },
  {
    id: 'a4',
    type: 'product',
    actor: '관리자',
    action: '상품을 등록했습니다',
    target: '오크 원목 책상',
    at: minutesAgo(95),
  },
  {
    id: 'a5',
    type: 'system',
    actor: '시스템',
    action: '야간 백업을 완료했습니다',
    at: minutesAgo(240),
  },
  {
    id: 'a6',
    type: 'order',
    actor: '박민지',
    action: '주문을 취소했습니다',
    target: '#20260712-0311',
    at: minutesAgo(600),
  },
  {
    id: 'a7',
    type: 'inquiry',
    actor: '최지훈',
    action: '문의를 등록했습니다',
    target: '교환 신청',
    at: minutesAgo(1500),
  },
  {
    id: 'a8',
    type: 'product',
    actor: '관리자',
    action: '상품 정보를 수정했습니다',
    target: '린넨 커튼 2종',
    at: minutesAgo(2900),
  },
]

const meta = {
  title: 'Admin/ActivityLog',
  component: ActivityLog,
  tags: ['autodocs'],
  args: {
    items: ITEMS,
    title: '최근 활동',
    compact: false,
  },
  argTypes: {
    onItemClick: { action: 'itemClick' },
    onViewAll: { action: 'viewAll' },
    max: { control: { type: 'number', min: 1, max: 20 } },
    // ON/OFF · 문구 — 기본값은 지금까지의 카드 그대로다
    showHeader: { control: 'boolean' },
    showIcon: { control: 'boolean' },
    showTime: { control: 'boolean' },
    showUnreadDot: { control: 'boolean' },
    viewAllLabel: { control: 'text' },
    unreadLabel: { control: 'text' },
    // 아이콘 슬롯 — ReactNode라 컨트롤로는 다루지 않는다(CustomTypeIcons 스토리 참고)
    viewAllIcon: { control: false },
    typeIcons: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActivityLog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: { items: [] },
}

export const Compact: Story = {
  args: { compact: true, max: 5 },
}

/**
 * 문장만 — 아이콘·시간·미읽음 점을 모두 끈 텍스트 전용 목록.
 * 카드 제목이 바깥에 이미 있는 자리라면 showHeader까지 끈다.
 */
export const TextOnly: Story = {
  args: {
    showIcon: false,
    showTime: false,
    showUnreadDot: false,
    showHeader: false,
    max: 5,
  },
}

/** 타입 아이콘 교체 — 넘긴 타입만 기본 아이콘을 덮어쓴다(톤·배경 원은 그대로) */
export const CustomTypeIcons: Story = {
  args: {
    typeIcons: {
      inquiry: <Headphones size={16} />,
      order: <CreditCard size={16} />,
      system: <ServerCog size={16} />,
    },
    viewAllIcon: <ArrowRight size={14} aria-hidden="true" />,
    viewAllLabel: '활동 로그 전체',
  },
}
