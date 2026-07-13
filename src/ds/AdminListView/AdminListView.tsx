import type { CSSProperties, ReactNode } from 'react'
import styles from './AdminListView.module.css'
import { ViewSwitch, type ViewSwitchValue } from '../ViewSwitch/ViewSwitch'
import { Pagination } from '../Pagination/Pagination'
import { EmptyState } from '../EmptyState/EmptyState'
import {
  mergeLabels,
  resolveLabel,
  type DeepPartialOneLevel,
  type EmptyLabels,
  type Formatters,
  type TotalLabels,
} from '../../shared/labels'

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   우선순위: 개별 prop(totalLabel·totalUnit·emptyText·emptyDescription) > labels.* > 기본값. */
type AdminListViewLabelsResolved = {
  /** '전체 12건' — prefix가 null이면 접두사 없이 숫자만 */
  total: TotalLabels & { prefix: string | null; unit: string }
  /** actionLabel을 주면 빈 화면에 CTA 버튼이 뜬다(onEmptyAction과 짝) */
  empty: EmptyLabels & { title: string; description: string }
}

export const DEFAULT_ADMIN_LIST_VIEW_LABELS: AdminListViewLabelsResolved = {
  total: {
    prefix: '전체',
    unit: '건',
  },
  empty: {
    title: '등록된 항목이 없습니다.',
    description: '필터를 바꾸거나 새 항목을 등록해 보세요.',
  },
} as const

export type AdminListViewLabels = DeepPartialOneLevel<AdminListViewLabelsResolved>

/** 기본 숫자 포맷 — formatters.number로 갈아끼운다 */
const defaultNumberFormat = (value: number): string => value.toLocaleString('ko-KR')

export type AdminListViewProps = {
  view: ViewSwitchValue
  onViewChange: (view: ViewSwitchValue) => void
  /** 좌측 '전체 N건' — 없으면 숨긴다 */
  total?: number
  /** 상단 바 좌측 슬롯 — 검색/필터 등 */
  toolbar?: ReactNode
  /** 게시물형 본문 — 테이블/게시판 컴포넌트를 주입한다 */
  renderBoard: () => ReactNode
  /** 카드형 본문 — AdminCard 목록을 반환하면 그리드에 자동 배치된다 */
  renderCards: () => ReactNode
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  /** true면 본문 대신 EmptyState */
  empty?: boolean
  /** @deprecated labels.empty.title 을 쓰세요 (개별 prop이 labels보다 우선한다) */
  emptyText?: string
  /** @deprecated labels.empty.description 을 쓰세요 */
  emptyDescription?: string
  /**
   * 빈 상태 그림 — 데이터 0건('empty')과 검색 결과 0건('search')·오류('error')를 구분한다.
   * 기본 'empty'(= 지금 화면 그대로).
   */
  emptyKind?: 'empty' | 'search' | 'error'
  /** 빈 화면의 CTA — labels.empty.actionLabel과 짝이어야 버튼이 뜬다 */
  onEmptyAction?: () => void
  /** 카드 그리드 최대 열 수 — 넓은 화면에서 카드가 잘게 쪼개지지 않게 상한을 건다(기본 5) */
  maxColumns?: number
  /** 카드 최소 폭 px — 좁아지면 이 폭을 지키며 열 수가 줄어든다(기본 280) */
  cardMinWidth?: number
  /** 우상단 카드형/게시물형 전환 — 한 가지 뷰만 쓰는 화면에서 끈다(view는 그대로 존중된다) */
  showViewSwitch?: boolean
  /** 뷰 전환 버튼 크기 — 좁은 툴바에서 sm으로 줄인다 */
  viewSwitchSize?: 'sm' | 'md'
  /** 뷰 전환 버튼의 글자 — 끄면 아이콘 전용(접근성 이름은 남는다) */
  showViewSwitchLabel?: boolean
  /** 좌측 '전체 N건' — total을 넘겼더라도 숨기고 싶을 때 끈다 */
  showTotal?: boolean
  /** @deprecated labels.total.prefix 를 쓰세요 */
  totalLabel?: string
  /** @deprecated labels.total.unit 을 쓰세요 */
  totalUnit?: string
  /**
   * 페이지네이션 정렬 — 사이트형(가운데·기본) / 어드민형(좌측) / 우측.
   * 기본 'center'는 지금까지 푸터가 감싸서 가운데로 밀던 동작을 그대로 옮긴 것이다.
   */
  paginationAlign?: 'start' | 'center' | 'end'
  /** 화면 문구를 통째로 갈아끼우는 단일 통로 — 개별 카피 prop이 우선한다 */
  labels?: AdminListViewLabels
  /** 건수 포맷(문구가 아니라 포맷이다) */
  formatters?: Formatters
}

export function AdminListView({
  view,
  onViewChange,
  total,
  toolbar,
  renderBoard,
  renderCards,
  page,
  totalPages,
  onPageChange,
  empty = false,
  // 기본 문구는 DEFAULT_ADMIN_LIST_VIEW_LABELS가 갖는다 — 여기서 기본값을 주면
  // 넘기지 않은 개별 prop이 labels를 항상 이겨 통로가 막힌다.
  emptyText,
  emptyDescription,
  emptyKind = 'empty',
  onEmptyAction,
  maxColumns = 5,
  cardMinWidth = 280,
  showViewSwitch = true,
  viewSwitchSize = 'md',
  showViewSwitchLabel = true,
  showTotal = true,
  totalLabel,
  totalUnit,
  paginationAlign = 'center',
  labels,
  formatters,
}: AdminListViewProps) {
  const L = mergeLabels(DEFAULT_ADMIN_LIST_VIEW_LABELS, labels)
  const formatNumber = formatters?.number ?? defaultNumberFormat

  // 건수 표기 — 개별 prop이 있으면 그것이 이긴다(prefix는 null이면 접두사 없이 숫자만)
  const totalPrefix = resolveLabel(totalLabel, L.total.prefix)
  const totalSuffix = resolveLabel(totalUnit, L.total.unit)

  // 비어 있으면 페이지네이션도 의미가 없다
  const showPagination =
    !empty && page != null && totalPages != null && totalPages > 1

  // 그리드 열 상한/최소 폭은 CSS 커스텀 프로퍼티로 넘긴다(계산식은 CSS 쪽에 있다)
  const gridStyle = {
    '--admin-card-cols': maxColumns,
    '--admin-card-min': `${cardMinWidth}px`,
  } as CSSProperties

  return (
    <div className={styles.adminListView}>
      {/*
       * 상단 바를 공용 ListToolbar로 대체하지 않는 이유:
       * ListToolbar의 좌측은 selects/search라는 정해진 구조만 받는데, 여기 toolbar는 무엇이든 꽂는
       * 자유 슬롯(ReactNode)이다. 갈아끼우면 toolbar prop이 갈 곳이 없어져 호출부가 깨지고,
       * '전체 N건'(totalLabel) 표기도 ListToolbar('N건')에는 없다. 툴바 자체가 필요하면
       * toolbar 슬롯에 ListToolbar를 넣어 쓰면 된다 — 그게 이 슬롯의 용도다.
       */}
      <div className={styles.topbar}>
        <div className={styles.left}>
          {showTotal && total != null && (
            <span className={styles.total}>
              {/* count를 주면 접두사·단위·강조를 호출부가 통째로 가져간다 */}
              {L.total.count != null ? (
                L.total.count(total)
              ) : (
                <>
                  {totalPrefix != null && totalPrefix !== '' && <>{totalPrefix} </>}
                  <span className={styles.totalCount}>{formatNumber(total)}</span>
                  {totalSuffix}
                </>
              )}
            </span>
          )}
          {toolbar != null && <div className={styles.toolbar}>{toolbar}</div>}
        </div>
        <div className={styles.right}>
          {showViewSwitch && (
            <ViewSwitch
              value={view}
              onChange={onViewChange}
              size={viewSwitchSize}
              showLabel={showViewSwitchLabel}
            />
          )}
        </div>
      </div>

      {empty ? (
        <div className={styles.empty}>
          <EmptyState
            kind={emptyKind}
            title={
              resolveLabel(emptyText, L.empty.title) ?? DEFAULT_ADMIN_LIST_VIEW_LABELS.empty.title
            }
            description={resolveLabel(emptyDescription, L.empty.description)}
            actionLabel={L.empty.actionLabel}
            onAction={onEmptyAction}
          />
        </div>
      ) : view === 'card' ? (
        // 카드형 — 컨테이너 폭에 따라 열 수 자동 조정(최소 280px, 최대 maxColumns열)
        <div className={styles.cardGrid} style={gridStyle}>
          {renderCards()}
        </div>
      ) : (
        // 게시물형 — 주입된 테이블/게시판을 그대로 렌더
        renderBoard()
      )}

      {showPagination && (
        <div className={styles.footer}>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={onPageChange}
            align={paginationAlign}
          />
        </div>
      )}
    </div>
  )
}
