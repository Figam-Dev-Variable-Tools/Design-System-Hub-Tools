import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ArrowLeft, Download, PenLine, ShieldOff, Trash } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import {
  CustomerDetail,
  type CustomerActivity,
  type CustomerDetailProps,
  type CustomerProfile,
} from './CustomerDetail'
import { Button } from '../Button/Button'
import type { ConsentItem } from '../ConsentList/ConsentList'

/* ── 목데이터 ──────────────────────────────────────────────────────────────── */

const PROFILE: CustomerProfile = {
  id: 'MB-20241102-0421',
  name: '김서준',
  avatarUrl: mockImage('김서준', 'dusk'),
  signupBadge: '이메일 가입',
  memberType: 'VIP',
  memberTypeTone: 'primary',
  email: 'seojun.kim@example.com',
  phone: '010-4821-7734',
  phoneVerified: true,
  birthday: '1993-08-14',
  gender: '남성',
  signupPath: '이메일 · PC 웹',
  signupPathHint: '2024-11-02 신규가입 쿠폰 이벤트 유입',
}

const ACTIVITY: CustomerActivity = {
  orderCount: 42,
  totalPurchase: 3_284_000,
  inquiryCount: 8,
  commentCount: 12,
  joinedAt: '2024-11-02',
  lastLoginAt: '2026-07-12 21:44',
}

const CONSENTS: ConsentItem[] = [
  { label: '휴대폰 본인 인증', agreed: true, note: '인증 완료 · 2024-11-02' },
  { label: '마케팅 정보 활용 동의', agreed: true },
  { label: '광고성 정보 수신 동의', agreed: false },
]

const MEMO =
  '2026-06-28 배송 지연 건으로 클레임 접수 → 3,000원 쿠폰 지급 완료. VIP 승급 이후 재구매 주기가 짧아졌으니 신제품 입고 시 우선 안내 요망.'

/** 갓 가입해 연락처·생년월일·성별이 비고 활동 이력이 없는 회원 */
const NEW_PROFILE: CustomerProfile = {
  id: 'MB-20260712-1183',
  name: '정예린',
  signupBadge: '카카오 가입',
  memberType: '일반',
  memberTypeTone: 'secondary',
  email: 'yerin.jung@example.com',
  signupPath: '카카오 간편가입 · 모바일 웹',
}

const NEW_ACTIVITY: CustomerActivity = {
  orderCount: 0,
  totalPurchase: 0,
  inquiryCount: 0,
  commentCount: 0,
  joinedAt: '2026-07-12',
}

/* ── 데모 래퍼 — 메모는 제어 값이라 스토리가 상태를 들고 있는다 ─────────────── */

function CustomerDetailDemo({ memo: initialMemo, onMemoSave, ...rest }: CustomerDetailProps) {
  const [memo, setMemo] = useState(initialMemo)
  const [saving, setSaving] = useState(false)
  const [blocked, setBlocked] = useState(rest.blocked ?? false)

  return (
    <CustomerDetail
      {...rest}
      memo={memo}
      onMemoChange={setMemo}
      memoSaving={saving}
      blocked={blocked}
      onMemoSave={
        onMemoSave == null
          ? undefined
          : () => {
              // 저장은 0.8초 지연으로 흉내낸다
              setSaving(true)
              window.setTimeout(() => setSaving(false), 800)
            }
      }
      onBlock={setBlocked}
    />
  )
}

const meta = {
  title: 'Admin/CustomerDetail',
  component: CustomerDetail,
  tags: ['autodocs'],
  args: {
    profile: PROFILE,
    activity: ACTIVITY,
    consents: CONSENTS,
    memo: MEMO,
    onMemoChange: () => {},
    onMemoSave: () => {},
    title: '고객 상세',
    description: 'VIP · 2024-11-02 가입',
    density: 'compact',
    loading: false,
    blocked: false,
  },
  argTypes: {
    profile: { control: 'object' },
    activity: { control: 'object' },
    consents: { control: 'object' },
    show: { control: 'object' },
    // 헤더 골격 — layout(기본, AdminPageLayout 헤더) / bar(PageHeaderBar + 유형 배지 + 액션)
    header: { control: 'inline-radio', options: ['layout', 'bar'] },
    headerActions: { control: false },
    emptyTitle: { control: 'text' },
    emptyDescription: { control: 'text' },
    backIcon: { control: false },
    editIcon: { control: false },
    blockIcon: { control: false },
    deleteIcon: { control: false },
    onMemoChange: { control: false },
    onMemoSave: { control: false },
    onBackToList: { control: false },
    onEdit: { control: false },
    onBlock: { control: false },
    onDelete: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => <CustomerDetailDemo {...args} />,
} satisfies Meta<typeof CustomerDetail>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 좌: 회원 정보 / 우: 활동 정보 · 동의 정보 · 관리자 메모 / 하단: 목록 · 차단 · 삭제 · 수정 */
export const Default: Story = {
  args: {
    onBackToList: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
}

/** 신규 가입 — 선택 항목이 비고 활동이 0이면 값은 흐린 '-'로, 동의 정보는 빈 상태로 떨어진다 */
export const NewCustomer: Story = {
  args: {
    profile: NEW_PROFILE,
    activity: NEW_ACTIVITY,
    consents: [],
    memo: '',
    description: '일반 · 2026-07-12 가입',
  },
}

/** 로딩 — 카드 골격은 그대로 두고 내용만 스켈레톤. 하단 액션은 잠긴다 */
export const Loading: Story = {
  args: {
    loading: true,
  },
}

/** 밀도 비교 — comfortable은 정의 행이 44 → 56으로 늘어난다(바깥 여백은 그대로) */
export const Comfortable: Story = {
  args: {
    density: 'comfortable',
  },
}

/** 차단된 회원 — 이름 옆 '차단됨' 배지, 하단 버튼은 '차단 해제'로 바뀐다 */
export const Blocked: Story = {
  args: {
    blocked: true,
    description: 'VIP · 2024-11-02 가입 · 2026-07-01 차단',
  },
}

/**
 * 대부분 OFF — 동의 정보·관리자 메모·하단 액션 바가 통째로 사라지고, 활동 정보는
 * 가입일·최근 로그인 행만 남는다. 꺼진 자리에 여백·빈 카드가 남지 않는다.
 */
export const Minimal: Story = {
  args: {
    show: {
      consent: false,
      adminMemo: false,
      footer: false,
      activityStats: false,
    },
  },
}

/** 회원 정보 OFF — 좌측 본문이 비면 우측 카드(활동·동의·메모)를 본문으로 끌어올려 전폭으로 편다 */
export const ProfileOff: Story = {
  args: {
    show: { profile: false },
    onBackToList: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
}

/**
 * 헤더 바 — header="bar"면 헤더 줄이 PageHeaderBar로 바뀐다.
 * 제목 옆에 회원 유형 배지가 붙고 우측 액션 슬롯(headerActions)이 열린다.
 * (쌍둥이였던 '고객 상세 Page' 화면의 헤더다 — 화면을 하나 더 두는 대신 prop 하나로 남겼다)
 */
export const HeaderBar: Story = {
  args: {
    header: 'bar',
    description: '아티스트회원 · 2024-11-02 가입',
    headerActions: (
      <Button
        variant="secondary"
        appearance="outline"
        size="md"
        label="엑셀 다운로드"
        showLeftIcon
        leftIcon={<Download size={16} />}
      />
    ),
    onBackToList: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
}

/**
 * 필드 단위 OFF — 회원 정보 카드는 살아 있고 유형/계정/이름 행만 남는다.
 * 꺼진 행 자리에 여백·구분선이 남지 않는다(정의 표는 남은 행만으로 다시 조판된다).
 */
export const FieldsOff: Story = {
  args: {
    show: {
      phone: false,
      birthday: false,
      gender: false,
      signupPath: false,
      memberId: false,
      activity: false,
      consent: false,
      adminMemo: false,
      footer: false,
    },
  },
}

/** 아이콘·문구 교체 — 하단 버튼 아이콘과 동의 정보 빈 상태 문구만 갈아끼운다(레이아웃은 그대로) */
export const CustomIconsAndCopy: Story = {
  args: {
    consents: [],
    backIcon: <ArrowLeft size={16} />,
    editIcon: <PenLine size={16} />,
    blockIcon: <ShieldOff size={16} />,
    deleteIcon: <Trash size={16} />,
    emptyTitle: '수집된 동의 항목이 없습니다.',
    emptyDescription: '가입 절차를 마치면 동의 내역이 표시됩니다.',
    onBackToList: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
}
