import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CopyPlus, PenLine, Trash, ZoomIn } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import type { Attachment } from '../AttachmentList/AttachmentList'
import { PageContainer } from '../PageContainer/PageContainer'
import {
  ProductDetail,
  type ProductDetailProps,
  type ProductDetailValue,
  type ProductInquiry,
  type ProductOption,
  type ProductOrder,
  type ProductSalesPoint,
} from './ProductDetail'

const IMAGES = [
  { id: 'img-1', url: mockImage('대표', 'slate'), alt: '에어로 러닝화 대표 이미지' },
  { id: 'img-2', url: mockImage('측면', 'sage'), alt: '에어로 러닝화 측면' },
  { id: 'img-3', url: mockImage('밑창', 'sand'), alt: '에어로 러닝화 밑창' },
  { id: 'img-4', url: mockImage('착용', 'dusk'), alt: '에어로 러닝화 착용컷' },
]

const OPTIONS: ProductOption[] = [
  { id: 'opt-1', name: '컬러 / 사이즈', value: '블랙 / 250', extraPrice: 0, stock: 24 },
  { id: 'opt-2', name: '컬러 / 사이즈', value: '블랙 / 260', extraPrice: 0, stock: 12 },
  { id: 'opt-3', name: '컬러 / 사이즈', value: '블랙 / 270', extraPrice: 0, stock: 0 },
  { id: 'opt-4', name: '컬러 / 사이즈', value: '화이트 / 250', extraPrice: 5000, stock: 8 },
  { id: 'opt-5', name: '컬러 / 사이즈', value: '화이트 / 260', extraPrice: 5000, stock: 31 },
  {
    id: 'opt-6',
    name: '컬러 / 사이즈',
    value: '라임 / 270 (한정)',
    extraPrice: 12000,
    stock: 3,
    active: false,
  },
]

const SALES: ProductSalesPoint[] = [
  { month: '2월', count: 128 },
  { month: '3월', count: 164 },
  { month: '4월', count: 142 },
  { month: '5월', count: 203 },
  { month: '6월', count: 251 },
  { month: '7월', count: 187 },
]

const ORDERS: ProductOrder[] = [
  {
    id: 'ord-1',
    orderNo: 'ORD-2026-11820',
    orderedAt: '2026-07-12',
    customer: '이서연',
    option: '블랙 / 260',
    quantity: 1,
    amount: 129000,
    status: '배송중',
  },
  {
    id: 'ord-2',
    orderNo: 'ORD-2026-11804',
    orderedAt: '2026-07-11',
    customer: '박준호',
    option: '화이트 / 250',
    quantity: 2,
    amount: 268000,
    status: '결제완료',
  },
  {
    id: 'ord-3',
    orderNo: 'ORD-2026-11781',
    orderedAt: '2026-07-10',
    customer: '김도현',
    option: '블랙 / 250',
    quantity: 1,
    amount: 129000,
    status: '배송완료',
  },
  {
    id: 'ord-4',
    orderNo: 'ORD-2026-11762',
    orderedAt: '2026-07-09',
    customer: '최유진',
    option: '라임 / 270 (한정)',
    quantity: 1,
    amount: 141000,
    status: '취소',
  },
]

const INQUIRIES: ProductInquiry[] = [
  {
    id: 'inq-1',
    title: '270 사이즈 재입고 예정이 있을까요? 알림 신청도 가능한가요?',
    author: '한지민',
    createdAt: '2026-07-12',
    status: 'waiting',
    type: '재입고',
  },
  {
    id: 'inq-2',
    title: '평소 265 신는데 260과 270 중 어떤 걸 고르는 게 좋을까요',
    author: '오세훈',
    createdAt: '2026-07-11',
    status: 'answered',
    type: '상품',
  },
  {
    id: 'inq-3',
    title: '배송이 3일째 준비중인데 언제 출발하나요?',
    author: '정하늘',
    createdAt: '2026-07-09',
    status: 'answered',
    type: '배송',
  },
  {
    id: 'inq-4',
    title: '색상 교환 문의드립니다',
    author: '윤아름',
    createdAt: '2026-07-05',
    status: 'closed',
    type: '교환·반품',
  },
]

const ATTACHMENTS: Attachment[] = [
  { id: 'att-1', name: '상품_상세스펙.pdf', size: 428_000, type: 'application/pdf' },
  { id: 'att-2', name: 'KC인증서.pdf', size: 316_000, type: 'application/pdf' },
]

// RichTextEditor가 저장한 상세 설명 HTML — 읽기 전용으로 렌더된다
const DESCRIPTION_HTML = `
  <h3>가벼움과 반발력을 동시에</h3>
  <p>
    <strong>에어로 러닝화 X2</strong>는 235g(270 기준)의 경량 미드솔과 카본 플레이트를 결합해
    장거리 러닝에서도 발목 피로를 줄여줍니다.
  </p>
  <ul>
    <li>초경량 EVA 미드솔 — 전작 대비 12% 경량화</li>
    <li>통기성 니트 어퍼 — 여름철 러닝에도 쾌적하게</li>
    <li>미끄럼 방지 러버 아웃솔 — 젖은 노면에서도 안정적</li>
  </ul>
  <p>사이즈는 평소 신는 사이즈보다 5mm 크게 선택하시는 것을 권장합니다.</p>
`

const BASE: ProductDetailValue = {
  id: 'prd-2026-0481',
  name: '에어로 러닝화 X2 (남녀공용)',
  code: 'SHOE-AERO-X2',
  status: 'onSale',
  visible: true,
  category: '스포츠 > 러닝화',
  tags: ['신상품', '베스트', '무료배송'],
  createdAt: '2026-03-02',
  updatedAt: '2026-07-12 17:40',
  createdBy: '김상품',
  manager: '박엠디',
  images: IMAGES,
  basic: {
    price: 149000,
    salePrice: 129000,
    stock: 78,
    shippingFee: 0,
    taxable: true,
    safetyStock: 20,
  },
  options: OPTIONS,
  descriptionHtml: DESCRIPTION_HTML,
  sales: SALES,
  orders: ORDERS,
  inquiries: INQUIRIES,
  attachments: ATTACHMENTS,
}

/**
 * 데모 래퍼 — 노출/판매 토글, 태그 제거를 로컬 상태로 반영한다.
 * (제어 컴포넌트라 상위가 value를 갱신해야 화면이 바뀐다)
 */
function ProductDetailDemo(args: ProductDetailProps) {
  const [value, setValue] = useState<ProductDetailValue>(args.value)

  // args가 바뀌면(스토리 전환/컨트롤 변경) 로컬 상태를 다시 맞춘다
  const [synced, setSynced] = useState(args.value)
  if (synced !== args.value) {
    setSynced(args.value)
    setValue(args.value)
  }

  return (
    <PageContainer maxWidth="full">
      <ProductDetail
        {...args}
        value={value}
        onVisibleChange={(visible) => setValue((prev) => ({ ...prev, visible }))}
        onStatusChange={(status) => setValue((prev) => ({ ...prev, status }))}
        onTagsChange={(tags) => setValue((prev) => ({ ...prev, tags }))}
      />
    </PageContainer>
  )
}

const meta = {
  title: 'Admin/ProductDetail',
  component: ProductDetail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  args: { value: BASE },
  argTypes: {
    value: { control: 'object' },
    defaultTab: { control: 'select', options: ['sales', 'orders', 'inquiries'] },
    saving: { control: 'boolean' },

    // 섹션 ON/OFF — 키를 빼면 전부 true(현재 화면)
    show: { control: 'object' },

    // 문구 — 비우면 현재 문구 그대로
    title: { control: 'text' },
    emptyText: { control: 'text' },
    soldOutLabel: { control: 'text' },
    countUnit: { control: 'text' },

    // 아이콘 슬롯 — 노드라 컨트롤로 조작하지 않는다(스토리로 보여준다)
    editIcon: { control: false },
    duplicateIcon: { control: false },
    deleteIcon: { control: false },
    zoomIcon: { control: false },

    onVisibleChange: { control: false },
    onStatusChange: { control: false },
    onCategoryEdit: { control: false },
    onTagsChange: { control: false },
    onImagePreview: { control: false },
    onOrderClick: { control: false },
    onInquiryClick: { control: false },
    onAttachmentDownload: { control: false },
    onBackToList: { control: false },
    onEdit: { control: false },
    onDuplicate: { control: false },
    onDelete: { control: false },
    onSave: { control: false },
  },
  // 테마가 바뀌면 AdminChart가 토큰 색을 다시 읽도록 key로 리마운트한다(AdminChart 스토리와 동일)
  render: (args, { globals }) => <ProductDetailDemo key={String(globals.theme)} {...args} />,
} satisfies Meta<typeof ProductDetail>

export default meta

type Story = StoryObj<typeof meta>

/** 판매중 — 이미지 4장 · 옵션 6개 · 판매 통계 탭 */
export const Default: Story = {}

/** 품절 — 재고 0(전 옵션 소진) + 판매중지 */
export const SoldOut: Story = {
  args: {
    value: {
      ...BASE,
      status: 'stopped',
      visible: false,
      basic: { ...BASE.basic, stock: 0 },
      options: OPTIONS.map((option) => ({ ...option, stock: 0 })),
      orders: ORDERS.slice(0, 2),
      updatedAt: '2026-07-13 09:05',
    },
  },
}

/** 이미지 없음 — 공용 Placeholder로 대체 */
export const NoImages: Story = {
  args: {
    value: {
      ...BASE,
      images: [],
      attachments: [],
      descriptionHtml: '',
      tags: [],
    },
  },
}

/**
 * 전부 ON — 본문(갤러리 · 옵션 · 상세 설명 · 탭) + 사이드 6장 + 하단 액션 바.
 * show를 생략하면 이 상태다(기본값 전부 true) — Default와 같은 화면이다.
 */
export const AllSections: Story = {
  args: {
    show: {
      gallery: true,
      options: true,
      description: true,
      tabs: true,
      stats: true,
      visibility: true,
      taxonomy: true,
      timeline: true,
      manager: true,
      quickActions: true,
      footer: true,
    },
  },
}

/**
 * 대부분 OFF — 헤더 + 기본 정보만 남긴 읽기용 축약 화면.
 * 사이드 카드를 전부 끄면 우측 360 칼럼 자체가 사라진다(빈 자리를 남기지 않는다).
 */
export const Minimal: Story = {
  args: {
    show: {
      gallery: false,
      options: false,
      description: false,
      tabs: false,
      stats: false,
      visibility: false,
      taxonomy: false,
      timeline: false,
      manager: false,
      quickActions: false,
      footer: false,
    },
  },
}

/** 사이드만 OFF — 본문은 그대로 두고 aside 슬롯만 없애 본문이 전폭으로 펴진다 */
export const NoAside: Story = {
  args: {
    show: {
      stats: false,
      visibility: false,
      taxonomy: false,
      timeline: false,
      manager: false,
      quickActions: false,
    },
  },
}

/** 아이콘 교체 — 수정/복제/삭제/크게보기 아이콘만 갈아끼운다(레이아웃·문구는 그대로) */
export const CustomIcons: Story = {
  args: {
    editIcon: <PenLine size={16} />,
    duplicateIcon: <CopyPlus size={16} />,
    deleteIcon: <Trash size={16} />,
    zoomIcon: <ZoomIn size={16} />,
  },
}

/** 문구 교체 — 제목·수량 단위·품절 배지·표 빈 상태를 호출부 카피로 덮어쓴다 */
export const CustomCopy: Story = {
  args: {
    title: '에어로 러닝화 X2 — 2026 여름 시즌',
    soldOutLabel: '재고 소진',
    countUnit: '켤레',
    emptyText: '표시할 데이터가 없습니다',
    value: { ...BASE, options: [], orders: [], inquiries: [] },
  },
}

/** 문의 탭 — 이 상품에 달린 문의(상태 Badge) */
export const WithInquiries: Story = {
  args: {
    defaultTab: 'inquiries',
    value: {
      ...BASE,
      inquiries: [
        ...INQUIRIES,
        {
          id: 'inq-5',
          title: '방수 기능이 있나요? 우천 시 러닝에 써도 될지 궁금합니다',
          author: '서지우',
          createdAt: '2026-07-13',
          status: 'waiting',
          type: '상품',
        },
        {
          id: 'inq-6',
          title: '깔창만 따로 구매할 수 있을까요',
          author: '문태호',
          createdAt: '2026-07-08',
          status: 'closed',
          type: '기타',
        },
      ],
    },
  },
}
