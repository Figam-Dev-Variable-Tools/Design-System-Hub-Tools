import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import {
  mergeLabels,
  resolveLabel,
  type ColumnLabels,
  type ConfirmDialogLabels,
  type DeepPartialOneLevel,
  type EmptyLabels,
  type RowScopedActionLabels,
  type SearchLabels,
  type StatusLabels,
  type TabLabels,
} from '../../shared/labels'
// 이미지 업로드+미리보기+삭제는 AdminFormPage가 이미 갖고 있다(§0-2) — DropZone을 직접
// 다시 감싸면 썸네일 폭·삭제 버튼·data URL 변환을 이 폴더에서 두 번째로 구현하게 된다.
import { AdminFormImageField } from '../AdminFormPage/AdminFormPage'
import { AdminListPage, type AdminListRowContext } from '../AdminListPage/AdminListPage'
import type { AdminColumn, AdminTableLabels } from '../AdminTable/AdminTable'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import { CrudDialog } from '../CrudDialog/CrudDialog'
import { FieldRow } from '../FieldRow/FieldRow'
import { InputBase } from '../InputBase/InputBase'
import { RowActions } from '../RowActions/RowActions'
import type { SelectOption } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import { Toggle } from '../Toggle/Toggle'

/*
 * HistoryList — '연혁 관리'(어드민). 고객용 화면은 HistoryPage(+EraTimeline)다.
 *
 * 고객 화면은 연도로 묶인 그룹(HistoryGroup)이지만, 관리 화면의 단위는 '연혁 한 줄'이다 —
 * 등록·수정·삭제·노출이 항목 단위로 일어나기 때문이다. 연도는 행이 들고 있고,
 * 그룹핑(연도 → EraTimeline 칸)은 고객 화면이 저장된 행을 읽어 만든다.
 * 그래서 행 타입(HistoryRow)은 HistoryGroup.year + HistoryItem(month·title·description) +
 * 그룹의 대표 이미지(image) + 운영 축(노출·등록일)을 한 줄로 편 모양이다.
 *
 * 골격(헤더·탭·툴바·검색·표·선택·일괄 처리·페이지네이션·삭제 확인창)은 AdminListPage 셸이 갖는다.
 * 이 파일에 남는 건 컬럼 · 상태 축(노출/숨김) · 정렬 · 한국어 문구뿐이다(NoticeBoard와 같은 결).
 */

/** 연혁 한 줄 — 고객 화면(HistoryPage)의 HistoryGroup.year + HistoryItem을 편 것 */
export type HistoryRow = {
  id: string
  /** '2019'처럼 연도만. 고객 화면에서 같은 연도끼리 한 칸(연대)으로 묶인다 */
  year: string
  /** '5월'처럼 사람이 읽는 문자열. 없으면 연도만 표기된다 */
  month?: string
  title: string
  description?: string
  /** 그 연대의 대표 이미지 — 없으면 표·고객 화면 모두 대체 그림이 뜬다 */
  image?: string
  /** 노출 여부 — 끄면 고객 화면 연혁에서 이 줄이 빠진다 */
  visible: boolean
  createdAt: string
}

/**
 * 등록/수정 모달의 폼 값 — HistoryRow에서 id·createdAt을 뺀 나머지.
 * id·등록일 부여는 이 컴포넌트가 하지 않는다(부모가 rows를 들고 있으므로 부여도 부모의 몫이다 —
 * onDelete·onToggleVisible이 이미 그렇듯, 저장 방식은 화면마다 다를 수 있다).
 */
export type HistoryFormValues = {
  year: string
  month?: string
  title: string
  description?: string
  image?: string
  visible: boolean
}

/** 탭 — 전체 + 노출 상태 2종 */
export type HistoryTabKey = 'all' | 'visible' | 'hidden'

/** 정렬 축 — 최신순(등록일) / 연도순(연·월) */
export type HistorySortKey = 'recent' | 'year'

/** 표 컬럼 — labels.columns의 키이자 AdminTable 컬럼 key */
export type HistoryColumnKey =
  | 'index'
  | 'year'
  | 'month'
  | 'title'
  | 'description'
  | 'image'
  | 'visible'
  | 'createdAt'
  | 'actions'

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   컬럼 머리글·탭·정렬·행 액션·확인창까지 화면에 나오는 모든 글자를 한 통로로 연다.
   우선순위: 개별 prop(title·emptyText·tabLabels …) > labels.* > 기본값. */
type HistoryListLabelsResolved = {
  title: string
  description: string
  /** 헤더 등록 버튼 */
  create: string
  columns: Record<HistoryColumnKey, string>
  tabs: Record<HistoryTabKey, string>
  /** 툴바 정렬 Select 옵션 — sortOptions prop을 주면 그쪽이 이긴다 */
  sort: Record<HistorySortKey, string>
  /** 관리 열 아이콘 버튼 — 툴팁이자 접근성 이름이다(행 제목을 끼워 넣는다) */
  rowActions: Required<Pick<RowScopedActionLabels, 'edit' | 'delete'>>
  search: SearchLabels
  empty: EmptyLabels
  /** 값이 없는 칸(월·설명)에 찍히는 문자 */
  emptyCell: string
  /**
   * 삭제 확인창 — 취소 버튼은 열지 않는다.
   * 셸(AdminListPage.deleteConfirm)에 cancelLabel 축이 없어 CrudDialog 기본값('취소')이 그대로 뜬다.
   */
  deleteDialog: Required<Pick<ConfirmDialogLabels<string[]>, 'title' | 'description'>> &
    Pick<ConfirmDialogLabels<string[]>, 'confirmLabel'>
  /**
   * 표 크롬 문구(선택 바 · 순서 이동 안내 · 썸네일 대체 문구 · 내보내기 · 페이지 크기 …) —
   * 셸(AdminListPage)을 지나 AdminTable로 그대로 흘러간다. 기본값은 AdminTable이 단일 출처라
   * 여기서 다시 적지 않는다(적는 순간 두 값이 갈라진다).
   */
  table?: AdminTableLabels
  /**
   * 등록/수정 모달 문구 — 필드 라벨(연도·월·제목·설명·대표 이미지·노출)은 columns를,
   * 노출 토글의 ON/OFF 문구는 tabs.visible/tabs.hidden을 그대로 재사용한다
   * (같은 글자를 두 곳에 적으면 그 순간 두 값이 갈라진다 — CLAUDE.md §0-2).
   * 여기 남는 건 모달에만 있는 문구뿐이다.
   */
  form: {
    /** 등록 모달 제목 — 없으면 CrudDialog 기본값('등록')이 뜬다 */
    createTitle: string
    /** 수정 모달 제목 — 없으면 CrudDialog 기본값('수정')이 뜬다 */
    editTitle: string
    /** 대표 이미지 삭제 버튼 — AdminFormImageField의 기본값('이미지 삭제') 대신 쓴다 */
    removeImage: string
    /** 연도·제목을 비운 채 저장을 누르면 그 필드 아래 뜨는 문구 */
    requiredError: string
  }
}

export const DEFAULT_HISTORY_LIST_LABELS: HistoryListLabelsResolved = {
  title: '연혁 관리',
  description: '연도별 연혁의 노출 여부와 대표 이미지를 관리합니다.',
  create: '연혁 등록',
  columns: {
    index: '순번',
    year: '연도',
    month: '월',
    title: '제목',
    description: '설명',
    image: '대표 이미지',
    visible: '노출',
    createdAt: '등록일',
    actions: '관리',
  },
  tabs: { all: '전체', visible: '노출', hidden: '숨김' },
  // 연혁은 '언제 등록했나'보다 '언제 있었던 일인가'가 자주 쓰인다
  sort: { recent: '최신순', year: '연도순' },
  rowActions: {
    edit: (title) => `${title} 수정`,
    delete: (title) => `${title} 삭제`,
  },
  search: { searchPlaceholder: '제목 검색' },
  empty: { title: '등록된 연혁이 없습니다.' },
  emptyCell: '-',
  deleteDialog: {
    title: '선택한 연혁을 삭제할까요?',
    description: (ids) => `연혁 ${ids.length}건이 목록에서 제거됩니다.`,
  },
  form: {
    createTitle: '연혁 등록',
    editTitle: '연혁 수정',
    removeImage: '이미지 삭제',
    requiredError: '필수 항목입니다.',
  },
} as const

export type HistoryListLabels = DeepPartialOneLevel<HistoryListLabelsResolved>

/** 컬럼 머리글만 갈아끼울 때 — labels.columns와 같은 모양 */
export type HistoryColumnLabels = ColumnLabels<HistoryColumnKey>
/** 탭 라벨만 갈아끼울 때 — labels.tabs와 같은 모양 */
export type HistoryTabLabels = TabLabels<HistoryTabKey>
/** 정렬 라벨만 갈아끼울 때 — labels.sort와 같은 모양 */
export type HistorySortLabels = StatusLabels<HistorySortKey>

/**
 * 요소 ON/OFF — 전부 기본 true(오너 확정 규약, 키마다 `?? true`).
 * false면 그 요소가 DOM에서 통째로 사라진다(빈 자리·여백·구분선이 남지 않는다).
 */
export type HistoryListShow = {
  /** 페이지 헤더(타이틀·설명·[연혁 등록]) */
  header?: boolean
  /** 상태 탭(전체·노출·숨김) */
  tabs?: boolean
  /** 흰 카드 툴바(검색·정렬·건수) */
  toolbar?: boolean
  /** 툴바 안 제목 검색 */
  search?: boolean
  /** 툴바 안 '총 N건' */
  count?: boolean
  /** 표 하단 페이지네이션 + 페이지 크기 */
  pagination?: boolean
  /** 선택 체크박스 + 선택 일괄 삭제 바 */
  bulk?: boolean
  /** 행의 관리(수정·삭제) 컬럼 */
  rowActions?: boolean
  /** 표 우상단 '컬럼' 피커 */
  columnPicker?: boolean
  /** 표 우상단 내보내기 */
  export?: boolean
  /**
   * 표 하단 '20개씩' 페이지 크기 Select — false면 페이지네이션은 두되 크기 선택만 감춘다.
   * 셸(AdminListPage)에는 있던 축인데 이 화면만 빠뜨려 크기를 고정한 목록을 만들 수 없었다.
   */
  pageSize?: boolean
}

export type HistoryListProps = {
  rows: HistoryRow[]
  /** 서버 페이징 시 전체 건수 — 없으면 걸러진 rows 길이를 쓴다 */
  total?: number
  loading?: boolean
  show?: HistoryListShow
  density?: 'compact' | 'comfortable'

  /* ── 액션 — 넘긴 것만 화면에 생긴다 ── */
  /**
   * 있으면 헤더 우측 [연혁 등록]이 뜬다. 클릭하면 이 콜백을 부른 뒤(있으면) 등록 모달을 연다 —
   * 모달은 이 컴포넌트가 갖고 있으므로 onCreate가 없어도 폼 자체는 동작하지만,
   * 버튼 자체는 기존 규약(onCreate가 있어야 렌더)을 그대로 따른다.
   */
  onCreate?: () => void
  /** 제목 클릭 — 상세/수정으로 이동 */
  onRowOpen?: (row: HistoryRow) => void
  /**
   * 있으면 행 관리 컬럼에 [수정] 아이콘이 뜬다. 클릭하면 이 콜백을 부른 뒤(있으면) 그 행 값으로
   * 채운 수정 모달을 연다 — onCreate와 같은 결(버튼 유무는 기존 규약, 클릭 후 동작만 확장).
   */
  onEdit?: (row: HistoryRow) => void
  /** 행 삭제와 선택 일괄 삭제가 함께 부른다(항상 id 배열, 확인창을 거친 뒤에만) */
  onDelete?: (ids: string[]) => void
  /** 행 안의 노출 토글 */
  onToggleVisible?: (row: HistoryRow, next: boolean) => void
  /**
   * 등록 모달에서 [등록]을 누르면, 필수값(연도·제목) 검증을 통과한 폼 값과 함께 불린다.
   * id·등록일 부여는 부모의 몫이다(rows를 들고 있는 쪽이 저장 방식도 정한다).
   */
  onCreateSubmit?: (values: HistoryFormValues) => void
  /** 수정 모달에서 [저장]을 누르면, 대상 행(원본)과 검증을 통과한 새 값이 함께 불린다. */
  onEditSubmit?: (row: HistoryRow, values: HistoryFormValues) => void

  /* ── 페이지 크기 — 셸의 축을 그대로 통과시킨다 ── */
  /** 한 페이지 행 수. 기본 20(셸 규격) */
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  /** 페이지 크기 후보. 기본 20/50/100 — 건수가 적은 연혁은 [10, 20]처럼 좁힌다 */
  pageSizeOptions?: number[]

  /* ── 문구 — 개별 prop이 labels보다 우선한다(하위호환) ── */
  /** @deprecated labels.title 을 쓰세요 */
  title?: string
  /** @deprecated labels.description 을 쓰세요 */
  description?: string
  /** @deprecated labels.create 을 쓰세요 */
  createLabel?: string
  /** @deprecated labels.search.searchPlaceholder 를 쓰세요 */
  searchPlaceholder?: string
  /** @deprecated labels.empty.title 을 쓰세요 */
  emptyText?: string
  exportFilename?: string
  /** @deprecated labels.tabs 를 쓰세요 — 넘긴 키만 기본 문구를 덮어쓴다 */
  tabLabels?: HistoryTabLabels
  /** 정렬 후보 — value는 HistorySortKey와 맞춰야 정렬이 동작한다. 문구만 바꿀 거면 labels.sort */
  sortOptions?: SelectOption[]
  /** @deprecated labels.deleteDialog.title 을 쓰세요 */
  deleteTitle?: string
  /** @deprecated labels.deleteDialog.description 을 쓰세요 */
  deleteDescription?: (ids: string[]) => string
  /** 화면 문구를 통째로 갈아끼우는 단일 통로 — 개별 카피 prop이 우선한다 */
  labels?: HistoryListLabels

  /* ── 아이콘 슬롯 — 없으면 기본 lucide 아이콘 ── */
  /** 등록 버튼 (기본 Plus) */
  createIcon?: ReactNode
}

/** @deprecated DEFAULT_HISTORY_LIST_LABELS.tabs 를 쓰세요 (기존 이름 유지용 alias) */
export const DEFAULT_TAB_LABEL: Record<HistoryTabKey, string> = DEFAULT_HISTORY_LIST_LABELS.tabs

const TAB_ORDER: HistoryTabKey[] = ['all', 'visible', 'hidden']

const SORT_ORDER: HistorySortKey[] = ['recent', 'year']

/** show 기본값 — 전부 true. 스프레드로 합치면 명시적 undefined가 기본값을 덮으므로 키마다 ?? true */
function resolveShow(show: HistoryListShow = {}): Required<HistoryListShow> {
  return {
    header: show.header ?? true,
    tabs: show.tabs ?? true,
    toolbar: show.toolbar ?? true,
    search: show.search ?? true,
    count: show.count ?? true,
    pagination: show.pagination ?? true,
    pageSize: show.pageSize ?? true,
    bulk: show.bulk ?? true,
    rowActions: show.rowActions ?? true,
    columnPicker: show.columnPicker ?? true,
    export: show.export ?? true,
  }
}

function matchesTab(row: HistoryRow, tab: string): boolean {
  if (tab === 'all') return true
  return tab === 'visible' ? row.visible : !row.visible
}

/** 검색 대상 — 제목 한 축뿐이다(연도·월은 정렬·탭이 담당한다) */
function matchesKeyword(row: HistoryRow, keyword: string): boolean {
  return row.title.toLowerCase().includes(keyword.toLowerCase())
}

/** '5월' → 5. 월이 없거나 숫자가 아니면 0(연도만 있는 줄은 그 해의 맨 뒤로) */
function monthNumber(month?: string): number {
  const parsed = Number.parseInt(month ?? '', 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * 화면 순서 — 셸이 탭·검색으로 거른 뒤, 페이지로 자르기 전에 부른다.
 *   year   : 최근 연도 → 같은 해면 늦은 달이 위(연혁은 최근이 먼저 읽힌다)
 *   recent : 등록일 내림차순('YYYY-MM-DD'는 사전순 비교로 충분하다)
 */
function orderRows(rows: HistoryRow[], sort: string | null): HistoryRow[] {
  const next = [...rows]
  if (sort === 'year') {
    return next.sort(
      (a, b) => b.year.localeCompare(a.year) || monthNumber(b.month) - monthNumber(a.month),
    )
  }
  return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** 등록 모달을 열 때의 빈 값 */
const EMPTY_HISTORY_FORM: HistoryFormValues = {
  year: '',
  month: '',
  title: '',
  description: '',
  image: undefined,
  visible: true,
}

/** 수정 모달을 열 때 — 행 값을 폼 값으로 편다(id·createdAt은 폼이 모른다) */
function formValuesFromRow(row: HistoryRow): HistoryFormValues {
  return {
    year: row.year,
    month: row.month ?? '',
    title: row.title,
    description: row.description ?? '',
    image: row.image,
    visible: row.visible,
  }
}

/** 등록/수정 모달의 내부 상태 — null이면 닫힘. edit는 원본 행을 함께 들고 있는다(onEditSubmit에 되돌려 줄 대상) */
type HistoryDialogState = { mode: 'create' } | { mode: 'edit'; row: HistoryRow }

/**
 * HistoryList — 연혁 관리 화면(AdminListPage 프리셋).
 *
 *   header  : 타이틀 · 설명 · [연혁 등록]
 *   tabs    : 전체 / 노출 / 숨김 — 건수는 셸이 matchTab으로 rows에서 센다
 *   toolbar : 제목 검색 · 정렬(최신순/연도순) · 총 N건
 *   content : 표 — 순번 · 연도 · 월 · 제목 · 설명 · 대표 이미지 · 노출(토글) · 등록일 · 관리
 *   dialog  : 삭제 확인(선택 일괄 삭제 · 행 삭제가 같은 창을 쓴다) + 등록/수정 폼(CrudDialog)
 *
 * 탭 필터·검색·정렬·페이징·선택은 전부 셸의 축이다 — 이 파일은 rows를 그대로 넘긴다.
 * 등록/수정 모달은 이 컴포넌트가 직접 들고 있다(ProductList의 category/status 미니 다이얼로그와 같은 결) —
 * AdminListPage 셸은 delete 확인창만 안다.
 */
export function HistoryList({
  rows,
  total,
  loading = false,
  show,
  density = 'compact',
  onCreate,
  onRowOpen,
  onEdit,
  onDelete,
  onToggleVisible,
  onCreateSubmit,
  onEditSubmit,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  // 카피의 기본값은 DEFAULT_HISTORY_LIST_LABELS가 갖는다 — 여기서 기본값을 주면
  // 넘기지 않은 개별 prop이 labels를 항상 이겨 통로가 막힌다
  title,
  description,
  createLabel,
  searchPlaceholder,
  emptyText,
  exportFilename = '연혁목록',
  tabLabels,
  sortOptions,
  deleteTitle,
  deleteDescription,
  labels,
  createIcon,
}: HistoryListProps) {
  const on = resolveShow(show)
  const L = mergeLabels(DEFAULT_HISTORY_LIST_LABELS, labels)

  /*
   * 등록/수정 모달 상태 — 셸(AdminListPage)이 모르는, 이 화면만의 다이얼로그다(delete만 셸이 안다).
   * 열림 자체는 항상 내부 상태다(닫힌 게 기본) — onCreate/onEdit의 존재 여부는 '버튼이 뜨는지'만
   * 결정한다(기존 규약 그대로). 버튼을 클릭하면 외부 콜백을 먼저 부르고(하위호환 알림) 모달을 연다.
   */
  const [dialog, setDialog] = useState<HistoryDialogState | null>(null)
  const [draft, setDraft] = useState<HistoryFormValues>(EMPTY_HISTORY_FORM)
  const [formErrors, setFormErrors] = useState<{ year?: string; title?: string }>({})

  const openCreateDialog = () => {
    setDraft(EMPTY_HISTORY_FORM)
    setFormErrors({})
    setDialog({ mode: 'create' })
  }

  const openEditDialog = (row: HistoryRow) => {
    setDraft(formValuesFromRow(row))
    setFormErrors({})
    setDialog({ mode: 'edit', row })
  }

  const closeDialog = () => setDialog(null)

  // onCreate가 없으면 헤더 버튼 자체가 안 뜬다(AdminListPage 규약) — 그래서 undefined를 그대로 둔다
  const handleCreateClick =
    onCreate == null
      ? undefined
      : () => {
          onCreate()
          openCreateDialog()
        }

  // onEdit가 없으면 RowActions의 수정 아이콘 자체가 안 뜬다(RowActions 규약) — 위와 같은 결
  const handleEditClick =
    onEdit == null
      ? undefined
      : (row: HistoryRow) => {
          onEdit(row)
          openEditDialog(row)
        }

  /** 저장 — 연도·제목이 비어 있으면 그 필드 아래 에러만 띄우고 닫지 않는다 */
  const handleDialogConfirm = () => {
    if (dialog == null) return
    const nextErrors: { year?: string; title?: string } = {}
    if (draft.year.trim() === '') nextErrors.year = L.form.requiredError
    if (draft.title.trim() === '') nextErrors.title = L.form.requiredError
    if (nextErrors.year != null || nextErrors.title != null) {
      setFormErrors(nextErrors)
      return
    }
    if (dialog.mode === 'create') onCreateSubmit?.(draft)
    else onEditSubmit?.(dialog.row, draft)
    setDialog(null)
  }

  const tabs: CategoryTabItem[] = TAB_ORDER.map((key) => ({
    label: resolveLabel(tabLabels?.[key], L.tabs[key]) ?? DEFAULT_HISTORY_LIST_LABELS.tabs[key],
    value: key,
    fixed: true,
  }))

  // 정렬 후보 — sortOptions를 통째로 주면 그쪽이 이긴다(값까지 바꾸는 축이므로)
  const sorts: SelectOption[] =
    sortOptions ?? SORT_ORDER.map((key) => ({ value: key, label: L.sort[key] }))

  /*
   * 컬럼 — 삭제는 셸의 확인창을 거쳐야 하므로 ctx.confirmDelete로 부른다
   * (RowActions.onDelete를 onDelete에 직접 물리면 확인 없이 지워진다).
   */
  const columns = (ctx: AdminListRowContext): AdminColumn<HistoryRow>[] => [
    { kind: 'select', key: 'select', pinned: 'left' },
    { kind: 'index', key: 'index', header: L.columns.index },
    { kind: 'text', key: 'year', header: L.columns.year, ratio: 1, sortable: true },
    {
      kind: 'text',
      key: 'month',
      header: L.columns.month,
      ratio: 1,
      value: (row) => row.month ?? L.emptyCell,
    },
    { kind: 'title', key: 'title', header: L.columns.title, ratio: 3, sortable: true },
    {
      kind: 'text',
      key: 'description',
      header: L.columns.description,
      ratio: 3,
      value: (row) => row.description ?? L.emptyCell,
    },
    // 썸네일·플레이스홀더 폴백은 AdminTable이 갖는다 — 여기서 <img>를 다시 만들지 않는다
    { kind: 'thumbnail', key: 'image', header: L.columns.image },
    {
      kind: 'status',
      key: 'visible',
      header: L.columns.visible,
      // 토글의 값은 visible 하나뿐이다 — 파생 상태를 따로 두면 두 값이 어긋난다
      value: (row) => row.visible,
    },
    { kind: 'date', key: 'createdAt', header: L.columns.createdAt, sortable: true },
    {
      kind: 'actions',
      key: 'actions',
      header: L.columns.actions,
      render: (row) => (
        <RowActions
          size="sm"
          onEdit={handleEditClick == null ? undefined : () => handleEditClick(row)}
          onDelete={onDelete == null ? undefined : () => ctx.confirmDelete([row.id])}
          labels={{ edit: L.rowActions.edit(row.title), delete: L.rowActions.delete(row.title) }}
        />
      ),
    },
  ]

  return (
    <>
      <AdminListPage<HistoryRow>
        rows={rows}
        columns={columns}
        rowKey={(row) => row.id}
        total={total}
        loading={loading}
        title={resolveLabel(title, L.title)}
        description={resolveLabel(description, L.description)}
        onCreate={handleCreateClick}
        createLabel={resolveLabel(createLabel, L.create)}
        createIcon={createIcon ?? <Plus size={16} aria-hidden="true" />}
        tabs={tabs}
        matchTab={matchesTab}
        // 검색은 툴바 한 줄(inline) — 조건이 제목 하나뿐이라 상단 검색 패널을 세울 이유가 없다
        search="inline"
        searchPlaceholder={resolveLabel(searchPlaceholder, L.search.searchPlaceholder)}
        matchKeyword={matchesKeyword}
        sortOptions={sorts}
        orderRows={orderRows}
        onRowOpen={onRowOpen}
        onToggleStatus={onToggleVisible}
        // 선택 일괄 삭제 — 표 하단 [선택 삭제]와 행 관리의 삭제가 같은 확인창을 지난다
        onBulkDelete={onDelete}
        deleteConfirm={{
          title: resolveLabel(deleteTitle, L.deleteDialog.title) ?? L.deleteDialog.title,
          description: resolveLabel(deleteDescription, L.deleteDialog.description),
          confirmLabel: L.deleteDialog.confirmLabel,
        }}
        emptyText={resolveLabel(emptyText, L.empty.title)}
        // 표 크롬 문구는 셸이 AdminTable로 그대로 통과시킨다 — 넘기지 않으면 undefined라 기본값이 그대로 산다
        labels={{ table: L.table }}
        exportFilename={exportFilename}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
        density={density}
        show={{
          header: on.header,
          tabs: on.tabs,
          toolbar: on.toolbar,
          search: on.search,
          count: on.count,
          pagination: on.pagination,
          pageSize: on.pageSize,
          bulk: on.bulk,
          rowActions: on.rowActions,
          columnPicker: on.columnPicker,
          export: on.export,
        }}
      />

      {/*
       * 등록/수정 폼 — create/edit 둘 다 이 한 다이얼로그를 쓴다(모드만 다르다).
       * FieldRow가 라벨+컨트롤을 규격화하고, CrudDialog의 본문(.form)이 이미 세로 flex(gap-4)라
       * FormSection(카드+3열 그리드)을 다시 씌우지 않는다 — 모달 안에 카드를 또 두면 보더가 겹친다.
       */}
      {dialog != null && (
        <CrudDialog
          open
          mode={dialog.mode}
          labels={{ title: dialog.mode === 'edit' ? L.form.editTitle : L.form.createTitle }}
          onCancel={closeDialog}
          onConfirm={handleDialogConfirm}
        >
          <FieldRow label={L.columns.year} required error={formErrors.year}>
            <InputBase
              value={draft.year}
              onChange={(next) => {
                setDraft((prev) => ({ ...prev, year: next }))
                setFormErrors((prev) => ({ ...prev, year: undefined }))
              }}
            />
          </FieldRow>

          <FieldRow label={L.columns.month}>
            <InputBase
              value={draft.month ?? ''}
              onChange={(next) => setDraft((prev) => ({ ...prev, month: next }))}
            />
          </FieldRow>

          <FieldRow label={L.columns.title} required error={formErrors.title}>
            <InputBase
              value={draft.title}
              onChange={(next) => {
                setDraft((prev) => ({ ...prev, title: next }))
                setFormErrors((prev) => ({ ...prev, title: undefined }))
              }}
            />
          </FieldRow>

          <FieldRow label={L.columns.description}>
            <Textarea
              value={draft.description ?? ''}
              onChange={(next) => setDraft((prev) => ({ ...prev, description: next }))}
            />
          </FieldRow>

          <FieldRow label={L.columns.image}>
            <AdminFormImageField
              value={draft.image}
              onChange={(next) => setDraft((prev) => ({ ...prev, image: next }))}
              removeLabel={L.form.removeImage}
            />
          </FieldRow>

          <FieldRow label={L.columns.visible}>
            <Toggle
              checked={draft.visible}
              onChange={(next) => setDraft((prev) => ({ ...prev, visible: next }))}
              label={draft.visible ? L.tabs.visible : L.tabs.hidden}
            />
          </FieldRow>
        </CrudDialog>
      )}
    </>
  )
}
