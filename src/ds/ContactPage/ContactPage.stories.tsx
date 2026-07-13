import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import {
  ContactPage,
  type ContactLocation,
  type ContactPageProps,
  type InquiryFormValue,
  type InquiryType,
} from './ContactPage'

/** 목데이터 — 레이아웃 검증용이지 실제 사업장 정보가 아니다. */
const LOCATION: ContactLocation = {
  address: ['서울특별시 강남구 테헤란로 152', '강남파이낸스센터 21층 (역삼동)'],
  phone: ['02-1234-5678', '평일 상담 · 부재 시 콜백'],
  email: ['contact@spaceplanning.ai', '견적 문의는 24시간 접수'],
  hours: ['평일 09:00 - 18:00', '점심 12:30 - 13:30 · 주말·공휴일 휴무'],
}

/** 업체 분류 — 레퍼런스의 '분류를 선택해주세요' Select 옵션 */
const TYPES: InquiryType[] = [
  { value: 'landscape', label: '조경 시공 문의' },
  { value: 'design', label: '조경 설계' },
  { value: 'estimate', label: '견적 요청' },
  { value: 'partnership', label: '제휴·협업 제안' },
  { value: 'etc', label: '기타 문의' },
]

const EMPTY_VALUE: InquiryFormValue = {
  name: '',
  email: '',
  phone: '',
  type: null,
  title: '',
  content: '',
  files: [],
  agreed: false,
}

/** 레퍼런스 상태 — 아직 아무것도 안 썼지만 동의는 체크된 폼(제출 버튼이 활성) */
const CONSENTED_VALUE: InquiryFormValue = { ...EMPTY_VALUE, agreed: true }

/** 작성 중인 폼 — 제출 직전 상태 */
const FILLED_VALUE: InquiryFormValue = {
  name: '홍서비',
  email: 'sb.hong@example.com',
  phone: '010-2345-6789',
  type: 'interior',
  title: '역삼동 사무실 40평 인테리어 문의',
  content:
    '입주 예정인 사무실 리모델링을 검토 중입니다. 회의실 2개와 라운지를 포함한 배치를 원하고, 8월 중 착공을 희망합니다. 예산은 1억 내외로 생각하고 있습니다.',
  files: [],
  agreed: true,
}

/** 지도 슬롯 데모 — 외부 지도 API를 쓰지 않고 목 이미지를 꽂는다(실서비스에선 지도 SDK를 넣는 자리). */
function MockMap() {
  return <img src={mockImage('MAP', 'sage')} alt="사옥 위치 약도" />
}

/** value/onChange를 스토리에서 쥐고 도는 제어 래퍼 — 컴포넌트는 순수 제어형이다. */
function ControlledContactPage({ value: initial, ...props }: ContactPageProps) {
  const [value, setValue] = useState<InquiryFormValue>(initial)
  return <ContactPage {...props} value={value} onChange={setValue} />
}

const meta = {
  title: 'Site/ContactPage',
  component: ContactPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  args: {
    types: TYPES,
    value: CONSENTED_VALUE,
    onChange: () => {},
    onSubmit: () => {},
    accent: 'success',
    submitting: false,
    map: <MockMap />,
    showMap: true,
    mapHeight: 380,
    title: '문의하기',
    description: '궁금하신 점을 남겨주시면 담당자가 확인 후 연락드리겠습니다.',
    showInfo: false,
    location: LOCATION,
    showAttachment: false,
    submitLabel: '문의하기',
  },
  argTypes: {
    accent: { control: 'inline-radio', options: ['primary', 'success'] },
    showMap: { control: 'boolean' },
    mapHeight: { control: { type: 'range', min: 200, max: 600, step: 20 } },
    showInfo: { control: 'boolean' },
    showAttachment: { control: 'boolean' },
    title: { control: 'text' },
    description: { control: 'text' },
    submitLabel: { control: 'text' },
    map: { control: false },
    value: { control: false },
    onChange: { control: false },
    location: { control: false },
  },
  render: (args) => <ControlledContactPage {...args} />,
} satisfies Meta<typeof ContactPage>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 지도 띠 + 폼이 한 장의 카드(레퍼런스). */
export const Default: Story = {}

/** 동의 전 — 개인정보 동의를 체크하기 전에는 제출 버튼이 잠긴다. */
export const ConsentRequired: Story = {
  args: { value: EMPTY_VALUE },
}

/** 작성 완료 — 동의까지 체크되어 제출 가능한 상태. */
export const Filled: Story = {
  args: { value: FILLED_VALUE },
}

/** 오시는 길 정보 ON — 주소·전화·이메일·운영시간 4칸을 폼 위에 붙인다. */
export const WithLocationInfo: Story = {
  args: { showInfo: true, value: FILLED_VALUE },
}

/** 파일 첨부 ON — DropZone + 첨부 목록이 문의 내용 아래에 붙는다. */
export const WithAttachment: Story = {
  args: { showAttachment: true, value: FILLED_VALUE },
}

/** 지도 없이 — showMap=false면 폼만 있는 카드가 된다(별도 지도 페이지가 있는 사이트). */
export const WithoutMap: Story = {
  args: { showMap: false },
}

/**
 * 지도 미연결 — map 슬롯이 비면 그 자리에 공용 Placeholder가 들어간다.
 * 동의만 체크한 뒤 제출하면 필수 필드마다 에러가 뜬다(유효성 확인용).
 */
export const NoMapSlot: Story = {
  args: { map: undefined },
}

/** 강조색 primary — 라벨(정보 카드)·포커스 링이 함께 바뀐다. */
export const AccentPrimary: Story = {
  args: { accent: 'primary', value: FILLED_VALUE },
}

/** 전송 중 — 버튼이 잠긴다. */
export const Submitting: Story = {
  args: { value: FILLED_VALUE, submitting: true },
}
