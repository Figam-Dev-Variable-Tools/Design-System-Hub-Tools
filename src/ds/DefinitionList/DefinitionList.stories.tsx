import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '../Badge/Badge'
import { FIGMA_FILE } from '../../shared/figma'
import { DefinitionList, type DefinitionItem } from './DefinitionList'

/** 회원 상세 상단의 기본 정보 — 값에 배지 같은 노드도 들어간다 */
const MEMBER: DefinitionItem[] = [
  { label: '회원 유형', value: <Badge variant="primary" appearance="soft" size="sm" label="일반 회원" /> },
  { label: '계정', value: 'sohee.kim@example.com', hint: '이메일 인증 완료 · 2026-03-02' },
  { label: '이름', value: '김소희' },
  { label: '연락처', value: '010-2345-6789' },
  { label: '생년월일', value: '1993-11-04' },
  { label: '성별', value: '여성' },
  { label: '가입 경로', value: '카카오 간편가입', hint: 'PC 웹 · 프로모션 배너 유입' },
  { label: '회원 ID', value: 'M-2026-004821' },
]

/** 흰 카드 위에 얹은 상태 — 실제 상세 화면과 같은 맥락 */
function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 720,
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
  title: 'Admin/DefinitionList',
  component: DefinitionList,
  tags: ['autodocs'],
  args: {
    items: MEMBER,
    columns: 1,
    divider: true,
    density: 'compact',
    layout: 'grid',
  },
  argTypes: {
    items: { control: 'object' },
    columns: { control: 'inline-radio', options: [1, 2] },
    divider: { control: 'boolean' },
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    layout: {
      control: 'inline-radio',
      options: ['grid', 'inline'],
      description: 'grid=표 / inline=라벨-값을 한 줄에 붙여 가로로 흘린다(푸터 사업자 정보)',
    },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => (
    <Card>
      <DefinitionList {...args} />
    </Card>
  ),
} satisfies Meta<typeof DefinitionList>

export default meta
type Story = StoryObj<typeof meta>

/** 1열 · compact(44px) — 기본 회원 정보 */
export const Default: Story = {}

/** 2열 — 항목이 많을 때. 구분선은 열을 가로질러 한 줄로 이어진다 */
export const TwoColumns: Story = {
  args: { columns: 2 },
}

/** comfortable(56px) — 여유 있는 상세 헤더용 */
export const Comfortable: Story = {
  args: { density: 'comfortable' },
}

/** 구분선 없이 — 사이드 요약 카드처럼 좁은 영역에 */
export const NoDivider: Story = {
  args: { divider: false, columns: 1 },
}

/**
 * inline — 표가 아니라 한 줄로 흐르는 라벨-값(푸터 사업자 정보).
 * 라벨 고정폭·행 높이·구분선이 모두 꺼지고, 좁아지면 한 항목씩 줄바꿈한다.
 */
export const Inline: Story = {
  args: {
    layout: 'inline',
    divider: false,
    items: [
      { label: '상호', value: '스페이스플래닝 주식회사' },
      { label: '대표', value: '홍성보' },
      { label: '사업자번호', value: '123-45-67890' },
      { label: '주소', value: '서울특별시 강남구 테헤란로 123, 8층' },
      { label: '전화', value: '02-1234-5678' },
    ],
  },
}

/** 값이 길면 1줄 말줄임 — 행 높이가 밀리지 않는다 */
export const LongValue: Story = {
  args: {
    columns: 1,
    items: [
      { label: '계정', value: 'extremely.long.customer.address+newsletter@subdomain.example.co.kr' },
      {
        label: '가입 경로',
        value: '제휴 캠페인 / 2026 여름 정기 세일 / 인스타그램 스토리 광고 (utm_campaign=summer_sale_2026_story)',
        hint: '유입 경로 원문이 길어도 행 높이는 그대로 유지된다',
      },
      { label: '회원 ID', value: 'M-2026-004821' },
    ],
  },
}
