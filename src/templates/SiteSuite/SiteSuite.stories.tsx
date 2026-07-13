import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { SiteSuite } from './SiteSuite'

const meta = {
  title: 'Templates/SiteSuite',
  component: SiteSuite,
  tags: ['autodocs'],
  argTypes: {
    initialPage: {
      control: 'inline-radio',
      options: ['about', 'history', 'portfolio', 'shop', 'contact'],
    },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof SiteSuite>

export default meta
type Story = StoryObj<typeof meta>

// GNB 하나로 회사 소개 · 연혁 · 포트폴리오 · 상품 · 오시는길을 오간다.
// 우측 '1:1 문의' 버튼과 회사 소개의 CTA는 모두 문의 페이지로 이어진다.
export const Default: Story = {}

// 상품 — 흰 배경 + 흰 상품 카드 + 그린 가격.
// 카테고리 탭 · 정렬 · 서비스 Select · 페이지네이션(5열 한 줄 = 한 페이지)이 실제로 걸린다.
// 상품 카드를 누르면 유형·제목이 채워진 채 1:1 문의로 넘어간다.
export const Shop: Story = {
  args: { initialPage: 'shop' },
}

// 오시는길 — 지도 + 정보 카드 4종, 그 아래 1:1 문의 폼.
// 동의 체크 후 [문의 보내기]를 누르면 검증을 통과한 경우에만 접수되고 폼이 비워진다.
export const Contact: Story = {
  args: { initialPage: 'contact' },
}

// 포트폴리오 — 카드를 누르면 상세(대표 이미지 · 본문 · 갤러리 라이트박스 · 이전/다음)로,
// '목록으로'를 누르면 그 항목이 있던 페이지의 목록으로 돌아온다.
export const Portfolio: Story = {
  args: { initialPage: 'portfolio' },
}
