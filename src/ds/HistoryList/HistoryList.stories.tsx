import { useEffect, useRef, useState, type RefObject } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import {
  DEFAULT_HISTORY_LIST_LABELS,
  HistoryList,
  type HistoryListProps,
  type HistoryRow,
} from './HistoryList'

/** 목데이터 — 고객용 HistoryPage의 연대 그룹을 '연혁 한 줄' 단위로 편 22건 */
const HISTORY: HistoryRow[] = [
  { id: 'h01', year: '2026', month: '5월', title: '서울 시립 전시관 음향 리뉴얼 준공', description: '상설 전시관 6개 홀 음향 설계·시공 감리', image: mockImage('2026', 'slate'), visible: true, createdAt: '2026-05-20' },
  { id: 'h02', year: '2026', month: '2월', title: '스튜디오 2관 확장 이전', description: '측정실·청음실 분리 구축', image: mockImage('2026', 'slate'), visible: true, createdAt: '2026-02-11' },
  { id: 'h03', year: '2025', month: '11월', title: '국립 공연장 튜닝 연간 계약 체결', description: '분기별 정기 튜닝 3년 계약', image: mockImage('2025', 'sand'), visible: true, createdAt: '2025-11-30' },
  { id: 'h04', year: '2025', month: '8월', title: '누적 시공 100건 달성', image: mockImage('2025', 'sand'), visible: true, createdAt: '2025-08-14' },
  { id: 'h05', year: '2025', month: '3월', title: '음향 측정 자동화 도구 자체 개발', description: '현장 측정 시간 40% 단축', visible: false, createdAt: '2025-03-02' },
  { id: 'h06', year: '2024', month: '12월', title: '올해의 공간 디자인상 음향 부문 수상', image: mockImage('2024', 'sage'), visible: true, createdAt: '2024-12-19' },
  { id: 'h07', year: '2024', month: '9월', title: '오피스 음환경 컨설팅 사업 개시', description: '개방형 사무실 소음 저감 프로그램', image: mockImage('2024', 'sage'), visible: true, createdAt: '2024-09-05' },
  { id: 'h08', year: '2024', month: '4월', title: '연구소 설립(음향 재료 시험)', visible: true, createdAt: '2024-04-22' },
  { id: 'h09', year: '2023', month: '10월', title: '해외 첫 프로젝트 — 도쿄 재즈클럽', description: '지하 1층 라이브홀 잔향 설계', image: mockImage('2023', 'slate'), visible: true, createdAt: '2023-10-08' },
  { id: 'h10', year: '2023', month: '6월', title: '전시장 음향 가이드라인 공동 발간', visible: false, createdAt: '2023-06-17' },
  { id: 'h11', year: '2022', month: '11월', title: '대학 콘서트홀 리모델링 수주', image: mockImage('2022', 'sand'), visible: true, createdAt: '2022-11-25' },
  { id: 'h12', year: '2022', month: '5월', title: '팀 20명 규모로 확대', visible: true, createdAt: '2022-05-09' },
  { id: 'h13', year: '2021', month: '9월', title: '방송국 부조정실 음향 개선', description: '스튜디오 3개 동시 시공', image: mockImage('2021', 'sage'), visible: true, createdAt: '2021-09-13' },
  { id: 'h14', year: '2021', month: '1월', title: '음향 시공 표준 공정 정립', visible: false, createdAt: '2021-01-28' },
  { id: 'h15', year: '2020', month: '7월', title: '비대면 공연장 중계 음향 지원', description: '무관중 공연 12건 중계', image: mockImage('2020', 'slate'), visible: true, createdAt: '2020-07-03' },
  { id: 'h16', year: '2019', month: '10월', title: '두 번째 사무실 이전(성수)', image: mockImage('2019', 'sand'), visible: true, createdAt: '2019-10-21' },
  { id: 'h17', year: '2019', month: '3월', title: '첫 공연장 프로젝트 준공', description: '300석 소극장 음향 설계', image: mockImage('2019', 'sand'), visible: true, createdAt: '2019-03-15' },
  { id: 'h18', year: '2016', month: '8월', title: '녹음실 전문 시공 라인 신설', image: mockImage('2016', 'sage'), visible: true, createdAt: '2016-08-30' },
  { id: 'h19', year: '2016', month: '2월', title: '법인 전환', visible: true, createdAt: '2016-02-04' },
  { id: 'h20', year: '2013', month: '6월', title: '첫 직원 채용', image: mockImage('2013', 'slate'), visible: true, createdAt: '2013-06-11' },
  { id: 'h21', year: '2011', month: '4월', title: '스튜디오 설립', description: '연남동 6평 녹음실에서 시작', image: mockImage('2011', 'sand'), visible: true, createdAt: '2011-04-01' },
  { id: 'h22', year: '2011', title: '첫 의뢰 — 개인 홈스튜디오 방음', visible: false, createdAt: '2011-04-30' },
]

const meta = {
  title: 'Admin/HistoryList',
  component: HistoryList,
  tags: ['autodocs'],
  args: {
    rows: HISTORY,
    loading: false,
    density: 'compact',
    title: '연혁 관리',
    description: '연도별 연혁의 노출 여부와 대표 이미지를 관리합니다.',
    createLabel: '연혁 등록',
    searchPlaceholder: '제목 검색',
    emptyText: '등록된 연혁이 없습니다.',
    exportFilename: '연혁목록',
  },
  argTypes: {
    rows: { control: false },
    sortOptions: { control: false },
    tabLabels: { control: false },
    deleteDescription: { control: false },
    show: { control: 'object' },
    // 문구 — 같은 표를 '수상 이력'·'연혁(영문)'으로도 쓴다
    title: { control: 'text' },
    description: { control: 'text' },
    createLabel: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    emptyText: { control: 'text' },
    exportFilename: { control: 'text' },
    deleteTitle: { control: 'text' },
    // 상태
    loading: { control: 'boolean' },
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    createIcon: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof HistoryList>

export default meta
type Story = StoryObj<typeof meta>

/** 데모 래퍼가 직접 채우는 값 + 나머지는 args 그대로 흘려보낸다 */
type DemoProps = Omit<HistoryListProps, 'rows'> & { initialRows: HistoryRow[] }

/** 등록 모달이 새 행에 부여하는 id·등록일 — 저장 방식은 화면(부모)이 정한다(HistoryList는 모른다) */
function nextHistoryId(): string {
  return `h-${Date.now().toString(36)}`
}

/** 노출 토글·삭제·등록·수정이 실제로 반영되도록 rows를 들고 있는 데모 래퍼 */
function HistoryListDemo({ initialRows, ...rest }: DemoProps) {
  const [rows, setRows] = useState<HistoryRow[]>(initialRows)

  return (
    <HistoryList
      {...rest}
      rows={rows}
      onCreate={() => {}}
      onRowOpen={() => {}}
      onEdit={() => {}}
      onDelete={(ids) => setRows((prev) => prev.filter((row) => !ids.includes(row.id)))}
      onToggleVisible={(row, next) =>
        setRows((prev) =>
          prev.map((item) => (item.id === row.id ? { ...item, visible: next } : item)),
        )
      }
      onCreateSubmit={(values) =>
        setRows((prev) => [
          { ...values, id: nextHistoryId(), createdAt: new Date().toISOString().slice(0, 10) },
          ...prev,
        ])
      }
      onEditSubmit={(row, values) =>
        setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, ...values } : item)))
      }
    />
  )
}

/**
 * 스토리 전용 — 마운트 직후 접근성 이름이 일치하는 버튼을 눌러 등록/수정 모달이 열린 상태를 보여준다.
 * 이 저장소에는 Storybook play 함수 도구(@storybook/test)가 설치돼 있지 않다 — 새 의존성을
 * 늘리는 대신, 실제 사용자가 하는 것과 같은 클릭을 그대로 흉내낸다(컨테이너 안에서만 찾는다).
 */
function useOpenDialogOnMount(containerRef: RefObject<HTMLDivElement | null>, accessibleName: string) {
  useEffect(() => {
    const root = containerRef.current
    if (root == null) return
    const button = Array.from(root.querySelectorAll('button')).find(
      (el) => el.getAttribute('aria-label') === accessibleName || el.textContent?.trim() === accessibleName,
    )
    button?.click()
  }, [containerRef, accessibleName])
}

/** 등록 모달이 열린 상태 — 헤더의 [연혁 등록]을 흉내내 누른다 */
function HistoryListCreateOpenDemo(props: DemoProps) {
  const ref = useRef<HTMLDivElement>(null)
  useOpenDialogOnMount(ref, props.createLabel ?? DEFAULT_HISTORY_LIST_LABELS.create)
  return (
    <div ref={ref}>
      <HistoryListDemo {...props} />
    </div>
  )
}

/** 수정 모달이 열린 상태 — 첫 행 관리 컬럼의 [OO 수정]을 흉내내 누른다(행 값이 채워져 있다) */
function HistoryListEditOpenDemo(props: DemoProps) {
  const ref = useRef<HTMLDivElement>(null)
  const firstTitle = props.initialRows[0]?.title ?? ''
  useOpenDialogOnMount(ref, DEFAULT_HISTORY_LIST_LABELS.rowActions.edit(firstTitle))
  return (
    <div ref={ref}>
      <HistoryListDemo {...props} />
    </div>
  )
}

/**
 * 기본 — 최신순 정렬. 탭(전체/노출/숨김) · 제목 검색 · 선택 일괄 삭제 · 페이지네이션이 모두 살아 있다.
 * 행의 노출 토글과 관리(수정/삭제)는 바로 반영된다(삭제는 확인창을 거친다).
 */
export const Default: Story = {
  render: (args) => <HistoryListDemo {...args} initialRows={HISTORY} />,
}

/** 빈 목록 — 탭·툴바는 그대로 두고 표만 빈 상태 그림으로 */
export const Empty: Story = {
  render: (args) => <HistoryListDemo {...args} initialRows={[]} />,
}

/** 로딩 — 검색·표가 함께 대기 상태가 된다 */
export const Loading: Story = {
  args: { loading: true },
  render: (args) => <HistoryListDemo {...args} initialRows={[]} />,
}

/**
 * 최소 구성 — 탭·툴바(검색·정렬·건수)·페이지네이션·선택·내보내기·컬럼 피커를 모두 끈 '표만' 화면.
 * 꺼진 요소의 자리는 통째로 접힌다(빈 여백이 남지 않는다).
 */
export const Minimal: Story = {
  args: {
    show: {
      tabs: false,
      toolbar: false,
      pagination: false,
      bulk: false,
      columnPicker: false,
      export: false,
    },
  },
  render: (args) => <HistoryListDemo {...args} initialRows={HISTORY.slice(0, 8)} />,
}

/**
 * labels — 화면의 모든 글자를 통로 하나로 갈아끼운다(영문 오버라이드).
 * 컬럼 머리글 · 탭 · 정렬 · 행 액션 접근성 이름 · 빈 칸 문자 · 삭제 확인창까지 전부 labels가 소유한다.
 * 넘기지 않은 키는 기본 문구를 지킨다(mergeLabels — 부분 오버라이드).
 *
 * labels.table은 화면이 그리지 않는 '표 크롬'(선택 바 · 내보내기 · [컬럼] 피커 · 페이지 크기 · 썸네일 대체 문구)이다 —
 * 셸(AdminListPage)을 지나 AdminTable까지 그대로 흘러간다. toolbar처럼 일부 키만 넘기면 나머지는 기본값이 남는다.
 */
export const Labels: Story = {
  args: {
    labels: {
      title: 'Company history',
      description: 'Manage visibility and cover images for each milestone.',
      create: 'Add milestone',
      columns: {
        index: 'No.',
        year: 'Year',
        month: 'Month',
        title: 'Title',
        description: 'Description',
        image: 'Cover',
        visible: 'Visible',
        createdAt: 'Created',
        actions: 'Manage',
      },
      tabs: { all: 'All', visible: 'Visible', hidden: 'Hidden' },
      sort: { recent: 'Newest', year: 'By year' },
      rowActions: {
        edit: (title) => `Edit ${title}`,
        delete: (title) => `Delete ${title}`,
      },
      search: { searchPlaceholder: 'Search by title' },
      empty: { title: 'No milestones yet.' },
      emptyCell: '—',
      deleteDialog: {
        title: 'Delete the selected milestones?',
        description: (ids) => `${ids.length} milestone(s) will be removed from the list.`,
        confirmLabel: 'Delete',
      },
      table: {
        bulk: { selectedCount: (count) => `${count} selected`, delete: 'Delete selected' },
        // toolbar는 columnPicker만 넘긴다 — csv·excel은 AdminTable 기본값이 그대로 남는다
        toolbar: { columnPicker: 'Columns' },
        row: { thumbnailAlt: (title) => `${title} cover`, thumbnailEmpty: 'No image' },
        pageSizeOption: (size) => `${size} per page`,
      },
    },
  },
  render: (args) => <HistoryListDemo {...args} initialRows={HISTORY} />,
}

/**
 * 등록 모달 — 헤더 [연혁 등록]을 누른 상태. 연도·제목이 필수(*)이고, 비운 채 저장을 누르면
 * 그 필드 아래 에러가 뜬다. 확인을 누르면 데모 래퍼가 새 행을 목록 맨 위에 추가한다.
 */
export const CreateOpen: Story = {
  render: (args) => <HistoryListCreateOpenDemo {...args} initialRows={HISTORY} />,
}

/**
 * 수정 모달 — 첫 행의 관리 컬럼 [수정]을 누른 상태. 연도·월·제목·설명·대표 이미지·노출이
 * 그 행의 값으로 채워져 있다. 확인을 누르면 데모 래퍼가 같은 id의 행을 갈아끼운다.
 */
export const EditOpen: Story = {
  render: (args) => <HistoryListEditOpenDemo {...args} initialRows={HISTORY} />,
}
