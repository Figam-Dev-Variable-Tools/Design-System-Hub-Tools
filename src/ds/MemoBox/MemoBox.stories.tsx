import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { MemoBox, type MemoBoxItem, type MemoBoxProps } from './MemoBox'

/** 누적 메모 — items를 넘긴 스토리에서 작성 칸 위에 쌓인다 */
const MEMOS: MemoBoxItem[] = [
  {
    id: 'm1',
    author: '김상담',
    createdAt: '2026-07-12 14:20',
    content: '고객이 색상 오배송을 사진으로 보내옴. 교환 접수 진행함.',
  },
  {
    id: 'm2',
    author: '박운영',
    createdAt: '2026-07-11 09:05',
    updatedAt: '2026-07-11 09:31',
    content: 'VIP 등급이라 회수/재발송 배송비 모두 판매자 부담으로 처리하기로 팀 합의.',
  },
]

/**
 * 제어 컴포넌트라 스토리에서 상태를 들고 있는다.
 * onSave를 넘긴 스토리에서만 저장 버튼이 뜨고, 저장은 0.8초 지연으로 흉내낸다.
 */
function MemoBoxDemo({ value: initial, saving: initialSaving, onSave, ...rest }: MemoBoxProps) {
  const [value, setValue] = useState(initial)
  const [saving, setSaving] = useState(initialSaving ?? false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  return (
    <div style={{ width: 560, maxWidth: '100%' }}>
      <MemoBox
        {...rest}
        value={value}
        saving={saving}
        onChange={setValue}
        onSave={
          onSave == null
            ? undefined
            : () => {
                setSaving(true)
                window.setTimeout(() => {
                  setSaving(false)
                  setSavedAt(new Date().toLocaleTimeString('ko-KR'))
                }, 800)
              }
        }
      />
      {savedAt != null && (
        <p
          style={{
            margin: 'var(--ds-spacing-2) 0 0',
            fontSize: 'var(--ds-font-size-xs)',
            color: 'var(--ds-color-secondary)',
          }}
        >
          {savedAt} 저장됨
        </p>
      )}
    </div>
  )
}

const meta = {
  title: 'Admin/MemoBox',
  component: MemoBox,
  tags: ['autodocs'],
  args: {
    value: '',
    onChange: () => {},
    onSave: () => {},
    maxLength: 500,
    title: '관리자 메모',
    description: '고객에게 노출되지 않습니다.',
    saving: false,
    showCounter: true,
    showHeader: true,
    framed: true,
    requireContent: false,
    saveLabel: '저장',
    savingLabel: '저장 중',
  },
  argTypes: {
    value: { control: 'text' },
    maxLength: { control: { type: 'number', min: 50, step: 50 } },
    title: { control: 'text' },
    description: { control: 'text' },
    placeholder: { control: 'text' },
    saving: { control: 'boolean' },
    // 요소 ON/OFF
    showCounter: { control: 'boolean' },
    showHeader: { control: 'boolean' },
    framed: { control: 'boolean' },
    requireContent: { control: 'boolean' },
    // 누적 목록 — 넘겨야 목록 영역이 생긴다([]면 빈 상태)
    items: { control: false },
    emptyText: { control: 'text' },
    // 문구
    saveLabel: { control: 'text' },
    savingLabel: { control: 'text' },
    // 노드 슬롯
    saveIcon: { control: false },
    onChange: { control: false },
    onSave: { control: false },
    onItemEdit: { control: false },
    onItemDelete: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => <MemoBoxDemo {...args} />,
} satisfies Meta<typeof MemoBox>

export default meta
type Story = StoryObj<typeof meta>

/** 빈 메모 — 입력하면 카운터가 0/500부터 올라간다 */
export const Default: Story = {}

/** 기존 메모가 있는 상태 */
export const Filled: Story = {
  args: {
    value:
      '2026-07-11 전화 응대. 교환 사유는 색상 오배송으로 확인됨. 회수 기사 방문 일정(7/15) 안내 완료했고, 재발송은 재고 입고 후 7/17 예정이라고 전달함. VIP 등급이라 배송비는 판매자 부담으로 처리.',
  },
}

/** 저장 중 — 입력과 버튼이 잠긴다 */
export const Saving: Story = {
  args: {
    value: '반품 승인 처리함. 회수 완료되면 환불 진행 예정.',
    saving: true,
  },
}

/** 글자수 한도 도달 — Textarea 내장 카운터가 100/100에서 멈춘다(더 입력되지 않는다) */
export const MaxLength: Story = {
  args: {
    maxLength: 100,
    value:
      '주문번호 20260711-0042 관련 응대 기록. 고객이 배송지 변경을 요청했으나 이미 출고되어 반송 후 재발송으로 안내했고 배송비는 면제 처리함.'.slice(0, 100),
  },
}

/** onSave 미전달 — 저장 버튼 없이 카운터만. 읽기 위주 화면의 참고 메모 */
export const WithoutSave: Story = {
  args: {
    value: '휴면 해제 요청으로 본인 인증 재진행함.',
    title: '상담 참고 메모',
    description: '고객에게 노출되지 않습니다. 수정 권한은 매니저 이상.',
    onSave: undefined,
  },
}

/** items — 누적 메모가 작성 칸 위에 쌓이고, 각 행에 [수정][삭제](공용 RowActions)가 붙는다 */
export const WithHistory: Story = {
  args: {
    items: MEMOS,
    requireContent: true,
    saveLabel: '메모 등록',
    savingLabel: '등록 중',
    onItemEdit: () => {},
    onItemDelete: () => {},
  },
}

/** items=[] — 메모가 하나도 없을 때. 빈 상태는 공용 EmptyState가 그린다 */
export const EmptyHistory: Story = {
  args: {
    items: [],
    emptyText: '등록된 메모가 없습니다.',
    requireContent: true,
    onItemEdit: () => {},
    onItemDelete: () => {},
  },
}

/**
 * 요소 OFF 조합 — showHeader=false · framed=false.
 * PageSection처럼 이미 제목과 카드 크롬을 가진 껍데기 **안**에 넣을 때의 모습(문의 상세의 관리자 메모).
 */
export const Bare: Story = {
  args: {
    showHeader: false,
    framed: false,
    items: MEMOS,
    requireContent: true,
    saveLabel: '메모 등록',
    onItemEdit: () => {},
    onItemDelete: () => {},
  },
  // 바깥 카드는 PageSection 흉내 — MemoBox가 자기 보더를 벗어 카드가 두 겹으로 겹치지 않는다
  render: (args) => (
    <div
      style={{
        display: 'inline-block',
        padding: 'var(--ds-spacing-5)',
        border: 'var(--ds-border-width) solid var(--ds-color-border)',
        borderRadius: 'var(--ds-radius-lg)',
        background: 'var(--ds-color-bg)',
      }}
    >
      <MemoBoxDemo {...args} />
    </div>
  ),
}

/** showCounter=false — 글자수를 세지 않는 자유 메모 */
export const WithoutCounter: Story = {
  args: {
    showCounter: false,
    value: '카운터 없이 입력만.',
  },
}
