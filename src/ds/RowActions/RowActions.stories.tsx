import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Ban, Check, FileSearch } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { RowActions } from './RowActions'

const meta = {
  title: 'Admin/RowActions',
  component: RowActions,
  tags: ['autodocs'],
  args: {
    size: 'md',
    appearance: 'outline',
    onView: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    appearance: {
      control: 'inline-radio',
      options: ['outline', 'ghost'],
      description: '버튼 룩 — ghost는 보더·면을 지운다(배경색이 깔린 행 위)',
    },
    tones: { control: false, description: '액션별 톤 — 기본 delete만 danger' },
    labels: { control: false },
    onView: { control: false },
    onEdit: { control: false },
    onDelete: { control: false },
    viewIcon: { control: false, description: '상세보기 아이콘(기본 Eye)' },
    editIcon: { control: false, description: '수정 아이콘(기본 Pencil)' },
    deleteIcon: { control: false, description: '삭제 아이콘(기본 Trash2)' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof RowActions>

export default meta
type Story = StoryObj<typeof meta>

/** 눈=상세보기 · 연필=수정 · 휴지통=삭제(error 톤) */
export const Default: Story = {}

/** 크기 — sm(26px) / md(32px) / lg(40px) */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <RowActions {...args} size="sm" />
      <RowActions {...args} size="md" />
      <RowActions {...args} size="lg" />
    </div>
  ),
}

/**
 * 룩 — outline(기본)은 흰 면 + 1px 보더, ghost는 면·보더 없이 아이콘만.
 * 선택·강조로 배경색이 깔린 행에서는 흰 사각이 튀므로 ghost를 쓴다.
 */
export const Appearance: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: 'var(--ds-spacing-3)',
          background: 'var(--ds-color-bg)',
          border: 'var(--ds-border-width) solid var(--ds-color-border)',
          borderRadius: 'var(--ds-radius-md)',
        }}
      >
        <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>outline — 흰 행</span>
        <RowActions {...args} appearance="outline" />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: 'var(--ds-spacing-3)',
          background: 'color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-color-bg))',
          border: 'var(--ds-border-width) solid var(--ds-color-border)',
          borderRadius: 'var(--ds-radius-md)',
        }}
      >
        <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>ghost — 선택된 행</span>
        <RowActions {...args} appearance="ghost" />
      </div>
    </div>
  ),
}

/**
 * 톤 — 기본은 삭제만 danger다.
 * 아이콘만 바꾼 커스텀 액션(승인·차단)에 뜻에 맞는 색을 주려면 tones로 연다.
 */
export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row label="기본 — delete만 danger" node={<RowActions {...args} />} />
      <Row
        label="승인=success · 차단=danger"
        node={
          <RowActions
            onEdit={noop}
            onDelete={noop}
            labels={{ edit: '승인', delete: '차단' }}
            tones={{ edit: 'success', delete: 'danger' }}
            editIcon={<Check size={16} aria-hidden="true" />}
            deleteIcon={<Ban size={16} aria-hidden="true" />}
          />
        }
      />
      <Row
        label="보류=warning"
        node={
          <RowActions
            onEdit={noop}
            labels={{ edit: '보류' }}
            tones={{ edit: 'warning' }}
            editIcon={<Ban size={16} aria-hidden="true" />}
          />
        }
      />
    </div>
  ),
}

/**
 * 요소 단위 ON/OFF — 핸들러가 없는 버튼은 렌더되지 않는다.
 * 셋 다 없으면 래퍼조차 그리지 않는다(빈 자리 없음).
 */
export const PartialActions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row label="보기 + 수정 + 삭제" node={<RowActions onView={noop} onEdit={noop} onDelete={noop} />} />
      <Row label="보기만 (읽기 전용 목록)" node={<RowActions onView={noop} />} />
      <Row label="수정 + 삭제" node={<RowActions onEdit={noop} onDelete={noop} />} />
      <Row label="삭제만" node={<RowActions onDelete={noop} />} />
      <Row label="핸들러 없음 — 아무것도 렌더되지 않는다" node={<RowActions />} />
    </div>
  ),
}

/** labels로 행 대상을 넣어 접근성 이름을 구별한다 */
export const CustomLabels: Story = {
  args: {
    labels: { view: '홍길동 상세보기', edit: '홍길동 수정', delete: '홍길동 삭제' },
  },
}

/**
 * 문구 오버라이드 — 화면에 보이는 글자(툴팁)와 접근성 이름이 같은 통로(labels)로 열린다.
 * group은 묶음(role="group")의 이름이라 툴팁으로는 보이지 않는다.
 */
export const Labels: Story = {
  args: {
    labels: { group: 'Row actions', view: 'View', edit: 'Edit', delete: 'Delete' },
  },
}

/** 실사용: 표 행 우측 — 행 클릭(상세 이동)과 액션 클릭이 겹치지 않는다 */
export const InTableRow: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <TableDemo />,
}

const noop = () => {}

function Row({ label, node }: { label: string; node: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span
        style={{
          width: 240,
          fontSize: 'var(--ds-font-size-sm)',
          color: 'var(--ds-color-secondary-600)',
        }}
      >
        {label}
      </span>
      {node}
    </div>
  )
}

const MEMBERS = [
  { id: 1, name: '홍길동', type: '일반회원' },
  { id: 2, name: '김아티스트', type: '아티스트회원' },
  { id: 3, name: '이디자인', type: '아티스트회원' },
]

function TableDemo() {
  const [rows, setRows] = useState(MEMBERS)
  const [log, setLog] = useState('행을 클릭하거나 우측 액션을 눌러보세요.')

  return (
    <div style={{ padding: 'var(--ds-spacing-6)', background: 'var(--ds-color-bgSubtle)' }}>
      {/* 표는 좁아지면 래퍼가 가로 스크롤 */}
      <div
        style={{
          overflowX: 'auto',
          background: 'var(--ds-color-bg)',
          border: 'var(--ds-border-width) solid var(--ds-color-border)',
          borderRadius: 'var(--ds-radius-md)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setLog(`행 클릭 → ${row.name} 상세로 이동`)}
                style={{
                  cursor: 'pointer',
                  borderBottom: 'var(--ds-border-width) solid var(--ds-color-border)',
                }}
              >
                <td style={{ padding: 'var(--ds-spacing-3)', fontSize: 'var(--ds-font-size-sm)' }}>
                  {row.name}
                </td>
                <td
                  style={{
                    padding: 'var(--ds-spacing-3)',
                    fontSize: 'var(--ds-font-size-sm)',
                    color: 'var(--ds-color-secondary-600)',
                  }}
                >
                  {row.type}
                </td>
                <td style={{ padding: 'var(--ds-spacing-3)', textAlign: 'right' }}>
                  <RowActions
                    size="sm"
                    labels={{
                      view: `${row.name} 상세보기`,
                      edit: `${row.name} 수정`,
                      delete: `${row.name} 삭제`,
                    }}
                    onView={() => setLog(`상세보기 → ${row.name}`)}
                    onEdit={() => setLog(`수정 → ${row.name}`)}
                    onDelete={() => {
                      setRows((prev) => prev.filter((item) => item.id !== row.id))
                      setLog(`삭제 → ${row.name}`)
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        style={{
          marginTop: 'var(--ds-spacing-3)',
          fontSize: 'var(--ds-font-size-sm)',
          color: 'var(--ds-color-secondary-600)',
        }}
      >
        {log}
      </p>
    </div>
  )
}

/**
 * 아이콘 교체 — 행 액션의 뜻이 다를 때(승인/반려 목록 등).
 * 접근성 이름은 labels가 계속 갖는다 — 아이콘만 바뀌고 낭독 문구는 행을 특정한 그대로다.
 */
export const CustomIcons: Story = {
  render: (args) => (
    <RowActions
      {...args}
      labels={{ view: '내역 보기', edit: '승인', delete: '반려' }}
      viewIcon={<FileSearch size={16} aria-hidden="true" />}
      editIcon={<Check size={16} aria-hidden="true" />}
      deleteIcon={<Ban size={16} aria-hidden="true" />}
    />
  ),
}
