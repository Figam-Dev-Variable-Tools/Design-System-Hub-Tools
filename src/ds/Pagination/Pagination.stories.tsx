import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Pagination } from './Pagination'

function PaginationDemo({
  totalPages,
  initialPage = 1,
  siblingCount,
  shape,
  align,
}: {
  totalPages: number
  initialPage?: number
  siblingCount?: number
  shape?: 'square' | 'circle'
  align?: 'start' | 'center' | 'end'
}) {
  const [page, setPage] = useState(initialPage)
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      onChange={setPage}
      siblingCount={siblingCount}
      shape={shape}
      align={align}
    />
  )
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
  },
  argTypes: {
    shape: { control: 'inline-radio', options: ['square', 'circle'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
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
  render: (args) => (
    <PaginationDemo
      totalPages={args.totalPages}
      siblingCount={args.siblingCount}
      shape={args.shape}
      align={args.align}
    />
  ),
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
