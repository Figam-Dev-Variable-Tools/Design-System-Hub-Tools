import { useMemo, useState, type ReactNode } from 'react'
import { Download, Upload } from 'lucide-react'
import { mockImage } from '../../shared/mediaMock'
import styles from './ProductListScreen.module.css'
import { AdminListPage, type AdminListPageLabels } from '../AdminListPage/AdminListPage'
import { type AdminColumn, type AdminCellTag } from '../AdminTable/AdminTable'
import { Button } from '../Button/Button'
import { type CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import { CategoryTree, type CategoryNode } from '../CategoryTree/CategoryTree'
import { Dropdown, type DropdownItem } from '../Dropdown/Dropdown'
import type { SelectOption } from '../Select/Select'
import { Tab } from '../Tab/Tab'
import { Tag } from '../Tag/Tag'

/* ────────────────────────────────────────────────────────────────────────────
 * 타입 — ProductList(다른 프리셋)와 겹치지 않게 Product*Screen* 접두를 쓴다
 * ──────────────────────────────────────────────────────────────────────────── */

/** 행 안 인라인 Select로 바꾸는 판매 상태 */
export type ProductScreenStatus = 'onsale' | 'soldout' | 'hidden'

/** 상품명 앞에 붙는 짧은 태그 */
export type ProductScreenTag = 'BEST' | 'SALE' | 'NEW' | 'MD'

export type ProductScreenRow = {
  id: string
  /** 상품 번호 — 콤마 없이 그대로 노출 */
  no: string
  name: string
  /** 자체 상품코드 — 상품명 아래 둘째 줄 */
  code: string
  /** 없으면 공용 Placeholder가 대신 그려진다 */
  thumbnail?: string
  tags?: ProductScreenTag[]
  /** 쇼핑몰 상품 페이지 — 있으면 상품명 뒤에 외부링크 아이콘 */
  href?: string
  price: number
  status: ProductScreenStatus
  stock: number
  category: string
  /** 소속 기획전 — 첫 항목만 태그, 나머지는 '+N' */
  exhibits: string[]
  createdAt: string
  updatedAt: string
}

/** 좌측 패널 상단 탭 — 카테고리 트리 / 기획전 트리 전환 */
export type ProductScreenSideTab = 'category' | 'exhibit'

export type ProductListScreenProps = {
  rows?: ProductScreenRow[]
  /** 좌측 트리 — 사이드 탭이 '카테고리'일 때 */
  categories?: CategoryNode[]
  /** 좌측 트리 — 사이드 탭이 '기획전'일 때 */
  exhibits?: CategoryNode[]
  /** 상태 탭(전체/판매중/품절/숨김) */
  statusTabs?: CategoryTabItem[]
  /** 툴바 검색 유형 */
  searchTypes?: SelectOption[]
  /** [상품 등록 ▾] 드롭다운 항목 */
  createItems?: DropdownItem[]
  loading?: boolean
  /** 전체 건수 기준 페이지 수 — 미지정 시 rows/pageSize로 계산 */
  totalPages?: number
  /** 표 밀도 — compact 44px / comfortable 56px */
  density?: 'compact' | 'comfortable'
  pageSizeOptions?: number[]
  onSearch?: (params: { type: string; keyword: string }) => void
  onExcelDownload?: () => void
  /** 헤더 [상품 일괄 등록 및 수정] */
  onBulkUpload?: () => void
  /** 좌측 트리 '추가' */
  onSideAdd?: (tab: ProductScreenSideTab) => void
  onSideTabChange?: (tab: ProductScreenSideTab) => void
  onCategoryChange?: (key: string) => void
  onStatusTabChange?: (value: string) => void
  /** 상품명 클릭 */
  onRowOpen?: (row: ProductScreenRow) => void
  /** 행 안 인라인 Select로 판매 상태를 바꿨을 때 */
  onStatusChange?: (row: ProductScreenRow, next: ProductScreenStatus) => void
  onRowCopy?: (row: ProductScreenRow) => void
  onRowDelete?: (row: ProductScreenRow) => void
  onBulkDelete?: (ids: string[]) => void
  /** 선택한 상품 일괄 상태 변경 */
  onBulkStatus?: (ids: string[], next: ProductScreenStatus) => void

  // ── ON/OFF ──────────────────────────────────────────────────────────
  // 같은 화면을 팝업 선택기(트리 없음)·임베드 위젯(툴바 없음)으로도 재사용하기 위한 스위치.
  // 전부 기본 true라 아무것도 넘기지 않으면 지금 화면 그대로다.
  /** 좌측 카테고리/기획전 패널 */
  showSide?: boolean
  /** 상태 탭(전체/판매중/품절/숨김) */
  showTabs?: boolean
  /** 검색 툴바 */
  showToolbar?: boolean
  /** 툴바 우측 내보내기 — 다운로드 권한이 없는 역할에서는 끈다 */
  showExport?: boolean

  // ── 아이콘 슬롯 ──────────────────────────────────────────────────────
  /** 헤더 [상품 일괄 등록 및 수정] 앞 아이콘 */
  uploadIcon?: ReactNode
  /** 엑셀 다운로드 버튼 아이콘 */
  exportIcon?: ReactNode
  /** 엑셀 다운로드 버튼 라벨 — 아이콘만 남기면 뜻이 약해져 라벨을 지킨다 */
  exportLabel?: string

  // ── 카피 ────────────────────────────────────────────────────────────
  // 상품이 아닌 품목(자재·도서 …) 화면으로 돌려 쓸 때 문구만 갈아끼운다.
  /** 페이지 타이틀 */
  title?: string
  /** [상품 등록 ▾] 라벨 */
  createLabel?: string
  /** 툴바 검색어 힌트 */
  searchPlaceholder?: string
  /** 표가 비었을 때 */
  emptyText?: string
  /** 툴바 우측 총 건수 단위 */
  countUnit?: string
  /**
   * 표 크롬 문구(선택 바 · 행 케밥 접근성 이름 · 컬럼 피커 · 페이지 크기 · 순서 이동 안내 …) —
   * 셸(AdminListPage)을 지나 AdminTable로 그대로 흘러간다. 타입은 셸의 것을 그대로 쓴다(재정의 금지).
   * 이 화면의 나머지 카피는 아직 개별 prop(title·createLabel·emptyText …)이 통로라 여기엔 table만 있다.
   */
  labels?: Pick<AdminListPageLabels, 'table'>
}

/* ────────────────────────────────────────────────────────────────────────────
 * 목데이터 — 레퍼런스(DJ/음향기기 쇼핑몰) 기준
 * ──────────────────────────────────────────────────────────────────────────── */

export const PRODUCT_STATUS_OPTIONS: SelectOption[] = [
  { label: '판매중', value: 'onsale' },
  { label: '품절', value: 'soldout' },
  { label: '숨김', value: 'hidden' },
]

export const PRODUCT_SEARCH_TYPES: SelectOption[] = [
  { label: '기본', value: 'all' },
  { label: '상품명', value: 'name' },
  { label: '재고번호', value: 'no' },
  { label: '자체코드', value: 'code' },
]

export const PRODUCT_STATUS_TABS: CategoryTabItem[] = [
  { label: '전체', value: 'all', count: 144, fixed: true },
  { label: '판매중', value: 'onsale', count: 110, fixed: true },
  { label: '품절', value: 'soldout', count: 12, fixed: true },
  { label: '숨김', value: 'hidden', count: 22, fixed: true },
]

export const PRODUCT_CATEGORY_NODES: CategoryNode[] = [
  { key: 'all', label: '전체 카테고리', count: 144 },
  { key: 'player', label: '플레이어', count: 26 },
  { key: 'turntable', label: '턴테이블', count: 18 },
  { key: 'mixer', label: '믹서', count: 21 },
  { key: 'controller', label: '컨트롤러', count: 24 },
  { key: 'allinone', label: '올인원 시스템', count: 12 },
  {
    key: 'headphone',
    label: '헤드폰',
    count: 27,
    children: [
      { key: 'hp-pioneer', label: '파이오니어', count: 9 },
      { key: 'hp-sennheiser', label: '젠하이저', count: 7 },
      { key: 'hp-akg', label: 'AKG', count: 6 },
      { key: 'hp-audiotechnica', label: '오디오테크니카', count: 5 },
    ],
  },
  {
    key: 'monitor',
    label: '모니터 스피커',
    count: 16,
    children: [
      { key: 'sp-dm', label: 'DM 시리즈', count: 6 },
      { key: 'sp-vm', label: 'VM 시리즈', count: 5 },
      { key: 'sp-rp', label: 'RP 시리즈', count: 5 },
    ],
  },
]

export const PRODUCT_EXHIBIT_NODES: CategoryNode[] = [
  { key: 'ex-all', label: '전체 기획전', count: 8 },
  { key: 'ex-newyear', label: '신년 세일', count: 24 },
  { key: 'ex-beginner', label: '입문자 패키지', count: 12 },
  { key: 'ex-clearance', label: '재고 정리', count: 9 },
  { key: 'ex-premium', label: '프리미엄 라인업', count: 6 },
]

export const PRODUCT_CREATE_ITEMS: DropdownItem[] = [
  { label: '단일 상품 등록' },
  { label: '세트 상품 등록' },
  { label: '엑셀로 등록' },
]

export const PRODUCT_ROWS: ProductScreenRow[] = [
  {
    id: 'p1',
    no: '1024930',
    name: 'Pioneer DJ CDJ-3000 멀티 플레이어',
    code: 'PIO-CDJ3000',
    thumbnail: mockImage('CDJ', 'slate'),
    tags: ['BEST', 'MD'],
    href: 'https://example.com/product/1024930',
    price: 3190000,
    status: 'onsale',
    stock: 12,
    category: '플레이어',
    exhibits: ['프리미엄 라인업', '신년 세일'],
    createdAt: '2025-11-02',
    updatedAt: '2026-07-08',
  },
  {
    id: 'p2',
    no: '1024917',
    name: 'Technics SL-1200MK7 다이렉트 드라이브 턴테이블',
    code: 'TEC-SL1200',
    thumbnail: mockImage('TT', 'sand'),
    tags: ['BEST'],
    href: 'https://example.com/product/1024917',
    price: 1490000,
    status: 'onsale',
    stock: 5,
    category: '턴테이블',
    exhibits: ['신년 세일'],
    createdAt: '2025-10-21',
    updatedAt: '2026-07-02',
  },
  {
    id: 'p3',
    no: '1024902',
    name: 'Pioneer DJ DJM-A9 4채널 클럽 믹서',
    code: 'PIO-DJMA9',
    thumbnail: mockImage('MIX', 'dusk'),
    tags: ['NEW'],
    href: 'https://example.com/product/1024902',
    price: 3490000,
    status: 'onsale',
    stock: 3,
    category: '믹서',
    exhibits: ['프리미엄 라인업'],
    createdAt: '2026-01-09',
    updatedAt: '2026-06-28',
  },
  {
    id: 'p4',
    no: '1024886',
    name: 'Rane Seventy-Two MKII 배틀 믹서',
    code: 'RAN-72MK2',
    thumbnail: mockImage('MIX', 'sage'),
    price: 2290000,
    status: 'soldout',
    stock: 0,
    category: '믹서',
    exhibits: [],
    createdAt: '2025-08-14',
    updatedAt: '2026-05-30',
  },
  {
    id: 'p5',
    no: '1024871',
    name: 'Native Instruments Traktor Kontrol S4 MK3 컨트롤러',
    code: 'NI-S4MK3',
    thumbnail: mockImage('CTRL', 'slate'),
    tags: ['SALE'],
    href: 'https://example.com/product/1024871',
    price: 1090000,
    status: 'onsale',
    stock: 18,
    category: '컨트롤러',
    exhibits: ['입문자 패키지', '신년 세일', '재고 정리'],
    createdAt: '2025-06-30',
    updatedAt: '2026-07-11',
  },
  {
    id: 'p6',
    no: '1024860',
    name: 'Pioneer DJ DDJ-FLX4 입문용 컨트롤러',
    code: 'PIO-FLX4',
    thumbnail: mockImage('CTRL', 'sand'),
    tags: ['BEST', 'SALE'],
    href: 'https://example.com/product/1024860',
    price: 379000,
    status: 'onsale',
    stock: 64,
    category: '컨트롤러',
    exhibits: ['입문자 패키지'],
    createdAt: '2025-05-12',
    updatedAt: '2026-07-12',
  },
  {
    id: 'p7',
    no: '1024854',
    name: 'Denon DJ PRIME 4+ 올인원 시스템',
    code: 'DEN-PRIME4P',
    thumbnail: mockImage('AIO', 'dusk'),
    price: 2590000,
    status: 'hidden',
    stock: 2,
    category: '올인원 시스템',
    exhibits: ['프리미엄 라인업'],
    createdAt: '2025-03-27',
    updatedAt: '2026-04-19',
  },
  {
    id: 'p8',
    no: '1024841',
    name: 'Pioneer DJ HDJ-X10 프로페셔널 헤드폰',
    code: 'PIO-HDJX10',
    thumbnail: mockImage('HP', 'sage'),
    tags: ['MD'],
    href: 'https://example.com/product/1024841',
    price: 419000,
    status: 'onsale',
    stock: 31,
    category: '헤드폰',
    exhibits: ['신년 세일'],
    createdAt: '2025-02-18',
    updatedAt: '2026-06-11',
  },
  {
    id: 'p9',
    no: '1024830',
    name: 'Sennheiser HD 25 모니터링 헤드폰',
    code: 'SEN-HD25',
    thumbnail: mockImage('HP', 'slate'),
    tags: ['BEST'],
    price: 219000,
    status: 'soldout',
    stock: 0,
    category: '헤드폰',
    exhibits: ['재고 정리', '입문자 패키지'],
    createdAt: '2024-12-05',
    updatedAt: '2026-06-03',
  },
  {
    id: 'p10',
    no: '1024822',
    name: 'KRK Rokit RP7 G4 모니터 스피커 (1조)',
    code: 'KRK-RP7G4',
    thumbnail: mockImage('SPK', 'sand'),
    tags: ['NEW', 'SALE'],
    href: 'https://example.com/product/1024822',
    price: 549000,
    status: 'onsale',
    stock: 9,
    category: '모니터 스피커',
    exhibits: ['신년 세일'],
    createdAt: '2024-11-22',
    updatedAt: '2026-05-27',
  },
  {
    id: 'p11',
    no: '1024815',
    name: 'Pioneer DJ CDJ-2000NXS2 멀티 플레이어',
    code: 'PIO-CDJ2000',
    thumbnail: mockImage('CDJ', 'dusk'),
    price: 2390000,
    status: 'onsale',
    stock: 7,
    category: '플레이어',
    exhibits: ['재고 정리'],
    createdAt: '2024-10-08',
    updatedAt: '2026-03-16',
  },
  {
    id: 'p12',
    no: '1024803',
    name: 'Denon DJ SC6000 프라임 미디어 플레이어',
    code: 'DEN-SC6000',
    thumbnail: mockImage('CDJ', 'sage'),
    tags: ['NEW'],
    href: 'https://example.com/product/1024803',
    price: 1890000,
    status: 'onsale',
    stock: 11,
    category: '플레이어',
    exhibits: [],
    createdAt: '2024-09-19',
    updatedAt: '2026-02-24',
  },
  {
    id: 'p13',
    no: '1024790',
    name: 'Reloop RP-8000 MK2 하이브리드 턴테이블',
    code: 'REL-RP8000',
    thumbnail: mockImage('TT', 'slate'),
    price: 1090000,
    status: 'onsale',
    stock: 6,
    category: '턴테이블',
    exhibits: ['입문자 패키지'],
    createdAt: '2024-08-30',
    updatedAt: '2026-01-30',
  },
  {
    id: 'p14',
    no: '1024782',
    name: 'Audio-Technica AT-LP140XP 턴테이블',
    code: 'ATH-LP140XP',
    thumbnail: mockImage('TT', 'dusk'),
    tags: ['SALE'],
    price: 549000,
    status: 'soldout',
    stock: 0,
    category: '턴테이블',
    exhibits: ['재고 정리'],
    createdAt: '2024-07-11',
    updatedAt: '2025-12-18',
  },
  {
    id: 'p15',
    no: '1024774',
    name: 'Allen & Heath Xone:96 아날로그 믹서',
    code: 'AH-XONE96',
    thumbnail: mockImage('MIX', 'sand'),
    tags: ['MD'],
    href: 'https://example.com/product/1024774',
    price: 2790000,
    status: 'onsale',
    stock: 4,
    category: '믹서',
    exhibits: ['프리미엄 라인업'],
    createdAt: '2024-06-25',
    updatedAt: '2025-11-29',
  },
  {
    id: 'p16',
    no: '1024761',
    name: 'Pioneer DJ DJM-450 2채널 믹서',
    code: 'PIO-DJM450',
    thumbnail: mockImage('MIX', 'slate'),
    price: 899000,
    status: 'hidden',
    stock: 14,
    category: '믹서',
    exhibits: [],
    createdAt: '2024-05-14',
    updatedAt: '2025-10-22',
  },
  {
    id: 'p17',
    no: '1024750',
    name: 'Roland DJ-707M 모바일 DJ 컨트롤러',
    code: 'ROL-DJ707M',
    thumbnail: mockImage('CTRL', 'sage'),
    price: 1290000,
    status: 'onsale',
    stock: 8,
    category: '컨트롤러',
    exhibits: ['신년 세일'],
    createdAt: '2024-04-02',
    updatedAt: '2025-09-15',
  },
  {
    id: 'p18',
    no: '1024742',
    name: 'Numark Mixtrack Platinum FX 컨트롤러',
    code: 'NUM-MTPFX',
    thumbnail: mockImage('CTRL', 'dusk'),
    tags: ['BEST'],
    href: 'https://example.com/product/1024742',
    price: 429000,
    status: 'onsale',
    stock: 42,
    category: '컨트롤러',
    exhibits: ['입문자 패키지', '신년 세일'],
    createdAt: '2024-03-21',
    updatedAt: '2025-08-27',
  },
  {
    id: 'p19',
    no: '1024731',
    name: 'Pioneer DJ XDJ-RX3 올인원 시스템',
    code: 'PIO-XDJRX3',
    thumbnail: mockImage('AIO', 'slate'),
    tags: ['BEST', 'MD'],
    href: 'https://example.com/product/1024731',
    price: 2790000,
    status: 'onsale',
    stock: 5,
    category: '올인원 시스템',
    exhibits: ['프리미엄 라인업', '신년 세일'],
    createdAt: '2024-02-09',
    updatedAt: '2025-07-30',
  },
  {
    id: 'p20',
    no: '1024720',
    name: 'Denon DJ PRIME GO 배터리 올인원',
    code: 'DEN-PRIMEGO',
    thumbnail: mockImage('AIO', 'sand'),
    price: 1390000,
    status: 'soldout',
    stock: 0,
    category: '올인원 시스템',
    exhibits: ['재고 정리'],
    createdAt: '2023-12-27',
    updatedAt: '2025-06-18',
  },
  {
    id: 'p21',
    no: '1024714',
    name: 'AKG K371 스튜디오 모니터링 헤드폰',
    code: 'AKG-K371',
    thumbnail: mockImage('HP', 'dusk'),
    tags: ['SALE'],
    price: 189000,
    status: 'onsale',
    stock: 23,
    category: '헤드폰',
    exhibits: ['재고 정리'],
    createdAt: '2023-11-16',
    updatedAt: '2025-05-09',
  },
  {
    id: 'p22',
    no: '1024702',
    name: 'Audio-Technica ATH-M50x 모니터링 헤드폰',
    code: 'ATH-M50X',
    thumbnail: mockImage('HP', 'sand'),
    tags: ['BEST', 'SALE'],
    href: 'https://example.com/product/1024702',
    price: 229000,
    status: 'onsale',
    stock: 37,
    category: '헤드폰',
    exhibits: ['입문자 패키지', '신년 세일', '재고 정리'],
    createdAt: '2023-10-05',
    updatedAt: '2025-04-21',
  },
  {
    id: 'p23',
    no: '1024690',
    name: 'Yamaha HS8 모니터 스피커 (1통)',
    code: 'YAM-HS8',
    thumbnail: mockImage('SPK', 'sage'),
    tags: ['MD'],
    price: 389000,
    status: 'onsale',
    stock: 16,
    category: '모니터 스피커',
    exhibits: ['프리미엄 라인업'],
    createdAt: '2023-09-12',
    updatedAt: '2025-03-14',
  },
  {
    id: 'p24',
    no: '1024683',
    name: 'Adam Audio T5V 모니터 스피커 (1조)',
    code: 'ADA-T5V',
    thumbnail: mockImage('SPK', 'dusk'),
    price: 459000,
    status: 'hidden',
    stock: 3,
    category: '모니터 스피커',
    exhibits: [],
    createdAt: '2023-08-01',
    updatedAt: '2025-02-06',
  },
]

/* ────────────────────────────────────────────────────────────────────────────
 * 화면
 * ──────────────────────────────────────────────────────────────────────────── */

const SIDE_TABS = [
  { value: 'category', label: '카테고리' },
  { value: 'exhibit', label: '기획전' },
]

/** 선택 노드 → 루트까지의 라벨(자신 먼저). 트리 선택을 행 값과 맞추는 데 쓴다 */
function labelTrail(nodes: CategoryNode[], target: string, trail: string[] = []): string[] | null {
  for (const node of nodes) {
    const here = [node.label, ...trail]
    if (node.key === target) return here
    const found = node.children ? labelTrail(node.children, target, here) : null
    if (found) return found
  }
  return null
}

/**
 * 트리에서 고른 항목에 대응하는 필터 라벨.
 * 잎(브랜드/시리즈)을 골랐는데 그 라벨을 가진 행이 없으면 조상으로 거슬러 올라간다
 * — 상품이 상위 카테고리(헤드폰)만 들고 있어도 하위(파이오니어) 선택이 빈 화면이 되지 않게.
 */
function matchLabel(nodes: CategoryNode[], key: string, known: Set<string>): string | null {
  return labelTrail(nodes, key)?.find((label) => known.has(label)) ?? null
}

/** 상품명 태그 라벨 → 배지 톤 */
const TAG_TONE: Record<ProductScreenTag, AdminCellTag['tone']> = {
  BEST: 'primary',
  SALE: 'error',
  NEW: 'success',
  MD: 'warning',
}

/**
 * 상품 목록 화면 — 레퍼런스(카페24 상품) 밀도형.
 *
 * 골격(헤더·탭·좌측 레일·툴바·표·페이징·선택·일괄 처리)은 AdminListPage가 잡고,
 * 이 컴포넌트는 슬롯을 채우기만 한다.
 *   header  : 타이틀 + [상품 일괄 등록 및 수정] [상품 등록 ▾]
 *   tabs    : CategoryTabs(전체/판매중/품절/숨김)
 *   side    : CategoryTree(카테고리·기획전 탭 + 추가)
 *   toolbar : ListToolbar(검색 유형 Select + 검색어 + 총 건수) + [검색] + [엑셀 다운로드]
 *   content : AdminTable(썸네일·태그·인라인 상태 Select·케밥)
 *
 * 데이터는 모두 props다. 필터(트리·상태 탭·확정된 검색어)는 이 화면이 rows를 직접 좁혀
 * 셸에 넘긴다 — 검색은 [검색]/Enter로 확정할 때만 반영되어야 하고(입력 중에 표가 흔들리지 않게),
 * 좌측 트리는 셸이 모르는 축이기 때문이다.
 */
export function ProductListScreen({
  rows = PRODUCT_ROWS,
  categories = PRODUCT_CATEGORY_NODES,
  exhibits = PRODUCT_EXHIBIT_NODES,
  statusTabs = PRODUCT_STATUS_TABS,
  searchTypes = PRODUCT_SEARCH_TYPES,
  createItems = PRODUCT_CREATE_ITEMS,
  loading = false,
  totalPages,
  density = 'compact',
  pageSizeOptions = [20, 50, 100],
  onSearch,
  onExcelDownload,
  onBulkUpload,
  onSideAdd,
  onSideTabChange,
  onCategoryChange,
  onStatusTabChange,
  onRowOpen,
  onStatusChange,
  onRowCopy,
  onRowDelete,
  onBulkDelete,
  onBulkStatus,
  showSide = true,
  showTabs = true,
  showToolbar = true,
  showExport = true,
  uploadIcon,
  exportIcon,
  exportLabel = '엑셀 다운로드',
  title = '상품',
  createLabel = '상품 등록',
  searchPlaceholder = '상품명 · 재고번호 · 자체코드',
  emptyText = '조건에 맞는 상품이 없습니다.',
  countUnit = '건',
  labels,
}: ProductListScreenProps) {
  const [sideTab, setSideTab] = useState<ProductScreenSideTab>('category')
  const [categoryKey, setCategoryKey] = useState('all')
  const [exhibitKey, setExhibitKey] = useState('ex-all')
  const [statusTab, setStatusTab] = useState('all')
  const [searchType, setSearchType] = useState('all')
  const [keyword, setKeyword] = useState('')
  // 확정된 검색 조건 — [검색]/Enter로만 갱신된다(입력 중에 표가 흔들리지 않게)
  const [query, setQuery] = useState({ type: 'all', keyword: '' })
  // 페이지·선택은 [검색] 버튼도 되돌려야 해서(셸을 거치지 않는 경로다) 이 화면이 제어값으로 들고 있는다
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] ?? 20)

  const isCategoryTab = sideTab === 'category'
  const treeNodes = isCategoryTab ? categories : exhibits
  const treeValue = isCategoryTab ? categoryKey : exhibitKey

  // 상태 탭 · 좌측 트리 · 검색어로 걸러낸다(ProductList와 같은 클라이언트 필터 규약)
  const filtered = useMemo(() => {
    // 보이지 않는 탭의 선택이 몰래 걸리지 않게, 지금 열린 트리의 필터만 적용한다
    const categoryLabel = isCategoryTab
      ? matchLabel(categories, categoryKey, new Set(rows.map((row) => row.category)))
      : null
    const exhibitLabel = isCategoryTab
      ? null
      : matchLabel(exhibits, exhibitKey, new Set(rows.flatMap((row) => row.exhibits)))
    const needle = query.keyword.trim().toLowerCase()

    return rows.filter((row) => {
      if (statusTab !== 'all' && row.status !== statusTab) return false
      if (categoryLabel != null && row.category !== categoryLabel) return false
      if (exhibitLabel != null && !row.exhibits.includes(exhibitLabel)) return false
      if (needle === '') return true

      const haystack =
        query.type === 'name'
          ? [row.name]
          : query.type === 'no'
            ? [row.no]
            : query.type === 'code'
              ? [row.code]
              : [row.name, row.no, row.code]
      return haystack.some((field) => field.toLowerCase().includes(needle))
    })
  }, [rows, categories, exhibits, categoryKey, exhibitKey, isCategoryTab, statusTab, query])

  // 페이징(자르기·클램프)은 셸이 한다 — totalPages를 넘기면 서버가 이미 자른 것으로 보고 그대로 그린다
  const columns = useMemo<AdminColumn<ProductScreenRow>[]>(
    () => [
      { kind: 'select', key: 'select' },
      {
        kind: 'number',
        key: 'no',
        header: '상품 번호',
        align: 'center',
        value: (row) => row.no,
        // 상품 번호는 수량이 아니다 — 천단위 콤마 없이 그대로 찍는다
        render: (row) => <span className={styles.no}>{row.no}</span>,
      },
      {
        kind: 'thumbTitle',
        key: 'name',
        header: '상품명',
        ratio: 3,
        thumb: (row) => row.thumbnail,
        subValue: (row) => row.code,
        tags: (row) => (row.tags ?? []).map((tag) => ({ label: tag, tone: TAG_TONE[tag] })),
        externalHref: (row) => row.href,
        onClick: (row) => onRowOpen?.(row),
      },
      { kind: 'price', key: 'price', header: '판매가', sortable: true },
      {
        kind: 'selectCell',
        key: 'status',
        header: '상태',
        options: PRODUCT_STATUS_OPTIONS,
        value: (row) => row.status,
        onCellChange: (row, next) => onStatusChange?.(row, next as ProductScreenStatus),
      },
      {
        kind: 'number',
        key: 'stock',
        header: '재고',
        align: 'right',
        sortable: true,
        // 재고 0은 error 톤 배지로 조용히 튄다
        tone: () => 'error',
      },
      { kind: 'category', key: 'category', header: '카테고리' },
      {
        kind: 'category',
        key: 'exhibits',
        header: '기획전',
        // CSV/Excel에는 전체 목록이 나가고, 화면에는 첫 개 + '+N'만 보인다
        value: (row) => row.exhibits.join(', '),
        render: (row) =>
          row.exhibits.length === 0 ? (
            <span className={styles.empty} aria-label="기획전 없음">
              -
            </span>
          ) : (
            <span className={styles.exhibits}>
              <Tag label={row.exhibits[0]} size="sm" />
              {row.exhibits.length > 1 && (
                <span
                  className={styles.more}
                  title={row.exhibits.slice(1).join(', ')}
                >{`+${row.exhibits.length - 1}`}</span>
              )}
            </span>
          ),
      },
      { kind: 'date', key: 'createdAt', header: '등록일', sortable: true },
      { kind: 'date', key: 'updatedAt', header: '수정일', sortable: true },
      {
        kind: 'kebab',
        key: 'kebab',
        menu: (row) => [
          { key: 'open', label: '상품 수정', onSelect: () => onRowOpen?.(row) },
          { key: 'copy', label: '복사하여 등록', onSelect: () => onRowCopy?.(row) },
          {
            key: 'delete',
            label: '삭제',
            tone: 'error',
            divider: true,
            onSelect: () => onRowDelete?.(row),
          },
        ],
      },
    ],
    [onRowOpen, onStatusChange, onRowCopy, onRowDelete],
  )

  /** 확정 검색 — 조건을 굳히고 밖에 알린다. Enter는 셸이, [검색] 버튼은 아래 search()가 부른다 */
  const runSearch = (next: string) => {
    setQuery({ type: searchType, keyword: next })
    onSearch?.({ type: searchType, keyword: next })
  }

  /** [검색] 버튼 — 셸을 거치지 않는 경로라 페이지·선택을 엔터와 같은 자리로 직접 되돌린다 */
  const search = () => {
    setPage(1)
    setSelectedIds([])
    runSearch(keyword)
  }

  const changeSideTab = (next: ProductScreenSideTab) => {
    setSideTab(next)
    // 필터 축이 바뀌므로 첫 페이지부터 다시 본다
    setPage(1)
    onSideTabChange?.(next)
  }

  const changeTree = (key: string) => {
    if (isCategoryTab) setCategoryKey(key)
    else setExhibitKey(key)
    setPage(1)
    onCategoryChange?.(key)
  }

  // 상태 탭의 페이지·선택 되돌리기는 셸이 한다 — 여기서는 값만 갱신하고 밖에 알린다
  const changeStatusTab = (next: string) => {
    setStatusTab(next)
    onStatusTabChange?.(next)
  }

  return (
    <AdminListPage
      rows={filtered}
      columns={columns}
      rowKey={(row) => row.id}
      // 서버 페이징이면 rows는 이미 한 페이지다 — 셸이 또 자르지 않는다
      totalPages={totalPages}
      loading={loading}
      density={density}
      title={title}
      headerActions={
        <>
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label="상품 일괄 등록 및 수정"
            showLeftIcon
            leftIcon={uploadIcon ?? <Upload size={16} />}
            onClick={onBulkUpload}
          />
          <Dropdown label={createLabel} items={createItems} align="end" />
        </>
      }
      tabs={statusTabs}
      tab={statusTab}
      onTabChange={changeStatusTab}
      side={
        showSide ? (
          <CategoryTree
            nodes={treeNodes}
            value={treeValue}
            onChange={changeTree}
            onAdd={() => onSideAdd?.(sideTab)}
            maxHeight={520}
            tabs={
              <Tab
                items={SIDE_TABS}
                value={sideTab}
                onChange={(next) => changeSideTab(next as ProductScreenSideTab)}
                variant="underline"
                size="sm"
              />
            }
          />
        ) : undefined
      }
      // 한 줄 검색 — 엔터 = [검색] 버튼과 같은 동작(셸이 SearchField의 onSearch를 넘겨준다)
      search="inline"
      keyword={keyword}
      onKeywordChange={setKeyword}
      onSearch={(values) => runSearch(String(values.keyword ?? ''))}
      searchPlaceholder={searchPlaceholder}
      toolbarSelects={[
        {
          key: 'searchType',
          value: searchType,
          options: searchTypes,
          onChange: setSearchType,
          width: 160,
        },
      ]}
      totalUnit={countUnit}
      toolbarActions={
        <>
          <Button variant="primary" size="md" label="검색" onClick={search} />
          {/* 엑셀 다운로드 — 라벨이 보이는 버튼이었다. 아이콘만 남기면 뜻이 약해지므로
              공용 Button + Download 아이콘으로 라벨을 지킨다. */}
          {showExport && (
            <Button
              variant="secondary"
              appearance="outline"
              size="md"
              label={exportLabel}
              showLeftIcon
              leftIcon={exportIcon ?? <Download size={14} aria-hidden="true" />}
              onClick={() => onExcelDownload?.()}
            />
          )}
        </>
      }
      selectedIds={selectedIds}
      onSelectChange={setSelectedIds}
      bulkActions={[
        {
          key: 'onsale',
          label: '판매중으로 변경',
          tone: 'primary',
          onAction: (ids) => onBulkStatus?.(ids, 'onsale'),
        },
        {
          key: 'hidden',
          label: '숨김으로 변경',
          tone: 'secondary',
          onAction: (ids) => onBulkStatus?.(ids, 'hidden'),
        },
      ]}
      // 상태 변경은 선택을 유지하고(연달아 바꾼다), 삭제만 선택을 비운다 — 아래 onBulkDelete가 직접 한다
      clearSelectionOnBulk={false}
      onBulkDelete={(ids) => {
        onBulkDelete?.(ids)
        setSelectedIds([])
      }}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      pageSizeOptions={pageSizeOptions}
      columnPicker
      // 내보내기는 표 우상단이 아니라 툴바의 [엑셀 다운로드] 버튼이 갖는다
      exportable={false}
      emptyText={emptyText}
      // 표 크롬 문구는 셸이 AdminTable로 그대로 통과시킨다 — 넘기지 않으면 undefined라 기본값이 그대로 산다
      labels={labels}
      show={{ tabs: showTabs, toolbar: showToolbar }}
    />
  )
}
