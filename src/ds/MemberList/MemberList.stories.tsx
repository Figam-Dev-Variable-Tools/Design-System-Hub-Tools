import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ExternalLink, Gift, Lock, Trash, UserPlus } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { MemberList, type MemberRow } from './MemberList'
import type { GroupPanelItem } from '../GroupPanel/GroupPanel'

// 상대시간('11시간전')이 스토리마다 흔들리지 않도록 기준 시각을 고정한다
const NOW = '2026-07-13T18:00:00'

const GROUP_NONE = '그룹 없음'
const GROUP_FREESHIP = '무료 배송 결제 그룹'
const GROUP_OPS = '운영진 그룹'
const GROUP_PARTNER = '파트너 그룹'

// 좌측 패널 — 전체 495명, 대부분은 그룹 없음(490)
const MEMBER_GROUPS: GroupPanelItem[] = [
  { key: 'all', label: '전체 사용자', count: 495 },
  { key: 'none', label: GROUP_NONE, count: 490, group: '그룹' },
  { key: 'freeship', label: GROUP_FREESHIP, count: 3, group: '그룹' },
  { key: 'ops', label: GROUP_OPS, count: 5, group: '그룹' },
  { key: 'partner', label: GROUP_PARTNER, count: 2, group: '그룹' },
]

/** 그룹 패널 key → 행의 group 라벨 */
const GROUP_LABEL: Record<string, string> = {
  none: GROUP_NONE,
  freeship: GROUP_FREESHIP,
  ops: GROUP_OPS,
  partner: GROUP_PARTNER,
}

// ── 목데이터 14건 — 가입일이 상대시간/절대일자로 갈리고, 활동 0/0/0/0인 행도 섞이게 ──
const MEMBERS: MemberRow[] = [
  {
    id: 'u01',
    nickname: '서준아빠',
    account: 'seojun.kim@gmail.com',
    memberType: '일반 회원',
    group: GROUP_NONE,
    joinedAt: '2026-07-13T07:00:00',
    points: 0,
    counts: { posts: 0, comments: 0, reviews: 0, inquiries: 0 },
    totalPurchase: 0,
  },
  {
    id: 'u02',
    nickname: '하윤맘',
    account: 'hayoon.lee@naver.com',
    memberType: '일반 회원',
    group: GROUP_NONE,
    joinedAt: '2026-07-13T14:30:00',
    points: 3000,
    counts: { posts: 1, comments: 0, reviews: 0, inquiries: 1 },
    totalPurchase: 48000,
    memo: '첫 구매 쿠폰 문의함',
  },
  {
    id: 'u03',
    nickname: '민트초코러버',
    account: 'mintchoco@daum.net',
    memberType: '일반 회원',
    group: GROUP_FREESHIP,
    joinedAt: '2026-07-11T09:15:00',
    points: 12500,
    counts: { posts: 4, comments: 12, reviews: 3, inquiries: 0 },
    totalPurchase: 384000,
  },
  {
    id: 'u04',
    nickname: '홍성보',
    account: 'sb.hong@spaceplanning.ai',
    memberType: '운영진',
    group: GROUP_OPS,
    joinedAt: '2024-03-04T10:00:00',
    points: 0,
    counts: { posts: 38, comments: 142, reviews: 0, inquiries: 0 },
    totalPurchase: 0,
    memo: '스토어 운영 총괄',
  },
  {
    id: 'u05',
    nickname: '도현이네',
    account: 'dohyun.park@gmail.com',
    memberType: '일반 회원',
    group: GROUP_NONE,
    joinedAt: '2026-07-09T20:40:00',
    points: 500,
    counts: { posts: 0, comments: 2, reviews: 1, inquiries: 0 },
    totalPurchase: 29000,
  },
  {
    id: 'u06',
    nickname: '지우스타일',
    account: 'jiwoo.choi@kakao.com',
    memberType: '작가',
    group: GROUP_PARTNER,
    joinedAt: '2025-05-18T13:20:00',
    points: 84000,
    counts: { posts: 96, comments: 210, reviews: 12, inquiries: 4 },
    totalPurchase: 1284000,
    memo: '리뷰 콘텐츠 제휴',
  },
  {
    id: 'u07',
    nickname: '예린',
    account: 'yerin.jung@nate.com',
    memberType: '일반 회원',
    group: GROUP_NONE,
    joinedAt: '2023-09-30T08:05:00',
    points: 0,
    counts: { posts: 0, comments: 0, reviews: 0, inquiries: 0 },
    totalPurchase: 0,
  },
  {
    id: 'u08',
    nickname: '강민준',
    account: 'minjun.kang@gmail.com',
    memberType: '일반 회원',
    group: GROUP_FREESHIP,
    joinedAt: '2025-04-17T16:45:00',
    points: 21400,
    counts: { posts: 2, comments: 8, reviews: 6, inquiries: 2 },
    totalPurchase: 742000,
  },
  {
    id: 'u09',
    nickname: '수아공주',
    account: 'sua.lim@naver.com',
    memberType: '일반 회원',
    group: GROUP_NONE,
    joinedAt: '2026-07-12T22:10:00',
    points: 1000,
    counts: { posts: 0, comments: 1, reviews: 0, inquiries: 0 },
    totalPurchase: 15900,
  },
  {
    id: 'u10',
    nickname: '캠핑하는남자',
    account: 'camping.oh@gmail.com',
    memberType: '일반 회원',
    group: GROUP_NONE,
    joinedAt: '2024-11-22T11:30:00',
    points: 6800,
    counts: { posts: 7, comments: 19, reviews: 9, inquiries: 1 },
    totalPurchase: 2140000,
    memo: '대량 구매 문의 잦음',
  },
  {
    id: 'u11',
    nickname: '스팸계정1',
    account: 'noreply.spam@tempmail.com',
    memberType: '차단 회원',
    group: GROUP_NONE,
    joinedAt: '2026-06-28T03:12:00',
    points: 0,
    counts: { posts: 0, comments: 34, reviews: 0, inquiries: 0 },
    totalPurchase: 0,
    memo: '광고 댓글 반복 — 차단',
  },
  {
    id: 'u12',
    nickname: '윤아씨',
    account: 'yuna.shin@kakao.com',
    memberType: '일반 회원',
    group: GROUP_NONE,
    joinedAt: '2026-07-06T18:55:00',
    points: 2200,
    counts: { posts: 1, comments: 3, reviews: 2, inquiries: 0 },
    totalPurchase: 96000,
  },
  {
    id: 'u13',
    nickname: '박운영',
    account: 'ops.park@spaceplanning.ai',
    memberType: '운영진',
    group: GROUP_OPS,
    joinedAt: '2025-01-09T09:00:00',
    points: 0,
    counts: { posts: 12, comments: 64, reviews: 0, inquiries: 0 },
    totalPurchase: 0,
  },
  {
    id: 'u14',
    nickname: '태오네집',
    account: 'taeo.house@gmail.com',
    memberType: '일반 회원',
    group: GROUP_NONE,
    joinedAt: '2022-12-15T14:00:00',
    points: 340,
    counts: { posts: 0, comments: 0, reviews: 1, inquiries: 3 },
    totalPurchase: 58000,
  },
]

const meta = {
  title: 'Admin/MemberList',
  component: MemberList,
  tags: ['autodocs'],
  args: {
    rows: MEMBERS,
    groups: MEMBER_GROUPS,
    total: 495,
    now: NOW,
    density: 'compact',
  },
  argTypes: {
    rows: { control: false },
    groups: { control: false },
    groupFootnote: { control: false },

    // 요소 ON/OFF — 툴바 한 줄과 표 도구를 켜고 끈다
    showToolbar: { control: 'boolean' },
    showSearch: { control: 'boolean' },
    showCount: { control: 'boolean' },
    columnPicker: { control: 'boolean' },
    exportable: { control: 'boolean' },

    // 아이콘 슬롯 — 노드라 컨트롤은 닫아둔다
    viewIcon: { control: false },
    groupIcon: { control: false },
    pointsIcon: { control: false },
    blockIcon: { control: false },
    deleteIcon: { control: false },

    // 카피
    title: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    countUnit: { control: 'text' },
    emptyText: { control: 'text' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof MemberList>

export default meta
type Story = StoryObj<typeof meta>

/** 그룹 선택·검색·행 조작이 실제로 도는 데모 래퍼 — 화면은 데이터 주도라 상태는 여기서 든다 */
function MemberListDemo({ density = 'compact' }: { density?: 'compact' | 'comfortable' }) {
  const [rows, setRows] = useState(MEMBERS)
  const [group, setGroup] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState('')

  // 좌측 그룹 + 검색어(엔터로 확정)로 좁힌다
  const filtered = rows.filter((row) => {
    const label = GROUP_LABEL[group]
    if (label != null && row.group !== label) return false
    if (query === '') return true
    const text = `${row.nickname} ${row.account} ${row.group}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  const patch = (ids: string[], next: (row: MemberRow) => MemberRow) => {
    setRows((prev) => prev.map((row) => (ids.includes(row.id) ? next(row) : row)))
  }

  return (
    <MemberList
      rows={filtered}
      // 전체 사용자일 때만 서버 총계(495) — 좁힌 뒤에는 실제 걸러진 건수를 보여준다
      total={group === 'all' && query === '' ? 495 : filtered.length}
      groups={MEMBER_GROUPS}
      groupValue={group}
      onGroupChange={setGroup}
      onGroupAdd={() => {}}
      keyword={keyword}
      onKeywordChange={setKeyword}
      onSearch={setQuery}
      now={NOW}
      density={density}
      onExport={() => {}}
      onOpen={() => {}}
      // 그룹 변경 — 데모에선 무료 배송 결제 그룹으로 옮긴다
      onChangeGroup={(ids) => patch(ids, (row) => ({ ...row, group: GROUP_FREESHIP }))}
      // 적립금 지급 — 데모에선 1,000원씩
      onGivePoints={(ids) => patch(ids, (row) => ({ ...row, points: row.points + 1000 }))}
      onBlock={(row) => patch([row.id], (item) => ({ ...item, memberType: '차단 회원' }))}
      onDelete={(ids) => setRows((prev) => prev.filter((row) => !ids.includes(row.id)))}
      onMemoChange={(row, memo) => patch([row.id], (item) => ({ ...item, memo }))}
    />
  )
}

/**
 * 좌측 그룹 패널 + 공용 툴바(검색 ····· "495명" + 내보내기) + 표.
 * 행에서 바로: 메모(연필) · 케밥(상세보기/그룹 변경/적립금 지급/차단/삭제),
 * 체크하면 하단에 일괄(그룹 변경 · 적립금 지급 · 삭제)이 뜬다.
 */
export const Default: Story = {
  render: () => <MemberListDemo />,
}

/** 밀도 비교 — 행 높이 56px. 기본(compact 44px)과 나란히 두고 고르면 된다. */
export const Comfortable: Story = {
  render: () => <MemberListDemo density="comfortable" />,
}

/** 검색 결과 없음 — 표 자리에 공용 빈 상태가 들어간다(툴바 건수는 0명) */
export const Empty: Story = {
  args: {
    rows: [],
    total: 0,
    groupValue: 'freeship',
    emptyText: '조건에 맞는 회원이 없습니다.',
  },
}

/** 불러오는 중 — 표 위에 오버레이, 툴바·그룹 패널은 그대로 조작 가능 */
export const Loading: Story = {
  args: {
    loading: true,
  },
}

/** 툴바 OFF — 검색·건수·내보내기가 통째로 빠지고 표만 남는다(필터를 바깥에서 걸어둔 화면용) */
export const NoToolbar: Story = {
  args: {
    showToolbar: false,
  },
}

/** 표만 남기는 최소 구성 — 툴바를 켜두되 검색·건수·열 선택기·CSV까지 다 끈 상태 */
export const Minimal: Story = {
  args: {
    showSearch: false,
    showCount: false,
    columnPicker: false,
    exportable: false,
  },
}

/** 아이콘 교체 — 케밥·일괄 액션 아이콘을 서비스 아이콘 세트로 갈아끼운다 */
export const CustomIcons: Story = {
  args: {
    viewIcon: <ExternalLink size={14} />,
    groupIcon: <UserPlus size={14} />,
    pointsIcon: <Gift size={14} />,
    blockIcon: <Lock size={14} />,
    deleteIcon: <Trash size={14} />,
  },
}

/** 카피 교체 — 같은 화면을 '작가 목록'으로 돌려쓴다(단위도 '명' → '분') */
export const CustomCopy: Story = {
  args: {
    title: '작가 관리',
    searchPlaceholder: '작가명 · 계정으로 검색',
    countUnit: '분',
    emptyText: '등록된 작가가 없습니다.',
  },
}
