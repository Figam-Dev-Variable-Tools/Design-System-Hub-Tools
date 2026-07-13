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
