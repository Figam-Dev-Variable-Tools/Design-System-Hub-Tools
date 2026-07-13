import { InputBase, inputStyles } from '../InputBase/InputBase'

/** 지우기(×) 버튼의 접근성 이름 — 아이콘뿐이라 이름이 없으면 스크린리더에 '버튼'으로만 읽힌다 */
const DEFAULT_CLEAR_LABEL = '지우기'

export type SearchFieldProps = {
  label?: string
  /**
   * 검색 입력의 접근성 이름 — 라벨을 그릴 자리가 없는 툴바·필터바에서 쓴다(placeholder는 이름이 아니다).
   * 이 축이 없어 ListToolbar·FilterBar가 SearchLabels.search를 타입에서 아예 빼고 있었다.
   */
  ariaLabel?: string
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** Enter 입력 시 호출 */
  onSearch?: (value: string) => void
  /** 값이 있을 때 지우기(×) 버튼 표시 (기본 표시) */
  showClear?: boolean
  /** 지우기(×) 버튼의 접근성 이름 — 기본 '지우기' */
  clearLabel?: string
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  )
}

export function SearchField({
  label,
  ariaLabel,
  value,
  onChange,
  placeholder = '검색어를 입력하세요',
  disabled = false,
  onSearch,
  showClear = true,
  clearLabel = DEFAULT_CLEAR_LABEL,
}: SearchFieldProps) {
  return (
    <InputBase
      label={label}
      ariaLabel={ariaLabel}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type="search"
      inputMode="search"
      disabled={disabled}
      leading={<SearchIcon />}
      trailing={
        showClear && value !== '' ? (
          <button
            type="button"
            className={inputStyles.iconButton}
            aria-label={clearLabel}
            disabled={disabled}
            onClick={() => onChange?.('')}
          >
            ×
          </button>
        ) : undefined
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSearch?.(value)
      }}
    />
  )
}
