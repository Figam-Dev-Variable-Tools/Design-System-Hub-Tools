import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Download } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from '../Button/Button'
import {
  InquiryManageList,
  type InquiryManageListProps,
  type InquiryManageRow,
} from './InquiryManageList'

/**
 * 목데이터 — 레퍼런스 그대로: 전체 3 / 대기중 3 / 답변완료 0 / 보류 0.
 * 챗봇으로 접수된 시공 문의라 신청자·연락처·이메일만 남는다.
 */
const ROWS: InquiryManageRow[] = [
  {
    id: 'iq-003',
    no: 3,
    applicant: '박서준',
    phone: '010-4821-7734',
    email: 'seojun.park@gmail.com',
    appliedAt: '2026-07-11',
    status: 'pending',
  },
  {
    id: 'iq-002',
    no: 2,
    applicant: '김민지',
    phone: '010-3376-1902',
    email: 'minji.kim@naver.com',
    appliedAt: '2026-07-09',
    status: 'pending',
  },
  {
    id: 'iq-001',
    no: 1,
    applicant: '이도현',
    phone: '010-2914-5580',
    email: 'dohyun.lee@daum.net',
    appliedAt: '2026-07-07',
    status: 'pending',
  },
]

/**
 * 페이지네이션·일괄 삭제까지 눌러볼 수 있는 14건 —
 * 상태(대기중/답변완료/보류)가 섞여 탭 건수와 배지 톤이 모두 살아난다.
 */
const MANY_ROWS: InquiryManageRow[] = [
  ...ROWS,
  {
    id: 'iq-004',
    no: 4,
    applicant: '최유나',
    phone: '010-7745-2213',
    email: 'yuna.choi@gmail.com',
    appliedAt: '2026-07-12',
    status: 'answered',
  },
  {
    id: 'iq-005',
    no: 5,
    applicant: '정하람',
    phone: '010-5502-8817',
    email: 'haram.jung@kakao.com',
    appliedAt: '2026-07-12',
    status: 'pending',
  },
  {
    id: 'iq-006',
    no: 6,
    applicant: '윤성호',
    phone: '010-8834-0921',
    email: 'sungho.yoon@naver.com',
    appliedAt: '2026-07-10',
    status: 'hold',
  },
  {
    id: 'iq-007',
    no: 7,
    applicant: '한지우',
    phone: '010-2287-6640',
    email: 'jiwoo.han@gmail.com',
    appliedAt: '2026-07-10',
    status: 'answered',
  },
  {
    id: 'iq-008',
    no: 8,
    applicant: '오세영',
    phone: '010-6619-3352',
    email: 'seyoung.oh@daum.net',
    appliedAt: '2026-07-08',
    status: 'pending',
  },
  {
    id: 'iq-009',
    no: 9,
    applicant: '강태오',
    phone: '010-3145-7728',
    email: 'taeo.kang@naver.com',
    appliedAt: '2026-07-08',
    status: 'answered',
  },
  {
    id: 'iq-010',
    no: 10,
    applicant: '임하늘',
    phone: '010-9902-4416',
    email: 'haneul.lim@gmail.com',
    appliedAt: '2026-07-06',
    status: 'hold',
  },
  {
    id: 'iq-011',
    no: 11,
    applicant: '서지훈',
    phone: '010-4437-1108',
    email: 'jihoon.seo@kakao.com',
    appliedAt: '2026-07-05',
    status: 'pending',
  },
  {
    id: 'iq-012',
    no: 12,
    applicant: '노아름',
    phone: '010-7723-9954',
    email: 'areum.noh@naver.com',
    appliedAt: '2026-07-04',
    status: 'answered',
  },
  {
    id: 'iq-013',
    no: 13,
    applicant: '배수민',
    phone: '010-1128-6673',
    email: 'sumin.bae@gmail.com',
    appliedAt: '2026-07-03',
    status: 'pending',
  },
  {
    id: 'iq-014',
    no: 14,
    applicant: '문가온',
    phone: '010-6650-2287',
    email: 'gaon.moon@daum.net',
    appliedAt: '2026-07-02',
    status: 'hold',
  },
]

/** 상세보기·삭제가 실제로 동작하는 데모 — rows를 로컬 state로 들고 지운다. */
function Demo(props: InquiryManageListProps) {
  const [rows, setRows] = useState<InquiryManageRow[]>(props.rows)
  const [log, setLog] = useState<string | null>(null)

  const remove = (ids: string[]) => {
    const target = new Set(ids)
    setRows((prev) => prev.filter((row) => !target.has(row.id)))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <p
        style={{
          margin: 0,
          padding: 'var(--ds-spacing-6) var(--ds-spacing-6) 0',
          minWidth: 0,
          fontFamily: 'var(--ds-font-family)',
          fontSize: 'var(--ds-font-size-sm)',
          color: log == null ? 'var(--ds-color-secondary)' : 'var(--ds-color-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {log ?? '신청자 이름이나 눈 아이콘을 누르면 상세보기, 휴지통은 삭제입니다.'}
      </p>

      <InquiryManageList
        {...props}
        rows={rows}
        onView={(row) => setLog(`상세보기: ${row.no}번 ${row.applicant} (${row.phone})`)}
        onDelete={(row) => {
          remove([row.id])
          setLog(`삭제: ${row.applicant}`)
        }}
        onBulkDelete={(ids) => {
          remove(ids)
          setLog(`선택 삭제 ${ids.length}건`)
        }}
      />
    </div>
  )
}

const meta = {
  title: 'Admin/InquiryManageList',
  component: InquiryManageList,
  tags: ['autodocs'],
  args: {
    rows: ROWS,
    loading: false,
    columnPicker: false,
    pageSize: 10,
  },
  argTypes: {
    rows: { control: false },
    show: { control: 'object' },
    headerActions: { control: false },
    sortOptions: { control: false },
    columnVisibility: { control: false },
    onView: { control: false },
    onDelete: { control: false },
    onBulkDelete: { control: false },
    onTabChange: { control: false },
    onSearch: { control: false },
    onSortChange: { control: false },
    onPageChange: { control: false },
    onSelectChange: { control: false },
    onColumnVisibilityChange: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof InquiryManageList>

export default meta
type Story = StoryObj<typeof meta>

/** 레퍼런스 화면 — 헤더 / 탭(전체 3·대기중 3·답변완료 0·보류 0) / 검색·최신순·3건 / 표. */
export const Default: Story = {
  render: (args) => <Demo {...args} />,
}

/**
 * show 전부 ON — 헤더·탭·툴바(검색/정렬/건수)·페이지네이션·일괄 처리·관리 열이 모두 산다.
 * 14건 + pageSize 10이라 페이지가 2쪽이고, 행을 고르면 하단에 [선택 삭제]가 뜬다.
 */
export const AllSections: Story = {
  args: {
    rows: MANY_ROWS,
    show: {
      header: true,
      tabs: true,
      toolbar: true,
      search: true,
      sort: true,
      total: true,
      pagination: true,
      bulk: true,
      rowActions: true,
    },
    headerActions: (
      <Button
        variant="secondary"
        appearance="outline"
        size="sm"
        label="엑셀 다운로드"
        showLeftIcon
        leftIcon={<Download size={14} />}
      />
    ),
  },
  render: (args) => <Demo {...args} />,
}

/**
 * 대부분 OFF — 표 하나만 남는다.
 * 헤더·탭·툴바·페이지네이션·일괄 처리·관리 열이 자리를 비우지 않고 통째로 사라진다.
 */
export const Minimal: Story = {
  args: {
    rows: MANY_ROWS,
    show: {
      header: false,
      tabs: false,
      toolbar: false,
      pagination: false,
      bulk: false,
      rowActions: false,
    },
  },
  render: (args) => <InquiryManageList {...args} />,
}

/** 툴바 요소 단위 OFF — 검색만 남기고 정렬·건수를 끈다(꺼진 자리에 여백이 없다). */
export const SearchOnlyToolbar: Story = {
  args: {
    show: { sort: false, total: false, bulk: false },
  },
  render: (args) => <Demo {...args} />,
}

/**
 * 열 단위 ON/OFF — 섹션 show가 아니라 AdminTable의 columnVisibility로 끈다.
 * 이메일·신청일을 끈 상태로 시작하고, 우상단 [컬럼] 피커로 다시 켤 수 있다.
 */
export const HiddenColumns: Story = {
  args: { rows: MANY_ROWS, columnPicker: true },
  render: (args) => <ColumnsDemo {...args} />,
}

function ColumnsDemo(props: InquiryManageListProps) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    email: false,
    appliedAt: false,
  })

  return (
    <InquiryManageList
      {...props}
      columnVisibility={visibility}
      onColumnVisibilityChange={setVisibility}
    />
  )
}

/** 결과 없음 — 표는 EmptyState로 바뀌고 탭 건수는 전부 0. */
export const Empty: Story = {
  args: { rows: [] },
  render: (args) => <InquiryManageList {...args} />,
}

/** 조회 중 — 표 위에 로딩 오버레이. */
export const Loading: Story = {
  args: { loading: true },
  render: (args) => <InquiryManageList {...args} />,
}

/**
 * labels — 화면의 모든 글자를 통로 하나로 갈아끼운다(영문 오버라이드).
 * 컬럼 머리글 · 상태 배지(탭이 함께 쓴다) · 정렬 · 관리 열의 스크린리더 이름 · 건수 접두사까지 labels가 소유한다.
 */
export const Labels: Story = {
  args: {
    labels: {
      title: 'Installation inquiries',
      description: 'Review and manage requests submitted through the chatbot.',
      columns: {
        no: 'No.',
        applicant: 'Applicant',
        phone: 'Phone',
        email: 'Email',
        appliedAt: 'Applied',
        status: 'Status',
        manage: 'Manage',
      },
      status: { pending: 'Pending', answered: 'Answered', hold: 'On hold' },
      tabs: { all: 'All' },
      sort: { latest: 'Newest', oldest: 'Oldest', name: 'By applicant' },
      rowActions: {
        view: (applicant) => `View ${applicant}`,
        delete: (applicant) => `Delete ${applicant}`,
      },
      search: { searchPlaceholder: 'Search by name, phone or email' },
      toolbar: { prefix: 'Total', unit: ' requests' },
      empty: { title: 'No inquiries received yet.' },
    },
  },
  render: (args) => <Demo {...args} />,
}
