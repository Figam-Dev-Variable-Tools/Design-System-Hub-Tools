import type { MouseEvent, ReactNode } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Tooltip } from '../Tooltip/Tooltip'
import styles from './RowActions.module.css'

/**
 * RowActions — 목록 행 우측의 아이콘 액션 묶음.
 * 눈=상세보기 / 연필=수정 / 휴지통=삭제(error 톤).
 *
 * 요소 단위 ON/OFF: 핸들러를 넘긴 버튼만 렌더된다. 셋 다 없으면 아무것도 그리지 않는다
 * (빈 자리·여백이 남으면 안 된다).
 * 행 전체가 클릭 가능한 목록에서 쓰이므로 클릭은 행으로 전파하지 않는다.
 *
 * 아이콘 버튼을 Button으로 바꾸지 않는다 — Button은 label(보이는 글자)이 곧 접근성 이름이고
 * aria-label을 받지 않아, '홍길동 수정'처럼 행을 특정하는 이름(labels)을 줄 수 없다.
 * 여기서는 Tooltip이 감싼 <button aria-label>이 이름과 툴팁을 함께 준다.
 */
export type RowActionsLabels = {
  view?: string
  edit?: string
  delete?: string
}

export type RowActionsProps = {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  size?: 'sm' | 'md'
  /** 접근성 이름 겸 툴팁 문구 — 행 대상을 넣어 구별한다(예: '홍길동 수정') */
  labels?: RowActionsLabels
  /**
   * 아이콘 슬롯 — 기본은 lucide(Eye·Pencil·Trash2).
   * 행 액션의 뜻이 다를 때 갈아 끼운다(예: 수정 대신 '승인' → Check).
   * 크기(size 축)는 기본 아이콘에만 적용되므로, 넘길 땐 size에 맞춰(sm 14 / md 16) 만든다.
   */
  viewIcon?: ReactNode
  editIcon?: ReactNode
  deleteIcon?: ReactNode
}

export function RowActions({
  onView,
  onEdit,
  onDelete,
  size = 'md',
  labels,
  viewIcon,
  editIcon,
  deleteIcon,
}: RowActionsProps) {
  const viewLabel = labels?.view ?? '상세보기'
  const editLabel = labels?.edit ?? '수정'
  const deleteLabel = labels?.delete ?? '삭제'

  const iconSize = size === 'sm' ? 14 : 16

  // 셋 다 꺼져 있으면 래퍼조차 그리지 않는다
  if (onView == null && onEdit == null && onDelete == null) return null

  /** 아이콘 버튼 — Tooltip이 접근성 이름과 설명을 함께 준다 */
  const renderButton = (
    label: string,
    icon: ReactNode,
    onClick: () => void,
    extraClassName?: string,
  ) => (
    <Tooltip content={label}>
      <button
        type="button"
        className={[styles.button, styles[size], extraClassName].filter(Boolean).join(' ')}
        aria-label={label}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          // 행 클릭(상세 이동 등)과 겹치지 않게 전파를 끊는다
          event.stopPropagation()
          onClick()
        }}
      >
        {icon}
      </button>
    </Tooltip>
  )

  return (
    <span className={styles.root} role="group" aria-label="행 액션">
      {onView != null &&
        renderButton(viewLabel, viewIcon ?? <Eye size={iconSize} aria-hidden="true" />, onView)}

      {onEdit != null &&
        renderButton(editLabel, editIcon ?? <Pencil size={iconSize} aria-hidden="true" />, onEdit)}

      {onDelete != null &&
        renderButton(
          deleteLabel,
          deleteIcon ?? <Trash2 size={iconSize} aria-hidden="true" />,
          onDelete,
          styles.danger,
        )}
    </span>
  )
}
