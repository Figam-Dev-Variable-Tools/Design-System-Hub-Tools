import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ChevronsUpDown } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { SearchPanel, type SearchFieldDef, type SearchPanelProps, type SearchValues } from './SearchPanel'

// ── 문의 목록 기준 13개 조건 ───────────────────────
const INQUIRY_FIELDS: SearchFieldDef[] = [
  { kind: 'text', key: 'keyword', label: '검색어', placeholder: '제목·내용으로 검색', span: 2 },
  { kind: 'text', key: 'inquiryNo', label: '문의번호', placeholder: 'INQ-0000' },
  { kind: 'text', key: 'orderNo', label: '주문번호', placeholder: 'ORD-0000' },
  { kind: 'text', key: 'product', label: '상품명', placeholder: '상품명 입력' },
  { kind: 'text', key: 'member', label: '회원명', placeholder: '회원명 입력' },
  { kind: 'text', key: 'author', label: '작성자', placeholder: '작성자 입력' },
  { kind: 'text', key: 'email', label: '이메일', placeholder: 'user@example.com' },
  { kind: 'text', key: 'phone', label: '휴대폰번호', placeholder: '010-0000-0000' },
  { kind: 'daterange', key: 'period', label: '기간', presets: ['today', '7d', '30d', '90d'], span: 2 },
  {
    kind: 'select',
    key: 'type',
    label: '문의유형',
    options: [
      { label: '상품 문의', value: 'product' },
      { label: '배송 문의', value: 'delivery' },
      { label: '교환/반품', value: 'return' },
      { label: '기타', value: 'etc' },
    ],
  },
  {
    kind: 'select',
    key: 'status',
    label: '처리상태',
    options: [
      { label: '접수', value: 'open' },
      { label: '처리중', value: 'progress' },
      { label: '답변완료', value: 'done' },
      { label: '보류', value: 'hold' },
    ],
  },
  {
    kind: 'select',
    key: 'manager',
    label: '담당자',
    options: [
      { label: '김하늘', value: 'kim' },
      { label: '이도윤', value: 'lee' },
      { label: '박서연', value: 'park' },
      { label: '미배정', value: 'none' },
    ],
  },
  {
    kind: 'select',
    key: 'visibility',
    label: '공개여부',
    options: [
      { label: '공개', value: 'public' },
      { label: '비공개', value: 'private' },
    ],
  },
]

const COMPACT_FIELDS: SearchFieldDef[] = [
  { kind: 'text', key: 'keyword', label: '검색어', placeholder: '제목·작성자로 검색' },
  {
    kind: 'select',
    key: 'status',
    label: '처리상태',
    options: [
      { label: '접수', value: 'open' },
      { label: '처리중', value: 'progress' },
      { label: '답변완료', value: 'done' },
    ],
  },
  { kind: 'daterange', key: 'period', label: '기간', presets: ['7d', '30d'] },
]

// 5가지 kind를 한 번에 확인하는 조합
const KIND_FIELDS: SearchFieldDef[] = [
  { kind: 'text', key: 'keyword', label: '검색어', placeholder: '텍스트' },
  { kind: 'number', key: 'amount', label: '주문금액(원)' },
  {
    kind: 'select',
    key: 'grade',
    label: '회원등급',
    options: [
      { label: 'VIP', value: 'vip' },
      { label: '일반', value: 'normal' },
    ],
  },
  {
    kind: 'multiselect',
    key: 'tags',
    label: '태그',
    options: [
      { label: '긴급', value: 'urgent' },
      { label: '재문의', value: 'again' },
      { label: 'VOC', value: 'voc' },
    ],
  },
  { kind: 'daterange', key: 'period', label: '기간', presets: ['today', '7d'], span: 2 },
]

// 필드 선언으로부터 빈 값 객체를 만든다 — 실제 화면에서도 이 패턴을 그대로 쓰면 된다
function emptyValues(fields: SearchFieldDef[]): SearchValues {
  const next: SearchValues = {}
  for (const field of fields) {
    if (field.kind === 'multiselect') next[field.key] = []
    else if (field.kind === 'daterange') next[field.key] = { start: null, end: null }
    else if (field.kind === 'select') next[field.key] = null
    else next[field.key] = ''
  }
  return next
}

// 값이 실제로 채워지는지 보이도록 로컬 state + 마지막 검색 payload를 함께 보여 준다
function SearchPanelDemo(props: SearchPanelProps) {
  const [values, setValues] = useState<SearchValues>(() => emptyValues(props.fields))
  const [applied, setApplied] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 1600 }}>
      <SearchPanel
        {...props}
        values={values}
        onChange={setValues}
        onSearch={() => setApplied(JSON.stringify(values))}
        onReset={() => setApplied(null)}
      />
      {applied != null && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'var(--ds-color-secondary)',
            fontFamily: 'var(--ds-font-family)',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          검색 실행: {applied}
        </p>
      )}
    </div>
  )
}

const meta = {
  title: 'Admin/SearchPanel',
  component: SearchPanel,
  tags: ['autodocs'],
  args: {
    fields: INQUIRY_FIELDS,
    values: {},
    onChange: () => {},
    columns: 4,
    collapsible: true,
    defaultCollapsed: false,
    loading: false,
    showLabels: true,
    showReset: true,
    showSearch: true,
    resetLabel: '초기화',
    searchLabel: '검색',
    searchingLabel: '검색 중…',
    expandLabel: '상세검색',
    collapseLabel: '상세검색 접기',
  },
  argTypes: {
    columns: { control: 'inline-radio', options: [2, 3, 4] },
    fields: { control: false },
    values: { control: false },
    onChange: { control: false },
    onSearch: { control: false },
    onReset: { control: false },
    actions: { control: false },
    showLabels: { control: 'boolean', description: '필드 라벨(끄면 aria-label로만 남는다)' },
    showReset: { control: 'boolean', description: '초기화 버튼' },
    showSearch: { control: 'boolean', description: '검색 버튼(즉시 조회 화면에서 끈다)' },
    collapseIcon: { control: false, description: '상세검색 토글 아이콘(기본 ChevronDown)' },
    resetLabel: { control: 'text' },
    searchLabel: { control: 'text' },
    searchingLabel: { control: 'text' },
    expandLabel: { control: 'text', description: "펼치기 라벨 — 뒤에 '(+N)'이 붙는다" },
    collapseLabel: { control: 'text' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof SearchPanel>

export default meta
type Story = StoryObj<typeof meta>

// 문의 목록의 13개 조건 전부 — 검색어/기간은 span 2로 병합해 4열 비율을 맞춘다
export const Default: Story = {
  render: (args) => <SearchPanelDemo {...args} />,
}

// 조건이 적은 목록 — 3열, 토글 없이 한 줄
export const Compact: Story = {
  args: {
    fields: COMPACT_FIELDS,
    columns: 3,
    collapsible: false,
  },
  render: (args) => <SearchPanelDemo {...args} />,
}

// 접힘 — 앞의 4개 필드만 노출, 나머지는 '상세검색'으로 펼친다
export const Collapsed: Story = {
  args: {
    defaultCollapsed: true,
  },
  render: (args) => <SearchPanelDemo {...args} />,
}

// 검색 중 — 조건 영역은 잠기고 버튼은 비활성
export const Loading: Story = {
  args: {
    loading: true,
    defaultCollapsed: true,
  },
  render: (args) => <SearchPanelDemo {...args} />,
}

// text/number/select/multiselect/daterange 5종 + span 병합
export const FieldKinds: Story = {
  args: {
    fields: KIND_FIELDS,
    columns: 3,
    collapsible: false,
  },
  render: (args) => <SearchPanelDemo {...args} />,
}

/**
 * 요소 토글 — 라벨/초기화/검색 버튼을 끈 즉시 조회형 간이 검색줄.
 * 라벨을 감춰도 각 셀은 aria-label로 조건 이름을 계속 들고 있어 스크린리더에서는 그대로 읽힌다.
 */
export const MinimalToggles: Story = {
  args: {
    fields: COMPACT_FIELDS,
    columns: 3,
    collapsible: false,
    showLabels: false,
    showReset: false,
    showSearch: false,
  },
  render: (args) => <SearchPanelDemo {...args} />,
}

/** 문구·아이콘 교체 — 화면 언어/아이콘 세트가 다른 제품에 맞춘다 */
export const CustomCopy: Story = {
  args: {
    defaultCollapsed: true,
    collapseIcon: <ChevronsUpDown size={16} />,
    resetLabel: '조건 지우기',
    searchLabel: '조회',
    searchingLabel: '조회 중…',
    expandLabel: '조건 더보기',
    collapseLabel: '조건 접기',
  },
  render: (args) => <SearchPanelDemo {...args} />,
}
