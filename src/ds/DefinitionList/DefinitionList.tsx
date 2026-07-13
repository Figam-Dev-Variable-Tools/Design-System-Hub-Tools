import type { ReactNode } from 'react'
import styles from './DefinitionList.module.css'
import { mergeLabels, type DeepPartialOneLevel } from '../../shared/labels'

export type DefinitionItem = {
  /** 라벨 — 좌측 고정폭, secondary */
  label: string
  /** 값 — 텍스트뿐 아니라 Badge/Tag 같은 노드도 받는다 */
  value: ReactNode
  /** 값 아래 보조 설명(가입 경로 상세, 인증 시각 등) */
  hint?: string
}

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   노출 문구는 전부 items(label·value·hint)로 들어오므로 컴포넌트가 가진 문구는 빈 상태뿐이다
   (지금은 items=[]이면 빈 <dl>만 남아 화면에 아무 설명이 없다). */
type DefinitionListLabelsResolved = {
  empty: string
  /** dl의 접근성 이름 — 한 카드에 정의 목록이 여럿일 때 구별한다. 기본은 이름 없음 */
  ariaLabel?: string
}

export const DEFAULT_DEFINITION_LIST_LABELS: DefinitionListLabelsResolved = {
  empty: '표시할 항목이 없습니다',
} as const

export type DefinitionListLabels = DeepPartialOneLevel<DefinitionListLabelsResolved>

export type DefinitionListProps = {
  items: DefinitionItem[]
  /** 열 수 — 2 이상은 좁은 폭에서 1열로 접힌다 (기본 1) */
  columns?: 1 | 2 | 3
  /** 행 구분선 (기본 true) */
  divider?: boolean
  /** 행 높이 — compact 44 / comfortable 56 (기본 compact) */
  density?: 'compact' | 'comfortable'
  /**
   * 배치 (기본 grid).
   *  - grid    : 표. 라벨 고정폭 + 행 높이 + 구분선 — 카드 안의 상세 정보용.
   *  - inline  : 라벨-값을 한 줄에 붙여 가로로 흘린다. 푸터의 사업자 정보처럼
   *              "상호 ○○ · 대표 ○○ · 사업자번호 ○○"를 한 덩어리로 읽히게 할 때 쓴다.
   *              (그 자리마다 dl/dt/dd를 손으로 다시 짜던 것을 대체한다 — columns·density·divider는 무시된다)
   *  - stacked : 라벨 위 · 값 아래로 쌓는다. 좁은 폭에서 라벨 고정폭이 값을 짓눌러 말줄임되는 것을 막는다.
   */
  layout?: 'grid' | 'inline' | 'stacked'
  /**
   * 값 정렬 (기본 left). 금액·수량 상세에서 right로 두면 숫자 자릿수가 눈으로 맞는다.
   * inline/stacked에서는 라벨과 값이 붙어 흐르므로 적용되지 않는다.
   */
  align?: 'left' | 'right'
  /** 화면 문구를 통째로 갈아끼우는 단일 통로 */
  labels?: DefinitionListLabels
}

/**
 * DefinitionList — 라벨-값 정의형 정보 블록(회원 유형/계정/이름/연락처 …).
 *
 * dl > div > dt+dd 구조. 구분선은 그리드 열 사이 간격 없이 이어져 한 줄로 보이고,
 * 마지막 시각 행만 CSS(:nth-last-child)로 선을 지운다 — 카드 바닥에 선이 뜨지 않게.
 */
export function DefinitionList({
  items,
  columns = 1,
  divider = true,
  density = 'compact',
  layout = 'grid',
  align = 'left',
  labels,
}: DefinitionListProps) {
  const L = mergeLabels(DEFAULT_DEFINITION_LIST_LABELS, labels)

  // 항목이 없으면 빈 <dl>(구분선만 남은 껍데기)이 아니라 문구를 보여준다
  if (items.length === 0) {
    return <p className={styles.empty}>{L.empty}</p>
  }

  const rootClass = [
    styles.root,
    styles[`cols${columns}`],
    density === 'comfortable' ? styles.comfortable : styles.compact,
    divider ? styles.divided : '',
    layout === 'inline' ? styles.inline : '',
    layout === 'stacked' ? styles.stacked : '',
    align === 'right' ? styles.alignRight : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <dl className={rootClass} aria-label={L.ariaLabel}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className={styles.row}>
          <dt className={styles.label} title={item.label}>
            {item.label}
          </dt>
          <dd className={styles.body}>
            <div className={styles.value}>{item.value}</div>
            {item.hint != null && item.hint !== '' && (
              <div className={styles.hint} title={item.hint}>
                {item.hint}
              </div>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
