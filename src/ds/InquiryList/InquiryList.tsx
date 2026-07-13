import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCheck, Eye, Paperclip, SlidersHorizontal, UserCog } from 'lucide-react'
import styles from './InquiryList.module.css'
import {
  mergeLabels,
  resolveLabel,
  resolveText,
  type ColumnLabels,
  type ConfirmDialogLabels,
  type DeepPartialOneLevel,
  type EmptyLabels,
  type RowScopedActionLabels,
  type StatusLabels,
  type TabLabels,
} from '../../shared/labels'
import { AdminListPage } from '../AdminListPage/AdminListPage'
import {
  type AdminBulkAction,
  type AdminColumn,
  type AdminColumnTone,
  type AdminTableLabels,
} from '../AdminTable/AdminTable'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import type { SearchFieldDef, SearchValues } from '../SearchPanel/SearchPanel'
import { CrudDialog } from '../CrudDialog/CrudDialog'
import { Badge } from '../Badge/Badge'
import { Select } from '../Select/Select'
import { Tag } from '../Tag/Tag'

/** 문의 처리 상태 — 접수 → 확인중 → 답변완료, 그 밖에 보류/종료 */
export type InquiryStatus = 'received' | 'checking' | 'answered' | 'hold' | 'closed'

/** 표 컬럼 — labels.columns의 키이자 AdminTable 컬럼 key */
export type InquiryColumnKey =
  | 'no'
  | 'type'
  | 'title'
  | 'productName'
  | 'orderNo'
  | 'author'
  | 'memberGrade'
  | 'assignee'
  | 'createdAt'
  | 'answeredAt'
  | 'views'
  | 'status'
  | 'isPublic'
  | 'hasAttachment'
  | 'detail'

/** 제목 앞 태그 */
export type InquiryTagKey = 'urgent' | 'reported'

export type InquiryRow = {
  id: string
  no: string
  type: string
  title: string
  productName?: string
  orderNo?: string
  author: string
  memberGrade?: string
  assignee?: string
  createdAt: string
  answeredAt?: string
  views: number
  status: InquiryStatus
  isPublic: boolean
  hasAttachment?: boolean
  urgent?: boolean
  reported?: boolean
}

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   컬럼 머리글·상태·탭·태그·검색 13조건·일괄 버튼·확인창 2종을 한 통로로 연다.
   검색 조건은 label/placeholder를 '한 단계'로 편다 — 2단계로 파면 mergeLabels가 그룹을 통째로
   교체해 placeholder만 넘겨도 label 기본값이 사라진다.
   우선순위: 개별 prop(emptyText) > labels.* > 기본값. */
type InquiryListLabelsResolved = {
  columns: Record<InquiryColumnKey, string>
  /** 배지·탭·검색 Select가 함께 쓰는 처리상태 문구 */
  status: Record<InquiryStatus, string>
  /** 필터 탭 — 상태 축과 플래그 축(긴급·신고)이 한 줄에 있다 */
  tabs: Record<InquiryTabKey, string>
  /** 제목 앞 태그 */
  tags: Record<InquiryTagKey, string>
  /** 검색 패널 조건 — <키> = 라벨, <키>Placeholder = 입력 힌트 */
  search: {
    keyword: string
    keywordPlaceholder: string
    inquiryNo: string
    inquiryNoPlaceholder: string
    orderNo: string
    orderNoPlaceholder: string
    productName: string
    productNamePlaceholder: string
    member: string
    memberPlaceholder: string
    author: string
    authorPlaceholder: string
    email: string
    emailPlaceholder: string
    phone: string
    phonePlaceholder: string
    period: string
    type: string
    status: string
    assignee: string
    visibility: string
  }
  /** 셀 값 — 공개여부·첨부·미배정 */
  cells: {
    public: string
    private: string
    attached: string
    notAttached: string
    /** 첨부 아이콘의 접근성 이름(아이콘만 있는 셀이라 이름이 없으면 읽히지 않는다) */
    attachedAria: string
    unassigned: string
  }
  /** 선택 시 표 하단에 뜨는 일괄 처리 버튼 */
  bulk: { answered: string; assign: string; status: string }
  /** 우측 '상세보기' 아이콘 버튼 — 툴팁이자 접근성 이름이다(행 제목을 끼워 넣는다) */
  rowActions: Required<Pick<RowScopedActionLabels, 'view'>>
  empty: EmptyLabels
  /** 값이 없는 칸(상품명·주문번호·회원등급·답변일)에 찍히는 문자 */
  emptyCell: string
  /** 담당자 변경 확인창 — 대상 건수를 받는다 */
  assignDialog: ConfirmDialogLabels<number> & { fieldLabel: string; placeholder: string }
  /** 처리상태 변경 확인창 */
  statusDialog: ConfirmDialogLabels<number> & { fieldLabel: string }
  /**
   * 삭제 확인창 — 취소 버튼은 열지 않는다.
   * 셸(AdminListPage.deleteConfirm)에 cancelLabel 축이 없어 CrudDialog 기본값('취소')이 그대로 뜬다.
   */
  deleteDialog: Required<Pick<ConfirmDialogLabels<string[]>, 'title' | 'description'>> &
    Pick<ConfirmDialogLabels<string[]>, 'confirmLabel'>
  /**
   * 표 크롬 문구(선택 바 · 컬럼 피커 · 내보내기 · 페이지 크기 · 빈 표 설명 …) —
   * 셸(AdminListPage)을 지나 AdminTable로 그대로 흘러간다. 기본값은 AdminTable이 단일 출처라
   * 여기서 다시 적지 않는다(적는 순간 두 값이 갈라진다).
   */
  table?: AdminTableLabels
}

export const DEFAULT_INQUIRY_LIST_LABELS: InquiryListLabelsResolved = {
  columns: {
    no: '문의번호',
    type: '문의유형',
    title: '제목',
    productName: '상품명',
    orderNo: '주문번호',
    author: '작성자',
    memberGrade: '회원등급',
    assignee: '담당자',
    createdAt: '등록일',
    answeredAt: '답변일',
    views: '조회수',
    status: '처리상태',
    isPublic: '공개여부',
    hasAttachment: '첨부',
    detail: '상세보기',
  },
  status: {
    received: '접수',
    checking: '확인중',
    answered: '답변완료',
    hold: '보류',
    closed: '종료',
  },
  tabs: {
    all: '전체',
    unanswered: '미답변',
    answered: '답변완료',
    hold: '보류',
    closed: '종료',
    urgent: '긴급',
    reported: '신고',
  },
  tags: { urgent: '긴급', reported: '신고' },
  search: {
    keyword: '검색어',
    keywordPlaceholder: '제목·내용으로 검색',
    inquiryNo: '문의번호',
    inquiryNoPlaceholder: 'INQ-0000',
    orderNo: '주문번호',
    orderNoPlaceholder: 'ORD-0000',
    productName: '상품명',
    productNamePlaceholder: '상품명 입력',
    member: '회원명',
    memberPlaceholder: '회원명 입력',
    author: '작성자',
    authorPlaceholder: '작성자 입력',
    email: '이메일',
    emailPlaceholder: 'user@example.com',
    phone: '휴대폰번호',
    phonePlaceholder: '010-0000-0000',
    period: '기간',
    type: '문의유형',
    status: '처리상태',
    assignee: '담당자',
    visibility: '공개여부',
  },
  cells: {
    public: '공개',
    private: '비공개',
    attached: '있음',
    notAttached: '없음',
    attachedAria: '첨부파일 있음',
    unassigned: '미배정',
  },
  bulk: { answered: '답변 완료', assign: '담당자 변경', status: '상태 변경' },
  rowActions: { view: (title) => `${title} 상세보기` },
  empty: { title: '문의 내역이 없습니다.' },
  emptyCell: '-',
  assignDialog: {
    title: '담당자 변경',
    description: (count) => `선택한 ${count}건의 담당자를 변경합니다.`,
    confirmLabel: '변경',
    fieldLabel: '담당자',
    placeholder: '담당자 선택',
  },
  statusDialog: {
    title: '상태 변경',
    description: (count) => `선택한 ${count}건의 처리상태를 변경합니다.`,
    confirmLabel: '변경',
    fieldLabel: '처리상태',
  },
  deleteDialog: {
    title: '선택한 문의를 삭제할까요?',
    description: (ids) => `문의 ${ids.length}건이 목록에서 제거됩니다.`,
  },
} as const

export type InquiryListLabels = DeepPartialOneLevel<InquiryListLabelsResolved>

/** 컬럼 머리글만 갈아끼울 때 — labels.columns와 같은 모양 */
export type InquiryColumnLabels = ColumnLabels<InquiryColumnKey>
/** 처리상태 문구만 갈아끼울 때 — labels.status와 같은 모양 */
export type InquiryStatusLabels = StatusLabels<InquiryStatus>
/** 탭 라벨만 갈아끼울 때 */
export type InquiryTabLabels = TabLabels<InquiryTabKey>

export type InquiryListProps = {
  rows: InquiryRow[]
  /** 서버 페이징 시 전체 건수 — 없으면 필터된 rows 길이를 쓴다 */
  total?: number
  loading?: boolean
  onSearch?: (values: SearchValues) => void
  /** 상세보기 — 문의번호·제목 클릭과 우측 상세 버튼이 함께 부른다 */
  onRowOpen?: (row: InquiryRow) => void
  onBulkAnswered?: (ids: string[]) => void
  onBulkAssign?: (ids: string[], assignee: string) => void
  onBulkStatus?: (ids: string[], status: InquiryStatus) => void
  onBulkDelete?: (ids: string[]) => void
  /** 담당자 후보 — 비어 있으면 '담당자 변경' 일괄 처리를 숨긴다 */
  assignees?: { label: string; value: string }[]
  types?: { label: string; value: string }[]

  /* ── 요소 ON/OFF — 전부 기본 true. false면 그 요소가 DOM에서 통째로 사라진다 ── */
  /** 상태·플래그 탭(전체·미답변·답변완료·보류·종료·긴급·신고) */
  showTabs?: boolean
  /** 상단 검색 패널(13개 조건) — 목록을 위젯처럼 끼워 넣을 때 끈다 */
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
  /** 내보내기 파일명 (기본 '문의목록') */
  exportFilename?: string
  /** 화면 문구를 통째로 갈아끼우는 단일 통로 — 개별 카피 prop이 우선한다 */
  labels?: InquiryListLabels

  /* ── 톤 ── */
  /** 처리상태 배지 톤 — 넘긴 키만 기본 톤을 덮어쓴다 */
  statusTone?: Partial<Record<InquiryStatus, AdminColumnTone>>

  /* ── 아이콘 슬롯 ── */
  /** 우측 '상세보기' 버튼 아이콘 (기본 Eye) */
  viewIcon?: ReactNode
}

/** @deprecated DEFAULT_INQUIRY_LIST_LABELS.status 를 쓰세요 (기존 이름 유지용 alias) */
export const STATUS_LABEL: Record<InquiryStatus, string> = DEFAULT_INQUIRY_LIST_LABELS.status

// 접수=secondary · 확인중=primary · 답변완료=success · 보류=warning · 종료=secondary(흐리게).
// statusTone prop으로 키 단위 교체한다
const STATUS_TONE: Record<InquiryStatus, AdminColumnTone> = {
  received: 'secondary',
  checking: 'primary',
  answered: 'success',
  hold: 'warning',
  closed: 'secondary',
}

const STATUS_ORDER: InquiryStatus[] = ['received', 'checking', 'answered', 'hold', 'closed']

/** 문의유형 기본값 — types prop으로 덮어쓸 수 있다 */
const DEFAULT_TYPES = [
  { label: '상품 문의', value: '상품 문의' },
  { label: '배송 문의', value: '배송 문의' },
  { label: '교환/반품', value: '교환/반품' },
  { label: '환불 문의', value: '환불 문의' },
  { label: '기타', value: '기타' },
]

/** 필터 탭 — 상태 축(미답변/답변완료/보류/종료)과 플래그 축(긴급/신고)을 한 줄에 둔다 */
export type InquiryTabKey =
  | 'all'
  | 'unanswered'
  | 'answered'
  | 'hold'
  | 'closed'
  | 'urgent'
  | 'reported'

const TAB_ORDER: InquiryTabKey[] = [
  'all',
  'unanswered',
  'answered',
  'hold',
  'closed',
  'urgent',
  'reported',
]

/** 탭 판정 — 미답변은 '접수 + 확인중' */
function matchesTab(row: InquiryRow, tab: string): boolean {
  switch (tab as InquiryTabKey) {
    case 'all':
      return true
    case 'unanswered':
      return row.status === 'received' || row.status === 'checking'
    case 'answered':
      return row.status === 'answered'
    case 'hold':
      return row.status === 'hold'
    case 'closed':
      return row.status === 'closed'
    case 'urgent':
      return row.urgent === true
    case 'reported':
      return row.reported === true
    default:
      return true
  }
}

/** 이 화면만 10행 페이지를 허용한다(문의는 한 건이 길다) */
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/** 값을 골라야 하는 일괄 처리 — 삭제 확인창은 셸(deleteConfirm)이 갖는다 */
type DialogKind = 'assign' | 'status'

/**
 * InquiryList — 문의 목록 화면 프리셋.
 *
 * 화면 골격(검색 패널·탭·건수 바·표·페이징·선택·일괄 처리·삭제 확인창)은 전부 AdminListPage가 갖는다.
 * 이 파일에 남는 것은 이 화면만의 것뿐이다 —
 *   1) 컬럼      : 문의번호·유형·제목(긴급/신고 태그)·상품·주문·작성자·담당자·조회수·상태·첨부·상세보기
 *   2) 상태 축   : received/checking/answered/hold/closed 의 라벨·톤과 7개 탭(상태 + 긴급·신고 플래그)
 *   3) 한국어 문구와 값 선택 확인창(담당자 변경·상태 변경)
 *
 * 페이지 헤더가 없다(chrome='plain') — 바깥(AdminSuite)이 이미 PageContainer다.
 * 탭 필터·페이징은 rows에 대해 클라이언트에서 처리하고, 검색 조건은 onSearch로 넘긴다(서버 검색 전제).
 */
export function InquiryList({
  rows,
  total,
  loading = false,
  onSearch,
  onRowOpen,
  onBulkAnswered,
  onBulkAssign,
  onBulkStatus,
  onBulkDelete,
  assignees = [],
  types = DEFAULT_TYPES,
  showTabs = true,
  showSearch = true,
  showCount = true,
  columnPicker = true,
  exportable = true,
  // 카피의 기본값은 DEFAULT_INQUIRY_LIST_LABELS가 갖는다 — 여기서 기본값을 주면
  // 넘기지 않은 개별 prop이 labels를 항상 이겨 통로가 막힌다
  emptyText,
  exportFilename = '문의목록',
  labels,
  statusTone,
  viewIcon,
}: InquiryListProps) {
  const L = mergeLabels(DEFAULT_INQUIRY_LIST_LABELS, labels)
  // 톤은 문구가 아니다 — 키마다 덮어쓰고 넘기지 않은 키는 기본 톤을 지킨다
  const tone: Record<InquiryStatus, AdminColumnTone> = { ...STATUS_TONE, ...statusTone }

  const statusOptions = STATUS_ORDER.map((status) => ({ label: L.status[status], value: status }))

  /** 건수는 셸이 matchesTab으로 rows에서 센다 — 여기서는 라벨·순서만 선언한다 */
  const tabItems: CategoryTabItem[] = TAB_ORDER.map((key) => ({
    label: L.tabs[key],
    value: key,
    fixed: true,
  }))

  // ── 검색 조건 — 값·초기화·엔터는 셸이 굴린다. 여기서는 조건 목록만 선언한다 ──
  const fields = useMemo<SearchFieldDef[]>(
    () => [
      {
        kind: 'text',
        key: 'keyword',
        label: L.search.keyword,
        placeholder: L.search.keywordPlaceholder,
        span: 2,
      },
      {
        kind: 'text',
        key: 'inquiryNo',
        label: L.search.inquiryNo,
        placeholder: L.search.inquiryNoPlaceholder,
      },
      {
        kind: 'text',
        key: 'orderNo',
        label: L.search.orderNo,
        placeholder: L.search.orderNoPlaceholder,
      },
      {
        kind: 'text',
        key: 'productName',
        label: L.search.productName,
        placeholder: L.search.productNamePlaceholder,
      },
      {
        kind: 'text',
        key: 'member',
        label: L.search.member,
        placeholder: L.search.memberPlaceholder,
      },
      {
        kind: 'text',
        key: 'author',
        label: L.search.author,
        placeholder: L.search.authorPlaceholder,
      },
      { kind: 'text', key: 'email', label: L.search.email, placeholder: L.search.emailPlaceholder },
      { kind: 'text', key: 'phone', label: L.search.phone, placeholder: L.search.phonePlaceholder },
      {
        kind: 'daterange',
        key: 'period',
        label: L.search.period,
        presets: ['today', '7d', '30d', '90d'],
        span: 2,
      },
      { kind: 'select', key: 'type', label: L.search.type, options: types },
      { kind: 'select', key: 'status', label: L.search.status, options: statusOptions },
      { kind: 'select', key: 'assignee', label: L.search.assignee, options: assignees },
      {
        kind: 'select',
        key: 'visibility',
        label: L.search.visibility,
        options: [
          { label: L.cells.public, value: 'public' },
          { label: L.cells.private, value: 'private' },
        ],
      },
    ],
    [types, assignees, statusOptions, L.search, L.cells],
  )

  // 선택은 확인창이 대상 건수를 읽어야 해서 이 화면이 들고 있는다(셸에는 제어값으로 넘긴다)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 값을 골라야 하는 일괄 처리 확인창 — 담당자/상태
  const [dialog, setDialog] = useState<DialogKind | null>(null)
  const [assignDraft, setAssignDraft] = useState<string | null>(null)
  const [statusDraft, setStatusDraft] = useState<InquiryStatus>('answered')

  const closeDialog = () => setDialog(null)

  const openAssign = () => {
    setAssignDraft(assignees[0]?.value ?? null)
    setDialog('assign')
  }

  const openStatus = () => {
    setStatusDraft('answered')
    setDialog('status')
  }

  /** 처리가 끝나면 선택을 비우고 확인창을 닫는다 */
  const finish = (run: () => void) => {
    run()
    setSelectedIds([])
    closeDialog()
  }

  // ── 일괄 처리 — 확인창을 여는 버튼은 선택을 유지해야 한다(clearSelectionOnBulk=false) ──
  const bulkActions: AdminBulkAction[] = []
  if (onBulkAnswered != null) {
    bulkActions.push({
      key: 'answered',
      label: L.bulk.answered,
      tone: 'primary',
      icon: <CheckCheck size={14} aria-hidden="true" />,
      onAction: (ids) => finish(() => onBulkAnswered(ids)),
    })
  }
  if (onBulkAssign != null && assignees.length > 0) {
    bulkActions.push({
      key: 'assign',
      label: L.bulk.assign,
      icon: <UserCog size={14} aria-hidden="true" />,
      onAction: openAssign,
    })
  }
  if (onBulkStatus != null) {
    bulkActions.push({
      key: 'status',
      label: L.bulk.status,
      icon: <SlidersHorizontal size={14} aria-hidden="true" />,
      onAction: openStatus,
    })
  }

  // ── 컬럼 ─────────────────────────────────────────────────────────────
  const columns: AdminColumn<InquiryRow>[] = [
    { kind: 'select', key: 'select', pinned: 'left' },
    {
      kind: 'text',
      key: 'no',
      header: L.columns.no,
      sortable: true,
      pinned: 'left',
      onClick: onRowOpen,
      render: (row) => <span className={styles.no}>{row.no}</span>,
    },
    {
      kind: 'type',
      key: 'type',
      header: L.columns.type,
      sortable: true,
      // 색은 처리상태가 갖는다 — 유형 배지는 중립 톤으로 둬 표가 알록달록해지지 않게
      tone: () => 'secondary',
    },
    {
      kind: 'title',
      key: 'title',
      header: L.columns.title,
      ratio: 4,
      sortable: true,
      onClick: onRowOpen,
      render: (row) => (
        <span className={styles.titleCell}>
          {(row.urgent === true || row.reported === true) && (
            <span className={styles.tags}>
              {row.urgent === true && <Tag label={L.tags.urgent} tone="error" size="sm" />}
              {row.reported === true && <Tag label={L.tags.reported} tone="warning" size="sm" />}
            </span>
          )}
          <span className={styles.titleText}>{row.title}</span>
        </span>
      ),
    },
    {
      kind: 'text',
      key: 'productName',
      header: L.columns.productName,
      value: (row) => row.productName ?? L.emptyCell,
    },
    {
      kind: 'text',
      key: 'orderNo',
      header: L.columns.orderNo,
      ratio: 1,
      value: (row) => row.orderNo ?? L.emptyCell,
    },
    { kind: 'user', key: 'author', header: L.columns.author, sortable: true },
    {
      kind: 'user',
      key: 'memberGrade',
      header: L.columns.memberGrade,
      value: (row) => row.memberGrade ?? L.emptyCell,
    },
    {
      kind: 'user',
      key: 'assignee',
      header: L.columns.assignee,
      value: (row) => row.assignee ?? L.cells.unassigned,
    },
    { kind: 'date', key: 'createdAt', header: L.columns.createdAt, sortable: true },
    {
      kind: 'date',
      key: 'answeredAt',
      header: L.columns.answeredAt,
      sortable: true,
      value: (row) => row.answeredAt ?? L.emptyCell,
    },
    { kind: 'number', key: 'views', header: L.columns.views, sortable: true },
    {
      kind: 'badge',
      key: 'status',
      header: L.columns.status,
      sortable: true,
      // 내보내기는 한글 라벨로 — 화면은 톤 배지, 종료는 흐리게
      value: (row) => L.status[row.status],
      render: (row) => (
        <span className={row.status === 'closed' ? styles.dim : styles.tone}>
          <Badge
            variant={tone[row.status]}
            appearance="soft"
            size="sm"
            label={L.status[row.status]}
          />
        </span>
      ),
    },
    {
      kind: 'badge',
      key: 'isPublic',
      header: L.columns.isPublic,
      value: (row) => (row.isPublic ? L.cells.public : L.cells.private),
      tone: (row) => (row.isPublic ? 'primary' : 'secondary'),
    },
    {
      kind: 'badge',
      key: 'hasAttachment',
      header: L.columns.hasAttachment,
      // 내보내기는 '있음/없음' 문자열로 — 화면은 클립 아이콘 하나
      value: (row) => (row.hasAttachment === true ? L.cells.attached : L.cells.notAttached),
      render: (row) =>
        row.hasAttachment === true ? (
          <span className={styles.attach} role="img" aria-label={L.cells.attachedAria}>
            <Paperclip size={15} aria-hidden="true" />
          </span>
        ) : (
          <span className={styles.none} aria-hidden="true">
            —
          </span>
        ),
    },
    {
      kind: 'actions',
      key: 'detail',
      header: L.columns.detail,
      pinned: 'right',
      render: (row) => (
        <button
          type="button"
          className={styles.detailButton}
          aria-label={L.rowActions.view(row.title)}
          onClick={() => onRowOpen?.(row)}
        >
          {viewIcon ?? <Eye size={15} aria-hidden="true" />}
        </button>
      ),
    },
  ]

  return (
    <>
      <AdminListPage
        rows={rows}
        columns={columns}
        rowKey={(row) => row.id}
        total={total}
        loading={loading}
        // 페이지 헤더 없이 조각만 쌓는다 — 바깥이 이미 PageContainer다
        chrome="plain"
        tabs={tabItems}
        matchTab={matchesTab}
        search="panel"
        searchFields={fields}
        onSearch={onSearch}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        bulkActions={bulkActions}
        // 담당자/상태 변경은 확인창을 연다 — 셸이 미리 선택을 비우면 대상 건수를 잃는다
        clearSelectionOnBulk={false}
        onBulkDelete={onBulkDelete}
        deleteConfirm={{
          title: L.deleteDialog.title,
          description: L.deleteDialog.description,
          confirmLabel: L.deleteDialog.confirmLabel,
        }}
        columnPicker={columnPicker}
        exportable={exportable}
        exportFilename={exportFilename}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        emptyText={resolveLabel(emptyText, L.empty.title)}
        // 표 크롬 문구는 셸이 AdminTable로 그대로 통과시킨다 — 넘기지 않으면 undefined라 기본값이 그대로 산다
        labels={{ table: L.table }}
        // 문의 한 건이 길어 행에 숨 쉴 자리를 준다(표 기본 밀도)
        density="comfortable"
        show={{ tabs: showTabs, search: showSearch, count: showCount }}
      />

      {dialog === 'assign' && (
        <CrudDialog
          open
          mode="edit"
          title={L.assignDialog.title}
          description={resolveText(L.assignDialog.description, selectedIds.length)}
          confirmLabel={L.assignDialog.confirmLabel}
          cancelLabel={L.assignDialog.cancelLabel}
          onCancel={closeDialog}
          onConfirm={() => {
            if (assignDraft == null) return
            finish(() => onBulkAssign?.(selectedIds, assignDraft))
          }}
        >
          <div className={styles.field}>
            <Select
              label={L.assignDialog.fieldLabel}
              value={assignDraft}
              options={assignees}
              placeholder={L.assignDialog.placeholder}
              onChange={setAssignDraft}
            />
          </div>
        </CrudDialog>
      )}

      {dialog === 'status' && (
        <CrudDialog
          open
          mode="edit"
          title={L.statusDialog.title}
          description={resolveText(L.statusDialog.description, selectedIds.length)}
          confirmLabel={L.statusDialog.confirmLabel}
          cancelLabel={L.statusDialog.cancelLabel}
          onCancel={closeDialog}
          onConfirm={() => finish(() => onBulkStatus?.(selectedIds, statusDraft))}
        >
          <div className={styles.field}>
            <Select
              label={L.statusDialog.fieldLabel}
              value={statusDraft}
              options={statusOptions}
              onChange={(value) => setStatusDraft(value as InquiryStatus)}
            />
          </div>
        </CrudDialog>
      )}
    </>
  )
}
