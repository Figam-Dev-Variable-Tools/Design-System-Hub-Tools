import type { ReactNode } from 'react'
import { Placeholder } from '../../shared/placeholders'
import styles from './CrudDialog.module.css'
import { Modal } from '../Modal/Modal'
import { Button } from '../Button/Button'

export type CrudDialogProps = {
  open: boolean
  /** delete는 danger 스타일(경고 아이콘 + 빨강 확인 버튼), create/edit는 children 폼 모달 */
  mode: 'create' | 'edit' | 'delete'
  title?: string
  description?: string
  /** create/edit 폼 본문 */
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  /** 처리 중 — 버튼 비활성 + 확인 라벨을 '처리 중…'으로 */
  loading?: boolean
  /** 문서/데모용 인라인 렌더 — fixed 오버레이 없이 정적 배치 */
  inline?: boolean
  /**
   * 삭제 경고 문구 (기본 true).
   * 휴지통으로 옮기는(복구 가능한) 삭제라면 "되돌릴 수 없다"가 거짓말이 되므로 끈다.
   */
  showWarning?: boolean
  /**
   * 삭제 경고 아이콘 (기본 true).
   * 문구만으로 충분한 조용한 확인창(1건 삭제 등)에서는 그림을 뺀다.
   */
  showIcon?: boolean
  /** 경고 아이콘 — 기본 공용 Placeholder(kind="delete") */
  icon?: ReactNode
  /** 처리 중 확인 버튼 라벨 (기본 '처리 중…') */
  loadingLabel?: string
  /** 경고 문구 (기본 '삭제한 데이터는 되돌릴 수 없습니다.') */
  warningText?: string
}

// 모드별 기본 문구
const DEFAULT_TITLE: Record<CrudDialogProps['mode'], string> = {
  create: '등록',
  edit: '수정',
  delete: '삭제할까요?',
}

const DEFAULT_CONFIRM: Record<CrudDialogProps['mode'], string> = {
  create: '등록',
  edit: '저장',
  delete: '삭제',
}

/**
 * CRUD 확인/폼 모달.
 *
 * delete 분기를 Dialog(variant="confirm" danger)로 대체하지 않는다 —
 * Dialog는 제목/설명/버튼만 있는 고정 규격이라 이 컴포넌트의 축(처리 중 비활성·경고 아이콘 슬롯·
 * 경고 문구 토글)을 표현할 수 없다. 대신 오버레이·포커스·크기 규격은 Modal에 맡기고,
 * 버튼은 Button을 쓴다 — 새로 만드는 것은 본문 배치뿐이다.
 */
export function CrudDialog({
  open,
  mode,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  loading = false,
  inline = false,
  showWarning = true,
  showIcon = true,
  icon,
  loadingLabel = '처리 중…',
  warningText = '삭제한 데이터는 되돌릴 수 없습니다.',
}: CrudDialogProps) {
  const isDelete = mode === 'delete'
  const resolvedTitle = title ?? DEFAULT_TITLE[mode]
  const resolvedConfirm = confirmLabel ?? DEFAULT_CONFIRM[mode]

  const footer = (
    <div className={styles.actions}>
      <Button
        variant="secondary"
        size="md"
        label={cancelLabel}
        disabled={loading}
        onClick={onCancel}
      />
      <Button
        variant={isDelete ? 'error' : 'primary'}
        size="md"
        label={loading ? loadingLabel : resolvedConfirm}
        disabled={loading}
        onClick={onConfirm}
      />
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={resolvedTitle}
      size={isDelete ? 'sm' : 'md'}
      footer={footer}
      inline={inline}
    >
      {isDelete ? (
        <div className={styles.danger}>
          {/* 팝업/모달의 경고 그림도 저장소 공용 플레이스홀더로 통일 */}
          {showIcon && (
            <span className={styles.dangerIcon} aria-hidden="true">
              {icon ?? <Placeholder kind="delete" size={24} />}
            </span>
          )}
          <div className={styles.dangerText}>
            {description != null && <p className={styles.description}>{description}</p>}
            {showWarning && <p className={styles.warning}>{warningText}</p>}
          </div>
        </div>
      ) : (
        <div className={styles.form}>
          {description != null && <p className={styles.description}>{description}</p>}
          {children}
        </div>
      )}
    </Modal>
  )
}
