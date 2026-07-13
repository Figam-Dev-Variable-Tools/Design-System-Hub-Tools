import type { ReactNode } from 'react'
import { Download, Eye, X } from 'lucide-react'
import { Button } from '../Button/Button'
import { EmptyState } from '../EmptyState/EmptyState'
import { Tag } from '../Tag/Tag'
import { Placeholder, type PlaceholderKind } from '../../shared/placeholders'
import styles from './AttachmentList.module.css'

export type Attachment = {
  id: string
  name: string
  size: number
  type: string
  url?: string
  thumbnail?: string
}

export type AttachmentListProps = {
  items: Attachment[]
  onDownload?: (a: Attachment) => void
  onRemove?: (a: Attachment) => void
  onPreview?: (a: Attachment) => void
  compact?: boolean
  downloadAllLabel?: string
  onDownloadAll?: () => void

  /*
   * ── 요소 ON/OFF (기본 전부 true) ──
   * 같은 목록이 문의 상세(파일명만 나열)·관리자 첨부함(썸네일까지)처럼 밀도가 다른 자리에 쓰인다.
   * false면 그 요소가 DOM에서 완전히 사라진다(빈 자리·여백이 남지 않는다).
   */
  /** 상단 줄 전체(건수 요약 + 전체 다운로드) */
  showHeader?: boolean
  /** 상단 줄의 '첨부 N개 · 12.3 MB' 요약 — 전체 다운로드 버튼만 남길 때 끈다 */
  showSummary?: boolean
  /** 행 좌측 썸네일 — 파일명만 나열하는 좁은 칸에서 끈다 */
  showThumbnail?: boolean
  /** 파일명 아래 메타 줄(확장자 태그 + 용량) */
  showMeta?: boolean

  /* ── 아이콘 슬롯 — 없으면 기존 lucide 기본 아이콘 ── */
  previewIcon?: ReactNode
  downloadIcon?: ReactNode
  removeIcon?: ReactNode

  /** 첨부가 없을 때 문구 — 기본 '첨부된 파일이 없습니다.' */
  emptyText?: string
}

/** 첨부 4분류 — 미리보기 가능 여부(이미지/동영상)와 아이콘을 가른다 */
export type AttachmentKind = 'image' | 'video' | 'document' | 'other'

const DOCUMENT_MIME = /pdf|word|excel|powerpoint|sheet|document|presentation|csv|rtf|hwp/i
const IMAGE_EXT = /^(png|jpe?g|gif|webp|svg|avif|bmp|heic)$/
const VIDEO_EXT = /^(mp4|mov|webm|avi|mkv|m4v)$/
const DOCUMENT_EXT = /^(pdf|docx?|xlsx?|pptx?|txt|csv|hwpx?|md)$/

/** MIME 우선, 비어 있거나 generic이면 확장자로 한 번 더 판정한다 */
export function attachmentKind(item: Pick<Attachment, 'type' | 'name'>): AttachmentKind {
  const type = item.type.toLowerCase()
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('text/') || DOCUMENT_MIME.test(type)) return 'document'

  const ext = fileExtension(item.name)
  if (IMAGE_EXT.test(ext)) return 'image'
  if (VIDEO_EXT.test(ext)) return 'video'
  if (DOCUMENT_EXT.test(ext)) return 'document'
  return 'other'
}

/** 분류 → 공용 Placeholder kind. 문서/기타는 같은 'file' 글리프를 쓰고 확장자 라벨로 구분한다. */
const PLACEHOLDER_KIND: Record<AttachmentKind, PlaceholderKind> = {
  image: 'image',
  video: 'video',
  document: 'file',
  other: 'file',
}

function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
}

/** 바이트 → KB/MB. 1KB 미만은 B로 둔다. */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-'
  if (bytes < 1024) return `${Math.round(bytes)} B`

  const kb = bytes / 1024
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`

  const mb = kb / 1024
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}

export function AttachmentList({
  items,
  onDownload,
  onRemove,
  onPreview,
  compact = false,
  downloadAllLabel = '전체 다운로드',
  onDownloadAll,
  showHeader = true,
  showSummary = true,
  showThumbnail = true,
  showMeta = true,
  previewIcon,
  downloadIcon,
  removeIcon,
  emptyText = '첨부된 파일이 없습니다.',
}: AttachmentListProps) {
  const rootClassName = [styles.root, compact ? styles.compact : ''].filter(Boolean).join(' ')

  if (items.length === 0) {
    // 빈 상태는 공용 EmptyState(kind="file")가 그린다 — 그림·문구·여백 규격을 저장소 전체와 맞춘다
    return (
      <div className={rootClassName}>
        <div className={styles.empty}>
          <EmptyState title={emptyText} kind="file" compact={compact} />
        </div>
      </div>
    )
  }

  const totalSize = items.reduce((sum, item) => sum + (Number.isFinite(item.size) ? item.size : 0), 0)

  // 요약도 전체 다운로드도 없으면 상단 줄을 아예 그리지 않는다(빈 여백이 남으면 안 된다)
  const headerVisible = showHeader && (showSummary || onDownloadAll != null)

  return (
    <div className={rootClassName}>
      {headerVisible && (
        <div className={styles.header}>
          {showSummary && (
            <span className={styles.summary}>
              첨부 {items.length}개 · {formatFileSize(totalSize)}
            </span>
          )}
          {onDownloadAll != null && (
            <span className={styles.downloadAll}>
              <Button
                variant="secondary"
                appearance="outline"
                size="sm"
                label={downloadAllLabel}
                showLeftIcon
                leftIcon={downloadIcon ?? <Download size={14} aria-hidden="true" />}
                onClick={onDownloadAll}
              />
            </span>
          )}
        </div>
      )}

      <ul className={styles.list}>
        {items.map((item) => {
          const kind = attachmentKind(item)
          const isMedia = kind === 'image' || kind === 'video'
          const canPreview = onPreview != null && isMedia
          // 이미지는 thumbnail이 없으면 원본 url을 썸네일로 쓴다(동영상은 poster가 필요하므로 제외)
          const thumbSrc = item.thumbnail ?? (kind === 'image' ? item.url : undefined)
          const ext = fileExtension(item.name)

          const thumb = thumbSrc ? (
            <img className={styles.thumbImage} src={thumbSrc} alt="" loading="lazy" />
          ) : (
            <Placeholder kind={PLACEHOLDER_KIND[kind]} size="fill" />
          )

          return (
            <li key={item.id} className={styles.item}>
              {showThumbnail &&
                (canPreview ? (
                  <button
                    type="button"
                    className={[styles.thumb, styles.thumbButton].join(' ')}
                    onClick={() => onPreview(item)}
                    aria-label={`${item.name} 미리보기`}
                  >
                    {thumb}
                    <span className={styles.thumbOverlay} aria-hidden="true">
                      {previewIcon ?? <Eye size={16} />}
                    </span>
                  </button>
                ) : (
                  <span className={styles.thumb}>{thumb}</span>
                ))}

              <div className={styles.info}>
                <span className={styles.name} title={item.name}>
                  {item.name}
                </span>
                {showMeta && (
                  <span className={styles.meta}>
                    {/* 확장자 라벨은 공용 Tag(분류 라벨) — 대화형이 아니라 탭 순서를 오염시키지 않는다 */}
                    {ext !== '' && <Tag label={ext.toUpperCase()} tone="secondary" size="sm" />}
                    {formatFileSize(item.size)}
                  </span>
                )}
              </div>

              {/*
               * 행 액션은 공용 Button(ghost)의 iconOnly 축으로 그린다. label(= '파일명 다운로드')은
               * 화면에서만 감춰지고 DOM에는 남아 그대로 버튼의 접근성 이름이 된다.
               */}
              <div className={styles.actions}>
                {canPreview && (
                  <Button
                    variant="secondary"
                    appearance="ghost"
                    size="sm"
                    label={`${item.name} 미리보기`}
                    iconOnly
                    showLeftIcon
                    leftIcon={previewIcon ?? <Eye size={16} aria-hidden="true" />}
                    onClick={() => onPreview(item)}
                  />
                )}
                {onDownload != null && (
                  <Button
                    variant="secondary"
                    appearance="ghost"
                    size="sm"
                    label={`${item.name} 다운로드`}
                    iconOnly
                    showLeftIcon
                    leftIcon={downloadIcon ?? <Download size={16} aria-hidden="true" />}
                    onClick={() => onDownload(item)}
                  />
                )}
                {onRemove != null && (
                  <Button
                    variant="error"
                    appearance="ghost"
                    size="sm"
                    label={`${item.name} 삭제`}
                    iconOnly
                    showLeftIcon
                    leftIcon={removeIcon ?? <X size={16} aria-hidden="true" />}
                    onClick={() => onRemove(item)}
                  />
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
