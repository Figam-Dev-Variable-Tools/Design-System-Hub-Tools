import styles from './Breadcrumb.module.css'

export type BreadcrumbItem = {
  label: string
  href?: string
  /**
   * 라우터 이동 등 클릭 핸들러. href 없이 이 값만 있으면 button으로 렌더한다.
   * (어드민 상단바가 자체 Trail을 만들지 않고 이 컴포넌트를 쓰기 위한 슬롯)
   */
  onClick?: () => void
}

type DisplayItem = BreadcrumbItem | { ellipsis: true }

export type BreadcrumbProps = {
  items: BreadcrumbItem[]
  separator?: string
  /** 초과 시 가운데 '…' 축약 — 첫 항목 + … + 마지막 2개 */
  maxItems?: number
  /** nav의 접근성 이름 */
  ariaLabel?: string
}

export function Breadcrumb({
  items,
  separator = '/',
  maxItems,
  ariaLabel = '경로',
}: BreadcrumbProps) {
  const collapsed = maxItems != null && items.length > maxItems
  const display: DisplayItem[] = collapsed
    ? [items[0], { ellipsis: true }, ...items.slice(-2)]
    : items

  return (
    <nav className={styles.breadcrumb} aria-label={ariaLabel}>
      <ol className={styles.list}>
        {display.map((item, index) => {
          const last = index === display.length - 1
          return (
            <li key={index} className={styles.entry}>
              {'ellipsis' in item ? (
                <span className={styles.ellipsis} aria-hidden="true">
                  …
                </span>
              ) : last ? (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              ) : item.href != null ? (
                <a className={styles.link} href={item.href}>
                  {item.label}
                </a>
              ) : item.onClick != null ? (
                // href가 없고 핸들러만 있으면 버튼이다 — 링크로 위장하지 않는다(키보드·스크린리더 규격)
                <button type="button" className={styles.linkButton} onClick={item.onClick}>
                  {item.label}
                </button>
              ) : (
                <span className={styles.link}>{item.label}</span>
              )}
              {!last && (
                <span className={styles.separator} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
