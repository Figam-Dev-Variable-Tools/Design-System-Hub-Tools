import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Plus } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from '../Button/Button'
import { CategoryTabs } from '../CategoryTabs/CategoryTabs'
import { ListToolbar, type ListToolbarProps } from './ListToolbar'

const STATUS_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'active', label: '판매중' },
  { value: 'hidden', label: '숨김' },
  { value: 'soldout', label: '품절' },
]

const SORT_OPTIONS = [
  { value: 'order', label: '순번순' },
  { value: 'latest', label: '최신순' },
  { value: 'name', label: '이름순' },
]

const ROWS = [
  { id: 1, name: '자연석 조경 자갈', status: 'active' },
  { id: 2, name: '토분 화분 세트', status: 'hidden' },
  { id: 3, name: '실내 식물 성장 조명', status: 'active' },
  { id: 4, name: '원목 플랜트 선반', status: 'soldout' },
  { id: 5, name: '벽면 이끼 패널', status: 'active' },
]

/** 툴바는 제어 컴포넌트다 — 스토리가 상태를 쥐고 값을 내려준다. */
function Demo(props: ListToolbarProps) {
  const [status, setStatus] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState('order')

  // 실제로 걸러진 건수를 total로 내려 "N건"이 살아 있게 한다
  const total = useMemo(
    () =>
      ROWS.filter((row) => status === 'all' || row.status === status).filter((row) =>
        row.name.includes(keyword.trim()),
      ).length,
    [status, keyword],
  )

  return (
    <ListToolbar
      total={total}
      {...props}
      selects={
        props.selects ?? [
          { key: 'status', value: status, options: STATUS_OPTIONS, onChange: setStatus },
        ]
      }
      search={props.search ?? { value: keyword, onChange: setKeyword, placeholder: '검색' }}
      sort={props.sort ?? { value: sort, options: SORT_OPTIONS, onChange: setSort }}
    />
  )
}

const meta = {
  title: 'Admin/ListToolbar',
  component: ListToolbar,
  tags: ['autodocs'],
  args: {
    totalUnit: '건',
    showCount: true,
    searchPlaceholder: '검색어를 입력하세요',
  },
  argTypes: {
    selects: { control: false },
    search: { control: false },
    sort: { control: false },
    actions: { control: false },
    total: { control: 'number' },
    showCount: { control: 'boolean', description: '우측 총 건수 표시' },
    searchPlaceholder: {
      control: 'text',
      description: '검색 입력 기본 플레이스홀더(search.placeholder가 있으면 그쪽이 이긴다)',
    },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  // Select 패널이 열려도 캔버스에서 잘리지 않게 아래 여백을 둔다
  decorators: [
    (Story) => (
      <div style={{ paddingBottom: 260 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListToolbar>

export default meta
type Story = StoryObj<typeof meta>

/** 레퍼런스: "전체 상태 ▾ | 검색 ………… 순번순 ▾ | 2건" */
export const Default: Story = {
  render: (args) => <Demo {...args} />,
}

/** 검색만 — 필터·정렬 OFF. 꺼진 자리에 여백이 남지 않는다. */
export const SearchOnly: Story = {
  render: () => <SearchOnlyDemo />,
}

function SearchOnlyDemo() {
  const [keyword, setKeyword] = useState('')
  return (
    <ListToolbar
      search={{ value: keyword, onChange: setKeyword, placeholder: '회원명·연락처 검색' }}
      total={5}
    />
  )
}

/** 건수만 — 컨트롤 전부 OFF. 카드에 "5건"만 우측 정렬로 남는다. */
export const TotalOnly: Story = {
  render: () => <ListToolbar total={5} />,
}

/** 필터 여러 개 + 폭 지정(width) — 라벨이 긴 Select는 넓힌다. */
export const MultipleFilters: Story = {
  render: (args) => <MultiDemo {...args} />,
}

function MultiDemo(props: ListToolbarProps) {
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState('order')

  return (
    <ListToolbar
      {...props}
      selects={[
        { key: 'status', value: status, options: STATUS_OPTIONS, onChange: setStatus, width: 140 },
        {
          key: 'category',
          value: category,
          options: [
            { value: 'all', label: '전체 카테고리' },
            { value: 'plant', label: '식물' },
            { value: 'stone', label: '조경석' },
          ],
          onChange: setCategory,
          width: 170,
        },
      ]}
      search={{ value: keyword, onChange: setKeyword, placeholder: '검색' }}
      sort={{ value: sort, options: SORT_OPTIONS, onChange: setSort }}
      total={ROWS.length}
    />
  )
}

/** actions 슬롯 — 건수 오른쪽에 등록 버튼을 붙인다. */
export const WithActions: Story = {
  render: (args) => (
    <Demo
      {...args}
      actions={
        <Button
          variant="primary"
          size="sm"
          label="상품 등록"
          showLeftIcon
          leftIcon={<Plus size={16} />}
        />
      }
    />
  ),
}

/** 실사용: 상태 탭 + 툴바 — 어드민 목록 상단의 실제 조합. */
export const InListPage: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => <InListPageDemo {...args} />,
}

function InListPageDemo(props: ListToolbarProps) {
  const [tab, setTab] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState('order')

  const rows = ROWS.filter((row) => tab === 'all' || row.status === tab).filter((row) =>
    row.name.includes(keyword.trim()),
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-6)',
        background: 'var(--ds-color-bgSubtle)',
        minHeight: 480,
      }}
    >
      {/* 상태 탭은 CategoryTabs 재사용 — StatusTabs를 따로 만들지 않았다 */}
      <CategoryTabs
        items={[
          { value: 'all', label: '전체', count: ROWS.length },
          { value: 'active', label: '판매중', count: 3 },
          { value: 'hidden', label: '숨김', count: 1 },
          { value: 'soldout', label: '품절', count: 1 },
        ]}
        value={tab}
        onChange={setTab}
        addable={false}
      />

      <ListToolbar
        {...props}
        search={{ value: keyword, onChange: setKeyword, placeholder: '검색' }}
        sort={{ value: sort, options: SORT_OPTIONS, onChange: setSort }}
        total={rows.length}
      />

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        {rows.map((row) => (
          <li
            key={row.id}
            style={{
              padding: 'var(--ds-spacing-3)',
              background: 'var(--ds-color-bg)',
              border: 'var(--ds-border-width) solid var(--ds-color-border)',
              borderRadius: 'var(--ds-radius-md)',
              fontSize: 'var(--ds-font-size-sm)',
            }}
          >
            {row.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * 건수 OFF — 목록 하단 Pagination이 이미 건수를 말할 때 같은 숫자를 두 번 보여 주지 않는다.
 * total은 그대로 넘기고 표시만 멈춘다(집계는 다른 곳에서 계속 쓴다).
 * searchPlaceholder로 툴바 전체의 기본 검색 문구도 함께 갈아 끼운다.
 */
export const CountOff: Story = {
  render: function CountOffDemo() {
    const [keyword, setKeyword] = useState('')
    return (
      <ListToolbar
        search={{ value: keyword, onChange: setKeyword }}
        searchPlaceholder="회원명·연락처로 검색"
        total={5}
        showCount={false}
        actions={<Button variant="primary" size="sm" label="등록" showLeftIcon leftIcon={<Plus size={14} />} />}
      />
    )
  },
}
