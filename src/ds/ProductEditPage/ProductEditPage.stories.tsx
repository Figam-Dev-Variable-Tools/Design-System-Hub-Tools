import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Camera, Trash2 } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import {
  EMPTY_PRODUCT_VALUE,
  ProductEditPage,
  createProductImage,
  type ProductCategoryOption,
  type ProductEditPageProps,
  type ProductEditValue,
  type ProductSelectOption,
} from './ProductEditPage'

/* ── 목데이터 ─────────────────────────────────────────────────────────────── */

const BRANDS: ProductSelectOption[] = [
  { label: '한샘', value: 'hanssem' },
  { label: '리바트', value: 'livart' },
  { label: '일룸', value: 'iloom' },
  { label: '데스커', value: 'desker' },
  { label: '자체 제작', value: 'own' },
]

const CATEGORIES: ProductCategoryOption[] = [
  {
    label: '가구',
    value: 'furniture',
    children: [
      { label: '책상·테이블', value: 'desk' },
      { label: '의자', value: 'chair' },
      { label: '수납장', value: 'storage' },
    ],
  },
  {
    label: '가전',
    value: 'appliance',
    children: [
      { label: '공기청정기', value: 'purifier' },
      { label: '정수기', value: 'water' },
      { label: '안마의자', value: 'massage' },
    ],
  },
  {
    label: '침구',
    value: 'bedding',
    children: [
      { label: '매트리스', value: 'mattress' },
      { label: '이불·패드', value: 'blanket' },
    ],
  },
]

/** 판매중인 원목 책상 — 필수값이 모두 채워진 현실적인 수정 화면 */
const SAMPLE_PRODUCT: ProductEditValue = {
  brand: 'hanssem',
  category1: 'furniture',
  category2: 'desk',
  name: '오크 원목 1200 서랍형 책상',
  images: [
    createProductImage(mockImage('정면', 'sand')),
    createProductImage(mockImage('측면', 'slate')),
    createProductImage(mockImage('서랍', 'sage')),
  ],
  intro:
    '<p>북유럽산 오크 원목을 그대로 살린 <b>1200mm 서랍형 책상</b>입니다. 3분이면 조립이 끝납니다.</p>',
  maker: '한샘',
  origin: '국내산',
  headline: '3분 조립 · 5년 무상 A/S',
  detailHtml:
    '<p><b>소재</b><br>북유럽산 오크 원목 · 친환경 E0 등급 자재를 사용했습니다.</p><p><b>사이즈</b><br>가로 1200 × 세로 600 × 높이 750 (mm)</p><p><b>배송 안내</b><br>주문 후 평균 3~5일 이내 출고되며, 설치 기사 방문 조립 서비스를 함께 신청할 수 있습니다.</p>',
  price: '389000',
  salePrice: '299000',
  pointEnabled: true,
  pointType: 'rate',
  pointValue: '3',
  shippingType: 'conditional',
  shippingFee: '3000',
  freeOver: '50000',
  stock: 42,
  soldOut: false,
  stockThreshold: 5,
  options: [
    { id: 'option-color-oak', name: '색상', value: '내추럴 오크', extraPrice: 0, stock: 24 },
    { id: 'option-color-walnut', name: '색상', value: '월넛', extraPrice: 20000, stock: 18 },
    { id: 'option-size-1400', name: '사이즈', value: '1400mm', extraPrice: 50000, stock: 12 },
  ],
  highlights: ['best', 'md'],
  pinned: false,
  onSale: true,
  listed: true,
  searchable: true,
  memberOnly: false,
  seoTitle: '오크 원목 서랍형 책상 1200 | 3분 조립',
  seoDescription:
    '북유럽산 오크 원목으로 만든 1200mm 서랍형 책상. 3분 조립, 5년 무상 A/S, 5만원 이상 무료배송.',
  seoKeywords: '원목책상, 수납책상, 서랍책상, 학생책상',
}

const meta = {
  title: 'Admin/ProductEditPage',
  component: ProductEditPage,
  tags: ['autodocs'],
  args: {
    value: SAMPLE_PRODUCT,
    onChange: () => {},
    brands: BRANDS,
    categories: CATEGORIES,
    status: 'selling',
    maxImages: 8,
    saving: false,
    loading: false,
    density: 'compact',
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    brands: { control: false },
    categories: { control: false },
    highlightOptions: { control: false },

    // 슬롯 ON/OFF — 기본은 전부 켜짐
    showAnchorNav: { control: 'boolean' },
    showPreview: { control: 'boolean' },
    showFooter: { control: 'boolean' },
    showSaveDraft: { control: 'boolean' },

    // 아이콘 슬롯 — 노드라 컨트롤을 붙이지 않는다
    addImageIcon: { control: false },
    removeImageIcon: { control: false },

    // 카피
    title: { control: 'text' },
    saveLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    savingLabel: { control: 'text' },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof ProductEditPage>

export default meta
type Story = StoryObj<typeof meta>

/** 상태를 쥔 데모 래퍼 — 입력이 우측 미리보기에 실시간 반영되는지 확인한다 */
type ProductEditDemoProps = Omit<
  ProductEditPageProps,
  'value' | 'onChange' | 'brands' | 'categories'
> & {
  initial: ProductEditValue
}

function ProductEditDemo({ initial, ...rest }: ProductEditDemoProps) {
  const [value, setValue] = useState<ProductEditValue>(initial)

  return (
    <ProductEditPage
      value={value}
      onChange={setValue}
      brands={BRANDS}
      categories={CATEGORIES}
      onSave={() => {}}
      onSaveDraft={() => {}}
      onCancel={() => {}}
      {...rest}
    />
  )
}

/**
 * 기본 — 판매중인 상품을 수정한다.
 * 상품명·판매가·할인가를 바꾸면 우측 폰 미리보기의 이름/할인율/가격이 즉시 따라온다.
 */
export const Default: Story = {
  render: () => <ProductEditDemo initial={SAMPLE_PRODUCT} lastSavedLabel="마지막 저장 3분 전" />,
}

/**
 * 신규 등록 — 값이 비어 있는 상태.
 * 저장을 누르면 필수값(브랜드·1차 카테고리·상품명·판매가) 오류가 드러나고
 * 좌측 앵커에 오류 점이 찍히며 첫 오류 섹션으로 스크롤된다.
 */
export const Empty: Story = {
  render: () => <ProductEditDemo initial={EMPTY_PRODUCT_VALUE} status="draft" />,
}

/** 로딩 — 상품을 불러오는 동안 본문이 스켈레톤 카드로 대체된다. */
export const Loading: Story = {
  render: () => <ProductEditDemo initial={EMPTY_PRODUCT_VALUE} loading />,
}

/** 저장 중 — 전 입력이 잠기고 버튼이 '저장 중…'으로 바뀐다. */
export const Saving: Story = {
  render: () => <ProductEditDemo initial={SAMPLE_PRODUCT} saving />,
}

/**
 * 품절 상태 — 헤더 배지가 '품절'로 바뀌고,
 * 품절 처리를 켜면 미리보기의 [장바구니]·[렌탈하기]가 잠긴다.
 */
export const SoldOut: Story = {
  render: () => (
    <ProductEditDemo
      initial={{ ...SAMPLE_PRODUCT, soldOut: true, stock: 0, options: [] }}
      status="soldout"
    />
  ),
}

/**
 * 본문만 — 좌측 앵커·우측 미리보기·하단 액션 바를 모두 끈 최소 구성.
 * 좁은 모달이나 임베드 화면에 그대로 얹을 때 쓴다(저장은 헤더 버튼이 맡는다).
 */
export const ContentOnly: Story = {
  render: () => (
    <ProductEditDemo
      initial={SAMPLE_PRODUCT}
      showAnchorNav={false}
      showPreview={false}
      showFooter={false}
    />
  ),
}

/** 임시저장 없음 — 초안 단계가 없는 워크플로에서는 푸터의 [임시저장]을 끈다 */
export const NoSaveDraft: Story = {
  render: () => (
    <ProductEditDemo
      initial={SAMPLE_PRODUCT}
      showSaveDraft={false}
      lastSavedLabel="마지막 저장 3분 전"
    />
  ),
}

/** 아이콘 교체 — lucide 대신 서비스 아이콘 세트를 끼운 모습 */
export const CustomIcons: Story = {
  render: () => (
    <ProductEditDemo
      initial={SAMPLE_PRODUCT}
      addImageIcon={<Camera size={16} aria-hidden="true" />}
      removeImageIcon={<Trash2 size={12} />}
    />
  ),
}

/** 카피 교체 — 같은 화면을 '상품 등록 / 승인 요청' 문구로 다시 쓴다 */
export const CustomCopy: Story = {
  render: () => (
    <ProductEditDemo
      initial={EMPTY_PRODUCT_VALUE}
      status="draft"
      title="상품 등록"
      saveLabel="승인 요청"
      cancelLabel="닫기"
      savingLabel="요청 중…"
    />
  ),
}
