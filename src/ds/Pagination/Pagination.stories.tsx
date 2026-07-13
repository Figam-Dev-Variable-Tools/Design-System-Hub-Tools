import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Pagination, type PaginationProps } from './Pagination'

/** 페이지 상태를 들고 있는 데모 래퍼 — 표시 축(shape·align·size …)은 그대로 흘려보낸다 */
function PaginationDemo({
  totalPages,
  initialPage = 1,
  ...rest
}: Omit<PaginationProps, 'page' | 'onChange'> & { initialPage?: number }) {
  const [page, setPage] = useState(initialPage)
  return <Pagination {...rest} totalPages={totalPages} page={page} onChange={setPage} />
}

const meta = {
  title: '3. 컴포넌트/Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {
    page: 1,
    totalPages: 10,
    siblingCount: 1,
    shape: 'square',
    align: 'start',
    size: 'md',
    showFirstLast: false,
  },
  argTypes: {
    shape: { control: 'inline-radio', options: ['square', 'circle'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'md는 기존 치수(square 32px / circle 36px)',
    },
    showFirstLast: { control: 'boolean', description: '처음·끝 이동 버튼' },
    labels: { control: false, description: '접근성 이름 + 생략기호' },
    page: { control: false },
    onChange: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: ({ page: _page, onChange: _onChange, ...args }) => <PaginationDemo {...args} />,
}

export const ManyPages: Story = {
  render: () => <PaginationDemo totalPages={24} initialPage={12} />,
}

export const FewPages: Story = {
  render: () => <PaginationDemo totalPages={3} />,
}

/**
 * 원형 + 가운데 — 사이트 목록(포트폴리오·쇼핑) 하단 룩.
 * 현재 페이지의 면 색은 SiteSection이 내려주는 강조색을 따르고, 섹션 밖이면 primary로 폴백한다.
 */
export const CircleCentered: Story = {
  render: () => <PaginationDemo totalPages={3} shape="circle" align="center" />,
}

/** 크기 — sm(compact 표 하단) / md(기본) / lg(사이트 목록 하단) */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PaginationDemo totalPages={10} initialPage={3} size="sm" />
      <PaginationDemo totalPages={10} initialPage={3} size="md" />
      <PaginationDemo totalPages={10} initialPage={3} size="lg" />
    </div>
  ),
}

/** 처음·끝 이동 — 페이지가 수십 개일 때 마지막으로 한 번에 간다 */
export const FirstLast: Story = {
  render: () => <PaginationDemo totalPages={48} initialPage={20} showFirstLast />,
}

/**
 * 문구 오버라이드 — 화면에 보이는 글자는 숫자와 생략기호뿐이고, 나머지는 전부 접근성 이름이다.
 * 숫자 버튼도 이름을 갖는다('3' → 'Page 3').
 */
export const Labels: Story = {
  render: () => (
    <PaginationDemo
      totalPages={24}
      initialPage={12}
      showFirstLast
      labels={{
        nav: 'Pagination',
        first: 'First page',
        prev: 'Previous page',
        next: 'Next page',
        last: 'Last page',
        page: (p) => `Page ${p}`,
        ellipsis: '...',
      }}
    />
  ),
}
