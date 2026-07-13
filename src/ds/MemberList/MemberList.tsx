import { useState } from 'react'
import type { ReactNode } from 'react'
import { Ban, Coins, Eye, Trash2, Users } from 'lucide-react'
import styles from './MemberList.module.css'
import { AdminListPage } from '../AdminListPage/AdminListPage'
import type { AdminBulkAction, AdminColumn, AdminColumnTone } from '../AdminTable/AdminTable'
import { GroupPanel, type GroupPanelItem } from '../GroupPanel/GroupPanel'
import { ToolbarActions } from '../ToolbarActions/ToolbarActions'

/** 회원이 남긴 활동 수 — 표에서 글/댓글/구매평/문의 한 칸에 0/0/0/0으로 묶어 보여준다 */
export type MemberCounts = {
  posts: number
  comments: number
  reviews: number
  inquiries: number
}

export type MemberRow = {
  id: string
  nickname: string
  /** 계정 — 이메일 */
  account: string
  /** 회원 유형(일반 회원 · 운영진 · 작가 …) */
  memberType: string
  /** 소속 그룹 — 없으면 '그룹 없음' */
  group: string
  /** 가입일 ISO — 최근이면 '11시간전', 오래되면 절대일자로 표시된다 */
  joinedAt: string
  points: number
  counts: MemberCounts
  totalPurchase: number
  memo?: string
}

export type MemberListProps = {
  rows: MemberRow[]
  /** 좌측 그룹 패널 항목 — 비우면 패널 자체가 렌더되지 않는다 */
  groups?: GroupPanelItem[]
  groupValue?: string
  onGroupChange?: (key: string) => void
  /** 없으면 '새 그룹 만들기' 버튼이 숨는다 */
  onGroupAdd?: () => void
  groupFootnote?: ReactNode
  title?: string
  description?: string
  /** 본문 헤더 건수 — 서버 총계. 없으면 rows 길이 */
  total?: number
  /** 검색어 — 주지 않으면 컴포넌트가 내부 상태로 관리한다(비제어) */
  keyword?: string
  onKeywordChange?: (keyword: string) => void
  /** 엔터로 확정 — 실제 필터링(rows 좁히기)은 사용처 책임 */
  onSearch?: (keyword: string) => void
  onExport?: () => void
  /** 상세보기 — 닉네임 클릭과 케밥 '상세보기'가 함께 부른다 */
  onOpen?: (row: MemberRow) => void
  /** 그룹 변경 — 케밥(1건)·일괄(N건)이 같은 콜백을 쓴다 */
  onChangeGroup?: (ids: string[]) => void
  /** 적립금 지급 — 케밥(1건)·일괄(N건) 공용 */
  onGivePoints?: (ids: string[]) => void
  onBlock?: (row: MemberRow) => void
  /** 삭제 — 케밥(1건)·일괄(N건) 공용 */
  onDelete?: (ids: string[]) => void
  onMemoChange?: (row: MemberRow, memo: string) => void
  /** 상대시간 기준 시각 — 스토리·테스트에서 결과를 고정하려고 주입한다 */
  now?: string | number | Date
  loading?: boolean
  emptyText?: string
  density?: 'compact' | 'comfortable'
  pageSizeOptions?: number[]
  exportFilename?: string

  // ── 요소 ON/OFF — 같은 화면을 좁은 폭·읽기 전용 등으로 재사용할 때 필요 없는 줄만 끈다 ──
  /** 상단 툴바(검색 + 건수 + 내보내기) 통째로 — 끄면 표만 남는다 */
  showToolbar?: boolean
  /** 툴바 검색창 — 필터를 바깥(대시보드 등)에서 이미 걸어둔 화면이면 끈다 */
  showSearch?: boolean
  /** 툴바 우측 "495명" — 좌측 그룹 패널이 이미 건수를 보여주는 화면이면 중복이라 끈다 */
  showCount?: boolean
  /** 표 열 선택기 — 열을 고정해두고 싶은 화면에서 끈다 */
  columnPicker?: boolean
  /** 표 자체 CSV 내보내기 — 툴바의 내보내기(onExport)와는 별개다 */
  exportable?: boolean

  // ── 아이콘 슬롯 — 서비스별 아이콘 세트로 갈아끼울 수 있게 열어둔다(기본은 lucide) ──
  /** 케밥 '상세보기' */
  viewIcon?: ReactNode
  /** 케밥·일괄 '그룹 변경' */
  groupIcon?: ReactNode
  /** 케밥·일괄 '적립금 지급' */
  pointsIcon?: ReactNode
  /** 케밥 '차단' */
  blockIcon?: ReactNode
  /** 케밥·일괄 '삭제' */
  deleteIcon?: ReactNode

  // ── 카피 — 회원이 아닌 다른 대상(작가·파트너 …) 목록으로 그대로 돌려쓰기 위한 문구 교체구 ──
  searchPlaceholder?: string
  /** 건수 단위 — "495명"의 '명' */
  countUnit?: string
}

const PAGE_SIZE_OPTIONS = [20, 50, 100]

/** 회원 유형별 톤 — 강조색은 primary 하나, 차단만 error, 나머지는 조용한 회색 */
const TYPE_TONE: Record<string, AdminColumnTone> = {
  운영진: 'primary',
  작가: 'primary',
  '차단 회원': 'error',
}

const pad = (value: number): string => String(value).padStart(2, '0')

/**
 * 가입일 표시 — 최근 7일은 상대시간('11시간전'), 그 이상은 절대일자.
 * 목록에서 방금 들어온 회원만 눈에 띄게 하려는 카페24식 혼용 표기다.
 */
function formatJoinedAt(value: string, now: number): string {
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return value

  const diff = now - time
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return '방금전'
  if (minutes < 60) return `${minutes}분전`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간전`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일전`

  const date = new Date(time)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * 회원 목록 화면 — 골격은 전부 AdminListPage(공용 셸)가 갖는다.
 *
 *   side    : GroupPanel(전체 사용자 / 그룹 없음 / 운영 그룹 …)
 *   toolbar : 검색 ····· "전체 사용자 495명" + 내보내기(엔터 확정은 셸이 넘겨준다)
 *   content : AdminTable — 닉네임·계정·유형·그룹·가입일·적립금·활동·구매금액·메모·케밥
 *
 * 이 파일에 남는 건 이 화면만의 것뿐이다 — 컬럼, 유형 톤, 가입일 표기, 좌측 그룹 패널, 한국어 문구.
 * rows는 이미 걸러진 목록이다(그룹·검색 필터링은 사용처 책임) — 셸은 rows를 그대로 그린다.
 */
export function MemberList({
  rows,
  groups,
  groupValue,
  onGroupChange,
  onGroupAdd,
  groupFootnote = '그룹으로 묶으면 회원 유형·혜택을 그룹 단위로 한 번에 바꿀 수 있어요.',
  title = '회원 관리',
  description,
  total,
  keyword,
  onKeywordChange,
  onSearch,
  onExport,
  onOpen,
  onChangeGroup,
  onGivePoints,
  onBlock,
  onDelete,
  onMemoChange,
  now,
  loading = false,
  emptyText = '회원이 없습니다.',
  density = 'compact',
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  exportFilename = 'members',
  showToolbar = true,
  showSearch = true,
  showCount = true,
  columnPicker = true,
  exportable = true,
  viewIcon,
  groupIcon,
  pointsIcon,
  blockIcon,
  deleteIcon,
  searchPlaceholder = '닉네임 · 계정 · 그룹으로 검색',
  countUnit = '명',
}: MemberListProps) {
  // 그룹은 셸이 모르는 축이다(좌측 레일은 셸에겐 그냥 노드) — 선택 상태와 그에 딸린
  // 페이지·행 선택 되돌리기는 이 화면이 갖는다. 그래서 page·selectedIds만 제어값으로 넘긴다.
  const [innerGroup, setInnerGroup] = useState(groups?.[0]?.key ?? '')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const group = groupValue ?? innerGroup
  // 스토리·테스트에서 '11시간전'이 흔들리지 않도록 기준 시각을 주입받는다
  const nowMs = now != null ? new Date(now).getTime() : Date.now()

  const changeGroup = (key: string) => {
    if (groupValue == null) setInnerGroup(key)
    // 그룹이 바뀌면 결과가 통째로 달라진다 — 페이지와 선택을 되돌린다
    setSelectedIds([])
    setPage(1)
    onGroupChange?.(key)
  }

  // 건수 앞머리 — 선택된 그룹명("전체 사용자")을 셸의 totalLabel로 넘긴다.
  // 예전엔 목록 위에 따로 <h2>를 세웠지만, 같은 문구를 두 곳에서 그릴 이유가 없다.
  // 그룹이 없으면 접두사 없이 "495명" — 셸 기본값('총')이 끼어들지 않게 빈 문자열을 준다.
  const groupLabel = groups?.find((item) => item.key === group)?.label ?? ''

  const columns: AdminColumn<MemberRow>[] = [
    // 좌측 고정 — 가로 스크롤해도 '누구인지'는 항상 보인다
    { kind: 'select', key: 'select', pinned: 'left' },
    { kind: 'title', key: 'nickname', header: '닉네임', pinned: 'left', onClick: (row) => onOpen?.(row) },
    { kind: 'text', key: 'account', header: '계정', ratio: 3 },
    {
      kind: 'type',
      key: 'memberType',
      header: '회원 유형',
      tone: (row) => TYPE_TONE[row.memberType] ?? 'secondary',
    },
    { kind: 'text', key: 'group', header: '그룹', ratio: 2 },
    {
      kind: 'date',
      key: 'joinedAt',
      header: '가입일',
      sortable: true,
      // 정렬은 원본 ISO로, 표시는 상대/절대 혼용 — value는 정렬 키까지 겸하므로 원본을 남긴다
      render: (row) => <span className={styles.joined}>{formatJoinedAt(row.joinedAt, nowMs)}</span>,
    },
    { kind: 'number', key: 'points', header: '적립금', align: 'right', sortable: true },
    {
      kind: 'text',
      key: 'counts',
      header: '글/댓글/구매평/문의',
      align: 'center',
      ratio: 1,
      // 내보내기는 화면과 같은 '0/0/0/0' 문자열로 나간다
      value: (row) =>
        `${row.counts.posts}/${row.counts.comments}/${row.counts.reviews}/${row.counts.inquiries}`,
      // 네 값 모두 0이면 조용하게 — 활동이 있는 회원만 눈에 들어오게
      render: (row) => {
        const { posts, comments, reviews, inquiries } = row.counts
        const idle = posts + comments + reviews + inquiries === 0
        return (
          <span className={idle ? [styles.counts, styles.countsIdle].join(' ') : styles.counts}>
            {posts}/{comments}/{reviews}/{inquiries}
          </span>
        )
      },
    },
    { kind: 'price', key: 'totalPurchase', header: '누적 구매금액', sortable: true },
    { kind: 'memo', key: 'memo', header: '메모' },
    {
      kind: 'kebab',
      key: 'kebab',
      pinned: 'right',
      menu: (row) => [
        { key: 'open', label: '상세보기', icon: viewIcon ?? <Eye size={14} />, onSelect: () => onOpen?.(row) },
        { key: 'group', label: '그룹 변경', icon: groupIcon ?? <Users size={14} />, onSelect: () => onChangeGroup?.([row.id]) },
        { key: 'points', label: '적립금 지급', icon: pointsIcon ?? <Coins size={14} />, onSelect: () => onGivePoints?.([row.id]) },
        { key: 'block', label: '차단', icon: blockIcon ?? <Ban size={14} />, divider: true, onSelect: () => onBlock?.(row) },
        { key: 'delete', label: '삭제', icon: deleteIcon ?? <Trash2 size={14} />, tone: 'error', onSelect: () => onDelete?.([row.id]) },
      ],
    },
  ]

  // 일괄 처리 — 실행 후 선택 해제는 셸이 한다(케밥과 같은 콜백에 ids 배열로 모인다)
  const bulkActions: AdminBulkAction[] = [
    {
      key: 'group',
      label: '그룹 변경',
      icon: groupIcon ?? <Users size={14} />,
      onAction: (ids) => onChangeGroup?.(ids),
    },
    {
      key: 'points',
      label: '적립금 지급',
      icon: pointsIcon ?? <Coins size={14} />,
      onAction: (ids) => onGivePoints?.(ids),
    },
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
      side={
        groups != null && groups.length > 0 ? (
          <GroupPanel
            items={groups}
            value={group}
            onChange={changeGroup}
            onAdd={onGroupAdd}
            footnote={groupFootnote}
          />
        ) : undefined
      }
      search="inline"
      keyword={keyword}
      onKeywordChange={onKeywordChange}
      searchPlaceholder={searchPlaceholder}
      // 엔터 확정만 사용처로 넘긴다 — rows 좁히기는 사용처 몫이라 matchKeyword를 주지 않는다
      onSearch={(values) => onSearch?.(String(values.keyword ?? ''))}
      totalLabel={groupLabel}
      totalUnit={countUnit}
      toolbarActions={<ToolbarActions onExport={onExport} />}
      selectedIds={selectedIds}
      onSelectChange={setSelectedIds}
      bulkActions={bulkActions}
      onBulkDelete={(ids) => onDelete?.(ids)}
      onMemoChange={onMemoChange}
      page={page}
      onPageChange={setPage}
      pageSizeOptions={pageSizeOptions}
      columnPicker={columnPicker}
      exportable={exportable}
      exportFilename={exportFilename}
      emptyText={emptyText}
      density={density}
      show={{ toolbar: showToolbar, search: showSearch, count: showCount }}
    />
  )
}
