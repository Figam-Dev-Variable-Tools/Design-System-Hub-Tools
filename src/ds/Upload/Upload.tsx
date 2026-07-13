import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, KeyboardEvent, ReactNode } from 'react'
import styles from './Upload.module.css'

/**
 * 선택한 파일을 어떻게 보여줄지 결정하는 축.
 * - 'none': 미리보기 없음 (기존 Upload 그대로 — 기본값이라 기존 사용처는 그대로 동작한다)
 * - 'list': 파일명·용량·삭제 버튼이 있는 목록 (구 FileUpload)
 * - 'grid': 썸네일 격자 + '+' 추가 타일 (구 ImageUpload)
 */
export type UploadPreview = 'none' | 'list' | 'grid'

export type UploadProps = {
  label?: string
  files: File[]
  onChange?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  disabled?: boolean
  helperText?: string
  /**
   * 미리보기 종류. FileUpload/ImageUpload는 드롭존은 그대로 두고 "고른 파일을 어떻게 그리는가"만
   * 달랐던 얇은 래퍼여서, 별도 컴포넌트 대신 이 축으로 흡수했다. 기본값은 기존 동작인 'none'.
   */
  preview?: UploadPreview
  /** 드롭존 안내 영역 커스텀 */
  children?: ReactNode
}

/** 바이트 수를 '1.2 MB' 형식 문자열로 변환 */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = n
  let unitIndex = -1
  do {
    value /= 1024
    unitIndex += 1
  } while (value >= 1024 && unitIndex < units.length - 1)
  return `${value.toFixed(1).replace(/\.0$/, '')} ${units[unitIndex]}`
}

/** 목록/격자에서 공용으로 쓰는 X 아이콘 */
function CloseIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function Upload({
  label,
  files,
  onChange,
  accept,
  multiple = true,
  maxFiles,
  disabled = false,
  helperText,
  preview = 'none',
  children,
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  // 격자 미리보기의 '+' 타일 전용 input — 드롭존 안의 input은 드롭존 클릭에 묶여 있어 따로 둔다
  const addInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [urls, setUrls] = useState<string[]>([])

  // 썸네일용 오브젝트 URL 생성/해제 — 격자일 때만 만든다(그 외에는 URL을 쥘 이유가 없다)
  useEffect(() => {
    if (preview !== 'grid') {
      setUrls([])
      return
    }
    const next = files.map((file) => URL.createObjectURL(file))
    setUrls(next)
    return () => {
      next.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files, preview])

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return
    const added = multiple ? Array.from(incoming) : Array.from(incoming).slice(0, 1)
    let next = multiple ? [...files, ...added] : added
    if (maxFiles != null) next = next.slice(0, maxFiles) // 초과분은 무시
    onChange?.(next)
  }

  const removeAt = (index: number) => {
    onChange?.(files.filter((_, i) => i !== index))
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.target.value = '' // 같은 파일 재선택 허용
  }

  /*
   * 드래그 처리는 공용 DropZone으로 갈아끼우지 않고 Upload가 계속 들고 있는다.
   * DropZone은 (1) accept·maxSizeMb 위반 파일을 자체 Alert 에러로 걸러내고, (2) 파일 배열을 누적하지 않고
   * 통과분만 onFiles로 흘리며, (3) label/hint 문구와 Placeholder 아이콘 등 마크업·CSS가 전부 다르다.
   * 즉 drop-in이 아니라 드롭존의 동작·모양이 바뀌므로, 기존 Upload 동작 보존을 우선했다.
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) setDragOver(true)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    addFiles(e.dataTransfer.files)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  const zoneClassName = [
    styles.dropzone,
    dragOver ? styles.dragOver : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ')

  const field = (
    <div className={styles.field}>
      {label != null && <span className={styles.label}>{label}</span>}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={zoneClassName}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {children ?? (
          <>
            <svg
              className={styles.icon}
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              <path d="M12 12v9" />
              <path d="m16 16-4-4-4 4" />
            </svg>
            <span className={styles.text}>파일을 끌어다 놓거나 클릭하여 업로드</span>
            {helperText != null && <span className={styles.helper}>{helperText}</span>}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          className={styles.input}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    </div>
  )

  // 미리보기가 없으면 예전 Upload와 완전히 같은 DOM을 유지한다(래퍼도 추가하지 않는다)
  if (preview === 'none') return field

  // 격자에서 '+' 타일 노출 여부 판단용 — maxFiles가 없으면 상한 없음
  const gridMax = maxFiles ?? Number.POSITIVE_INFINITY

  return (
    <div className={styles.root}>
      {field}

      {/* 목록 미리보기 (구 FileUpload) — 파일명 + 용량 + 삭제 */}
      {preview === 'list' && files.length > 0 && (
        <ul className={styles.list}>
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className={styles.item}>
              <svg
                className={styles.fileIcon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <path d="M13 2v7h7" />
              </svg>
              <span className={styles.name}>{file.name}</span>
              <span className={styles.size}>{formatBytes(file.size)}</span>
              <button
                type="button"
                className={styles.listRemove}
                aria-label={`${file.name} 삭제`}
                disabled={disabled}
                onClick={() => removeAt(index)}
              >
                <CloseIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 격자 미리보기 (구 ImageUpload) — 썸네일 + 호버 삭제 + '+' 추가 타일 */}
      {preview === 'grid' && files.length > 0 && (
        <div className={styles.grid}>
          {files.map((file, index) => {
            const url = urls[index]
            return (
              <div key={`${file.name}-${index}`} className={styles.thumb}>
                {url != null && <img src={url} alt={file.name} className={styles.img} />}
                {!disabled && (
                  <button
                    type="button"
                    className={styles.thumbRemove}
                    aria-label={`${file.name} 삭제`}
                    onClick={() => removeAt(index)}
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
            )
          })}
          {files.length < gridMax && !disabled && (
            <button
              type="button"
              className={styles.addTile}
              aria-label="이미지 추가"
              onClick={() => addInputRef.current?.click()}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
          )}
        </div>
      )}

      {preview === 'grid' && (
        <input
          ref={addInputRef}
          type="file"
          className={styles.input}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
