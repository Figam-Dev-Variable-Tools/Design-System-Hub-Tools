import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCheck, Eye, Paperclip, SlidersHorizontal, UserCog } from 'lucide-react'
import styles from './InquiryList.module.css'
import { AdminListPage } from '../AdminListPage/AdminListPage'
import {
  type AdminBulkAction,
  type AdminColumn,
  type AdminColumnTone,
} from '../AdminTable/AdminTable'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import type { SearchFieldDef, SearchValues } from '../SearchPanel/SearchPanel'
import { CrudDialog } from '../CrudDialog/CrudDialog'
import { Badge } from '../Badge/Badge'
import { Select } from '../Select/Select'
import { Tag } from '../Tag/Tag'

/** 문의 처리 상태 — 접수 → 확인중 → 답변완료, 그 밖에 보류/종료 */
export type InquiryStatus = 'received' | 'checking' | 'answered' | 'hold' | 'closed'

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
  /** 표가 빌 때 문구 */
  emptyText?: string
  /** 내보내기 파일명 (기본 '문의목록') */
  exportFilename?: string

  /* ── 아이콘 슬롯 ── */
  /** 우측 '상세보기' 버튼 아이콘 (기본 Eye) */
  viewIcon?: ReactNode
}

const STATUS_LABEL: Record<InquiryStatus, string> = {
  received: '접수',
  checking: '확인중',
  answered: '답변완료',
  hold: '보류',
  closed: '종료',
}

// 접수=secondary · 확인중=primary · 답변완료=success · 보류=warning · 종료=secondary(흐리게)
const STATUS_TONE: Record<InquiryStatus, AdminColumnTone> = {
  received: 'secondary',
  checking: 'primary',
  answered: 'success',
  hold: 'warning',
  closed: 'secondary',
}

const STATUS_ORDER: InquiryStatus[] = ['received', 'checking', 'answered', 'hold', 'closed']

const STATUS_OPTIONS = STATUS_ORDER.map((status) => ({
  label: STATUS_LABEL[status],
  value: status,
}))

/** 문의유형 기본값 — types prop으로 덮어쓸 수 있다 */
const DEFAULT_TYPES = [
  { label: '상품 문의', value: '상품 문의' },
  { label: '배송 문의', value: '배송 문의' },
  { label: '교환/반품', value: '교환/반품' },
  { label: '환불 문의', value: '환불 문의' },
  { label: '기타', value: '기타' },
]

/** 필터 탭 — 상태 축(미답변/답변완료/보류/종료)과 플래그 축(긴급/신고)을 한 줄에 둔다 */
type TabKey = 'all' | 'unanswered' | 'answered' | 'hold' | 'closed' | 'urgent' | 'reported'

const TAB_LABEL: Record<TabKey, string> = {
  all: '전체',
  unanswered: '미답변',
  answered: '답변완료',
  hold: '보류',
  closed: '종료',
  urgent: '긴급',
  reported: '신고',
}

const TAB_ORDER: TabKey[] = ['all', 'unanswered', 'answered', 'hold', 'closed', 'urgent', 'reported']

/** 건수는 셸이 matchesTab으로 rows에서 센다 — 여기서는 라벨·순서만 선언한다 */
const TAB_ITEMS: CategoryTabItem[] = TAB_ORDER.map((key) => ({
  label: TAB_LABEL[key],
  value: key,
  fixed: true,
}))

/** 탭 판정 — 미답변은 '접수 + 확인중' */
function matchesTab(row: InquiryRow, tab: string): boolean {
  switch (tab as TabKey) {
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
  emptyText = '문의 내역이 없습니다.',
  exportFilename = '문의목록',
  viewIcon,
}: InquiryListProps) {
  // ── 검색 조건 — 값·초기화·엔터는 셸이 굴린다. 여기서는 조건 목록만 선언한다 ──
  const fields = useMemo<SearchFieldDef[]>(
    () => [
      { kind: 'text', key: 'keyword', label: '검색어', placeholder: '제목·내용으로 검색', span: 2 },
      { kind: 'text', key: 'inquiryNo', label: '문의번호', placeholder: 'INQ-0000' },
      { kind: 'text', key: 'orderNo', label: '주문번호', placeholder: 'ORD-0000' },
      { kind: 'text', key: 'productName', label: '상품명', placeholder: '상품명 입력' },
      { kind: 'text', key: 'member', label: '회원명', placeholder: '회원명 입력' },
      { kind: 'text', key: 'author', label: '작성자', placeholder: '작성자 입력' },
      { kind: 'text', key: 'email', label: '이메일', placeholder: 'user@example.com' },
      { kind: 'text', key: 'phone', label: '휴대폰번호', placeholder: '010-0000-0000' },
      {
        kind: 'daterange',
        key: 'period',
        label: '기간',
        presets: ['today', '7d', '30d', '90d'],
        span: 2,
      },
      { kind: 'select', key: 'type', label: '문의유형', options: types },
      { kind: 'select', key: 'status', label: '처리상태', options: STATUS_OPTIONS },
      { kind: 'select', key: 'assignee', label: '담당자', options: assignees },
      {
        kind: 'select',
        key: 'visibility',
        label: '공개여부',
        options: [
          { label: '공개', value: 'public' },
          { label: '비공개', value: 'private' },
        ],
      },
    ],
    [types, assignees],
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
      label: '답변 완료',
      tone: 'primary',
      icon: <CheckCheck size={14} aria-hidden="true" />,
      onAction: (ids) => finish(() => onBulkAnswered(ids)),
    })
  }
  if (onBulkAssign != null && assignees.length > 0) {
    bulkActions.push({
      key: 'assign',
      label: '담당자 변경',
      icon: <UserCog size={14} aria-hidden="true" />,
      onAction: openAssign,
    })
  }
  if (onBulkStatus != null) {
    bulkActions.push({
      key: 'status',
      label: '상태 변경',
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
      header: '문의번호',
      sortable: true,
      pinned: 'left',
      onClick: onRowOpen,
      render: (row) => <span className={styles.no}>{row.no}</span>,
    },
    {
      kind: 'type',
      key: 'type',
      header: '문의유형',
      sortable: true,
      // 색은 처리상태가 갖는다 — 유형 배지는 중립 톤으로 둬 표가 알록달록해지지 않게
      tone: () => 'secondary',
    },
    {
      kind: 'title',
      key: 'title',
      header: '제목',
      ratio: 4,
      sortable: true,
      onClick: onRowOpen,
      render: (row) => (
        <span className={styles.titleCell}>
          {(row.urgent === true || row.reported === true) && (
            <span className={styles.tags}>
              {row.urgent === true && <Tag label="긴급" tone="error" size="sm" />}
              {row.reported === true && <Tag label="신고" tone="warning" size="sm" />}
            </span>
          )}
          <span className={styles.titleText}>{row.title}</span>
        </span>
      ),
    },
    {
      kind: 'text',
      key: 'productName',
      header: '상품명',
      value: (row) => row.productName ?? '-',
    },
    {
      kind: 'text',
      key: 'orderNo',
      header: '주문번호',
      ratio: 1,
      value: (row) => row.orderNo ?? '-',
    },
    { kind: 'user', key: 'author', header: '작성자', sortable: true },
    { kind: 'user', key: 'memberGrade', header: '회원등급', value: (row) => row.memberGrade ?? '-' },
    { kind: 'user', key: 'assignee', header: '담당자', value: (row) => row.assignee ?? '미배정' },
    { kind: 'date', key: 'createdAt', header: '등록일', sortable: true },
    {
      kind: 'date',
      key: 'answeredAt',
      header: '답변일',
      sortable: true,
      value: (row) => row.answeredAt ?? '-',
    },
    { kind: 'number', key: 'views', header: '조회수', sortable: true },
    {
      kind: 'badge',
      key: 'status',
      header: '처리상태',
      sortable: true,
      // 내보내기는 한글 라벨로 — 화면은 톤 배지, 종료는 흐리게
      value: (row) => STATUS_LABEL[row.status],
      render: (row) => (
        <span className={row.status === 'closed' ? styles.dim : styles.tone}>
          <Badge
            variant={STATUS_TONE[row.status]}
            appearance="soft"
            size="sm"
            label={STATUS_LABEL[row.status]}
          />
        </span>
      ),
    },
    {
      kind: 'badge',
      key: 'isPublic',
      header: '공개여부',
      value: (row) => (row.isPublic ? '공개' : '비공개'),
      tone: (row) => (row.isPublic ? 'primary' : 'secondary'),
    },
    {
      kind: 'badge',
      key: 'hasAttachment',
      header: '첨부',
      value: (row) => (row.hasAttachment === true ? '있음' : '없음'),
      render: (row) =>
        row.hasAttachment === true ? (
          <span className={styles.attach} role="img" aria-label="첨부파일 있음">
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
      header: '상세보기',
      pinned: 'right',
      render: (row) => (
        <button
          type="button"
          className={styles.detailButton}
          aria-label={`${row.title} 상세보기`}
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
        tabs={TAB_ITEMS}
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
          title: '선택한 문의를 삭제할까요?',
          description: (ids) => `문의 ${ids.length}건이 목록에서 제거됩니다.`,
        }}
        columnPicker={columnPicker}
        exportable={exportable}
        exportFilename={exportFilename}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        emptyText={emptyText}
        // 문의 한 건이 길어 행에 숨 쉴 자리를 준다(표 기본 밀도)
        density="comfortable"
        show={{ tabs: showTabs, search: showSearch, count: showCount }}
      />

      {dialog === 'assign' && (
        <CrudDialog
          open
          mode="edit"
          title="담당자 변경"
          description={`선택한 ${selectedIds.length}건의 담당자를 변경합니다.`}
          confirmLabel="변경"
          onCancel={closeDialog}
          onConfirm={() => {
            if (assignDraft == null) return
            finish(() => onBulkAssign?.(selectedIds, assignDraft))
          }}
        >
          <div className={styles.field}>
            <Select
              label="담당자"
              value={assignDraft}
              options={assignees}
              placeholder="담당자 선택"
              onChange={setAssignDraft}
            />
          </div>
        </CrudDialog>
      )}

      {dialog === 'status' && (
        <CrudDialog
          open
          mode="edit"
          title="상태 변경"
          description={`선택한 ${selectedIds.length}건의 처리상태를 변경합니다.`}
          confirmLabel="변경"
          onCancel={closeDialog}
          onConfirm={() => finish(() => onBulkStatus?.(selectedIds, statusDraft))}
        >
          <div className={styles.field}>
            <Select
              label="처리상태"
              value={statusDraft}
              options={STATUS_OPTIONS}
              onChange={(value) => setStatusDraft(value as InquiryStatus)}
            />
          </div>
        </CrudDialog>
      )}
    </>
  )
}
