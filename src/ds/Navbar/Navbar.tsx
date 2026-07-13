import type { ReactNode } from 'react'
import styles from './Navbar.module.css'

export type NavbarItem = {
  label: string
  value: string
}

export type NavbarProps = {
  /** 없으면 브랜드를 렌더하지 않는다 — 어드민 셸처럼 브랜드가 사이드바에 있을 때 */
  brand?: string
  items: NavbarItem[]
  value: string
  onChange?: (value: string) => void
  actions?: ReactNode
  sticky?: boolean
}

export function Navbar({ brand, items, value, onChange, actions, sticky = false }: NavbarProps) {
  const className = [styles.navbar, sticky ? styles.sticky : ''].filter(Boolean).join(' ')

  return (
    <nav className={className}>
      {brand != null && <span className={styles.brand}>{brand}</span>}
      <div className={styles.menu}>
        {items.map((item) => {
          const active = item.value === value
          return (
            <button
              key={item.value}
              type="button"
              aria-current={active ? 'page' : undefined}
              className={[styles.item, active ? styles.active : ''].filter(Boolean).join(' ')}
              onClick={() => onChange?.(item.value)}
            >
              {/* 라벨 span — 좁아지면 말줄임(버튼 자체는 flex라 말줄임이 먹지 않는다) */}
              <span className={styles.itemLabel}>{item.label}</span>
            </button>
          )
        })}
      </div>
      {actions != null && <div className={styles.actions}>{actions}</div>}
    </nav>
  )
}
