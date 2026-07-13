import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AlignLeft } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from '../Button/Button'
import { SiteHeader, type SiteHeaderProps } from './SiteHeader'

const ITEMS = [
  { label: '회사 소개', value: 'about' },
  { label: '연혁', value: 'history' },
  { label: '포트폴리오', value: 'portfolio' },
  { label: '상품', value: 'products' },
  { label: '오시는길', value: 'location' },
]

// 제어 컴포넌트용 데모 — 메뉴 클릭 시 활성 항목이 바뀐다
function SiteHeaderDemo(props: SiteHeaderProps) {
  const [value, setValue] = useState(props.value)
  return <SiteHeader {...props} value={value} onChange={setValue} />
}

/** 히어로 위에 얹은 모습을 보기 위한 밝은 히어로 면 — 프론트는 라이트 단일 테마다 */
function Hero({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: 'var(--ds-color-bgSubtle)', minHeight: 320 }}>
      {children}
      <div
        style={{
          padding: 'var(--ds-spacing-6) var(--ds-spacing-5)',
          color: 'var(--ds-color-text)',
          fontFamily: 'var(--ds-font-family)',
        }}
      >
        <div style={{ fontSize: 'var(--ds-font-size-xxl)', fontWeight: 'bold' }}>
          SPACE PLANNING
        </div>
        <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>
          공간을 다시 설계합니다
        </div>
      </div>
    </div>
  )
}

const meta = {
  title: 'Site/SiteHeader',
  component: SiteHeader,
  tags: ['autodocs'],
  args: {
    brand: 'SPACE PLANNING',
    items: ITEMS,
    value: 'about',
    sticky: false,
    transparent: false,
    showMenuButton: true,
    menuButtonLabel: '메뉴 열기',
    drawerTitle: '메뉴',
    actions: <Button variant="success" size="sm" label="1:1 문의" />,
  },
  argTypes: {
    brand: { control: false },
    actions: { control: false },
    onChange: { control: false },
    showMenuButton: { control: 'boolean', description: '모바일 햄버거 + 드로어' },
    menuIcon: { control: false, description: '햄버거 아이콘(기본 Menu)' },
    menuButtonLabel: { control: 'text', description: '햄버거 접근성 이름' },
    drawerTitle: { control: 'text', description: '드로어 헤더 문구' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof SiteHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <SiteHeaderDemo {...args} />,
}

/** 투명 — 밝은 히어로 위에 얹힐 때. 배경/보더 없이 글자만 얹힌다. */
export const Transparent: Story = {
  args: { transparent: true, sticky: true },
  render: (args) => (
    <Hero>
      <SiteHeaderDemo {...args} />
    </Hero>
  ),
}

/** 모바일(<768) — 메뉴·액션이 숨고 햄버거 → 드로어로 대체된다 */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => <SiteHeaderDemo {...args} />,
}

/**
 * 메뉴 버튼 OFF — 랜딩처럼 GNB가 필요 없을 때. 햄버거와 드로어가 DOM에서 사라진다.
 * 아이콘/문구 교체(menuIcon · menuButtonLabel · drawerTitle)도 함께 보여 준다.
 */
export const MenuButton: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 기본 — 햄버거 있음 */}
      <SiteHeaderDemo {...args} />
      {/* 아이콘·문구 교체 */}
      <SiteHeaderDemo
        {...args}
        brand="ALIGN LEFT"
        menuIcon={<AlignLeft size={20} aria-hidden="true" />}
        menuButtonLabel="전체 메뉴 열기"
        drawerTitle="전체 메뉴"
      />
      {/* OFF — 브랜드만 남는다 */}
      <SiteHeaderDemo {...args} brand="NO MENU" showMenuButton={false} />
    </div>
  ),
}

/** 긴 라벨 — 브랜드/메뉴가 말줄임되고 액션은 유지된다 */
export const LongLabels: Story = {
  render: () => (
    // maxWidth 100% — 좁은 뷰포트에서 프레임 자체가 가로 오버플로를 만들지 않게 한다
    <div style={{ width: 640, maxWidth: '100%', border: '1px dashed var(--ds-color-border)' }}>
      <SiteHeaderDemo
        brand="아주 긴 회사 브랜드 이름 주식회사"
        value="about"
        items={[
          { label: '아주 긴 메뉴 라벨 하나입니다', value: 'about' },
          { label: '두 번째로 긴 메뉴 라벨', value: 'history' },
          { label: 'VeryLongUnbrokenMenuLabelHere', value: 'portfolio' },
          { label: '상품', value: 'products' },
        ]}
        actions={<Button variant="success" size="sm" label="1:1 문의" />}
      />
    </div>
  ),
}
