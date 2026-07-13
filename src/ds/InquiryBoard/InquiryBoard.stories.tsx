import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import {
  InquiryBoard,
  type InquiryApplicationRow,
  type InquiryApplicationStatus,
  type InquiryBoardProps,
} from './InquiryBoard'

// ── 목데이터 26건 — 실제 상담 신청 화면에서 볼 법한 문장으로 채운다 ──────────
const CATEGORIES = ['서비스 도입', '견적 문의', '제휴/파트너십', '기술 지원', '기타']

const APPLICANTS = [
  '홍성보',
  '김서연',
  '이준호',
  '박지민',
  '최수아',
  '정다인',
  '강민준',
  '윤하은',
  '조태윤',
  '한소미',
  '문가영',
  '배성현',
  '신유진',
]

const TITLES = [
  '전사 도입을 검토 중입니다. 데모 일정 잡고 싶어요',
  '연간 구독 견적서를 받아볼 수 있을까요',
  '기존 ERP와 연동 가능한지 문의드립니다',
  '리셀러 파트너십 제안드립니다',
  '로그인 시 인증 메일이 오지 않습니다',
  '사용자 50명 규모 요금제를 알고 싶습니다',
  '온프레미스 설치 지원 여부 문의',
  '교육 기관 할인 정책이 있나요',
  '데이터 이관 대행이 가능한지 궁금합니다',
  '계약서 양식을 미리 검토하고 싶습니다',
  '보안 심사 자료(ISMS) 요청드립니다',
  '체험 계정 기간 연장 요청',
  '세금계산서 발행 관련 문의드립니다',
]

const DOMAINS = ['gmail.com', 'naver.com', 'daum.net', 'company.co.kr', 'kakao.com']
const LOCALS = [
  'sb.hong',
  'seoyeon.kim',
  'junho.lee',
  'jimin.park',
  'sua.choi',
  'dain.jung',
  'minjun.kang',
  'haeun.yoon',
  'taeyun.cho',
  'somi.han',
  'gayoung.moon',
  'sunghyun.bae',
  'yujin.shin',
]

const STATUSES: InquiryApplicationStatus[] = ['pending', 'checking', 'done', 'hold']

const pad = (value: number): string => String(value).padStart(2, '0')

const MOCK_ROWS: InquiryApplicationRow[] = Array.from({ length: 26 }, (_, i) => {
  // 미확인이 가장 많고 보류가 가장 적게 — 실제 접수함의 분포에 가깝게 섞는다
  const status = STATUSES[i % 7 === 6 ? 3 : i % 3]
  const day = (i % 27) + 1
  return {
    id: `apply-${pad(i + 1)}`,
    category: CATEGORIES[i % 5],
    title: TITLES[i % 13],
    applicant: APPLICANTS[i % 13],
    phone: `010-${pad(20 + (i % 70))}${pad((i * 7) % 100)}-${pad((i * 13) % 100)}${pad((i * 3) % 100)}`,
    email: `${LOCALS[i % 13]}@${DOMAINS[i % 5]}`,
    appliedAt: `2026-07-${pad(day)}`,
    // 미확인은 아직 아무도 손대지 않은 신청서 — 수정일이 비어 '-'로 떨어진다
    updatedAt: status === 'pending' ? undefined : `2026-07-${pad(Math.min(day + 2, 28))}`,
    status,
  }
})

const CATEGORY_OPTIONS = CATEGORIES.map((category) => ({ label: category, value: category }))

const STATUS_LABEL: Record<InquiryApplicationStatus, string> = {
  pending: '미확인',
  checking: '확인중',
  done: '완료',
  hold: '보류',
}

/**
 * 상태 변경·삭제 데모 — rows를 로컬 state로 들고 실제로 갱신한다.
 * (검색·탭·페이징·선택은 InquiryBoard 내부 state라 배선이 필요 없다)
 */
function InquiryBoardDemo(props: InquiryBoardProps) {
  const [rows, setRows] = useState<InquiryApplicationRow[]>(props.rows)
  const [log, setLog] = useState<string | null>(null)

  const patch = (ids: string[], status: InquiryApplicationStatus) => {
    const target = new Set(ids)
    setRows((prev) =>
      prev.map((row) =>
        target.has(row.id) ? { ...row, status, updatedAt: '2026-07-13' } : row,
      ),
    )
  }

  const remove = (ids: string[]) => {
    const target = new Set(ids)
    setRows((prev) => prev.filter((row) => !target.has(row.id)))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p
        style={{
          margin: '0 40px',
          fontSize: 13,
          color: log == null ? 'var(--ds-color-secondary)' : 'var(--ds-color-primary)',
          fontFamily: 'var(--ds-font-family)',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {log ??
          '제목을 클릭하면 상세(onOpen)로 이동합니다. 케밥(⋯)에서 상태 변경·삭제, 행을 고르면 표 하단에 일괄 처리가 뜹니다.'}
      </p>

      <InquiryBoard
        {...props}
        rows={rows}
        onOpen={(row) => setLog(`상세 이동: ${row.applicant} — ${row.title}`)}
        onSearch={() => setLog('검색 조건으로 조회했습니다.')}
        onStatusChange={(row, status) => {
          patch([row.id], status)
          setLog(`상태 변경: ${row.applicant} → ${STATUS_LABEL[status]}`)
        }}
        onDelete={(row) => {
          remove([row.id])
          setLog(`삭제: ${row.applicant} — ${row.title}`)
        }}
        onBulkStatus={(ids, status) => {
          patch(ids, status)
          setLog(`일괄 상태 변경 ${ids.length}건 → ${STATUS_LABEL[status]}`)
        }}
        onBulkDelete={(ids) => {
          remove(ids)
          setLog(`일괄 삭제 ${ids.length}건`)
        }}
        onCreate={() => setLog('신청서 등록 화면으로 이동')}
      />
    </div>
  )
}

const meta = {
  title: 'Admin/InquiryBoard',
  component: InquiryBoard,
  tags: ['autodocs'],
  args: {
    rows: MOCK_ROWS,
    loading: false,
    density: 'compact',
    categories: CATEGORY_OPTIONS,
    showTabs: true,
    showSearch: true,
    showCount: true,
    columnPicker: true,
    exportable: true,
    emptyText: '접수된 문의 신청이 없습니다.',
    createLabel: '신청서 등록',
    exportFilename: '문의내역',
  },
  argTypes: {
    rows: { control: false },
    categories: { control: false },
    // 요소 ON/OFF
    showTabs: { control: 'boolean' },
    showSearch: { control: 'boolean' },
    showCount: { control: 'boolean' },
    columnPicker: { control: 'boolean' },
    exportable: { control: 'boolean' },
    // 문구
    emptyText: { control: 'text' },
    createLabel: { control: 'text' },
    exportFilename: { control: 'text' },
    // 노드 슬롯
    createIcon: { control: false },
    viewIcon: { control: false },
    deleteIcon: { control: false },
    onOpen: { control: false },
    onSearch: { control: false },
    onStatusChange: { control: false },
    onDelete: { control: false },
    onBulkStatus: { control: false },
    onBulkDelete: { control: false },
    onCreate: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof InquiryBoard>

export default meta
type Story = StoryObj<typeof meta>

// 신청 26건 — 검색 7조건 · 탭 5개 · 20행 페이징(행 44px)
export const Default: Story = {
  render: (args) => <InquiryBoardDemo {...args} />,
}

// 접수 건 없음 — 표는 EmptyState로 바뀌고 탭 카운트는 모두 0
export const Empty: Story = {
  args: { rows: [] },
  render: (args) => <InquiryBoard {...args} />,
}

// 조회 중 — 검색 조건은 잠기고 표에는 로딩 오버레이
export const Loading: Story = {
  args: { loading: true },
  render: (args) => <InquiryBoard {...args} />,
}

// 밀도 비교 — comfortable(행 56px). 기본 compact(44px)와 나란히 놓고 본다.
// 8건으로 줄여 한 화면에서 행 높이 차이만 보이게 한다.
export const Comfortable: Story = {
  args: { rows: MOCK_ROWS.slice(0, 8), density: 'comfortable' },
  render: (args) => <InquiryBoard {...args} />,
}

// 요소 OFF 조합 — 탭·검색·건수·컬럼피커·내보내기를 모두 끈 '표만' 화면.
// 대시보드 위젯처럼 끼워 넣을 때의 모습(꺼진 자리에 빈 여백이 남지 않는다).
export const TableOnly: Story = {
  args: {
    rows: MOCK_ROWS.slice(0, 8),
    showTabs: false,
    showSearch: false,
    showCount: false,
    columnPicker: false,
    exportable: false,
  },
  render: (args) => <InquiryBoard {...args} />,
}

// 문구 교체 — 등록 버튼·빈 상태·내보내기 파일명만 갈아끼운다
export const CustomCopy: Story = {
  args: {
    rows: [],
    createLabel: '상담 신청 추가',
    emptyText: '아직 접수된 상담 신청이 없습니다.',
    exportFilename: '상담신청_2026',
  },
  render: (args) => <InquiryBoard {...args} onCreate={() => {}} />,
}
