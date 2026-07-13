import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Eye, EyeOff, Pencil, Pin, PinOff, Plus, Trash2 } from 'lucide-react'
import { AdminListPage, type AdminListRowContext } from '../AdminListPage/AdminListPage'
import {
  type AdminBulkAction,
  type AdminCellTag,
  type AdminColumn,
  type AdminRowMenuItem,
} from '../AdminTable/AdminTable'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import type { SearchFieldDef, SearchValues } from '../SearchPanel/SearchPanel'

/** 공지 노출 상태 — 예약은 '발행일이 아직 오지 않은 노출 대기' */
export type NoticeStatus = 'visible' | 'hidden' | 'scheduled'

export type NoticeRow = {
  id: string
  /** 카테고리 라벨(공지/이벤트/점검…) — 배지로 렌더된다 */
  category: string
  title: string
  author: string
  createdAt: string
  updatedAt: string
  views: number
  /**
   * 노출 상태의 단일 소스. 노출 토글은 이 값을 보고 켜지고(visible),
   * 숨김·예약은 모두 꺼진 상태로 보인다 — boolean을 따로 두면 두 값이 어긋난다.
   */
  status: NoticeStatus
  /** 상단 고정 — 목록에서 항상 위로 끌어올린다 */
  pinned?: boolean
  /** 중요 공지 — 제목 앞 태그 */
  important?: boolean
  /** 예약 발행 일시(status가 scheduled일 때만 의미 있음) */
  publishAt?: string
}

export type NoticeBoardProps = {
  rows: NoticeRow[]
  /** 페이지 제목 (기본 '공지사항') — 같은 표를 '이벤트'·'FAQ' 게시판으로도 쓴다 */
  title?: string
  /** 제목 아래 안내 (기본 '공지 노출 여부와 상단 고정을 관리합니다.') */
  description?: string
  /** 서버 페이징 시 전체 건수 — 없으면 탭으로 걸러진 rows 길이를 쓴다 */
  total?: number
  loading?: boolean
  /** 검색 조건의 카테고리 후보 — 미지정 시 기본값 */
  categories?: { label: string; value: string }[]
  onSearch?: (values: SearchValues) => void
  onCreate?: () => void
  /** 제목 클릭 — 상세로 이동 */
  onRowOpen?: (row: NoticeRow) => void
  onEdit?: (row: NoticeRow) => void
  /** 행 케밥 삭제와 일괄 삭제가 함께 부른다(항상 id 배열) */
  onDelete?: (ids: string[]) => void
  /** 행 안의 노출 토글 */
  onToggleVisible?: (row: NoticeRow, next: boolean) => void
  /** 행 케밥의 상단 고정/해제 */
  onTogglePin?: (row: NoticeRow, next: boolean) => void
  onBulkVisibility?: (ids: string[], visible: boolean) => void
  onBulkPin?: (ids: string[], pinned: boolean) => void
  density?: 'compact' | 'comfortable'

  /* ── 요소 ON/OFF — 전부 기본 true. false면 그 요소가 DOM에서 통째로 사라진다 ── */
  /** 상태 탭(전체·노출중·숨김·예약) */
  showTabs?: boolean
  /** 상단 검색 패널 */
  showSearch?: boolean
  /** 표 위 "N건" 툴바 */
  showCount?: boolean
  /** 표 우상단 '컬럼' 피커 */
  columnPicker?: boolean
  /** 표 우상단 '내보내기' */
  exportable?: boolean

  /* ── 문구 ── */
  /** 표가 빌 때 문구 */
  emptyText?: string
  /** 헤더 등록 버튼 문구 (기본 '공지 등록') */
  createLabel?: string
  /** 내보내기 파일명 (기본 '공지사항') */
  exportFilename?: string

  /* ── 아이콘 슬롯 ── */
  /** 등록 버튼 아이콘 (기본 Plus) */
  createIcon?: ReactNode
  /** 케밥의 '수정' 아이콘 (기본 Pencil) */
  editIcon?: ReactNode
  /** 케밥의 '삭제' 아이콘 (기본 Trash2) */
  deleteIcon?: ReactNode
}

/** 기본 카테고리 — categories prop으로 덮어쓴다 */
const DEFAULT_CATEGORIES = [
  { label: '공지', value: '공지' },
  { label: '이벤트', value: '이벤트' },
  { label: '점검', value: '점검' },
  { label: '업데이트', value: '업데이트' },
  { label: '안내', value: '안내' },
]

const STATUS_LABEL: Record<NoticeStatus, string> = {
  visible: '노출중',
  hidden: '숨김',
  scheduled: '예약',
}

const STATUS_OPTIONS = (['visible', 'hidden', 'scheduled'] as NoticeStatus[]).map((status) => ({
  label: STATUS_LABEL[status],
  value: status,
}))

/** 탭 = 전체 + 상태 3종 */
type TabKey = 'all' | NoticeStatus

const TAB_ORDER: TabKey[] = ['all', 'visible', 'hidden', 'scheduled']

const TAB_LABEL: Record<TabKey, string> = {
  all: '전체',
  visible: STATUS_LABEL.visible,
  hidden: STATUS_LABEL.hidden,
  scheduled: STATUS_LABEL.scheduled,
}

/** 건수는 셸이 matchesTab으로 rows에서 센다 — 여기서는 라벨·순서만 선언한다 */
const TAB_ITEMS: CategoryTabItem[] = TAB_ORDER.map((key) => ({
  label: TAB_LABEL[key],
  value: key,
  fixed: true,
}))

function matchesTab(row: NoticeRow, tab: string): boolean {
  return tab === 'all' || row.status === tab
}

/** 고정 공지는 항상 위 — Array.sort는 안정 정렬이라 그룹 안 순서는 rows 그대로다 */
function pinnedFirst(rows: NoticeRow[]): NoticeRow[] {
  return [...rows].sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false))
}

/**
 * NoticeBoard — 공지사항 관리 화면.
 *
 * 화면 골격(헤더·탭·검색 패널·건수 바·표·페이징·선택·일괄 처리·삭제 확인창)은 AdminListPage가 갖는다.
 * 이 파일에 남는 것은 이 화면만의 것 세 가지뿐이다 —
 *   1) 컬럼      : 체크박스·순번·카테고리·제목(태그)·작성자·등록일·수정일·조회수·노출 토글·케밥
 *   2) 상태 축   : visible/hidden/scheduled 의 라벨·탭, 고정 공지 우선 정렬
 *   3) 한국어 문구: 타이틀·설명·등록 버튼·삭제 확인·빈 상태·내보내기 파일명
 *
 * 탭 필터·정렬(고정 우선)·페이징은 rows에 대해 클라이언트에서 처리한다.
 * 검색은 조건만 모아 onSearch로 넘긴다(필터링은 호출자 몫 — 서버 검색 전제).
 */
export function NoticeBoard({
  rows,
  title = '공지사항',
  description = '공지 노출 여부와 상단 고정을 관리합니다.',
  total,
  loading = false,
  categories = DEFAULT_CATEGORIES,
  onSearch,
  onCreate,
  onRowOpen,
  onEdit,
  onDelete,
  onToggleVisible,
  onTogglePin,
  onBulkVisibility,
  onBulkPin,
  density = 'compact',
  showTabs = true,
  showSearch = true,
  showCount = true,
  columnPicker = true,
  exportable = true,
  emptyText = '등록된 공지사항이 없습니다.',
  createLabel = '공지 등록',
  exportFilename = '공지사항',
  createIcon,
  editIcon,
  deleteIcon,
}: NoticeBoardProps) {
  // ── 검색 조건 — 값·초기화·엔터는 셸이 굴린다. 여기서는 조건 목록만 선언한다 ──
  const fields = useMemo<SearchFieldDef[]>(
    () => [
      { kind: 'text', key: 'title', label: '제목', placeholder: '제목으로 검색' },
      { kind: 'text', key: 'content', label: '내용', placeholder: '본문 내용으로 검색' },
      { kind: 'text', key: 'author', label: '작성자', placeholder: '작성자 입력' },
      { kind: 'daterange', key: 'period', label: '기간', presets: ['today', '7d', '30d', '90d'] },
      { kind: 'select', key: 'category', label: '카테고리', options: categories },
      { kind: 'select', key: 'status', label: '상태', options: STATUS_OPTIONS },
    ],
    [categories],
  )

  // ── 일괄 처리 — 실행 후 선택 해제는 셸이 한다 ──────────────────────────
  const bulkActions: AdminBulkAction[] = []
  if (onBulkVisibility != null) {
    bulkActions.push({
      key: 'show',
      label: '노출',
      tone: 'primary',
      icon: <Eye size={14} aria-hidden="true" />,
      onAction: (ids) => onBulkVisibility(ids, true),
    })
    bulkActions.push({
      key: 'hide',
      label: '숨김',
      icon: <EyeOff size={14} aria-hidden="true" />,
      onAction: (ids) => onBulkVisibility(ids, false),
    })
  }
  if (onBulkPin != null) {
    bulkActions.push({
      key: 'pin',
      label: '상단 고정',
      icon: <Pin size={14} aria-hidden="true" />,
      onAction: (ids) => onBulkPin(ids, true),
    })
    bulkActions.push({
      key: 'unpin',
      label: '고정 해제',
      icon: <PinOff size={14} aria-hidden="true" />,
      onAction: (ids) => onBulkPin(ids, false),
    })
  }

  /** 제목 앞 태그 — 중요·고정, 그리고 표에 상태 컬럼이 없으므로 예약도 여기서 알린다 */
  const titleTags = (row: NoticeRow): AdminCellTag[] => {
    const tags: AdminCellTag[] = []
    if (row.important === true) tags.push({ label: '중요', tone: 'error' })
    if (row.pinned === true) tags.push({ label: '고정', tone: 'primary' })
    if (row.status === 'scheduled') tags.push({ label: '예약', tone: 'warning' })
    return tags
  }

  /** 행 케밥 — 삭제는 셸의 확인창을 통해서만 실행된다(ctx.confirmDelete) */
  const rowMenu = (row: NoticeRow, ctx: AdminListRowContext): AdminRowMenuItem[] => {
    const items: AdminRowMenuItem[] = []
    if (onEdit != null) {
      items.push({
        key: 'edit',
        label: '수정',
        icon: editIcon ?? <Pencil size={14} aria-hidden="true" />,
        onSelect: () => onEdit(row),
      })
    }
    if (onTogglePin != null) {
      const pinned = row.pinned === true
      items.push({
        key: 'pin',
        label: pinned ? '고정 해제' : '상단 고정',
        icon: pinned ? <PinOff size={14} aria-hidden="true" /> : <Pin size={14} aria-hidden="true" />,
        onSelect: () => onTogglePin(row, !pinned),
      })
    }
    if (onToggleVisible != null) {
      const visible = row.status === 'visible'
      items.push({
        key: 'visibility',
        label: visible ? '숨기기' : '노출하기',
        icon: visible ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />,
        onSelect: () => onToggleVisible(row, !visible),
      })
    }
    if (onDelete != null) {
      items.push({
        key: 'delete',
        label: '삭제',
        tone: 'error',
        divider: true,
        icon: deleteIcon ?? <Trash2 size={14} aria-hidden="true" />,
        onSelect: () => ctx.confirmDelete([row.id]),
      })
    }
    return items
  }

  // ── 컬럼 — 제목 클릭(onClick)은 셸이 onRowOpen을 물린다 ────────────────
  const columns = (ctx: AdminListRowContext): AdminColumn<NoticeRow>[] => [
    { kind: 'select', key: 'select', pinned: 'left' },
    { kind: 'index', key: 'index', header: '순번' },
    { kind: 'category', key: 'category', header: '카테고리', sortable: true },
    {
      kind: 'titleTags',
      key: 'title',
      header: '제목',
      ratio: 4,
      sortable: true,
      tags: titleTags,
    },
    { kind: 'user', key: 'author', header: '작성자', sortable: true },
    { kind: 'date', key: 'createdAt', header: '등록일', sortable: true },
    { kind: 'date', key: 'updatedAt', header: '수정일', sortable: true },
    { kind: 'number', key: 'views', header: '조회수', align: 'right', sortable: true },
    {
      kind: 'status',
      key: 'status',
      header: '노출',
      // 토글은 status의 파생값 — 예약/숨김은 꺼진 상태로 보이고, 켜면 즉시 노출된다
      value: (row) => row.status === 'visible',
    },
    { kind: 'kebab', key: 'kebab', pinned: 'right', menu: (row) => rowMenu(row, ctx) },
  ]

  return (
    <AdminListPage
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      total={total}
      loading={loading}
      title={title}
      description={description}
      onCreate={onCreate}
      createLabel={createLabel}
      // 기존 화면의 마크업을 그대로 지킨다 — 등록 아이콘만 셸 기본값(aria-hidden)과 다르다
      createIcon={createIcon ?? <Plus size={16} />}
      tabs={TAB_ITEMS}
      matchTab={matchesTab}
      orderRows={pinnedFirst}
      search="panel"
      searchFields={fields}
      onSearch={onSearch}
      onRowOpen={onRowOpen}
      onToggleStatus={onToggleVisible}
      bulkActions={bulkActions}
      onBulkDelete={onDelete}
      deleteConfirm={{
        title: '선택한 공지를 삭제할까요?',
        description: (ids) => `공지 ${ids.length}건이 목록에서 제거됩니다.`,
      }}
      columnPicker={columnPicker}
      exportable={exportable}
      exportFilename={exportFilename}
      emptyText={emptyText}
      density={density}
      show={{ tabs: showTabs, search: showSearch, count: showCount }}
    />
  )
}
