import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AlertTriangle } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from '../Button/Button'
import { TextField } from '../TextField/TextField'
import { CrudDialog, type CrudDialogProps } from './CrudDialog'

// 등록/수정 모달에 들어갈 상품 폼 예시
function ProductForm() {
  return (
    <>
      <TextField label="상품명" placeholder="상품명을 입력하세요" />
      <TextField label="카테고리" placeholder="예: 아우터" />
      <TextField label="가격" placeholder="예: 129000" />
    </>
  )
}

// 실제 팝업 동작 데모 — 버튼으로 열고 확인/취소로 닫는다
function CrudDialogDemo({ mode, inline = false, ...props }: CrudDialogProps) {
  const [open, setOpen] = useState(inline)
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState('')

  const handleConfirm = () => {
    // 저장 중 상태를 잠깐 보여준 뒤 닫는다
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setOpen(false)
      setLog(`${mode} 확인됨`)
    }, 600)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      {!inline && (
        <Button
          variant={mode === 'delete' ? 'error' : 'primary'}
          size="md"
          label={mode === 'delete' ? '삭제 팝업 열기' : mode === 'edit' ? '수정 팝업 열기' : '등록 팝업 열기'}
          onClick={() => setOpen(true)}
        />
      )}
      {log !== '' && (
        <span style={{ fontSize: 13, color: 'var(--ds-color-secondary)' }}>{log}</span>
      )}
      <CrudDialog
        {...props}
        mode={mode}
        open={open}
        inline={inline}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      >
        {mode !== 'delete' && <ProductForm />}
      </CrudDialog>
    </div>
  )
}

const meta = {
  title: 'Admin/CrudDialog',
  component: CrudDialog,
  tags: ['autodocs'],
  args: {
    open: true,
    mode: 'create',
    title: '상품 등록',
    description: '새 상품 정보를 입력하세요.',
    inline: true,
    loading: false,
    showWarning: true,
    showIcon: true,
    loadingLabel: '처리 중…',
    warningText: '삭제한 데이터는 되돌릴 수 없습니다.',
  },
  argTypes: {
    mode: { control: 'inline-radio', options: ['create', 'edit', 'delete'] },
    children: { control: false },
    onConfirm: { control: false },
    onCancel: { control: false },
    showWarning: { control: 'boolean', description: '삭제 경고 문구(delete 모드)' },
    showIcon: { control: 'boolean', description: '삭제 경고 아이콘(delete 모드)' },
    icon: { control: false, description: '경고 아이콘(기본 Placeholder kind="delete")' },
    loadingLabel: { control: 'text', description: '처리 중 확인 버튼 라벨(@deprecated — labels.loadingLabel)' },
    warningText: { control: 'text', description: '경고 문구(@deprecated — labels.warningText)' },
    labels: { control: false, description: '문구 통로 — 개별 prop(title·confirmLabel …)이 이긴다' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof CrudDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <CrudDialogDemo {...args} />,
}

// 삭제 확인 — danger 톤 + 되돌릴 수 없다는 경고
export const Delete: Story = {
  args: {
    mode: 'delete',
    title: '상품을 삭제할까요?',
    description: '‘겨울 울 코트’ 1건이 목록에서 제거됩니다.',
    confirmLabel: '삭제',
    inline: true,
  },
  render: (args) => <CrudDialogDemo {...args} />,
}

/**
 * 삭제 경고 커스터마이즈 — 휴지통으로 옮기는(복구 가능한) 삭제라면
 * '되돌릴 수 없다'가 거짓말이 되므로 경고를 끄거나 문구를 바꾼다.
 */
export const DeleteWarnings: Story = {
  args: { children: null },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ds-color-secondary)' }}>
          경고·아이콘 OFF — 복구 가능한 삭제
        </p>
        <CrudDialog
          open
          inline
          mode="delete"
          title="휴지통으로 옮길까요?"
          description="‘겨울 울 코트’ 1건이 휴지통으로 이동합니다. 30일 안에 복구할 수 있습니다."
          confirmLabel="휴지통으로"
          showWarning={false}
          showIcon={false}
        />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ds-color-secondary)' }}>
          아이콘·문구 교체
        </p>
        <CrudDialog
          open
          inline
          mode="delete"
          title="계정을 영구 삭제할까요?"
          description="주문 이력과 적립금이 함께 사라집니다."
          icon={<AlertTriangle size={24} />}
          warningText="영구 삭제는 취소할 수 없으며, 동일한 이메일로 재가입해도 복구되지 않습니다."
        />
      </div>
    </div>
  ),
}

/**
 * 문구 오버라이드 — 제목·설명·버튼·경고까지 labels 한 통로로 연다.
 * 개별 prop(title …)을 함께 넘기면 그쪽이 이기므로, 여기서는 labels만 넘긴다.
 */
export const Labels: Story = {
  args: { title: undefined, description: undefined, children: null },
  render: () => (
    <CrudDialog
      open
      inline
      mode="delete"
      labels={{
        title: 'Delete this product?',
        description: '‘Winter Wool Coat’ will be removed from the list.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        loadingLabel: 'Deleting…',
        warningText: 'Deleted data cannot be restored.',
      }}
    />
  ),
}

// 오버레이 팝업으로 실제 열고 닫기 (등록 · 수정 · 삭제)
export const AdminScenario: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <CrudDialogDemo
        open={false}
        mode="create"
        title="상품 등록"
        description="새 상품 정보를 입력하세요."
      />
      <CrudDialogDemo
        open={false}
        mode="edit"
        title="상품 수정"
        description="‘겨울 울 코트’ 정보를 수정합니다."
      />
      <CrudDialogDemo
        open={false}
        mode="delete"
        title="상품을 삭제할까요?"
        description="‘겨울 울 코트’ 1건이 목록에서 제거됩니다."
      />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ds-color-secondary)' }}>create</p>
        <CrudDialog open inline mode="create" title="상품 등록" description="새 상품 정보를 입력하세요.">
          <ProductForm />
        </CrudDialog>
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ds-color-secondary)' }}>edit · loading</p>
        <CrudDialog open inline loading mode="edit" title="상품 수정">
          <ProductForm />
        </CrudDialog>
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ds-color-secondary)' }}>delete</p>
        <CrudDialog
          open
          inline
          mode="delete"
          title="상품을 삭제할까요?"
          description="‘겨울 울 코트’ 1건이 목록에서 제거됩니다."
        />
      </div>
    </div>
  ),
}
