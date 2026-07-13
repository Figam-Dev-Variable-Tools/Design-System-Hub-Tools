import type { ReactNode } from 'react'
import { CategoryTabs } from '../CategoryTabs/CategoryTabs'
import { EmptyState } from '../EmptyState/EmptyState'
import { Pagination } from '../Pagination/Pagination'
import { ProductCard, type ProductCardRatio } from '../ProductCard/ProductCard'
import { SiteSection } from '../SiteSection/SiteSection'
import { Skeleton } from '../Skeleton/Skeleton'
import { SortBar, type SortBarSelect } from '../SortBar/SortBar'
import { ViewSwitch, type ViewSwitchValue } from '../ViewSwitch/ViewSwitch'
import type { SelectOption } from '../Select/Select'
import styles from './ShopPage.module.css'

/** 목록에 뿌리는 상품 한 건 — 카드가 그리는 것 이상은 담지 않는다. */
export type ShopItem = {
  id: string
  image?: string
  brand?: string
  name: string
  description?: string
  price: number
  /** 있으면 price에 취소선이 붙고 이 값이 강조된다(ProductCard 규칙) */
  salePrice?: number
  soldOut?: boolean
}

export type ShopCategory = {
  label: string
  value: string
}

export type ShopPageProps = {
  items: ShopItem[]
  /** 상단 카테고리 탭 — 전체 / 조경석 / 수목 … */
  categories: ShopCategory[]
  category: string
  onCategoryChange: (value: string) => void
  sort: string
  onSortChange: (value: string) => void
  /** 정렬 Select 옵션(기본: 최신순·인기순·가격순) */
  sortOptions?: SelectOption[]
  /** 있으면 '서비스별' Select를 함께 노출한다 */
  service?: string
  onServiceChange?: (value: string) => void
  serviceOptions?: SelectOption[]
  /** 있으면 정렬 Select 왼쪽에 카드형/게시물형 뷰 스위치를 노출한다 */
  view?: ViewSwitchValue
  onViewChange?: (value: ViewSwitchValue) => void
  /** 총 개수 — 없으면 현재 페이지의 items 수 */
  total?: number
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  /** 로딩 중이면 그리드 자리에 Skeleton 카드가 깔린다 */
  loading?: boolean
  onOpen?: (item: ShopItem) => void
  /** 강조색 — 활성 탭 밑줄·가격·현재 페이지. 기본 success(레퍼런스의 그린) */
  accent?: 'primary' | 'success'
  /** 히어로 헤드라인 — 노드를 넘기면 Highlight로 일부 단어만 강조할 수 있다 */
  title?: ReactNode
  /** 히어로 서브카피 */
  subtitle?: ReactNode
  /** 한 줄에 세우는 카드 수 (기본 4). 게시물형(view='board')에서는 2열로 내려간다. */
  columns?: 3 | 4 | 5
  /** 카드 판 — plain=보더 없음(누끼 상품컷·기본) / card=흰 카드(보더) */
  cardVariant?: 'card' | 'plain'
  /** 카드 상품컷 비율 (기본 3x4) */
  ratio?: ProductCardRatio
  /** 가격 표기 — symbol="₩28,000"(기본) / won="28,000원" */
  currency?: 'won' | 'symbol'
  /** 카드의 브랜드 줄 ON/OFF */
  showBrand?: boolean
  /** 카드의 한 줄 설명 ON/OFF */
  showDescription?: boolean
}

const DEFAULT_SORT_OPTIONS: SelectOption[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'priceAsc', label: '낮은 가격순' },
  { value: 'priceDesc', label: '높은 가격순' },
]

const DEFAULT_SERVICE_OPTIONS: SelectOption[] = [
  { value: 'all', label: '서비스별' },
  { value: 'delivery', label: '배송 설치' },
  { value: 'care', label: '정기 관리' },
  { value: 'rental', label: '렌탈' },
]

/** 로딩 카드 수 — 4열 기준 2줄. 실제 개수를 모르는 상태이므로 고정값이다. */
const SKELETON_COUNT = 8

/** 로딩 자리표시 카드 — ProductCard와 같은 골격(상품컷 + 본문 3줄). */
function ProductCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonMedia}>
        <Skeleton variant="block" width="100%" height="100%" />
      </div>
      <div className={styles.skeletonBody}>
        <Skeleton variant="text" lines={3} />
      </div>
    </div>
  )
}

/**
 * 쇼핑 상품 목록 페이지 — **흰 배경** + 누끼 상품컷 + 그린 가격.
 *
 * 조립만 한다 — 직접 그리는 마크업은 그리드 뿐이다.
 *   히어로            → SiteSection align="center"
 *   카테고리 필터     → CategoryTabs(underline · 가운데 · 가로선 없음)
 *   개수/뷰/정렬 툴바 → SortBar(+ ViewSwitch)
 *   카드              → ProductCard(plain)
 *   페이지네이션      → Pagination(circle · 가운데)
 */
export function ShopPage({
  items,
  categories,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  sortOptions = DEFAULT_SORT_OPTIONS,
  service,
  onServiceChange,
  serviceOptions = DEFAULT_SERVICE_OPTIONS,
  view = 'card',
  onViewChange,
  total,
  page = 1,
  totalPages,
  onPageChange,
  loading = false,
  onOpen,
  accent = 'success',
  title = '공간을 완성하는 프리미엄 조경 상품을 소개합니다.',
  subtitle = '자연의 아름다움을 당신의 일상으로 들여오세요. 엄선된 소재와 감각적인 디자인으로 완성된 최고의 조경 아이템들을 만나보세요. 각 상품은 전문가의 안목으로 선별되어 최상의 퀄리티를 보장합니다.',
  columns = 4,
  cardVariant = 'plain',
  ratio = '3x4',
  currency = 'symbol',
  showBrand = true,
  showDescription = true,
}: ShopPageProps) {
  const totalCount = total ?? items.length
  const isEmpty = !loading && items.length === 0
  // 페이지가 하나뿐이면 페이지네이션을 그리지 않는다(빈 목록·로딩 중도 마찬가지)
  const showPagination = !loading && !isEmpty && totalPages != null && totalPages > 1

  // 게시물형은 카드를 크게 본다 — 열을 2개로 줄인다(카드 자체는 같은 ProductCard다).
  const gridColumns = view === 'board' ? 2 : columns

  // 정렬은 항상, 서비스는 콜백이 있을 때만 — SortBar가 Select를 그린다(직접 구현 금지)
  const selects: SortBarSelect[] = [
    { key: 'sort', value: sort, options: sortOptions, onChange: onSortChange },
  ]
  if (onServiceChange != null) {
    selects.push({
      key: 'service',
      value: service ?? '',
      options: serviceOptions,
      onChange: onServiceChange,
    })
  }

  return (
    <SiteSection
      accent={accent}
      title={title}
      subtitle={subtitle}
      align="center"
      padding="lg"
      // 필터는 히어로 카피 바로 아래 가운데 — 면 경계(가로선)는 두지 않는다.
      actions={
        <CategoryTabs
          items={categories}
          value={category}
          onChange={onCategoryChange}
          align="center"
          rule={false}
          addable={false}
        />
      }
    >
      <div className={styles.root}>
        {/* 좌 "총 24개의 상품이 있습니다." · 우 [뷰 전환] [인기순 ▾] */}
        <SortBar
          total={totalCount}
          totalLabel="총"
          totalSuffix="의 상품이 있습니다."
          selects={selects}
          leadingActions={
            onViewChange != null ? (
              // 툴바가 좁아 아이콘만 남긴다(라벨은 aria-label로 남는다)
              <ViewSwitch value={view} onChange={onViewChange} size="sm" showLabel={false} />
            ) : undefined
          }
        />

        {isEmpty ? (
          <div className={styles.empty}>
            <EmptyState
              kind="search"
              title="조건에 맞는 상품이 없습니다"
              description="카테고리나 정렬 조건을 바꿔 다시 찾아보세요."
            />
          </div>
        ) : (
          <div className={[styles.grid, styles[`cols${gridColumns}`]].join(' ')}>
            {loading
              ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <ProductCardSkeleton key={index} />
                ))
              : items.map((item) => (
                  <ProductCard
                    key={item.id}
                    image={item.image}
                    brand={showBrand ? item.brand : undefined}
                    name={item.name}
                    description={showDescription ? item.description : undefined}
                    price={item.price}
                    salePrice={item.salePrice}
                    soldOut={item.soldOut}
                    ratio={ratio}
                    variant={cardVariant}
                    currency={currency}
                    accent={accent}
                    onClick={onOpen != null ? () => onOpen(item) : undefined}
                  />
                ))}
          </div>
        )}

        {showPagination && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={onPageChange}
            siblingCount={2}
            shape="circle"
            align="center"
          />
        )}
      </div>
    </SiteSection>
  )
}
