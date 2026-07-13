import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Ban,
  Copy,
  Eye,
  EyeOff,
  FileDown,
  PencilRuler,
  Plus,
  Sheet,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { AdminTable, type AdminColumn, type AdminColumnTone, type AdminTableProps } from './AdminTable'
import {
  PRODUCT_COLUMNS,
  PRODUCT_EMPTY_TEXT,
  buildProductColumns,
  type ProductBoardRow,
} from './presets'
import { Button } from '../Button/Button'
import { CrudDialog } from '../CrudDialog/CrudDialog'
import { FilterBar } from '../FilterBar/FilterBar'
import { TextField } from '../TextField/TextField'

// 어떤 도메인이든 컬럼 조합만 바꾸면 된다는 걸 보이기 위한 '게시판' 목데이터
type Post = {
  id: string
  thumbnail?: string
  title: string
  type: '공지' | '이벤트' | '일반'
  category: string
  author: string
  createdAt: string
  editor: string
  updatedAt: string
  published: boolean
}

// 외부 요청 없이 인라인 SVG data URI로 썸네일 생성
function thumb(hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="hsl(${hue} 55% 90%)"/><circle cx="24" cy="19" r="8" fill="hsl(${hue} 50% 65%)"/><rect x="8" y="31" width="32" height="9" rx="4" fill="hsl(${hue} 50% 74%)"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const TYPES: Post['type'][] = ['공지', '이벤트', '일반']
const CATEGORIES = ['운영', '마케팅', '고객지원', '개발']
const AUTHORS = ['홍성보', '김서연', '이준호', '박지민', '최수아']

const POSTS: Post[] = Array.from({ length: 20 }, (_, i) => ({
  id: `n${String(i + 1).padStart(2, '0')}`,
  thumbnail: i % 3 === 0 ? undefined : thumb((i * 37) % 360),
  title: `${TYPES[i % 3]} 게시글 제목 ${i + 1} — 컬럼 조합 데모`,
  type: TYPES[i % 3],
  category: CATEGORIES[i % 4],
  author: AUTHORS[i % 5],
  createdAt: `2026-0${(i % 6) + 1}-1${i % 9}`,
  editor: AUTHORS[(i + 2) % 5],
  updatedAt: `2026-0${(i % 6) + 2}-2${i % 8}`,
  published: i % 4 !== 0,
}))

// Type 배지 톤 — 공지=primary, 이벤트=warning, 일반=secondary
const typeTone = (row: Post): AdminColumnTone =>
  row.type === '공지' ? 'primary' : row.type === '이벤트' ? 'warning' : 'secondary'

// 1. Default — 순번·Title·카테고리·상태·등록일자·관리
const DEFAULT_COLUMNS: AdminColumn<Post>[] = [
  { kind: 'index', key: 'index' },
  { kind: 'title', key: 'title', header: '제목', sortable: true },
  { kind: 'category', key: 'category', header: '카테고리' },
  { kind: 'status', key: 'published', header: '노출' },
  { kind: 'date', key: 'createdAt', header: '등록일자', sortable: true },
  { kind: 'actions', key: 'actions', header: '관리' },
]

// 2. FullMeta — 컬럼 11개. 고정폭 합이 커져도 title/type/category가 비율대로 남는다
const FULL_META_COLUMNS: AdminColumn<Post>[] = [
  { kind: 'select', key: 'select' },
  { kind: 'index', key: 'index' },
  { kind: 'title', key: 'title', header: '제목', sortable: true },
  { kind: 'type', key: 'type', header: 'Type', tone: typeTone },
  { kind: 'category', key: 'category', header: '카테고리' },
  { kind: 'user', key: 'author', header: '등록자' },
  { kind: 'date', key: 'createdAt', header: '등록일자', sortable: true },
  { kind: 'user', key: 'editor', header: '수정자' },
  { kind: 'date', key: 'updatedAt', header: '수정일자', sortable: true },
  { kind: 'status', key: 'published', header: '노출' },
  { kind: 'actions', key: 'actions', header: '관리' },
]

// 3. Minimal — 3컬럼. title이 남는 공간을 전부 가져간다
const MINIMAL_COLUMNS: AdminColumn<Post>[] = [
  { kind: 'title', key: 'title', header: '제목' },
  { kind: 'status', key: 'published', header: '노출' },
  { kind: 'actions', key: 'actions', header: '관리' },
]

// 4. Dense — 썸네일·Type·수량까지 포함한 조밀한 목록
const DENSE_COLUMNS: AdminColumn<Post>[] = [
  { kind: 'select', key: 'select' },
  { kind: 'index', key: 'index' },
  { kind: 'thumbnail', key: 'thumbnail', header: '이미지' },
  { kind: 'title', key: 'title', header: '제목', sortable: true },
  { kind: 'type', key: 'type', header: 'Type', tone: typeTone },
  { kind: 'user', key: 'author', header: '등록자' },
  { kind: 'date', key: 'updatedAt', header: '수정일자', sortable: true },
  { kind: 'status', key: 'published', header: '노출' },
  { kind: 'actions', key: 'actions', header: '관리' },
]

// 5. Pinned — 좌: 선택·순번·제목 / 우: 노출·관리. 가운데 메타 컬럼들이 스크롤된다
const PINNED_COLUMNS: AdminColumn<Post>[] = [
  { kind: 'select', key: 'select', pinned: 'left' },
  { kind: 'index', key: 'index', pinned: 'left' },
  { kind: 'title', key: 'title', header: '제목', sortable: true, pinned: 'left' },
  { kind: 'type', key: 'type', header: 'Type', tone: typeTone },
  { kind: 'category', key: 'category', header: '카테고리' },
  { kind: 'user', key: 'author', header: '등록자' },
  { kind: 'date', key: 'createdAt', header: '등록일자', sortable: true },
  { kind: 'user', key: 'editor', header: '수정자' },
  { kind: 'date', key: 'updatedAt', header: '수정일자', sortable: true },
  { kind: 'status', key: 'published', header: '노출', pinned: 'right' },
  { kind: 'actions', key: 'actions', header: '관리', pinned: 'right' },
]

// 제네릭 고정 — Storybook 타입 추론용
const PostTable = AdminTable<Post>

/** 선택/상태 토글/일괄삭제/페이지네이션이 실제로 동작하는 데모 래퍼 */
function AdminTableDemo({
  pageSize = 6,
  pageSizeControl = false,
  ...props
}: AdminTableProps<Post> & { pageSizeControl?: boolean }) {
  const [rows, setRows] = useState<Post[]>(props.rows)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(pageSize)
  // 컬럼 피커를 제어 방식으로 쓰는 예 — 넘기지 않으면 AdminTable이 내부 상태로 관리한다
  const [visibility, setVisibility] = useState<Record<string, boolean>>({})

  const totalPages = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(page, totalPages)
  const pageRows = rows.slice((current - 1) * size, current * size)

  return (
    <PostTable
      {...props}
      rows={pageRows}
      rowKey={(row) => row.id}
      selectedIds={selectedIds}
      onSelectChange={setSelectedIds}
      onToggleStatus={(row, next) =>
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, published: next } : r)))
      }
      onBulkDelete={(ids) => {
        setRows((prev) => prev.filter((r) => !ids.includes(r.id)))
        setSelectedIds([])
      }}
      onEdit={() => {}}
      onDelete={(row) => setRows((prev) => prev.filter((r) => r.id !== row.id))}
      page={current}
      totalPages={totalPages}
      onPageChange={setPage}
      columnVisibility={visibility}
      onColumnVisibilityChange={setVisibility}
      pageSize={size}
      onPageSizeChange={
        pageSizeControl
          ? (next) => {
              setSize(next)
              setPage(1)
            }
          : undefined
      }
    />
  )
}

const meta = {
  title: 'Admin/AdminTable',
  component: PostTable,
  tags: ['autodocs'],
  args: {
    columns: DEFAULT_COLUMNS,
    rows: POSTS.slice(0, 12),
    rowKey: (row: Post) => row.id,
    loading: false,
    density: 'comfortable',
    emptyText: '데이터가 없습니다.',
  },
  argTypes: {
    columns: { control: false },
    rows: { control: false },
    rowKey: { control: false },
    selectedIds: { control: false },
    onSelectChange: { control: false },
    onToggleStatus: { control: false },
    onEdit: { control: false },
    onDelete: { control: false },
    onBulkDelete: { control: false },
    onPageChange: { control: false },
    bulkActions: { control: false },
    columnVisibility: { control: false },
    onColumnVisibilityChange: { control: false },
    onPageSizeChange: { control: false },
    // ON/OFF · 문구 — 기본값은 지금까지의 동작 그대로다
    showEmptyDescription: { control: 'boolean' },
    emptyText: { control: 'text', description: '@deprecated — labels.empty.title을 쓰세요' },
    emptyDescription: { control: 'text', description: '@deprecated — labels.empty.description을 쓰세요' },
    loadingLabel: { control: 'text', description: '@deprecated — labels.loading을 쓰세요' },
    // 새 변형 축 — 기본값은 전부 지금 화면 그대로다
    striped: { control: 'boolean', description: '짝수 행 줄무늬 — 컬럼이 많은 긴 표에서 가로 추적을 돕는다' },
    emptyKind: {
      control: 'inline-radio',
      options: ['empty', 'search', 'error'],
      description: '검색 결과 0건과 데이터 0건이 같은 그림으로 나오지 않게 한다',
    },
    onEmptyAction: { control: false },
    // 문구 통로(labels)와 포맷 통로(formatters) — Labels 스토리 참고
    labels: { control: 'object' },
    formatters: { control: false },
    // 아이콘 슬롯 — ReactNode라 컨트롤로는 다루지 않는다(CustomIcons 스토리 참고)
    editIcon: { control: false },
    deleteIcon: { control: false },
    kebabIcon: { control: false },
    dragIcon: { control: false },
    csvIcon: { control: false },
    excelIcon: { control: false },
    columnPickerIcon: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'fullscreen',
  },
} satisfies Meta<AdminTableProps<Post>>

export default meta
type Story = StoryObj<typeof meta>

/** 순번 · Title · 카테고리 · 상태 · 등록일자 · 관리 */
export const Default: Story = {
  render: (args) => <AdminTableDemo {...args} columns={DEFAULT_COLUMNS} />,
}

/** 선택 · 순번 · Title · Type · 카테고리 · 등록자 · 등록일자 · 수정자 · 수정일자 · 상태 · 관리 */
export const FullMeta: Story = {
  render: (args) => <AdminTableDemo {...args} columns={FULL_META_COLUMNS} />,
}

/** Title · 상태 · 관리 3컬럼만 — 남는 공간은 전부 Title이 가져간다 */
export const Minimal: Story = {
  render: (args) => <AdminTableDemo {...args} columns={MINIMAL_COLUMNS} />,
}

/** density="compact" + 20행 */
export const Dense: Story = {
  args: { density: 'compact', rows: POSTS },
  render: (args) => <AdminTableDemo {...args} columns={DENSE_COLUMNS} pageSize={20} />,
}

/** loading · empty */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ds-color-secondary)' }}>loading</p>
        <PostTable {...args} columns={DEFAULT_COLUMNS} rows={POSTS.slice(0, 3)} loading />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ds-color-secondary)' }}>empty</p>
        <PostTable {...args} columns={DEFAULT_COLUMNS} rows={[]} />
      </div>
    </div>
  ),
}

/**
 * columnPicker — 우상단 '컬럼' 버튼으로 표시 컬럼을 켜고 끈다.
 * 선택·관리 컬럼은 표의 뼈대라 목록에 없고(hideable=false), 마지막 한 컬럼은 끌 수 없다.
 */
export const ColumnPicker: Story = {
  args: { columnPicker: true },
  render: (args) => <AdminTableDemo {...args} columns={FULL_META_COLUMNS} />,
}

/**
 * pinned — 좌측(선택·순번·제목)과 우측(노출·관리)이 sticky로 고정된다.
 * 표를 가로로 밀면 고정 경계에 1px 구분선이 나타난다(가려진 내용이 있을 때만).
 */
export const PinnedColumns: Story = {
  render: (args) => (
    <div style={{ maxWidth: 760, padding: 16 }}>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ds-color-secondary)' }}>
        좁은 컨테이너 — 가로로 스크롤해 보세요
      </p>
      <AdminTableDemo {...args} columns={PINNED_COLUMNS} />
    </div>
  ),
}

/**
 * pageSize + exportable — 하단 좌측 Select로 페이지 크기를 바꾸고,
 * 우상단 CSV/Excel 버튼으로 현재 행·보이는 컬럼을 그대로 내려받는다(UTF-8 BOM, 한글 안 깨짐).
 */
export const PageSizeAndExport: Story = {
  args: {
    rows: POSTS,
    exportable: true,
    exportFilename: '게시글목록',
    columnPicker: true,
    pageSizeOptions: [5, 10, 20],
  },
  render: (args) => (
    <AdminTableDemo {...args} columns={FULL_META_COLUMNS} pageSize={5} pageSizeControl />
  ),
}

/** 선택 시 하단에 뜨는 일괄 처리 버튼 — 노출/숨김 + 기존 선택 삭제(error 톤) */
function BulkActionsDemo(props: AdminTableProps<Post>) {
  const [rows, setRows] = useState<Post[]>(POSTS.slice(0, 8))
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const setPublished = (ids: string[], next: boolean) =>
    setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, published: next } : r)))

  const bulkPublish = (ids: string[], next: boolean) => {
    setPublished(ids, next)
    setSelectedIds([])
  }

  return (
    <PostTable
      {...props}
      columns={FULL_META_COLUMNS}
      rows={rows}
      rowKey={(row) => row.id}
      selectedIds={selectedIds}
      onSelectChange={setSelectedIds}
      onToggleStatus={(row, next) => setPublished([row.id], next)}
      bulkActions={[
        {
          key: 'publish',
          label: '노출',
          tone: 'primary',
          icon: <Eye size={14} />,
          onAction: (ids) => bulkPublish(ids, true),
        },
        {
          key: 'hide',
          label: '숨김',
          tone: 'secondary',
          icon: <EyeOff size={14} />,
          onAction: (ids) => bulkPublish(ids, false),
        },
      ]}
      onBulkDelete={(ids) => {
        setRows((prev) => prev.filter((r) => !ids.includes(r.id)))
        setSelectedIds([])
      }}
      onEdit={() => {}}
      onDelete={(row) => setRows((prev) => prev.filter((r) => r.id !== row.id))}
    />
  )
}

/** bulkActions — 행을 선택하면 하단에 노출/숨김/선택 삭제가 뜬다 */
export const BulkActions: Story = {
  render: (args) => <BulkActionsDemo {...args} />,
}

// ── Cafe24Style — 행 안에서 바로 조작하는 상품 목록 ──────────────────────
type SaleState = 'sale' | 'soldout' | 'hidden'

type Product = {
  id: string
  thumbnail?: string
  name: string
  code: string
  /** 연결된 기획전 — titleTags 컬럼용 */
  promotion: string
  promotionUrl: string
  promotionState: '진행중' | '예정'
  best: boolean
  sale: boolean
  fresh: boolean
  price: number
  stock: number
  saleState: SaleState
  displayed: boolean
  memo: string
  createdAt: string
  shopUrl: string
}

const SALE_OPTIONS = [
  { value: 'sale', label: '판매중' },
  { value: 'soldout', label: '품절' },
  { value: 'hidden', label: '숨김' },
]

const PRODUCT_NAMES = [
  '베이직 코튼 오버핏 티셔츠',
  '스탠다드 워시드 데님 팬츠',
  '라이트 웜 플리스 집업',
  '메리노 울 니트 가디건',
  '소프트 터치 후드 스웨트셔츠',
  '데일리 캔버스 토트백',
  '리사이클 나일론 윈드브레이커',
  '클래식 첼시 부츠',
  '스트레치 슬랙스 (2colors)',
  '오가닉 코튼 파자마 세트',
  '컴팩트 카드 지갑',
  '에어리 린넨 셔츠',
]

const PRODUCTS: Product[] = PRODUCT_NAMES.map((name, i) => ({
  id: `p${String(i + 1).padStart(2, '0')}`,
  // 4번째마다 썸네일 없음 — 공용 Placeholder로 대체된다
  thumbnail: i % 4 === 3 ? undefined : thumb((i * 53) % 360),
  name,
  code: `P${2026}${String(i + 1).padStart(4, '0')}`,
  promotion: i % 2 === 0 ? '겨울 시즌오프' : '신상품 위크',
  promotionUrl: 'https://example.com/promotion',
  promotionState: i % 3 === 0 ? '예정' : '진행중',
  best: i % 3 === 0,
  sale: i % 4 === 1,
  fresh: i % 5 === 2,
  price: 19000 + i * 7300,
  stock: i % 6 === 4 ? 0 : 12 + i * 9,
  saleState: i % 6 === 4 ? 'soldout' : i % 7 === 5 ? 'hidden' : 'sale',
  displayed: i % 5 !== 4,
  memo: i % 3 === 1 ? '옵션 재고 확인 후 재입고 예정' : '',
  createdAt: `2026-0${(i % 6) + 1}-${String((i % 27) + 1).padStart(2, '0')}`,
  shopUrl: 'https://example.com/product',
}))

const ProductTable = AdminTable<Product>

/**
 * 카페24/아임웹 상품 목록 밀도 — 행 안에서 바로 조작한다.
 * drag(순서) · select · thumbTitle · titleTags · price · number(재고 0=error)
 * · selectCell(판매상태) · status(진열) · memo · kebab을 한 표에 모두 쓴다.
 */
function Cafe24StyleDemo() {
  const [rows, setRows] = useState<Product[]>(PRODUCTS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)

  const patch = (id: string, next: Partial<Product>) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...next } : row)))

  const remove = (ids: string[]) => {
    setRows((prev) => prev.filter((row) => !ids.includes(row.id)))
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)))
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * size
  const pageRows = rows.slice(start, start + size)

  const columns: AdminColumn<Product>[] = [
    { kind: 'drag', key: 'drag' },
    { kind: 'select', key: 'select' },
    {
      // 썸네일 + 상품명(+태그·쇼핑몰 링크) + 상품코드
      kind: 'thumbTitle',
      key: 'name',
      header: '상품',
      sortable: true,
      thumb: (row) => row.thumbnail,
      subValue: (row) => row.code,
      tags: (row) =>
        [
          row.best ? { label: 'BEST', tone: 'primary' as const } : null,
          row.sale ? { label: 'SALE', tone: 'error' as const } : null,
          row.fresh ? { label: 'NEW', tone: 'success' as const } : null,
        ].flatMap((tag) => (tag != null ? [tag] : [])),
      externalHref: (row) => row.shopUrl,
      onClick: () => {},
    },
    {
      // 같은 표에서 titleTags도 함께 — 썸네일 없이 제목 + 태그 + 링크만
      kind: 'titleTags',
      key: 'promotion',
      header: '기획전',
      ratio: 2,
      tags: (row) => [
        { label: row.promotionState, tone: row.promotionState === '진행중' ? 'success' : 'warning' },
      ],
      externalHref: (row) => row.promotionUrl,
      onClick: () => {},
    },
    { kind: 'price', key: 'price', header: '판매가', sortable: true },
    { kind: 'number', key: 'stock', header: '재고', sortable: true, tone: () => 'error' },
    {
      kind: 'selectCell',
      key: 'saleState',
      header: '판매상태',
      options: SALE_OPTIONS,
      onCellChange: (row, value) => patch(row.id, { saleState: value as SaleState }),
    },
    { kind: 'status', key: 'displayed', header: '진열' },
    { kind: 'memo', key: 'memo', header: '메모' },
    { kind: 'date', key: 'createdAt', header: '등록일', sortable: true },
    {
      kind: 'kebab',
      key: 'kebab',
      menu: (row) => [
        { key: 'copy', label: '복사하여 등록', icon: <Copy size={14} />, onSelect: () => {} },
        {
          key: 'stop',
          label: '판매중지',
          icon: <Ban size={14} />,
          onSelect: () => patch(row.id, { saleState: 'hidden', displayed: false }),
        },
        {
          key: 'delete',
          label: '삭제',
          tone: 'error',
          icon: <Trash2 size={14} />,
          divider: true,
          onSelect: () => remove([row.id]),
        },
      ],
    },
  ]

  return (
    <ProductTable
      columns={columns}
      rows={pageRows}
      rowKey={(row) => row.id}
      density="compact"
      selectedIds={selectedIds}
      onSelectChange={setSelectedIds}
      onToggleStatus={(row, next) => patch(row.id, { displayed: next })}
      onMemoChange={(row, memo) => patch(row.id, { memo })}
      // 현재 페이지 순서를 받아 원본 배열의 해당 구간에 그대로 되꽂는다
      onReorder={(next) =>
        setRows((prev) => [...prev.slice(0, start), ...next, ...prev.slice(start + next.length)])
      }
      bulkActions={[
        {
          key: 'soldout',
          label: '품절 처리',
          tone: 'secondary',
          icon: <Ban size={14} />,
          onAction: (ids) => {
            setRows((prev) =>
              prev.map((row) =>
                ids.includes(row.id) ? { ...row, saleState: 'soldout' as SaleState } : row,
              ),
            )
            setSelectedIds([])
          },
        },
      ]}
      onBulkDelete={remove}
      page={current}
      totalPages={totalPages}
      onPageChange={setPage}
      pageSize={size}
      pageSizeOptions={[20, 50, 100]}
      onPageSizeChange={(next) => {
        setSize(next)
        setPage(1)
      }}
      columnPicker
      exportable
      exportFilename="상품목록"
    />
  )
}

/**
 * Cafe24Style — 밀도는 카페24/아임웹, 마감은 Toss.
 * compact(행 44px) · 행 안에서 바로 조작(판매상태 Select · 진열 Toggle · 메모 · 케밥)
 * · ⋮⋮ 핸들 드래그(또는 핸들 포커스 후 ↑/↓)로 순서 변경.
 */
export const Cafe24Style: Story = {
  render: () => (
    <div style={{ padding: 24, background: 'var(--ds-color-bgSubtle)' }}>
      <Cafe24StyleDemo />
    </div>
  ),
}

/**
 * 아이콘 슬롯 — 수정/삭제/케밥/드래그/CSV/Excel/컬럼 아이콘을 전부 갈아끼운 예.
 * 아무것도 넘기지 않으면 기본 lucide 아이콘이 그대로 쓰인다(수정/삭제는 공용 RowActions가 그린다).
 */
export const CustomIcons: Story = {
  args: {
    columnPicker: true,
    exportable: true,
    editIcon: <PencilRuler size={15} />,
    deleteIcon: <Ban size={15} />,
    csvIcon: <FileDown size={14} />,
    excelIcon: <Sheet size={14} />,
    columnPickerIcon: <SlidersHorizontal size={14} />,
  },
  render: (args) => <AdminTableDemo {...args} columns={DEFAULT_COLUMNS} />,
}

// ── ProductBoard — 상품 목록 프리셋(PRODUCT_COLUMNS) ─────────────────────
// 예전엔 이 컬럼 조합을 하드코딩한 별도 컴포넌트(상품 게시판)가 있었다. 표 구현이 둘이면
// 정렬·고정·내보내기 같은 능력이 한쪽에만 생겨 계속 어긋나므로, 컬럼 선언만 프리셋으로 남기고
// 표는 AdminTable 하나로 통일했다. 그 컴포넌트의 show* 토글은 이제 '컬럼 조합'으로 표현된다.
const BOARD_ROWS: ProductBoardRow[] = [
  { id: 'p01', thumbnail: thumb(10), name: '겨울 울 코트', category: '아우터', price: 189000, stock: 24, active: true, createdAt: '2026-01-08' },
  { id: 'p02', thumbnail: thumb(35), name: '캐시미어 머플러', category: '액세서리', price: 59000, stock: 0, active: false, createdAt: '2026-01-11' },
  { id: 'p03', name: '옥스포드 셔츠', category: '상의', price: 42000, stock: 132, active: true, createdAt: '2026-01-15' },
  { id: 'p04', thumbnail: thumb(120), name: '와이드 데님 팬츠', category: '하의', price: 78000, stock: 8, active: true, createdAt: '2026-02-02' },
  { id: 'p05', thumbnail: thumb(200), name: '경량 패딩 베스트', category: '아우터', price: 119000, stock: 41, active: false, createdAt: '2026-02-14' },
  { id: 'p06', name: '베이직 니트', category: '상의', price: 39000, stock: 0, active: false, createdAt: '2026-02-20' },
  { id: 'p07', thumbnail: thumb(280), name: '레더 크로스백', category: '액세서리', price: 245000, stock: 5, active: true, createdAt: '2026-03-03' },
  { id: 'p08', thumbnail: thumb(320), name: '슬랙스 팬츠', category: '하의', price: 68000, stock: 77, active: true, createdAt: '2026-03-19' },
  { id: 'p09', thumbnail: thumb(45), name: '코튼 후드티', category: '상의', price: 45000, stock: 210, active: true, createdAt: '2026-04-01' },
  { id: 'p10', name: '트렌치 코트', category: '아우터', price: 219000, stock: 12, active: false, createdAt: '2026-04-12' },
  { id: 'p11', thumbnail: thumb(160), name: '실버 체인 목걸이', category: '액세서리', price: 89000, stock: 33, active: true, createdAt: '2026-05-06' },
  { id: 'p12', thumbnail: thumb(240), name: '치노 팬츠', category: '하의', price: 55000, stock: 0, active: true, createdAt: '2026-05-27' },
]

const BOARD_PAGE_SIZE = 6
const BoardTable = AdminTable<ProductBoardRow>

/** 열을 끈 조합 — 읽기 전용 목록(선택·순번·썸네일·관리 OFF) + 품절 배지 OFF */
const READONLY_PRODUCT_COLUMNS = buildProductColumns({
  showSelect: false,
  showIndex: false,
  showThumbnail: false,
  showActions: false,
  showSoldOutBadge: false,
})

/** 검색 · 전체선택 · 상태 토글 · 수정/삭제(CrudDialog) · 일괄 삭제 · 페이지네이션이 실제로 동작한다 */
function ProductBoardDemo() {
  const [rows, setRows] = useState<ProductBoardRow[]>(BOARD_ROWS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  // 삭제 대상 — 단건이면 그 행, 일괄이면 선택된 id 배열
  const [pending, setPending] = useState<{ ids: string[]; label: string } | null>(null)
  const [editing, setEditing] = useState<ProductBoardRow | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = rows.filter((row) => row.name.includes(search.trim()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / BOARD_PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const pageRows = filtered.slice((current - 1) * BOARD_PAGE_SIZE, current * BOARD_PAGE_SIZE)

  const removeIds = (ids: string[]) => {
    setRows((prev) => prev.filter((row) => !ids.includes(row.id)))
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)))
    setPending(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FilterBar
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="상품명 검색"
        actions={
          <Button
            variant="primary"
            size="sm"
            label="상품 등록"
            showIcon
            icon={<Plus size={14} />}
            onClick={() => setCreating(true)}
          />
        }
      />

      <BoardTable
        columns={PRODUCT_COLUMNS}
        rows={pageRows}
        rowKey={(row) => row.id}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onToggleStatus={(row, next) =>
          setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active: next } : item)))
        }
        onEdit={setEditing}
        onDelete={(row) => setPending({ ids: [row.id], label: `‘${row.name}’ 1건` })}
        onBulkDelete={(ids) => setPending({ ids, label: `선택한 ${ids.length}건` })}
        page={current}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyText={PRODUCT_EMPTY_TEXT}
      />

      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ds-color-secondary)' }}>
          읽기 전용 조합 — buildProductColumns로 선택·순번·썸네일·관리 열과 품절 배지를 껐다
          (꺼진 열은 표에서 통째로 빠진다: 빈 칸이 남지 않는다)
        </p>
        <BoardTable
          columns={READONLY_PRODUCT_COLUMNS}
          rows={BOARD_ROWS.slice(0, 4)}
          rowKey={(row) => row.id}
          emptyText={PRODUCT_EMPTY_TEXT}
        />
      </div>

      <CrudDialog
        open={creating}
        mode="create"
        title="상품 등록"
        description="새 상품 정보를 입력하세요."
        onCancel={() => setCreating(false)}
        onConfirm={() => setCreating(false)}
      >
        <TextField label="상품명" placeholder="상품명을 입력하세요" />
        <TextField label="카테고리" placeholder="예: 아우터" />
        <TextField label="가격" placeholder="예: 129000" />
      </CrudDialog>

      <CrudDialog
        open={editing != null}
        mode="edit"
        title="상품 수정"
        description={editing != null ? `‘${editing.name}’ 정보를 수정합니다.` : undefined}
        onCancel={() => setEditing(null)}
        onConfirm={() => setEditing(null)}
      >
        <TextField label="상품명" placeholder={editing?.name} />
        <TextField label="카테고리" placeholder={editing?.category} />
        <TextField label="가격" placeholder={String(editing?.price ?? '')} />
      </CrudDialog>

      <CrudDialog
        open={pending != null}
        mode="delete"
        title="상품을 삭제할까요?"
        description={pending != null ? `${pending.label}이 목록에서 제거됩니다.` : undefined}
        confirmLabel="삭제"
        onCancel={() => setPending(null)}
        onConfirm={() => pending != null && removeIds(pending.ids)}
      />
    </div>
  )
}

/**
 * ProductBoard — 상품 목록 프리셋.
 * PRODUCT_COLUMNS(선택 · 순번 · 이미지 · 이름 · 카테고리 · 가격 · 재고 · 상태 · 등록일자 · 관리)를
 * AdminTable에 그대로 꽂는다. 재고 0은 '품절' 배지로 뜬다.
 * 열 구성을 바꾸려면 buildProductColumns(옵션)으로 조합만 다시 만든다(아래 읽기 전용 표 참고).
 */
export const ProductBoard: Story = {
  render: () => <ProductBoardDemo />,
}

/**
 * 빈 상태 문구 — showEmptyDescription을 끄면 제목만 남고,
 * emptyText/emptyDescription으로 도메인 말로 갈아끼울 수 있다.
 */
export const EmptyCopy: Story = {
  args: {
    rows: [],
    emptyText: '조건에 맞는 게시글이 없습니다.',
    showEmptyDescription: false,
  },
  render: (args) => <PostTable {...args} columns={DEFAULT_COLUMNS} rows={[]} />,
}

/**
 * Labels: 영문 오버라이드 — 컴포넌트가 스스로 갖고 있던 문구가 전부 `labels` 하나로 열린다.
 *
 * 여기서 갈아끼우는 것들:
 *  - columns  : header를 주지 않은 컬럼의 kind별 기본 헤더('순번'·'메모'·'관리' …)
 *  - toolbar  : CSV / Excel / 컬럼 피커(버튼 + 팝오버 제목)
 *  - bulk     : '선택 3건' + '선택 삭제'
 *  - row      : 썸네일 alt, 수정/삭제/더보기, 순서 이동 툴팁, 새 창 링크, 인라인 Select 접근성 이름
 *  - memo     : 빈 메모 셀 문구 + 메모 모달(제목·플레이스홀더·취소·저장)
 *  - empty    : 빈 표의 제목·보조 문구·CTA
 *  - pageSizeOption : '10개씩'
 *
 * 숫자·통화 로케일은 '문구'가 아니라 '포맷'이라 labels가 아니라 formatters로 연다.
 * (개별 카피 prop인 emptyText/loadingLabel은 그대로 살아 있고, 주면 labels보다 우선한다)
 */
export const Labels: Story = {
  args: {
    // 개별 prop이 labels를 이기므로, 통로가 화면까지 닿는 걸 보이려면 비워 둔다
    emptyText: undefined,
    columnPicker: true,
    exportable: true,
    striped: true,
    labels: {
      columns: { index: 'No.', memo: 'Memo', actions: 'Manage', price: 'Price', number: 'Stock' },
      toolbar: {
        csv: 'Export CSV',
        excel: 'Export Excel',
        columnPicker: 'Columns',
        columnPickerTitle: 'Show columns',
      },
      bulk: {
        selectedCount: (count) => `${count} selected`,
        delete: 'Delete selected',
      },
      pageSizeOption: (size) => `${size} / page`,
      row: {
        edit: (row) => `Edit ${row}`,
        delete: (row) => `Delete ${row}`,
        more: (row) => `More actions for ${row}`,
        reorder: (row) => `Reorder ${row}`,
        thumbnailAlt: (row) => `${row} thumbnail`,
        thumbnailEmpty: 'No image',
        reorderHint: 'Drag, or use ↑ ↓ keys to reorder',
        reorderDisabledBySort: 'Clear the sort to reorder rows',
        reorderUnsupported: 'Reordering is not supported',
        externalLink: (title) => `Open ${title} in a new tab`,
        selectCell: ({ row, column, current }) => `Change ${column} for ${row} — currently ${current}`,
      },
      memo: {
        empty: 'Add memo',
        emptyTitle: 'No memo',
        edit: (row) => `Edit memo for ${row}`,
        create: (row) => `Add memo for ${row}`,
        dialogTitle: (row) => `Memo — ${row}`,
        dialogFallbackTitle: 'Memo',
        placeholder: 'Leave a note about this row',
        cancel: 'Cancel',
        save: 'Save',
      },
      empty: {
        title: 'No posts found',
        description: 'Try a different filter, or create a new post.',
        actionLabel: 'New post',
      },
      loading: 'Loading',
    },
    // 로케일은 문구가 아니라 포맷이다 — en-US 자릿수/통화로 갈아끼운다
    formatters: {
      number: (value) => value.toLocaleString('en-US'),
      price: (value) => `$${value.toLocaleString('en-US')}`,
    },
    onEmptyAction: () => {},
  },
  render: (args) => (
    <AdminTableDemo
      {...args}
      columns={[
        { kind: 'select', key: 'select' },
        { kind: 'index', key: 'index' },
        { kind: 'thumbTitle', key: 'title', header: 'Post', sortable: true },
        { kind: 'category', key: 'category', header: 'Category' },
        {
          kind: 'selectCell',
          key: 'type',
          header: 'Type',
          options: TYPES.map((type) => ({ label: type, value: type })),
        },
        // Post에는 memo 필드가 없다 — 값이 비어 있으므로 labels.memo.empty('Add memo')가 그대로 보인다
        { kind: 'memo', key: 'memo' },
        { kind: 'status', key: 'published', header: 'Visible' },
        { kind: 'actions', key: 'actions' },
      ]}
      pageSizeControl
    />
  ),
}

/**
 * 빈 표 + CTA — emptyKind로 '검색 결과 없음' 그림을 고르고,
 * labels.empty.actionLabel + onEmptyAction으로 '새 항목 등록' 버튼을 붙인다.
 */
export const EmptyWithAction: Story = {
  args: {
    rows: [],
    emptyText: undefined,
    emptyKind: 'search',
    labels: {
      empty: {
        title: '검색 결과가 없습니다.',
        description: '다른 키워드로 다시 검색해 보세요.',
        actionLabel: '검색 조건 초기화',
      },
    },
    onEmptyAction: () => {},
  },
  render: (args) => <PostTable {...args} columns={DEFAULT_COLUMNS} rows={[]} />,
}

/** striped — 컬럼이 많고 행이 긴 표에서 짝수 행 줄무늬가 가로 추적을 돕는다(고정 컬럼까지 이어진다) */
export const Striped: Story = {
  args: { striped: true, density: 'compact', rows: POSTS },
  render: (args) => <AdminTableDemo {...args} columns={FULL_META_COLUMNS} pageSize={20} />,
}
