import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import type { Attachment } from '../AttachmentList/AttachmentList'
import { AnswerForm, type AnswerDraft, type AnswerFormProps, type AnswerTemplate } from './AnswerForm'

const templates: AnswerTemplate[] = [
  {
    key: 'delivery',
    label: '배송 지연 안내',
    content:
      '<p>안녕하세요, 고객님.</p><p>주문하신 상품의 배송이 지연되어 안내드립니다. 현재 물류 센터 사정으로 <b>2~3일</b> 정도 추가 소요될 예정입니다.</p><p>불편을 드려 죄송합니다.</p>',
  },
  {
    key: 'refund',
    label: '환불 처리 안내',
    content:
      '<p>안녕하세요, 고객님.</p><p>요청하신 환불이 정상 처리되었습니다.</p><ul><li>환불 금액: 39,000원</li><li>처리 기간: 영업일 기준 3~5일</li></ul><p>감사합니다.</p>',
  },
  {
    key: 'exchange',
    label: '교환 절차 안내',
    content:
      '<p>안녕하세요, 고객님.</p><p>교환은 아래 절차로 진행됩니다.</p><ol><li>회수 신청 접수</li><li>상품 회수(1~2일)</li><li>검수 후 재발송</li></ol>',
  },
]

const sampleAttachments: Attachment[] = [
  {
    id: 'ans-1',
    name: '교환절차_안내.png',
    size: 512_400,
    type: 'image/png',
    url: mockImage('안내 이미지', 'sage'),
    thumbnail: mockImage('안내 이미지', 'sage'),
  },
  {
    id: 'ans-2',
    name: '환불정책_v3.pdf',
    size: 184_200,
    type: 'application/pdf',
  },
]

const filledContent =
  '<p>안녕하세요, 고객님.</p><p>문의 주신 <b>주문번호 20260713-0042</b> 건 확인했습니다. 요청하신 대로 <u>교환 접수</u>를 완료했으며, 회수 기사님이 1~2일 내 방문 예정입니다.</p><ul><li>회수 예정일: 7월 15일</li><li>재발송 예정일: 7월 18일</li></ul><p>추가 문의사항은 언제든 남겨주세요. 감사합니다.</p>'

const emptyDraft: AnswerDraft = {
  content: '',
  isPublic: true,
  attachments: [],
  notify: { sms: false, email: true, kakao: false },
}

const filledDraft: AnswerDraft = {
  content: filledContent,
  isPublic: true,
  attachments: sampleAttachments,
  notify: { sms: true, email: true, kakao: false },
  templateKey: 'exchange',
}

/** 제어 폼 데모 — value/onChange를 로컬 state로 연결한다 */
function AnswerFormDemo({ value, onChange, ...rest }: AnswerFormProps) {
  const [draft, setDraft] = useState<AnswerDraft>(value)
  const [reason, setReason] = useState(rest.editReason ?? '')

  return (
    <div style={{ width: 720, maxWidth: '100%' }}>
      <AnswerForm
        {...rest}
        value={draft}
        onChange={(next) => {
          setDraft(next)
          onChange(next)
        }}
        editReason={reason}
        onEditReasonChange={setReason}
      />
    </div>
  )
}

/** 미리보기 모달이 열린 상태를 보여주는 데모 — 마운트 후 '미리보기' 버튼을 한 번 누른다 */
function AnswerFormPreviewDemo(props: AnswerFormProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const buttons = rootRef.current?.querySelectorAll('button') ?? []
    const preview = Array.from(buttons).find((b) => b.textContent?.trim() === '미리보기')
    preview?.click()
  }, [])

  return (
    <div ref={rootRef}>
      <AnswerFormDemo {...props} />
    </div>
  )
}

const meta = {
  title: 'Admin/AnswerForm',
  component: AnswerForm,
  tags: ['autodocs'],
  args: {
    value: emptyDraft,
    onChange: () => {},
    templates: [],
    submitting: false,
    mode: 'create',
    onSubmit: () => {},
    onSaveDraft: () => {},
    onCancel: () => {},
    onPreview: () => {},
    showAttachments: true,
    showVisibility: true,
    showNotify: true,
    showPreview: true,
    cancelLabel: '취소',
    previewLabel: '미리보기',
    draftLabel: '임시저장',
  },
  argTypes: {
    mode: { control: 'inline-radio', options: ['create', 'edit'] },
    submitting: { control: 'boolean' },
    value: { control: 'object' },
    templates: { control: 'object' },
    // 섹션 ON/OFF
    showAttachments: { control: 'boolean' },
    showVisibility: { control: 'boolean' },
    showNotify: { control: 'boolean' },
    showPreview: { control: 'boolean' },
    // 문구 — submitLabel을 비우면 모드에 따라 '등록'/'수정 완료'가 들어간다
    submitLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    previewLabel: { control: 'text' },
    draftLabel: { control: 'text' },
    // 노드 슬롯
    viewIcon: { control: false },
    saveIcon: { control: false },
    submitIcon: { control: false },
    onChange: { control: false },
    onSubmit: { control: false },
    onSaveDraft: { control: false },
    onCancel: { control: false },
    onPreview: { control: false },
    onEditReasonChange: { control: false },
    editMeta: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof AnswerForm>

export default meta
type Story = StoryObj<typeof meta>

/** 답변 작성 — 빈 폼. 본문이 비면 등록/미리보기가 잠긴다 */
export const Create: Story = {
  render: (args) => <AnswerFormDemo {...args} />,
}

/** 답변 수정 — 수정 사유(필수)와 수정일/수정자 슬롯이 상단에 붙는다 */
export const Edit: Story = {
  args: {
    mode: 'edit',
    value: filledDraft,
    templates,
    editReason: '',
    editMeta: (
      <>
        <span>최종 수정 2026-07-12 14:32</span>
        <span aria-hidden="true">·</span>
        <span>김상담</span>
      </>
    ),
  },
  render: (args) => <AnswerFormDemo {...args} />,
}

/** 자주 쓰는 답변 — 템플릿을 고르면 본문이 채워진다(기존 내용이 있으면 확인) */
export const WithTemplates: Story = {
  args: { templates },
  render: (args) => <AnswerFormDemo {...args} />,
}

/** 미리보기 — 렌더된 HTML을 모달로 확인한다 */
export const Preview: Story = {
  args: {
    value: filledDraft,
    templates,
  },
  render: (args) => <AnswerFormPreviewDemo {...args} />,
}

/**
 * 요소 OFF 조합 — 첨부·공개여부·발송채널·미리보기를 모두 끈 최소 폼.
 * 본문과 액션만 남는다(옵션 줄과 좌측 버튼 자리가 통째로 사라진다 — 빈 여백이 남지 않는다).
 */
export const Minimal: Story = {
  args: {
    showAttachments: false,
    showVisibility: false,
    showNotify: false,
    showPreview: false,
  },
  render: (args) => <AnswerFormDemo {...args} />,
}

/** 첨부만 끈 상태 — 전화·챗봇처럼 파일을 못 받는 채널의 답변 폼 */
export const WithoutAttachments: Story = {
  args: { showAttachments: false },
  render: (args) => <AnswerFormDemo {...args} />,
}

/** 문구 교체 — 등록/취소/미리보기/임시저장 라벨만 도메인 용어로 바꾼다 */
export const CustomLabels: Story = {
  args: {
    value: filledDraft,
    submitLabel: '발송',
    cancelLabel: '닫기',
    previewLabel: '고객 화면으로 보기',
    draftLabel: '초안 보관',
  },
  render: (args) => <AnswerFormDemo {...args} />,
}

/**
 * Labels: 영문 오버라이드 — 필드 라벨·placeholder·발송 채널·미리보기 문구가 전부 labels 통로로 닿는다.
 * 기존 개별 prop(cancelLabel·previewLabel·draftLabel)이 labels보다 우선하므로 여기서는 비워 둔다.
 */
export const Labels: Story = {
  args: {
    value: filledDraft,
    cancelLabel: undefined,
    previewLabel: undefined,
    draftLabel: undefined,
    labels: {
      template: {
        label: 'Saved replies',
        placeholder: 'Pick a template',
        hint: 'Picking one fills the answer body.',
        overwriteConfirm: 'This replaces what you have written. Continue?',
      },
      content: { label: 'Answer', placeholder: 'Write your answer' },
      attachments: {
        label: 'Images / files',
        hint: (maxSizeMb) => `Images and documents · up to ${maxSizeMb}MB`,
      },
      visibility: {
        label: 'Visibility',
        publicHint: 'Visible to every customer.',
        privateHint: 'Only the asker can see it.',
      },
      notify: {
        label: 'Notify via',
        hint: 'We notify the customer on the selected channels.',
        channels: { sms: 'SMS', email: 'Email', kakao: 'KakaoTalk' },
      },
      actions: {
        submitting: 'Posting…',
        submitCreate: 'Post answer',
        submitEdit: 'Save changes',
        cancel: 'Cancel',
        preview: 'Preview',
        draft: 'Save draft',
      },
      preview: {
        title: 'Answer preview',
        close: 'Close',
        public: 'Public answer',
        private: 'Private answer',
        sent: (channels) => `Sending via: ${channels.join(' · ')}`,
        noChannel: 'No channel selected',
      },
    },
  },
  render: (args) => <AnswerFormDemo {...args} />,
}
