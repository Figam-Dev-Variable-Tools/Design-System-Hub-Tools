import type { ReactNode } from 'react'
import { DefinitionList } from '../DefinitionList/DefinitionList'
import styles from './SiteFooter.module.css'

export type SiteFooterCompanyItem = {
  label: string
  value: string
}

export type SiteFooterLink = {
  label: string
  href: string
}

export type SiteFooterProps = {
  brand: ReactNode
  /** 상호·대표·사업자번호·주소·전화·이메일 */
  company: SiteFooterCompanyItem[]
  links?: SiteFooterLink[]
  /** SNS 아이콘 슬롯 */
  social?: ReactNode
  copyright?: string
  /**
   * 사업자 정보 블록 노출 (기본 true).
   * 사업자 등록이 없는 브랜드 사이트·랜딩에서는 브랜드/링크/저작권만 남긴다.
   */
  showCompany?: boolean
  /**
   * 저작권 줄 위 구분선 (기본 true).
   * 푸터가 아주 짧을 때(브랜드 + 저작권만) 선 하나가 과해 보이면 끈다.
   */
  showDivider?: boolean
}

/**
 * 프론트 푸터 — 라이트(흰색) 단일 테마다. 다크는 없다.
 * 본문(흰 섹션)과 구분하기 위해 면만 아주 옅은 회색(--ds-color-bgSubtle)으로 한 단계 물린다
 * — SiteSection의 tone="subtle"과 같은 수단이다(색 반전이 아니라 면 교차).
 *
 * 사업자 정보는 dl/dt/dd를 손으로 짜지 않고 DefinitionList(layout="inline")에 맡긴다 —
 * 라벨-값 마크업의 단일 출처가 그쪽이다. 푸터는 배치(면·간격)만 갖는다.
 */
export function SiteFooter({
  brand,
  company,
  links,
  social,
  copyright,
  showCompany = true,
  showDivider = true,
}: SiteFooterProps) {
  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>{brand}</div>

          {links != null && links.length > 0 && (
            <nav className={styles.links} aria-label="푸터 링크">
              {links.map((link) => (
                <a key={link.label} className={styles.link} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {social != null && <div className={styles.social}>{social}</div>}
        </div>

        {showCompany && company.length > 0 && (
          <div className={styles.company}>
            {/* 표가 아니라 한 줄로 흐르는 라벨-값 — 행 구분선은 푸터에서 과하므로 끈다 */}
            <DefinitionList items={company} layout="inline" divider={false} />
          </div>
        )}

        {copyright != null && (
          <div className={[styles.bottom, showDivider ? styles.bottomDivider : ''].filter(Boolean).join(' ')}>
            <span className={styles.copyright}>{copyright}</span>
          </div>
        )}
      </div>
    </footer>
  )
}
