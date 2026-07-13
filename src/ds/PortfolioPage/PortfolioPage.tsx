import { useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, MapPin } from 'lucide-react'
import { Button } from '../Button/Button'
import { CategoryTabs } from '../CategoryTabs/CategoryTabs'
import { EmptyState } from '../EmptyState/EmptyState'
import { Image, type MediaRatio } from '../Image/Image'
import { ImageCard } from '../ImageCard/ImageCard'
import { ImagePreview, type ImagePreviewItem } from '../ImagePreview/ImagePreview'
import { Pagination } from '../Pagination/Pagination'
import { SiteSection } from '../SiteSection/SiteSection'
import { Skeleton } from '../Skeleton/Skeleton'
import { Tag } from '../Tag/Tag'
import { Placeholder } from '../../shared/placeholders'
import styles from './PortfolioPage.module.css'

/** 카테고리 탭 항목 — CategoryTabs의 CategoryTabItem과 구조가 같다(그대로 넘긴다). */
export type PortfolioCategory = {
  label: string
  value: string
}

/** 갤러리 이미지 — ImagePreview(라이트박스)의 ImagePreviewItem으로 그대로 매핑된다. */
export type PortfolioImage = {
  url: string
  name?: string
}

export type PortfolioItem = {
  id: string
  title: string
  /** PortfolioCategory.value */
  category: string
  /** 메타 — 연도 */
  year: string
  /** 메타 — 장소 */
  place: string
  /** 한 줄 요약 — 상세 서브카피 */
  summary?: string
  /** 목록 카드 썸네일 — 없으면 공용 Placeholder */
  thumbnail?: string
  /** 상세 대표 이미지 — 없으면 thumbnail으로 폴백 */
  cover?: string
  /** 상세 본문(HTML 문자열) */
  bodyHtml?: string
  /** 상세 갤러리 */
  gallery?: PortfolioImage[]
}

export type PortfolioAccent = 'primary' | 'success'

export type PortfolioPageProps = {
  items: PortfolioItem[]
  categories: PortfolioCategory[]
  category: string
  onCategoryChange: (value: string) => void
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  /** 카드 클릭 — 상세 열기(상세의 이전/다음도 이 콜백으로 이동한다) */
  onOpen?: (item: PortfolioItem) => void
  /** 있으면 목록 대신 상세를 렌더한다 */
  selected?: PortfolioItem | null
  onClose?: () => void
  accent?: PortfolioAccent
  /** 스켈레톤 그리드 */
  loading?: boolean
  /** 히어로 헤드라인 — 노드를 넘기면 Highlight로 일부 단어만 강조할 수 있다 */
  title?: ReactNode
  /** 히어로 서브카피 — 여러 줄이면 노드로 넘긴다 */
  subtitle?: ReactNode
  /** 카드 썸네일 비율 (기본 4x3) */
  ratio?: MediaRatio
  /** 카드 위 카테고리 라벨(에요브로우) ON/OFF */
  showCategory?: boolean
  /** 카드 설명(요약) ON/OFF — item.summary가 있을 때만 그린다 */
  showSummary?: boolean
  /** 한 줄에 세우는 카드 수 (기본 3) */
  columns?: 2 | 3 | 4
}

/** value → 사람이 읽는 카테고리 라벨. 못 찾으면 value를 그대로 보여준다. */
function categoryLabel(categories: PortfolioCategory[], value: string): string {
  return categories.find((c) => c.value === value)?.label ?? value
}

/** 목록 스켈레톤 — 카드 그리드와 같은 리듬(4:3)으로 6칸 */
function PortfolioSkeleton({ columns }: { columns: 2 | 3 | 4 }) {
  return (
    <ul className={[styles.grid, styles[`cols${columns}`]].join(' ')} aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className={styles.skeletonTile}>
          <Skeleton variant="block" height="100%" />
        </li>
      ))}
    </ul>
  )
}

/**
 * 포트폴리오 목록 — SiteSection으로 조합한다(면·최대폭·헤딩은 SiteSection 소관, 라이트 단일 테마).
 * `selected`가 있으면 같은 컴포넌트가 상세(PortfolioDetail)를 렌더한다.
 */
export function PortfolioPage({
  items,
  categories,
  category,
  onCategoryChange,
  page,
  totalPages,
  onPageChange,
  onOpen,
  selected,
  onClose,
  accent = 'success',
  loading = false,
  title = 'Portfolio',
  subtitle = '공간의 쓰임에서 출발한 설계 — 카페·사무실·주거·상업 프로젝트를 소개합니다.',
  ratio = '4x3',
  showCategory = true,
  showSummary = true,
  columns = 3,
}: PortfolioPageProps) {
  // 상세가 선택되면 목록 대신 상세를 그린다. 이전/다음은 현재 목록 순서에서 계산한다.
  if (selected != null) {
    const index = items.findIndex((item) => item.id === selected.id)
    const prev = index > 0 ? items[index - 1] : null
    const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null

    return (
      <PortfolioDetail
        item={selected}
        categories={categories}
        prev={prev}
        next={next}
        onNavigate={onOpen}
        onClose={onClose}
        accent={accent}
      />
    )
  }

  // 스켈레톤 중에는 페이지네이션을 감춘다(아직 확정되지 않은 페이지 수를 보여주지 않는다)
  const hasPagination = !loading && totalPages != null && totalPages > 1
  const isEmpty = !loading && items.length === 0

  return (
    <SiteSection
      accent={accent}
      title={title}
      subtitle={subtitle}
      align="center"
      padding="lg"
      maxWidth="lg"
      // 필터는 히어로 카피 바로 아래 가운데에 선다 — SiteSection의 actions 슬롯이 그 자리다.
      actions={
        <CategoryTabs
          items={categories}
          value={category}
          onChange={onCategoryChange}
          variant="pill"
          align="center"
          addable={false}
        />
      }
    >
      <div className={styles.scope}>
        {loading ? (
          <PortfolioSkeleton columns={columns} />
        ) : isEmpty ? (
          <div className={styles.empty}>
            <EmptyState
              kind="search"
              title="등록된 프로젝트가 없습니다"
              description="다른 카테고리를 선택해 보세요."
            />
          </div>
        ) : (
          <ul className={[styles.grid, styles[`cols${columns}`]].join(' ')}>
            {items.map((item) => (
              <li key={item.id} className={styles.tile}>
                {/* 분류(에요브로우) → 제목 → 요약 — ImageCard의 below 배치를 그대로 재사용한다 */}
                <ImageCard
                  image={item.thumbnail}
                  eyebrow={showCategory ? categoryLabel(categories, item.category) : undefined}
                  title={item.title}
                  description={showSummary ? item.summary : undefined}
                  ratio={ratio}
                  layout="below"
                  fill
                  onClick={onOpen == null ? undefined : () => onOpen(item)}
                />
              </li>
            ))}
          </ul>
        )}

        {hasPagination && (
          <Pagination
            page={page ?? 1}
            totalPages={totalPages}
            onChange={onPageChange}
            shape="circle"
            align="center"
          />
        )}
      </div>
    </SiteSection>
  )
}

export type PortfolioDetailProps = {
  item: PortfolioItem
  categories?: PortfolioCategory[]
  /** 이전/다음 프로젝트 — 없으면 해당 방향 버튼을 비운다 */
  prev?: PortfolioItem | null
  next?: PortfolioItem | null
  onNavigate?: (item: PortfolioItem) => void
  /** 목록으로 돌아가기 */
  onClose?: () => void
  accent?: PortfolioAccent
}

/**
 * 포트폴리오 상세 — 대표 이미지 + 메타 + 본문 HTML + 갤러리(ImagePreview 라이트박스) + 이전/다음.
 * PortfolioPage가 `selected`일 때 이걸 렌더하지만, 라우팅이 나뉜 사이트를 위해 단독으로도 내보낸다.
 */
export function PortfolioDetail({
  item,
  categories = [],
  prev,
  next,
  onNavigate,
  onClose,
  accent = 'success',
}: PortfolioDetailProps) {
  // 라이트박스 — null이면 닫힘
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const gallery = item.gallery ?? []
  const previewItems: ImagePreviewItem[] = gallery.map((image) => ({
    url: image.url,
    name: image.name ?? item.title,
    kind: 'image',
  }))

  return (
    <SiteSection
      accent={accent}
      title={item.title}
      subtitle={item.summary}
      divider
      actions={
        <Button
          variant="secondary"
          appearance="outline"
          size="sm"
          label="목록으로"
          showLeftIcon
          leftIcon={<ArrowLeft size={14} aria-hidden="true" />}
          onClick={onClose}
        />
      }
    >
      <div className={styles.scope}>
        {/* 메타 — 카테고리·연도·장소 */}
        <div className={styles.meta}>
          <Tag
            label={categoryLabel(categories, item.category)}
            tone={accent === 'primary' ? 'primary' : 'success'}
            size="sm"
          />
          <span className={styles.metaItem}>
            <CalendarDays size={14} aria-hidden="true" />
            {item.year}
          </span>
          <span className={styles.metaItem}>
            <MapPin size={14} aria-hidden="true" />
            {item.place}
          </span>
        </div>

        {/* 대표 이미지 — src가 없으면 Image가 공용 Placeholder로 채운다 */}
        <div className={styles.hero}>
          <Image src={item.cover ?? item.thumbnail} alt={item.title} ratio="16x9" rounded />
        </div>

        {/* 본문 — 에디터가 저장한 HTML */}
        {item.bodyHtml != null && item.bodyHtml !== '' && (
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
        )}

        {/* 갤러리 — 클릭하면 ImagePreview 라이트박스 */}
        {gallery.length > 0 && (
          <section className={styles.gallery}>
            <h3 className={styles.galleryTitle}>Gallery</h3>
            <ul className={styles.galleryGrid}>
              {gallery.map((image, i) => (
                <li key={`${image.url}-${i}`} className={styles.galleryItem}>
                  <button
                    type="button"
                    className={styles.galleryButton}
                    onClick={() => setPreviewIndex(i)}
                    aria-label={`${image.name ?? item.title} 확대 보기`}
                  >
                    {image.url ? (
                      <img
                        className={styles.galleryImage}
                        src={image.url}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <Placeholder kind="image" size="fill" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 이전/다음 */}
        <nav className={styles.navRow} aria-label="프로젝트 이동">
          {prev == null ? (
            <span className={styles.navSpacer} aria-hidden="true" />
          ) : (
            <button
              type="button"
              className={styles.navCard}
              onClick={() => onNavigate?.(prev)}
            >
              <span className={styles.navEyebrow}>
                <ArrowLeft size={14} aria-hidden="true" />
                PREV
              </span>
              <span className={styles.navTitle}>{prev.title}</span>
            </button>
          )}

          {next == null ? (
            <span className={styles.navSpacer} aria-hidden="true" />
          ) : (
            <button
              type="button"
              className={`${styles.navCard} ${styles.navNext}`}
              onClick={() => onNavigate?.(next)}
            >
              <span className={styles.navEyebrow}>
                NEXT
                <ArrowRight size={14} aria-hidden="true" />
              </span>
              <span className={styles.navTitle}>{next.title}</span>
            </button>
          )}
        </nav>

        <ImagePreview
          open={previewIndex !== null}
          items={previewItems}
          index={previewIndex ?? 0}
          onIndexChange={setPreviewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      </div>
    </SiteSection>
  )
}
