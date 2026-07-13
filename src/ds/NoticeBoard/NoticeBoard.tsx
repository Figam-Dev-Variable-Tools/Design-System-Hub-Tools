import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Eye, EyeOff, Pencil, Pin, PinOff, Plus, Trash2 } from 'lucide-react'
import {
  mergeLabels,
  resolveLabel,
  type ColumnLabels,
  type ConfirmDialogLabels,
  type DeepPartialOneLevel,
  type EmptyLabels,
  type StatusLabels,
  type TabLabels,
} from '../../shared/labels'
import { AdminListPage, type AdminListRowContext } from '../AdminListPage/AdminListPage'
import {
  type AdminBulkAction,
  type AdminCellTag,
  type AdminColumn,
  type AdminColumnTone,
  type AdminRowMenuItem,
} from '../AdminTable/AdminTable'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import type { SearchFieldDef, SearchValues } from '../SearchPanel/SearchPanel'

/** 공지 노출 상태 — 예약은 '발행일이 아직 오지 않은 노출 대기' */
export type NoticeStatus = 'visible' | 'hidden' | 'scheduled'

/** 표 컬럼 — labels.columns의 키이자 AdminTable 컬럼 key */
export type NoticeColumnKey =
  | 'index'
  | 'category'
  | 'title'
  | 'author'
  | 'createdAt'
  | 'updatedAt'
  | 'views'
  | 'status'

/** 제목 앞 태그 — 중요·고정·예약 */
export type NoticeTagKey = 'important' | 'pinned' | 'scheduled'

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

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   컬럼 머리글·상태·탭·제목 태그·검색 조건·일괄 버튼·행 케밥·삭제 확인창을 한 통로로 연다.
   검색 조건은 label/placeholder를 '한 단계'로 편다 — 2단계로 파면 mergeLabels가 그룹을 통째로
   교체해 placeholder만 넘겨도 label 기본값이 사라진다.
   우선순위: 개별 prop(title·emptyText …) > labels.* > 기본값. */
type NoticeBoardLabelsResolved = {
  title: string
  description: string
  /** 헤더 등록 버튼 */
  create: string
  columns: Record<NoticeColumnKey, string>
  /** 탭·검색 Select가 함께 쓰는 상태 문구 */
  status: Record<NoticeStatus, string>
  /** 상태 탭 앞의 '전체' — 나머지 탭은 labels.status를 따라간다 */
  tabs: { all: string }
  /** 제목 앞 태그 */
  tags: Record<NoticeTagKey, string>
  /** 검색 패널 조건 — <키> = 라벨, <키>Placeholder = 입력 힌트 */
  search: {
    title: string
    titlePlaceholder: string
    content: string
    contentPlaceholder: string
    author: string
    authorPlaceholder: string
    period: string
    category: string
    status: string
  }
  /** 선택 시 표 하단에 뜨는 일괄 처리 버튼 */
  bulk: { show: string; hide: string; pin: string; unpin: string }
  /** 행 케밥 — 토글형 항목은 켜짐/꺼짐 두 문구를 함께 받는다 */
  rowMenu: {
    edit: string
    pin: string
    unpin: string
    show: string
    hide: string
    delete: string
  }
  empty: EmptyLabels
  /**
   * 삭제 확인창 — 취소 버튼은 열지 않는다.
   * 셸(AdminListPage.deleteConfirm)에 cancelLabel 축이 없어 CrudDialog 기본값('취소')이 그대로 뜬다.
   */
  deleteDialog: Required<Pick<ConfirmDialogLabels<string[]>, 'title' | 'description'>> &
    Pick<ConfirmDialogLabels<string[]>, 'confirmLabel'>
}

export const DEFAULT_NOTICE_BOARD_LABELS: NoticeBoardLabelsResolved = {
  title: '공지사항',
  description: '공지 노출 여부와 상단 고정을 관리합니다.',
  create: '공지 등록',
  columns: {
    index: '순번',
    category: '카테고리',
    title: '제목',
    author: '작성자',
    createdAt: '등록일',
    updatedAt: '수정일',
    views: '조회수',
    status: '노출',
  },
  status: { visible: '노출중', hidden: '숨김', scheduled: '예약' },
  tabs: { all: '전체' },
  tags: { important: '중요', pinned: '고정', scheduled: '예약' },
  search: {
    title: '제목',
    titlePlaceholder: '제목으로 검색',
    content: '내용',
    contentPlaceholder: '본문 내용으로 검색',
    author: '작성자',
    authorPlaceholder: '작성자 입력',
    period: '기간',
    category: '카테고리',
    status: '상태',
  },
  bulk: { show: '노출', hide: '숨김', pin: '상단 고정', unpin: '고정 해제' },
  rowMenu: {
    edit: '수정',
    pin: '상단 고정',
    unpin: '고정 해제',
    show: '노출하기',
    hide: '숨기기',
    delete: '삭제',
  },
  empty: { title: '등록된 공지사항이 없습니다.' },
  deleteDialog: {
    title: '선택한 공지를 삭제할까요?',
    description: (ids) => `공지 ${ids.length}건이 목록에서 제거됩니다.`,
  },
} as const

export type NoticeBoardLabels = DeepPartialOneLevel<NoticeBoardLabelsResolved>

/** 컬럼 머리글만 갈아끼울 때 — labels.columns와 같은 모양 */
export type NoticeColumnLabels = ColumnLabels<NoticeColumnKey>
/** 상태 문구만 갈아끼울 때 — labels.status와 같은 모양 */
export type NoticeStatusLabels = StatusLabels<NoticeStatus>
/** 탭 라벨만 갈아끼울 때 */
export type NoticeTabLabels = TabLabels<NoticeStatus>

export type NoticeBoardProps = {
  rows: NoticeRow[]
  /** @deprecated labels.title 을 쓰세요 — 같은 표를 '이벤트'·'FAQ' 게시판으로도 쓴다 */
  title?: string
  /** @deprecated labels.description 을 쓰세요 */
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
  /** @deprecated labels.empty.title 을 쓰세요 (개별 prop이 labels보다 우선한다) */
  emptyText?: string
  /** @deprecated labels.create 를 쓰세요 */
  createLabel?: string
  /** 내보내기 파일명 (기본 '공지사항') */
  exportFilename?: string
  /** 화면 문구를 통째로 갈아끼우는 단일 통로 — 개별 카피 prop이 우선한다 */
  labels?: NoticeBoardLabels

  /* ── 톤 ── */
  /** 제목 앞 태그의 톤 — 넘긴 키만 기본 톤(중요=error·고정=primary·예약=warning)을 덮어쓴다 */
  tagTone?: Partial<Record<NoticeTagKey, AdminColumnTone>>

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

/** @deprecated DEFAULT_NOTICE_BOARD_LABELS.status 를 쓰세요 (기존 이름 유지용 alias) */
export const STATUS_LABEL: Record<NoticeStatus, string> = DEFAULT_NOTICE_BOARD_LABELS.status

const STATUS_ORDER: NoticeStatus[] = ['visible', 'hidden', 'scheduled']

/** 탭 = 전체 + 상태 3종 */
type TabKey = 'all' | NoticeStatus

const TAB_ORDER: TabKey[] = ['all', 'visible', 'hidden', 'scheduled']

/** 제목 앞 태그의 기본 톤 — tagTone prop으로 키 단위 교체한다 */
const TAG_TONE: Record<NoticeTagKey, AdminColumnTone> = {
  important: 'error',
  pinned: 'primary',
  scheduled: 'warning',
}

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
  // 카피의 기본값은 DEFAULT_NOTICE_BOARD_LABELS가 갖는다 — 여기서 기본값을 주면
  // 넘기지 않은 개별 prop이 labels를 항상 이겨 통로가 막힌다
  title,
  description,
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
  emptyText,
  createLabel,
  exportFilename = '공지사항',
  labels,
  tagTone,
  createIcon,
  editIcon,
  deleteIcon,
}: NoticeBoardProps) {
  const L = mergeLabels(DEFAULT_NOTICE_BOARD_LABELS, labels)
  // 톤은 문구가 아니다 — 키마다 덮어쓰고 넘기지 않은 키는 기본 톤을 지킨다
  const tone: Record<NoticeTagKey, AdminColumnTone> = { ...TAG_TONE, ...tagTone }

  const tabItems: CategoryTabItem[] = TAB_ORDER.map((key) => ({
    label: key === 'all' ? L.tabs.all : L.status[key],
    value: key,
    fixed: true,
  }))

  // ── 검색 조건 — 값·초기화·엔터는 셸이 굴린다. 여기서는 조건 목록만 선언한다 ──
  const fields = useMemo<SearchFieldDef[]>(
    () => [
      { kind: 'text', key: 'title', label: L.search.title, placeholder: L.search.titlePlaceholder },
      {
        kind: 'text',
        key: 'content',
        label: L.search.content,
        placeholder: L.search.contentPlaceholder,
      },
      {
        kind: 'text',
        key: 'author',
        label: L.search.author,
        placeholder: L.search.authorPlaceholder,
      },
      {
        kind: 'daterange',
        key: 'period',
        label: L.search.period,
        presets: ['today', '7d', '30d', '90d'],
      },
      { kind: 'select', key: 'category', label: L.search.category, options: categories },
      {
        kind: 'select',
        key: 'status',
        label: L.search.status,
        options: STATUS_ORDER.map((status) => ({ label: L.status[status], value: status })),
      },
    ],
    [categories, L.search, L.status],
  )

  // ── 일괄 처리 — 실행 후 선택 해제는 셸이 한다 ──────────────────────────
  const bulkActions: AdminBulkAction[] = []
  if (onBulkVisibility != null) {
    bulkActions.push({
      key: 'show',
      label: L.bulk.show,
      tone: 'primary',
      icon: <Eye size={14} aria-hidden="true" />,
      onAction: (ids) => onBulkVisibility(ids, true),
    })
    bulkActions.push({
      key: 'hide',
      label: L.bulk.hide,
      icon: <EyeOff size={14} aria-hidden="true" />,
      onAction: (ids) => onBulkVisibility(ids, false),
    })
  }
  if (onBulkPin != null) {
    bulkActions.push({
      key: 'pin',
      label: L.bulk.pin,
      icon: <Pin size={14} aria-hidden="true" />,
      onAction: (ids) => onBulkPin(ids, true),
    })
    bulkActions.push({
      key: 'unpin',
      label: L.bulk.unpin,
      icon: <PinOff size={14} aria-hidden="true" />,
      onAction: (ids) => onBulkPin(ids, false),
    })
  }

  /** 제목 앞 태그 — 중요·고정, 그리고 표에 상태 컬럼이 없으므로 예약도 여기서 알린다 */
  const titleTags = (row: NoticeRow): AdminCellTag[] => {
    const tags: AdminCellTag[] = []
    if (row.important === true) tags.push({ label: L.tags.important, tone: tone.important })
    if (row.pinned === true) tags.push({ label: L.tags.pinned, tone: tone.pinned })
    if (row.status === 'scheduled') tags.push({ label: L.tags.scheduled, tone: tone.scheduled })
    return tags
  }

  /** 행 케밥 — 삭제는 셸의 확인창을 통해서만 실행된다(ctx.confirmDelete) */
  const rowMenu = (row: NoticeRow, ctx: AdminListRowContext): AdminRowMenuItem[] => {
    const items: AdminRowMenuItem[] = []
    if (onEdit != null) {
      items.push({
        key: 'edit',
        label: L.rowMenu.edit,
        icon: editIcon ?? <Pencil size={14} aria-hidden="true" />,
        onSelect: () => onEdit(row),
      })
    }
    if (onTogglePin != null) {
      const pinned = row.pinned === true
      items.push({
        key: 'pin',
        label: pinned ? L.rowMenu.unpin : L.rowMenu.pin,
        icon: pinned ? <PinOff size={14} aria-hidden="true" /> : <Pin size={14} aria-hidden="true" />,
        onSelect: () => onTogglePin(row, !pinned),
      })
    }
    if (onToggleVisible != null) {
      const visible = row.status === 'visible'
      items.push({
        key: 'visibility',
        label: visible ? L.rowMenu.hide : L.rowMenu.show,
        icon: visible ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />,
        onSelect: () => onToggleVisible(row, !visible),
      })
    }
    if (onDelete != null) {
      items.push({
        key: 'delete',
        label: L.rowMenu.delete,
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
    { kind: 'index', key: 'index', header: L.columns.index },
    { kind: 'category', key: 'category', header: L.columns.category, sortable: true },
    {
      kind: 'titleTags',
      key: 'title',
      header: L.columns.title,
      ratio: 4,
      sortable: true,
      tags: titleTags,
    },
    { kind: 'user', key: 'author', header: L.columns.author, sortable: true },
    { kind: 'date', key: 'createdAt', header: L.columns.createdAt, sortable: true },
    { kind: 'date', key: 'updatedAt', header: L.columns.updatedAt, sortable: true },
    { kind: 'number', key: 'views', header: L.columns.views, align: 'right', sortable: true },
    {
      kind: 'status',
      key: 'status',
      header: L.columns.status,
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
      title={resolveLabel(title, L.title)}
      description={resolveLabel(description, L.description)}
      onCreate={onCreate}
      createLabel={resolveLabel(createLabel, L.create)}
      // 기존 화면의 마크업을 그대로 지킨다 — 등록 아이콘만 셸 기본값(aria-hidden)과 다르다
      createIcon={createIcon ?? <Plus size={16} />}
      tabs={tabItems}
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
        title: L.deleteDialog.title,
        description: L.deleteDialog.description,
        confirmLabel: L.deleteDialog.confirmLabel,
      }}
      columnPicker={columnPicker}
      exportable={exportable}
      exportFilename={exportFilename}
      emptyText={resolveLabel(emptyText, L.empty.title)}
      density={density}
      show={{ tabs: showTabs, search: showSearch, count: showCount }}
    />
  )
}
