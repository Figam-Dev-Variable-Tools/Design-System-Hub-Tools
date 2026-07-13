import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Camera, Trash2 } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { ProductForm, type ProductFormProps, type ProductFormValue } from './ProductForm'

/** 외부 이미지 대신 사용하는 인라인 SVG 플레이스홀더 */
const placeholderImage = (label: string, fill: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="100%" height="100%" fill="${fill}"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#6B7684" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`,
  )}`

const CATEGORIES = [
  { label: '키보드', value: 'keyboard' },
  { label: '마우스', value: 'mouse' },
  { label: '모니터', value: 'monitor' },
  { label: '헤드셋', value: 'headset' },
  { label: '액세서리', value: 'accessory' },
]

const EMPTY_VALUE: ProductFormValue = {
  name: '',
  category: null,
  price: '',
  stock: 0,
  onSale: true,
  images: [],
  options: [],
  description: '',
}

/** 편집 모드 목데이터 — 카테고리 선택, 옵션 2행, 이미지 3장, 상세 설명이 채워진 상태 */
const FILLED_VALUE: ProductFormValue = {
  name: '알루미늄 무접점 키보드 87키',
  category: 'keyboard',
  price: '189000',
  stock: 225,
  onSale: true,
  images: [
    placeholderImage('대표', '#E5E8EB'),
    placeholderImage('상세 1', '#D1D6DB'),
    placeholderImage('상세 2', '#F2F4F6'),
  ],
  options: [
    { id: 'option-color-black', name: '색상', value: '블랙', extraPrice: 0, stock: 120 },
    { id: 'option-color-silver', name: '색상', value: '실버', extraPrice: 5000, stock: 105 },
  ],
  description: [
    '<p><b>알루미늄 CNC 바디</b>에 무접점 스위치를 적용한 87키 텐키리스 키보드입니다.</p>',
    '<ul><li>키압 45g</li><li>PBT 이중사출 키캡</li><li>USB-C 분리형 케이블</li></ul>',
  ].join(''),
}

// 상태를 가진 컴포넌트라 스토리 안에서 로컬 데모 래퍼로 감싼다
function ProductFormDemo(props: ProductFormProps) {
  const [value, setValue] = useState<ProductFormValue>(props.value)
  return <ProductForm {...props} value={value} onChange={setValue} />
}

const meta = {
  title: 'Admin/ProductForm',
  component: ProductForm,
  tags: ['autodocs'],
  args: {
    value: EMPTY_VALUE,
    // 실제 상태는 아래 데모 래퍼가 들고 있으므로 여기서는 no-op
    onChange: () => {},
    categories: CATEGORIES,
    mode: 'create',
    submitting: false,
  },
  argTypes: {
    onChange: { control: false },
    onSubmit: { control: false },
    onCancel: { control: false },
    onSaveDraft: { control: false },

    // 섹션 ON/OFF — 기본은 전부 켜짐
    showImages: { control: 'boolean' },
    showOptions: { control: 'boolean' },
    showDescription: { control: 'boolean' },
    showCancel: { control: 'boolean' },

    // 아이콘 슬롯 — 노드라 컨트롤을 붙이지 않는다
    addImageIcon: { control: false },
    removeImageIcon: { control: false },

    // 카피
    submitLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    savingLabel: { control: 'text' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'padded',
  },
} satisfies Meta<typeof ProductForm>

export default meta
type Story = StoryObj<typeof meta>

/** 상품 등록 — 빈 폼에서 시작하는 신규 등록 모드 */
export const Default: Story = {
  render: (args) => <ProductFormDemo {...args} />,
}

/**
 * 상품 수정 — 카테고리·옵션 2행·이미지 3장·상세 설명이 채워진 편집 모드.
 * 이미지 타일을 좌우로 끌거나 `Ctrl/Cmd + ←/→`로 순서를 바꿀 수 있고, 첫 번째 타일에 '대표' 배지가 붙는다.
 */
export const EditProduct: Story = {
  args: {
    value: FILLED_VALUE,
    mode: 'edit',
    onSaveDraft: () => {},
  },
  render: (args) => <ProductFormDemo {...args} />,
}

/** 저장 중 — 모든 입력과 액션이 잠긴다 */
export const Submitting: Story = {
  args: {
    value: FILLED_VALUE,
    mode: 'edit',
    submitting: true,
    onSaveDraft: () => {},
  },
  render: (args) => <ProductFormDemo {...args} />,
}

/**
 * 기본 정보만 — 이미지·옵션·상세 설명 섹션을 모두 끈 최소 폼.
 * 쿠폰처럼 이미지도 옵션도 없는 무형 상품을 빠르게 등록할 때 쓴다.
 */
export const BasicOnly: Story = {
  args: {
    showImages: false,
    showOptions: false,
    showDescription: false,
  },
  render: (args) => <ProductFormDemo {...args} />,
}

/** 취소 없음 — 되돌아갈 곳이 없는 모달·인라인 폼에서는 취소 버튼을 끈다 */
export const NoCancel: Story = {
  args: {
    value: FILLED_VALUE,
    mode: 'edit',
    showCancel: false,
  },
  render: (args) => <ProductFormDemo {...args} />,
}

/** 아이콘 교체 — lucide 대신 서비스 아이콘 세트를 끼운 모습 */
export const CustomIcons: Story = {
  args: {
    value: FILLED_VALUE,
    mode: 'edit',
    addImageIcon: <Camera size={16} aria-hidden="true" />,
    removeImageIcon: <Trash2 size={12} />,
  },
  render: (args) => <ProductFormDemo {...args} />,
}

/** 카피 교체 — '등록' 대신 도메인 용어(발행/닫기)를 쓰는 화면 */
export const CustomCopy: Story = {
  args: {
    submitLabel: '발행',
    cancelLabel: '닫기',
    savingLabel: '발행 중…',
  },
  render: (args) => <ProductFormDemo {...args} />,
}
