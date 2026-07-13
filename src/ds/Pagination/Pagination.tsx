import { mergeLabels, type PaginationLabels } from '../../shared/labels'
import styles from './Pagination.module.css'

export const DEFAULT_PAGINATION_LABELS: Required<PaginationLabels> = {
  nav: '페이지네이션',
  prev: '이전 페이지',
  next: '다음 페이지',
  first: '첫 페이지',
  last: '마지막 페이지',
  /** 숫자 버튼의 접근성 이름 — 숫자만 읽히면 '3'이 무엇인지 알 수 없다 */
  page: (page) => `${page}페이지`,
  ellipsis: '…',
}

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
  /**
   * 크기 (기본 md). compact 표 하단은 sm, 사이트 목록 하단은 lg로 주변 컨트롤과 줄을 맞춘다.
   * md는 지금까지의 치수 그대로다(square 32px / circle 36px).
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * 처음·끝 이동 버튼 (기본 false — 지금까지의 렌더).
   * 페이지가 수십 개면 마지막으로 가는 수단이 숫자 버튼 클릭뿐이라 켠다.
   */
  showFirstLast?: boolean
  /** 접근성 이름 — 화면에 보이는 글자는 숫자와 생략기호(…)뿐이다 */
  labels?: PaginationLabels
}

/** md는 기본 치수(square 32 / circle 36)라 얹을 클래스가 없다 — 모양별 기본값을 그대로 둔다 */
const SIZE_CLASS: Record<NonNullable<PaginationProps['size']>, string | undefined> = {
  sm: styles.sm,
  md: undefined,
  lg: styles.lg,
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

function ChevronsLeft() {
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
      <path d="M11 18l-6-6 6-6" />
      <path d="M18 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronsRight() {
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
      <path d="M13 18l6-6-6-6" />
      <path d="M6 18l6-6-6-6" />
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
  size = 'md',
  showFirstLast = false,
  labels,
}: PaginationProps) {
  const L = mergeLabels(DEFAULT_PAGINATION_LABELS, labels)
  const pages = buildPages(page, totalPages, siblingCount)

  const className = [
    styles.pagination,
    shape === 'circle' ? styles.circle : '',
    SIZE_CLASS[size],
    align === 'center' ? styles.alignCenter : align === 'end' ? styles.alignEnd : '',
  ]
    .filter(Boolean)
    .join(' ')

  const atFirst = page <= 1
  const atLast = page >= totalPages

  return (
    <nav className={className} aria-label={L.nav}>
      {showFirstLast && (
        <button
          type="button"
          className={styles.item}
          disabled={atFirst}
          aria-label={L.first}
          onClick={() => onChange?.(1)}
        >
          <ChevronsLeft />
        </button>
      )}
      <button
        type="button"
        className={styles.item}
        disabled={atFirst}
        aria-label={L.prev}
        onClick={() => onChange?.(page - 1)}
      >
        <ChevronLeft />
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className={styles.ellipsis} aria-hidden="true">
            {L.ellipsis}
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={[styles.item, p === page ? styles.active : ''].filter(Boolean).join(' ')}
            aria-current={p === page ? 'page' : undefined}
            // 숫자만으로는 뜻이 없다 — 이름은 '3페이지', 보이는 글자는 그대로 '3'
            aria-label={L.page(p)}
            onClick={() => onChange?.(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={styles.item}
        disabled={atLast}
        aria-label={L.next}
        onClick={() => onChange?.(page + 1)}
      >
        <ChevronRight />
      </button>
      {showFirstLast && (
        <button
          type="button"
          className={styles.item}
          disabled={atLast}
          aria-label={L.last}
          onClick={() => onChange?.(totalPages)}
        >
          <ChevronsRight />
        </button>
      )}
    </nav>
  )
}
