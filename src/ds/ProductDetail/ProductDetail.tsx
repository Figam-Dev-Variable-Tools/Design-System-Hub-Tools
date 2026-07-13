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
import styles from './ProductDetail.module.css'

/** 판매 상태 — 판매중 · 품절 · 판매중지 · 임시저장 */
export type ProductSaleStatus = 'onSale' | 'soldOut' | 'stopped' | 'draft'

export const PRODUCT_STATUS_LABEL: Record<ProductSaleStatus, string> = {
  onSale: '판매중',
  soldOut: '품절',
  stopped: '판매중지',
  draft: '임시저장',
}

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

export const PRODUCT_INQUIRY_STATUS_LABEL: Record<ProductInquiryStatus, string> = {
  waiting: '답변대기',
  answered: '답변완료',
  closed: '종료',
}

const INQUIRY_STATUS_TONE: Record<ProductInquiryStatus, 'warning' | 'success' | 'secondary'> = {
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

export type ProductDetailProps = {
  value: ProductDetailValue
  /** 하단 탭 기본 선택 */
  defaultTab?: ProductDetailTab
  /** 저장 처리 중 — 하단 액션 비활성 */
  saving?: boolean

  /** 섹션 ON/OFF (기본 전부 true) */
  show?: ProductDetailShow

  /* ── 문구 — 미지정이면 현재 문구 그대로 ── */
  /** 헤더 제목 — 상품명 대신 다른 문구를 걸고 싶을 때만(기본은 value.name) */
  title?: string
  /** 표(옵션·주문·문의)의 빈 상태 문구를 한 번에 갈아끼운다 — 미지정이면 표별 기본 문구 */
  emptyText?: string
  /** 재고 0일 때 기본 정보에 뜨는 배지 문구 */
  soldOutLabel?: string
  /** 수량 단위 — 재고/판매량 표기에 붙는다(개 → 벌/box 등) */
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

const TAB_ITEMS: { value: ProductDetailTab; label: string }[] = [
  { value: 'sales', label: '판매 통계' },
  { value: 'orders', label: '최근 주문' },
  { value: 'inquiries', label: '문의' },
]

/** 상품 진행 단계 — statusSteps 미지정 시 status에서 파생 */
const STATUS_FLOW: { key: string; label: string }[] = [
  { key: 'draft', label: '등록' },
  { key: 'review', label: '검수' },
  { key: 'onSale', label: '판매중' },
  { key: 'stopped', label: '판매종료' },
]

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
function formatKrw(value: number): string {
  if (!Number.isFinite(value)) return '-'
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

/** 수량 표기 — 단위는 호출부가 바꿀 수 있다(countUnit) */
function formatCount(value: number, unit: string): string {
  return `${value.toLocaleString('ko-KR')}${unit}`
}

/** 할인율 — 정가 대비 할인가. 정가가 0이거나 할인가가 없으면 null */
function discountRate(price: number, salePrice?: number): number | null {
  if (salePrice == null || price <= 0 || salePrice >= price) return null
  return Math.round(((price - salePrice) / price) * 100)
}

/** status → StatusTimeline 단계. 임시저장은 등록 단계에 머문다. */
export function buildProductStatusSteps(status: ProductSaleStatus): StatusStep[] {
  // 품절은 판매중 단계 안의 상태다 — 흐름 자체는 '판매중'에 머문다
  const currentKey = status === 'soldOut' ? 'onSale' : status === 'draft' ? 'draft' : status
  const currentIndex = STATUS_FLOW.findIndex((step) => step.key === currentKey)

  return STATUS_FLOW.map((step, index) => ({
    key: step.key,
    label: step.label,
    state:
      index < currentIndex ? 'done' : index === currentIndex ? 'current' : ('todo' as const),
  }))
}

export function ProductDetail({
  value,
  defaultTab = 'sales',
  saving = false,
  show,
  title,
  emptyText,
  soldOutLabel = '품절',
  countUnit = '개',
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

  const badge = STATUS_BADGE[value.status]
  const steps = value.statusSteps ?? buildProductStatusSteps(value.status)
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
    { kind: 'text', key: 'name', header: '옵션명', ratio: 2 },
    { kind: 'title', key: 'value', header: '옵션값', ratio: 2 },
    {
      kind: 'price',
      key: 'extraPrice',
      header: '추가금액',
      // 0원은 '-'로 — 표가 0원으로 도배되지 않게
      render: (row) => (
        <span className={styles.num}>{row.extraPrice === 0 ? '-' : formatKrw(row.extraPrice)}</span>
      ),
    },
    { kind: 'number', key: 'stock', header: '재고', tone: () => 'error' },
    {
      kind: 'badge',
      key: 'active',
      header: '사용',
      value: (row) => ((row.active ?? true) ? '사용' : '미사용'),
      tone: (row) => ((row.active ?? true) ? 'success' : 'secondary'),
    },
  ]

  // ── 최근 주문 표 ──
  const orderColumns: AdminColumn<ProductOrder>[] = [
    { kind: 'title', key: 'orderNo', header: '주문번호', ratio: 2, onClick: onOrderClick },
    { kind: 'user', key: 'customer', header: '주문자' },
    { kind: 'text', key: 'option', header: '옵션', value: (row) => row.option ?? '-' },
    { kind: 'number', key: 'quantity', header: '수량' },
    { kind: 'price', key: 'amount', header: '결제금액' },
    {
      kind: 'badge',
      key: 'status',
      header: '주문상태',
      tone: (row) => (row.status === '취소' || row.status === '환불' ? 'error' : 'primary'),
    },
    { kind: 'date', key: 'orderedAt', header: '주문일' },
  ]

  // ── 문의 표 ──
  const inquiryColumns: AdminColumn<ProductInquiry>[] = [
    { kind: 'title', key: 'title', header: '제목', ratio: 4, onClick: onInquiryClick },
    { kind: 'text', key: 'type', header: '유형', ratio: 1, value: (row) => row.type ?? '-' },
    { kind: 'user', key: 'author', header: '작성자' },
    { kind: 'date', key: 'createdAt', header: '등록일' },
    {
      kind: 'badge',
      key: 'status',
      header: '처리상태',
      value: (row) => PRODUCT_INQUIRY_STATUS_LABEL[row.status],
      tone: (row) => INQUIRY_STATUS_TONE[row.status],
    },
  ]

  // ── 사이드: 재고 현황 ──
  const stats: StatItem[] = [
    {
      label: '총 재고',
      value: formatCount(totalStock, countUnit),
      hint:
        basic.safetyStock != null
          ? `안전재고 ${formatCount(basic.safetyStock, countUnit)}`
          : undefined,
    },
    {
      label: '품절 옵션',
      value: options.length > 0 ? `${soldOutOptions}/${options.length}` : '-',
      hint: options.length > 0 ? '옵션 기준' : '옵션 없음',
    },
    { label: '6개월 판매', value: formatCount(soldTotal, countUnit), hint: '최근 6개월' },
    { label: '미답변 문의', value: `${inquiries.filter((i) => i.status === 'waiting').length}건` },
  ]

  // ── 헤더 메타 · 기본 정보 · 담당자 — 라벨/값 블록은 공용 DefinitionList 하나로 통일한다 ──
  // (divider={false}: 카드 안에서 선 없이 읽히던 기존 레이아웃을 유지)
  const metaItems: DefinitionItem[] = [
    { label: '상품코드', value: <span className={styles.code}>{value.code}</span> },
    { label: '등록일', value: value.createdAt },
    { label: '수정일', value: value.updatedAt ?? '-' },
    { label: '등록자', value: value.createdBy },
  ]

  const basicItems: DefinitionItem[] = [
    {
      label: '판매가',
      value:
        rate != null ? (
          <span className={styles.priceGroup}>
            <s className={styles.strike}>{formatKrw(basic.price)}</s>
            <strong className={styles.salePrice}>{formatKrw(basic.salePrice ?? 0)}</strong>
            <Badge variant="error" appearance="soft" size="sm" label={`${rate}%`} />
          </span>
        ) : (
          <strong className={styles.salePrice}>{formatKrw(basic.price)}</strong>
        ),
    },
    {
      label: '재고',
      value: isSoldOut ? (
        <Badge variant="error" appearance="soft" size="sm" label={soldOutLabel} />
      ) : lowStock ? (
        <span className={styles.stockWarn}>
          {formatCount(totalStock, countUnit)} · 안전재고 이하
        </span>
      ) : (
        formatCount(totalStock, countUnit)
      ),
    },
    {
      label: '배송비',
      value: basic.shippingFee === 0 ? '무료배송' : formatKrw(basic.shippingFee),
    },
    { label: '과세여부', value: basic.taxable ? '과세' : '면세' },
  ]

  const managerItems: DefinitionItem[] = [
    { label: '담당 MD', value: value.manager ?? '미지정' },
    { label: '등록자', value: value.createdBy },
    { label: '최근 수정', value: value.updatedAt ?? '-' },
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
                label={PRODUCT_STATUS_LABEL[value.status]}
              />
              {/* 판매중으로 잡혀 있어도 재고가 0이면 품절을 함께 알린다 */}
              {isSoldOut && value.status !== 'soldOut' && (
                <Badge variant="warning" appearance="soft" size="md" label="재고 0" />
              )}
              <Tag label={value.category} tone="primary" size="sm" />
            </div>

            <div className={styles.headerSwitch}>
              <span className={styles.switchLabel}>판매</span>
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
          title="상품 이미지"
          description={hasImages ? `총 ${shownImages.length}장 · 첫 번째가 대표 이미지` : undefined}
          actions={
            hasImages ? (
              <Button
                variant="secondary"
                appearance="outline"
                size="sm"
                label="크게 보기"
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
                    label="크게 보기"
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
                      aria-label={`${image.alt ?? value.name} ${index + 1}번째 이미지 크게 보기`}
                    >
                      <img className={styles.thumbImage} src={image.url} alt="" loading="lazy" />
                      {index === 0 && <span className={styles.thumbBadge}>대표</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            // 이미지 없음 — 공용 플레이스홀더로 통일
            <div className={styles.galleryEmpty}>
              <Placeholder kind="image" size="fill" label="등록된 이미지가 없습니다" />
            </div>
          )}
        </PageSection>
      )}

      {/* 기본 정보 */}
      <PageSection title="기본 정보">
        <DefinitionList items={basicItems} columns={2} divider={false} density="compact" />
      </PageSection>

      {/* 옵션 목록 — 상세는 읽기 전용, 편집은 '수정'(ProductForm)에서 */}
      {s.options && (
        <PageSection title="옵션" description={`${options.length}개 옵션`}>
          <AdminTable
            columns={optionColumns}
            rows={options}
            rowKey={(row) => row.id}
            density="compact"
            emptyText={emptyText ?? '등록된 옵션이 없습니다'}
          />
        </PageSection>
      )}

      {/* 상세 설명 — RichTextEditor 결과 HTML을 읽기 전용으로 렌더 */}
      {s.description && (
        <PageSection title="상세 설명">
          {value.descriptionHtml.trim() !== '' ? (
            // 어드민이 저장한 신뢰된 HTML만 들어온다(외부 입력이면 호출부에서 sanitize 필요)
            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: value.descriptionHtml }}
            />
          ) : (
            <div className={styles.emptyBlock}>
              <Placeholder kind="empty" size={72} label="상세 설명이 없습니다" />
            </div>
          )}

          {attachments.length > 0 && (
            <div className={styles.attachments}>
              <span className={styles.blockLabel}>첨부 자료</span>
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
              items={TAB_ITEMS.map((item) => ({
                value: item.value,
                label:
                  item.value === 'orders' && orders.length > 0
                    ? `${item.label} (${orders.length})`
                    : item.value === 'inquiries' && inquiries.length > 0
                      ? `${item.label} (${inquiries.length})`
                      : item.label,
              }))}
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
                      { label: '판매량', data: sales.map((point) => point.count), tone: 'primary' },
                    ]}
                    title="최근 6개월 판매량"
                    height={260}
                    valueFormat={(n) => formatCount(n, countUnit)}
                  />
                ) : (
                  <div className={styles.emptyBlock}>
                    <Placeholder kind="empty" size={72} label="판매 데이터가 없습니다" />
                  </div>
                ))}

              {tab === 'orders' && (
                <AdminTable
                  columns={orderColumns}
                  rows={orders}
                  rowKey={(row) => row.id}
                  density="compact"
                  emptyText={emptyText ?? '최근 주문이 없습니다'}
                />
              )}

              {tab === 'inquiries' && (
                <AdminTable
                  columns={inquiryColumns}
                  rows={inquiries}
                  rowKey={(row) => row.id}
                  density="compact"
                  emptyText={emptyText ?? '등록된 문의가 없습니다'}
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
      <PageSection key="stats" title="재고 현황" card={false}>
        <Statistics items={stats} columns={2} />
      </PageSection>,
    )
  }

  if (s.visibility) {
    asideCards.push(
      <PageSection key="visibility" title="노출 상태">
        {/* 라벨 + 보조설명 + 컨트롤 규격은 공용 FieldRow가 갖는다 — 여기서 다시 짜지 않는다 */}
        <div className={styles.switchRows}>
          <FieldRow label="전시 노출" description="쇼핑몰 목록/검색 노출">
            <Toggle checked={value.visible} onChange={onVisibleChange} />
          </FieldRow>

          <FieldRow
            label="판매"
            description={
              value.status === 'onSale' ? '판매중' : PRODUCT_STATUS_LABEL[value.status]
            }
          >
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
        title="카테고리 · 태그"
        actions={
          <Button
            variant="secondary"
            appearance="ghost"
            size="sm"
            label="편집"
            showLeftIcon
            leftIcon={editIcon ?? <Pencil size={14} />}
            onClick={onCategoryEdit}
          />
        }
      >
        <div className={styles.taxonomy}>
          <div className={styles.taxonomyRow}>
            <span className={styles.blockLabel}>카테고리</span>
            <div className={styles.tagList}>
              <Tag label={value.category} tone="primary" size="sm" />
            </div>
          </div>

          <div className={styles.taxonomyRow}>
            <span className={styles.blockLabel}>태그</span>
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
              <span className={styles.muted}>등록된 태그가 없습니다</span>
            )}
          </div>
        </div>
      </PageSection>,
    )
  }

  if (s.timeline) {
    asideCards.push(
      <PageSection key="timeline" title="판매 진행">
        <StatusTimeline steps={steps} />
      </PageSection>,
    )
  }

  if (s.manager) {
    asideCards.push(
      <PageSection key="manager" title="담당자">
        <DefinitionList items={managerItems} columns={1} divider={false} density="compact" />
      </PageSection>,
    )
  }

  if (s.quickActions) {
    asideCards.push(
      <PageSection key="quickActions" title="빠른 액션">
        <div className={styles.quickActions}>
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label="수정"
            showLeftIcon
            leftIcon={editIcon ?? <Pencil size={16} />}
            onClick={onEdit}
          />
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label="복제"
            showLeftIcon
            leftIcon={duplicateIcon ?? <Copy size={16} />}
            onClick={() => setDuplicateOpen(true)}
          />
          <Button
            variant="error"
            appearance="outline"
            size="md"
            label="삭제"
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
          label="목록"
          onClick={onBackToList}
        />
      </div>

      <Button
        variant="error"
        appearance="outline"
        size="md"
        label="삭제"
        showLeftIcon
        leftIcon={deleteIcon ?? <Trash2 size={16} />}
        disabled={saving}
        onClick={() => setDeleteOpen(true)}
      />
      <Button
        variant="secondary"
        appearance="outline"
        size="md"
        label="복제"
        showLeftIcon
        leftIcon={duplicateIcon ?? <Copy size={16} />}
        disabled={saving}
        onClick={() => setDuplicateOpen(true)}
      />
      <Button variant="secondary" size="md" label="수정" disabled={saving} onClick={onEdit} />
      <Button
        variant="primary"
        size="md"
        label={saving ? '저장 중…' : '저장'}
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
        title="상품 복제"
        description={`'${value.name}'을(를) 복사해 임시저장 상태의 새 상품을 만듭니다.`}
        confirmLabel="복제"
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
        title="상품을 삭제할까요?"
        description={`'${value.name}'(${value.code})을(를) 삭제합니다.`}
        onConfirm={() => {
          onDelete?.()
          setDeleteOpen(false)
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  )
}
