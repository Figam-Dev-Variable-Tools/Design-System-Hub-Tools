import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import {
  InquirySettings,
  type InquiryAutomation,
  type InquiryNotification,
  type InquiryNotificationTargets,
  type InquirySettingsProps,
  type InquiryStatusStyle,
  type InquiryTemplate,
  type InquiryTypeItem,
} from './InquirySettings'

const TYPES: InquiryTypeItem[] = [
  { key: 'product', label: '상품 문의', enabled: true },
  { key: 'delivery', label: '배송 문의', enabled: true },
  { key: 'order', label: '주문 문의', enabled: true },
  { key: 'payment', label: '결제 문의', enabled: true },
  { key: 'cancel', label: '취소 문의', enabled: true },
  { key: 'exchange', label: '교환 문의', enabled: true },
  { key: 'return', label: '반품 문의', enabled: true },
  { key: 'refund', label: '환불 문의', enabled: true },
  { key: 'member', label: '회원 문의', enabled: false },
  { key: 'event', label: '이벤트 문의', enabled: false },
  { key: 'etc', label: '기타 문의', enabled: true },
]

const STATUSES: InquiryStatusStyle[] = [
  { key: 'received', label: '접수', tone: 'secondary' },
  { key: 'checking', label: '확인중', tone: 'primary' },
  { key: 'waiting', label: '답변대기', tone: 'warning' },
  { key: 'answered', label: '답변완료', tone: 'success' },
  { key: 'hold', label: '보류', tone: 'warning' },
  { key: 'closed', label: '종료', tone: 'secondary' },
  { key: 'deleted', label: '삭제', tone: 'error' },
]

const AUTOMATION: InquiryAutomation = {
  autoAssign: true,
  autoReply: true,
  faqSuggest: false,
  slaHours: 24,
}

const NOTIFICATION: InquiryNotification = { email: true, sms: false, kakao: true, admin: true }

const TEMPLATES: InquiryTemplate[] = [
  {
    id: 'tpl-1',
    title: '배송 지연 안내',
    typeKey: 'delivery',
    body: '주문하신 상품의 출고가 지연되어 안내드립니다. 늦어도 2영업일 내 발송 예정입니다.',
    updatedAt: '2026-06-28',
  },
  {
    id: 'tpl-2',
    title: '결제 취소 처리 안내',
    typeKey: 'payment',
    body: '결제 취소가 완료되었습니다. 카드사 사정에 따라 환급까지 3~5영업일이 소요됩니다.',
    updatedAt: '2026-07-02',
  },
  {
    id: 'tpl-3',
    title: '접수 확인 자동 답변',
    typeKey: '',
    body: '문의가 정상 접수되었습니다. 담당자가 확인 후 24시간 이내 답변드리겠습니다.',
    updatedAt: '2026-07-09',
  },
]

const TARGETS: InquiryNotificationTargets = {
  email: ['customer'],
  sms: ['customer'],
  kakao: ['customer'],
  admin: ['manager', 'admin'],
}

/** 상태를 가진 화면이라 스토리 안에서 로컬 데모 래퍼로 감싼다 */
function InquirySettingsDemo(props: InquirySettingsProps) {
  const [types, setTypes] = useState(props.types)
  const [automation, setAutomation] = useState(props.automation)
  const [notification, setNotification] = useState(props.notification)
  const [statuses, setStatuses] = useState(props.statuses)
  const [templates, setTemplates] = useState(props.templates ?? [])
  const [targets, setTargets] = useState(props.notificationTargets ?? TARGETS)

  return (
    <InquirySettings
      {...props}
      types={types}
      onTypesChange={setTypes}
      automation={automation}
      onAutomationChange={setAutomation}
      notification={notification}
      onNotificationChange={setNotification}
      statuses={statuses}
      onStatusesChange={setStatuses}
      templates={templates}
      onTemplatesChange={setTemplates}
      notificationTargets={targets}
      onNotificationTargetsChange={setTargets}
    />
  )
}

const meta = {
  title: 'Admin/InquirySettings',
  component: InquirySettings,
  tags: ['autodocs'],
  args: {
    types: TYPES,
    automation: AUTOMATION,
    notification: NOTIFICATION,
    statuses: STATUSES,
    templates: TEMPLATES,
    notificationTargets: TARGETS,
    showTemplates: true,
    showPreview: true,
  },
  argTypes: {
    types: { control: false },
    statuses: { control: false },
    templates: { control: false },
    notificationTargets: { control: false },
    targetOptions: { control: false },
    // 요소 ON/OFF
    showTemplates: { control: 'boolean' },
    showPreview: { control: 'boolean' },
    // 노드 슬롯 — 행의 [수정][삭제] 아이콘은 공용 RowActions가 갖는다
    addIcon: { control: false },
    onTypesChange: { control: false },
    onAutomationChange: { control: false },
    onNotificationChange: { control: false },
    onStatusesChange: { control: false },
    onTemplatesChange: { control: false },
    onNotificationTargetsChange: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof InquirySettings>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 전체 — 유형 / 자동화 / 알림 / 상태 배지 4개 탭.
 * 유형은 핸들 드래그(또는 `Ctrl/Cmd + ↑ ↓`)로 순서를 바꾸고, 추가·수정·삭제는 CrudDialog로 처리한다.
 */
export const Default: Story = {
  render: (args) => <InquirySettingsDemo {...args} />,
}

/**
 * 문의 유형만 — 목록·순서 변경·사용여부 토글·CRUD. 섹션이 하나면 탭 바가 사라진다.
 */
export const TypesOnly: Story = {
  args: {
    sections: ['types'],
  },
  render: (args) => <InquirySettingsDemo {...args} />,
}

/**
 * 알림만 — 이메일·SMS·카카오 알림톡·관리자 알림의 on/off와 수신 대상.
 * 채널을 끄면 수신 대상 선택도 비활성된다.
 */
export const Notifications: Story = {
  args: {
    sections: ['notification'],
  },
  render: (args) => <InquirySettingsDemo {...args} />,
}

/**
 * 자동화 탭에서 [답변 템플릿] 카드를 끈 상태 — 템플릿을 안 쓰는 운영.
 * 카드가 통째로 빠지고 자동 기능 카드만 남는다.
 */
export const WithoutTemplates: Story = {
  args: {
    sections: ['automation'],
    defaultSection: 'automation',
    showTemplates: false,
  },
  render: (args) => <InquirySettingsDemo {...args} />,
}

/**
 * 상태 배지 탭에서 '미리보기' 열을 끈 상태 — 격자가 4열 → 3열로 줄어든다(빈 열이 남지 않는다).
 */
export const WithoutPreview: Story = {
  args: {
    sections: ['status'],
    defaultSection: 'status',
    showPreview: false,
  },
  render: (args) => <InquirySettingsDemo {...args} />,
}
