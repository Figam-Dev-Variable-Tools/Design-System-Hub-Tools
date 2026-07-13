import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { NoticeBoard, type NoticeBoardProps, type NoticeRow } from './NoticeBoard'

/** 목데이터 — 운영 중인 쇼핑몰 공지 게시판을 가정한 20건 */
const NOTICES: NoticeRow[] = [
  { id: 'n01', category: '공지', title: '개인정보 처리방침 개정 안내 (2026-08-01 시행)', author: '운영팀', createdAt: '2026-07-10', updatedAt: '2026-07-11', views: 4213, status: 'visible', pinned: true, important: true },
  { id: 'n02', category: '점검', title: '[필독] 7월 정기 서버 점검 안내 (02:00~05:00)', author: '인프라팀', createdAt: '2026-07-09', updatedAt: '2026-07-09', views: 2871, status: 'visible', pinned: true },
  { id: 'n03', category: '이벤트', title: '여름 시즌오프 최대 70% 할인 이벤트', author: '마케팅팀', createdAt: '2026-07-08', updatedAt: '2026-07-12', views: 18420, status: 'visible', important: true },
  { id: 'n04', category: '업데이트', title: '모바일 앱 3.2.0 업데이트 — 주문 조회 개선', author: '프로덕트팀', createdAt: '2026-07-07', updatedAt: '2026-07-07', views: 1204, status: 'visible' },
  { id: 'n05', category: '안내', title: '택배사 파업에 따른 배송 지연 안내', author: '고객지원팀', createdAt: '2026-07-05', updatedAt: '2026-07-06', views: 9317, status: 'visible' },
  { id: 'n06', category: '이벤트', title: '신규 회원 웰컴 쿠폰 15% 지급', author: '마케팅팀', createdAt: '2026-07-04', updatedAt: '2026-07-04', views: 6540, status: 'scheduled', publishAt: '2026-07-20 10:00' },
  { id: 'n07', category: '공지', title: '추석 연휴 배송 및 고객센터 운영 안내', author: '운영팀', createdAt: '2026-07-03', updatedAt: '2026-07-03', views: 312, status: 'scheduled', publishAt: '2026-09-14 09:00' },
  { id: 'n08', category: '점검', title: '결제 모듈 교체 작업에 따른 일시 중단', author: '인프라팀', createdAt: '2026-07-02', updatedAt: '2026-07-03', views: 1980, status: 'hidden' },
  { id: 'n09', category: '안내', title: '교환/반품 정책 변경 사전 안내', author: '고객지원팀', createdAt: '2026-06-30', updatedAt: '2026-07-01', views: 5124, status: 'visible' },
  { id: 'n10', category: '업데이트', title: '리뷰 포토 첨부 기능이 추가되었습니다', author: '프로덕트팀', createdAt: '2026-06-28', updatedAt: '2026-06-28', views: 2260, status: 'visible' },
  { id: 'n11', category: '이벤트', title: '리뷰 작성 시 적립금 2배 지급 (기간 한정)', author: '마케팅팀', createdAt: '2026-06-25', updatedAt: '2026-06-27', views: 11302, status: 'hidden' },
  { id: 'n12', category: '공지', title: '휴면 계정 전환 사전 고지', author: '운영팀', createdAt: '2026-06-22', updatedAt: '2026-06-22', views: 3411, status: 'visible' },
  { id: 'n13', category: '안내', title: '무통장 입금 계좌 변경 안내', author: '재무팀', createdAt: '2026-06-20', updatedAt: '2026-06-21', views: 874, status: 'visible' },
  { id: 'n14', category: '점검', title: '이미지 서버 이관 작업 안내', author: '인프라팀', createdAt: '2026-06-18', updatedAt: '2026-06-18', views: 640, status: 'hidden' },
  { id: 'n15', category: '이벤트', title: '친구 초대 이벤트 당첨자 발표', author: '마케팅팀', createdAt: '2026-06-15', updatedAt: '2026-06-16', views: 7788, status: 'visible' },
  { id: 'n16', category: '업데이트', title: '주문서 화면 개편 안내', author: '프로덕트팀', createdAt: '2026-06-12', updatedAt: '2026-06-12', views: 1533, status: 'visible' },
  { id: 'n17', category: '공지', title: '이용약관 일부 조항 변경 공지', author: '운영팀', createdAt: '2026-06-10', updatedAt: '2026-06-11', views: 2044, status: 'visible', important: true },
  { id: 'n18', category: '안내', title: '해외 배송 국가 추가 (싱가포르·대만)', author: '물류팀', createdAt: '2026-06-08', updatedAt: '2026-06-08', views: 1190, status: 'visible' },
  { id: 'n19', category: '이벤트', title: '얼리 블랙프라이데이 사전 알림 신청', author: '마케팅팀', createdAt: '2026-06-05', updatedAt: '2026-06-05', views: 402, status: 'scheduled', publishAt: '2026-10-25 00:00' },
  { id: 'n20', category: '업데이트', title: '알림톡 발송 지연 이슈 해결', author: '프로덕트팀', createdAt: '2026-06-02', updatedAt: '2026-06-03', views: 731, status: 'visible' },
]

const meta = {
  title: 'Admin/NoticeBoard',
  component: NoticeBoard,
  tags: ['autodocs'],
  args: {
    rows: NOTICES,
    loading: false,
    density: 'compact',
    title: '공지사항',
    description: '공지 노출 여부와 상단 고정을 관리합니다.',
    showTabs: true,
    showSearch: true,
    showCount: true,
    columnPicker: true,
    exportable: true,
    emptyText: '등록된 공지사항이 없습니다.',
    createLabel: '공지 등록',
    exportFilename: '공지사항',
  },
  argTypes: {
    rows: { control: false },
    categories: { control: false },
    // 문구 — 같은 표를 '이벤트'·'FAQ' 게시판으로도 쓴다
    title: { control: 'text' },
    description: { control: 'text' },
    emptyText: { control: 'text' },
    createLabel: { control: 'text' },
    exportFilename: { control: 'text' },
    // 요소 ON/OFF
    showTabs: { control: 'boolean' },
    showSearch: { control: 'boolean' },
    showCount: { control: 'boolean' },
    columnPicker: { control: 'boolean' },
    exportable: { control: 'boolean' },
    // 노드 슬롯
    createIcon: { control: false },
    editIcon: { control: false },
    deleteIcon: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof NoticeBoard>

export default meta
type Story = StoryObj<typeof meta>

/** 데모 래퍼가 직접 채우는 값 + 나머지는 args 그대로 흘려보낸다 */
type DemoProps = Omit<NoticeBoardProps, 'rows'> & { initialRows: NoticeRow[] }

/** 노출 토글·상단 고정·삭제가 실제로 반영되도록 rows를 들고 있는 데모 래퍼 */
function NoticeBoardDemo({ initialRows, ...rest }: DemoProps) {
  const [rows, setRows] = useState<NoticeRow[]>(initialRows)

  const patch = (ids: string[], next: (row: NoticeRow) => NoticeRow) => {
    setRows((prev) => prev.map((row) => (ids.includes(row.id) ? next(row) : row)))
  }

  return (
    <NoticeBoard
      {...rest}
      rows={rows}
      onSearch={() => {}}
      onCreate={() => {}}
      onRowOpen={() => {}}
      onEdit={() => {}}
      onDelete={(ids) => setRows((prev) => prev.filter((row) => !ids.includes(row.id)))}
      onToggleVisible={(row, next) =>
        patch([row.id], (item) => ({ ...item, status: next ? 'visible' : 'hidden' }))
      }
      onTogglePin={(row, next) => patch([row.id], (item) => ({ ...item, pinned: next }))}
      onBulkVisibility={(ids, visible) =>
        patch(ids, (item) => ({ ...item, status: visible ? 'visible' : 'hidden' }))
      }
      onBulkPin={(ids, pinned) => patch(ids, (item) => ({ ...item, pinned }))}
    />
  )
}

/** 기본 — 고정 공지 2건이 상단에 붙고, 행에서 바로 노출 토글·케밥으로 조작한다 */
export const Default: Story = {
  render: (args) => <NoticeBoardDemo {...args} initialRows={NOTICES} />,
}

/** 밀도 비교 — 행 높이 56px(comfortable). 기본은 44px(compact) */
export const Comfortable: Story = {
  args: { density: 'comfortable' },
  render: (args) => <NoticeBoardDemo {...args} initialRows={NOTICES} />,
}

/** 빈 목록 — 검색·탭은 그대로 두고 표만 빈 상태 그림으로 */
export const Empty: Story = {
  render: (args) => <NoticeBoardDemo {...args} initialRows={[]} />,
}

/** 로딩 — 검색 버튼과 표가 함께 대기 상태가 된다 */
export const Loading: Story = {
  args: { loading: true },
  render: (args) => <NoticeBoardDemo {...args} initialRows={[]} />,
}

/**
 * 요소 OFF 조합 — 탭·검색·건수·컬럼피커·내보내기를 모두 끈 '표만' 화면.
 * 꺼진 요소의 자리는 통째로 접힌다(빈 여백이 남지 않는다).
 */
export const TableOnly: Story = {
  args: {
    showTabs: false,
    showSearch: false,
    showCount: false,
    columnPicker: false,
    exportable: false,
  },
  render: (args) => <NoticeBoardDemo {...args} initialRows={NOTICES.slice(0, 8)} />,
}

/**
 * 문구 교체 — title/description을 갈아끼워 같은 표를 '이벤트 관리'로 쓴다.
 * (전에는 '공지사항'이 컴포넌트 안에 박혀 있어 재사용이 불가능했다)
 */
export const CustomCopy: Story = {
  args: {
    title: '이벤트 관리',
    description: '진행 중인 이벤트의 노출 여부와 상단 고정을 관리합니다.',
    createLabel: '이벤트 등록',
    emptyText: '등록된 이벤트가 없습니다.',
    exportFilename: '이벤트목록',
  },
  render: (args) => <NoticeBoardDemo {...args} initialRows={NOTICES} />,
}

/**
 * labels — 화면의 모든 글자를 통로 하나로 갈아끼운다(영문 오버라이드).
 * 컬럼 머리글 · 상태(탭·검색 Select가 함께 쓴다) · 제목 앞 태그 · 검색 6조건 · 일괄 버튼 ·
 * 행 케밥(토글은 켜짐/꺼짐 두 문구) · 삭제 확인창까지 전부 labels가 소유한다.
 */
export const Labels: Story = {
  args: {
    labels: {
      title: 'Announcements',
      description: 'Control visibility and pinning for each notice.',
      create: 'New notice',
      columns: {
        index: 'No.',
        category: 'Category',
        title: 'Title',
        author: 'Author',
        createdAt: 'Created',
        updatedAt: 'Updated',
        views: 'Views',
        status: 'Visible',
      },
      status: { visible: 'Published', hidden: 'Hidden', scheduled: 'Scheduled' },
      tabs: { all: 'All' },
      tags: { important: 'Important', pinned: 'Pinned', scheduled: 'Scheduled' },
      search: {
        title: 'Title',
        titlePlaceholder: 'Search by title',
        content: 'Body',
        contentPlaceholder: 'Search in body text',
        author: 'Author',
        authorPlaceholder: 'Enter an author',
        period: 'Period',
        category: 'Category',
        status: 'Status',
      },
      bulk: { show: 'Publish', hide: 'Hide', pin: 'Pin to top', unpin: 'Unpin' },
      rowMenu: {
        edit: 'Edit',
        pin: 'Pin to top',
        unpin: 'Unpin',
        show: 'Publish',
        hide: 'Hide',
        delete: 'Delete',
      },
      empty: { title: 'No announcements yet.' },
      deleteDialog: {
        title: 'Delete the selected notices?',
        description: (ids) => `${ids.length} notice(s) will be removed from the list.`,
      },
    },
  },
  render: (args) => <NoticeBoardDemo {...args} initialRows={NOTICES} />,
}
