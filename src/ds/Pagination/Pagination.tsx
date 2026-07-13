import styles from './Pagination.module.css'

export type PaginationProps = {
  page: number
  totalPages: number
  onChange?: (page: number) => void
  siblingCount?: number
  /** 버튼 모양 — square=라운드 사각(어드민 목록·기본값) / circle=원형(사이트 목록 하단) */
  shape?: 'square' | 'circle'
  /**
   * 정렬 — start=좌측(기본) / center=가운데 / end=우측.
   * 목록 페이지마다 감싸는 div로 가운데 정렬하던 것을 컴포넌트 축으로 흡수한다.
   */
  align?: 'start' | 'center' | 'end'
}

function ChevronLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

// 1 … (현재±sibling) … 마지막 순서로 페이지 목록 구성
function buildPages(page: number, totalPages: number, siblingCount: number) {
  const start = Math.max(page - siblingCount, 1)
  const end = Math.min(page + siblingCount, totalPages)
  const pages: (number | 'ellipsis')[] = []
  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('ellipsis')
  }
  for (let p = start; p <= end; p += 1) pages.push(p)
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('ellipsis')
    pages.push(totalPages)
  }
  return pages
}

export function Pagination({
  page,
  totalPages,
  onChange,
  siblingCount = 1,
  shape = 'square',
  align = 'start',
}: PaginationProps) {
  const pages = buildPages(page, totalPages, siblingCount)

  const className = [
    styles.pagination,
    shape === 'circle' ? styles.circle : '',
    align === 'center' ? styles.alignCenter : align === 'end' ? styles.alignEnd : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <nav className={className} aria-label="페이지네이션">
      <button
        type="button"
        className={styles.item}
        disabled={page <= 1}
        aria-label="이전 페이지"
        onClick={() => onChange?.(page - 1)}
      >
        <ChevronLeft />
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={[styles.item, p === page ? styles.active : ''].filter(Boolean).join(' ')}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange?.(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={styles.item}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
        onClick={() => onChange?.(page + 1)}
      >
        <ChevronRight />
      </button>
    </nav>
  )
}
