import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Header } from './Header'
import { Button } from '../Button/Button'

const meta = {
  title: '3. 컴포넌트/Structure/Header',
  component: Header,
  tags: ['autodocs'],
  args: {
    title: '컴포넌트',
    description: '디자인 시스템의 모든 컴포넌트를 한눈에 살펴보세요.',
    divider: true,
    actions: (
      <>
        <Button variant="secondary" size="md" label="문서 보기" />
        <Button variant="primary" size="md" label="새 컴포넌트" />
      </>
    ),
  },
  argTypes: {
    breadcrumb: { control: false },
    actions: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 720 }}>
      <Header
        title="토큰"
        description="색상·타이포그래피·간격 토큰을 관리합니다."
        breadcrumb={<span>홈 / 문서 / 토큰</span>}
        actions={<Button variant="primary" size="sm" label="토큰 추가" />}
      />
      <Header title="문서" description="설명만 있는 헤더입니다." />
      <Header title="홈" divider={false} />
      <Header
        title="컴포넌트"
        actions={
          <>
            <Button variant="secondary" size="sm" label="내보내기" />
            <Button variant="primary" size="sm" label="저장" />
          </>
        }
      />
    </div>
  ),
}

/** 긴 제목·설명 — 제목은 1줄 말줄임, 설명은 2줄 클램프. 액션 버튼은 밀리지 않는다 */
export const LongTitle: Story = {
  render: () => (
    <div style={{ width: 420, border: '1px dashed var(--ds-color-border)', padding: 12 }}>
      <Header
        title="아주 긴 페이지 제목이 들어가도 헤더 밖으로 넘치지 않아야 합니다"
        description="설명 문구도 마찬가지로 길어지면 두 줄까지만 보이고 말줄임 처리되어야 하며, 끊기지 않는 문자열(ExtremelyLongUnbrokenToken1234567890)도 박스를 뚫지 않아야 합니다."
        actions={<Button variant="primary" size="sm" label="저장" />}
      />
    </div>
  ),
}
