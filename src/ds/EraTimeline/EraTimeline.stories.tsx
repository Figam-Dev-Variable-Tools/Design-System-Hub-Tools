import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { EraTimeline, type EraGroup } from './EraTimeline'

const GROUPS: EraGroup[] = [
  {
    era: '2019년 대',
    image: mockImage('2019', 'sage'),
    entries: [{ date: '2019년 5월', title: '회사 설립 — 주식회사 태산 창립일자' }],
  },
  {
    era: '2021년 대',
    image: mockImage('2021', 'sage'),
    entries: [
      { date: '2021년 3월', title: '예비사회적기업 공식 지정' },
      { date: '2021년 4월', title: '여성기업 확인서 취득' },
    ],
  },
  {
    era: '2023년 대',
    image: mockImage('2023', 'sage'),
    entries: [{ date: '2023년 1월', title: '상호변경 — (주)태산으로 사명 변경' }],
  },
  {
    era: '2026년 대',
    image: mockImage('2026', 'sage'),
    entries: [{ date: '2026년 7월', title: '회사 홈페이지 리뉴얼' }],
  },
]

/**
 * 연대별 연혁 표기 — 연대 하나가 한 칸(열)이다.
 * 세로로 흐르는 Timeline과 다른 물건이라 별도 컴포넌트로 둔다(Timeline은 상태 축이 있고, 이건 없다).
 * HistoryPage가 이걸 그대로 쓴다.
 */
const meta = {
  title: 'Site/EraTimeline',
  component: EraTimeline,
  tags: ['autodocs'],
  args: {
    groups: GROUPS,
    columns: 4,
    ratio: '1x1',
    showImage: true,
    showDescription: true,
    showRail: true,
    accent: 'success',
  },
  argTypes: {
    columns: { control: 'inline-radio', options: [2, 3, 4] },
    ratio: { control: 'select', options: ['1x1', '4x3', '3x2', '16x9', '3x4'] },
    showImage: { control: 'boolean' },
    showDescription: { control: 'boolean' },
    showRail: { control: 'boolean' },
    accent: { control: 'inline-radio', options: ['primary', 'success'] },
    groups: { control: false },
  },
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof EraTimeline>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 4칸 · 정사각 사진 · 레일 ON */
export const Default: Story = {}

/** 사진 OFF — 머리글·레일·항목만 남는다(사진이 아직 없는 초기 데이터). */
export const WithoutImage: Story = {
  args: { showImage: false },
}

/** 레일 OFF — 점·가로선을 지운 담백한 표기. */
export const WithoutRail: Story = {
  args: { showRail: false },
}

/** 부연 설명 — entry.description이 있을 때만 그린다(showDescription=false면 감춘다). */
export const WithDescription: Story = {
  args: {
    groups: GROUPS.map((group) => ({
      ...group,
      entries: group.entries.map((entry) => ({
        ...entry,
        description: '설계·시공·유지관리까지 책임 있는 서비스를 제공합니다.',
      })),
    })),
  },
}

/** 2칸 — 연대가 적을 때 */
export const TwoColumns: Story = {
  args: { columns: 2, groups: GROUPS.slice(0, 2) },
}

/** 강조색 primary — 레일 점 색만 바뀐다. */
export const PrimaryAccent: Story = {
  args: { accent: 'primary' },
}
