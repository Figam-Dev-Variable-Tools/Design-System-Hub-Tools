import type { MouseEvent, ReactNode } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { mergeLabels, type RowActionsLabels } from '../../shared/labels'
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

/**
 * 문구 타입은 공용(src/shared/labels.ts)이 단일 출처다 — 여기서 재선언하지 않고 그대로 다시 내보낸다.
 * (이 이름은 원래 이 파일에서 export 되던 것이라 import 경로를 깨지 않으려고 남긴다.)
 */
export type { RowActionsLabels }

/** 액션 식별자 — tones/labels가 같은 키 집합을 쓴다 */
export type RowActionKey = 'view' | 'edit' | 'delete'

/** 액션 하나의 톤. danger가 delete에만 박혀 있어 '승인=success' 같은 커스텀 액션을 칠할 수 없었다. */
export type RowActionTone = 'default' | 'success' | 'warning' | 'danger'

export const DEFAULT_ROW_ACTIONS_LABELS: Required<RowActionsLabels> = {
  group: '행 액션',
  view: '상세보기',
  edit: '수정',
  delete: '삭제',
}

/** 톤 기본값 — 삭제는 지금까지도 error 톤이었다(기본 렌더 불변) */
const DEFAULT_TONES: Record<RowActionKey, RowActionTone> = {
  view: 'default',
  edit: 'default',
  delete: 'danger',
}

/** 톤 → CSS 클래스. default는 기본 스타일이라 얹을 클래스가 없다. */
const TONE_CLASS: Record<RowActionTone, string | undefined> = {
  default: undefined,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
}

export type RowActionsProps = {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  size?: 'sm' | 'md' | 'lg'
  /**
   * 버튼 룩 (기본 outline — 1px 보더 + 흰 면).
   * ghost는 보더·면을 지운다 — 선택/강조로 배경색이 깔린 행 위에서 흰 사각이 튀지 않게.
   */
  appearance?: 'outline' | 'ghost'
  /** 접근성 이름 겸 툴팁 문구 — 행 대상을 넣어 구별한다(예: '홍길동 수정') */
  labels?: RowActionsLabels
  /**
   * 액션별 톤 (기본 delete만 danger).
   * 아이콘만 바꾼 커스텀 액션(승인=success, 차단=danger)에 뜻에 맞는 색을 준다.
   */
  tones?: Partial<Record<RowActionKey, RowActionTone>>
  /**
   * 아이콘 슬롯 — 기본은 lucide(Eye·Pencil·Trash2).
   * 행 액션의 뜻이 다를 때 갈아 끼운다(예: 수정 대신 '승인' → Check).
   * 크기(size 축)는 기본 아이콘에만 적용되므로, 넘길 땐 size에 맞춰(sm 14 / md 16 / lg 18) 만든다.
   */
  viewIcon?: ReactNode
  editIcon?: ReactNode
  deleteIcon?: ReactNode
}

/** 크기별 기본 아이콘 px — 버튼 정사각(26/32/40)과 시각 비율을 맞춘 값 */
const ICON_SIZE: Record<NonNullable<RowActionsProps['size']>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
}

export function RowActions({
  onView,
  onEdit,
  onDelete,
  size = 'md',
  appearance = 'outline',
  labels,
  tones,
  viewIcon,
  editIcon,
  deleteIcon,
}: RowActionsProps) {
  const L = mergeLabels(DEFAULT_ROW_ACTIONS_LABELS, labels)
  const tone = { ...DEFAULT_TONES, ...stripUndefinedTones(tones) }

  const iconSize = ICON_SIZE[size]

  // 셋 다 꺼져 있으면 래퍼조차 그리지 않는다
  if (onView == null && onEdit == null && onDelete == null) return null

  /** 아이콘 버튼 — Tooltip이 접근성 이름과 설명을 함께 준다 */
  const renderButton = (key: RowActionKey, label: string, icon: ReactNode, onClick: () => void) => (
    <Tooltip content={label}>
      <button
        type="button"
        className={[styles.button, styles[size], styles[appearance], TONE_CLASS[tone[key]]]
          .filter(Boolean)
          .join(' ')}
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
    <span className={styles.root} role="group" aria-label={L.group}>
      {onView != null &&
        renderButton('view', L.view, viewIcon ?? <Eye size={iconSize} aria-hidden="true" />, onView)}

      {onEdit != null &&
        renderButton(
          'edit',
          L.edit,
          editIcon ?? <Pencil size={iconSize} aria-hidden="true" />,
          onEdit,
        )}

      {onDelete != null &&
        renderButton(
          'delete',
          L.delete,
          deleteIcon ?? <Trash2 size={iconSize} aria-hidden="true" />,
          onDelete,
        )}
    </span>
  )
}

/** tones={{ delete: undefined }} 하나가 기본 danger를 지우면 안 된다 — naive spread 방지 */
function stripUndefinedTones(
  source?: Partial<Record<RowActionKey, RowActionTone>>,
): Partial<Record<RowActionKey, RowActionTone>> {
  if (source == null) return {}
  const out: Partial<Record<RowActionKey, RowActionTone>> = {}
  for (const key of Object.keys(source) as RowActionKey[]) {
    const value = source[key]
    if (value !== undefined) out[key] = value
  }
  return out
}
