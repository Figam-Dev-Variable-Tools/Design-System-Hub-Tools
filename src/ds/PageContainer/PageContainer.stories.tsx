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
    maxWidth: { control: 'inline-radio', options: ['md', 'lg', 'full'] },
    padding: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md'],
      description: 'sm=24 — 드로어·모달·탭 패널처럼 바깥이 이미 여백을 갖는 자리',
    },
    gap: { control: 'inline-radio', options: ['md', 'lg'] },
    surface: {
      control: 'inline-radio',
      options: ['subtle', 'plain'],
      description: 'plain=흰 배경 위에 얹는 페이지(회색 캔버스를 강제하지 않는다)',
    },
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

/**
 * 드로어·모달 안 — padding='sm'(24) + surface='plain'.
 * 이 두 축이 없어서 화면들이 padding='none' + 자체 패딩으로 우회하고, 흰 면 위에 회색 캔버스가 깔렸다.
 */
export const InDrawer: Story = {
  render: () => (
    <div
      style={{
        width: 520,
        maxWidth: '100%',
        background: 'var(--ds-color-bg)',
        border: 'var(--ds-border-width) solid var(--ds-color-border)',
        borderRadius: 'var(--ds-radius-lg)',
      }}
    >
      <PageContainer maxWidth="md" padding="sm" surface="plain">
        <PageSection title="배송지 수정" description="드로어 안이라 여백이 한 단계 좁습니다.">
          <Placeholder text="폼 필드" />
        </PageSection>
      </PageContainer>
    </div>
  ),
}

/**
 * 섹션 크롬 축 — appearance(card | plain | outline) · tone(default | warning) · density.
 * card가 boolean 스위치라 강조·경고 톤을 표현할 자리가 없었고, 카드 패딩도 20 고정이었다.
 */
export const SectionAppearance: Story = {
  render: () => (
    <PageContainer maxWidth="lg" gap="lg">
      <PageSection title="appearance=card" description="기본 — 흰 카드">
        <Placeholder text="폼 필드" />
      </PageSection>
      <PageSection title="appearance=outline" description="보더만 — 회색 캔버스 위에 면을 덧칠하지 않는다">
        <Placeholder text="요약 정보" />
      </PageSection>
      <PageSection
        title="tone=warning"
        description="되돌릴 수 없는 작업 구역 — 색만으로 말하지 않고 제목이 함께 경고한다"
        tone="warning"
        actions={<Button variant="error" appearance="outline" size="sm" label="계정 삭제" />}
      >
        <Placeholder text="삭제하면 주문 내역까지 함께 사라집니다." />
      </PageSection>
      <PageSection title="density=compact" description="카드 안쪽 여백 12 — 표를 담는 섹션" density="compact">
        <Placeholder text="표" />
      </PageSection>
      <PageSection title="appearance=plain" description="크롬 없음 — 표가 카드 보더와 겹치지 않게" appearance="plain">
        <Placeholder text="표(자체 보더를 갖는다)" />
      </PageSection>
    </PageContainer>
  ),
}
