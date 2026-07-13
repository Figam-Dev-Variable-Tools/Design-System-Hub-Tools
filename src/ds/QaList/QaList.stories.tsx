import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { QaList, type QaItem } from './QaList'

const ITEMS: QaItem[] = [
  {
    question: '주문한 상품의 배송이 언제 시작되나요?',
    answer:
      '결제 확인 후 영업일 기준 1~2일 내 출고됩니다. 출고가 시작되면 등록하신 휴대폰 번호로 운송장 번호를 문자 발송해 드립니다.',
  },
  {
    question: '색상이 사진과 달라 교환하고 싶습니다. 배송비는 누가 부담하나요?',
    answer:
      '상품 하자 또는 오배송인 경우 교환 배송비는 판매자가 부담합니다. 단순 변심에 의한 교환은 왕복 배송비 5,000원이 부과됩니다.',
  },
  {
    question: '재고가 없다고 나오는데 언제 다시 입고되나요?',
    answer: (
      <>
        <p>해당 상품은 7월 셋째 주 재입고 예정입니다. 재입고 알림을 신청하시면 입고 즉시 안내해 드립니다.</p>
        <ul>
          <li>입고 예정일: 2026-07-17</li>
          <li>알림 신청: 상품 상세 &gt; 재입고 알림</li>
        </ul>
      </>
    ),
  },
]

/** 흰 카드 위에 얹은 상태 — 실제 문의 상세와 같은 맥락 */
function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 640,
        maxWidth: '100%',
        padding: 'var(--ds-spacing-5)',
        border: 'var(--ds-border-width) solid var(--ds-color-border)',
        borderRadius: 'var(--ds-radius-lg)',
        background: 'var(--ds-color-bg)',
      }}
    >
      {children}
    </div>
  )
}

const meta = {
  title: 'Admin/QaList',
  component: QaList,
  tags: ['autodocs'],
  args: {
    items: ITEMS,
    numbered: true,
    divider: true,
    questionPrefix: 'Q',
    answerPrefix: 'A.',
  },
  argTypes: {
    items: { control: 'object' },
    numbered: { control: 'boolean' },
    divider: { control: 'boolean' },
    questionPrefix: { control: 'text' },
    answerPrefix: { control: 'text' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => (
    <Card>
      <QaList {...args} />
    </Card>
  ),
} satisfies Meta<typeof QaList>

export default meta
type Story = StoryObj<typeof meta>

/** Q1. Q2. Q3. — 번호가 붙은 기본형 */
export const Default: Story = {}

/** 번호 없이 — 단일 문의 상세처럼 순서가 의미 없을 때 */
export const Unnumbered: Story = {
  args: { numbered: false },
}

/** 문의 1건 — 구분선 없이 Q/A 한 쌍만 */
export const Single: Story = {
  args: { items: [ITEMS[0]] },
}

/** divider=false — 항목 사이 1px 선을 지운다(간격은 그대로). 카드 안 한두 건짜리 요약용 */
export const WithoutDivider: Story = {
  args: { divider: false },
}

/** 마크 문구 교체 — 설문/체크리스트처럼 '질문'이 아닌 문항에 붙일 때 */
export const CustomPrefix: Story = {
  args: {
    questionPrefix: '문',
    answerPrefix: '답.',
    items: [
      { question: '시공 희망 지역은 어디인가요?', answer: '서울 강남구 역삼동' },
      { question: '희망 시공 시기는 언제인가요?', answer: '2026년 8월 중' },
    ],
  },
}

/**
 * labels — 화면의 모든 글자를 통로 하나로 갈아끼운다(영문 오버라이드).
 * 번호 뒤 구분 기호(questionSuffix)는 labels로만 열린다 — 'Q1.' → 'Q1)'.
 */
export const Labels: Story = {
  args: {
    // 개별 prop(questionPrefix·answerPrefix)을 넘기지 않으면 labels가 이긴다
    questionPrefix: undefined,
    answerPrefix: undefined,
    labels: {
      questionPrefix: 'Q',
      questionSuffix: ')',
      answerPrefix: 'A)',
    },
    items: [
      {
        question: 'When does my order ship?',
        answer: 'Orders ship within 1–2 business days after payment is confirmed.',
      },
      {
        question: 'Who pays return shipping for an exchange?',
        answer: 'We cover it for defective or mis-shipped items.',
      },
    ],
  },
}

/** 긴 질문·답변 — 잘라내지 않고 줄바꿈으로 흐른다 */
export const LongContent: Story = {
  args: {
    items: [
      {
        question:
          '어제 주문한 상품을 다른 주소로 받고 싶은데, 이미 출고 처리가 되었다고 안내를 받았습니다. 지금이라도 배송지를 변경할 수 있는 방법이 있을까요? 아니면 반송 후 재발송만 가능한가요?',
        answer:
          '출고 이후에는 시스템상 배송지 변경이 불가능합니다. 다만 택배사에 배송 보류를 요청해 반송 처리한 뒤 새 주소로 재발송해 드릴 수 있으며, 이 경우 재발송 배송비는 면제됩니다. 자세한 절차는 고객센터 공지(https://help.example.co.kr/notice/shipping-address-change-policy-2026)에서 확인하실 수 있습니다.',
      },
    ],
  },
}
