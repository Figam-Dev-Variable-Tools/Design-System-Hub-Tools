import { useMemo, useState, type ReactNode } from 'react'
import { Ban, CheckCheck, Tags } from 'lucide-react'
import {
  downloadCsv,
  downloadExcelXml,
  toCsv,
  type ExportColumn,
} from '../../shared/tableExport'
import styles from './ProductList.module.css'
import { AdminListPage } from '../AdminListPage/AdminListPage'
import { type AdminBulkAction, type AdminColumn } from '../AdminTable/AdminTable'
import { AdminCard, type AdminCardBadge } from '../AdminCard/AdminCard'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import type { SearchFieldDef, SearchValues } from '../SearchPanel/SearchPanel'
import { ToolbarActions } from '../ToolbarActions/ToolbarActions'
import { CrudDialog } from '../CrudDialog/CrudDialog'
import { Badge } from '../Badge/Badge'
import { Select } from '../Select/Select'
import type { ViewSwitchValue } from '../ViewSwitch/ViewSwitch'

export type ProductRow = {
  id: string
  code: string
  name: string
  category: string
  price: number
  salePrice?: number
  stock: number
  active: boolean
  thumbnail?: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
}

export type ProductListProps = {
  rows: ProductRow[]
  /** 서버 페이징 시 전체 건수 — 없으면 탭으로 걸러진 rows 길이를 쓴다 */
  total?: number
  loading?: boolean
  onSearch?: (values: SearchValues) => void
  /** 상세 열기 — 상품명 클릭·카드 클릭·관리 수정 버튼이 함께 부른다 */
  onRowOpen?: (row: ProductRow) => void
  onToggleActive?: (id: string, next: boolean) => void
  /** 일괄 판매상태 전환(판매중/판매중지) */
  onBulkActive?: (ids: string[], active: boolean) => void
  /** 일괄 카테고리 변경 — categories가 비어 있으면 버튼을 숨긴다 */
  onBulkCategory?: (ids: string[], category: string) => void
  onBulkDelete?: (ids: string[]) => void
  /** 카테고리 목록 — 탭·검색 조건·일괄 변경이 모두 이 목록을 공유한다 */
  categories?: string[]
  /** 카드형/게시물형 — 주지 않으면 컴포넌트가 내부 상태로 관리한다(비제어) */
  view?: ViewSwitchValue
  onViewChange?: (view: ViewSwitchValue) => void
  /** 있으면 툴바에 새로고침 버튼 노출 */
  onRefresh?: () => void
  exportFilename?: string

  // ── ON/OFF ──────────────────────────────────────────────────────────
  // 같은 프리셋을 검색 없는 위젯·탭 없는 단일 카테고리 화면으로도 쓰기 위한 스위치.
  // 전부 기본 true라 아무것도 넘기지 않으면 지금 화면 그대로다.
  /** 상단 검색 패널 */
  showSearch?: boolean
  /** 카테고리 탭 */
  showTabs?: boolean
  /** 목록 상단 액션(내보내기·새로고침) */
  showToolbar?: boolean
  /** 표 우상단 '컬럼' 피커 — AdminTable의 같은 prop으로 그대로 넘어간다 */
  columnPicker?: boolean

  // ── 아이콘 슬롯 ──────────────────────────────────────────────────────
  // 일괄 처리 버튼의 lucide 아이콘 교체용. 서비스 아이콘 세트가 따로 있는 팀을 위한 자리다.
  /** 판매중 전환 */
  activeIcon?: ReactNode
  /** 판매중지 */
  inactiveIcon?: ReactNode
  /** 카테고리 변경 */
  categoryIcon?: ReactNode

  // ── 카피 ────────────────────────────────────────────────────────────
  // 같은 표를 '상품'이 아닌 품목(자재·도서 …)에도 쓰려면 문구만 갈아끼우면 되게 한다.
  /** 목록이 비었을 때 — 표·카드 그리드가 함께 쓴다 */
  emptyText?: string
  /** 검색 패널의 상품명 입력 힌트 */
  searchPlaceholder?: string
  /** 재고 0 배지 문구 — 표 재고 셀과 카드 오버레이가 함께 쓴다 */
  soldOutLabel?: string
  /** 카드 '재고' 값의 단위 */
  countUnit?: string
}

/** 한 페이지 행/카드 수 — 카드형·게시물형이 같은 페이지를 공유한다 */
const PAGE_SIZE = 10

/** 이 수량 이하면 '재고 부족' 경고 */
const LOW_STOCK = 10

/** 카테고리 탭의 '전체' 센티넬 — 카테고리명과 겹치지 않게 */
const ALL = '__all__'

const ACTIVE_OPTIONS = [
  { label: '판매중', value: 'true' },
  { label: '판매중지', value: 'false' },
]

/** ₩1,234,000 */
function formatPrice(value: number): string {
  return `₩${value.toLocaleString('ko-KR')}`
}

/** 정가 대비 할인율(내림) */
function discountRate(row: ProductRow): number {
  if (row.salePrice == null || row.price <= 0) return 0
  return Math.floor(((row.price - row.salePrice) / row.price) * 100)
}

/** 카드 썸네일 좌상단 오버레이 배지 — 재고/할인처럼 "눈에 먼저 띄어야 할" 것만 */
function badgesOf(row: ProductRow, soldOutLabel: string): AdminCardBadge[] {
  const badges: AdminCardBadge[] = []
  if (row.stock === 0) badges.push({ label: soldOutLabel, tone: 'error' })
  else if (row.stock <= LOW_STOCK) badges.push({ label: '재고 부족', tone: 'warning' })
  if (row.salePrice != null) badges.push({ label: `${discountRate(row)}% 할인`, tone: 'primary' })
  return badges
}

/** 내보내기 컬럼 — 썸네일/체크박스처럼 값이 없는 컬럼은 제외 */
const EXPORT_COLUMNS: ExportColumn<ProductRow>[] = [
  { key: 'code', header: '상품코드', value: (row) => row.code },
  { key: 'name', header: '상품명', value: (row) => row.name },
  { key: 'category', header: '카테고리', value: (row) => row.category },
  // 가격·재고는 숫자로 내보내야 엑셀에서 합계가 된다(₩ 문자열 금지)
  { key: 'price', header: '가격', value: (row) => row.price },
  { key: 'salePrice', header: '할인가', value: (row) => row.salePrice ?? '' },
  { key: 'stock', header: '재고', value: (row) => row.stock },
  { key: 'active', header: '판매상태', value: (row) => (row.active ? '판매중' : '판매중지') },
  { key: 'createdAt', header: '등록일', value: (row) => row.createdAt },
  { key: 'updatedAt', header: '수정일', value: (row) => row.updatedAt ?? '' },
  { key: 'createdBy', header: '등록자', value: (row) => row.createdBy ?? '' },
]

/** 값을 골라야 하는 확인창(카테고리) + 삭제 확인창 — 둘 다 대상 id를 따로 들고 있는다 */
type DialogKind = 'category' | 'delete'

/**
 * ProductList — 상품 목록 화면 프리셋.
 *
 * 화면 골격(검색 패널·탭·카드/게시물 전환·표·카드 그리드·페이징·선택·일괄 처리 바)은 AdminListPage가 갖는다.
 * 이 파일에 남는 것은 이 화면만의 것뿐이다 —
 *   1) 컬럼      : 썸네일·상품명·코드·카테고리·가격·할인가·재고·판매상태·등록/수정일·등록자·관리
 *   2) 카드      : AdminCard(썸네일 배지·가격·재고·판매 토글)
 *   3) 한국어 문구와 내보내기(CSV/Excel) · 확인창(카테고리 변경 · 삭제)
 *
 * 페이지 헤더가 없다(chrome='plain') — 바깥(AdminSuite)이 이미 PageContainer다.
 * 카테고리 탭은 이 화면이 직접 들고 있다(state) — 내보내기와 순번이 '탭으로 걸러진 전체 목록'을
 * 필요로 하기 때문이다(셸은 페이지로 자른 뒤의 행만 알려 준다).
 */
export function ProductList({
  rows,
  total,
  loading = false,
  onSearch,
  onRowOpen,
  onToggleActive,
  onBulkActive,
  onBulkCategory,
  onBulkDelete,
  categories = [],
  view,
  onViewChange,
  onRefresh,
  exportFilename = '상품목록',
  showSearch = true,
  showTabs = true,
  showToolbar = true,
  columnPicker = true,
  activeIcon,
  inactiveIcon,
  categoryIcon,
  emptyText = '등록된 상품이 없습니다.',
  searchPlaceholder = '상품명 입력',
  soldOutLabel = '품절',
  countUnit = '개',
}: ProductListProps) {
  // ── 검색 조건 — 값·초기화·엔터는 셸이 굴린다. 여기서는 조건 목록만 선언한다 ──
  const fields = useMemo<SearchFieldDef[]>(
    () => [
      { kind: 'text', key: 'name', label: '상품명', placeholder: searchPlaceholder, span: 2 },
      { kind: 'text', key: 'code', label: '상품코드', placeholder: 'P-0000' },
      {
        kind: 'select',
        key: 'category',
        label: '카테고리',
        options: categories.map((category) => ({ label: category, value: category })),
      },
      { kind: 'select', key: 'active', label: '판매상태', options: ACTIVE_OPTIONS },
      // 가격·재고는 min/max 두 칸으로 범위를 만든다(SearchPanel의 number 필드 재사용)
      { kind: 'number', key: 'priceMin', label: '가격(최저)' },
      { kind: 'number', key: 'priceMax', label: '가격(최고)' },
      { kind: 'number', key: 'stockMin', label: '재고(최소)' },
      { kind: 'number', key: 'stockMax', label: '재고(최대)' },
      {
        kind: 'daterange',
        key: 'period',
        label: '등록기간',
        presets: ['today', '7d', '30d', '90d'],
        span: 2,
      },
    ],
    [categories, searchPlaceholder],
  )

  const [tab, setTab] = useState<string>(ALL)
  // 선택은 카드 렌더러와 확인창이 함께 읽어야 해서 이 화면이 들고 있는다(셸에는 제어값으로 넘긴다)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 확인창 — 카테고리는 값 선택, 삭제는 확인만.
  // targetIds를 따로 두어 표의 행 단위 삭제(관리 > 휴지통)와 선택 삭제가 같은 확인창을 쓴다.
  const [dialog, setDialog] = useState<DialogKind | null>(null)
  const [targetIds, setTargetIds] = useState<string[]>([])
  const [categoryDraft, setCategoryDraft] = useState<string | null>(null)

  // ── 카테고리 탭 — 셸에는 걸러진 rows를 넘긴다(내보내기·순번이 이 배열을 함께 쓴다) ──
  const filtered = useMemo(
    () => (tab === ALL ? rows : rows.filter((row) => row.category === tab)),
    [rows, tab],
  )

  const tabItems: CategoryTabItem[] = [
    { label: '전체', value: ALL, count: rows.length, fixed: true },
    ...categories.map((category) => ({
      label: category,
      value: category,
      count: rows.filter((row) => row.category === category).length,
      fixed: true,
    })),
  ]

  // 순번은 페이지를 넘겨도 이어진다(2페이지 → 11부터)
  const seqOf = new Map(filtered.map((row, index) => [row.id, index + 1]))

  // ── 내보내기 — 현재 탭으로 걸러진 전체 행(현재 페이지가 아니라) ─────────
  const handleExportCsv = () => {
    downloadCsv(exportFilename, toCsv(filtered, EXPORT_COLUMNS))
  }

  const handleExportExcel = () => {
    downloadExcelXml(exportFilename, filtered, EXPORT_COLUMNS)
  }

  // ── 일괄 처리 ────────────────────────────────────────────────────────
  const openCategory = (ids: string[]) => {
    setTargetIds(ids)
    setCategoryDraft(categories[0] ?? null)
    setDialog('category')
  }

  const openDelete = (ids: string[]) => {
    setTargetIds(ids)
    setDialog('delete')
  }

  /** 처리한 행은 선택에서 빼고 확인창을 닫는다 */
  const finish = (run: () => void) => {
    run()
    const done = new Set(targetIds)
    setSelectedIds((prev) => prev.filter((id) => !done.has(id)))
    setDialog(null)
  }

  const bulkActive = (ids: string[], next: boolean) => {
    onBulkActive?.(ids, next)
    setSelectedIds([])
  }

  const canBulkCategory = onBulkCategory != null && categories.length > 0
  const hasBulk = onBulkActive != null || canBulkCategory || onBulkDelete != null

  /**
   * 선택 바는 셸이 그린다 — 게시물형은 AdminTable의 내장 바, 카드형은 셸의 카드 선택 바.
   * 여기서는 버튼 목록만 넘긴다(삭제 버튼은 onBulkDelete가 있으면 셸이 붙인다).
   * 넘길 콜백이 하나도 없으면 배열을 비워 바 자체가 뜨지 않게 한다.
   */
  const bulkActions: AdminBulkAction[] = []
  if (onBulkActive != null) {
    bulkActions.push({
      key: 'activate',
      label: '판매중 전환',
      tone: 'primary',
      icon: activeIcon ?? <CheckCheck size={14} aria-hidden="true" />,
      onAction: (ids) => bulkActive(ids, true),
    })
    bulkActions.push({
      key: 'deactivate',
      label: '판매중지',
      tone: 'secondary',
      icon: inactiveIcon ?? <Ban size={14} aria-hidden="true" />,
      onAction: (ids) => bulkActive(ids, false),
    })
  }
  if (canBulkCategory) {
    bulkActions.push({
      key: 'category',
      label: '카테고리 변경',
      tone: 'secondary',
      icon: categoryIcon ?? <Tags size={14} aria-hidden="true" />,
      onAction: (ids) => openCategory(ids),
    })
  }
  if (hasBulk) {
    // 표 헤더 체크박스 말고도 한 번에 푸는 길을 남겨 둔다(기존 바에 있던 버튼)
    bulkActions.push({
      key: 'clear',
      label: '선택 해제',
      tone: 'secondary',
      onAction: () => setSelectedIds([]),
    })
  }

  // ── 컬럼 ─────────────────────────────────────────────────────────────
  const columns: AdminColumn<ProductRow>[] = [
    { kind: 'select', key: 'select', pinned: 'left' },
    { kind: 'index', key: 'index', value: (row) => seqOf.get(row.id) },
    { kind: 'thumbnail', key: 'thumbnail', header: '이미지', value: (row) => row.thumbnail },
    { kind: 'title', key: 'name', header: '상품명', sortable: true, onClick: onRowOpen },
    {
      kind: 'text',
      key: 'code',
      header: '상품코드',
      ratio: 1,
      sortable: true,
      onClick: onRowOpen,
      render: (row) => <span className={styles.code}>{row.code}</span>,
    },
    { kind: 'category', key: 'category', header: '카테고리', sortable: true },
    { kind: 'price', key: 'price', header: '가격', sortable: true },
    {
      kind: 'price',
      key: 'salePrice',
      header: '할인가',
      sortable: true,
      // 정렬은 숫자로(할인 없음 = 0) — 문자열이 섞이면 수치 비교가 깨진다
      value: (row) => row.salePrice ?? 0,
      // 화면에는 0원이 아니라 '—'
      render: (row) =>
        row.salePrice == null ? (
          <span className={styles.none}>—</span>
        ) : (
          <span className={styles.sale}>{formatPrice(row.salePrice)}</span>
        ),
    },
    {
      kind: 'number',
      key: 'stock',
      header: '재고',
      sortable: true,
      // 품절/재고 부족은 숫자가 아니라 톤 배지로 즉시 읽히게
      render: (row) => {
        if (row.stock === 0) {
          return <Badge variant="error" appearance="soft" size="sm" label={soldOutLabel} />
        }
        if (row.stock <= LOW_STOCK) {
          return (
            <Badge
              variant="warning"
              appearance="soft"
              size="sm"
              label={row.stock.toLocaleString('ko-KR')}
            />
          )
        }
        return <span className={styles.number}>{row.stock.toLocaleString('ko-KR')}</span>
      },
    },
    { kind: 'status', key: 'active', header: '판매상태' },
    { kind: 'date', key: 'createdAt', header: '등록일', sortable: true },
    {
      kind: 'date',
      key: 'updatedAt',
      header: '수정일',
      sortable: true,
      value: (row) => row.updatedAt ?? '-',
    },
    { kind: 'user', key: 'createdBy', header: '등록자', value: (row) => row.createdBy ?? '-' },
    { kind: 'actions', key: 'actions', header: '관리', pinned: 'right' },
  ]

  // ── 카드형 본문 — 그리드 배치와 키는 셸이 잡는다 ────────────────────────
  const renderCard = (row: ProductRow) => (
    <AdminCard
      thumbnail={row.thumbnail}
      title={row.name}
      subtitle={`${row.category} · ${row.code}`}
      badges={badgesOf(row, soldOutLabel)}
      meta={[
        { label: '가격', value: formatPrice(row.salePrice ?? row.price) },
        { label: '재고', value: `${row.stock.toLocaleString('ko-KR')}${countUnit}` },
        { label: '등록일', value: row.createdAt },
      ]}
      active={row.active}
      onToggleActive={onToggleActive != null ? (next) => onToggleActive(row.id, next) : undefined}
      selected={selectedIds.includes(row.id)}
      onSelectChange={(next) =>
        setSelectedIds((prev) => (next ? [...prev, row.id] : prev.filter((id) => id !== row.id)))
      }
      onEdit={onRowOpen != null ? () => onRowOpen(row) : undefined}
      onDelete={onBulkDelete != null ? () => openDelete([row.id]) : undefined}
      onClick={onRowOpen != null ? () => onRowOpen(row) : undefined}
    />
  )

  return (
    <>
      <AdminListPage
        rows={filtered}
        columns={columns}
        rowKey={(row) => row.id}
        total={total}
        loading={loading}
        // 페이지 헤더 없이 조각만 쌓는다 — 바깥이 이미 PageContainer다
        chrome="plain"
        tabs={tabItems}
        tab={tab}
        onTabChange={setTab}
        search="panel"
        searchFields={fields}
        onSearch={onSearch}
        // 카드형/게시물형 — 본문이 AdminListView를 지난다(건수·전환·페이징이 그 상단/하단 바로 모인다)
        view={view}
        onViewChange={onViewChange}
        renderCard={renderCard}
        viewToolbar={
          showToolbar ? (
            <ToolbarActions
              size="sm"
              exportMenu={[
                { label: 'CSV로 내보내기', onSelect: handleExportCsv },
                { label: 'Excel로 내보내기', onSelect: handleExportExcel },
              ]}
              onRefresh={onRefresh}
              refreshing={loading}
            />
          ) : undefined
        }
        totalLabel="전체"
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        bulkActions={bulkActions}
        // 카테고리 변경·삭제는 확인창을 연다 — 셸이 미리 선택을 비우면 대상 건수를 잃는다
        clearSelectionOnBulk={false}
        // 삭제는 이 화면의 확인창을 거친다(행 단위 삭제와 같은 창을 쓴다).
        // 콜백이 없으면 넘기지 않는다 — 그래야 표·카드 선택 바에 삭제 버튼이 뜨지 않는다
        onBulkDelete={onBulkDelete != null ? openDelete : undefined}
        onEdit={onRowOpen}
        onDelete={onBulkDelete != null ? (row) => openDelete([row.id]) : undefined}
        onToggleStatus={(row, next) => onToggleActive?.(row.id, next)}
        columnPicker={columnPicker}
        // 내보내기는 표 우상단이 아니라 목록 툴바(ToolbarActions)가 갖는다
        exportable={false}
        pageSize={PAGE_SIZE}
        emptyText={emptyText}
        // 썸네일이 있는 행이라 표 기본 밀도를 지킨다
        density="comfortable"
        show={{ tabs: showTabs, search: showSearch, toolbar: false }}
      />

      {dialog === 'category' && (
        <CrudDialog
          open
          mode="edit"
          title="카테고리 변경"
          description={`선택한 ${targetIds.length}건의 카테고리를 변경합니다.`}
          confirmLabel="변경"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            if (categoryDraft == null) return
            finish(() => onBulkCategory?.(targetIds, categoryDraft))
          }}
        >
          <div className={styles.field}>
            <Select
              label="카테고리"
              value={categoryDraft}
              options={categories.map((category) => ({ label: category, value: category }))}
              placeholder="카테고리 선택"
              onChange={setCategoryDraft}
            />
          </div>
        </CrudDialog>
      )}

      {dialog === 'delete' && (
        <CrudDialog
          open
          mode="delete"
          title="선택한 상품을 삭제할까요?"
          description={`상품 ${targetIds.length}건이 목록에서 제거됩니다.`}
          onCancel={() => setDialog(null)}
          onConfirm={() => finish(() => onBulkDelete?.(targetIds))}
        />
      )}
    </>
  )
}
