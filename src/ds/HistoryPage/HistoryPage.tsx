import type { ReactNode } from 'react'
import styles from './HistoryPage.module.css'
import { EmptyState } from '../EmptyState/EmptyState'
import { EraTimeline, type EraGroup } from '../EraTimeline/EraTimeline'
import { SiteSection } from '../SiteSection/SiteSection'
import { Skeleton } from '../Skeleton/Skeleton'
import type { MediaRatio } from '../Image/Image'

/** 연혁 한 줄 — 월(선택) + 제목 + 설명(선택) */
export type HistoryItem = {
  /** '5월'처럼 사람이 읽는 문자열. 연도는 그룹에서 온다 */
  month?: string
  title: string
  description?: string
}

/** 연대 그룹 — 렌더 순서는 props 배열 순서를 그대로 따른다(오름/내림 모두 호출자 결정) */
export type HistoryGroup = {
  /** '2019'처럼 연도만. 화면의 머리글은 eraSuffix가 붙어 '2019년 대'가 된다 */
  year: string
  /** 그 연대의 대표 사진 — 없으면 공용 Placeholder */
  image?: string
  items: HistoryItem[]
}

export type HistoryPageProps = {
  groups: HistoryGroup[]
  /** 강조색 — 헤드라인 강조어·레일 점 (기본 success) */
  accent?: 'primary' | 'success'
  /** 히어로 헤드라인 — 노드를 넘기면 Highlight로 일부 단어만 강조할 수 있다 */
  title?: ReactNode
  /** 히어로 서브카피 — 여러 줄이면 노드로 넘긴다 */
  subtitle?: ReactNode
  /** 연대 머리글 접미사 — year='2019' + '년 대' → '2019년 대' */
  eraSuffix?: string
  /** 한 줄에 세우는 연대 칸 수 (기본 4) */
  columns?: 2 | 3 | 4
  /** 대표 사진 비율 (기본 1x1) */
  ratio?: MediaRatio
  /** 연대별 사진 ON/OFF */
  showImage?: boolean
  /** 항목 부연 설명 ON/OFF */
  showDescription?: boolean
  /** 머리글 아래 레일(점 + 가로선) ON/OFF */
  showRail?: boolean
  /** 데이터 로딩 중이면 스켈레톤 */
  loading?: boolean
  /** 데이터가 없을 때 문구 */
  emptyTitle?: string
  emptyDescription?: string
}

/**
 * 연혁(History) 페이지. 라이트(흰색) 단일 테마다.
 *
 * 조립만 한다 — 직접 그리는 마크업이 없다.
 *   히어로(가운데 헤드라인 + 여러 줄 카피) → SiteSection align="center"
 *   연대별 표기(머리글·레일·사진·항목)      → EraTimeline
 *   빈/로딩                                  → EmptyState · Skeleton
 * 연혁 표기를 EraTimeline으로 떼어낸 덕에, 회사소개 등 다른 페이지에서도 같은 표기를 쓸 수 있다.
 */
export function HistoryPage({
  groups,
  accent = 'success',
  title = 'History',
  subtitle = '작은 사무실에서 시작해 지금까지 걸어온 길입니다.',
  eraSuffix = '년 대',
  columns = 4,
  ratio = '1x1',
  showImage = true,
  showDescription = true,
  showRail = true,
  loading = false,
  emptyTitle = '등록된 연혁이 없습니다.',
  emptyDescription = '연혁이 등록되면 연대별로 이곳에 표시됩니다.',
}: HistoryPageProps) {
  return (
    <SiteSection
      accent={accent}
      title={title}
      subtitle={subtitle}
      align="center"
      maxWidth="lg"
      padding="lg"
    >
      {loading ? (
        <HistorySkeleton columns={columns} />
      ) : groups.length === 0 ? (
        <EmptyState kind="empty" title={emptyTitle} description={emptyDescription} />
      ) : (
        <EraTimeline
          groups={groups.map((group) => toEraGroup(group, eraSuffix))}
          columns={columns}
          ratio={ratio}
          showImage={showImage}
          showDescription={showDescription}
          showRail={showRail}
          accent={accent}
        />
      )}
    </SiteSection>
  )
}

/**
 * 연혁 그룹 → EraTimeline 칸.
 * 머리글은 '2019' + '년 대', 항목의 시점은 '2019년 5월'로 편다 —
 * 칸이 접혀 아래로 내려가도 항목만 보고 연·월을 알 수 있다.
 */
function toEraGroup(group: HistoryGroup, eraSuffix: string): EraGroup {
  return {
    era: `${group.year}${eraSuffix}`,
    image: group.image,
    entries: group.items.map((item) => ({
      date: item.month != null ? `${group.year}년 ${item.month}` : `${group.year}년`,
      title: item.title,
      description: item.description,
    })),
  }
}

/** 로딩 — 연대 칸 골격(머리글·사진·항목 2줄)을 columns 수만큼 */
function HistorySkeleton({ columns }: { columns: 2 | 3 | 4 }) {
  return (
    <div className={[styles.skeleton, styles[`cols${columns}`]].join(' ')} aria-busy="true">
      {Array.from({ length: columns }, (_, index) => (
        <div key={index} className={styles.skeletonEra}>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="block" height={200} />
          <Skeleton variant="text" lines={3} />
        </div>
      ))}
    </div>
  )
}
