import type { Meta, StoryObj } from '@storybook/react'
import { Download, Plus } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from '../Button/Button'
import { AdminPageLayout } from '../AdminPageLayout/AdminPageLayout'
import { PageHeaderBar } from './PageHeaderBar'

const meta = {
  title: 'Admin/PageHeaderBar',
  component: PageHeaderBar,
  tags: ['autodocs'],
  args: {
    title: '고객 목록',
    description: '가입한 고객을 조회하고 등급·상태를 관리합니다.',
    sticky: false,
    showDivider: true,
    size: 'lg',
    headingLevel: 1,
    actions: (
      <Button
        variant="secondary"
        appearance="outline"
        size="sm"
        label="엑셀 다운로드"
        showLeftIcon
        leftIcon={<Download size={14} />}
      />
    ),
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    sticky: { control: 'boolean' },
    badge: { control: 'object' },
    actions: { control: false },
    showDivider: { control: 'boolean', description: 'sticky 하단 보더' },
    size: { control: 'inline-radio', options: ['md', 'lg'], description: 'md=섹션 헤더 규격' },
    headingLevel: { control: 'inline-radio', options: [1, 2], description: '제목 태그(h1/h2)' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => (
    <div style={{ width: 880, maxWidth: '100%' }}>
      <PageHeaderBar {...args} />
    </div>
  ),
} satisfies Meta<typeof PageHeaderBar>

export default meta
type Story = StoryObj<typeof meta>

/** 목록 화면 — 타이틀 + 설명 + 우측 [엑셀 다운로드] */
export const Default: Story = {}

/** 상세/수정 화면 — 제목 옆 상태 배지 + [저장] */
export const WithBadge: Story = {
  args: {
    title: '메인 비주얼 수정',
    description: '홈 상단에 노출되는 배너입니다.',
    badge: { label: '활성', tone: 'success' },
    actions: <Button variant="primary" size="sm" label="저장" />,
  },
}

/** 배지 톤 — 상태를 색이 아니라 문구로 먼저 읽히게 한다 */
export const BadgeTones: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-5)',
        width: 880,
        maxWidth: '100%',
      }}
    >
      <PageHeaderBar title="메인 비주얼 수정" badge={{ label: '활성', tone: 'success' }} />
      <PageHeaderBar title="이벤트 배너 수정" badge={{ label: '임시저장', tone: 'warning' }} />
      <PageHeaderBar title="지난 프로모션" badge={{ label: '종료', tone: 'secondary' }} />
      <PageHeaderBar title="반려된 배너" badge={{ label: '반려', tone: 'error' }} />
    </div>
  ),
}

/** 액션 없음 — 읽기 전용 화면 */
export const TitleOnly: Story = {
  args: {
    title: '대시보드',
    description: undefined,
    actions: undefined,
  },
}

/** sticky — 스크롤해도 상단에 붙는다. 긴 폼에서 [저장]을 놓치지 않게 */
export const Sticky: Story = {
  args: {
    title: '메인 비주얼 수정',
    description: '홈 상단에 노출되는 배너입니다.',
    badge: { label: '활성', tone: 'success' },
    sticky: true,
    actions: <Button variant="primary" size="sm" label="저장" />,
  },
  render: (args) => (
    <div style={{ height: 320, overflowY: 'auto', width: 880, maxWidth: '100%' }}>
      <PageHeaderBar {...args} />
      <div style={{ padding: 'var(--ds-spacing-4) 0' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <p
            key={i}
            style={{
              margin: '0 0 var(--ds-spacing-4)',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-secondary)',
            }}
          >
            폼 내용 {i + 1} — 스크롤하면 헤더가 상단에 남는다.
          </p>
        ))}
      </div>
    </div>
  ),
}

/**
 * 섹션 헤더 규격 — size="md" + headingLevel={2}.
 * 한 페이지 안에 여러 번 놓이는 섹션 제목은 h1이 아니어야 하고, 페이지 타이틀보다 조용해야 한다.
 * (PageSection이 이 규격으로 이 조각을 재사용한다)
 */
export const SectionSize: Story = {
  args: {
    title: '기본 정보',
    description: '상품명·가격 등 필수 항목입니다.',
    size: 'md',
    headingLevel: 2,
    actions: <Button variant="secondary" size="sm" label="초기화" />,
  },
}

/** sticky + 구분선 OFF — 아래가 이미 보더를 가진 카드/표라 선이 두 겹으로 보일 때 */
export const StickyNoDivider: Story = {
  args: {
    title: '메인 비주얼 수정',
    sticky: true,
    showDivider: false,
    actions: <Button variant="primary" size="sm" label="저장" />,
  },
}

/**
 * AdminPageLayout의 header 자리에 넣어 쓰는 법 —
 * 레이아웃의 title/description/headerActions를 비우고 본문 맨 위에 이 조각을 놓는다.
 * (PageHeaderBar는 레이아웃을 다시 짜지 않는다)
 */
export const InAdminPageLayout: Story = {
  render: () => (
    <AdminPageLayout maxWidth="lg">
      <PageHeaderBar
        title="고객 목록"
        description="가입한 고객을 조회하고 등급·상태를 관리합니다."
        badge={{ label: '실시간', tone: 'primary' }}
        actions={
          <>
            <Button
              variant="secondary"
              appearance="outline"
              size="sm"
              label="엑셀 다운로드"
              showLeftIcon
              leftIcon={<Download size={14} />}
            />
            <Button
              variant="primary"
              size="sm"
              label="고객 등록"
              showLeftIcon
              leftIcon={<Plus size={14} />}
            />
          </>
        }
      />
      <p
        style={{
          margin: 0,
          fontSize: 'var(--ds-font-size-sm)',
          color: 'var(--ds-color-secondary)',
        }}
      >
        본문(목록·표)이 이 아래에 온다.
      </p>
    </AdminPageLayout>
  ),
}
