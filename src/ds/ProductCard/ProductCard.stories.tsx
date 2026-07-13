import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { SiteSection } from '../SiteSection/SiteSection'
import { ProductCard, type ProductCardProps } from './ProductCard'

const meta = {
  title: 'Site/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  args: {
    image: mockImage('상품', 'sage'),
    brand: 'Space Planning',
    name: '자연석 조경 자갈',
    description: '천연 자연석 화분 및 실내 조경 장식재',
    price: 24000,
    ratio: '3x4',
    soldOut: false,
    accent: 'success',
    variant: 'card',
    currency: 'won',
    onClick: () => {},
  },
  argTypes: {
    ratio: { control: 'inline-radio', options: ['3x4', '1x1', '4x3', '16x9'] },
    accent: { control: 'inline-radio', options: ['primary', 'success'] },
    variant: {
      control: 'inline-radio',
      options: ['card', 'plain'],
      description: 'card=흰 카드(보더) / plain=판 없음(누끼 상품컷용)',
    },
    currency: {
      control: 'inline-radio',
      options: ['won', 'symbol'],
      description: "won='28,000원' / symbol='₩28,000'",
    },
    soldOut: { control: 'boolean' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof ProductCard>

export default meta
type Story = StoryObj<typeof meta>

/** 목록 데모용 상품 — 실제 데이터가 아니라 레이아웃 검증용이다. */
const PRODUCTS: ProductCardProps[] = [
  {
    image: mockImage('자갈', 'sage'),
    brand: 'Space Planning',
    name: '자연석 조경 자갈',
    description: '천연 자연석 화분 및 실내 조경 장식재',
    price: 24000,
    badges: [{ label: 'NEW', tone: 'success' }],
  },
  {
    image: mockImage('화분', 'sand'),
    brand: 'Space Planning',
    name: '토분 화분 세트',
    description: '통기성이 좋은 이탈리아산 토분 3종 세트',
    price: 58000,
    salePrice: 43500,
    badges: [{ label: '25%', tone: 'error' }],
  },
  {
    image: mockImage('조명', 'dusk'),
    brand: 'Space Planning',
    name: '실내 식물 성장 조명',
    // 긴 설명이 카드 폭을 밀지 않고 말줄임되는지 확인하는 케이스
    description: '광합성 파장에 맞춘 풀스펙트럼 LED — 타이머와 밝기 3단계 조절을 지원합니다',
    price: 89000,
  },
  {
    image: mockImage('선반', 'slate'),
    brand: 'Space Planning',
    name: '원목 플랜트 선반',
    description: '오크 원목 2단 선반',
    price: 132000,
    soldOut: true,
  },
  {
    // 이미지가 없으면 공용 Placeholder가 흰 판을 채운다
    brand: 'Space Planning',
    name: '수경재배 유리병',
    description: '뿌리가 보이는 수경재배용 핸드메이드 유리병',
    price: 19000,
  },
]

/**
 * 단일 카드 스토리용 폭 프레임.
 * 카드에는 max-width가 없다 — 그리드 셀을 채워야 하기 때문이다(480px 1열에서 카드가 320px로
 * 쪼그라들면 안 된다). 그래서 폭은 항상 바깥(목록/스토리)이 정한다.
 */
function CardFrame({ children }: { children: ReactNode }) {
  return <div style={{ width: 260 }}>{children}</div>
}

/** 상품 목록 그리드 — 실제 열 수(5/4/3/2/1)는 목록 섹션이 정하고, 카드는 셀을 채우기만 한다. */
function ProductGrid({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--ds-spacing-4)',
      }}
    >
      {children}
    </div>
  )
}

export const Default: Story = {
  render: (args) => (
    <CardFrame>
      <ProductCard {...args} />
    </CardFrame>
  ),
}

/** 할인가 — 원가에 취소선, 할인가가 강조색으로 */
export const Sale: Story = {
  args: {
    price: 58000,
    salePrice: 43500,
    badges: [{ label: '25%', tone: 'error' }],
  },
  render: (args) => (
    <CardFrame>
      <ProductCard {...args} />
    </CardFrame>
  ),
}

/** 품절 — 이미지 딤 + 중앙 '품절' 배지 */
export const SoldOut: Story = {
  args: {
    soldOut: true,
    badges: [{ label: 'BEST', tone: 'primary' }],
  },
  render: (args) => (
    <CardFrame>
      <ProductCard {...args} />
    </CardFrame>
  ),
}

/** 이미지 없음 — 공용 Placeholder(kind="image") */
export const NoImage: Story = {
  args: { image: undefined },
  render: (args) => (
    <CardFrame>
      <ProductCard {...args} />
    </CardFrame>
  ),
}

/** 긴 상품명·설명 — 1줄 말줄임으로 카드 폭을 밀지 않는다 */
export const LongText: Story = {
  args: {
    name: '자연석 조경 자갈 대용량 20kg 화이트 마블 팩',
    description: '천연 자연석 화분 및 실내 조경 장식재 — 수경재배·테라리움·마감재로 모두 쓰입니다',
    badges: [{ label: 'NEW', tone: 'success' }],
  },
  render: (args) => (
    <CardFrame>
      <ProductCard {...args} />
    </CardFrame>
  ),
}

/** 강조색 축 — 기본 success(레퍼런스의 그린) / primary */
export const Accents: Story = {
  render: (args) => (
    <ProductGrid>
      <ProductCard {...args} accent="success" name="자연석 조경 자갈 (success)" />
      <ProductCard {...args} accent="primary" name="자연석 조경 자갈 (primary)" />
    </ProductGrid>
  ),
}

/** 비율 축 — 기본 3x4(세로 상품컷) */
export const Ratios: Story = {
  render: (args) => (
    <ProductGrid>
      {(['3x4', '1x1', '4x3', '16x9'] as const).map((ratio) => (
        <ProductCard key={ratio} {...args} ratio={ratio} name={`비율 ${ratio}`} />
      ))}
    </ProductGrid>
  ),
}

/** 목록 그리드 — 카드 높이·가격 줄맞춤(tabular-nums)·말줄임을 함께 확인한다 */
export const Grid: Story = {
  render: () => (
    <ProductGrid>
      {PRODUCTS.map((product) => (
        <ProductCard key={product.name} {...product} onClick={() => {}} />
      ))}
    </ProductGrid>
  ),
}

/**
 * 섹션 위 — 흰 면(tone="plain")과 옅은 회색 면(tone="subtle") 모두에서 카드는 같은 흰 판이다.
 * 카드가 SiteSection의 강조색 클래스를 빌려 쓰므로 가격 셰이드도 문맥에 따라 흔들리지 않는다.
 */
export const OnSection: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <>
      <SiteSection title="PRODUCTS" subtitle="공간을 완성하는 조경·식물 제품" divider>
        <ProductGrid>
          {PRODUCTS.map((product) => (
            <ProductCard key={product.name} {...product} onClick={() => {}} />
          ))}
        </ProductGrid>
      </SiteSection>

      <SiteSection tone="subtle" title="BEST" subtitle="옅은 회색 면 위에서도 흰 카드." divider>
        <ProductGrid>
          {PRODUCTS.map((product) => (
            <ProductCard key={product.name} {...product} onClick={() => {}} />
          ))}
        </ProductGrid>
      </SiteSection>
    </>
  ),
}

/**
 * 판 없는 카드(plain) + ₩ 표기 — 상품컷이 누끼(흰 배경)일 때 보더가 이중 테두리로 읽히지 않게 한다.
 * 쇼핑 목록(ShopPage)의 기본 룩이다.
 */
export const PlainWithSymbolPrice: Story = {
  args: {
    variant: 'plain',
    currency: 'symbol',
    image: mockImage('자갈', 'sand'),
    price: 28000,
  },
}
