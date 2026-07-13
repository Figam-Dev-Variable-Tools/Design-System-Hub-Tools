import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { Highlight } from '../Highlight/Highlight'
import { HistoryPage, type HistoryGroup } from './HistoryPage'

/**
 * 연혁 목데이터 — 연대(칸) 4개.
 * 실제 데이터가 아니라 레이아웃(칸 수 · 한 연대에 항목 2개 · 사진 유무) 검증용이다.
 */
const HISTORY_GROUPS: HistoryGroup[] = [
  {
    year: '2019',
    image: mockImage('2019', 'sage'),
    items: [{ month: '5월', title: '회사 설립 — 주식회사 태산 창립일자' }],
  },
  {
    year: '2021',
    image: mockImage('2021', 'sage'),
    items: [
      { month: '3월', title: '예비사회적기업 공식 지정' },
      { month: '4월', title: '여성기업 확인서 취득' },
    ],
  },
  {
    year: '2023',
    image: mockImage('2023', 'sage'),
    items: [{ month: '1월', title: '상호변경 — (주)태산으로 사명 변경' }],
  },
  {
    year: '2026',
    image: mockImage('2026', 'sage'),
    items: [{ month: '7월', title: '회사 홈페이지 리뉴얼' }],
  },
]

/** 히어로 서브카피 — 여러 줄 인사말이라 노드로 넘긴다(가운데 정렬·줄 수 제한 없음). */
const SUBTITLE = (
  <>
    주식회사 태산은 조경과 토목, 조경시설물 시공 분야의 전문 기업으로
    <br />
    자연과 사람이 조화를 이루는 공간을 만들어가기 위해 끊임없이 노력하고 있습니다.
    <br />
    단순한 조경을 넘어 공간의 목적과 환경을 고려한 설계와 시공으로
    <br />
    <br />
    도심 속에서도 자연의 가치를 느낄 수 있는 환경을 제공합니다.
    <br />
    축적된 현장 경험과 전문 기술력을 바탕으로 고객이 원하는 공간을 가장 완성도 높은 모습으로
    구현하며
    <br />
    계획부터 시공, 유지관리까지 책임 있는 서비스를 제공합니다.
  </>
)

const meta = {
  title: 'Site/HistoryPage',
  component: HistoryPage,
  tags: ['autodocs'],
  args: {
    groups: HISTORY_GROUPS,
    accent: 'success',
    // 강조어는 Highlight가 그린다 — 페이지가 색을 직접 만들지 않는다.
    title: (
      <>
        태산, <Highlight>자연</Highlight>의 가치를 공간에 담다.
      </>
    ),
    subtitle: SUBTITLE,
    eraSuffix: '년 대',
    columns: 4,
    ratio: '1x1',
    showImage: true,
    showDescription: true,
    showRail: true,
    loading: false,
  },
  argTypes: {
    accent: { control: 'inline-radio', options: ['primary', 'success'] },
    columns: { control: 'inline-radio', options: [2, 3, 4] },
    ratio: { control: 'select', options: ['1x1', '4x3', '3x2', '16x9', '3x4'] },
    showImage: { control: 'boolean' },
    showDescription: { control: 'boolean' },
    showRail: { control: 'boolean' },
    eraSuffix: { control: 'text' },
    // 정렬 축 — 기본(undefined)은 넘긴 배열 순서 그대로다
    order: {
      control: 'inline-radio',
      options: [undefined, 'asc', 'desc'],
      description: '연대 정렬(기본: 배열 순서 유지)',
    },
    labels: { control: 'object' },
    groups: { control: false },
    title: { control: false },
    subtitle: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof HistoryPage>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 레퍼런스 그대로(가운데 히어로 + 연대 4칸). */
export const Default: Story = {}

/** 사진 없이 — 연대 머리글과 항목만 남긴다(showImage=false). */
export const WithoutImages: Story = {
  args: { showImage: false },
}

/** 부연 설명까지 — 항목마다 description을 켠 경우. */
export const WithDescriptions: Story = {
  args: {
    groups: HISTORY_GROUPS.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        description: '현장 경험과 기술력을 쌓아 온 과정입니다.',
      })),
    })),
  },
}

/** 칸 수 — 연대가 적으면 3칸으로 줄여 여백을 줄인다. */
export const ThreeColumns: Story = {
  args: { columns: 3, groups: HISTORY_GROUPS.slice(0, 3) },
}

/** 강조색 primary — 헤드라인 강조어와 레일 점만 바뀐다. */
export const PrimaryAccent: Story = {
  args: { accent: 'primary' },
}

/** 로딩 — 연대 칸 골격만 */
export const Loading: Story = {
  args: { loading: true },
}

/** 빈 상태 — 공용 EmptyState */
export const Empty: Story = {
  args: { groups: [] },
}

/** 최신순 — 같은 데이터를 내림차순으로 세운다(기본은 배열 순서 그대로). */
export const NewestFirst: Story = {
  args: { order: 'desc' },
}

/**
 * Labels — 영문 오버라이드.
 * 연대 머리글 접미사(eraSuffix)와 항목 시점의 '년'(yearSuffix)이 모두 열려 있고,
 * 연·월을 잇는 방식 자체는 formatDate로 갈아끼운다('May 2021').
 *
 * 개별 prop(title·subtitle·eraSuffix)을 넘기지 않아야 labels가 지배한다 —
 * 그래서 meta의 args 대신 직접 렌더한다.
 */
export const Labels: Story = {
  render: () => (
    <HistoryPage
      groups={[
        { year: '2019', image: mockImage('2019', 'sage'), items: [{ month: 'May', title: 'Founded in Seoul' }] },
        {
          year: '2021',
          image: mockImage('2021', 'sage'),
          items: [
            { month: 'March', title: 'Certified as a pre-social enterprise' },
            { month: 'April', title: 'Women-owned business certification' },
          ],
        },
        { year: '2023', image: mockImage('2023', 'sage'), items: [{ month: 'January', title: 'Renamed to Taesan Inc.' }] },
        { year: '2026', image: mockImage('2026', 'sage'), items: [{ month: 'July', title: 'Website relaunch' }] },
      ]}
      labels={{
        title: (
          <>
            Taesan, bringing <Highlight>nature</Highlight> into space.
          </>
        ),
        subtitle: 'Landscape and civil engineering, from planning to maintenance.',
        eraSuffix: 's',
        yearSuffix: '',
        formatDate: ({ year, month }) => (month != null ? `${month} ${year}` : year),
        empty: { title: 'No history yet.', description: 'Milestones will appear here by era.' },
      }}
    />
  ),
}
