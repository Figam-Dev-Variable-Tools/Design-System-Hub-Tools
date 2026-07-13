import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { AdminListView } from './AdminListView'
import { AdminCard } from '../AdminCard/AdminCard'
import { AdminTable } from '../AdminTable/AdminTable'
import { PRODUCT_COLUMNS, PRODUCT_EMPTY_TEXT, type ProductBoardRow } from '../AdminTable/presets'
import { SearchField } from '../SearchField/SearchField'
import type { ViewSwitchValue } from '../ViewSwitch/ViewSwitch'

// fullscreen 레이아웃 — 어드민 콘텐츠 영역의 좌우 패딩을 흉내 낸다
function Canvas({ children }: { children: ReactNode }) {
  return <div style={{ padding: 40, maxWidth: 1680, margin: '0 auto' }}>{children}</div>
}

// 게시물형(AdminTable + 상품 컬럼 프리셋)과 카드형(AdminCard)이 같은 데이터를 공유한다.
// 썸네일이 없는 행(p03/p06/p10)은 카드에서 공용 SVG 플레이스홀더로 채워진다.
type Product = ProductBoardRow
const ProductTable = AdminTable<Product>

const PRODUCTS: Product[] = [
  { id: 'p01', thumbnail: mockImage('', 'sand'), name: '겨울 울 코트', category: '아우터', price: 189000, stock: 24, active: true, createdAt: '2026-01-08' },
  { id: 'p02', thumbnail: mockImage('', 'dusk'), name: '캐시미어 머플러', category: '액세서리', price: 59000, stock: 0, active: false, createdAt: '2026-01-11' },
  { id: 'p03', name: '옥스포드 셔츠', category: '상의', price: 42000, stock: 132, active: true, createdAt: '2026-01-15' },
  { id: 'p04', thumbnail: mockImage('', 'slate'), name: '와이드 데님 팬츠', category: '하의', price: 78000, stock: 8, active: true, createdAt: '2026-02-02' },
  { id: 'p05', thumbnail: mockImage('', 'sage'), name: '경량 패딩 베스트', category: '아우터', price: 119000, stock: 41, active: false, createdAt: '2026-02-14' },
  { id: 'p06', name: '베이직 니트', category: '상의', price: 39000, stock: 0, active: false, createdAt: '2026-02-20' },
  { id: 'p07', thumbnail: mockImage('', 'sand'), name: '레더 크로스백', category: '액세서리', price: 245000, stock: 5, active: true, createdAt: '2026-03-03' },
  { id: 'p08', thumbnail: mockImage('', 'slate'), name: '슬랙스 팬츠', category: '하의', price: 68000, stock: 77, active: true, createdAt: '2026-03-19' },
  { id: 'p09', thumbnail: mockImage('', 'sage'), name: '코튼 후드티', category: '상의', price: 45000, stock: 210, active: true, createdAt: '2026-04-01' },
  { id: 'p10', name: '트렌치 코트', category: '아우터', price: 219000, stock: 12, active: false, createdAt: '2026-04-12' },
  { id: 'p11', thumbnail: mockImage('', 'dusk'), name: '실버 체인 목걸이', category: '액세서리', price: 89000, stock: 33, active: true, createdAt: '2026-05-06' },
  { id: 'p12', thumbnail: mockImage('', 'slate'), name: '치노 팬츠', category: '하의', price: 55000, stock: 0, active: true, createdAt: '2026-05-27' },
]

const PAGE_SIZE = 8

/** ₩1,234,000 */
function formatPrice(price: number): string {
  return `₩${price.toLocaleString('ko-KR')}`
}

/**
 * 상품 → AdminCard 배지: 썸네일 좌상단 오버레이라 "상태"만 올린다.
 * (카테고리는 배지가 아니라 서브타이틀로 내려 정보 위계를 정리했다)
 */
function badgesOf(product: Product) {
  const badges: { label: string; tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }[] = []
  if (product.stock === 0) badges.push({ label: '품절', tone: 'error' })
  else if (product.stock <= 10) badges.push({ label: '재고 부족', tone: 'warning' })
  return badges
}

// 카드형 ↔ 게시물형 전환이 실제로 동작하는 상품 목록 데모
function ProductListDemo({
  initialView = 'card',
  empty = false,
}: {
  initialView?: ViewSwitchValue
  empty?: boolean
}) {
  const [view, setView] = useState<ViewSwitchValue>(initialView)
  const [rows, setRows] = useState<Product[]>(empty ? [] : PRODUCTS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = rows.filter((row) => row.name.includes(search.trim()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const toggleActive = (id: string, next: boolean) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, active: next } : row)))
  }

  const toggleSelect = (id: string, next: boolean) => {
    setSelectedIds((prev) => (next ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)))
  }

  const remove = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id))
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
  }

  return (
    <AdminListView
      view={view}
      onViewChange={setView}
      total={filtered.length}
      toolbar={
        <div style={{ width: 260 }}>
          <SearchField
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="상품명 검색"
          />
        </div>
      }
      // 게시물형 — AdminTable에 상품 컬럼 프리셋만 꽂아 넣는다(표 구현은 하나뿐이다).
      // page/totalPages를 넘기지 않아 페이지네이션은 AdminListView 하단 하나로 통일된다.
      renderBoard={() => (
        <ProductTable
          columns={PRODUCT_COLUMNS}
          rows={pageRows}
          rowKey={(row) => row.id}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onToggleStatus={(row, next) => toggleActive(row.id, next)}
          onDelete={(row) => remove(row.id)}
          emptyText={PRODUCT_EMPTY_TEXT}
        />
      )}
      renderCards={() =>
        pageRows.map((product) => (
          <AdminCard
            key={product.id}
            thumbnail={product.thumbnail}
            title={product.name}
            subtitle={product.category}
            badges={badgesOf(product)}
            meta={[
              { label: '가격', value: formatPrice(product.price) },
              { label: '재고', value: `${product.stock.toLocaleString('ko-KR')}개` },
              { label: '등록일', value: product.createdAt },
            ]}
            active={product.active}
            onToggleActive={(next) => toggleActive(product.id, next)}
            selected={selectedIds.includes(product.id)}
            onSelectChange={(next) => toggleSelect(product.id, next)}
            onEdit={() => {}}
            onDelete={() => remove(product.id)}
          />
        ))
      }
      page={current}
      totalPages={totalPages}
      onPageChange={setPage}
      empty={filtered.length === 0}
      emptyText={search !== '' ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}
    />
  )
}

const meta = {
  title: 'Admin/AdminListView',
  component: AdminListView,
  tags: ['autodocs'],
  args: {
    view: 'card',
    total: PRODUCTS.length,
    page: 1,
    totalPages: 2,
    empty: false,
    emptyText: '등록된 상품이 없습니다.',
    // 컨트롤드 + 슬롯 — 각 스토리가 자체 render로 덮어쓴다
    onViewChange: () => {},
    renderBoard: () => null,
    renderCards: () => null,
  },
  argTypes: {
    onViewChange: { control: false },
    toolbar: { control: false },
    renderBoard: { control: false },
    renderCards: { control: false },
    onPageChange: { control: false },
    // ON/OFF · 문구 — 기본값은 지금까지의 상단 바 그대로다
    showViewSwitch: { control: 'boolean' },
    showTotal: { control: 'boolean' },
    totalLabel: { control: 'text', description: '@deprecated — labels.total.prefix를 쓰세요' },
    totalUnit: { control: 'text', description: '@deprecated — labels.total.unit을 쓰세요' },
    emptyText: { control: 'text', description: '@deprecated — labels.empty.title을 쓰세요' },
    emptyDescription: { control: 'text', description: '@deprecated — labels.empty.description을 쓰세요' },
    // 새 변형 축 — 기본값은 전부 지금 화면 그대로다
    emptyKind: {
      control: 'inline-radio',
      options: ['empty', 'search', 'error'],
      description: '검색 결과 0건과 데이터 0건이 같은 그림으로 나오지 않게 한다',
    },
    viewSwitchSize: { control: 'inline-radio', options: ['sm', 'md'] },
    showViewSwitchLabel: { control: 'boolean', description: '끄면 아이콘 전용(접근성 이름은 남는다)' },
    paginationAlign: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      description: '사이트형(center·기본) / 어드민형(start)',
    },
    onEmptyAction: { control: false },
    labels: { control: 'object' },
    formatters: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminListView>

export default meta
type Story = StoryObj<typeof meta>

// 상품 12건 — 우상단 ViewSwitch로 카드형/게시물형이 실제로 전환된다.
// 카드형이 기본: 썸네일(배지·체크박스 오버레이) → 타이틀 → 가격 → 보조 메타 → 액션 바
export const Default: Story = {
  render: () => (
    <Canvas>
      <ProductListDemo />
    </Canvas>
  ),
}

// 카드형 고정 — toolbar/페이지네이션 없이 카드 그리드만 쓰는 최소 구성.
// view가 컨트롤드라 onViewChange를 무시하면 게시물형으로 넘어가지 않는다.
export const CardOnly: Story = {
  render: () => (
    <Canvas>
      <AdminListView
        view="card"
        onViewChange={() => {}}
        total={PRODUCTS.length}
        renderBoard={() => null}
        renderCards={() =>
          PRODUCTS.slice(0, 6).map((product) => (
            <AdminCard
              key={product.id}
              thumbnail={product.thumbnail}
              title={product.name}
              subtitle={product.category}
              badges={badgesOf(product)}
              meta={[
                { label: '가격', value: formatPrice(product.price) },
                { label: '재고', value: `${product.stock.toLocaleString('ko-KR')}개` },
                { label: '등록일', value: product.createdAt },
              ]}
              onClick={() => {}}
            />
          ))
        }
      />
    </Canvas>
  ),
}

// 밀도 축약 — compact 카드 + 4열 상한. 좁은 어드민 콘텐츠나 목록 밀도가 필요할 때.
export const CompactCards: Story = {
  render: () => (
    <Canvas>
      <AdminListView
        view="card"
        onViewChange={() => {}}
        total={PRODUCTS.length}
        maxColumns={4}
        renderBoard={() => null}
        renderCards={() =>
          PRODUCTS.slice(0, 8).map((product) => (
            <AdminCard
              key={product.id}
              density="compact"
              thumbnail={product.thumbnail}
              title={product.name}
              subtitle={product.category}
              badges={badgesOf(product)}
              meta={[
                { label: '가격', value: formatPrice(product.price) },
                { label: '재고', value: `${product.stock.toLocaleString('ko-KR')}개` },
                { label: '등록일', value: product.createdAt },
              ]}
              active={product.active}
              onToggleActive={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))
        }
      />
    </Canvas>
  ),
}

export const Empty: Story = {
  render: () => (
    <Canvas>
      <ProductListDemo empty />
    </Canvas>
  ),
}

/**
 * 뷰 전환 없이 카드형만 — showViewSwitch를 끄면 우상단 스위치가 사라진다.
 * view prop은 그대로 존중되므로 카드형에 고정된다.
 */
export const WithoutViewSwitch: Story = {
  render: () => (
    <Canvas>
      <AdminListView
        view="card"
        onViewChange={() => {}}
        showViewSwitch={false}
        total={PRODUCTS.length}
        renderBoard={() => null}
        renderCards={() =>
          PRODUCTS.slice(0, 5).map((product) => (
            <AdminCard
              key={product.id}
              thumbnail={product.thumbnail}
              title={product.name}
              subtitle={product.category}
              meta={[{ label: '가격', value: formatPrice(product.price) }]}
              onClick={() => {}}
            />
          ))
        }
      />
    </Canvas>
  ),
}

/** 건수 문구 교체 — '전체 12건' → '검색 결과 12개'. 건수 자체를 숨기려면 showTotal을 끈다 */
export const CustomTotalCopy: Story = {
  render: () => (
    <Canvas>
      <AdminListView
        view="board"
        onViewChange={() => {}}
        total={PRODUCTS.length}
        totalLabel="검색 결과"
        totalUnit="개"
        renderBoard={() => (
          <ProductTable
            columns={PRODUCT_COLUMNS}
            rows={PRODUCTS.slice(0, 6)}
            rowKey={(row) => row.id}
            emptyText={PRODUCT_EMPTY_TEXT}
          />
        )}
        renderCards={() => null}
      />
    </Canvas>
  ),
}

/** 빈 상태 문구 교체 — 제목(emptyText)과 보조 문구(emptyDescription)를 도메인 말로 */
export const CustomEmptyCopy: Story = {
  render: () => (
    <Canvas>
      <AdminListView
        view="card"
        onViewChange={() => {}}
        total={0}
        empty
        emptyText="검색 결과가 없습니다."
        emptyDescription="다른 키워드로 다시 검색해 보세요."
        renderBoard={() => null}
        renderCards={() => null}
      />
    </Canvas>
  ),
}

/**
 * Labels: 영문 오버라이드 — 건수 표기('전체 12건')와 빈 상태가 labels 통로로 화면까지 닿는다.
 * 숫자 로케일은 문구가 아니라 formatters로 연다.
 */
export const Labels: Story = {
  render: () => (
    <Canvas>
      <AdminListView
        view="card"
        onViewChange={() => {}}
        total={1204}
        labels={{
          total: { prefix: 'Showing', unit: ' items' },
          empty: { title: 'No products yet', description: 'Add your first product to get started.' },
        }}
        formatters={{ number: (value) => value.toLocaleString('en-US') }}
        renderBoard={() => null}
        renderCards={() =>
          PRODUCTS.slice(0, 4).map((product) => (
            <AdminCard
              key={product.id}
              thumbnail={product.thumbnail}
              title={product.name}
              subtitle={product.category}
              meta={[{ label: 'Price', value: formatPrice(product.price) }]}
              labels={{
                thumbnailAlt: (title) => `${title} thumbnail`,
                thumbnailEmpty: 'No image',
                actions: { view: (t) => `View ${t}`, edit: (t) => `Edit ${t}`, delete: (t) => `Delete ${t}` },
                status: { active: 'On sale', inactive: 'Paused' },
              }}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))
        }
      />
    </Canvas>
  ),
}

/**
 * 검색 결과 0건 — emptyKind="search"라야 '데이터 없음'과 다른 그림이 나온다.
 * CTA는 labels.empty.actionLabel + onEmptyAction 짝으로 붙는다.
 */
export const EmptySearchWithAction: Story = {
  render: () => (
    <Canvas>
      <AdminListView
        view="card"
        onViewChange={() => {}}
        total={0}
        empty
        emptyKind="search"
        labels={{
          empty: {
            title: '검색 결과가 없습니다.',
            description: '다른 키워드로 다시 검색해 보세요.',
            actionLabel: '검색 조건 초기화',
          },
        }}
        onEmptyAction={() => {}}
        renderBoard={() => null}
        renderCards={() => null}
      />
    </Canvas>
  ),
}

/** 좁은 툴바 — ViewSwitch를 sm·아이콘 전용으로 줄이고 페이지네이션을 좌측(어드민형)으로 */
export const CompactToolbar: Story = {
  render: () => (
    <Canvas>
      <AdminListView
        view="board"
        onViewChange={() => {}}
        total={PRODUCTS.length}
        viewSwitchSize="sm"
        showViewSwitchLabel={false}
        paginationAlign="start"
        page={1}
        totalPages={3}
        onPageChange={() => {}}
        renderBoard={() => (
          <ProductTable
            columns={PRODUCT_COLUMNS}
            rows={PRODUCTS.slice(0, 6)}
            rowKey={(row) => row.id}
            emptyText={PRODUCT_EMPTY_TEXT}
          />
        )}
        renderCards={() => null}
      />
    </Canvas>
  ),
}
