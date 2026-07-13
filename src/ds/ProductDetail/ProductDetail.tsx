import { useState } from 'react'
import type { ReactNode } from 'react'
import { Copy, Maximize2, Pencil, Trash2 } from 'lucide-react'
import { Placeholder } from '../../shared/placeholders'
import { AdminChart } from '../AdminChart/AdminChart'
import { AdminTable, type AdminColumn } from '../AdminTable/AdminTable'
import { AttachmentList, type Attachment } from '../AttachmentList/AttachmentList'
import { Badge, type BadgeProps } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { CrudDialog } from '../CrudDialog/CrudDialog'
import { DefinitionList, type DefinitionItem } from '../DefinitionList/DefinitionList'
import { DetailLayout } from '../DetailLayout/DetailLayout'
import { FieldRow } from '../FieldRow/FieldRow'
import { ImagePreview, type ImagePreviewItem } from '../ImagePreview/ImagePreview'
import { ImageSlide } from '../ImageSlide/ImageSlide'
import { PageSection } from '../PageContainer/PageContainer'
import { Statistics, type StatItem } from '../Statistics/Statistics'
import { StatusTimeline, type StatusStep } from '../StatusTimeline/StatusTimeline'
import { Tab } from '../Tab/Tab'
import { Tag } from '../Tag/Tag'
import { Toggle } from '../Toggle/Toggle'
import {
  mergeLabels,
  type ConfirmDialogLabels,
  type DeepPartialOneLevel,
  type Formatters,
  type LabelFn,
} from '../../shared/labels'
import styles from './ProductDetail.module.css'

/** 판매 상태 — 판매중 · 품절 · 판매중지 · 임시저장 */
export type ProductSaleStatus = 'onSale' | 'soldOut' | 'stopped' | 'draft'

/** 상태 → Badge 톤. 판매중지/임시저장은 outline으로 "정상 판매 흐름 밖"임을 드러낸다. */
const STATUS_BADGE: Record<ProductSaleStatus, Pick<BadgeProps, 'variant' | 'appearance'>> = {
  onSale: { variant: 'success', appearance: 'soft' },
  soldOut: { variant: 'warning', appearance: 'soft' },
  stopped: { variant: 'error', appearance: 'outline' },
  draft: { variant: 'secondary', appearance: 'outline' },
}

/** 상품 이미지 — url이 비면 공용 Placeholder로 대체된다 */
export type ProductImage = {
  id: string
  url?: string
  alt?: string
}

/** 기본 정보 — 가격/할인가/재고/배송비/과세여부 */
export type ProductBasicInfo = {
  /** 판매가(원) */
  price: number
  /** 할인가(원) — 없으면 정가 판매 */
  salePrice?: number
  /** 총 재고(옵션 합계와 별개인 대표 재고) */
  stock: number
  /** 배송비(원) — 0이면 무료배송 */
  shippingFee: number
  /** 과세 상품 여부 — false면 면세 */
  taxable: boolean
  /** 안전 재고 — 이 아래면 재고 경고 */
  safetyStock?: number
}

/** 옵션 한 줄 — 옵션명/옵션값/추가금액/재고 */
export type ProductOption = {
  id: string
  /** 옵션명 — 색상, 사이즈 등 */
  name: string
  /** 옵션값 — 블랙, 240 등 */
  value: string
  /** 추가금액(원) */
  extraPrice: number
  stock: number
  /** 옵션 사용 여부 */
  active?: boolean
}

/** 최근 6개월 판매량 — AdminChart bar의 한 점 */
export type ProductSalesPoint = {
  /** 라벨 — '2026-02' 또는 '2월' */
  month: string
  /** 판매 수량 */
  count: number
}

/** 이 상품의 최근 주문 */
export type ProductOrder = {
  id: string
  orderNo: string
  orderedAt: string
  customer: string
  option?: string
  quantity: number
  /** 결제금액(원) */
  amount: number
  /** 주문상태 — 결제완료/배송중 등 */
  status: string
}

/** 문의 처리 상태 — 답변대기 · 답변완료 · 종료 */
export type ProductInquiryStatus = 'waiting' | 'answered' | 'closed'

/** 문의 상태 → Badge 톤 */
export type ProductInquiryTone = 'warning' | 'success' | 'secondary'

const INQUIRY_STATUS_TONE: Record<ProductInquiryStatus, ProductInquiryTone> = {
  waiting: 'warning',
  answered: 'success',
  closed: 'secondary',
}

/** 이 상품에 달린 문의 */
export type ProductInquiry = {
  id: string
  title: string
  author: string
  createdAt: string
  status: ProductInquiryStatus
  /** 문의유형 — 배송/교환 등 */
  type?: string
}

/** 상품 상세 한 건 — 화면이 아는 전체 정보 구조 */
export type ProductDetailValue = {
  id: string
  /** 상품명 */
  name: string
  /** 상품코드 */
  code: string
  status: ProductSaleStatus
  /** 전시 노출 여부 */
  visible: boolean
  /** 카테고리 */
  category: string
  tags?: string[]
  createdAt: string
  updatedAt?: string
  /** 등록자 */
  createdBy: string
  /** 담당 MD */
  manager?: string
  /** 대표 이미지가 첫 번째 — 비면 공용 Placeholder */
  images: ProductImage[]
  basic: ProductBasicInfo
  options: ProductOption[]
  /** 상세 설명 HTML(RichTextEditor 출력) — 읽기 전용으로 렌더한다 */
  descriptionHtml: string
  /** 최근 6개월 판매량 */
  sales?: ProductSalesPoint[]
  orders?: ProductOrder[]
  inquiries?: ProductInquiry[]
  /** 상세 스펙/인증 서류 등 첨부 */
  attachments?: Attachment[]
  /** 상품 진행 단계 — 미지정이면 status에서 파생 */
  statusSteps?: StatusStep[]
}

/**
 * 섹션 ON/OFF — 기본값은 전부 true. false면 그 섹션이 DOM에서 통째로 사라진다
 * (제목만 남은 빈 카드나 빈 사이드 칼럼을 남기지 않는다).
 *
 * 본문 6 + 사이드 6 + 하단 1을 전부 top-level prop으로 풀면 prop이 30개를 넘어가
 * 호출부에서 무엇이 데이터고 무엇이 스위치인지 구분되지 않는다 — 그래서 한 객체로 묶었다.
 * Figma에서는 같은 키가 BOOLEAN 컴포넌트 속성 `Show <Key>`로 노출된다.
 */
export type ProductDetailShow = {
  /** 본문: 상품 이미지 갤러리 */
  gallery?: boolean
  /** 본문: 옵션 표 */
  options?: boolean
  /** 본문: 상세 설명(+첨부) */
  description?: boolean
  /** 본문: 하단 탭(판매 통계 · 최근 주문 · 문의) */
  tabs?: boolean

  /** 사이드: 재고 현황 통계 */
  stats?: boolean
  /** 사이드: 노출 상태(전시/판매 토글) */
  visibility?: boolean
  /** 사이드: 카테고리 · 태그 */
  taxonomy?: boolean
  /** 사이드: 판매 진행 타임라인 */
  timeline?: boolean
  /** 사이드: 담당자 */
  manager?: boolean
  /** 사이드: 빠른 액션 */
  quickActions?: boolean

  /** 하단 sticky 액션 바 */
  footer?: boolean
}

/* ────────────────────────────────────────────────────────────
 * 문구 — 상태 맵 · 섹션 제목 · 컬럼 머리글 · 확인창이 여기 한 곳으로 모인다
 * ──────────────────────────────────────────────────────────── */

/** 판매 진행 타임라인의 단계 키 */
export type ProductFlowKey = 'draft' | 'review' | 'onSale' | 'stopped'

export type ProductDetailLabels = {
  /** 판매 상태 — 헤더 배지와 [노출 상태] 카드가 함께 쓴다 */
  status: Record<ProductSaleStatus, string>
  /** 문의 처리 상태 — 문의 표의 배지 */
  inquiryStatus: Record<ProductInquiryStatus, string>
  /** 판매 진행 단계 — value.statusSteps를 안 넘길 때 쓰인다 */
  flow: Record<ProductFlowKey, string>
  /** 본문 하단 탭 */
  tabs: Record<ProductDetailTab, string>
  /** 카드 제목 */
  sections: {
    gallery: string
    basic: string
    options: string
    description: string
    stats: string
    visibility: string
    taxonomy: string
    timeline: string
    manager: string
    quickActions: string
  }
  /** 헤더 메타 */
  meta: { code: string; createdAt: string; updatedAt: string; createdBy: string }
  /** [기본 정보] 카드 — 라벨 + 값 문구 */
  basic: {
    price: string
    stock: string
    shippingFee: string
    taxable: string
    /** 배송비 0원 */
    freeShipping: string
    taxed: string
    taxFree: string
    /** 안전재고 이하 */
    belowSafety: string
    /** 재고 0(헤더 배지) */
    zeroStock: string
    /** 재고 0(기본 정보 배지) — 기존 soldOutLabel prop이 우선한다 */
    soldOut: string
  }
  /** [담당자] 카드 */
  manager: { md: string; createdBy: string; updatedAt: string; unassigned: string }
  /** [재고 현황] 통계 */
  stats: {
    totalStock: string
    soldOutOptions: string
    sold6m: string
    openInquiries: string
    /** 총 재고 아래 보조 문구 — 인자는 포맷된 안전재고 */
    safetyHint: LabelFn<string>
    byOption: string
    noOption: string
    last6m: string
    /** 미답변 문의 수의 단위 */
    inquiryUnit: string
  }
  /** 옵션 표 — 컬럼 머리글 + 사용 여부 값 */
  optionColumns: {
    name: string
    value: string
    extraPrice: string
    stock: string
    active: string
    activeYes: string
    activeNo: string
  }
  /** 최근 주문 표 컬럼 머리글 */
  orderColumns: {
    orderNo: string
    customer: string
    option: string
    quantity: string
    amount: string
    status: string
    orderedAt: string
  }
  /**
   * 주문상태 값 중 '경고 톤'으로 칠할 것들 — 주문상태는 자유 문자열(row.status)이라
   * 톤 규칙이 문구 비교로 결정된다. 문구를 바꾸면 규칙도 함께 바뀌어야 해서 여기 둔다.
   */
  orderStatusAlert: string[]
  /** 문의 표 컬럼 머리글 */
  inquiryColumns: {
    title: string
    type: string
    author: string
    createdAt: string
    status: string
  }
  /** 이미지 갤러리 */
  gallery: {
    zoom: string
    /** 첫 번째 썸네일의 대표 표시 */
    coverBadge: string
    /** 카드 설명 — 인자는 이미지 장수 */
    countHint: LabelFn<number>
    /** 썸네일 버튼의 접근성 이름 */
    zoomAria: LabelFn<{ name: string; index: number }>
  }
  /** [노출 상태] 카드 — 헤더의 판매 스위치도 sale을 쓴다 */
  visibility: { display: string; displayHint: string; sale: string }
  /** [카테고리 · 태그] 카드 */
  taxonomy: { edit: string; category: string; tags: string; emptyTags: string }
  /** 상세 설명 카드의 첨부 블록 */
  description: { attachments: string }
  /** 판매량 차트 */
  chart: { title: string; series: string }
  /** 옵션 표 카드의 설명 — 인자는 옵션 개수 */
  optionCount: LabelFn<number>
  /** 액션 — 빠른 액션 + 하단 바 */
  actions: {
    back: string
    edit: string
    duplicate: string
    delete: string
    save: string
    saving: string
  }
  /** 빈 상태 — 기존 emptyText prop은 표 3종(options·orders·inquiries)을 한 번에 덮는다 */
  empty: {
    images: string
    descriptionBody: string
    sales: string
    options: string
    orders: string
    inquiries: string
  }
  /** 복제 확인창 — description은 상품 전체를 받는다 */
  duplicateDialog: Required<
    Pick<ConfirmDialogLabels<ProductDetailValue>, 'title' | 'description' | 'confirmLabel'>
  >
  /** 삭제 확인창 */
  deleteDialog: Required<Pick<ConfirmDialogLabels<ProductDetailValue>, 'title' | 'description'>>
  /** 수량 단위 — 기존 countUnit prop이 우선한다 */
  units: { count: string }
  /** 값이 없는 칸에 찍히는 문자 */
  emptyCell: string
}

export const DEFAULT_PRODUCT_DETAIL_LABELS: ProductDetailLabels = {
  status: { onSale: '판매중', soldOut: '품절', stopped: '판매중지', draft: '임시저장' },
  inquiryStatus: { waiting: '답변대기', answered: '답변완료', closed: '종료' },
  flow: { draft: '등록', review: '검수', onSale: '판매중', stopped: '판매종료' },
  tabs: { sales: '판매 통계', orders: '최근 주문', inquiries: '문의' },
  sections: {
    gallery: '상품 이미지',
    basic: '기본 정보',
    options: '옵션',
    description: '상세 설명',
    stats: '재고 현황',
    visibility: '노출 상태',
    taxonomy: '카테고리 · 태그',
    timeline: '판매 진행',
    manager: '담당자',
    quickActions: '빠른 액션',
  },
  meta: { code: '상품코드', createdAt: '등록일', updatedAt: '수정일', createdBy: '등록자' },
  basic: {
    price: '판매가',
    stock: '재고',
    shippingFee: '배송비',
    taxable: '과세여부',
    freeShipping: '무료배송',
    taxed: '과세',
    taxFree: '면세',
    belowSafety: '안전재고 이하',
    zeroStock: '재고 0',
    soldOut: '품절',
  },
  manager: { md: '담당 MD', createdBy: '등록자', updatedAt: '최근 수정', unassigned: '미지정' },
  stats: {
    totalStock: '총 재고',
    soldOutOptions: '품절 옵션',
    sold6m: '6개월 판매',
    openInquiries: '미답변 문의',
    safetyHint: (stock) => `안전재고 ${stock}`,
    byOption: '옵션 기준',
    noOption: '옵션 없음',
    last6m: '최근 6개월',
    inquiryUnit: '건',
  },
  optionColumns: {
    name: '옵션명',
    value: '옵션값',
    extraPrice: '추가금액',
    stock: '재고',
    active: '사용',
    activeYes: '사용',
    activeNo: '미사용',
  },
  orderColumns: {
    orderNo: '주문번호',
    customer: '주문자',
    option: '옵션',
    quantity: '수량',
    amount: '결제금액',
    status: '주문상태',
    orderedAt: '주문일',
  },
  orderStatusAlert: ['취소', '환불'],
  inquiryColumns: {
    title: '제목',
    type: '유형',
    author: '작성자',
    createdAt: '등록일',
    status: '처리상태',
  },
  gallery: {
    zoom: '크게 보기',
    coverBadge: '대표',
    countHint: (count) => `총 ${count}장 · 첫 번째가 대표 이미지`,
    zoomAria: ({ name, index }) => `${name} ${index + 1}번째 이미지 크게 보기`,
  },
  visibility: { display: '전시 노출', displayHint: '쇼핑몰 목록/검색 노출', sale: '판매' },
  taxonomy: {
    edit: '편집',
    category: '카테고리',
    tags: '태그',
    emptyTags: '등록된 태그가 없습니다',
  },
  description: { attachments: '첨부 자료' },
  chart: { title: '최근 6개월 판매량', series: '판매량' },
  optionCount: (count) => `${count}개 옵션`,
  actions: {
    back: '목록',
    edit: '수정',
    duplicate: '복제',
    delete: '삭제',
    save: '저장',
    saving: '저장 중…',
  },
  empty: {
    images: '등록된 이미지가 없습니다',
    descriptionBody: '상세 설명이 없습니다',
    sales: '판매 데이터가 없습니다',
    options: '등록된 옵션이 없습니다',
    orders: '최근 주문이 없습니다',
    inquiries: '등록된 문의가 없습니다',
  },
  duplicateDialog: {
    title: '상품 복제',
    description: (product) =>
      `'${product.name}'을(를) 복사해 임시저장 상태의 새 상품을 만듭니다.`,
    confirmLabel: '복제',
  },
  deleteDialog: {
    title: '상품을 삭제할까요?',
    description: (product) => `'${product.name}'(${product.code})을(를) 삭제합니다.`,
  },
  units: { count: '개' },
  emptyCell: '-',
}

/**
 * 판매 상태 문구 — DEFAULT_PRODUCT_DETAIL_LABELS.status의 별칭이다.
 * 같은 값을 두 곳에 적으면 두 값은 갈라진다 — 문구의 단일 출처는 labels 기본값이다.
 */
export const PRODUCT_STATUS_LABEL: Record<ProductSaleStatus, string> =
  DEFAULT_PRODUCT_DETAIL_LABELS.status

/** 문의 상태 문구 — DEFAULT_PRODUCT_DETAIL_LABELS.inquiryStatus의 별칭 */
export const PRODUCT_INQUIRY_STATUS_LABEL: Record<ProductInquiryStatus, string> =
  DEFAULT_PRODUCT_DETAIL_LABELS.inquiryStatus

/** ConfirmDialogLabels.description은 문자열이거나 인자 1개짜리 함수다 */
function dialogDescription<A>(description: string | LabelFn<A>, arg: A): string {
  return typeof description === 'function' ? description(arg) : description
}

export type ProductDetailProps = {
  value: ProductDetailValue
  /** 하단 탭 기본 선택 */
  defaultTab?: ProductDetailTab
  /** 저장 처리 중 — 하단 액션 비활성 */
  saving?: boolean

  /** 섹션 ON/OFF (기본 전부 true) */
  show?: ProductDetailShow

  /* ── 문구 — 미지정이면 현재 문구 그대로 ── */
  /** 문구 — 개별 prop(emptyText·soldOutLabel·countUnit)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<ProductDetailLabels>
  /** 숫자·통화 표기 — 로케일·자릿수는 문구가 아니라 포맷이다(단위는 labels.units) */
  formatters?: Formatters
  /**
   * 판매 상태별 배지 톤 — 넘긴 상태만 기본 톤을 덮어쓴다.
   * 브랜드 톤 규약이 다른 서비스가 배지 색을 바꿀 수 있게 여는 열쇠다.
   */
  statusTone?: Partial<Record<ProductSaleStatus, Pick<BadgeProps, 'variant' | 'appearance'>>>
  /** 문의 상태별 배지 톤 — 넘긴 상태만 기본 톤을 덮어쓴다 */
  inquiryStatusTone?: Partial<Record<ProductInquiryStatus, ProductInquiryTone>>
  /** 헤더 제목 — 상품명 대신 다른 문구를 걸고 싶을 때만(기본은 value.name) */
  title?: string
  /** 표(옵션·주문·문의)의 빈 상태 문구를 한 번에 갈아끼운다 — 미지정이면 표별 기본 문구 */
  emptyText?: string
  /**
   * @deprecated labels.basic.soldOut을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  soldOutLabel?: string
  /**
   * @deprecated labels.units.count를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  countUnit?: string

  /* ── 아이콘 슬롯 — 미지정이면 현재 lucide 아이콘 ── */
  /** 수정 · 카테고리 편집 */
  editIcon?: ReactNode
  /** 복제 */
  duplicateIcon?: ReactNode
  /** 삭제 */
  deleteIcon?: ReactNode
  /** 이미지 크게 보기 */
  zoomIcon?: ReactNode

  onVisibleChange?: (visible: boolean) => void
  onStatusChange?: (status: ProductSaleStatus) => void
  /** 카테고리/태그 편집 진입 */
  onCategoryEdit?: () => void
  onTagsChange?: (tags: string[]) => void
  onImagePreview?: (index: number) => void
  onOrderClick?: (order: ProductOrder) => void
  onInquiryClick?: (inquiry: ProductInquiry) => void
  onAttachmentDownload?: (attachment: Attachment) => void
  onBackToList?: () => void
  onEdit?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onSave?: () => void
}

/** 본문 하단 탭 */
export type ProductDetailTab = 'sales' | 'orders' | 'inquiries'

/** 탭이 그려지는 순서 — 문구는 labels.tabs가 갖는다 */
const TAB_KEYS: ProductDetailTab[] = ['sales', 'orders', 'inquiries']

/** 상품 진행 단계의 순서 — statusSteps 미지정 시 status에서 파생. 문구는 labels.flow가 갖는다 */
const STATUS_FLOW: ProductFlowKey[] = ['draft', 'review', 'onSale', 'stopped']

/** show 기본값 — 스프레드로 합치면 명시적 undefined가 기본값을 덮어써서 하나씩 ?? true 로 푼다 */
function resolveShow(show: ProductDetailShow = {}): Required<ProductDetailShow> {
  return {
    gallery: show.gallery ?? true,
    options: show.options ?? true,
    description: show.description ?? true,
    tabs: show.tabs ?? true,
    stats: show.stats ?? true,
    visibility: show.visibility ?? true,
    taxonomy: show.taxonomy ?? true,
    timeline: show.timeline ?? true,
    manager: show.manager ?? true,
    quickActions: show.quickActions ?? true,
    footer: show.footer ?? true,
  }
}

/** 원화 표기 — 표/요약에서 자릿수 정렬이 필요해 통화 기호 없이 '원'만 붙인다 */
const DEFAULT_FORMAT_PRICE: NonNullable<Formatters['price']> = (value) => {
  if (!Number.isFinite(value)) return DEFAULT_PRODUCT_DETAIL_LABELS.emptyCell
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

/** 자릿수 구분만 — 단위는 labels.units.count가 붙인다 */
const DEFAULT_FORMAT_NUMBER: NonNullable<Formatters['number']> = (value) =>
  value.toLocaleString('ko-KR')

/** 할인율 — 정가 대비 할인가. 정가가 0이거나 할인가가 없으면 null */
function discountRate(price: number, salePrice?: number): number | null {
  if (salePrice == null || price <= 0 || salePrice >= price) return null
  return Math.round(((price - salePrice) / price) * 100)
}

/** status → StatusTimeline 단계. 임시저장은 등록 단계에 머문다. */
export function buildProductStatusSteps(
  status: ProductSaleStatus,
  /** 단계 문구 — 상세 화면이 labels로 갈아끼운 문구를 그대로 흘려보낸다 */
  flowLabels: Record<ProductFlowKey, string> = DEFAULT_PRODUCT_DETAIL_LABELS.flow,
): StatusStep[] {
  // 품절은 판매중 단계 안의 상태다 — 흐름 자체는 '판매중'에 머문다
  const currentKey: ProductFlowKey =
    status === 'soldOut' ? 'onSale' : status === 'draft' ? 'draft' : status
  const currentIndex = STATUS_FLOW.indexOf(currentKey)

  return STATUS_FLOW.map((key, index) => ({
    key,
    label: flowLabels[key],
    state:
      index < currentIndex ? 'done' : index === currentIndex ? 'current' : ('todo' as const),
  }))
}

export function ProductDetail({
  value,
  defaultTab = 'sales',
  saving = false,
  show,
  labels,
  formatters,
  statusTone,
  inquiryStatusTone,
  title,
  emptyText,
  soldOutLabel,
  countUnit,
  editIcon,
  duplicateIcon,
  deleteIcon,
  zoomIcon,
  onVisibleChange,
  onStatusChange,
  onCategoryEdit,
  onTagsChange,
  onImagePreview,
  onOrderClick,
  onInquiryClick,
  onAttachmentDownload,
  onBackToList,
  onEdit,
  onDuplicate,
  onDelete,
  onSave,
}: ProductDetailProps) {
  const [tab, setTab] = useState<ProductDetailTab>(defaultTab)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)

  const s = resolveShow(show)

  // 우선순위: 개별 prop(soldOutLabel·countUnit) > labels > 기본값.
  // mergeLabels는 그룹 안의 undefined를 걸러내므로, 넘기지 않은 개별 prop이 기본값을 지우지 않는다.
  const L = mergeLabels(mergeLabels(DEFAULT_PRODUCT_DETAIL_LABELS, labels), {
    basic: { soldOut: soldOutLabel },
    units: { count: countUnit },
  })

  const formatPrice = formatters?.price ?? DEFAULT_FORMAT_PRICE
  const formatNumber = formatters?.number ?? DEFAULT_FORMAT_NUMBER
  /** 수량 표기 — 자릿수는 formatters, 단위는 labels */
  const formatCount = (count: number) => `${formatNumber(count)}${L.units.count}`

  const { basic, options, images, tags = [], sales = [], orders = [], inquiries = [] } = value
  const attachments = value.attachments ?? []
  const heading = title ?? value.name

  // 옵션 재고 합이 있으면 그것이 실재고 — 없으면 대표 재고
  const optionStock = options.reduce((sum, option) => sum + option.stock, 0)
  const totalStock = options.length > 0 ? optionStock : basic.stock
  const soldOutOptions = options.filter((option) => option.stock === 0).length
  const isSoldOut = totalStock === 0
  const lowStock =
    basic.safetyStock != null && totalStock > 0 && totalStock <= basic.safetyStock

  const badge = statusTone?.[value.status] ?? STATUS_BADGE[value.status]
  const steps = value.statusSteps ?? buildProductStatusSteps(value.status, L.flow)
  const rate = discountRate(basic.price, basic.salePrice)
  const soldTotal = sales.reduce((sum, point) => sum + point.count, 0)

  // 이미지 — url이 있는 것만 슬라이드/라이트박스에 싣는다(인덱스가 어긋나지 않게 같은 배열에서)
  const shownImages = images.filter((image) => image.url != null && image.url !== '')
  const hasImages = shownImages.length > 0
  const previewItems: ImagePreviewItem[] = shownImages.map((image) => ({
    url: image.url ?? '',
    name: image.alt ?? value.name,
    kind: 'image',
  }))

  const openPreview = (index: number) => {
    setPreviewIndex(index)
    setPreviewOpen(true)
    onImagePreview?.(index)
  }

  // ── 옵션 표 ──
  const optionColumns: AdminColumn<ProductOption>[] = [
    { kind: 'index', key: 'index' },
    { kind: 'text', key: 'name', header: L.optionColumns.name, ratio: 2 },
    { kind: 'title', key: 'value', header: L.optionColumns.value, ratio: 2 },
    {
      kind: 'price',
      key: 'extraPrice',
      header: L.optionColumns.extraPrice,
      // 0원은 빈 칸 문자로 — 표가 0원으로 도배되지 않게
      render: (row) => (
        <span className={styles.num}>
          {row.extraPrice === 0 ? L.emptyCell : formatPrice(row.extraPrice)}
        </span>
      ),
    },
    { kind: 'number', key: 'stock', header: L.optionColumns.stock, tone: () => 'error' },
    {
      kind: 'badge',
      key: 'active',
      header: L.optionColumns.active,
      value: (row) =>
        (row.active ?? true) ? L.optionColumns.activeYes : L.optionColumns.activeNo,
      tone: (row) => ((row.active ?? true) ? 'success' : 'secondary'),
    },
  ]

  // ── 최근 주문 표 ──
  const orderColumns: AdminColumn<ProductOrder>[] = [
    {
      kind: 'title',
      key: 'orderNo',
      header: L.orderColumns.orderNo,
      ratio: 2,
      onClick: onOrderClick,
    },
    { kind: 'user', key: 'customer', header: L.orderColumns.customer },
    {
      kind: 'text',
      key: 'option',
      header: L.orderColumns.option,
      value: (row) => row.option ?? L.emptyCell,
    },
    { kind: 'number', key: 'quantity', header: L.orderColumns.quantity },
    { kind: 'price', key: 'amount', header: L.orderColumns.amount },
    {
      kind: 'badge',
      key: 'status',
      header: L.orderColumns.status,
      // 주문상태는 자유 문자열이라 톤 규칙도 문구 비교다 — 비교 대상은 labels가 갖는다
      tone: (row) => (L.orderStatusAlert.includes(row.status) ? 'error' : 'primary'),
    },
    { kind: 'date', key: 'orderedAt', header: L.orderColumns.orderedAt },
  ]

  // ── 문의 표 ──
  const inquiryColumns: AdminColumn<ProductInquiry>[] = [
    {
      kind: 'title',
      key: 'title',
      header: L.inquiryColumns.title,
      ratio: 4,
      onClick: onInquiryClick,
    },
    {
      kind: 'text',
      key: 'type',
      header: L.inquiryColumns.type,
      ratio: 1,
      value: (row) => row.type ?? L.emptyCell,
    },
    { kind: 'user', key: 'author', header: L.inquiryColumns.author },
    { kind: 'date', key: 'createdAt', header: L.inquiryColumns.createdAt },
    {
      kind: 'badge',
      key: 'status',
      header: L.inquiryColumns.status,
      value: (row) => L.inquiryStatus[row.status],
      tone: (row) => inquiryStatusTone?.[row.status] ?? INQUIRY_STATUS_TONE[row.status],
    },
  ]

  // ── 사이드: 재고 현황 ──
  const stats: StatItem[] = [
    {
      label: L.stats.totalStock,
      value: formatCount(totalStock),
      hint:
        basic.safetyStock != null
          ? L.stats.safetyHint(formatCount(basic.safetyStock))
          : undefined,
    },
    {
      label: L.stats.soldOutOptions,
      value: options.length > 0 ? `${soldOutOptions}/${options.length}` : L.emptyCell,
      hint: options.length > 0 ? L.stats.byOption : L.stats.noOption,
    },
    { label: L.stats.sold6m, value: formatCount(soldTotal), hint: L.stats.last6m },
    {
      label: L.stats.openInquiries,
      value: `${inquiries.filter((i) => i.status === 'waiting').length}${L.stats.inquiryUnit}`,
    },
  ]

  // ── 헤더 메타 · 기본 정보 · 담당자 — 라벨/값 블록은 공용 DefinitionList 하나로 통일한다 ──
  // (divider={false}: 카드 안에서 선 없이 읽히던 기존 레이아웃을 유지)
  const metaItems: DefinitionItem[] = [
    { label: L.meta.code, value: <span className={styles.code}>{value.code}</span> },
    { label: L.meta.createdAt, value: value.createdAt },
    { label: L.meta.updatedAt, value: value.updatedAt ?? L.emptyCell },
    { label: L.meta.createdBy, value: value.createdBy },
  ]

  const basicItems: DefinitionItem[] = [
    {
      label: L.basic.price,
      value:
        rate != null ? (
          <span className={styles.priceGroup}>
            <s className={styles.strike}>{formatPrice(basic.price)}</s>
            <strong className={styles.salePrice}>{formatPrice(basic.salePrice ?? 0)}</strong>
            <Badge variant="error" appearance="soft" size="sm" label={`${rate}%`} />
          </span>
        ) : (
          <strong className={styles.salePrice}>{formatPrice(basic.price)}</strong>
        ),
    },
    {
      label: L.basic.stock,
      value: isSoldOut ? (
        <Badge variant="error" appearance="soft" size="sm" label={L.basic.soldOut} />
      ) : lowStock ? (
        <span className={styles.stockWarn}>
          {formatCount(totalStock)} · {L.basic.belowSafety}
        </span>
      ) : (
        formatCount(totalStock)
      ),
    },
    {
      label: L.basic.shippingFee,
      value: basic.shippingFee === 0 ? L.basic.freeShipping : formatPrice(basic.shippingFee),
    },
    { label: L.basic.taxable, value: basic.taxable ? L.basic.taxed : L.basic.taxFree },
  ]

  const managerItems: DefinitionItem[] = [
    { label: L.manager.md, value: value.manager ?? L.manager.unassigned },
    { label: L.manager.createdBy, value: value.createdBy },
    { label: L.manager.updatedAt, value: value.updatedAt ?? L.emptyCell },
  ]

  // ── 본문 ──
  const body = (
    <>
      {/* 헤더 — 상품명 · 상품코드 · 판매상태 · 카테고리 · 등록 메타 */}
      <PageSection>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.headerTitleGroup}>
              <h1 className={styles.headerName} title={heading}>
                {heading}
              </h1>
              <Badge
                variant={badge.variant}
                appearance={badge.appearance}
                size="md"
                label={L.status[value.status]}
              />
              {/* 판매중으로 잡혀 있어도 재고가 0이면 품절을 함께 알린다 */}
              {isSoldOut && value.status !== 'soldOut' && (
                <Badge variant="warning" appearance="soft" size="md" label={L.basic.zeroStock} />
              )}
              <Tag label={value.category} tone="primary" size="sm" />
            </div>

            <div className={styles.headerSwitch}>
              <span className={styles.switchLabel}>{L.visibility.sale}</span>
              <Toggle
                checked={value.status === 'onSale'}
                size="sm"
                onChange={(next) => onStatusChange?.(next ? 'onSale' : 'stopped')}
              />
            </div>
          </div>

          <div className={styles.headerMeta}>
            <DefinitionList items={metaItems} columns={2} divider={false} density="compact" />
          </div>
        </div>
      </PageSection>

      {/* 이미지 갤러리 — 대표 + 추가 이미지. 클릭하면 ImagePreview 라이트박스 */}
      {s.gallery && (
        <PageSection
          title={L.sections.gallery}
          description={hasImages ? L.gallery.countHint(shownImages.length) : undefined}
          actions={
            hasImages ? (
              <Button
                variant="secondary"
                appearance="outline"
                size="sm"
                label={L.gallery.zoom}
                showLeftIcon
                leftIcon={zoomIcon ?? <Maximize2 size={14} />}
                onClick={() => openPreview(0)}
              />
            ) : undefined
          }
        >
          {hasImages ? (
            <div className={styles.gallery}>
              {/* ImageSlide가 화살표/도트 버튼을 갖고 있어 스테이지 자체를 button으로 감싸지 않는다 */}
              <div className={styles.galleryStage}>
                <ImageSlide images={shownImages.map((image) => image.url ?? '')} ratio="4x3" />
                {/* 확대 버튼 — 슬라이드 위 우상단. 공용 Button을 반투명 슬롯에 얹어 이미지 위에서도 읽히게 한다 */}
                <div className={styles.zoomSlot}>
                  <Button
                    variant="secondary"
                    appearance="outline"
                    size="sm"
                    label={L.gallery.zoom}
                    showLeftIcon
                    leftIcon={zoomIcon ?? <Maximize2 size={16} />}
                    onClick={() => openPreview(0)}
                  />
                </div>
              </div>

              <ul className={styles.thumbs}>
                {shownImages.map((image, index) => (
                  <li key={image.id} className={styles.thumbItem}>
                    {/* 썸네일은 이미지 타일 자체가 버튼이라 공용 Button(라벨+아이콘 전용)으로 대체할 수 없다 */}
                    <button
                      type="button"
                      className={styles.thumb}
                      onClick={() => openPreview(index)}
                      aria-label={L.gallery.zoomAria({
                        name: image.alt ?? value.name,
                        index,
                      })}
                    >
                      <img className={styles.thumbImage} src={image.url} alt="" loading="lazy" />
                      {index === 0 && (
                        <span className={styles.thumbBadge}>{L.gallery.coverBadge}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            // 이미지 없음 — 공용 플레이스홀더로 통일
            <div className={styles.galleryEmpty}>
              <Placeholder kind="image" size="fill" label={L.empty.images} />
            </div>
          )}
        </PageSection>
      )}

      {/* 기본 정보 */}
      <PageSection title={L.sections.basic}>
        <DefinitionList items={basicItems} columns={2} divider={false} density="compact" />
      </PageSection>

      {/* 옵션 목록 — 상세는 읽기 전용, 편집은 '수정'(ProductForm)에서 */}
      {s.options && (
        <PageSection title={L.sections.options} description={L.optionCount(options.length)}>
          <AdminTable
            columns={optionColumns}
            rows={options}
            rowKey={(row) => row.id}
            density="compact"
            emptyText={emptyText ?? L.empty.options}
          />
        </PageSection>
      )}

      {/* 상세 설명 — RichTextEditor 결과 HTML을 읽기 전용으로 렌더 */}
      {s.description && (
        <PageSection title={L.sections.description}>
          {value.descriptionHtml.trim() !== '' ? (
            // 어드민이 저장한 신뢰된 HTML만 들어온다(외부 입력이면 호출부에서 sanitize 필요)
            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: value.descriptionHtml }}
            />
          ) : (
            <div className={styles.emptyBlock}>
              <Placeholder kind="empty" size={72} label={L.empty.descriptionBody} />
            </div>
          )}

          {attachments.length > 0 && (
            <div className={styles.attachments}>
              <span className={styles.blockLabel}>{L.description.attachments}</span>
              <AttachmentList items={attachments} onDownload={onAttachmentDownload} compact />
            </div>
          )}
        </PageSection>
      )}

      {/* 탭 — 판매 통계 / 최근 주문 / 문의 */}
      {s.tabs && (
        <PageSection>
          <div className={styles.tabs}>
            <Tab
              items={TAB_KEYS.map((key) => {
                const label = L.tabs[key]
                return {
                  value: key,
                  label:
                    key === 'orders' && orders.length > 0
                      ? `${label} (${orders.length})`
                      : key === 'inquiries' && inquiries.length > 0
                        ? `${label} (${inquiries.length})`
                        : label,
                }
              })}
              value={tab}
              onChange={(next) => setTab(next as ProductDetailTab)}
              variant="underline"
            />

            <div className={styles.tabPanel} role="tabpanel">
              {tab === 'sales' &&
                (sales.length > 0 ? (
                  <AdminChart
                    kind="bar"
                    labels={sales.map((point) => point.month)}
                    series={[
                      {
                        label: L.chart.series,
                        data: sales.map((point) => point.count),
                        tone: 'primary',
                      },
                    ]}
                    title={L.chart.title}
                    height={260}
                    valueFormat={(n) => formatCount(n)}
                  />
                ) : (
                  <div className={styles.emptyBlock}>
                    <Placeholder kind="empty" size={72} label={L.empty.sales} />
                  </div>
                ))}

              {tab === 'orders' && (
                <AdminTable
                  columns={orderColumns}
                  rows={orders}
                  rowKey={(row) => row.id}
                  density="compact"
                  emptyText={emptyText ?? L.empty.orders}
                />
              )}

              {tab === 'inquiries' && (
                <AdminTable
                  columns={inquiryColumns}
                  rows={inquiries}
                  rowKey={(row) => row.id}
                  density="compact"
                  emptyText={emptyText ?? L.empty.inquiries}
                />
              )}
            </div>
          </div>
        </PageSection>
      )}
    </>
  )

  // ── 사이드 — 꺼진 카드는 배열에서 빠지고, 전부 꺼지면 aside 슬롯 자체를 넘기지 않는다(빈 칼럼 금지) ──
  const asideCards: ReactNode[] = []

  if (s.stats) {
    asideCards.push(
      <PageSection key="stats" title={L.sections.stats} card={false}>
        <Statistics items={stats} columns={2} />
      </PageSection>,
    )
  }

  if (s.visibility) {
    asideCards.push(
      <PageSection key="visibility" title={L.sections.visibility}>
        {/* 라벨 + 보조설명 + 컨트롤 규격은 공용 FieldRow가 갖는다 — 여기서 다시 짜지 않는다 */}
        <div className={styles.switchRows}>
          <FieldRow label={L.visibility.display} description={L.visibility.displayHint}>
            <Toggle checked={value.visible} onChange={onVisibleChange} />
          </FieldRow>

          <FieldRow label={L.visibility.sale} description={L.status[value.status]}>
            <Toggle
              checked={value.status === 'onSale'}
              onChange={(next) => onStatusChange?.(next ? 'onSale' : 'stopped')}
            />
          </FieldRow>
        </div>
      </PageSection>,
    )
  }

  if (s.taxonomy) {
    asideCards.push(
      <PageSection
        key="taxonomy"
        title={L.sections.taxonomy}
        actions={
          <Button
            variant="secondary"
            appearance="ghost"
            size="sm"
            label={L.taxonomy.edit}
            showLeftIcon
            leftIcon={editIcon ?? <Pencil size={14} />}
            onClick={onCategoryEdit}
          />
        }
      >
        <div className={styles.taxonomy}>
          <div className={styles.taxonomyRow}>
            <span className={styles.blockLabel}>{L.taxonomy.category}</span>
            <div className={styles.tagList}>
              <Tag label={value.category} tone="primary" size="sm" />
            </div>
          </div>

          <div className={styles.taxonomyRow}>
            <span className={styles.blockLabel}>{L.taxonomy.tags}</span>
            {tags.length > 0 ? (
              <div className={styles.tagList}>
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    label={tag}
                    tone="secondary"
                    size="sm"
                    onRemove={
                      onTagsChange != null
                        ? () => onTagsChange(tags.filter((item) => item !== tag))
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <span className={styles.muted}>{L.taxonomy.emptyTags}</span>
            )}
          </div>
        </div>
      </PageSection>,
    )
  }

  if (s.timeline) {
    asideCards.push(
      <PageSection key="timeline" title={L.sections.timeline}>
        <StatusTimeline steps={steps} />
      </PageSection>,
    )
  }

  if (s.manager) {
    asideCards.push(
      <PageSection key="manager" title={L.sections.manager}>
        <DefinitionList items={managerItems} columns={1} divider={false} density="compact" />
      </PageSection>,
    )
  }

  if (s.quickActions) {
    asideCards.push(
      <PageSection key="quickActions" title={L.sections.quickActions}>
        <div className={styles.quickActions}>
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label={L.actions.edit}
            showLeftIcon
            leftIcon={editIcon ?? <Pencil size={16} />}
            onClick={onEdit}
          />
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label={L.actions.duplicate}
            showLeftIcon
            leftIcon={duplicateIcon ?? <Copy size={16} />}
            onClick={() => setDuplicateOpen(true)}
          />
          <Button
            variant="error"
            appearance="outline"
            size="md"
            label={L.actions.delete}
            showLeftIcon
            leftIcon={deleteIcon ?? <Trash2 size={16} />}
            onClick={() => setDeleteOpen(true)}
          />
        </div>
      </PageSection>,
    )
  }

  const aside = asideCards.length > 0 ? <>{asideCards}</> : undefined

  // ── 하단 sticky 액션 바 ──
  const footer = s.footer ? (
    <>
      <div className={styles.footerLeft}>
        <Button
          variant="secondary"
          appearance="outline"
          size="md"
          label={L.actions.back}
          onClick={onBackToList}
        />
      </div>

      <Button
        variant="error"
        appearance="outline"
        size="md"
        label={L.actions.delete}
        showLeftIcon
        leftIcon={deleteIcon ?? <Trash2 size={16} />}
        disabled={saving}
        onClick={() => setDeleteOpen(true)}
      />
      <Button
        variant="secondary"
        appearance="outline"
        size="md"
        label={L.actions.duplicate}
        showLeftIcon
        leftIcon={duplicateIcon ?? <Copy size={16} />}
        disabled={saving}
        onClick={() => setDuplicateOpen(true)}
      />
      <Button
        variant="secondary"
        size="md"
        label={L.actions.edit}
        disabled={saving}
        onClick={onEdit}
      />
      <Button
        variant="primary"
        size="md"
        label={saving ? L.actions.saving : L.actions.save}
        disabled={saving}
        onClick={onSave}
      />
    </>
  ) : undefined

  return (
    <>
      <DetailLayout aside={aside} footer={footer}>
        {body}
      </DetailLayout>

      {/* 이미지 라이트박스 */}
      <ImagePreview
        open={previewOpen}
        items={previewItems}
        index={previewIndex}
        onIndexChange={setPreviewIndex}
        onClose={() => setPreviewOpen(false)}
      />

      {/* 복제 확인 */}
      <CrudDialog
        open={duplicateOpen}
        mode="create"
        title={L.duplicateDialog.title}
        description={dialogDescription(L.duplicateDialog.description, value)}
        confirmLabel={L.duplicateDialog.confirmLabel}
        onConfirm={() => {
          onDuplicate?.()
          setDuplicateOpen(false)
        }}
        onCancel={() => setDuplicateOpen(false)}
      />

      {/* 삭제 확인 */}
      <CrudDialog
        open={deleteOpen}
        mode="delete"
        title={L.deleteDialog.title}
        description={dialogDescription(L.deleteDialog.description, value)}
        onConfirm={() => {
          onDelete?.()
          setDeleteOpen(false)
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  )
}
