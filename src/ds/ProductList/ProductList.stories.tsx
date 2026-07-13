import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CircleCheck, CircleSlash, FolderTree } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage, type MockTone } from '../../shared/mediaMock'
import { ProductList, type ProductListProps, type ProductRow } from './ProductList'
import type { ViewSwitchValue } from '../ViewSwitch/ViewSwitch'

// 어드민 콘텐츠 영역(최대 1600 + 좌우 패딩 40)을 흉내 낸다
function Canvas({ children }: { children: ReactNode }) {
  return <div style={{ padding: 40, maxWidth: 1680, margin: '0 auto' }}>{children}</div>
}

const CATEGORIES = ['아우터', '상의', '하의', '신발', '액세서리']

const NAMES = [
  '겨울 울 블렌드 코트',
  '옥스포드 셔츠',
  '와이드 데님 팬츠',
  '레더 첼시 부츠',
  '캐시미어 머플러',
  '경량 패딩 베스트',
  '베이직 코튼 니트',
  '슬랙스 팬츠',
  '스웨이드 로퍼',
  '실버 체인 목걸이',
  '트렌치 코트',
  '스트라이프 긴팔 티셔츠',
  '코듀로이 와이드 팬츠',
  '러닝화 에어핏 250',
  '레더 크로스백',
  '후드 집업 점퍼',
  '오버핏 맨투맨',
  '치노 팬츠',
]

const AUTHORS = ['홍성보', '김서연', '이준호', '박지민']
const TONES: MockTone[] = ['slate', 'sand', 'sage', 'dusk']

const pad = (value: number): string => String(value).padStart(2, '0')

// ── 목데이터 18건 — 카테고리·재고·할인·썸네일 유무가 골고루 섞이게 인덱스로 조합 ──
const ROWS: ProductRow[] = NAMES.map((name, i) => {
  const price = 29000 + ((i * 17) % 20) * 9000
  const day = (i % 27) + 1
  return {
    id: `p${pad(i + 1)}`,
    code: `P-2026-${pad(i + 1)}${pad((i * 7) % 90)}`,
    name,
    category: CATEGORIES[i % 5],
    price,
    // 3건 중 1건만 할인가 — '—'로 떨어지는 행이 함께 보이게
    salePrice: i % 3 === 0 ? Math.round((price * 0.8) / 1000) * 1000 : undefined,
    // 재고 0(품절) · 10 이하(재고 부족) · 정상이 모두 나오도록
    stock: i % 6 === 1 ? 0 : i % 6 === 4 ? (i % 9) + 1 : ((i * 31) % 240) + 12,
    active: i % 4 !== 1,
    // 썸네일 없는 행 — 공용 SVG 플레이스홀더로 대체되는지 확인용
    thumbnail: i % 5 === 3 ? undefined : mockImage('', TONES[i % 4]),
    createdAt: `2026-0${(i % 6) + 1}-${pad(day)}`,
    updatedAt: i % 3 === 2 ? undefined : `2026-07-${pad(Math.min(day + 2, 28))}`,
    createdBy: AUTHORS[i % 4],
  }
})

/**
 * 일괄 처리·토글·삭제가 실제로 동작하는 데모.
 * (검색·탭·페이징·선택·보기 전환은 ProductList 내부 state라 별도 배선이 필요 없다 —
 *  view만 스토리에서 초기값을 주려고 컨트롤드로 넘긴다)
 */
function ProductListDemo({
  initialView = 'board',
  ...props
}: ProductListProps & { initialView?: ViewSwitchValue }) {
  const [rows, setRows] = useState<ProductRow[]>(props.rows)
  const [view, setView] = useState<ViewSwitchValue>(initialView)
  const [log, setLog] = useState<string | null>(null)

  const patch = (ids: string[], make: (row: ProductRow) => ProductRow) => {
    const target = new Set(ids)
    setRows((prev) => prev.map((row) => (target.has(row.id) ? make(row) : row)))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: log == null ? 'var(--ds-color-secondary)' : 'var(--ds-color-primary)',
          fontFamily: 'var(--ds-font-family)',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {log ?? '게시물형에서 행을 선택하면 표 하단에 AdminTable 내장 일괄 처리 바(판매중 전환·판매중지·카테고리 변경·선택 해제·선택 삭제)가 나타납니다.'}
      </p>

      <ProductList
        {...props}
        rows={rows}
        view={view}
        onViewChange={setView}
        onRowOpen={(row) => setLog(`상세 열기: ${row.code} ${row.name}`)}
        onSearch={() => setLog('검색 조건으로 조회했습니다.')}
        onRefresh={() => setLog('목록을 새로고침했습니다.')}
        onToggleActive={(id, next) => {
          patch([id], (row) => ({ ...row, active: next }))
          setLog(`판매상태 변경: ${id} → ${next ? '판매중' : '판매중지'}`)
        }}
        onBulkActive={(ids, active) => {
          patch(ids, (row) => ({ ...row, active }))
          setLog(`판매상태 일괄 변경 ${ids.length}건 → ${active ? '판매중' : '판매중지'}`)
        }}
        onBulkCategory={(ids, category) => {
          patch(ids, (row) => ({ ...row, category }))
          setLog(`카테고리 일괄 변경 ${ids.length}건 → ${category}`)
        }}
        onBulkDelete={(ids) => {
          const target = new Set(ids)
          setRows((prev) => prev.filter((row) => !target.has(row.id)))
          setLog(`삭제 ${ids.length}건`)
        }}
      />
    </div>
  )
}

const meta = {
  title: 'Admin/ProductList',
  component: ProductList,
  tags: ['autodocs'],
  args: {
    rows: ROWS,
    categories: CATEGORIES,
    loading: false,
  },
  argTypes: {
    rows: { control: false },
    categories: { control: false },
    view: { control: false },
    onViewChange: { control: false },
    onSearch: { control: false },
    onRowOpen: { control: false },
    onToggleActive: { control: false },
    onBulkActive: { control: false },
    onBulkCategory: { control: false },
    onBulkDelete: { control: false },
    onRefresh: { control: false },

    // ON/OFF — 끄면 그 영역이 통째로 사라진다(빈 자리 없음)
    showSearch: { control: 'boolean' },
    showTabs: { control: 'boolean' },
    showToolbar: { control: 'boolean' },
    columnPicker: { control: 'boolean' },

    // 아이콘 슬롯 — 노드라 컨트롤 없이 스토리에서만 갈아끼운다
    activeIcon: { control: false },
    inactiveIcon: { control: false },
    categoryIcon: { control: false },

    // 카피
    emptyText: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    soldOutLabel: { control: 'text' },
    countUnit: { control: 'text' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProductList>

export default meta
type Story = StoryObj<typeof meta>

// 상품 18건 — 검색 9필드(가격·재고는 min/max 두 칸) · 카테고리 탭 6개 ·
// 게시물형 14컬럼(가로 스크롤 + 선택/관리 고정) · 10건씩 2페이지
export const Default: Story = {
  render: (args) => (
    <Canvas>
      <ProductListDemo {...args} />
    </Canvas>
  ),
}

// 카드형 — 같은 데이터가 AdminCard 그리드로. 썸네일 오버레이에 품절/재고 부족/할인율 배지,
// 카드 하단에 판매 토글 + 수정/삭제. 우상단 ViewSwitch로 게시물형과 전환된다.
export const CardView: Story = {
  render: (args) => (
    <Canvas>
      <ProductListDemo {...args} initialView="card" />
    </Canvas>
  ),
}

// 등록된 상품 없음 — 목록은 EmptyState, 탭 카운트는 모두 0
export const Empty: Story = {
  args: { rows: [] },
  render: (args) => (
    <Canvas>
      <ProductList {...args} />
    </Canvas>
  ),
}

// 조회 중 — 검색 조건은 잠기고 표에는 로딩 오버레이(툴바 새로고침 아이콘도 회전)
export const Loading: Story = {
  args: { loading: true },
  render: (args) => (
    <Canvas>
      <ProductList {...args} onRefresh={() => {}} />
    </Canvas>
  ),
}

// 표만 — 검색·탭·툴바·컬럼 피커를 모두 끈 위젯형(대시보드 카드 안에 끼워 넣을 때)
export const Minimal: Story = {
  args: {
    showSearch: false,
    showTabs: false,
    showToolbar: false,
    columnPicker: false,
  },
  render: (args) => (
    <Canvas>
      <ProductListDemo {...args} />
    </Canvas>
  ),
}

// 아이콘 교체 — 일괄 처리 버튼의 lucide 기본 아이콘을 서비스 아이콘으로 갈아끼운다
export const CustomIcons: Story = {
  args: {
    activeIcon: <CircleCheck size={14} aria-hidden="true" />,
    inactiveIcon: <CircleSlash size={14} aria-hidden="true" />,
    categoryIcon: <FolderTree size={14} aria-hidden="true" />,
  },
  render: (args) => (
    <Canvas>
      <ProductListDemo {...args} />
    </Canvas>
  ),
}

// 문구 교체 — 같은 표를 '상품'이 아닌 품목(자재)에 쓸 때. 빈 문구·품절 배지·재고 단위가 바뀐다
export const CustomCopy: Story = {
  args: {
    emptyText: '등록된 자재가 없습니다.',
    searchPlaceholder: '자재명 입력',
    soldOutLabel: '재고 없음',
    countUnit: 'EA',
  },
  render: (args) => (
    <Canvas>
      <ProductListDemo {...args} initialView="card" />
    </Canvas>
  ),
}
