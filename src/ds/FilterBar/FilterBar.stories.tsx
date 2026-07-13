import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Download, Plus } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from '../Button/Button'
import { FilterBar, type FilterBarProps } from './FilterBar'

const DEMO_FILTERS = [
  {
    key: 'status',
    label: '상태',
    options: [
      { value: 'active', label: '활성' },
      { value: 'inactive', label: '비활성' },
      { value: 'pending', label: '대기' },
    ],
  },
  {
    key: 'role',
    label: '역할',
    options: [
      { value: 'admin', label: '관리자' },
      { value: 'manager', label: '매니저' },
      { value: 'member', label: '일반 회원' },
    ],
  },
]

// 컨트롤드 컴포넌트용 데모 — 선택된 필터를 칩으로 노출한다
function FilterBarDemo(props: FilterBarProps) {
  const [searchValue, setSearchValue] = useState(props.searchValue)
  const [filterValues, setFilterValues] = useState<Record<string, string | null>>(props.filterValues ?? {})
  const filters = props.filters ?? []
  const activeChips = filters.flatMap((filter) => {
    const selected = filter.options.find((option) => option.value === filterValues[filter.key])
    return selected ? [{ key: filter.key, label: `${filter.label}: ${selected.label}` }] : []
  })
  return (
    <FilterBar
      {...props}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
      activeChips={activeChips}
      onRemoveChip={(key) => setFilterValues((prev) => ({ ...prev, [key]: null }))}
      onReset={() => {
        setSearchValue('')
        setFilterValues({})
      }}
    />
  )
}

const meta = {
  title: 'Admin/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  args: {
    searchValue: '',
    searchPlaceholder: '이름, 이메일 검색',
    filters: DEMO_FILTERS,
    filterValues: {},
    appearance: 'plain',
  },
  argTypes: {
    onSearchChange: { control: false },
    onFilterChange: { control: false },
    onRemoveChip: { control: false },
    onReset: { control: false },
    activeChips: { control: false },
    actions: { control: false },
    appearance: {
      control: 'inline-radio',
      options: ['plain', 'card'],
      description: 'card는 흰 면 + 보더를 입힌다 — 페이지 배경 위에 홀로 놓일 때',
    },
    searchPlaceholder: { control: 'text', description: '@deprecated — labels.searchPlaceholder' },
    labels: { control: false, description: '검색 플레이스홀더 + 초기화 버튼 문구' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof FilterBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <FilterBarDemo {...args} />,
}

// 검색 + 필터 + 우측 액션 버튼 구성 — 어드민 목록 화면 표준 헤더
export const WithActions: Story = {
  render: (args) => (
    <FilterBarDemo
      {...args}
      searchPlaceholder="상품명 검색"
      actions={
        <>
          <Button
            variant="secondary"
            appearance="outline"
            size="sm"
            label="엑셀 다운로드"
            showIcon
            icon={<Download size={14} />}
          />
          <Button
            variant="primary"
            size="sm"
            label="상품 등록"
            showIcon
            icon={<Plus size={14} />}
          />
        </>
      }
    />
  ),
}

/**
 * 문구 오버라이드 — 그동안 '초기화'는 컴포넌트 안에 박혀 있었다(SearchPanel만 열려 있었다).
 * 이제 검색 플레이스홀더와 함께 labels 한 통로로 연다.
 */
export const Labels: Story = {
  args: { searchPlaceholder: undefined },
  render: (args) => (
    <FilterBarDemo
      {...args}
      labels={{ searchPlaceholder: 'Search by name or email', reset: 'Reset' }}
    />
  ),
}

/**
 * 크롬 — 기본은 배경·보더가 없다(카드 안에 놓는 화면들이 그렇게 쓴다).
 * 페이지 배경 위에 홀로 놓을 때만 card로 영역을 만든다.
 */
export const Card: Story = {
  render: (args) => <FilterBarDemo {...args} appearance="card" />,
}

/** 필터 폭 지정(width) — 옵션 라벨이 길면 넓혀 말줄임을 막는다 */
export const FilterWidth: Story = {
  render: (args) => (
    <FilterBarDemo
      {...args}
      filters={[
        { key: 'status', label: '상태', options: DEMO_FILTERS[0].options },
        {
          key: 'category',
          label: '아주 긴 카테고리 이름',
          options: [
            { value: 'a', label: '실내 조경용 관엽식물' },
            { value: 'b', label: '실외 조경용 자갈' },
          ],
          width: 220,
        },
      ]}
    />
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <FilterBar searchValue="" searchPlaceholder="이름, 이메일 검색" />
      <FilterBar searchValue="김토스" filters={DEMO_FILTERS} filterValues={{}} onReset={() => {}} />
      <FilterBar
        searchValue="김토스"
        filters={DEMO_FILTERS}
        filterValues={{ status: 'active', role: 'admin' }}
        activeChips={[
          { key: 'status', label: '상태: 활성' },
          { key: 'role', label: '역할: 관리자' },
        ]}
        onRemoveChip={() => {}}
        onReset={() => {}}
      />
    </div>
  ),
}
