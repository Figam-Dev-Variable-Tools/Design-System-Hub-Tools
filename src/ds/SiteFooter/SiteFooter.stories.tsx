import type { Meta, StoryObj } from '@storybook/react'
import { Globe, MessageCircle, Send } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { SiteFooter } from './SiteFooter'

const COMPANY = [
  { label: '상호', value: '스페이스플래닝 주식회사' },
  { label: '대표', value: '홍성보' },
  { label: '사업자번호', value: '123-45-67890' },
  { label: '주소', value: '서울특별시 강남구 테헤란로 123, 8층' },
  { label: '전화', value: '02-1234-5678' },
  { label: '이메일', value: 'hello@spaceplanning.ai' },
]

const LINKS = [
  { label: '회사 소개', href: '#about' },
  { label: '연혁', href: '#history' },
  { label: '포트폴리오', href: '#portfolio' },
  { label: '상품', href: '#products' },
  { label: '오시는길', href: '#location' },
]

// SNS 아이콘 슬롯 — lucide에는 브랜드 아이콘이 없어 일반 아이콘으로 대체한다
function Social() {
  return (
    <>
      <a href="#blog" aria-label="블로그" style={{ color: 'inherit' }}>
        <Globe size={18} aria-hidden="true" />
      </a>
      <a href="#channel" aria-label="채널톡" style={{ color: 'inherit' }}>
        <MessageCircle size={18} aria-hidden="true" />
      </a>
      <a href="#newsletter" aria-label="뉴스레터" style={{ color: 'inherit' }}>
        <Send size={18} aria-hidden="true" />
      </a>
    </>
  )
}

const meta = {
  title: 'Site/SiteFooter',
  component: SiteFooter,
  tags: ['autodocs'],
  args: {
    brand: 'SPACE PLANNING',
    company: COMPANY,
    links: LINKS,
    social: <Social />,
    copyright: '© 2026 SPACE PLANNING Inc. All rights reserved.',
    showCompany: true,
    showDivider: true,
  },
  argTypes: {
    brand: { control: false },
    social: { control: false },
    showCompany: { control: 'boolean', description: '사업자 정보 블록(DefinitionList) 노출' },
    showDivider: { control: 'boolean', description: '저작권 줄 위 구분선' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof SiteFooter>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 흰 본문 아래 아주 옅은 회색 면 */
export const Default: Story = {}

/** 회사 정보만 — 링크·SNS 없이 최소 구성 */
export const Minimal: Story = {
  args: {
    links: undefined,
    social: undefined,
    copyright: '© 2026 SPACE PLANNING Inc.',
  },
}

/**
 * 토글 OFF — 사업자 정보와 구분선을 끈 브랜드 랜딩용 최소 푸터.
 * (사업자 등록이 없는 사이트에서 빈 dl이 남지 않게 블록째 지운다)
 */
export const TogglesOff: Story = {
  args: {
    showCompany: false,
    showDivider: false,
  },
}

/** 긴 값 — 주소/이메일이 길어도 말줄임되고 레이아웃이 깨지지 않는다 */
export const LongValues: Story = {
  render: (args) => (
    // maxWidth 100% — 좁은 뷰포트에서 프레임 자체가 가로 오버플로를 만들지 않게 한다
    <div style={{ width: 560, maxWidth: '100%', border: '1px dashed var(--ds-color-border)' }}>
      <SiteFooter
        {...args}
        company={[
          { label: '상호', value: '아주 긴 회사 이름 스페이스플래닝 주식회사' },
          { label: '주소', value: '서울특별시 강남구 테헤란로 123, 8층 스페이스플래닝빌딩' },
          { label: '이메일', value: 'very.long.email.address@spaceplanning.ai' },
        ]}
      />
    </div>
  ),
}
