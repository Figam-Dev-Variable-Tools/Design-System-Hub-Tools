import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { Drawer } from '../Drawer/Drawer'
// 강조색(--site-accent / --site-accent-text)의 단일 출처 — 헤더는 사본을 만들지 않고 클래스를 빌려 쓴다.
import siteSection from '../SiteSection/SiteSection.module.css'
import styles from './SiteHeader.module.css'

export type SiteHeaderItem = {
  label: string
  value: string
  href?: string
}

export type SiteHeaderProps = {
  brand: ReactNode
  items: SiteHeaderItem[]
  value?: string
  onChange?: (v: string) => void
  actions?: ReactNode
  /** 상단 고정 */
  sticky?: boolean
  /** 히어로 위에 얹힐 때 — 배경/보더 없이 투명 */
  transparent?: boolean
  /**
   * 햄버거 + 드로어 (기본 true).
   * 랜딩처럼 메뉴(items)가 없거나, 내비를 바깥 셸이 따로 제공하는 임베드에서 끈다.
   * 좁은 화면에서는 CSS가 메뉴/액션을 감추고 햄버거만 남기므로, 끄면 그 화면에 내비가 남지 않는다
   * — 그래서 기본값은 true다.
   */
  showMenuButton?: boolean
  /** 햄버거 아이콘 — 기본 lucide Menu */
  menuIcon?: ReactNode
  /** 햄버거의 접근성 이름 (기본 '메뉴 열기') — 아이콘만 있는 버튼이라 이름이 유일한 단서다 */
  menuButtonLabel?: string
  /** 드로어 헤더 문구 (기본 '메뉴') */
  drawerTitle?: string
}

/** 프론트 GNB — 좌 브랜드 / 우 메뉴 / 우 액션, 모바일에선 햄버거 → 드로어. 라이트 전용. */
export function SiteHeader({
  brand,
  items,
  value,
  onChange,
  actions,
  sticky = false,
  transparent = false,
  showMenuButton = true,
  menuIcon,
  menuButtonLabel = '메뉴 열기',
  drawerTitle = '메뉴',
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false)

  // href가 없으면 라우팅 대신 onChange만 — 있으면 기본 이동을 막지 않는다
  const select = (item: SiteHeaderItem) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (item.href == null) event.preventDefault()
    onChange?.(item.value)
    setOpen(false)
  }

  // siteSection.accentSuccess = 강조색 패밀리. 정의를 복사하지 않고 적용만 한다.
  const rootClassName = [
    styles.root,
    siteSection.accentSuccess,
    sticky ? styles.sticky : '',
    transparent ? styles.transparent : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={rootClassName}>
      <div className={styles.bar}>
        <div className={styles.brand}>{brand}</div>

        <nav className={styles.nav} aria-label="주요 메뉴">
          {items.map((item) => (
            <a
              key={item.value}
              className={[styles.item, value === item.value ? styles.active : ''].filter(Boolean).join(' ')}
              href={item.href ?? '#'}
              aria-current={value === item.value ? 'page' : undefined}
              onClick={select(item)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {actions != null && <div className={styles.actions}>{actions}</div>}

        {/* 아이콘만 있는 버튼이라 Button(라벨이 항상 보이는 규격)으로 대체하지 않는다 —
            Button은 aria-label/aria-expanded를 받지 않아 접근성 이름과 열림 상태를 잃는다. */}
        {showMenuButton && (
          <button
            type="button"
            className={styles.hamburger}
            aria-label={menuButtonLabel}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            {menuIcon ?? <Menu size={20} aria-hidden="true" />}
          </button>
        )}
      </div>

      {showMenuButton && (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title={drawerTitle}
          side="right"
          width={280}
        >
          <nav className={styles.drawerNav} aria-label="모바일 메뉴">
            {items.map((item) => (
              <a
                key={item.value}
                className={[styles.drawerItem, value === item.value ? styles.drawerActive : '']
                  .filter(Boolean)
                  .join(' ')}
                href={item.href ?? '#'}
                aria-current={value === item.value ? 'page' : undefined}
                onClick={select(item)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {actions != null && <div className={styles.drawerActions}>{actions}</div>}
        </Drawer>
      )}
    </header>
  )
}
