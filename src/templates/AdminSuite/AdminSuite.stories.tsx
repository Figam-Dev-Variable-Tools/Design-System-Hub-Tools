import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { AdminSuite } from './AdminSuite'

const meta = {
  title: 'Templates/AdminSuite',
  component: AdminSuite,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof AdminSuite>

export default meta
type Story = StoryObj<typeof meta>

// 사이드바 하나로 대시보드 · 상품 · 전시 · 주문 · 문의 · 회원 · 게시판을 오간다.
// 상세 화면(상품/문의/고객/신청)은 메뉴가 아니라 목록의 행을 눌러 들어간다.
export const Default: Story = {}

// 대시보드 v2 — 오늘의 할일·최근 주문/상담 신청 피드·방문자 통계.
// 할일과 피드의 건수는 목데이터에서 계산되고, 누르면 해당 화면으로 이동한다.
export const DashboardV2: Story = {
  args: { initialMenu: 'dashboard-v2' },
}

// 고객 목록 — 회원 유형 탭·검색으로 좁히고, 닉네임을 누르면 고객 상세로 들어간다.
// 상세의 메모·차단·삭제는 목록에 그대로 반영된다.
export const CustomerFlow: Story = {
  args: { initialMenu: 'customer-list' },
}

// 회원 관리(그룹) — 좌측 그룹 패널로 좁히고, 닉네임을 누르면 고객 상세로 들어간다.
// 상세의 차단/삭제는 목록에 그대로 반영된다.
export const MemberFlow: Story = {
  args: { initialMenu: 'member-list' },
}

// 운영진 — 그룹별 접근 권한. 케밥(⋯)에서 그룹 변경·운영진 해제.
export const StaffFlow: Story = {
  args: { initialMenu: 'staff-list' },
}

// 상품 목록(레퍼런스형) — 카테고리·기획전 트리 + 행 안 인라인 상태 Select.
// 상품명을 누르면 상품 등록/수정 화면으로 값이 실려 넘어간다.
export const ProductScreenFlow: Story = {
  args: { initialMenu: 'product-screen' },
}

// 상품 등록/수정 — 좌측 앵커 내비 + 우측 모바일 미리보기. 저장하면 목록에 반영된다.
export const ProductEditFlow: Story = {
  args: { initialMenu: 'product-edit' },
}

// 주문 — 상태 탭(건수는 주문 데이터에서 계산) · 통합 검색 · 행에서 바로 송장 입력.
export const OrderFlow: Story = {
  args: { initialMenu: 'orders' },
}

// 문의 내역(상담 신청) — 제목을 누르면 신청 상세로. 상세의 상태 Select는 초안이고
// 하단 [상태 변경]을 눌러야 목록에 반영된다.
export const InquiryBoardFlow: Story = {
  args: { initialMenu: 'inquiry-board' },
}

// 공지사항 — 고정 공지가 상단에 붙고, 행에서 바로 노출 토글·케밥으로 조작한다.
export const NoticeFlow: Story = {
  args: { initialMenu: 'notice-board' },
}

// 포트폴리오 관리 — 순번 드래그·활성화 토글. [포트폴리오 등록]과 제목 클릭이
// 같은 등록/수정 폼으로 이어진다(신규 / 값이 채워진 수정).
export const PortfolioFlow: Story = {
  args: { initialMenu: 'portfolio-list' },
}

// 문의 목록(프리셋) — 문의번호·제목·상세보기(눈 아이콘)를 누르면 문의 상세로 이동한다.
export const InquiryFlow: Story = {
  args: { initialMenu: 'inquiry-list' },
}

// 상품 목록(프리셋) — 상품명을 누르면 상품 상세로, 상세의 '수정'은 상품 폼으로 이어진다.
export const ProductFlow: Story = {
  args: { initialMenu: 'product-list' },
}

// 문의 설정 — 유형 / 자동화 / 알림 / 상태 배지 탭.
export const InquirySettingsScreen: Story = {
  args: { initialMenu: 'inquiry-settings' },
}

// 메인비주얼 관리 — 배너 구분 탭(중고/렌탈/시공)별 표. 제목·연필을 누르면 수정 폼으로,
// [등록]은 지금 보고 있는 탭의 신규 배너로 들어간다. 저장하면 그 탭 목록에 꽂힌다.
export const MainVisualFlow: Story = {
  args: { initialMenu: 'mainvisual-list' },
}

// 시공 문의 내역 — 눈 아이콘으로 상세에 들어간다. 답변을 저장하면 목록의 상태가
// '답변완료'로 바뀌고, 답변 카드를 끄고 저장하면 '대기중'으로 되돌아간다.
export const InquiryManageFlow: Story = {
  args: { initialMenu: 'inquiry-manage' },
}

// 카테고리 관리 — 순번 드래그·활성화 토글. [카테고리 등록]과 연필이 같은 폼으로 이어진다
// (신규 / 값이 채워진 수정).
export const CategoryFlow: Story = {
  args: { initialMenu: 'category-list' },
}
