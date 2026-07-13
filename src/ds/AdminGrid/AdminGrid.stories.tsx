import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { AdminGrid, AdminGridItem } from './AdminGrid'

/** 그리드 셀 시각화용 더미 카드 — 토큰만 사용 */
function Cell({ label }: { label: string }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        minHeight: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--ds-spacing-4)',
        background: 'var(--ds-color-bg)',
        border: 'var(--ds-border-width) solid var(--ds-color-border)',
        borderRadius: 'var(--ds-radius-lg)',
        fontSize: 'var(--ds-font-size-sm)',
        fontWeight: 'var(--ds-font-weight-medium)',
        color: 'var(--ds-color-secondary)',
      }}
    >
      {label}
    </div>
  )
}

function Canvas({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        padding: 'var(--ds-spacing-6)',
        background: 'var(--ds-color-bgSubtle)',
        borderRadius: 'var(--ds-radius-lg)',
      }}
    >
      {children}
    </div>
  )
}

const meta = {
  title: 'Admin/AdminGrid',
  component: AdminGrid,
  tags: ['autodocs'],
  args: {
    columns: 12,
    gutter: 24,
    children: (
      <>
        {Array.from({ length: 12 }, (_, index) => (
          <AdminGridItem key={index} span={1} spanMd={1} spanSm={1}>
            <Cell label={`${index + 1}`} />
          </AdminGridItem>
        ))}
      </>
    ),
  },
  argTypes: {
    children: { control: false },
    columns: { control: { type: 'number', min: 1, max: 12 } },
    gutter: { control: { type: 'number', min: 0, max: 48, step: 4 } },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof AdminGrid>

export default meta
type Story = StoryObj<typeof meta>

/** 12컬럼 × gutter 24 — 1600 실사용 폭에서 컬럼 ≈ 111.3px */
export const Default: Story = {}

/** 상세 페이지 기본 조합 — 좌 8(본문) : 우 4(요약) */
export const Split84: Story = {
  args: {
    children: (
      <>
        <AdminGridItem span={8}>
          <Cell label="span=8 — 본문" />
        </AdminGridItem>
        <AdminGridItem span={4}>
          <Cell label="span=4 — 요약" />
        </AdminGridItem>
      </>
    ),
  },
}

/** 배치 예시 모음 — 12 / 8:4 / 6:6 / 4×3(3분할) / 3×4(4분할) */
export const States: Story = {
  render: () => (
    <Canvas>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <AdminGrid>
          <AdminGridItem span={12}>
            <Cell label="12 — 전체 폭" />
          </AdminGridItem>
        </AdminGrid>

        <AdminGrid>
          <AdminGridItem span={8}>
            <Cell label="8 — 본문" />
          </AdminGridItem>
          <AdminGridItem span={4}>
            <Cell label="4 — 사이드" />
          </AdminGridItem>
        </AdminGrid>

        <AdminGrid>
          <AdminGridItem span={6}>
            <Cell label="6" />
          </AdminGridItem>
          <AdminGridItem span={6}>
            <Cell label="6" />
          </AdminGridItem>
        </AdminGrid>

        {/* 3분할 — span 4 × 3 */}
        <AdminGrid>
          {Array.from({ length: 3 }, (_, index) => (
            <AdminGridItem key={index} span={4} spanMd={4} spanSm={4}>
              <Cell label="4" />
            </AdminGridItem>
          ))}
        </AdminGrid>

        {/* 4분할 — span 3 × 4 */}
        <AdminGrid>
          {Array.from({ length: 4 }, (_, index) => (
            <AdminGridItem key={index} span={3} spanMd={2} spanSm={2}>
              <Cell label="3" />
            </AdminGridItem>
          ))}
        </AdminGrid>
      </div>
    </Canvas>
  ),
}
