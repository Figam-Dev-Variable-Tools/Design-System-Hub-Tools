import { Ban, CircleCheckBig } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { StatusTimeline, type StatusStep } from './StatusTimeline'

// 문의 처리 4단계 — 접수 → 확인중 → 답변완료 → 종료
const inquirySteps: StatusStep[] = [
  { key: 'received', label: '접수', at: '2026-07-10 09:12', by: '시스템', state: 'done' },
  { key: 'reviewing', label: '확인중', at: '2026-07-10 10:05', by: '김상담', state: 'current' },
  { key: 'answered', label: '답변완료', state: 'todo' },
  { key: 'closed', label: '종료', state: 'todo' },
]

const meta = {
  title: 'Admin/StatusTimeline',
  component: StatusTimeline,
  tags: ['autodocs'],
  args: {
    steps: inquirySteps,
    direction: 'vertical',
    showMeta: true,
  },
  argTypes: {
    steps: { control: 'object' },
    direction: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    showMeta: { control: 'boolean' },
    // 노드 슬롯 — 컨트롤로 넣을 수 없어 스토리에서만 갈아끼운다
    doneIcon: { control: false },
    skippedIcon: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof StatusTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 280 }}>
      <StatusTimeline {...args} />
    </div>
  ),
}

export const Horizontal: Story = {
  args: { direction: 'horizontal' },
  render: (args) => (
    <div style={{ width: 560, maxWidth: '100%' }}>
      <StatusTimeline {...args} />
    </div>
  ),
}

/** 전 단계 완료 — 연결선이 끝까지 success로 채워진다 */
export const Completed: Story = {
  args: {
    direction: 'horizontal',
    steps: [
      { key: 'received', label: '접수', at: '07-10 09:12', by: '시스템', state: 'done' },
      { key: 'reviewing', label: '확인중', at: '07-10 10:05', by: '김상담', state: 'done' },
      { key: 'answered', label: '답변완료', at: '07-10 14:30', by: '김상담', state: 'done' },
      { key: 'closed', label: '종료', at: '07-11 09:00', by: '시스템', state: 'done' },
    ],
  },
  render: (args) => (
    <div style={{ width: 560, maxWidth: '100%' }}>
      <StatusTimeline {...args} />
    </div>
  ),
}

/** 건너뛴 단계 — 답변 없이 종료된 문의(skipped는 흐리게 + 취소선) */
export const Skipped: Story = {
  args: {
    steps: [
      { key: 'received', label: '접수', at: '07-10 09:12', by: '시스템', state: 'done' },
      { key: 'reviewing', label: '확인중', at: '07-10 10:05', by: '김상담', state: 'done' },
      { key: 'answered', label: '답변완료', state: 'skipped' },
      { key: 'closed', label: '종료(자동)', at: '07-17 00:00', by: '시스템', state: 'current' },
    ],
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <StatusTimeline {...args} />
    </div>
  ),
}

/** 4가지 상태 한눈에 */
export const States: Story = {
  args: {
    steps: [
      { key: 'done', label: '완료(done)', at: '07-10 09:12', by: '시스템', state: 'done' },
      { key: 'current', label: '진행중(current)', at: '07-10 10:05', by: '김상담', state: 'current' },
      { key: 'todo', label: '예정(todo)', state: 'todo' },
      { key: 'skipped', label: '건너뜀(skipped)', state: 'skipped' },
    ],
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <StatusTimeline {...args} />
    </div>
  ),
}

/** showMeta=false — 시각·담당자를 접고 단계 라벨만. 좁은 aside나 헤더 요약용 */
export const WithoutMeta: Story = {
  args: { showMeta: false },
  render: (args) => (
    <div style={{ width: 280 }}>
      <StatusTimeline {...args} />
    </div>
  ),
}

/** 아이콘 슬롯 — done/skipped의 점 안 마크를 도메인에 맞는 그림으로 갈아끼운다 */
export const CustomIcons: Story = {
  args: {
    doneIcon: <CircleCheckBig size={12} strokeWidth={3} />,
    skippedIcon: <Ban size={12} strokeWidth={3} />,
    steps: [
      { key: 'received', label: '접수', at: '07-10 09:12', by: '시스템', state: 'done' },
      { key: 'reviewing', label: '확인중', at: '07-10 10:05', by: '김상담', state: 'done' },
      { key: 'answered', label: '답변완료', state: 'skipped' },
      { key: 'closed', label: '종료(자동)', at: '07-17 00:00', by: '시스템', state: 'current' },
    ],
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <StatusTimeline {...args} />
    </div>
  ),
}

/** 좁은 폭 — 긴 라벨은 말줄임, 가로형은 짜부라지지 않고 스크롤된다 */
export const NarrowContainer: Story = {
  args: {
    direction: 'horizontal',
    steps: [
      { key: 'a', label: '접수 완료 및 담당자 배정', at: '07-10 09:12', state: 'done' },
      { key: 'b', label: '1차 확인중', at: '07-10 10:05', by: '김상담', state: 'current' },
      { key: 'c', label: '답변완료', state: 'todo' },
      { key: 'd', label: '종료', state: 'todo' },
    ],
  },
  render: (args) => (
    <div style={{ width: 300, padding: 12, border: '1px dashed var(--ds-color-border)' }}>
      <StatusTimeline {...args} />
    </div>
  ),
}
