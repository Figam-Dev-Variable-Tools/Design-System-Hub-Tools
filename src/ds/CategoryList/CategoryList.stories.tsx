import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Eye, EyeOff } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { CategoryList, type CategoryListShow, type CategoryRow } from './CategoryList'

// ── 목데이터 — 시공 분야 카테고리 18건(레퍼런스와 같은 결) ────────────────
// 표식은 이모지 / 이미지 / (둘 다 없음 → 공용 대체 그림) 세 가지가 섞여 있다.
const CATEGORY_ROWS: CategoryRow[] = [
  {
    id: 'cat-01',
    order: 1,
    name: '도배',
    emoji: '🧻',
    description: '합지·실크 도배, 부분 보수 시공',
    createdAt: '2025-01-06',
    updatedAt: '2026-05-11',
    createdBy: '홍성보',
    updatedBy: '김서연',
    active: true,
  },
  {
    id: 'cat-02',
    order: 2,
    name: '바닥재',
    emoji: '🪵',
    description: '장판·강마루·강화마루·데코타일',
    createdAt: '2025-01-06',
    updatedAt: '2026-04-28',
    createdBy: '홍성보',
    updatedBy: '김서연',
    active: true,
  },
  {
    id: 'cat-03',
    order: 3,
    name: '욕실 리모델링',
    emoji: '🛁',
    description: '욕실 전체 철거 후 방수·타일·도기 교체',
    createdAt: '2025-01-06',
    updatedAt: '2026-06-02',
    createdBy: '홍성보',
    updatedBy: '이준호',
    active: true,
  },
  {
    id: 'cat-04',
    order: 4,
    name: '주방·싱크대',
    emoji: '🍳',
    description: '싱크대 교체, 상판·타일 시공, 아일랜드 제작',
    createdAt: '2025-01-06',
    updatedAt: '2026-03-19',
    createdBy: '홍성보',
    updatedBy: '이준호',
    active: true,
  },
  {
    id: 'cat-05',
    order: 5,
    name: '창호·샤시',
    // 이미지로 등록한 카테고리 — 이모지가 없으면 썸네일이 뜬다
    image: mockImage('창호', 'slate'),
    description: '이중창 교체, 발코니 샤시, 방충망',
    createdAt: '2025-02-14',
    updatedAt: '2026-06-24',
    createdBy: '김서연',
    updatedBy: '김서연',
    active: true,
  },
  {
    id: 'cat-06',
    order: 6,
    name: '타일',
    emoji: '🧱',
    description: '현관·주방·욕실 타일 덧방 및 철거 시공',
    createdAt: '2025-02-14',
    updatedAt: '2026-01-30',
    createdBy: '김서연',
    updatedBy: '박지민',
    active: true,
  },
  {
    id: 'cat-07',
    order: 7,
    name: '페인트·도장',
    emoji: '🎨',
    description: '벽면·천장 도장, 몰딩 리폼',
    createdAt: '2025-02-14',
    updatedAt: '2026-02-17',
    createdBy: '김서연',
    updatedBy: '박지민',
    active: true,
  },
  {
    id: 'cat-08',
    order: 8,
    name: '목공·몰딩',
    emoji: '🪚',
    description: '가벽·아트월·걸레받이·문선 시공',
    createdAt: '2025-03-03',
    updatedAt: '2026-05-06',
    createdBy: '이준호',
    updatedBy: '이준호',
    active: true,
  },
  {
    id: 'cat-09',
    order: 9,
    name: '전기·조명',
    emoji: '💡',
    description: '배선 교체, 매입등·레일조명 설치',
    createdAt: '2025-03-03',
    updatedAt: '2026-06-30',
    createdBy: '이준호',
    updatedBy: '최수아',
    active: true,
  },
  {
    id: 'cat-10',
    order: 10,
    name: '설비·배관',
    emoji: '🚿',
    description: '급수·배수관 교체, 보일러 이설',
    createdAt: '2025-03-03',
    updatedAt: '2026-04-02',
    createdBy: '이준호',
    updatedBy: '최수아',
    active: true,
  },
  {
    id: 'cat-11',
    order: 11,
    name: '철거·폐기물',
    emoji: '🔨',
    description: '내부 철거 및 폐기물 반출',
    createdAt: '2025-04-21',
    updatedAt: '2026-03-11',
    createdBy: '박지민',
    updatedBy: '박지민',
    active: true,
  },
  {
    id: 'cat-12',
    order: 12,
    name: '도어·중문',
    emoji: '🚪',
    description: 'ABS 도어, 3연동 중문, 현관 중문',
    createdAt: '2025-04-21',
    updatedAt: '2026-05-27',
    createdBy: '박지민',
    updatedBy: '김서연',
    active: true,
  },
  {
    id: 'cat-13',
    order: 13,
    name: '붙박이장·수납',
    emoji: '🗄️',
    description: '드레스룸, 팬트리, 신발장 제작',
    createdAt: '2025-05-19',
    updatedAt: '2026-02-05',
    createdBy: '박지민',
    updatedBy: '이준호',
    active: true,
  },
  {
    id: 'cat-14',
    order: 14,
    name: '필름·시트',
    emoji: '🎞️',
    description: '싱크대·문틀 인테리어 필름 리폼',
    createdAt: '2025-05-19',
    updatedAt: '2025-12-18',
    createdBy: '최수아',
    updatedBy: '최수아',
    active: false,
  },
  {
    id: 'cat-15',
    order: 15,
    name: '방수·외장',
    image: mockImage('외장', 'sand'),
    description: '옥상·베란다 방수, 외벽 크랙 보수',
    createdAt: '2025-07-08',
    updatedAt: '2026-01-14',
    createdBy: '최수아',
    updatedBy: '홍성보',
    active: false,
  },
  {
    id: 'cat-16',
    order: 16,
    name: '베란다·조경',
    emoji: '🪴',
    description: '베란다 확장, 실내 정원·데크 시공',
    createdAt: '2025-09-02',
    updatedAt: '2026-06-09',
    createdBy: '최수아',
    updatedBy: '홍성보',
    active: true,
  },
  {
    id: 'cat-17',
    order: 17,
    name: '인테리어 설계',
    emoji: '📐',
    description: '3D 도면·자재 선정 컨설팅',
    createdAt: '2026-01-12',
    updatedAt: '2026-07-01',
    createdBy: '홍성보',
    updatedBy: '홍성보',
    active: true,
  },
  {
    id: 'cat-18',
    order: 18,
    name: '기타 시공',
    // 이모지·이미지 둘 다 없는 행 — 공용 Placeholder(image)로 떨어진다
    description: '분류에 없는 소규모 시공 문의',
    createdAt: '2026-01-12',
    updatedAt: '2026-01-12',
    createdBy: '홍성보',
    updatedBy: '홍성보',
    active: false,
  },
]

/** 대부분 OFF — 남는 건 표 하나뿐이다 */
const MINIMAL_SHOW: CategoryListShow = {
  header: false,
  tabs: false,
  toolbar: false,
  pagination: false,
  bulk: false,
}

const meta = {
  title: 'Admin/CategoryList',
  component: CategoryList,
  tags: ['autodocs'],
  args: {
    rows: CATEGORY_ROWS,
    density: 'compact',
  },
  argTypes: {
    headerActions: { control: false },
    bulkActions: { control: false },
    columnVisibility: { control: false },
    // 섹션 ON/OFF — columnPicker·export도 이 객체의 키다(top-level prop을 새로 늘리지 않는다)
    show: { control: 'object' },
    // 툴바 Select 항목 — 모듈 상수 대신 넘길 수 있다
    statusOptions: { control: false },
    sortOptions: { control: false },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    addIcon: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof CategoryList>

export default meta
type Story = StoryObj<typeof meta>

/* ────────────────────────────────────────────────────────────────────────── */

/** 드래그 순서 변경·활성화 토글·일괄 처리가 실제로 도는 데모 */
function CategoryListDemo({ show }: { show?: CategoryListShow }) {
  const [rows, setRows] = useState(CATEGORY_ROWS)

  return (
    <CategoryList
      rows={rows}
      show={show}
      onAdd={() => {}}
      onReorder={setRows}
      onToggleActive={(row, next) =>
        setRows((prev) =>
          prev.map((item) => (item.id === row.id ? { ...item, active: next } : item)),
        )
      }
      onView={() => {}}
      onEdit={() => {}}
      onDelete={(row) => setRows((prev) => prev.filter((item) => item.id !== row.id))}
      bulkActions={[
        {
          key: 'activate',
          label: '활성화',
          icon: <Eye size={14} />,
          onAction: (ids) =>
            setRows((prev) =>
              prev.map((item) => (ids.includes(item.id) ? { ...item, active: true } : item)),
            ),
        },
        {
          key: 'deactivate',
          label: '비활성화',
          icon: <EyeOff size={14} />,
          onAction: (ids) =>
            setRows((prev) =>
              prev.map((item) => (ids.includes(item.id) ? { ...item, active: false } : item)),
            ),
        },
      ]}
      onBulkDelete={(ids) => setRows((prev) => prev.filter((item) => !ids.includes(item.id)))}
    />
  )
}

/**
 * 전부 ON — 헤더(+ 카테고리 등록) · 상태 탭 · 툴바(전체 상태 ▾ / 검색 / 순번순 ▾ / 18건) ·
 * 표(드래그·순번·카테고리명·설명·등록일·수정일·등록자·수정자·활성화·관리) · 일괄 처리 · 페이지네이션.
 */
export const AllSections: Story = {
  render: () => <CategoryListDemo />,
}

/**
 * 대부분 OFF — header/tabs/toolbar/pagination/bulk 전부 false.
 * 표만 남고 헤더·탭·툴바·체크박스 열·하단 바가 자리째 사라진다(빈 여백 없음).
 */
export const Minimal: Story = {
  render: () => <CategoryListDemo show={MINIMAL_SHOW} />,
}

/** 헤더·툴바만 — 탭과 일괄 처리를 끈 중간 구성(섹션 단위로 얼마든지 조합된다) */
export const NoTabsNoBulk: Story = {
  render: () => <CategoryListDemo show={{ tabs: false, bulk: false }} />,
}

/** 열 단위 ON/OFF — 새 prop을 만들지 않고 AdminTable의 columnVisibility로 등록자·수정자·수정일을 끈다 */
export const HiddenColumns: Story = {
  args: {
    columnVisibility: { createdBy: false, updatedBy: false, updatedAt: false },
    onEdit: () => {},
    onDelete: () => {},
    onAdd: () => {},
  },
}

/** 등록된 카테고리가 없을 때 — 표는 EmptyState로 떨어지고 헤더·탭·툴바는 그대로 남는다 */
export const Empty: Story = {
  args: {
    rows: [],
    onAdd: () => {},
  },
}

/** 조회 중 — 표 위에 오버레이가 뜬다 */
export const Loading: Story = {
  args: {
    loading: true,
    onAdd: () => {},
  },
}

/**
 * 표 도구 OFF — show.columnPicker / show.export로 표 우상단 [컬럼]·[내보내기]만 끈다.
 * 툴바(검색·필터·정렬·건수)는 그대로 남는다 — CSV 반출이나 열 재구성을 막아야 하는 화면용.
 */
export const WithoutTableTools: Story = {
  args: {
    show: { columnPicker: false, export: false },
    onEdit: () => {},
    onDelete: () => {},
    onAdd: () => {},
  },
}

/**
 * 툴바 Select 항목 교체 — statusOptions / sortOptions.
 * value는 CategoryStatusFilter · CategorySortKey와 맞춰야 필터·정렬이 계속 동작한다.
 */
export const CustomOptions: Story = {
  args: {
    statusOptions: [
      { value: 'all', label: '전체' },
      { value: 'active', label: '노출 중' },
      { value: 'inactive', label: '숨김' },
    ],
    sortOptions: [
      { value: 'order', label: '노출 순서' },
      { value: 'name', label: '가나다순' },
    ],
    searchPlaceholder: '카테고리 이름으로 찾기',
    onEdit: () => {},
    onAdd: () => {},
  },
}
