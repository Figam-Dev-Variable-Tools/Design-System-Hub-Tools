import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import {
  InquiryList,
  type InquiryListProps,
  type InquiryRow,
  type InquiryStatus,
} from './InquiryList'

// ── 목데이터 24건 — 상태·유형·등급이 골고루 섞이도록 인덱스로 조합한다 ──
const TYPES = ['상품 문의', '배송 문의', '교환/반품', '환불 문의', '기타']
const GRADES = ['VIP', '골드', '실버', '일반', '신규']
const AUTHORS = ['홍성보', '김서연', '이준호', '박지민', '최수아', '정다인']
const ASSIGNEES = ['김하늘', '이도윤', '박서연']
const PRODUCTS = [
  '스마트 무선 이어버드 3세대',
  '프리미엄 원목 4인 식탁',
  '경량 러닝화 에어핏 250',
  '스테인리스 보온 텀블러 500ml',
  '고속 충전 멀티 어댑터',
]
const TITLES = [
  '배송이 예정일보다 늦어지고 있습니다',
  '상품 색상이 사진과 다릅니다',
  '사이즈 교환 가능한가요?',
  '결제는 됐는데 주문 내역이 없습니다',
  '부분 환불 신청 절차 문의드립니다',
  '구성품 중 케이블이 누락됐습니다',
]
const STATUSES: InquiryStatus[] = ['received', 'checking', 'answered', 'hold', 'closed']

const pad = (value: number): string => String(value).padStart(2, '0')

const ROWS: InquiryRow[] = Array.from({ length: 24 }, (_, i) => {
  const status = STATUSES[i % 5]
  const answered = status === 'answered' || status === 'closed'
  const day = (i % 27) + 1
  return {
    id: `inq-${pad(i + 1)}`,
    no: `INQ-2026-${pad(i + 1)}${pad((i * 3) % 90)}`,
    type: TYPES[i % 5],
    title: TITLES[i % 6],
    // 일부는 상품/주문이 없는 일반 문의 — '-'로 떨어지는지 확인용
    productName: i % 5 === 4 ? undefined : PRODUCTS[i % 5],
    orderNo: i % 6 === 5 ? undefined : `ORD-2026-${pad(day)}${pad(i + 1)}`,
    author: AUTHORS[i % 6],
    memberGrade: GRADES[i % 5],
    assignee: i % 4 === 3 ? undefined : ASSIGNEES[i % 3],
    createdAt: `2026-07-${pad(day)}`,
    answeredAt: answered ? `2026-07-${pad(Math.min(day + 2, 28))}` : undefined,
    views: ((i * 37) % 420) + 3,
    status,
    isPublic: i % 4 !== 0,
    hasAttachment: i % 3 === 0,
    urgent: i % 7 === 0,
    reported: i % 11 === 0,
  }
})

const ASSIGNEE_OPTIONS = ASSIGNEES.map((name) => ({ label: name, value: name }))
const TYPE_OPTIONS = TYPES.map((type) => ({ label: type, value: type }))

const STATUS_LABEL: Record<InquiryStatus, string> = {
  received: '접수',
  checking: '확인중',
  answered: '답변완료',
  hold: '보류',
  closed: '종료',
}

/**
 * 일괄 처리 데모 — rows를 로컬 state로 들고 실제로 갱신한다.
 * (InquiryList의 검색·탭·페이징·선택은 컴포넌트 내부 state라 별도 배선이 필요 없다)
 */
function InquiryListDemo(props: InquiryListProps) {
  const [rows, setRows] = useState<InquiryRow[]>(props.rows)
  const [log, setLog] = useState<string | null>(null)

  const patch = (ids: string[], make: (row: InquiryRow) => InquiryRow) => {
    const target = new Set(ids)
    setRows((prev) => prev.map((row) => (target.has(row.id) ? make(row) : row)))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 1600 }}>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: log == null ? 'var(--ds-color-secondary)' : 'var(--ds-color-primary)',
          fontFamily: 'var(--ds-font-family)',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {log ?? '행을 선택하면 표 하단에 일괄 처리 버튼(답변 완료·담당자 변경·상태 변경·선택 삭제)이 나타납니다.'}
      </p>

      <InquiryList
        {...props}
        rows={rows}
        onRowOpen={(row) => setLog(`상세보기: ${row.no} ${row.title}`)}
        onBulkAnswered={(ids) => {
          patch(ids, (row) => ({ ...row, status: 'answered', answeredAt: '2026-07-13' }))
          setLog(`답변 완료 처리 ${ids.length}건`)
        }}
        onBulkAssign={(ids, assignee) => {
          patch(ids, (row) => ({ ...row, assignee }))
          setLog(`담당자 변경 ${ids.length}건 → ${assignee}`)
        }}
        onBulkStatus={(ids, status) => {
          patch(ids, (row) => ({ ...row, status }))
          setLog(`상태 변경 ${ids.length}건 → ${STATUS_LABEL[status]}`)
        }}
        onBulkDelete={(ids) => {
          const target = new Set(ids)
          setRows((prev) => prev.filter((row) => !target.has(row.id)))
          setLog(`삭제 ${ids.length}건`)
        }}
      />
    </div>
  )
}

const meta = {
  title: 'Admin/InquiryList',
  component: InquiryList,
  tags: ['autodocs'],
  args: {
    rows: ROWS,
    loading: false,
    assignees: ASSIGNEE_OPTIONS,
    types: TYPE_OPTIONS,
    showTabs: true,
    showSearch: true,
    showCount: true,
    columnPicker: true,
    exportable: true,
    emptyText: '문의 내역이 없습니다.',
    exportFilename: '문의목록',
  },
  argTypes: {
    rows: { control: false },
    assignees: { control: false },
    types: { control: false },
    // 요소 ON/OFF
    showTabs: { control: 'boolean' },
    showSearch: { control: 'boolean' },
    showCount: { control: 'boolean' },
    columnPicker: { control: 'boolean' },
    exportable: { control: 'boolean' },
    // 문구
    emptyText: { control: 'text' },
    exportFilename: { control: 'text' },
    // 노드 슬롯
    viewIcon: { control: false },
    onSearch: { control: false },
    onRowOpen: { control: false },
    onBulkAnswered: { control: false },
    onBulkAssign: { control: false },
    onBulkStatus: { control: false },
    onBulkDelete: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof InquiryList>

export default meta
type Story = StoryObj<typeof meta>

// 문의 24건 — 검색 13조건 · 탭 7개 · 컬럼 16개(가로 스크롤 + 좌우 고정)
export const Default: Story = {
  render: (args) => <InquiryListDemo {...args} />,
}

// 결과 없음 — 표는 EmptyState로 바뀌고 탭 카운트는 모두 0
export const Empty: Story = {
  args: { rows: [] },
  render: (args) => <InquiryList {...args} />,
}

// 조회 중 — 검색 조건은 잠기고 표에는 로딩 오버레이
export const Loading: Story = {
  args: { loading: true },
  render: (args) => <InquiryList {...args} />,
}

// 일괄 처리 — 답변 완료(즉시) · 담당자/상태 변경(확인 모달에서 값 선택) · 삭제(확인 모달).
// 한 페이지에 다 들어오는 8건으로 줄여 헤더 체크박스(전체선택)부터 바로 눌러볼 수 있게 한다.
export const BulkActions: Story = {
  args: { rows: ROWS.slice(0, 8) },
  render: (args) => <InquiryListDemo {...args} />,
}

// 요소 OFF 조합 — 탭·검색·건수·컬럼피커·내보내기를 모두 끈 '표만' 화면.
// 꺼진 요소의 자리는 통째로 접힌다(빈 여백·구분선이 남지 않는다).
export const TableOnly: Story = {
  args: {
    rows: ROWS.slice(0, 8),
    showTabs: false,
    showSearch: false,
    showCount: false,
    columnPicker: false,
    exportable: false,
  },
  render: (args) => <InquiryList {...args} />,
}

// 검색만 끈 상태 — 탭으로만 거르는 좁은 화면
export const WithoutSearch: Story = {
  args: { rows: ROWS.slice(0, 8), showSearch: false },
  render: (args) => <InquiryListDemo {...args} />,
}

/**
 * labels — 화면의 모든 글자를 통로 하나로 갈아끼운다(영문 오버라이드).
 * 컬럼 머리글 · 처리상태 · 7개 탭 · 제목 태그 · 검색 13조건 · 일괄 버튼 ·
 * 값 선택 확인창 2종(담당자·상태)과 삭제 확인창까지 전부 labels가 소유한다.
 */
export const Labels: Story = {
  args: {
    labels: {
      columns: {
        no: 'Inquiry no.',
        type: 'Type',
        title: 'Subject',
        productName: 'Product',
        orderNo: 'Order no.',
        author: 'Author',
        memberGrade: 'Tier',
        assignee: 'Assignee',
        createdAt: 'Created',
        answeredAt: 'Answered',
        views: 'Views',
        status: 'Status',
        isPublic: 'Visibility',
        hasAttachment: 'File',
        detail: 'Detail',
      },
      status: {
        received: 'Received',
        checking: 'In review',
        answered: 'Answered',
        hold: 'On hold',
        closed: 'Closed',
      },
      tabs: {
        all: 'All',
        unanswered: 'Unanswered',
        answered: 'Answered',
        hold: 'On hold',
        closed: 'Closed',
        urgent: 'Urgent',
        reported: 'Reported',
      },
      tags: { urgent: 'Urgent', reported: 'Reported' },
      cells: {
        public: 'Public',
        private: 'Private',
        attached: 'Yes',
        notAttached: 'No',
        attachedAria: 'Has an attachment',
        unassigned: 'Unassigned',
      },
      bulk: { answered: 'Mark as answered', assign: 'Reassign', status: 'Change status' },
      rowActions: { view: (title) => `Open ${title}` },
      empty: { title: 'No inquiries found.' },
      emptyCell: '—',
      assignDialog: {
        title: 'Reassign',
        description: (count) => `Reassign ${count} inquiry(s) to a new owner.`,
        confirmLabel: 'Apply',
        cancelLabel: 'Cancel',
        fieldLabel: 'Assignee',
        placeholder: 'Pick an assignee',
      },
      statusDialog: {
        title: 'Change status',
        description: (count) => `Change the status of ${count} inquiry(s).`,
        confirmLabel: 'Apply',
        cancelLabel: 'Cancel',
        fieldLabel: 'Status',
      },
      deleteDialog: {
        title: 'Delete the selected inquiries?',
        description: (ids) => `${ids.length} inquiry(s) will be removed from the list.`,
      },
    },
  },
  render: (args) => <InquiryListDemo {...args} />,
}
