import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import styles from './DashboardScreen.module.css'
import { AdminPageLayout } from '../AdminPageLayout/AdminPageLayout'
import { PageSection } from '../PageContainer/PageContainer'
import { AdminGrid, AdminGridItem } from '../AdminGrid/AdminGrid'
import { Tab } from '../Tab/Tab'
import { TodoSummary, type TodoSummaryItem } from '../TodoSummary/TodoSummary'
import { AdminChart, type AdminChartProps, type AdminChartSeries } from '../AdminChart/AdminChart'
import { AnalyticsTable, type AnalyticsColumn, type AnalyticsSummary } from '../AnalyticsTable/AnalyticsTable'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { EmptyState } from '../EmptyState/EmptyState'
import { Skeleton } from '../Skeleton/Skeleton'
import { Placeholder, type PlaceholderKind } from '../../shared/placeholders'
import {
  mergeLabels,
  type DeepPartialOneLevel,
  type Formatters,
  type LabelFn,
} from '../../shared/labels'

/** 상단 탭 — 중고 / 렌탈 / 시공 같은 사업 영역 전환 */
export type DashboardTab = {
  value: string
  label: string
}

/** 피드 한 줄 — 아이콘 + 상품명 + 작성자·날짜 */
export type DashboardFeedItem = {
  /** React key 겸 라우팅 키 */
  id: string
  /** 상품명/제목 — 좁아지면 1줄 말줄임 */
  title: string
  author: string
  /** 이미 포맷된 표기 문자열(예: 2026-07-13) — 화면은 포맷을 강제하지 않는다 */
  date: string
  /** 썸네일 URL. 없으면 kind에 맞는 공용 Placeholder를 그린다 */
  thumbnail?: string
  /** 썸네일이 없을 때 쓸 공용 Placeholder 종류 (기본 image) */
  kind?: PlaceholderKind
  onClick?: () => void
}

/** 2열로 놓이는 피드 카드 — 최근 주문 / 판매 신청 */
export type DashboardFeed = {
  key: string
  title: string
  /** 제목 옆 배지 숫자 — 생략하면 배지를 숨긴다 */
  count?: number
  items: DashboardFeedItem[]
  moreLabel?: string
  /** 넘기지 않으면 '더보기'를 숨긴다 */
  onMore?: () => void
  emptyText?: string
}

/** 통계 좌측 차트 — 방문자/페이지뷰 같은 다계열 추이 */
export type DashboardChartData = {
  labels: string[]
  series: AdminChartSeries[]
  height?: number
}

/** 통계 우측 분석표 — 일자별 지표 + 합계 행 */
export type DashboardAnalyticsData = {
  columns: AnalyticsColumn[]
  rows: Record<string, unknown>[]
  summaries?: AnalyticsSummary[]
}

/**
 * 이 화면의 카피는 거의 데이터 주도다 — title·todoTitle·statsTitle은 prop이고,
 * feed.title / feed.moreLabel / feed.emptyText는 피드 데이터가 들고 있다.
 * 여기 남는 건 화면이 스스로 만들어 내는 문구뿐이다(단위·구분자·기본 더보기/빈 문구).
 */
export type DashboardScreenLabels = {
  feed: {
    /** 건수 배지의 스크린리더 이름 — 숫자만으로는 단위를 알 수 없다. 기본 '12건' */
    countAria: LabelFn<string>
    /** 작성자와 날짜 사이 구분자 — 기본 '·' */
    metaSeparator: string
    /** feed.moreLabel이 없을 때의 더보기 버튼 — 기본 '더보기' */
    more: string
    /** feed.emptyText가 없을 때의 빈 목록 문구 — 기본 '표시할 내역이 없습니다' */
    empty: string
  }
}

export const DEFAULT_DASHBOARD_SCREEN_LABELS: DashboardScreenLabels = {
  feed: {
    countAria: (count) => `${count}건`,
    metaSeparator: '·',
    more: '더보기',
    empty: '표시할 내역이 없습니다',
  },
}

export type DashboardScreenProps = {
  title?: string
  description?: string
  /** 상단 우측 액션(기간 선택·새로고침 등) */
  headerActions?: ReactNode
  /** 상단 탭 — 비우면 탭 줄이 사라진다 */
  tabs?: DashboardTab[]
  activeTab?: string
  onTabChange?: (value: string) => void
  /** 오늘의 할일 — items가 없으면 섹션을 통째로 숨긴다 */
  todoTitle?: string
  /** 제목 옆 총건수 — 생략하면 items의 count 합계 */
  todoTotal?: number
  todoItems?: TodoSummaryItem[]
  /** 2열 피드 카드 — 개수에 맞춰 12컬럼 그리드를 나눠 쓴다 */
  feeds?: DashboardFeed[]
  statsTitle?: string
  chartTitle?: string
  /**
   * 차트 종류. AdminChart가 지원하는 값만 받는다.
   * 방문자/페이지뷰 추이는 line(영역 채움)이 어울리지만 현재 AdminChart는 bar/donut만 지원한다 —
   * AdminChart에 line kind가 추가되면 이 prop에 'line'을 넘기기만 하면 된다(화면 수정 불필요).
   */
  chartKind?: AdminChartProps['kind']
  chart?: DashboardChartData
  analytics?: DashboardAnalyticsData
  /** 스켈레톤 — 카드 골격은 유지한 채 내용만 비운다(레이아웃 점프 방지) */
  loading?: boolean
  /** 목록 밀도 — compact 44px / comfortable 56px */
  density?: 'compact' | 'comfortable'
  maxWidth?: 'md' | 'lg' | 'full'
  /** 피드 행 썸네일 — 이미지가 없는 피드(문의·공지)에서 끄면 제목이 왼쪽 끝에 붙는다 */
  showFeedThumbnail?: boolean
  /** 피드 행 메타(작성자 · 날짜) — 제목만 촘촘히 쌓고 싶을 때 끈다 */
  showFeedMeta?: boolean
  /** 더보기 버튼 아이콘 — 기본은 오른쪽 화살표 */
  moreIcon?: ReactNode
  /**
   * 한 줄에 세우는 피드 카드 수 (기본 auto — 피드 개수만큼 12컬럼을 균등 분할).
   * 피드 3개를 2열로 접어 마지막 한 장을 넓게 쓰는 구성처럼, 개수와 열 수를 분리해야 할 때 준다.
   */
  feedColumns?: 1 | 2 | 3 | 4 | 'auto'
  /**
   * 통계 영역의 차트:분석표 비율 (기본 split = 6:6).
   *   chart-first — 8:4. 추이를 크게 보여주는 대시보드.
   *   stacked     — 12:12. 좁은 폭에서 위아래로 쌓는다.
   * 한쪽만 있으면 어느 값이든 남은 폭을 혼자 다 쓴다.
   */
  statsLayout?: 'split' | 'chart-first' | 'stacked'
  /** 피드 카드 크롬 (기본 card) — 이미 카드 안에 임베드할 때 plain으로 이중 보더를 막는다 */
  feedChrome?: 'card' | 'plain'
  labels?: DeepPartialOneLevel<DashboardScreenLabels>
  /** 숫자 표기 — 로케일·자릿수는 문구가 아니라 포맷이다(TodoSummary에도 그대로 내려간다) */
  formatters?: Formatters
}

/** 큰 수도 자릿수 구분 — 배지/합계 표기를 맞춘다 */
const DEFAULT_FORMAT_COUNT: NonNullable<Formatters['number']> = (count) =>
  count.toLocaleString('ko-KR')

/**
 * 피드 개수(또는 지정한 열 수)에 맞춰 12/8컬럼 그리드를 나눈다.
 * 2개면 6/12 · 4/8 — 레퍼런스의 2열 구성이 그대로 나온다.
 */
function feedSpan(total: number): { span: number; spanMd: number } {
  const count = Math.max(1, total)
  return {
    span: Math.max(1, Math.floor(12 / count)),
    spanMd: Math.max(1, Math.floor(8 / count)),
  }
}

/** 통계 영역의 [차트, 분석표] span — 한쪽만 있으면 12(혼자 다 쓴다) */
function statsSpans(layout: NonNullable<DashboardScreenProps['statsLayout']>): [number, number] {
  if (layout === 'chart-first') return [8, 4]
  if (layout === 'stacked') return [12, 12]
  return [6, 6]
}

/** 피드 카드 한 장 — 카드 헤더(제목·배지·더보기) + 촘촘한 목록 */
function FeedCard({
  feed,
  loading,
  showThumbnail,
  showMeta,
  moreIcon,
  chrome,
  labels,
  formatCount,
}: {
  feed: DashboardFeed
  loading: boolean
  showThumbnail: boolean
  showMeta: boolean
  moreIcon: ReactNode
  chrome: 'card' | 'plain'
  labels: DashboardScreenLabels
  formatCount: NonNullable<Formatters['number']>
}) {
  return (
    <PageSection card={chrome === 'card'}>
      <div className={styles.feed}>
        <div className={styles.feedHeader}>
          <h3 className={styles.feedHeading}>{feed.title}</h3>
          {feed.count != null && (
            // 건수 배지 — pill을 직접 그리지 않고 공용 Badge를 쓴다.
            // 숫자만 있으면 단위를 알 수 없어 스크린리더에는 role=img + 'N건'으로 읽어 준다.
            <span
              className={styles.feedCount}
              role="img"
              aria-label={labels.feed.countAria(formatCount(feed.count))}
            >
              <Badge variant="primary" appearance="soft" size="sm" label={formatCount(feed.count)} />
            </span>
          )}
          {feed.onMore != null && (
            // 더보기 — 공용 Button(ghost)에 우측 아이콘 슬롯. 버튼 룩을 카드마다 다시 만들지 않는다
            <span className={styles.more}>
              <Button
                variant="secondary"
                appearance="ghost"
                size="sm"
                label={feed.moreLabel ?? labels.feed.more}
                showRightIcon
                rightIcon={moreIcon}
                onClick={feed.onMore}
              />
            </span>
          )}
        </div>

        {loading ? (
          <ul className={styles.feedList}>
            {/* 실제 행과 같은 높이의 골격 — 로딩이 끝나도 카드 높이가 튀지 않는다 */}
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i} className={styles.feedItem}>
                <span className={styles.feedSkeleton}>
                  <Skeleton variant="block" width={36} height={36} />
                  <span className={styles.feedSkeletonBody}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="35%" />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : feed.items.length === 0 ? (
          <div className={styles.feedEmpty}>
            <EmptyState kind="empty" title={feed.emptyText ?? labels.feed.empty} compact />
          </div>
        ) : (
          <ul className={styles.feedList}>
            {feed.items.map((item) => {
              const interactive = item.onClick != null

              const content = (
                <>
                  {showThumbnail && (
                    <span className={styles.feedThumb} aria-hidden="true">
                      {item.thumbnail != null ? (
                        <img className={styles.feedImage} src={item.thumbnail} alt="" />
                      ) : (
                        <Placeholder kind={item.kind ?? 'image'} size={20} />
                      )}
                    </span>
                  )}
                  <span className={styles.feedBody}>
                    <span className={styles.feedTitle}>{item.title}</span>
                    {showMeta && (
                      <span className={styles.feedMeta}>
                        <span className={styles.feedAuthor}>{item.author}</span>
                        <span className={styles.feedDot} aria-hidden="true">
                          {labels.feed.metaSeparator}
                        </span>
                        <span className={styles.feedDate}>{item.date}</span>
                      </span>
                    )}
                  </span>
                </>
              )

              return (
                <li key={item.id} className={styles.feedItem}>
                  {interactive ? (
                    <button type="button" className={styles.feedButton} onClick={item.onClick}>
                      {content}
                    </button>
                  ) : (
                    <span className={styles.feedStatic}>{content}</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </PageSection>
  )
}

/**
 * 대시보드 화면 — AdminPageLayout으로 조합한다(레이아웃을 직접 짜지 않는다).
 *
 *   ┌ header — 타이틀 + headerActions ┐
 *   ├ tabs — 중고 / 렌탈 / 시공 ──────┤
 *   │ TodoSummary — 오늘의 할일       │
 *   │ AdminGrid — 최근 주문 · 판매신청 │  (12컬럼을 피드 개수로 나눠 씀)
 *   │ PageSection '통계'              │
 *   │   AdminGrid — 차트 6 · 분석표 6  │
 *   └────────────────────────────────┘
 *
 * 데이터가 없는 슬롯(todoItems/feeds/chart/analytics)은 통째로 렌더되지 않는다 —
 * 빈 카드가 남지 않으므로 화면 구성은 순전히 데이터가 결정한다.
 *
 * 밀도는 카페24/아임웹(행 44/56 · 본문 13px), 마감은 Toss(그림자 없이 1px 보더 + 큰 radius).
 * 탭은 제어 컴포넌트다 — activeTab/onTabChange를 넘기지 않으면 첫 탭이 켜진 채 고정된다.
 */
export function DashboardScreen({
  title = '대시보드',
  description,
  headerActions,
  tabs = [],
  activeTab,
  onTabChange,
  todoTitle = '오늘의 할일',
  todoTotal,
  todoItems = [],
  feeds = [],
  statsTitle = '통계',
  chartTitle,
  chartKind = 'bar',
  chart,
  analytics,
  loading = false,
  density = 'compact',
  maxWidth = 'full',
  showFeedThumbnail = true,
  showFeedMeta = true,
  moreIcon = <ChevronRight size={14} aria-hidden="true" />,
  feedColumns = 'auto',
  statsLayout = 'split',
  feedChrome = 'card',
  labels,
  formatters,
}: DashboardScreenProps) {
  const L = mergeLabels(DEFAULT_DASHBOARD_SCREEN_LABELS, labels)
  const formatCount = formatters?.number ?? DEFAULT_FORMAT_COUNT

  const hasTabs = tabs.length > 0
  const hasTodo = todoItems.length > 0
  const hasFeeds = feeds.length > 0
  const hasStats = chart != null || analytics != null

  // 제어 탭 — 넘어온 값이 없으면 첫 탭을 켠 것으로 본다
  const tabValue = activeTab ?? tabs[0]?.value ?? ''
  // auto는 '피드 개수 = 열 수' — 지금까지의 균등 분할 그대로다
  const { span, spanMd } = feedSpan(feedColumns === 'auto' ? feeds.length : feedColumns)

  // 차트/분석표가 한쪽만 있으면 남은 폭을 혼자 다 쓴다
  const [chartSpan, analyticsSpan] = statsSpans(statsLayout)
  const both = chart != null && analytics != null
  const statsSpanMd = 8

  return (
    <AdminPageLayout
      title={title}
      description={description}
      headerActions={headerActions}
      maxWidth={maxWidth}
      density={density}
      tabs={
        hasTabs ? (
          <Tab items={tabs} value={tabValue} onChange={onTabChange} variant="underline" size="md" />
        ) : undefined
      }
    >
      {hasTodo &&
        (loading ? (
          <div className={styles.todoSkeleton}>
            <Skeleton variant="text" lines={1} width="45%" />
          </div>
        ) : (
          <TodoSummary
            title={todoTitle}
            total={todoTotal}
            items={todoItems}
            formatters={formatters}
          />
        ))}

      {hasFeeds && (
        <AdminGrid>
          {feeds.map((feed) => (
            <AdminGridItem key={feed.key} span={span} spanMd={spanMd} spanSm={4}>
              <FeedCard
                feed={feed}
                loading={loading}
                showThumbnail={showFeedThumbnail}
                showMeta={showFeedMeta}
                moreIcon={moreIcon}
                chrome={feedChrome}
                labels={L}
                formatCount={formatCount}
              />
            </AdminGridItem>
          ))}
        </AdminGrid>
      )}

      {hasStats && (
        <PageSection title={statsTitle} card={false}>
          <AdminGrid>
            {chart != null && (
              <AdminGridItem span={both ? chartSpan : 12} spanMd={statsSpanMd} spanSm={4}>
                {/* AdminChart는 카드 크롬이 없다 — PageSection의 카드로 감싼다 */}
                <PageSection card>
                  {loading ? (
                    <Skeleton variant="block" height={chart.height ?? 280} />
                  ) : (
                    <AdminChart
                      kind={chartKind}
                      title={chartTitle}
                      labels={chart.labels}
                      series={chart.series}
                      height={chart.height ?? 280}
                    />
                  )}
                </PageSection>
              </AdminGridItem>
            )}

            {analytics != null && (
              <AdminGridItem span={both ? analyticsSpan : 12} spanMd={statsSpanMd} spanSm={4}>
                {/* AnalyticsTable은 자체 보더/radius를 가진다 — 카드로 또 감싸지 않는다 */}
                {loading ? (
                  <PageSection card>
                    <Skeleton variant="text" lines={8} />
                  </PageSection>
                ) : (
                  <AnalyticsTable
                    columns={analytics.columns}
                    rows={analytics.rows}
                    summaries={analytics.summaries}
                  />
                )}
              </AdminGridItem>
            )}
          </AdminGrid>
        </PageSection>
      )}
    </AdminPageLayout>
  )
}
