import type { CSSProperties, ReactNode } from 'react'
import styles from './AdminListView.module.css'
import { ViewSwitch, type ViewSwitchValue } from '../ViewSwitch/ViewSwitch'
import { Pagination } from '../Pagination/Pagination'
import { EmptyState } from '../EmptyState/EmptyState'

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
  emptyText?: string
  /** 빈 상태 보조 문구 — 다음 행동을 안내한다 */
  emptyDescription?: string
  /** 카드 그리드 최대 열 수 — 넓은 화면에서 카드가 잘게 쪼개지지 않게 상한을 건다(기본 5) */
  maxColumns?: number
  /** 카드 최소 폭 px — 좁아지면 이 폭을 지키며 열 수가 줄어든다(기본 280) */
  cardMinWidth?: number
  /** 우상단 카드형/게시물형 전환 — 한 가지 뷰만 쓰는 화면에서 끈다(view는 그대로 존중된다) */
  showViewSwitch?: boolean
  /** 좌측 '전체 N건' — total을 넘겼더라도 숨기고 싶을 때 끈다 */
  showTotal?: boolean
  /** 건수 앞 말 — 기본 '전체' → "전체 12건" */
  totalLabel?: string
  /** 건수 단위 — 기본 '건'. 상품이면 '개'처럼 바꾼다 */
  totalUnit?: string
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
  emptyText = '등록된 항목이 없습니다.',
  emptyDescription = '필터를 바꾸거나 새 항목을 등록해 보세요.',
  maxColumns = 5,
  cardMinWidth = 280,
  showViewSwitch = true,
  showTotal = true,
  totalLabel = '전체',
  totalUnit = '건',
}: AdminListViewProps) {
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
              {totalLabel}{' '}
              <span className={styles.totalCount}>{total.toLocaleString('ko-KR')}</span>
              {totalUnit}
            </span>
          )}
          {toolbar != null && <div className={styles.toolbar}>{toolbar}</div>}
        </div>
        <div className={styles.right}>
          {showViewSwitch && <ViewSwitch value={view} onChange={onViewChange} />}
        </div>
      </div>

      {empty ? (
        <div className={styles.empty}>
          <EmptyState title={emptyText} description={emptyDescription} />
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
          <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
        </div>
      )}
    </div>
  )
}
