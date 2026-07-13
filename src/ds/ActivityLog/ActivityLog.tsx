import type { ReactNode } from 'react'
import {
  MessageSquare,
  ShoppingCart,
  Package,
  UserPlus,
  Settings,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { EmptyState } from '../EmptyState/EmptyState'
import styles from './ActivityLog.module.css'

export type ActivityItem = {
  id: string
  type: 'inquiry' | 'order' | 'product' | 'member' | 'system'
  actor: string
  action: string
  target?: string
  at: string
  unread?: boolean
}

export type ActivityLogProps = {
  items: ActivityItem[]
  title?: string
  max?: number
  onItemClick?: (item: ActivityItem) => void
  onViewAll?: () => void
  emptyText?: string
  compact?: boolean
  /** 제목 줄(제목 + 전체보기) — 이미 카드 제목이 있는 자리에 끼울 때 끈다 */
  showHeader?: boolean
  /** 타입별 원형 아이콘 — 문장만 촘촘히 쌓고 싶을 때 끈다 */
  showIcon?: boolean
  /** '3분 전' 상대 시간 — 시간이 의미 없는 목록(설정 이력 등)에서 끈다 */
  showTime?: boolean
  /** 미읽음 점 — 읽음 상태를 다루지 않는 화면에서 끈다 */
  showUnreadDot?: boolean
  /** 전체보기 문구 — 라우팅 대상에 맞춰 바꾼다 */
  viewAllLabel?: string
  /** 미읽음 점의 스크린리더 이름 — 점만으로는 뜻이 전달되지 않는다 */
  unreadLabel?: string
  /** 전체보기 아이콘 — 기본은 오른쪽 화살표 */
  viewAllIcon?: ReactNode
  /** 타입별 아이콘 교체 — 넘긴 타입만 TYPE_META 기본 아이콘을 덮어쓴다(톤은 그대로) */
  typeIcons?: Partial<Record<ActivityItem['type'], ReactNode>>
}

/** 타입별 아이콘 + 톤 매핑 */
const TYPE_META: Record<ActivityItem['type'], { icon: LucideIcon; tone: string }> = {
  inquiry: { icon: MessageSquare, tone: 'primary' },
  order: { icon: ShoppingCart, tone: 'success' },
  product: { icon: Package, tone: 'secondary' },
  member: { icon: UserPlus, tone: 'warning' },
  system: { icon: Settings, tone: 'error' },
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * ISO 문자열을 "3분 전" 같은 상대 시간으로 변환한다.
 * 7일이 넘어가면 절대 날짜(2026. 7. 1.)로 표시한다.
 */
export function formatRelativeTime(at: string, now: Date = new Date()): string {
  const then = new Date(at)
  const time = then.getTime()
  if (Number.isNaN(time)) return at

  const diff = now.getTime() - time
  if (diff < 0) return '방금 전'
  if (diff < MINUTE) return '방금 전'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}일 전`
  return then.toLocaleDateString('ko-KR')
}

export function ActivityLog({
  items,
  title = '최근 활동',
  max,
  onItemClick,
  onViewAll,
  emptyText = '아직 활동 내역이 없습니다.',
  compact = false,
  showHeader = true,
  showIcon = true,
  showTime = true,
  showUnreadDot = true,
  viewAllLabel = '전체보기',
  unreadLabel = '읽지 않음',
  viewAllIcon,
  typeIcons,
}: ActivityLogProps) {
  const visible = max != null ? items.slice(0, max) : items
  const rootClass = [styles.card, compact ? styles.compact : ''].filter(Boolean).join(' ')

  return (
    <section className={rootClass}>
      {showHeader && (
        <header className={styles.head}>
          <h3 className={styles.title}>{title}</h3>
          {onViewAll != null && (
            <button type="button" className={styles.viewAll} onClick={onViewAll}>
              {viewAllLabel}
              {viewAllIcon ?? <ChevronRight size={14} aria-hidden="true" />}
            </button>
          )}
        </header>
      )}

      {visible.length === 0 ? (
        // 빈 상태는 공용 EmptyState 하나로 통일한다 — 그림/문구/여백을 여기서 다시 만들지 않는다
        <div className={styles.empty}>
          <EmptyState title={emptyText} compact />
        </div>
      ) : (
        <ul className={styles.list}>
          {visible.map((item) => {
            const { icon: Icon, tone } = TYPE_META[item.type]
            const clickable = onItemClick != null
            // 타입 아이콘 교체 슬롯 — 넘어온 게 없으면 TYPE_META의 기본 lucide 아이콘
            const typeIcon = typeIcons?.[item.type] ?? <Icon size={compact ? 14 : 16} />

            // 클릭 가능하면 버튼, 아니면 정적 div — 접근성상 역할을 분리한다
            const content = (
              <>
                {showIcon && (
                  <span className={[styles.icon, styles[tone]].join(' ')} aria-hidden="true">
                    {typeIcon}
                  </span>
                )}
                <span className={styles.body}>
                  <span className={styles.sentence}>
                    <strong className={styles.actor}>{item.actor}</strong>님이{' '}
                    {item.target != null && <span className={styles.target}>{item.target} </span>}
                    {item.action}
                  </span>
                  {showTime && <span className={styles.time}>{formatRelativeTime(item.at)}</span>}
                </span>
                {showUnreadDot && item.unread === true && (
                  <span className={styles.dot} aria-label={unreadLabel} />
                )}
              </>
            )

            return (
              <li key={item.id} className={styles.item}>
                {clickable ? (
                  <button
                    type="button"
                    className={styles.row}
                    onClick={() => onItemClick(item)}
                  >
                    {content}
                  </button>
                ) : (
                  <div className={styles.row}>{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
