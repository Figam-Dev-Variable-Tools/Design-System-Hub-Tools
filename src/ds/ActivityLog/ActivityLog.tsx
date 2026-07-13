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
import {
  mergeLabels,
  type DeepPartialOneLevel,
  type EmptyLabels,
  type LabelFn,
} from '../../shared/labels'
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

/** 아이콘 원의 톤 — CSS 클래스명과 1:1이다 */
export type ActivityTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error'

/** 상대 시간 문구 — 숫자 포맷이 아니라 '분 전/시간 전'이라는 말이므로 labels에 둔다 */
export type RelativeTimeLabels = {
  /** 1분 미만(과 미래 시각) */
  justNow: string
  minutes: LabelFn<number>
  hours: LabelFn<number>
  days: LabelFn<number>
  /** 7일이 넘어가면 절대 날짜로 떨어진다 */
  absolute: (date: Date) => string
}

export type ActivityLogLabels = {
  title: string
  /** 전체보기 버튼 — onViewAll이 있을 때만 뜬다 */
  viewAll: string
  /** 미읽음 점의 스크린리더 이름 — 점만으로는 뜻이 전달되지 않는다 */
  unread: string
  /** actor 뒤에 붙는 조사 — 한국어 문장 조립을 그대로 두고 조사만 연다 */
  actorSuffix: string
  empty: EmptyLabels
  relativeTime: RelativeTimeLabels
}

/** EmptyLabels.title은 옵셔널이라(공용 타입) 빈 상태 제목의 최종 기본값을 여기 이름으로 둔다 */
const DEFAULT_EMPTY_TITLE = '아직 활동 내역이 없습니다.'

export const DEFAULT_ACTIVITY_LOG_LABELS: ActivityLogLabels = {
  title: '최근 활동',
  viewAll: '전체보기',
  unread: '읽지 않음',
  actorSuffix: '님이',
  empty: { title: DEFAULT_EMPTY_TITLE },
  relativeTime: {
    justNow: '방금 전',
    minutes: (n) => `${n}분 전`,
    hours: (n) => `${n}시간 전`,
    days: (n) => `${n}일 전`,
    absolute: (date) => date.toLocaleDateString('ko-KR'),
  },
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
  /**
   * 시간 표기 (기본 relative).
   * 감사 로그처럼 '언제 정확히'가 근거가 되는 화면은 absolute로 바꿔 '3일 전' 대신 날짜를 보여준다.
   */
  timeFormat?: 'relative' | 'absolute'
  /** 전체보기 문구 — 라우팅 대상에 맞춰 바꾼다 */
  viewAllLabel?: string
  /** 미읽음 점의 스크린리더 이름 — 점만으로는 뜻이 전달되지 않는다 */
  unreadLabel?: string
  /** 전체보기 아이콘 — 기본은 오른쪽 화살표 */
  viewAllIcon?: ReactNode
  /** 타입별 아이콘 교체 — 넘긴 타입만 TYPE_META 기본 아이콘을 덮어쓴다 */
  typeIcons?: Partial<Record<ActivityItem['type'], ReactNode>>
  /**
   * 타입별 아이콘 톤 교체 — 넘긴 타입만 TYPE_META 기본 톤을 덮어쓴다.
   * 아이콘만 갈아끼우면 색이 따로 놀기 때문에 색도 같은 자리에서 연다.
   */
  typeTones?: Partial<Record<ActivityItem['type'], ActivityTone>>
  /** 문구 — 개별 prop(title·emptyText·viewAllLabel·unreadLabel)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<ActivityLogLabels>
}

/** 타입별 아이콘 + 톤 매핑 */
const TYPE_META: Record<ActivityItem['type'], { icon: LucideIcon; tone: ActivityTone }> = {
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
export function formatRelativeTime(
  at: string,
  now: Date = new Date(),
  labels: RelativeTimeLabels = DEFAULT_ACTIVITY_LOG_LABELS.relativeTime,
): string {
  const then = new Date(at)
  const time = then.getTime()
  if (Number.isNaN(time)) return at

  const diff = now.getTime() - time
  if (diff < 0) return labels.justNow
  if (diff < MINUTE) return labels.justNow
  if (diff < HOUR) return labels.minutes(Math.floor(diff / MINUTE))
  if (diff < DAY) return labels.hours(Math.floor(diff / HOUR))
  if (diff < 7 * DAY) return labels.days(Math.floor(diff / DAY))
  return labels.absolute(then)
}

export function ActivityLog({
  items,
  title,
  max,
  onItemClick,
  onViewAll,
  emptyText,
  compact = false,
  showHeader = true,
  showIcon = true,
  showTime = true,
  showUnreadDot = true,
  timeFormat = 'relative',
  viewAllLabel,
  unreadLabel,
  viewAllIcon,
  typeIcons,
  typeTones,
  labels,
}: ActivityLogProps) {
  // 우선순위: 개별 prop > labels > 기본값.
  // mergeLabels는 undefined를 무시하므로, 넘기지 않은 개별 prop이 기본값을 지우지 않는다.
  const L = mergeLabels(mergeLabels(DEFAULT_ACTIVITY_LOG_LABELS, labels), {
    title,
    viewAll: viewAllLabel,
    unread: unreadLabel,
    empty: { title: emptyText },
  })

  const visible = max != null ? items.slice(0, max) : items
  const rootClass = [styles.card, compact ? styles.compact : ''].filter(Boolean).join(' ')

  /** 항목 시각 — relative는 '3분 전', absolute는 labels.relativeTime.absolute가 그린다 */
  const renderTime = (at: string) => {
    if (timeFormat === 'relative') return formatRelativeTime(at, new Date(), L.relativeTime)
    const parsed = new Date(at)
    return Number.isNaN(parsed.getTime()) ? at : L.relativeTime.absolute(parsed)
  }

  return (
    <section className={rootClass}>
      {showHeader && (
        <header className={styles.head}>
          <h3 className={styles.title}>{L.title}</h3>
          {onViewAll != null && (
            <button type="button" className={styles.viewAll} onClick={onViewAll}>
              {L.viewAll}
              {viewAllIcon ?? <ChevronRight size={14} aria-hidden="true" />}
            </button>
          )}
        </header>
      )}

      {visible.length === 0 ? (
        // 빈 상태는 공용 EmptyState 하나로 통일한다 — 그림/문구/여백을 여기서 다시 만들지 않는다
        <div className={styles.empty}>
          <EmptyState
            title={L.empty.title ?? DEFAULT_EMPTY_TITLE}
            description={L.empty.description}
            compact
          />
        </div>
      ) : (
        <ul className={styles.list}>
          {visible.map((item) => {
            const { icon: Icon, tone } = TYPE_META[item.type]
            const itemTone = typeTones?.[item.type] ?? tone
            const clickable = onItemClick != null
            // 타입 아이콘 교체 슬롯 — 넘어온 게 없으면 TYPE_META의 기본 lucide 아이콘
            const typeIcon = typeIcons?.[item.type] ?? <Icon size={compact ? 14 : 16} />

            // 클릭 가능하면 버튼, 아니면 정적 div — 접근성상 역할을 분리한다
            const content = (
              <>
                {showIcon && (
                  <span className={[styles.icon, styles[itemTone]].join(' ')} aria-hidden="true">
                    {typeIcon}
                  </span>
                )}
                <span className={styles.body}>
                  <span className={styles.sentence}>
                    <strong className={styles.actor}>{item.actor}</strong>
                    {L.actorSuffix}{' '}
                    {item.target != null && <span className={styles.target}>{item.target} </span>}
                    {item.action}
                  </span>
                  {showTime && <span className={styles.time}>{renderTime(item.at)}</span>}
                </span>
                {showUnreadDot && item.unread === true && (
                  <span className={styles.dot} aria-label={L.unread} />
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
