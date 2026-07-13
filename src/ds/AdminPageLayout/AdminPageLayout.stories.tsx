import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Download, ListTree, Plus, Upload } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Placeholder } from '../../shared/placeholders'
import { AdminPageLayout } from './AdminPageLayout'
import { AdminTable, type AdminColumn } from '../AdminTable/AdminTable'
import { AdminGrid, AdminGridItem } from '../AdminGrid/AdminGrid'
import { ActivityLog, type ActivityItem } from '../ActivityLog/ActivityLog'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { CategoryTabs } from '../CategoryTabs/CategoryTabs'
import { CategoryTree, type CategoryNode } from '../CategoryTree/CategoryTree'
import { DefinitionList } from '../DefinitionList/DefinitionList'
import { FilterBar } from '../FilterBar/FilterBar'
import { FormAnchorNav } from '../FormAnchorNav/FormAnchorNav'
import { GroupPanel } from '../GroupPanel/GroupPanel'
import { InputBase } from '../InputBase/InputBase'
import { MobilePreview } from '../MobilePreview/MobilePreview'
import { PageSection } from '../PageContainer/PageContainer'
import { SearchPanel, type SearchFieldDef, type SearchValues } from '../SearchPanel/SearchPanel'
import { Textarea } from '../Textarea/Textarea'

const meta = {
  title: 'Admin/AdminPageLayout',
  component: AdminPageLayout,
  tags: ['autodocs'],
  args: {
    children: null,
    sideWidth: 240,
    asideWidth: 360,
    asideSticky: true,
    maxWidth: 'full',
    density: 'compact',
  },
  argTypes: {
    children: { control: false },
    headerActions: { control: false },
    tabs: { control: false },
    side: { control: false },
    toolbar: { control: false },
    aside: { control: false },
    footer: { control: false },
    // ON/OFF · 문구 — 기본값은 지금까지의 레이아웃 그대로다
    showSideToggle: { control: 'boolean' },
    sideOpenLabel: { control: 'text', description: '@deprecated labels.sideOpen' },
    sideCloseLabel: { control: 'text', description: '@deprecated labels.sideClose' },
    labels: { control: 'object', description: '문구 통로 — 개별 prop > labels.* > 기본값' },
    // 아이콘 슬롯 — ReactNode라 컨트롤로는 다루지 않는다(SideToggleVariants 스토리 참고)
    sideToggleIcon: { control: false },
    // 폭·여백·리듬 — PageContainer로 그대로 통과시키는 축
    maxWidth: { control: 'inline-radio', options: ['md', 'lg', 'full'] },
    padding: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md'],
      description: '드로어·모달 안에 넣으면 패딩 40이 두 번 먹는다 — none/sm으로 내린다',
    },
    gap: { control: 'inline-radio', options: ['md', 'lg'] },
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    footerSticky: {
      control: 'boolean',
      description: 'false면 액션 바가 본문 끝에 그대로 놓인다(sticky 해제)',
    },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof AdminPageLayout>

export default meta
type Story = StoryObj<typeof meta>

/* ────────────────────────────────────────────────────────────────────────────
 * 1) ListWithSidePanel — side(GroupPanel) + toolbar(SearchPanel) + content(AdminTable)
 * ──────────────────────────────────────────────────────────────────────────── */

type MemberRow = {
  id: string
  name: string
  email: string
  grade: string
  orders: number
  joinedAt: string
  active: boolean
}

const MEMBERS: MemberRow[] = [
  { id: 'm1', name: '김서준', email: 'seojun.kim@example.com', grade: 'VIP', orders: 42, joinedAt: '2025-11-02', active: true },
  { id: 'm2', name: '이하윤', email: 'hayoon.lee@example.com', grade: '일반', orders: 7, joinedAt: '2026-01-14', active: true },
  { id: 'm3', name: '박도현', email: 'dohyun.park@example.com', grade: '일반', orders: 3, joinedAt: '2026-02-08', active: false },
  { id: 'm4', name: '최지우', email: 'jiwoo.choi@example.com', grade: 'VIP', orders: 128, joinedAt: '2024-06-21', active: true },
  { id: 'm5', name: '정예린', email: 'yerin.jung@example.com', grade: '휴면', orders: 0, joinedAt: '2023-09-30', active: false },
  { id: 'm6', name: '강민준', email: 'minjun.kang@example.com', grade: '일반', orders: 19, joinedAt: '2025-04-17', active: true },
]

const MEMBER_GROUPS = [
  { key: 'all', label: '전체 사용자', count: 1284 },
  { key: 'vip', label: 'VIP', count: 64, group: '등급' },
  { key: 'normal', label: '일반', count: 1102, group: '등급' },
  { key: 'dormant', label: '휴면', count: 118, group: '등급' },
  { key: 'blocked', label: '차단', count: 12, group: '상태' },
  { key: 'withdrawn', label: '탈퇴', count: 88, group: '상태' },
]

const MEMBER_SEARCH_FIELDS: SearchFieldDef[] = [
  { kind: 'text', key: 'keyword', label: '검색어', placeholder: '이름 · 이메일' },
  {
    kind: 'select',
    key: 'grade',
    label: '등급',
    placeholder: '전체',
    options: [
      { label: 'VIP', value: 'vip' },
      { label: '일반', value: 'normal' },
      { label: '휴면', value: 'dormant' },
    ],
  },
  { kind: 'daterange', key: 'joined', label: '가입일', presets: ['7d', '30d', '90d'] },
  {
    kind: 'multiselect',
    key: 'channel',
    label: '가입 경로',
    options: [
      { label: '이메일', value: 'email' },
      { label: '카카오', value: 'kakao' },
      { label: '네이버', value: 'naver' },
    ],
  },
]

function ListWithSidePanelDemo() {
  const [group, setGroup] = useState('all')
  const [values, setValues] = useState<SearchValues>({
    keyword: '',
    grade: null,
    joined: { start: null, end: null },
    channel: [],
  })
  const [rows, setRows] = useState(MEMBERS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const columns: AdminColumn<MemberRow>[] = [
    { kind: 'select', key: 'select' },
    { kind: 'title', key: 'name', header: '이름', ratio: 2, onClick: () => {} },
    { kind: 'text', key: 'email', header: '이메일', ratio: 3 },
    { kind: 'badge', key: 'grade', header: '등급', tone: (row) => (row.grade === 'VIP' ? 'primary' : 'secondary') },
    { kind: 'number', key: 'orders', header: '주문', align: 'right' },
    { kind: 'date', key: 'joinedAt', header: '가입일' },
    { kind: 'status', key: 'active', header: '활성' },
    {
      kind: 'kebab',
      key: 'kebab',
      menu: (row) => [
        { key: 'edit', label: `${row.name} 수정`, onSelect: () => {} },
        { key: 'delete', label: '삭제', tone: 'error', divider: true, onSelect: () => {} },
      ],
    },
  ]

  return (
    <AdminPageLayout
      title="회원 관리"
      description="가입 회원을 그룹별로 조회하고 등급·활성 상태를 관리합니다."
      headerActions={
        <>
          <Button variant="secondary" size="md" appearance="outline" label="엑셀 다운로드" showLeftIcon leftIcon={<Download size={16} />} />
          <Button variant="primary" size="md" label="회원 등록" showLeftIcon leftIcon={<Plus size={16} />} />
        </>
      }
      side={<GroupPanel items={MEMBER_GROUPS} value={group} onChange={setGroup} onAdd={() => {}} width={240} />}
      toolbar={
        <SearchPanel
          fields={MEMBER_SEARCH_FIELDS}
          values={values}
          onChange={setValues}
          onSearch={() => {}}
          onReset={() => setValues({ keyword: '', grade: null, joined: { start: null, end: null }, channel: [] })}
        />
      }
    >
      <AdminTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onToggleStatus={(row, next) =>
          setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, active: next } : item)))
        }
        onBulkDelete={(ids) => {
          setRows((prev) => prev.filter((item) => !ids.includes(item.id)))
          setSelectedIds([])
        }}
        page={page}
        totalPages={5}
        onPageChange={setPage}
        pageSize={pageSize}
        pageSizeOptions={[20, 50, 100]}
        onPageSizeChange={setPageSize}
        columnPicker
        exportable
        exportFilename="members"
        // 레이아웃의 density(compact)와 표의 밀도를 맞춘다 — AdminTable은 CSS 변수가 아니라 자기 prop을 본다
        density="compact"
      />
    </AdminPageLayout>
  )
}

/** 좌측 그룹 패널로 좁히고, 상단 검색 패널로 조건을 걸고, 본문은 표 — 회원/운영진 목록 골격 */
export const ListWithSidePanel: Story = {
  render: () => <ListWithSidePanelDemo />,
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2) ListWithCategoryTree — tabs + side(CategoryTree) + toolbar + content
 * ──────────────────────────────────────────────────────────────────────────── */

type ProductRow = {
  id: string
  name: string
  code: string
  category: string
  price: number
  stock: number
  saleStatus: string
}

const PRODUCTS: ProductRow[] = [
  { id: 'p1', name: '베이직 코튼 티셔츠', code: 'TS-1001', category: '상의', price: 19000, stock: 132, saleStatus: 'onsale' },
  { id: 'p2', name: '워시드 데님 팬츠', code: 'DN-2042', category: '하의', price: 59000, stock: 0, saleStatus: 'soldout' },
  { id: 'p3', name: '오버핏 후드 집업', code: 'HD-3310', category: '아우터', price: 89000, stock: 41, saleStatus: 'onsale' },
  { id: 'p4', name: '리넨 오버셔츠', code: 'SH-1120', category: '상의', price: 45000, stock: 8, saleStatus: 'onsale' },
  { id: 'p5', name: '레더 크로스백', code: 'BG-7701', category: '가방', price: 128000, stock: 15, saleStatus: 'hidden' },
]

const SALE_OPTIONS = [
  { label: '판매중', value: 'onsale' },
  { label: '품절', value: 'soldout' },
  { label: '숨김', value: 'hidden' },
]

const CATEGORY_NODES: CategoryNode[] = [
  {
    key: 'all',
    label: '전체 카테고리',
    count: 1284,
    children: [
      { key: 'top', label: '상의', count: 412, children: [{ key: 'tee', label: '티셔츠', count: 180 }, { key: 'shirt', label: '셔츠', count: 96 }] },
      { key: 'bottom', label: '하의', count: 308 },
      { key: 'outer', label: '아우터', count: 214 },
      { key: 'bag', label: '가방', count: 122 },
    ],
  },
]

function ListWithCategoryTreeDemo() {
  const [tab, setTab] = useState('all')
  const [category, setCategory] = useState('top')
  const [keyword, setKeyword] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string | null>>({ brand: null })
  const [rows, setRows] = useState(PRODUCTS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const columns: AdminColumn<ProductRow>[] = [
    { kind: 'select', key: 'select' },
    {
      kind: 'thumbTitle',
      key: 'name',
      header: '상품',
      ratio: 3,
      subValue: (row) => row.code,
      tags: (row) => (row.stock === 0 ? [{ label: '품절', tone: 'error' as const }] : []),
      onClick: () => {},
    },
    { kind: 'category', key: 'category', header: '카테고리' },
    { kind: 'price', key: 'price', header: '판매가' },
    { kind: 'number', key: 'stock', header: '재고', align: 'right', tone: (row) => (row.stock === 0 ? 'error' : 'secondary') },
    {
      kind: 'selectCell',
      key: 'saleStatus',
      header: '판매상태',
      options: SALE_OPTIONS,
      onCellChange: (row, value) =>
        setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, saleStatus: value } : item))),
    },
    {
      kind: 'kebab',
      key: 'kebab',
      menu: () => [
        { key: 'copy', label: '복제', onSelect: () => {} },
        { key: 'delete', label: '삭제', tone: 'error', divider: true, onSelect: () => {} },
      ],
    },
  ]

  return (
    <AdminPageLayout
      title="상품 관리"
      headerActions={
        <>
          <Button variant="secondary" size="md" appearance="outline" label="일괄 등록" showLeftIcon leftIcon={<Upload size={16} />} />
          <Button variant="primary" size="md" label="상품 등록" showLeftIcon leftIcon={<Plus size={16} />} />
        </>
      }
      tabs={
        <CategoryTabs
          items={[
            { label: '전체', value: 'all', count: 1284, fixed: true },
            { label: '판매중', value: 'onsale', count: 1102 },
            { label: '품절', value: 'soldout', count: 96 },
            { label: '숨김', value: 'hidden', count: 86 },
          ]}
          value={tab}
          onChange={setTab}
          addable={false}
        />
      }
      side={<CategoryTree nodes={CATEGORY_NODES} value={category} onChange={setCategory} onAdd={() => {}} maxHeight={420} />}
      toolbar={
        <FilterBar
          searchValue={keyword}
          onSearchChange={setKeyword}
          searchPlaceholder="상품명 · 상품코드"
          filters={[
            {
              key: 'brand',
              label: '브랜드',
              options: [
                { label: '자사', value: 'own' },
                { label: '입점', value: 'partner' },
              ],
            },
          ]}
          filterValues={filterValues}
          onFilterChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
          onReset={() => {
            setKeyword('')
            setFilterValues({ brand: null })
          }}
        />
      }
    >
      <AdminTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        page={page}
        totalPages={12}
        onPageChange={setPage}
        exportable
        columnPicker
        density="compact"
      />
    </AdminPageLayout>
  )
}

/** 상태 탭 + 좌측 카테고리 트리 + 필터바 + 표 — 상품 목록 골격 */
export const ListWithCategoryTree: Story = {
  render: () => <ListWithCategoryTreeDemo />,
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3) FormWithPreview — side(FormAnchorNav) + content(폼 섹션) + aside(MobilePreview) + footer
 * ──────────────────────────────────────────────────────────────────────────── */

const FORM_SECTIONS = [
  { key: 'basic', label: '기본 정보' },
  { key: 'price', label: '판매 정보' },
  { key: 'media', label: '이미지', invalid: true },
  { key: 'detail', label: '상세 설명' },
]

function FormWithPreviewDemo() {
  const [active, setActive] = useState('basic')
  const [name, setName] = useState('베이직 코튼 티셔츠')
  const [price, setPrice] = useState('19000')
  const [summary, setSummary] = useState('부드러운 코튼 100% 원단으로 만든 데일리 티셔츠입니다.')

  // 스크롤 스파이는 사용처 책임 — 앵커 클릭 시 해당 섹션으로 이동시킨다
  const select = (key: string) => {
    setActive(key)
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <AdminPageLayout
      title="상품 등록"
      description="필수 항목을 채우면 우측 미리보기에 즉시 반영됩니다."
      side={<FormAnchorNav sections={FORM_SECTIONS} activeKey={active} onSelect={select} />}
      aside={
        <MobilePreview width={320}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)', padding: 'var(--ds-spacing-4)' }}>
            <Placeholder kind="image" size="fill" label="대표 이미지" />
            <span style={{ fontSize: 'var(--ds-font-size-md)', fontWeight: 'var(--ds-font-weight-bold)', color: 'var(--ds-color-text)' }}>
              {name}
            </span>
            <span style={{ fontSize: 'var(--ds-font-size-lg)', fontWeight: 'var(--ds-font-weight-bold)', color: 'var(--ds-color-primary)' }}>
              {Number(price || 0).toLocaleString()}원
            </span>
            <p style={{ margin: 0, fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>{summary}</p>
          </div>
        </MobilePreview>
      }
      footer={
        <>
          <Button variant="secondary" size="md" appearance="outline" label="취소" />
          <Button variant="secondary" size="md" label="임시 저장" />
          <Button variant="primary" size="md" label="저장" />
        </>
      }
    >
      <div id="basic">
        <PageSection title="기본 정보" description="상품명과 코드는 등록 후에도 수정할 수 있습니다.">
          <AdminGrid>
            <AdminGridItem span={6} spanMd={4} spanSm={4}>
              <InputBase label="상품명" value={name} onChange={setName} required />
            </AdminGridItem>
            <AdminGridItem span={6} spanMd={4} spanSm={4}>
              <InputBase label="상품 코드" value="TS-1001" onChange={() => {}} />
            </AdminGridItem>
          </AdminGrid>
        </PageSection>
      </div>

      <div id="price">
        <PageSection title="판매 정보">
          <AdminGrid>
            <AdminGridItem span={6} spanMd={4} spanSm={4}>
              <InputBase label="판매가" value={price} onChange={setPrice} inputMode="numeric" />
            </AdminGridItem>
            <AdminGridItem span={6} spanMd={4} spanSm={4}>
              <InputBase label="재고" value="132" onChange={() => {}} inputMode="numeric" />
            </AdminGridItem>
          </AdminGrid>
        </PageSection>
      </div>

      <div id="media">
        <PageSection title="이미지" description="대표 이미지는 필수입니다.">
          <Placeholder kind="image" size={64} label="대표 이미지를 등록하세요" />
        </PageSection>
      </div>

      <div id="detail">
        <PageSection title="상세 설명">
          <Textarea label="요약" value={summary} onChange={setSummary} rows={4} maxLength={200} showCounter />
        </PageSection>
      </div>
    </AdminPageLayout>
  )
}

/** 좌측 앵커 + 폼 섹션 + 우측 실시간 미리보기 + 하단 저장 바 — 상품 등록/수정 골격 */
export const FormWithPreview: Story = {
  render: () => <FormWithPreviewDemo />,
}

/* ────────────────────────────────────────────────────────────────────────────
 * 4) DetailWithAside — content(정보 블록) + aside(활동 정보) + footer
 * ──────────────────────────────────────────────────────────────────────────── */

const ACTIVITIES: ActivityItem[] = [
  { id: 'a1', type: 'order', actor: '김서준', action: '주문을 완료했어요', target: '#20260713-0042', at: '2026-07-13T09:12:00', unread: true },
  { id: 'a2', type: 'inquiry', actor: '김서준', action: '문의를 남겼어요', target: '배송 지연 문의', at: '2026-07-12T16:40:00' },
  { id: 'a3', type: 'member', actor: '관리자', action: '등급을 변경했어요', target: '일반 → VIP', at: '2026-07-10T11:05:00' },
  { id: 'a4', type: 'system', actor: '시스템', action: '비밀번호가 재설정되었어요', at: '2026-07-02T08:20:00' },
]

function DetailWithAsideDemo() {
  return (
    <AdminPageLayout
      title="김서준"
      description="VIP · 2025-11-02 가입"
      maxWidth="full"
      headerActions={<Button variant="secondary" size="md" appearance="outline" label="목록으로" />}
      aside={<ActivityLog items={ACTIVITIES} title="활동 정보" onViewAll={() => {}} compact />}
      footer={
        <>
          <Button variant="error" size="md" appearance="outline" label="회원 차단" />
          <Button variant="primary" size="md" label="저장" />
        </>
      }
    >
      <PageSection title="회원 정보">
        <DefinitionList
          columns={2}
          density="compact"
          items={[
            { label: '이름', value: '김서준' },
            { label: '등급', value: <Badge variant="primary" size="sm" label="VIP" /> },
            { label: '이메일', value: 'seojun.kim@example.com' },
            { label: '연락처', value: '010-1234-5678' },
            { label: '가입 경로', value: '카카오', hint: '2025-11-02 인증 완료' },
            { label: '상태', value: <Badge variant="success" size="sm" label="활성" /> },
          ]}
        />
      </PageSection>

      <PageSection title="주문 요약">
        <DefinitionList
          columns={2}
          density="compact"
          items={[
            { label: '총 주문', value: '42건' },
            { label: '총 결제액', value: '3,284,000원' },
            { label: '최근 주문', value: '2026-07-13' },
            { label: '취소/반품', value: '2건' },
          ]}
        />
      </PageSection>
    </AdminPageLayout>
  )
}

/** 본문 정보 블록 + 우측 활동 정보 + 하단 액션 바 — 상세 페이지 골격(side 없음) */
export const DetailWithAside: Story = {
  render: () => <DetailWithAsideDemo />,
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5) Bare — content만
 * ──────────────────────────────────────────────────────────────────────────── */

/** 슬롯을 비우면 그 영역이 완전히 사라진다 — 남는 빈 칸/여백 없음 */
export const Bare: Story = {
  args: {
    maxWidth: 'lg',
    children: (
      <PageSection title="본문만" description="header · tabs · side · toolbar · aside · footer를 모두 비운 상태입니다.">
        <p style={{ margin: 0, fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>
          children 하나만 렌더됩니다.
        </p>
      </PageSection>
    ),
  },
}

/* ────────────────────────────────────────────────────────────────────────────
 * 6) SideToggle — 좌측 패널 접기 버튼(1280 미만에서만 의미가 있다)
 * ──────────────────────────────────────────────────────────────────────────── */

/** 사이드 패널 자리 — 토글 스토리에서만 쓰는 가벼운 목업 */
function SideMock() {
  return (
    <PageSection title="카테고리" card>
      <p style={{ margin: 0, fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>
        전체 · 아우터 · 상의 · 하의
      </p>
    </PageSection>
  )
}

/**
 * 위: 아이콘/문구만 갈아끼운 기본 토글 — 동작은 그대로다.
 * 아래: showSideToggle=false — 접기 버튼 줄 자체가 사라진다(패널이 곧 내비게이션이라 늘 펼쳐 두는 화면).
 */
export const SideToggleVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <AdminPageLayout
        title="카테고리 관리"
        description="접기 버튼의 아이콘과 문구만 바꾼 형태 — 창을 1280 아래로 좁히면 나타난다."
        maxWidth="lg"
        side={<SideMock />}
        sideToggleIcon={<ListTree size={16} aria-hidden="true" />}
        sideOpenLabel="카테고리 열기"
        sideCloseLabel="카테고리 닫기"
      >
        <PageSection title="상품 목록" card>
          <p style={{ margin: 0, fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>
            본문
          </p>
        </PageSection>
      </AdminPageLayout>

      <AdminPageLayout
        title="카테고리 관리 (토글 없음)"
        description="showSideToggle=false — 좁은 화면에서도 접기 버튼 줄이 생기지 않는다."
        maxWidth="lg"
        side={<SideMock />}
        showSideToggle={false}
      >
        <PageSection title="상품 목록" card>
          <p style={{ margin: 0, fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>
            본문
          </p>
        </PageSection>
      </AdminPageLayout>
    </div>
  ),
}

/* ────────────────────────────────────────────────────────────────────────────
 * 7) Labels · 여백/리듬/footer 축
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * 문구 통로(labels) — 레이아웃이 그리는 문구는 좌측 패널 토글 버튼 하나뿐이다.
 * 개별 prop(sideOpenLabel/sideCloseLabel)은 그대로 살아 있고 labels보다 우선한다.
 * (창을 1280 아래로 좁히면 버튼이 나타난다)
 */
export const Labels: Story = {
  render: () => (
    <AdminPageLayout
      title="Category management"
      description="labels로 패널 토글 문구만 영문으로 바꾼다."
      maxWidth="lg"
      side={<SideMock />}
      labels={{ sideOpen: 'Open panel', sideClose: 'Close panel' }}
    >
      <PageSection title="Products" card>
        <p style={{ margin: 0, fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>
          본문
        </p>
      </PageSection>
    </AdminPageLayout>
  ),
}

/**
 * 드로어·탭 패널 안 — padding='sm' + gap='lg' + footerSticky=false.
 * padding이 md 고정이라 바깥이 이미 여백을 가진 자리에서 40이 두 번 먹었고,
 * footer가 항상 sticky라 AdminFormPage가 액션 바를 한 벌 더 그리고 있었다.
 */
export const PaddingAndFooter: Story = {
  render: () => (
    <div
      style={{
        width: 720,
        maxWidth: '100%',
        background: 'var(--ds-color-bg)',
        border: 'var(--ds-border-width) solid var(--ds-color-border)',
        borderRadius: 'var(--ds-radius-lg)',
      }}
    >
      <AdminPageLayout
        title="배송지 수정"
        description="드로어 안 — 여백 24, 액션 바는 sticky가 아니다."
        maxWidth="md"
        padding="sm"
        gap="lg"
        footerSticky={false}
        footer={
          <>
            <Button variant="secondary" appearance="outline" size="md" label="취소" />
            <Button variant="primary" size="md" label="저장" />
          </>
        }
      >
        <PageSection title="기본 정보" card>
          <p style={{ margin: 0, fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-secondary)' }}>
            폼 필드
          </p>
        </PageSection>
      </AdminPageLayout>
    </div>
  ),
}
