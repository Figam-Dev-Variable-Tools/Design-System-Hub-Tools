import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { PageContainer, PageSection } from './PageContainer'
import { Button } from '../Button/Button'

function Placeholder({ text }: { text: string }) {
  return <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>{text}</span>
}

const meta = {
  title: 'Admin/PageContainer',
  component: PageContainer,
  tags: ['autodocs'],
  args: {
    maxWidth: 'lg',
    padding: 'md',
    gap: 'md',
    children: (
      <>
        <PageSection
          title="기본 정보"
          description="상품명·가격 등 필수 항목입니다."
          actions={<Button variant="secondary" size="sm" label="초기화" />}
        >
          <Placeholder text="여기에 폼 필드가 들어갑니다." />
        </PageSection>
        <PageSection title="옵션" description="색상·사이즈 등 판매 옵션을 관리합니다.">
          <Placeholder text="여기에 옵션 테이블이 들어갑니다." />
        </PageSection>
      </>
    ),
  },
  argTypes: {
    children: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof PageContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * 섹션 헤더는 PageHeaderBar를 그대로 쓴다 — 사본이 없다.
 * 페이지 안에 여러 번 놓이므로 헤딩은 h2(headingLevel), 크기는 한 단계 작은 md 규격이다.
 */
export const SectionHeaders: Story = {
  render: () => (
    <PageContainer maxWidth="lg">
      <PageSection
        title="기본 정보"
        description="상품명·가격 등 필수 항목입니다."
        actions={<Button variant="secondary" size="sm" label="초기화" />}
      >
        <Placeholder text="제목 + 설명 + 액션" />
      </PageSection>
      <PageSection title="옵션">
        <Placeholder text="제목만" />
      </PageSection>
      <PageSection description="제목 없이 설명만 있는 섹션 — 빈 헤딩이 남지 않는다.">
        <Placeholder text="설명만" />
      </PageSection>
    </PageContainer>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 폭 md — 폼 중심 페이지 */}
      <PageContainer maxWidth="md">
        <PageSection title="maxWidth=md" description="폼 중심 페이지의 기본 폭입니다.">
          <Placeholder text="본문 카드" />
        </PageSection>
      </PageContainer>
      {/* 폭 full + 카드 없이 — 표 전체 폭 */}
      <PageContainer maxWidth="full" gap="lg">
        <PageSection title="maxWidth=full" description="표·목록처럼 넓은 콘텐츠에 사용합니다." card={false}>
          <Placeholder text="card=false — 카드 없이 본문을 직접 배치합니다." />
        </PageSection>
      </PageContainer>
      {/* 패딩 없음 — 셸이 여백을 관리할 때 */}
      <PageContainer padding="none">
        <PageSection title="padding=none">
          <Placeholder text="외곽 여백을 상위 레이아웃이 관리합니다." />
        </PageSection>
      </PageContainer>
    </div>
  ),
}
