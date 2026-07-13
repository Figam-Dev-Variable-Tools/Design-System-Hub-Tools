import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CircleCheck, CircleSlash } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { ConsentList, type ConsentItem } from './ConsentList'

const CONSENTS: ConsentItem[] = [
  { label: '휴대폰 본인 인증', agreed: true, note: '인증 완료' },
  { label: '이용약관 동의', agreed: true },
  { label: '개인정보 수집·이용 동의', agreed: true },
  { label: '마케팅 정보 수신 동의', agreed: true },
  { label: '광고성 정보 수신(SMS)', agreed: false },
  { label: '광고성 정보 수신(이메일)', agreed: false, note: '미동의' },
]

/** 흰 카드 위에 얹은 상태 — 실제 상세 화면과 같은 맥락. 2열 스토리만 카드를 넓힌다 */
function Card({ children, width = 560 }: { children: ReactNode; width?: number }) {
  return (
    <div
      style={{
        width,
        maxWidth: '100%',
        padding: 'var(--ds-spacing-5)',
        border: 'var(--ds-border-width) solid var(--ds-color-border)',
        borderRadius: 'var(--ds-radius-lg)',
        background: 'var(--ds-color-bg)',
      }}
    >
      {children}
    </div>
  )
}

const meta = {
  title: 'Admin/ConsentList',
  component: ConsentList,
  tags: ['autodocs'],
  args: {
    items: CONSENTS,
  },
  argTypes: {
    items: { control: 'object' },
    density: { control: 'select', options: ['compact', 'comfortable'] },
    columns: { control: 'select', options: [1, 2] },
    // 아이콘 슬롯 — 컨트롤로 만질 값이 아니다(CustomIcons 스토리로 보여준다)
    agreedIcon: { control: false },
    deniedIcon: { control: false },
    agreedLabel: { control: 'text' },
    deniedLabel: { control: 'text' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => (
    <Card>
      <ConsentList {...args} />
    </Card>
  ),
} satisfies Meta<typeof ConsentList>

export default meta
type Story = StoryObj<typeof meta>

/** 동의/미동의 혼합 — note가 없으면 '동의' / '미동의'로 채워진다 */
export const Default: Story = {}

/** 전부 동의 */
export const AllAgreed: Story = {
  args: {
    items: CONSENTS.map((item) => ({ ...item, agreed: true, note: undefined })),
  },
}

/** 인증 시각까지 note로 — 필수 동의만 받은 비회원 주문 */
export const GuestOrder: Story = {
  args: {
    items: [
      { label: '휴대폰 본인 인증', agreed: true, note: '인증 완료 · 2026-07-11 14:02' },
      { label: '개인정보 수집·이용 동의', agreed: true, note: '주문 처리 목적 한정' },
      { label: '마케팅 정보 수신 동의', agreed: false },
    ],
  },
}

/** 2열 · comfortable — 동의 항목이 많은 회원 상세. 좁아지면 DefinitionList가 알아서 1열로 접는다 */
export const TwoColumnComfortable: Story = {
  args: { columns: 2, density: 'comfortable' },
  render: (args) => (
    <Card width={880}>
      <ConsentList {...args} />
    </Card>
  ),
}

/** 문구 교체 — note가 없는 항목의 기본 문구를 서비스 말투에 맞춘다 */
export const CustomLabels: Story = {
  args: {
    agreedLabel: '수신 동의함',
    deniedLabel: '수신 거부',
    items: [
      { label: '이용약관 동의', agreed: true },
      { label: '마케팅 정보 수신 동의', agreed: true },
      { label: '광고성 정보 수신(SMS)', agreed: false },
      { label: '광고성 정보 수신(이메일)', agreed: false },
    ],
  },
}

/** 아이콘 교체 — 배지는 그대로 두고 앞쪽 아이콘만 다른 세트로 */
export const CustomIcons: Story = {
  args: {
    agreedIcon: <CircleCheck size={14} />,
    deniedIcon: <CircleSlash size={14} />,
  },
}
