import type { ReactNode } from 'react'
import { ChevronDown, Download, Filter, LayoutGrid, Settings2, Truck, Upload } from 'lucide-react'
import styles from './OrderList.module.css'
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
   * '반품 관리'·'취소 관리'처럼 같은 목록을 다른 이름으로 재사용할 때만 건드린다.
   * 컬럼 머리글·다이얼로그 문구까지는 열지 않는다 — 축이 무한히 늘어난다.
   * ──────────────────────────────────────────────────────────────────── */
  title?: string
  exportLabel?: string
  createLabel?: string
  searchPlaceholder?: string
  emptyTitle?: string
  emptyDescription?: string
  /** 툴바 우측 총 건수 — 넘기지 않으면 건수 자리가 아예 없다(현재 화면) */
  total?: number
  /** 건수 단위. 기본 '건' → "135건" */
  countUnit?: string
}

const ITEM_STATUS_LABEL: Record<OrderItemStatus, string> = {
  delivered: '배송 완료',
  canceled: '취소 완료',
  confirmed: '구매 확정',
}

// 상태는 soft 톤으로 조용하게 — 강조색(primary)은 액션에만 쓴다
const ITEM_STATUS_TONE: Record<OrderItemStatus, 'secondary' | 'error' | 'success'> = {
  delivered: 'secondary',
  canceled: 'error',
  confirmed: 'success',
}

/** 1,234원 — 표 안 숫자는 tabular-nums(CSS)와 함께 자릿수를 맞춘다 */
function formatKrw(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
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
  title = '주문',
  exportLabel = '엑셀 다운로드',
  createLabel = '주문 생성',
  searchPlaceholder = '이름 · 아이디 · 연락처 · 주문번호 · 송장번호',
  emptyTitle = '주문이 없습니다',
  emptyDescription = '검색 조건을 바꾸거나 필터를 초기화해 보세요.',
  total,
  countUnit = '건',
}: OrderListProps) {
  const hasCreateMenu = createMenu != null && createMenu.length > 0

  const createButton = (
    <Button
      variant="primary"
      size="sm"
      label={createLabel}
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
        label="레이아웃 변경"
        showLeftIcon
        leftIcon={layoutIcon ?? <LayoutGrid size={14} />}
        onClick={onLayoutChange}
      />
      <Button
        variant="secondary"
        appearance="outline"
        size="sm"
        label={exportLabel}
        showLeftIcon
        leftIcon={exportIcon ?? <Download size={14} />}
        onClick={onExcelDownload}
      />
      <Button
        variant="secondary"
        appearance="outline"
        size="sm"
        label="송장 일괄 등록"
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
            label="필터"
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
            label="표시 항목 설정"
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
      title={title}
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
      searchPlaceholder={searchPlaceholder}
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
          <EmptyState kind="search" title={emptyTitle} description={emptyDescription} />
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
                      {row.buyerType === 'guest' && <span className={styles.guest}>비회원</span>}
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
                            label={ITEM_STATUS_LABEL[item.status]}
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
                                <span className={styles.strike}>{formatKrw(item.listPrice)}</span>
                              )}
                              <span className={styles.price}>{formatKrw(item.price)}</span>
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
                      placeholder="택배사 선택"
                      disabled={row.shipping.disabled === true}
                      onChange={(carrier) => onCarrierChange?.(row, carrier)}
                    />
                    <InputBase
                      value={row.shipping.trackingNo}
                      onChange={(value) => onTrackingNoChange?.(row, value)}
                      placeholder="송장번호"
                      inputMode="numeric"
                      disabled={row.shipping.disabled === true}
                    />
                    <Button
                      variant="secondary"
                      appearance="outline"
                      size="sm"
                      label="조회"
                      showLeftIcon
                      leftIcon={trackingIcon ?? <Truck size={14} />}
                      disabled={row.shipping.disabled === true}
                      onClick={() => onTrackingLookup?.(row)}
                    />
                  </div>

                  {/* 4) 결제 정보 */}
                  <div className={styles.cell}>
                    <p className={styles.total}>{formatKrw(row.payment.total)}</p>
                    <dl className={styles.payList}>
                      <div className={styles.payRow}>
                        <dt>상품금액</dt>
                        <dd>{formatKrw(row.payment.product)}</dd>
                      </div>
                      <div className={styles.payRow}>
                        <dt>배송비</dt>
                        <dd>{formatKrw(row.payment.shippingFee)}</dd>
                      </div>
                      <div className={styles.payRow}>
                        <dt>할인</dt>
                        <dd>-{formatKrw(row.payment.discount)}</dd>
                      </div>
                      <div className={styles.payRow}>
                        <dt>적립금</dt>
                        <dd>-{formatKrw(row.payment.point)}</dd>
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
