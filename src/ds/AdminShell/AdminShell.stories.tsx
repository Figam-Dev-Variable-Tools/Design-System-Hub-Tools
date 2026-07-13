import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BarChart3, LayoutDashboard, MessageSquare, Package, Settings, ShoppingCart, Users } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { AdminShell, type AdminShellProps } from './AdminShell'
import { Button } from '../Button/Button'
import { PageContainer, PageSection } from '../PageContainer/PageContainer'
import type { SidebarSection } from '../Sidebar/Sidebar'

const NAV_ITEMS = [
  { label: '대시보드', value: 'dashboard' },
  { label: '운영', value: 'ops' },
  { label: '설정', value: 'settings' },
]

const SIDEBAR_SECTIONS = [
  {
    title: '관리',
    items: [
      { label: '회원 관리', value: 'users', badge: '12' },
      { label: '주문 관리', value: 'orders' },
      { label: '상품 관리', value: 'products' },
    ],
  },
  {
    title: '시스템',
    items: [
      { label: '권한 설정', value: 'permissions' },
      { label: '감사 로그', value: 'audit', disabled: true },
    ],
  },
]

function PlaceholderCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        background: 'var(--ds-color-bg)',
        border: '1px solid var(--ds-color-border)',
        borderRadius: 'var(--ds-radius-md)',
        padding: 'var(--ds-spacing-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-2)',
      }}
    >
      <span style={{ fontSize: 'var(--ds-font-size-md)', fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-text)' }}>
        {title}
      </span>
      <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>{body}</span>
    </div>
  )
}

// 어드민 메뉴 트리 — 아이콘·서브메뉴를 데이터로만 선언한다 (항목 추가 = 배열 추가)
const ADMIN_MENU: SidebarSection[] = [
  {
    title: '운영',
    items: [
      { label: '대시보드', value: 'dashboard', icon: <LayoutDashboard size={18} /> },
      {
        label: '상품 관리',
        value: 'products',
        icon: <Package size={18} />,
        children: [
          { label: '상품 목록', value: 'products.list' },
          { label: '상품 등록', value: 'products.new' },
          { label: '카테고리', value: 'products.categories' },
        ],
      },
      { label: '주문', value: 'orders', icon: <ShoppingCart size={18} />, badge: '7' },
      { label: '회원', value: 'members', icon: <Users size={18} /> },
      { label: '게시판', value: 'boards', icon: <MessageSquare size={18} /> },
    ],
  },
  {
    title: '분석 · 설정',
    items: [
      { label: '통계', value: 'stats', icon: <BarChart3 size={18} /> },
      { label: '설정', value: 'settings', icon: <Settings size={18} /> },
    ],
  },
]

// 메뉴 value → 페이지 depth/타이틀 매핑
const PAGES: Record<string, { trail: string[]; title: string; description: string }> = {
  dashboard: { trail: ['홈', '대시보드'], title: '대시보드', description: '오늘의 주문·회원 지표를 확인합니다.' },
  'products.list': { trail: ['홈', '상품 관리', '상품 목록'], title: '상품 목록', description: '등록된 상품을 검색하고 관리합니다.' },
  'products.new': { trail: ['홈', '상품 관리', '상품 등록'], title: '상품 등록', description: '판매할 상품의 기본 정보와 옵션을 입력합니다.' },
  'products.categories': { trail: ['홈', '상품 관리', '카테고리'], title: '카테고리', description: '상품 분류 체계를 관리합니다.' },
  orders: { trail: ['홈', '주문'], title: '주문', description: '미처리 주문 7건이 있습니다.' },
  members: { trail: ['홈', '회원'], title: '회원', description: '가입 회원을 조회하고 등급을 관리합니다.' },
  boards: { trail: ['홈', '게시판'], title: '게시판', description: '공지·문의 게시글을 관리합니다.' },
  stats: { trail: ['홈', '통계'], title: '통계', description: '기간별 매출·트래픽 리포트입니다.' },
  settings: { trail: ['홈', '설정'], title: '설정', description: '권한·알림 등 시스템 설정입니다.' },
}

// 데이터로 선언한 메뉴 + 접기 토글 + AdminTopbar를 함께 보여주는 풀 데모
function AdminMenuDemo() {
  const [sidebarValue, setSidebarValue] = useState('products.new')
  const [collapsed, setCollapsed] = useState(false)
  const page = PAGES[sidebarValue] ?? PAGES.dashboard

  return (
    <AdminShell
      brand="DS Admin"
      navItems={NAV_ITEMS}
      navValue="ops"
      sidebarSections={ADMIN_MENU}
      sidebarValue={sidebarValue}
      onSidebarChange={setSidebarValue}
      sidebarCollapsed={collapsed}
      breadcrumb={page.trail.map((label, index) =>
        index === page.trail.length - 1 ? { label } : { label, href: '#' },
      )}
      pageTitle={page.title}
      pageDescription={page.description}
      pageActions={<Button variant="primary" size="sm" label="저장" />}
      user={{ name: '홍길동', role: '관리자' }}
      actions={
        <>
          {/* 사이드바 접기는 헤더 햄버거 없이 외부에서 제어한다 */}
          <Button
            variant="secondary"
            size="sm"
            label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
            onClick={() => setCollapsed((prev) => !prev)}
          />
          <Button variant="secondary" size="sm" label="로그아웃" />
        </>
      }
      contentPadding={false}
    >
      <PageContainer>
        <PageSection title="기본 정보" description="선택한 메뉴에 따라 상단 depth와 타이틀이 바뀝니다.">
          <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>
            현재 메뉴: {sidebarValue}
          </span>
        </PageSection>
        <PageSection title="메뉴 확장" description="ADMIN_MENU 배열에 항목만 추가하면 메뉴가 늘어납니다.">
          <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>
            햄버거 버튼으로 사이드바를 미니 모드로 접을 수 있습니다.
          </span>
        </PageSection>
      </PageContainer>
    </AdminShell>
  )
}

// 컨트롤드 컴포넌트용 데모
function AdminShellDemo(props: AdminShellProps) {
  const [navValue, setNavValue] = useState(props.navValue)
  const [sidebarValue, setSidebarValue] = useState(props.sidebarValue)
  return (
    <AdminShell
      {...props}
      navValue={navValue}
      onNavChange={setNavValue}
      sidebarValue={sidebarValue}
      onSidebarChange={setSidebarValue}
    />
  )
}

const meta = {
  title: 'Admin/AdminShell',
  component: AdminShell,
  tags: ['autodocs'],
  args: {
    brand: 'DS Admin',
    navItems: NAV_ITEMS,
    navValue: 'dashboard',
    sidebarSections: SIDEBAR_SECTIONS,
    sidebarValue: 'users',
    contentPadding: true,
    actions: <Button variant="primary" size="sm" label="로그아웃" />,
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        <PlaceholderCard title="오늘 가입한 회원" body="신규 가입 24명 — 어제보다 8% 증가했습니다." />
        <PlaceholderCard title="처리 대기 주문" body="미처리 주문 7건이 있습니다. 오늘 안에 확인해 주세요." />
      </div>
    ),
  },
  argTypes: {
    onNavChange: { control: false },
    onSidebarChange: { control: false },
    actions: { control: false },
    children: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof AdminShell>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <AdminShellDemo {...args} />,
}

/** 데이터로 선언한 어드민 메뉴 + AdminTopbar + PageContainer 풀스크린 데모 */
export const AdminMenu: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <AdminMenuDemo />,
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <AdminShell
        brand="DS Admin"
        navItems={NAV_ITEMS}
        navValue="dashboard"
        sidebarSections={SIDEBAR_SECTIONS}
        sidebarValue="users"
        actions={<Button variant="primary" size="sm" label="로그아웃" />}
      >
        <PlaceholderCard title="기본 셸" body="패딩이 적용된 본문 영역입니다." />
      </AdminShell>
      <AdminShell
        brand="DS Admin"
        navItems={NAV_ITEMS}
        navValue="ops"
        sidebarSections={SIDEBAR_SECTIONS}
        sidebarValue="orders"
        contentPadding={false}
      >
        <div style={{ padding: 'var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>
          contentPadding=false — 표/전체 폭 콘텐츠가 직접 여백을 관리합니다.
        </div>
      </AdminShell>
    </div>
  ),
}
