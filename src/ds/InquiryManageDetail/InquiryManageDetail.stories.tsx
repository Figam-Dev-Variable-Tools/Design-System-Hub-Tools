import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import type { SelectOption } from '../Select/Select'
import {
  InquiryManageDetail,
  InquiryRequestForm,
  type InquiryApplicant,
  type InquiryManageDetailProps,
  type InquiryQa,
  type InquiryRequestFormValue,
  type InquiryRequestMessages,
} from './InquiryManageDetail'

/* ── 목데이터 — 시공 문의 1건 ── */

const APPLICANT: InquiryApplicant = {
  name: '정하늘',
  phone: '010-4872-1130',
  email: 'haneul.jung@example.com',
  consents: [
    { key: 'privacy', label: '개인정보', agreed: true },
    { key: 'marketing', label: '마케팅', agreed: false },
  ],
  createdAt: '2026-07-09 14:26',
  updatedAt: '2026-07-12 10:03',
  updatedBy: '김상담',
}

/** 문의 응답 — 신청 폼에 입력된 Q1~Q6 */
const QA: InquiryQa[] = [
  { question: '현재 운영 상태를 알려주세요.', answer: '오픈 준비 중 (2026년 9월 오픈 예정)' },
  { question: '지역은 어디인가요?', answer: '서울 성동구 성수동2가' },
  { question: '공간 종류를 선택해 주세요.', answer: '카페 · 베이커리 (1층 로드샵)' },
  { question: '공간 규모는 어느 정도인가요?', answer: '약 66㎡ (20평), 좌석 24석' },
  { question: '천장 높이는 어떻게 되나요?', answer: '3.2m (노출 천장, 배관 일부 노출)' },
  {
    question: '원하는 사운드를 설명해 주세요.',
    answer:
      '저음이 과하지 않고 대화에 방해되지 않는, 매장 전체에 고르게 퍼지는 사운드를 원합니다. 주말 저녁에는 어쿠스틱 라이브 공연도 계획 중입니다.',
  },
]

const ANSWER_DRAFT =
  '안녕하세요, 문의 주셔서 감사합니다.\n보내주신 도면 기준으로 실링 스피커 6개 + 앰프 1대 구성을 제안드립니다. 현장 실측은 7월 20일 이후로 가능하며, 견적서는 실측 후 3영업일 내 회신드리겠습니다.'

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'cafe', label: '카페 · 베이커리' },
  { value: 'restaurant', label: '음식점 · 주점' },
  { value: 'retail', label: '리테일 · 편집숍' },
  { value: 'fitness', label: '피트니스 · 필라테스' },
  { value: 'office', label: '오피스 · 사무공간' },
  { value: 'etc', label: '기타' },
]

const EMPTY_FORM: InquiryRequestFormValue = {
  category: null,
  name: '',
  email: '',
  phone: '',
  title: '',
  content: '',
  privacy: false,
}

const FILLED_FORM: InquiryRequestFormValue = {
  category: 'cafe',
  name: '정하늘',
  email: 'haneul.jung@example.com',
  phone: '010-4872-1130',
  title: '성수동 카페 음향 시공 문의드립니다',
  content:
    '9월 오픈 예정인 20평 규모 카페입니다. 실링 스피커 위주로 구성하고 싶고, 예산과 일정 안내 부탁드립니다.',
  privacy: true,
}

/** 필드별 보조 설명 — FieldRow의 2번째 상태 */
const DESCRIPTIONS: InquiryRequestMessages = {
  category: '가장 가까운 업종을 골라 주세요. 없으면 기타를 선택합니다.',
  name: '담당자 실명을 적어 주세요.',
  email: '견적서와 답변은 이 주소로 발송됩니다.',
  phone: '숫자만 입력해도 자동으로 하이픈이 붙습니다.',
  title: '공간·지역이 드러나면 상담이 빨라집니다. (60자 이내)',
  content: '평수·천장 높이·오픈 일정을 함께 적어 주시면 좋습니다.',
  privacy: '수집 항목: 성함·연락처·이메일 / 보유 기간: 문의 처리 후 1년',
}

/** 필드별 에러 — FieldRow의 3번째 상태 */
const ERRORS: InquiryRequestMessages = {
  category: '업체 분류를 선택해주세요.',
  name: '성함을 입력해주세요.',
  email: '이메일 형식이 올바르지 않습니다.',
  phone: '연락처를 정확히 입력해주세요.',
  title: '제목을 입력해주세요.',
  content: '문의 내용을 10자 이상 입력해주세요.',
  privacy: '개인정보 수집 및 이용에 동의해주세요.',
}

/** 상세 화면은 제어 컴포넌트라 스토리가 답변·토글 상태를 들고 있는다 */
function DetailDemo(props: InquiryManageDetailProps) {
  const [answer, setAnswer] = useState(props.answer ?? '')
  const [enabled, setEnabled] = useState(props.answerEnabled ?? true)

  return (
    <InquiryManageDetail
      {...props}
      answer={answer}
      onAnswerChange={setAnswer}
      answerEnabled={enabled}
      onAnswerEnabledChange={setEnabled}
    />
  )
}

const meta = {
  title: 'Admin/InquiryManageDetail',
  component: InquiryManageDetail,
  tags: ['autodocs'],
  args: {
    title: '시공 문의 상세',
    status: { label: '대기중', tone: 'warning' },
    applicant: APPLICANT,
    qa: QA,
    answer: ANSWER_DRAFT,
    answerDescription: '등록 즉시 신청자에게 메일이 발송됩니다.',
    answeredAt: '2026-07-12 10:03',
    answeredBy: '김상담',
    density: 'compact',
    onSave: () => {},
    onList: () => {},
    onDelete: () => {},
  },
  argTypes: {
    onSave: { control: false },
    onList: { control: false },
    onDelete: { control: false },
    onAnswerChange: { control: false },
    onAnswerEnabledChange: { control: false },
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => <DetailDemo {...args} />,
} satisfies Meta<typeof InquiryManageDetail>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 헤더(대기중 배지 + 저장) · 신청자 정보 · 문의 응답 · 답변 · 푸터 */
export const Default: Story = {}

/** 전부 ON — show의 모든 키가 true(기본값과 같은 화면을 명시적으로 켠 것) */
export const AllSections: Story = {
  args: {
    show: {
      header: true,
      applicant: true,
      consent: true,
      meta: true,
      qa: true,
      answer: true,
      footer: true,
    },
  },
}

/** 대부분 OFF — 신청자 정보(동의·메타 없이)만 남는다. 빈 자리·여백·구분선이 남지 않는다 */
export const Minimal: Story = {
  args: {
    show: {
      header: false,
      applicant: true,
      consent: false,
      meta: false,
      qa: false,
      answer: false,
      footer: false,
    },
  },
}

/** 답변 카드 OFF — 문의 내용만 확인하는 읽기 화면 */
export const WithoutAnswer: Story = {
  args: {
    show: { answer: false },
  },
}

/** 문의 응답 없음 — 공용 빈 상태 플레이스홀더 */
export const EmptyQa: Story = {
  args: {
    qa: [],
  },
}

/** 답변 에러 — 설명 자리를 에러 문구가 대체하고 Textarea가 error 톤이 된다 */
export const AnswerError: Story = {
  args: {
    answer: '',
    answerError: '답변 내용을 입력해주세요.',
  },
}

/* ── InquiryRequestForm — 고객이 제출하는 문의 폼 ── */

/** 폼 데모 — 값은 스토리가 들고 있는다 */
function FormDemo({
  initial = EMPTY_FORM,
  descriptions,
  errors,
}: {
  initial?: InquiryRequestFormValue
  descriptions?: InquiryRequestMessages
  errors?: InquiryRequestMessages
}) {
  const [value, setValue] = useState(initial)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 'var(--ds-spacing-6)' }}>
      <InquiryRequestForm
        value={value}
        onChange={setValue}
        categoryOptions={CATEGORY_OPTIONS}
        descriptions={descriptions}
        errors={errors}
        onSubmit={() => {}}
      />
    </div>
  )
}

/** 폼 1. 기본 — 라벨 + 컨트롤(플레이스홀더)만 */
export const RequestForm: Story = {
  parameters: { controls: { disable: true } },
  render: () => <FormDemo />,
}

/** 폼 2. description — 모든 필드가 보조 설명을 단 상태 */
export const RequestFormWithDescriptions: Story = {
  parameters: { controls: { disable: true } },
  render: () => <FormDemo initial={FILLED_FORM} descriptions={DESCRIPTIONS} />,
}

/** 폼 3. error — 설명 자리를 에러 문구가 대체하고 컨트롤이 error 톤 + aria-invalid가 된다 */
export const RequestFormWithErrors: Story = {
  parameters: { controls: { disable: true } },
  render: () => <FormDemo descriptions={DESCRIPTIONS} errors={ERRORS} />,
}
