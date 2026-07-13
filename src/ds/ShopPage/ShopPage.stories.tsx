import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import type { ViewSwitchValue } from '../ViewSwitch/ViewSwitch'
import { ShopPage, type ShopItem, type ShopPageProps } from './ShopPage'

/** 카테고리 탭 — 레퍼런스 그대로 */
const CATEGORIES = [
  { label: '전체', value: 'all' },
  { label: '조경석', value: 'stone' },
  { label: '수목', value: 'tree' },
  { label: '잔디', value: 'grass' },
  { label: '데크', value: 'deck' },
  { label: '조명', value: 'light' },
]

/** 목데이터 — 레이아웃 검증용이며 실제 상품이 아니다. */
const ITEMS: ShopItem[] = [
  {
    id: 'p-1',
    image: mockImage('자갈', 'sand'),
    brand: 'Space Planning',
    name: '자연석 조경 자갈',
    description: '천연 자연석 화분 및 실내 조경 장식재',
    price: 28000,
  },
  {
    id: 'p-2',
    image: mockImage('토분', 'sand'),
    brand: 'Space Planning',
    name: '이탈리아 토분 3종 세트',
    description: '통기성이 좋은 테라코타 토분 — 소·중·대 한 세트',
    price: 58000,
    salePrice: 43500,
  },
  {
    id: 'p-3',
    image: mockImage('수목', 'sage'),
    brand: '그린하우스',
    name: '소나무 조경수 (H2.0)',
    description: '중정·진입광장에 쓰는 수형 좋은 조경수',
    price: 420000,
  },
  {
    id: 'p-4',
    image: mockImage('배양토', 'slate'),
    brand: '소일랩',
    name: '실내식물 전용 배양토 5L',
    // 긴 설명이 카드 폭을 밀지 않고 말줄임되는지 확인하는 케이스
    description: '펄라이트와 코코피트를 배합해 배수와 보습을 동시에 잡은 실내 화분 전용 흙입니다',
    price: 12000,
  },
  {
    id: 'p-5',
    image: mockImage('잔디', 'sage'),
    brand: 'Space Planning',
    name: '한국잔디 롤 (1㎡)',
    description: '식재 후 활착이 빠른 국산 롤잔디',
    price: 9000,
  },
  {
    id: 'p-6',
    image: mockImage('데크', 'dusk'),
    brand: '우드랩',
    name: '방부목 데크재 20T',
    description: '옥외 데크·파고라용 방부 처리 목재',
    price: 34000,
    soldOut: true,
  },
  {
    id: 'p-7',
    image: mockImage('조명', 'slate'),
    brand: '라이트가든',
    name: '가든 스파이크 조명',
    description: '수목 하부 조명 · IP65 방수',
    price: 46000,
  },
  {
    // 이미지가 없으면 공용 Placeholder(kind="image")가 판을 채운다
    id: 'p-8',
    brand: '소일랩',
    name: '수경재배 유리병',
    description: '뿌리가 보이는 핸드메이드 유리병',
    price: 19000,
  },
]

/**
 * 목록은 제어 컴포넌트다 — 카테고리·정렬·뷰·페이지 상태를 스토리가 쥔다.
 * '서비스별' Select는 onServiceChange를 넘긴 스토리(WithServiceFilter)에서만 붙는다.
 */
function Demo({ withService = false, ...props }: ShopPageProps & { withService?: boolean }) {
  const [category, setCategory] = useState(props.category)
  const [sort, setSort] = useState(props.sort)
  const [service, setService] = useState(props.service ?? 'all')
  const [page, setPage] = useState(props.page ?? 1)
  const [view, setView] = useState<ViewSwitchValue>(props.view ?? 'card')

  return (
    <ShopPage
      {...props}
      category={category}
      onCategoryChange={setCategory}
      sort={sort}
      onSortChange={setSort}
      service={withService ? service : undefined}
      onServiceChange={withService ? setService : undefined}
      view={view}
      onViewChange={setView}
      page={page}
      onPageChange={setPage}
    />
  )
}

const meta = {
  title: 'Site/ShopPage',
  component: ShopPage,
  tags: ['autodocs'],
  args: {
    items: ITEMS,
    categories: CATEGORIES,
    category: 'all',
    sort: 'popular',
    total: 24,
    page: 1,
    totalPages: 3,
    loading: false,
    accent: 'success',
    columns: 4,
    cardVariant: 'plain',
    ratio: '3x4',
    currency: 'symbol',
    showBrand: true,
    showDescription: true,
    onCategoryChange: () => {},
    onSortChange: () => {},
    onOpen: () => {},
  },
  argTypes: {
    accent: { control: 'inline-radio', options: ['primary', 'success'] },
    columns: { control: 'inline-radio', options: [3, 4, 5] },
    cardVariant: { control: 'inline-radio', options: ['plain', 'card'] },
    ratio: { control: 'select', options: ['3x4', '1x1', '4x3', '16x9'] },
    currency: { control: 'inline-radio', options: ['symbol', 'won'] },
    showBrand: { control: 'boolean' },
    showDescription: { control: 'boolean' },
    loading: { control: 'boolean' },
    items: { control: false },
    categories: { control: false },
    title: { control: false },
    subtitle: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof ShopPage>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 가운데 히어로 + 가운데 탭 + 툴바(뷰·정렬) + 4열 누끼 카드 + 원형 페이지네이션. */
export const Default: Story = {
  render: (args) => <Demo {...args} />,
}

/** 흰 카드 판 — 배경이 다양한 사진컷을 쓸 때는 보더가 있는 card 판이 낫다. */
export const FramedCards: Story = {
  args: { cardVariant: 'card' },
  render: (args) => <Demo {...args} />,
}

/** 서비스별 필터 추가 — onServiceChange를 넘기면 정렬 옆에 Select가 하나 더 붙는다. */
export const WithServiceFilter: Story = {
  render: (args) => <Demo {...args} withService />,
}

/** 카드 텍스트 최소화 — 브랜드·설명을 끄면 상품명과 가격만 남는다. */
export const MinimalCards: Story = {
  args: { showBrand: false, showDescription: false },
  render: (args) => <Demo {...args} />,
}

/** 강조색 축 — accent="primary"면 활성 탭 밑줄·가격·현재 페이지가 브랜드 색으로 바뀐다. */
export const AccentPrimary: Story = {
  args: { accent: 'primary' },
  render: (args) => <Demo {...args} />,
}

/** 로딩 — 그리드 자리에 Skeleton 카드(3:4 미디어 + 본문 3줄) */
export const Loading: Story = {
  args: { loading: true },
  render: (args) => <Demo {...args} />,
}

/** 빈 상태 — EmptyState(Placeholder kind="search"). 페이지네이션은 그리지 않는다. */
export const Empty: Story = {
  args: { items: [], total: 0, category: 'grass' },
  render: (args) => <Demo {...args} />,
}
