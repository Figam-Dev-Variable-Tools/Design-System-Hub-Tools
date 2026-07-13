import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import type { Attachment } from '../AttachmentList/AttachmentList'
import { PageContainer } from '../PageContainer/PageContainer'
import type { SelectOption } from '../Select/Select'
import type { TimelineItem } from '../Timeline/Timeline'
import {
  InquiryDetail,
  type AnswerTemplate,
  type InquiryAnswer,
  type InquiryAuthor,
  type InquiryContent,
  type InquiryDetailProps,
  type InquiryHeader,
  type InquiryMemo,
  type InquiryOrder,
  type InquiryProduct,
  type InquiryStatus,
  type InquiryStatusLog,
} from './InquiryDetail'

const NOW = '2026-07-13 15:20'

const HEADER: InquiryHeader = {
  no: 'INQ-2026-000481',
  status: 'reviewing',
  type: '교환·반품',
  createdAt: '2026-07-10 09:12',
  updatedAt: '2026-07-12 17:40',
  assignee: '김상담',
  isPublic: true,
}

const AUTHOR: InquiryAuthor = {
  name: '이서연',
  memberId: 'seoyeon_lee',
  email: 'seoyeon.lee@example.com',
  phone: '010-2481-7735',
  grade: 'VIP',
  recentOrder: { no: 'ORD-2026-11820', summary: 'ORD-2026-11820 · 2건 · 218,000원' },
}

// 첨부 3종 — 이미지 미리보기 · 동영상 · 다운로드 전용 문서
const ATTACHMENTS: Attachment[] = [
  {
    id: 'att-1',
    name: '수령한_제품_전면.jpg',
    size: 1_842_000,
    type: 'image/jpeg',
    url: mockImage('수령 제품', 'slate'),
  },
  {
    id: 'att-2',
    name: '불량_동작_영상.mp4',
    size: 18_930_000,
    type: 'video/mp4',
  },
  {
    id: 'att-3',
    name: '교환신청서.pdf',
    size: 214_000,
    type: 'application/pdf',
  },
]

const CONTENT: InquiryContent = {
  title: '배송받은 키보드 스위치 2개가 눌리지 않습니다. 교환 가능할까요?',
  body: [
    '7월 8일에 수령한 알루미늄 무접점 키보드에서 F5, F6 키가 눌리지 않습니다.',
    '구입 후 바로 확인했고 물리적 파손이나 액체 유입은 없었습니다. 동작 영상 첨부합니다.',
    '',
    '동일 상품으로 교환 가능한지, 절차와 소요 기간을 알려주세요. 회수는 평일 오전만 가능합니다.',
  ].join('\n'),
  attachments: ATTACHMENTS,
}

const ORDER: InquiryOrder = {
  no: 'ORD-2026-11820',
  orderedAt: '2026-07-06 21:03',
  status: '배송완료',
  paidAmount: 218_000,
  shippingStatus: '배송완료 (2026-07-08 수령)',
}

const PRODUCTS: InquiryProduct[] = [
  {
    id: 'prd-1',
    name: '알루미늄 무접점 키보드 87키 텐키리스',
    imageUrl: mockImage('키보드', 'sand'),
    option: '색상: 블랙 / 축: 저소음 적축',
    quantity: 1,
    price: 189_000,
  },
  {
    id: 'prd-2',
    name: 'PBT 이중사출 키캡 세트',
    imageUrl: mockImage('키캡', 'sage'),
    option: '색상: 그레이',
    quantity: 1,
    price: 29_000,
  },
]

const MEMOS: InquiryMemo[] = [
  {
    id: 'memo-1',
    content: '영상 확인 완료. 스위치 불량으로 보임 — 품질팀에 동일 로트 확인 요청함(2026-07-11).',
    author: '김상담',
    createdAt: '2026-07-11 10:22',
  },
  {
    id: 'memo-2',
    content: 'VIP 회원이라 선교환 처리 승인. 회수 택배는 평일 오전으로 예약할 것.',
    author: '박운영',
    createdAt: '2026-07-12 14:05',
    updatedAt: '2026-07-12 17:40',
  },
]

const ANSWER: InquiryAnswer = {
  id: 'ans-1',
  content: [
    '<p>안녕하세요, 고객님. 먼저 불편을 드려 죄송합니다.</p>',
    '<p>첨부해 주신 영상 확인 결과 <b>스위치 불량</b>으로 판단되어 동일 상품 교환으로 처리해 드리겠습니다.</p>',
    '<ul><li>회수: 2026-07-15(화) 오전 (평일 오전 지정)</li><li>재배송: 회수 확인 후 1~2영업일</li></ul>',
    '<p>추가 문의사항은 이 문의에 답글 남겨주시면 확인하겠습니다. 감사합니다.</p>',
  ].join(''),
  author: '김상담',
  createdAt: '2026-07-12 18:02',
  isPublic: true,
  attachments: [
    { id: 'ans-att-1', name: '교환_안내문.pdf', size: 96_000, type: 'application/pdf' },
  ],
}

const STATUS_HISTORY: InquiryStatusLog[] = [
  { status: 'received', at: '2026-07-10 09:12', by: '시스템' },
  { status: 'reviewing', at: '2026-07-10 10:05', by: '김상담' },
]

const HISTORY: TimelineItem[] = [
  { id: 'h1', title: '문의 접수', time: '2026-07-10 09:12', status: 'done' },
  { id: 'h2', title: '담당자 배정 · 김상담', time: '2026-07-10 10:05', status: 'done' },
  { id: 'h3', title: '품질팀 확인 요청', description: '동일 로트 불량 여부 확인', time: '2026-07-11 10:22', status: 'active' },
]

const ASSIGNEES: SelectOption[] = [
  { value: '김상담', label: '김상담 (CS 1팀)' },
  { value: '박운영', label: '박운영 (CS 2팀)' },
  { value: '정지원', label: '정지원 (품질팀)' },
]

const TEMPLATES: AnswerTemplate[] = [
  { key: 'exchange', label: '교환 안내', content: '<p>교환 접수되었습니다. 회수 택배가 방문 예정입니다.</p>' },
  { key: 'refund', label: '환불 안내', content: '<p>환불은 회수 확인 후 3영업일 이내 처리됩니다.</p>' },
  { key: 'delay', label: '처리 지연 안내', content: '<p>확인에 시간이 걸리고 있습니다. 확인되는 대로 다시 안내드리겠습니다.</p>' },
]

/** 상태·담당자·메모·답변이 실제로 바뀌는 데모 래퍼 — 서버 대신 로컬 state가 데이터를 보관한다 */
function InquiryDetailDemo(props: InquiryDetailProps) {
  const [status, setStatus] = useState<InquiryStatus>(props.header.status)
  const [assignee, setAssignee] = useState<string | undefined>(props.header.assignee)
  const [memos, setMemos] = useState<InquiryMemo[]>(props.memos ?? [])
  const [answer, setAnswer] = useState<InquiryAnswer | undefined>(props.answer)

  return (
    <PageContainer maxWidth="full">
      <InquiryDetail
        {...props}
        header={{ ...props.header, status, assignee }}
        memos={memos}
        answer={answer}
        onStatusChange={setStatus}
        onAssigneeChange={setAssignee}
        onMemoCreate={(content) =>
          setMemos((prev) => [
            ...prev,
            { id: `memo-${prev.length + 1}-${Date.now()}`, content, author: '김상담', createdAt: NOW },
          ])
        }
        onMemoUpdate={(id, content) =>
          setMemos((prev) =>
            prev.map((memo) => (memo.id === id ? { ...memo, content, updatedAt: NOW } : memo)),
          )
        }
        onMemoDelete={(id) => setMemos((prev) => prev.filter((memo) => memo.id !== id))}
        onAnswerSubmit={(draft) => {
          setAnswer((prev) => ({
            id: prev?.id ?? 'ans-new',
            content: draft.content,
            author: prev?.author ?? '김상담',
            createdAt: prev?.createdAt ?? NOW,
            updatedAt: prev != null ? NOW : undefined,
            isPublic: draft.isPublic,
            attachments: draft.attachments,
          }))
          setStatus('answered')
        }}
        onAnswerDelete={() => setAnswer(undefined)}
      />
    </PageContainer>
  )
}

const meta = {
  title: 'Admin/InquiryDetail',
  component: InquiryDetail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  args: {
    header: HEADER,
    author: AUTHOR,
    content: CONTENT,
    statusHistory: STATUS_HISTORY,
    history: HISTORY,
    assignees: ASSIGNEES,
    answerTemplates: TEMPLATES,
    answerSubmitting: false,
    hasPrev: true,
    hasNext: true,
    showMemos: true,
    showAttachments: true,
    showAuthor: true,
    showStatusPanel: true,
    showNav: true,
  },
  argTypes: {
    answerSubmitting: { control: 'boolean' },
    hasPrev: { control: 'boolean' },
    hasNext: { control: 'boolean' },
    // 섹션 ON/OFF
    showMemos: { control: 'boolean' },
    showAttachments: { control: 'boolean' },
    showAuthor: { control: 'boolean' },
    showStatusPanel: { control: 'boolean' },
    showNav: { control: 'boolean' },
    // 노드 슬롯
    editIcon: { control: false },
    deleteIcon: { control: false },
    prevIcon: { control: false },
    nextIcon: { control: false },
  },
  render: (args) => <InquiryDetailDemo {...args} />,
} satisfies Meta<typeof InquiryDetail>

export default meta
type Story = StoryObj<typeof meta>

/** 답변 전 — 확인중 상태, 첨부 3개(이미지·동영상·문서)와 AnswerForm이 열려 있다 */
export const Default: Story = {}

/** 답변 완료 — 등록된 답변 카드 + 누적된 관리자 메모 2개 */
export const Answered: Story = {
  args: {
    header: { ...HEADER, status: 'answered', updatedAt: '2026-07-12 18:02' },
    answer: ANSWER,
    memos: MEMOS,
    statusHistory: [
      ...STATUS_HISTORY,
      { status: 'answered', at: '2026-07-12 18:02', by: '김상담' },
    ],
  },
}

/** 주문/상품 문의 — 주문 정보와 상품 정보 블록이 함께 노출된다 */
export const WithOrder: Story = {
  args: {
    order: ORDER,
    products: PRODUCTS,
    memos: [MEMOS[0]],
  },
}

/** 첨부 없음 — AttachmentList가 공용 빈 상태 플레이스홀더를 보여준다 */
export const NoAttachment: Story = {
  args: {
    header: { ...HEADER, status: 'received', isPublic: false, assignee: undefined },
    content: { ...CONTENT, attachments: [] },
    statusHistory: [STATUS_HISTORY[0]],
    history: [HISTORY[0]],
    hasPrev: false,
  },
}

/**
 * 관리자 메모 — 누적 메모 목록 + 작성 칸을 공용 MemoBox가 통째로 그린다.
 * 행의 [수정][삭제]는 공용 RowActions, 메모가 0건일 때는 공용 EmptyState다.
 */
export const Memos: Story = {
  args: {
    header: { ...HEADER, status: 'answered' },
    answer: ANSWER,
    memos: MEMOS,
  },
}

/**
 * 섹션 OFF 조합 — 메모·첨부·작성자·처리상태·이동 버튼을 모두 끈 최소 상세.
 * 사이드(aside)에 처리 이력만 남고, 꺼진 자리에는 빈 카드가 남지 않는다.
 */
export const Minimal: Story = {
  args: {
    showMemos: false,
    showAttachments: false,
    showAuthor: false,
    showStatusPanel: false,
    showNav: false,
  },
}

/** 메모만 끈 상태 — 내부 메모를 쓰지 않는 조직/권한 */
export const WithoutMemos: Story = {
  args: {
    header: { ...HEADER, status: 'answered' },
    answer: ANSWER,
    memos: MEMOS,
    showMemos: false,
  },
}
