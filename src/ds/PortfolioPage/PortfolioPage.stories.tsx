import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import {
  PortfolioPage,
  type PortfolioCategory,
  type PortfolioItem,
  type PortfolioPageProps,
} from './PortfolioPage'

/** '전체' 탭 — 필터를 걸지 않는 값 */
const ALL = 'all'

const CATEGORIES: PortfolioCategory[] = [
  { label: '전체', value: ALL },
  { label: '조경', value: 'landscape' },
  { label: '조경설계', value: 'design' },
  { label: '조경식재', value: 'planting' },
  { label: '조경시설물', value: 'facility' },
  { label: '조경석 / 플랜트', value: 'stone' },
]

/** 상세 본문 목 — 에디터가 저장하는 HTML 형태 그대로 */
const BODY_HTML = `
<p>대지의 경사와 물길을 먼저 읽고, 그 위에 식재와 포장을 얹었습니다.
낮에는 볕이 드는 자리에 앉을 곳을 두고, 그늘이 지는 자리에는 관목을 심어 사계절 표정을 만들었습니다.</p>
<h3>설계 의도</h3>
<ul>
  <li>기존 수목은 <strong>이식 대신 보존</strong> — 뿌리 반경을 피해 동선을 냈습니다.</li>
  <li>디딤석은 보폭에 맞춰 600mm 간격, 자연석은 산지에서 직접 골랐습니다.</li>
  <li>배수는 자갈층으로 해결해 우수기에도 물이 고이지 않습니다.</li>
</ul>
<p>준공 1년 차 기준 하자 보수 없이 유지되고 있으며, 관리 인력은 월 1회로 줄었습니다.</p>
`.trim()

const GALLERY = [
  { url: mockImage('01', 'sage'), name: '전경' },
  { url: mockImage('02', 'sand'), name: '디딤석' },
  { url: mockImage('03', 'slate'), name: '수공간' },
  { url: mockImage('04', 'dusk'), name: '야간 조명' },
]

/** 목데이터 — 레이아웃 검증용이며 실제 프로젝트가 아니다. */
const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'p-01',
    title: '자연석 조경 자갈',
    category: 'design',
    year: '2025',
    place: '경기 남양주',
    summary: '천연 자연석 화분 및 실내 조경 장식재',
    thumbnail: mockImage('자연석', 'sage'),
    cover: mockImage('자연석', 'sage'),
    bodyHtml: BODY_HTML,
    gallery: GALLERY,
  },
  {
    id: 'p-02',
    title: '모던 테라스 정원',
    category: 'planting',
    year: '2025',
    place: '서울 성동구',
    summary: '자연의 아름다움을 공간에 담아내는 조경 전문가들입니다.',
    thumbnail: mockImage('테라스', 'sand'),
    bodyHtml: BODY_HTML,
    gallery: GALLERY,
  },
  {
    id: 'p-03',
    title: '스톤 워터 가든',
    category: 'facility',
    year: '2024',
    place: '경기 용인',
    summary: '현대적인 감각과 자연의 조화가 돋보이는 포트폴리오',
    thumbnail: mockImage('워터가든', 'slate'),
    bodyHtml: BODY_HTML,
    gallery: GALLERY.slice(0, 3),
  },
  {
    id: 'p-04',
    title: '인테리어 그린월',
    category: 'stone',
    year: '2024',
    place: '서울 강남구',
    summary: '실내 공간의 품격을 높이는 조경 장식재',
    thumbnail: mockImage('그린월', 'sage'),
    bodyHtml: BODY_HTML,
    gallery: GALLERY,
  },
  {
    id: 'p-05',
    title: '루프탑 가든 리뉴얼',
    category: 'landscape',
    year: '2024',
    place: '서울 영등포구',
    summary: '도시의 중심에서 자연의 평온함을 만나는 공간',
    thumbnail: mockImage('루프탑', 'dusk'),
    bodyHtml: BODY_HTML,
    gallery: GALLERY.slice(0, 2),
  },
  {
    id: 'p-06',
    title: '모던 제니스 정원',
    category: 'design',
    year: '2023',
    place: '경기 광주',
    summary: '심플함과 정교함이 공존하는 조경 공간',
    thumbnail: mockImage('제니스', 'sand'),
    bodyHtml: BODY_HTML,
    gallery: GALLERY,
  },
  {
    id: 'p-07',
    title: '중정 석가산 조성',
    category: 'stone',
    year: '2023',
    place: '충남 아산',
    summary: '산지에서 직접 고른 자연석으로 쌓은 중정 석가산',
    // 썸네일이 없으면 공용 Placeholder로 대체된다
    bodyHtml: BODY_HTML,
    gallery: GALLERY.slice(0, 2),
  },
  {
    id: 'p-08',
    title: '사옥 진입광장 식재',
    category: 'planting',
    year: '2023',
    place: '경기 성남',
    summary: '사계절 색이 바뀌는 관목으로 진입 동선을 잡았습니다.',
    thumbnail: mockImage('식재', 'sage'),
    bodyHtml: BODY_HTML,
    gallery: GALLERY,
  },
  {
    id: 'p-09',
    title: '공원 파고라 · 벤치 시공',
    category: 'facility',
    year: '2022',
    place: '인천 연수구',
    summary: '그늘과 앉을 자리를 함께 두어 체류 시간을 늘렸습니다.',
    thumbnail: mockImage('파고라', 'slate'),
    bodyHtml: BODY_HTML,
    gallery: GALLERY.slice(0, 3),
  },
]

const PAGE_SIZE = 6

/**
 * 스토리용 상태 컨테이너 — 컴포넌트 자체는 상태를 갖지 않으므로(모든 값은 props)
 * 카테고리 필터·페이지·상세 열기를 여기서 흉내 낸다.
 */
function PortfolioDemo(props: PortfolioPageProps) {
  const [category, setCategory] = useState(props.category)
  const [page, setPage] = useState(props.page ?? 1)
  const [selected, setSelected] = useState<PortfolioItem | null>(props.selected ?? null)

  const filtered =
    category === ALL ? props.items : props.items.filter((item) => item.category === category)

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <PortfolioPage
      {...props}
      items={paged}
      category={category}
      onCategoryChange={(value) => {
        setCategory(value)
        setPage(1)
      }}
      page={safePage}
      totalPages={totalPages}
      onPageChange={setPage}
      onOpen={setSelected}
      selected={selected}
      onClose={() => setSelected(null)}
    />
  )
}

const meta = {
  title: 'Site/PortfolioPage',
  component: PortfolioPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  args: {
    items: PORTFOLIO_ITEMS,
    categories: CATEGORIES,
    category: ALL,
    onCategoryChange: () => {},
    accent: 'success',
    title: (
      <>
        자연과 공간이 조화를 이루는 가치
        <br />
        전문적인 조경 솔루션을 제공합니다.
      </>
    ),
    subtitle:
      '우리는 자연의 아름다움을 공간에 담아내는 조경 전문가들입니다. 현대적인 감각과 자연의 조화가 돋보이는 포트폴리오를 소개합니다.',
    columns: 3,
    ratio: '4x3',
    showCategory: true,
    showSummary: true,
    loading: false,
  },
  argTypes: {
    accent: { control: 'inline-radio', options: ['primary', 'success'] },
    columns: { control: 'inline-radio', options: [2, 3, 4] },
    ratio: { control: 'select', options: ['4x3', '1x1', '3x2', '16x9', '3x4'] },
    showCategory: { control: 'boolean' },
    showSummary: { control: 'boolean' },
    loading: { control: 'boolean' },
    items: { control: false },
    categories: { control: false },
    selected: { control: false },
    title: { control: false },
    subtitle: { control: false },
  },
  render: (args) => <PortfolioDemo {...args} />,
} satisfies Meta<typeof PortfolioPage>

export default meta
type Story = StoryObj<typeof meta>

/** 목록 — 가운데 히어로 + pill 필터 + 3열 카드 + 원형 페이지네이션(레퍼런스). */
export const Default: Story = {}

/** 카드 텍스트 최소화 — 분류·요약을 끄면 제목만 남는다. */
export const TitleOnly: Story = {
  args: { showCategory: false, showSummary: false },
}

/** 4열 — 카드가 많을 때 밀도를 올린다. */
export const FourColumns: Story = {
  args: { columns: 4 },
}

/** 상세 — 대표 이미지 + 메타 + 본문 HTML + 갤러리(썸네일 클릭 시 라이트박스) + 이전/다음. */
export const Detail: Story = {
  args: {
    selected: PORTFOLIO_ITEMS[0],
  },
}

/** 결과 없음 — 공용 Placeholder(search)를 쓰는 EmptyState. */
export const Empty: Story = {
  args: {
    items: [],
    subtitle: '조건에 맞는 프로젝트가 아직 없습니다.',
  },
}

/** 로딩 — 카드 그리드와 같은 4:3 리듬의 스켈레톤. */
export const Loading: Story = {
  args: { loading: true },
}
