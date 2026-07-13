import type { ReactNode } from 'react'
import { Placeholder } from '../../shared/placeholders'
import { mergeLabels, resolveLabel, type ConfirmDialogLabels } from '../../shared/labels'
import styles from './CrudDialog.module.css'
import { Modal } from '../Modal/Modal'
import { Button } from '../Button/Button'

export type CrudDialogMode = 'create' | 'edit' | 'delete'

/**
 * 확인창 문구 — 공용 ConfirmDialogLabels에 이 확인창만 갖는 문구(처리 중·경고)를 얹는다.
 *
 * description을 다시 선언하는 이유: 공용 타입은 함수형(`(ids) => …`)을 허용하지만
 * CrudDialog는 대상 id를 모른다(삭제 대상은 부모가 안다) — 여기서는 문자열만 받는다.
 */
export type CrudDialogLabels = Omit<ConfirmDialogLabels, 'description'> & {
  description?: string
  /** 처리 중 확인 버튼 (기본 '처리 중…') */
  loadingLabel?: string
  /** 삭제 경고 (기본 '삭제한 데이터는 되돌릴 수 없습니다.') */
  warningText?: string
}

/** 모드와 무관한 기본 문구. 제목·확인은 모드마다 달라 여기 둘 수 없다(DEFAULT_TITLE·DEFAULT_CONFIRM). */
export const DEFAULT_CRUD_DIALOG_LABELS: CrudDialogLabels & {
  cancelLabel: string
  loadingLabel: string
  warningText: string
} = {
  cancelLabel: '취소',
  loadingLabel: '처리 중…',
  warningText: '삭제한 데이터는 되돌릴 수 없습니다.',
}

// 모드별 기본 문구
const DEFAULT_TITLE: Record<CrudDialogMode, string> = {
  create: '등록',
  edit: '수정',
  delete: '삭제할까요?',
}

const DEFAULT_CONFIRM: Record<CrudDialogMode, string> = {
  create: '등록',
  edit: '저장',
  delete: '삭제',
}

export type CrudDialogProps = {
  open: boolean
  /** delete는 danger 스타일(경고 아이콘 + 빨강 확인 버튼), create/edit는 children 폼 모달 */
  mode: CrudDialogMode
  /** @deprecated labels.title을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  title?: string
  /** @deprecated labels.description을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  description?: string
  /** create/edit 폼 본문 */
  children?: ReactNode
  /** @deprecated labels.confirmLabel을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  confirmLabel?: string
  /** @deprecated labels.cancelLabel을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
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
  /** @deprecated labels.loadingLabel을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  loadingLabel?: string
  /** @deprecated labels.warningText를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  warningText?: string
  /** 문구 — 개별 prop(title·confirmLabel …)이 있으면 그쪽이 이긴다 */
  labels?: CrudDialogLabels
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
  cancelLabel,
  onConfirm,
  onCancel,
  loading = false,
  inline = false,
  showWarning = true,
  showIcon = true,
  icon,
  loadingLabel,
  warningText,
  labels,
}: CrudDialogProps) {
  const L = mergeLabels(DEFAULT_CRUD_DIALOG_LABELS, labels)
  const D = DEFAULT_CRUD_DIALOG_LABELS

  const isDelete = mode === 'delete'
  // 제목·확인 버튼의 기본값은 모드가 정한다 — labels로 덮으면 현재 모드의 문구만 바뀐다
  const resolvedTitle = resolveLabel(title, L.title) ?? DEFAULT_TITLE[mode]
  const resolvedConfirm = resolveLabel(confirmLabel, L.confirmLabel) ?? DEFAULT_CONFIRM[mode]
  const resolvedCancel = resolveLabel(cancelLabel, L.cancelLabel) ?? D.cancelLabel
  const resolvedLoading = resolveLabel(loadingLabel, L.loadingLabel) ?? D.loadingLabel
  const resolvedWarning = resolveLabel(warningText, L.warningText) ?? D.warningText
  const resolvedDescription = resolveLabel(description, L.description)

  const footer = (
    <div className={styles.actions}>
      <Button
        variant="secondary"
        size="md"
        label={resolvedCancel}
        disabled={loading}
        onClick={onCancel}
      />
      <Button
        variant={isDelete ? 'error' : 'primary'}
        size="md"
        label={loading ? resolvedLoading : resolvedConfirm}
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
            {resolvedDescription != null && (
              <p className={styles.description}>{resolvedDescription}</p>
            )}
            {showWarning && <p className={styles.warning}>{resolvedWarning}</p>}
          </div>
        </div>
      ) : (
        <div className={styles.form}>
          {resolvedDescription != null && (
            <p className={styles.description}>{resolvedDescription}</p>
          )}
          {children}
        </div>
      )}
    </Modal>
  )
}
