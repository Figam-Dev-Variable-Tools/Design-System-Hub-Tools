import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { InputBase } from '../InputBase/InputBase'
import { NumberField } from '../NumberField/NumberField'
import { CurrencyField } from '../CurrencyField/CurrencyField'
import { Button } from '../Button/Button'
import { EmptyState } from '../EmptyState/EmptyState'
import styles from './OptionRows.module.css'

export type OptionRow = {
  id: string
  name: string
  value: string
  /** 옵션 선택 시 더해지는 금액 */
  extraPrice?: number
  stock?: number
}

export type OptionRowsProps = {
  rows: OptionRow[]
  onChange: (rows: OptionRow[]) => void
  /** 최대 옵션 행 수 */
  max?: number
  disabled?: boolean
  /**
   * 컬럼 헤더 줄 (기본 true).
   * 행이 한두 개뿐인 좁은 폼(모달 안 등)에서는 헤더가 배보다 배꼽이라 끈다 —
   * 각 필드의 라벨은 이미 스크린리더용으로 살아 있으므로 접근성은 그대로다.
   */
  showHeader?: boolean
  /**
   * 행 순서 이동 버튼 (기본 true).
   * 옵션 순서가 노출 순서와 무관한 화면(재고 관리 등)에서는 위/아래 버튼이 잡음이다.
   */
  showReorder?: boolean
  /** 하단 'n/max' 카운터 (기본 true) */
  showCount?: boolean
  /** 추가 버튼 아이콘 — 기본 lucide Plus */
  addIcon?: ReactNode
  /** 순서 이동 아이콘 — 기본 lucide ChevronUp / ChevronDown */
  moveUpIcon?: ReactNode
  moveDownIcon?: ReactNode
  /** 행 삭제 아이콘 — 기본 lucide Trash2 */
  removeIcon?: ReactNode
  /** 빈 상태 문구 — 옵션이 아닌 다른 반복 행(배송지·담당자 등)으로 쓸 때 바꾼다 */
  emptyTitle?: string
  emptyDescription?: string
  /** 추가 버튼 라벨 (빈 상태·하단 공용) */
  addLabel?: string
}

let optionSeq = 0

/** 새 옵션 행의 id 생성 — 리스트 재정렬 시에도 안정적인 key로 쓰인다 */
export function createOptionRow(): OptionRow {
  optionSeq += 1
  return { id: `option-${Date.now().toString(36)}-${optionSeq}`, name: '', value: '' }
}

export function OptionRows({
  rows,
  onChange,
  max = 20,
  disabled = false,
  showHeader = true,
  showReorder = true,
  showCount = true,
  addIcon,
  moveUpIcon,
  moveDownIcon,
  removeIcon,
  emptyTitle = '등록된 옵션이 없습니다.',
  emptyDescription = '색상·사이즈처럼 선택지가 필요한 상품이라면 옵션을 추가하세요.',
  addLabel = '옵션 추가',
}: OptionRowsProps) {
  const patch = (id: string, next: Partial<OptionRow>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...next } : row)))
  }

  const add = () => {
    if (rows.length >= max) return
    onChange([...rows, createOptionRow()])
  }

  const remove = (id: string) => {
    onChange(rows.filter((row) => row.id !== id))
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  // 행이 하나도 없으면 공용 빈 상태(EmptyState) — 안내 문구 + 추가 버튼을 여기서 다시 만들지 않는다
  if (rows.length === 0) {
    return (
      <div className={styles.optionRows}>
        <div className={styles.empty}>
          {/* disabled면 actionLabel을 비워 버튼째 지운다 — EmptyState의 액션은 disabled 축이 없고,
              읽기 전용 폼에서 누를 수 없는 버튼을 남겨 두는 것보다 없는 편이 정직하다 */}
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={disabled ? undefined : addLabel}
            onAction={add}
            compact
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.optionRows}>
      {showHeader && (
        <div className={styles.head} aria-hidden="true">
          <span>옵션명</span>
          <span>옵션값</span>
          <span>추가금액</span>
          <span>재고</span>
          <span />
        </div>
      )}

      <ul className={styles.list}>
        {rows.map((row, index) => (
          <li key={row.id} className={styles.row}>
            {/* 라벨은 넓은 화면에서 상단 헤더가 대신하므로 CSS로 시각적으로만 숨긴다(스크린리더는 읽음) */}
            <div className={styles.cell}>
              <InputBase
                label="옵션명"
                value={row.name}
                onChange={(name) => patch(row.id, { name })}
                placeholder="예: 색상"
                disabled={disabled}
              />
            </div>
            <div className={styles.cell}>
              <InputBase
                label="옵션값"
                value={row.value}
                onChange={(value) => patch(row.id, { value })}
                placeholder="예: 블랙"
                disabled={disabled}
              />
            </div>
            <div className={styles.cell}>
              <CurrencyField
                label="추가금액"
                value={row.extraPrice == null ? '' : String(row.extraPrice)}
                onChange={(digits) =>
                  patch(row.id, { extraPrice: digits === '' ? undefined : Number(digits) })
                }
                disabled={disabled}
              />
            </div>
            <div className={styles.cell}>
              <NumberField
                label="재고"
                value={row.stock ?? 0}
                onChange={(stock) => patch(row.id, { stock })}
                min={0}
                unit="개"
                disabled={disabled}
              />
            </div>
            {/* 아이콘만 있는 행 액션 — 공용 Button의 iconOnly 축으로 그린다.
                label은 화면에서만 감춰지고 DOM에 남아 그대로 접근성 이름이 되므로,
                '3번째 옵션 삭제'처럼 행을 특정하는 이름을 그대로 줄 수 있다. */}
            <div className={styles.actions}>
              {showReorder && (
                <>
                  <Button
                    variant="secondary"
                    appearance="outline"
                    size="sm"
                    label={`${index + 1}번째 옵션 위로`}
                    iconOnly
                    showLeftIcon
                    leftIcon={moveUpIcon ?? <ChevronUp size={16} />}
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                  />
                  <Button
                    variant="secondary"
                    appearance="outline"
                    size="sm"
                    label={`${index + 1}번째 옵션 아래로`}
                    iconOnly
                    showLeftIcon
                    leftIcon={moveDownIcon ?? <ChevronDown size={16} />}
                    disabled={disabled || index === rows.length - 1}
                    onClick={() => move(index, 1)}
                  />
                </>
              )}
              <Button
                variant="error"
                appearance="outline"
                size="sm"
                label={`${index + 1}번째 옵션 삭제`}
                iconOnly
                showLeftIcon
                leftIcon={removeIcon ?? <Trash2 size={16} />}
                disabled={disabled}
                onClick={() => remove(row.id)}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <Button
          variant="primary"
          appearance="outline"
          size="sm"
          label={addLabel}
          showIcon
          icon={addIcon ?? <Plus size={16} />}
          disabled={disabled || rows.length >= max}
          onClick={add}
        />
        {showCount && (
          <span className={styles.count}>
            {rows.length}/{max}
          </span>
        )}
      </div>
    </div>
  )
}
