import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  ChevronsUpDown,
  Columns3,
  FileSpreadsheet,
  FileText,
  LayoutList,
  PackagePlus,
  Phone,
  SlidersHorizontal,
  Store,
} from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { OrderList, type OrderListProps, type OrderRow } from './OrderList'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import type { SelectOption } from '../Select/Select'

/* ── 목데이터 ────────────────────────────────────────────────────────────── */

const CARRIERS: SelectOption[] = [
  { value: 'cj', label: 'CJ대한통운' },
  { value: 'hanjin', label: '한진택배' },
  { value: 'lotte', label: '롯데택배' },
  { value: 'post', label: '우체국택배' },
  { value: 'logen', label: '로젠택배' },
]

const TABS: CategoryTabItem[] = [
  { label: '전체', value: 'all', count: 135, fixed: true },
  { label: '결제대기', value: 'pending', fixed: true },
  { label: '상품준비중', value: 'preparing', fixed: true },
  { label: '배송대기', value: 'ready', fixed: true },
  { label: '배송중', value: 'shipping', fixed: true },
  { label: '배송완료', value: 'delivered', count: 1, fixed: true },
  { label: '취소접수', value: 'cancelRequested', fixed: true },
  { label: '반품접수', value: 'returnRequested', fixed: true },
]

const ORDERS: OrderRow[] = [
  {
    id: 'o1',
    orderNo: '20260713-0001937',
    channelNo: 'N',
    orderedAt: '2026-07-13 14:02',
    buyer: '김서준',
    buyerType: 'member',
    phone: '010-2841-7720',
    status: 'delivered',
    items: [
      {
        id: 'o1-i1',
        itemNo: '20260713-0001937-01',
        name: '겨울 울 블렌드 더블 코트 (차콜 / M)',
        image: mockImage('COAT', 'slate'),
        price: 189000,
        listPrice: 249000,
        qty: 1,
        status: 'delivered',
      },
      {
        id: 'o1-i2',
        itemNo: '20260713-0001937-02',
        name: '캐시미어 머플러 (오트밀)',
        image: mockImage('SCARF', 'sand'),
        price: 49000,
        qty: 2,
        status: 'confirmed',
      },
    ],
    shipping: { carrier: 'cj', trackingNo: '612847390215' },
    payment: {
      total: 284000,
      product: 287000,
      shippingFee: 0,
      discount: 2000,
      point: 1000,
      method: '신용카드 (국민)',
    },
    receiver: {
      name: '김서준',
      phone: '010-2841-7720',
      address: '서울특별시 마포구 양화로 45, 메세나폴리스 1204호 (서교동)',
      memo: '부재 시 경비실에 맡겨주세요',
    },
  },
  {
    id: 'o2',
    orderNo: '20260713-0001936',
    orderedAt: '2026-07-13 11:47',
    buyer: '이하윤',
    buyerType: 'guest',
    phone: '010-7719-3308',
    status: 'shipping',
    items: [
      {
        id: 'o2-i1',
        itemNo: '20260713-0001936-01',
        name: '옥스포드 셔츠 (라이트블루 / L)',
        image: mockImage('SHIRT', 'sage'),
        price: 59000,
        qty: 1,
        status: 'delivered',
      },
    ],
    shipping: { carrier: 'hanjin', trackingNo: '289301774560' },
    payment: {
      total: 62000,
      product: 59000,
      shippingFee: 3000,
      discount: 0,
      point: 0,
      method: '무통장입금',
    },
    receiver: {
      name: '이하윤',
      phone: '010-7719-3308',
      address: '경기도 성남시 분당구 판교역로 235, 에이치스퀘어 N동 802호',
    },
  },
  {
    id: 'o3',
    orderNo: '20260712-0001918',
    channelNo: 'N',
    orderedAt: '2026-07-12 20:15',
    buyer: '박도현',
    buyerType: 'member',
    phone: '010-3355-9182',
    status: 'cancelRequested',
    items: [
      {
        id: 'o3-i1',
        itemNo: '20260712-0001918-01',
        name: '레더 첼시 부츠 (블랙 / 270)',
        image: mockImage('BOOTS', 'dusk'),
        price: 158000,
        listPrice: 198000,
        qty: 1,
        status: 'canceled',
        cancelReason: '취소 사유: 단순 변심 (고객 요청, 2026-07-13 09:20 승인)',
      },
    ],
    shipping: { carrier: null, trackingNo: '', disabled: true },
    payment: {
      total: 0,
      product: 158000,
      shippingFee: 0,
      discount: 0,
      point: 0,
      method: '카카오페이 (취소 완료)',
    },
    receiver: {
      name: '박도현',
      phone: '010-3355-9182',
      address: '부산광역시 해운대구 센텀중앙로 90, 큐비e센텀 1502호',
      memo: '배송 전 연락 부탁드립니다',
    },
  },
  {
    id: 'o4',
    orderNo: '20260712-0001902',
    orderedAt: '2026-07-12 16:33',
    buyer: '최지우',
    buyerType: 'member',
    phone: '010-9028-4471',
    status: 'ready',
    items: [
      {
        id: 'o4-i1',
        itemNo: '20260712-0001902-01',
        name: '와이드 데님 팬츠 (연청 / 28)',
        image: mockImage('DENIM', 'slate'),
        price: 79000,
        qty: 1,
        status: 'confirmed',
      },
      {
        id: 'o4-i2',
        itemNo: '20260712-0001902-02',
        name: '베이직 코튼 니트 (아이보리 / FREE)',
        price: 45000,
        listPrice: 59000,
        qty: 3,
        status: 'confirmed',
      },
    ],
    shipping: { carrier: 'lotte', trackingNo: '' },
    payment: {
      total: 209000,
      product: 214000,
      shippingFee: 0,
      discount: 3000,
      point: 2000,
      method: '네이버페이',
    },
    receiver: {
      name: '최민서',
      phone: '010-4417-2039',
      address: '대전광역시 유성구 대학로 291, KAIST 학생회관 3층',
      memo: '문 앞에 놓아주세요',
    },
  },
  {
    id: 'o5',
    orderNo: '20260711-0001884',
    orderedAt: '2026-07-11 09:08',
    buyer: '정예린',
    buyerType: 'guest',
    phone: '010-6640-1157',
    status: 'preparing',
    items: [
      {
        id: 'o5-i1',
        itemNo: '20260711-0001884-01',
        name: '스웨이드 로퍼 (브라운 / 240)',
        image: mockImage('LOAFER', 'sand'),
        price: 112000,
        qty: 1,
        status: 'confirmed',
      },
    ],
    shipping: { carrier: null, trackingNo: '' },
    payment: {
      total: 115000,
      product: 112000,
      shippingFee: 3000,
      discount: 0,
      point: 0,
      method: '토스페이',
    },
    receiver: {
      name: '정예린',
      phone: '010-6640-1157',
      address: '인천광역시 연수구 송도과학로 32, 송도트리플스트리트 B동 907호',
    },
  },
]

/* ── 데모 래퍼 ───────────────────────────────────────────────────────────
 * OrderList는 상태를 갖지 않는다. 탭·검색어·송장 입력값은 여기서 들고 있다가
 * 실제 서버가 할 필터링까지 대신한다.
 * ──────────────────────────────────────────────────────────────────────── */

/** rows만 데모가 직접 다루고, 나머지 prop은 스토리가 그대로 덮어쓴다 */
type DemoProps = Partial<OrderListProps> & { rows?: OrderRow[] }

function OrderListDemo({ rows = ORDERS, ...overrides }: DemoProps) {
  const [data, setData] = useState<OrderRow[]>(rows)
  const [tab, setTab] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState('')

  // 탭 + 검색어(이름·연락처·주문번호·송장번호) 필터 — 서버 응답을 흉내 낸다
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.filter((row) => {
      if (tab !== 'all' && row.status !== tab) return false
      if (q === '') return true
      return [row.buyer, row.phone, row.orderNo, row.shipping.trackingNo, row.receiver.name].some(
        (field) => field.toLowerCase().includes(q),
      )
    })
  }, [data, tab, query])

  /** 행 하나의 배송 정보만 갈아끼운다 */
  const patchShipping = (target: OrderRow, patch: Partial<OrderRow['shipping']>) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === target.id ? { ...row, shipping: { ...row.shipping, ...patch } } : row,
      ),
    )
  }

  return (
    <OrderList
      rows={visible}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      onTabAdd={(label) => console.log('새 탭', label)}
      keyword={keyword}
      onKeywordChange={setKeyword}
      onSearch={setQuery}
      onFilter={() => console.log('필터')}
      onColumnSettings={() => console.log('표시 항목 설정')}
      onLayoutChange={() => console.log('레이아웃 변경')}
      onExcelDownload={() => console.log('엑셀 다운로드')}
      onBulkTracking={() => console.log('송장 일괄 등록')}
      createMenu={[
        { key: 'manual', label: '수기 주문 생성', icon: <FileText size={14} /> },
        { key: 'phone', label: '전화 주문 생성', icon: <Phone size={14} /> },
        { key: 'offline', label: '오프라인 주문 등록', icon: <Store size={14} /> },
      ]}
      carriers={CARRIERS}
      onCarrierChange={(row, carrier) => patchShipping(row, { carrier })}
      onTrackingNoChange={(row, trackingNo) => patchShipping(row, { trackingNo })}
      onTrackingLookup={(row) => console.log('배송 조회', row.shipping.trackingNo)}
      onOrderOpen={(row) => console.log('주문 상세', row.orderNo)}
      onMemoOpen={(row) => console.log('메모', row.receiver.memo)}
      {...overrides}
    />
  )
}

const meta = {
  title: 'Admin/OrderList',
  component: OrderList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  argTypes: {
    tabs: { control: false },
    createMenu: { control: false },
    carriers: { control: false },
    density: { control: 'select', options: ['compact', 'comfortable'] },

    // ON/OFF — 전부 기본 ON이라 끄는 쪽으로만 의미가 있다
    showHeaderActions: { control: 'boolean' },
    showToolbar: { control: 'boolean' },
    showFilter: { control: 'boolean' },
    showColumnSettings: { control: 'boolean' },

    // 아이콘 슬롯 — 컨트롤로 만질 값이 아니다(스토리로 보여준다)
    layoutIcon: { control: false },
    exportIcon: { control: false },
    bulkTrackingIcon: { control: false },
    createIcon: { control: false },
    filterIcon: { control: false },
    columnSettingsIcon: { control: false },
    trackingIcon: { control: false },

    // 카피
    title: { control: 'text' },
    exportLabel: { control: 'text' },
    createLabel: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    emptyTitle: { control: 'text' },
    emptyDescription: { control: 'text' },
    total: { control: 'number' },
    countUnit: { control: 'text' },
  },
} satisfies Meta<typeof OrderList>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 탭·검색·송장 입력이 모두 살아 있는 주문 목록 */
export const Default: Story = {
  args: { rows: ORDERS },
  render: () => <OrderListDemo />,
}

/** 밀도 comfortable — 행이 여유로워진다(기본은 compact) */
export const Comfortable: Story = {
  args: { rows: ORDERS },
  render: () => <OrderListDemo density="comfortable" />,
}

/** 로딩 — 실제 카드와 같은 5분할 골격이라 자리가 흔들리지 않는다 */
export const Loading: Story = {
  args: { rows: [] },
  render: () => <OrderListDemo loading />,
}

/** 빈 목록 — 검색 결과가 없을 때 */
export const Empty: Story = {
  args: { rows: [] },
  render: () => <OrderListDemo rows={[]} />,
}

/** 최소 — 헤더 액션·툴바를 끈 읽기 전용 목록(대시보드에 끼워 넣을 때) */
export const Minimal: Story = {
  args: { rows: ORDERS },
  render: () => <OrderListDemo showHeaderActions={false} showToolbar={false} />,
}

/** 검색만 — 필터·표시 항목 설정을 끄면 툴바에 검색창만 남는다 */
export const SearchOnlyToolbar: Story = {
  args: { rows: ORDERS },
  render: () => <OrderListDemo showFilter={false} showColumnSettings={false} />,
}

/** 총 건수 — total을 넘기면 툴바 오른쪽에 "N건"이 붙는다(기본은 자리 자체가 없음) */
export const WithTotal: Story = {
  args: { rows: ORDERS },
  render: () => <OrderListDemo total={ORDERS.length} countUnit="건" />,
}

/** 아이콘 교체 — 다른 아이콘 세트를 써도 컴포넌트를 포크하지 않는다 */
export const CustomIcons: Story = {
  args: { rows: ORDERS },
  render: () => (
    <OrderListDemo
      layoutIcon={<LayoutList size={14} />}
      exportIcon={<FileSpreadsheet size={14} />}
      bulkTrackingIcon={<PackagePlus size={14} />}
      createIcon={<ChevronsUpDown size={14} />}
      filterIcon={<SlidersHorizontal size={16} />}
      columnSettingsIcon={<Columns3 size={16} />}
    />
  ),
}

/** 문구 교체 — 같은 목록을 '반품 관리' 화면으로 재사용한다 */
export const CustomCopy: Story = {
  args: { rows: ORDERS },
  render: () => (
    <OrderListDemo
      title="반품 관리"
      createLabel="반품 접수"
      exportLabel="반품 내역 받기"
      searchPlaceholder="주문번호 · 반품번호로 검색"
      total={ORDERS.length}
      countUnit="건"
    />
  ),
}

/** 문구 교체(빈 목록) — 빈 화면 문구도 화면 맥락에 맞춘다 */
export const CustomEmptyCopy: Story = {
  args: { rows: [] },
  render: () => (
    <OrderListDemo
      rows={[]}
      emptyTitle="반품 요청이 없습니다"
      emptyDescription="아직 접수된 반품이 없어요. 기간을 넓혀 다시 조회해 보세요."
    />
  ),
}

/**
 * labels — 화면의 모든 글자를 통로 하나로 갈아끼운다(영문 오버라이드).
 * 품목 상태 배지 · 헤더/툴바 버튼 · 배송 입력 힌트 · 결제 내역 라벨과,
 * 지금까지 이름이 없던 두 버튼(주문번호·수령인 메모)의 스크린리더 이름까지 labels가 소유한다.
 * 금액의 '원'은 문구가 아니라 포맷이라 formatters로 연다.
 */
export const Labels: Story = {
  args: { rows: ORDERS },
  render: () => (
    <OrderListDemo
      total={ORDERS.length}
      countUnit=" orders"
      labels={{
        title: 'Orders',
        itemStatus: { delivered: 'Delivered', canceled: 'Canceled', confirmed: 'Confirmed' },
        header: {
          layout: 'Change layout',
          export: 'Export to Excel',
          bulkTracking: 'Bulk tracking upload',
          create: 'New order',
        },
        toolbar: { filter: 'Filter', columnSettings: 'Column settings' },
        search: { searchPlaceholder: 'Name · ID · phone · order no. · tracking no.' },
        order: {
          guest: 'Guest',
          orderNoAria: (orderNo) => `Open order ${orderNo}`,
        },
        shipping: {
          carrierPlaceholder: 'Pick a carrier',
          trackingPlaceholder: 'Tracking number',
          lookup: 'Track',
        },
        payment: {
          product: 'Items',
          shippingFee: 'Shipping',
          discount: 'Discount',
          point: 'Points',
        },
        receiver: { memoAria: (name) => `Open the note for ${name}` },
        empty: {
          title: 'No orders found',
          description: 'Try changing the search terms or resetting the filters.',
        },
      }}
      // 통화는 labels가 아니라 formatters의 몫이다 — '1,234원' → '$1,234'
      formatters={{ price: (value) => `$${value.toLocaleString('en-US')}` }}
    />
  ),
}
