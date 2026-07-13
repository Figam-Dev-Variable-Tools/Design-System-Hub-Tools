import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Placeholder } from '../../shared/placeholders'
import { AdminPageLayout } from '../AdminPageLayout/AdminPageLayout'
import { FormAnchorNav } from '../FormAnchorNav/FormAnchorNav'
import { MobilePreview } from '../MobilePreview/MobilePreview'
import { PageSection } from '../PageContainer/PageContainer'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { Checkbox } from '../Checkbox/Checkbox'
import { CurrencyField } from '../CurrencyField/CurrencyField'
import { DropZone } from '../DropZone/DropZone'
import { FieldRow } from '../FieldRow/FieldRow'
import { InputBase } from '../InputBase/InputBase'
import { NumberField } from '../NumberField/NumberField'
import { OptionRows, type OptionRow } from '../OptionRows/OptionRows'
import { RichTextEditor } from '../RichTextEditor/RichTextEditor'
import { Select } from '../Select/Select'
import { Skeleton } from '../Skeleton/Skeleton'
import { SortableList } from '../SortableList/SortableList'
import { Textarea } from '../Textarea/Textarea'
import { Toggle } from '../Toggle/Toggle'
import { readFileAsDataUrl } from '../MainVisualUploader/MainVisualUploader'
import {
  mergeLabels,
  type DeepPartialOneLevel,
  type Formatters,
  type LabelFn,
} from '../../shared/labels'
// 어드민 1920 레이아웃 상수(--admin-section-gap / --admin-topbar-h) — 단일 소스
import '../PageContainer/layout.css'
import styles from './ProductEditPage.module.css'

/* ────────────────────────────────────────────────────────────────────────────
 * 값 타입 — 화면은 전적으로 데이터 주도다(모든 값·콜백은 props)
 * ──────────────────────────────────────────────────────────────────────────── */

/** 상품 이미지 — url을 키로 쓰면 같은 이미지를 두 번 올렸을 때 재정렬이 깨지므로 id를 따로 둔다 */
export type ProductImage = {
  id: string
  url: string
}

export type ProductSelectOption = {
  label: string
  value: string
}

/** 1차 카테고리 + 그 아래 2차 카테고리 */
export type ProductCategoryOption = ProductSelectOption & {
  children?: ProductSelectOption[]
}

/** 적립 방식 — 판매가 대비 비율 또는 정액 */
export type ProductPointType = 'rate' | 'amount'

/** 배송 방식 — 조건부 무료는 기준 금액(freeOver)을 함께 쓴다 */
export type ProductShippingType = 'free' | 'paid' | 'conditional'

/** 헤더 배지로 표기되는 판매 상태 */
export type ProductStatus = 'selling' | 'soldout' | 'hidden' | 'draft'

export type ProductEditValue = {
  /* 상품 정보 */
  brand: string | null
  category1: string | null
  category2: string | null
  name: string
  /** 첫 번째가 대표 이미지 */
  images: ProductImage[]
  /** 짧은 소개 HTML (RichTextEditor) */
  intro: string
  maker: string
  origin: string
  /** 목록·미리보기에 노출되는 한 줄 요약 */
  headline: string

  /* 상세 설명 */
  detailHtml: string

  /* 가격 — 숫자만 담긴 문자열(CurrencyField 규약) */
  price: string
  salePrice: string

  /* 적립금 */
  pointEnabled: boolean
  pointType: ProductPointType
  /** 적립률(%)이든 정액(원)이든 숫자 문자열로 담는다 */
  pointValue: string

  /* 배송 */
  shippingType: ProductShippingType
  shippingFee: string
  /** 조건부 무료배송 기준 금액 */
  freeOver: string

  /* 재고 */
  stock: number
  /** 재고와 무관하게 품절로 표시 */
  soldOut: boolean
  /** 품절 임박 알림 기준 수량 */
  stockThreshold: number

  /* 옵션 */
  options: OptionRow[]

  /* 상품 강조 */
  highlights: string[]
  /** 목록 상단 고정 */
  pinned: boolean

  /* 노출 설정 */
  onSale: boolean
  listed: boolean
  searchable: boolean
  memberOnly: boolean

  /* SEO */
  seoTitle: string
  seoDescription: string
  seoKeywords: string
}

/** 좌측 앵커 = 본문 섹션 카드. 순서가 곧 스크롤 순서다 */
export type ProductEditSectionKey =
  | 'info'
  | 'detail'
  | 'price'
  | 'point'
  | 'shipping'
  | 'stock'
  | 'options'
  | 'highlight'
  | 'visibility'
  | 'seo'

/**
 * 화면에 나오는 모든 글자 — 값(value)과 후보 목록(brands·categories·highlightOptions)만 데이터다.
 * 중첩은 표면 기준 1단계다. 숫자·통화는 문구가 아니라 포맷이므로 formatters prop으로 연다.
 */
export type ProductEditPageLabels = {
  /** 페이지 헤더 타이틀 — mode가 고른다 */
  title: { create: string; edit: string }
  /** 헤더 상태 배지 */
  status: Record<ProductStatus, string>
  /** 앵커 내비 + 섹션 카드 제목(같은 소스다 — 두 곳에 적지 않는다) */
  sections: Record<ProductEditSectionKey, string>
  /** 섹션 카드 설명(있는 섹션만) */
  sectionDescriptions: {
    detail: string
    options: string
    highlight: string
    seo: string
  }
  /** 적립 방식 Select의 값 문구 */
  pointTypes: Record<ProductPointType, string>
  /** 배송 방식 Select의 값 문구 */
  shippingTypes: Record<ProductShippingType, string>
  /** 필드 라벨 (highlights는 체크박스 묶음의 접근성 이름이다) */
  fields: {
    brand: string
    category1: string
    category2: string
    name: string
    images: string
    intro: string
    maker: string
    origin: string
    headline: string
    detail: string
    price: string
    salePrice: string
    discount: string
    pointEnabled: string
    pointType: string
    pointRate: string
    pointAmount: string
    shippingType: string
    shippingFee: string
    freeOver: string
    stock: string
    stockThreshold: string
    soldOut: string
    highlights: string
    pinned: string
    onSale: string
    listed: string
    searchable: string
    memberOnly: string
    seoTitle: string
    seoDescription: string
    seoKeywords: string
  }
  /** 필드 플레이스홀더 — category2는 1차 선택 전/후로 갈린다 */
  placeholders: {
    brand: string
    category1: string
    category2: string
    category2Locked: string
    name: string
    intro: string
    maker: string
    origin: string
    headline: string
    detail: string
    seoTitle: string
    seoDescription: string
    seoKeywords: string
  }
  /** 보조설명(helperText · 필드 힌트 · 섹션 안 안내) */
  helpers: {
    /** 필수 표시 — 오류가 없을 때 브랜드·1차 카테고리·판매가 아래에 뜬다 */
    requiredMark: string
    price: string
    images: string
    intro: string
    headline: string
    salePrice: string
    discount: string
    pointEnabled: string
    pointRate: string
    pointAmount: string
    freeOver: string
    /** 옵션이 있으면 재고 입력이 잠긴다 */
    stockByOption: string
    stockThreshold: string
    soldOut: string
    pinned: string
    onSale: string
    listed: string
    searchable: string
    memberOnly: string
    seoKeywords: string
  }
  /** 필수값 오류 — 저장을 눌렀을 때만 뜬다 */
  errors: Record<'brand' | 'category1' | 'name' | 'price', string>
  /** 값의 단위 */
  units: { stock: string; pointRate: string }
  /** 이미지 타일·드롭존 */
  images: {
    coverBadge: string
    addLabel: string
    /** 타일 삭제 버튼의 접근성 이름(1-based) */
    removeAria: LabelFn<number>
    hint: (arg: { count: number; max: number }) => string
    fullHint: LabelFn<number>
  }
  /** 할인율 표시 칸 — 금액은 formatters.price가 만든다 */
  discount: { empty: string; saved: LabelFn<string> }
  /** 우측 폰 미리보기 */
  preview: {
    coverPlaceholder: string
    namePlaceholder: string
    cart: string
    /** 구매 CTA — '렌탈하기'처럼 도메인마다 다르다 */
    buy: string
    soldOut: string
  }
  /** 액션 버튼 */
  actions: { save: string; cancel: string; saving: string; saveDraft: string }
  /** 본문을 스켈레톤으로 덮은 동안의 접근성 이름 */
  loading: string
}

export type ProductEditPageProps = {
  value: ProductEditValue
  onChange: (value: ProductEditValue) => void
  brands: ProductSelectOption[]
  /** 1차 카테고리 — children이 2차 카테고리 목록이 된다 */
  categories: ProductCategoryOption[]
  /** 상품 강조 배지 후보 — 기본값 제공 */
  highlightOptions?: ProductSelectOption[]
  /** 헤더 배지 상태 — 기본 selling */
  status?: ProductStatus
  /** 이미지 최대 장수 — 기본 8 */
  maxImages?: number
  /** 저장 중 — 전 입력 잠금 + 버튼 라벨 변경 */
  saving?: boolean
  /** 데이터 로딩 중 — 본문을 스켈레톤으로 대체 */
  loading?: boolean
  /** 미리보기 프레임 아래 안내 문구 */
  previewNote?: string
  /** 푸터 좌측 안내(예: '마지막 저장 3분 전') */
  lastSavedLabel?: string
  onSave?: () => void
  onSaveDraft?: () => void
  onCancel?: () => void
  density?: 'compact' | 'comfortable'

  /* ── 슬롯 ON/OFF ──
     같은 화면을 좁은 모달·태블릿·읽기 전용 뷰에 다시 얹어야 한다. 골격(AdminPageLayout)은
     비운 슬롯을 DOM에서 지우므로, 여기서 끄기만 하면 빈 칸 없이 폭이 본문으로 돌아간다.
     기본은 전부 켜짐이라 기존 화면은 그대로다. */
  /** 좁은 화면·모달에서 좌측 앵커 내비를 끈다 */
  showAnchorNav?: boolean
  /** 우측 폰 미리보기를 끈다 — 본문이 그만큼 넓어진다 */
  showPreview?: boolean
  /** 하단 sticky 액션 바를 끈다 — 저장을 헤더 버튼에만 맡길 때 */
  showFooter?: boolean
  /** 임시저장 단계가 없는 워크플로에서 끈다 */
  showSaveDraft?: boolean

  /* ── 아이콘 슬롯 ──
     서비스마다 아이콘 세트가 달라 lucide를 강제할 수 없다. 기본값은 지금 쓰는 아이콘 그대로다. */
  addImageIcon?: ReactNode
  removeImageIcon?: ReactNode

  /* ── 카피 ──
     같은 화면이 '상품 등록'으로도 열리고, 저장 대신 '승인 요청'을 쓰는 몰도 있다. */
  /** 문구 — 개별 prop(title·saveLabel …)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<ProductEditPageLabels>
  /** 숫자·통화 표기 — 문구가 아니라 포맷이다(미리보기 가격·할인 금액이 함께 쓴다) */
  formatters?: Formatters
  /** 등록/수정 — 기본 타이틀('상품 등록'/'상품 수정')을 가른다. 기본 edit */
  mode?: 'create' | 'edit'
  /** 폰 미리보기 프레임 폭(px) — 태블릿·PC 상세를 미리 보려면 넓힌다. 기본 320 */
  previewWidth?: number
  /** @deprecated labels.title.create / edit을 쓴다(개별 prop이 우선하며 두 모드를 모두 덮는다) */
  title?: string
  /** @deprecated labels.actions.save를 쓴다 */
  saveLabel?: string
  /** @deprecated labels.actions.cancel을 쓴다 */
  cancelLabel?: string
  /** @deprecated labels.actions.saving을 쓴다 */
  savingLabel?: string
}

/* ────────────────────────────────────────────────────────────────────────────
 * 상수
 * ──────────────────────────────────────────────────────────────────────────── */

/** 앵커·섹션 카드의 순서 — 문구는 labels.sections가 갖는다(같은 값을 두 곳에 적지 않는다) */
const SECTION_ORDER: ProductEditSectionKey[] = [
  'info',
  'detail',
  'price',
  'point',
  'shipping',
  'stock',
  'options',
  'highlight',
  'visibility',
  'seo',
]

type SectionKey = ProductEditSectionKey

/** 상태 배지의 톤 — 문구는 labels.status가 갖는다 */
const STATUS_TONE: Record<ProductStatus, 'success' | 'error' | 'secondary' | 'warning'> = {
  selling: 'success',
  soldout: 'error',
  hidden: 'secondary',
  draft: 'warning',
}

const DEFAULT_HIGHLIGHTS: ProductSelectOption[] = [
  { label: '신상품', value: 'new' },
  { label: 'BEST', value: 'best' },
  { label: 'MD 추천', value: 'md' },
  { label: '한정수량', value: 'limited' },
  { label: '무료배송', value: 'freeship' },
]

const DEFAULT_MAX_IMAGES = 8

/** 업로드 1장당 용량 상한(MB) — DropZone 검증과 안내 문구가 같은 값을 쓴다 */
const MAX_IMAGE_MB = 10

/** 폰 미리보기 프레임 폭 기본값(px) — previewWidth prop의 기본값이다 */
const DEFAULT_PREVIEW_WIDTH = 320

export const DEFAULT_PRODUCT_EDIT_PAGE_LABELS: ProductEditPageLabels = {
  title: { create: '상품 등록', edit: '상품 수정' },
  status: { selling: '판매중', soldout: '품절', hidden: '미노출', draft: '임시저장' },
  sections: {
    info: '상품 정보',
    detail: '상세 설명',
    price: '가격',
    point: '적립금',
    shipping: '배송',
    stock: '재고',
    options: '옵션',
    highlight: '상품 강조',
    visibility: '노출 설정',
    seo: 'SEO',
  },
  sectionDescriptions: {
    detail: '상세페이지 본문에 그대로 노출되는 내용입니다.',
    options: '색상·사이즈처럼 선택지가 필요한 상품이라면 옵션을 추가하세요.',
    highlight: '목록·상세에서 상품명 위에 붙는 배지입니다.',
    seo: '검색엔진과 SNS 공유 카드에 노출되는 정보입니다.',
  },
  pointTypes: { rate: '판매가의 %', amount: '정액(원)' },
  shippingTypes: { free: '무료배송', paid: '유료배송', conditional: '조건부 무료배송' },
  fields: {
    brand: '브랜드',
    category1: '1차 카테고리',
    category2: '2차 카테고리',
    name: '상품명',
    images: '상품 이미지',
    intro: '상품 설명',
    maker: '제조사',
    origin: '원산지',
    headline: '요약 문구',
    // 앵커 라벨(sections.detail = '상세 설명')과 달리 섹션 카드의 머리글은 더 길다
    detail: '상품 상세 설명',
    price: '판매가',
    salePrice: '할인가',
    discount: '할인율',
    pointEnabled: '적립금 지급',
    pointType: '적립 방식',
    pointRate: '적립률',
    pointAmount: '적립금',
    shippingType: '배송 방식',
    shippingFee: '배송비',
    freeOver: '무료배송 기준 금액',
    stock: '재고 수량',
    stockThreshold: '품절 임박 기준',
    soldOut: '품절 처리',
    highlights: '강조 배지',
    pinned: '목록 상단 고정',
    onSale: '판매중',
    listed: '목록 노출',
    searchable: '검색 노출',
    memberOnly: '회원 전용',
    seoTitle: '메타 타이틀',
    seoDescription: '메타 설명',
    seoKeywords: '검색 키워드',
  },
  placeholders: {
    brand: '브랜드를 선택하세요',
    category1: '1차 카테고리를 선택하세요',
    category2: '2차 카테고리를 선택하세요',
    category2Locked: '1차 카테고리를 먼저 선택하세요',
    name: '상품명을 입력하세요',
    intro: '상품을 한두 문장으로 소개하세요',
    maker: '예: 한샘',
    origin: '예: 국내산',
    headline: '예: 3분 조립, 5년 무상 A/S',
    detail: '상세 내용을 입력하세요',
    seoTitle: '비워두면 상품명이 사용됩니다',
    seoDescription: '검색 결과에 노출될 요약을 입력하세요',
    seoKeywords: '예: 원목책상, 수납책상, 학생책상',
  },
  helpers: {
    requiredMark: '필수',
    price: '부가세 포함 금액 · 필수',
    images: '첫 번째 이미지가 대표 이미지로 노출됩니다. 끌어다 놓아 순서를 바꿀 수 있습니다.',
    intro: '목록·미리보기에 쓰이는 짧은 소개입니다.',
    headline: '상품명 아래 한 줄로 노출됩니다.',
    salePrice: '비워두면 할인 없이 판매가로 노출됩니다.',
    discount: '판매가와 할인가로 자동 계산됩니다.',
    pointEnabled: '끄면 이 상품에는 적립금이 쌓이지 않습니다.',
    pointRate: '판매가 기준으로 계산됩니다.',
    pointAmount: '주문 1건당 지급되는 금액입니다.',
    freeOver: '이 금액 이상 주문하면 배송비가 면제됩니다.',
    stockByOption: '옵션이 있는 상품은 옵션별 재고를 따릅니다.',
    stockThreshold: '이 수량 이하로 떨어지면 알림을 보냅니다.',
    soldOut: '켜면 재고와 관계없이 품절로 노출되고 구매할 수 없습니다.',
    pinned: '정렬 조건과 무관하게 목록 맨 위에 노출됩니다.',
    onSale: '끄면 상세페이지에서 구매 버튼이 사라집니다.',
    listed: '카테고리·기획전 목록에 상품을 보여줍니다.',
    searchable: '사이트 내 검색 결과에 상품을 노출합니다.',
    memberOnly: '로그인한 회원에게만 가격과 구매 버튼을 보여줍니다.',
    seoKeywords: '쉼표(,)로 구분해 입력하세요.',
  },
  errors: {
    brand: '브랜드는 필수입니다.',
    category1: '1차 카테고리는 필수입니다.',
    name: '상품명은 필수입니다.',
    price: '판매가는 필수입니다.',
  },
  units: { stock: '개', pointRate: '%' },
  images: {
    coverBadge: '대표',
    addLabel: '이미지 추가',
    removeAria: (position) => `${position}번째 이미지 삭제`,
    hint: ({ count, max }) => `JPG·PNG 최대 ${MAX_IMAGE_MB}MB(최대 ${max}장) · ${count}/${max}`,
    fullHint: (max) => `최대 ${max}장까지 등록할 수 있습니다`,
  },
  discount: { empty: '할인 없음', saved: (amount) => `${amount} 할인` },
  preview: {
    coverPlaceholder: '대표 이미지',
    namePlaceholder: '상품명을 입력하세요',
    cart: '장바구니',
    buy: '렌탈하기',
    soldOut: '품절',
  },
  actions: { save: '저장', cancel: '취소', saving: '저장 중…', saveDraft: '임시저장' },
  loading: '상품 정보를 불러오는 중',
}

/** 스크롤 스파이 기준선 — topbar(72) 아래 여유. CSS의 .anchor scroll-margin-top과 맞춘다 */
const SPY_OFFSET = 96

/** 새 상품 등록/초기화용 빈 값 — Empty 스토리와 폼 리셋에 쓴다 */
export const EMPTY_PRODUCT_VALUE: ProductEditValue = {
  brand: null,
  category1: null,
  category2: null,
  name: '',
  images: [],
  intro: '',
  maker: '',
  origin: '',
  headline: '',
  detailHtml: '',
  price: '',
  salePrice: '',
  pointEnabled: false,
  pointType: 'rate',
  pointValue: '',
  shippingType: 'free',
  shippingFee: '',
  freeOver: '',
  stock: 0,
  soldOut: false,
  stockThreshold: 5,
  options: [],
  highlights: [],
  pinned: false,
  onSale: true,
  listed: true,
  searchable: true,
  memberOnly: false,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
}

/* ────────────────────────────────────────────────────────────────────────────
 * 유틸
 * ──────────────────────────────────────────────────────────────────────────── */

let imageSeq = 0

/** 업로드된 이미지 URL을 재정렬-안전한 ProductImage로 감싼다 */
export function createProductImage(url: string): ProductImage {
  imageSeq += 1
  return { id: `product-image-${Date.now().toString(36)}-${imageSeq}`, url }
}

const WON_FORMAT = new Intl.NumberFormat('ko-KR')

/** 통화 표기 기본값 — 문구가 아니라 포맷이라 formatters.price로 갈아끼운다 */
const DEFAULT_FORMAT_PRICE: NonNullable<Formatters['price']> = (value) =>
  `${WON_FORMAT.format(value)}원`

/** 숫자 문자열(CurrencyField 규약) → 숫자. 빈 값·비정상 값은 0으로 본다 */
function toAmount(digits: string): number {
  const parsed = Number(digits)
  if (digits === '' || !Number.isFinite(parsed)) return 0
  return parsed
}

/** 판매가 대비 할인율(%) — 할인가가 없거나 판매가 이상이면 null */
function discountRate(price: string, salePrice: string): number | null {
  const base = Number(price)
  const sale = Number(salePrice)
  if (!Number.isFinite(base) || !Number.isFinite(sale)) return null
  if (base <= 0 || sale <= 0 || sale >= base) return null
  return Math.round(((base - sale) / base) * 100)
}

/** 필수 입력 필드 */
type RequiredField = 'brand' | 'category1' | 'name' | 'price'

function collectMissing(value: ProductEditValue): RequiredField[] {
  const missing: RequiredField[] = []
  if (value.brand == null || value.brand === '') missing.push('brand')
  if (value.category1 == null || value.category1 === '') missing.push('category1')
  if (value.name.trim() === '') missing.push('name')
  if (value.price === '' || Number(value.price) <= 0) missing.push('price')
  return missing
}

/** 필수 필드 → 그 필드가 속한 섹션 */
const FIELD_SECTION: Record<RequiredField, SectionKey> = {
  brand: 'info',
  category1: 'info',
  name: 'info',
  price: 'price',
}

const sectionDomId = (key: string) => `product-edit-${key}`

/* ────────────────────────────────────────────────────────────────────────────
 * 내부 조각
 * ──────────────────────────────────────────────────────────────────────────── */

/** 앵커 대상이 되는 섹션 카드 — PageSection(카드)에 스크롤 앵커만 씌운다 */
function AnchorSection({
  sectionKey,
  title,
  description,
  children,
}: {
  sectionKey: SectionKey
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div
      id={sectionDomId(sectionKey)}
      data-section-key={sectionKey}
      className={styles.anchor}
    >
      <PageSection title={title} description={description}>
        {children}
      </PageSection>
    </div>
  )
}

/* 스위치 한 줄은 공용 FieldRow + Toggle 조합으로 만든다 —
   ProductDetail과 같은 행을 두 번 그리지 않기 위해서다(라벨/설명 규격도 FieldRow가 쥔다). */

/** 우측 폰 미리보기 내용 — 입력값이 바뀌면 즉시 다시 그려진다 */
function ProductPreview({
  value,
  labels,
  highlightOptions,
  formatPrice,
}: {
  value: ProductEditValue
  labels: ProductEditPageLabels
  /** 배지 문구는 후보 목록이 갖는다 — 미리보기가 목록과 다른 이름을 쓰면 안 된다 */
  highlightOptions: ProductSelectOption[]
  formatPrice: NonNullable<Formatters['price']>
}) {
  const rate = discountRate(value.price, value.salePrice)
  const cover = value.images[0]
  const finalPrice = rate == null ? value.price : value.salePrice
  const soldOut = value.soldOut || (value.stock <= 0 && value.options.length === 0)

  return (
    <div className={styles.preview}>
      <div className={styles.previewCover}>
        {cover == null ? (
          <Placeholder kind="image" size="fill" label={labels.preview.coverPlaceholder} />
        ) : (
          <img src={cover.url} alt="" className={styles.previewCoverImg} />
        )}
      </div>

      <div className={styles.previewBody}>
        {value.highlights.length > 0 && (
          <div className={styles.previewTags}>
            {value.highlights.map((key) => {
              const found = highlightOptions.find((option) => option.value === key)
              return (
                <span key={key} className={styles.previewTag}>
                  {found?.label ?? key}
                </span>
              )
            })}
          </div>
        )}

        <p className={styles.previewName}>
          {value.name.trim() === '' ? labels.preview.namePlaceholder : value.name}
        </p>

        {value.headline.trim() !== '' && <p className={styles.previewHeadline}>{value.headline}</p>}

        <div className={styles.previewPrice}>
          {rate != null && <span className={styles.previewRate}>{rate}%</span>}
          <span className={styles.previewFinal}>{formatPrice(toAmount(finalPrice))}</span>
          {rate != null && (
            <span className={styles.previewOrigin}>{formatPrice(toAmount(value.price))}</span>
          )}
        </div>

        {value.intro.trim() !== '' && (
          // RichTextEditor가 만든 HTML — ProductDetail과 같은 방식으로 렌더한다
          <div
            className={styles.previewIntro}
            dangerouslySetInnerHTML={{ __html: value.intro }}
          />
        )}

        {/* 폰 안이지만 구매 CTA는 결국 DS Button이 그리는 면이다 —
            자체 버튼을 다시 그리는 대신 fullWidth Button을 반반으로 나눠 담는다 */}
        <div className={styles.previewActions}>
          <div className={styles.previewAction}>
            <Button
              variant="secondary"
              appearance="outline"
              size="md"
              label={labels.preview.cart}
              disabled={soldOut}
              fullWidth
            />
          </div>
          <div className={styles.previewAction}>
            <Button
              variant="primary"
              size="md"
              label={soldOut ? labels.preview.soldOut : labels.preview.buy}
              disabled={soldOut}
              fullWidth
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/** 로딩 중 본문 — 섹션 카드 자리를 스켈레톤으로 채운다 */
function LoadingSections({ label }: { label: string }) {
  return (
    <div className={styles.sections} aria-busy="true" aria-label={label}>
      {[0, 1, 2].map((index) => (
        <div key={index} className={styles.skeletonCard}>
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="block" height={120} />
          <Skeleton variant="text" lines={2} />
        </div>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
 * 본체
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * 상품 수정 화면 — AdminPageLayout 조합.
 *
 *   header : '상품 수정' + 판매 상태 배지 + [저장]
 *   side   : FormAnchorNav(10개 섹션) — 스크롤 스파이는 이 컴포넌트가 담당한다
 *   content: 섹션 카드 10장(PageSection)
 *   aside  : MobilePreview — 상품명/할인율/가격/설명이 입력 즉시 반영
 *   footer : 취소 · 임시저장 · 저장
 *
 * 필수값(브랜드·1차 카테고리·상품명·판매가)이 비어 있으면 저장 시 onSave를 호출하지 않고
 * 해당 섹션으로 스크롤한 뒤 오류를 드러낸다(앵커 점 + 필드 error).
 */
export function ProductEditPage({
  value,
  onChange,
  brands,
  categories,
  highlightOptions = DEFAULT_HIGHLIGHTS,
  status = 'selling',
  maxImages = DEFAULT_MAX_IMAGES,
  saving = false,
  loading = false,
  previewNote = '실제 상세페이지와 다르게 보일 수 있어요',
  lastSavedLabel,
  onSave,
  onSaveDraft,
  onCancel,
  density = 'compact',
  showAnchorNav = true,
  showPreview = true,
  showFooter = true,
  showSaveDraft = true,
  addImageIcon,
  removeImageIcon,
  labels,
  formatters,
  mode = 'edit',
  previewWidth = DEFAULT_PREVIEW_WIDTH,
  title,
  saveLabel,
  cancelLabel,
  savingLabel,
}: ProductEditPageProps) {
  // 우선순위: 개별 prop > labels > 기본값. mergeLabels는 undefined를 무시한다.
  const L = mergeLabels(mergeLabels(DEFAULT_PRODUCT_EDIT_PAGE_LABELS, labels), {
    actions: { save: saveLabel, cancel: cancelLabel, saving: savingLabel },
  })

  // 개별 prop(title)은 모드와 무관하게 이긴다
  const heading = title ?? (mode === 'edit' ? L.title.edit : L.title.create)
  const formatPrice = formatters?.price ?? DEFAULT_FORMAT_PRICE

  // Select의 값 문구는 labels가 단일 출처다 — 옵션 배열은 여기서 조립한다(같은 문구를 두 곳에 적지 않는다)
  const pointTypeOptions: ProductSelectOption[] = [
    { value: 'rate', label: L.pointTypes.rate },
    { value: 'amount', label: L.pointTypes.amount },
  ]
  const shippingTypeOptions: ProductSelectOption[] = [
    { value: 'free', label: L.shippingTypes.free },
    { value: 'paid', label: L.shippingTypes.paid },
    { value: 'conditional', label: L.shippingTypes.conditional },
  ]

  const [activeKey, setActiveKey] = useState<SectionKey>('info')
  // 저장을 한 번 누르기 전에는 오류를 드러내지 않는다(빈 폼에 빨간 점부터 뜨지 않도록)
  const [submitted, setSubmitted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  // 앵커 클릭으로 이동하는 동안 스크롤 스파이가 선택을 덮어쓰지 않게 막는다
  const spySuppressed = useRef(false)

  const missing = useMemo(() => collectMissing(value), [value])
  const invalidSections = useMemo(
    () => new Set(missing.map((field) => FIELD_SECTION[field])),
    [missing],
  )
  const showError = (field: RequiredField) => submitted && missing.includes(field)

  const sections = SECTION_ORDER.map((key) => ({
    key,
    label: L.sections[key],
    invalid: submitted && invalidSections.has(key),
  }))

  // 스크롤 스파이 — 기준선(topbar 아래)을 지난 '마지막' 섹션이 지금 보고 있는 섹션이다.
  //
  // '보이는 첫 섹션'을 고르면 화면에 여러 섹션이 함께 걸릴 때 늘 위쪽 섹션이 이겨서
  // 마지막 섹션(SEO)이 활성화되지 않으므로 위치를 직접 잰다.
  //
  // 페이지 끝 섹션들은 스크롤이 바닥에 닿아 기준선까지 올라오지 못한다. 그래서 앵커 클릭은
  // 스파이보다 우선하며(spySuppressed), 사용자가 스스로 스크롤할 때까지 그 선택을 유지한다.
  // scroll 이벤트는 버블링하지 않으므로 캡처 단계로 받아 중첩 스크롤 컨테이너도 잡는다.
  useEffect(() => {
    const root = contentRef.current
    if (root == null) return

    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-section-key]'))
    if (nodes.length === 0) return

    let frame = 0

    const update = () => {
      frame = 0
      // 앵커로 이동한 직후에는 클릭한 섹션을 그대로 둔다
      if (spySuppressed.current) return

      // 기준선을 이미 지난 마지막 섹션(하나도 없으면 첫 섹션)
      const current = nodes.reduce(
        (found, node) => (node.getBoundingClientRect().top <= SPY_OFFSET ? node : found),
        nodes[0],
      )

      const key = current.dataset.sectionKey
      if (key != null) setActiveKey(key as SectionKey)
    }

    const onScroll = () => {
      // 스크롤마다 레이아웃을 재계산하지 않도록 프레임당 한 번으로 묶는다
      if (frame !== 0) return
      frame = requestAnimationFrame(update)
    }

    // 사용자가 직접 스크롤하면(휠·터치·키보드) 앵커 우선권을 놓는다
    const release = () => {
      spySuppressed.current = false
    }

    update()
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('wheel', release, { passive: true })
    window.addEventListener('touchmove', release, { passive: true })
    window.addEventListener('keydown', release)
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('wheel', release)
      window.removeEventListener('touchmove', release)
      window.removeEventListener('keydown', release)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [loading])

  const goToSection = (key: string) => {
    setActiveKey(key as SectionKey)
    // 페이지 끝 섹션은 스크롤이 바닥에 닿아 기준선까지 못 올라온다 —
    // 사용자가 다시 스크롤할 때까지 클릭한 섹션을 활성으로 유지한다
    spySuppressed.current = true
    document.getElementById(sectionDomId(key))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const patch = (next: Partial<ProductEditValue>) => onChange({ ...value, ...next })

  const handleSave = () => {
    if (missing.length > 0) {
      setSubmitted(true)
      const target = SECTION_ORDER.find((key) => invalidSections.has(key))
      if (target != null) goToSection(target)
      return
    }
    setSubmitted(false)
    onSave?.()
  }

  /* ── 상품 정보 ── */
  const subCategories = useMemo(
    () => categories.find((category) => category.value === value.category1)?.children ?? [],
    [categories, value.category1],
  )

  const imagesFull = value.images.length >= maxImages

  const addImages = async (files: File[]) => {
    const room = maxImages - value.images.length
    if (room <= 0) return
    const urls = await Promise.all(files.slice(0, room).map((file) => readFileAsDataUrl(file)))
    patch({ images: [...value.images, ...urls.map((url) => createProductImage(url))] })
  }

  const removeImage = (id: string) => {
    patch({ images: value.images.filter((image) => image.id !== id) })
  }

  const toggleHighlight = (key: string, checked: boolean) => {
    patch({
      highlights: checked
        ? [...value.highlights, key]
        : value.highlights.filter((item) => item !== key),
    })
  }

  const rate = discountRate(value.price, value.salePrice)
  const disabled = saving

  return (
    <AdminPageLayout
      title={heading}
      density={density}
      maxWidth="full"
      headerActions={
        <>
          <Badge
            variant={STATUS_TONE[status]}
            appearance="soft"
            size="md"
            label={L.status[status]}
          />
          <Button
            variant="primary"
            size="md"
            label={saving ? L.actions.saving : L.actions.save}
            disabled={disabled || loading}
            onClick={handleSave}
          />
        </>
      }
      // 슬롯을 비우면 AdminPageLayout이 그 칸을 DOM에서 지운다 — 빈 여백이 남지 않는다
      side={
        showAnchorNav ? (
          <FormAnchorNav sections={sections} activeKey={activeKey} onSelect={goToSection} />
        ) : undefined
      }
      aside={
        showPreview ? (
          <MobilePreview width={previewWidth} note={previewNote}>
            <ProductPreview
              value={value}
              labels={L}
              highlightOptions={highlightOptions}
              formatPrice={formatPrice}
            />
          </MobilePreview>
        ) : undefined
      }
      footer={
        showFooter ? (
          <>
            <Button
              variant="secondary"
              appearance="outline"
              size="md"
              label={L.actions.cancel}
              disabled={disabled}
              onClick={onCancel}
            />
            <span className={styles.footerSpacer} />
            {lastSavedLabel != null && <span className={styles.footerHint}>{lastSavedLabel}</span>}
            {showSaveDraft && (
              <Button
                variant="secondary"
                appearance="outline"
                size="md"
                label={L.actions.saveDraft}
                disabled={disabled || loading}
                onClick={onSaveDraft}
              />
            )}
            <Button
              variant="primary"
              size="md"
              label={saving ? L.actions.saving : L.actions.save}
              disabled={disabled || loading}
              onClick={handleSave}
            />
          </>
        ) : undefined
      }
    >
      {loading ? (
        <LoadingSections label={L.loading} />
      ) : (
        <div className={styles.sections} ref={contentRef}>
          {/* 1) 상품 정보 */}
          <AnchorSection sectionKey="info" title={L.sections.info}>
            <div className={styles.grid}>
              <div className={styles.col}>
                <Select
                  label={L.fields.brand}
                  value={value.brand}
                  onChange={(brand) => patch({ brand })}
                  options={brands}
                  placeholder={L.placeholders.brand}
                  disabled={disabled}
                  error={showError('brand')}
                  helperText={showError('brand') ? L.errors.brand : L.helpers.requiredMark}
                />
              </div>
              {/* 빈 칸 — 1차/2차 카테고리를 같은 줄에 짝지어 두기 위해 브랜드 옆을 비운다 */}
              <div className={styles.col} aria-hidden="true" />

              <div className={styles.col}>
                <Select
                  label={L.fields.category1}
                  value={value.category1}
                  // 1차가 바뀌면 하위 선택은 무효가 되므로 함께 비운다
                  onChange={(category1) => patch({ category1, category2: null })}
                  options={categories.map(({ label, value: optionValue }) => ({ label, value: optionValue }))}
                  placeholder={L.placeholders.category1}
                  disabled={disabled}
                  error={showError('category1')}
                  helperText={
                    showError('category1') ? L.errors.category1 : L.helpers.requiredMark
                  }
                />
              </div>
              <div className={styles.col}>
                <Select
                  label={L.fields.category2}
                  value={value.category2}
                  onChange={(category2) => patch({ category2 })}
                  options={subCategories}
                  placeholder={
                    value.category1 == null
                      ? L.placeholders.category2Locked
                      : L.placeholders.category2
                  }
                  disabled={disabled || value.category1 == null || subCategories.length === 0}
                />
              </div>

              <div className={[styles.col, styles.colFull].join(' ')}>
                <InputBase
                  label={L.fields.name}
                  value={value.name}
                  onChange={(name) => patch({ name })}
                  placeholder={L.placeholders.name}
                  required
                  maxLength={100}
                  showCounter
                  disabled={disabled}
                  error={showError('name')}
                  helperText={showError('name') ? L.errors.name : undefined}
                />
              </div>

              <div className={[styles.col, styles.colFull].join(' ')}>
                <span className={styles.fieldLabel}>{L.fields.images}</span>
                <p className={styles.fieldHint}>{L.helpers.images}</p>

                {value.images.length > 0 && (
                  <SortableList
                    items={value.images}
                    getId={(image) => image.id}
                    onReorder={(images) => patch({ images })}
                    direction="grid"
                    disabled={disabled}
                    renderItem={(image, { index }) => (
                      <div className={styles.tile}>
                        <img src={image.url} alt="" className={styles.tileImg} />
                        {index === 0 && (
                          <span className={styles.tileBadge}>{L.images.coverBadge}</span>
                        )}
                        {/* 타일 위에 얹히는 20px 칩이라 DS Button(최소 패딩·라벨 필수)으로는 만들 수 없다.
                            Button은 aria-label도 받지 않아 '몇 번째 이미지'인지 알릴 방법이 사라진다 —
                            그래서 여기만 raw button을 유지한다. */}
                        <button
                          type="button"
                          className={styles.tileRemove}
                          aria-label={L.images.removeAria(index + 1)}
                          disabled={disabled}
                          onClick={() => removeImage(image.id)}
                        >
                          {removeImageIcon ?? <X size={12} />}
                        </button>
                      </div>
                    )}
                  />
                )}

                <DropZone
                  onFiles={(files) => void addImages(files)}
                  accept="image/*"
                  multiple
                  maxSizeMb={MAX_IMAGE_MB}
                  disabled={disabled || imagesFull}
                  compact
                  hint={
                    imagesFull
                      ? L.images.fullHint(maxImages)
                      : L.images.hint({ count: value.images.length, max: maxImages })
                  }
                >
                  {addImageIcon ?? <ImagePlus size={16} aria-hidden="true" />}
                  <span className={styles.dropLabel}>{L.images.addLabel}</span>
                </DropZone>
              </div>

              <div className={[styles.col, styles.colFull].join(' ')}>
                <span className={styles.fieldLabel}>{L.fields.intro}</span>
                <p className={styles.fieldHint}>{L.helpers.intro}</p>
                <RichTextEditor
                  value={value.intro}
                  onChange={(intro) => patch({ intro })}
                  placeholder={L.placeholders.intro}
                  minHeight={120}
                  disabled={disabled}
                />
              </div>

              <div className={styles.col}>
                <InputBase
                  label={L.fields.maker}
                  value={value.maker}
                  onChange={(maker) => patch({ maker })}
                  placeholder={L.placeholders.maker}
                  disabled={disabled}
                />
              </div>
              <div className={styles.col}>
                <InputBase
                  label={L.fields.origin}
                  value={value.origin}
                  onChange={(origin) => patch({ origin })}
                  placeholder={L.placeholders.origin}
                  disabled={disabled}
                />
              </div>

              <div className={[styles.col, styles.colFull].join(' ')}>
                <InputBase
                  label={L.fields.headline}
                  value={value.headline}
                  onChange={(headline) => patch({ headline })}
                  placeholder={L.placeholders.headline}
                  maxLength={50}
                  showCounter
                  disabled={disabled}
                  helperText={L.helpers.headline}
                />
              </div>
            </div>
          </AnchorSection>

          {/* 2) 상품 상세 설명 */}
          <AnchorSection
            sectionKey="detail"
            title={L.fields.detail}
            description={L.sectionDescriptions.detail}
          >
            <RichTextEditor
              value={value.detailHtml}
              onChange={(detailHtml) => patch({ detailHtml })}
              placeholder={L.placeholders.detail}
              minHeight={280}
              disabled={disabled}
            />
          </AnchorSection>

          {/* 3) 가격 */}
          <AnchorSection sectionKey="price" title={L.sections.price}>
            <div className={styles.grid}>
              <div className={styles.col}>
                <CurrencyField
                  label={L.fields.price}
                  value={value.price}
                  onChange={(price) => patch({ price })}
                  disabled={disabled}
                  error={showError('price')}
                  helperText={showError('price') ? L.errors.price : L.helpers.price}
                />
              </div>
              <div className={styles.col}>
                <CurrencyField
                  label={L.fields.salePrice}
                  value={value.salePrice}
                  onChange={(salePrice) => patch({ salePrice })}
                  disabled={disabled}
                  helperText={L.helpers.salePrice}
                />
              </div>
              <div className={styles.col}>
                <span className={styles.fieldLabel}>{L.fields.discount}</span>
                <div className={styles.readonlyBox}>
                  {rate == null ? (
                    <span className={styles.readonlyEmpty}>{L.discount.empty}</span>
                  ) : (
                    <>
                      <strong className={styles.readonlyValue}>{rate}%</strong>
                      <span className={styles.readonlyMeta}>
                        {L.discount.saved(
                          formatPrice(toAmount(value.price) - toAmount(value.salePrice)),
                        )}
                      </span>
                    </>
                  )}
                </div>
                <p className={styles.fieldHint}>{L.helpers.discount}</p>
              </div>
            </div>
          </AnchorSection>

          {/* 4) 적립금 */}
          <AnchorSection sectionKey="point" title={L.sections.point}>
            <div className={styles.stack}>
              <FieldRow label={L.fields.pointEnabled} description={L.helpers.pointEnabled}>
                <Toggle
                  checked={value.pointEnabled}
                  onChange={(pointEnabled) => patch({ pointEnabled })}
                  disabled={disabled}
                />
              </FieldRow>

              {value.pointEnabled && (
                <div className={styles.grid}>
                  <div className={styles.col}>
                    <Select
                      label={L.fields.pointType}
                      value={value.pointType}
                      onChange={(pointType) => patch({ pointType: pointType as ProductPointType })}
                      options={pointTypeOptions}
                      disabled={disabled}
                    />
                  </div>
                  <div className={styles.col}>
                    {value.pointType === 'rate' ? (
                      <NumberField
                        label={L.fields.pointRate}
                        value={Number(value.pointValue) || 0}
                        onChange={(next) => patch({ pointValue: String(next) })}
                        min={0}
                        max={100}
                        unit={L.units.pointRate}
                        disabled={disabled}
                        helperText={L.helpers.pointRate}
                      />
                    ) : (
                      <CurrencyField
                        label={L.fields.pointAmount}
                        value={value.pointValue}
                        onChange={(pointValue) => patch({ pointValue })}
                        disabled={disabled}
                        helperText={L.helpers.pointAmount}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </AnchorSection>

          {/* 5) 배송 */}
          <AnchorSection sectionKey="shipping" title={L.sections.shipping}>
            <div className={styles.grid}>
              <div className={styles.col}>
                <Select
                  label={L.fields.shippingType}
                  value={value.shippingType}
                  onChange={(shippingType) => patch({ shippingType: shippingType as ProductShippingType })}
                  options={shippingTypeOptions}
                  disabled={disabled}
                />
              </div>

              {value.shippingType !== 'free' && (
                <div className={styles.col}>
                  <CurrencyField
                    label={L.fields.shippingFee}
                    value={value.shippingFee}
                    onChange={(shippingFee) => patch({ shippingFee })}
                    disabled={disabled}
                  />
                </div>
              )}

              {value.shippingType === 'conditional' && (
                <div className={styles.col}>
                  <CurrencyField
                    label={L.fields.freeOver}
                    value={value.freeOver}
                    onChange={(freeOver) => patch({ freeOver })}
                    disabled={disabled}
                    helperText={L.helpers.freeOver}
                  />
                </div>
              )}
            </div>
          </AnchorSection>

          {/* 6) 재고 */}
          <AnchorSection sectionKey="stock" title={L.sections.stock}>
            <div className={styles.stack}>
              <div className={styles.grid}>
                <div className={styles.col}>
                  <NumberField
                    label={L.fields.stock}
                    value={value.stock}
                    onChange={(stock) => patch({ stock })}
                    min={0}
                    unit={L.units.stock}
                    disabled={disabled || value.options.length > 0}
                    helperText={
                      value.options.length > 0 ? L.helpers.stockByOption : undefined
                    }
                  />
                </div>
                <div className={styles.col}>
                  <NumberField
                    label={L.fields.stockThreshold}
                    value={value.stockThreshold}
                    onChange={(stockThreshold) => patch({ stockThreshold })}
                    min={0}
                    unit={L.units.stock}
                    disabled={disabled}
                    helperText={L.helpers.stockThreshold}
                  />
                </div>
              </div>

              <FieldRow label={L.fields.soldOut} description={L.helpers.soldOut}>
                <Toggle
                  checked={value.soldOut}
                  onChange={(soldOut) => patch({ soldOut })}
                  disabled={disabled}
                />
              </FieldRow>
            </div>
          </AnchorSection>

          {/* 7) 옵션 */}
          <AnchorSection
            sectionKey="options"
            title={L.sections.options}
            description={L.sectionDescriptions.options}
          >
            <OptionRows
              rows={value.options}
              onChange={(options) => patch({ options })}
              disabled={disabled}
            />
          </AnchorSection>

          {/* 8) 상품 강조 */}
          <AnchorSection
            sectionKey="highlight"
            title={L.sections.highlight}
            description={L.sectionDescriptions.highlight}
          >
            <div className={styles.stack}>
              <div className={styles.checkGroup} role="group" aria-label={L.fields.highlights}>
                {highlightOptions.map((option) => (
                  <Checkbox
                    key={option.value}
                    label={option.label}
                    checked={value.highlights.includes(option.value)}
                    onChange={(checked) => toggleHighlight(option.value, checked)}
                    disabled={disabled}
                  />
                ))}
              </div>

              <FieldRow label={L.fields.pinned} description={L.helpers.pinned}>
                <Toggle
                  checked={value.pinned}
                  onChange={(pinned) => patch({ pinned })}
                  disabled={disabled}
                />
              </FieldRow>
            </div>
          </AnchorSection>

          {/* 9) 노출 설정 */}
          <AnchorSection sectionKey="visibility" title={L.sections.visibility}>
            <div className={styles.stack}>
              <FieldRow label={L.fields.onSale} description={L.helpers.onSale}>
                <Toggle
                  checked={value.onSale}
                  onChange={(onSale) => patch({ onSale })}
                  disabled={disabled}
                />
              </FieldRow>
              <FieldRow label={L.fields.listed} description={L.helpers.listed}>
                <Toggle
                  checked={value.listed}
                  onChange={(listed) => patch({ listed })}
                  disabled={disabled}
                />
              </FieldRow>
              <FieldRow label={L.fields.searchable} description={L.helpers.searchable}>
                <Toggle
                  checked={value.searchable}
                  onChange={(searchable) => patch({ searchable })}
                  disabled={disabled}
                />
              </FieldRow>
              <FieldRow label={L.fields.memberOnly} description={L.helpers.memberOnly}>
                <Toggle
                  checked={value.memberOnly}
                  onChange={(memberOnly) => patch({ memberOnly })}
                  disabled={disabled}
                />
              </FieldRow>
            </div>
          </AnchorSection>

          {/* 10) SEO */}
          <AnchorSection
            sectionKey="seo"
            title={L.sections.seo}
            description={L.sectionDescriptions.seo}
          >
            <div className={styles.grid}>
              <div className={[styles.col, styles.colFull].join(' ')}>
                <InputBase
                  label={L.fields.seoTitle}
                  value={value.seoTitle}
                  onChange={(seoTitle) => patch({ seoTitle })}
                  placeholder={L.placeholders.seoTitle}
                  maxLength={60}
                  showCounter
                  disabled={disabled}
                />
              </div>
              <div className={[styles.col, styles.colFull].join(' ')}>
                <Textarea
                  label={L.fields.seoDescription}
                  value={value.seoDescription}
                  onChange={(seoDescription) => patch({ seoDescription })}
                  placeholder={L.placeholders.seoDescription}
                  rows={3}
                  maxLength={160}
                  showCounter
                  disabled={disabled}
                />
              </div>
              <div className={[styles.col, styles.colFull].join(' ')}>
                <InputBase
                  label={L.fields.seoKeywords}
                  value={value.seoKeywords}
                  onChange={(seoKeywords) => patch({ seoKeywords })}
                  placeholder={L.placeholders.seoKeywords}
                  disabled={disabled}
                  helperText={L.helpers.seoKeywords}
                />
              </div>
            </div>
          </AnchorSection>
        </div>
      )}
    </AdminPageLayout>
  )
}
