import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SlidersHorizontal } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from '../Button/Button'
import { ProductCard } from '../ProductCard/ProductCard'
import { SiteSection } from '../SiteSection/SiteSection'
import { mockImage } from '../../shared/mediaMock'
import { SortBar, type SortBarProps } from './SortBar'

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'priceAsc', label: '낮은 가격순' },
  { value: 'priceDesc', label: '높은 가격순' },
]

const SERVICE_OPTIONS = [
  { value: 'all', label: '서비스별' },
  { value: 'plant', label: '식물' },
  { value: 'stone', label: '조경석' },
  { value: 'tool', label: '도구' },
]

/** 정렬/필터는 제어 컴포넌트다 — 스토리에서 상태를 쥐고 값을 내려준다. */
function Demo(props: SortBarProps) {
  const [sort, setSort] = useState('latest')
  const [service, setService] = useState('all')

  return (
    <SortBar
      {...props}
      selects={[
        { key: 'sort', value: sort, options: SORT_OPTIONS, onChange: setSort },
        { key: 'service', value: service, options: SERVICE_OPTIONS, onChange: setService },
      ]}
    />
  )
}

const meta = {
  title: 'Site/SortBar',
  component: SortBar,
  tags: ['autodocs'],
  args: {
    total: 6,
    totalLabel: '전체',
  },
  argTypes: {
    selects: { control: false },
    actions: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  // Select 패널이 열려도 캔버스에서 잘리지 않게 아래 여백을 둔다
  decorators: [
    (Story) => (
      <div style={{ paddingBottom: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SortBar>

export default meta
type Story = StoryObj<typeof meta>

/** 레퍼런스: 좌 "전체 6개" · 우 "최신순 ▾" "서비스별 ▾" */
export const Default: Story = {
  render: (args) => <Demo {...args} />,
}

/** 총 개수 없음 — 컨트롤만 우측에 붙는다 */
export const WithoutTotal: Story = {
  args: { total: undefined },
  render: (args) => <Demo {...args} />,
}

/** actions 슬롯 — Select 오른쪽에 버튼 등을 붙인다 */
export const WithActions: Story = {
  render: (args) => (
    <Demo
      {...args}
      actions={
        <Button
          variant="secondary"
          appearance="outline"
          size="md"
          label="필터"
          showLeftIcon
          leftIcon={<SlidersHorizontal size={16} />}
        />
      }
    />
  ),
}

/** 라벨 교체 — "상품 128개" */
export const CustomLabel: Story = {
  args: { total: 128, totalLabel: '상품' },
  render: (args) => <Demo {...args} />,
}

const PRODUCTS = [
  { image: mockImage('자갈', 'sage'), name: '자연석 조경 자갈', price: 24000 },
  { image: mockImage('화분', 'sand'), name: '토분 화분 세트', price: 58000, salePrice: 43500 },
  { image: mockImage('조명', 'dusk'), name: '실내 식물 성장 조명', price: 89000 },
  { image: mockImage('선반', 'slate'), name: '원목 플랜트 선반', price: 132000 },
]

/** 실사용: 상품 목록 상단 — 흰 섹션 위의 바 + 흰 상품 카드. */
export const InProductList: Story = {
  args: { total: PRODUCTS.length },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <SiteSection title="PRODUCTS" subtitle="공간을 완성하는 조경·식물 제품">
      <Demo {...args} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--ds-spacing-4)',
          marginTop: 'var(--ds-spacing-4)',
        }}
      >
        {PRODUCTS.map((product) => (
          <ProductCard
            key={product.name}
            {...product}
            brand="Space Planning"
            description="천연 자연석 화분 및 실내 조경 장식재"
            onClick={() => {}}
          />
        ))}
      </div>
    </SiteSection>
  ),
}
