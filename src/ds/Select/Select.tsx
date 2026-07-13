import { useEffect, useRef, useState } from 'react'
import styles from './Select.module.css'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectProps = {
  label?: string
  /**
   * 트리거의 접근성 이름 — 라벨을 그릴 자리가 없는 툴바·필터바에서 쓴다.
   * (선택된 값만 읽히면 그 값이 '무엇의' 값인지 스크린리더가 알 수 없다.)
   * 라벨을 함께 주면 그 라벨이 이름이 되므로, 라벨이 없는 자리에만 쓴다.
   */
  ariaLabel?: string
  value: string | null
  onChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
  helperText?: string
  /** true면 필드가 부모(폼 그리드의 열)를 꽉 채운다 — 기본 320px 상한을 푼다(InputBase와 같은 축) */
  fullWidth?: boolean
}

export function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

/** 드롭다운 외부 클릭/Escape 닫기 공용 훅 — Select/MultiSelect/Autocomplete에서 재사용 */
export function useDismiss(ref: React.RefObject<HTMLElement | null>, onDismiss: () => void) {
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [ref, onDismiss])
}

export function Select({
  label,
  ariaLabel,
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  disabled = false,
  error = false,
  helperText,
  fullWidth = false,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  useDismiss(rootRef, () => setOpen(false))

  const selected = options.find((o) => o.value === value) ?? null
  const fieldClass = [
    styles.field,
    open ? styles.open : '',
    error ? styles.error : '',
    fullWidth ? styles.fullWidth : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={rootRef} className={fieldClass}>
      {label != null && <span className={styles.label}>{label}</span>}
      <div className={styles.control}>
        <button
          type="button"
          className={styles.trigger}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {selected ? (
            <span className={styles.value}>{selected.label}</span>
          ) : (
            <span className={[styles.value, styles.placeholder].join(' ')}>{placeholder}</span>
          )}
          <span className={styles.chevron}>
            <Chevron />
          </span>
        </button>
        {open && (
          <div className={styles.panel} role="listbox">
            {options.map((option) => {
            const isSelected = option.value === value
            const optionClass = [
              styles.option,
              isSelected ? styles.optionSelected : '',
              option.disabled ? styles.optionDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={optionClass}
                disabled={option.disabled}
                onClick={() => {
                  onChange?.(option.value)
                  setOpen(false)
                }}
              >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {isSelected && (
                    <span className={styles.check}>
                      <CheckIcon />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
      {helperText != null && <span className={styles.helper}>{helperText}</span>}
    </div>
  )
}
