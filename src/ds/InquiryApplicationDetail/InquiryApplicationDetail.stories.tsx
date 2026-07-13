import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import type { SelectOption } from '../Select/Select'
import type { StatusStep } from '../StatusTimeline/StatusTimeline'
import {
  InquiryApplicationDetail,
  type ApplicationAnswer,
  type ApplicationApplicant,
  type InquiryApplicationDetailProps,
} from './InquiryApplicationDetail'

const APPLICANT: ApplicationApplicant = {
  name: '정하늘',
  phone: '010-4872-1130',
  email: 'haneul.jung@example.com',
  consents: [
    { key: 'privacy', label: '개인정보 수집·이용', agreed: true },
    { key: 'marketing', label: '마케팅 정보 수신', agreed: false },
  ],
  createdAt: '2026-07-09 14:26',
  updatedAt: '2026-07-12 10:03',
  updatedBy: '김상담',
}

/** 문의 응답 Q1~Q10 — 신청 폼에 입력된 답변 */
const ANSWERS: ApplicationAnswer[] = [
  { question: '현재 운영 상태를 알려주세요.', answer: '오픈 준비 중 (2026년 9월 오픈 예정)' },
  { question: '지역은 어디인가요?', answer: '서울 성동구 성수동2가' },
  { question: '공간 종류를 선택해 주세요.', answer: '카페 · 베이커리 (1층 로드샵)' },
  { question: '공간 규모는 어느 정도인가요?', answer: '약 66㎡ (20평), 좌석 24석' },
  { question: '천장 높이는 어떻게 되나요?', answer: '3.2m (노출 천장, 배관 일부 노출)' },
  {
    question: '음악 사용 목적은 무엇인가요?',
    answer: '매장 분위기 조성이 주목적입니다. 주말 저녁에는 어쿠스틱 라이브 공연도 계획 중입니다.',
  },
  {
    question: '원하는 사운드를 설명해 주세요.',
    answer: '저음이 과하지 않고 대화에 방해되지 않는, 매장 전체에 고르게 퍼지는 사운드를 원합니다.',
  },
  { question: '설치를 원하는 장비가 있나요?', answer: '실링 스피커 6개 + 앰프 1대, 무선 마이크 2채널' },
  { question: '기존 음향장비가 있나요?', answer: '없음 (신규 설치)' },
  { question: '인테리어 공사 단계는 어디인가요?', answer: '설계 도면 확정, 착공 2주 전 (2026-07-27 착공 예정)' },
]

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'received', label: '접수' },
  { value: 'reviewing', label: '상담중' },
  { value: 'quoted', label: '견적 발송' },
  { value: 'done', label: '완료' },
  { value: 'dropped', label: '보류' },
]

const STATUS_STEPS: StatusStep[] = [
  { key: 'received', label: '접수', at: '2026-07-09 14:26', by: '시스템', state: 'done' },
  { key: 'reviewing', label: '상담중', at: '2026-07-12 10:03', by: '김상담', state: 'current' },
  { key: 'quoted', label: '견적 발송', state: 'todo' },
  { key: 'done', label: '완료', state: 'todo' },
]

const ASSIGNEES: SelectOption[] = [
  { value: '김상담', label: '김상담 (영업 1팀)' },
  { value: '박운영', label: '박운영 (영업 2팀)' },
  { value: '이엔지', label: '이엔지 (설치 엔지니어)' },
]

const MEMO = '성수동 신규 카페. 착공 전이라 배선 선반영 가능 — 실링 스피커 6개 기준 견적 우선 발송할 것.'

/** 상태·담당자·메모가 실제로 바뀌는 데모 래퍼 — 서버 대신 로컬 state가 값을 보관한다 */
function InquiryApplicationDetailDemo(props: InquiryApplicationDetailProps) {
  const [status, setStatus] = useState<string | null>(props.status)
  const [assignee, setAssignee] = useState<string | null>(props.assignee ?? null)
  const [memo, setMemo] = useState(props.memo ?? '')

  return (
    <InquiryApplicationDetail
      {...props}
      status={status}
      onStatusChange={setStatus}
      assignee={assignee}
      onAssigneeChange={setAssignee}
      memo={memo}
      onMemoChange={setMemo}
      onMemoSave={() => {}}
    />
  )
}

const meta = {
  title: 'Admin/InquiryApplicationDetail',
  component: InquiryApplicationDetail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  args: {
    title: '문의 신청 상세',
    description: 'INQ-2026-000512 · 공간 음향 설치 상담',
    applicant: APPLICANT,
    answers: ANSWERS,
    statusSteps: STATUS_STEPS,
    status: 'reviewing',
    statusOptions: STATUS_OPTIONS,
    assignee: '김상담',
    assigneeOptions: ASSIGNEES,
    memo: MEMO,
    memoSaving: false,
    loading: false,
    density: 'compact',
    hasPrev: true,
    hasNext: true,
    showStatus: true,
    showConsents: true,
    showMeta: true,
    onList: () => {},
    onEdit: () => {},
    onDelete: () => {},
    onStatusApply: () => {},
    onPrev: () => {},
    onNext: () => {},
  },
  argTypes: {
    loading: { control: 'boolean' },
    memoSaving: { control: 'boolean' },
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    hasPrev: { control: 'boolean' },
    hasNext: { control: 'boolean' },
    // 섹션 ON/OFF
    showStatus: { control: 'boolean' },
    showConsents: { control: 'boolean' },
    showMeta: { control: 'boolean' },
    // 노드 슬롯
    prevIcon: { control: false },
    nextIcon: { control: false },
    editIcon: { control: false },
    deleteIcon: { control: false },
  },
  render: (args) => <InquiryApplicationDetailDemo {...args} />,
} satisfies Meta<typeof InquiryApplicationDetail>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 신청자 정보(3열 + 동의 배지) · 문의 응답 Q1~Q10 · 우측 상태/담당자/메모 */
export const Default: Story = {}

/** 응답 없음 — 폼만 열고 답변을 채우지 않은 신청. 접수 직후라 담당자·메모도 비어 있다 */
export const Empty: Story = {
  args: {
    answers: [],
    status: 'received',
    statusSteps: [
      { key: 'received', label: '접수', at: '2026-07-13 09:41', by: '시스템', state: 'current' },
      { key: 'reviewing', label: '상담중', state: 'todo' },
      { key: 'quoted', label: '견적 발송', state: 'todo' },
      { key: 'done', label: '완료', state: 'todo' },
    ],
    applicant: {
      ...APPLICANT,
      name: '문지훈',
      phone: '010-3311-7024',
      email: 'jihoon.moon@example.com',
      consents: [
        { key: 'privacy', label: '개인정보 수집·이용', agreed: true },
        { key: 'marketing', label: '마케팅 정보 수신', agreed: true },
      ],
      createdAt: '2026-07-13 09:41',
      updatedAt: undefined,
      updatedBy: undefined,
    },
    assignee: null,
    memo: '',
    hasNext: false,
  },
}

/** 로딩 — 카드 골격은 유지하고 내용만 스켈레톤으로 대체한다(레이아웃이 흔들리지 않게) */
export const Loading: Story = {
  args: { loading: true },
}

/** 밀도 comfortable — 정의 목록 행이 44 → 56px로 커진다. Default(compact)와 비교용 */
export const Comfortable: Story = {
  args: { density: 'comfortable' },
}

/** 읽기 전용 — 수정/삭제/상태 변경 콜백이 없으면 해당 버튼이 렌더되지 않는다(메모도 숨김) */
export const ReadOnly: Story = {
  args: {
    memo: undefined,
    onEdit: undefined,
    onDelete: undefined,
    onStatusApply: undefined,
    onPrev: undefined,
    onNext: undefined,
  },
  render: (args) => <InquiryApplicationDetail {...args} />,
}

/**
 * 섹션 OFF 조합 — 상태 카드 · 동의 배지 · 메타 줄을 모두 끈 모습.
 * 신청자 3열과 문의 응답만 남고, 꺼진 자리에는 구분선·여백이 남지 않는다.
 */
export const Minimal: Story = {
  args: {
    showStatus: false,
    showConsents: false,
    showMeta: false,
  },
}

/** 동의 항목을 안 받는 폼 — 배지 줄과 그 위 구분선이 함께 사라진다 */
export const WithoutConsents: Story = {
  args: { showConsents: false },
}

/**
 * Labels: 영문 오버라이드 — 카드 제목·신청자 필드·aside Select·메모·푸터 버튼·동의 배지 접미사가
 * labels 통로 하나로 전부 영문이 된다.
 */
export const Labels: Story = {
  args: {
    title: 'Inquiry request',
    description: 'INQ-2026-000512 · Room acoustics consultation',
    labels: {
      sections: {
        applicant: 'Applicant',
        answers: 'Form answers',
        answersDescription: 'Answers submitted through the request form.',
        status: 'Status',
        assignee: 'Assignee',
      },
      applicant: {
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        createdAt: 'Submitted',
        updatedAt: 'Updated',
        updatedBy: 'Updated by',
      },
      status: { field: 'Current status', placeholder: 'Pick a status' },
      assignee: { field: 'Assigned to', placeholder: 'Pick an assignee' },
      memo: {
        title: 'Internal note',
        description: 'Never shown to the customer.',
        placeholder: 'Leave the call history or the reason for this decision.',
      },
      actions: {
        prev: 'Previous',
        next: 'Next',
        list: 'Back to list',
        edit: 'Edit',
        delete: 'Delete',
        statusApply: 'Apply status',
      },
      empty: { title: 'No form answers yet' },
      consent: { agreed: 'agreed', denied: 'not agreed' },
    },
  },
}
