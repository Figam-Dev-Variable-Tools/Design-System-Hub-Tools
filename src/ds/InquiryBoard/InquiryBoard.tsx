import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { CheckCheck, Eye, Search, Trash2 } from 'lucide-react'
import styles from './InquiryBoard.module.css'
import {
  mergeLabels,
  resolveLabel,
  type ColumnLabels,
  type DeepPartialOneLevel,
  type EmptyLabels,
  type StatusLabels,
  type TabLabels,
} from '../../shared/labels'
import { AdminListPage } from '../AdminListPage/AdminListPage'
import {
  type AdminBulkAction,
  type AdminColumn,
  type AdminColumnTone,
  type AdminRowMenuItem,
} from '../AdminTable/AdminTable'
import type { CategoryTabItem } from '../CategoryTabs/CategoryTabs'
import type { SearchFieldDef, SearchValues } from '../SearchPanel/SearchPanel'
import { Badge } from '../Badge/Badge'

/** 신청서 처리 상태 — 미확인 → 확인중 → 완료, 그 밖에 보류 */
export type InquiryApplicationStatus = 'pending' | 'checking' | 'done' | 'hold'

/** 표 컬럼 — labels.columns의 키이자 AdminTable 컬럼 key */
export type InquiryBoardColumnKey =
  | 'no'
  | 'category'
  | 'title'
  | 'applicant'
  | 'phone'
  | 'email'
  | 'appliedAt'
  | 'updatedAt'
  | 'status'

/** 홈페이지에서 접수된 상담/도입 신청 한 건 */
export type InquiryApplicationRow = {
  id: string
  category: string
  title: string
  /** 신청자명 */
  applicant: string
  /** 연락처 — 010-0000-0000 */
  phone: string
  email: string
  /** 신청일 YYYY-MM-DD */
  appliedAt: string
  /** 최종 수정일 — 아직 손대지 않았으면 비운다 */
  updatedAt?: string
  status: InquiryApplicationStatus
}

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   컬럼 머리글·상태·탭·검색 조건·일괄 버튼·행 케밥을 한 통로로 연다.
   검색 조건은 label/placeholder를 '한 단계'로 편다 — 2단계로 파면 mergeLabels가 그룹을 통째로
   교체해 placeholder만 넘겨도 label 기본값이 사라진다.
   우선순위: 개별 prop(title·emptyText·createLabel) > labels.* > 기본값. */
type InquiryBoardLabelsResolved = {
  title: string
  description: string
  /** 헤더 등록 버튼 */
  create: string
  columns: Record<InquiryBoardColumnKey, string>
  /** 배지·탭·검색 Select가 함께 쓰는 상태 문구 */
  status: Record<InquiryApplicationStatus, string>
  /** 케밥의 '…으로 변경' — 조사가 상태마다 달라 통짜 문자열로 받는다 */
  statusChange: Record<InquiryApplicationStatus, string>
  /** 상태 탭 앞의 '전체' — 나머지 탭은 labels.status를 따라간다 */
  tabs: { all: string }
  /** 검색 패널 조건 — <키> = 라벨, <키>Placeholder = 입력 힌트 */
  search: {
    title: string
    titlePlaceholder: string
    applicant: string
    applicantPlaceholder: string
    phone: string
    phonePlaceholder: string
    email: string
    emailPlaceholder: string
    period: string
    status: string
    category: string
  }
  /** 선택 시 표 하단에 뜨는 일괄 처리 버튼 */
  bulk: { checking: string; done: string }
  /** 행 케밥 — 상태 변경 항목은 labels.statusChange가 갖는다 */
  rowMenu: { open: string; delete: string }
  empty: EmptyLabels
  /** 값이 없는 칸(수정일)에 찍히는 문자 */
  emptyCell: string
}

export const DEFAULT_INQUIRY_BOARD_LABELS: InquiryBoardLabelsResolved = {
  title: '문의 내역',
  description: '홈페이지에서 접수된 상담 신청서를 확인하고 처리 상태를 관리합니다.',
  create: '신청서 등록',
  columns: {
    no: '순번',
    category: '카테고리',
    title: '제목',
    applicant: '신청자',
    phone: '연락처',
    email: '이메일',
    appliedAt: '신청일',
    updatedAt: '수정일',
    status: '상태',
  },
  status: { pending: '미확인', checking: '확인중', done: '완료', hold: '보류' },
  statusChange: {
    pending: '미확인으로 변경',
    checking: '확인중으로 변경',
    done: '완료로 변경',
    hold: '보류로 변경',
  },
  tabs: { all: '전체' },
  search: {
    title: '제목',
    titlePlaceholder: '제목으로 검색',
    applicant: '신청자',
    applicantPlaceholder: '신청자명 입력',
    phone: '연락처',
    phonePlaceholder: '010-0000-0000',
    email: '이메일',
    emailPlaceholder: 'user@example.com',
    period: '신청일',
    status: '상태',
    category: '카테고리',
  },
  bulk: { checking: '확인중 처리', done: '완료 처리' },
  rowMenu: { open: '상세 보기', delete: '삭제' },
  empty: { title: '접수된 문의 신청이 없습니다.' },
  emptyCell: '-',
} as const

export type InquiryBoardLabels = DeepPartialOneLevel<InquiryBoardLabelsResolved>

/** 컬럼 머리글만 갈아끼울 때 — labels.columns와 같은 모양 */
export type InquiryBoardColumnLabels = ColumnLabels<InquiryBoardColumnKey>
/** 상태 문구만 갈아끼울 때 — labels.status와 같은 모양 */
export type InquiryBoardStatusLabels = StatusLabels<InquiryApplicationStatus>
/** 탭 라벨만 갈아끼울 때 */
export type InquiryBoardTabLabels = TabLabels<InquiryApplicationStatus>

export type InquiryBoardProps = {
  rows: InquiryApplicationRow[]
  /** @deprecated labels.title 을 쓰세요 (개별 prop이 labels보다 우선한다) */
  title?: string
  /** @deprecated labels.description 을 쓰세요 */
  description?: string
  /** 서버 페이징 시 전체 건수 — 없으면 탭으로 걸러진 rows 길이를 쓴다 */
  total?: number
  loading?: boolean
  /** 검색·상태 Select의 카테고리 후보 — 목록 데이터와 같은 라벨을 쓴다 */
  categories?: { label: string; value: string }[]
  /** 표 밀도 — 레이아웃과 표에 같은 값을 넘긴다(기본 compact: 행 44px) */
  density?: 'compact' | 'comfortable'
  /** 행(제목/케밥) 클릭 — 신청서 상세로 이동한다 */
  onOpen?: (row: InquiryApplicationRow) => void
  onSearch?: (values: SearchValues) => void
  /** 케밥에서 상태 변경 — 없으면 상태 항목을 숨긴다 */
  onStatusChange?: (row: InquiryApplicationRow, status: InquiryApplicationStatus) => void
  onDelete?: (row: InquiryApplicationRow) => void
  onBulkStatus?: (ids: string[], status: InquiryApplicationStatus) => void
  onBulkDelete?: (ids: string[]) => void
  /** 있으면 헤더 우측에 '신청서 등록' 버튼 */
  onCreate?: () => void

  /* ── 요소 ON/OFF — 전부 기본 true. false면 그 요소가 DOM에서 통째로 사라진다 ── */
  /** 상태 탭(전체·미확인·확인중·완료·보류) */
  showTabs?: boolean
  /** 상단 검색 패널 — 서버 검색을 안 붙인 화면에서 끈다 */
  showSearch?: boolean
  /** 표 위 "N건" 툴바 */
  showCount?: boolean
  /** 표 우상단 '컬럼' 피커 */
  columnPicker?: boolean
  /** 표 우상단 '내보내기' */
  exportable?: boolean

  /* ── 문구 ── */
  /** @deprecated labels.empty.title 을 쓰세요 */
  emptyText?: string
  /** @deprecated labels.create 를 쓰세요 */
  createLabel?: string
  /** 내보내기 파일명 (기본 '문의내역') */
  exportFilename?: string
  /** 화면 문구를 통째로 갈아끼우는 단일 통로 — 개별 카피 prop이 우선한다 */
  labels?: InquiryBoardLabels

  /* ── 톤 ── */
  /** 상태 배지 톤 — 넘긴 키만 기본 톤(미확인=warning·확인중=primary·완료=success·보류=secondary)을 덮어쓴다 */
  statusTone?: Partial<Record<InquiryApplicationStatus, AdminColumnTone>>

  /* ── 아이콘 슬롯 ── */
  /** 등록 버튼 아이콘 (기본 Plus) */
  createIcon?: ReactNode
  /** 케밥의 '상세 보기' 아이콘 (기본 Eye) */
  viewIcon?: ReactNode
  /** 케밥의 '삭제' 아이콘 (기본 Trash2) */
  deleteIcon?: ReactNode
}

/** @deprecated DEFAULT_INQUIRY_BOARD_LABELS.status 를 쓰세요 (기존 이름 유지용 alias) */
export const STATUS_LABEL: Record<InquiryApplicationStatus, string> =
  DEFAULT_INQUIRY_BOARD_LABELS.status

/** @deprecated DEFAULT_INQUIRY_BOARD_LABELS.statusChange 를 쓰세요 (기존 이름 유지용 alias) */
export const STATUS_CHANGE_LABEL: Record<InquiryApplicationStatus, string> =
  DEFAULT_INQUIRY_BOARD_LABELS.statusChange

// 강조색은 primary 하나 — 미확인만 처리 필요를 warning으로 알리고 나머지는 조용한 soft 배지.
// statusTone prop으로 키 단위 교체한다
const STATUS_TONE: Record<InquiryApplicationStatus, AdminColumnTone> = {
  pending: 'warning',
  checking: 'primary',
  done: 'success',
  hold: 'secondary',
}

const STATUS_ORDER: InquiryApplicationStatus[] = ['pending', 'checking', 'done', 'hold']

/** 신청 카테고리 기본값 — categories prop으로 덮어쓸 수 있다 */
const DEFAULT_CATEGORIES = [
  { label: '서비스 도입', value: '서비스 도입' },
  { label: '견적 문의', value: '견적 문의' },
  { label: '제휴/파트너십', value: '제휴/파트너십' },
  { label: '기술 지원', value: '기술 지원' },
  { label: '기타', value: '기타' },
]

/** 탭 = 상태 축 그대로(전체 + 4상태) */
type TabKey = 'all' | InquiryApplicationStatus

const TAB_ORDER: TabKey[] = ['all', 'pending', 'checking', 'done', 'hold']

function matchesTab(row: InquiryApplicationRow, tab: string): boolean {
  return tab === 'all' || row.status === tab
}

/**
 * InquiryBoard — 문의(상담/도입) 신청 내역 목록 화면.
 *
 * 화면 골격(헤더·탭·검색 패널·건수 바·표·페이징·선택·일괄 처리)은 전부 AdminListPage가 갖는다.
 * 이 파일에 남는 것은 이 화면만의 것 세 가지뿐이다 —
 *   1) 컬럼      : 체크박스·순번·카테고리·제목·신청자·연락처·이메일·신청일·수정일·상태·케밥
 *   2) 상태 축   : pending/checking/done/hold 의 라벨·톤·탭
 *   3) 한국어 문구: 타이틀·설명·등록 버튼·빈 상태·내보내기 파일명
 *
 * 탭 필터와 페이징은 rows에 대해 클라이언트에서 처리하고(matchTab), 검색 조건은 onSearch로 넘긴다
 * (서버 조회 결과를 rows로 다시 받는 구조).
 *
 * 문의 '관리'(InquiryList)와는 별개 화면이다 — 이쪽은 답변이 아니라 접수된 신청서를 처리한다.
 */
export function InquiryBoard({
  rows,
  // 카피의 기본값은 DEFAULT_INQUIRY_BOARD_LABELS가 갖는다 — 여기서 기본값을 주면
  // 넘기지 않은 개별 prop이 labels를 항상 이겨 통로가 막힌다
  title,
  description,
  total,
  loading = false,
  categories = DEFAULT_CATEGORIES,
  density = 'compact',
  onOpen,
  onSearch,
  onStatusChange,
  onDelete,
  onBulkStatus,
  onBulkDelete,
  onCreate,
  showTabs = true,
  showSearch = true,
  showCount = true,
  columnPicker = true,
  exportable = true,
  emptyText,
  createLabel,
  exportFilename = '문의내역',
  labels,
  statusTone,
  createIcon,
  viewIcon,
  deleteIcon,
}: InquiryBoardProps) {
  const L = mergeLabels(DEFAULT_INQUIRY_BOARD_LABELS, labels)
  // 톤은 문구가 아니다 — 키마다 덮어쓰고 넘기지 않은 키는 기본 톤을 지킨다
  const tone: Record<InquiryApplicationStatus, AdminColumnTone> = { ...STATUS_TONE, ...statusTone }

  const tabItems: CategoryTabItem[] = TAB_ORDER.map((key) => ({
    label: key === 'all' ? L.tabs.all : L.status[key],
    value: key,
    fixed: true,
  }))

  // ── 검색 조건 — 값·초기화·엔터는 셸이 굴린다. 여기서는 조건 목록만 선언한다 ──
  const fields = useMemo<SearchFieldDef[]>(
    () => [
      {
        kind: 'text',
        key: 'title',
        label: L.search.title,
        placeholder: L.search.titlePlaceholder,
        span: 2,
      },
      {
        kind: 'text',
        key: 'applicant',
        label: L.search.applicant,
        placeholder: L.search.applicantPlaceholder,
      },
      { kind: 'text', key: 'phone', label: L.search.phone, placeholder: L.search.phonePlaceholder },
      { kind: 'text', key: 'email', label: L.search.email, placeholder: L.search.emailPlaceholder },
      {
        kind: 'daterange',
        key: 'period',
        label: L.search.period,
        presets: ['today', '7d', '30d', '90d'],
        span: 2,
      },
      {
        kind: 'select',
        key: 'status',
        label: L.search.status,
        options: STATUS_ORDER.map((status) => ({ label: L.status[status], value: status })),
      },
      { kind: 'select', key: 'category', label: L.search.category, options: categories },
    ],
    [categories, L.search, L.status],
  )

  // ── 일괄 처리 — 선택 시 표 하단에 뜬다(실행 후 선택 해제는 셸이 한다) ──
  const bulkActions: AdminBulkAction[] = []
  if (onBulkStatus != null) {
    bulkActions.push({
      key: 'checking',
      label: L.bulk.checking,
      icon: <Search size={14} aria-hidden="true" />,
      onAction: (ids) => onBulkStatus(ids, 'checking'),
    })
    bulkActions.push({
      key: 'done',
      label: L.bulk.done,
      tone: 'primary',
      icon: <CheckCheck size={14} aria-hidden="true" />,
      onAction: (ids) => onBulkStatus(ids, 'done'),
    })
  }

  // ── 행 케밥 — 상세 보기 · 상태 변경 · 삭제 ────────────────────────────
  const rowMenu = (row: InquiryApplicationRow): AdminRowMenuItem[] => {
    const items: AdminRowMenuItem[] = []

    if (onOpen != null) {
      items.push({
        key: 'open',
        label: L.rowMenu.open,
        icon: viewIcon ?? <Eye size={14} aria-hidden="true" />,
        onSelect: () => onOpen(row),
      })
    }

    if (onStatusChange != null) {
      // 현재 상태는 빼고 나머지만 — 첫 항목 위에만 구분선
      const others = STATUS_ORDER.filter((status) => status !== row.status)
      others.forEach((status, i) => {
        items.push({
          key: status,
          label: L.statusChange[status],
          divider: i === 0 && items.length > 0,
          onSelect: () => onStatusChange(row, status),
        })
      })
    }

    if (onDelete != null) {
      items.push({
        key: 'delete',
        label: L.rowMenu.delete,
        tone: 'error',
        icon: deleteIcon ?? <Trash2 size={14} aria-hidden="true" />,
        divider: items.length > 0,
        onSelect: () => onDelete(row),
      })
    }

    return items
  }

  // ── 컬럼 — 제목 클릭(onClick)은 셸이 onRowOpen을 물린다 ────────────────
  const columns: AdminColumn<InquiryApplicationRow>[] = [
    { kind: 'select', key: 'select', pinned: 'left' },
    { kind: 'index', key: 'no', header: L.columns.no },
    {
      kind: 'category',
      key: 'category',
      header: L.columns.category,
      sortable: true,
      // 색은 상태 컬럼이 갖는다 — 카테고리는 중립 톤으로 둬 표가 알록달록해지지 않게
      tone: () => 'secondary',
    },
    {
      kind: 'title',
      key: 'title',
      header: L.columns.title,
      ratio: 3,
      align: 'left',
      sortable: true,
    },
    { kind: 'user', key: 'applicant', header: L.columns.applicant, align: 'left', sortable: true },
    {
      kind: 'text',
      key: 'phone',
      header: L.columns.phone,
      ratio: 1,
      // 자릿수가 세로로 맞아야 스캔이 된다
      render: (row) => <span className={styles.phone}>{row.phone}</span>,
    },
    {
      kind: 'text',
      key: 'email',
      header: L.columns.email,
      ratio: 2,
      render: (row) => (
        <span className={styles.email} title={row.email}>
          {row.email}
        </span>
      ),
    },
    { kind: 'date', key: 'appliedAt', header: L.columns.appliedAt, sortable: true },
    {
      kind: 'date',
      key: 'updatedAt',
      header: L.columns.updatedAt,
      sortable: true,
      // 아직 손대지 않은 신청서는 '-'
      value: (row) => row.updatedAt ?? L.emptyCell,
    },
    {
      kind: 'badge',
      key: 'status',
      header: L.columns.status,
      sortable: true,
      // 내보내기는 한글 라벨로 — 화면은 soft 톤 배지
      value: (row) => L.status[row.status],
      render: (row) => (
        <span className={styles.tone}>
          <Badge
            variant={tone[row.status]}
            appearance="soft"
            size="sm"
            label={L.status[row.status]}
          />
        </span>
      ),
    },
    { kind: 'kebab', key: 'kebab', pinned: 'right', menu: rowMenu },
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
      createIcon={createIcon}
      tabs={tabItems}
      matchTab={matchesTab}
      search="panel"
      searchFields={fields}
      onSearch={onSearch}
      onRowOpen={onOpen}
      bulkActions={bulkActions}
      onBulkDelete={onBulkDelete}
      columnPicker={columnPicker}
      exportable={exportable}
      exportFilename={exportFilename}
      emptyText={resolveLabel(emptyText, L.empty.title)}
      density={density}
      show={{ tabs: showTabs, search: showSearch, count: showCount }}
    />
  )
}
