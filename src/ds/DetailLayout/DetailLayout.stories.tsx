import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { DetailLayout } from './DetailLayout'
import { PageContainer, PageSection } from '../PageContainer/PageContainer'
import { AdminGrid, AdminGridItem } from '../AdminGrid/AdminGrid'
import { Button } from '../Button/Button'
import { TextField } from '../TextField/TextField'
import { Badge } from '../Badge/Badge'

/** 사이드 요약 카드 — 토큰만 사용 */
function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-5)',
        background: 'var(--ds-color-bg)',
        border: 'var(--ds-border-width) solid var(--ds-color-border)',
        borderRadius: 'var(--ds-radius-lg)',
      }}
    >
      <span style={{ fontSize: 'var(--ds-font-size-md)', fontWeight: 'var(--ds-font-weight-bold)', color: 'var(--ds-color-text)' }}>
        {title}
      </span>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--ds-spacing-3)' }}>
      <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>{label}</span>
      <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-text)' }}>
        {value}
      </span>
    </div>
  )
}

const ASIDE = (
  <>
    <SideCard title="상태">
      <Row label="판매 상태" value={<Badge variant="success" size="sm" label="판매중" />} />
      <Row label="노출" value="전체 공개" />
    </SideCard>
    <SideCard title="메타">
      <Row label="등록일" value="2026-07-01" />
      <Row label="수정일" value="2026-07-13" />
      <Row label="담당자" value="홍길동" />
    </SideCard>
  </>
)

const FOOTER = (
  <>
    <Button variant="secondary" size="md" label="취소" />
    <Button variant="primary" size="md" label="저장" />
  </>
)

const BODY = (
  <>
    <PageSection title="기본 정보" description="상품명·가격 등 필수 항목입니다.">
      <AdminGrid>
        <AdminGridItem span={6} spanMd={4} spanSm={4}>
          <TextField label="상품명" placeholder="상품명을 입력하세요" />
        </AdminGridItem>
        <AdminGridItem span={6} spanMd={4} spanSm={4}>
          <TextField label="판매가" placeholder="0" />
        </AdminGridItem>
      </AdminGrid>
    </PageSection>
    <PageSection title="상세 설명" description="고객에게 노출되는 상세 페이지 본문입니다.">
      <TextField label="요약" placeholder="한 줄 요약" />
    </PageSection>
  </>
)

const meta = {
  title: 'Admin/DetailLayout',
  component: DetailLayout,
  tags: ['autodocs'],
  args: {
    asideWidth: 'md',
    sticky: true,
    showFooter: true,
    children: BODY,
    aside: ASIDE,
    footer: FOOTER,
  },
  argTypes: {
    children: { control: false },
    aside: { control: false },
    footer: { control: false },
    showFooter: { control: 'boolean', description: '하단 액션 바 노출(읽기 전용 화면에서 끈다)' },
    asideWidth: { control: 'inline-radio', options: ['sm', 'md'] },
    asidePlacement: {
      control: 'inline-radio',
      options: ['left', 'right'],
      description: 'left=FormAnchorNav·CategoryTree처럼 본문보다 먼저 읽혀야 하는 레일',
    },
    footerAlign: {
      control: 'inline-radio',
      options: ['start', 'between', 'end'],
      description: 'between=좌측 [삭제] · 우측 [취소][저장]',
    },
    maxWidth: {
      control: 'inline-radio',
      options: [undefined, 'md', 'lg', 'full'],
      description: '주지 않으면 부모 폭을 그대로 쓴다(기존 동작)',
    },
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof DetailLayout>

export default meta
type Story = StoryObj<typeof meta>

/** 본문 + 우측 사이드(360) + 하단 액션 바 */
export const Default: Story = {
  render: (args) => (
    <PageContainer maxWidth="full" gap="lg">
      <DetailLayout {...args} />
    </PageContainer>
  ),
}

/**
 * 읽기 전용 — footer(취소/저장)를 그대로 들고 있으면서 showFooter만 끈다.
 * 같은 화면을 '상세 보기'로 재사용할 때 저장 핸들러 쪽 코드를 갈아엎지 않기 위한 스위치다.
 */
export const ReadOnly: Story = {
  args: { showFooter: false },
  render: (args) => (
    <PageContainer maxWidth="full" gap="lg">
      <DetailLayout {...args} />
    </PageContainer>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 사이드 없음 — 폼 단독 */}
      <PageContainer maxWidth="full">
        <DetailLayout footer={FOOTER}>
          <PageSection title="aside 없음" description="본문만 있는 상세 페이지 — 전체 폭을 씁니다.">
            <TextField label="상품명" placeholder="상품명을 입력하세요" />
          </PageSection>
        </DetailLayout>
      </PageContainer>

      {/* 사이드 sm(280) + sticky 해제 */}
      <PageContainer maxWidth="full">
        <DetailLayout aside={ASIDE} asideWidth="sm" sticky={false}>
          <PageSection title="asideWidth=sm · sticky=false" description="사이드 280px, 스크롤 고정 없음.">
            <TextField label="상품명" placeholder="상품명을 입력하세요" />
          </PageSection>
        </DetailLayout>
      </PageContainer>
    </div>
  ),
}

/**
 * 좌측 레일 + 액션 바 between —
 * 레일이 왼쪽에 서야 하는 화면(앵커 내비·카테고리 트리)과
 * 좌측 [삭제] · 우측 [취소][저장]인 흔한 상세 액션 바. 둘 다 축이 없어 화면이 직접 만들고 있었다.
 */
export const LeftRailAndSplitFooter: Story = {
  args: {
    asidePlacement: 'left',
    asideWidth: 'sm',
    footerAlign: 'between',
    aside: ASIDE,
    footer: (
      <>
        <Button variant="error" appearance="outline" size="md" label="삭제" />
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <Button variant="secondary" appearance="outline" size="md" label="취소" />
          <Button variant="primary" size="md" label="저장" />
        </div>
      </>
    ),
  },
  render: (args) => (
    <PageContainer maxWidth="full" gap="lg">
      <DetailLayout {...args} />
    </PageContainer>
  ),
}

/**
 * 단독 사용 — PageContainer 없이 maxWidth로 1920 규격(lg=1200)을 스스로 지킨다.
 * density는 형제 레이아웃(AdminPageLayout)과 같은 CSS 변수 계약을 심는다.
 */
export const StandaloneWidth: Story = {
  args: {
    maxWidth: 'lg',
    density: 'comfortable',
    aside: undefined,
  },
}
