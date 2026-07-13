import { useId, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, KeyboardEvent, ReactNode } from 'react'
import { Alert } from '../Alert/Alert'
import { Placeholder } from '../../shared/placeholders'
import styles from './DropZone.module.css'

export type DropZoneProps = {
  /** 검증(accept·maxSizeMb)을 통과한 파일만 전달된다 */
  onFiles: (files: File[]) => void
  /** input[type=file]의 accept 규약 — 'image/*', '.png,.jpg', 'application/pdf' 등 */
  accept?: string
  multiple?: boolean
  disabled?: boolean
  /** 파일 1개당 최대 크기(MB) */
  maxSizeMb?: number
  /** 하단 보조 문구 */
  hint?: string
  /** 높이를 줄인 한 줄짜리 드롭존 */
  compact?: boolean
  /** 기본 아이콘·라벨 대신 그릴 내용 (hint·에러 메시지는 그대로 유지된다) */
  children?: ReactNode

  // ── ON/OFF (기본 true — 끄면 그 요소가 DOM에서 사라진다) ──
  /**
   * 기본 안내 문구. 아이콘만 남기고 문구를 지운 미니 드롭존(폼 안 좁은 칸)이 필요해서 둔다.
   * children을 넘긴 경우에는 애초에 기본 라벨이 없으므로 영향이 없다.
   */
  showLabel?: boolean
  /**
   * 검증 실패 메시지. 에러 문구를 드롭존 밖(FieldRow의 error 등)에서 직접 그리는 화면에서,
   * 같은 말이 두 번 뜨지 않게 끈다. 끄더라도 검증 자체는 그대로 돈다(통과분만 onFiles).
   */
  showError?: boolean

  // ── 문구 (없으면 기존 기본 문구 그대로) ──
  /** 평상시 라벨 — 기본 '파일을 끌어다 놓거나 클릭해서 선택하세요' */
  label?: string
  /** 드래그가 영역 위에 올라왔을 때의 라벨 — 기본 '여기에 놓으세요' */
  draggingLabel?: string

  /**
   * 에러 아이콘 슬롯. 공용 Alert에는 아이콘 교체 축이 없어(showIcon 불리언뿐),
   * 아이콘을 직접 지정하면 Alert 대신 인라인 에러 행으로 그린다.
   */
  errorIcon?: ReactNode
}

/** accept 토큰(`image/*`, `.png`, `image/png`) 하나라도 매칭되면 통과 */
function matchesAccept(file: File, accept?: string): boolean {
  if (accept == null || accept.trim() === '') return true
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token !== '')
  if (tokens.length === 0) return true

  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    return type === token
  })
}

export function DropZone({
  onFiles,
  accept,
  multiple = false,
  disabled = false,
  maxSizeMb,
  hint,
  compact = false,
  children,
  showLabel = true,
  showError = true,
  label = '파일을 끌어다 놓거나 클릭해서 선택하세요',
  draggingLabel = '여기에 놓으세요',
  errorIcon,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  // dragenter/dragleave가 자식 요소마다 발생하므로 깊이를 세어 깜빡임을 막는다
  const depthRef = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hintId = useId()
  const errorId = useId()

  const openPicker = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  /** accept·maxSizeMb·multiple 규칙으로 걸러 통과분만 onFiles로 넘긴다 */
  const validateAndEmit = (files: File[]) => {
    if (disabled || files.length === 0) return

    const limitBytes = maxSizeMb == null ? null : maxSizeMb * 1024 * 1024
    const passed: File[] = []
    const messages: string[] = []

    for (const file of files) {
      if (!matchesAccept(file, accept)) {
        messages.push(`${file.name}은(는) 허용되지 않는 형식입니다.`)
        continue
      }
      if (limitBytes != null && file.size > limitBytes) {
        messages.push(`${file.name}은(는) ${maxSizeMb}MB를 초과합니다.`)
        continue
      }
      passed.push(file)
    }

    const picked = multiple ? passed : passed.slice(0, 1)
    setError(messages.length > 0 ? messages.join(' ') : null)
    if (picked.length > 0) onFiles(picked)
  }

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files != null && files.length > 0) validateAndEmit(Array.from(files))
    e.target.value = '' // 같은 파일 재선택 허용
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disabled) return
    depthRef.current += 1
    setDragging(true)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault() // preventDefault를 해야 drop이 발생한다
    if (disabled) return
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disabled) return
    depthRef.current -= 1
    if (depthRef.current <= 0) {
      depthRef.current = 0
      setDragging(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    depthRef.current = 0
    setDragging(false)
    if (disabled) return
    validateAndEmit(Array.from(e.dataTransfer.files))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    openPicker()
  }

  const zoneClass = [
    styles.zone,
    compact ? styles.compact : '',
    dragging ? styles.dragging : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ')

  // 에러를 감췄으면 aria-describedby에서도 빠져야 한다(보이지 않는 문구를 가리키면 안 된다)
  const visibleError = showError ? error : null

  const describedBy = [hint != null ? hintId : '', visibleError != null ? errorId : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.dropZone}>
      <div
        className={zoneClass}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={multiple ? '파일 여러 개 업로드' : '파일 업로드'}
        aria-describedby={describedBy === '' ? undefined : describedBy}
        // 드래그 상태 확인용 — 테스트/스토리에서 [data-dragging="true"]로 잡을 수 있다
        data-dragging={dragging ? 'true' : 'false'}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {children ?? (
          <>
            {/* 첨부 계열 기본 그림은 공용 Placeholder(kind="file")로 통일 */}
            <Placeholder kind="file" size={compact ? 20 : 32} />
            {showLabel && <span className={styles.label}>{dragging ? draggingLabel : label}</span>}
          </>
        )}
        {hint != null && (
          <span id={hintId} className={styles.hint}>
            {hint}
          </span>
        )}
      </div>

      {/*
       * 검증 실패 문구는 공용 Alert(error)로 그린다 — 톤·아이콘·role="alert"를 한 곳에서 관리한다.
       * Alert에는 id 축이 없어 aria-describedby용 id는 래퍼가 들고 있는다.
       */}
      {visibleError != null && (
        <div id={errorId} className={styles.errorSlot}>
          {errorIcon != null ? (
            <p className={styles.error} role="alert">
              {errorIcon}
              {visibleError}
            </p>
          ) : (
            <Alert variant="error" label={visibleError} showIcon />
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className={styles.input}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInput}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}
