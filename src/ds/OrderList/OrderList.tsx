import type { ReactNode } from 'react'
import { ChevronDown, Download, Filter, LayoutGrid, Settings2, Truck, Upload } from 'lucide-react'
import styles from './OrderList.module.css'
import {
  mergeLabels,
  resolveLabel,
  type DeepPartialOneLevel,
  type EmptyLabels,
  type Formatters,
  type LabelFn,
  type SearchLabels,
  type StatusLabels,
} from '../../shared/labels'
import { AdminListPage } from '../AdminListPage/AdminListPage'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import { ContextMenu, type ContextMenuItem } from '../ContextMenu/ContextMenu'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { InputBase } from '../InputBase/InputBase'
import { Select, type SelectOption } from '../Select/Select'
import { Skeleton } from '../Skeleton/Skeleton'
import { EmptyState } from '../EmptyState/EmptyState'
import { Placeholder } from '../../shared/placeholders'

/** 주문 단계 — 탭/필터의 기준이 되는 주문 레벨 상태 */
export type OrderStatus =
  | 'pending' // 결제대기
  | 'preparing' // 상품준비중
  | 'ready' // 배송대기
  | 'shipping' // 배송중
  | 'delivered' // 배송완료
  | 'cancelRequested' // 취소접수
  | 'returnRequested' // 반품접수

/** 품목 레벨 상태 — 한 주문 안에서 품목마다 다를 수 있다(부분 취소 등) */
export type OrderItemStatus =
  | 'delivered' // 배송 완료
  | 'canceled' // 취소 완료
  | 'confirmed' // 구매 확정

export type OrderItem = {
  id: string
  /** 품목번호 — 주문번호와 별개로 품목마다 부여된다 */
  itemNo: string
  name: string
  /** 썸네일 URL — 없으면 공용 Placeholder를 그린다 */
  image?: string
  /** 실제 판매가 */
  price: number
  /** 할인 전 정가 — price와 다를 때만 취소선으로 함께 보여준다 */
  listPrice?: number
  qty: number
  status: OrderItemStatus
  /** 취소/반품 사유 — 취소 완료 품목에만 붙는다 */
  cancelReason?: string
}

export type OrderShipping = {
  /** 택배사 코드 — carriers 옵션의 value와 맞춘다 */
  carrier: string | null
  trackingNo: string
  /** 취소 건 등 송장 입력이 막힌 주문 */
  disabled?: boolean
}

export type OrderPayment = {
  /** 총 결제 금액 */
  total: number
  /** 상품 금액 */
  product: number
  shippingFee: number
  /** 할인 금액 — 양수로 넣으면 -로 표기된다 */
  discount: number
  /** 적립금 사용액 — 양수로 넣으면 -로 표기된다 */
  point: number
  method: string
}

export type OrderReceiver = {
  name: string
  phone: string
  address: string
  memo?: string
}

export type OrderRow = {
  id: string
  orderNo: string
  /** 유입 채널 코드 — 'N'(네이버) 같은 짧은 배지. 자사몰 주문이면 없음 */
  channelNo?: string
  orderedAt: string
  buyer: string
  buyerType: 'member' | 'guest'
  phone: string
  status: OrderStatus
  items: OrderItem[]
  shipping: OrderShipping
  payment: OrderPayment
  receiver: OrderReceiver
}

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   품목 상태 배지·헤더 액션·툴바 버튼·배송 입력 힌트·결제 내역 라벨·스크린리더 이름을 한 통로로 연다.
   금액의 '원'은 문구가 아니라 포맷이므로 labels가 아니라 formatters로 연다.
   우선순위: 개별 prop(title·exportLabel·createLabel …) > labels.* > 기본값. */
type OrderListLabelsResolved = {
  title: string
  /** 품목 배지 — 한 주문 안에서 품목마다 다를 수 있다 */
  itemStatus: Record<OrderItemStatus, string>
  /** 헤더 우측 액션 */
  header: { layout: string; export: string; bulkTracking: string; create: string }
  /** 툴바 우측 액션 */
  toolbar: { filter: string; columnSettings: string }
  search: SearchLabels
  /** 1) 주문 정보 셀 */
  order: {
    guest: string
    /** 주문번호 버튼의 접근성 이름 — 숫자만 읽히면 무슨 번호인지 알 수 없다 */
    orderNoAria: LabelFn<string>
  }
  /** 3) 배송 정보 셀 */
  shipping: { carrierPlaceholder: string; trackingPlaceholder: string; lookup: string }
  /** 4) 결제 정보 셀의 정의 라벨 */
  payment: { product: string; shippingFee: string; discount: string; point: string }
  /** 5) 수령인 셀 — 메모 버튼의 접근성 이름(메모 본문만 읽히면 맥락이 없다) */
  receiver: { memoAria: LabelFn<string> }
  /** 빈 목록 — EmptyState(kind='search')로 그대로 흘러간다 */
  empty: Required<Pick<EmptyLabels, 'title' | 'description'>>
}

export const DEFAULT_ORDER_LIST_LABELS: OrderListLabelsResolved = {
  title: '주문',
  itemStatus: { delivered: '배송 완료', canceled: '취소 완료', confirmed: '구매 확정' },
  header: {
    layout: '레이아웃 변경',
    export: '엑셀 다운로드',
    bulkTracking: '송장 일괄 등록',
    create: '주문 생성',
  },
  toolbar: { filter: '필터', columnSettings: '표시 항목 설정' },
  search: { searchPlaceholder: '이름 · 아이디 · 연락처 · 주문번호 · 송장번호' },
  order: {
    guest: '비회원',
    orderNoAria: (orderNo) => `주문번호 ${orderNo} 상세보기`,
  },
  shipping: {
    carrierPlaceholder: '택배사 선택',
    trackingPlaceholder: '송장번호',
    lookup: '조회',
  },
  payment: { product: '상품금액', shippingFee: '배송비', discount: '할인', point: '적립금' },
  receiver: { memoAria: (name) => `${name} 수령인 메모 열기` },
  empty: {
    title: '주문이 없습니다',
    description: '검색 조건을 바꾸거나 필터를 초기화해 보세요.',
  },
} as const

export type OrderListLabels = DeepPartialOneLevel<OrderListLabelsResolved>

/** 품목 상태 문구만 갈아끼울 때 — labels.itemStatus와 같은 모양 */
export type OrderItemStatusLabels = StatusLabels<OrderItemStatus>

export type OrderListProps = {
  /** 화면에 그릴 주문 — 탭/검색 필터링은 호출 측(서버)에서 끝낸 결과를 넘긴다 */
  rows: OrderRow[]
  loading?: boolean
  /** 상태 탭 — count까지 데이터로 받는다 */
  tabs?: CategoryTabItem[]
  activeTab?: string
  onTabChange?: (value: string) => void
  /** 넘기면 탭 끝에 [+ 새 탭]이 생긴다 */
  onTabAdd?: (label: string) => void
  /** 검색어(제어) — 이름·아이디·연락처·주문번호·송장번호 통합 검색 */
  keyword?: string
  onKeywordChange?: (value: string) => void
  onSearch?: (keyword: string) => void
  onFilter?: () => void
  /** 컬럼(표시 항목) 설정 */
  onColumnSettings?: () => void
  onLayoutChange?: () => void
  onExcelDownload?: () => void
  onBulkTracking?: () => void
  /** [주문 생성 ▾] 드롭다운 항목 — 비우면 버튼이 단일 액션이 된다 */
  createMenu?: ContextMenuItem[]
  onCreate?: () => void
  /** 택배사 후보 */
  carriers?: SelectOption[]
  onCarrierChange?: (row: OrderRow, carrier: string) => void
  onTrackingNoChange?: (row: OrderRow, trackingNo: string) => void
  /** 송장 [조회] */
  onTrackingLookup?: (row: OrderRow) => void
  /** 주문번호 클릭 */
  onOrderOpen?: (row: OrderRow) => void
  /** 수령인 메모 링크 클릭 */
  onMemoOpen?: (row: OrderRow) => void
  density?: 'compact' | 'comfortable'

  /* ── ON/OFF ───────────────────────────────────────────────────────────
   * 같은 목록을 권한/화면별로 깎아 쓰기 위한 스위치. 읽기 전용 화면에서는
   * 헤더 액션을, 임베드용 좁은 화면에서는 툴바를 통째로 끈다. 모두 기본 ON이라
   * 아무것도 넘기지 않으면 지금 화면 그대로다.
   * ──────────────────────────────────────────────────────────────────── */
  /** 헤더 우측 액션 묶음(레이아웃/엑셀/송장/주문 생성) */
  showHeaderActions?: boolean
  /** 툴바(검색 + 필터 + 표시 항목 설정) 전체 */
  showToolbar?: boolean
  /** 툴바의 [필터] */
  showFilter?: boolean
  /** 툴바의 [표시 항목 설정] */
  showColumnSettings?: boolean

  /* ── 아이콘 슬롯 ──────────────────────────────────────────────────────
   * 서비스마다 아이콘 세트가 달라도 컴포넌트를 포크하지 않게 하는 자리.
   * 넘기지 않으면 지금 쓰는 lucide 아이콘이 그대로 들어간다.
   * ──────────────────────────────────────────────────────────────────── */
  layoutIcon?: ReactNode
  exportIcon?: ReactNode
  bulkTrackingIcon?: ReactNode
  createIcon?: ReactNode
  filterIcon?: ReactNode
  columnSettingsIcon?: ReactNode
  /** 행의 [조회] 버튼 아이콘 */
  trackingIcon?: ReactNode

  /* ── 카피 ─────────────────────────────────────────────────────────────
   * 화면에 나오는 모든 글자는 labels 하나로 연다.
   * 아래 개별 prop은 하위호환용 — 넘기면 labels보다 우선한다.
   * ──────────────────────────────────────────────────────────────────── */
  /** @deprecated labels.title 을 쓰세요 */
  title?: string
  /** @deprecated labels.header.export 를 쓰세요 */
  exportLabel?: string
  /** @deprecated labels.header.create 를 쓰세요 */
  createLabel?: string
  /** @deprecated labels.search.searchPlaceholder 를 쓰세요 */
  searchPlaceholder?: string
  /** @deprecated labels.empty.title 을 쓰세요 */
  emptyTitle?: string
  /** @deprecated labels.empty.description 을 쓰세요 */
  emptyDescription?: string
  /** 화면 문구를 통째로 갈아끼우는 단일 통로 — 개별 카피 prop이 우선한다 */
  labels?: OrderListLabels
  /**
   * 숫자·통화 포맷(문구가 아니라 포맷이다) — 품목가·결제 내역의 표기를 바꾼다.
   * 기본 price는 통화 기호 없이 '1,234원'(레퍼런스 표기).
   */
  formatters?: Pick<Formatters, 'price'>
  /** 툴바 우측 총 건수 — 넘기지 않으면 건수 자리가 아예 없다(현재 화면) */
  total?: number
  /** 건수 단위. 기본 '건' → "135건" */
  countUnit?: string
}

/** @deprecated DEFAULT_ORDER_LIST_LABELS.itemStatus 를 쓰세요 (기존 이름 유지용 alias) */
export const ITEM_STATUS_LABEL: Record<OrderItemStatus, string> =
  DEFAULT_ORDER_LIST_LABELS.itemStatus

// 상태는 soft 톤으로 조용하게 — 강조색(primary)은 액션에만 쓴다
const ITEM_STATUS_TONE: Record<OrderItemStatus, 'secondary' | 'error' | 'success'> = {
  delivered: 'secondary',
  canceled: 'error',
  confirmed: 'success',
}

/** 기본 포맷 — 문구가 아니라 포맷이므로 formatters prop으로 갈아끼운다 */
const DEFAULT_FORMATTERS: Required<Pick<Formatters, 'price'>> = {
  // 1,234원 — 표 안 숫자는 tabular-nums(CSS)와 함께 자릿수를 맞춘다
  price: (value) => `${value.toLocaleString('ko-KR')}원`,
}

/** 로딩 골격 — 실제 카드와 같은 5분할 그리드라 자리가 흔들리지 않는다 */
function LoadingRows() {
  return (
    <div className={styles.list} aria-busy="true">
      {[0, 1, 2, 3, 4].map((index) => (
        <div key={index} className={styles.row}>
          {[0, 1, 2, 3, 4].map((cell) => (
            <div key={cell} className={styles.cell}>
              <Skeleton variant="text" lines={3} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * OrderList — 카페24 주문 목록. 행이 곧 카드인 5분할 목록이다(일반 표가 아니다).
 *
 * 골격(헤더/탭/툴바)은 AdminListPage가 잡는다. 본문만 이 화면이 그린다(renderBody) —
 * 셀 하나가 여러 줄(품목 여러 건·송장 입력·결제 내역)이라 AdminTable의 행 모델에 담기지 않는다.
 *
 *   주문 정보 │ 품목·가격·수량 │ 배송 정보 │ 결제 정보 │ 수령인 정보·메모
 *
 * 행 사이는 1px 가로선, 카드 안 5분할은 1px 세로선 하나뿐이다(그림자 없음).
 * 좁아지면 셀이 짜부라지지 않고 래퍼가 가로 스크롤된다.
 *
 * 상태를 갖지 않는다 — 탭·검색어·송장 입력값 모두 props로 받고 콜백으로 올린다.
 * (선택·페이징도 없다 — 필터링과 페이징은 호출 측이 끝낸 결과를 rows로 넘긴다)
 */
export function OrderList({
  rows,
  loading = false,
  tabs = [],
  activeTab = '',
  onTabChange,
  onTabAdd,
  keyword = '',
  onKeywordChange,
  onSearch,
  onFilter,
  onColumnSettings,
  onLayoutChange,
  onExcelDownload,
  onBulkTracking,
  createMenu,
  onCreate,
  carriers = [],
  onCarrierChange,
  onTrackingNoChange,
  onTrackingLookup,
  onOrderOpen,
  onMemoOpen,
  density = 'compact',
  showHeaderActions = true,
  showToolbar = true,
  showFilter = true,
  showColumnSettings = true,
  layoutIcon,
  exportIcon,
  bulkTrackingIcon,
  createIcon,
  filterIcon,
  columnSettingsIcon,
  trackingIcon,
  // 카피의 기본값은 DEFAULT_ORDER_LIST_LABELS가 갖는다 — 여기서 기본값을 주면
  // 넘기지 않은 개별 prop이 labels를 항상 이겨 통로가 막힌다
  title,
  exportLabel,
  createLabel,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  labels,
  formatters,
  total,
  countUnit = '건',
}: OrderListProps) {
  const L = mergeLabels(DEFAULT_ORDER_LIST_LABELS, labels)
  const F = { ...DEFAULT_FORMATTERS, ...formatters }

  const hasCreateMenu = createMenu != null && createMenu.length > 0

  const createButton = (
    <Button
      variant="primary"
      size="sm"
      label={resolveLabel(createLabel, L.header.create) ?? L.header.create}
      showRightIcon={hasCreateMenu}
      rightIcon={createIcon ?? <ChevronDown size={14} />}
      onClick={hasCreateMenu ? undefined : onCreate}
    />
  )

  const headerActions = showHeaderActions ? (
    <>
      <Button
        variant="secondary"
        appearance="outline"
        size="sm"
        label={L.header.layout}
        showLeftIcon
        leftIcon={layoutIcon ?? <LayoutGrid size={14} />}
        onClick={onLayoutChange}
      />
      <Button
        variant="secondary"
        appearance="outline"
        size="sm"
        label={resolveLabel(exportLabel, L.header.export) ?? L.header.export}
        showLeftIcon
        leftIcon={exportIcon ?? <Download size={14} />}
        onClick={onExcelDownload}
      />
      <Button
        variant="secondary"
        appearance="outline"
        size="sm"
        label={L.header.bulkTracking}
        showLeftIcon
        leftIcon={bulkTrackingIcon ?? <Upload size={14} />}
        onClick={onBulkTracking}
      />
      {hasCreateMenu ? (
        <ContextMenu items={createMenu} trigger="click">
          {createButton}
        </ContextMenu>
      ) : (
        createButton
      )}
    </>
  ) : undefined

  // 필터·표시 항목 설정 — 손으로 만든 아이콘 버튼 대신 공용 Button을 ListToolbar의 actions에 얹는다
  const toolbarActions =
    showFilter || showColumnSettings ? (
      <>
        {showFilter && (
          <Button
            variant="secondary"
            appearance="outline"
            size="sm"
            label={L.toolbar.filter}
            showLeftIcon
            leftIcon={filterIcon ?? <Filter size={16} />}
            onClick={onFilter}
          />
        )}
        {showColumnSettings && (
          <Button
            variant="secondary"
            appearance="outline"
            size="sm"
            label={L.toolbar.columnSettings}
            showLeftIcon
            leftIcon={columnSettingsIcon ?? <Settings2 size={16} />}
            onClick={onColumnSettings}
          />
        )}
      </>
    ) : undefined

  return (
    <AdminListPage<OrderRow>
      rows={rows}
      rowKey={(row) => row.id}
      title={resolveLabel(title, L.title)}
      headerActions={headerActions}
      density={density}
      tabs={tabs}
      tab={activeTab}
      onTabChange={onTabChange}
      onTabAdd={onTabAdd}
      // 툴바 한 줄 검색 — 엔터 확정은 셸이 SearchField까지 그대로 넘겨준다
      search="inline"
      keyword={keyword}
      onKeywordChange={onKeywordChange}
      onSearch={(values) => onSearch?.(String(values.keyword ?? ''))}
      searchPlaceholder={resolveLabel(searchPlaceholder, L.search.searchPlaceholder)}
      total={total}
      // 접두사 없이 숫자만 — "135건"
      totalLabel={null}
      totalUnit={countUnit}
      toolbarActions={toolbarActions}
      // 페이징·선택이 없는 목록 — rows를 자르지 않고 전부 그린다
      show={{ toolbar: showToolbar, count: total != null, pagination: false }}
      // 표가 아니라 5분할 카드 목록 — 로딩·빈 상태까지 본문이 직접 그린다
      renderBody={(pageRows) =>
        loading ? (
          <LoadingRows />
        ) : pageRows.length === 0 ? (
          <EmptyState
            kind="search"
            title={resolveLabel(emptyTitle, L.empty.title) ?? L.empty.title}
            description={resolveLabel(emptyDescription, L.empty.description)}
          />
        ) : (
          // 좁아지면 셀을 짜부라뜨리지 않고 이 래퍼가 가로로 스크롤된다
          <div className={styles.scroller}>
            <div className={styles.list}>
              {pageRows.map((row) => (
                <article key={row.id} className={styles.row}>
                  {/* 1) 주문 정보 */}
                  <div className={styles.cell}>
                    <div className={styles.orderHead}>
                      <button
                        type="button"
                        className={styles.orderNo}
                        aria-label={L.order.orderNoAria(row.orderNo)}
                        onClick={() => onOrderOpen?.(row)}
                      >
                        {row.orderNo}
                      </button>
                      {row.channelNo != null && (
                        <Badge
                          variant="primary"
                          appearance="soft"
                          size="sm"
                          label={row.channelNo}
                        />
                      )}
                    </div>
                    <p className={styles.muted}>{row.orderedAt}</p>
                    <p className={styles.buyer}>
                      <span className={styles.ellipsis}>{row.buyer}</span>
                      {row.buyerType === 'guest' && (
                        <span className={styles.guest}>{L.order.guest}</span>
                      )}
                    </p>
                    <p className={styles.mutedNum}>{row.phone}</p>
                  </div>

                  {/* 2) 품목·가격·수량 */}
                  <div className={styles.cell}>
                    {row.items.map((item) => (
                      <div key={item.id} className={styles.item}>
                        <div className={styles.itemHead}>
                          <Badge
                            variant={ITEM_STATUS_TONE[item.status]}
                            appearance="soft"
                            size="sm"
                            label={L.itemStatus[item.status]}
                          />
                          <span className={styles.itemNo}>{item.itemNo}</span>
                        </div>
                        <div className={styles.itemBody}>
                          {item.image != null ? (
                            <img className={styles.thumb} src={item.image} alt="" />
                          ) : (
                            <Placeholder kind="image" size={48} />
                          )}
                          <div className={styles.itemInfo}>
                            <p className={styles.itemName}>{item.name}</p>
                            <p className={styles.itemPrice}>
                              {item.listPrice != null && item.listPrice !== item.price && (
                                <span className={styles.strike}>{F.price(item.listPrice)}</span>
                              )}
                              <span className={styles.price}>{F.price(item.price)}</span>
                              <span className={styles.qty}>× {item.qty}</span>
                            </p>
                            {item.cancelReason != null && (
                              <p className={styles.cancelReason}>{item.cancelReason}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3) 배송 정보 */}
                  <div className={styles.cell}>
                    <Select
                      value={row.shipping.carrier}
                      options={carriers}
                      placeholder={L.shipping.carrierPlaceholder}
                      disabled={row.shipping.disabled === true}
                      onChange={(carrier) => onCarrierChange?.(row, carrier)}
                    />
                    <InputBase
                      value={row.shipping.trackingNo}
                      onChange={(value) => onTrackingNoChange?.(row, value)}
                      placeholder={L.shipping.trackingPlaceholder}
                      inputMode="numeric"
                      disabled={row.shipping.disabled === true}
                    />
                    <Button
                      variant="secondary"
                      appearance="outline"
                      size="sm"
                      label={L.shipping.lookup}
                      showLeftIcon
                      leftIcon={trackingIcon ?? <Truck size={14} />}
                      disabled={row.shipping.disabled === true}
                      onClick={() => onTrackingLookup?.(row)}
                    />
                  </div>

                  {/* 4) 결제 정보 */}
                  <div className={styles.cell}>
                    <p className={styles.total}>{F.price(row.payment.total)}</p>
                    <dl className={styles.payList}>
                      <div className={styles.payRow}>
                        <dt>{L.payment.product}</dt>
                        <dd>{F.price(row.payment.product)}</dd>
                      </div>
                      <div className={styles.payRow}>
                        <dt>{L.payment.shippingFee}</dt>
                        <dd>{F.price(row.payment.shippingFee)}</dd>
                      </div>
                      <div className={styles.payRow}>
                        <dt>{L.payment.discount}</dt>
                        <dd>-{F.price(row.payment.discount)}</dd>
                      </div>
                      <div className={styles.payRow}>
                        <dt>{L.payment.point}</dt>
                        <dd>-{F.price(row.payment.point)}</dd>
                      </div>
                    </dl>
                    <p className={styles.method}>{row.payment.method}</p>
                  </div>

                  {/* 5) 수령인 정보·메모 */}
                  <div className={styles.cell}>
                    <p className={styles.receiverName}>{row.receiver.name}</p>
                    <p className={styles.mutedNum}>{row.receiver.phone}</p>
                    <p className={styles.address}>{row.receiver.address}</p>
                    {row.receiver.memo != null && (
                      <button
                        type="button"
                        className={styles.memo}
                        aria-label={L.receiver.memoAria(row.receiver.name)}
                        onClick={() => onMemoOpen?.(row)}
                      >
                        {row.receiver.memo}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )
      }
    />
  )
}
