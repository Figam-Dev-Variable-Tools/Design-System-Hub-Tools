import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CloudUpload } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import {
  ProductListScreen,
  PRODUCT_ROWS,
  type ProductScreenRow,
  type ProductScreenStatus,
} from './ProductListScreen'

const meta = {
  title: 'Admin/ProductListScreen',
  component: ProductListScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  argTypes: {
    rows: { control: false },
    categories: { control: false },
    exhibits: { control: false },
    statusTabs: { control: false },
    searchTypes: { control: false },
    createItems: { control: false },

    // ON/OFF — 끈 슬롯은 레이아웃에서 통째로 빠진다(빈 칸 없음)
    showSide: { control: 'boolean' },
    showTabs: { control: 'boolean' },
    showToolbar: { control: 'boolean' },
    showExport: { control: 'boolean' },

    // 아이콘 슬롯
    uploadIcon: { control: false },

    // 카피
    title: { control: 'text' },
    createLabel: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    emptyText: { control: 'text' },
    countUnit: { control: 'text' },
  },
} satisfies Meta<typeof ProductListScreen>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 행 안 인라인 Select로 판매 상태가 실제로 바뀌는 데모 래퍼.
 * 화면은 데이터 주도라 상태는 바깥(여기)이 들고, 화면은 콜백만 올려보낸다.
 */
function ProductListScreenDemo({ density }: { density?: 'compact' | 'comfortable' }) {
  const [rows, setRows] = useState<ProductScreenRow[]>(PRODUCT_ROWS)

  const setStatus = (ids: string[], next: ProductScreenStatus) =>
    setRows((prev) =>
      prev.map((row) =>
        ids.includes(row.id)
          ? // 판매중으로 되돌려도 재고 0이면 품절이 맞다 — 화면 데모용 최소 규칙
            { ...row, status: next === 'onsale' && row.stock === 0 ? 'soldout' : next }
          : row,
      ),
    )

  return (
    <ProductListScreen
      rows={rows}
      density={density}
      onStatusChange={(row, next) => setStatus([row.id], next)}
      onBulkStatus={(ids, next) => setStatus(ids, next)}
      onBulkDelete={(ids) => setRows((prev) => prev.filter((row) => !ids.includes(row.id)))}
      onRowDelete={(row) => setRows((prev) => prev.filter((item) => item.id !== row.id))}
    />
  )
}

/** 레퍼런스 기본형 — compact 44px 행, 20행/페이지. 상태 Select·케밥은 행 안에서 바로 조작된다. */
export const Default: Story = {
  render: () => <ProductListScreenDemo />,
}

/** 검색 결과가 없을 때 — 표 본문만 EmptyState로 바뀌고 툴바·탭·트리는 그대로 남는다. */
export const Empty: Story = {
  args: { rows: [] },
}

/** 첫 조회 중 — 표 영역만 로딩으로 덮인다. */
export const Loading: Story = {
  args: { rows: [], loading: true },
}

/** 밀도 비교 — comfortable(56px). 표 바깥 여백은 그대로고 행 안쪽만 넉넉해진다. */
export const Comfortable: Story = {
  render: () => <ProductListScreenDemo density="comfortable" />,
}

/** 표만 — 좌측 트리·상태 탭·툴바를 모두 끈 임베드형(모달 안 상품 선택기 등). */
export const Minimal: Story = {
  args: { showSide: false, showTabs: false, showToolbar: false },
}

/** 다운로드 권한이 없는 역할 — 툴바는 그대로고 내보내기 버튼만 빠진다. */
export const NoExport: Story = {
  args: { showExport: false },
}

/** 아이콘 교체 — 헤더 [상품 일괄 등록 및 수정]의 기본 lucide 아이콘을 갈아끼운다. */
export const CustomIcons: Story = {
  args: { uploadIcon: <CloudUpload size={16} /> },
}

/** 문구 교체 — 같은 화면을 '자재' 목록으로 돌려 쓴다(타이틀·등록 버튼·검색 힌트·단위). */
export const CustomCopy: Story = {
  args: {
    title: '자재',
    createLabel: '자재 등록',
    searchPlaceholder: '자재명 · 재고번호 · 자체코드',
    emptyText: '조건에 맞는 자재가 없습니다.',
    countUnit: '개',
  },
}
