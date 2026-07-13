import type { KeyboardEvent } from 'react'
import { Badge } from '../Badge/Badge'
import { ratioClassName, type MediaRatio } from '../Image/Image'
import { Placeholder } from '../../shared/placeholders'
// 강조색(--site-accent / --site-accent-text)의 단일 출처 — 카드는 사본을 만들지 않고 클래스를 빌려 쓴다.
import siteSection from '../SiteSection/SiteSection.module.css'
import styles from './ProductCard.module.css'

/**
 * 고객용 상품 카드(쇼핑몰 목록). 관리자용 AdminCard와는 다른 물건이다.
 * 흰 카드 + 큰 상품컷 + 그린 가격 — 프론트는 라이트 단일 테마다.
 *
 * 비율은 미디어 비율 축(MediaRatio)의 부분집합만 노출한다 — 상품 목록 그리드에서
 * 실제로 쓰이는 4종. 기본값 3x4가 레퍼런스의 세로 상품컷이다.
 */
export type ProductCardRatio = Extract<MediaRatio, '3x4' | '1x1' | '4x3' | '16x9'>

export type ProductCardBadge = {
  label: string
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export type ProductCardProps = {
  image?: string
  /** 브랜드/판매자 — 상품명 위에 작게 */
  brand?: string
  name: string
  /** 한 줄 설명 — 넘치면 말줄임 */
  description?: string
  price: number
  /** 있으면 price에 취소선이 붙고 이 값이 강조된다 */
  salePrice?: number
  badges?: ProductCardBadge[]
  ratio?: ProductCardRatio
  soldOut?: boolean
  onClick?: () => void
  /** 가격·호버 보더 강조색. 기본 success(레퍼런스의 그린) */
  accent?: 'primary' | 'success'
  /**
   * 판 — card=흰 카드(보더 + 라운드, 기본) / plain=판 없음.
   * plain은 상품컷이 이미 누끼(흰 배경)라 보더가 이중 테두리로 보이는 갤러리형 그리드용이다.
   */
  variant?: 'card' | 'plain'
  /** 가격 표기 — won="28,000원"(기본) / symbol="₩28,000" */
  currency?: 'won' | 'symbol'
}

/** 28,000원 / ₩28,000 — 실제 렌더는 tabular-nums라 카드마다 자릿수가 흔들리지 않는다. */
function formatPrice(value: number, currency: NonNullable<ProductCardProps['currency']>): string {
  const amount = value.toLocaleString('ko-KR')
  return currency === 'symbol' ? `₩${amount}` : `${amount}원`
}

export function ProductCard({
  image,
  brand,
  name,
  description,
  price,
  salePrice,
  badges,
  ratio = '3x4',
  soldOut = false,
  onClick,
  accent = 'success',
  variant = 'card',
  currency = 'won',
}: ProductCardProps) {
  const interactive = Boolean(onClick)

  // salePrice가 원가 이상이면 할인이 아니다 — 잘못된 데이터로 취소선이 뜨는 것을 막는다.
  const discounted = salePrice != null && salePrice < price
  const payPrice = discounted ? salePrice : price

  // siteSection.accentSuccess = 강조색 패밀리. 정의를 복사하지 않고 적용만 한다.
  const cardClassName = [
    styles.card,
    variant === 'plain' ? styles.plain : styles.framed,
    accent === 'primary' ? siteSection.accentPrimary : siteSection.accentSuccess,
    interactive ? styles.interactive : '',
    soldOut ? styles.isSoldOut : '',
  ]
    .filter(Boolean)
    .join(' ')

  const mediaClassName = [styles.media, ratioClassName(styles, ratio)].filter(Boolean).join(' ')

  // onClick이 있으면 카드가 버튼처럼 Enter·Space에 반응한다(ImageCard와 동일한 패턴).
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onClick?.()
  }

  return (
    <div
      className={cardClassName}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className={mediaClassName}>
        {image ? (
          <img className={styles.image} src={image} alt={name} />
        ) : (
          <Placeholder kind="image" size="fill" className={styles.placeholder} />
        )}

        {badges != null && badges.length > 0 && (
          <div className={styles.badges}>
            {badges.map((badge) => (
              <Badge
                key={badge.label}
                variant={badge.tone ?? 'primary'}
                appearance="solid"
                size="sm"
                label={badge.label}
              />
            ))}
          </div>
        )}

        {soldOut && (
          <>
            {/* 흰 베일은 장식 — '품절'이라는 정보는 아래 배지가 텍스트로 전달한다 */}
            <div className={styles.veil} aria-hidden="true" />
            <span className={styles.soldOutBadge}>
              <Badge variant="secondary" appearance="solid" size="md" label="품절" />
            </span>
          </>
        )}
      </div>

      <div className={styles.body}>
        {brand != null && brand !== '' && <span className={styles.brand}>{brand}</span>}
        <h3 className={styles.name}>{name}</h3>
        {description != null && description !== '' && (
          <p className={styles.description}>{description}</p>
        )}
        <p className={styles.priceRow}>
          {/* 취소선 원가는 <s>(더 이상 유효하지 않은 값)로 의미까지 전달한다 */}
          {discounted && <s className={styles.originalPrice}>{formatPrice(price, currency)}</s>}
          <span className={styles.price}>{formatPrice(payPrice, currency)}</span>
        </p>
      </div>
    </div>
  )
}
