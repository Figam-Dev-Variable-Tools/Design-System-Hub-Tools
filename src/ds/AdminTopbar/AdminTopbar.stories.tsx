import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { AdminTopbar } from './AdminTopbar'
import { Button } from '../Button/Button'

const meta = {
  title: 'Admin/AdminTopbar',
  component: AdminTopbar,
  tags: ['autodocs'],
  args: {
    breadcrumb: [{ label: '홈', href: '#' }, { label: '상품 관리', href: '#' }, { label: '상품 등록' }],
    title: '상품 등록',
    description: '판매할 상품의 기본 정보와 옵션을 입력합니다.',
    actions: <Button variant="primary" size="sm" label="저장" />,
    user: { name: '홍길동', role: '관리자' },
  },
  argTypes: {
    actions: { control: false },
    // ON/OFF — 기본값(둘 다 켜짐)은 지금까지의 헤더 그대로다
    showBreadcrumb: { control: 'boolean' },
    showAvatar: { control: 'boolean' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof AdminTopbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AdminTopbar
        breadcrumb={[{ label: '홈', href: '#' }, { label: '대시보드' }]}
        title="대시보드"
        description="오늘의 주문·회원 지표를 확인합니다."
        user={{ name: '홍길동', role: '관리자' }}
      />
      {/* 액션·사용자 없이 breadcrumb + 타이틀만 */}
      <AdminTopbar breadcrumb={[{ label: '홈', href: '#' }, { label: '설정' }]} title="설정" />
      {/* depth가 깊은 경로 */}
      <AdminTopbar
        breadcrumb={[
          { label: '홈', href: '#' },
          { label: '상품 관리', onClick: () => {} },
          { label: '카테고리', onClick: () => {} },
          { label: '카테고리 수정' },
        ]}
        title="카테고리 수정"
        actions={
          <>
            <Button variant="secondary" size="sm" label="취소" />
            <Button variant="primary" size="sm" label="저장" />
          </>
        }
        user={{ name: 'Jane Kim', role: '운영자' }}
      />
    </div>
  ),
}

/**
 * 경로/아바타 OFF — depth가 1단계뿐인 화면(대시보드 등)에서는 브레드크럼을 끄면
 * 헤더가 1줄(72px)로 줄고, 아바타를 끄면 이름·역할 텍스트만 남는다.
 */
export const WithoutBreadcrumbAndAvatar: Story = {
  args: {
    showBreadcrumb: false,
    showAvatar: false,
    description: undefined,
    title: '대시보드',
  },
}

/**
 * onClick 경로 — href 없이 핸들러만 넘기면 공용 Breadcrumb이 링크가 아니라 button으로 그린다
 * (라우터 이동용. 키보드·스크린리더 규격을 링크로 위장하지 않는다).
 */
export const RouterBreadcrumb: Story = {
  args: {
    breadcrumb: [
      { label: '홈', onClick: () => {} },
      { label: '상품 관리', onClick: () => {} },
      { label: '상품 등록' },
    ],
  },
}
